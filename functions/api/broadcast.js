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

        if (!body.message || (!body.target_type && !body.channel)) {
            return errorResponse("Missing target parameters or message", 400);
        }

        const targetType = body.target_type || 'all';
        const channel = body.channel || 'both';
        const message = body.message;
        let imageUrls = body.image_urls || [];
        if (!Array.isArray(imageUrls)) {
            imageUrls = [];
        }

        let query = `SELECT DISTINCT u.username FROM users u`;
        const params = [];

        if (targetType === 'shop' || targetType === 'farmer') {
            query += ` JOIN contents c ON u.id = c.author_id AND c.type = 'business_profile' AND c.business_b_type = ?`;
            params.push(targetType);
        }

        query += ` WHERE u.role = 'contributor'`;

        let stmt = env.DB.prepare(query);
        if (params.length > 0) stmt = stmt.bind(...params);
        const { results: users } = await stmt.all();

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

        const results = await sendTargetedBroadcast(env, targetUsernames, message, imageUrls);

        return jsonResponse({
            ok: true,
            summary: results
        });

    } catch (e) {
        console.error("Broadcast Error:", e);
        return errorResponse("Internal Server Error", 500);
    }
}
