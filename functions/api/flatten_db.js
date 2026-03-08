export async function onRequestGet(context) {
    const { env } = context;
    const db = env.DB;
    const log = [];

    try {
        const { results } = await db.prepare("SELECT id, image1, image2, image3, image4, image5, image6 FROM contents").all();

        for (const row of results) {
            let updated = false;
            let changes = {};

            for (let i = 1; i <= 6; i++) {
                const col = `image${i}`;
                const val = row[col];

                if (val && typeof val === 'string') {
                    // Fix apples/...
                    // Example: /assets/apples/hoge.jpg -> /assets/apples/jpg/hoge.jpg
                    let decodedVal = val;
                    try { decodedVal = decodeURIComponent(val); } catch (e) { }

                    let match = decodedVal.match(/\/assets\/apples\/([^\/]+\.(png|jpg|jpeg))$/i);
                    if (match) {
                        const filename = match[1];
                        const ext = match[2].toLowerCase() === 'png' ? 'png' : 'jpg';
                        changes[col] = `/assets/apples/${ext}/${filename}`;
                        updated = true;
                        continue;
                    }

                    // Fix images/ID/...
                    // Example: /assets/images/10-10-00-0001/hoge.jpg -> /assets/images/hoge.jpg
                    match = decodedVal.match(/\/assets\/images\/[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{4}\/([^\/]+\.[a-zA-Z0-9]+)$/i);
                    if (match) {
                        const filename = match[1];
                        changes[col] = `/assets/images/${filename}`;
                        updated = true;
                        continue;
                    }
                }
            }

            if (updated) {
                // Perform DB update
                let setClauses = [];
                let bindVals = [];
                for (const [col, newVal] of Object.entries(changes)) {
                    setClauses.push(`${col} = ?`);
                    bindVals.push(newVal);
                }

                if (setClauses.length > 0) {
                    bindVals.push(row.id);
                    await db.prepare(`UPDATE contents SET ${setClauses.join(', ')} WHERE id = ?`).bind(...bindVals).run();
                    log.push(`Updated ${row.id} - ${JSON.stringify(changes)}`);
                }
            }
        }

        return Response.json({ success: true, count: log.length, log });
    } catch (e) {
        return Response.json({ error: e.message, stack: e.stack });
    }
}
