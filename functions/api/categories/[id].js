import { authenticate, requireRole } from "../../utils/auth";

export async function onRequestPut(context) {
    const { request, env, params } = context;

    const user = await authenticate(request, env);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

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

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;

    const user = await authenticate(request, env);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    const id = params.id;
    try {
        await env.DB.prepare("DELETE FROM categories WHERE id=?").bind(id).run();
        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
