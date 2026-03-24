import { jsonResponse, errorResponse } from "../../utils/response";

export async function onRequestPut({ request, env, params }) {
    try {
        const db = env.DB;
        const id = params.id;
        const data = await request.json();

        // Ensure the ID exists first
        const existing = await db.prepare("SELECT * FROM apple_varieties WHERE id = ?").bind(id).first();
        if (!existing) {
            return errorResponse("Apple variety not found.", 404);
        }

        const {
            name_ja, name_en, name_zh,
            harvest_season,
            lineage, origin,
            official_image_url,
            summary, description
        } = data;

        const result = await db.prepare(`
            UPDATE apple_varieties
            SET name_ja = ?, name_en = ?, name_zh = ?,
                harvest_season = ?,
                lineage = ?, origin = ?,
                official_image_url = ?,
                summary = ?, description = ?
            WHERE id = ?
        `).bind(
            name_ja ?? existing.name_ja,
            name_en ?? existing.name_en,
            name_zh ?? existing.name_zh,
            harvest_season ?? existing.harvest_season,
            lineage ?? existing.lineage,
            origin ?? existing.origin,
            official_image_url ?? existing.official_image_url,
            summary ?? existing.summary,
            description ?? existing.description,
            id
        ).run();

        return jsonResponse({ success: result.success });

    } catch (err) {
        return errorResponse(err.message, 500);
    }
}

export async function onRequestDelete({ env, params }) {
    try {
        const db = env.DB;
        const id = params.id;

        const result = await db.prepare("DELETE FROM apple_varieties WHERE id = ?").bind(id).run();

        return jsonResponse({ success: result.success });

    } catch (err) {
        return errorResponse(err.message, 500);
    }
}
