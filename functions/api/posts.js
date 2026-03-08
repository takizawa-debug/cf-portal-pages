import { authenticate } from "../utils/auth";

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        const user = await authenticate(request, env);
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        let query = "SELECT * FROM contents ORDER BY created_at DESC";
        let binds = [];

        if (user.role === 'contributor') {
            query = "SELECT * FROM contents WHERE author_id = ? ORDER BY created_at DESC";
            binds.push(user.id);
        }

        const { results } = await env.DB.prepare(query).bind(...binds).all();

        return new Response(JSON.stringify(results), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}
