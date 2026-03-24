import { errorResponse, jsonResponse, optionsResponse } from "../utils/response";
import { authenticate } from "../utils/auth";

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        const user = await authenticate(request, env);
        if (!user) {
            return errorResponse('Unauthorized', 401);
        }

        const flatSelect = `
            c.*,
            u.display_name as author_name,
            t_en.title as title_en, t_en.lead_text as lead_text_en, t_en.body_text as body_text_en,
            t_tw.title as title_tw, t_tw.lead_text as lead_text_tw, t_tw.body_text as body_text_tw,
            json_extract(c.media_assets, '$[0]') as image1,
            json_extract(c.media_assets, '$[1]') as image2,
            json_extract(c.media_assets, '$[2]') as image3,
            json_extract(c.media_assets, '$[3]') as image4,
            json_extract(c.media_assets, '$[4]') as image5,
            json_extract(c.media_assets, '$[5]') as image6
        `;
        const joinClause = `
            LEFT JOIN users u ON c.author_id = u.id
            LEFT JOIN content_translations t_en ON c.id = t_en.content_id AND t_en.locale = 'en'
            LEFT JOIN content_translations t_tw ON c.id = t_tw.content_id AND t_tw.locale = 'zh-TW'
        `;

        let query = `SELECT ${flatSelect} FROM contents c ${joinClause} ORDER BY c.created_at DESC`;
        let binds = [];

        if (user.role === 'contributor') {
            query = `SELECT ${flatSelect} FROM contents c ${joinClause} WHERE c.author_id = ? ORDER BY c.created_at DESC`;
            binds.push(user.id);
        }

        const { results } = await env.DB.prepare(query).bind(...binds).all();

        return jsonResponse(results);
    } catch (error) {
        return errorResponse(error.message, 500);
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return optionsResponse();
}
