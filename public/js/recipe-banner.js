/**
 * トップページ「りんごレシピ」バナー 多言語対応スクリプト
 */
document.addEventListener("DOMContentLoaded", () => {
  const badgeEl = document.querySelector(".lz-rb-badge span");
  const titleEl = document.querySelector(".lz-rb-title");
  const descEl = document.querySelector(".lz-rb-desc");
  const btnEl = document.querySelector(".lz-rb-btn");

  if (!titleEl) return;

  const I18N_RECIPE_BANNER = {
    ja: {
      badge: "公式レシピ",
      title: "りんごレシピ集",
      desc: "長野県立大学 健康発達学部との共同研究レシピ ＆ 英国生まれの青りんご「ブラムリー」本格レシピの数々。<br>毎日の食卓を美味しく彩るおかずやスイーツをご家庭でお楽しみください。",
      btn: "レシピ一覧を見る",
    },
    en: {
      badge: "Official Recipes",
      title: "Apple Recipes",
      desc: "Authentic recipes crafted in collaboration with Nagano Prefectural University and featuring British Bramley cooking apples.<br>Enjoy flavorful dishes, pastas, and baked sweets at home.",
      btn: "View All Recipes",
    },
    zh: {
      badge: "官方食譜",
      title: "蘋果料理食譜集",
      desc: "與長野縣立大學健康發達學部共同研究的料理食譜，以及英國青蘋果「布拉姆利」料理。<br>讓飯綱町美味蘋果為您的家庭餐桌增添豐富色彩。",
      btn: "查看食譜一覽",
    },
  };

  const updateTexts = () => {
    const lang = localStorage.getItem("appletown_lang") || "ja";
    const t = I18N_RECIPE_BANNER[lang] || I18N_RECIPE_BANNER.ja;

    if (badgeEl) badgeEl.textContent = t.badge;
    if (titleEl) titleEl.textContent = t.title;
    if (descEl) descEl.innerHTML = t.desc;
    if (btnEl) {
      // 矢印SVGを残してテキストを置換
      const arrowSvg = btnEl.querySelector("svg");
      btnEl.textContent = t.btn + " ";
      if (arrowSvg) btnEl.appendChild(arrowSvg);
    }
  };

  updateTexts();
  window.addEventListener("languageChange", updateTexts);
  window.addEventListener("storage", (e) => {
    if (e.key === "appletown_lang") updateTexts();
  });
});
