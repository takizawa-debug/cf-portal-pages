import { errorResponse, jsonResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";

export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    // Only Admins and Editors can move media payloads recursively or inherently
    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    try {
        const { source, destination, isFolder } = await request.json();
        if (!source || !destination) return errorResponse("Missing parameters", 400);

        // Subvert sandbox traversal attempts explicitly
        if (source.includes('..') || destination.includes('..')) {
            return errorResponse("Invalid traversal structure detected", 400);
        }

        // Maintain Tenant Isolation logic against the Official namespace
        if (user.role === 'editor') {
            if (source.startsWith('official/') || destination.startsWith('official/')) {
                return errorResponse("Forbidden: Editors lack permissions to modify Official structures natively", 403);
            }
        }

        const bucket = env.UPLOAD_BUCKET;

        if (!isFolder) {
            // Relocate Single Target Node
            const object = await bucket.get(source);
            if (!object) return errorResponse("Source file not found", 404);

            await bucket.put(destination, object.body, {
                httpMetadata: object.httpMetadata,
                customMetadata: object.customMetadata
            });
            await bucket.delete(source);
            return jsonResponse({ success: true, moved: 1 });
        } else {
            // Relocate Entire Folder Hierarchy Recursively
            const srcPrefix = source.endsWith('/') ? source : source + '/';
            const dstPrefix = destination.endsWith('/') ? destination : destination + '/';

            let cursor = undefined;
            let movedCount = 0;
            
            do {
                const listed = await bucket.list({ prefix: srcPrefix, limit: 1000, cursor });
                for (const obj of listed.objects) {
                    const newKey = obj.key.replace(srcPrefix, dstPrefix);
                    const fileBody = await bucket.get(obj.key);
                    if (fileBody) {
                        await bucket.put(newKey, fileBody.body, {
                            httpMetadata: fileBody.httpMetadata,
                            customMetadata: fileBody.customMetadata
                        });
                        await bucket.delete(obj.key);
                        movedCount++;
                    }
                }
                cursor = listed.truncated ? listed.cursor : undefined;
                
                // Break infinite loops preventing worker execution limits natively overriding ~50ms bounds
                if (movedCount > 1000) break; 
            } while (cursor);

            return jsonResponse({ success: true, moved: movedCount });
        }
    } catch (e) {
        console.error("Move error:", e);
        return errorResponse(e.message, 500);
    }
}
