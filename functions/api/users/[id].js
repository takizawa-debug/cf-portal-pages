import { errorResponse, jsonResponse } from "../../utils/response";
import { authenticate, requireRole } from "../../utils/auth";

export async function onRequestPut(context) {
    const { request, env, params } = context;
    const targetUserId = params.id;

    // Auth check
    const user = await authenticate(request, env);
    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    try {
        const body = await request.json();
        const { password, role, managed_sites } = body;

        let updates = [];
        let binds = [];

        if (password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            updates.push("password_hash = ?");
            binds.push(passwordHash);
        }

        if (role) {
            if (targetUserId === user.id && role !== user.role) {
                return errorResponse("Cannot change your own role", 400);
            }
            updates.push("role = ?");
            binds.push(role);
        }

        if (managed_sites) {
            updates.push("managed_sites = ?");
            binds.push(JSON.stringify(managed_sites));
        }

        if (updates.length > 0) {
            binds.push(targetUserId);
            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
            await env.DB.prepare(query).bind(...binds).run();
        }

        return jsonResponse({ ok: true });

    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const targetUserId = params.id;

    // Auth check
    const user = await authenticate(request, env);
    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    if (targetUserId === user.id) {
        return errorResponse("Cannot delete yourself", 400);
    }

    try {
        // FK mapping in schema should handle sessions ON DELETE CASCADE or we do it manual
        await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(targetUserId).run();
        return jsonResponse({ ok: true });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
