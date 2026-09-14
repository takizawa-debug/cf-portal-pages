-- お知らせ（news-20260901-01）の本文内リンク修正
UPDATE contents
SET body_text = '飯綱町では、りんご農家の繁忙期を支える援農者を育成するため、「飯綱町りんご援農スクール」を開講します。
実際のりんご園地で、葉摘み・収穫・選果などの基礎を学べる無料講習です（全3回・受講証明書発行）。

【募集概要】
・募集人数：8名まで（参加費無料）
・申込期限：令和8年9月10日（木曜日）
・開催期間：令和8年9月〜11月頃（全3回・各回2日間）

詳細な講習カリキュラムおよび募集要項は、農業体験ページよりご確認いただけます。
👉 農業体験記事：/experience.html?id=14-14-00-0020

【オンライン受講申込フォーム】
https://logoform.jp/form/n5eq/1777059
※申込者が募集人数を上回った場合は、選考の上受講者を決定します。'
WHERE id = 'news-20260901-01';

UPDATE content_translations
SET body_text = 'Iizuna Town is offering a free practical training school to learn apple farming skills such as leaf removal, harvesting, and sorting in real orchards.

- Capacity: 8 participants (Free)
- Deadline: September 10, 2026
- Details & Experience: /experience.html?id=14-14-00-0020
- Application Form: https://logoform.jp/form/n5eq/1777059'
WHERE id = 'trans-news-20260901-01-en';

UPDATE content_translations
SET body_text = '飯綱町開辦免費實地培訓課程，於果園中實際學習摘葉、採收、選果等農事技能。

・招生名額：上限8名（免費）
・報名截止：2026年9月10日（四）
・詳細資訊（農業體驗）：/experience.html?id=14-14-00-0020
・報名連結：https://logoform.jp/form/n5eq/1777059'
WHERE id = 'trans-news-20260901-01-zh';
