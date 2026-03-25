import { errorResponse, jsonResponse } from "../../utils/response.js";
export async function onRequestGet(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get("Cookie") || "";

    // Parse cookie
    const match = cookieHeader.match(/admin_session_token=([^;]+)/);
    if (!match) {
        return errorResponse("Unauthorized", 401);
    }
    const sessionId = match[1];

    try {
        const { results } = await env.DB.prepare(`
            SELECT u.id, u.username, u.role, u.display_name, u.managed_sites, s.expires_at 
            FROM sessions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = ?
        `).bind(sessionId).all();

        if (results.length === 0) {
            return errorResponse("Invalid session", 401);
        }

        const session = results[0];

        // Check expiration
        if (new Date(session.expires_at) < new Date()) {
            await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
            return errorResponse("Session expired", 401);
        }

        return jsonResponse({
            ok: true,
            user: {
                id: session.id,
                username: session.username,
                role: session.role,
                display_name: session.display_name,
                managed_sites: session.managed_sites
            }
        });

    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
