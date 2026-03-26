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
        let movedCount = 0;

        if (!isFolder) {
            // Relocate Single Target Node
            const object = await bucket.get(source);
            if (!object) return errorResponse("Source file not found", 404);

            await bucket.put(destination, object.body, {
                httpMetadata: object.httpMetadata,
                customMetadata: object.customMetadata
            });
            await bucket.delete(source);
            movedCount = 1;
        } else {
            // Relocate Entire Folder Hierarchy Recursively
            const srcPrefix = source.endsWith('/') ? source : source + '/';
            const dstPrefix = destination.endsWith('/') ? destination : destination + '/';

            let cursor = undefined;
            
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
        }

        // Database URL Reconciliation
        if (movedCount > 0) {
            const oldUrl = '/assets/' + source;
            const newUrl = '/assets/' + destination;
            const searchLike = '%' + oldUrl + '%';

            await env.DB.batch([
                env.DB.prepare(`
                    UPDATE contents 
                    SET body_text = REPLACE(body_text, ?1, ?2),
                        business_metadata = REPLACE(business_metadata, ?1, ?2),
                        media_assets = REPLACE(media_assets, ?1, ?2),
                        lead_text = REPLACE(lead_text, ?1, ?2)
                    WHERE body_text LIKE ?3 OR business_metadata LIKE ?3 OR media_assets LIKE ?3 OR lead_text LIKE ?3
                `).bind(oldUrl, newUrl, searchLike),
                env.DB.prepare(`
                    UPDATE apple_varieties
                    SET official_image_url = REPLACE(official_image_url, ?1, ?2),
                        yokai_card_url = REPLACE(yokai_card_url, ?1, ?2),
                        description = REPLACE(description, ?1, ?2)
                    WHERE official_image_url LIKE ?3 OR yokai_card_url LIKE ?3 OR description LIKE ?3
                `).bind(oldUrl, newUrl, searchLike),
                env.DB.prepare(`
                    UPDATE knowledge_base
                    SET content = REPLACE(content, ?1, ?2)
                    WHERE content LIKE ?3
                `).bind(oldUrl, newUrl, searchLike)
            ]);
        }

        return jsonResponse({ success: true, moved: movedCount });
    } catch (e) {
        console.error("Move error:", e);
        return errorResponse(e.message, 500);
    }
}
