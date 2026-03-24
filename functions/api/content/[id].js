import { jsonResponse, errorResponse } from "../../utils/response";
import { sendTargetedBroadcast } from "../../utils/notification";
import { authenticate, requireRole } from "../../utils/auth";

export async function onRequestPut(context) {
    const { request, env, params } = context;
    const id = params.id;

    try {
        const user = await authenticate(request, env);
        const roleError = requireRole(user, ['admin', 'editor', 'contributor']);
        if (roleError) return roleError;

        if (user.role === 'contributor') {
            const { results } = await env.DB.prepare("SELECT author_id FROM contents WHERE id = ?").bind(id).all();
            if (results.length === 0) return errorResponse('Not found', 404);
            if (results[0].author_id !== user.id) {
                return errorResponse('Forbidden: you do not own this content', 403);
            }
        }

        const data = await request.json();
        
        const broadcastTarget = data.broadcast_target;
        delete data.broadcast_target;

        // 1. Extract Media Assets
        let updateMedia = false;
        const media = [];
        for (let i = 1; i <= 6; i++) {
            if (data[`image${i}`] !== undefined) {
                updateMedia = true;
                media.push(data[`image${i}`] || null);
                delete data[`image${i}`];
            }
        }
        if (updateMedia) data.media_assets = JSON.stringify(media);

        // 2. Extract Translations
        const translations = {
            'en': {},
            'zh-TW': {}
        };
        const transKeys = ['title', 'lead_text', 'body_text'];
        let hasTransUpdate = false;
        for (const k of transKeys) {
            if (data[`${k}_en`] !== undefined) {
                translations['en'][k] = data[`${k}_en`];
                delete data[`${k}_en`];
                hasTransUpdate = true;
            }
            if (data[`${k}_tw`] !== undefined) {
                translations['zh-TW'][k] = data[`${k}_tw`];
                delete data[`${k}_tw`];
                hasTransUpdate = true;
            }
        }

        const stmts = [];

        // 3. Update Base Content
        const keys = Object.keys(data);
        if (keys.length > 0) {
            const setClause = keys.map(k => `${k} = ?`).join(', ');
            const values = keys.map(k => data[k]);
            values.push(id);
            stmts.push(
                env.DB.prepare(`UPDATE contents SET ${setClause} WHERE id = ?`).bind(...values)
            );
        }

        // 4. Update Translations using UPSERT
        if (hasTransUpdate) {
            for (const locale of ['en', 'zh-TW']) {
                const t = translations[locale];
                if (Object.keys(t).length > 0) {
                    const transId = crypto.randomUUID();
                    stmts.push(
                        env.DB.prepare(`
                            INSERT INTO content_translations (id, content_id, locale, title, lead_text, body_text)
                            VALUES (?, ?, ?, ?, ?, ?)
                            ON CONFLICT(content_id, locale) DO UPDATE SET
                                title = excluded.title,
                                lead_text = excluded.lead_text,
                                body_text = excluded.body_text
                        `).bind(transId, id, locale, t.title || null, t.lead_text || null, t.body_text || null)
                    );
                }
            }
        }

        if (stmts.length > 0) {
            await env.DB.batch(stmts);
        } else {
            return errorResponse('No data provided', 400);
        }

        // Targeted Broadcast Execution
        if (broadcastTarget && broadcastTarget !== 'none') {
            const articleTitle = data.title || '新しいお知らせ';
            const message = `[自動通知] 記事が更新・公開されました！\nタイトル: ${articleTitle}\n\nポータルサイトから詳細をご確認ください。`;

            let targetUsernames = [];
            if (broadcastTarget === 'all') {
                const { results } = await env.DB.prepare('SELECT username FROM users').all();
                targetUsernames = results.map(r => r.username);
            } else if (broadcastTarget === 'shop' || broadcastTarget === 'farmer') {
                const { results } = await env.DB.prepare(`
                    SELECT DISTINCT u.username 
                    FROM users u
                    JOIN contents c ON u.id = c.author_id
                    WHERE c.type = 'business_profile' AND c.business_b_type = ?
                `).bind(broadcastTarget).all();
                targetUsernames = results.map(r => r.username);
            }

            if (targetUsernames.length > 0) {
                context.waitUntil(
                    sendTargetedBroadcast(env, targetUsernames, message)
                        .catch(e => console.error("Broadcast Error:", e))
                );
            }
        }

        return jsonResponse({ success: true });
    } catch (err) {
        return errorResponse(err.message, 500);
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const id = params.id;

    try {
        const user = await authenticate(request, env);
        const roleError = requireRole(user, ['admin', 'editor', 'contributor']);
        if (roleError) return roleError;

        if (user.role === 'contributor') {
            const { results } = await env.DB.prepare("SELECT author_id FROM contents WHERE id = ?").bind(id).all();
            if (results.length === 0) return errorResponse('Not found', 404);
            if (results[0].author_id !== user.id) {
                return errorResponse('Forbidden: you do not own this content', 403);
            }
        }

        await env.DB.prepare('DELETE FROM contents WHERE id = ?').bind(id).run();

        return jsonResponse({ success: true });
    } catch (err) {
        return errorResponse(err.message, 500);
    }
}
