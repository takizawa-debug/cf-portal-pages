export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Simple AUTH_TOKEN verification
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${env.AUTH_TOKEN}`) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: getCorsHeaders()
            });
        }

        const data = await request.json();
        const { title, body, imageUrl } = data;

        if (!title && !body) {
            return new Response(JSON.stringify({ error: 'Title or body is required' }), {
                status: 400,
                headers: getCorsHeaders()
            });
        }

        // Translation using Workers AI
        let titleEn = title, titleTw = title;
        let bodyEn = body, bodyTw = body;

        if (title) {
            titleEn = await translateText(env, title, 'ja', 'en');
            titleTw = await translateText(env, title, 'ja', 'zh');
        }

        if (body) {
            bodyEn = await translateText(env, body, 'ja', 'en');
            bodyTw = await translateText(env, body, 'ja', 'zh');
        }

        const id = crypto.randomUUID();

        await env.DB.prepare(
            `INSERT INTO posts (id, type, title_jp, title_en, title_tw, body_jp, body_en, body_tw, image_url)
             VALUES (?, 'manual', ?, ?, ?, ?, ?, ?, ?)`
        ).bind(id, title, titleEn, titleTw, body, bodyEn, bodyTw, imageUrl || null).run();

        return new Response(JSON.stringify({ success: true, id }), {
            headers: getCorsHeaders()
        });

    } catch (error) {
        console.error("Publish Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: getCorsHeaders()
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, { headers: getCorsHeaders() });
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
