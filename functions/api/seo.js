import { authenticate, requireRole } from '../utils/auth.js';

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    
    if (!path) {
        return new Response(JSON.stringify({ error: "Missing 'path' parameter" }), { status: 400 });
    }

    try {
        const stmt = env.DB.prepare('SELECT title, description, og_image_url FROM seo_settings WHERE page_path = ?');
        const data = await stmt.bind(path).first();
        
        return new Response(JSON.stringify(data || null), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
    }
}

export async function onRequestPost({ request, env }) {
    const user = await authenticate(request, env);
    const authError = requireRole(user, ['admin', 'editor']);
    if (authError) return authError;

    try {
        const data = await request.json();
        const { path, title, description, og_image_url } = data;

        if (!path) {
            return new Response(JSON.stringify({ error: "Missing 'path'" }), { status: 400 });
        }

        const stmt = env.DB.prepare(`
            INSERT INTO seo_settings (page_path, title, description, og_image_url, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT (page_path) DO UPDATE SET 
            title = excluded.title,
            description = excluded.description,
            og_image_url = excluded.og_image_url,
            updated_at = CURRENT_TIMESTAMP
        `);
        
        await stmt.bind(path, title || null, description || null, og_image_url || null).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
    }
}
