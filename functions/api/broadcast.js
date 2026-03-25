import { jsonResponse, errorResponse } from "../utils/response.js";
import { authenticate } from "../utils/auth.js";
import { sendTargetedBroadcast } from "../utils/notification.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    // Authenticate user
    const user = await authenticate(request, env);
    if (!user) {
        return errorResponse("Unauthorized", 401);
    }
    if (user.role === 'contributor') {
        return errorResponse("Forbidden. Only admins and editors can broadcast messages.", 403);
    }

    try {
        const body = await request.json();
        const { target_type, channel, message } = body;

        if (!message || message.trim() === '') {
            return errorResponse("Message is required", 400);
        }

        let query = `SELECT DISTINCT u.username FROM users u`;
        const params = [];

        if (target_type === 'shop' || target_type === 'farmer') {
            query += ` JOIN contents c ON u.id = c.author_id AND c.type = 'business_profile' AND c.business_b_type = ?`;
            params.push(target_type);
        }

        query += ` WHERE u.role = 'contributor'`;

        const { results: users } = await env.DB.prepare(query).bind(...params).all();

        const targetUsernames = [];

        users.forEach(u => {
            if (channel === 'both') {
                targetUsernames.push(u.username);
            } else if (channel === 'line' && u.username.startsWith('line_')) {
                targetUsernames.push(u.username);
            } else if (channel === 'email' && u.username.includes('@')) {
                targetUsernames.push(u.username);
            }
        });

        const results = await sendTargetedBroadcast(env, targetUsernames, message);

        return jsonResponse({
            ok: true,
            summary: results
        });

    } catch (e) {
        console.error("Broadcast Error:", e);
        return errorResponse("Internal Server Error", 500);
    }
}
