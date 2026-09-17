/**
 * /api/frontend/news — 公開ニュース取得API
 * 
 * クエリパラメータ:
 *   limit: 取得件数（デフォルト: 20, 最大: 100）
 *   scope: サイトスコープ（デフォルト: 'main'）
 */
import { jsonResponse, cachedJsonResponse, optionsResponse } from "../../utils/response.js";

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const scope = url.searchParams.get('scope') || 'main';

    try {
        const { results } = await env.DB.prepare(`
            SELECT c.id, c.title, c.body_text, c.media_assets,
                   c.site_scope, c.created_at, c.updated_at,
                   t_en.title as title_en, t_en.body_text as body_en,
                   t_tw.title as title_tw, t_tw.body_text as body_tw
            FROM contents c
            LEFT JOIN content_translations t_en ON c.id = t_en.content_id AND t_en.locale = 'en'
            LEFT JOIN content_translations t_tw ON c.id = t_tw.content_id AND t_tw.locale = 'zh'
            WHERE (c.type = 'news' OR c.l2 = 'お知らせ') AND c.status = 'published' AND c.site_scope = ?
            ORDER BY c.created_at DESC
            LIMIT ?
        `).bind(scope, limit).all();

        const items = (results || []).map(row => {
            // メイン画像・画像一覧を取得
            let mainImage = null;
            let images = [];
            try {
                if (row.media_assets) {
                    const assets = JSON.parse(row.media_assets);
                    if (Array.isArray(assets)) {
                        images = assets.filter(Boolean);
                        if (images.length > 0) mainImage = images[0];
                    }
                }
            } catch (e) {}

            return {
                id: row.id,
                title: row.title,
                body: row.body_text,
                mainImage,
                images,
                date: row.created_at,
                en: {
                    title: row.title_en,
                    body: row.body_en
                },
                zh: {
                    title: row.title_tw,
                    body: row.body_tw
                }
            };
        });

        return cachedJsonResponse({ ok: true, items });
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 500);
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}
