import { authenticate, requireRole } from "../../utils/auth";

export async function onRequestPut(context) {
    const { request, env, params } = context;
    const id = params.id;

    try {
        const user = await authenticate(request, env);
        const roleError = requireRole(user, ['admin', 'editor', 'contributor']);
        if (roleError) return roleError;

        if (user.role === 'contributor') {
            const { results } = await env.DB.prepare("SELECT author_id FROM contents WHERE id = ?").bind(id).all();
            if (results.length === 0) return new Response('Not found', { status: 404 });
            if (results[0].author_id !== user.id) {
                return new Response('Forbidden: you do not own this content', { status: 403 });
            }
        }

        const data = await request.json();

        // Build dynamic UPDATE query based on provided fields
        const keys = Object.keys(data);
        if (keys.length === 0) {
            return new Response('No data provided', { status: 400 });
        }

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => data[k]);
        values.push(id); // for the WHERE clause

        const query = `UPDATE contents SET ${setClause} WHERE id = ?`;

        await env.DB.prepare(query).bind(...values).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(err.message, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const id = params.id;

    try {
        const user = await authenticate(request, env);
        const roleError = requireRole(user, ['admin', 'editor', 'contributor']);
        if (roleError) return roleError;

        if (user.role === 'contributor') {
            const { results } = await env.DB.prepare("SELECT author_id FROM contents WHERE id = ?").bind(id).all();
            if (results.length === 0) return new Response('Not found', { status: 404 });
            if (results[0].author_id !== user.id) {
                return new Response('Forbidden: you do not own this content', { status: 403 });
            }
        }

        await env.DB.prepare('DELETE FROM contents WHERE id = ?').bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(err.message, { status: 500 });
    }
}
