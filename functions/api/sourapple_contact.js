export async function onRequestPost({ request, env }) {
    try {
        let data;
        try {
            data = await request.json();
        } catch {
            return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }

        const { name, kana, email, message } = data;

        if (!name || !kana || !email || !message) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
        }

        if (!env.RESEND_API_KEY) {
            return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 500 });
        }

        // Send email to admin
        const adminEmail = "takizawa@mimizuya.co.jp";
        const adminHtml = `
            <h2>iizuna sour apple ウェブサイトからのお問い合わせ</h2>
            <p><strong>お名前:</strong> ${name}</p>
            <p><strong>フリガナ:</strong> ${kana}</p>
            <p><strong>メールアドレス:</strong> ${email}</p>
            <p><strong>お問い合わせ内容:</strong><br>${message.replace(/\\n/g, '<br>')}</p>
        `;

        // Send auto-reply to user
        const userHtml = `
            <p>${name} 様</p>
            <p>この度はお問い合わせいただき、誠にありがとうございます。</p>
            <p>以下の内容でお問い合わせを受け付けました。</p>
            <hr>
            <p><strong>お名前:</strong> ${name}</p>
            <p><strong>フリガナ:</strong> ${kana}</p>
            <p><strong>メールアドレス:</strong> ${email}</p>
            <p><strong>お問い合わせ内容:</strong><br>${message.replace(/\\n/g, '<br>')}</p>
            <hr>
            <p>※内容を確認の上、担当者より折り返しご連絡させていただきます。</p>
            <br>
            <p>iizuna sour apple<br>飯綱町役場 産業観光課 農政係</p>
        `;

        const resendEndpoint = 'https://api.resend.com/emails';

        // Send to Admin
        const adminRes = await fetch(resendEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'iizuna sour apple <noreply@appletown-iizuna.com>',
                to: adminEmail,
                subject: '【iizuna sour apple】ウェブサイトからのお問い合わせ',
                html: adminHtml,
                reply_to: email
            })
        });

        // Send to User
        const userRes = await fetch(resendEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'iizuna sour apple <noreply@appletown-iizuna.com>',
                to: email,
                subject: '【iizuna sour apple】お問い合わせを受け付けました',
                html: userHtml
            })
        });

        if (!adminRes.ok || !userRes.ok) {
            console.error("Admin Email Status:", adminRes.status, await adminRes.text());
            console.error("User Email Status:", userRes.status, await userRes.text());
            return new Response(JSON.stringify({ error: "Failed to send email" }), { status: 500 });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
}
