-- 2026年9月20日開催「ちょっと寄り道 いいづなまち案内所」JR長野駅PRイベント お知らせ追加データ

INSERT OR REPLACE INTO contents (
    id, author_id, type, status, site_scope,
    l1, l2, l3_label, title, lead_text, body_text,
    homepage, related1_url, related1_title,
    start_date, end_date, start_time, end_time,
    target_audience, fee, organizer_name,
    media_assets, created_at, updated_at
) VALUES (
    'news-nagano-station-pr-2026',
    'admin-user',
    'news',
    'published',
    'main',
    '知る',
    'お知らせ',
    'イベント',
    '【イベント】JR長野駅に飯綱町が1日限定で出張！「ちょっと寄り道 いいづなまち案内所」を9月20日(日)に開催します',
    'JR長野駅から約40分！遠いようで遠くない“ちょうどいい田舎町”の臨時案内所が、1日限定でJR長野駅にオープンします。飯綱町産りんごジュースの試飲＆推し投票やPRキャラクター「みつどん」の登場など、飯綱町の魅力をお届けします。',
    'JR長野駅から約40分！遠いようで遠くない“ちょうどいい田舎町”飯綱町の臨時案内所「ちょっと寄り道 いいづなまち案内所」が、1日限定でJR長野駅にオープンします🍎

お出かけやお買い物のついでに、ふらっと飯綱町の魅力に触れてみませんか？

■ 開催概要
・日時：2026年9月20日（日）10:00〜16:00
・場所：JR長野駅 在来線改札前広場（オリンピックエンブレム前）

■ 主なイベント内容
🍎 飯綱町産りんごジュースの試飲 ＆ 推しジュース投票
　50種類以上のりんごが育つ飯綱町から厳選した4品種のジュースを飲み比べ！お気に入りの味にぜひ投票してください。
✨ 飯綱町PRキャラクター「みつどん」登場！
　JR長野駅にみつどんがやってきます。
　（登場時間：①10:00〜 / ②11:30〜 / ③14:00〜 / ④15:30〜）
📖 観光・農産物パンフレット配布 ＆ ふるさと納税のご案内
🎁 来場者特典：当日アンケートにお答えいただいた方に「可愛いりんご缶バッジ」をプレゼント（数量限定）

現在町内では、秋の味覚を満喫する「いいづなりんごフェア」（9月5日〜11月29日）も開催中です。イベントを楽しんだあとは、ぜひ町内へも足を延ばしてみてくださいね。

イベントの詳細につきましては、下記プレスリリースをご覧ください。

👉 詳しくはこちら（PR TIMES プレスリリース）：
https://prtimes.jp/main/html/rd/p/000000295.000076519.html',
    'https://prtimes.jp/main/html/rd/p/000000295.000076519.html',
    'https://prtimes.jp/main/html/rd/p/000000295.000076519.html',
    '【PR TIMES】JR長野駅に、飯綱町が1日限定で“出張”！',
    '2026-09-20',
    '2026-09-20',
    '10:00',
    '16:00',
    'どなたでもお気軽にお越しください',
    '参加無料（試飲無料）',
    '飯綱町',
    '["/img/news/nagano_station_pr_2026_1.webp","/img/news/nagano_station_pr_2026_2.webp","/img/news/nagano_station_pr_2026_3.webp","/img/news/nagano_station_pr_2026_4.webp"]',
    '2026-09-17 10:00:00',
    '2026-09-17 10:00:00'
);

