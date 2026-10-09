-- 「みつどんハイエース」お知らせ＆みつどんカテゴリ掲載データ

INSERT OR REPLACE INTO contents (
    id, author_id, type, status, site_scope,
    l1, l2, l3_label, title, lead_text, body_text,
    homepage, related1_url, related1_title, related2_url, related2_title,
    start_date, end_date,
    target_audience, fee, organizer_name,
    media_assets, created_at, updated_at
) VALUES (
    'news-mitsudon-hiace-2026',
    'admin-user',
    'news',
    'published',
    'main',
    '知る',
    '飯綱町のりんご愛',
    'みつどん',
    '【お知らせ】全国に飯綱町の魅力を発信！『みつどんハイエース』が完成・発進しました🚙🍎',
    '「りんご愛日本一」の飯綱町の熱い思いが詰まった特別なラッピングカー『みつどんハイエース』が遂に完成！車体には飯綱町で栽培されている50品種のりんご図鑑と、公式キャラクター「みつどん」が元気いっぱいに描かれています。全国各地へ飯綱町の魅力をお届けします。',
    '全国に飯綱町の魅力を発信！！『みつどんハイエース』発進⭐️

「りんご愛日本一」の長野県飯綱町。そんな町の熱い思いがたくさん詰まった公式ラッピングカー『みつどんハイエース』が遂に完成しました！🚙✨

■ 車体の見どころポイント
🍎 飯綱町産50品種のりんご図鑑
　車体側面には、飯綱町で栽培されている多彩な50品種のりんごがずらりと並ぶ「走るりんご図鑑」！それぞれの品種の個性豊かな色や形を楽しめます。
✨ 公式キャラクター「みつどん」が大活躍！
　今にも車体から元気に飛び出さんばかりの躍動感あふれる「みつどん」が大きくデザインされています。見ているだけで思わず笑顔になる可愛さです♪

■ 全国各地で飯綱町の魅力をPR！
今後、町内外のイベントや物産展、PR活動などで全国各地を駆け巡る予定です。
日本のどこかで『みつどんハイエース』を見かけたときは、ぜひ写真や動画を撮ってSNS等で飯綱町の魅力拡散にご協力ください📸

街で見かけたら、ぜひ手を振ってくださいね！よろしくお願いします🤓🍎',
    'https://town.iizuna.nagano.jp/',
    '/article/02-09-09-0010?lang=ja',
    '飯綱町公式PRキャラクター「みつどん」紹介',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '["/img/news/mitsudon_hiace_2026_1.webp","/img/news/mitsudon_hiace_2026_2.webp","/img/news/mitsudon_hiace_2026_3.webp","/img/news/mitsudon_hiace_2026_4.webp","/img/news/mitsudon_hiace_2026_5.webp"]',
    '2026-10-09 10:00:00',
    '2026-10-09 10:00:00'
);

