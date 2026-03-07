/**
 * header.js - ナビゲーション・コンポーネント (デザイン復元・高速ジャンプ版)
 */
(async function headerNavBoot() {
  "use strict";

  const C = window.LZ_COMMON;
  if (!C) return;

  /* ==========================================
     1. CSSの注入 (安定版のデザインを完全に復元)
     ========================================== */
  const cssText = `
    :root { --lz-h-max: 1100px; --lz-h-height: 75px; --lz-h-red: #cf3a3a; }
    
    .lz-hdr { 
      position: fixed !important; inset: 0 0 auto 0 !important; height: var(--lz-h-height) !important; 
      background: var(--lz-h-red) !important; z-index: 9000 !important; color: #fff !important; 
      box-shadow: 0 4px 18px rgba(0,0,0,.12) !important;
      font-family: var(--font-accent) !important;
      opacity: 0; visibility: hidden; transform: translateY(-100%);
      transition: opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.4s;
    }
    .lz-hdr.is-visible { opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important; }

    .lz-h-wrap { 
      height: 100% !important; max-width: var(--lz-h-max) !important; margin: 0 auto !important; 
      padding: 0 clamp(12px, 3vw, 24px) !important; 
      display: flex !important; align-items: center !important; justify-content: space-between !important; 
      gap: 12px; flex-wrap: nowrap !important; 
    }

    .lz-h-brand { display: flex !important; align-items: center !important; gap: 10px !important; color: #fff !important; text-decoration: none !important; flex-shrink: 0 !important; min-width: 0 !important; }
    .lz-h-brand__img { width: 48px !important; height: 48px !important; border-radius: 6px !important; object-fit: cover !important; flex-shrink: 0 !important; }
    .lz-h-brand__txt { display: flex !important; flex-direction: column !important; line-height: 1.1 !important; white-space: nowrap !important; overflow: hidden; }
    .lz-h-t1 { font-weight: 400 !important; font-size: clamp(0.9rem, 1.5vw, 1.1rem) !important; opacity: .9 !important; margin-top: 4px !important; }
    .lz-h-t2 { font-weight: 500 !important; font-size: clamp(1.4rem, 2.5vw, 2.0rem) !important; letter-spacing: .01em !important; margin-top: 2px !important; }
    
    .lz-h-right { display: flex !important; align-items: center !important; gap: clamp(8px, 2vw, 16px) !important; flex-shrink: 0 !important; }

    /* PCナビ */
    .lz-h-nav { display: none; }
    @media (min-width: 1024px) { .lz-h-nav { display: block !important; } }
    .lz-h-nav__list { display: flex !important; align-items: center !important; gap: 20px !important; margin: 0 !important; padding: 0 !important; list-style: none !important; }
    .lz-h-nav__item { position: relative !important; height: var(--lz-h-height); display: flex; align-items: center; }
    .lz-h-nav__l1 { font-weight: 600 !important; font-size: clamp(1.2rem, 1.6vw, 1.4rem) !important; color: #fff !important; text-decoration: none !important; padding: 10px 18px !important; border-radius: 10px !important; transition: background 0.3s; white-space: nowrap; }
    .lz-h-nav__l1:hover { background: rgba(255, 255, 255, .15) !important; }
    
    .lz-h-panel { position: absolute !important; right: 0 !important; top: 100% !important; background: #fff !important; border-radius: 20px !important; box-shadow: 0 15px 50px rgba(0,0,0,.15) !important; padding: 10px !important; display: none; min-width: 240px !important; z-index: 10001 !important; transform-origin: top center; animation: lz-h-slide 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    .lz-h-panel.is-open { display: block !important; }
    .lz-h-panel a { display: block !important; padding: 14px 20px !important; color: #333 !important; text-decoration: none !important; border-radius: 12px !important; font-weight: 600; font-size: 1.25rem !important; transition: all 0.3s !important; position: relative !important; }
    .lz-h-panel a::before { content: ""; position: absolute; left: 8px; width: 4px; height: 0; background: var(--lz-h-red); border-radius: 10px; transition: height 0.3s ease; top: 50%; transform: translateY(-50%); }
    .lz-h-panel a:hover { background: #fff5f5 !important; color: var(--lz-h-red) !important; padding-left: 28px !important; }
    .lz-h-panel a:hover::before { height: 24px; }

    /* 言語セレクター (復元) */
    .lz-lang-pc { position: relative !important; display: none; height: var(--lz-h-height); align-items: center; }
    @media (min-width: 1024px) { .lz-lang-pc { display: flex !important; } }
    .lz-lang-pc__btn { display: inline-flex !important; align-items: center !important; gap: 6px !important; height: 44px !important; padding: 0 20px !important; border: 1px solid rgba(255, 255, 255, .6) !important; background: transparent !important; color: #fff !important; border-radius: 18px !important; cursor: pointer; font-weight: 600; font-size: 1.1rem; }
    .lz-lang-pc__btn::after { content: ""; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid #fff; transition: 0.3s; }
    .lz-lang-pc__btn.is-active::after { transform: rotate(180deg); }
    .lz-lang-pc__menu { position: absolute !important; right: 0 !important; top: 100% !important; margin-top: 8px; background: #fff !important; border-radius: 16px !important; padding: 8px !important; display: none; min-width: 150px !important; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,.15); z-index: 10002; }
    .lz-lang-pc__menu.is-open { display: flex !important; }
    .lz-lang-pc__menu a { display: block !important; padding: 14px 20px !important; color: #333 !important; text-decoration: none !important; border-radius: 10px !important; font-weight: 600; transition: 0.2s; font-size: 1.15rem !important; }
    .lz-lang-pc__menu a:hover { background: #fff5f5; color: var(--lz-h-red); }

    .lz-lang-mob { position: relative !important; display: flex !important; }
    @media (min-width: 1024px) { .lz-lang-mob { display: none !important; } }
    .lz-lang-mob__btn { width: 34px !important; height: 34px !important; display: flex !important; align-items: center !important; justify-content: center !important; border: 1px solid rgba(255,255,255,0.6) !important; border-radius: 50% !important; color: #fff !important; font-size: 11px !important; font-weight: 700 !important; background: transparent !important; }
    .lz-lang-mob__menu { position: absolute !important; right: 0 !important; top: calc(100% + 10px) !important; background: #fff !important; border-radius: 12px !important; padding: 8px !important; display: none; min-width: 150px !important; flex-direction: column !important; z-index: 10003; box-shadow: 0 8px 25px rgba(0,0,0,0.2); }
    .lz-lang-mob__menu.is-open { display: flex !important; }
    .lz-lang-mob__menu a { display: block !important; padding: 12px 14px !important; color: #333 !important; text-decoration: none !important; font-size: 1.0rem !important; font-weight: 600; border-radius: 8px; }

    /* ハンバーガー */
    .lz-h-hamb { display: flex !important; width: 36px !important; height: 36px !important; border: 1px solid rgba(255,255,255,.6) !important; background: none; border-radius: 8px !important; flex-direction: column !important; justify-content: center !important; align-items: center !important; gap: 4px !important; cursor: pointer; }
    @media (min-width: 1024px) { .lz-h-hamb { display: none !important; } }
    .lz-h-hamb__bar { width: 20px !important; height: 2px !important; background: #fff !important; border-radius: 2px !important; }

    .lz-h-drawer { position: fixed !important; right: 0 !important; top: 0 !important; bottom: 0 !important; width: 85vw !important; max-width: 320px !important; background: #fff !important; z-index: 20001 !important; transform: translateX(100%) !important; transition: transform .4s cubic-bezier(0.16, 1, 0.3, 1) !important; overflow-y: auto !important; border-radius: 24px 0 0 24px !important; font-family: var(--font-accent) !important; }
    .lz-h-drawer.is-open { transform: translateX(0) !important; }
    .lz-h-dw-head { padding: 18px 20px !important; border-bottom: 1px solid #f0f0f0 !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
    .lz-h-dw-l1a { display: block !important; padding: 18px 20px !important; font-weight: 700 !important; font-size: 1.3rem !important; color: #222 !important; text-decoration: none !important; }
    .lz-h-dw-l2-area { background: #fff5f5 !important; display: none; padding: 5px 0 15px 0 !important; }
    .lz-h-dw-group.is-active .lz-h-dw-l2-area { display: block !important; }
    .lz-h-dw-l2-area a { display: flex !important; align-items: center !important; padding: 12px 20px 12px 40px !important; color: #444 !important; text-decoration: none !important; font-size: 1.25rem !important; font-weight: 600 !important; position: relative; }
    .lz-h-dw-l2-area a::before { content: ""; position: absolute; left: 24px; width: 4px; height: 18px; background: var(--lz-h-red); border-radius: 10px; opacity: 0.4; }

    @keyframes lz-h-slide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 1023px) { body { padding-top: var(--lz-h-height) !important; } }

    /* 操作ロック・演出用 🍎 */
    .lz-jump-shield { position: fixed; inset: 0; background: #fff; z-index: 30000; display: flex; align-items: center; justify-content: center; opacity: 1; transition: opacity 0.4s; }
    .lz-jump-shield.is-hidden { opacity: 0; pointer-events: none; }
    body.is-locked { overflow: hidden !important; height: 100vh !important; }
    @keyframes lz-pulse { 0% { transform: scale(0.95); opacity: 0.7; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(0.95); opacity: 0.7; } }
  `;
  const styleTag = document.createElement('style'); styleTag.textContent = cssText; document.head.appendChild(styleTag);

  /* ==========================================
     2. 起動直後の操作ロック・パラメータ抽出 🍎
     ========================================== */
  const params = new URLSearchParams(window.location.search);
  const jumpTarget = params.get('jump');
  if (jumpTarget) {
    document.body.classList.add('is-locked');
    document.body.insertAdjacentHTML('afterbegin', `<div class="lz-jump-shield" id="lzJumpShield"><div style="text-align:center;"><img src="${window.LZ_CONFIG.ASSETS.LOGO_RED}" style="width:80px; animation: lz-pulse 1.5s infinite;"></div></div>`);
  }

  /* ==========================================
     3. ヘルパー・HTML構造 (安定版に準拠)
     ========================================== */
  function getLangLinks() {
    const config = window.LZ_CONFIG.LANG;
    return config.SUPPORTED.map(l => {
      // 🍎 hrefに情報を固定せず、data-langに保持させる
      return `<a href="#" data-lang="${l}">${config.LABELS[l]}</a>`;
    }).join('');
  }

  const langLabelMob = window.LZ_CURRENT_LANG === 'ja' ? '日' : (window.LZ_CURRENT_LANG === 'en' ? 'EN' : '中');
  const langLabelPc = window.LZ_CONFIG.LANG.LABELS[window.LZ_CURRENT_LANG];
  const brandTitle = {
    ja: { t1: '飯綱町産りんごポータルサイト', t2: 'りんごのまちいいづな' },
    en: { t1: 'Iizuna Apple Portal Site', t2: 'Appletown Iizuna' },
    zh: { t1: '飯綱町蘋果入口網站', t2: '苹果小镇 飯綱' }
  }[window.LZ_CURRENT_LANG] || { t1: 'Iizuna Apple Portal Site', t2: 'Appletown Iizuna' };

  const headerHTML = `
  <header class="lz-hdr" id="lzHdr">
    <div class="lz-h-wrap">
      <a class="lz-h-brand" href="https://appletown-iizuna.com?lang=${window.LZ_CURRENT_LANG}">
        <img class="lz-h-brand__img" src="${window.LZ_CONFIG.ASSETS.LOGO_WHITE}" alt="ロゴ">
        <span class="lz-h-brand__txt">
          <span class="lz-h-t1">${brandTitle.t1}</span>
          <span class="lz-h-t2">${brandTitle.t2}</span>
        </span>
      </a>
      <div class="lz-h-right">
        <nav class="lz-h-nav"><ul class="lz-h-nav__list" id="lzNavList"></ul></nav>
        <div class="lz-lang-mob" id="lzLangMob">
          <button class="lz-lang-mob__btn" type="button">${langLabelMob}</button>
          <div class="lz-lang-mob__menu">${getLangLinks()}</div>
        </div>
        <div class="lz-lang-pc" id="lzLangPc">
          <button class="lz-lang-pc__btn" type="button">${langLabelPc}</button>
          <div class="lz-lang-pc__menu">${getLangLinks()}</div>
        </div>
        <button class="lz-h-hamb" id="lzHamb">
          <span class="lz-h-hamb__bar"></span><span class="lz-h-hamb__bar"></span><span class="lz-h-hamb__bar"></span>
        </button>
      </div>
    </div>
  </header>
  <div id="lzDwBackdrop" style="position:fixed;inset:0;background:rgba(0,0,0,0.3);z-index:19999;display:none;"></div>
  <aside class="lz-h-drawer" id="lzDrawer">
    <div class="lz-h-dw-head">
      <div style="font-weight:800;color:#cf3a3a;font-size:1.4rem;">MENU</div>
      <button id="lzDwClose" style="border:none;background:none;font-size:32px;color:#999;cursor:pointer;">&times;</button>
    </div>
    <nav id="lzDwNav"></nav>
  </aside>`;

  document.body.insertAdjacentHTML('afterbegin', headerHTML);

  /* ==========================================
     4. 精密スクロールロジック (親ブロック補正)
     ========================================== */
  function smoothScrollToL2(label, isInstant = false) {
    const el = document.querySelector(`[data-l2="${label}"]`);
    if (!el) return;
    const target = el.closest('[id^="section-"]') || el;
    const offset = 75 + 10;
    const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: isInstant ? "auto" : "smooth" });
  }

  function setupEvents() {
    const drawer = document.getElementById('lzDrawer'), backdrop = document.getElementById('lzDwBackdrop');
    const closeDrawer = () => { drawer.classList.remove('is-open'); backdrop.style.display = 'none'; };

    // PCメニューホバー
    const items = document.querySelectorAll('.lz-h-nav__item');
    items.forEach(item => {
      const panel = item.querySelector('.lz-h-panel');
      item.onmouseenter = () => { items.forEach(o => o.querySelector('.lz-h-panel').classList.remove('is-open')); panel?.classList.add('is-open'); };
      item.onmouseleave = () => panel?.classList.remove('is-open');
    });

    // アンカーリンククリック
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const url = new URL(a.href);
      const jumpVal = url.searchParams.get('jump');
      if (url.pathname === window.location.pathname && jumpVal) {
        e.preventDefault(); smoothScrollToL2(jumpVal); closeDrawer();
      }
    });

    // 言語セレクター
    const setupLang = (cid, bc, mc) => {
      const c = document.getElementById(cid), b = c?.querySelector('.' + bc), m = c?.querySelector('.' + mc);
      if (!b || !m) return;
      b.onclick = (e) => { e.stopPropagation(); m.classList.toggle('is-open'); b.classList.toggle('is-active'); };

      // 🍎 追加：メニュー内のリンクがクリックされた瞬間に「今」のURLを取得して遷移
      m.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a || !a.dataset.lang) return;
        e.preventDefault();

        // 🍎 実行時の最新URL（モーダルを閉じて id が消えていれば、消えた状態のもの）を取得
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set('lang', a.dataset.lang);
        nextUrl.searchParams.delete('jump'); // 言語変更時はスクロール予約は消去
        nextUrl.hash = "";

        window.location.href = nextUrl.toString();
      });

      document.addEventListener('click', () => { m.classList.remove('is-open'); b.classList.remove('is-active'); });
    };
    setupLang('lzLangPc', 'lz-lang-pc__btn', 'lz-lang-pc__menu');
    setupLang('lzLangMob', 'lz-lang-mob__btn', 'lz-lang-mob__menu');

    const hamb = document.getElementById('lzHamb'), close = document.getElementById('lzDwClose');
    hamb.onclick = () => { drawer.classList.add('is-open'); backdrop.style.display = 'block'; };
    [backdrop, close].forEach(el => { if (el) el.onclick = closeDrawer; });
  }

  /* --- 5. メニューの構築 (Skeleton) --- */
  const { ENDPOINT, MENU_ORDER, MENU_URL } = window.LZ_CONFIG;
  const loadLabel = window.LZ_CURRENT_LANG === 'ja' ? '読み込み中...' : 'Loading...';
  document.getElementById('lzNavList').innerHTML = MENU_ORDER.map(l1 => `<li class="lz-h-nav__item"><a href="${MENU_URL[l1]}?lang=${window.LZ_CURRENT_LANG}" class="lz-h-nav__l1">${C.T(l1)}</a><div class="lz-h-panel"><div style="padding:10px;text-align:center;color:#bbb;">${loadLabel}</div></div></li>`).join('');
  document.getElementById('lzDwNav').innerHTML = MENU_ORDER.map(l1 => `<div class="lz-h-dw-group" data-l1="${l1}"><div style="display:flex;align-items:center;justify-content:space-between;width:100%;"><a class="lz-h-dw-l1a" href="${MENU_URL[l1]}?lang=${window.LZ_CURRENT_LANG}">${C.T(l1)}</a><div class="lz-h-dw-arrow" style="padding:18px 20px;color:#cf3a3a;cursor:pointer;transition:0.3s;">▼</div></div><div class="lz-h-dw-l2-area"><div style="padding:10px;text-align:center;color:#bbb;">${loadLabel}</div></div></div>`).join('');

  try {
    const res = await fetch(`${ENDPOINT}?all=1`);
    const json = await res.json();
    if (json.ok) {
      const map = new Map();
      json.items.forEach(it => { if (!map.has(it.l1)) map.set(it.l1, []); if (!map.get(it.l1).some(x => x.key === it.l2)) map.get(it.l1).push({ key: it.l2, label: C.L(it, 'l2') }); });
      MENU_ORDER.forEach((l1, i) => {
        const l2Data = map.get(l1) || [];
        const links = l2Data.map(d => `<a href="${MENU_URL[l1]}?lang=${window.LZ_CURRENT_LANG}&jump=${encodeURIComponent(d.key)}">${d.label}</a>`).join('');
        const panels = document.querySelectorAll('.lz-h-panel');
        if (panels[i]) panels[i].innerHTML = links || '<div style="padding:10px;text-align:center;color:#999;">(No Articles)</div>';
        const dwGroups = document.querySelectorAll('.lz-h-dw-group');
        if (dwGroups[i]) {
          const area = dwGroups[i].querySelector('.lz-h-dw-l2-area'), arrow = dwGroups[i].querySelector('.lz-h-dw-arrow'), link = dwGroups[i].querySelector('.lz-h-dw-l1a');
          if (l2Data.length > 0) {
            area.innerHTML = links;
            arrow.onclick = (e) => { e.preventDefault(); dwGroups[i].classList.toggle('is-active'); arrow.style.transform = dwGroups[i].classList.contains('is-active') ? 'rotate(180deg)' : 'rotate(0)'; };
            link.onclick = (e) => { if (!dwGroups[i].classList.contains('is-active')) arrow.click(); else closeDrawer(); };
          } else { area.innerHTML = ''; if (arrow) arrow.style.display = 'none'; link.onclick = closeDrawer; }
        }
      });
    }
  } catch (e) { console.error(e); }

  setupEvents();

  const hdr = document.getElementById('lzHdr');
  const showHeader = () => {
    if (hdr && !hdr.classList.contains('is-visible')) {
      hdr.classList.add('is-visible');
      window.removeEventListener('scroll', showHeader);
      if (window._lzHeaderFallback) clearTimeout(window._lzHeaderFallback);
    }
  };

  // 1. スクロールを検知したら即表示（閾値 0）
  window.addEventListener('scroll', showHeader, { passive: true });
  if (window.scrollY > 0) showHeader();

  // 2. <html>クラスの変化を監視して、シールドが消えた瞬間に「一定時間後に表示」のタイマーを開始
  const startFallback = () => {
    if (window._lzHeaderFallback) return;
    window._lzHeaderFallback = setTimeout(showHeader, 400); // シールド解除後 400ms で表示
  };

  if (!document.documentElement.classList.contains('lz-loading-lock')) {
    startFallback();
  } else {
    const observer = new MutationObserver(() => {
      if (!document.documentElement.classList.contains('lz-loading-lock')) {
        startFallback();
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

  /* ==========================================
     6. 【整合性・最速ジャンプ・ロック解除】 🍎
     ========================================== */
  if (jumpTarget) {
    let attempts = 0;
    const checkReady = setInterval(() => {
      const el = document.querySelector(`[data-l2="${jumpTarget}"]`);
      if (el && el.offsetHeight > 0) {
        clearInterval(checkReady);
        smoothScrollToL2(jumpTarget, true);
        setTimeout(() => {
          document.getElementById('lzJumpShield')?.classList.add('is-hidden');
          document.body.classList.remove('is-locked');
          const url = new URL(window.location.href);
          url.searchParams.delete('jump');
          history.replaceState(null, "", url.pathname + url.search);
        }, 150);
      }
      if (++attempts > 150) { clearInterval(checkReady); document.body.classList.remove('is-locked'); document.getElementById('lzJumpShield')?.remove(); }
    }, 30);
  }
})();