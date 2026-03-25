import { jsonResponse, errorResponse } from "../../utils/response.js";

export async function onRequestGet(context) {
    const { env } = context;

    try {
        const query = `
            SELECT id, title, created_at 
            FROM contents 
            WHERE site_scope = 'sourapple' 
            ORDER BY created_at DESC 
            LIMIT 3
        `;
        const { results } = await env.DB.prepare(query).all();

        return jsonResponse(results);
    } catch (err) {
        return errorResponse(err.message, 500);
    }
}
