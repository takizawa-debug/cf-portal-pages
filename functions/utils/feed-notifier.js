/**
 * feed-notifier.js — 管理者向けインテリジェンスアラート通知エンジン
 * Resend API を用いて、AI考察・推奨アクション・記事ドラフトを含むHTMLレポートメールを配信
 */

export async function sendFeedAlertEmail(env, newItems, feed) {
    if (!env.RESEND_API_KEY || !newItems || newItems.length === 0) {
        return { success: false, reason: 'No API key or empty items' };
    }

    // 通知先管理者メールアドレス
    let adminEmails = ['ringoiizuna@gmail.com'];
    try {
        const { results } = await env.DB.prepare("SELECT username FROM users WHERE role = 'admin'").all();
        const dbAdminEmails = results.map(r => r.username).filter(u => u && u.includes('@'));
        if (dbAdminEmails.length > 0) {
            adminEmails = [...new Set(['ringoiizuna@gmail.com', ...dbAdminEmails])];
        }
    } catch (e) {
        console.error('Failed to fetch admin emails:', e);
    }

    const firstItem = newItems[0];
    const impactEmoji = firstItem.impact_level === 'high' ? '🔴【影響度：高】' : (firstItem.impact_level === 'low' ? '⚪' : '🟡');
    const countText = newItems.length > 1 ? ` 他${newItems.length - 1}件` : '';
    const subject = `[りんごPRWEB] 新着検知: ${impactEmoji} ${firstItem.title.slice(0, 30)}${countText}`;

    // HTML本文の生成
    const itemsHtml = newItems.map((item, idx) => {
        const badgeColor = item.impact_level === 'high' ? '#cf3a3a' : (item.impact_level === 'low' ? '#718096' : '#d69e2e');
        const badgeLabel = item.impact_level === 'high' ? '高（要警戒・至急対応）' : (item.impact_level === 'low' ? '低（参考）' : '中（定例・通常）');

        return `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid #edf2f7; padding-bottom: 12px;">
                <span style="font-size: 13px; font-weight: 700; color: #4a5568;">#${idx + 1} 発信元: ${feed.name}</span>
                <span style="background: ${badgeColor}; color: #ffffff; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px;">
                    影響度: ${badgeLabel}
                </span>
            </div>

            <h2 style="font-size: 18px; color: #1a202c; margin: 0 0 12px; line-height: 1.5;">${item.title}</h2>
            
            <div style="font-size: 13px; color: #718096; margin-bottom: 16px;">
                📅 発表日: ${item.detected_date || '本日'} &nbsp;|&nbsp;
                🔗 <a href="${item.source_url}" target="_blank" style="color: #3182ce; text-decoration: underline;">元ページを開く</a>
                ${item.pdf_url ? `&nbsp;|&nbsp; 📎 <a href="${item.pdf_url}" target="_blank" style="color: #e53e3e; font-weight: 700; text-decoration: underline;">添付PDFを開く</a>` : ''}
                ${item.media_url ? `&nbsp;|&nbsp; ▶️ <a href="${item.media_url}" target="_blank" style="color: #e53e3e; text-decoration: underline;">動画を見る</a>` : ''}
            </div>

            <!-- AI考察ブロック -->
            <div style="background: #f7fafc; border-left: 4px solid #3182ce; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px; font-size: 14px; color: #2b6cb0; font-weight: 700;">🤖 AI技術考察（飯綱町りんご栽培視点）</h3>
                <p style="margin: 0 0 12px; font-size: 14px; color: #2d3748; line-height: 1.7; white-space: pre-wrap;">${item.ai_commentary}</p>

                <h4 style="margin: 0 0 6px; font-size: 13px; color: #2c5282; font-weight: 700;">💡 農家・担当者への推奨アクション</h4>
                <div style="margin: 0; font-size: 13px; color: #4a5568; line-height: 1.6; white-space: pre-wrap;">${item.recommended_actions}</div>
            </div>

            <!-- 発信記事ドラフト -->
            <div style="background: #fffaf0; border: 1px dashed #dd6b20; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <h3 style="margin: 0 0 6px; font-size: 14px; color: #c05621; font-weight: 700;">📝 提案する発信記事ドラフト</h3>
                <div style="font-size: 13px; color: #7b341e; margin-bottom: 8px;">
                    <strong>タイトル案:</strong> ${item.draft_title}<br>
                    <strong>推奨カテゴリ:</strong> ${item.suggested_l1 || '営む'} ＞ ${item.suggested_l2 || '栽培支援'} ＞ ${item.suggested_l3 || '栽培指導'}
                </div>
                <div style="font-size: 13px; color: #4a5568; line-height: 1.6; max-height: 160px; overflow-y: auto; background: #ffffff; padding: 10px; border-radius: 4px; white-space: pre-wrap;">${item.draft_body}</div>
            </div>

            <div style="text-align: right;">
                <a href="https://appletown-iizuna.com/admin#feeds?id=${item.id}" target="_blank" style="display: inline-block; background: #cf3a3a; color: #ffffff; padding: 10px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 4px rgba(207,58,58,0.2);">
                    ✨ 管理画面で下書きを開いて公開する →
                </a>
            </div>
        </div>
        `;
    }).join('\n');

    const fullEmailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }</style>
    </head>
    <body>
        <div style="max-width: 680px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 24px;">🍎</span>
                <h1 style="font-size: 20px; color: #1a202c; margin: 8px 0 4px;">飯綱町りんごPRWEB 外部情報インテリジェンス通知</h1>
                <p style="font-size: 13px; color: #718096; margin: 0;">長野県公的機関および地域関連ソースの新着情報とAI考察をお届けします</p>
            </div>

            ${itemsHtml}

            <div style="text-align: center; font-size: 12px; color: #a0aec0; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                本メールは飯綱町りんごPRWEBの自動監視システムより管理者宛てに自動配信されています。<br>
                管理画面URL: <a href="https://appletown-iizuna.com/admin#feeds" style="color: #718096;">https://appletown-iizuna.com/admin#feeds</a>
            </div>
        </div>
    </body>
    </html>
    `;

    // Resend APIで送信
    const sendPromises = adminEmails.map(async (email) => {
        try {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'noreply@appletown-iizuna.com',
                    to: email,
                    subject: subject,
                    html: fullEmailHtml
                })
            });
            return res.ok;
        } catch (e) {
            console.error('Failed to send Resend email to', email, e);
            return false;
        }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(Boolean).length;
    return { success: successCount > 0, sent_to: adminEmails };
}
