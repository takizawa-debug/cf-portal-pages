import { authenticate, requireRole } from "../../utils/auth";

export async function onRequestGet(context) {
    const { request, env } = context;

    // Auth check
    const user = await authenticate(request, env);
    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"
        ).all();

        return new Response(JSON.stringify({ ok: true, items: results }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    // Auth check
    const user = await authenticate(request, env);
    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    try {
        const body = await request.json();
        const { username, password, role } = body;

        if (!username || !password || !role) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        // Hash the password
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Generate ID
        const id = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);

        await env.DB.prepare(
            "INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)"
        ).bind(id, username, passwordHash, role).run();

        return new Response(JSON.stringify({ ok: true, id }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
