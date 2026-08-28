import { jsonResponse, errorResponse } from "../../utils/response.js";
import { runFeedCrawler } from "../feeds/crawl.js";

/**
 * 毎朝定期実行用 Cron / Webhook エンドポイント
 * GET / POST /api/cron/feed-crawler?token=...
 */
export async function onRequest(context) {
    const { request, env } = context;

    const url = new URL(request.url);
    const token = url.searchParams.get("token") || request.headers.get("Authorization")?.replace("Bearer ", "");
    const secret = env.CRON_SECRET || "iizuna-cron-token-123";

    if (token !== secret && !request.headers.get("cf-worker")) {
        return errorResponse("Unauthorized cron request", 401);
    }

    try {
        console.log('[Cron] Starting scheduled feed crawl (morning 06:00 JST)...');
        const result = await runFeedCrawler(env);
        console.log('[Cron] Feed crawl finished:', result);
        return jsonResponse({ ok: true, scheduled: true, result });
    } catch (e) {
        console.error('[Cron] Scheduled crawl failed:', e);
        return errorResponse(e.message, 500);
    }
}
