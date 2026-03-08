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
        const { password, role } = body;

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
                return new Response(JSON.stringify({ error: "Cannot change your own role" }), { status: 400 });
            }
            updates.push("role = ?");
            binds.push(role);
        }

        if (updates.length > 0) {
            binds.push(targetUserId);
            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
            await env.DB.prepare(query).bind(...binds).run();
        }

        return new Response(JSON.stringify({ ok: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
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
        return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        // FK mapping in schema should handle sessions ON DELETE CASCADE or we do it manual
        await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(targetUserId).run();
        return new Response(JSON.stringify({ ok: true }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
