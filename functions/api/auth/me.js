import { errorResponse, jsonResponse } from "../../utils/response.js";
import { authenticate } from "../../utils/auth.js";

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        const user = await authenticate(request, env);
        if (!user) {
            return errorResponse("Invalid or expired session", 401);
        }

        return jsonResponse({
            ok: true,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                display_name: user.display_name,
                managed_sites: user.managed_sites || '["all"]'
            }
        });

    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
