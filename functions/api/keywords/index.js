import { authenticate, requireRole } from "../../utils/auth";

export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare("SELECT * FROM seo_keywords ORDER BY created_at DESC").all();
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
        const data = await request.json();
        const { keyword, priority = 1 } = data;

        if (!keyword) {
            return Response.json({ error: "Keyword is required" }, { status: 400 });
        }

        const id = crypto.randomUUID();
        await env.DB.prepare(`
            INSERT INTO seo_keywords (id, keyword, priority)
            VALUES (?, ?, ?)
        `).bind(id, keyword, priority).run();

        return Response.json({ success: true, id, keyword, priority });
    } catch (e) {
        if (e.message.includes("UNIQUE constraint failed")) {
            return Response.json({ error: "Keyword already exists" }, { status: 400 });
        }
        return Response.json({ error: e.message }, { status: 500 });
    }
}
