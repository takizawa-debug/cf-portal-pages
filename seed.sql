-- Seed data extracted from the Google Sheet

INSERT INTO contents (
    id, type, l1, l2, l3_label, title, lead_text, body_text,
    l1_en, l2_en, l3_label_en, title_en, lead_text_en, body_text_en,
    l1_tw, l2_tw, l3_label_tw, title_tw, lead_text_tw, body_text_tw,
    image1, homepage
) VALUES 
(
    '02-02-00-0001', 'sheet_import',
    '知る', '飯綱町について', '地理とアクセス', '里山の風景が残りつつ、都市からのアクセスも良好な「ちょうどいい田舎」。', NULL, '長野県北部に位置する飯綱町は、標高500〜900mの丘陵地帯に広がる、人口およそ１万人の小さな町です。北信五岳を望む古き良き里山の風景が魅力で、昼夜の寒暖差に恵まれた気候はりんご栽培に適しており、豊かな自然と暮らしやすさを両立しています。隣接する長野市や中野市へは車で20〜30分と通勤圏内で、生活利便性も確保されています。東京からは新幹線と在来線で約2時間、大阪からも約4時間でアクセス可能。「ちょうどいい田舎」として、多くの人々を惹きつけています。',
    'Discover', 'Our Heritage', 'Geography and Access', 'An Ideal Countryside where traditional satoyama landscapes endure, yet offers excellent access to urban centers.', NULL, 'Iizuna Town, located in northern Nagano Prefecture, is a small town with a population of approximately 10,000, spread across hilly terrain at an elevation of 500 to 900 meters. Its charm lies in the timeless satoyama landscapes overlooking the Hokushin Five Mountains. The climate, blessed with significant diurnal temperature variation, is ideal for agriculture, balancing abundant nature with high livability. Neighboring Nagano City and Nakano City are within a 20-30 minute drive, ensuring convenience for daily life and commuting. Access from Tokyo is approximately 2 hours by Shinkansen and local train lines, and about 4 hours from Osaka. As an Ideal Countryside, it attracts many people.',
    '探索', '關於飯綱町', '地理與交通', '保留里山風光，同時擁有便利都市交通的「恰到好處的鄉村」。', NULL, '飯綱町位於長野縣北部，是一座人口約一萬人，座落於海拔500至900公尺丘陵地帶的小鎮。這裡的魅力在於能眺望北信五嶽的古樸里山風光，晝夜溫差大的氣候非常適合農業發展，完美結合了豐饒自然與宜居生活。開車20至30分鐘即可抵達鄰近的長野市與中野市，屬於通勤圈範圍內，生活便利性無虞。從東京搭乘新幹線與在地鐵路約2小時可達，從大阪出發也約4小時即可抵達。作為「恰到好處的鄉村」，吸引了眾多人們前來。',
    'https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/a6835820-8ee6-013e-065c-0a58a9feac02/iizuna_location.png',
    'https://www.town.iizuna.nagano.jp/docs/866.html'
),
(
    '02-02-00-0002', 'sheet_import',
    '知る', '飯綱町について', 'これまでの歩み', '伝統と挑戦が息づくりんごのまち。', NULL, '飯綱町は2005年に、旧牟礼村と旧三水村が合併して誕生しました。町の基幹産業の一つであるりんご栽培は、明治時代にはじまり、大正期の農業団体設立や昭和初期の桑畑転換を経て発展。昭和40年代には旧三水村が全国有数の生産地として「日本一のりんご村」と呼ばれました。現在も町内各地でりんご栽培が続けられており、海外品種を含めた50以上の多種多様なりんごが栽培されています。また、北国街道の宿場「牟礼宿」として栄えた歴史や、郷土料理「やたら」をはじめとする暮らしに根付いた伝統文化を守りながら、閉校した小学校を活用して、複合施設「いいづなコネクトWEST」「いいづなコネクトEAST」を開設するなど、新しいことにも挑戦し続けている町です。',
    'Discover', 'Our Heritage', 'Our Journey So Far', 'An apple town where tradition and innovation thrive.', NULL, 'Iizuna Town was formed in 2005 through the merger of the former Mure Village and former Samizu Village. Apple cultivation, one of the town''s core industries, began in the Meiji era and developed through the establishment of agricultural organizations in the Taisho period and the conversion of mulberry fields in the early Showa period. In the Showa 40s (1960s), the former Samizu Village was renowned as Japan''s premier apple-producing village. Today, apple cultivation continues throughout the town, with over 50 diverse varieties, including foreign varieties, being grown. While preserving its rich history as Mure-juku, a Post Town on the Hokkoku Kaido, and traditional cultures rooted in daily life, such as the Local Cuisine Yatara, the town also continues to embrace new challenges. This includes the establishment of the multi-purpose complexes Iizuna Connect WEST and Iizuna Connect EAST, utilizing former elementary school buildings.',
    '探索', '關於飯綱町', '歷史沿革', '傳統與創新並存的蘋果小镇。', NULL, '飯綱町於2005年由舊牟禮村與舊三水村合併而成。蘋果栽培是本町的基幹產業之一，始於明治時代，歷經大正時期農業團體的成立以及昭和初期桑田轉作，逐步發展。昭和40年代（1960年代），舊三水村曾以全國首屈一指的蘋果產地之姿，被譽為「日本第一的蘋果村」。如今，町內各地仍持續進行蘋果栽培，種植著包含海外品種在內，超過50種多樣化的蘋果。此外，本町在守護北國街道宿場「牟禮宿」的繁榮歷史，以及以在地特色料理Yatara為首，根植於生活的傳統文化的同時，也持續挑戰新事物，例如活用廢校小學，開設了複合設施「飯綱Connect WEST」與「飯綱Connect EAST」。',
    'https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/c2823380-8eef-013e-f645-0a58a9feac02/top_logoContents_sp.jpg',
    'https://www.town.iizuna.nagano.jp/docs/865.html'
),
(
    '02-02-00-0003', 'sheet_import',
    '知る', '飯綱町について', 'りんご栽培に適した気候条件', '昼夜の寒暖差と豊かな自然が、りんごの品質を高める。', NULL, '飯綱町は、標高と、内陸性気候特有の昼夜の寒暖差に恵まれ、りんご栽培に理想的な条件を備えています。日中に生成された糖分が夜間の低温で保持されることで甘みが凝縮し、実がしっかりと引き締まると言われています。加えて、糖度と酸度のバランスも抜群。澄んだ空気や豊富な水源、長い日照時間が、飯綱町ならではのりんごの美味しさを実現し、科学的にも証明されています。',
    'Discover', 'Our Heritage', 'Climate Conditions Suitable for Apple Cultivation', 'Diurnal temperature variation and abundant nature enhance the quality of apples.', NULL, 'Iizuna Town is blessed with ideal conditions for apple cultivation, thanks to its elevation and the significant diurnal temperature variation characteristic of its Inland Climate. It is said that sugars produced during the day are retained by low night temperatures, concentrating the sweetness and firming the fruit. Furthermore, the balance of Sugar Content and Acidity is exceptional. Clear air, abundant water sources, and long hours of sunshine contribute to the unique deliciousness of Iizuna Town''s apples, which has also been scientifically substantiated.',
    '探索', '關於飯綱町', '適合蘋果栽培的氣候條件', '晝夜溫差與豐饒自然，提升蘋果品質。', NULL, '飯綱町擁有得天獨厚的海拔條件，以及內陸性氣候特有的晝夜溫差，具備了蘋果栽培的理想環境。據說，白天生成的糖分在夜間低溫下得以保留，使甜味濃縮，果實也更加緊實。此外，糖度與酸度的平衡也極為出色。清澈的空氣、豐沛的水源以及充足的日照時間，共同造就了飯綱町獨有的蘋果美味，這也已獲得科學驗證。',
    'https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/f2837410-8f03-013e-e63d-0a58a9feac02/photo-intermediate.jpg',
    'https://1127.info/about/'
),
(
    '02-02-00-0004', 'sheet_import',
    '知る', '飯綱町について', 'りんごを核に描く未来戦略', '「りんご」を核に、地域資源を磨き上げる独自のまちづくりを推進。', NULL, '飯綱町は、「日本一のりんごの町」を掲げ、りんごを核とした地域戦略「輝く農山村地域創造推進プロジェクト」を展開しています。抜群の糖度と酸度のバランスや食感の科学的証明を生かした高付加価値化、未利用資源の活用、そして観光や教育と結びつけた関係人口づくりなど、りんごを中心に多方面へ波及する取り組みが進行中です。農業だけに留まらず、健康・文化・働き方までを含めた持続可能な地域モデルをかたちづくり、「ちょうどいい田舎」から新たな未来を発信しています。',
    'Discover', 'Our Heritage', 'Crafting a Future Strategy with Apples at its Core', 'Promoting unique town development that refines local resources, with apples as its central pillar.', NULL, 'Iizuna Town champions itself as ''Japan''s premier apple town,'' driving a regional strategy centered on apples, known as the ''Shining Agricultural and Mountain Village Creation Promotion Project.'' This initiative encompasses a wide range of efforts radiating from apples, including adding high value by leveraging the Scientific Substantiation of their excellent balance of sugar content and acidity, and unique Texture; utilizing untapped resources; and fostering a Relationship Population through tourism and education. Beyond agriculture, the town is shaping a Sustainable regional model that embraces health, culture, and diverse working styles, broadcasting a new future from its Ideal Countryside.',
    '探索', '關於飯綱町', '以蘋果為核心描繪的未來戰略', '以「蘋果」為核心，推動獨特的城鎮建設，精進地方資源。', NULL, '飯綱町以「日本首屈一指的蘋果小镇」為目標，推動以蘋果為核心的區域戰略「閃耀農山村地域創造推進計畫」。這項計畫以蘋果卓越的糖酸比與口感的科學驗證為基礎，致力於提升附加價值、活化未利用資源，並透過結合觀光與教育來創造「關係人口」，以蘋果為中心，多面向的措施正持續推展。這不僅限於農業，更涵蓋健康、文化、生活方式等層面，旨在建構永續的區域模式，從「恰到好處的鄉村」向世界發送嶄新的未來。',
    'https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/3bb6c340-8d6a-013e-ae9b-0a58a9feac02/20231120_mitsudon-11.jpg',
    'https://www.town.iizuna.nagano.jp/docs/10947.html'
),
(
    '02-03-00-0005', 'sheet_import',
    '知る', 'いいづなりんごの特徴', '多様な品種', '季節ごとに多彩な味が楽しめる、50種以上のりんごの宝庫。', NULL, '町内では「ふじ」「つがる」といった定番に加え、長野県生まれの「秋映」「シナノスイート」「シナノゴールド」「シナノリップ」など、さまざまな品種が栽培されています。希少な和りんごの「高坂りんご」や調理や加工に向く海外品種、さらには赤果肉りんごまで、その品種の数は50種以上。昼夜の寒暖差に恵まれた気候と豊かな水源が、多彩な味わいと高い品質を支えています。飯綱町のりんごシーズンは「ブラムリー」を皮切りに８月にスタートします。季節ごとに異なる味が楽しめるのも、多種多様なな品種を育むこの地域ならではの魅力です。',
    'Discover', 'Flavor & Science', 'Diverse Varieties', 'A treasure trove of over 50 apple varieties, offering different tastes each season.', NULL, 'In Iizuna Town, in addition to classic varieties like Fuji Apple, Tsugaru, and Orin, a rich array of unique varieties developed in Nagano Prefecture, such as Akibae, Shinano Sweet, and Shinano Gold, are cultivated. The town boasts over 50 varieties, including the rare Native Japanese Apple ''Kosaka Apple'', foreign varieties suitable for Cooking Apple, and even Red-fleshed Apples. The climate, blessed with significant Diurnal Temperature Variation, and abundant water sources support this diverse range of flavors and high quality. The ability to enjoy different tastes each season is a unique charm of this region, which cultivates such a wide variety of apples.',
    '探索', '飯綱蘋果的特徵', '多樣的蘋果品種', '超過50種蘋果的寶庫，每個季節都能品嚐到不同風味。', NULL, '飯綱町內除了「富士蘋果 (Fuji)」、「津輕蘋果 (Tsugaru)」、「王林蘋果 (Orin)」等經典品種外，還栽培著長野縣原生的「秋映蘋果 (Akiho)」、「信濃甜蘋果 (Shinano Sweet)」、「信濃黃金蘋果 (Shinano Gold)」等獨具特色的品種。從稀有的日本原生蘋果「高坂蘋果 (Kosaka Apple)」，到適合料理的西洋蘋果品種，乃至於紅肉蘋果，其數量多達50種以上。得天獨厚的晝夜溫差氣候與豐沛的水源，支持著蘋果多樣的風味與高品質。每個季節都能品嚐到不同風味，正是這個孕育多樣品種的地區獨有的魅力。',
    'https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ae3ad00-8d6a-013e-bcd3-0a58a9feac02/IMG_2898.jpg',
    NULL
),
(
    '02-03-00-0006', 'sheet_import',
    '知る', 'いいづなりんごの特徴', '高い栄養価', '食べるほどにうれしい、栄養と機能性が詰まった果実の魅力。', NULL, '「1日1個のりんごで医者いらず」（An apple a day keeps the doctor away／イギリス・ウェールズ地方に伝わることわざ）と言われるほど、りんごは食物繊維やカリウム、ビタミン類を豊富に含み、腸内環境を整えたり生活習慣病の予防に役立つ果物として知られています。特に希少な和りんごの「高坂りんご」は注目されており、老化を抑える抗酸化作用を持つプロシアニジンが「ふじ」の約10倍含まれることが研究で確認されています。さらに内臓脂肪減少効果も期待され、加工品開発にも繋がっています。そのほか赤果肉りんごに含まれるアントシアニンなど、品種ごとに機能性研究が進められています。',
    'Discover', 'Flavor & Science', 'High Nutritional Value', 'The appeal of fruit packed with nutrition and Functional Benefits, a delight with every bite.', NULL, 'Apples are known as fruits rich in dietary fiber, potassium, and vitamins, helping to regulate the intestinal environment and prevent lifestyle-related diseases. The ancient variety from Iizuna Town, ''Kosaka Apple'', is particularly noteworthy; research has confirmed it contains approximately 10 times more Procyanidin, an Antioxidant Effect that suppresses aging, than the Fuji Apple. Furthermore, its potential for Visceral Fat reduction is also anticipated, leading to the development of processed products. Beyond this, Functional Benefits research is progressing for various varieties, such as the Anthocyanin found in Red-fleshed Apples.',
    '探索', '飯綱蘋果的特徵', '高營養價值', '富含營養與機能性保健功效的果實魅力，越吃越健康。', NULL, '蘋果富含膳食纖維、鉀、維生素等，是眾所周知有助於調理腸道環境、預防生活習慣病的果實。特別是飯綱町的古老品種「高坂蘋果 (Kosaka Apple)」備受矚目，研究證實其所含的「原花青素」，具有抑制老化的「抗氧化作用」，含量約為「富士蘋果 (Fuji)」的10倍。此外，它還被期待具有內臟脂肪減少的功效，並已應用於加工品的開發。除此之外，針對紅肉蘋果所含的「花青素」等，各類品種的機能性保健功效研究也正持續進行中。',
    'https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/b4170770-8d6a-013e-bcf1-0a58a9feac02/sunfuji_mitsu-2.jpg',
    NULL
),
(
    '02-03-00-0007', 'sheet_import',
    '知る', 'いいづなりんごの特徴', 'シャキシャキの食感', '歯ごたえの良さは数値でも証明', NULL, '飯綱町産のりんごの大きな魅力は、ひと口かじった瞬間に伝わる「シャキシャキ」とした歯ごたえです。この食感は、長野県工業技術総合センターによる測定で破断強度が高いことが示され、科学的にも証明されています。背景には、昼夜の寒暖差が大きい内陸性気候があり、これによって実がしっかりと引き締まり、特有の硬さが生まれます。また、栽培環境と品種特性が合わさることで独自の歯ごたえが育まれています。味とともにこの食感にもぜひご注目ください。',
    'Discover', 'Flavor & Science', 'Crisp Texture', 'The excellent crunchiness of Iizuna apples is a scientifically proven characteristic.', NULL, 'A major appeal of Iizuna Town''s apples is the satisfying crispness that greets you with every bite. This texture is scientifically substantiated, with measurements by the Nagano Prefecture General Industrial Technology Center showing high fracture strength. This unique firmness is attributed to Iizuna''s inland climate, which features significant Diurnal Temperature Variation, causing the fruit to firm up beautifully. Depending on the variety, you can enjoy a refreshing crispness, as found in Shinano Lip and Shinano Red, where the cultivation environment and varietal characteristics combine to foster this distinctive texture.',
    '探索', '飯綱蘋果的特徵', '爽脆的口感', '絕佳咬勁經科學驗證，是飯綱蘋果的鮮明特色。', NULL, '飯綱町蘋果的巨大魅力，在於一口咬下瞬間感受到的「爽脆」咬勁。這種口感經長野縣工業技術綜合中心 (Nagano Prefecture General Industrial Technology Center) 測量顯示其斷裂強度高，亦獲得科學驗證。其背後原因在於晝夜溫差大的內陸性氣候，使果實緊實，產生獨特的硬度。部分品種如信濃麗 (Shinano Lip) 和信濃紅 (Shinano Red) 則能享受清爽的口感，栽培環境與品種特性相結合，共同孕育出獨特的咬勁。',
    'https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/02d66ae0-8d6a-013e-0556-0a58a9feac02/20230118_apple_cut-3.jpg',
    NULL
),
(
    '02-03-00-0008', 'sheet_import',
    '知る', 'いいづなりんごの特徴', '甘みと酸味のバランス', '絶妙な糖酸バランスが生み出す飯綱町産りんごの深い味わい', NULL, 'りんごの美味しさを大きく左右するのが、甘みと酸味の調和です。長野県工業技術総合センターの調査では、飯綱町産の「ふじ」が、他産地のりんごに比べ、糖度・酸度ともに高い水準を記録し、さらには一般的に美味しいとされる糖酸比（甘味と酸味のバランス）30〜40に近い数値を示しました。甘さと酸っぱさが絶妙に重なり合うことで、豊かなコクと爽やかさが生まれ、多くの人に愛される味わいとなっています。',
    'Discover', 'Flavor & Science', 'Balance of Sweetness and Acidity', 'An exquisite sugar-acid balance creates the deep, rich flavor of Iizuna apples.', NULL, 'The harmony of sweetness and acidity significantly influences an apple''s deliciousness. A study by the Nagano Prefecture General Industrial Technology Center revealed that Iizuna-grown Fuji Apples recorded high levels of both Sugar Content and acidity compared to apples from other regions. Furthermore, they exhibited a Sugar-Acid Ratio close to the generally preferred range of 30-40. This exquisite interplay of sweetness and tartness creates a rich depth of flavor and refreshing quality, making them beloved by many.',
    '探索', '飯綱蘋果的特徵', '甜度與酸度的完美平衡', '絕妙的糖酸比，造就蘋果深邃的風味。', NULL, '蘋果美味與否，甜度與酸度的和諧是關鍵。長野縣工業技術綜合中心 (Nagano Prefecture General Industrial Technology Center) 的調查顯示，飯綱町產的「富士蘋果 (Fuji)」相較於其他產地的蘋果，在糖度與酸度上均達到高水準。此外，其糖酸比（甜味與酸味的平衡）也接近一般公認美味的30至40之間。甜與酸的絕妙交織，創造出豐富的濃郁風味與清爽感，成為深受大眾喜愛的滋味。',
    'https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/cd850820-8d6a-013e-c3bf-0a58a9feac02/%E3%83%95%E3%82%99%E3%83%A9%E3%83%A0%E3%83%AA%E3%83%BC_5.jpg',
    NULL
),
(
    '02-03-00-0009', 'sheet_import',
    '知る', 'いいづなりんごの特徴', '栽培方法の特徴', '圃場の条件にあわせた栽培手法でりんご生産を守る', NULL, '町内では大きく分けて「普通（丸葉【まるば】）栽培」と「わい化（わいか）栽培」という２つの栽培方法でりんごが生産されています。普通栽培は、根がしっかり張る大きくて樹を育てて、実をならせる伝統的な栽培方法で、病気や寒さに強いのが特長です。町内には樹齢3～40年を越える木が現役で頑張っている畑も少なくありません。「古い木のほうがおいしいりんごがとれる」という声もあるくらい。一方、わい化栽培は、1本1本の木をコンパクト仕立てて、1本の木により多くの実をならせる方法で、苗を植えてから出荷できるりんごが収穫できるようになるまでが普通栽培よりも格段に速く、作業もしやすくなります。飯綱町では畑ごとの条件や農家の工夫によって両方を組み合わせることで、味わいの良さと安定した収穫を両立させています。',
    'Discover', 'Flavor & Science', 'Distinctive Cultivation Methods', 'Apple farmers employ innovative Tree Training methods to achieve both deliciousness and cultivation efficiency.', NULL, 'Apple orchards primarily utilize two cultivation methods: Standard Cultivation and Dwarfing Cultivation. Standard Cultivation involves traditional trees with deep, strong root systems that can be grown for many years, known for their resistance to disease and cold. Dwarfing Cultivation, on the other hand, involves training smaller trees planted at high density, allowing for earlier harvests and easier management. In Iizuna Town, farmers combine both methods, adapting to specific field conditions and employing their ingenuity to ensure both superior flavor and stable yields.',
    '探索', '飯綱蘋果的特徵', '栽培方法的特色', '蘋果農民巧妙運用樹型培育技術，兼顧美味與栽種便利性。', NULL, '蘋果園主要有兩種栽培方式：「丸葉 (Maruba)」和「矮化栽培 (Waika)」。丸葉 (Maruba) 是一種根系穩固、可長期培育的傳統樹型，特點是抗病耐寒。而矮化栽培 (Waika) 則是將樹木培育得較小，以高密度種植的方式，能提早收穫並方便作業。飯綱町的農民會根據各個果園的條件和自身經驗，將這兩種方法結合運用，以實現絕佳風味與穩定收成。',
    'https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/0c9c9c80-8ef3-013e-1b1b-0a58a9feac02/__1.jpg',
    NULL
);
