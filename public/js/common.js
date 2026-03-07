/**
 * common.js - Appletown 基盤コンポーネント (デザイン復元・高速解除版)
 */
(function () {
  if (document.getElementById('lzGlobalShield')) return;
  document.documentElement.classList.add('lz-loading-lock');
  var s = document.createElement('div');
  s.id = 'lzGlobalShield'; s.className = 'lz-global-shield';
  s.innerHTML = '<img class="lz-shield-logo" src="https://cdn.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-36ff-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png">';
  document.documentElement.appendChild(s);
  window._lzSafetyFuse = setTimeout(function () {
    document.documentElement.classList.remove('lz-loading-lock');
    if (s) s.style.display = 'none';
  }, 5000);
})();

window.LZ_COMMON = (function () {
  "use strict";

  /* ==========================================
     1. 通信インフラ (LZ_NET)
     ========================================== */
  var NET = (function () {
    var MAX_CONCURRENCY = 20, RETRIES = 2, TIMEOUT_MS = 12000, inFlight = 0, q = [];
    function runNext() { if (inFlight >= MAX_CONCURRENCY) return; var job = q.shift(); if (!job) return; inFlight++; job().finally(function () { inFlight--; runNext(); }); }
    function enqueue(task) { return new Promise(function (resolve, reject) { q.push(function () { return task().then(resolve, reject); }); runNext(); }); }
    async function fetchJSON(url, opt) {
      opt = opt || {}; var attempt = 0;
      while (true) {
        attempt++; var ac = new AbortController(), timer = setTimeout(function () { ac.abort(); }, opt.timeout || TIMEOUT_MS);
        try {
          var res = await fetch(url, { mode: "cors", cache: "no-store", credentials: "omit", signal: ac.signal });
          clearTimeout(timer); if (!res.ok) throw new Error("HTTP " + res.status); return await res.json();
        } catch (err) {
          clearTimeout(timer); if (attempt > RETRIES) throw err;
          var backoff = (200 * Math.pow(2, attempt - 1)) + Math.random() * 300; await new Promise(function (r) { setTimeout(r, backoff); });
        }
      }
    }
    return { json: function (url, opt) { return enqueue(function () { return fetchJSON(url, opt); }); } };
  })();

  /* ==========================================
     2. デザイン・基盤 CSS (変数を完全に復元) 🍎
     ========================================== */
  var injectCoreStyles = function () {
    if (document.getElementById('lz-common-styles')) return;

    /* Google Fonts: Zen Maru Gothic (本文用) + Zen Kaku Gothic New (太字・アクセント用) */
    if (!document.getElementById('lz-google-fonts')) {
      var link = document.createElement('link');
      link.id = 'lz-google-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;500;700;900&family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap';
      document.head.appendChild(link);
    }

    var style = document.createElement('style');
    style.id = 'lz-common-styles';
    style.textContent = [
      ':root {',
      '  /* フォントとサイズ */',
      '  --fz-l2: clamp(2.4rem, 5vw, 3.2rem); --fz-l3: 1.85rem; --fz-body: 1.5rem;',
      '  --font-base: "Zen Maru Gothic", system-ui, -apple-system, sans-serif;',
      '  --font-accent: "Zen Kaku Gothic New", sans-serif;',
      '  ',
      '  /* 配色 (復活) */',
      '  --apple-red: #cf3a3a; --apple-red-strong: #a82626;',
      '  --apple-green: #2aa85c; --apple-brown: #5b3a1e;',
      '  --ink-dark: #1b1b1b;',
      '  ',
      '  /* 角丸と装飾 (復活) */',
      '  --card-radius: 20px; --radius: 14px;',
      '}',
      '/* 本文・一般テキスト: Zen Maru Gothic */',
      'body { font-family: var(--font-base); }',
      '/* 太字・アクセント系: Zen Kaku Gothic New */',
      'h1, h2, h3, h4, h5, h6, b, strong, th { font-family: var(--font-accent); }',
      '.lz-global-shield { position: fixed; inset: 0; background: #fff; z-index: 30000; display: flex; align-items: center; justify-content: center; opacity: 1; transition: opacity 0.4s ease-out; }',
      '.lz-shield-logo { width: 80px; height: auto; animation: lz-pulse 1.5s infinite ease-in-out; }',
      '@keyframes lz-pulse { 0% { transform: scale(0.92); opacity: 0.6; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(0.92); opacity: 0.6; } }',
      '.lz-global-shield.is-hidden { opacity: 0; transition: opacity 0.4s ease-out; pointer-events: none; }',
      'html.lz-loading-lock body { overflow: hidden !important; height: 100vh !important; }'
    ].join('\n');
    document.head.appendChild(style);
  };
  injectCoreStyles();

  /* ==========================================
     3. シールド解除ロジック (看板設置で即解除) 🍎
     ========================================== */
  var initShieldController = function () {
    var urlParams = new URLSearchParams(window.location.search);
    var targetArticleId = urlParams.get('id');

    var checkCount = 0;
    var waitReady = setInterval(function () {
      // セクションの殻（看板）ができたかチェック
      var targets = document.querySelectorAll('.lz-container, .lz-section[data-l2]');
      var readyCount = 0;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].querySelector('.lz-section')) { readyCount++; }
      }
      var headersReady = (targets.length === 0 || readyCount >= targets.length);

      // モーダル直接アクセスの場合は表示まで待つ
      var modalReady = true;
      if (targetArticleId) {
        modalReady = !!document.querySelector('.lz-backdrop.open');
      }

      if (headersReady && modalReady) {
        unlock();
      }

      if (++checkCount > 120) unlock(); // 最大6秒
    }, 50);

    function unlock() {
      clearInterval(waitReady);
      if (window._lzSafetyFuse) clearTimeout(window._lzSafetyFuse);

      setTimeout(function () {
        var s = document.getElementById('lzGlobalShield');
        if (s) s.classList.add('is-hidden');
        document.documentElement.classList.remove('lz-loading-lock');
      }, 100);
    }
  };

  /* ==========================================
     4. 多言語管理 ＆ 起動シーケンス
     ========================================== */
  initShieldController();

  var initLang = function () {
    var urlParams = new URLSearchParams(window.location.search);
    var lang = urlParams.get('lang');
    if (window.LZ_CONFIG && !window.LZ_CONFIG.LANG.SUPPORTED.includes(lang)) lang = window.LZ_CONFIG.LANG.DEFAULT;
    window.LZ_CURRENT_LANG = lang || 'ja';
  };

  var boot = function () {
    if (window.LZ_CONFIG) { initLang(); }
    else { setTimeout(boot, 20); }
  };
  boot();

  return {
    NET: NET,
    T: function (key) { var dict = (window.LZ_CONFIG && window.LZ_CONFIG.LANG.I18N[window.LZ_CURRENT_LANG]) || {}; return dict[key] || key; },
    L: function (item, key) { if (!item) return ""; var lang = window.LZ_CURRENT_LANG; if (lang === 'ja') return item[key] || ""; if (item[lang] && (item[lang][key] !== undefined && item[lang][key] !== "")) return item[lang][key]; return item[key] || ""; },
    esc: function (s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;"); },
    ratio: function (r) { return ({ "16:9": "56.25%", "4:3": "75%", "1:1": "100%", "3:2": "66.67%" }[r] || "56.25%"); },
    loadScript: function (src) { return new Promise(function (res, rej) { if ([].slice.call(document.scripts).some(function (s) { return s.src === src; })) return res(); var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); },
    originalTitle: document.title,
    RED_APPLE: "\u{1F34E}\uFE0F", GREEN_APPLE: "\u{1F34F}\uFE0F"
  };
})();