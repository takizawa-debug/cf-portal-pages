import { jsonResponse, errorResponse, optionsResponse } from "../utils/response.js";
import { sendNotificationToRoles } from "../utils/notification.js";
export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'OPTIONS') {
        return optionsResponse();
    }

    const url = new URL(request.url);
    const mode = url.searchParams.get('mode');

    // 1. GET /api/contact?mode=form_genres
    if (request.method === 'GET' && mode === 'form_genres') {
        try {
            const typeParam = url.searchParams.get('type') || 'shop'; // Default to shop

            // Fetch L1 and L2 combinations filtered by form_type
            const { results: categories } = await env.DB.prepare(
                'SELECT DISTINCT l1, l2 FROM categories WHERE l1 IS NOT NULL AND l2 IS NOT NULL AND form_type = ?'
            ).bind(typeParam).all();

            const items = {};
            categories.forEach(row => {
                if (!items[row.l1]) items[row.l1] = [];
                if (!items[row.l1].includes(row.l2)) items[row.l1].push(row.l2);
            });

            const { results: varieties } = await env.DB.prepare('SELECT name_ja FROM apple_varieties ORDER BY display_order ASC').all();
            const appleVarieties = varieties.map(r => r.name_ja);
            const appleProducts = ["シードル", "ジュース", "ジャム", "お菓子", "スイーツ", "その他"]; // Added その他 just in case

            return jsonResponse({
                ok: true,
                items: Object.keys(items).length > 0 ? items : { "味わう": ["カフェ"] },
                l1_order: Object.keys(items),
                appleVarieties: appleVarieties.length ? appleVarieties : ["ふじ", "シナノスイート", "秋映"],
                appleProducts
            });

        } catch (error) {
            return jsonResponse({ ok: false, error: error.message }, 500);
        }
    }

    // 2. POST /api/contact
    if (request.method === 'POST') {
        try {
            const body = await request.json();

            // Check form type from different payload structures
            let formType = 'unknown';
            if (body.art_type) formType = body.art_type;
            else if (body.inq_type) formType = 'inquiry';
            else if (body.rep_type) formType = 'report';

            // Generate a unique ID
            const id = crypto.randomUUID();

            // Extract images and art_file_data to store in R2
            const fileKeys = [];

            // Only try R2 interaction if binding exists
            if (env.UPLOAD_BUCKET) {
                if (body.images && Array.isArray(body.images)) {
                    for (let i = 0; i < body.images.length; i++) {
                        const base64Data = body.images[i].split(',')[1];
                        const mimeType = body.images[i].split(';')[0].split(':')[1] || 'image/jpeg';
                        const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

                        const ext = mimeType.split('/')[1] || 'jpg';
                        const key = `inquiries/${id}/image_${i}.${ext}`;

                        await env.UPLOAD_BUCKET.put(key, buffer, {
                            httpMetadata: { contentType: mimeType }
                        });
                        fileKeys.push({ type: 'image', key });
                    }
                }
                if (body.art_file_data) {
                    const base64Data = body.art_file_data.split(',')[1];
                    const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                    const fileName = body.art_file_name || 'attached_file.pdf';
                    const key = `inquiries/${id}/${fileName}`;

                    await env.UPLOAD_BUCKET.put(key, buffer);
                    fileKeys.push({ type: 'file', key, fileName });
                }
            }

            // Clear binary data from DB log payload
            delete body.images;
            delete body.art_file_data;
            delete body.art_file_name;

            // Save metadata to D1
            await env.DB.prepare(
                'INSERT INTO form_submissions (id, form_type, payload_json, files_json, status) VALUES (?, ?, ?, ?, ?)'
            ).bind(
                id,
                formType,
                JSON.stringify(body),
                JSON.stringify(fileKeys),
                'unread'
            ).run();

            // Notify Admins and Editors asynchronously
            context.waitUntil(
                sendNotificationToRoles(
                    env, 
                    ['admin', 'editor'], 
                    `[自動通知] 新しいフォーム送信（種別: ${formType}）を受信しました！\n管理画面の「お問い合わせ一覧」をご確認ください。`
                ).catch(e => console.error("Notification Error:", e))
            );

            return jsonResponse({ ok: true, id });

        } catch (error) {
            console.error('Contact Form Error:', error);
            return jsonResponse({ ok: false, error: error.message }, 500);
        }
    }

    return errorResponse('Method Not Allowed', 405);
}
