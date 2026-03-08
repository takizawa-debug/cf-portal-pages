export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    }

    if (request.method === 'PUT') {
        try {
            const { id, status } = await request.json();

            await env.DB.prepare('UPDATE form_submissions SET status = ? WHERE id = ?')
                .bind(status, id)
                .run();

            return new Response(JSON.stringify({ ok: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }
    }

    return new Response('Method Not Allowed', { status: 405 });
}
