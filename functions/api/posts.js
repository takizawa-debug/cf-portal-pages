import { errorResponse, jsonResponse, cachedJsonResponse, optionsResponse } from "../utils/response.js";
import { authenticate } from "../utils/auth.js";

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        const user = await authenticate(request, env);
        if (!user) {
            return errorResponse('Unauthorized', 401);
        }

        const flatSelect = `
            c.*,
            u.display_name as author_name,
            t_en.title as title_en, t_en.lead_text as lead_text_en, t_en.body_text as body_text_en,
            t_tw.title as title_tw, t_tw.lead_text as lead_text_tw, t_tw.body_text as body_text_tw,
            COALESCE(cat_l3.l1_en, cat_l2.l1_en) as l1_en,
            COALESCE(cat_l3.l2_en, cat_l2.l2_en) as l2_en,
            cat_l3.l3_en as l3_label_en,
            COALESCE(cat_l3.l1_zh, cat_l2.l1_zh) as l1_tw,
            COALESCE(cat_l3.l2_zh, cat_l2.l2_zh) as l2_tw,
            cat_l3.l3_zh as l3_label_tw
        `;
        const joinClause = `
            LEFT JOIN users u ON c.author_id = u.id
            LEFT JOIN content_translations t_en ON c.id = t_en.content_id AND t_en.locale = 'en'
            LEFT JOIN content_translations t_tw ON c.id = t_tw.content_id AND t_tw.locale = 'zh-TW'
            LEFT JOIN categories cat_l2 ON c.l1 = cat_l2.l1 AND IFNULL(c.l2, '') = IFNULL(cat_l2.l2, '') AND (cat_l2.l3 IS NULL OR cat_l2.l3 = '') AND cat_l2.form_type = 'article'
            LEFT JOIN categories cat_l3 ON c.l1 = cat_l3.l1 AND IFNULL(c.l2, '') = IFNULL(cat_l3.l2, '') AND c.l3_label = cat_l3.l3 AND cat_l3.form_type = 'article'
        `;

        let query = `SELECT ${flatSelect} FROM contents c ${joinClause}`;
        let binds = [];

        let whereClause = '';
        if (user.role === 'contributor') {
            whereClause = 'WHERE c.author_id = ?';
            binds.push(user.id);
        } else {
            const managedSites = JSON.parse(user.managed_sites || '["all"]');
            if (user.role !== 'admin' && !managedSites.includes('all')) {
                whereClause = `WHERE c.site_scope IN (${managedSites.map(() => '?').join(',')})`;
                binds.push(...managedSites);
            }
        }
        
        query += ` ${whereClause} ORDER BY c.created_at DESC`;

        const { results } = await env.DB.prepare(query).bind(...binds).all();

        // JS側で安全にJSONをパースしてimage1〜6のプロパティをアタッチする
        const processedResults = results.map(row => {
            let assets = [];
            try {
                if (row.media_assets) {
                    assets = JSON.parse(row.media_assets);
                    if (!Array.isArray(assets)) assets = [];
                }
            } catch (e) {
                // パース失敗時（空文字など）は空配列として扱う
                assets = [];
            }
            return {
                ...row,
                image1: assets[0] || null,
                image2: assets[1] || null,
                image3: assets[2] || null,
                image4: assets[3] || null,
                image5: assets[4] || null,
                image6: assets[5] || null
            };
        });

        return cachedJsonResponse(processedResults);
    } catch (error) {
        return errorResponse(error.message, 500);
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return optionsResponse();
}
