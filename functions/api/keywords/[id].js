import { errorResponse, jsonResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";

export async function onRequestPut(context) {
    const { request, env, params } = context;

    // Auth Check
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    try {
        const id = params.id;
        if (!id) return errorResponse("Missing ID", 400);

        const body = await request.json();
        const { keyword, priority, notes } = body;

        if (!keyword) {
            return errorResponse("Keyword is required.", 400);
        }

        const result = await env.DB.prepare(`
            UPDATE seo_keywords 
            SET keyword = ?, priority = ?, notes = ? 
            WHERE id = ?
        `).bind(keyword, priority || 'medium', notes || null, id).run();

        if (result.meta.changes === 0) {
            return errorResponse("Keyword not found", 404);
        }

        return jsonResponse({ success: true, id, keyword, priority });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;

    // Auth Check
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    try {
        const id = params.id;
        if (!id) return errorResponse("Missing ID", 400);

        const result = await env.DB.prepare("DELETE FROM seo_keywords WHERE id = ?").bind(id).run();

        if (result.meta.changes === 0) {
            return errorResponse("Keyword not found", 404);
        }

        return jsonResponse({ success: true });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
