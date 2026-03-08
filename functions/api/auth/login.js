export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return new Response(JSON.stringify({ error: "Missing username or password" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Hash the password using Web Crypto API (SHA-256)
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Find user
        const { results } = await env.DB.prepare(
            "SELECT id, username, role FROM users WHERE username = ? AND password_hash = ?"
        ).bind(username, passwordHash).all();

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: "Invalid username or password" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const user = results[0];

        // Create a new session
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await env.DB.prepare(
            "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
        ).bind(sessionId, user.id, expiresAt.toISOString()).run();

        const cookieValue = `admin_session_token=${sessionId}; HttpOnly; Secure; Path=/; Max-Age=604800; SameSite=Strict`;

        return new Response(JSON.stringify({ ok: true, user: { id: user.id, username: user.username, role: user.role } }), {
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": cookieValue
            }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
