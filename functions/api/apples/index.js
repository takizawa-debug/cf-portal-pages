import { errorResponse, jsonResponse } from "../../utils/response";
export async function onRequestGet(context) {
    try {
        const db = context.env.DB;

        // Fetch all apple varieties ordered by display_order
        const { results } = await db.prepare(
            `SELECT * FROM apple_varieties ORDER BY display_order ASC`
        ).all();

        return jsonResponse({ success: true, apples: results });
    } catch (err) {
        return errorResponse(err.message, 500);
    }
}

export async function onRequestPost({ request, env }) {
    try {
        const db = env.DB;
        const data = await request.json();

        // Create a new UUID if not provided
        const id = data.id || crypto.randomUUID();

        // Prepare the basic fields
        const {
            name_ja, name_en, name_zh,
            harvest_season,
            lineage, origin,
            official_image_url,
            summary, description
        } = data;

        const result = await db.prepare(`
            INSERT INTO apple_varieties (
                id, name_ja, name_en, name_zh,
                harvest_season,
                lineage, origin,
                official_image_url,
                summary, description, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, name_ja || '', name_en || '', name_zh || '',
            harvest_season || '',
            lineage || '', origin || '',
            official_image_url || '',
            summary || '', description || '', 999
        ).run();

        if (result.success) {
            return jsonResponse({ success: true, id: id });
        } else {
            throw new Error("Failed to insert variety");
        }
    } catch (err) {
        return errorResponse(err.message, 500);
    }
}
