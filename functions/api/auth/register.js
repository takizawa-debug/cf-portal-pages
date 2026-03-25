import { errorResponse, jsonResponse } from "../../utils/response.js";
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { username, display_name } = body;

        if (!username) {
            return errorResponse("メールアドレスを入力してください", 400);
        }

        // Check if user already exists
        const { results } = await env.DB.prepare(
            "SELECT id, status FROM users WHERE username = ?"
        ).bind(username).all();

        if (results.length > 0) {
            return errorResponse("このメールアドレスは既に登録されています", 409);
        }

        // Create a new user ID & verification token
        const userId = crypto.randomUUID();
        const verificationToken = crypto.randomUUID();

        // Insert new user into the database as 'contributor' with 'pending' status
        await env.DB.prepare(
            "INSERT INTO users (id, username, password_hash, role, display_name, status, verification_token) VALUES (?, ?, '', 'contributor', ?, 'pending', ?)"
        ).bind(userId, username, display_name || '新規登録者', verificationToken).run();

        // Construct magic link based on request origin
        const url = new URL(request.url);
        const magicLink = `${url.origin}/setup-password.html?token=${verificationToken}`;

        // Send Email via Resend natively
        if (env.RESEND_API_KEY) {
            await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'noreply@appletown-iizuna.com',
                    to: username,
                    subject: '【重要】いいづな事業ポータル：本登録を完了してください',
                    text: `仮登録ありがとうございます。\n以下のURLをクリックして、パスワードを設定し本登録を完了してください。\n\n${magicLink}\n\n※お心当たりがない場合は、このメールを破棄してください。`
                })
            });
        }

        // Return a success payload so the frontend can show the completion UX.
        return jsonResponse({ ok: true, message: "仮登録が完了しました。メールボックスをご確認ください。" });

    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
