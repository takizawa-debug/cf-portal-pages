import { errorResponse, jsonResponse } from "../../utils/response.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { token, new_password, new_password_confirm } = body;

        if (!token || !new_password || !new_password_confirm) {
            return errorResponse("すべての項目を入力してください。", 400);
        }

        if (new_password !== new_password_confirm) {
            return errorResponse("パスワードと確認用パスワードが一致しません。", 400);
        }

        if (new_password.length < 8) {
            return errorResponse("パスワードは8文字以上で設定してください。", 400);
        }

        // Find user by verification_token
        const { results } = await env.DB.prepare(
            "SELECT id FROM users WHERE verification_token = ? AND status = 'pending'"
        ).bind(token).all();

        if (results.length === 0) {
            return errorResponse("無効な認証URLです。または既に本登録が完了しています。", 400);
        }

        const userId = results[0].id;

        // Hash the new password using Web Crypto API (SHA-256)
        const encoder = new TextEncoder();
        const data = encoder.encode(new_password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Update user: set password_hash, status to active, clear token
        await env.DB.prepare(
            "UPDATE users SET password_hash = ?, status = 'active', verification_token = NULL WHERE id = ?"
        ).bind(passwordHash, userId).run();

        return jsonResponse({ ok: true, message: "本登録が完了しました。ログイン画面へ移動します。" });

    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
