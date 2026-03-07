/**
 * sidenav.js - サイド・ドットナビ (多言語対応版)
 */
(function() {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  /* ==========================================
     1. CSS (既存デザインを完全維持)
     ========================================== */
  var injectStyles = function() {
    if (document.getElementById('lz-sidenav-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-sidenav-styles';
    style.textContent = [
      '.lz-sidenav {',
      '  position: fixed; right: 24px; top: 50%; transform: translateY(-50%);',
      '  display: flex; flex-direction: column; gap: 20px; z-index: 8000;',
      '  background: rgba(255,255,255,0.4); padding: 22px 12px; border-radius: 40px;',
      '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);',
      '  box-shadow: 0 10px 30px rgba(0,0,0,0.05);',
      '  opacity: 0; transition: opacity 0.8s, transform 0.8s; pointer-events: none;',
      '}',
      'body.is-scrolled .lz-sidenav { opacity: 1; pointer-events: auto; }',

      /* --- 葉っぱ (通常時) --- */
      '.lz-sideitem {',
      '  position: relative; width: 14px; height: 14px;',
      '  background: var(--apple-green);',
      '  border-radius: 0 80% 0 80%;',
      '  transform: rotate(-15deg);',
      '  cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);',
      '}',
      '.lz-sideitem:hover { transform: scale(1.3) rotate(0deg); }',

      /* --- りんご (アクティブ時) --- */
      '.lz-sideitem.is-active {',
      '  background: var(--apple-red);',
      '  border-radius: 50% 50% 45% 45%;',
      '  transform: scale(1.6) rotate(0deg);',
      '  box-shadow: 0 4px 8px rgba(207, 58, 58, 0.3);',
      '}',
      '.lz-sideitem.is-active::after {',
      '  content: ""; position: absolute; top: -3px; left: 50%;',
      '  width: 2px; height: 5px; background: #5b3a1e; transform: translateX(-50%);',
      '}',

      /* ラベル表示 */
      '.lz-sideitem::before {',
      '  content: attr(data-label); position: absolute; right: 32px; top: 50%; transform: translateY(-50%);',
      '  background: var(--apple-red); color: #fff; padding: 6px 14px; border-radius: 20px;',
      '  font-size: 1.15rem; font-weight: 700; white-space: nowrap; opacity: 0; transition: 0.3s ease; pointer-events: none;',
      '  font-family: var(--font-base);',
      '}',
      '.lz-sideitem:hover::before { opacity: 1; right: 38px; }',

      '@media (max-width: 1024px) { .lz-sidenav { display: none; } }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     2. ロジック: ナビゲーション構築
     ========================================== */
  function buildSideNav() {
    if (document.querySelector('.lz-sidenav')) return;

    var sections = Array.prototype.slice.call(document.querySelectorAll(".lz-section[data-l2]"));
    if (sections.length === 0) return;

    var sideNav = document.createElement('div');
    sideNav.className = 'lz-sidenav';
    document.body.appendChild(sideNav);

    for (var i = 0; i < sections.length; i++) {
      (function(idx) {
        var sec = sections[idx];
        var key = sec.getAttribute('data-l2'); // 判定用の内部キー(日本語)
        if (!key) return;

        /* ★多言語対応: section.jsによって既に翻訳された見出し(.lz-title)から表示名を取得 */
        var titleEl = sec.querySelector('.lz-title');
        var displayLabel = titleEl ? titleEl.textContent : key;

        var item = document.createElement('div');
        item.className = 'lz-sideitem';
        item.setAttribute('data-label', displayLabel); // CSSで表示される翻訳後のラベル
        item.setAttribute('data-key', key);           // スクロール判定用の内部キー
        
        item.onclick = function() {
          var header = document.querySelector(".pera1-header, .lz-hdr");
          var offset = (header ? header.offsetHeight : 68) + 20;
          var y = sec.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top: y, behavior: "smooth" });
        };
        
        sideNav.appendChild(item);
      })(i);
    }

    /* ==========================================
       3. スクロール監視
       ========================================== */
    var updateActive = function() {
      var scrollY = window.scrollY;
      var currentKey = "";

      document.body.classList.toggle('is-scrolled', scrollY > 200);

      for (var j = 0; j < sections.length; j++) {
        if (scrollY >= (sections[j].offsetTop - 250)) {
          currentKey = sections[j].getAttribute('data-l2');
        }
      }

      var dotItems = sideNav.querySelectorAll('.lz-sideitem');
      for (var k = 0; k < dotItems.length; k++) {
        /* ★修正：内部キー(data-key)でアクティブ状態を判定 */
        dotItems[k].classList.toggle('is-active', dotItems[k].getAttribute('data-key') === currentKey);
      }
    };

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  /* ==========================================
     4. 起動シーケンス
     ========================================== */
  var bootNav = function() {
    injectStyles();
    
    var observer = new MutationObserver(function() {
      var allSections = document.querySelectorAll('.lz-section[data-l2]');
      var readySections = document.querySelectorAll('.lz-section[data-l2].lz-ready');
      // すべてのセクションが「lz-ready（翻訳・描画完了）」になったら構築開始
      if (allSections.length > 0 && readySections.length >= allSections.length) {
        buildSideNav();
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(buildSideNav, 4000); // 念のためのセーフティタイマー
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootNav);
  else bootNav();

})();