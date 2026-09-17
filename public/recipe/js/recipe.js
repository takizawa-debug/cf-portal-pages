/* ==========================================================================
   飯綱町りんごPRWEB - レシピ特設コーナー スクリプト (recipe.js)
   多言語対応（日本語・English・繁體中文）完全対応版
   事典データ（apple_varieties & seo_keywords）完全準拠
   絵文字禁止・色付きピクトグラム(SVG)仕様 & A4公文書印刷エンジン完備
   ========================================================================== */

(function () {
  "use strict";

  let allRecipes = [];
  let currentFilter = "all";
  let activeRecipe = null;
  let currentLang = "ja";
  let activeModalLang = "ja";

  // DOM Elements
  const gridEl = document.getElementById("rc-grid");
  const filterNavEl = document.getElementById("rc-filter-nav");
  const modalBackdropEl = document.getElementById("rc-modal-backdrop");
  const detailContainerEl = document.getElementById("rc-detail-container");
  const printSheetEl = document.getElementById("rc-print-sheet");

  // ==========================================================================
  // 多言語UI辞書 (事典情報・飯綱町公式トーン完全準拠)
  // ==========================================================================
  const RECIPE_I18N = {
    ja: {
      pageTitle: "飯綱町りんごレシピ集｜りんごのまちいいづな",
      headTitle: "りんごレシピ集",
      introText: `長野県立大学 食健康学科と、人気カフェ・英国菓子研究家が考案した飯綱町公式のレシピ集です。<br>毎日の食卓を彩るおかずやサラダから、英国生まれの酸っぱい青りんご「ブラムリー」を使った本格料理まで。<br>信州・飯綱町の大地が育んだりんごの豊かな風味と食感を、ぜひご家庭でお楽しみください。`,
      breadcrumbHome: "ホーム",
      breadcrumbSavor: "味わう",
      breadcrumbRecipe: "りんごレシピ",
      viewRecipe: "レシピを見る →",
      noRecipes: "該当するレシピが見つかりませんでした。",
      bramleyBadge: "ブラムリー使用",
      filters: {
        all: "すべて",
        bramley: "ブラムリーレシピ",
        main: "主菜・肉料理",
        side: "副菜・サラダ",
        dessert: "スイーツ・おやつ",
        quick: "20分以内の時短",
      },
      modal: {
        print: "印刷",
        share: "共有",
        close: "閉じる",
        timeLabel: "調理時間目安",
        servingsLabel: "分量",
        authorLabel: "レシピ考案・研究",
        ingredientsHead: "材料リスト",
        ingredientsCheckSub: "（クリックでチェック）",
        stepsHead: "作り方",
        pointsHead: "美味しく作るポイント・コツ",
        bramleyCtaHead: "英国生まれの青りんご「ブラムリー」をもっと知る",
        bramleyCtaDesc: "酸味の王様ブラムリーの歴史や町内での取り組み、品種の特徴をご紹介しています。",
        bramleyCtaBtn: "品種紹介を見る →",
        appleCtaHead: "採れたての飯綱町産りんごを味わう",
        appleCtaDesc: "飯綱町内の直売所や、愛情を込めて育てる生産者・農園情報をご案内します。",
        appleCtaBtn: "直売所・生産者を見る →",
        copied: "共有テキストとURLをコピーしました！",
        copyFail: "コピーに失敗しました。URL: ",
        shareHeader: "【飯綱町りんごレシピ】",
        readMore: "詳しくはこちら:",
        hashtags: "#飯綱町 #りんごレシピ #長野県"
      },
      print: {
        subTitle: "長野県飯綱町 りんごレシピ",
        issuer: "りんごのまちいいづな 公式PRポータル（出力日: {date}）",
        time: "調理時間: ",
        servings: "分量: ",
        author: "考案・研究: ",
        pointsHead: "美味しく作るポイント・コツ",
        ingredientsHead: "材料",
        stepsHead: "作り方",
        footerOrg: "長野県飯綱町 産業観光課 / 共同研究: 長野県立大学 健康発達学部 食健康学科",
        footerUrl: "公式ポータルサイト: https://appletown-iizuna.com/recipe/",
      }
    },
    en: {
      pageTitle: "Iizuna Apple Recipes | Town of Apples, Iizuna",
      headTitle: "Apple Recipes",
      introText: `Official apple recipe collection curated in collaboration with Nagano Prefectural University Faculty of Health and Nutrition, local cafes, and British pastry specialists.<br>From everyday savory mains and salads to exquisite gourmet dishes featuring Britain's iconic cooking apple, Bramley's Seedling.<br>Enjoy the rich aromas and distinctive flavors of apples nurtured by the pristine soil and climate of Iizuna Town.`,
      breadcrumbHome: "Home",
      breadcrumbSavor: "Savor",
      breadcrumbRecipe: "Apple Recipes",
      viewRecipe: "View Recipe →",
      noRecipes: "No recipes found matching your criteria.",
      bramleyBadge: "With Bramley",
      filters: {
        all: "All",
        bramley: "Bramley Recipes",
        main: "Main: Meat",
        side: "Side Dish & Salad",
        dessert: "Sweets & Desserts",
        quick: "Quick (Under 20 min)",
      },
      modal: {
        print: "Print",
        share: "Share",
        close: "Close",
        timeLabel: "Est. Time",
        servingsLabel: "Yield",
        authorLabel: "Created / Researched by",
        ingredientsHead: "Ingredients",
        ingredientsCheckSub: "(Tap to check)",
        stepsHead: "Directions",
        pointsHead: "Chef's Tips & Highlights",
        bramleyCtaHead: "Discover British Bramley Cooking Apples",
        bramleyCtaDesc: "Learn about the heritage, local cultivation, and tart culinary profile of Bramley's Seedling in Iizuna Town.",
        bramleyCtaBtn: "Explore Variety Profile →",
        appleCtaHead: "Taste Fresh Apples from Iizuna Town",
        appleCtaDesc: "Find local farm direct stands, apple orchards, and passionate growers in Iizuna Town.",
        appleCtaBtn: "Find Farm Stands & Growers →",
        copied: "Copied recipe text and link to clipboard!",
        copyFail: "Failed to copy. URL: ",
        shareHeader: "[Iizuna Town Apple Recipe]",
        readMore: "Read full recipe:",
        hashtags: "#IizunaApples #AppleRecipes #NaganoJapan"
      },
      print: {
        subTitle: "Iizuna Town Apple Recipe Card",
        issuer: "Town of Apples Iizuna Official PR Portal (Printed: {date})",
        time: "Time: ",
        servings: "Yield: ",
        author: "Created by: ",
        pointsHead: "Tips & Highlights",
        ingredientsHead: "Ingredients",
        stepsHead: "Directions",
        footerOrg: "Iizuna Town Industry & Tourism Division / Joint Research: Nagano Prefectural University Faculty of Health and Nutrition",
        footerUrl: "Official Portal: https://appletown-iizuna.com/recipe/?lang=en",
      }
    },
    zh: {
      pageTitle: "飯綱町蘋果料理食譜集｜蘋果之鄉飯綱町",
      headTitle: "蘋果料理食譜集",
      introText: `由長野縣立大學健康發達學部食健康學科，攜手人氣咖啡館及英國糕點研究家精心考案的飯綱町官方食譜。<br>從點綴每日餐桌的家常菜、沙拉，到活用英國原產酸味青蘋果「布拉姆利 (Bramley's Seedling)」的頂級料理應有盡有。<br>誠摯邀請您在家中細細品嚐信州飯綱町豐饒大地孕育出的濃郁風味與絕佳口感。`,
      breadcrumbHome: "首頁",
      breadcrumbSavor: "品嚐",
      breadcrumbRecipe: "蘋果料理食譜",
      viewRecipe: "查看食譜 →",
      noRecipes: "未找到符合條件的食譜。",
      bramleyBadge: "使用布拉姆利",
      filters: {
        all: "全部",
        bramley: "布拉姆利食譜",
        main: "主菜・肉類料理",
        side: "配菜・沙拉",
        dessert: "甜點・點心",
        quick: "20分鐘內快煮",
      },
      modal: {
        print: "列印",
        share: "分享",
        close: "關閉",
        timeLabel: "預估烹調時間",
        servingsLabel: "份量",
        authorLabel: "食譜考案・研究",
        ingredientsHead: "食材清單",
        ingredientsCheckSub: "（點擊確認）",
        stepsHead: "烹調步驟",
        pointsHead: "美味要訣與烹飪重點",
        bramleyCtaHead: "深入了解英國青蘋果「布拉姆利」",
        bramleyCtaDesc: "為您介紹酸味之王布拉姆利 (Bramley's Seedling) 在飯綱町的栽培歷史、特色以及多樣料理應用。",
        bramleyCtaBtn: "查看品種介紹 →",
        appleCtaHead: "品味產地直送的飯綱町新鮮蘋果",
        appleCtaDesc: "為您介紹飯綱町內的產地直銷所，以及用心培育蘋果的在地果農與果園資訊。",
        appleCtaBtn: "查看直銷所與生產者 →",
        copied: "已複製分享文字與食譜連結！",
        copyFail: "複製失敗。URL: ",
        shareHeader: "【飯綱町蘋果食譜】",
        readMore: "查看食譜詳情:",
        hashtags: "#飯綱町 #蘋果食譜 #長野縣"
      },
      print: {
        subTitle: "長野縣飯綱町 官方蘋果食譜卡",
        issuer: "蘋果之鄉飯綱町 官方PR門戶（列印日期: {date}）",
        time: "烹調時間: ",
        servings: "份量: ",
        author: "考案・研究: ",
        pointsHead: "美味要訣與烹飪重點",
        ingredientsHead: "食材",
        stepsHead: "烹調步驟",
        footerOrg: "長野縣飯綱町 產業觀光課 / 共同研究: 長野縣立大學 健康發達學部 食健康學科",
        footerUrl: "官方門戶網站: https://appletown-iizuna.com/recipe/?lang=zh",
      }
    }
  };

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

  // ==========================================================================
  // 言語ヘルパー関数
  // ==========================================================================
  function detectInitialLang() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get("lang");
    if (["ja", "en", "zh"].includes(langParam)) {
      return langParam;
    }
    if (window.LZ_CURRENT_LANG && ["ja", "en", "zh"].includes(window.LZ_CURRENT_LANG)) {
      return window.LZ_CURRENT_LANG;
    }
    const stored = localStorage.getItem("appletown_lang");
    if (["ja", "en", "zh"].includes(stored)) {
      return stored;
    }
    return "ja";
  }

  // 指定言語のレシピデータを取得（フォールバック付き）
  function getRecipeLang(recipe, lang) {
    if (!recipe) return null;
    const target = (lang === "en" ? recipe.en : lang === "zh" ? recipe.zh : null) || {};
    return {
      id: recipe.id,
      slug: recipe.slug,
      image_webp: recipe.image_webp,
      image_jpg: recipe.image_jpg,
      source_raw: recipe.source,
      category_raw: recipe.category,
      title: target.title || recipe.title,
      category: target.category || recipe.category,
      source: target.source || recipe.source,
      author: target.author || recipe.author,
      servings: target.servings || recipe.servings,
      cooking_time: target.cooking_time || recipe.cooking_time,
      description: target.description || recipe.description,
      ingredients: target.ingredients || recipe.ingredients || [],
      steps: target.steps || recipe.steps || [],
      points: target.points || recipe.points || []
    };
  }

  // 1. 初期ロード
  document.addEventListener("DOMContentLoaded", async function () {
    currentLang = detectInitialLang();
    activeModalLang = currentLang;

    // ページ見出し等の多言語反映
    updatePageStaticTexts();

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
        const t = RECIPE_I18N[currentLang] || RECIPE_I18N.ja;
        gridEl.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px 0; font-size: 1.6rem;">${t.noRecipes}</p>`;
      }
    }
  });

  // 静的見出し・イントロ文の言語同期
  function updatePageStaticTexts() {
    const t = RECIPE_I18N[currentLang] || RECIPE_I18N.ja;
    const titleEl = document.querySelector(".rc-title");
    const introEl = document.querySelector(".rc-intro-text");
    if (titleEl) titleEl.textContent = t.headTitle;
    if (introEl) introEl.innerHTML = t.introText;
    document.title = t.pageTitle;
  }

  // 2. フィルター集計＆ボタン描画
  function initFilters() {
    const counts = {
      all: allRecipes.length,
      bramley: 0,
      main: 0,
      side: 0,
      dessert: 0,
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

    const t = RECIPE_I18N[currentLang] || RECIPE_I18N.ja;
    const buttons = [
      { id: "all", label: t.filters.all, count: counts.all, isBramley: false, icon: "" },
      { id: "bramley", label: t.filters.bramley, count: counts.bramley, isBramley: true, icon: ICONS.appleGreen },
      { id: "main", label: t.filters.main, count: counts.main, isBramley: false, icon: "" },
      { id: "side", label: t.filters.side, count: counts.side, isBramley: false, icon: "" },
      { id: "dessert", label: t.filters.dessert, count: counts.dessert, isBramley: false, icon: "" },
      { id: "quick", label: t.filters.quick, count: counts.quick, isBramley: false, icon: "" },
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
    const t = RECIPE_I18N[currentLang] || RECIPE_I18N.ja;

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
      gridEl.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px 0; font-size: 1.6rem;">${t.noRecipes}</p>`;
      return;
    }

    gridEl.innerHTML = filtered
      .map((rawRecipe) => {
        const r = getRecipeLang(rawRecipe, currentLang);
        const isBramley = rawRecipe.source.includes("ブラムリー") || rawRecipe.title.includes("ブラムリー") || (rawRecipe.slug && rawRecipe.slug.startsWith("bramley"));
        return `
        <article class="lz-card rc-card" data-slug="${r.slug}" role="button" tabindex="0">
          <div class="lz-media rc-card-media">
            <img src="${r.image_webp}" alt="${escapeHtml(r.title)}" loading="lazy" decoding="async" onerror="this.src='${r.image_jpg}'">
            <span class="rc-badge-cat">${escapeHtml(r.category)}</span>
            ${isBramley ? `<span class="rc-badge-bramley-tag">${ICONS.appleGreen} ${t.bramleyBadge}</span>` : ""}
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
              <span class="rc-card-link-text">${t.viewRecipe}</span>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  }

  // 5. モーダル展開（既存 modal.js と完全調和するレイアウト & 言語切替タブ）
  function openRecipeModal(recipe, updateUrl = true) {
    activeRecipe = recipe;
    activeModalLang = currentLang;

    // ディープリンクURL同期
    if (updateUrl) {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set("id", recipe.slug);
      if (currentLang !== "ja") currentParams.set("lang", currentLang);
      const newUrl = `/recipe?${currentParams.toString()}`;
      history.pushState({ modalOpen: true, slug: recipe.slug }, "", newUrl);
    }

    renderModalContent(recipe);

    // モーダルを開く
    modalBackdropEl.classList.add("rc-modal-open");
    modalBackdropEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  // モーダル内コンテンツ描画（言語切り替え時にその場で再描画）
  function renderModalContent(rawRecipe) {
    const t = RECIPE_I18N[activeModalLang] || RECIPE_I18N.ja;
    const r = getRecipeLang(rawRecipe, activeModalLang);
    const isBramley = rawRecipe.source.includes("ブラムリー") || rawRecipe.title.includes("ブラムリー") || (rawRecipe.slug && rawRecipe.slug.startsWith("bramley"));

    document.title = `${r.title} | ${t.headTitle} | ${activeModalLang === "en" ? "Town of Apples Iizuna" : "りんごのまちいいづな"}`;
    injectStructuredData(r, activeModalLang);

    // 言語タブHTML (modal.js 互換)
    const langTabsHtml = `
      <div class="lz-m-lang-tabs">
        <div class="lz-m-lang-tabs-inner">
          <button type="button" class="lz-m-lang-btn ${activeModalLang === "ja" ? "active" : ""}" data-lang="ja">日本語</button>
          <button type="button" class="lz-m-lang-btn ${activeModalLang === "en" ? "active" : ""}" data-lang="en">English</button>
          <button type="button" class="lz-m-lang-btn ${activeModalLang === "zh" ? "active" : ""}" data-lang="zh">繁體中文</button>
        </div>
      </div>
    `;

    detailContainerEl.innerHTML = `
      <div class="${isBramley ? "is-bramley-modal" : ""}">
        <!-- モーダルヘッダー (.lz-mh 互換) -->
        <div class="lz-mh rc-modal-header">
          <div>
            <nav class="lz-modal-breadcrumb rc-modal-breadcrumb" aria-label="Breadcrumb">
              <a href="/?lang=${activeModalLang}">${t.breadcrumbHome}</a>
              <span class="lz-bc-sep">/</span>
              <a href="/savor?lang=${activeModalLang}">${t.breadcrumbSavor}</a>
              <span class="lz-bc-sep">/</span>
              <a href="/recipe?lang=${activeModalLang}">${t.breadcrumbRecipe}</a>
              ${isBramley ? `<span class="lz-bc-sep">/</span><span style="color: #557512; font-weight:700;">${activeModalLang === "zh" ? "布拉姆利" : activeModalLang === "en" ? "Bramley" : "ブラムリー"}</span>` : ""}
            </nav>
            <h2 class="lz-mt rc-modal-title">${escapeHtml(r.title)}</h2>
          </div>
          <div class="lz-actions rc-modal-actions">
            <button type="button" class="lz-btn rc-modal-btn" id="rc-modal-print-btn" title="${t.modal.print}">
              ${ICONS.print}
              <span class="lz-label rc-btn-label">${t.modal.print}</span>
            </button>
            <button type="button" class="lz-btn lz-share rc-modal-btn rc-share-btn" id="rc-modal-share-btn" title="${t.modal.share}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              <span class="lz-label rc-btn-label">${t.modal.share}</span>
            </button>
            <button type="button" class="lz-btn rc-modal-btn" id="rc-modal-close-trigger" title="${t.modal.close}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              <span class="lz-label rc-btn-label">${t.modal.close}</span>
            </button>
          </div>
        </div>

        <!-- 言語切り替えタブ -->
        ${langTabsHtml}

        <!-- モーダルコンテンツ (.lz-modal-content 互換) -->
        <div class="lz-modal-content rc-modal-content-wrap">
          <!-- 左カラム：写真・情報リスト -->
          <div class="lz-modal-left rc-modal-left">
            <div class="rc-modal-photo">
              <img src="${r.image_webp}" alt="${escapeHtml(r.title)}" onerror="this.src='${r.image_jpg}'">
            </div>
            
            <div class="lz-info-list rc-modal-infolist">
              <div class="lz-info-item rc-modal-infoitem">
                <span class="lz-info-label rc-modal-infolabel">${t.modal.timeLabel}</span>
                <span class="lz-info-val rc-modal-infoval">${ICONS.clock} ${escapeHtml(r.cooking_time)}</span>
              </div>
              <div class="lz-info-item rc-modal-infoitem">
                <span class="lz-info-label rc-modal-infolabel">${t.modal.servingsLabel}</span>
                <span class="lz-info-val rc-modal-infoval">${ICONS.users} ${escapeHtml(r.servings)}</span>
              </div>
              <div class="lz-info-item rc-modal-infoitem">
                <span class="lz-info-label rc-modal-infolabel">${t.modal.authorLabel}</span>
                <span class="lz-info-val rc-modal-infoval">${ICONS.author} ${escapeHtml(r.author)}</span>
              </div>
            </div>
          </div>

          <!-- 右カラム：材料・手順・ポイント・CTA -->
          <div class="lz-modal-right rc-modal-right">
            <div class="lz-lead-strong rc-modal-lead">${escapeHtml(r.description)}</div>

            <!-- 材料表 -->
            <div class="rc-ingredients-card">
              <h3 class="rc-section-head-sm">
                ${t.modal.ingredientsHead} <span class="rc-ing-subtext">${t.modal.ingredientsCheckSub}</span>
              </h3>
              <ul class="rc-ing-table" id="rc-ing-table">
                ${r.ingredients
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
                ${t.modal.stepsHead}
              </h3>
              ${r.steps
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
              r.points && r.points.length > 0
                ? `
              <div class="rc-points-callout">
                <div class="rc-points-head">${ICONS.bulb} ${t.modal.pointsHead}</div>
                <ul class="rc-points-body">
                  ${r.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
                </ul>
              </div>
            `
                : ""
            }

            <!-- 相互リンクCTAバナー -->
            <div class="rc-modal-cta ${isBramley ? "is-bramley-cta" : ""}">
              <div>
                <h4 class="rc-cta-heading">${isBramley ? `${ICONS.appleGreen} ${t.modal.bramleyCtaHead}` : `${ICONS.appleRed} ${t.modal.appleCtaHead}`}</h4>
                <p class="rc-cta-p">${isBramley ? t.modal.bramleyCtaDesc : t.modal.appleCtaDesc}</p>
              </div>
              ${
                isBramley
                  ? `
                <a href="/article/%E3%83%96%E3%83%A9%E3%83%A0%E3%83%AA%E3%83%BC%E3%82%BA%E3%83%BB%E3%82%B7%E3%83%BC%E3%83%89%E3%83%AA%E3%83%B3%E3%82%B0?lang=${activeModalLang}" class="rc-cta-action-btn is-green">
                  ${t.modal.bramleyCtaBtn}
                </a>
              `
                  : `
                <a href="/savor?lang=${activeModalLang}" class="rc-cta-action-btn">
                  ${t.modal.appleCtaBtn}
                </a>
              `
              }
            </div>
          </div>
        </div>
      </div>
    `;

    // 言語切り替えタブのイベントリスナー
    detailContainerEl.querySelectorAll(".lz-m-lang-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const selectedLang = btn.getAttribute("data-lang");
        if (selectedLang && selectedLang !== activeModalLang) {
          activeModalLang = selectedLang;
          renderModalContent(rawRecipe);
        }
      });
    });

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

    // A4 印刷ボタンのイベントリスナー
    detailContainerEl.querySelector("#rc-modal-print-btn")?.addEventListener("click", async () => {
      const btn = detailContainerEl.querySelector("#rc-modal-print-btn");
      const label = btn?.querySelector(".rc-btn-label");
      if (btn) btn.style.opacity = "0.5";
      if (label) label.textContent = "...";
      try {
        await printRecipeA4(r, isBramley);
      } finally {
        if (btn) btn.style.opacity = "1";
        if (label) label.textContent = t.modal.print;
      }
    });

    // 共有ボタンのイベントリスナー（modal.js 互換 Web Share API & コピー）
    detailContainerEl.querySelector("#rc-modal-share-btn")?.addEventListener("click", async () => {
      const pageShareUrl = `${window.location.origin}/recipe?id=${encodeURIComponent(r.slug)}&lang=${activeModalLang}`;
      const payload = [
        `${t.modal.shareHeader} ${r.title}`,
        r.description,
        "ーーー",
        t.modal.readMore,
        pageShareUrl,
        "",
        t.modal.hashtags
      ].filter(Boolean).join("\n");

      if (navigator.share) {
        try {
          await navigator.share({
            title: `${r.title} | ${t.headTitle}`,
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
          alert(t.modal.copied);
        } catch (err) {
          alert(t.modal.copyFail + pageShareUrl);
        }
      }
    });

    // 閉じるボタンのイベントリスナー
    detailContainerEl.querySelector("#rc-modal-close-trigger")?.addEventListener("click", () => {
      closeRecipeModal();
    });

    // 印刷シートを先行構築
    setupPrintSheet(r, isBramley);
  }

  // ==========================================================================
  // 6. A4 規格公文書・公式レシピカード印刷エンジン (多言語対応)
  // ==========================================================================
  function setupPrintSheet(r, isBramley) {
    if (!printSheetEl) return;

    const t = RECIPE_I18N[activeModalLang] || RECIPE_I18N.ja;
    const todayStr = new Date().toLocaleDateString(
      activeModalLang === "en" ? "en-US" : activeModalLang === "zh" ? "zh-TW" : "ja-JP",
      { year: "numeric", month: "long", day: "numeric" }
    );
    const primaryImgSrc = r.image_jpg || r.image_webp;

    printSheetEl.innerHTML = `
      <div class="ps-header ${isBramley ? "is-bramley" : ""}">
        <div class="ps-logo-group">
          ${isBramley ? ICONS.appleGreen : ICONS.appleRed}
          <span class="ps-logo-title">${t.print.subTitle}</span>
        </div>
        <div class="ps-issuer">
          ${t.print.issuer.replace("{date}", todayStr)}
        </div>
      </div>

      <div class="ps-title-wrap">
        <span class="ps-cat-tag ${isBramley ? "is-bramley" : ""}">${escapeHtml(r.category)}</span>
        <h1 class="ps-title">${escapeHtml(r.title)}</h1>
        <div class="ps-meta-bar">
          <span>${t.print.time}${escapeHtml(r.cooking_time)}</span>
          <span>${t.print.servings}${escapeHtml(r.servings)}</span>
          <span>${t.print.author}${escapeHtml(r.author)}</span>
        </div>
        <div class="ps-lead">${escapeHtml(r.description)}</div>
      </div>

      <div class="ps-body-grid">
        <!-- 左カラム：写真・ポイント -->
        <div class="ps-col-left">
          <img class="ps-photo" id="rc-print-img" src="${primaryImgSrc}" alt="${escapeHtml(r.title)}">
          ${
            r.points && r.points.length > 0
              ? `
            <div class="ps-point-box">
              <div class="ps-point-head">${t.print.pointsHead}</div>
              <ul class="ps-point-list">
                ${r.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}
              </ul>
            </div>
          `
              : ""
          }
        </div>

        <!-- 右カラム：材料・作り方 -->
        <div class="ps-col-right">
          <!-- 材料表 -->
          <div class="ps-section-block">
            <div class="ps-sec-head">${t.print.ingredientsHead}</div>
            <table class="ps-ing-table">
              <tbody>
                ${r.ingredients
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
          </div>

          <!-- 作り方手順 -->
          <div class="ps-section-block" style="margin-top: 10pt;">
            <div class="ps-sec-head">${t.print.stepsHead}</div>
            <div class="ps-steps">
              ${r.steps
                .map(
                  (step, idx) => `
                <div class="ps-step-item ${isBramley ? "is-bramley" : ""}">
                  <span class="ps-step-num">${idx + 1}</span>
                  <div class="ps-step-text">${escapeHtml(step)}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        </div>
      </div>

      <div class="ps-footer">
        <span>${t.print.footerOrg}</span>
        <span>${t.print.footerUrl}</span>
      </div>
    `;
  }

  // 印刷ボタン押下時の実行処理
  async function printRecipeA4(r, isBramley) {
    if (!printSheetEl) return;

    setupPrintSheet(r, isBramley);

    // 印刷画像の完全ロードおよびデコード完了を待機
    const printImg = document.getElementById("rc-print-img");
    if (printImg) {
      if (!printImg.complete) {
        await new Promise((resolve) => {
          printImg.onload = resolve;
          printImg.onerror = () => {
            if (r.image_webp && printImg.src !== r.image_webp) {
              printImg.src = r.image_webp;
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

    await new Promise((r) => setTimeout(r, 200));
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
    const t = RECIPE_I18N[currentLang] || RECIPE_I18N.ja;
    document.title = t.pageTitle;
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
      const langParam = params.get("lang") || "ja";

      if (langParam !== currentLang && ["ja", "en", "zh"].includes(langParam)) {
        currentLang = langParam;
        updatePageStaticTexts();
        initFilters();
        renderGrid();
      }

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
  function injectStructuredData(r, lang) {
    const existingScript = document.getElementById("rc-recipe-schema");
    if (existingScript) existingScript.remove();

    const isBramley = r.source_raw ? (r.source_raw.includes("ブラムリー") || r.title.includes("ブラムリー") || (r.slug && r.slug.startsWith("bramley"))) : false;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Recipe",
      name: r.title,
      image: [r.image_webp, r.image_jpg],
      author: {
        "@type": "Person",
        name: r.author,
      },
      datePublished: "2026-09-17",
      description: r.description,
      recipeCategory: r.category,
      recipeCuisine: isBramley ? "British" : "Japanese",
      keywords: `Iizuna Town, Apple Recipes, ${r.category}, ${isBramley ? "Bramley's Seedling" : "Nagano Apples"}`,
      recipeYield: r.servings,
      totalTime: convertToIsoDuration(r.cooking_time),
      recipeIngredient: r.ingredients.map((i) => `${i.name} ${i.amount}`),
      recipeInstructions: r.steps.map((s, idx) => ({
        "@type": "HowToStep",
        position: idx + 1,
        text: s,
      })),
      publisher: {
        "@type": "GovernmentOrganization",
        name: lang === "en" ? "Iizuna Town" : "飯綱町",
        url: `https://appletown-iizuna.com/?lang=${lang}`,
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
