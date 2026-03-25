export async function authenticate(request, env) {
    const cookieHeader = request.headers.get("Cookie") || "";
    const match = cookieHeader.match(/admin_session_token=([^;]+)/);
    if (!match) return null;

    const sessionId = match[1];

    try {
        const { results } = await env.DB.prepare(`
            SELECT u.id, u.username, u.role, u.managed_sites, s.expires_at 
            FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = ?
        `).bind(sessionId).all();

        if (results.length === 0) return null;

        const session = results[0];
        if (new Date(session.expires_at) < new Date()) {
            await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
            return null;
        }

        return session;
    } catch (e) {
        return null;
    }
}

export function requireRole(user, allowedRoles) {
    if (!user || !allowedRoles.includes(user.role)) {
        return new Response(JSON.stringify({ error: "Forbidden: insufficient permissions" }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
    }
    return null; // Passes check
}
