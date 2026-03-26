export async function onRequestGet({ env }) {
    try {
        const listedJpg = await env.UPLOAD_BUCKET.list({ prefix: 'apples/jpg/' });
        const listedPng = await env.UPLOAD_BUCKET.list({ prefix: 'apples/png/' });
        
        const allObjects = [...listedJpg.objects, ...listedPng.objects];
        let moved = [];
        
        // Process in chunks to avoid worker timeout
        for (const obj of allObjects) {
            const oldKey = obj.key;
            if (oldKey.endsWith('/')) continue; // Skip strict directory objects
            
            const newKey = oldKey.replace('apples/', 'official/りんご画像/');
            
            // Read stream and re-put
            const file = await env.UPLOAD_BUCKET.get(oldKey);
            if (file) {
                await env.UPLOAD_BUCKET.put(newKey, file.body, {
                   httpMetadata: file.httpMetadata,
                   customMetadata: file.customMetadata
                });
                await env.UPLOAD_BUCKET.delete(oldKey);
                moved.push(newKey);
            }
        }
        
        // Also cleanup the apples/ directories if they are empty
        await env.UPLOAD_BUCKET.delete('apples/jpg/');
        await env.UPLOAD_BUCKET.delete('apples/png/');
        await env.UPLOAD_BUCKET.delete('apples/');

        return Response.json({ success: true, count: moved.length, moved });
    } catch(e) {
        return new Response(e.message, {status: 500});
    }
}
