export const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function optionsResponse() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

export function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
            ...corsHeaders
        }
    });
}

export function cachedJsonResponse(data, status = 200, maxAge = 60) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
            ...corsHeaders
        }
    });
}

export function errorResponse(message, status = 500) {
    return jsonResponse({ error: message }, status);
}
