export async function onRequestPut(context) {
    const { request, env, params } = context;
    const id = params.id;

    try {
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${env.AUTH_TOKEN}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        const data = await request.json();

        // Build dynamic UPDATE query based on provided fields
        const keys = Object.keys(data);
        if (keys.length === 0) {
            return new Response('No data provided', { status: 400 });
        }

        const setClause = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => data[k]);
        values.push(id); // for the WHERE clause

        const query = `UPDATE contents SET ${setClause} WHERE id = ?`;

        await env.DB.prepare(query).bind(...values).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(err.message, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const id = params.id;

    try {
        const authHeader = request.headers.get('Authorization');
        if (authHeader !== `Bearer ${env.AUTH_TOKEN}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        await env.DB.prepare('DELETE FROM contents WHERE id = ?').bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(err.message, { status: 500 });
    }
}
