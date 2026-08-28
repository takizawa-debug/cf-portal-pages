import { jsonResponse, errorResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";

/**
 * POST /api/feeds/publish
 * 外部フィードアイテムからワンクリックで contents テーブルへ記事を作成・公開
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    try {
        const body = await request.json();
        const {
            feed_item_id,
            title,
            lead_text,
            body_text,
            l1,
            l2,
            l3_label,
            download_url,
            media_assets,
            type = 'news',
            status = 'published',
            site_scope = 'main'
        } = body;

        if (!title) {
            return errorResponse("Title is required", 400);
        }

        const contentId = crypto.randomUUID();
        const mediaJson = JSON.stringify(Array.isArray(media_assets) ? media_assets : []);

        // 1. contents テーブルに挿入
        await env.DB.prepare(`
            INSERT INTO contents (
                id, author_id, type, status, site_scope,
                l1, l2, l3_label, title, lead_text, body_text,
                download_url, media_assets, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        `).bind(
            contentId,
            user.id || user.username || 'admin',
            type,
            status,
            site_scope,
            l1 || '営む',
            l2 || '栽培支援',
            l3_label || '栽培指導',
            title,
            lead_text || '',
            body_text || '',
            download_url || null,
            mediaJson
        ).run();

        // 2. external_feed_items のステータスを更新
        if (feed_item_id) {
            await env.DB.prepare(`
                UPDATE external_feed_items
                SET status = 'published', published_content_id = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).bind(contentId, feed_item_id).run();
        }

        // 3. 多言語翻訳（英語・中国語）を非同期実行（Gemini）
        if (env.GEMINI_API_KEY) {
            context.waitUntil((async () => {
                try {
                    const prompt = `Translate the following Japanese article into English (en) and Traditional Chinese (zh-TW).
Title: ${title}
Lead: ${lead_text || ''}
Body: ${body_text || ''}

Output JSON format strictly:
{
  "en": { "title": "...", "lead": "...", "body": "..." },
  "zh": { "title": "...", "lead": "...", "body": "..." }
}`;

                    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{ role: 'user', parts: [{ text: prompt }] }],
                            generationConfig: { responseMimeType: "application/json" }
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const trans = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
                        if (trans.en) {
                            await env.DB.prepare(`
                                INSERT OR REPLACE INTO content_translations (id, content_id, locale, title, lead_text, body_text)
                                VALUES (?, ?, 'en', ?, ?, ?)
                            `).bind(`trans-${contentId}-en`, contentId, trans.en.title || title, trans.en.lead || '', trans.en.body || body_text).run();
                        }
                        if (trans.zh) {
                            await env.DB.prepare(`
                                INSERT OR REPLACE INTO content_translations (id, content_id, locale, title, lead_text, body_text)
                                VALUES (?, ?, 'zh', ?, ?, ?)
                            `).bind(`trans-${contentId}-zh`, contentId, trans.zh.title || title, trans.zh.lead || '', trans.zh.body || body_text).run();
                        }
                    }
                } catch (err) {
                    console.error('Background translation failed for published feed content:', err);
                }
            })());
        }

        return jsonResponse({
            ok: true,
            content_id: contentId,
            feed_item_id: feed_item_id || null
        });

    } catch (e) {
        console.error('Failed to publish article from feed:', e);
        return errorResponse(e.message, 500);
    }
}
