export async function onRequestGet(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie") || "";

    // Parse cookie
    const match = cookieHeader.match(/admin_session_token=([^;]+)/);
    if (!match) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }
    const sessionId = match[1];

    try {
        const { results } = await env.DB.prepare(`
            SELECT u.id, u.username, u.role, s.expires_at 
            FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = ?
        `).bind(sessionId).all();

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: "Invalid session" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const session = results[0];

        // Check expiration
        if (new Date(session.expires_at) < new Date()) {
            await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
            return new Response(JSON.stringify({ error: "Session expired" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(JSON.stringify({
            ok: true,
            user: {
                id: session.id,
                username: session.username,
                role: session.role
            }
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
