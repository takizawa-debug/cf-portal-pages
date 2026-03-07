/**
 * modal-search.js - モーダル内広域検索エンジン (UI・自動リンク反映統合版)
 * 役割: 検索アニメーション、スティッキー×ボタン、およびキーワードの非同期自動反映を実装。
 * 毀損防止策: 既存のSVGパス、CSSクラス名、および検索ロジックを完全に保持。
 */
window.lzSearchEngine = (function () {
  "use strict";
  var C = window.LZ_COMMON;
  var DYNAMIC_KEYWORDS = [];
  var isKeywordsReady = false;

  var track = function (name, params) { if (window.mzTrack) window.mzTrack(name, params); };

  // スタイル注入
  var injectSearchStyles = function () {
    if (document.getElementById('lz-search-engine-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-search-engine-styles';
    style.textContent = [
      /* 🍎 自動反映リンクのフェードイン演出 */
      '.lz-auto-link { opacity: 0; transition: opacity 0.8s ease; }',
      '.lz-auto-link.is-active { opacity: 1 !important; }',

      '.lz-s-wrap { padding: 15px 20px !important; position: relative !important; }',

      /* 右上に固定される閉じるボタン (既存機能維持) */
      '.lz-s-close-sticky { ' +
      'position: sticky !important; ' +
      'top: 0 !important; ' +
      'float: right !important; ' +
      'z-index: 100 !important; ' +
      'width: 38px !important; ' +
      'height: 38px !important; ' +
      'margin-top: -5px !important; ' +
      'margin-right: -10px !important; ' +
      'background: rgba(255, 255, 255, 0.9) !important; ' +
      'border: 1px solid #ddd !important; ' +
      'border-radius: 50% !important; ' +
      'display: flex !important; ' +
      'align-items: center !important; ' +
      'justify-content: center !important; ' +
      'font-size: 26px !important; ' +
      'color: #666 !important; ' +
      'cursor: pointer !important; ' +
      'box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important; ' +
      'transition: .2s !important; ' +
      'line-height: 1 !important; ' +
      '}',
      '.lz-s-close-sticky:hover { background: #fff !important; color: #cf3a3a !important; border-color: #cf3a3a !important; }',

      '.lz-s-title { font-size: 1.7rem !important; font-weight: 600 !important; color: #333 !important; margin-bottom: 12px !important; border-left: 6px solid #27ae60 !important; padding-left: 12px !important; line-height: 1.3 !important; display: block !important; }',
      '.lz-s-item { display:flex; gap:12px; align-items:center; padding:10px; background:#fff; border:1px solid #eee; border-radius:10px; margin-bottom: 8px !important; cursor:pointer; transition:.2s; }',
      '.lz-s-item:hover { border-color: #27ae60; background: #f9fffb; transform: translateY(-1px); }',
      '.lz-s-name { font-size: 1.3rem; font-weight: 500; color: #cf3a3a; margin-bottom: 2px; line-height: 1.3; font-family: "Zen Kaku Gothic New", "Zen Gothic", "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif; }',
      '.lz-s-body { font-size: 1.05rem; color: #666; line-height: 1.5; -webkit-line-clamp: 2; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }',
      '.lz-s-cat { font-size: 0.95rem; background: #27ae60; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: 600; display: inline-block; }',
      '.lz-btn-search-back { margin-top: 12px !important; width: 100% !important; height: auto !important; border: 2px solid #27ae60 !important; color: #27ae60 !important; background: #fff !important; transition: .2s !important; font-weight: 600 !important; font-size: 1.1rem !important; padding: 8px 0 !important; cursor: pointer !important; border-radius: 999px !important; text-align: center !important; display: block !important; } @media (max-width: 768px) { .lz-btn-search-back { margin-top: 18px !important; padding: 14px 0 !important; font-size: 1.3rem !important; width: 100% !important; height: auto !important; display: block !important; } }',
      '.lz-s-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:15px; box-sizing:border-box; background:#f9f9f9; }',
      '.lz-s-img-placeholder img { width:100%; height:100%; object-fit:contain; opacity:0.15; filter:grayscale(1); }',
      'mark { background:#fff566; border-radius:2px; padding:0 2px; }',
      /* 🍎 リンゴ線画アニメーション (維持) */
      '.lz-s-loading { padding: 60px 20px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; box-sizing: border-box; }',
      '.lz-s-logo { width: 90px; height: 90px; margin: 0 auto 15px; display: block; overflow: visible; }',
      '.lz-s-logo-path { fill: none; stroke: #ccc; stroke-width: 15; stroke-linecap: round; stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: lz-s-draw 4.0s ease-in-out infinite; }',
      '@keyframes lz-s-draw { 0% { stroke-dashoffset: 1000; } 50% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: 1000; } }',
      '.lz-s-loading-label { font-size: 1.2rem; color: #999; font-weight: 400; letter-spacing: 0.05em; }'
    ].join('\n');
    document.head.appendChild(style);
  };

  function getMsg(key, lang) {
    var dict = window.LZ_CONFIG.LANG.I18N[lang] || window.LZ_CONFIG.LANG.I18N['ja'];
    return dict[key] || key;
  }

  // 🍎 キーワード取得 ＆ 自動反映
  async function prefetchKeywords() {
    try {
      var res = await fetch(window.LZ_CONFIG.ENDPOINT + "?mode=keywords");
      var json = await res.json();
      if (json.ok) {
        DYNAMIC_KEYWORDS = json.items || [];
        isKeywordsReady = true;

        // 1. ページ内の既存コンテンツにリンクを即時適用
        window.lzSearchEngine.updateAllLinksInPage();

        // 2. 🍎 重要：モーダルが開いていれば、modal.jsのrefreshを呼び出して「正式に」再描画する
        // これにより、後出しでもリンクのクリックイベントが確実に有効になります。
        if (window.lzModal && window.lzModal.refresh) {
          window.lzModal.refresh();
        }
      }
    } catch (e) { console.error("Keywords fetch failed", e); }
  }

  prefetchKeywords();
  injectSearchStyles();

  return {
    // 🍎 ページ内の全要素をスキャンして自動リンクを当てる
    updateAllLinksInPage: function () {
      if (!isKeywordsReady) return;
      var lang = window.LZ_CURRENT_LANG || 'ja';
      var targets = document.querySelectorAll('.lz-article-body, .lz-card-body, .lz-modal-body-txt, .lz-txt');

      targets.forEach(function (el) {
        if (el.dataset.lzLinked === "true") return;

        var originalHtml = el.innerHTML;
        // 更新モード(isUpdateMode=true)でリンク適用
        var linkedHtml = window.lzSearchEngine.applyLinks(originalHtml, el.dataset.id || "", lang, true);

        if (originalHtml !== linkedHtml) {
          el.innerHTML = linkedHtml;
          el.dataset.lzLinked = "true";

          setTimeout(function () {
            el.querySelectorAll('.lz-auto-link').forEach(function (link) {
              link.classList.add('is-active');
            });
          }, 100);
        }
      });
    },

    applyLinks: function (text, currentId, targetLang, isUpdateMode) {
      if (!DYNAMIC_KEYWORDS.length) return text;

      var map = {};
      DYNAMIC_KEYWORDS.forEach(function (kw) {
        var word = kw[targetLang] || kw['ja'];
        if (word && word.length > 1) {
          map[word.toLowerCase()] = { word: word, originalJa: kw.ja, type: 'search' };
        }
      });
      document.querySelectorAll('.lz-card').forEach(function (card) {
        try {
          var d = JSON.parse(card.dataset.item || "{}");
          var title = C.L(d, 'title', targetLang);
          if (title && title.length > 1 && card.dataset.id !== currentId) {
            map[title.toLowerCase()] = { word: title, id: card.dataset.id, type: 'direct' };
          }
        } catch (e) { }
      });

      var candidates = Object.values(map).sort(function (a, b) { return b.word.length - a.word.length; });

      // 🍎 更新モードの場合は HTMLタグを壊さないよう細心の注意を払う
      var resultText = isUpdateMode ? text : C.esc(text);
      var tokens = [];

      candidates.forEach(function (item, idx) {
        // 🍎 改良：HTMLタグの属性内（href="りんご"など）を置換しないための正規表現
        var regex = new RegExp('(?<!<[^>]*)' + item.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

        resultText = resultText.replace(regex, function (match) {
          var token = "###LZT_" + idx + "###";
          tokens[idx] = (item.type === 'direct')
            ? '<span class="lz-auto-link direct" data-goto-id="' + item.id + '">' + match + '</span>'
            : '<span class="lz-auto-link search" data-keyword="' + (item.originalJa || item.word) + '" data-display="' + match + '">' + match + '</span>';
          return token;
        });
      });
      tokens.forEach(function (html, idx) { if (html) resultText = resultText.replace(new RegExp("###LZT_" + idx + "###", "g"), html); });
      return resultText;
    },

    run: async function (keyword, targetLang, modalEl, backFunc) {
      injectSearchStyles();
      var displayWord = keyword;
      if (window.event && window.event.currentTarget && window.event.currentTarget.dataset.display) {
        displayWord = window.event.currentTarget.dataset.display;
      }

      // 🍎 リンゴ線画アニメーション (維持)
      modalEl.innerHTML = [
        '<div class="lz-s-loading">',
        '  <svg class="lz-s-logo" viewBox="-60 -60 720 720" aria-hidden="true">',
        '    <path class="lz-s-logo-path" pathLength="1000" d="M287.04,32.3c.29.17,1.01.63,1.46,1.55.57,1.19.29,2.29.2,2.57-7.08,18.09-14.18,36.17-21.26,54.26,5.96-.91,14.77-2.45,25.28-5.06,17.98-4.45,22.46-7.44,33.44-9.85,18.59-4.08,33.88-1.67,44.51,0,21.1,3.32,37.42,10.74,47.91,16.6-4.08,8.59-11.1,20.05-23.06,29.99-18.47,15.35-38.46,18.54-52.07,20.7-7.55,1.21-21.61,3.32-39.12.24-13.71-2.41-11-4.76-30.72-9.36-6.73-1.56-12.82-2.64-17.98-7.87-3.73-3.77-4.92-7.63-6.74-7.3-2.44.43-1.84,7.58-4.5,16.85-.98,3.46-5.56,19.45-14.05,21.35-5.5,1.23-9.85-4.07-17.02-9.79-17.52-13.96-36.26-17.94-45.91-19.99-7.62-1.62-25.33-5.16-45.19,1.36-6.6,2.17-19.57,7.82-35.2,23.74-48.04,48.93-49.39,127.17-49.69,143.97-.08,5-.47,48.18,16.56,90.06,6.63,16.3,14.21,28.27,24.85,38.3,4.2,3.97,12.19,11.37,24.85,16.56,13.72,5.63,26.8,6.15,31.06,6.21,8.06.12,9.06-1.03,14.49,0,10.22,1.95,13.47,7.33,22.77,12.42,10.16,5.56,19.45,6.3,30.02,7.25,8.15.73,18.56,1.67,31.15-1.99,9.83-2.85,16.44-7.18,25.24-12.93,2.47-1.61,9.94-6.61,20.55-16.18,12.76-11.51,21.35-21.79,25.53-26.87,26.39-32.12,39.71-48.12,50.73-71.43,12.87-27.23,17.2-49.56,18.63-57.97,3.23-18.95,5.82-35.27,0-54.87-2.24-7.54-6.98-23.94-21.74-37.27-5.26-4.76-12.9-11.66-24.85-13.46-17.04-2.58-30.24,7.19-33.13,9.32-9.71,7.17-13.91,16.56-21.93,35.04-1.81,4.19-8.26,19.38-14.31,43.63-2.82,11.32-6.43,25.97-8.28,45.55-1.47,15.61-3.27,34.6,1.04,59.01,4.92,27.9,15.01,47.01,17.6,51.76,5.58,10.26,12.02,21.83,24.85,33.13,6.45,5.69,17.55,15.24,35.2,19.77,19.17,4.92,34.7.98,38.3,0,14.29-3.9,24.02-11.27,28.99-15.63"></path>',
        '  </svg>',
        '  <div class="lz-s-loading-label">' + getMsg('searching', targetLang) + '</div>',
        '</div>'
      ].join('');

      try {
        var endpoint = window.LZ_CONFIG.SEARCH_ENDPOINT + "?q=" + encodeURIComponent(keyword) + "&limit=50";
        var res = await fetch(endpoint);
        var json = await res.json();
        var currentId = new URLSearchParams(location.search).get('id');
        var results = (json.items || []).filter(function (it) { return it.title !== currentId; });

        // 🍎 Analytics: 検索実行
        var sourceCardId = currentId || '';
        track('search_execute', { search_term: keyword, source: 'keyword_link', source_card_id: sourceCardId, result_count: results.length });

        // 🍎 Analytics: 0件の場合
        if (results.length === 0) {
          track('search_no_results', { search_term: keyword });
        }

        var hl = function (text) {
          if (!displayWord) return text;
          var r = new RegExp(displayWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          return text.replace(r, function (m) { return '<mark>' + m + '</mark>'; });
        };

        var resTitle = getMsg('search_res_title', targetLang).replace('{0}', C.esc(displayWord));

        var html = '<div class="lz-s-wrap" data-search-term="' + C.esc(keyword) + '">';
        html += '<div class="lz-s-close-sticky" id="lzSearchStickyClose">&times;</div>';
        html += '<div class="lz-s-title">' + resTitle + '</div>';

        if (results.length === 0) {
          html += '<div style="padding:30px; border:2px dashed #eee; border-radius:12px; text-align:center; color:#888;">' + getMsg('not_found', targetLang) + '</div>';
        } else {
          results.forEach(function (it) {
            var l1 = C.L(it, 'l1', targetLang), l2 = C.L(it, 'l2', targetLang), title = C.L(it, 'title', targetLang);
            var lead = C.L(it, 'lead', targetLang) || "", body = C.L(it, 'body', targetLang) || "";
            var imgHtml = it.mainImage ? '<img src="' + C.esc(it.mainImage) + '" style="width:100%; height:100%; object-fit:cover;">'
              : '<div class="lz-s-img-placeholder"><img src="' + C.esc(window.LZ_CONFIG.ASSETS.LOGO_RED) + '"></div>';

            var combinedText = (lead + " " + body).replace(/\s+/g, ' ');
            var idx = combinedText.toLowerCase().indexOf(displayWord.toLowerCase());
            if (idx === -1) idx = 0;
            var start = Math.max(0, idx - 15);
            var snippet = (start > 0 ? "..." : "") + combinedText.substring(start, start + 90) + "...";

            html += '<div class="lz-s-item" data-goto-id="' + it.title + '" data-l1="' + it.l1 + '">';
            html += '  <div style="display:flex; gap:12px; align-items:center; width:100%;">';
            html += '    <div style="flex:0 0 82px; width:82px; height:82px; border-radius:10px; overflow:hidden; border:1px solid #eee; background:#fff;">' + imgHtml + '</div>';
            html += '    <div style="flex:1; min-width:0;">';
            html += '      <div style="margin-bottom:2px;"><span class="lz-s-cat">' + C.esc(l1 + " / " + l2) + '</span></div>';
            html += '      <div class="lz-s-name">' + hl(C.esc(title)) + '</div>';
            html += '      <div class="lz-s-body">' + hl(C.esc(snippet)) + '</div>';
            html += '    </div>';
            html += '  </div>';
            html += '</div>';
          });
        }

        html += '<button class="lz-btn lz-btn-search-back">' + getMsg('back_to_article', targetLang) + '</button></div>';
        modalEl.innerHTML = html;

        modalEl.querySelector('.lz-btn-search-back').onclick = backFunc;
        modalEl.querySelector('#lzSearchStickyClose').onclick = backFunc;

        modalEl.querySelectorAll('.lz-s-item').forEach(function (item, itemIndex) {
          item.onclick = function () {
            var targetId = item.dataset.gotoId;
            // 🍎 Analytics: 検索結果クリック（位置付き）
            track('search_result_click', {
              search_term: keyword,
              result_card_id: targetId,
              label: item.querySelector('.lz-s-name')?.textContent,
              result_position: itemIndex + 1,
              result_count: results.length
            });
            var cardInDom = document.querySelector('.lz-card[data-id="' + targetId + '"]');
            if (cardInDom) window.lzModal.open(cardInDom);
            else location.href = (window.LZ_CONFIG.MENU_URL[item.dataset.l1] || location.origin) + "?lang=" + targetLang + "&id=" + encodeURIComponent(targetId);
          };
        });
        modalEl.scrollTop = 0;

      } catch (e) {
        modalEl.innerHTML = '<div class="lz-s-wrap" style="padding:20px; text-align:center; color:#cf3a3a;">⚠️ Error: ' + C.esc(e.message) + '</div>';
      }
    }
  };
})();