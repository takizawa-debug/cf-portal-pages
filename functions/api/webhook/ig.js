import { optionsResponse } from "../../utils/response.js";
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Mock webhook endpoint for Make.com / Instagram integrations
        const data = await request.json();
        const caption = data.caption || "";
        const imageUrl = data.media_url || null;

        let bodyEn = caption, bodyTw = caption;

        if (caption) {
            bodyEn = await translateText(env, caption, 'ja', 'en');
            bodyTw = await translateText(env, caption, 'ja', 'zh');
        }

        const id = crypto.randomUUID();

        await env.DB.prepare(
            `INSERT INTO contents (id, type, body_text, body_text_en, body_text_tw, image1)
             VALUES (?, 'instagram', ?, ?, ?, ?)`
        ).bind(id, caption, bodyEn, bodyTw, imageUrl).run();

        return new Response(JSON.stringify({ success: true, id }), {
            headers: getCorsHeaders()
        });

    } catch (error) {
        console.error("IG Webhook Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: getCorsHeaders()
        });
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}

function getCorsHeaders() {
    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

async function translateText(env, text, sourceLang, targetLang) {
    try {
        const response = await env.AI.run('@cf/meta/m2m100-1.2b', {
            text: text,
            source_lang: sourceLang,
            target_lang: targetLang
        });
        return response.translated_text || text;
    } catch (e) {
        console.error(`Translation failed (${sourceLang} -> ${targetLang}):`, e);
        return text;
    }
}
