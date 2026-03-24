const fs = require('fs');
const crypto = require('crypto');

const rawData = `
大カテゴリ	中カテゴリ	小カテゴリ	大カテゴリ_en	中カテゴリ_en	小カテゴリ_en	大カテゴリ_中文	中カテゴリ_中文	小カテゴリ_中文
知る	飯綱町について		Discover	Our Heritage		探索	關於飯綱町	
知る	いいづなりんごの特徴		Discover	Flavor & Science		探索	飯綱蘋果的特徵	
知る	栽培されている品種	町指定天然記念物	Discover	Apple Varieties	Heirloom & Monuments	探索	蘋果品種 	天然紀念物品種
知る	栽培されている品種	定番品種	Discover	Apple Varieties	Classic Varieties	探索	蘋果品種 	經典品種
知る	栽培されている品種	長野県生まれの品種	Discover	Apple Varieties	Nagano-Bred Varieties	探索	蘋果品種 	長野原創品種
知る	栽培されている品種	海外品種	Discover	Apple Varieties	International Varieties	探索	蘋果品種 	海外引進品種
知る	栽培されている品種	その他注目品種	Discover	Apple Varieties	Specialty Varieties	探索	蘋果品種 	人氣注目品種
知る	飯綱町のりんご愛	みつどん	Discover	Apple Culture	Mitsudon: Town Mascot	探索	蘋果文化	吉祥物「Mitsudon」
味わう	りんごが買えるお店		Savor	Where to Buy		品味	蘋果販售據點	
味わう	生産者		Savor	Meet the Growers		品味	走訪生產者	
味わう	加工品		Savor	Artisan Products		品味	蘋果加工精品	
味わう	イベント		Savor	Seasonal Events		品味	季節活動與慶典	
体験する	農業体験		Experience	Hands-on Farming		體驗	農事體驗	
体験する	滞在	飲食店	Experience	Where to Stay	Dining	體驗	深度停留	美食餐廳
体験する	滞在	宿泊	Experience	Where to Stay	Accommodations	體驗	深度停留	住宿指南
体験する	滞在	入浴	Experience	Where to Stay	Onsen & Baths	體驗	深度停留	溫泉與入浴
体験する	滞在	フォトスポット	Experience	Where to Stay	Photo Spots	體驗	深度停留	攝影私房景點
体験する	アクセス		Experience	Getting Around		體驗	交通指南	
体験する	アクセス	町内での移動	Experience	Getting Around	Local Transport	體驗	交通指南	町內交通方式
暮らす	就労		Lifestyle	Work Opportunities		定居	在地就業	
暮らす	移住		Lifestyle	Settling In		定居	移居支援	
暮らす	就農		Lifestyle	Start Farming		定居	農業創業	
営む	栽培支援	講習会	Business	Grower Support	Workshops	推廣	栽培支援	技術講習會
営む	栽培支援	補助金	Business	Grower Support	Grants & Subsidies	推廣	栽培支援	政府補助金
営む	出荷・加工施設		Business	Infrastructure		推廣	基礎設施與加工廠	
営む	販売促進		Business	Marketing & Sales		推廣	行銷與品牌推廣	
`;

const lines = rawData.trim().split('\n');
const values = [];

// Skip header line
for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const parts = line.split('\t').map(p => p ? p.trim().replace(/'/g, "''") : '');

    // Fallbacks if fewer columns
    while (parts.length < 9) {
        parts.push('');
    }

    const [l1, l2, l3, l1_en, l2_en, l3_en, l1_zh, l2_zh, l3_zh] = parts;

    const id = crypto.randomUUID();
    values.push(`('${id}', '${l1}', '${l2}', '${l3}', '${l1_en}', '${l2_en}', '${l3_en}', '${l1_zh}', '${l2_zh}', '${l3_zh}')`);
}

const sql = `
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    l1 TEXT,
    l2 TEXT,
    l3 TEXT,
    l1_en TEXT,
    l2_en TEXT,
    l3_en TEXT,
    l1_zh TEXT,
    l2_zh TEXT,
    l3_zh TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

DELETE FROM categories;
INSERT INTO categories (id, l1, l2, l3, l1_en, l2_en, l3_en, l1_zh, l2_zh, l3_zh) VALUES
${values.join(',\n')};
`;

fs.writeFileSync('seed_categories.sql', sql);
console.log('Saved to seed_categories.sql');
