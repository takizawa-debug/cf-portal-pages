import { authenticate, requireRole } from "../../utils/auth";

export async function onRequestPut(context) {
    const { request, env, params } = context;

    // Auth Check
    const user = await authenticate(request, env);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    try {
        const id = params.id;
        if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

        const body = await request.json();
        const { keyword, priority, notes } = body;

        if (!keyword) {
            return Response.json({ error: "Keyword is required." }, { status: 400 });
        }

        const result = await env.DB.prepare(`
            UPDATE seo_keywords 
            SET keyword = ?, priority = ?, notes = ? 
            WHERE id = ?
        `).bind(keyword, priority || 'medium', notes || null, id).run();

        if (result.meta.changes === 0) {
            return Response.json({ error: "Keyword not found" }, { status: 404 });
        }

        return Response.json({ success: true, id, keyword, priority });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;

    // Auth Check
    const user = await authenticate(request, env);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    try {
        const id = params.id;
        if (!id) return Response.json({ error: "Missing ID" }, { status: 400 });

        const result = await env.DB.prepare("DELETE FROM seo_keywords WHERE id = ?").bind(id).run();

        if (result.meta.changes === 0) {
            return Response.json({ error: "Keyword not found" }, { status: 404 });
        }

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
