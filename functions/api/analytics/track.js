/**
 * /api/analytics/track.js — イベント受信エンドポイント（認証不要）
 * 役割: フロントエンドから送信されるアナリティクスイベントをD1に保存
 * - バッチ送信対応（events[]配列）
 * - sendBeacon（text/plain）とfetch（application/json）両方に対応
 * - Cloudflare cfヘッダーからGeo情報を自動取得
 * - IPアドレスのSHA-256ハッシュ化（プライバシー配慮）
 * - AI/検索/SNSボットの自動分類
 */
import { jsonResponse, optionsResponse } from '../../utils/response.js';

/**
 * ボット分類 — User-Agentからクローラーの種類を判定
 * @param {string} ua - User-Agent文字列
 * @returns {{ type: string, name: string } | null}
 */
function classifyBot(ua) {
    if (!ua) return null;
    const lower = ua.toLowerCase();

    // === AIクローラー ===
    if (lower.includes('gptbot'))           return { type: 'ai', name: 'GPTBot (OpenAI)' };
    if (lower.includes('chatgpt-user'))     return { type: 'ai', name: 'ChatGPT-User' };
    if (lower.includes('oai-searchbot'))    return { type: 'ai', name: 'OAI-SearchBot (OpenAI)' };
    if (lower.includes('claudebot'))        return { type: 'ai', name: 'ClaudeBot (Anthropic)' };
    if (lower.includes('anthropic-ai'))     return { type: 'ai', name: 'Anthropic-AI' };
    if (lower.includes('perplexitybot'))    return { type: 'ai', name: 'PerplexityBot' };
    if (lower.includes('cohere-ai'))        return { type: 'ai', name: 'Cohere-AI' };
    if (lower.includes('google-extended'))  return { type: 'ai', name: 'Google-Extended (Gemini)' };
    if (lower.includes('bytespider'))       return { type: 'ai', name: 'ByteSpider (ByteDance)' };
    if (lower.includes('ccbot'))            return { type: 'ai', name: 'CCBot (Common Crawl)' };
    if (lower.includes('meta-externalagent')) return { type: 'ai', name: 'Meta-ExternalAgent' };
    if (lower.includes('meta-webindexer'))  return { type: 'ai', name: 'Meta-WebIndexer' };
    if (lower.includes('duckassistbot'))    return { type: 'ai', name: 'DuckAssistBot (DuckDuckGo AI)' };
    if (lower.includes('applebot-extended')) return { type: 'ai', name: 'Applebot-Extended (Apple AI)' };
    if (lower.includes('applebot'))         return { type: 'ai', name: 'Applebot (Apple Intelligence)' };
    if (lower.includes('diffbot'))          return { type: 'ai', name: 'Diffbot' };

    // === 検索エンジンクローラー ===
    if (lower.includes('googlebot'))        return { type: 'search', name: 'Googlebot' };
    if (lower.includes('google-inspectiontool')) return { type: 'search', name: 'Google-InspectionTool' };
    if (lower.includes('bingbot'))          return { type: 'search', name: 'Bingbot' };
    if (lower.includes('yandexbot'))        return { type: 'search', name: 'YandexBot' };
    if (lower.includes('baiduspider'))      return { type: 'search', name: 'BaiduSpider' };
    if (lower.includes('duckduckbot'))      return { type: 'search', name: 'DuckDuckBot' };
    if (lower.includes('slurp'))            return { type: 'search', name: 'Yahoo Slurp' };

    // === SNSクローラー ===
    if (lower.includes('twitterbot'))       return { type: 'social', name: 'TwitterBot' };
    if (lower.includes('facebookexternalhit')) return { type: 'social', name: 'Facebook' };
    if (lower.includes('linkedinbot'))      return { type: 'social', name: 'LinkedInBot' };
    if (lower.includes('linebot'))          return { type: 'social', name: 'LINEBot' };
    if (lower.includes('discordbot'))       return { type: 'social', name: 'DiscordBot' };
    if (lower.includes('slackbot'))         return { type: 'social', name: 'SlackBot' };

    // === その他のボット（汎用検出） ===
    if (lower.includes('headless') || lower.includes('lighthouse') || lower.includes('puppeteer') || lower.includes('playwright')) {
        return { type: 'crawler', name: 'Headless / Automation' };
    }
    if (lower.includes('bot') || lower.includes('crawler') || lower.includes('spider') || lower.includes('scrapy')) {
        return { type: 'other', name: ua.slice(0, 60) };
    }

    return null;
}

export async function onRequestPost({ request, env }) {
    const db = env.DB;

    // sendBeaconはtext/plainで送る場合があるため、両方のContent-Typeに対応
    let body;
    try {
        body = await request.json();
    } catch (_) {
        try {
            const txt = await request.text();
            body = JSON.parse(txt);
        } catch (__) {
            return jsonResponse({ error: 'Invalid request body' }, 400);
        }
    }

    const userAgent = request.headers.get('User-Agent') || '';
    const ip = request.headers.get('CF-Connecting-IP') || '127.0.0.1';

    // Cloudflare Geoデータ（本番環境でのみ利用可能）
    const cf = request.cf || {};
    const geoCountry = request.headers.get('CF-IPCountry') || cf.country || null;
    const geoRegion = cf.region || null;
    const geoCity = cf.city || null;

    // IPハッシュ化（ソルト付き SHA-256）
    const salt = env.ANALYTICS_SALT || 'appletown-iizuna-salt';
    const ipHashInput = new TextEncoder().encode(ip + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', ipHashInput);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // ボット分類
    const bot = classifyBot(userAgent);
    const botType = bot?.type || null;
    const botName = bot?.name || null;

    // バッチ送信対応: events[]配列 or 単一イベントオブジェクト
    const events = body.events ? body.events : [body];

    try {
        // テーブル自動作成（初回デプロイ時のフォールバック）
        await db.exec("CREATE TABLE IF NOT EXISTS analytics_events (id TEXT PRIMARY KEY, event_name TEXT NOT NULL, event_data TEXT, user_agent TEXT, ip_hash TEXT, session_id TEXT, visitor_id TEXT, geo_country TEXT, geo_region TEXT, geo_city TEXT, bot_type TEXT, bot_name TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)");

        const statements = [];
        for (const evt of events) {
            const eventName = evt.event_name;
            if (!eventName) continue;

            // ボット判定されている場合は、巡回記録に必要な page_view のみ保存（D1書き込み量の抑制とノイズ排除）
            if (botType && eventName !== 'page_view') continue;

            const sessionId = evt.session_id || 'anonymous';
            const visitorId = evt.visitor_id || null;
            // イベント固有データをまるごとJSONで保存
            const eventData = JSON.stringify(evt);
            const id = evt.event_id || crypto.randomUUID();

            statements.push(
                db.prepare(`
                    INSERT OR IGNORE INTO analytics_events (
                        id, event_name, event_data, user_agent, ip_hash, 
                        session_id, visitor_id,
                        geo_country, geo_region, geo_city,
                        bot_type, bot_name,
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                `).bind(
                    id, eventName, eventData, userAgent, ipHash,
                    sessionId, visitorId,
                    geoCountry, geoRegion, geoCity,
                    botType, botName
                )
            );
        }

        if (statements.length > 0) {
            await db.batch(statements);
        }

        return jsonResponse({ success: true, recorded: statements.length, bot: botType ? true : false });
    } catch (err) {
        console.error('Analytics tracking error:', err);
        return jsonResponse({ error: 'Failed to record event' }, 500);
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}
