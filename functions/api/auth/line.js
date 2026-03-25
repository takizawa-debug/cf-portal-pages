import { errorResponse } from "../../utils/response.js";

export async function onRequestGet(context) {
    const { request, env } = context;
    const clientId = env.LINE_CHANNEL_ID;

    if (!clientId) {
        return errorResponse("LINE_CHANNEL_ID is not configured.", 500);
    }

    const url = new URL(request.url);
    const redirectUri = `${url.origin}/api/auth/line/callback`;
    const scope = "profile openid email";
    
    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    
    // Include bot_prompt=normal to prompt users to add the LINE Official Account as a friend
    const lineUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}&bot_prompt=normal`;
    
    // Store state in a strict secure cookie (5 min expiration)
    const cookieValue = `oauth_state_line=${state}; HttpOnly; Secure; Path=/api/auth/line; Max-Age=300; SameSite=Lax`;

    return new Response(null, {
        status: 302,
        headers: {
            "Location": lineUrl,
            "Set-Cookie": cookieValue
        }
    });
}
