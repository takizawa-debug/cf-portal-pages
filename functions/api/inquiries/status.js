import { errorResponse, jsonResponse, optionsResponse } from "../../utils/response";
export async function onRequest(context) {
    const { request, env } = context;

    if (request.method === 'OPTIONS') {
        return optionsResponse();
    }

    if (request.method === 'PUT') {
        try {
            const { id, status } = await request.json();

            await env.DB.prepare('UPDATE form_submissions SET status = ? WHERE id = ?')
                .bind(status, id)
                .run();

            return jsonResponse({ ok: true });
        } catch (error) {
            return errorResponse(error.message, 500);
        }
    }

    return errorResponse('Method Not Allowed', 405);
}
