/**
 * トップページ「現在開催中の注目イベント」コンポーネント (洗練・クリーン版)
 */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lz-current-event-banner');
    if (!container) return;

    const currentLang = localStorage.getItem('appletown_lang') || 'ja';

    const I18N_EVENT = {
        ja: {
            badge: "現在開催中のイベント",
            periodTag: "開催期間：9月5日(土) 〜 11月29日(日)",
            title: "秋の味覚を大満喫！「飯綱町のりんごを楽しむ秋の86日いいづなりんごフェア」開催",
            lead: "長野県飯綱町にて、86日間にわたる秋の食イベント「いいづなりんごフェア」が開催されます。期間ごとに異なるテーマで、この時期ならではの旬のりんご料理やスイーツをお楽しみいただけます。",
            phase1_label: "前半",
            phase1_period: "9月5日(土) 〜 10月18日(日)",
            phase1_name: "いいづな英国りんごフェア",
            phase1_desc: "希少なクッキングアップル「ブラムリー」等を使用した特別メニューやスイーツが登場します。",
            phase2_label: "後半",
            phase2_period: "10月19日(月) 〜 11月29日(日)",
            phase2_name: "いいづなりんごスイーツフェア",
            phase2_desc: "旬を迎えた多様な町産りんごを贅沢に使ったオリジナルスイーツが勢揃いします。",
            stamp_title: "スタンプラリー同時開催（景品プレゼント）",
            stamp_desc: "町内の対象店舗・直売所を巡るスタンプラリーを実施。対象直売所でりんごを500円以上ご購入いただくとスタンプを1個獲得できます。3店舗達成で「みつどん」限定グッズやりんごジュースをプレゼント。",
            btn_instagram: "公式Instagram (@iizuna_ringofair_official)",
            btn_article: "イベント詳細記事を読む",
            articleUrl: "/article/" + encodeURIComponent("秋の味覚を大満喫！「飯綱町のりんごを楽しむ秋の86日いいづなりんごフェア」開催") + "?lang=ja"
        },
        en: {
            badge: "Current Event",
            periodTag: "Period: Sep 5 (Sat) – Nov 29 (Sun)",
            title: "86-Day Autumn Iizuna Apple Fair in Iizuna Town",
            lead: "Experience the autumn harvest with the 86-day Iizuna Apple Fair in Nagano Prefecture. Enjoy special dishes, sweets, and a stamp rally across participating local shops and farm stands.",
            phase1_label: "Part 1",
            phase1_period: "Sep 5 – Oct 18",
            phase1_name: "Iizuna British Apple Fair",
            phase1_desc: "Special menus and desserts featuring rare cooking apples such as Bramley.",
            phase2_label: "Part 2",
            phase2_period: "Oct 19 – Nov 29",
            phase2_name: "Iizuna Apple Sweets Fair",
            phase2_desc: "A wide lineup of original desserts made with fresh in-season Iizuna apples.",
            stamp_title: "Stamp Rally with Exclusive Gifts",
            stamp_desc: "Collect stamps from 3 participating locations to receive commemorative gifts including local apple juice and Mitsudon mascot items.",
            btn_instagram: "Official Instagram (@iizuna_ringofair_official)",
            btn_article: "Read Event Article",
            articleUrl: "/article/" + encodeURIComponent("秋の味覚を大満喫！「飯綱町のりんごを楽しむ秋の86日いいづなりんごフェア」開催") + "?lang=en"
        },
        tw: {
            badge: "現正舉辦活動",
            periodTag: "活動期間：9月5日(六) 〜 11月29日(日)",
            title: "飯綱町蘋果享樂秋季86日「飯綱蘋果節」盛大登場",
            lead: "長野縣飯綱町展開為期86天的大型秋季盛會。前半期與後半期分別推出不同主題的特色蘋果料理、精緻甜點與集章好禮活動。",
            phase1_label: "前半期",
            phase1_period: "9月5日(六) 〜 10月18日(日)",
            phase1_name: "飯綱英國蘋果節",
            phase1_desc: "推出以珍稀酸蘋果「Bramley」等烘焙製作的限定料理與甜點。",
            phase2_label: "後半期",
            phase2_period: "10月19日(一) 〜 11月29日(日)",
            phase2_name: "飯綱蘋果甜點節",
            phase2_desc: "匯聚各式當季新鮮飯綱蘋果的原創精緻甜點。",
            stamp_title: "集章巡禮活動（贈送限定紀念品）",
            stamp_desc: "走訪町內3處指定合作店家或直銷所即可兌換特製蘋果汁及吉祥物紀念品。",
            btn_instagram: "官方Instagram (@iizuna_ringofair_official)",
            btn_article: "閱讀活動報導",
            articleUrl: "/article/" + encodeURIComponent("秋の味覚を大満喫！「飯綱町のりんごを楽しむ秋の86日いいづなりんごフェア」開催") + "?lang=zh"
        }
    };

    const text = I18N_EVENT[currentLang] || I18N_EVENT['ja'];

    container.innerHTML = `
    <section class="lz-current-event-card">
        <div class="lz-event-top-bar">
            <span class="lz-event-badge">${text.badge}</span>
            <span class="lz-event-period-text">${text.periodTag}</span>
        </div>

        <div class="lz-event-layout">
            <div class="lz-event-media">
                <a href="${text.articleUrl}" class="lz-event-poster-frame" title="記事詳細を開く">
                    <img src="/img/events/ringofair_2026_poster.jpg" alt="いいづなりんごフェア" class="lz-event-img">
                </a>
            </div>

            <div class="lz-event-details">
                <h3 class="lz-event-heading">
                    <a href="${text.articleUrl}" style="color: inherit; text-decoration: none;">${text.title}</a>
                </h3>
                
                <p class="lz-event-intro">${text.lead}</p>

                <div class="lz-event-schedule-grid">
                    <div class="lz-schedule-box">
                        <div class="lz-schedule-tag">${text.phase1_label}｜${text.phase1_period}</div>
                        <h4 class="lz-schedule-title">${text.phase1_name}</h4>
                        <p class="lz-schedule-text">${text.phase1_desc}</p>
                    </div>

                    <div class="lz-schedule-box">
                        <div class="lz-schedule-tag">${text.phase2_label}｜${text.phase2_period}</div>
                        <h4 class="lz-schedule-title">${text.phase2_name}</h4>
                        <p class="lz-schedule-text">${text.phase2_desc}</p>
                    </div>
                </div>

                <div class="lz-event-info-panel">
                    <div class="lz-info-panel-title">${text.stamp_title}</div>
                    <div class="lz-info-panel-desc">${text.stamp_desc}</div>
                </div>

                <div class="lz-event-button-row">
                    <a href="${text.articleUrl}" class="lz-btn-view-article">
                        <span>${text.btn_article}</span>
                        <i class="fa-solid fa-chevron-right ms-2"></i>
                    </a>
                    <a href="https://www.instagram.com/iizuna_ringofair_official/" target="_blank" rel="noopener noreferrer" class="lz-btn-view-instagram">
                        <i class="fa-brands fa-instagram me-2"></i>
                        <span>${text.btn_instagram}</span>
                        <i class="fa-solid fa-arrow-up-right-from-square ms-2"></i>
                    </a>
                </div>
            </div>
        </div>
    </section>
    `;
});
