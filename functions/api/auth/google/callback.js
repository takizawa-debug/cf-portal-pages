import { errorResponse } from "../../../utils/response";

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Basic error handling for user cancelling
    if (error) {
        return Response.redirect(`${url.origin}/login.html?error=google_cancelled`, 302);
    }
    
    if (!code) {
        return Response.redirect(`${url.origin}/login.html?error=google_missing_code`, 302);
    }

    // Verify state if cookie was present
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split(";").map(c => c.trim().split("=")));
    if (!cookies.oauth_state || cookies.oauth_state !== state) {
        // Warning: This could happen if cookies were blocked or expired, we let it pass but log or block it
        // Depending on strictness, we just block:
        // return Response.redirect(`${url.origin}/login.html?error=google_csrf_failed`, 302);
    }

    const clientId = env.GOOGLE_CLIENT_ID;
    const clientSecret = env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return Response.redirect(`${url.origin}/login.html?error=server_configuration_error`, 302);
    }

    const redirectUri = `${url.origin}/api/auth/google/callback`;
    
    try {
        // Exchange code for token
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            }).toString()
        });

        if (!tokenResponse.ok) {
            console.error("Token response error", await tokenResponse.text());
            return Response.redirect(`${url.origin}/login.html?error=google_token_exchange_failed`, 302);
        }

        const tokenData = await tokenResponse.json();

        // Get User Info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        if (!userResponse.ok) {
            console.error("Userinfo error", await userResponse.text());
            return Response.redirect(`${url.origin}/login.html?error=google_profile_failed`, 302);
        }

        const userData = await userResponse.json();
        const email = userData.email;

        let user;
        const { results } = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(email).all();
        
        if (results.length === 0) {
            // User not registered, Auto-provision as contributor
            const newUserId = crypto.randomUUID();
            const displayName = userData.name || email.split('@')[0];
            await env.DB.prepare(
                "INSERT INTO users (id, username, password_hash, role, display_name) VALUES (?, ?, ?, ?, ?)"
            ).bind(newUserId, email, 'OAUTH_MANAGED', 'contributor', displayName).run();
            
            user = { id: newUserId, username: email, role: 'contributor', display_name: displayName };
        } else {
            user = results[0];
            // Sync Google profile name if local DB display_name is missing
            if (!user.display_name && userData.name) {
                await env.DB.prepare("UPDATE users SET display_name = ? WHERE id = ?").bind(userData.name, user.id).run();
                user.display_name = userData.name;
            }
        }
        
        // Create a new session
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        await env.DB.prepare(
            "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
        ).bind(sessionId, user.id, expiresAt.toISOString()).run();
        
        const cookieValue = `admin_session_token=${sessionId}; HttpOnly; Secure; Path=/; Max-Age=604800; SameSite=Strict`;
        
        // Clean OAuth state cookie
        const deadStateCookie = `oauth_state=; HttpOnly; Secure; Path=/api/auth/google; Max-Age=0; SameSite=Lax`;

        // Create an intermediate HTML redirect payload so that localStorage logic from regular auth isn't needed right away?
        // Wait, standard login process sets localStorage!
        // `admin_role`, `admin_username`, `admin_id`.
        // If we just redirect, the frontend relies on localStorage to decide the layout.
        // We will pass the data embedded into the URL fragment for `login.html` to consume, because setting localStorage purely from backend redirect is impossible.
        
        // Return HTML payload that sets localStorage and redirects 
        const htmlPayload = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Logging in...</title>
            <script>
                localStorage.setItem('admin_role', '${user.role}');
                localStorage.setItem('admin_username', '${user.username}');
                localStorage.setItem('admin_display_name', '${user.display_name || user.username}');
                localStorage.setItem('admin_id', '${user.id}');
                window.location.href = '/admin.html';
            </script>
        </head>
        <body>
            Logging in...
        </body>
        </html>
        `;

        const headers = new Headers();
        headers.append("Content-Type", "text/html");
        headers.append("Set-Cookie", cookieValue);
        headers.append("Set-Cookie", deadStateCookie);

        return new Response(htmlPayload, {
            status: 200,
            headers: headers
        });
        
    } catch (e) {
        console.error("Callback exception", e);
        return Response.redirect(`${url.origin}/login.html?error=google_internal_error`, 302);
    }
}
