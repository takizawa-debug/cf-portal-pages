import { authenticate, requireRole } from "../../utils/auth";

export async function onRequestGet(context) {
    const { request, env } = context;
    // Auth check
    const user = await authenticate(request, env);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const bucket = env.UPLOAD_BUCKET;
        // Optionally pass prefix like ?prefix=images/
        const url = new URL(request.url);
        const prefix = url.searchParams.get('prefix') || '';

        const listed = await bucket.list({ prefix, limit: 1000 });
        const files = listed.objects.map(obj => ({
            key: obj.key,
            url: `/assets/${obj.key}`,
            size: obj.size,
            uploaded: obj.uploaded
        }));
        // Sort newest first
        files.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
        return Response.json(files);
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file || !file.name) {
            return Response.json({ error: "No file uploaded" }, { status: 400 });
        }

        const ext = file.name.split('.').pop() || 'jpg';
        // Sanitize name
        let sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        // Prepend uuid to avoid collisions
        const uuid = crypto.randomUUID().split('-')[0];
        const key = `library/${uuid}_${sanitizedName}`;

        await env.UPLOAD_BUCKET.put(key, await file.arrayBuffer(), {
            httpMetadata: { contentType: file.type }
        });

        return Response.json({ success: true, url: `/assets/${key}`, key });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    try {
        const { key } = await request.json();
        if (!key) return Response.json({ error: "No key provided" }, { status: 400 });

        await env.UPLOAD_BUCKET.delete(key);
        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
