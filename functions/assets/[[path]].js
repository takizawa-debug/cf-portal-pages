export async function onRequestGet(context) {
    const { request, env, params } = context;
    const rawPath = params.path.join('/');

    // params.path is URL decoded by CF Pages.
    // If the R2 key was created with URL encoding (%E7...), we might need to fallback.
    const path = rawPath;
    const encodedPath = encodeURIComponent(rawPath).replace(/%2F/g, '/');

    if (!path) {
        return new Response('Not Found', { status: 404 });
    }

    const bucket = env.UPLOAD_BUCKET;
    if (!bucket) {
        return new Response('R2 Bucket not configured', { status: 500 });
    }

    let object = await bucket.get(path);

    // If not found, try the encoded path (some uploads might have double-encoded strictly)
    if (!object) {
        object = await bucket.get(encodedPath);
    }

    if (!object) {
        // Debugging output for troubleshooting missing files
        return new Response(`File Not Found. Tried: [${path}] and [${encodedPath}]`, { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    // Enforce public cache header explicitly overriding some defaults
    headers.set('Cache-Control', 'public, max-age=31536000');

    // Guess default content type based on extension if missing
    if (!headers.has('content-type') || !headers.get('content-type')) {
        const ext = path.split('.').pop().toLowerCase();
        let mime = 'application/octet-stream';
        if (['jpg', 'jpeg'].includes(ext)) mime = 'image/jpeg';
        else if (ext === 'png') mime = 'image/png';
        else if (ext === 'gif') mime = 'image/gif';
        else if (ext === 'webp') mime = 'image/webp';
        else if (ext === 'svg') mime = 'image/svg+xml';
        headers.set('content-type', mime);
    }

    return new Response(object.body, {
        headers,
    });
}
