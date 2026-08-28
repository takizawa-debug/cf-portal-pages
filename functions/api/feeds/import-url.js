import { errorResponse, jsonResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";
import { generateContentHash, stripTags, decodeEntities } from "../../utils/feed-crawler.js";
import { analyzeFeedItemWithGemini } from "../../utils/feed-ai.js";

/**
 * POST /api/feeds/import-url
 * 任意のWebページURL（NERIなどの個別イベントURLやニュース記事）を直接取得し、AI考察・ドラフトを生成して未処理一覧に追加
 */
export async function onRequestPost(context) {
    const { request, env } = context;
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin']);
    if (roleError) return roleError;

    try {
        const body = await request.json();
        const { url, feed_id } = body;

        if (!url || !url.startsWith('http')) {
            return errorResponse("有効なURLを入力してください", 400);
        }

        // 1. 対象ページを取得
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
            }
        });

        if (!res.ok) {
            return errorResponse(`ページを取得できませんでした (HTTP ${res.status})`, 400);
        }

        const html = await res.text();

        // 2. HTMLからメタデータと本文を抽出
        const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
        let title = titleMatch ? stripTags(titleMatch[1]).trim() : 'インポート記事';
        title = title.replace(/\s*\|\s*.*$/, ''); // "| 一般財団法人..." を除去

        const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content=["']([^"']+)["']/i);
        const mediaUrl = ogImageMatch ? ogImageMatch[1] : null;

        // 日付抽出
        const dateMatch = html.match(/(?:最終更新日|公開日|発表日|日付|Date)[：:\s]*([0-9０-９年\/\.-]+(?:月[0-9０-９]+日)?)/i) 
                       || html.match(/([0-9]{4}[\/\.-][0-9]{1,2}[\/\.-][0-9]{1,2})/);
        let detectedDate = new Date().toISOString().slice(0, 10);
        if (dateMatch) {
            detectedDate = dateMatch[1].trim();
        }

        // 本文テキスト抽出 (script, style, nav, footer, header を除去)
        let cleanHtml = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<nav[\s\S]*?<\/nav>/gi, '')
            .replace(/<header[\s\S]*?<\/header>/gi, '')
            .replace(/<footer[\s\S]*?<\/footer>/gi, '');

        let rawText = stripTags(cleanHtml).replace(/\s+/g, ' ').trim().slice(0, 2000);

        // 3. フィード情報の関連付け
        const targetFeedId = feed_id || 'feed-town-press';
        const feed = await env.DB.prepare("SELECT * FROM external_feeds WHERE id = ?").bind(targetFeedId).first() || {
            id: 'custom-import',
            name: '直接URLインポート',
            target_l1: '味わう',
            target_l2: 'イベント',
            target_l3: 'りんごフェア'
        };

        const hash = await generateContentHash(`import-${url}-${title}`);
        const itemId = `efi-${crypto.randomUUID()}`;

        // 重複確認
        const existing = await env.DB.prepare("SELECT id FROM external_feed_items WHERE content_hash = ?").bind(hash).first();
        if (existing) {
            return jsonResponse({
                ok: true,
                message: '既に登録されている記事です',
                item_id: existing.id,
                is_duplicate: true
            });
        }

        // 4. Gemini による AI 考察とドラフト生成
        const itemObj = {
            id: itemId,
            feed_id: feed.id,
            title,
            source_url: url,
            pdf_url: null,
            media_url: mediaUrl,
            detected_date: detectedDate,
            raw_text: rawText
        };

        const aiResult = await analyzeFeedItemWithGemini(env, itemObj, feed);

        // 5. DBに保存
        await env.DB.prepare(`
            INSERT INTO external_feed_items (
                id, feed_id, title, source_url, pdf_url, media_url,
                detected_date, content_hash, raw_text,
                impact_level, ai_commentary, recommended_actions,
                draft_title, draft_lead, draft_body,
                suggested_l1, suggested_l2, suggested_l3,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `).bind(
            itemId,
            feed.id,
            title,
            url,
            null,
            mediaUrl,
            detectedDate,
            hash,
            rawText,
            aiResult.impact_level,
            aiResult.ai_commentary,
            aiResult.recommended_actions,
            aiResult.draft_title,
            aiResult.draft_lead,
            aiResult.draft_body,
            aiResult.suggested_l1,
            aiResult.suggested_l2,
            aiResult.suggested_l3
        ).run();

        return jsonResponse({
            ok: true,
            message: '記事をインポートし、AI考察・ドラフトを生成しました！',
            item_id: itemId,
            title,
            aiResult
        });

    } catch (e) {
        console.error('Import URL error:', e);
        return errorResponse(e.message, 500);
    }
}
