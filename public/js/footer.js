/* web/footer.js - 多言語対応・デザイナーズ統合版 */
(async function lzFooterBoot() {
  "use strict";

  var C = window.LZ_COMMON;
  if (!C) return;

  // 1. 二重表示ガード
  if (document.getElementById('lzFooterMain')) return;

  const config = await new Promise(resolve => {
    const check = () => window.LZ_CONFIG ? resolve(window.LZ_CONFIG) : setTimeout(check, 50);
    check();
  });

  const { MENU_ORDER, MENU_URL, FOOTER_LINKS, COPYRIGHT } = config;

  // 2. CSSの注入（変更なし）
  const style = document.createElement('style');
  style.textContent = `
    #lzFooterMain { clear: both !important; width: 100% !important; margin-top: 100px !important; display: block !important; font-family: var(--font-base) !important; }
    .lz-journey { background: var(--soft-red, #fff5f5); padding: 30px 20px; border-top: 1px solid rgba(207, 58, 58, 0.05); text-align: center; }
    .lz-steps { display: flex; justify-content: center; gap: 18px; flex-wrap: wrap; max-width: 1100px; margin: 0 auto; }
    .lz-step {
      position: relative;
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 160px; padding: 18px 32px;
      background: #fff; color: #333; 
      border-radius: 40px;
      font-weight: 700; font-size: 1.3rem; text-decoration: none;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      border: 1px solid rgba(0,0,0,0.02);
    }
    .lz-step:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(207, 58, 58, 0.12);
      color: #cf3a3a;
      padding-bottom: 18px;
    }
    .lz-step::after {
      content: ""; position: absolute; bottom: 12px; width: 0; height: 3px; 
      background: #cf3a3a; border-radius: 10px; transition: width 0.3s ease;
    }
    .lz-step:hover::after { width: 30px; }
    .lz-step.is-current {
      background: rgba(0,0,0,0.03); color: #bbb; border: 1px dashed #ddd;
      box-shadow: none; pointer-events: none; transform: none;
    }
    .lz-step.is-current::after { display: none; }
    .lz-footer { background: #cf3a3a; color: #fff; padding: 80px 20px; }
    .lz-fwrap { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 40px; }
    .lz-fnav { display: flex; flex-wrap: wrap; gap: 20px 40px; justify-content: center; }
    .lz-fnav__link { 
      color: #fff; text-decoration: none; font-weight: 600; font-size: 1.15rem; 
      opacity: 0.9; transition: opacity 0.3s; 
    }
    .lz-fnav__link:hover { opacity: 1; text-decoration: underline; }
    .lz-fcopy { font-size: 1rem; opacity: 0.7; letter-spacing: 0.03em; }
    @media (max-width: 768px) {
      .lz-journey { padding: 24px 16px; }
      .lz-step { min-width: 140px; padding: 14px 20px; font-size: 1.1rem; }
      .lz-footer { padding: 60px 16px; }
      .lz-fnav { gap: 15px 25px; }
    }
  `;
  document.head.appendChild(style);

  // 3. リンクの生成（★多言語対応：言語パラメータの付与とラベルの翻訳）
  const langQuery = `?lang=${window.LZ_CURRENT_LANG}`;

  const journeyLinks = MENU_ORDER.map(label => {
    const baseUrl = MENU_URL[label];
    const targetUrl = baseUrl.startsWith('http') ? baseUrl : location.origin + baseUrl;
    // URLに言語パラメータを付与
    const finalUrl = baseUrl + langQuery;
    return `<a href="${finalUrl}" class="lz-step" data-fullurl="${targetUrl}">${C.T(label)}</a>`;
  }).join('');

  const footerLinks = FOOTER_LINKS.map(item => {
    // 外部サイトでなければ言語パラメータを付与
    const finalUrl = item.url.startsWith('http') && !item.url.includes(location.hostname)
      ? item.url
      : item.url + langQuery;
    return `<a href="${finalUrl}" class="lz-fnav__link">${C.T(item.label)}</a>`;
  }).join('');

  // 4. HTMLの構築（★多言語対応：タイトル文言の翻訳）
  const footerHTML = `
    <div id="lzFooterMain">
      <div class="lz-journey">
        <div class="lz-steps">${journeyLinks}</div>
      </div>
      <footer class="lz-footer">
        <div class="lz-fwrap">
          <nav class="lz-fnav">${footerLinks}</nav>
          <div class="lz-fcopy">${COPYRIGHT}</div>
        </div>
      </footer>
    </div>
  `;

  // 5. 挿入
  document.body.insertAdjacentHTML('beforeend', footerHTML);

  // 6. カレント判定（変更なし）
  const currentUrl = location.href.split(/[?#]/)[0].replace(/\/+$/, '');
  document.querySelectorAll('#lzFooterMain .lz-step').forEach(a => {
    const linkUrl = a.dataset.fullurl.split(/[?#]/)[0].replace(/\/+$/, '');
    if (linkUrl === currentUrl) {
      a.classList.add('is-current');
    }
  });

})();