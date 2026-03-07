/**
 * slideshow.js - スライドショー・コンポーネント (レイアウト保持版)
 */
(function () {
  "use strict";

  const injectStyles = function () {
    if (document.getElementById('lz-slideshow-styles')) return;
    const style = document.createElement('style');
    style.id = 'lz-slideshow-styles';
    style.textContent = `
      /* JS実行前から枠を確保する設定 */
      #lz-slideshow-app {
        width: 100%;
        min-height: 60vh; /* 画像と同じ高さを事前に確保 */
        background: #f5f5f5; /* 読み込み前のプレースホルダー色 */
        display: block;
      }

      .lz-ss-container { position: relative; width: 100%; height: 60vh; overflow: hidden; }
      .lz-ss-item { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0; animation: lz-ss-fade 25s infinite; }
      @keyframes lz-ss-fade { 0% { opacity: 0; } 5% { opacity: 1; } 20% { opacity: 1; } 25% { opacity: 0; } 100% { opacity: 0; } }
      
      .lz-ss-text {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        opacity: 0; color: #fff; text-align: center; z-index: 10; width: 100%; padding: 0 4vw; box-sizing: border-box;
        font-family: var(--font-accent); font-weight: 700; line-height: 1.4;
        font-size: clamp(1.8rem, 4.5vw, 3.2rem);
        text-shadow: 0 0 25px rgba(0,0,0,0.9), 2px 2px 10px rgba(0,0,0,0.6);
        transition: opacity 1.2s ease-out;
        pointer-events: none;
      }
      .lz-ss-text.is-visible { opacity: 1; pointer-events: auto; }

      @media (max-width: 768px) { .lz-ss-text { font-size: clamp(1.6rem, 5.2vw, 2.8rem); line-height: 1.5; } }
    `;
    document.head.appendChild(style);
  };

  const init = function () {
    const root = document.getElementById('lz-slideshow-app');
    if (!root) return;

    // スタイルを先に注入して高さを確保
    injectStyles();

    const lang = window.LZ_CURRENT_LANG || "ja";
    let text = root.getAttribute('data-text-' + lang) || root.getAttribute('data-text') || "";
    const images = JSON.parse(root.getAttribute('data-images') || "[]");

    let html = '<div class="lz-ss-container">';
    html += `<div class="lz-ss-text">${text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>')}</div>`;

    images.forEach((img, i) => {
      html += `<div class="lz-ss-item" style="background-image: url('${img}'); animation-delay: ${i * 5}s;"></div>`;
    });

    html += '</div>';
    root.innerHTML = html;

    const textEl = root.querySelector('.lz-ss-text');
    if (!textEl) return;

    if (images.length > 0) {
      const imgLoader = new Image();
      imgLoader.onload = () => {
        // 1枚目が読み込まれたらスッと文字を出す
        setTimeout(() => {
          textEl.classList.add('is-visible');
        }, 400);
      };
      imgLoader.onerror = () => {
        textEl.classList.add('is-visible');
      };
      imgLoader.src = images[0];
    } else {
      textEl.classList.add('is-visible');
    }
  };

  // 起動（即時実行してスタイルを当てる）
  init();
})();