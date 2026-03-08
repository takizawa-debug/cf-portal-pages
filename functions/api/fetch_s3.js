export async function onRequestGet(context) {
    const { env } = context;
    const bucket = env.UPLOAD_BUCKET;
    const log = [];
    let successCount = 0;
    let notFoundCount = 0;

    const newUrls = [
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%82%B5%E3%83%B3%E3%81%B5%E3%81%98.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%81%82%E3%81%BE%E3%81%BF%E3%81%A4%E3%81%8D.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%82%A2%E3%83%AB%E3%83%97%E3%82%B9%E4%B9%99%E5%A5%B3.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%81%93%E3%81%86%E3%81%93%E3%81%86.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%81%95%E3%82%93%E3%81%95.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%82%B7%E3%83%8A%E3%83%8E%E3%83%AC%E3%83%83%E3%83%89.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%82%B8%E3%83%A7%E3%83%8A%E3%82%B4%E3%83%BC%E3%83%AB%E3%83%89.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%82%B9%E3%83%AA%E3%83%A0%E3%83%AC%E3%83%83%E3%83%89.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%81%AA%E3%81%8B%E3%81%AE%E3%81%AE%E3%81%8D%E3%82%89%E3%82%81%E3%81%8D.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%81%B2%E3%82%81%E3%81%8B%E3%81%BF.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%83%95%E3%82%A1%E3%83%BC%E3%82%B9%E3%83%88%E3%83%AC%E3%83%87%E3%82%A3.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%83%A1%E3%82%A4%E3%83%9D%E3%83%BC%E3%83%AB.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E3%82%84%E3%81%9F%E3%81%8B.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E5%8D%B0%E5%BA%A6.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E7%82%8E%E8%88%9E.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E5%BC%98%E5%89%8D%E3%81%B5%E3%81%98.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E7%B4%85%E3%81%BF%E3%81%AE%E3%82%8A.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E9%AB%98%E5%BE%B3.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E6%96%B0%E4%B8%96%E7%95%8C.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E4%B8%96%E7%95%8C%E4%B8%80.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E5%8D%83%E7%A7%8B.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E5%8D%83%E9%9B%AA.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E8%8A%B3%E6%98%8E.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E9%99%BD%E5%85%89.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E9%99%B8%E5%A5%A5.jpg",
        "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/%E6%81%8B%E7%A9%BA.jpg",
        "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/b434d970-8d6a-013e-bcf6-0a58a9feac02/%E3%82%A2%E3%83%AD%E3%83%9E_1.jpg",
        "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/bbaa5d50-8d6a-013e-bcf9-0a58a9feac02/%E3%82%B7%E3%82%99%E3%82%A7%E3%83%BC%E3%83%A0%E3%82%B9%E3%82%99%E3%82%AF%E3%82%99%E3%83%AA%E3%83%BC%E3%83%95%E3%82%99_2.jpg",
        "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/c4b9ada0-8d6a-013e-4d82-0a58a9feac02/%E3%82%BF%E3%82%A4%E3%83%86%E3%82%99%E3%83%9E%E3%83%B3%E3%82%B9%E3%82%99%E3%83%BB%E3%82%A2%E3%83%BC%E3%83%AA%E3%83%BC%E3%82%A6%E3%83%BC%E3%82%B9%E3%82%BF%E3%83%BC_2_1.jpg",
        "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/d2db9150-8d6a-013e-c3c4-0a58a9feac02/%E5%87%9B%E5%A4%8F.jpg"
    ];

    const existingApples = [
        "あいかの香り", "ぐんま名月", "すわっこ", "エグレモント・ラセット", "グラニー・スミス", "サンつがる",
        "サンふじ", "シナノゴールド", "シナノスイート", "シナノドルチェ", "シナノピッコロ", "シナノプッチ",
        "シナノホッペ", "シナノリップ", "トキ", "ブラムリー", "ブレナム・オレンジ", "ベル・ド・ボスクープ",
        "ムーンルージュ", "夏あかり", "炎舞", "王林", "秋映", "紅玉", "高坂林檎", "黄王"
    ];

    const tasks = [];

    // 1. New URLs mapping
    for (const url of newUrls) {
        const basename = url.split('/').pop();
        const decodedName = decodeURIComponent(basename);
        // Special case for Peraichi URLs having unpredictable basenames, keep the decoded names
        const nameNoExt = decodedName.substring(0, decodedName.lastIndexOf('.'));

        tasks.push({ url, key: `apples/${decodedName}` });

        if (url.includes('peraichi')) {
            const pngUrl = "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/" + encodeURIComponent(nameNoExt + ".png");
            tasks.push({ url: pngUrl, key: `apples/${nameNoExt}.png` });
        } else {
            const pngUrl = url.replace('.jpg', '.png');
            tasks.push({ url: pngUrl, key: `apples/${nameNoExt}.png` });
        }
    }

    // 2. Existing Apples PNGs mapping
    for (const apple of existingApples) {
        const pngUrl = "https://appletown-iizuna.s3.ap-northeast-1.amazonaws.com/apples/images/" + encodeURIComponent(apple + ".png");
        tasks.push({ url: pngUrl, key: `apples/${apple}.png` });
    }

    // Process tasks sequentially to avoid blowing up memory
    for (const task of tasks) {
        try {
            const response = await fetch(task.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            if (response.ok) {
                // Determine content-type
                const contentType = response.headers.get('content-type') || 'application/octet-stream';

                await bucket.put(task.key, response.body, {
                    httpMetadata: { contentType: contentType }
                });
                log.push(`Success: ${task.key}`);
                successCount++;
            } else if (response.status === 404 || response.status === 403) {
                log.push(`Skip (Not Found): ${task.key} via ${task.url}`);
                notFoundCount++;
            } else {
                log.push(`Failed [${response.status}]: ${task.key} via ${task.url}`);
            }
        } catch (e) {
            log.push(`Error: ${task.key} - ${e.message}`);
        }
    }

    return Response.json({ success: true, log, successCount, notFoundCount, totalTasks: tasks.length });
}