-- 多言語翻訳データ
INSERT OR REPLACE INTO content_translations (id, content_id, locale, title, lead_text, body_text)
VALUES
(
    'trans-news-mitsudon-hiace-2026-en',
    'news-mitsudon-hiace-2026',
    'en',
    '[News] Spreading Iizuna''s Charm Nationwide! The "Mitsudon HiAce" Wrap Car is Ready! 🚙🍎',
    'Packed with Iizuna Town''s passion as the "#1 Apple-Loving Town in Japan," the official "Mitsudon HiAce" wrap car is finally complete! Featuring an illustrated guide of 50 local apple varieties and mascot Mitsudon, it will travel across the country to share the charm of Iizuna.',
    'Sharing the Charm of Iizuna Town Nationwide! The "Mitsudon HiAce" Hits the Road! ⭐️

Iizuna Town in Nagano Prefecture proudly boasts the greatest love for apples in Japan! We are thrilled to announce the completion of our official wrap vehicle, the "Mitsudon HiAce"! 🚙✨

■ Highlights of the Vehicle
🍎 Illustrated Guide to 50 Apple Varieties: The sides of the car feature a vibrant showcase of 50 apple varieties cultivated right here in Iizuna Town — a true "rolling apple encyclopedia"!
✨ Mascot "Mitsudon" in Action: Featuring dynamic, energetic illustrations of town mascot Mitsudon that look ready to leap right off the car!

■ Promoting Iizuna Across Japan!
The Mitsudon HiAce will travel to events, exhibitions, and promotional campaigns nationwide.
If you spot the Mitsudon HiAce anywhere in Japan, please snap a photo or video and share it on social media to help spread the word about Iizuna Town! 📸

Feel free to wave if you see us on the road! Thank you for your support! 🤓🍎'
),
(
    'trans-news-mitsudon-hiace-2026-zh',
    'news-mitsudon-hiace-2026',
    'zh',
    '【公告】向全日本傳遞飯綱町魅力！「Mitsudon彩繪海獅車」正式亮相出發🚙🍎',
    '凝聚了飯綱町「全日本第一蘋果愛」的官方彩繪宣傳車「Mitsudon彩繪海獅車（HiAce）」正式完工！車身繪有飯綱町栽培的50種蘋果圖鑑以及活力滿滿的官方吉祥物「Mitsudon」，將奔馳全日本宣傳飯綱町的獨特魅力。',
    '向全日本傳播飯綱町的魅力！「Mitsudon彩繪海獅車」正式出發⭐️

號稱「全日本第一蘋果愛」的長野縣飯綱町，滿載地方熱情與巧思的官方彩繪宣傳車『Mitsudon彩繪海獅車（HiAce）』終於大功告成！🚙✨

■ 車身設計亮點
🍎 飯綱町產50種蘋果彩色圖鑑：車身兩側精美繪製了飯綱町栽培的50種特色蘋果，彷彿一本「奔馳在公路上的蘋果百科全書」！
✨ 官方吉祥物「Mitsudon」活力登場：車身繪有栩栩如生、彷彿隨時會躍然而出的大型Mitsudon插畫，讓人看了不禁會心一笑♪

■ 走遍全日本宣傳飯綱町！
今後，Mitsudon彩繪車將前往日本各地的活動、物產展及宣傳場合巡迴亮相。
若您在日本某個角落看見了「Mitsudon海獅車」，歡迎拍照、錄影並上傳社群平台，一起為飯綱町應援推廣！📸

在街頭遇見時請熱情向我們揮揮手喔！敬請多多指教🤓🍎'
),
(
    'trans-news-mitsudon-hiace-2026-tw',
    'news-mitsudon-hiace-2026',
    'tw',
    '【公告】向全日本傳遞飯綱町魅力！「Mitsudon彩繪海獅車」正式亮相出發🚙🍎',
    '凝聚了飯綱町「全日本第一蘋果愛」的官方彩繪宣傳車「Mitsudon彩繪海獅車（HiAce）」正式完工！車身繪有飯綱町栽培的50種蘋果圖鑑以及活力滿滿的官方吉祥物「Mitsudon」，將奔馳全日本宣傳飯綱町的獨特魅力。',
    '向全日本傳播飯綱町的魅力！「Mitsudon彩繪海獅車」正式出發⭐️

號稱「全日本第一蘋果愛」的長野縣飯綱町，滿載地方熱情與巧思的官方彩繪宣傳車『Mitsudon彩繪海獅車（HiAce）』終於大功告成！🚙✨

■ 車身設計亮點
🍎 飯綱町產50種蘋果彩色圖鑑：車身兩側精美繪製了飯綱町栽培的50種特色蘋果，彷彿一本「奔馳在公路上的蘋果百科全書」！
✨ 官方吉祥物「Mitsudon」活力登場：車身繪有栩栩如生、彷彿隨時會躍然而出的大型Mitsudon插畫，讓人看了不禁會心一笑♪

■ 走遍全日本宣傳飯綱町！
今後，Mitsudon彩繪車將前往日本各地的活動、物產展及宣傳場合巡迴亮相。
若您在日本某個角落看見了「Mitsudon海獅車」，歡迎拍照、錄影並上傳社群平台，一起為飯綱町應援推廣！📸

在街頭遇見時請熱情向我們揮揮手喔！敬請多多指教🤓🍎'
);
