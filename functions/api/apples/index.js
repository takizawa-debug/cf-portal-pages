export async function onRequestGet(context) {
    try {
        const db = context.env.DB;

        // Fetch all apple varieties ordered by display_order
        const { results } = await db.prepare(
            `SELECT * FROM apple_varieties ORDER BY display_order ASC`
        ).all();

        return new Response(JSON.stringify({ success: true, apples: results }), {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
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
            harvest_season, harvest_category,
            lineage, origin,
            official_image_url, yokai_card_url,
            summary, description
        } = data;

        const result = await db.prepare(`
            INSERT INTO apple_varieties (
                id, name_ja, name_en, name_zh,
                harvest_season, harvest_category,
                lineage, origin,
                official_image_url, yokai_card_url,
                summary, description, display_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            id, name_ja || '', name_en || '', name_zh || '',
            harvest_season || '', harvest_category || '',
            lineage || '', origin || '',
            official_image_url || '', yokai_card_url || '',
            summary || '', description || '', 999
        ).run();

        if (result.success) {
            return new Response(JSON.stringify({ success: true, id: id }), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        } else {
            throw new Error("Failed to insert variety");
        }
    } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
}
