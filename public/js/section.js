/**
 * section.js - 記事一覧コンポーネント (多言語対応・Manual Infinity Edition)
 */
(function () {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  /* ==========================================
     1. CSS (既存デザインを完全維持)
     ========================================== */
  var injectStyles = function () {
    if (document.getElementById('lz-section-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-section-styles';
    style.textContent = [
      '.lz-section { margin: 20px 0; position: relative; visibility: visible; min-height: 400px; }',
      '.lz-section.lz-ready { min-height: auto; }',
      '.lz-head { margin: 0 0 20px; position: relative; z-index: 10; }',
      '.lz-titlewrap { position: relative; display: inline-flex; align-items: center; padding: 12px 36px 12px 20px; box-sizing: border-box; background: linear-gradient(135deg, rgba(207, 58, 58, 0.04) 0%, rgba(255, 255, 255, 0.9) 100%); border-left: 5px solid var(--apple-red); border-radius: 0 40px 40px 0; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }',
      '.lz-title { margin: 0; font-weight: 600; font-size: 2.6rem; color: var(--apple-brown); letter-spacing: .08em; }',
      '.lz-l3head { display: flex; align-items: center; gap: .55em; margin: 24px 2px 10px; }',
      '.lz-l3bar { width: 10px; height: 1.4em; background: var(--apple-brown); border-radius: 3px; flex: 0 0 auto; }',
      '.lz-l3title { margin: 0; font-weight: 600; font-size: var(--fz-l3, 1.85rem); color: var(--apple-brown); line-height: 1.25; }',
      '.lz-loading { position: relative; display: flex; align-items: center; justify-content: center; height: 360px; border: none; background: transparent; }',
      '.lz-loading-inner { display: flex; flex-direction: column; align-items: center; gap: 10px; color: #ccc; }',
      '.lz-logo { width: 100px; height: 100px; display: block; }',
      '.lz-logo-path { fill: none; stroke: #ccc; stroke-width: 15; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: lz-draw 2.4s ease-in-out infinite alternate; }',
      '@keyframes lz-draw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }',
      '.lz-loading-label { font-weight: 550; font-size: 1.4rem; letter-spacing: .1em; }',
      '.lz-track-outer { position: relative; width: 100%; overflow: hidden; }',
      '.lz-track { display: grid; grid-auto-flow: column; grid-auto-columns: var(--cw, calc((100% - 32px) / 3.2)); gap: 24px; overflow-x: auto; padding: 12px 12px 24px; scroll-snap-type: none; -webkit-overflow-scrolling: touch; cursor: grab; user-select: none; scrollbar-width: none; -ms-overflow-style: none; }',
      '.lz-track:active { cursor: grabbing; }',
      '.lz-track::-webkit-scrollbar { display: none; }',
      '@media (max-width: 768px) { .lz-track { grid-auto-columns: var(--cw-sm, calc(100% / 1.25)); gap: 16px; } }',
      '.lz-card { position: relative; border: 1px solid rgba(231, 211, 200, 0.4); border-radius: 16px; background: #fff; transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1), box-shadow 0.4s ease, border-color 0.3s ease; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }',
      '.lz-card:hover, .lz-card.is-active { transform: translateY(-8px) scale(1.01); border-color: rgba(207, 58, 58, 0.3); box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 20px rgba(207, 58, 58, 0.05); }',
      '.lz-body { padding: 20px 16px; display: grid; gap: 10px; }',
      '.lz-title-sm { margin: 0; font-weight: 700; font-size: 1.6rem; color: var(--ink-dark); position: relative; transition: padding-left 0.3s ease, color 0.3s ease; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }',
      '.lz-card:hover .lz-title-sm, .lz-card.is-active .lz-title-sm { padding-left: 24px; color: var(--apple-red); }',
      '.lz-title-sm::before { content: ""; position: absolute; left: 0; top: 12px; transform: translateY(-50%) rotate(-15deg); width: 14px; height: 14px; background: var(--apple-green); border-radius: 0 80% 0 80%; opacity: 0; transition: opacity 0.3s ease; }',
      '.lz-card:hover .lz-title-sm::before, .lz-card.is-active .lz-title-sm::before { opacity: 1; }',
      '.lz-lead { font-size: 1.25rem; color: #666; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }',
      '.lz-media { position: relative; background: #fdfaf8; overflow: hidden; }',
      '.lz-media::before { content: ""; display: block; padding-top: var(--ratio, 60%); }',
      '.lz-media > img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1); }',
      '.lz-card:hover .lz-media > img, .lz-card.is-active .lz-media > img { transform: scale(1.05); }',
      '.lz-media.is-empty::after { content: ""; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 40%; aspect-ratio: 1/1; background-image: url("https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-36ff-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png"); background-position: center; background-repeat: no-repeat; background-size: contain; opacity: 0.15; }'
    ].join('\n');
    document.head.appendChild(style);
  };

  /* ==========================================
     2. ロジック: 双方向無限手動ループ
     ========================================== */
  function setupInfinityTrack(track) {
    if (!track) return;
    if (track.scrollWidth <= track.clientWidth) return;
    var originalHTML = track.innerHTML;
    track.innerHTML = originalHTML + originalHTML + originalHTML;
    var isMouseDown = false;
    var startX, scrollLeftInitial;
    var resetToCenter = function () {
      var singleWidth = track.scrollWidth / 3;
      track.scrollLeft = singleWidth;
    };
    setTimeout(resetToCenter, 50);
    track.addEventListener('scroll', function () {
      var singleWidth = track.scrollWidth / 3;
      if (track.scrollLeft >= singleWidth * 2) {
        track.scrollLeft -= singleWidth;
      } else if (track.scrollLeft <= 0) {
        track.scrollLeft += singleWidth;
      }
    }, { passive: true });
    track.addEventListener('mousedown', function (e) {
      isMouseDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeftInitial = track.scrollLeft;
    });
    window.addEventListener('mouseup', function () { isMouseDown = false; });
    track.addEventListener('mousemove', function (e) {
      if (!isMouseDown || e.buttons !== 1) return;
      e.preventDefault();
      var x = e.pageX - track.offsetLeft;
      var walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeftInitial - walk;
    });
  }

  /* ==========================================
     3. ユーティリティ
     ========================================== */
  function lzCenterLogoSVG(svg) {
    try {
      var path = svg.querySelector('path, .lz-logo-path');
      if (!path) return;
      var bb = path.getBBox();
      if (bb.width === 0) return;
      var cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2, box = Math.max(bb.width, bb.height);
      svg.setAttribute('viewBox', (cx - box / 2) + ' ' + (cy - box / 2) + ' ' + box + ' ' + box);
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    } catch (e) { }
  }

  /* ★修正：多言語対応(C.Lを使用) ＆ modal.js用データの埋め込み */
  function cardHTML(it, pad, groupKey) {
    // コンテンツ言語に合わせて取得
    var title = C.L(it, 'title') || "(無題)";
    var lead = C.L(it, 'lead') || "";
    var body = C.L(it, 'body') || "";

    var subs = it.subImages || [];
    var sns = it.sns || {};
    var related = it.relatedArticles || [];

    return [
      '<article class="lz-card" data-id="' + C.esc(it.title || "") + '" data-title="' + C.esc(title) + '"',
      '  data-item=\'' + C.esc(JSON.stringify(it)) + '\' ', // ★追加：全言語のデータをモーダルに引き継ぐ
      '  data-lead="' + C.esc(lead) + '" data-body="' + C.esc(body) + '" data-main="' + C.esc(it.mainImage || "") + '"',
      '  data-sub=\'' + C.esc(JSON.stringify(subs)) + '\' data-sns=\'' + C.esc(JSON.stringify(sns)) + '\'',
      '  data-related=\'' + C.esc(JSON.stringify(related)) + '\'',
      '  data-address="' + C.esc(it.address || "") + '" data-hours-combined="' + C.esc(it.hoursCombined || "") + '"',
      '  data-form="' + C.esc(it.form || "") + '" data-tel="' + C.esc(it.tel || "") + '" data-home="' + C.esc(it.home || "") + '"',
      '  data-ec="' + C.esc(it.ec || "") + '" data-target="' + C.esc(it.target || "") + '" data-org="' + C.esc(it.organizer || "") + '"',
      '  data-group="' + C.esc(groupKey) + '">',
      '  <div class="lz-media ' + (it.mainImage ? "" : "is-empty") + '" style="--ratio:' + pad + '">',
      it.mainImage ? '    <img src="' + C.esc(it.mainImage) + '" loading="lazy" decoding="async" onerror="this.parentElement.classList.add(\'is-empty\'); this.remove();">' : '',
      '  </div>',
      '  <div class="lz-body"><h3 class="lz-title-sm">' + C.esc(title) + '</h3><div class="lz-lead">' + C.esc(lead) + '</div></div>',
      '</article>'
    ].join('');
  }

  window.renderSection = async function (root) {
    if (root.dataset.lzDone === '1') return;
    var config = window.LZ_CONFIG, l1 = root.dataset.l1 || config.L1, l2 = root.dataset.l2 || "";
    if (!l2) return;

    var heading = root.dataset.heading || C.T(l2);
    var imageRatio = root.dataset.imageRatio || "16:9";
    var customWidth = root.dataset.cardWidth;
    var customWidthSm = root.dataset.cardWidthSm;
    var mql = window.matchMedia("(max-width:768px)");

    root.style.setProperty("--ratio", C.ratio(imageRatio));
    if (customWidth) root.style.setProperty("--cw", customWidth);
    if (customWidthSm) root.style.setProperty("--cw-sm", customWidthSm);

    // ローディング文言の多言語対応
    var loadingLabel = window.LZ_CURRENT_LANG === 'ja' ? '記事読み込み中…' : 'Loading articles...';

    root.innerHTML = [
      '<div class="lz-section">',
      '  <div class="lz-head"><div class="lz-titlewrap"><h2 class="lz-title">' + C.esc(heading) + '</h2></div></div>',
      '  <div class="lz-groupwrap"><div class="lz-loading"><div class="lz-loading-inner">',
      '    <svg class="lz-logo" viewBox="-60 -60 720 720" aria-hidden="true" style="overflow:visible">',
      '      <path class="lz-logo-path" pathLength="1000" d="M287.04,32.3c.29.17,1.01.63,1.46,1.55.57,1.19.29,2.29.2,2.57-7.08,18.09-14.18,36.17-21.26,54.26,5.96-.91,14.77-2.45,25.28-5.06,17.98-4.45,22.46-7.44,33.44-9.85,18.59-4.08,33.88-1.67,44.51,0,21.1,3.32,37.42,10.74,47.91,16.6-4.08,8.59-11.1,20.05-23.06,29.99-18.47,15.35-38.46,18.54-52.07,20.7-7.55,1.21-21.61,3.32-39.12.24-13.71-2.41-11-4.76-30.72-9.36-6.73-1.56-12.82-2.64-17.98-7.87-3.73-3.77-4.92-7.63-6.74-7.3-2.44.43-1.84,7.58-4.5,16.85-.98,3.46-5.56,19.45-14.05,21.35-5.5,1.23-9.85-4.07-17.02-9.79-17.52-13.96-36.26-17.94-45.91-19.99-7.62-1.62-25.33-5.16-45.19,1.36-6.6,2.17-19.57,7.82-35.2,23.74-48.04,48.93-49.39,127.17-49.69,143.97-.08,5-.47,48.18,16.56,90.06,6.63,16.3,14.21,28.27,24.85,38.3,4.2,3.97,12.19,11.37,24.85,16.56,13.72,5.63,26.8,6.15,31.06,6.21,8.06.12,9.06-1.03,14.49,0,10.22,1.95,13.47,7.33,22.77,12.42,10.16,5.56,19.45,6.3,30.02,7.25,8.15.73,18.56,1.67,31.15-1.99,9.83-2.85,16.44-7.18,25.24-12.93,2.47-1.61,9.94-6.61,20.55-16.18,12.76-11.51,21.35-21.79,25.53-26.87,26.39-32.12,39.71-48.12,50.73-71.43,12.87-27.23,17.2-49.56,18.63-57.97,3.23-18.95,5.82-35.27,0-54.87-2.24-7.54-6.98-23.94-21.74-37.27-5.26-4.76-12.9-11.66-24.85-13.46-17.04-2.58-30.24,7.19-33.13,9.32-9.71,7.17-13.91,16.56-21.93,35.04-1.81,4.19-8.26,19.38-14.31,43.63-2.82,11.32-6.43,25.97-8.28,45.55-1.47,15.61-3.27,34.6,1.04,59.01,4.92,27.9,15.01,47.01,17.6,51.76,5.58,10.26,12.02,21.83,24.85,33.13,6.45,5.69,17.55,15.24,35.2,19.77,19.17,4.92,34.7.98,38.3,0,14.29-3.9,24.02-11.27,28.99-15.63"></path>',
      '    </svg>',
      '    <div class="lz-loading-label">' + C.esc(loadingLabel) + '</div></div></div></div>',
      '</div>'
    ].join('');

    var _svg = root.querySelector('.lz-logo');
    if (_svg) { setTimeout(function () { lzCenterLogoSVG(_svg); }, 10); }

    try {
      var json = await C.NET.json(config.ENDPOINT + "?l1=" + encodeURIComponent(l1) + "&l2=" + encodeURIComponent(l2));
      if (!json || !json.ok) throw new Error("no data");
      var items = json.items || [], groups = new Map();

      /* ★修正：大項目(L2)のタイトルを翻訳後のデータで上書き */
      if (items.length > 0) {
        var l2Title = C.L(items[0], "l2");
        var titleEl = root.querySelector(".lz-title");
        if (titleEl && l2Title) titleEl.textContent = l2Title;
      }

      items.forEach(function (it) {
        var k = (it.l3 || "").trim();
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(it);
      });
      var html = "", pad = C.ratio(imageRatio);
      groups.forEach(function (arr, key) {
        var localizedL3 = C.L(arr[0], 'l3');
        if (key) html += '<div class="lz-l3head"><span class="lz-l3bar"></span><h3 class="lz-l3title">' + C.esc(localizedL3) + '</h3></div>';
        html += '<div class="lz-track-outer"><div class="lz-track">' + arr.map(function (it) { return cardHTML(it, pad, key); }).join("") + '</div></div>';
      });
      root.querySelector(".lz-groupwrap").innerHTML = html;
      root.querySelector(".lz-section").classList.add("lz-ready");
      root.dataset.lzDone = '1';
      root.querySelectorAll(".lz-track").forEach(setupInfinityTrack);

      if (mql.matches) {
        var updateActiveCard = function (track) {
          var trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
          var cards = track.querySelectorAll(".lz-card");
          var closestCard = null;
          var minDistance = Infinity;
          cards.forEach(function (card) {
            card.classList.remove("is-active");
            var rect = card.getBoundingClientRect();
            var cardCenter = rect.left + rect.width / 2;
            var distance = Math.abs(trackCenter - cardCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestCard = card;
            }
          });
          if (closestCard) closestCard.classList.add("is-active");
        };
        root.querySelectorAll(".lz-track").forEach(function (track) {
          updateActiveCard(track);
          track.addEventListener("scroll", function () { updateActiveCard(track); }, { passive: true });
        });
      }
      root.addEventListener("click", function (e) {
        var card = e.target.closest(".lz-card");
        if (card && window.lzModal) { e.preventDefault(); window.lzModal.open(card); }
      });
    } catch (e) {
      var errorLabel = window.LZ_CURRENT_LANG === 'ja' ? '読み込みに失敗しました' : 'Failed to load content';
      root.querySelector(".lz-groupwrap").innerHTML = '<div style="padding:40px; text-align:center; color:#999;">' + C.esc(errorLabel) + '</div>';
    }
  };

  var boot = function () {
    injectStyles();
    var waitConfig = setInterval(function () {
      if (window.LZ_CONFIG) { clearInterval(waitConfig); var els = document.querySelectorAll(".lz-container, .lz-section[data-l2]"); for (var i = 0; i < els.length; i++) { window.renderSection(els[i]); } }
    }, 50);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();