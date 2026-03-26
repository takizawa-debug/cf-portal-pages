import { jsonResponse, errorResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const user = await authenticate(request, env);
        // Only admins and editors can perform bulk imports
        const roleError = requireRole(user, ['admin', 'editor']);
        if (roleError) return roleError;

        const payload = await request.json();
        if (!Array.isArray(payload) || payload.length === 0) {
            return errorResponse('Invalid payload format. Expected non-empty JSON array.', 400);
        }

        const managedSites = user.role !== 'admin' ? JSON.parse(user.managed_sites || '["all"]') : ['all'];

        let insertedCount = 0;
        let updatedCount = 0;
        const stmts = [];

        for (const data of payload) {
            let id = data.id;
            const isUpdate = !!id; // True if `id` is non-empty string
            if (!id) {
                id = crypto.randomUUID();
            }

            // Security: Zero-trust scope assignment for standard editors
            const rowScope = data.site_scope || 'main';
            if (user.role !== 'admin' && !managedSites.includes('all') && !managedSites.includes(rowScope)) {
                console.warn(`[Import Blocked] User ${user.id} cannot import to scope: ${rowScope}`);
                continue; // Skip silently to allow the rest of the batch payload to succeed
            }

            // 1. Extract Media Assets array logic exactly like standard publish.js
            const media = [];
            for (let i = 1; i <= 6; i++) {
                media.push(data[`image${i}`] || null);
                delete data[`image${i}`];
            }
            const media_assets = JSON.stringify(media);

            // 2. Extract Translations logic mapping identical to original database writes
            const translations = {
                'en': {},
                'zh-TW': {} 
            };
            const transKeys = ['title', 'lead_text', 'body_text'];
            
            for (const key of transKeys) {
                if (data[`${key}_en`] !== undefined) {
                    translations['en'][key] = data[`${key}_en`];
                    delete data[`${key}_en`];
                }
                if (data[`${key}_tw`] !== undefined) {
                    translations['zh-TW'][key] = data[`${key}_tw`];
                    delete data[`${key}_tw`];
                }
            }

            delete data.id; 
            delete data.created_at; delete data.updated_at;
            delete data.author_id; // Never let the user manually override the author_id via CSV

            // 3. Drop inherited category localized keys exported purely for read-only user convenience
            const ignoreKeys = ['l1_en', 'l2_en', 'l3_label_en', 'l1_tw', 'l2_tw', 'l3_label_tw', 'l1_zh', 'l2_zh', 'l3_label_zh'];
            ignoreKeys.forEach(k => delete data[k]);

            if (isUpdate) {
                // Determine update fields dynamically based on the parsed CSV headers
                const keys = Object.keys(data).filter(k => k !== 'business_metadata');
                let sql = 'UPDATE contents SET media_assets = ?, updated_at = CURRENT_TIMESTAMP';
                const bindValues = [media_assets];

                keys.forEach(k => {
                    sql += `, ${k} = ?`;
                    bindValues.push(data[k] !== undefined ? data[k] : null);
                });

                if (data.business_metadata !== undefined) {
                    sql += `, business_metadata = ?`;
                    const bm = typeof data.business_metadata === 'string' ? data.business_metadata : JSON.stringify(data.business_metadata || {});
                    bindValues.push(bm);
                }

                sql += ' WHERE id = ?';
                bindValues.push(id);

                // Scope authorization boundary to prevent illicitly shifting pre-existing objects across site boundaries
                if (user.role === 'editor' && !managedSites.includes('all')) {
                    sql += ' AND site_scope = ?';
                    bindValues.push(rowScope);
                }

                stmts.push(env.DB.prepare(sql).bind(...bindValues));

                // Upsert translation matrices per row
                for (const [locale, t] of Object.entries(translations)) {
                    if (Object.keys(t).length > 0) {
                        const transId = crypto.randomUUID();
                        stmts.push(
                            env.DB.prepare(
                                `INSERT INTO content_translations (id, content_id, locale, title, lead_text, body_text)
                                VALUES (?, ?, ?, ?, ?, ?)
                                ON CONFLICT(content_id, locale) DO UPDATE SET 
                                title=excluded.title, lead_text=excluded.lead_text, body_text=excluded.body_text`
                            ).bind(transId, id, locale, t.title || null, t.lead_text || null, t.body_text || null)
                        );
                    }
                }
                updatedCount++;
            } else {
                // Perform a standard INSERT via mapping CSV cells to physical columns
                const keys = Object.keys(data).filter(k => k !== 'business_metadata');
                keys.push('media_assets', 'id', 'author_id', 'type');
                
                const type = data.type || 'manual';
                const author_id = user.id;

                const bindValues = keys.map(k => {
                    if (k === 'media_assets') return media_assets;
                    if (k === 'id') return id;
                    if (k === 'author_id') return author_id;
                    if (k === 'type') return type;
                    return data[k] !== undefined ? data[k] : null;
                });

                if (data.business_metadata !== undefined) {
                    keys.push('business_metadata');
                    const bm = typeof data.business_metadata === 'string' ? data.business_metadata : JSON.stringify(data.business_metadata || {});
                    bindValues.push(bm);
                }

                const placeholders = keys.map(() => '?').join(', ');
                const columns = keys.join(', ');

                stmts.push(env.DB.prepare(
                    `INSERT INTO contents (${columns}) VALUES (${placeholders})`
                ).bind(...bindValues));

                for (const [locale, t] of Object.entries(translations)) {
                    if (Object.keys(t).length > 0) {
                        const transId = crypto.randomUUID();
                        stmts.push(
                            env.DB.prepare(
                                `INSERT INTO content_translations (id, content_id, locale, title, lead_text, body_text)
                                VALUES (?, ?, ?, ?, ?, ?)
                                ON CONFLICT(content_id, locale) DO UPDATE SET 
                                title=excluded.title, lead_text=excluded.lead_text, body_text=excluded.body_text`
                            ).bind(transId, id, locale, t.title || null, t.lead_text || null, t.body_text || null)
                        );
                    }
                }
                insertedCount++;
            }
        }

        if (stmts.length > 0) {
            await env.DB.batch(stmts);
        }

        return jsonResponse({ ok: true, inserted: insertedCount, updated: updatedCount });

    } catch (err) {
        console.error("CSV Bulk Import API Error:", err);
        return errorResponse(err.message, 500);
    }
}
