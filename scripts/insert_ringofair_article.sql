
INSERT INTO contents (
  id, author_id, type, status, site_scope,
  l1, l2, l3_label, title, lead_text, body_text,
  homepage, sns_instagram, start_date, end_date,
  media_assets, created_at, updated_at
) VALUES (
  '03-01-00-0086', 'admin-user', 'manual', 'published', 'main',
  '味わう', 'イベント', 'いいづなりんごフェア',
  '秋の味覚を大満喫！「飯綱町のりんごを楽しむ秋の86日いいづなりんごフェア」開催', '長野県・飯綱町で、86日間にわたる大充実のりんごフェアが開催されます。前半は「いいづな英国りんごフェア」、後半は「いいづなりんごスイーツフェア」と、秋の深まりとともに多彩なメニューやスタンプラリーをお楽しみいただけます。', '待ちに待ったりんごの季節がやってきました。
長野県飯綱町にて、86日間にわたる大充実の秋の食イベント「いいづなりんごフェア」が開催されます。

本フェアは期間によってテーマが変わり、前半・後半それぞれで異なる魅力をお楽しみいただけます。

■ 開催期間とテーマ
・前半【いいづな英国りんごフェア】：9月5日（土）～ 10月18日（日）
　全国的にも希少な「ブラムリー」などの英国系クッキングアップルを使った特別料理や本格スイーツが登場します。
・後半【いいづなりんごスイーツフェア】：10月19日（月）～ 11月29日（日）
　旬を迎えた多様な飯綱町産りんごを贅沢に使用したオリジナルスイーツが勢揃いします。

■ 豪華景品がもらえる「スタンプラリー」
町内の対象飲食店・直売所を3カ所まわると、飯綱町公式PRキャラクター「みつどん」のめじるしストラップや、オリジナルばねくちポーチ、特製りんごジュースがもらえます（※景品は数量限定）。
さらに、Wチャンスとして飯綱町の特産品が当たる抽選にもご応募いただけます。

【お得なスタンプ獲得情報】
対象の直売所にて500円以上りんごをご購入いただくと、スタンプが1個押印されます。お土産のお買い物とあわせてぜひお立ち寄りください。
※1店舗につき、対象商品1つにつきスタンプ台紙1枚への押印となります。

■ イベント開催概要
・開催期間：2026年9月5日（土）～ 11月29日（日）
・開催場所：飯綱町内の参加飲食店および直売所
・景品交換所：
　・農産物直売所さんちゃん（@sansan.sanchan）
　・横手直売所 四季菜（@iizuna_shikisai）
　・いいづなマルシェ むーちゃん
　・いいづなコネクトEAST（@iizunaconnect_e）
　・いいづなコネクトWEST（@iizunaconnect_w）

参加店舗や限定メニューの最新情報は、いいづなりんごフェア公式Instagram（@iizuna_ringofair_official）にて随時発信されています。
秋の心地よいドライブとともに、日本一のりんごのまち・飯綱町へぜひお越しください。',
  'https://www.instagram.com/iizuna_ringofair_official/', 'iizuna_ringofair_official',
  '2026-09-05', '2026-11-29',
  '[{"url":"/img/events/ringofair_2026_poster.jpg","caption":"飯綱町のりんごを楽しむ秋の86日いいづなりんごフェア ポスター"},{"url":"/img/events/eikoku_ringofair_2026_flyer.jpg","caption":"いいづな英国りんごフェア チラシ"}]', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);

