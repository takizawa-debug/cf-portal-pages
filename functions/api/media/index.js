import { errorResponse, jsonResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";

export async function onRequestGet(context) {
    const { request, env } = context;
    // Auth check
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    try {
        const bucket = env.UPLOAD_BUCKET;
        const url = new URL(request.url);
        
        let prefix = url.searchParams.get('prefix') || '';
        
        // Tenant Isolation for Contributors with Shared Read Access
        if (user.role === 'contributor') {
            const userPrefix = `media/${user.id}/`;
            const officialPrefix = `official/`;

            const [userListed, officialListed] = await Promise.all([
                bucket.list({ prefix: userPrefix, limit: 1000 }),
                bucket.list({ prefix: officialPrefix, limit: 1000 })
            ]);

            const files = [];
            userListed.objects.forEach(obj => {
                files.push({ key: obj.key, url: `/assets/${obj.key}`, size: obj.size, uploaded: obj.uploaded });
            });
            officialListed.objects.forEach(obj => {
                files.push({ key: obj.key, url: `/assets/${obj.key}`, size: obj.size, uploaded: obj.uploaded });
            });

            files.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
            return jsonResponse(files);
        }

        const listed = await bucket.list({ prefix, limit: 1000 });
        const files = listed.objects.map(obj => ({
            key: obj.key,
            url: `/assets/${obj.key}`,
            size: obj.size,
            uploaded: obj.uploaded
        }));
        // Sort newest first
        files.sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
        return jsonResponse(files);
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin', 'editor', 'contributor']);
    if (roleError) return roleError;

    try {
        const formData = await request.formData();
        const file = formData.get('file');
        if (!file || !file.name) {
            return errorResponse("No file uploaded", 400);
        }

        const ext = file.name.split('.').pop() || 'jpg';
        // Sanitize name gracefully permitting localized UTF-8 Strings
        let sanitizedName = file.name.replace(/[\/\\?%*:|"<>#&\s]/g, '_');

        let folder = formData.get('folder') || 'library';
        
        // Tenant Isolation for Contributors
        if (user.role === 'contributor') {
            folder = `media/${user.id}`;
        } else {
            folder = folder.replace(/[\\?%*:|"<>#&\s]/g, '').replace(/^\/+|\/+$/g, '');
            if (!folder) folder = 'library';
        }


        // Prepend uuid to avoid collisions
        const uuid = crypto.randomUUID().split('-')[0];
        const key = `${folder}/${uuid}_${sanitizedName}`;

        await env.UPLOAD_BUCKET.put(key, await file.arrayBuffer(), {
            httpMetadata: { contentType: file.type }
        });

        return jsonResponse({ success: true, url: `/assets/${key}`, key });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin', 'editor', 'contributor']);
    if (roleError) return roleError;

    try {
        const { key } = await request.json();
        if (!key) return errorResponse("No key provided", 400);

        // Tenant Isolation for Contributors
        if (user.role === 'contributor') {
            if (!key.startsWith(`media/${user.id}/`)) {
                return errorResponse("Forbidden: You can only delete your own media files", 403);
            }
        } else if (user.role === 'editor') {
            if (key.startsWith('official/')) {
                return errorResponse("Forbidden: Editors cannot delete Official Materials", 403);
            }
        }

        await env.UPLOAD_BUCKET.delete(key);
        return jsonResponse({ success: true });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
