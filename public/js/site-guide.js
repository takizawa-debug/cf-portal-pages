/**
 * site-guide.js - サイト機能ショーケース（多言語対応）
 * SVGピクトグラム＋最小テキストで直感的に伝えるデザイン
 */
(function () {
    "use strict";

    var C = window.LZ_COMMON;
    if (!C) return;

    /* ==========================================
       1. SVGピクトグラム（単色・フラット）
       ========================================== */
    var ICONS = {
        aggregate: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="8" width="14" height="14" rx="3" fill="currentColor"/><rect x="6" y="26" width="14" height="14" rx="3" fill="currentColor" opacity="0.5"/><rect x="24" y="8" width="18" height="6" rx="2" fill="currentColor" opacity="0.7"/><rect x="24" y="18" width="12" height="4" rx="2" fill="currentColor" opacity="0.35"/><rect x="24" y="26" width="18" height="6" rx="2" fill="currentColor" opacity="0.7"/><rect x="24" y="36" width="12" height="4" rx="2" fill="currentColor" opacity="0.35"/></svg>',
        search: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="21" cy="21" r="12" stroke="currentColor" stroke-width="4"/><line x1="30" y1="30" x2="42" y2="42" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
        globe: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="18" stroke="currentColor" stroke-width="3.5"/><ellipse cx="24" cy="24" rx="8" ry="18" stroke="currentColor" stroke-width="3"/><line x1="6" y1="24" x2="42" y2="24" stroke="currentColor" stroke-width="3"/><line x1="8" y1="15" x2="40" y2="15" stroke="currentColor" stroke-width="2" opacity="0.5"/><line x1="8" y1="33" x2="40" y2="33" stroke="currentColor" stroke-width="2" opacity="0.5"/></svg>',
        share: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="10" r="6" fill="currentColor"/><circle cx="12" cy="24" r="6" fill="currentColor"/><circle cx="36" cy="38" r="6" fill="currentColor"/><line x1="17" y1="21" x2="31" y2="13" stroke="currentColor" stroke-width="3"/><line x1="17" y1="27" x2="31" y2="35" stroke="currentColor" stroke-width="3"/></svg>',
        print: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="10" y="6" width="28" height="10" rx="1" fill="currentColor" opacity="0.5"/><rect x="4" y="16" width="40" height="18" rx="4" fill="currentColor"/><rect x="12" y="28" width="24" height="14" rx="2" fill="white"/><rect x="16" y="33" width="16" height="2" rx="1" fill="currentColor" opacity="0.4"/><rect x="16" y="37" width="10" height="2" rx="1" fill="currentColor" opacity="0.4"/><circle cx="36" cy="22" r="2" fill="white"/></svg>',
        submit: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 38L42 24L6 10V20L30 24L6 28V38Z" fill="currentColor"/></svg>'
    };

    /* ==========================================
       2. 多言語コンテンツ
       ========================================== */
    var CONTENT = {
        ja: {
            headline: "りんごのまちを、もっと身近に。",
            sub: "飯綱町に点在するりんごの情報を一つにつなぐポータルサイトです。",
            features: [
                { icon: "aggregate", title: "まるごと集約", desc: "品種・農園・加工品・体験を\nひとつの場所で" },
                { icon: "search", title: "キーワード検索", desc: "知りたい情報に\nすぐたどり着ける" },
                { icon: "globe", title: "多言語対応", desc: "日本語・English・中文\n3言語でご案内" },
                { icon: "share", title: "ワンクリック共有", desc: "SNS・メッセージで\n記事をかんたんシェア" },
                { icon: "print", title: "A4印刷対応", desc: "QRコード付きで\nそのまま配布資料に" },
                { icon: "submit", title: "情報を届ける", desc: "生産者・お店・行政から\n最新情報を発信" }
            ],
            ctaHeadline: "一緒に育てる、りんごの情報。",
            ctaSub: "生産者、お店、地域の皆さまからの情報提供をお待ちしています。",
            ctaButton: "情報提供・お問い合わせ",
            ctaUrl: "https://appletown-iizuna.com/contact"
        },
        en: {
            headline: "Apple Town, closer than ever.",
            sub: "A portal that connects scattered apple information across Iizuna into one place.",
            features: [
                { icon: "aggregate", title: "All in One", desc: "Varieties, farms, products\n& experiences — unified" },
                { icon: "search", title: "Keyword Search", desc: "Find what you need\nin seconds" },
                { icon: "globe", title: "Multilingual", desc: "Available in Japanese,\nEnglish & Chinese" },
                { icon: "share", title: "Easy Sharing", desc: "Share articles to social\nmedia with one click" },
                { icon: "print", title: "Print-Ready", desc: "A4 formatted with QR\ncodes for handouts" },
                { icon: "submit", title: "Open Submissions", desc: "Producers, shops & local\ngov can share updates" }
            ],
            ctaHeadline: "Let\u2019s grow this together.",
            ctaSub: "We welcome information from producers, shops, and community members.",
            ctaButton: "Submit Info / Contact",
            ctaUrl: "https://appletown-iizuna.com/contact"
        },
        zh: {
            headline: "讓苹果小镇更加親近。",
            sub: "將散佈於飯綱町各處的蘋果資訊匯聚一堂的入口網站。",
            features: [
                { icon: "aggregate", title: "一站匯整", desc: "品種・農園・加工品・體驗\n集中呈現" },
                { icon: "search", title: "關鍵字搜尋", desc: "快速找到\n想了解的資訊" },
                { icon: "globe", title: "多語言支援", desc: "日文・英文・中文\n三語導覽" },
                { icon: "share", title: "一鍵分享", desc: "透過社群媒體\n輕鬆分享文章" },
                { icon: "print", title: "A4列印", desc: "附QR碼\n可直接印製發放" },
                { icon: "submit", title: "資訊投稿", desc: "生產者・店家・行政\n發佈最新訊息" }
            ],
            ctaHeadline: "一起培育蘋果的資訊。",
            ctaSub: "歡迎生產者、店家及社區各界提供資訊。",
            ctaButton: "資訊提供・聯絡我們",
            ctaUrl: "https://appletown-iizuna.com/contact"
        }
    };

    /* ==========================================
       3. CSS
       ========================================== */
    var injectStyles = function () {
        if (document.getElementById('lz-guide-styles')) return;
        var s = document.createElement('style');
        s.id = 'lz-guide-styles';
        s.textContent = [
            '.lz-guide { font-family: var(--font-base); }',

            /* ── ヘッダー ── */
            '.lz-guide__header {',
            '  text-align: center; padding: 70px 24px 10px;',
            '  max-width: 700px; margin: 0 auto;',
            '}',
            '.lz-guide__headline {',
            '  font-family: var(--font-accent);',
            '  font-weight: 700; font-size: clamp(1.8rem, 4.0vw, 2.6rem) !important;',
            '  color: var(--apple-brown, #5b3a1e);',
            '  margin: 0 0 12px; letter-spacing: .04em; line-height: 1.4;',
            '}',
            '.lz-guide__sub {',
            '  font-size: clamp(1.1rem, 1.8vw, 1.3rem) !important;',
            '  color: #777; margin: 0; line-height: 1.7;',
            '}',

            /* ── 6特長グリッド ── */
            '.lz-guide__features {',
            '  display: grid; grid-template-columns: repeat(3, 1fr);',
            '  gap: 0; max-width: 900px; margin: 0 auto;',
            '  padding: 40px 24px 50px;',
            '}',
            '.lz-guide__feat {',
            '  text-align: center; padding: 36px 20px;',
            '  position: relative;',
            '  transition: background 0.3s ease;',
            '}',
            '.lz-guide__feat:hover { background: rgba(207, 58, 58, 0.03); }',

            /* グリッド罫線 */
            '.lz-guide__feat::before {',
            '  content: ""; position: absolute; top: 0; left: 0; right: 0;',
            '  height: 1px; background: #ece5de;',
            '}',
            '.lz-guide__feat::after {',
            '  content: ""; position: absolute; top: 0; bottom: 0; left: 0;',
            '  width: 1px; background: #ece5de;',
            '}',
            '.lz-guide__feat:nth-child(3n+1)::after { display: none; }',
            '.lz-guide__feat:nth-child(-n+3)::before { display: none; }',

            /* SVGアイコン */
            '.lz-guide__feat-icon {',
            '  width: 48px; height: 48px;',
            '  color: var(--apple-red, #cf3a3a);',
            '  display: block; margin: 0 auto 16px;',
            '  transition: transform 0.3s ease;',
            '}',
            '.lz-guide__feat:hover .lz-guide__feat-icon { transform: scale(1.12) translateY(-2px); }',
            '.lz-guide__feat-title {',
            '  font-family: var(--font-accent);',
            '  font-weight: 700; font-size: 1.25rem !important;',
            '  color: var(--apple-brown, #5b3a1e);',
            '  margin: 0 0 8px; letter-spacing: .03em;',
            '}',
            '.lz-guide__feat-desc {',
            '  font-size: 1.15rem !important; color: #999; line-height: 1.6;',
            '  margin: 0; white-space: pre-line;',
            '}',

            /* ── CTA ── */
            '.lz-guide__cta {',
            '  background: linear-gradient(135deg, #faf6f3 0%, #f9f3ef 100%);',
            '  padding: 50px 24px; text-align: center;',
            '}',
            '.lz-guide__cta-headline {',
            '  font-family: var(--font-accent);',
            '  font-weight: 700; font-size: clamp(1.5rem, 3.2vw, 2.0rem) !important;',
            '  color: var(--apple-brown, #5b3a1e);',
            '  margin: 0 0 10px;',
            '}',
            '.lz-guide__cta-sub {',
            '  font-size: 1rem; color: #888; margin: 0 0 28px; line-height: 1.6;',
            '}',
            '.lz-guide__cta-btn {',
            '  display: inline-flex; align-items: center; gap: 8px;',
            '  padding: 14px 34px; border-radius: 999px;',
            '  background: var(--apple-red, #cf3a3a); color: #fff;',
            '  font-family: var(--font-accent);',
            '  font-weight: 700; font-size: 1.2rem !important;',
            '  text-decoration: none; border: none; cursor: pointer;',
            '  transition: all 0.3s ease;',
            '  box-shadow: 0 6px 20px rgba(207, 58, 58, 0.2);',
            '}',
            '.lz-guide__cta-btn:hover {',
            '  background: #a82626;',
            '  transform: translateY(-2px);',
            '  box-shadow: 0 10px 28px rgba(207, 58, 58, 0.3);',
            '}',
            '.lz-guide__cta-btn::after { content: " →"; transition: transform 0.3s; }',
            '.lz-guide__cta-btn:hover::after { transform: translateX(4px); }',

            /* ── レスポンシブ ── */
            '@media (max-width: 768px) {',
            '  .lz-guide__header { padding: 50px 18px 10px; }',
            '  .lz-guide__features {',
            '    grid-template-columns: repeat(2, 1fr);',
            '    padding: 30px 18px 40px;',
            '  }',
            '  .lz-guide__feat:nth-child(3n+1)::after { display: block; }',
            '  .lz-guide__feat:nth-child(odd)::after { display: none; }',
            '  .lz-guide__feat:nth-child(-n+3)::before { display: block; }',
            '  .lz-guide__feat:nth-child(-n+2)::before { display: none; }',
            '  .lz-guide__feat { padding: 28px 14px; }',
            '  .lz-guide__cta { padding: 40px 18px; }',
            '}'
        ].join('\n');
        document.head.appendChild(s);
    };

    /* ==========================================
       4. 描画
       ========================================== */
    var initCount = 0;
    var init = function () {
        var root = document.getElementById('lz-site-guide');
        if (!root) {
            if (++initCount < 30) setTimeout(init, 100);
            return;
        }
        if (root.getAttribute('data-loaded')) return;
        root.setAttribute('data-loaded', 'true');

        injectStyles();

        var lang = window.LZ_CURRENT_LANG || "ja";
        var d = CONTENT[lang] || CONTENT.ja;

        var featsHtml = d.features.map(function (f) {
            return [
                '<div class="lz-guide__feat">',
                '  <div class="lz-guide__feat-icon">' + (ICONS[f.icon] || '') + '</div>',
                '  <h4 class="lz-guide__feat-title">' + C.esc(f.title) + '</h4>',
                '  <p class="lz-guide__feat-desc">' + C.esc(f.desc) + '</p>',
                '</div>'
            ].join('');
        }).join('');

        root.innerHTML = [

            '<style>',
            '  #lz-site-guide .lz-guide__headline { font-size: clamp(2.2rem, 4.5vw, 3.2rem) !important; color: #5b3a1e !important; font-family: "Zen Kaku Gothic New", "Zen Gothic", sans-serif !important; font-weight: 500 !important; }',
            '  #lz-site-guide .lz-guide__sub { font-size: clamp(1.3rem, 2.2vw, 1.6rem) !important; color: #777 !important; font-family: "Zen Kaku Gothic New", "Zen Gothic", sans-serif !important; font-weight: 400 !important; }',
            '  #lz-site-guide .lz-guide__feat-title { font-size: 1.4rem !important; color: #5b3a1e !important; }',
            '  #lz-site-guide .lz-guide__feat-desc { font-size: 1.15rem !important; color: #999 !important; line-height: 1.6 !important; }',
            '  #lz-site-guide .lz-guide__cta-headline { font-size: clamp(1.8rem, 3.8vw, 2.4rem) !important; color: #5b3a1e !important; }',
            '  #lz-site-guide .lz-guide__cta-sub { font-size: 1.3rem !important; color: #888 !important; }',
            '  #lz-site-guide .lz-guide__cta-btn { font-size: 1.35rem !important; padding: 16px 36px !important; }',
            '</style>',

            '<div class="lz-guide">',
            '  <div class="lz-guide__header">',
            '    <h3 class="lz-guide__headline">' + C.esc(d.headline) + '</h3>',
            '    <p class="lz-guide__sub">' + C.esc(d.sub) + '</p>',
            '  </div>',
            '  <div class="lz-guide__features">' + featsHtml + '</div>',
            '  <div class="lz-guide__cta">',
            '    <h3 class="lz-guide__cta-headline">' + C.esc(d.ctaHeadline) + '</h3>',
            '    <p class="lz-guide__cta-sub">' + C.esc(d.ctaSub) + '</p>',
            '    <a class="lz-guide__cta-btn" href="' + C.esc(d.ctaUrl) + '?lang=' + lang + '">' + C.esc(d.ctaButton) + '</a>',
            '  </div>',
            '</div>'
        ].join('');
    };

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
