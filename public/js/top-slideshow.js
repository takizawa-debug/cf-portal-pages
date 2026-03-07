/**
 * top-slideshow.js - トップページ専用：左右チラ見せフェードスライドショー
 */
(function () {
  "use strict";

  const C = window.LZ_COMMON;
  if (!C) return;

  const injectStyles = function () {
    if (document.getElementById('lz-top-ss-styles')) return;
    const style = document.createElement('style');
    style.id = 'lz-top-ss-styles';
    style.textContent = `
      .appletown-hero {
        --radius: 14px; --gap: 16px; --gap-vertical: 16px; --dim: .30; --frameW: 0px;
        position: relative; width: 100%; overflow: hidden; isolation: isolate;
        height: calc(clamp(260px, 45vw, 675px) + var(--gap-vertical) * 2);
        padding-block: var(--gap-vertical);
        background: #fff;
      }
      .peek { position: absolute; top: var(--gap-vertical); height: calc(100% - var(--gap-vertical) * 2); width: calc((100% - var(--frameW)) / 2 - var(--gap)); pointer-events: none; overflow: hidden; z-index: 1; }
      .peek-left { left: 0; border-radius: 0 var(--radius) var(--radius) 0; }
      .peek-right { right:0; border-radius: var(--radius) 0 0 var(--radius); }
      .peek-layer { position: absolute; inset: 0; opacity: 0; background: center / cover no-repeat; transition: opacity 2000ms ease; }
      .peek-layer.is-visible { opacity: 1; }
      .peek-left .peek-layer { background-position: right center; }
      .peek-right .peek-layer { background-position: left center; }
      .peek .peek-dim { position:absolute; inset:0; background: rgba(0,0,0,var(--dim)); mix-blend-mode: multiply; border-radius: inherit; }
      .hero-frame { position: absolute; width: min(80vw, 1200px); aspect-ratio: 16 / 9; border-radius: var(--radius); left:50%; top:50%; transform: translate(-50%, -50%); overflow: hidden; z-index: 2; background: #eee; }
      .hero { position:absolute; inset:0; opacity:0; background: center / cover no-repeat; transition: opacity 2000ms ease; }
      .hero.is-visible { opacity: 1; }
      .logoOverlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:flex-start; z-index: 3; pointer-events: none; padding-left: clamp(4vw, 10vw, 14vw); padding-right: 2.5vw; }
      .logoBlock { display:flex; align-items:center; gap: clamp(2px, .6vw, 10px); width: min(92%, 980px); filter: drop-shadow(0 2px 8px rgba(0,0,0,.35)); }
      .logoDrawWrapper { width: clamp(120px, 18vw, 260px); max-width: 40vw; }
      .logoDrawWrapper svg { display:block; width: 100%; height: auto;}
      .draw { fill:none; stroke:#fff; stroke-width:14; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray: 1; stroke-dashoffset: 1; animation: logoDraw 2600ms ease forwards; }
      @keyframes logoDraw { to { stroke-dashoffset:0; } }
      .logoType { display:flex; flex-direction:column; align-items:flex-start; text-align:left; color:#fff; line-height:1.08; opacity: 0; transition: opacity 1200ms ease-in-out; font-family: var(--font-accent); }
      .logoType.show { opacity: 1; }
      .logoType > div:nth-child(1) { font-weight: 500; font-size: clamp(1.3rem, 2.6vw, 2.6rem); opacity: .95; margin-bottom: .2em; }
      .logoType > div:nth-child(2), .logoType > div:nth-child(3) { font-weight: 700; letter-spacing: .01em; font-size: clamp(3.2rem, 6.2vw, 5.2rem); line-height: 1.02; }
      @media (min-width: 1200px) { .logoType > div:nth-child(2), .logoType > div:nth-child(3) { font-size: clamp(4.2rem, 6vw, 7.2rem); } }
      @media (max-width: 767px) {
        .appletown-hero { margin-top: 46px !important; height:auto !important; padding:0 !important; }
        .appletown-hero .peek { display:none !important; }
        .hero-frame { position: relative !important; left:0 !important; top:0 !important; transform:none !important; width:100% !important; aspect-ratio: 16 / 9 !important; border-radius: 0 !important; }
        .logoOverlay { position:absolute; inset:0; display:flex; justify-content:center; align-items:center; padding: 4vw; }
        .logoBlock { flex-direction: row !important; justify-content:center; align-items:center; gap: 2.5vw; width:94%; }
        .logoDrawWrapper { width: clamp(70px, 26vw, 160px) !important; }
        .logoType > div:nth-child(1) { font-size: clamp(1rem, 3.6vw, 1.6rem) !important; }
        .logoType > div:nth-child(2), .logoType > div:nth-child(3) { font-size: clamp(2.2rem, 7.2vw, 3.6rem) !important; line-height: 1.05; }
      }
    `;
    document.head.appendChild(style);
  };

  const init = function () {
    const root = document.getElementById('lz-top-slideshow');
    if (!root) return;

    injectStyles();

    const images = JSON.parse(root.getAttribute('data-images') || "[]");
    const lang = window.LZ_CURRENT_LANG || "ja";

    // 多言語テキスト設定
    const texts = {
      ja: ["飯綱町産りんごポータルサイト", "りんごのまち", "いいづな"],
      en: ["Iizuna Apple Portal Site", "Appletown", "Iizuna"],
      zh: ["飯綱町蘋果入口網站", "苹果小镇", "飯綱"]
    }[lang] || ["Iizuna Apple Portal Site", "Appletown", "Iizuna"];

    root.className = "appletown-hero";
    root.innerHTML = `
      <div class="peek peek-left" aria-hidden="true">
        <div class="peek-layer leftA is-visible"></div><div class="peek-layer leftB"></div><div class="peek-dim"></div>
      </div>
      <div class="peek peek-right" aria-hidden="true">
        <div class="peek-layer rightA is-visible"></div><div class="peek-layer rightB"></div><div class="peek-dim"></div>
      </div>
      <div class="hero-frame">
        <div class="hero heroA is-visible"></div><div class="hero heroB"></div>
        <div class="logoOverlay"><div class="logoBlock">
          <div class="logoDrawWrapper">
            <svg id="logoSvg2" width="100%" preserveaspectratio="xMidYMid meet" aria-label="logo-mark">
              <path id="logoPath2" class="draw" d="M287.04,32.3c.29.17,1.01.63,1.46,1.55.57,1.19.29,2.29.2,2.57-7.08,18.09-14.18,36.17-21.26,54.26,5.96-.91,14.77-2.45,25.28-5.06,17.98-4.45,22.46-7.44,33.44-9.85,18.59-4.08,33.88-1.67,44.51,0,21.1,3.32,37.42,10.74,47.91,16.6-4.08,8.59-11.1,20.05-23.06,29.99-18.47,15.35-38.46,18.54-52.07,20.7-7.55,1.21-21.61,3.32-39.12.24-13.71-2.41-11-4.76-30.72-9.36-6.73-1.56-12.82-2.64-17.98-7.87-3.73-3.77-4.92-7.63-6.74-7.3-2.44.43-1.84,7.58-4.5,16.85-.98,3.46-5.56,19.45-14.05,21.35-5.5,1.23-9.85-4.07-17.02-9.79-17.52-13.96-36.26-17.94-45.91-19.99-7.62-1.62-25.33-5.16-45.19,1.36-6.6,2.17-19.57,7.82-35.2,23.74-48.04,48.93-49.39,127.17-49.69,143.97-.08,5-.47,48.18,16.56,90.06,6.63,16.3,14.21,28.27,24.85,38.3,4.2,3.97,12.19,11.37,24.85,16.56,13.72,5.63,26.8,6.15,31.06,6.21,8.06.12,9.06-1.03,14.49,0,10.22,1.95,13.47,7.33,22.77,12.42,10.16,5.56,19.45,6.3,30.02,7.25,8.15.73,18.56,1.67,31.15-1.99,9.83-2.85,16.44-7.18,25.24-12.93,2.47-1.61,9.94-6.61,20.55-16.18,12.76-11.51,21.35-21.79,25.53-26.87,26.39-32.12,39.71-48.12,50.73-71.43,12.87-27.23,17.2-49.56,18.63-57.97,3.23-18.95,5.82-35.27,0-54.87-2.24-7.54-6.98-23.94-21.74-37.27-5.26-4.76-12.9-11.66-24.85-13.46-17.04-2.58-30.24,7.19-33.13,9.32-9.71,7.17-13.91,16.56-21.93,35.04-1.81,4.19-8.26,19.38-14.31,43.63-2.82,11.32-6.43,25.97-8.28,45.55-1.47,15.61-3.27,34.6,1.04,59.01,4.92,27.9,15.01,47.01,17.6,51.76,5.58,10.26,12.02,21.83,24.85,33.13,6.45,5.69,17.55,15.24,35.2,19.77,19.17,4.92,34.7.98,38.3,0,14.29-3.9,24.02-11.27,28.99-15.63"></path>
            </svg>
          </div>
          <div class="logoType">
            <div>${texts[0]}</div>
            <div>${texts[1]}</div>
            <div>${texts[2]}</div>
          </div>
        </div></div>
      </div>`;

    const frame = root.querySelector('.hero-frame');
    const heroA = frame.querySelector('.heroA');
    const heroB = frame.querySelector('.heroB');
    const leftA = root.querySelector('.peek-left .leftA');
    const leftB = root.querySelector('.peek-left .leftB');
    const rightA = root.querySelector('.peek-right .rightA');
    const rightB = root.querySelector('.peek-right .rightB');
    const svg = document.getElementById('logoSvg2');
    const path = document.getElementById('logoPath2');
    const logoType = root.querySelector('.logoType');

    function updateFrameWidthVar() {
      root.style.setProperty('--frameW', frame.getBoundingClientRect().width + 'px');
    }

    function loadImage(url) {
      return new Promise((res) => { const img = new Image(); img.onload = () => res(url); img.src = url; });
    }

    async function fadeTo(backEl, frontEl, url, immediate) {
      await loadImage(url);
      backEl.style.backgroundImage = `url("${url}")`;
      if (immediate) { backEl.classList.add('is-visible'); frontEl.classList.remove('is-visible'); }
      else { requestAnimationFrame(() => { backEl.classList.add('is-visible'); frontEl.classList.remove('is-visible'); }); }
    }

    let index = 0, useA_main = true, useA_left = true, useA_right = true;

    async function tick(immediate = false) {
      const url = images[index];
      const prev = images[(index - 1 + images.length) % images.length];
      const next = images[(index + 1) % images.length];

      // Main
      const mFront = useA_main ? heroA : heroB; const mBack = useA_main ? heroB : heroA;
      fadeTo(mBack, mFront, url, immediate); useA_main = !useA_main;
      // Peeks
      const lf = useA_left ? leftA : leftB; const lb = useA_left ? leftB : leftA;
      fadeTo(lb, lf, prev, immediate); useA_left = !useA_left;
      const rf = useA_right ? rightA : rightB; const rb = useA_right ? rightB : rightA;
      fadeTo(rb, rf, next, immediate); useA_right = !useA_right;
    }

    // SVG ViewBox setup
    if (svg && path) {
      const bb = path.getBBox();
      const pad = 16;
      svg.setAttribute('viewBox', `${bb.x - pad} ${bb.y - pad} ${bb.width + pad * 2} ${bb.height + pad * 2}`);
      if (path.getTotalLength) {
        const L = path.getTotalLength();
        path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
      }
      path.addEventListener('animationend', () => logoType.classList.add('show'), { once: true });
    }

    updateFrameWidthVar();
    tick(true);
    let timer = setInterval(() => { index = (index + 1) % images.length; tick(); }, 5000);

    window.addEventListener('resize', updateFrameWidthVar, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearInterval(timer);
      else timer = setInterval(() => { index = (index + 1) % images.length; tick(); }, 5000);
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();