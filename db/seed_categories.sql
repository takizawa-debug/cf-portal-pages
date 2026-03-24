
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
('6a252161-be48-44c8-b9dd-3f670dba870a', '知る', '飯綱町について', '', 'Discover', 'Our Heritage', '', '探索', '關於飯綱町', ''),
('0fddaed1-e40e-4751-b9ad-e55627a35254', '知る', 'いいづなりんごの特徴', '', 'Discover', 'Flavor & Science', '', '探索', '飯綱蘋果的特徵', ''),
('b27d0ad8-9b3e-4563-8019-a416277c8725', '知る', '栽培されている品種', '町指定天然記念物', 'Discover', 'Apple Varieties', 'Heirloom & Monuments', '探索', '蘋果品種', '天然紀念物品種'),
('5b75be88-a738-4bc1-93a5-92142d0705ea', '知る', '栽培されている品種', '定番品種', 'Discover', 'Apple Varieties', 'Classic Varieties', '探索', '蘋果品種', '經典品種'),
('2c0e361a-3ea0-4b74-9066-689e8f31dbac', '知る', '栽培されている品種', '長野県生まれの品種', 'Discover', 'Apple Varieties', 'Nagano-Bred Varieties', '探索', '蘋果品種', '長野原創品種'),
('2f825cbf-23d5-43b3-97f2-e2a4f3220120', '知る', '栽培されている品種', '海外品種', 'Discover', 'Apple Varieties', 'International Varieties', '探索', '蘋果品種', '海外引進品種'),
('0c6606c5-906a-4211-9242-8dce12979ff3', '知る', '栽培されている品種', 'その他注目品種', 'Discover', 'Apple Varieties', 'Specialty Varieties', '探索', '蘋果品種', '人氣注目品種'),
('322587cf-1802-472f-b66b-8661eacd31d6', '知る', '飯綱町のりんご愛', 'みつどん', 'Discover', 'Apple Culture', 'Mitsudon: Town Mascot', '探索', '蘋果文化', '吉祥物「Mitsudon」'),
('1f8a7d04-53a8-4b62-bb9f-fffbee06a9c2', '味わう', 'りんごが買えるお店', '', 'Savor', 'Where to Buy', '', '品味', '蘋果販售據點', ''),
('77b6b692-fb39-43b8-ac80-b4d6ce1252c6', '味わう', '生産者', '', 'Savor', 'Meet the Growers', '', '品味', '走訪生產者', ''),
('fbbe3fcf-405b-4592-847b-a1476201861b', '味わう', '加工品', '', 'Savor', 'Artisan Products', '', '品味', '蘋果加工精品', ''),
('71c41a4e-4fa5-4481-8916-e5c1f33b5ca4', '味わう', 'イベント', '', 'Savor', 'Seasonal Events', '', '品味', '季節活動與慶典', ''),
('b25df159-fd40-4094-9ba5-85f9db468430', '体験する', '農業体験', '', 'Experience', 'Hands-on Farming', '', '體驗', '農事體驗', ''),
('52182821-790e-4d78-9af3-a654061584df', '体験する', '滞在', '飲食店', 'Experience', 'Where to Stay', 'Dining', '體驗', '深度停留', '美食餐廳'),
('899622df-234e-43bd-a33c-6d36a90c85af', '体験する', '滞在', '宿泊', 'Experience', 'Where to Stay', 'Accommodations', '體驗', '深度停留', '住宿指南'),
('af30d281-1622-4144-9afa-f94b80b90e0c', '体験する', '滞在', '入浴', 'Experience', 'Where to Stay', 'Onsen & Baths', '體驗', '深度停留', '溫泉與入浴'),
('278a4036-6daa-47cf-a949-986e28949528', '体験する', '滞在', 'フォトスポット', 'Experience', 'Where to Stay', 'Photo Spots', '體驗', '深度停留', '攝影私房景點'),
('9bb4c2e5-d0f7-48f1-a299-80ee76cdb1ec', '体験する', 'アクセス', '', 'Experience', 'Getting Around', '', '體驗', '交通指南', ''),
('b4977f7a-0774-42fe-b1e3-21b29f6b253b', '体験する', 'アクセス', '町内での移動', 'Experience', 'Getting Around', 'Local Transport', '體驗', '交通指南', '町內交通方式'),
('d568af63-9aff-4683-8ef0-15fd6b909f51', '暮らす', '就労', '', 'Lifestyle', 'Work Opportunities', '', '定居', '在地就業', ''),
('6d3b3936-7e9d-485a-bf8e-29bc7ac08748', '暮らす', '移住', '', 'Lifestyle', 'Settling In', '', '定居', '移居支援', ''),
('6066bfe7-c583-4c9b-8d6c-638795663435', '暮らす', '就農', '', 'Lifestyle', 'Start Farming', '', '定居', '農業創業', ''),
('aabe3780-c8c4-41fb-a94f-d61917064376', '営む', '栽培支援', '講習会', 'Business', 'Grower Support', 'Workshops', '推廣', '栽培支援', '技術講習會'),
('b8abf14f-6cd9-4127-b317-f92b8e7b6558', '営む', '栽培支援', '補助金', 'Business', 'Grower Support', 'Grants & Subsidies', '推廣', '栽培支援', '政府補助金'),
('f7da82f2-36db-425e-97c0-ff828b2849b7', '営む', '出荷・加工施設', '', 'Business', 'Infrastructure', '', '推廣', '基礎設施與加工廠', ''),
('fd402fcf-d7f6-40d6-a12c-c2c2078b80ec', '営む', '販売促進', '', 'Business', 'Marketing & Sales', '', '推廣', '行銷與品牌推廣', '');
