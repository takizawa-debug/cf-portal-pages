import { jsonResponse, errorResponse } from "../utils/response.js";
import { authenticate, requireRole } from "../utils/auth.js";
import { sendTargetedBroadcast } from "../utils/notification.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const user = await authenticate(request, env);
        const roleError = requireRole(user, ['admin', 'editor', 'contributor']);
        if (roleError) return roleError;

        const data = await request.json();
        
        const broadcastTarget = data.broadcast_target;
        delete data.broadcast_target;

        const id = crypto.randomUUID();

        // Use provided type or default to 'manual'
        data.type = data.type || 'manual';
        data.id = id;
        data.author_id = user.id;

        // Security: Zero-trust scope assignment
        if (user.role !== 'admin') {
            const managedSites = JSON.parse(user.managed_sites || '["all"]');
            
            if (data.type === 'manual' && !managedSites.includes('all') && !managedSites.includes('main')) {
                return errorResponse('Forbidden: Only Main editors can create General Articles', 403);
            }

            if (!managedSites.includes('all')) {
                // If editor passed a scope they don't manage, reject
                if (data.site_scope && !managedSites.includes(data.site_scope)) {
                    return errorResponse('Forbidden: Unauthorized site scope', 403);
                }
                // If no scope passed, or valid, force to their primary scope if they only have 1
                if (!data.site_scope && managedSites.length === 1) {
                    data.site_scope = managedSites[0];
                } else if (!data.site_scope) {
                    data.site_scope = 'main'; // fallback, though it may be rejected later if not in managedSites, but above checked.
                }
            } else {
                data.site_scope = data.site_scope || 'main';
            }
        } else {
            data.site_scope = data.site_scope || 'main';
        }

        // Implicit category inheritance for Main portal News
        if (data.type === 'news' && data.site_scope === 'main') {
            data.l1 = '知る';
            data.l2 = 'お知らせ';
        }

        // 1. Extract Media Assets
        const media = [];
        for (let i = 1; i <= 6; i++) {
            media.push(data[`image${i}`] || null);
            delete data[`image${i}`];
        }
        data.media_assets = JSON.stringify(media);

        // 2. Extract Translations
        const translations = {
            'en': {},
            'zh-TW': {} // zh-TW is used in our SQL joins
        };
        const transKeys = ['title', 'lead_text', 'body_text'];
        
        for (const k of transKeys) {
            if (data[`${k}_en`] !== undefined) {
                translations['en'][k] = data[`${k}_en`];
                delete data[`${k}_en`];
            }
            if (data[`${k}_tw`] !== undefined) {
                translations['zh-TW'][k] = data[`${k}_tw`];
                delete data[`${k}_tw`];
            }
        }
        const ignoreKeys = ['l1_en', 'l2_en', 'l3_label_en', 'l1_tw', 'l2_tw', 'l3_label_tw'];
        ignoreKeys.forEach(k => delete data[k]);

        // 3. Build dynamic INSERT query for Base Content
        const stmts = [];

        const keys = Object.keys(data);
        const columns = keys.join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => data[k]);
        
        stmts.push(env.DB.prepare(`INSERT INTO contents (${columns}) VALUES (${placeholders})`).bind(...values));

        // 4. Build Translation INSERTs
        for (const locale of ['en', 'zh-TW']) {
            const t = translations[locale];
            if (Object.keys(t).length > 0) {
                const transId = crypto.randomUUID();
                stmts.push(
                    env.DB.prepare(
                        `INSERT INTO content_translations (id, content_id, locale, title, lead_text, body_text) VALUES (?, ?, ?, ?, ?, ?)`
                    ).bind(transId, id, locale, t.title || null, t.lead_text || null, t.body_text || null)
                );
            }
        }

        await env.DB.batch(stmts);

        // 5. Targeted Broadcast Execution
        if (broadcastTarget && broadcastTarget !== 'none') {
            const articleTitle = data.title || '新しいお知らせ';
            const message = `[自動通知] 新しい記事が公開されました！\nタイトル: ${articleTitle}\n\nポータルサイトから詳細をご確認ください。`;

            let targetUsernames = [];
            if (broadcastTarget === 'editors') {
                const scope = data.site_scope || 'main';
                const { results } = await env.DB.prepare(`
                    SELECT username FROM users 
                    WHERE (role = 'admin' OR role = 'editor') 
                    AND (managed_sites LIKE '%"all"%' OR managed_sites LIKE ?)
                `).bind(`%"${scope}"%`).all();
                targetUsernames = results.map(r => r.username);
            } else if (broadcastTarget === 'all') {
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

        return jsonResponse({ success: true, id });
    } catch (err) {
        return errorResponse(err.message, 500);
    }
}
