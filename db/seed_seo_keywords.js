const fs = require('fs');
const crypto = require('crypto');

const rawData = `
Eバイク	E-bike	電動自行車
iバス	i-Bus	i巴士
JAながの	JA Nagano	JA長野
Wi-Fi	Wi-Fi	Wi-Fi
アップルパイ	Apple Pie	蘋果派
アップルミュージアム	Iizuna Apple Museum	飯綱蘋果博物館
アンテナショップ	Regional Product Shop	地方特產展售店
アントシアニン	Anthocyanin	花青素
いいコネワークス	Ii-Cone Works	Ii-Cone Works
いいづなコネクト	Iizuna Connect	飯綱Connect
オンライン相談	Online Consultation	線上諮詢
お試し住宅	Trial Housing	移居體驗住宅
カーブミラー	Curve Mirror	彎道反射鏡
カルヴァドス	Calvados	蘋果白蘭地
きおう	Kiou	黃王
クッキングアップル	Cooking Apple	料理用蘋果
コミュニティ	Community	社群
サイクリング	Cycling	單車旅行
さんちゃん	San-chan	三醬農產物直銷所
サンふじ	Sun Fuji	陽光富士
シードル	Cider	蘋果酒
スイーツ	Sweets	甜點
スムージー	Smoothie	果昔
そば	Soba	蕎麥麵
タクシー	Taxi	計程車
ちょうどいい田舎	Ideal Countryside	恰到好處的鄉村
つがる	Tsugaru	津輕
デマンドワゴン	On-demand Wagon	預約式共乘計程車
ニュートン	Newton's Apple Tree	牛頓蘋果樹
ハニー・ルージュ	Honey Rouge	蜜紅
ハローワーク	Hello Work	公共職業安定所
フォトスポット	Photo Spot	攝影私房景點
ふじ	Fuji Apple	富士蘋果
ふるさと納税	Hometown Tax Donation	故鄉納稅
プロシアニジン	Procyanidin	原花青素
ぼたんこしょう	Botan-kosho	牡丹胡椒
ホットアップルサイダー	Hot Apple Cider	熱蘋果酒
みつどん	Mitsudon	蜜咚
むーちゃん	Mu-chan	姆醬飯綱市集
むれ温泉	Mure Onsen	牟禮溫泉
やたら	Yatara	在地特色料理Yatara
よこ亭	Yokotei	橫手蕎麥麵處
よるタク	Yorutaku	夜間計程車
りんごジャム	Apple Jam	蘋果果醬
りんごジュース	Apple Juice	蘋果汁
りんごスイーツ	Apple Sweets	蘋果甜點
りんごの木オーナー	Apple Tree Patronage	蘋果樹認養制度
りんご学校	Iizuna Apple School	飯綱蘋果學校
リンゴ部	Iizuna Apple Club	飯綱蘋果社
りんご並木	Apple Tree Avenue	蘋果樹道
レンタカー	Rent-a-car	租車
ワーキングホリデー	Working Holiday	農業打工度假
ワイナリー	Winery	酒莊
わい化栽培	Dwarfing Cultivation	矮化栽培
移住	Relocation	移居
移住体験ツアー	Relocation Experience Tour	移居體驗之旅
運行ダイヤ	Schedule	營運班次
運賃	Fare	車資
王林	Orin	王林
加工用	For Processing	加工用
夏りんご	Summer Apple	夏蘋果
家賃助成	Rent Subsidy	租金補助
科学的証明	Scientific Substantiation	科學驗證
学び	Learning	學習
寒暖差	Diurnal Temperature Variation	晝夜溫差
関係人口	Relationship Population	關係人口
丸葉栽培	Standard Cultivation	丸葉栽培
寄贈	Donation	捐贈
機能性	Functional Benefits	機能性保健功效
技術継承	Skills Succession	技術傳承
丘陵地帯	Hilly Terrain	丘陵地帶
求人	Job Openings	徵才
共同利用	Shared Use	共同利用
郷土料理	Local Cuisine	在地特色料理
玉回し	Fruit Rotation	轉果
空き家	Vacant House	空屋
迎車	Taxi Pickup Service	接送
結婚新生活	Newlywed Life Support	結婚新生活支援
古民家	Traditional Japanese House	古民家
戸隠山	Mt. Togakushi	戸隠山
効率化	Efficiency Optimization	效率化
抗酸化作用	Antioxidant Effect	抗氧化作用
高坂りんご	Kosaka Apple	高坂蘋果
黒姫山	Mt. Kurohime	黑姫山
坂道	Slope	坡道
撮影名所	Famous Photo Spot	攝影名勝
三水	Samizu	三水
酸味	Acidity	酸度
仕立て	Tree Training	樹型培育
四季彩	Shikisai	四季彩直銷所
子育て	Childcare	育兒
歯ごたえ	Crunchiness	咬勁
持続可能	Sustainable	永續
時刻表	Timetable	時刻表
受粉	Pollination	授粉
収穫体験	Harvesting Experience	採摘體驗
就農	Start Farming	從事農業
就農コーディネーター	Farming Coordinator	務農協調員
就農計画	Farming Plan	務農計畫
宿場町	Post Town	宿場町
奨学金返還	Scholarship Repayment	獎學金還款
焼き菓子	Baked Goods	烘焙點心
省力化	Labor-saving	省力化
醸造所	Cidery	釀造所
食べ比べ	Tasting Comparison	品嚐比較
食感	Texture	口感
信州そば	Shinshu Soba	信州蕎麥麵
新幹線	Shinkansen	新幹線
新規就農	New Farmer	新規就農
新規就農者	New Farmers	新進農民
生食用	For Fresh Eating	生食用
西洋りんご	Western Apple	西洋蘋果
赤果肉りんご	Red-fleshed Apple	紅肉蘋果
接ぎ木	Grafting	嫁接
雪ねむりりんご	Yuki-nemuri Apple	雪藏熟成蘋果
雪むろ	Snow Cellar	雪室
雪むろ熟成	Snow-aged	雪室熟成
草刈り	Weeding	除草
体験型	Experiential	體驗型
担い手	Successors	農業接班人
地域おこし協力隊	Local Vitalization Cooperator	地方創生協力隊
地域づくり	Community Building	社區營造
直売所	Farm Stand	農產物直売所
直販	Direct Sales	直銷
通販サイト	Online Store	網購平台
低温障害	Frost Damage	低溫災害
定期便	Subscription Box	定期配送組合
定住	Settling In	定居
定住支援	Settlement Support	定住支援
摘果	Thinning	摘果
摘果りんご	Thinned Apple	疏果蘋果
天狗の館	Tengu no Yakata	天狗之館
展示	Exhibition	展示
糖酸比	Sugar-Acid Ratio	糖酸比
糖度	Sugar Content	糖度
内臓脂肪	Visceral Fat	內臟脂肪
内陸性気候	Inland Climate	內陸性氣候
農業体験	Farming Experience	農事體驗
農業用機械	Agricultural Machinery	農業機械
農政	Agricultural Policy	農政
農地確保	Securing Farmland	取得農地
配車	Dispatch	叫車
配送	Shipping	配送
買い物	Shopping	購物
飯縄山	Mt. Iizuna	飯繩山
標高	Elevation	海拔
苗木	Sapling	苗木
苗木導入	Sapling Introduction	苗木引進
補助金	Subsidies	補助金
豊かな自然	Abundant Nature	豐饒自然
防除	Pest Control	病蟲害防治
北国街道	Hokkoku Kaido	北國街道
北信五岳	Hokushin Five Mountains	北信五嶽
蜜入り	Honeycore	結蜜
妙高山	Mt. Myoko	妙高山
無料職業紹介所	Job Placement Office	免費職業介紹所
牟礼	Mure	牟禮
牟礼駅	Mure Station	牟禮站
牟礼宿	Mure-juku	牟禮宿
訳ありりんご	Value Grade Apples	特惠蘋果
葉摘み	Leaf Removal	摘葉
利便性	Convenience	便利性
里山	Satoyama	里山
里親研修	Agricultural Mentorship	農事導師研修
里親制度	Mentorship Program	里親制度
霊仙寺山	Mt. Reisenji	靈仙寺山
和りんご	Native Japanese Apple	日本原生蘋果
剪定	Pruning	修剪
8月	August	8月
9月	September	9月
10月	October	10月
11月	November	11月
12月	December	12月
春	Spring	春季
夏	Summer	夏季
秋	Autumn	秋季
冬	Winter	冬季
高坂林檎	Kosaka Apple	高坂苹果
ブラムリー	Bramley's Seedling	布拉姆利
ベル・ド・ボスクープ	Belle de Boskoop	博士库普
ブレナム・オレンジ	Blenheim Orange	布伦海姆橙
エグレモント・ラセット	Egremont Russet	埃格雷蒙特
グラニー・スミス	Granny Smith	澳洲青苹果
ローズマリー・ラセット	Rosemary Russet	迷迭香
フラワー・オブ・ケント	Flower of Kent	肯特之花
シナノリップ	Shinano Lip	信浓唇
シナノピッコロ	Shinano Piccolo	信浓笛
シナノプッチ	Shinano Putch	信浓普奇
シナノドルチェ	Shinano Dolce	信浓多切
秋映	Akibae	秋映
シナノスイート	Shinano Sweet	信浓甜
シナノゴールド	Shinano Gold	信浓金
シナノホッペ	Shinano Hoppe	信浓頰
すわっこ	Suwakko	诹访子
あいかの香り	Aika no Kaori	爱香之香
ムーンルージュ	Moon Rouge	月亮胭脂
夏あかり	Natsuakari	夏之灯
黄王	Kiou	黄王
サンつがる	Sun Tsugaru	太阳津轻
紅玉	Jonathan	紅玉
トキ	Toki	土岐
王林	Orin	王林
ぐんま名月	Gunma Meigetsu	群马名月
サンふじ	Sun Fuji	太阳富士
あまみつき	Amamitsuki	甘蜜月
アルプス乙女	Alps Otome	阿尔卑斯少女
こうこう	Koko	佼佼
さんさ	Sansa	珊莎
シナノレッド	Shinano Red	信浓红
ジョナゴールド	Jonagold	乔纳金
スリムレッド	Slim Red	细红
なかののきらめき	Nakano no Kirameki	中野之煌
ひめかみ	Himekami	姬神
ファーストレディ	First Lady	第一夫人
メイポール	Maypole	五月柱
やたか	Yataka	八隆
印度	Indo	印度
炎舞	Enbu	炎舞
弘前ふじ	Hirosaki Fuji	弘前富士
紅みのり	Beni Minori	红稔
高徳	Kotoku	高德
新世界	Shinsekai	新世界
世界一	Sekai Ichi	世界一
千秋	Chiaki	千秋
千雪	Chiyuki	千雪
芳明	Yoshiaki	芳明
陽光	Yoko	阳光
陸奥	Mutsu	陆奥
恋空	Koizora	恋空
アロマ	Aroma	芳香
ジェームズ・グリーブ	James Grieve	詹姆斯格里夫
タイデマンズ・アーリー・ウースター	Tydeman's Early Worcester	泰德曼早熟伍斯特
ハニー・ルージュ	Honey Rouge	蜜胭脂
レッド・センセーション	Red Sensation	红色轰动
凛夏	Rinka	凛夏
あおり２１	Aori 21	青里21
あかぎ	Akagi	赤城
おいらせ	Oirase	奥入濑
キャプテンキッド	Captain Kidd	基德船长
こうたろう	Kotaro	幸太郎
サマーデビル	Summer Devil	夏日恶魔
サマーランド	Summerland	夏日地
さんたろう	Santaro	三太郎
ジェネバ	Geneva	日内瓦
しなの姫	Shinano Hime	信浓姬
スターキングデリシャス	Starking Delicious	星王
スパータン	Spartan	斯巴达
つがる姫	Tsugaru Hime	津轻姬
ドルゴクラブ	Dolgo Crab	多格海棠
なかの真紅	Nakano Shinku	中野真红
ニュージョナゴールド	New Jonagold	新乔纳金
ローズパール	Rose Pearl	玫瑰珍珠
パインアップル	Pitmaston Pineapple	皮特马斯顿菠萝
ハックナイン	Hack Nine	哈克ナイン
はるか	Haruka	遥
ひろの香り	Hiro no Kaori	广之香
ほおずり	Hoozuri	亲吻
マッキントッシュ（旭）	McIntosh	旭
みしま	Mishima	三岛
ムーンふじ	Moon Fuji	月富士
もりのかがやき	Mori no Kagayaki	森之辉
ルビースイート	Ruby Sweet	红宝石甜
夏の紅	Natsu no Beni	夏之红
夏乙女	Natsu Otome	夏少女
宮美ふじ	Miyabi Fuji	宮美富士
金星	Kinsei	金星
昂林	Korin	昂林
紅将軍	Beni Shogun	红将军
秋ひかり	Aki Hikari	秋光
秋陽	Shuyo	秋阳
春明２１	Shunmei 21	春明21
星の金貨	Hoshi no Kinka	星之金币
青林	Seirin	青林
早生ふじ	Wase Fuji	早生富士
冬彩華	Tosaka	冬彩华
藤巻	Fujimaki	藤卷
尾瀬の紅	Oze no Beni	尾濑之红
芳明つがる	Yoshiaki Tsugaru	芳明津轻
北紅	Kitabeni	北红
北斗	Hokuto	北斗
涼香の季節	Ryoka no Kisetsu	凉香之季节`;

const lines = rawData.trim().split('\n');
const values = [];
const seen = new Set();

for (let line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length >= 3) {
        let ja = parts[0].trim();
        let en = parts[1].trim();
        let zh = parts[2].trim();

        // Construct the keyword natively with metadata
        let keyword = `${ja} (en: ${en}, zh: ${zh})`;

        // Escape single quotes for SQL
        keyword = keyword.replace(/'/g, "''");

        if (!seen.has(keyword)) {
            seen.add(keyword);
            const id = crypto.randomUUID();
            values.push(`('${id}', '${keyword}')`);
        }
    }
}

// Clear table first to prevent duplicates matching old simple strings, then insert
const sql = `
DELETE FROM seo_keywords;
INSERT INTO seo_keywords (id, keyword) VALUES
${values.join(',\n')};
`;

fs.writeFileSync('seed_seo_keywords.sql', sql);
console.log('Saved to seed_seo_keywords.sql');
