/**
 * analytics.js - Appletown Analytics (精密トラッキング版 v2)
 * 役割: ユーザー行動追跡、モーダル内全操作の精密計測、検索ジャーニー追跡
 * 公開API: window.mzTrack(event_name, event_params)
 */
(function () {
  "use strict";

  // 二重起動を防止
  if (window.__APZ_NS?.bound) return;
  (window.__APZ_NS ||= {}).bound = true;

  const init = async () => {
    const CONF = await new Promise(r => {
      const check = () => window.LZ_CONFIG?.ANALYTICS ? r(window.LZ_CONFIG.ANALYTICS) : setTimeout(check, 50);
      check();
    });

    const D = document, W = window, N = navigator, S = screen, L = location;
    const now = () => Date.now();
    const text = el => (el?.getAttribute?.("aria-label") || el?.textContent || "").trim().substring(0, 100);

    /* ==========================================
       1. 状態管理 (Visitor / Session / Time / Scroll)
       ========================================== */
    let activeTime = 0, lastVisibleTs = now(), tPage = now(), maxScroll = 0;

    const updateActiveTime = () => {
      if (D.visibilityState === "visible") lastVisibleTs = now();
      else activeTime += now() - lastVisibleTs;
    };
    D.addEventListener("visibilitychange", updateActiveTime);

    const updateScrollDepth = () => {
      const h = D.documentElement;
      const p = W.scrollY / (h.scrollHeight - h.clientHeight);
      if (p > maxScroll) maxScroll = p;
    };
    D.addEventListener("scroll", updateScrollDepth, { passive: true });

    // UUID生成
    const uuid4 = () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0, v = c === "x" ? r : ((r & 3) | 8);
      return v.toString(16);
    });

    const setCookie = (k, v, days) => {
      const d = new Date(); d.setTime(d.getTime() + days * 864e5);
      D.cookie = `${k}=${encodeURIComponent(v)}; path=/; SameSite=Lax; expires=${d.toUTCString()}`;
    };

    const getCookie = k => {
      const m = D.cookie.match(new RegExp("(?:^| )" + k.replace(/([.*+?^${}()|[\]\\])/g, "\\$&") + "=([^;]*)"));
      return m ? decodeURIComponent(m[1]) : null;
    };

    const visitorId = (() => {
      let vid = getCookie(CONF.VISITOR_COOKIE);
      if (vid) return vid;
      vid = localStorage.getItem(CONF.VISITOR_LSKEY) || uuid4();
      setCookie(CONF.VISITOR_COOKIE, vid, 365 * 3);
      localStorage.setItem(CONF.VISITOR_LSKEY, vid);
      return vid;
    })();

    const touchSession = () => {
      let sid = sessionStorage.getItem("apz_sid");
      const t = now(), last = +sessionStorage.getItem("apz_sid_ts") || 0;
      if (!sid || (t - last) > CONF.SESSION_TTL) sid = uuid4();
      sessionStorage.setItem("apz_sid", sid);
      sessionStorage.setItem("apz_sid_ts", t);
      return sid;
    };

    const getUtmParams = () => {
      const params = new URLSearchParams(L.search);
      const res = {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign')
      };
      if (params.has('uid')) res.uid = params.get('uid');
      if (params.has('time')) res.time = params.get('time');
      return res;
    };

    /* ==========================================
       2. Geo情報取得 (ipapi.co)
       ========================================== */
    let GEO = null;
    const loadGeo = async () => {
      const KEY = "apz_geo_v1";
      try {
        const cached = JSON.parse(localStorage.getItem(KEY) || "{}");
        if (cached.d && (now() - cached.t < 864e5)) { GEO = cached.d; return; }
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const j = await res.json();
          GEO = { ip: j.ip, country: j.country_name, region: j.region, city: j.city, lat: j.latitude, lon: j.longitude };
          localStorage.setItem(KEY, JSON.stringify({ t: now(), d: GEO }));
        }
      } catch (e) { }
    };

    /* ==========================================
       3. 送信コアロジック
       ========================================== */
    const sendEvent = (event_name, event_params = {}) => {
      try {
        const payload = {
          visitor_id: visitorId, session_id: touchSession(),
          event_name,
          event_params: { ...getUtmParams(), ...event_params }, // 🍎 安全のためparamsの中にも入れる
          page_url: L.href, page_title: D.title,
          language: W.LZ_CURRENT_LANG || D.documentElement.lang || N.language,
          referrer: D.referrer, ua: N.userAgent,
          screen_w: S.width, screen_h: S.height,
          ...getUtmParams(),
          ...(GEO ? { geo: GEO } : {})
        };
        const body = JSON.stringify(payload);
        if (N.sendBeacon && N.sendBeacon(CONF.ENDPOINT, new Blob([body], { type: "text/plain" }))) return;
        fetch(CONF.ENDPOINT, { method: "POST", mode: "no-cors", body }).catch(() => { });
      } catch (e) { }
    };

    // 公開API
    W.mzTrack = sendEvent;

    /* ==========================================
       4. 自動イベント計測 (クリック: イベントデリゲーション)
       ========================================== */
    D.addEventListener("click", e => {
      const t = e.target;

      /* 🍎 重複排除: modal-search.js / search.js 側で個別に送るため、グローバルリスナーからは除外 
      const searchItem = t.closest('.lz-s-item');
      if (searchItem) {
        const wrap = searchItem.closest('.lz-s-wrap');
        const allItems = wrap ? Array.from(wrap.querySelectorAll('.lz-s-item')) : [];
        return sendEvent('search_result_click', {
          search_term: wrap?.dataset.searchTerm,
          result_card_id: searchItem.dataset.gotoId,
          label: searchItem.querySelector('.lz-s-name')?.textContent,
          result_position: allItems.indexOf(searchItem) + 1,
          result_count: allItems.length
        });
      }
      */

      // 🍎 FAB検索結果 (search.js)
      const fabBtn = t.closest('.apz-item-btn');
      if (fabBtn) {
        // search.js 側で sendEvent を呼ぶため、ここは不要かもしれないが、
        // 二重送信を避けるため search.js 側の実装を確認済み (location.href 前に呼んでいる)
        // 万が一 search.js 側で漏れたときのためのフォールバックとして残すが、基本はあちらで完結。
        return;
      }

      // --- モーダル本文 自動リンク（キーワード / ダイレクト）クリック ---
      const autoLink = t.closest('.lz-auto-link');
      if (autoLink) {
        const modalBody = autoLink.closest('.lz-modal-body-txt, .lz-txt');
        const sourceCardId = modalBody?.dataset.id || new URLSearchParams(L.search).get('id') || '';
        if (autoLink.dataset.gotoId) {
          return sendEvent('keyword_click', {
            keyword: text(autoLink),
            display_text: text(autoLink),
            link_type: 'direct',
            source_card_id: sourceCardId,
            target_card_id: autoLink.dataset.gotoId
          });
        }
        if (autoLink.dataset.keyword) {
          return sendEvent('keyword_click', {
            keyword: autoLink.dataset.keyword,
            display_text: text(autoLink),
            link_type: 'search',
            source_card_id: sourceCardId
          });
        }
      }

      // --- SNSリンク ---
      const sns = t.closest(".lz-sns a");
      if (sns) {
        const card = D.querySelector('.lz-modal .lz-modal-body-txt');
        return sendEvent("sns_link_click", {
          card_id: card?.dataset.id || new URLSearchParams(L.search).get('id') || '',
          platform: sns.dataset.sns || '',
          href: sns.href
        });
      }

      // --- 関連記事クリック ---
      const relLink = t.closest('.lz-modal a[target="_blank"]');
      if (relLink && relLink.closest('div')?.querySelector('h3')) {
        return sendEvent("related_article_click", {
          card_id: new URLSearchParams(L.search).get('id') || '',
          related_url: relLink.href,
          related_title: text(relLink)
        });
      }

      // --- 外部リンク ---
      const extLink = t.closest('a[href^="http"]:not([href*="' + L.hostname + '"])');
      if (extLink && !sns && !relLink) {
        return sendEvent("outbound_click", {
          href: extLink.href, label: text(extLink),
          link_domain: new URL(extLink.href).hostname
        });
      }

      // --- カードクリック ---
      const card = t.closest(".lz-card");
      if (card) return sendEvent("card_click", { card_id: card.dataset.id, label: card.dataset.title });

      // --- UIボタン ---
      const btn = t.closest("a.lz-btn, button.lz-btn");
      if (btn) return sendEvent("ui_click", { label: text(btn), href: btn.href });

      // --- ツールボタン ---
      const toolBtn = t.closest("[data-action]");
      if (toolBtn) return sendEvent("tool_click", { action: toolBtn.dataset.action });

    }, { capture: true, passive: true });

    // --- フォーム送信 ---
    D.addEventListener("submit", e => {
      if (e.target.matches(".lz-search-form")) {
        const input = e.target.querySelector("input[type=search]");
        if (input?.value) sendEvent("search_submit", { search_term: input.value });
      }
    });

    /* ==========================================
       5. ライフサイクルイベント
       ========================================== */
    loadGeo().finally(() => {
      setTimeout(() => {
        sendEvent("page_view");

        // 🍎 URLクリーンアップ (utm_source 等をアドレスバーから削除)
        if (W.history.replaceState) {
          const url = new URL(L.href);
          const targets = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'uid', 'time'];
          let changed = false;
          targets.forEach(k => { if (url.searchParams.has(k)) { url.searchParams.delete(k); changed = true; } });
          if (changed) {
            W.history.replaceState(null, "", url.pathname + url.search + url.hash);
          }
        }
      }, 500);
    });

    let isClosed = false;
    const flush = () => {
      if (isClosed) return; isClosed = true;
      updateScrollDepth();
      const finalActive = D.visibilityState === "visible" ? activeTime + (now() - lastVisibleTs) : activeTime;
      sendEvent("page_close", {
        engaged_ms: finalActive,
        total_ms: now() - tPage,
        scroll_depth: Math.round(maxScroll * 100)
      });
    };
    W.addEventListener("pagehide", flush);
    W.addEventListener("beforeunload", flush);
  };

  init();
})();