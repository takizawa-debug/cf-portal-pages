export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { username, password, display_name } = body;

        if (!username || !password || !display_name) {
            return new Response(JSON.stringify({ error: "全ての項目を入力してください" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Check if user already exists
        const { results } = await env.DB.prepare(
            "SELECT id FROM users WHERE username = ?"
        ).bind(username).all();

        if (results.length > 0) {
            return new Response(JSON.stringify({ error: "このユーザーIDは既に登録されています" }), {
                status: 409,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Hash the password using Web Crypto API (SHA-256)
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Create a new user ID
        const userId = crypto.randomUUID();

        // Insert new user into the database as 'contributor'
        await env.DB.prepare(
            "INSERT INTO users (id, username, password_hash, role, display_name) VALUES (?, ?, ?, 'contributor', ?)"
        ).bind(userId, username, passwordHash, display_name).run();

        // For now, since email sending is not natively built-in without a provider, 
        // we'll return a success payload so the frontend can redirect to login.
        return new Response(JSON.stringify({ ok: true, message: "登録が完了しました。ログインページにお進みください。" }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
