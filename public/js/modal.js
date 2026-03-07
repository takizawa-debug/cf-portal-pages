/**
 * modal.js - 詳細表示・機能コンポーネント (UI・安定機能維持版)
 * 役割: 画像表示、PDF生成、SNS共有、言語切り替え、ページめくりを担当。
 * 修正: 自動反映されるリンクが確実に動作するよう「イベントデリゲーション」を統合。
 */
window.lzModal = (function () {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  var MODAL_ACTIVE_LANG = null;
  var ORIGINAL_SITE_LANG = null;
  var MODAL_OPEN_SOURCE = 'card'; // モーダルを開いた経路
  var MODAL_CUMULATIVE_ACTIVE_MS = 0; // アクティブな滞在時間の合計
  var MODAL_LAST_RESUME_TS = 0; // 直近の計測開始タイミング

  var track = function (name, params) { if (window.mzTrack) window.mzTrack(name, params); };

  var getAppUID = function () {
    var uid = localStorage.getItem('app_uid');
    if (!uid) {
      uid = 'user_' + Math.random().toString(36).substr(2, 11);
      localStorage.setItem('app_uid', uid);
    }
    return uid;
  };

  var getActionTimestamp = function () {
    var d = new Date();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    return '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
      pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  };

  var ICON = {
    web: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" stroke="currentColor" stroke-width="2" fill="none"/></svg>`,
    ec: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L20 8H6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="19" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.6" fill="currentColor"/></svg>`,
    ig: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7z"/><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6z"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>`,
    fb: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13 22v-8h3l1-4h-4V7c0-1.1.9-2 2-2h2V1h-3a5 5 0 0 0-5 5v3H6v4h3v8h4z"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    line: `<svg viewBox="0.5 5.5 21 21" aria-hidden="true"><path fill="currentColor" fill-rule="evenodd" d="M10.656 5.938c5.938 0 10.719 3.875 10.719 8.688 0 2.344-1.156 4.406-2.969 6.031-2.938 2.906-8 5.844-8.531 5.625-0.875-0.344 0.656-2.219 0.031-3.031-0.094-0.125-0.438-0.094-1.063-0.188-5.156-0.688-8.844-4.094-8.844-8.469 0-4.813 4.75-8.656 10.656-8.656zM4.563 17.5h1.813c0.313 0 0.5-0.25 0.5-0.563 0-0.219-0.156-0.5-0.563-0.5h-1.469c-0.125 0-0.125-0.125-0.125-0.563v-3.156c0-0.281-0.188-0.563-0.531-0.563-0.313 0-0.531 0.25-0.531 0.563v3.813c0 0.844 0.406 0.969 0.906 0.969zM8.656 17.063v-4.344c0-0.281-0.219-0.563-0.563-0.563-0.281 0-0.531 0.25-0.531 0.563v4.344c0 0.281 0.219 0.5 0.563 0.5 0.281 0 0.531-0.219 0.531-0.5zM13.781 16.469v-3.813c0-0.281-0.219-0.5-0.563-0.5-0.25 0-0.531 0.156-0.531 0.5v2.75l-1.813-2.531c-0.25-0.438-0.563-0.719-0.938-0.719-0.469 0-0.5 0.375-0.5 0.906v4c0 0.281 0.219 0.5 0.531 0.5 0.281 0 0.531-0.188 0.531-0.5v-2.844l1.813 2.531c0.406 0.531 0.5 0.813 1 0.813 0.344 0 0.469-0.313 0.469-1.094zM17.281 14.313h-1.594v-0.906c0-0.094 0.031-0.219 0.188-0.219h1.406c0.344 0 0.563-0.188 0.563-0.531 0-0.406-0.313-0.531-0.594-0.531h-1.813c-0.563 0-0.844 0.375-0.844 0.875v3.531c0 0.625 0.25 0.969 0.844 0.969h1.844c0.406 0 0.563-0.25 0.563-0.563 0-0.406-0.313-0.531-0.563-0.531h-1.375c-0.125 0-0.219-0.094-0.219-0.188v-0.875h1.656c0.406 0 0.469-0.313 0.469-0.531 0-0.313-0.25-0.5-0.531-0.5z"/></svg>`,
    tt: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.5 1.5a5.4 5.4 0 0 0 .1 4.3 5.3 5.3 0 0 0 4.2 2.2V12a9 9 0 0 1-4.4-1.4V18a6.3 6.3 0 1 1-7.6-6.1v3.8a2.6 2.6 0 1 0 4 2.5V1.5z"/></svg>`
  };

  var injectStyles = function () {
    if (document.getElementById('lz-modal-styles')) return;
    var style = document.createElement('style');
    style.id = 'lz-modal-styles';
    style.textContent = [
      '.lz-backdrop { position: fixed; inset: 0; background: rgba(0, 0, 0, .4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: none; align-items: center; justify-content: center; z-index: 20000; }',
      '.lz-backdrop.open { display: flex; animation: lzFadeIn 0.3s ease; }',
      '@keyframes lzFadeIn { from { opacity: 0; } to { opacity: 1; } }',
      '.lz-shell { position: relative; display: flex; align-items: center; justify-content: center; pointer-events: none; }',
      '.lz-modal { position: relative; width: min(1000px, 94vw); max-height: 88vh; min-height: 50vh; display: flex; flex-direction: column; overflow: hidden; background: #fff; border-radius: 20px; z-index: 20001; pointer-events: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); transform: translateY(0); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }',
      '.lz-backdrop:not(.open) .lz-modal { transform: translateY(20px); }',
      '.lz-mh { background: #fff; border-bottom: 1px solid #eee; padding: 12px 16px; display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center; position: sticky; top: 0; z-index: 10; }',
      '.lz-mt { margin: 0; font-weight: 700; font-size: clamp(1.4rem, 4vw, 1.9rem); color: #a82626; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; line-height: 1.3; }',
      '.lz-actions { display: flex; gap: 8px; align-items: center; }',
      '.lz-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; background: #fdfaf8; border: none; border-radius: 999px; padding: 10px 16px; cursor: pointer; color: #a82626; font-weight: 700; font-size: 1.1rem; line-height: 1; transition: all 0.2s ease; }',
      '.lz-btn:hover { background: #feebeb; color: #cf3a3a; transform: scale(1.02); }',
      '.lz-btn svg { width: 18px; height: 18px; stroke-width: 2.5; }',
      '@media (max-width:768px) { .lz-btn { width: 44px; height: 44px; padding: 0; } .lz-btn .lz-label { display: none; } }',
      '.lz-m-lang-tabs { display: flex; padding: 12px 20px; background: #fff; justify-content: flex-end; }',
      '.lz-m-lang-tabs-inner { display: inline-flex; background: #f1f1f2; padding: 4px; border-radius: 999px; gap: 2px; }',
      '.lz-m-lang-btn { padding: 6px 16px; border-radius: 999px; font-size: 1rem; font-weight: 700; cursor: pointer; border: none; background: transparent; color: #666; transition: all .2s; }',
      '.lz-m-lang-btn.active { background: #fff; color: #cf3a3a; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }',
      '.lz-modal-content { display: flex; flex-direction: row; height: 100%; overflow-y: auto; }',
      '@media(max-width:768px) { .lz-modal-content { flex-direction: column; } }',
      '.lz-modal-left { flex: 0 0 clamp(300px, 40%, 450px); padding: 0 0 24px 20px; display: flex; flex-direction: column; gap: 16px; position: sticky; top: 0; align-self: flex-start; }',
      '@media(max-width:768px) { .lz-modal-left { flex: none; width: 100%; padding: 0; position: relative; } }',
      '.lz-mm { position: relative; background: #faf7f5; border-radius: 12px; overflow: hidden; }',
      '@media(max-width:768px) { .lz-mm { border-radius: 0; } }',
      '.lz-mm::before { content: ""; display: block; padding-top: 75%; }',
      '.lz-mm img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity .22s ease; }',
      '.lz-mm img.lz-fadeout { opacity: 0; }',
      '.lz-modal-right { flex: 1; padding: 20px 24px 30px; display: flex; flex-direction: column; gap: 20px; }',
      '@media(max-width:768px) { .lz-modal-right { padding: 16px 20px 30px; } }',
      '.lz-lead-strong { font-weight: 700; font-size: clamp(1.3rem, 3.5vw, 1.6rem); line-height: 1.6; color: #222; }',
      '.lz-txt { font-size: clamp(1.1rem, 3vw, 1.3rem); color: #444; line-height: 1.9; white-space: pre-wrap; }',
      '.lz-auto-link { text-decoration: underline; font-weight: 700; cursor: pointer; padding: 0 1px; border-radius: 2px; opacity: 0; transition: opacity 0.8s ease; }',
      '.lz-auto-link.is-active { opacity: 1; }',
      '.lz-auto-link.direct { color: #cf3a3a; text-decoration-color: rgba(207,58,58,0.3); text-underline-offset: 4px; }',
      '.lz-auto-link.search { color: #27ae60; text-decoration-color: rgba(39,174,96,0.3); text-underline-offset: 4px; }',
      '.lz-auto-link:hover { background: #fdf2f2; }',
      '.lz-info-list { display: flex; flex-direction: column; gap: 12px; margin-top: 10px; }',
      '.lz-info-item { display: flex; flex-direction: column; gap: 4px; padding: 12px 16px; background: #fcfcfc; border-radius: 12px; border: 1px solid #f0f0f0; }',
      '.lz-info-label { font-weight: 700; color: #999; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; }',
      '.lz-info-label::before { content: ""; display: inline-block; width: 6px; height: 6px; background: #e0d5ce; border-radius: 50%; }',
      '.lz-info-val { color: #333; font-size: clamp(1.1rem, 2.5vw, 1.25rem); line-height: 1.6; }',
      '.lz-sns { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 10px; }',
      '.lz-sns a { width: 44px; height: 44px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: #fff; transition: transform .2s, box-shadow .2s; }',
      '.lz-sns a:hover { transform: translateY(-4px); box-shadow: 0 8px 16px rgba(0,0,0,0.15); }',
      '.lz-sns a svg { width: 24px; height: 24px; }',
      '.lz-sns a[data-sns="web"] { background: linear-gradient(135deg, #6c7a89 0%, #5b667a 100%); } .lz-sns a[data-sns="ec"] { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); }',
      '.lz-sns a[data-sns="ig"] { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); } .lz-sns a[data-sns="fb"] { background: #1877F2; }',
      '.lz-sns a[data-sns="x"] { background: #000; } .lz-sns a[data-sns="line"] { background: #06C755; } .lz-sns a[data-sns="tt"] { background: #000; }',
      '.lz-g { display: grid; gap: 8px; grid-template-columns: repeat(4, 1fr); padding: 0 20px; }',
      '@media(max-width:768px) { .lz-g { padding: 12px 16px 0; } }',
      '.lz-g img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 6px; cursor: pointer; transition: opacity .2s, transform .2s; }',
      '.lz-g img:hover { transform: scale(1.05); }',
      '.lz-g img.is-active { outline: 3px solid #cf3a3a; outline-offset: 2px; opacity: 1; }',
      '.lz-arrow { position: absolute; top: 50%; transform: translateY(-50%); background: #fff; border: none; border-radius: 50%; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 21000; box-shadow: 0 8px 24px rgba(0,0,0,0.12); transition: all .2s; pointer-events: auto; }',
      '.lz-arrow:active { transform: translateY(-50%) scale(0.95); }',
      '.lz-arrow svg { width: 32px; height: 32px; stroke: #333; stroke-width: 2.5; fill: none; transition: stroke .2s; }',
      '.lz-arrow:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.2); } .lz-arrow:hover svg { stroke: #cf3a3a; }',
      '.lz-prev { left: -80px; } .lz-next { right: -80px; }',
      '@media(max-width:1100px) { .lz-prev { left: 16px; } .lz-next { right: 16px; } }',
      '@media(max-width:768px) {',
      '  .lz-shell { margin-bottom: 80px; }',
      '  .lz-modal { max-height: 80vh; max-height: 80svh; }',
      '  .lz-arrow { width: 48px; height: 48px; } .lz-arrow svg { width: 28px; height: 28px; }',
      '  .lz-prev, .lz-next { top: auto; bottom: -24px; left: 50%; transform: none; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }',
      '  .lz-arrow:active { transform: scale(0.95); }',
      '  .lz-prev { transform: translateX(-120%); } .lz-next { transform: translateX(20%); }',
      '}',
      '.lz-btn.lz-dl { color: #27ae60 !important; background: #f2fcf5 !important; } .lz-btn.lz-dl:hover { background: #e0f8e9 !important; color: #1e8449 !important; }',
      '.lz-map { margin-top: 10px; } .lz-map iframe { width: 100%; height: 280px; border: 0; border-radius: 12px; background: #eee; }'
    ].join('\n');
    document.head.appendChild(style);
  };

  function getLangText(data, key, targetLang) {
    if (targetLang === 'ja') return data[key] || "";
    if (data[targetLang] && data[targetLang][key]) return data[targetLang][key];
    return data[key] || "";
  }

  function getTranslation(key, targetLang) {
    var dict = window.LZ_CONFIG.LANG.I18N[targetLang] || window.LZ_CONFIG.LANG.I18N['ja'];
    return dict[key] || key;
  }

  /* PDF精密生成ロジック (維持) */
  function renderFooterImagePx(text, px, color) {
    var scale = 2, w = 1200, h = Math.round(px * 2.4);
    var canvas = document.createElement("canvas"); canvas.width = w * scale; canvas.height = h * scale;
    var ctx = canvas.getContext("2d"); ctx.scale(scale, scale);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = color; ctx.font = px + "px 'Noto Sans JP',sans-serif"; ctx.textBaseline = "middle";
    ctx.fillText(text, 2, h / 2);
    return { data: canvas.toDataURL("image/png"), ar: h / w };
  }

  async function generatePdf(element, title, cardId) {
    var confirmMsg = getTranslation("PDFを作成して新しいタブで開きます。よろしいですか？", MODAL_ACTIVE_LANG);
    if (!confirm(confirmMsg)) return;
    try {
      if (!window.jspdf) await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      if (!window.html2canvas) await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      if (!window.QRCode) await C.loadScript("https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js");
      var qrUrl = window.location.origin + window.location.pathname + "?lang=" + MODAL_ACTIVE_LANG + "&id=" + encodeURIComponent(cardId) + "&utm_source=pdf_qr&uid=" + getAppUID() + "&time=" + getActionTimestamp();
      var clone = element.cloneNode(true);
      clone.querySelector(".lz-actions").remove();
      if (clone.querySelector(".lz-m-lang-tabs")) clone.querySelector(".lz-m-lang-tabs").remove();
      if (clone.querySelector(".lz-map")) clone.querySelector(".lz-map").remove();
      if (clone.querySelector(".lz-sns")) clone.querySelector(".lz-sns").remove();
      clone.style.maxHeight = "none"; clone.style.height = "auto"; clone.style.width = "800px";
      clone.querySelectorAll("img").forEach(function (img) { img.setAttribute("referrerpolicy", "no-referrer-when-downgrade"); });
      document.body.appendChild(clone);
      var qrDiv = document.createElement("div");
      new QRCode(qrDiv, { text: qrUrl, width: 128, height: 128, correctLevel: QRCode.CorrectLevel.L });
      var qrCanvas = qrDiv.querySelector("canvas");
      var qrData = qrCanvas ? qrCanvas.toDataURL("image/png") : "";
      var canvas = await html2canvas(clone, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      document.body.removeChild(clone);
      var { jsPDF } = window.jspdf;
      var pdf = new jsPDF("p", "mm", "a4");
      var margin = 12, pageW = pdf.internal.pageSize.getWidth(), pageH = pdf.internal.pageSize.getHeight(), innerW = pageW - margin * 2, innerH = pageH - margin * 2;
      var imgData = canvas.toDataURL("image/png");
      var imgWmm = innerW, imgHmm = canvas.height * imgWmm / canvas.width;
      var totalPages = Math.max(1, Math.ceil(imgHmm / innerH));
      var heightLeft = imgHmm, position = margin, pageCount = 1;
      while (heightLeft > 0) {
        pdf.addImage(imgData, "PNG", margin, position, imgWmm, imgHmm);
        if (qrData) { var qSize = 22; pdf.addImage(qrData, "PNG", pageW - margin - qSize, pageH - margin - qSize - 3, qSize, qSize); }
        var footerText = getTranslation("本PDFデータは飯綱町産りんごPR事業の一環で作成されました。", MODAL_ACTIVE_LANG);
        var jpImg = renderFooterImagePx(footerText, 18, "#000");
        var footerH = 8; pdf.addImage(jpImg.data, "PNG", margin, pageH - margin - 2, footerH / jpImg.ar, footerH);
        var now = new Date(); var ts = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate() + " " + now.getHours() + ":" + ("0" + now.getMinutes()).slice(-2);
        var tsFull = ts + " / " + pageCount + "/" + totalPages;
        pdf.setFontSize(11); var tsWidth = pdf.getTextWidth(tsFull); pdf.text(tsFull, pageW - margin - tsWidth, pageH - margin + 4);
        heightLeft -= innerH; if (heightLeft > 0) { pdf.addPage(); position = margin - (imgHmm - heightLeft); pageCount++; }
      }
      window.open(pdf.output("bloburl"), "_blank");
    } catch (e) { console.error(e); alert(getTranslation("PDF生成に失敗しました。", MODAL_ACTIVE_LANG)); }
  }

  /* モーダル制御 */
  var HOST, SHELL, MODAL, CARDS = [], IDX = 0, CURRENT_CARD = null;

  function render(card, targetLang, openSource) {
    if (!card) return;
    var prevCardId = CURRENT_CARD ? CURRENT_CARD.dataset.id : null;
    CURRENT_CARD = card;
    var d = card.dataset;
    var prevLang = MODAL_ACTIVE_LANG;
    MODAL_ACTIVE_LANG = targetLang || MODAL_ACTIVE_LANG || window.LZ_CURRENT_LANG;
    var rawData = {};
    try { rawData = JSON.parse(d.item || "{}"); } catch (e) { rawData = { title: d.title, lead: d.lead, body: d.body, l3: d.group }; }

    // 🍎 Analytics: モーダル言語切替
    if (prevLang && prevLang !== MODAL_ACTIVE_LANG && !openSource) {
      track('modal_lang_switch', { card_id: d.id, from_lang: prevLang, to_lang: MODAL_ACTIVE_LANG });
    }

    // 表示データの取得
    var title = getLangText(rawData, 'title', MODAL_ACTIVE_LANG);
    var lead = getLangText(rawData, 'lead', MODAL_ACTIVE_LANG);
    var bodyText = getLangText(rawData, 'body', MODAL_ACTIVE_LANG);

    // 重要：リンク生成ロジック（lzSearchEngine）を呼び出す
    var linkedBody = window.lzSearchEngine ? window.lzSearchEngine.applyLinks(bodyText, d.id, MODAL_ACTIVE_LANG) : bodyText;

    var url = new URL(window.location.href);
    url.searchParams.set('lang', MODAL_ACTIVE_LANG); url.searchParams.set('id', d.id);
    window.history.replaceState(null, "", url.toString());
    document.title = title + " | " + C.originalTitle;

    var gallery = [d.main].concat(JSON.parse(d.sub || "[]")).filter(Boolean);
    var rows = [];
    var fields = [
      { k: 'address', l: getTranslation('住所', MODAL_ACTIVE_LANG) },
      { k: 'tel', l: getTranslation('問い合わせ電話', MODAL_ACTIVE_LANG) },
      { k: 'email', l: getTranslation('問い合わせメール', MODAL_ACTIVE_LANG) },
      { k: 'form', l: getTranslation('問い合わせフォーム', MODAL_ACTIVE_LANG) }, // 🍎 ボタンから表へ移動
      { k: 'bizDays', l: getTranslation('営業曜日', MODAL_ACTIVE_LANG) },
      { k: 'holiday', l: getTranslation('定休日', MODAL_ACTIVE_LANG) },
      { k: 'hoursCombined', l: getTranslation('営業時間', MODAL_ACTIVE_LANG) },
      { k: 'bizNote', l: getTranslation('営業注意事項', MODAL_ACTIVE_LANG) }, // 🍎 追加
      { k: 'eventDate', l: getTranslation('開催日', MODAL_ACTIVE_LANG) },
      { k: 'eventTime', l: getTranslation('開催時間', MODAL_ACTIVE_LANG) }, // 🍎 追加
      { k: 'fee', l: getTranslation('参加費', MODAL_ACTIVE_LANG) },
      { k: 'target', l: getTranslation('対象', MODAL_ACTIVE_LANG) },
      { k: 'orgApply', l: getTranslation('申し込み方法', MODAL_ACTIVE_LANG) },
      { k: 'bring', l: getTranslation('もちもの', MODAL_ACTIVE_LANG) },      // 🍎 追加
      { k: 'venueNote', l: getTranslation('会場注意事項', MODAL_ACTIVE_LANG) }, // 🍎 追加
      { k: 'note', l: getTranslation('備考', MODAL_ACTIVE_LANG) },
      { k: 'organizer', l: getTranslation('主催者名', MODAL_ACTIVE_LANG) },
      { k: 'orgTel', l: getTranslation('主催者連絡先', MODAL_ACTIVE_LANG) } // 🍎 追加
    ];

    // --- ① 情報テーブルの生成 (rawData を使い GASの全情報を拾う) ---
    for (var i = 0; i < fields.length; i++) {
      var val = rawData[fields[i].k];
      if (val && String(val).trim() !== "") {
        var strVal = String(val).trim();
        var displayHtml = C.esc(strVal);

        // 🍎 判定：httpから始まる場合はリンクにする
        if (strVal.startsWith('http')) {
          displayHtml = '<a href="' + C.esc(strVal) + '" target="_blank" style="color:#cf3a3a; text-decoration:underline; font-weight:700;">' + displayHtml + '</a>';
        }

        // --- テーブルからモダンなリスト型へ変更 ---
        rows.push('<div class="lz-info-item"><span class="lz-info-label">' + fields[i].l + '</span><span class="lz-info-val">' + displayHtml + '</span></div>');
      }
    }

    // --- ② リンク(SNS+HP+EC)の統合組み立て (snsHtml等の古い記述は削除) ---
    var snsLinksHtml = [];
    var addLink = function (url, iconKey) {
      if (url && String(url).trim() !== "") {
        snsLinksHtml.push('<a data-sns="' + iconKey + '" href="' + C.esc(url) + '" target="_blank">' + ICON[iconKey] + '</a>');
      }
    };

    addLink(rawData.home, "web"); // ホームページ
    addLink(rawData.ec, "ec");     // ECサイト
    if (rawData.sns) {
      addLink(rawData.sns.instagram, "ig");
      addLink(rawData.sns.facebook, "fb");
      addLink(rawData.sns.x, "x");
      addLink(rawData.sns.line, "line");
      addLink(rawData.sns.tiktok, "tt");
    }

    // --- ③ 関連記事の組み立て (ra.title || ra.url ロジックを適用) ---
    var relHtml = "";
    if (rawData.relatedArticles && rawData.relatedArticles.length > 0) {
      relHtml = '<div style="padding:15px; border-top:1px solid #eee;"><h3 style="font-size:1.1rem; color:#a82626; margin-bottom:10px;">' + getTranslation('関連記事', MODAL_ACTIVE_LANG) + '</h3><div style="display:grid; gap:8px;">' +
        rawData.relatedArticles.map(function (ra) {
          if (!ra.url) return "";
          var displayTitle = ra.title || ra.url;
          return '<a href="' + C.esc(ra.url) + '" target="_blank" style="display:block; padding:12px; background:#f9f9f9; border-radius:10px; color:#cf3a3a; text-decoration:none; font-weight:700; border:1px solid #eee; font-size:1.1rem;">🔗 ' + C.esc(displayTitle) + '</a>';
        }).join('') + '</div></div>';
    }

    // --- ④ タブの準備 ---
    var langTabs = '<div class="lz-m-lang-tabs"><div class="lz-m-lang-tabs-inner">' + window.LZ_CONFIG.LANG.SUPPORTED.map(function (l) {
      var label = window.LZ_CONFIG.LANG.LABELS[l]; return '<button class="lz-m-lang-btn ' + (l === MODAL_ACTIVE_LANG ? 'active' : '') + '" data-lang="' + l + '">' + label + '</button>';
    }).join('') + '</div></div>';

    // --- ⑤ GoogleマップHTMLの生成 ---
    var mapHtml = "";
    if (rawData.address && String(rawData.address).trim() !== "") {
      // 🍎 正しい埋め込み用URL形式に修正（httpsを使用し、output=embedを付与）
      var encodedAddr = encodeURIComponent(String(rawData.address).trim());
      mapHtml = '<div class="lz-map">' +
        '<iframe src="https://maps.google.com/maps?q=' + encodedAddr + '&output=embed" ' +
        'allowfullscreen loading="lazy"></iframe>' +
        '</div>';
    }


    MODAL.innerHTML = [
      '<div class="lz-mh">',
      '  <h2 class="lz-mt">' + C.esc(title) + '</h2>',
      '  <div class="lz-actions">',
      (rawData.downloadUrl ? '    <button class="lz-btn lz-dl" onclick="window.open(\'' + C.esc(rawData.downloadUrl) + '\',\'_blank\')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg><span class="lz-label">' + getTranslation('保存', MODAL_ACTIVE_LANG) + '</span></button>' : ''),
      '    <button class="lz-btn lz-share"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span class="lz-label">' + getTranslation('共有', MODAL_ACTIVE_LANG) + '</span></button>',
      (window.innerWidth >= 769 ? '    <button class="lz-btn lz-pdf"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span class="lz-label">' + getTranslation('印刷', MODAL_ACTIVE_LANG) + '</span></button>' : ''),
      '    <button class="lz-btn" onclick="lzModal.close()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg><span class="lz-label">' + getTranslation('閉じる', MODAL_ACTIVE_LANG) + '</span></button>',
      '  </div>',
      '</div>',
      langTabs,
      '<div class="lz-modal-content">',
      '  <div class="lz-modal-left">',
      (gallery.length ? '    <div class="lz-mm"><img id="lz-mainimg" src="' + C.esc(gallery[0]) + '" referrerpolicy="no-referrer-when-downgrade"></div>' : ''),
      (gallery.length > 1 ? '    <div class="lz-g">' + gallery.map(function (u, i) { return '<img src="' + C.esc(u) + '" data-idx="' + i + '" class="' + (i === 0 ? 'is-active' : '') + '">'; }).join('') + '</div>' : ''),
      '  </div>',
      '  <div class="lz-modal-right">',
      (lead ? '    <div class="lz-lead-strong">' + C.esc(lead) + '</div>' : ''),
      '    <div class="lz-txt lz-modal-body-txt" data-id="' + d.id + '">' + linkedBody + '</div>',
      (rows.length ? '    <div class="lz-info-list">' + rows.join('') + '</div>' : ''),
      (snsLinksHtml.length ? '    <div class="lz-sns">' + snsLinksHtml.join('') + '</div>' : ''),
      relHtml,
      mapHtml,
      '  </div>',
      '</div>'
    ].join('');

    // リンクへのis-active付与（既存のリンクがある場合用）
    MODAL.querySelectorAll('.lz-auto-link').forEach(function (l) { l.classList.add('is-active'); });
    MODAL.querySelectorAll('.lz-m-lang-btn').forEach(function (btn) { btn.onclick = function () { render(card, btn.dataset.lang, null); }; });

    // --- 🍎 印刷ボタンの命令を復活 ---
    var pdfBtnEl = MODAL.querySelector(".lz-pdf");
    if (pdfBtnEl) {
      pdfBtnEl.onclick = function () {
        track('modal_pdf_generate', { card_id: d.id, modal_title: title });
        generatePdf(MODAL, title, d.id);
      };
    }

    // 共有ボタンのクリックイベント
    MODAL.querySelector(".lz-share").onclick = function () {
      var detailsLabel = getTranslation('詳しくはこちら', MODAL_ACTIVE_LANG);
      var hashtags = getTranslation('hashtags', MODAL_ACTIVE_LANG);
      var shareUrl = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'utm_source=share&uid=' + getAppUID() + '&time=' + getActionTimestamp();
      var parts = [
        window.LZ_COMMON.RED_APPLE + title + window.LZ_COMMON.GREEN_APPLE,
        lead, "ーーー", detailsLabel, shareUrl, "", hashtags
      ];
      var payload = parts.filter(function (v) { return v && String(v).trim() !== ""; }).join("\n");

      var shareMethod;
      if (navigator.share) {
        navigator.share({ text: payload });
        shareMethod = 'native';
      } else {
        var ta = document.createElement("textarea");
        ta.value = payload; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); document.body.removeChild(ta);
        alert(getTranslation("共有テキストをコピーしました！", MODAL_ACTIVE_LANG));
        shareMethod = 'clipboard';
      }
      // 🍎 Analytics: 共有
      track('modal_share', { card_id: d.id, modal_title: title, method: shareMethod });
    };

    var mainImg = MODAL.querySelector("#lz-mainimg"); var thumbs = MODAL.querySelector(".lz-g");
    if (thumbs && mainImg) {
      thumbs.onclick = function (e) {
        var img = e.target.closest("img"); if (!img) return;
        // 🍎 Analytics: ギャラリー切り替え
        track('modal_gallery_click', { card_id: d.id, image_index: parseInt(img.dataset.idx) });
        mainImg.classList.add("lz-fadeout");
        setTimeout(function () { mainImg.src = gallery[img.dataset.idx]; mainImg.onload = function () { mainImg.classList.remove("lz-fadeout"); }; var all = thumbs.querySelectorAll("img"); for (var j = 0; j < all.length; j++) all[j].classList.toggle("is-active", j == img.dataset.idx); }, 200);
      };
    }
    SHELL.querySelectorAll(".lz-arrow").forEach(function (a) { a.remove(); });
    if (CARDS.length > 1) {
      var p = SHELL.appendChild(document.createElement("button")); p.className = "lz-arrow lz-prev"; p.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>';
      var n = SHELL.appendChild(document.createElement("button")); n.className = "lz-arrow lz-next"; n.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>';
      p.onclick = function (e) { e.stopPropagation(); var fromId = CARDS[IDX].dataset.id; IDX = (IDX - 1 + CARDS.length) % CARDS.length; track('modal_navigate', { from_card_id: fromId, to_card_id: CARDS[IDX].dataset.id, direction: 'prev' }); render(CARDS[IDX], MODAL_ACTIVE_LANG, 'navigate'); };
      n.onclick = function (e) { e.stopPropagation(); var fromId = CARDS[IDX].dataset.id; IDX = (IDX + 1) % CARDS.length; track('modal_navigate', { from_card_id: fromId, to_card_id: CARDS[IDX].dataset.id, direction: 'next' }); render(CARDS[IDX], MODAL_ACTIVE_LANG, 'navigate'); };
    }
    HOST.classList.add("open"); MODAL.scrollTop = 0;
  }

  function pauseActiveTimer() {
    if (MODAL_LAST_RESUME_TS > 0) {
      MODAL_CUMULATIVE_ACTIVE_MS += (Date.now() - MODAL_LAST_RESUME_TS);
      MODAL_LAST_RESUME_TS = 0;
    }
  }

  function resumeActiveTimer() {
    if (HOST && HOST.classList.contains("open") && !document.hidden) {
      if (MODAL_LAST_RESUME_TS === 0) {
        MODAL_LAST_RESUME_TS = Date.now();
      }
    }
  }

  // タブの切り替えを検知して計測を制御
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) pauseActiveTimer();
    else resumeActiveTimer();
  });

  function close() {
    if (HOST) {
      pauseActiveTimer();
      // 🍎 Analytics: モーダル閉じる（アクティブ滞在時間付き）
      var cardId = CURRENT_CARD ? CURRENT_CARD.dataset.id : '';
      var modalTitle = document.querySelector('.lz-modal .lz-mt');
      track('modal_close', {
        card_id: cardId,
        modal_title: modalTitle ? modalTitle.textContent : '',
        dwell_ms: MODAL_CUMULATIVE_ACTIVE_MS
      });
      HOST.classList.remove("open");
    }
    document.title = C.originalTitle;
    var url = new URL(location.href); url.searchParams.delete('id'); url.searchParams.set('lang', ORIGINAL_SITE_LANG);
    window.history.replaceState(null, "", url.toString());
    MODAL_ACTIVE_LANG = null; MODAL_CUMULATIVE_ACTIVE_MS = 0; MODAL_LAST_RESUME_TS = 0;
  }

  var checkDeepLink = function () {
    var rawId = new URLSearchParams(location.search).get('id'); if (!rawId) return;
    var urlId = decodeURIComponent(rawId).trim(); var attempts = 0;
    var timer = setInterval(function () {
      var cards = document.querySelectorAll(".lz-card");
      for (var i = 0; i < cards.length; i++) { if (decodeURIComponent(cards[i].dataset.id).trim() === urlId) { clearInterval(timer); window.lzModal.open(cards[i]); return; } }
      if (++attempts > 100) clearInterval(timer);
    }, 150);
  };

  injectStyles();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", checkDeepLink); else checkDeepLink();

  return {
    open: function (card) {
      if (!HOST) {
        HOST = document.body.appendChild(document.createElement("div")); HOST.className = "lz-backdrop";
        HOST.innerHTML = '<div class="lz-shell"><div class="lz-modal"></div></div>';
        SHELL = HOST.firstChild; MODAL = SHELL.firstChild;

        /* 重要：イベントデリゲーションを統合（書き換えられてもクリックが効く） */
        MODAL.addEventListener('click', function (e) {
          var el = e.target.closest('.lz-auto-link');
          if (!el) return;
          e.preventDefault();
          if (el.dataset.gotoId) {
            render(document.querySelector('.lz-card[data-id="' + el.dataset.gotoId + '"]'), MODAL_ACTIVE_LANG);
          } else if (window.lzSearchEngine) {
            window.lzSearchEngine.run(el.dataset.keyword, MODAL_ACTIVE_LANG, MODAL, function () {
              render(CURRENT_CARD, MODAL_ACTIVE_LANG);
            });
          }
        });

        HOST.onclick = function (e) { if (e.target === HOST) close(); };
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
      }
      ORIGINAL_SITE_LANG = window.LZ_CURRENT_LANG; MODAL_ACTIVE_LANG = ORIGINAL_SITE_LANG;
      MODAL_CUMULATIVE_ACTIVE_MS = 0;
      MODAL_LAST_RESUME_TS = Date.now();
      MODAL_OPEN_SOURCE = 'card';
      var tr = card.closest(".lz-track"); CARDS = tr ? Array.from(tr.querySelectorAll(".lz-card")) : [card];
      IDX = CARDS.indexOf(card);
      // 🍎 Analytics: モーダル表示
      track('modal_open', { card_id: card.dataset.id, modal_title: card.dataset.title, source: 'card' });
      render(card, MODAL_ACTIVE_LANG, 'card');
    },
    close: close,
    /* 同期用の再描画機能 */
    refresh: function () { if (HOST && HOST.classList.contains("open")) render(CURRENT_CARD, MODAL_ACTIVE_LANG); },
    backToCurrent: function () { render(CURRENT_CARD, MODAL_ACTIVE_LANG); }
  };
})();