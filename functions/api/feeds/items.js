import { jsonResponse, errorResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";

/**
 * GET /api/feeds/items
 * 外部フィードアイテム一覧（ステータス別、ページネーション）
 */
export async function onRequestGet(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'pending'; // 'pending', 'published', 'dismissed', 'all'
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    try {
        let query = `
            SELECT i.*, f.name as feed_name, f.source_type
            FROM external_feed_items i
            JOIN external_feeds f ON i.feed_id = f.id
        `;
        const params = [];

        if (status !== 'all') {
            query += ` WHERE i.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY i.detected_date DESC, i.created_at DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const { results: items } = await env.DB.prepare(query).bind(...params).all();

        // 各ステータスの件数集計
        const counts = {
            pending: 0,
            published: 0,
            dismissed: 0
        };

        const { results: countRows } = await env.DB.prepare(
            `SELECT status, COUNT(*) as cnt FROM external_feed_items GROUP BY status`
        ).all();

        countRows.forEach(r => {
            if (counts[r.status] !== undefined) counts[r.status] = r.cnt;
        });

        return jsonResponse({
            ok: true,
            items,
            counts,
            limit,
            offset
        });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

import { analyzeFeedItemWithGemini } from "../../utils/feed-ai.js";

/**
 * POST /api/feeds/items
 * ステータス更新 または AI考察の再生成 (action: 'reanalyze')
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    try {
        const body = await request.json();
        const { id, status, action } = body;

        if (!id) {
            return errorResponse("Missing item id", 400);
        }

        // AI考察の再生成アクション
        if (action === 'reanalyze') {
            const item = await env.DB.prepare(
                `SELECT i.*, f.name as feed_name, f.target_l1, f.target_l2, f.target_l3 
                 FROM external_feed_items i 
                 JOIN external_feeds f ON i.feed_id = f.id 
                 WHERE i.id = ?`
            ).bind(id).first();

            if (!item) return errorResponse("Item not found", 404);

            const feed = {
                name: item.feed_name,
                target_l1: item.target_l1,
                target_l2: item.target_l2,
                target_l3: item.target_l3
            };

            const aiResult = await analyzeFeedItemWithGemini(env, item, feed);

            await env.DB.prepare(`
                UPDATE external_feed_items SET
                    impact_level = ?,
                    ai_commentary = ?,
                    recommended_actions = ?,
                    draft_title = ?,
                    draft_lead = ?,
                    draft_body = ?,
                    suggested_l1 = ?,
                    suggested_l2 = ?,
                    suggested_l3 = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(
                aiResult.impact_level,
                aiResult.ai_commentary,
                aiResult.recommended_actions,
                aiResult.draft_title,
                aiResult.draft_lead,
                aiResult.draft_body,
                aiResult.suggested_l1,
                aiResult.suggested_l2,
                aiResult.suggested_l3,
                id
            ).run();

            return jsonResponse({ ok: true, id, aiResult });
        }

        // ステータス更新
        if (!['pending', 'published', 'dismissed'].includes(status)) {
            return errorResponse("Invalid status", 400);
        }

        await env.DB.prepare(
            `UPDATE external_feed_items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(status, id).run();

        return jsonResponse({ ok: true, id, status });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
