export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${env.AUTH_TOKEN}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        const data = await request.json();
        const id = crypto.randomUUID();

        // Use provided type or default to 'manual'
        data.type = data.type || 'manual';
        data.id = id;

        // Build dynamic INSERT query
        const keys = Object.keys(data);
        const columns = keys.join(', ');
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => data[k]);

        const query = `INSERT INTO contents (${columns}) VALUES (${placeholders})`;

        await env.DB.prepare(query).bind(...values).run();

        return new Response(JSON.stringify({ success: true, id }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(err.message, { status: 500 });
    }
}
