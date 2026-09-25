-- 2026年10月3日開催「信州いいづなりんごマルシェ in 小矢部」お知らせ追加データ

INSERT OR REPLACE INTO contents (
    id, author_id, type, status, site_scope,
    l1, l2, l3_label, title, lead_text, body_text,
    homepage, related1_url, related1_title,
    start_date, end_date, start_time, end_time,
    target_audience, fee, organizer_name,
    media_assets, created_at, updated_at
) VALUES (
    'news-marche-oyabe-2026',
    'admin-user',
    'news',
    'published',
    'main',
    '知る',
    'お知らせ',
    'イベント',
    '【イベント】富山県に初上陸！「信州いいづなりんごマルシェ in 小矢部」を10月3日(土)に開催します',
    '長野県飯綱町から、おいしい旬のりんごと特産品が富山県・三井アウトレットパーク 北陸小矢部に初出店！相澤農園の採れたてりんごやりんごスイーツ、本格シードルの販売をはじめ、利きりんごジュース体験やオリジナルトートバッグ作り、PRキャラクター「みつどん」の登場など、飯綱町の魅力をお届けします。',
    'いいづなりんごマルシェが、富山県に初出店します！🍎🍏
2026年10月3日（土）、三井アウトレットパーク 北陸小矢部にて「信州いいづなりんごマルシェ in 小矢部」を開催します。

飯綱町のりんごのおいしさや地域の魅力を、おでかけ先でも楽しめる1日限定の特別なマルシェです。
秋の訪れを感じる旬のりんごやスイーツ、シードルなどの特産品が並ぶほか、味の違いを楽しむ「利きりんごジュース」の試飲体験や、オリジナルトートバッグ制作ワークショップ、展示上映など体験コンテンツも盛りだくさん！
飯綱町PRキャラクター「みつどん」も登場し、皆さまのご来場をお待ちしております。

お買い物やおでかけのついでに、ぜひふらっとお立ち寄りください♪

■ 開催概要
・日時：2026年10月3日（土）10:00〜16:00
・場所：三井アウトレットパーク 北陸小矢部 1階東口 屋内イベントスペース
・参加費：無料（商品購入・一部体験は有料）
・主催：長野県飯綱町

■ 出展予定店舗＆おすすめ商品
🍎 相澤農園
　飯綱町の最北端に位置する農園。昼夜の大きな寒暖差により甘く引き締まった自慢の旬のりんごを販売。
🥧 泉ヶ丘喫茶室
　名産のりんごや旬の果物を使った焼き込みタルト専門店。一番人気のタルトタタンや発酵アップルコーラなどを販売。
🍾 林檎学校醸造所
　廃校を活用し特産りんごで本格シードルを製造。凍結濃縮で造る無加糖りんごシロップやクラフトシードルなどを販売。
🥮 明月堂
　創業90年余りの老舗和洋菓子店。ブラムリーのアップルパイや、みつどんどら焼き（りんごどら焼き）など和洋菓子を販売。

■ 楽しい体験イベント＆展示
🍹 利きりんごジュース体験・試飲会
　品種ごとの風味や酸味、甘みの違いを飲み比べて楽しめます！
🎨 オリジナルトートバッグ制作ワークショップ
　世界にひとつだけのオリジナルトートバッグを作ろう！
✨ 飯綱町PRキャラクター「みつどん」グリーティング
　みつどんが会場にやってきます！記念写真やふれあいをお楽しみください。
🎬 飯綱町の風景写真・PR動画の上映
　りんごのまち飯綱町の自然豊かな風景や地域の魅力をご紹介します。

現在町内では、秋の味覚を満喫する「いいづなりんごフェア2026」も開催中です。
イベントの詳細につきましては、三井アウトレットパーク 北陸小矢部のイベントページをご覧ください。

👉 詳しくはこちら（三井アウトレットパーク 北陸小矢部 イベント情報）：
https://mitsui-shopping-park.com/mop/oyabe/event/3643416.html',
    'https://mitsui-shopping-park.com/mop/oyabe/event/3643416.html',
    'https://mitsui-shopping-park.com/mop/oyabe/event/3643416.html',
    '【三井アウトレットパーク 北陸小矢部】信州いいづなりんごマルシェ in 小矢部',
    '2026-10-03',
    '2026-10-03',
    '10:00',
    '16:00',
    'どなたでもお気軽にお越しください',
    '入場無料（購入・一部体験は有料）',
    '長野県飯綱町',
    '["/img/news/marche_oyabe_2026_1.webp"]',
    '2026-09-25 12:00:00',
    '2026-09-25 12:00:00'
);

