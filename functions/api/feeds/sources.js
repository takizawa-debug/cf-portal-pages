import { jsonResponse, errorResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";

/**
 * GET /api/feeds/sources
 * 監視ソース一覧
 */
export async function onRequestGet(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    try {
        const { results: sources } = await env.DB.prepare(
            `SELECT s.*, 
                    (SELECT COUNT(*) FROM external_feed_items i WHERE i.feed_id = s.id) as item_count,
                    (SELECT COUNT(*) FROM external_feed_items i WHERE i.feed_id = s.id AND i.status = 'pending') as pending_count
             FROM external_feeds s
             ORDER BY s.created_at ASC`
        ).all();

        return jsonResponse({ ok: true, sources });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

/**
 * POST /api/feeds/sources
 * 監視ソースの追加・編集・削除
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    try {
        const body = await request.json();
        const { action = 'create', id, name, source_type, source_target, target_l1, target_l2, target_l3, is_active = 1 } = body;

        if (action === 'delete') {
            if (!id) return errorResponse("Source ID required for deletion", 400);
            await env.DB.prepare("DELETE FROM external_feeds WHERE id = ?").bind(id).run();
            return jsonResponse({ ok: true, action: 'deleted', id });
        }

        if (action === 'toggle_active') {
            if (!id) return errorResponse("Source ID required", 400);
            await env.DB.prepare("UPDATE external_feeds SET is_active = ? WHERE id = ?").bind(is_active ? 1 : 0, id).run();
            return jsonResponse({ ok: true, action: 'toggled', id, is_active });
        }

        // 作成または更新
        if (!name || !source_type || !source_target) {
            return errorResponse("name, source_type, and source_target are required", 400);
        }

        const sourceId = id || `feed-${crypto.randomUUID().slice(0, 8)}`;

        await env.DB.prepare(`
            INSERT OR REPLACE INTO external_feeds (
                id, name, source_type, source_target,
                target_l1, target_l2, target_l3, is_active
            ) VALUES (
                ?, ?, ?, ?,
                ?, ?, ?, ?
            )
        `).bind(
            sourceId,
            name,
            source_type,
            source_target.trim(),
            target_l1 || '営む',
            target_l2 || '栽培支援',
            target_l3 || '栽培指導',
            is_active ? 1 : 0
        ).run();

        return jsonResponse({ ok: true, action: 'saved', id: sourceId });

    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
