/**
 * Omni-Channel Notification Utility
 * Handles delivering messages natively over LINE Multicast APIs and Resend HTTP Email instances natively.
 */

// Helper to convert massive ArrayBuffers quickly without stack overflow
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
}

// Core delivery loop resolving LINE Multicast limits natively.
async function pushToLine(env, lineIds, message, imageUrl = null) {
    if (!env.LINE_CHANNEL_ACCESS_TOKEN || lineIds.length === 0) return { success: 0, failed: lineIds.length };
    let success = 0;
    let failed = 0;

    const finalMessage = message + "\n\n---\n※このメッセージはシステムからの自動配信です。ご返信いただいても対応できかねますのでご了承ください。";
    let isLineSupportedImage = false;
    if (imageUrl) {
        isLineSupportedImage = imageUrl.match(/\.(jpeg|jpg|png)$/i) != null;
    }

    let messagesPayload = [];
    if (imageUrl) {
        if (isLineSupportedImage) {
            messagesPayload.push({
                type: "image",
                originalContentUrl: imageUrl,
                previewImageUrl: imageUrl
            });
            messagesPayload.push({ type: "text", text: finalMessage });
        } else {
            messagesPayload.push({
                type: "text",
                text: finalMessage + "\n\n【添付ファイル】\n" + imageUrl
            });
        }
    } else {
        messagesPayload.push({ type: "text", text: finalMessage });
    }
    
    for (let i = 0; i < lineIds.length; i += 500) {
        const chunk = lineIds.slice(i, i + 500);
        const res = await fetch('https://api.line.me/v2/bot/message/multicast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                to: chunk,
                messages: messagesPayload
            })
        });
        if (res.ok) {
            success += chunk.length;
        } else {
            console.error('LINE Broadcast Failed:', await res.text());
            failed += chunk.length;
        }
    }
    return { success, failed };
}

// Core delivery loop extracting Resend HTTP REST Arrays sequentially.
async function pushToEmail(env, emails, message, imageUrl = null) {
    if (!env.RESEND_API_KEY || emails.length === 0) return { success: 0, failed: emails.length };
    let success = 0;
    let failed = 0;

    const finalMessage = message + "\n\n---\n※このメッセージはシステムからの自動配信です。ご返信いただいても対応できかねますのでご了承ください。";

    let attachments = [];
    if (imageUrl) {
        try {
            const fileRes = await fetch(imageUrl);
            if (fileRes.ok) {
                const arrayBuffer = await fileRes.arrayBuffer();
                const base64Content = arrayBufferToBase64(arrayBuffer);
                let filename = imageUrl.split('/').pop() || "attachment.file";
                try { filename = decodeURIComponent(filename); } catch (e) { }

                attachments.push({
                    filename: filename,
                    content: base64Content
                });
            }
        } catch (err) {
            console.error("Failed to fetch encoding attachment:", err);
        }
    }

    for (let i = 0; i < emails.length; i += 50) {
        const chunk = emails.slice(i, i + 50);
        const promises = chunk.map(email => {
            const reqBody = {
                from: 'noreply@appletown-iizuna.com',
                to: email,
                subject: 'いいづな事業ポータル 管理者からのお知らせ',
                text: finalMessage
            };
            if (attachments.length > 0) reqBody.attachments = attachments;

            return fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reqBody)
            }).then(r => r.ok ? 'ok' : 'err').catch(() => 'err');
        });
        
        const batchResults = await Promise.all(promises);
        success += batchResults.filter(r => r === 'ok').length;
        failed += batchResults.filter(r => r === 'err').length;
    }
    return { success, failed };
}

/**
 * Route explicit arrays of usernames sorting LINE profiles vs Standalone Emails natively returning analytics.
 */
export async function sendTargetedBroadcast(env, usernames, message, imageUrl = null) {
    const lineUsers = [];
    const emailUsers = [];

    usernames.forEach(username => {
        if (username.startsWith('line_')) {
            lineUsers.push(username.substring(5)); // Strip 'line_'
        } else if (username.includes('@')) {
            emailUsers.push(username);
        }
    });

    const [lineResult, emailResult] = await Promise.all([
        pushToLine(env, lineUsers, message, imageUrl),
        pushToEmail(env, emailUsers, message, imageUrl)
    ]);

    return {
        line: { attempted: lineUsers.length, ...lineResult },
        email: { attempted: emailUsers.length, ...emailResult }
    };
}

/**
 * Extract users matching roles automating the distribution array natively.
 */
export async function sendNotificationToRoles(env, rolesArray, message) {
    const rolesStr = rolesArray.map(r => `'${r}'`).join(',');
    const { results } = await env.DB.prepare(`SELECT username FROM users WHERE role IN (${rolesStr})`).all();
    const usernames = results.map(row => row.username);
    return sendTargetedBroadcast(env, usernames, message);
}
