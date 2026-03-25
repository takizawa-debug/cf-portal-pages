import { errorResponse, jsonResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";

export async function onRequestGet(context) {
    const { request, env } = context;

    // Auth check
    const user = await authenticate(request, env);
    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, username, display_name, role, managed_sites, created_at FROM users ORDER BY created_at DESC"
        ).all();

        return jsonResponse({ ok: true, items: results });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    // Auth check
    const user = await authenticate(request, env);
    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    try {
        const body = await request.json();
        const { username, display_name, password, role, managed_sites } = body;

        if (!username || !password || !role) {
            return errorResponse("Missing required fields", 400);
        }

        // Hash the password
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Generate ID
        const id = 'usr_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);

        const managedSitesString = managed_sites ? JSON.stringify(managed_sites) : '["all"]';

        await env.DB.prepare(
            "INSERT INTO users (id, username, password_hash, role, display_name, managed_sites) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(id, username, passwordHash, role, display_name || null, managedSitesString).run();

        return jsonResponse({ ok: true, id });

    } catch (e) {
        return errorResponse(e.message, 500);
        }
}
