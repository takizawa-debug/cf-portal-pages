/**
 * search.js - サイト内記事検索 (多言語ディープリンク対応 ＆ キーワード連動版)
 */
(async function apzSearchBoot() {
  "use strict";

  const C = window.LZ_COMMON;
  if (!C) return;

  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });

  const { ENDPOINT, SEARCH_ENDPOINT, MENU_URL, ASSETS } = config;
  const FALLBACK_IMG = ASSETS.LOGO_RED;

  const RECOMMEND_WORDS = [
    "サンふじ", "シナノゴールド", "シナノスイート", "秋映", "紅玉", "グラニースミス", "ブラムリー", "直売所", "アップルパイ", "シードル", "飯綱町", "ふるさと納税"
  ];

  let dynamicKeywords = [];

  /* --- CSS (完全維持) --- */
  const style = document.createElement('style');
  style.textContent = `
    .apz-search-fab { position:fixed; right:20px; bottom:20px; width:64px; height:64px; border-radius:50%; background:#cf3a3a; color:#fff; box-shadow:0 8px 24px rgba(0,0,0,.3); display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:12000; transition: transform 0.2s; }
    .apz-search-fab__icon { width:32px; height:32px; }
    .apz-search-float { position:fixed; right:24px; bottom:100px; z-index:12000; pointer-events:none; opacity:0; transform:translateY(12px); transition:all .25s cubic-bezier(0.16, 1, 0.3, 1); }
    .apz-search-float.is-open { opacity:1; transform:translateY(0); pointer-events:auto; }
    .apz-search-card { width:min(680px, 94vw); background:#fff; border-radius:28px; box-shadow:0 25px 70px rgba(0,0,0,.4); padding:24px; box-sizing:border-box; }
    .apz-search-card__head { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
    .apz-search-card__title { font-size:1.6rem; font-weight:800; color:#cf3a3a; }
    .apz-search-card__close { width:36px; height:36px; border-radius:50%; border:none; background:#f5f5f5; cursor:pointer; font-size:24px; color:#999; display:flex; align-items:center; justify-content:center; }
    .apz-search__box { position:relative; margin-bottom:20px; }
    #apzSearchInput { width:100%; box-sizing:border-box; height:64px; border-radius:32px; border:2px solid #eee; padding:0 60px 0 24px; font-size:1.5rem; font-weight:600; outline:none; transition: all 0.3s; background:#fcfcfc; -webkit-appearance: none; }
    #apzSearchInput::-webkit-search-cancel-button, #apzSearchInput::-webkit-search-decoration { -webkit-appearance: none; appearance: none; display: none; }
    #apzSearchInput:focus { border-color: #cf3a3a; background:#fff; }
    .apz-search__clear { position:absolute; right:16px; top:50%; transform:translateY(-50%); width:32px; height:32px; border:none; border-radius:50%; background:#ddd; color:#666; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:18px; z-index: 5; }
    .apz-search-suggest { margin-bottom: 20px; padding: 16px; background: #fafafa; border-radius: 20px; border: 1px dashed #ddd; }
    .apz-search-suggest__label { font-size: 1rem; font-weight: 800; color: #888; margin-bottom: 12px; }
    .apz-search-tags { display: flex; flex-wrap: wrap; gap: 10px; }
    .apz-search-tag { padding: 8px 18px; background: #fff; color: #cf3a3a; border-radius: 22px; font-size: 1.1rem; font-weight: 700; cursor: pointer; border: 1px solid #f0f0f0; }
    .apz-search-searching { display:none; padding:40px; text-align:center; flex-direction:column; align-items:center; gap:16px; }
    .apz-search-searching.is-active { display:flex; }
    .apz-search-spinner { width:40px; height:40px; border:4px solid rgba(207,58,58,0.1); border-top-color:#cf3a3a; border-radius:50%; animation: apz-spin 0.8s linear infinite; }
    @keyframes apz-spin { to { transform: rotate(360deg); } }
    .apz-search-results { max-height:450px; overflow:auto; }
    .apz-item-btn { width:100%; display:flex; align-items:center; gap:20px; padding:18px; border:none; border-bottom: 1px solid #f5f5f5; background:transparent; cursor:pointer; text-align:left; border-radius:16px; }
    .apz-item-btn:hover { background:#fff5f5; }
    .apz-thumb { flex:0 0 90px; height: 90px; border-radius:15px; overflow:hidden; background:#f6f7f9; }
    .apz-thumb img { width:100%; height:100%; object-fit:cover; }
    .apz-title { font-size:1.5rem; font-weight:800; color:#222; margin-bottom:6px; line-height:1.4; }
    .apz-snippet { font-size:1.15rem; color:#666; line-height:1.6; }
    .apz-hit { background:#fff6a0 !important; color:#000 !important; padding:0 2px !important; border-radius:3px !important; font-weight:bold !important; }
    .apz-empty { padding:50px; text-align:center; font-size:1.3rem; color:#bbb; display:none; }
    @media (max-width:768px) {
      .apz-search-float { left:0; right:0; bottom:0; transform:translateY(100%); }
      .apz-search-float.is-open { transform:translateY(0); }
      .apz-search-card { width:100%; height:88vh; border-radius:28px 28px 0 0; }
    }
  `;
  document.head.appendChild(style);

  /* --- HTML構造 (C.Tを使用して多言語化) --- */
  const searchHTML = `
    <div class="apz-search-fab" id="apzSearchFab" role="button">
      <svg viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="apz-search-fab__icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
    </div>
    <div class="apz-search-float" id="apzSearchFloat" aria-hidden="true">
      <div class="apz-search-card">
        <div class="apz-search-card__head">
          <div class="apz-search-card__title">${C.T('サイト内記事検索')}</div>
          <button class="apz-search-card__close" id="apzSearchClose">✕</button>
        </div>
        <div class="apz-search__box">
          <input id="apzSearchInput" type="search" placeholder="${C.T('何をお探しですか？')}" autocomplete="off">
          <button class="apz-search__clear" id="apzSearchClear" style="display:none;">✕</button>
        </div>
        <div class="apz-search-suggest" id="apzSearchSuggest">
          <div class="apz-search-suggest__label">✨ ${C.T('おすすめキーワード')}</div>
          <div class="apz-search-tags" id="apzRecommendTags"></div>
        </div>
        <div class="apz-search-searching" id="apzSearchSearching">
          <div class="apz-search-spinner"></div>
          <div style="font-size:1.3rem;font-weight:600;color:#cf3a3a;margin-top:12px;">${C.T('検索しています...')}</div>
        </div>
        <div class="apz-search-results" id="apzSearchResults">
          <ul class="apz-search-list" id="apzSearchList" style="list-style:none;margin:0;padding:0;"></ul>
          <div class="apz-empty" id="apzSearchEmpty">${C.T('見つかりませんでした')}</div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', searchHTML);

  const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": "&#39;" }[m]));

  function highlight(text, query) {
    if (!query) return esc(text);
    const q = query.trim();
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
    return esc(text).replace(re, '<span class="apz-hit">$1</span>');
  }

  function getSnippet(text, query) {
    const t = String(text || "");
    const q = query.trim();
    const idx = t.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return esc(t.slice(0, 80)) + "...";
    const start = Math.max(0, idx - 30);
    const end = Math.min(t.length, idx + q.length + 50);
    const snippet = (start > 0 ? "..." : "") + t.slice(start, end) + (end < t.length ? "..." : "");
    return highlight(snippet, q);
  }

  const D = document, fab = D.getElementById("apzSearchFab"), float = D.getElementById("apzSearchFloat");
  const input = D.getElementById("apzSearchInput"), clearBt = D.getElementById("apzSearchClear");
  const listEl = D.getElementById("apzSearchList"), emptyEl = D.getElementById("apzSearchEmpty");
  const suggestEl = D.getElementById("apzSearchSuggest"), tagArea = D.getElementById("apzRecommendTags");
  const searchingEl = D.getElementById("apzSearchSearching");

  let lastResults = [];

  function refreshRecommendations() {
    const lang = window.LZ_CURRENT_LANG || 'ja';
    let pool = [];
    if (dynamicKeywords.length > 0) {
      pool = dynamicKeywords.map(kw => ({ display: kw[lang] || kw['ja'], original: kw['ja'] })).filter(it => it.display);
    } else {
      pool = RECOMMEND_WORDS.map(word => ({ display: C.T(word), original: word }));
    }
    const selected = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);
    tagArea.innerHTML = selected.map(item => `<span class="apz-search-tag" data-original="${item.original}">${item.display}</span>`).join('');
    tagArea.querySelectorAll('.apz-search-tag').forEach(tag => {
      tag.onclick = () => { input.value = tag.textContent; runSearch(input.value); };
    });
  }

  async function loadDynamicKeywords() {
    try {
      const res = await fetch(`${ENDPOINT}?mode=keywords`);
      const json = await res.json();
      if (json.ok) {
        dynamicKeywords = json.items || [];
        if (float.classList.contains('is-open')) refreshRecommendations();
      }
    } catch (e) { console.error("Dynamic keywords fetch failed", e); }
  }
  loadDynamicKeywords();

  function renderResults(results, query) {
    lastResults = results || [];
    listEl.innerHTML = "";
    searchingEl.classList.remove("is-active");
    if (!query.trim()) { suggestEl.style.display = "block"; emptyEl.style.display = "none"; return; }
    suggestEl.style.display = "none";
    if (!results || !results.length) { emptyEl.style.display = "block"; return; }

    emptyEl.style.display = "none";
    listEl.innerHTML = results.map((it, idx) => {
      const l1 = C.L(it, 'l1'), l2 = C.L(it, 'l2'), title = C.L(it, 'title');
      const snippetBase = C.L(it, 'body') || C.L(it, 'lead') || "";
      const categoryLine = highlight(`${l1} / ${l2}`, query);

      return `
      <li><button class="apz-item-btn" type="button" data-idx="${idx}">
        <div class="apz-thumb"><img src="${it.mainImage || FALLBACK_IMG}"></div>
        <div class="apz-meta">
          <div class="apz-l2l3">${categoryLine}</div>
          <div class="apz-title">${highlight(title, query)}</div>
          <div class="apz-snippet">${getSnippet(snippetBase, query)}</div>
        </div>
      </button></li>`;
    }).join("");
  }

  async function runSearch(query) {
    const q = query.trim();
    clearBt.style.display = q ? "flex" : "none";
    if (!q) { renderResults([], ""); return; }
    listEl.innerHTML = "";
    emptyEl.style.display = "none";
    suggestEl.style.display = "none";
    searchingEl.classList.add("is-active");
    try {
      if (typeof window.mzTrack === 'function') {
        window.mzTrack('search_submit', { search_term: q });
      }
      const res = await fetch(`${SEARCH_ENDPOINT}?q=${encodeURIComponent(q)}&limit=50`);
      const json = await res.json();
      renderResults(json.items || [], q);
    } catch (_) { renderResults([], q); }
  }

  const openFloat = () => { float.classList.add("is-open"); refreshRecommendations(); setTimeout(() => input.focus(), 10); };
  fab.onclick = openFloat;
  D.getElementById("apzSearchClose").onclick = () => float.classList.remove("is-open");
  clearBt.onclick = () => { input.value = ""; refreshRecommendations(); runSearch(""); input.focus(); };

  let timer = null;
  input.oninput = () => {
    clearTimeout(timer);
    if (!input.value.trim()) { refreshRecommendations(); renderResults([], ""); }
    else { timer = setTimeout(() => runSearch(input.value), 400); }
  };

  /* ★修正箇所：リンク生成ロジック 🍎 */
  listEl.onclick = (e) => {
    const btn = e.target.closest(".apz-item-btn"); if (!btn) return;
    const hit = lastResults[+btn.dataset.idx]; if (!hit) return;

    // 🍎 重要：?id= パラメータには、翻訳後のタイトルではなく
    // スプレッドシートの「タイトル」列（日本語オリジナル）を常に使用します。
    // これにより modal.js の checkDeepLink が正しくヒットします。
    const targetDeepLinkId = hit.title;

    // 🍎 Analytics: 検索結果クリック
    if (typeof window.mzTrack === 'function') {
      window.mzTrack('search_result_click', {
        search_term: input.value,
        result_card_id: targetDeepLinkId,
        label: hit.title,
        source: 'fab_search'
      });
    }

    location.href = `${MENU_URL[hit.l1] || location.origin}?lang=${window.LZ_CURRENT_LANG}&id=${encodeURIComponent(targetDeepLinkId)}`;
  };
  D.addEventListener("click", (e) => { if (!e.target.closest(".apz-search-card") && !e.target.closest("#apzSearchFab")) float.classList.remove("is-open"); });
})();