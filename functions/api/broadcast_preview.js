import { jsonResponse, errorResponse } from "../utils/response.js";
import { authenticate } from "../utils/auth.js";

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const targetType = url.searchParams.get('target_type') || 'all';
    const channel = url.searchParams.get('channel') || 'both';

    // Authenticate user
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);
    if (user.role === 'contributor') return errorResponse("Forbidden", 403);

    try {
        let query = `SELECT DISTINCT u.username FROM users u`;
        const params = [];

        if (targetType === 'shop' || targetType === 'farmer') {
            query += ` JOIN contents c ON u.id = c.author_id AND c.type = 'business_profile' AND c.business_b_type = ?`;
            params.push(targetType);
        }

        query += ` WHERE u.role = 'contributor'`;

        const { results: users } = await env.DB.prepare(query).bind(...params).all();

        let lineCount = 0;
        let emailCount = 0;

        users.forEach(u => {
            if (channel === 'both' || channel === 'line') {
                if (u.username.startsWith('line_')) lineCount++;
            }
            if (channel === 'both' || channel === 'email') {
                if (u.username.includes('@')) emailCount++;
            }
        });

        return jsonResponse({
            ok: true,
            count: lineCount + emailCount,
            line_count: lineCount,
            email_count: emailCount
        });
    } catch (e) {
        console.error("Preview Error:", e);
        return errorResponse("Internal Server Error", 500);
    }
}
