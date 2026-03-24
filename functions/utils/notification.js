/**
 * Omni-Channel Notification Utility
 * Handles delivering messages natively over LINE Multicast APIs and Resend HTTP Email instances natively.
 */

// Core delivery loop resolving LINE Multicast limits natively.
async function pushToLine(env, lineIds, message) {
    if (!env.LINE_CHANNEL_ACCESS_TOKEN || lineIds.length === 0) return { success: 0, failed: lineIds.length };
    let success = 0;
    let failed = 0;
    
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
                messages: [{ type: "text", text: message }]
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
async function pushToEmail(env, emails, message) {
    if (!env.RESEND_API_KEY || emails.length === 0) return { success: 0, failed: emails.length };
    let success = 0;
    let failed = 0;

    for (let i = 0; i < emails.length; i += 50) {
        const chunk = emails.slice(i, i + 50);
        const promises = chunk.map(email => {
            return fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'noreply@appletown-iizuna.com',
                    to: email,
                    subject: 'いいづな事業ポータル 管理者からのお知らせ',
                    text: message
                })
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
export async function sendTargetedBroadcast(env, usernames, message) {
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
        pushToLine(env, lineUsers, message),
        pushToEmail(env, emailUsers, message)
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
