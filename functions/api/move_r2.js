export async function onRequestPost(context) {
    const { request, env } = context;
    const bucket = env.UPLOAD_BUCKET;

    try {
        const url = new URL(request.url);
        const sourceKey = url.searchParams.get('from');
        const destKey = url.searchParams.get('to');

        if (!sourceKey || !destKey || sourceKey === destKey) {
            return Response.json({ success: true, skip: true });
        }

        const fileObj = await bucket.get(sourceKey);
        if (!fileObj) {
            return Response.json({ error: "Source not found" }, { status: 404 });
        }

        await bucket.put(destKey, fileObj.body, {
            httpMetadata: fileObj.httpMetadata,
            customMetadata: fileObj.customMetadata
        });

        await bucket.delete(sourceKey);

        return Response.json({ success: true, from: sourceKey, to: destKey });
    } catch (e) {
        return Response.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
