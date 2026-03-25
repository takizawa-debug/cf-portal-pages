import { errorResponse, jsonResponse } from "../../utils/response.js";

export async function onRequestPost({ request, env }) {
    try {
        const { sessionId } = await request.json();
        if (!sessionId) {
            return errorResponse("Missing sessionId", 400);
        }

        // Validate the sessionId exists in the db to avoid arbitrary token sets
        const { results } = await env.DB.prepare("SELECT id FROM sessions WHERE id = ?").bind(sessionId).all();
        if (results.length === 0) {
            return errorResponse("Invalid or expired session", 401);
        }

        const cookieValue = `admin_session_token=${sessionId}; HttpOnly; Secure; Path=/; Max-Age=604800; SameSite=Lax`;

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": cookieValue
            }
        });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
