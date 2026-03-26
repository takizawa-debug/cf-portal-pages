export async function onRequestGet({ env }) {
    try {
        const listed = await env.UPLOAD_BUCKET.list({ prefix: 'official/' });
        
        const targets = [
            'いいづなまちらいふ.pdf',
            'おいしい林檎と美しい田舎.pdf',
            '私たち長野県飯綱町に移住しました.pdf',
            '飯綱町産の海外品種りんご.pdf'
        ].map(n => n.normalize('NFC'));
        const nfdTargets = [
            'いいづなまちらいふ.pdf',
            'おいしい林檎と美しい田舎.pdf',
            '私たち長野県飯綱町に移住しました.pdf',
            '飯綱町産の海外品種りんご.pdf'
        ].map(n => n.normalize('NFD'));

        let moved = [];
        
        for (const obj of listed.objects) {
            const oldKey = obj.key;
            const filename = oldKey.replace('official/', '');
            if (filename.includes('/')) continue; 

            if (targets.includes(filename.normalize('NFC')) || nfdTargets.includes(filename.normalize('NFD'))) {
                const newKey = `official/飯綱町パンフレット/${filename}`;
                
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
        }
        
        return Response.json({ success: true, count: moved.length, moved });
    } catch(e) {
        return new Response(e.message, {status: 500});
    }
}
