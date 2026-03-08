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
        return new Response(JSON.stringify({ ok: true }), {
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": "admin_session_token=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict"
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
