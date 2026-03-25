import { jsonResponse, errorResponse } from "../../utils/response.js";
import { sendTargetedBroadcast } from "../../utils/notification.js";

export async function onRequestGet(context) {
    const { request, env } = context;

    // Optional lightweight security token for automated external cron fetchers.
    // GitHub Actions or external apps must pass ?token=YOUR_CRON_SECRET
    const url = new URL(request.url);
    const passedToken = url.searchParams.get("token") || request.headers.get("Authorization")?.replace("Bearer ", "");
    
    // In production, you would define CRON_SECRET in Cloudflare Variables.
    // If it's not strictly set, we allow a fallback token "dev-cron-secret" 
    // to ensure the user can test the schedule immediately without managing CF dashboard limits.
    const expectedToken = env.CRON_SECRET || "iizuna-cron-token-123";

    if (passedToken !== expectedToken) {
        return errorResponse("Unauthorized cron runner", 401);
    }

    try {
        // Fetch pending schedules spanning backwards from the current UTC timestamp
        const pendingStmt = env.DB.prepare(`
            SELECT * FROM broadcast_history
            WHERE status = 'pending' AND scheduled_at <= datetime('now', 'localtime')
            LIMIT 50
        `);
        const { results: pendingJobs } = await pendingStmt.all();

        if (pendingJobs.length === 0) {
            return jsonResponse({ ok: true, message: "No pending broadcasts to execute" });
        }

        const stats = { executed: 0, failed: 0 };

        for (const job of pendingJobs) {
            try {
                // Lock the job to prevent duplicate instances firing concurrently
                await env.DB.prepare(`UPDATE broadcast_history SET status = 'processing' WHERE id = ?`).bind(job.id).run();

                // Generate target username arrays based on the query configuration exactly like the manual pipeline
                let query = `SELECT DISTINCT u.username FROM users u`;
                const params = [];
                if (job.target_type === 'shop' || job.target_type === 'farmer') {
                    query += ` JOIN contents c ON u.id = c.author_id AND c.type = 'business_profile' AND c.business_b_type = ?`;
                    params.push(job.target_type);
                }
                query += ` WHERE u.role = 'contributor'`;

                let targetStmt = env.DB.prepare(query);
                if (params.length > 0) targetStmt = targetStmt.bind(...params);
                const { results: users } = await targetStmt.all();

                const targetUsernames = [];
                users.forEach(u => {
                    if (job.channel === 'both') {
                        targetUsernames.push(u.username);
                    } else if (job.channel === 'line' && u.username.startsWith('line_')) {
                        targetUsernames.push(u.username);
                    } else if (job.channel === 'email' && u.username.includes('@')) {
                        targetUsernames.push(u.username);
                    }
                });

                // Re-hydrate image URLs from SQL string format
                let imageUrls = [];
                try { imageUrls = JSON.parse(job.image_urls); } catch(e){}

                // Send 
                const notifyResults = await sendTargetedBroadcast(env, targetUsernames, job.message, imageUrls);

                // Update to completed
                await env.DB.prepare(`
                    UPDATE broadcast_history
                    SET status = 'completed', sent_at = CURRENT_TIMESTAMP, result_json = ?
                    WHERE id = ?
                `).bind(JSON.stringify(notifyResults), job.id).run();

                stats.executed++;
            } catch (jobErr) {
                console.error(`Job [${job.id}] Failed:`, jobErr);
                await env.DB.prepare(`UPDATE broadcast_history SET status = 'failed' WHERE id = ?`).bind(job.id).run();
                stats.failed++;
            }
        }

        return jsonResponse({
            ok: true,
            summary: stats
        });

    } catch (err) {
        console.error("Cron Orchestrator Error:", err);
        return errorResponse("Internal Server Error processing scheduled events", 500);
    }
}
