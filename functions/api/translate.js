export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${env.AUTH_TOKEN}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        const body = await request.json();
        const text = body.text;

        if (!text) {
            return new Response('Missing text', { status: 400 });
        }

        const [enRes, twRes] = await Promise.all([
            env.AI.run('@cf/meta/m2m100-1.2b', { text, target_lang: 'english' }),
            env.AI.run('@cf/meta/m2m100-1.2b', { text, target_lang: 'chinese' })
        ]);

        return new Response(JSON.stringify({
            en: enRes.translated_text,
            tw: twRes.translated_text
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(err.message, { status: 500 });
    }
}
