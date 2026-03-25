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
        const { audience, message } = body; // audience: 'all', 'line', 'email'

        if (!message || message.trim() === '') {
            return errorResponse("Message is required", 400);
        }

        // Fetch all users
        const { results: users } = await env.DB.prepare('SELECT id, username, display_name FROM users').all();
        
        const targetUsernames = [];

        users.forEach(u => {
            if (audience === 'all') {
                targetUsernames.push(u.username);
            } else if (audience === 'line' && u.username.startsWith('line_')) {
                targetUsernames.push(u.username);
            } else if (audience === 'email' && u.username.includes('@')) {
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
