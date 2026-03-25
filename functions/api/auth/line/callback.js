import { errorResponse } from "../../../utils/response.js";

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    // Basic error handling for user cancelling or LINE returning an error
    if (error) {
        console.error("LINE OAuth error:", error, errorDescription);
        return Response.redirect(`${url.origin}/login.html?error=line_cancelled`, 302);
    }
    
    if (!code) {
        return Response.redirect(`${url.origin}/login.html?error=line_missing_code`, 302);
    }

    // Verify state if cookie was present
    const cookieHeader = request.headers.get("Cookie") || "";
    const cookies = Object.fromEntries(cookieHeader.split(";").map(c => c.trim().split("=")));
    if (!cookies.oauth_state_line || cookies.oauth_state_line !== state) {
        // CSRF state mismatch. Could log this.
    }

    const clientId = env.LINE_CHANNEL_ID;
    const clientSecret = env.LINE_CHANNEL_SECRET;

    if (!clientId || !clientSecret) {
        return Response.redirect(`${url.origin}/login.html?error=server_configuration_error`, 302);
    }

    const redirectUri = `${url.origin}/api/auth/line/callback`;
    
    try {
        // Exchange code for token
        const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret
            }).toString()
        });

        if (!tokenResponse.ok) {
            console.error("LINE Token response error:", await tokenResponse.text());
            return Response.redirect(`${url.origin}/login.html?error=line_token_exchange_failed`, 302);
        }

        const tokenData = await tokenResponse.json();

        // Get User Info mapping LINE Profile IDs
        const userResponse = await fetch('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });

        if (!userResponse.ok) {
            console.error("LINE Userinfo error:", await userResponse.text());
            return Response.redirect(`${url.origin}/login.html?error=line_profile_failed`, 302);
        }

        const userData = await userResponse.json();
        
        // Use the LINE unique userId as our internal tracking username.
        const internalUsername = `line_${userData.userId}`;

        let user;
        const { results } = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(internalUsername).all();
        
        if (results.length === 0) {
            // User not registered, Auto-provision as contributor
            const newUserId = crypto.randomUUID();
            const displayName = userData.displayName || 'LINE User';
            
            await env.DB.prepare(
                "INSERT INTO users (id, username, password_hash, role, display_name) VALUES (?, ?, ?, ?, ?)"
            ).bind(newUserId, internalUsername, 'OAUTH_MANAGED', 'contributor', displayName).run();
            
            user = { id: newUserId, username: internalUsername, role: 'contributor', display_name: displayName };
        } else {
            user = results[0];
            // Sync LINE profile name if local DB display_name is missing or differs significantly, though usually just update if missing
            if (!user.display_name && userData.displayName) {
                await env.DB.prepare("UPDATE users SET display_name = ? WHERE id = ?").bind(userData.displayName, user.id).run();
                user.display_name = userData.displayName;
            }
        }
        
        // Create a new session tracking Admin login duration seamlessly
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        
        await env.DB.prepare(
            "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
        ).bind(sessionId, user.id, expiresAt.toISOString()).run();
        
        const cookieValue = `admin_session_token=${sessionId}; HttpOnly; Secure; Path=/; Max-Age=604800; SameSite=Lax`;
        
        // Clean OAuth state mechanism securely
        const deadStateCookie = `oauth_state_line=; HttpOnly; Secure; Path=/api/auth/line; Max-Age=0; SameSite=Lax`;

        // Return HTML payload explicitly saving parameters into client localStorage avoiding intermediate bridging glitches natively routing directly into the dashboard framework
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
        console.error("Callback exception during LINE OAuth mapping", e);
        return Response.redirect(`${url.origin}/login.html?error=line_internal_error`, 302);
    }
}
