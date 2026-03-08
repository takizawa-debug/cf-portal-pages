export async function onRequestGet(context) {
    const { env } = context;
    const bucket = env.UPLOAD_BUCKET;
    let items = [];
    let cursor;

    do {
        const listed = await bucket.list({ prefix: '', cursor });
        items.push(...listed.objects);
        cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);

    return Response.json(items.map(x => x.key));
}
