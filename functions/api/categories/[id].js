import { errorResponse, jsonResponse } from "../../utils/response";
import { authenticate, requireRole } from "../../utils/auth";

export async function onRequestPut(context) {
    const { request, env, params } = context;

    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    const id = params.id;
    try {
        const body = await request.json();
        const { form_type, l1, l2, l3, l1_en, l2_en, l3_en, l1_zh, l2_zh, l3_zh } = body;
        const typeToSave = form_type || 'shop';

        await env.DB.prepare(`
            UPDATE categories
            SET form_type=?, l1=?, l2=?, l3=?, l1_en=?, l2_en=?, l3_en=?, l1_zh=?, l2_zh=?, l3_zh=?
            WHERE id=?
        `).bind(typeToSave, l1, l2 || "", l3 || "", l1_en || "", l2_en || "", l3_en || "", l1_zh || "", l2_zh || "", l3_zh || "", id).run();

        return jsonResponse({ success: true });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;

    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    const id = params.id;
    try {
        await env.DB.prepare("DELETE FROM categories WHERE id=?").bind(id).run();
        return jsonResponse({ success: true });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