INSERT OR REPLACE INTO content_translations (id, content_id, locale, title, lead_text, body_text)
VALUES
('tr-03-01-00-0086-en', '03-01-00-0086', 'en', 'Fully Enjoy Autumn Flavors! "86-Day Autumn Iizuna Apple Fair" to be Held in Iizuna Town', 'An action-packed 86-day Apple Fair will be held in Iizuna Town, Nagano Prefecture. Divided into the "Iizuna British Apple Fair" in the first half and the "Iizuna Apple Sweets Fair" in the second half, visitors can enjoy a wide variety of menus and a stamp rally as autumn deepens.', 'The long-awaited apple season has finally arrived!
Iizuna Town in Nagano Prefecture is hosting a fulfilling 86-day autumn food event, the "Iizuna Apple Fair."

This fair features different themes depending on the period, allowing visitors to enjoy distinct charms in both the first and second halves.

■ Event Period & Themes
・First Half [Iizuna British Apple Fair]: Saturday, September 5 – Sunday, October 18
  Special dishes and authentic sweets made with British cooking apples such as "Bramley," which are rare even nationwide, will be introduced.
・Second Half [Iizuna Apple Sweets Fair]: Monday, October 19 – Sunday, November 29
  A lineup of original sweets lavishly featuring a diverse range of seasonal apples grown in Iizuna Town.

■ "Stamp Rally" with Luxurious Prizes
By visiting 3 participating restaurants or direct sales markets in the town, you can receive an Iizuna Town official PR character "Mitsudon" marker strap, an original spring-frame pouch, or special apple juice (*prizes are limited in quantity).
Furthermore, as a Double Chance, you can enter a raffle to win local specialties of Iizuna Town.

[Tip to Earn Stamps]
Purchase apples worth 500 yen or more at participating direct sales markets to receive 1 stamp. Be sure to drop by while shopping for souvenirs.
*One stamp per participating item per stamp card at each shop.

■ Event Overview
・Period: Saturday, September 5, 2026 – Sunday, November 29, 2026
・Locations: Participating restaurants and direct sales markets in Iizuna Town
・Prize Exchange Locations:
  ・Agricultural Products Direct Sales Shop Sanchan (@sansan.sanchan)
  ・Yokote Direct Sales Shop Shikisai (@iizuna_shikisai)
  ・Iizuna Marche Mu-chan
  ・Iizuna Connect EAST (@iizunaconnect_e)
  ・Iizuna Connect WEST (@iizunaconnect_w)

Latest information on participating shops and limited-edition menus is constantly updated on the official Iizuna Apple Fair Instagram (@iizuna_ringofair_official).
Enjoy a pleasant autumn drive and come visit Iizuna Town, Japan''s number one apple town!'),
('tr-03-01-00-0086-tw', '03-01-00-0086', 'tw', '盡情享受秋季美味！「飯綱町蘋果享樂秋季86日 飯綱蘋果節」隆重登場', '長野縣飯綱町將舉辦為期86天、內容豐富的蘋果節。活動分為前半段的「飯綱英國蘋果節」與後半段的「飯綱蘋果甜點節」，隨著秋意漸濃，您可盡情享受多樣化的餐點與集章抽獎活動。', '眾所期待的蘋果季節終於來臨了！
長野縣飯綱町將舉辦為期86天的秋季美食盛會——「飯綱蘋果節」。

本活動在不同期間設有不同主題，前半段與後半段各有獨特的魅力等待您來體驗。

■ 舉辦期間與主題
・前半段【飯綱英國蘋果節】：9月5日（六）～ 10月18日（日）
  將推出使用全日本非常罕見的「布林姆利（Bramley）」等英國烹飪蘋果所製作的特別料理與道地甜點。
・後半段【飯綱蘋果甜點節】：10月19日（一）～ 11月29日（日）
  當季盛產的各式飯綱町產蘋果將被奢華地用於製作多款原創甜點。

■ 可獲得豪華獎品的「集章活動」
只要造訪町內3家合作餐飲店或直銷所，即可獲得飯綱町官方PR吉祥物「Mitsudon」標記吊飾、原創彈口包或特製蘋果汁（※獎品數量有限，送完為止）。
此外，還有雙重抽獎機會，可參加抽獎贏取飯綱町特產品。

【集章小撇步】
在指定直銷所購買蘋果滿500日圓以上，即可蓋1個章。採買伴手禮時千萬不要錯過。
※每家店每個指定商品限於1張集章紙上蓋章1次。

■ 活動舉辦概要
・活動期間：2026年9月5日（六）～ 11月29日（日）
・活動地點：飯綱町內合作餐飲店及直銷所
・獎品兌換處：
  ・農產品直銷所 Sanchan（@sansan.sanchan）
  ・橫手直銷所 四季菜（@iizuna_shikisai）
  ・飯綱Marche Mu-chan
  ・Iizuna Connect EAST（@iizunaconnect_e）
  ・Iizuna Connect WEST（@iizunaconnect_w）

合作店家與限定餐點的最新資訊，會隨時在「飯綱蘋果節」官方Instagram（@iizuna_ringofair_official）發布。
趁著舒爽的秋日來場自駕遊，歡迎前來日本第一的蘋果之鄉——飯綱町！');