-- 多言語翻訳データ
INSERT OR REPLACE INTO content_translations (id, content_id, locale, title, lead_text, body_text)
VALUES
(
    'trans-news-nagano-station-pr-2026-en',
    'news-nagano-station-pr-2026',
    'en',
    '[Event] Iizuna Town Comes to JR Nagano Station for One Day Only! "Stop by Iizuna Information Center" on Sunday, Sep 20',
    'A special one-day pop-up visitor center is opening at JR Nagano Station! Enjoy free apple juice tastings and voting, meet mascot Mitsudon, and discover Iizuna Town.',
    'Just 40 minutes from JR Nagano Station! A special one-day pop-up visitor center, "Stop by Iizuna Information Center," will open at JR Nagano Station on Sunday, September 20, 2026.

■ Event Details
・ Date & Time: Sunday, September 20, 2026, 10:00 - 16:00
・ Location: JR Nagano Station Concourse (in front of the Olympic Emblem / Conventional Line Gate)

■ Highlights
🍎 Apple Juice Tasting & Voting: Sample 4 curated varieties of 100% pure apple juice from Iizuna Town and vote for your favorite!
✨ Meet Mascot "Mitsudon": Appearing at 10:00, 11:30, 14:00, and 15:30.
📖 Sightseeing Brochures & Furusato Nozei (Hometown Tax) Guidance
🎁 Special Gift: Complete a quick survey on-site to receive an original apple badge (limited quantity).

The autumn "Iizuna Apple Fair" (Sep 5 – Nov 29) is also underway in town!

For more details, please visit the press release below:
https://prtimes.jp/main/html/rd/p/000000295.000076519.html'
),
(
    'trans-news-nagano-station-pr-2026-zh',
    'news-nagano-station-pr-2026',
    'zh',
    '【活動】飯綱町1日限定快閃JR長野站！「順道造訪 飯綱町臨時服務處」將於9月20日（日）登場',
    '距離JR長野站約40分鐘！1日限定快閃服務處「順道造訪 飯綱町臨時服務處」將於JR長野站登場。現場提供飯綱町產蘋果汁試飲投票、吉祥物「Mitsudon」見面會等精彩活動。',
    '距離JR長野站約40分鐘，不遠也不近、恰到好處的鄉村小鎮——飯綱町，將於JR長野站開設1日限定的「順道造訪 飯綱町臨時服務處」🍎

出門旅遊或逛街時，歡迎順道來感受飯綱町的魅力！

■ 活動概要
・時間：2026年9月20日（日）10:00〜16:00
・地點：JR長野站 在來線剪票口前廣場（奧運標誌前）

■ 主要活動內容
🍎 飯綱町產蘋果汁試飲 ＆ 推薦投票：從盛產50種以上蘋果的飯綱町中精選4種蘋果汁試飲比較，選出您最喜愛的口味！
✨ 飯綱町宣傳吉祥物「Mitsudon」登場！（現身時間：①10:00〜 / ②11:30〜 / ③14:00〜 / ④15:30〜）
📖 觀光農產手冊發送 ＆ 故鄉納稅諮詢
🎁 來場特典：現場填寫問卷即可獲贈精美蘋果胸章（數量有限）

目前町內亦正盛大舉辦「飯綱蘋果節」（9月5日〜11月29日），誠摯邀請您順道造訪飯綱町。

詳細活動資訊請參閱以下新聞稿：
https://prtimes.jp/main/html/rd/p/000000295.000076519.html'
),
(
    'trans-news-nagano-station-pr-2026-tw',
    'news-nagano-station-pr-2026',
    'tw',
    '【活動】飯綱町1日限定快閃JR長野站！「順道造訪 飯綱町臨時服務處」將於9月20日（日）登場',
    '距離JR長野站約40分鐘！1日限定快閃服務處「順道造訪 飯綱町臨時服務處」將於JR長野站登場。現場提供飯綱町產蘋果汁試飲投票、吉祥物「Mitsudon」見面會等精彩活動。',
    '距離JR長野站約40分鐘，不遠也不近、恰到好處的鄉村小鎮——飯綱町，將於JR長野站開設1日限定的「順道造訪 飯綱町臨時服務處」🍎

出門旅遊或逛街時，歡迎順道來感受飯綱町的魅力！

■ 活動概要
・時間：2026年9月20日（日）10:00〜16:00
・地點：JR長野站 在來線剪票口前廣場（奧運標誌前）

■ 主要活動內容
🍎 飯綱町產蘋果汁試飲 ＆ 推薦投票：從盛產50種以上蘋果的飯綱町中精選4種蘋果汁試飲比較，選出您最喜愛的口味！
✨ 飯綱町宣傳吉祥物「Mitsudon」登場！（現身時間：①10:00〜 / ②11:30〜 / ③14:00〜 / ④15:30〜）
📖 觀光農產手冊發送 ＆ 故鄉納稅諮詢
🎁 來場特典：現場填寫問卷即可獲贈精美蘋果胸章（數量有限）

目前町內亦正盛大舉辦「飯綱蘋果節」（9月5日〜11月29日），誠摯邀請您順道造訪飯綱町。

詳細活動資訊請參閱以下新聞稿：
https://prtimes.jp/main/html/rd/p/000000295.000076519.html'
);
