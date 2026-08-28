import { jsonResponse, errorResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";
import { crawlFeed } from "../../utils/feed-crawler.js";
import { analyzeFeedItemWithGemini } from "../../utils/feed-ai.js";
import { sendFeedAlertEmail } from "../../utils/feed-notifier.js";

/**
 * 全アクティブフィード（または指定フィード）を巡回し、新着検出 ➔ AI考察 ➔ メール通知 ➔ DB保存を実行
 */
export async function runFeedCrawler(env, targetFeedId = null) {
    let query = "SELECT * FROM external_feeds WHERE is_active = 1";
    let params = [];
    if (targetFeedId) {
        query += " AND id = ?";
        params.push(targetFeedId);
    }

    const { results: feeds } = await env.DB.prepare(query).bind(...params).all();
    const summary = {
        checked_feeds: feeds.length,
        total_detected: 0,
        new_items: 0,
        errors: []
    };

    for (const feed of feeds) {
        try {
            console.log(`[Crawler] Crawling feed: ${feed.name} (${feed.source_type})`);
            const rawItems = await crawlFeed(feed, env);
            summary.total_detected += rawItems.length;

            const newItemsForFeed = [];

            for (const item of rawItems) {
                // 重複チェック
                const existing = await env.DB.prepare(
                    "SELECT id FROM external_feed_items WHERE content_hash = ?"
                ).bind(item.content_hash).first();

                if (existing) {
                    continue; // 既に検知済み
                }

                // 新着！Gemini 2.5 Flash で AI考察 & 記事ドラフトを生成
                console.log(`[Crawler] New item detected: ${item.title}. Running Gemini AI analysis...`);
                const aiResult = await analyzeFeedItemWithGemini(env, item, feed);

                const itemId = `efi-${crypto.randomUUID()}`;
                const fullItem = {
                    id: itemId,
                    feed_id: feed.id,
                    title: item.title,
                    source_url: item.source_url,
                    pdf_url: item.pdf_url,
                    media_url: item.media_url,
                    detected_date: item.detected_date,
                    content_hash: item.content_hash,
                    impact_level: aiResult.impact_level,
                    ai_commentary: aiResult.ai_commentary,
                    recommended_actions: aiResult.recommended_actions,
                    draft_title: aiResult.draft_title,
                    draft_lead: aiResult.draft_lead,
                    draft_body: aiResult.draft_body,
                    suggested_l1: aiResult.suggested_l1,
                    suggested_l2: aiResult.suggested_l2,
                    suggested_l3: aiResult.suggested_l3,
                    status: 'pending'
                };

                // DBに保存
                await env.DB.prepare(`
                    INSERT INTO external_feed_items (
                        id, feed_id, title, source_url, pdf_url, media_url,
                        detected_date, content_hash, impact_level, ai_commentary,
                        recommended_actions, draft_title, draft_lead, draft_body,
                        suggested_l1, suggested_l2, suggested_l3, status
                    ) VALUES (
                        ?, ?, ?, ?, ?, ?,
                        ?, ?, ?, ?,
                        ?, ?, ?, ?,
                        ?, ?, ?, ?
                    )
                `).bind(
                    fullItem.id, fullItem.feed_id, fullItem.title, fullItem.source_url, fullItem.pdf_url, fullItem.media_url,
                    fullItem.detected_date, fullItem.content_hash, fullItem.impact_level, fullItem.ai_commentary,
                    fullItem.recommended_actions, fullItem.draft_title, fullItem.draft_lead, fullItem.draft_body,
                    fullItem.suggested_l1, fullItem.suggested_l2, fullItem.suggested_l3, fullItem.status
                ).run();

                newItemsForFeed.push(fullItem);
                summary.new_items++;
            }

            // 新着があれば管理者へメール通知
            if (newItemsForFeed.length > 0) {
                console.log(`[Crawler] Sending alert email for ${newItemsForFeed.length} new items in ${feed.name}...`);
                const emailResult = await sendFeedAlertEmail(env, newItemsForFeed, feed);
                if (emailResult.success) {
                    const itemIds = newItemsForFeed.map(i => `'${i.id}'`).join(',');
                    await env.DB.prepare(
                        `UPDATE external_feed_items SET email_sent_at = CURRENT_TIMESTAMP WHERE id IN (${itemIds})`
                    ).run();
                }
            }

            // フィードの最終巡回日時を更新
            await env.DB.prepare(
                "UPDATE external_feeds SET last_checked_at = CURRENT_TIMESTAMP, last_error = NULL WHERE id = ?"
            ).bind(feed.id).run();

        } catch (err) {
            console.error(`[Crawler] Error in feed ${feed.name}:`, err);
            summary.errors.push({ feed_id: feed.id, name: feed.name, error: err.message });
            await env.DB.prepare(
                "UPDATE external_feeds SET last_checked_at = CURRENT_TIMESTAMP, last_error = ? WHERE id = ?"
            ).bind(err.message, feed.id).run();
        }
    }

    return summary;
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);
    
    // admin のみ実行可能
    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    try {
        const body = await request.json().catch(() => ({}));
        const targetFeedId = body.feed_id || null;
        const result = await runFeedCrawler(env, targetFeedId);
        return jsonResponse({ ok: true, result });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