-- 多言語翻訳データ
INSERT OR REPLACE INTO content_translations (id, content_id, locale, title, lead_text, body_text)
VALUES
(
    'trans-news-marche-oyabe-2026-en',
    'news-marche-oyabe-2026',
    'en',
    '[Event] First Time in Toyama! "Shinshu Iizuna Apple Marche in Oyabe" on Saturday, Oct 3',
    'For the first time ever, fresh apples and specialty treats from Iizuna Town, Nagano, are coming to Mitsui Outlet Park Hokuriku Oyabe! Enjoy farm-fresh apples from Aizawa Farm, artisanal apple pies, craft cider, tartes tatin, apple juice tastings, tote bag workshops, and meet mascot Mitsudon.',
    'The "Shinshu Iizuna Apple Marche" is making its first-ever debut in Toyama Prefecture! 🍎🍏
On Saturday, October 3, 2026, we are holding the "Shinshu Iizuna Apple Marche in Oyabe" at Mitsui Outlet Park Hokuriku Oyabe.

This special one-day pop-up market brings the wonderful flavors and charm of Iizuna Town right to your weekend getaway.
In addition to autumn apples, sweets, and craft cider from local artisans, visitors can enjoy comparative apple juice tastings, hands-on tote bag workshops, and photo/video showcases.
Iizuna Town''s official mascot, "Mitsudon," will also be there to welcome everyone!

Drop by while shopping or exploring Toyama!

■ Event Details
・ Date & Time: Saturday, October 3, 2026, 10:00 - 16:00
・ Location: Mitsui Outlet Park Hokuriku Oyabe, 1F East Entrance Indoor Event Space
・ Admission: Free (purchases and select workshop materials charged separately)
・ Organizer: Iizuna Town, Nagano Prefecture

■ Vendors & Lineup
🍎 Aizawa Farm: Located at the northernmost part of Iizuna, producing sweet, crisp autumn apples nurtured by high day-night temperature variations.
🥧 Izumigaoka Cafe: Specialty bakery featuring tarts with local apples and seasonal fruit. Famous for their tarte tatin and fermented apple cola.
🍾 Ringo Gakko Brewery: Authentic craft cider brewed in a renovated former elementary school. Offering freeze-concentrated pure apple syrup and craft cider.
🥮 Meigetsudo: Traditional confectionery with over 90 years of history. Selling Bramley apple pies and Mitsudon apple dorayaki.

■ Fun Activities & Experiences
🍹 Apple Juice Tasting: Sample and compare different varieties of pure apple juice!
🎨 Original Tote Bag Workshop: Craft your very own customized tote bag!
✨ Meet Mascot "Mitsudon": Take photos and interact with Iizuna Town''s beloved apple mascot!
🎬 Photo & Video Exhibition: Discover the scenic landscapes and apple culture of Iizuna Town.

The town-wide "Iizuna Apple Fair 2026" is also currently underway in Nagano!
For more information, please visit the Mitsui Outlet Park event page:
https://mitsui-shopping-park.com/mop/oyabe/event/3643416.html'
),
(
    'trans-news-marche-oyabe-2026-zh',
    'news-marche-oyabe-2026',
    'zh',
    '【活動】首次登陸富山！「信州飯綱蘋果市集 in 小矢部」將於10月3日（六）熱鬧登場',
    '長野縣飯綱町的香甜當季蘋果與精選特產首次進駐富山三井OUTLET PARK北陸小矢部！現場不僅有相澤農園產地直送蘋果、現烤法式翻轉蘋果塔、精釀蘋果酒等美味特產，更備有評比試飲、手作托特包工作坊及吉祥物「Mitsudon」見面會，歡迎踴躍前來！',
    '飯綱蘋果市集首次進駐富山縣！🍎🍏
2026年10月3日（六），「信州飯綱蘋果市集 in 小矢部」將於三井OUTLET PARK北陸小矢部盛大舉行。

這是一場僅限1日的特別市集，讓您在出遊逛街之際，也能品嚐到飯綱町頂級蘋果的極致美味與獨特魅力。
現場除了集結秋季當季採摘的新鮮蘋果、手工蘋果甜點、特色精釀西打酒等豐富特產外，還設有品評不同品種風味的「蘋果汁盲測品飲會」、手作原創帆布托特包工作坊，以及飯綱町風光影像展！
飯綱町超人氣官方吉祥物「Mitsudon（みつどん）」也將親臨現場與大家見面♪

趁著購物與假日休閒，誠摯邀請您與親朋好友一同前來同樂！

■ 活動概要
・時間：2026年10月3日（六）10:00〜16:00
・地點：三井OUTLET PARK 北陸小矢部 1樓東口 室內活動區
・參加費：免費（商品購買及部分體驗另計）
・主辦單位：長野縣飯綱町

■ 出展店家與推薦商品
🍎 相澤農園
　位於飯綱町最北端的果園。得益於日夜顯著溫差，培育出甜度高、果肉緊實的頂級當季蘋果。
🥧 泉之丘喫茶室
　採用名產蘋果與時令水果的手工烘焙塔專門店。招牌法式翻轉蘋果塔（Tarte Tatin）及發酵蘋果可樂人氣滿載。
🍾 林檎學校釀造所
　利用廢校小學改建的微型釀造所。販售以急速冷凍濃縮技術製成的無添加純蘋果露及頂級精釀蘋果酒。
🥮 明月堂
　創業90餘年的和洋菓子老鋪。販售英式Bramley翠玉蘋果派，以及夾入香濃蘋果餡的「Mitsudon銅鑼燒」。

■ 豐富體驗與展示活動
🍹 盲測蘋果汁試飲品評會：試飲比較不同品種蘋果汁的香氣、酸甜度與豐富層次！
🎨 原創帆布托特包手作工作坊：親手印製獨一無二的專屬紀念托特包！
✨ 飯綱町PR吉祥物「Mitsudon」見面會：超可愛蘋果吉祥物驚喜現身，歡迎合影留念！
🎬 飯綱町風光寫真與宣傳短片特展：為您呈現蘋果之鄉飯綱町的四季美景與風土人情。

目前長野縣飯綱町內亦正盛大舉辦秋季美味盛典「飯綱蘋果節2026」。
詳細活動資訊請參閱三井OUTLET PARK 北陸小矢部官方網站：
https://mitsui-shopping-park.com/mop/oyabe/event/3643416.html'
),
(
    'trans-news-marche-oyabe-2026-tw',
    'news-marche-oyabe-2026',
    'tw',
    '【活動】首次登陸富山！「信州飯綱蘋果市集 in 小矢部」將於10月3日（六）熱鬧登場',
    '長野縣飯綱町的香甜當季蘋果與精選特產首次進駐富山三井OUTLET PARK北陸小矢部！現場不僅有相澤農園產地直送蘋果、現烤法式翻轉蘋果塔、精釀蘋果酒等美味特產，更備有評比試飲、手作托特包工作坊及吉祥物「Mitsudon」見面會，歡迎踴躍前來！',
    '飯綱蘋果市集首次進駐富山縣！🍎🍏
2026年10月3日（六），「信州飯綱蘋果市集 in 小矢部」將於三井OUTLET PARK北陸小矢部盛大舉行。

這是一場僅限1日的特別市集，讓您在出遊逛街之際，也能品嚐到飯綱町頂級蘋果的極致美味與獨特魅力。
現場除了集結秋季當季採摘的新鮮蘋果、手工蘋果甜點、特色精釀西打酒等豐富特產外，還設有品評不同品種風味的「蘋果汁盲測品飲會」、手作原創帆布托特包工作坊，以及飯綱町風光影像展！
飯綱町超人氣官方吉祥物「Mitsudon（みつどん）」也將親臨現場與大家見面♪

趁著購物與假日休閒，誠摯邀請您與親朋好友一同前來同樂！

■ 活動概要
・時間：2026年10月3日（六）10:00〜16:00
・地點：三井OUTLET PARK 北陸小矢部 1樓東口 室內活動區
・參加費：免費（商品購買及部分體驗另計）
・主辦單位：長野縣飯綱町

■ 出展店家與推薦商品
🍎 相澤農園
　位於飯綱町最北端的果園。得益於日夜顯著溫差，培育出甜度高、果肉緊實的頂級當季蘋果。
🥧 泉之丘喫茶室
　採用名產蘋果與時令水果的手工烘焙塔專門店。招牌法式翻轉蘋果塔（Tarte Tatin）及發酵蘋果可樂人氣滿載。
🍾 林檎學校釀造所
　利用廢校小學改建的微型釀造所。販售以急速冷凍濃縮技術製成的無添加純蘋果露及頂級精釀蘋果酒。
🥮 明月堂
　創業90餘年的和洋菓子老鋪。販售英式Bramley翠玉蘋果派，以及夾入香濃蘋果餡的「Mitsudon銅鑼燒」。

■ 豐富體驗與展示活動
🍹 盲測蘋果汁試飲品評會：試飲比較不同品種蘋果汁的香氣、酸甜度與豐富層次！
🎨 原創帆布托特包手作工作坊：親手印製獨一無二的專屬紀念托特包！
✨ 飯綱町PR吉祥物「Mitsudon」見面會：超可愛蘋果吉祥物驚喜現身，歡迎合影留念！
🎬 飯綱町風光寫真與宣傳短片特展：為您呈現蘋果之鄉飯綱町的四季美景與風土人情。

目前長野縣飯綱町內亦正盛大舉辦秋季美味盛典「飯綱蘋果節2026」。
詳細活動資訊請參閱三井OUTLET PARK 北陸小矢部官方網站：
https://mitsui-shopping-park.com/mop/oyabe/event/3643416.html'
);
