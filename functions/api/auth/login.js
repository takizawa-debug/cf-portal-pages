import { errorResponse, jsonResponse } from "../../utils/response.js";
import { signJWT } from "../../utils/auth.js";
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return errorResponse("Missing username or password", 400);
        }

        // Hash the password using Web Crypto API (SHA-256)
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Find user
        const { results } = await env.DB.prepare(
            "SELECT id, username, role, display_name, status FROM users WHERE username = ? AND password_hash = ?"
        ).bind(username, passwordHash).all();

        if (results.length === 0) {
            return errorResponse("ユーザーIDまたはパスワードが正しくありません", 401);
        }

        const user = results[0];

        if (user.status === 'pending') {
            return errorResponse("メールアドレスの認証が完了していません。受信トレイに届いている認証URLからパスワードを設定してください。", 403);
        }

        // Create Stateless JWT Session
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
            display_name: user.display_name,
            managed_sites: user.managed_sites || '["all"]',
            exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days
        };
        const secret = env.JWT_SECRET || "default_local_jwt_secret_development_only";
        const token = await signJWT(payload, secret);

        const cookieValue = `admin_session_token=${token}; HttpOnly; Secure; Path=/; Max-Age=604800; SameSite=Strict`;

        return new Response(JSON.stringify({ ok: true, user: { id: user.id, username: user.username, role: user.role, display_name: user.display_name } }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": cookieValue,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        });

    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
