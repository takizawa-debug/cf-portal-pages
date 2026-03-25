/* JWT Utilities via Web Crypto API */
function base64UrlEncode(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str) {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
        base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export async function signJWT(payload, secret) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64UrlEncode(encoder.encode(JSON.stringify(header)));
    const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
    
    const dataToSign = `${encodedHeader}.${encodedPayload}`;
    
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(dataToSign));
    const encodedSignature = base64UrlEncode(signature);
    
    return `${dataToSign}.${encodedSignature}`;
}

export async function verifyJWT(token, secret) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const [encodedHeader, encodedPayload, encodedSignature] = parts;
        const dataToVerify = `${encodedHeader}.${encodedPayload}`;
        
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );
        
        const signatureBytes = base64UrlDecode(encodedSignature);
        const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(dataToVerify));
        
        if (!isValid) return null;
        
        const payloadStr = decoder.decode(base64UrlDecode(encodedPayload));
        const payload = JSON.parse(payloadStr);
        
        // Check Expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        
        return payload;
    } catch (e) {
        return null;
    }
}

export async function authenticate(request, env) {
    const cookieHeader = request.headers.get("Cookie") || "";
    const match = cookieHeader.match(/admin_session_token=([^;]+)/);
    if (!match) return null;

    const token = match[1];
    const secret = env.JWT_SECRET || "default_local_jwt_secret_development_only";
    return await verifyJWT(token, secret);
}

export function requireRole(user, allowedRoles) {
    if (!user || !allowedRoles.includes(user.role)) {
        return new Response(JSON.stringify({ error: "Forbidden: insufficient permissions" }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
        });
    }
    return null; // Passes check
}
