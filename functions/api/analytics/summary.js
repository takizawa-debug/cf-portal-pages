/**
 * /api/analytics/summary.js — アナリティクス集計API
 * 役割: 指定期間のアクセス解析データを包括的に集計して返す
 * 権限: Admin のみ
 * 
 * クエリパラメータ:
 *   days=30  → 直近30日
 *   hours=24 → 直近24時間
 */
import { jsonResponse, optionsResponse } from '../../utils/response.js';
import { authenticate, requireRole } from '../../utils/auth.js';

/** @param {Date} d */
function toDbDate(d) { return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ''); }

/** @param {Date} d */
function toJstDate(d) { return new Date(d.getTime() + 9 * 3600000).toISOString().slice(0, 10); }

/** 自サイトドメイン (リファラーフィルタ用) */
const OWN_DOMAINS = ['appletown-iizuna.com', 'cf-portal-pages.pages.dev', 'localhost'];

export async function onRequestGet({ request, env }) {
    const user = await authenticate(request, env);
    const denied = requireRole(user, ['admin', 'town_admin']);
    if (denied) return denied;

    const db = env.DB;
    const url = new URL(request.url);
    const hours = url.searchParams.get('hours');
    const days = hours ? null : parseInt(url.searchParams.get('days') || '30');
    const fromDateRaw = hours
        ? new Date(Date.now() - parseInt(hours) * 3600000)
        : new Date(Date.now() - days * 86400000);
    const fromDate = toDbDate(fromDateRaw);

    try {
        // === Batch 1: 概要クエリ（並列実行） ===
        // 人間ユーザー（一般訪問者）とボットを明確に分離
        const [eventCounts, uniques, botSummary] = await Promise.all([
            // 人間ユーザーのイベント集計
            db.prepare(`
                SELECT event_name, COUNT(*) as cnt, COUNT(DISTINCT session_id) as sessions
                FROM analytics_events 
                WHERE created_at >= ? AND (bot_type IS NULL OR bot_type = '') 
                GROUP BY event_name
            `).bind(fromDate).all(),
            // 人間ユーザーのユニーク訪問者・セッション数
            db.prepare(`
                SELECT COUNT(DISTINCT session_id) as total_sessions, 
                       COUNT(DISTINCT ip_hash) as unique_visitors
                FROM analytics_events 
                WHERE created_at >= ? AND (bot_type IS NULL OR bot_type = '')
            `).bind(fromDate).first(),
            // ボット・AIクローラーのサマリー（別枠集計）
            db.prepare(`
                SELECT 
                    COUNT(CASE WHEN event_name = 'page_view' THEN 1 END) as bot_page_views,
                    COUNT(*) as bot_total_requests,
                    COUNT(DISTINCT bot_name) as distinct_bots
                FROM analytics_events
                WHERE created_at >= ? AND bot_type IS NOT NULL AND bot_type != ''
            `).bind(fromDate).first(),
        ]);

        const countMap = {};
        const sessionMap = {};
        (eventCounts.results || []).forEach(r => {
            countMap[r.event_name] = (countMap[r.event_name] || 0) + r.cnt;
            sessionMap[r.event_name] = (sessionMap[r.event_name] || 0) + r.sessions;
        });

        const totalSessions = uniques?.total_sessions || 0;
        const uniqueVisitors = uniques?.unique_visitors || 0;
        const pageViews = countMap['page_view'] || 0;
        const pvPerSession = totalSessions > 0 ? (pageViews / totalSessions).toFixed(1) : '0';

        // === 平均滞在時間 (page_close イベントの engaged_ms から算出) ===
        let avgEngagedMs = 0;
        try {
            const engRow = await db.prepare(`
                SELECT AVG(CAST(json_extract(event_data, '$.event_params.engaged_ms') AS REAL)) as avg_engaged
                FROM analytics_events 
                WHERE event_name = 'page_close' AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                  AND json_extract(event_data, '$.event_params.engaged_ms') IS NOT NULL
            `).bind(fromDate).first();
            avgEngagedMs = Math.round(engRow?.avg_engaged || 0);
        } catch (_) {}

        // === 平均スクロール深度 ===
        let avgScrollDepth = 0;
        try {
            const scrollAvgRow = await db.prepare(`
                SELECT AVG(CAST(json_extract(event_data, '$.event_params.scroll_depth') AS REAL)) as avg_depth
                FROM analytics_events 
                WHERE event_name = 'page_close' AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                  AND json_extract(event_data, '$.event_params.scroll_depth') IS NOT NULL
            `).bind(fromDate).first();
            avgScrollDepth = Math.round(scrollAvgRow?.avg_depth || 0);
        } catch (_) {}

        // === Batch 2: ディメンション系クエリ（並列実行） ===
        const [deviceRows, referrerRows, utmRows, pageRows, hourlyRows, dailyRows] = await Promise.all([
            // デバイス分布
            db.prepare(`
                SELECT
                  CASE
                    WHEN user_agent LIKE '%Mobi%' OR user_agent LIKE '%Android%' OR user_agent LIKE '%iPhone%' THEN 'mobile'
                    WHEN user_agent IS NOT NULL AND user_agent != '' THEN 'desktop'
                    ELSE 'unknown'
                  END as device_type,
                  COUNT(DISTINCT session_id) as sessions
                FROM analytics_events 
                WHERE created_at >= ? AND (bot_type IS NULL OR bot_type = '')
                GROUP BY device_type ORDER BY sessions DESC
            `).bind(fromDate).all(),

            // リファラー
            db.prepare(`
                SELECT COALESCE(json_extract(event_data, '$.referrer'), '') as referrer,
                       COUNT(DISTINCT session_id) as sessions
                FROM analytics_events
                WHERE created_at >= ? AND event_name = 'page_view' AND (bot_type IS NULL OR bot_type = '')
                GROUP BY referrer ORDER BY sessions DESC LIMIT 20
            `).bind(fromDate).all(),

            // UTMキャンペーン
            db.prepare(`
                SELECT json_extract(event_data, '$.utm_source') as source,
                       json_extract(event_data, '$.utm_medium') as medium,
                       json_extract(event_data, '$.utm_campaign') as campaign,
                       COUNT(DISTINCT session_id) as sessions
                FROM analytics_events
                WHERE created_at >= ? AND (bot_type IS NULL OR bot_type = '') AND json_extract(event_data, '$.utm_source') IS NOT NULL
                GROUP BY source, medium, campaign ORDER BY sessions DESC LIMIT 10
            `).bind(fromDate).all(),

            // ページ別PV
            db.prepare(`
                SELECT json_extract(event_data, '$.page_url') as page_url,
                       COUNT(*) as views
                FROM analytics_events 
                WHERE event_name = 'page_view' AND created_at >= ? AND (bot_type IS NULL OR bot_type = '')
                GROUP BY page_url ORDER BY views DESC LIMIT 15
            `).bind(fromDate).all(),

            // 時間帯別セッション（JST: UTC+9時間で集計）
            db.prepare(`
                SELECT CAST(strftime('%H', created_at, '+9 hours') AS INTEGER) as hour,
                       COUNT(DISTINCT session_id) as sessions
                FROM analytics_events 
                WHERE created_at >= ? AND event_name = 'page_view' AND (bot_type IS NULL OR bot_type = '')
                GROUP BY hour ORDER BY hour
            `).bind(fromDate).all(),

            // 日別推移（JST: UTC+9時間で集計・人間とボットPVを両方取得）
            db.prepare(`
                SELECT DATE(created_at, '+9 hours') as date,
                       COUNT(DISTINCT CASE WHEN bot_type IS NULL OR bot_type = '' THEN session_id END) as sessions,
                       COUNT(CASE WHEN (bot_type IS NULL OR bot_type = '') AND event_name = 'page_view' THEN 1 END) as page_views,
                       COUNT(DISTINCT CASE WHEN (bot_type IS NULL OR bot_type = '') AND event_name = 'page_view' THEN ip_hash END) as unique_visitors,
                       COUNT(CASE WHEN bot_type IS NOT NULL AND bot_type != '' AND event_name = 'page_view' THEN 1 END) as bot_page_views
                FROM analytics_events WHERE created_at >= ?
                GROUP BY date ORDER BY date
            `).bind(fromDate).all(),
        ]);

        // デバイス加工
        const totalDeviceSessions = (deviceRows.results || []).reduce((s, r) => s + r.sessions, 0);
        const devices = (deviceRows.results || []).map(r => ({
            type: r.device_type || 'unknown',
            sessions: r.sessions,
            pct: totalDeviceSessions > 0 ? +((r.sessions / totalDeviceSessions) * 100).toFixed(1) : 0
        }));

        // リファラー加工（自サイトドメインを除外）
        const referrers = [];
        let directCount = 0;
        (referrerRows.results || []).forEach(r => {
            if (!r.referrer || r.referrer === '' || r.referrer === 'null') {
                directCount += r.sessions;
                return;
            }
            let hostname = r.referrer;
            try { hostname = new URL(r.referrer).hostname; } catch (_) {}
            if (OWN_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) return;
            const existing = referrers.find(x => x.source === hostname);
            if (existing) existing.sessions += r.sessions;
            else referrers.push({ source: hostname, sessions: r.sessions });
        });
        if (directCount > 0) referrers.unshift({ source: '(direct / bookmark)', sessions: directCount });
        referrers.sort((a, b) => b.sessions - a.sessions);

        // UTMキャンペーン
        const utm_campaigns = (utmRows.results || []).map(r => ({
            source: r.source, medium: r.medium, campaign: r.campaign, sessions: r.sessions
        }));

        // ページ別PV加工（URLをパスに変換）
        const pageMap = {};
        (pageRows.results || []).forEach(r => {
            let path = r.page_url || '/';
            try { path = new URL(r.page_url).pathname; } catch (_) {}
            // クエリパラメータを除去
            path = path.split('?')[0];
            pageMap[path] = (pageMap[path] || 0) + r.views;
        });
        const pages = Object.entries(pageMap)
            .map(([path, views]) => ({ path, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 15);

        // 時間帯別
        const hourlyMap = {};
        (hourlyRows.results || []).forEach(r => { hourlyMap[r.hour] = r.sessions; });
        const hourly = Array.from({ length: 24 }, (_, i) => ({ hour: i, sessions: hourlyMap[i] || 0 }));

        // 日別
        const daily = (dailyRows.results || []).map(r => ({
            date: r.date,
            sessions: r.sessions,
            page_views: r.page_views,
            unique_visitors: r.unique_visitors,
            bot_page_views: r.bot_page_views || 0,
        }));

        // === Batch 3: 行動・エラー系クエリ（並列実行・人間アクセスのみ） ===
        const [rageRows, geoRows, fieldRows, scrollRows, vitalRows, perfRow, errorRows, errorDetailRows] = await Promise.all([
            // Rage Click
            db.prepare(`
                SELECT json_extract(event_data, '$.event_params.target') as target, COUNT(*) as cnt
                FROM analytics_events 
                WHERE event_name = 'rage_click' AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                GROUP BY target ORDER BY cnt DESC LIMIT 5
            `).bind(fromDate).all(),

            // 地域分布
            db.prepare(`
                SELECT geo_region, COUNT(DISTINCT session_id) as sessions
                FROM analytics_events
                WHERE created_at >= ? AND geo_region IS NOT NULL AND geo_region != ''
                  AND (bot_type IS NULL OR bot_type = '')
                GROUP BY geo_region ORDER BY sessions DESC LIMIT 15
            `).bind(fromDate).all(),

            // フォーム停滞
            db.prepare(`
                SELECT json_extract(event_data, '$.event_params.field_id') as field_id,
                       COUNT(*) as hesitation_count,
                       AVG(json_extract(event_data, '$.event_params.pause_ms')) as avg_pause
                FROM analytics_events 
                WHERE event_name = 'field_hesitation' AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                GROUP BY field_id ORDER BY hesitation_count DESC LIMIT 10
            `).bind(fromDate).all(),

            // スクロール深度（page_close の scroll_depth を利用）
            db.prepare(`
                SELECT json_extract(event_data, '$.page_url') as page_url,
                       AVG(CAST(json_extract(event_data, '$.event_params.scroll_depth') AS REAL)) as avg_depth,
                       COUNT(*) as sessions
                FROM analytics_events 
                WHERE event_name = 'page_close' AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                  AND json_extract(event_data, '$.event_params.scroll_depth') IS NOT NULL
                GROUP BY page_url ORDER BY sessions DESC LIMIT 10
            `).bind(fromDate).all(),

            // Web Vitals（バックグラウンド放置タブによる極端な外れ値 [LCP > 60s] を除外して正確な実測値を集計）
            db.prepare(`
                SELECT json_extract(event_data, '$.event_params.metric') as metric,
                       AVG(CAST(json_extract(event_data, '$.event_params.value') AS REAL)) as avg_val,
                       COUNT(*) as samples
                FROM analytics_events 
                WHERE event_name = 'web_vital' 
                  AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                  AND (
                    (json_extract(event_data, '$.event_params.metric') = 'lcp' AND CAST(json_extract(event_data, '$.event_params.value') AS REAL) <= 60000)
                    OR
                    (json_extract(event_data, '$.event_params.metric') != 'lcp')
                  )
                GROUP BY metric
            `).bind(fromDate).all(),

            // パフォーマンス平均
            db.prepare(`
                SELECT AVG(json_extract(event_data, '$.event_params.ttfb')) as avg_ttfb,
                       AVG(json_extract(event_data, '$.event_params.load')) as avg_load,
                       COUNT(*) as samples
                FROM analytics_events 
                WHERE event_name = 'page_performance' AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
            `).bind(fromDate).first(),

            // JSエラー集計
            db.prepare(`
                SELECT json_extract(event_data, '$.event_params.message') as message,
                       json_extract(event_data, '$.event_params.source') as source,
                       COUNT(*) as cnt
                FROM analytics_events 
                WHERE event_name = 'js_error' AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                GROUP BY message ORDER BY cnt DESC LIMIT 10
            `).bind(fromDate).all(),

            // エラー詳細ログ
            db.prepare(`
                SELECT event_name, session_id, geo_region,
                       json_extract(event_data, '$.event_params.message') as message,
                       json_extract(event_data, '$.event_params.source') as source,
                       json_extract(event_data, '$.event_params.src') as resource_src,
                       json_extract(event_data, '$.event_params.tag') as resource_tag,
                       json_extract(event_data, '$.page_url') as page_url,
                       created_at
                FROM analytics_events
                WHERE event_name IN ('js_error', 'resource_error') AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                ORDER BY created_at DESC LIMIT 30
            `).bind(fromDate).all(),
        ]);

        const rage_clicks = (rageRows.results || []).map(r => ({ target: r.target || 'unknown', count: r.cnt }));

        const geo_regions = (geoRows.results || []).map(r => ({
            region: r.geo_region, sessions: r.sessions
        }));

        const field_hesitations = (fieldRows.results || []).map(r => ({
            field: r.field_id || 'unknown', count: r.hesitation_count, avg_pause_ms: Math.round(r.avg_pause || 0)
        }));

        // スクロール深度（page_urlをpathに変換）
        const scroll_depth = (scrollRows.results || []).map(r => {
            let path = '/';
            try { path = new URL(r.page_url || '/').pathname; } catch (_) { path = r.page_url || '/'; }
            return { path, avg_depth: Math.round(r.avg_depth || 0), sessions: r.sessions };
        });

        const web_vitals = {};
        (vitalRows.results || []).forEach(r => {
            web_vitals[r.metric] = { avg: +Number(r.avg_val || 0).toFixed(1), samples: r.samples };
        });

        const performance_avg = {
            ttfb: Math.round(perfRow?.avg_ttfb || 0),
            load: Math.round(perfRow?.avg_load || 0),
            samples: perfRow?.samples || 0,
        };

        const js_errors = (errorRows.results || []).map(r => ({
            message: (r.message || 'unknown').slice(0, 120), source: r.source, count: r.cnt
        }));

        const error_details = (errorDetailRows.results || []).map(r => {
            let path = '/';
            try { path = new URL(r.page_url || '/').pathname; } catch (_) { path = r.page_url || '/'; }
            return {
                type: r.event_name,
                message: r.event_name === 'js_error'
                    ? (r.message || '').slice(0, 120)
                    : `${r.resource_tag || ''} ${r.resource_src || ''}`.trim().slice(0, 120),
                path,
                time: r.created_at,
                region: r.geo_region,
            };
        });

        // === Batch 4: コンテンツ固有クエリ（並列実行・人間アクセスのみ） ===
        const [contentEventRows, langRows, searchRows, pdfRows] = await Promise.all([
            // 記事別の操作集計 (card_click, modal_open, modal_close, keyword_click等)
            db.prepare(`
                SELECT json_extract(event_data, '$.event_params.card_id') as card_id,
                       json_extract(event_data, '$.event_params.label') as label,
                       json_extract(event_data, '$.event_params.modal_title') as modal_title,
                       event_name,
                       COUNT(*) as cnt
                FROM analytics_events
                WHERE created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                  AND event_name IN ('card_click', 'modal_open', 'modal_close', 'modal_pdf_generate', 
                                     'modal_share', 'modal_lang_switch', 'modal_navigate', 'modal_gallery_click',
                                     'keyword_click', 'sns_link_click', 'related_article_click')
                  AND json_extract(event_data, '$.event_params.card_id') IS NOT NULL
                GROUP BY card_id, event_name
                ORDER BY cnt DESC
            `).bind(fromDate).all(),

            // 言語別利用比率
            db.prepare(`
                SELECT json_extract(event_data, '$.language') as lang,
                       COUNT(DISTINCT session_id) as sessions,
                       COUNT(*) as events
                FROM analytics_events
                WHERE created_at >= ? AND event_name = 'page_view'
                  AND (bot_type IS NULL OR bot_type = '')
                  AND json_extract(event_data, '$.language') IS NOT NULL
                GROUP BY lang ORDER BY sessions DESC
            `).bind(fromDate).all(),

            // 検索キーワード分析
            db.prepare(`
                SELECT json_extract(event_data, '$.event_params.search_term') as term,
                       COUNT(*) as search_count
                FROM analytics_events
                WHERE created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                  AND event_name IN ('search_submit', 'search_execute')
                  AND json_extract(event_data, '$.event_params.search_term') IS NOT NULL
                GROUP BY term ORDER BY search_count DESC LIMIT 20
            `).bind(fromDate).all(),

            // PDF発行数・言語切替数
            db.prepare(`
                SELECT event_name, COUNT(*) as cnt
                FROM analytics_events
                WHERE created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                  AND event_name IN ('modal_pdf_generate', 'modal_lang_switch')
                GROUP BY event_name
            `).bind(fromDate).all(),
        ]);

        // コンテンツイベントを記事別に集約
        const contentMap = {};
        (contentEventRows.results || []).forEach(r => {
            const cid = r.card_id;
            if (!cid) return;
            if (!contentMap[cid]) contentMap[cid] = { card_id: cid, title: r.label || r.modal_title || cid, clicks: 0, modal_opens: 0, pdf: 0, share: 0, lang_switch: 0, keyword_clicks: 0, sns_clicks: 0 };
            const m = contentMap[cid];
            if (!m.title || m.title === cid) m.title = r.label || r.modal_title || cid;
            switch (r.event_name) {
                case 'card_click': m.clicks += r.cnt; break;
                case 'modal_open': m.modal_opens += r.cnt; break;
                case 'modal_pdf_generate': m.pdf += r.cnt; break;
                case 'modal_share': m.share += r.cnt; break;
                case 'modal_lang_switch': m.lang_switch += r.cnt; break;
                case 'keyword_click': m.keyword_clicks += r.cnt; break;
                case 'sns_link_click': m.sns_clicks += r.cnt; break;
            }
        });
        const content_events = Object.values(contentMap)
            .sort((a, b) => (b.clicks + b.modal_opens) - (a.clicks + a.modal_opens))
            .slice(0, 20);

        // 言語別利用比率
        const language_stats = (langRows.results || []).map(r => ({
            lang: r.lang || 'unknown', sessions: r.sessions, events: r.events
        }));

        // 検索キーワード分析
        const search_analysis = (searchRows.results || []).map(r => ({
            term: r.term, count: r.search_count
        }));

        // PDF・言語切替カウント
        const pdfCount = (pdfRows.results || []).find(r => r.event_name === 'modal_pdf_generate')?.cnt || 0;
        const langSwitchCount = (pdfRows.results || []).find(r => r.event_name === 'modal_lang_switch')?.cnt || 0;

        // === Batch 5: AI/ボット・品質分析（並列実行） ===
        const [botRows, aiReferralRows, searchEngineRows, engagementRows, copyRows, deepNavRows, aiPageRows, aiRecentRows, aiDailyRows] = await Promise.all([
            // AIクローラー・ボットアクセス集計（総リクエスト数とセッション数の両方を正確に集計）
            db.prepare(`
                SELECT bot_type, bot_name,
                       COUNT(*) as total_requests,
                       COUNT(DISTINCT session_id) as visits,
                       COUNT(DISTINCT json_extract(event_data, '$.page_url')) as pages_crawled,
                       MIN(created_at) as first_seen,
                       MAX(created_at) as last_seen
                FROM analytics_events
                WHERE bot_type IS NOT NULL AND created_at >= ?
                GROUP BY bot_type, bot_name ORDER BY total_requests DESC
            `).bind(fromDate).all(),

            // AI経由の人間ユーザー流入
            db.prepare(`
                SELECT json_extract(event_data, '$.event_params.ai_source') as ai_source,
                       json_extract(event_data, '$.event_params.landing_page') as landing_page,
                       COUNT(DISTINCT session_id) as sessions
                FROM analytics_events
                WHERE event_name = 'ai_referral' AND created_at >= ?
                GROUP BY ai_source ORDER BY sessions DESC
            `).bind(fromDate).all(),

            // 検索エンジン分類（リファラーベース）
            db.prepare(`
                SELECT 
                  CASE
                    WHEN COALESCE(json_extract(event_data, '$.referrer'), '') LIKE '%google.%' THEN 'Google'
                    WHEN COALESCE(json_extract(event_data, '$.referrer'), '') LIKE '%bing.%' THEN 'Bing'
                    WHEN COALESCE(json_extract(event_data, '$.referrer'), '') LIKE '%yahoo.%' THEN 'Yahoo'
                    WHEN COALESCE(json_extract(event_data, '$.referrer'), '') LIKE '%duckduckgo.%' THEN 'DuckDuckGo'
                    WHEN COALESCE(json_extract(event_data, '$.referrer'), '') LIKE '%baidu.%' THEN 'Baidu'
                    ELSE NULL
                  END as search_engine,
                  COUNT(DISTINCT session_id) as sessions,
                  COUNT(*) as page_views
                FROM analytics_events
                WHERE event_name = 'page_view' AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                  AND COALESCE(json_extract(event_data, '$.referrer'), '') != ''
                GROUP BY search_engine
                HAVING search_engine IS NOT NULL
                ORDER BY sessions DESC
            `).bind(fromDate).all(),

            // エンゲージメントスコア・読了率 集計
            db.prepare(`
                SELECT json_extract(event_data, '$.page_url') as page_url,
                       AVG(CAST(json_extract(event_data, '$.event_params.engagement_score') AS REAL)) as avg_score,
                       AVG(CAST(json_extract(event_data, '$.event_params.read_ratio') AS REAL)) as avg_read_ratio,
                       COUNT(*) as samples
                FROM analytics_events
                WHERE event_name = 'page_close' AND created_at >= ?
                  AND json_extract(event_data, '$.event_params.engagement_score') IS NOT NULL
                  AND (bot_type IS NULL OR bot_type = '')
                GROUP BY page_url ORDER BY avg_score DESC LIMIT 20
            `).bind(fromDate).all(),

            // コピーテキスト分析
            db.prepare(`
                SELECT json_extract(event_data, '$.event_params.text_preview') as text_preview,
                       json_extract(event_data, '$.page_url') as page_url,
                       COUNT(*) as copy_count
                FROM analytics_events
                WHERE event_name = 'copy_text' AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
                GROUP BY text_preview ORDER BY copy_count DESC LIMIT 15
            `).bind(fromDate).all(),

            // Deep Navigation
            db.prepare(`
                SELECT COUNT(*) as deep_nav_count
                FROM analytics_events
                WHERE event_name = 'deep_navigation' AND created_at >= ?
                  AND (bot_type IS NULL OR bot_type = '')
            `).bind(fromDate).first(),

            // AIクローラーがアクセスしたURL・コンテンツ詳細ランキング
            db.prepare(`
                SELECT bot_name,
                       COALESCE(json_extract(event_data, '$.page_url'), '不明') as page_url,
                       COUNT(*) as hits,
                       MAX(created_at) as last_crawled
                FROM analytics_events
                WHERE bot_type = 'ai' AND created_at >= ?
                GROUP BY bot_name, page_url
                ORDER BY hits DESC
                LIMIT 50
            `).bind(fromDate).all(),

            // 直近のリアルタイムAIアクセスログ
            db.prepare(`
                SELECT id,
                       bot_name,
                       COALESCE(json_extract(event_data, '$.page_url'), '/') as page_url,
                       created_at
                FROM analytics_events
                WHERE bot_type = 'ai' AND created_at >= ?
                ORDER BY created_at DESC
                LIMIT 20
            `).bind(fromDate).all(),

            // AIクローラー日別推移トレンド（JST集計）
            db.prepare(`
                SELECT DATE(created_at, '+9 hours') as date,
                       bot_name,
                       COUNT(*) as hits
                FROM analytics_events
                WHERE bot_type = 'ai' AND created_at >= ?
                GROUP BY date, bot_name
                ORDER BY date, hits DESC
            `).bind(fromDate).all(),
        ]);

        // AI/ボット集計
        const ai_crawlers = [];
        const search_crawlers = [];
        const social_crawlers = [];
        let totalBotVisits = 0;
        let totalAiRequests = 0;

        (botRows.results || []).forEach(r => {
            const item = {
                name: r.bot_name || 'Unknown',
                type: r.bot_type,
                requests: r.total_requests || r.visits,
                visits: r.visits,
                pages_crawled: r.pages_crawled,
                first_seen: r.first_seen,
                last_seen: r.last_seen,
            };
            totalBotVisits += (r.total_requests || r.visits);
            if (r.bot_type === 'ai') {
                ai_crawlers.push(item);
                totalAiRequests += (r.total_requests || r.visits);
            }
            else if (r.bot_type === 'search') search_crawlers.push(item);
            else if (r.bot_type === 'social') social_crawlers.push(item);
        });

        // AIアクセス先コンテンツ一覧
        const ai_crawled_pages = (aiPageRows?.results || []).map(r => ({
            bot_name: r.bot_name,
            page_url: r.page_url,
            hits: r.hits,
            last_crawled: r.last_crawled
        }));

        // AIリアルタイムアクセスログ
        const ai_recent_logs = (aiRecentRows?.results || []).map(r => ({
            id: r.id,
            bot_name: r.bot_name,
            page_url: r.page_url,
            created_at: r.created_at
        }));

        // AI日別トレンド
        const ai_daily_trends = (aiDailyRows?.results || []).map(r => ({
            date: r.date,
            bot_name: r.bot_name,
            hits: r.hits
        }));

        // AI流入
        const ai_referrals = (aiReferralRows.results || []).map(r => ({
            source: r.ai_source, sessions: r.sessions, landing_page: r.landing_page
        }));

        // 検索エンジン分類
        const search_engines = (searchEngineRows.results || []).map(r => ({
            engine: r.search_engine, sessions: r.sessions, page_views: r.page_views
        }));
        const totalSearchSessions = search_engines.reduce((s, e) => s + e.sessions, 0);
        const organicRatio = totalSessions > 0 ? +(totalSearchSessions / totalSessions).toFixed(3) : 0;

        // エンゲージメントスコア
        const engagement_scores = (engagementRows.results || []).map(r => {
            let path = '/';
            try { path = new URL(r.page_url || '/').pathname; } catch (_) { path = r.page_url || '/'; }
            return {
                path,
                avg_score: Math.round(r.avg_score || 0),
                avg_read_ratio: +(r.avg_read_ratio || 0).toFixed(2),
                samples: r.samples
            };
        });

        // コピーテキスト
        const copied_content = (copyRows.results || []).map(r => {
            let path = '/';
            try { path = new URL(r.page_url || '/').pathname; } catch (_) { path = r.page_url || '/'; }
            return { text: (r.text_preview || '').slice(0, 100), path, count: r.copy_count };
        });

        // Deep Navigation
        const deepNavCount = deepNavRows?.deep_nav_count || 0;
        const deepNavRate = totalSessions > 0 ? +(deepNavCount / totalSessions).toFixed(3) : 0;

        // 全体平均エンゲージメントスコア
        const avgEngagementScore = engagement_scores.length > 0
            ? Math.round(engagement_scores.reduce((s, e) => s + e.avg_score * e.samples, 0) / engagement_scores.reduce((s, e) => s + e.samples, 0))
            : 0;

        // === レスポンス ===
        return jsonResponse({
            period: {
                from: toJstDate(fromDateRaw),
                to: toJstDate(new Date()),
                days: days || 0,
                hours: hours ? parseInt(hours) : 0,
            },
            overview: {
                total_sessions: totalSessions,
                unique_visitors: uniqueVisitors,
                page_views: pageViews,
                pv_per_session: +pvPerSession,
                avg_engaged_ms: avgEngagedMs,
                avg_scroll_depth: avgScrollDepth,
                pdf_generated: pdfCount,
                lang_switches: langSwitchCount,
                avg_engagement_score: avgEngagementScore,
                deep_nav_rate: deepNavRate,
                // ボット・AIクローラーのサマリー情報（分離管理用）
                bot_page_views: botSummary?.bot_page_views || 0,
                bot_total_requests: botSummary?.bot_total_requests || 0,
                distinct_bots: botSummary?.distinct_bots || 0,
            },
            pages,
            hourly,
            daily,
            devices,
            referrers: referrers.slice(0, 10),
            utm_campaigns,
            geo_regions,
            scroll_depth,
            rage_clicks,
            field_hesitations,
            web_vitals,
            performance_avg,
            js_errors,
            error_details,
            content_events,
            language_stats,
            search_analysis,
            // === 新規: AI可視性 ===
            ai_visibility: {
                total_bot_visits: totalBotVisits,
                total_ai_requests: totalAiRequests,
                ai_crawlers,
                ai_crawled_pages,
                ai_recent_logs,
                ai_daily_trends,
                search_crawlers,
                social_crawlers,
                ai_referrals,
            },
            // === 新規: 検索品質 ===
            search_quality: {
                search_engines,
                organic_ratio: organicRatio,
                total_search_sessions: totalSearchSessions,
            },
            // === 新規: コンテンツ品質 ===
            content_quality: {
                avg_engagement_score: avgEngagementScore,
                engagement_scores,
                copied_content,
                deep_nav_rate: deepNavRate,
                deep_nav_count: deepNavCount,
            },
        });
    } catch (err) {
        console.error('Analytics summary error:', err);
        return jsonResponse({ error: 'Failed to load analytics', details: err?.message }, 500);
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}
