import { jsonResponse, errorResponse, optionsResponse } from '../utils/response.js';
import { authenticate } from '../utils/auth.js';

export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const path = url.searchParams.get('path');
    
    if (!path) {
        return errorResponse("Missing 'path' parameter", 400);
    }

    try {
        const stmt = env.DB.prepare('SELECT title, description, og_image_url, favicon_url FROM seo_settings WHERE page_path = ?');
        const data = await stmt.bind(path).first();
        
        return jsonResponse(data || null);
    } catch (err) {
        console.error(err);
        return errorResponse(err.message, 500);
    }
}

export async function onRequestPost({ request, env }) {
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);
    // Require admin or editor role for SEO management
    if (!['admin', 'editor'].includes(user.role)) {
        return errorResponse("Forbidden", 403);
    }

    try {
        const data = await request.json();
        const { path, title, description, og_image_url, favicon_url } = data;

        if (!path) {
            return errorResponse("Missing 'path'", 400);
        }

        // Apply Zero-Trust Scope verify
        const managedSites = JSON.parse(user.managed_sites || '["all"]');
        let requiredScope = 'main';
        if (path === '/sourapple' || path.startsWith('/sourapple/')) {
            requiredScope = 'sourapple';
        }

        if (user.role !== 'admin' && !managedSites.includes('all') && !managedSites.includes(requiredScope)) {
            return errorResponse("Forbidden: Not in your managed scope.", 403);
        }

        const stmt = env.DB.prepare(`
            INSERT INTO seo_settings (page_path, title, description, og_image_url, favicon_url, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT (page_path) DO UPDATE SET 
            title = excluded.title,
            description = excluded.description,
            og_image_url = excluded.og_image_url,
            favicon_url = excluded.favicon_url,
            updated_at = CURRENT_TIMESTAMP
        `);
        
        await stmt.bind(path, title || null, description || null, og_image_url || null, favicon_url || null).run();

        return jsonResponse({ success: true });
    } catch (err) {
        console.error(err);
        return errorResponse("Server Error", 500);
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}
