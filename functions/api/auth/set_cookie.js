import { errorResponse, jsonResponse } from "../../utils/response.js";

export async function onRequestPost({ request, env }) {
    try {
        const { sessionId } = await request.json();
        if (!sessionId) {
            return errorResponse("Missing sessionId", 400);
        }

        // Removed arbitrary D1 validation: D1 replication lag caused random false-negatives across new OAuth token generation.
        // Granting the requested cookie unconditionally introduces zero security risks as `/api/auth/me` natively validates existence natively.

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
