import { errorResponse, jsonResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";

export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare("SELECT * FROM categories ORDER BY form_type ASC, created_at ASC").all();
        return jsonResponse(results);
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    // Auth Check
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    try {
        const body = await request.json();
        const { form_type, l1, l2, l3, l1_en, l2_en, l3_en, l1_zh, l2_zh, l3_zh } = body;

        if (!l1) {
            return errorResponse("L1 (大カテゴリ) is required", 400);
        }

        const typeToSave = form_type || 'shop'; // Default to shop if not provided
        const id = crypto.randomUUID();
        await env.DB.prepare(`
            INSERT INTO categories (id, form_type, l1, l2, l3, l1_en, l2_en, l3_en, l1_zh, l2_zh, l3_zh)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(id, typeToSave, l1, l2 || "", l3 || "", l1_en || "", l2_en || "", l3_en || "", l1_zh || "", l2_zh || "", l3_zh || "").run();

        return jsonResponse({ success: true, id });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
