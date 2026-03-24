import { errorResponse, jsonResponse } from "../../utils/response";
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const cookieHeader = request.headers.get("Cookie") || "";
        const match = cookieHeader.match(/admin_session_token=([^;]+)/);

        if (match) {
            const sessionId = match[1];
            // Delete session from DB
            await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
        }

        // Return a response that clears the cookie by setting Max-Age=0
        return jsonResponse({ ok: true });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
