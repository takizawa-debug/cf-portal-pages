/**
 * トップページ「現在開催中の注目イベント」バナーコンポーネント
 */
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('lz-current-event-banner');
    if (!container) return;

    const currentLang = localStorage.getItem('appletown_lang') || 'ja';

    const I18N_EVENT = {
        ja: {
            badge: "現在開催中の注目イベント",
            days: "秋の86日間 開催",
            title: "飯綱町のりんごを楽しむ秋の86日「いいづなりんごフェア」",
            lead: "待ちに待ったりんごの季節！長野県飯綱町にて、86日間にわたる大充実のりんごフェアが開催中。期間によってテーマが変わる特別な秋をお届けします。",
            phase1_label: "前半",
            phase1_period: "9/5(土) 〜 10/18(日)",
            phase1_name: "いいづな英国りんごフェア",
            phase1_desc: "希少なクッキングアップル「ブラムリー」等の特別料理・スイーツ",
            phase2_label: "後半",
            phase2_period: "10/19(月) 〜 11/29(日)",
            phase2_name: "いいづなりんごスイーツフェア",
            phase2_desc: "旬を迎えた多様な飯綱町産りんごのオリジナルスイーツが勢揃い",
            stamp_title: "🎁 みつどんグッズがもらえるスタンプラリー開催中！",
            stamp_desc: "町内の対象店舗・直売所を3カ所巡ると、限定ストラップやりんごジュース等の特製景品をプレゼント！",
            btn_instagram: "公式Instagram (@iizuna_ringofair_official) を見る",
            btn_article: "イベント詳細記事を見る"
        },
        en: {
            badge: "FEATURED EVENT NOW OPEN",
            days: "Autumn 86-Day Event",
            title: "86-Day Autumn Iizuna Apple Fair: Savor the Apples of Iizuna Town",
            lead: "The long-awaited apple season has arrived! Enjoy a variety of special dishes, sweets, and stamp rally over 86 delightful autumn days in Iizuna Town.",
            phase1_label: "Phase 1",
            phase1_period: "Sep 5 – Oct 18",
            phase1_name: "Iizuna British Apple Fair",
            phase1_desc: "Featuring dishes and sweets made with rare Bramley cooking apples.",
            phase2_label: "Phase 2",
            phase2_period: "Oct 19 – Nov 29",
            phase2_name: "Iizuna Apple Sweets Fair",
            phase2_desc: "A wide lineup of original sweets crafted from in-season Iizuna apples.",
            stamp_title: "🎁 Stamp Rally: Collect Stamps for Mascot Goods!",
            stamp_desc: "Visit 3 participating shops or farm stands to receive exclusive prizes including apple juice and Mitsudon items.",
            btn_instagram: "View on Official Instagram (@iizuna_ringofair_official)",
            btn_article: "View Event Details"
        },
        tw: {
            badge: "現正舉辦中 精選活動",
            days: "秋季86日 盛大登場",
            title: "飯綱町蘋果享樂秋季86日「飯綱蘋果節 (Iizuna Apple Fair)」",
            lead: "期盼已久的蘋果季節來臨！長野縣飯綱町展開為期86天的大型蘋果盛會，前半與後半呈現不同主題的美味驚喜。",
            phase1_label: "前半期",
            phase1_period: "9/5(六) 〜 10/18(日)",
            phase1_name: "飯綱英國蘋果節",
            phase1_desc: "品嚐極具特色的英國酸蘋果「Bramley」限定料理與道地甜點",
            phase2_label: "後半期",
            phase2_period: "10/19(一) 〜 11/29(日)",
            phase2_name: "飯綱蘋果甜點節",
            phase2_desc: "匯聚各式當季新鮮飯綱蘋果的原創精緻甜點",
            stamp_title: "🎁 集章活動開跑！換取吉祥物Mitsudon限定好禮",
            stamp_desc: "走訪町內3家合作餐廳或農產直銷所，即可獲得限定吊飾、蘋果汁等精美紀念品！",
            btn_instagram: "追蹤官方Instagram (@iizuna_ringofair_official)",
            btn_article: "查看活動詳情報導"
        }
    };

    const text = I18N_EVENT[currentLang] || I18N_EVENT['ja'];

    container.innerHTML = `
    <section class="lz-current-event-card">
        <div class="lz-event-header-strip">
            <div class="lz-event-badge-pulse">
                <span class="lz-pulse-dot"></span>
                <span>${text.badge}</span>
            </div>
            <div class="lz-event-days-tag">${text.days}</div>
        </div>

        <div class="lz-event-content-grid">
            <div class="lz-event-visual-wrap">
                <a href="https://www.instagram.com/iizuna_ringofair_official/" target="_blank" rel="noopener noreferrer" class="lz-event-poster-link" title="公式Instagramを開く">
                    <img src="/img/events/ringofair_2026_poster.jpg" alt="いいづなりんごフェア ポスター" class="lz-event-poster-img" loading="lazy">
                    <div class="lz-poster-hover-overlay">
                        <i class="fa-brands fa-instagram"></i>
                        <span>Instagramで最新情報をチェック</span>
                    </div>
                </a>
            </div>

            <div class="lz-event-body-wrap">
                <h3 class="lz-event-title">${text.title}</h3>
                <p class="lz-event-lead">${text.lead}</p>

                <!-- 2段階フェーズ表示 -->
                <div class="lz-event-phases">
                    <div class="lz-phase-card lz-phase-1">
                        <div class="lz-phase-meta">
                            <span class="lz-phase-badge">🇬🇧 ${text.phase1_label}</span>
                            <span class="lz-phase-date">${text.phase1_period}</span>
                        </div>
                        <h4 class="lz-phase-title">${text.phase1_name}</h4>
                        <p class="lz-phase-desc">${text.phase1_desc}</p>
                    </div>

                    <div class="lz-phase-card lz-phase-2">
                        <div class="lz-phase-meta">
                            <span class="lz-phase-badge">🍰 ${text.phase2_label}</span>
                            <span class="lz-phase-date">${text.phase2_period}</span>
                        </div>
                        <h4 class="lz-phase-title">${text.phase2_name}</h4>
                        <p class="lz-phase-desc">${text.phase2_desc}</p>
                    </div>
                </div>

                <!-- スタンプラリー情報 -->
                <div class="lz-stamp-callout">
                    <div class="lz-stamp-title">${text.stamp_title}</div>
                    <div class="lz-stamp-desc">${text.stamp_desc}</div>
                </div>

                <!-- アクションボタン群 -->
                <div class="lz-event-actions">
                    <a href="https://www.instagram.com/iizuna_ringofair_official/" target="_blank" rel="noopener noreferrer" class="lz-btn-ig-cta">
                        <i class="fa-brands fa-instagram me-2"></i>
                        <span>${text.btn_instagram}</span>
                        <i class="fa-solid fa-arrow-up-right-from-square ms-2"></i>
                    </a>
                    <button class="lz-btn-article-link" onclick="openArticleModal('03-01-00-0086')">
                        <i class="fa-solid fa-file-lines me-2"></i>
                        <span>${text.btn_article}</span>
                    </button>
                </div>
            </div>
        </div>
    </section>
    `;
});
