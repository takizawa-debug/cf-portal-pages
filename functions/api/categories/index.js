import { authenticate, requireRole } from "../../utils/auth";

export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare("SELECT * FROM categories ORDER BY form_type ASC, created_at ASC").all();
        return Response.json(results);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    // Auth Check
    const user = await authenticate(request, env);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    try {
        const body = await request.json();
        const { form_type, l1, l2, l3, l1_en, l2_en, l3_en, l1_zh, l2_zh, l3_zh } = body;

        if (!l1) {
            return Response.json({ error: "L1 (大カテゴリ) is required" }, { status: 400 });
        }

        const typeToSave = form_type || 'shop'; // Default to shop if not provided
        const id = crypto.randomUUID();
        await env.DB.prepare(`
            INSERT INTO categories (id, form_type, l1, l2, l3, l1_en, l2_en, l3_en, l1_zh, l2_zh, l3_zh)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(id, typeToSave, l1, l2 || "", l3 || "", l1_en || "", l2_en || "", l3_en || "", l1_zh || "", l2_zh || "", l3_zh || "").run();

        return Response.json({ success: true, id });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
