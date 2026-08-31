
INSERT OR REPLACE INTO contents (
  id, author_id, type, status, site_scope,
  l1, l2, l3_label, title, lead_text, body_text,
  homepage, sns_instagram, start_date, end_date,
  media_assets, created_at, updated_at
) VALUES (
  'news-ringofair-2026', 'admin-user', 'news', 'published', 'main',
  '知る', 'お知らせ', 'イベント',
  '【イベント】「飯綱町のりんごを楽しむ秋の86日いいづなりんごフェア」が9月5日(土)より開催されます', '長野県飯綱町にて、秋の味覚を大満喫する86日間の食の祭典「いいづなりんごフェア」が開催されます。前半は英国りんごフェア、後半はスイーツフェア、さらにスタンプラリーなど企画が盛りだくさんです。', '長野県飯綱町にて、2026年9月5日（土）から11月29日（日）までの86日間にわたり、「いいづなりんごフェア」が開催されます。

■ 開催スケジュール
・前半【いいづな英国りんごフェア】：9月5日（土）～ 10月18日（日）
・後半【いいづなりんごスイーツフェア】：10月19日（月）～ 11月29日（日）

■ スタンプラリー開催
町内の対象店舗や直売所を巡ると、飯綱町PRキャラクター「みつどん」の限定グッズやりんごジュースがもらえるスタンプラリーも同時開催されます。

参加店舗や特別メニューの最新情報は、公式Instagram（@iizuna_ringofair_official）およびポータル内の詳細記事をご覧ください。',
  'https://www.instagram.com/iizuna_ringofair_official/', 'iizuna_ringofair_official',
  '2026-09-05', '2026-11-29',
  '["/img/events/ringofair_2026_poster.jpg","/img/events/eikoku_ringofair_2026_flyer.jpg"]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO content_translations (id, content_id, locale, title, lead_text, body_text)
VALUES
('tr-news-ringofair-2026-en', 'news-ringofair-2026', 'en', '[Event] "86 Days of Enjoying Iizuna Town''s Apples: Autumn Iizuna Apple Fair" to be Held Starting Saturday, September 5', 'In Iizuna Town, Nagano Prefecture, the "Iizuna Apple Fair," an 86-day food festival to fully enjoy the flavors of autumn, will be held. The festival is packed with exciting events, featuring a British Apple Fair in the first half, a Sweets Fair in the second half, and a stamp rally.', 'The "Iizuna Apple Fair" will be held in Iizuna Town, Nagano Prefecture, for 86 days from Saturday, September 5 to Sunday, November 29, 2026.

■ Schedule
・ First Half [Iizuna British Apple Fair]: Saturday, September 5 – Sunday, October 18
・ Second Half [Iizuna Apple Sweets Fair]: Monday, October 19 – Sunday, November 29

■ Stamp Rally
A stamp rally will also be held concurrently. By visiting participating local shops and direct farm outlets in town, participants can receive limited-edition merchandise featuring Iizuna Town''s PR mascot "Mitsudon" as well as apple juice.

For the latest information on participating stores and special menu items, please check the official Instagram (@iizuna_ringofair_official) and detailed articles on the portal site.'),
('tr-news-ringofair-2026-tw', 'news-ringofair-2026', 'tw', '【活動】「享受飯綱町蘋果的秋季86天 飯綱蘋果節」將於9月5日（六）起登場', '長野縣飯綱町將舉辦為期86天的美食盛會「飯綱蘋果節」，讓您盡情享受秋季美味。前半期為英國蘋果節，後半期為甜點節，此外還有集章活動等豐富企劃。', '長野縣飯綱町將於2026年9月5日（六）至11月29日（日）期間，展開為期86天的「飯綱蘋果節」。

■ 活動時程
・前半期【飯綱英國蘋果節】：9月5日（六）～ 10月18日（日）
・後半期【飯綱蘋果甜點節】：10月19日（一）～ 11月29日（日）

■ 集章活動
活動期間將同步舉辦集章活動，只要造訪町內指定店家與直營銷售據點，即可獲得飯綱町宣傳吉祥物「Mitsudon（みつどん）」限定周邊商品及蘋果汁。

有關合作店家與特別菜單的最新資訊，請參閱官方Instagram（@iizuna_ringofair_official）及入口網站內的詳細報導。'),
('tr-news-ringofair-2026-zh-TW', 'news-ringofair-2026', 'zh-TW', '【活動】「享受飯綱町蘋果的秋季86天 飯綱蘋果節」將於9月5日（六）起登場', '長野縣飯綱町將舉辦為期86天的美食盛會「飯綱蘋果節」，讓您盡情享受秋季美味。前半期為英國蘋果節，後半期為甜點節，此外還有集章活動等豐富企劃。', '長野縣飯綱町將於2026年9月5日（六）至11月29日（日）期間，展開為期86天的「飯綱蘋果節」。

■ 活動時程
・前半期【飯綱英國蘋果節】：9月5日（六）～ 10月18日（日）
・後半期【飯綱蘋果甜點節】：10月19日（一）～ 11月29日（日）

■ 集章活動
活動期間將同步舉辦集章活動，只要造訪町內指定店家與直營銷售據點，即可獲得飯綱町宣傳吉祥物「Mitsudon（みつどん）」限定周邊商品及蘋果汁。

有關合作店家與特別菜單的最新資訊，請參閱官方Instagram（@iizuna_ringofair_official）及入口網站內的詳細報導。'),
('tr-news-ringofair-2026-zh', 'news-ringofair-2026', 'zh', '【活動】「享受飯綱町蘋果的秋季86天 飯綱蘋果節」將於9月5日（六）起登場', '長野縣飯綱町將舉辦為期86天的美食盛會「飯綱蘋果節」，讓您盡情享受秋季美味。前半期為英國蘋果節，後半期為甜點節，此外還有集章活動等豐富企劃。', '長野縣飯綱町將於2026年9月5日（六）至11月29日（日）期間，展開為期86天的「飯綱蘋果節」。

■ 活動時程
・前半期【飯綱英國蘋果節】：9月5日（六）～ 10月18日（日）
・後半期【飯綱蘋果甜點節】：10月19日（一）～ 11月29日（日）

■ 集章活動
活動期間將同步舉辦集章活動，只要造訪町內指定店家與直營銷售據點，即可獲得飯綱町宣傳吉祥物「Mitsudon（みつどん）」限定周邊商品及蘋果汁。

有關合作店家與特別菜單的最新資訊，請參閱官方Instagram（@iizuna_ringofair_official）及入口網站內的詳細報導。');
