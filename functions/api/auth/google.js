import { errorResponse } from "../../utils/response.js";

export async function onRequestGet(context) {
    const { request, env } = context;
    const clientId = env.GOOGLE_CLIENT_ID;

    if (!clientId) {
        return errorResponse("Google Client ID is not configured.", 500);
    }

    const url = new URL(request.url);
    const redirectUri = `${url.origin}/api/auth/google/callback`;
    const scope = "email profile";
    
    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    
    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}&access_type=online`;
    
    // Store state in a strict secure cookie (5 min expiration)
    const cookieValue = `oauth_state=${state}; HttpOnly; Secure; Path=/api/auth/google; Max-Age=300; SameSite=Lax`;

    return new Response(null, {
        status: 302,
        headers: {
            "Location": googleUrl,
            "Set-Cookie": cookieValue
        }
    });
}
