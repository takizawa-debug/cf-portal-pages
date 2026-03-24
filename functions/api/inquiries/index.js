import { errorResponse, jsonResponse, optionsResponse } from "../../utils/response";
export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'OPTIONS') {
        return optionsResponse();
    }

    if (request.method === 'GET') {
        try {
            const { results } = await env.DB.prepare('SELECT id, form_type, payload_json, files_json, status, created_at FROM form_submissions ORDER BY created_at DESC').all();

            return jsonResponse(results);
        } catch (error) {
            return errorResponse(error.message, 500);
        }
    }

    return errorResponse('Method Not Allowed', 405);
}
