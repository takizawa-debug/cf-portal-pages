export async function onRequestPut({ request, env, params }) {
    try {
        const db = env.DB;
        const id = params.id;
        const data = await request.json();

        // Ensure the ID exists first
        const existing = await db.prepare("SELECT * FROM apple_varieties WHERE id = ?").bind(id).first();
        if (!existing) {
            return new Response(JSON.stringify({ success: false, error: "Apple variety not found." }), {
                status: 404,
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }

        const {
            name_ja, name_en, name_zh,
            harvest_season, harvest_category,
            lineage, origin,
            official_image_url, yokai_card_url,
            summary, description
        } = data;

        const result = await db.prepare(`
            UPDATE apple_varieties
            SET name_ja = ?, name_en = ?, name_zh = ?,
                harvest_season = ?, harvest_category = ?,
                lineage = ?, origin = ?,
                official_image_url = ?, yokai_card_url = ?,
                summary = ?, description = ?
            WHERE id = ?
        `).bind(
            name_ja ?? existing.name_ja,
            name_en ?? existing.name_en,
            name_zh ?? existing.name_zh,
            harvest_season ?? existing.harvest_season,
            harvest_category ?? existing.harvest_category,
            lineage ?? existing.lineage,
            origin ?? existing.origin,
            official_image_url ?? existing.official_image_url,
            yokai_card_url ?? existing.yokai_card_url,
            summary ?? existing.summary,
            description ?? existing.description,
            id
        ).run();

        return new Response(JSON.stringify({ success: result.success }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }
}

export async function onRequestDelete({ env, params }) {
    try {
        const db = env.DB;
        const id = params.id;

        const result = await db.prepare("DELETE FROM apple_varieties WHERE id = ?").bind(id).run();

        return new Response(JSON.stringify({ success: result.success }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    }
}
