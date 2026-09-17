/* ==========================================================================
   飯綱町りんごPRWEB - レシピ特設コーナー スクリプト (recipe.js)
   既存サイト（common.js / section.js / modal.js）完全準拠版
   絵文字禁止・色付きピクトグラム(SVG)仕様 & A4公文書印刷エンジン完備
   ========================================================================== */

(function () {
  "use strict";

  let allRecipes = [];
  let currentFilter = "all";
  let activeRecipe = null;

  // DOM Elements
  const gridEl = document.getElementById("rc-grid");
  const filterNavEl = document.getElementById("rc-filter-nav");
  const modalBackdropEl = document.getElementById("rc-modal-backdrop");
  const detailContainerEl = document.getElementById("rc-detail-container");
  const printSheetEl = document.getElementById("rc-print-sheet");

  // ==========================================================================
  // 色付きピクトグラム SVG 定義 (絵文字は一切使用せず統一)
  // ==========================================================================
  const ICONS = {
    appleRed: `<svg class="rc-ico rc-ico-red" viewBox="0 0 24 24" fill="#cf3a3a" width="16" height="16" aria-hidden="true"><path d="M12 2c0 0 .5 2-1 3-1.5 1-3 .5-3 .5s.5-2 2-3 2-.5 2-.5zm6.5 5.5c-1-1-3-1.5-5-1-1 .3-2 1-2.5 1s-1.5-.7-2.5-1c-2-.5-4 0-5 1-2 2-2 7 0 10.5 1 1.8 2.5 3.5 4.5 3.5 1.5 0 2.2-1 3-1s1.5 1 3 1c2 0 3.5-1.7 4.5-3.5 2-3.5 2-8.5 0-10.5z"/></svg>`,
    appleGreen: `<svg class="rc-ico rc-ico-green" viewBox="0 0 24 24" fill="#688e17" width="16" height="16" aria-hidden="true"><path d="M12 2c0 0 .5 2-1 3-1.5 1-3 .5-3 .5s.5-2 2-3 2-.5 2-.5zm6.5 5.5c-1-1-3-1.5-5-1-1 .3-2 1-2.5 1s-1.5-.7-2.5-1c-2-.5-4 0-5 1-2 2-2 7 0 10.5 1 1.8 2.5 3.5 4.5 3.5 1.5 0 2.2-1 3-1s1.5 1 3 1c2 0 3.5-1.7 4.5-3.5 2-3.5 2-8.5 0-10.5z"/></svg>`,
    clock: `<svg class="rc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    users: `<svg class="rc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    author: `<svg class="rc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    bulb: `<svg class="rc-ico rc-ico-gold" viewBox="0 0 24 24" fill="#8c6000" width="18" height="18" aria-hidden="true"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-1.3l-.85-.6C7.8 13.16 7 11.18 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 2.18-.8 4.16-2.15 5.1z"/></svg>`,
    print: `<svg class="rc-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`
  };

  // 1. 初期ロード
  document.addEventListener("DOMContentLoaded", async function () {
    try {
      const res = await fetch("/data/recipes.json");
      if (!res.ok) throw new Error("Failed to load recipes data");
      allRecipes = await res.json();

      initFilters();
      handleInitialUrlParams();
      renderGrid();
      setupEventListeners();
    } catch (err) {
      console.error("Recipe Init Error:", err);
      if (gridEl) {
        gridEl.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px 0; font-size: 1.6rem;">レシピデータの読み込みに失敗しました。</p>`;
      }
    }
  });

  // 2. フィルター集計＆ボタン描画
  function initFilters() {
    const counts = {
      all: allRecipes.length,
      main: 0,
      side: 0,
      dessert: 0,
      bramley: 0,
      quick: 0,
    };

    allRecipes.forEach((r) => {
      const cat = r.category || "";
      const source = r.source || "";
      const time = r.cooking_time || "";

      if (cat.includes("主菜") || cat.includes("肉料理") || cat.includes("カレー") || cat.includes("パスタ") || cat.includes("炒め物") || cat.includes("煮込み") || cat.includes("英国料理")) {
        counts.main++;
      }
      if (cat.includes("副菜") || cat.includes("サラダ") || cat.includes("前菜") || cat.includes("軽食")) {
        counts.side++;
      }
      if (cat.includes("スイーツ") || cat.includes("プリン") || cat.includes("ケーキ") || cat.includes("冷菓") || cat.includes("焼き菓子") || cat.includes("ジャム") || cat.includes("おやつ") || cat.includes("英国伝統菓子")) {
        counts.dessert++;
      }
      if (source.includes("ブラムリー") || r.title.includes("ブラムリー") || (r.slug && r.slug.startsWith("bramley"))) {
        counts.bramley++;
      }
      if (time.includes("10分") || time.includes("15分") || time.includes("20分") || time.includes("3分")) {
        counts.quick++;
      }
    });

    const buttons = [
      { id: "all", label: "すべて", count: counts.all, isBramley: false, icon: "" },
      { id: "bramley", label: "ブラムリーレシピ", count: counts.bramley, isBramley: true, icon: ICONS.appleGreen },
      { id: "main", label: "主菜・肉料理", count: counts.main, isBramley: false, icon: "" },
      { id: "side", label: "副菜・サラダ", count: counts.side, isBramley: false, icon: "" },
      { id: "dessert", label: "スイーツ・おやつ", count: counts.dessert, isBramley: false, icon: "" },
      { id: "quick", label: "20分以内の時短", count: counts.quick, isBramley: false, icon: "" },
    ];

    filterNavEl.innerHTML = buttons
      .map(
        (b) => `
        <button type="button" class="rc-filter-btn ${b.id === currentFilter ? "is-active" : ""} ${b.isBramley ? "is-bramley" : ""}" data-filter="${b.id}">
          ${b.icon ? b.icon + " " : ""}${b.label} <span class="rc-count-pill">${b.count}</span>
        </button>
      `
      )
      .join("");
  }

  // 3. URLパラメータ解析（ディープリンク）
  function handleInitialUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get("filter");
    const idParam = params.get("id");

    if (filterParam && ["all", "main", "side", "dessert", "bramley", "quick"].includes(filterParam)) {
      currentFilter = filterParam;
    }

    if (idParam) {
      const match = allRecipes.find((r) => r.slug === idParam || r.id === idParam);
      if (match) {
        setTimeout(() => openRecipeModal(match, false), 150);
      }
    }
  }

  // 4. レシピカードグリッドの描画（既存 .lz-card 体系）
  function renderGrid() {
    const filtered = allRecipes.filter((r) => {
      const cat = r.category || "";
      const source = r.source || "";
      const time = r.cooking_time || "";
      const isBramley = source.includes("ブラムリー") || r.title.includes("ブラムリー") || (r.slug && r.slug.startsWith("bramley"));

      if (currentFilter === "all") return true;
      if (currentFilter === "bramley") return isBramley;
      if (currentFilter === "main") {
        return cat.includes("主菜") || cat.includes("肉料理") || cat.includes("カレー") || cat.includes("パスタ") || cat.includes("炒め物") || cat.includes("煮込み") || cat.includes("英国料理");
      }
      if (currentFilter === "side") {
        return cat.includes("副菜") || cat.includes("サラダ") || cat.includes("前菜") || cat.includes("軽食");
      }
      if (currentFilter === "dessert") {
        return cat.includes("スイーツ") || cat.includes("プリン") || cat.includes("ケーキ") || cat.includes("冷菓") || cat.includes("焼き菓子") || cat.includes("ジャム") || cat.includes("おやつ") || cat.includes("英国伝統菓子");
      }
      if (currentFilter === "quick") {
        return time.includes("10分") || time.includes("15分") || time.includes("20分") || time.includes("3分");
      }
      return true;
    });

    if (filtered.length === 0) {
      gridEl.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px 0; font-size: 1.6rem;">該当するレシピが見つかりませんでした。</p>`;
      return;
    }

    gridEl.innerHTML = filtered
      .map((r) => {
        const isBramley = r.source.includes("ブラムリー") || r.title.includes("ブラムリー") || (r.slug && r.slug.startsWith("bramley"));
        return `
        <article class="lz-card rc-card" data-slug="${r.slug}" role="button" tabindex="0">
          <div class="lz-media rc-card-media">
            <img src="${r.image_webp}" alt="${escapeHtml(r.title)}" loading="lazy" decoding="async" onerror="this.src='${r.image_jpg}'">
            <span class="rc-badge-cat">${escapeHtml(r.category)}</span>
            ${isBramley ? `<span class="rc-badge-bramley-tag">${ICONS.appleGreen} ブラムリー使用</span>` : ""}
          </div>
          <div class="lz-body rc-card-body">
            <div class="rc-card-meta">
              <span>${ICONS.clock} ${escapeHtml(r.cooking_time)}</span>
              <span>・</span>
              <span>${ICONS.users} ${escapeHtml(r.servings)}</span>
            </div>
            <h3 class="lz-title-sm rc-card-title">${escapeHtml(r.title)}</h3>
            <p class="lz-lead rc-card-lead">${escapeHtml(r.description || "")}</p>
            <div class="rc-card-footer">
              <span class="rc-card-author">${escapeHtml(r.author || "")}</span>
              <span class="rc-card-link-text">レシピを見る →</span>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  }

  // 5. モーダル展開（既存 modal.js と完全調和するレイアウト）
  function openRecipeModal(recipe, updateUrl = true) {
    activeRecipe = recipe;
    const isBramley = recipe.source.includes("ブラムリー") || recipe.title.includes("ブラムリー") || (recipe.slug && recipe.slug.startsWith("bramley"));

    // ディープリンクURL同期
    if (updateUrl) {
      const newUrl = `/recipe?id=${encodeURIComponent(recipe.slug)}`;
      history.pushState({ modalOpen: true, slug: recipe.slug }, "", newUrl);
    }

    document.title = `${recipe.title} | りんごレシピ集 | りんごのまちいいづな`;
    injectStructuredData(recipe);

    const shareUrl = `${window.location.origin}/recipe?id=${encodeURIComponent(recipe.slug)}`;

    detailContainerEl.innerHTML = `
      <div class="${isBramley ? "is-bramley-modal" : ""}">
        <!-- モーダルヘッダー (.lz-mh 互換) -->
        <div class="lz-mh rc-modal-header">
          <div>
            <nav class="lz-modal-breadcrumb rc-modal-breadcrumb" aria-label="パンくずリスト">
              <a href="/">ホーム</a>
              <span class="lz-bc-sep">/</span>
              <a href="/savor">味わう</a>
              <span class="lz-bc-sep">/</span>
              <a href="/recipe">りんごレシピ</a>
              ${isBramley ? `<span class="lz-bc-sep">/</span><span style="color: #557512; font-weight:700;">ブラムリー</span>` : ""}
            </nav>
            <h2 class="lz-mt rc-modal-title">${escapeHtml(recipe.title)}</h2>
          </div>
          <div class="lz-actions rc-modal-actions">
            <button type="button" class="lz-btn rc-modal-btn" id="rc-modal-print-btn" title="A4印刷">
              ${ICONS.print}
              <span class="lz-label rc-btn-label">印刷</span>
            </button>
            <button type="button" class="lz-btn lz-share rc-modal-btn rc-share-btn" id="rc-modal-share-btn" title="共有">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              <span class="lz-label rc-btn-label">共有</span>
            </button>
            <button type="button" class="lz-btn rc-modal-btn" id="rc-modal-close-trigger" title="閉じる">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              <span class="lz-label rc-btn-label">閉じる</span>
            </button>
          </div>
        </div>

        <!-- モーダルコンテンツ (.lz-modal-content 互換) -->
        <div class="lz-modal-content rc-modal-content-wrap">
          <!-- 左カラム：写真・情報リスト -->
          <div class="lz-modal-left rc-modal-left">
            <div class="rc-modal-photo">
              <img src="${recipe.image_webp}" alt="${escapeHtml(recipe.title)}" onerror="this.src='${recipe.image_jpg}'">
            </div>
            
            <div class="lz-info-list rc-modal-infolist">
              <div class="lz-info-item rc-modal-infoitem">
                <span class="lz-info-label rc-modal-infolabel">調理時間目安</span>
                <span class="lz-info-val rc-modal-infoval">${ICONS.clock} ${escapeHtml(recipe.cooking_time)}</span>
              </div>
              <div class="lz-info-item rc-modal-infoitem">
                <span class="lz-info-label rc-modal-infolabel">分量</span>
                <span class="lz-info-val rc-modal-infoval">${ICONS.users} ${escapeHtml(recipe.servings)}</span>
              </div>
              <div class="lz-info-item rc-modal-infoitem">
                <span class="lz-info-label rc-modal-infolabel">レシピ考案・研究</span>
                <span class="lz-info-val rc-modal-infoval">${ICONS.author} ${escapeHtml(recipe.author)}</span>
              </div>
            </div>
          </div>

          <!-- 右カラム：材料・手順・ポイント・CTA -->
          <div class="lz-modal-right rc-modal-right">
            <div class="lz-lead-strong rc-modal-lead">${escapeHtml(recipe.description)}</div>

            <!-- 材料表 -->
            <div class="rc-ingredients-card">
              <h3 class="rc-section-head-sm">
                材料リスト <span class="rc-ing-subtext">（クリックでチェック）</span>
              </h3>
              <ul class="rc-ing-table" id="rc-ing-table">
                ${recipe.ingredients
                  .map(
                    (ing) => `
                  <li class="rc-ing-row">
                    <label style="display:flex; align-items:center; flex-grow:1; cursor:pointer;">
                      <input type="checkbox" class="rc-ing-chk">
                      <span>${escapeHtml(ing.name)}</span>
                    </label>
                    <span class="rc-ing-val">${escapeHtml(ing.amount)}</span>
                  </li>
                `
                  )
                  .join("")}
              </ul>
            </div>

            <!-- 作り方手順 -->
            <div class="rc-steps-wrapper">
              <h3 class="rc-section-head-sm" style="border-bottom: 2px solid rgba(231,211,200,0.5); padding-bottom: 8px;">
                作り方
              </h3>
              ${recipe.steps
                .map(
                  (step, idx) => `
                <div class="rc-step-row">
                  <div class="rc-step-badge">${idx + 1}</div>
                  <div class="rc-step-desc">${escapeHtml(step)}</div>
                </div>
              `
                )
                .join("")}
            </div>

            <!-- ポイントハイライト -->
            ${
              recipe.points && recipe.points.length > 0
                ? `
              <div class="rc-points-callout">
                <div class="rc-points-head">${ICONS.bulb} 美味しく作るポイント・コツ</div>
                <ul class="rc-points-body">
                  ${recipe.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
                </ul>
              </div>
            `
                : ""
            }

            <!-- 相互リンクCTAバナー -->
            <div class="rc-modal-cta ${isBramley ? "is-bramley-cta" : ""}">
              <div>
                <h4 class="rc-cta-heading">${isBramley ? `${ICONS.appleGreen} 英国生まれの青りんご「ブラムリー」をもっと知る` : `${ICONS.appleRed} 採れたての飯綱町産りんごを味わう`}</h4>
                <p class="rc-cta-p">${isBramley ? "酸味の王様ブラムリーの歴史や町内での取り組み、品種の特徴をご紹介しています。" : "飯綱町内の直売所や、愛情を込めて育てる生産者・農園情報をご案内します。"}</p>
              </div>
              ${
                isBramley
                  ? `
                <a href="/article/%E3%83%96%E3%83%A9%E3%83%A0%E3%83%AA%E3%83%BC%E3%82%BA%E3%83%BB%E3%82%B7%E3%83%BC%E3%83%89%E3%83%AA%E3%83%B3%E3%82%B0?lang=ja" class="rc-cta-action-btn is-green">
                  品種紹介を見る →
                </a>
              `
                  : `
                <a href="/savor" class="rc-cta-action-btn">
                  直売所・生産者を見る →
                </a>
              `
              }
            </div>
          </div>
        </div>
      </div>
    `;

    // 材料チェックボックスのイベントリスナー
    detailContainerEl.querySelectorAll(".rc-ing-chk").forEach((chk) => {
      chk.addEventListener("change", function () {
        const row = this.closest(".rc-ing-row");
        if (row) {
          if (this.checked) {
            row.classList.add("is-done");
          } else {
            row.classList.remove("is-done");
          }
        }
      });
    });

    // A4 印刷ボタンのイベントリスナー（画像ロード＆デコード完了を待ってから印刷）
    detailContainerEl.querySelector("#rc-modal-print-btn")?.addEventListener("click", async () => {
      const btn = detailContainerEl.querySelector("#rc-modal-print-btn");
      const label = btn?.querySelector(".rc-btn-label");
      if (btn) btn.style.opacity = "0.5";
      if (label) label.textContent = "準備中...";
      try {
        await printRecipeA4(recipe);
      } finally {
        if (btn) btn.style.opacity = "1";
        if (label) label.textContent = "印刷";
      }
    });

    // 共有ボタンのイベントリスナー（modal.js 互換 Web Share API & コピー）
    detailContainerEl.querySelector("#rc-modal-share-btn")?.addEventListener("click", async () => {
      const pageShareUrl = `${window.location.origin}/recipe?id=${encodeURIComponent(recipe.slug)}`;
      const payload = [
        `【飯綱町りんごレシピ】${recipe.title}`,
        recipe.description,
        "ーーー",
        "詳しくはこちら:",
        pageShareUrl,
        "",
        "#飯綱町 #りんごレシピ #長野県"
      ].filter(Boolean).join("\n");

      if (navigator.share) {
        try {
          await navigator.share({
            title: `${recipe.title} | 飯綱町りんごレシピ`,
            text: payload,
            url: pageShareUrl,
          });
        } catch (e) {
          // ユーザーキャンセル時はスキップ
        }
      } else {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(payload);
          } else {
            const ta = document.createElement("textarea");
            ta.value = payload;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
          }
          alert("共有テキストとURLをコピーしました！");
        } catch (err) {
          alert("コピーに失敗しました。URL: " + pageShareUrl);
        }
      }
    });

    // 閉じるボタンのイベントリスナー
    detailContainerEl.querySelector("#rc-modal-close-trigger")?.addEventListener("click", () => {
      closeRecipeModal();
    });

    // モーダルを開く
    modalBackdropEl.classList.add("rc-modal-open");
    modalBackdropEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // モーダル展開と同時に、印刷シートを画面外で先行構築（画像の事前取得＆デコード完了を保証）
    setupPrintSheet(recipe);
  }

  // ==========================================================================
  // 6. A4 規格公文書・公式レシピカード印刷エンジン (civic-report-pdf-engine 準拠)
  // ==========================================================================

  // 印刷シートの先行構築（画面外に配置された #rc-print-sheet に流し込み、画像ロードを開始）
  function setupPrintSheet(recipe) {
    if (!printSheetEl) return;

    const isBramley = recipe.source.includes("ブラムリー") || recipe.title.includes("ブラムリー") || (recipe.slug && recipe.slug.startsWith("bramley"));
    const todayStr = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    // ChromiumのPDF/印刷レンダラはWebPで白抜けを起こす既知不具合があるため、印刷時はJPEGを最優先
    const primaryImgSrc = recipe.image_jpg || recipe.image_webp;

    printSheetEl.innerHTML = `
      <div class="ps-header ${isBramley ? "is-bramley" : ""}">
        <div class="ps-logo-group">
          ${isBramley ? ICONS.appleGreen : ICONS.appleRed}
          <span class="ps-logo-title">長野県飯綱町 りんごレシピ</span>
        </div>
        <div class="ps-issuer">
          りんごのまちいいづな 公式PRポータル（出力日: ${todayStr}）
        </div>
      </div>

      <div class="ps-title-wrap">
        <span class="ps-cat-tag ${isBramley ? "is-bramley" : ""}">${escapeHtml(recipe.category)}</span>
        <h1 class="ps-title">${escapeHtml(recipe.title)}</h1>
        <div class="ps-meta-bar">
          <span>調理時間: ${escapeHtml(recipe.cooking_time)}</span>
          <span>分量: ${escapeHtml(recipe.servings)}</span>
          <span>考案・研究: ${escapeHtml(recipe.author)}</span>
        </div>
        <div class="ps-lead">${escapeHtml(recipe.description)}</div>
      </div>

      <div class="ps-body-grid">
        <!-- 左カラム：写真・ポイント -->
        <div class="ps-col-left">
          <img class="ps-photo" id="rc-print-img" src="${primaryImgSrc}" alt="${escapeHtml(recipe.title)}">
          ${
            recipe.points && recipe.points.length > 0
              ? `
            <div class="ps-point-box">
              <div class="ps-point-head">美味しく作るポイント・コツ</div>
              <ul class="ps-point-list">
                ${recipe.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }
        </div>

        <!-- 右カラム：材料・作り方 -->
        <div class="ps-col-right">
          <h2 class="ps-sec-head">材料と分量</h2>
          <table class="ps-ing-table">
            <tbody>
              ${recipe.ingredients
                .map(
                  (ing) => `
                <tr>
                  <td class="ps-ing-name">${escapeHtml(ing.name)}</td>
                  <td class="ps-ing-amount">${escapeHtml(ing.amount)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <h2 class="ps-sec-head">作り方</h2>
          <div class="ps-steps">
            ${recipe.steps
              .map(
                (step, idx) => `
              <div class="ps-step-item ${isBramley ? "is-bramley" : ""}">
                <div class="ps-step-num">${idx + 1}</div>
                <div class="ps-step-text">${escapeHtml(step)}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </div>

      <div class="ps-footer">
        <span>長野県飯綱町 産業観光課 / 共同研究: 長野県立大学 食健康学科</span>
        <span>公式ポータルサイト: https://appletown-iizuna.com/recipe/</span>
      </div>
    `;
  }

  // 印刷ボタン押下時の実行処理
  async function printRecipeA4(recipe) {
    if (!printSheetEl) return;

    // まだセットアップされていない、または別のレシピの場合は再セットアップ
    setupPrintSheet(recipe);

    // 印刷画像の完全ロードおよびデコード完了を待機
    const printImg = document.getElementById("rc-print-img");
    if (printImg) {
      if (!printImg.complete) {
        await new Promise((resolve) => {
          printImg.onload = resolve;
          printImg.onerror = () => {
            if (recipe.image_webp && printImg.src !== recipe.image_webp) {
              printImg.src = recipe.image_webp;
              printImg.onload = resolve;
              printImg.onerror = resolve;
            } else {
              resolve();
            }
          };
          setTimeout(resolve, 1200);
        });
      }
      if (printImg.decode) {
        try {
          await printImg.decode();
        } catch (e) {
          // デコード警告時はスキップ
        }
      }
    }

    // レンダリング描画が印刷コンテキストに反映されるまで確実に待機
    await new Promise((r) => setTimeout(r, 200));

    // 印刷実行
    window.print();
  }

  // 7. モーダルを閉じる
  function closeRecipeModal() {
    modalBackdropEl.classList.remove("rc-modal-open");
    modalBackdropEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    activeRecipe = null;

    // URLを戻す
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.has("id")) {
      currentParams.delete("id");
      const newQuery = currentParams.toString();
      const newUrl = newQuery ? `/recipe?${newQuery}` : "/recipe";
      history.pushState(null, "", newUrl);
    }
    document.title = "飯綱町りんごレシピ集｜りんごのまちいいづな";
  }

  // 8. イベントリスナー統合
  function setupEventListeners() {
    // フィルターボタン切り替え
    filterNavEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".rc-filter-btn");
      if (!btn) return;
      const filterId = btn.getAttribute("data-filter");
      if (filterId === currentFilter) return;

      currentFilter = filterId;
      filterNavEl.querySelectorAll(".rc-filter-btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      // URLパラメータ同期
      const params = new URLSearchParams(window.location.search);
      if (currentFilter === "all") {
        params.delete("filter");
      } else {
        params.set("filter", currentFilter);
      }
      const newQuery = params.toString();
      const newUrl = newQuery ? `/recipe?${newQuery}` : "/recipe";
      history.replaceState(null, "", newUrl);

      renderGrid();
    });

    // レシピカードクリックでモーダルオープン
    gridEl.addEventListener("click", (e) => {
      const card = e.target.closest(".rc-card");
      if (!card) return;
      const slug = card.getAttribute("data-slug");
      const recipe = allRecipes.find((r) => r.slug === slug);
      if (recipe) {
        openRecipeModal(recipe, true);
      }
    });

    // キーボード操作（Enter / Space）でモーダルオープン
    gridEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const card = e.target.closest(".rc-card");
        if (!card) return;
        e.preventDefault();
        const slug = card.getAttribute("data-slug");
        const recipe = allRecipes.find((r) => r.slug === slug);
        if (recipe) {
          openRecipeModal(recipe, true);
        }
      }
    });

    // 背景クリックでモーダルを閉じる
    modalBackdropEl.addEventListener("click", (e) => {
      if (e.target === modalBackdropEl || e.target.classList.contains("lz-shell")) {
        closeRecipeModal();
      }
    });

    // ESCキーでモーダルを閉じる
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalBackdropEl.classList.contains("rc-modal-open")) {
        closeRecipeModal();
      }
    });

    // ブラウザの戻る・進むボタン連動
    window.addEventListener("popstate", () => {
      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id");
      const filterParam = params.get("filter") || "all";

      if (filterParam !== currentFilter) {
        currentFilter = filterParam;
        filterNavEl.querySelectorAll(".rc-filter-btn").forEach((b) => {
          b.classList.toggle("is-active", b.getAttribute("data-filter") === currentFilter);
        });
        renderGrid();
      }

      if (idParam) {
        const match = allRecipes.find((r) => r.slug === idParam || r.id === idParam);
        if (match) openRecipeModal(match, false);
      } else {
        if (modalBackdropEl.classList.contains("rc-modal-open")) {
          modalBackdropEl.classList.remove("rc-modal-open");
          modalBackdropEl.setAttribute("aria-hidden", "true");
          document.body.style.overflow = "";
        }
      }
    });
  }

  // 9. Google Recipe 構造化データ (JSON-LD) 注入
  function injectStructuredData(recipe) {
    const existingScript = document.getElementById("rc-recipe-schema");
    if (existingScript) existingScript.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": "Recipe",
      name: recipe.title,
      image: [recipe.image_webp, recipe.image_jpg],
      author: {
        "@type": "Person",
        name: recipe.author,
      },
      datePublished: "2026-09-17",
      description: recipe.description,
      recipeCategory: recipe.category,
      recipeCuisine: recipe.title.includes("ブラムリー") ? "British" : "Japanese",
      keywords: `飯綱町, りんごレシピ, ${recipe.category}, ${recipe.title.includes("ブラムリー") ? "ブラムリー, クッキングアップル" : "信州りんご"}`,
      recipeYield: recipe.servings,
      totalTime: convertToIsoDuration(recipe.cooking_time),
      recipeIngredient: recipe.ingredients.map((i) => `${i.name} ${i.amount}`),
      recipeInstructions: recipe.steps.map((s, idx) => ({
        "@type": "HowToStep",
        position: idx + 1,
        text: s,
      })),
      publisher: {
        "@type": "GovernmentOrganization",
        name: "飯綱町",
        url: "https://appletown-iizuna.com/",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "rc-recipe-schema";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  // ISO 8601 Duration 変換ヘルパー
  function convertToIsoDuration(str) {
    if (!str) return "PT20M";
    const num = parseInt(str.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? "PT20M" : `PT${num}M`;
  }

  // HTMLエスケープヘルパー
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
