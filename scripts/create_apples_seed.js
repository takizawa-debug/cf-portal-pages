const fs = require('fs');
const crypto = require('crypto');

// User Provided Sorting Map
const sortOrderMap = {
"高坂林檎": 1, "ブラムリー": 2, "ベル・ド・ボスクープ": 3, "ブレナム・オレンジ": 4, "エグレモント・ラセット": 5,
"グラニー・スミス": 6, "ローズマリー・ラセット": 7, "フラワー・オブ・ケント": 8, "シナノリップ": 9, "シナノピッコロ": 10,
"シナノプッチ": 11, "シナノドルチェ": 12, "秋映": 13, "シナノスイート": 14, "シナノゴールド": 15, "シナノホッペ": 16,
"すわっこ": 17, "あいかの香り": 18, "ムーンルージュ": 19, "夏あかり": 20, "黄王": 21, "サンつがる": 22,
"紅玉": 23, "トキ": 24, "王林": 25, "ぐんま名月": 26, "サンふじ": 27, "あまみつき": 28, "アルプス乙女": 29,
"こうこう": 30, "さんさ": 31, "シナノレッド": 32, "ジョナゴールド": 33, "スリムレッド": 34, "なかののきらめき": 35,
"ひめかみ": 36, "ファーストレディ": 37, "メイポール": 38, "やたか": 39, "印度": 40, "炎舞": 41,
"弘前ふじ": 42, "紅みのり": 43, "高徳": 44, "新世界": 45, "世界一": 46, "千秋": 47, "千雪": 48,
"芳明": 49, "陽光": 50, "陸奥": 51, "恋空": 52, "アロマ": 53, "ジェームズ・グリーブ": 54,
"タイデマンズ・アーリー・ウースター": 55, "ハニー・ルージュ": 56, "レッド・センセーション": 57, "凛夏": 58,
"あおり２１": 59, "あかぎ": 60, "おいらせ": 61, "キャプテンキッド": 62, "こうたろう": 63, "サマーデビル": 64,
"サマーランド": 65, "さんたろう": 66, "ジェネバ": 67, "しなの姫": 68, "スターキングデリシャス": 69, "スパータン": 70,
"つがる姫": 71, "ドルゴクラブ": 72, "なかの真紅": 73, "ニュージョナゴールド": 74, "パール": 75, "パインアップル": 76,
"ハックナイン": 77, "はるか": 78, "ひろの香り": 79, "ほおずり": 80, "マッキントッシュ（旭）": 81, "みしま": 82,
"ムーンふじ": 83, "もりのかがやき": 84, "ルビースイート": 85, "夏の紅": 86, "夏乙女": 87, "宮美ふじ": 88,
"金星": 89, "昂林": 90, "紅将軍": 91, "秋ひかり": 92, "秋陽": 93, "春明２１": 94, "星の金貨": 95,
"青林": 96, "早生ふじ": 97, "冬彩華": 98, "藤巻": 99, "尾瀬の紅": 100, "芳明つがる": 101, "北紅": 102,
"北斗": 103, "涼香の季節": 104
};

const rawTsv = fs.readFileSync('apples_original.tsv', 'utf-8');
const tsvData = rawTsv.trim();
const lines = tsvData.split('\n');
const statements = [];

const sqlEscape = (str) => {
    if (!str) return '';
    return str.replace(/'/g, "''").replace(/\r/g, '').replace(/\n/g, ' ');
};

for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 13 || parts[0] === '品番') continue;

    const id = crypto.randomUUID();
    const name_ja = sqlEscape(parts[1]).trim();
    const name_en = sqlEscape(parts[3]).trim();
    const name_zh = sqlEscape(parts[4]).trim();
    const harvest_season = sqlEscape(parts[5]).trim();
    const lineage = sqlEscape(parts[6]).trim();
    const origin = sqlEscape(parts[7]).trim();
    const image = sqlEscape(parts[8]?.trim() || parts[9]?.trim() || '');
    const summary = sqlEscape(parts[13]).trim();
    const desc = sqlEscape(parts[14]).trim();
    if (!name_ja) continue;

    const orderNum = sortOrderMap[name_ja] || 999;

    statements.push(`  ('${id}', '${name_ja}', '${name_en}', '${name_zh}', '${harvest_season}', '${lineage}', '${origin}', '${image}', '${summary}', '${desc}', ${orderNum})`);
}

if (statements.length > 0) {
    const sql = "DROP TABLE IF EXISTS apple_varieties;\n" +
                "CREATE TABLE apple_varieties (\n" +
                "    id TEXT PRIMARY KEY,\n" +
                "    name_ja TEXT NOT NULL,\n" +
                "    name_en TEXT,\n" +
                "    name_zh TEXT,\n" +
                "    harvest_season TEXT,\n" +
                "    lineage TEXT,\n" +
                "    origin TEXT,\n" +
                "    official_image_url TEXT,\n" +
                "    summary TEXT,\n" +
                "    description TEXT,\n" +
                "    display_order INTEGER,\n" +
                "    created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n" +
                ");\n\n" +
                "INSERT INTO apple_varieties (id, name_ja, name_en, name_zh, harvest_season, lineage, origin, official_image_url, summary, description, display_order) VALUES \n" + statements.join(",\n") + ";\n";
    fs.writeFileSync('apples_seed.sql', sql);
    console.log("Seed SQL written to apples_seed.sql with " + statements.length + " inserts.");
}
