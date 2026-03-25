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
async function pushToLine(env, lineIds, message, imageUrls = []) {
    if (!env.LINE_CHANNEL_ACCESS_TOKEN || lineIds.length === 0) return { success: 0, failed: lineIds.length };
    let success = 0;
    let failed = 0;

    const finalMessage = message + "\n\n---\n※このメッセージはシステムからの自動配信です。ご返信いただいても対応できかねますのでご了承ください。";
    
    let messagesPayload = [];
    let pdfLinks = [];
    
    if (imageUrls && imageUrls.length > 0) {
        for (const url of imageUrls) {
            const isLineSupportedImage = url.match(/\.(jpeg|jpg|png)$/i) != null;
            if (isLineSupportedImage) {
                messagesPayload.push({
                    type: "image",
                    originalContentUrl: url,
                    previewImageUrl: url
                });
            } else {
                pdfLinks.push(url);
            }
        }
    }

    let textBubbleContent = finalMessage;
    if (pdfLinks.length > 0) {
        textBubbleContent += "\n\n【添付ファイル】\n" + pdfLinks.join("\n");
    }
    
    // Unshift text bubble first natively satisfying LINE limits
    messagesPayload.unshift({ type: "text", text: textBubbleContent });

    // Ensure array doesn't exceed 5 maximum allowed bubbles by API
    if (messagesPayload.length > 5) {
        messagesPayload = messagesPayload.slice(0, 5);
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
async function pushToEmail(env, emails, message, imageUrls = []) {
    if (!env.RESEND_API_KEY || emails.length === 0) return { success: 0, failed: emails.length };
    let success = 0;
    let failed = 0;

    const finalMessage = message + "\n\n---\n※このメッセージはシステムからの自動配信です。ご返信いただいても対応できかねますのでご了承ください。";

    let attachments = [];
    if (imageUrls && imageUrls.length > 0) {
        const fetchPromises = imageUrls.map(async (url) => {
            try {
                const fileRes = await fetch(url);
                if (fileRes.ok) {
                    const arrayBuffer = await fileRes.arrayBuffer();
                    const base64Content = arrayBufferToBase64(arrayBuffer);
                    let filename = url.split('/').pop() || "attachment.file";
                    try { filename = decodeURIComponent(filename); } catch (e) { }

                    return {
                        filename: filename,
                        content: base64Content
                    };
                }
            } catch (err) {
                console.error("Failed to fetch encoding attachment:", err);
            }
            return null;
        });

        const results = await Promise.all(fetchPromises);
        attachments = results.filter(a => a !== null);
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
export async function sendTargetedBroadcast(env, usernames, message, imageUrls = []) {
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
        pushToLine(env, lineUsers, message, imageUrls),
        pushToEmail(env, emailUsers, message, imageUrls)
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
