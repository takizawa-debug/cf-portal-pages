import { errorResponse, jsonResponse, optionsResponse } from "../../utils/response.js";
import { authenticate } from "../../utils/auth.js";

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'OPTIONS') {
        return optionsResponse();
    }

    if (request.method === 'GET') {
        const user = await authenticate(request, env);
        if (!user) return errorResponse("Unauthorized", 401);

        try {
            let query = 'SELECT id, form_type, payload_json, files_json, status, created_at FROM form_submissions';
            let params = [];
            
            const managedSites = JSON.parse(user.managed_sites || '["all"]');
            
            // Apply Zero-Trust DB filtering if they aren't authorized for everything
            if (user.role !== 'admin' && !managedSites.includes('all')) {
                if (managedSites.length === 0) {
                    return jsonResponse([]);
                }
                const allowedTypes = managedSites.map(site => `${site}_contact`);
                const placeholders = allowedTypes.map(() => '?').join(',');
                query += ` WHERE form_type IN (${placeholders})`;
                params = allowedTypes;
            }

            query += ' ORDER BY created_at DESC';
            
            const { results } = await env.DB.prepare(query).bind(...params).all();

            return jsonResponse(results);
        } catch (error) {
            return errorResponse(error.message, 500);
        }
    }

    return errorResponse('Method Not Allowed', 405);
}
