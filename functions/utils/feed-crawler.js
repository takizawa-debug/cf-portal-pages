/**
 * feed-crawler.js — 外部情報監視クローラー
 * 長野県公的サイト、飯綱町公式サイト/RSS、Webお知らせ、Instagram公開アカウントのパーサー群
 */

// SHA-256ハッシュ生成 (Web Crypto API)
export async function generateContentHash(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// HTMLエンティティデコード
export function decodeEntities(encodedString) {
    if (!encodedString) return '';
    return encodedString
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

// HTMLタグ除去
export function stripTags(html) {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * 1. 長野県農業試験場 病害虫防除部 (/bojo/) パーサー
 */
export async function parseNaganoBojo(feed) {
    const url = feed.source_target;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Appletown-Crawler/1.0)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    const html = await res.text();

    const items = [];
    const baseUrl = 'https://www.pref.nagano.lg.jp';

    // 「お知らせ」セクション以降を抽出
    const newsSectionMatch = html.match(/お知らせ<\/h2>([\s\S]*?)<\/div>\s*<\/div>/i) || html.match(/お知らせ[\s\S]*?(?=<\/body>)/i);
    const content = newsSectionMatch ? newsSectionMatch[0] : html;

    // パラグラフまたはブロック単位で抽出
    const blocks = content.split(/<h3>|<p class="title">|<div class="news_item">/i);
    for (const block of blocks) {
        // PDFリンクを探す
        const pdfMatch = block.match(/href=["'](\/bojo\/documents\/[^"']+\.pdf)["'][^>]*>(.*?)<\/a>/i);
        // タイトルやテキストを探す
        const titleMatch = block.match(/<a[^>]*>(.*?)<\/a>/i) || block.match(/<b>(.*?)<\/b>/i);

        let title = '';
        let pdfUrl = null;

        if (pdfMatch) {
            pdfUrl = baseUrl + pdfMatch[1];
            title = stripTags(pdfMatch[2]) || stripTags(titleMatch ? titleMatch[1] : '');
        } else if (titleMatch) {
            title = stripTags(titleMatch[1]);
        }

        const rawText = stripTags(block);
        if (title.length > 5 && (title.includes('報') || title.includes('注意') || title.includes('研修') || title.includes('発生') || rawText.includes('被害') || rawText.includes('防除'))) {
            // 日付を抽出 (例: 令和8年8月13日, 7月下旬 など)
            const dateMatch = rawText.match(/令和\s*\d+\s*年\s*\d+\s*月\s*\d+\s*日|\d+\s*月\s*\d+\s*日/);
            const detectedDate = dateMatch ? dateMatch[0].replace(/\s+/g, '') : new Date().toISOString().slice(0, 10);

            const hash = await generateContentHash(title + (pdfUrl || '') + detectedDate);
            items.push({
                feed_id: feed.id,
                title: title,
                source_url: url,
                pdf_url: pdfUrl,
                media_url: null,
                detected_date: detectedDate,
                content_hash: hash,
                raw_text: rawText.slice(0, 1200)
            });
        }
    }

    return items;
}

/**
 * 2. 長野県果樹試験場（須坂） (/kajushiken/) パーサー
 */
export async function parseNaganoKajushiken(feed) {
    const url = feed.source_target;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Appletown-Crawler/1.0)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    const html = await res.text();

    const items = [];
    const baseUrl = 'https://www.pref.nagano.lg.jp';

    // 「更新情報」セクションの「◆令和X年X月X日 ...」を抽出 (全角・半角対応)
    const regex = /◆\s*(令和\s*[0-9０-９]+\s*年\s*[0-9０-９]+\s*月\s*[0-9０-９]+\s*日)\s*([\s\S]*?)(?=◆|<\/div>|<\/ul>|$)/gi;
    let match;

    while ((match = regex.exec(html)) !== null) {
        const dateStr = match[1].replace(/\s+/g, '');
        const blockHtml = match[2];
        const linkMatch = blockHtml.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/i);

        const titleText = stripTags(blockHtml);
        const linkHref = linkMatch ? (linkMatch[1].startsWith('http') ? linkMatch[1] : baseUrl + linkMatch[1]) : url;
        const isPdf = linkHref.toLowerCase().endsWith('.pdf');

        if (titleText.length > 3) {
            const hash = await generateContentHash(dateStr + titleText + linkHref);
            items.push({
                feed_id: feed.id,
                title: `【果樹試験場】${titleText}`,
                source_url: isPdf ? url : linkHref,
                pdf_url: isPdf ? linkHref : null,
                media_url: null,
                detected_date: dateStr,
                content_hash: hash,
                raw_text: `長野県果樹試験場 更新情報 (${dateStr}): ${titleText}\n詳細URL: ${linkHref}`
            });
        }
    }

    return items;
}

/**
 * 3. 長野農業農村支援センター 技術経営普及課 (/nagachi/nosei-aec/) パーサー
 * セクション単位で差分を検知
 */
export async function parseNaganoNosei(feed) {
    const url = feed.source_target;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Appletown-Crawler/1.0)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    const html = await res.text();

    const items = [];
    const baseUrl = 'https://www.pref.nagano.lg.jp';

    // 見出し（h2, h3, b）でセクションに分割
    const sections = html.split(/<h[23][^>]*>|<p[^>]*class=["'][^"']*title[^"']*["'][^>]*>/i);

    for (const sec of sections) {
        const secText = stripTags(sec);
        if (secText.length < 20) continue;

        // りんご・果樹・防除・支援に関連するキーワードが含まれているかチェック
        const isRelevant = /りんご|リンゴ|黒星病|腐らん病|凍霜害|熟度|肥大|剪定|せん定|害虫|防除|daywork|飯綱|果樹/i.test(secText);
        if (!isRelevant) continue;

        // セクション内のタイトルを抽出
        const firstLine = secText.split(/[。\n]/)[0].trim().slice(0, 60);
        // PDFリンクを探す
        const pdfMatch = sec.match(/href=["'](\/nagachi\/nosei-aec\/documents\/[^"']+\.pdf)["'][^>]*>(.*?)<\/a>/i);
        const pdfUrl = pdfMatch ? baseUrl + pdfMatch[1] : null;

        // YouTubeリンクを探す
        const ytMatch = sec.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]+/i);
        const mediaUrl = ytMatch ? ytMatch[0] : null;

        // 日付を探す
        const dateMatch = secText.match(/令和\s*\d+\s*年\s*\d+\s*月\s*\d+\s*日|\d{4}年\d{1,2}月\d{1,2}日/);
        const detectedDate = dateMatch ? dateMatch[0].replace(/\s+/g, '') : new Date().toISOString().slice(0, 10);

        const hash = await generateContentHash(firstLine + (pdfUrl || '') + (mediaUrl || '') + secText.slice(0, 100));

        items.push({
            feed_id: feed.id,
            title: `【農業農村支援センター】${firstLine}`,
            source_url: url,
            pdf_url: pdfUrl,
            media_url: mediaUrl,
            detected_date: detectedDate,
            content_hash: hash,
            raw_text: secText.slice(0, 1200)
        });
    }

    return items;
}

/**
 * 4. 汎用 RSS 2.0 / Atom パーサー (飯綱町役場プレスリリース等)
 */
export async function parseStandardRss(feed) {
    const url = feed.source_target;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Appletown-Crawler/1.0)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    const xml = await res.text();

    const items = [];
    const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];

    for (const itemXml of itemMatches) {
        const titleMatch = itemXml.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
        const linkMatch = itemXml.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) || itemXml.match(/<link\s+[^>]*href=["']([^"']+)["']/i);
        const dateMatch = itemXml.match(/<(?:pubDate|dc:date|updated|published)>([\s\S]*?)<\//i);
        const descMatch = itemXml.match(/<(?:description|content:encoded|summary)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\//i);

        const title = decodeEntities(stripTags(titleMatch ? titleMatch[1] : ''));
        const link = linkMatch ? linkMatch[1].trim() : url;
        let dateStr = new Date().toISOString().slice(0, 10);
        if (dateMatch) {
            try {
                const d = new Date(dateMatch[1].trim());
                if (!isNaN(d.getTime())) dateStr = d.toISOString().slice(0, 10);
            } catch (e) {}
        }
        const desc = decodeEntities(stripTags(descMatch ? descMatch[1] : ''));

        if (title) {
            const hash = await generateContentHash(title + link);
            items.push({
                feed_id: feed.id,
                title: title,
                source_url: link,
                pdf_url: null,
                media_url: null,
                detected_date: dateStr,
                content_hash: hash,
                raw_text: `${title}\n${desc}`.slice(0, 1200)
            });
        }
    }

    return items;
}

/**
 * 5. 汎用 Webお知らせ HTML一覧パーサー (りんご学校、移住ポータル、いいづなマガジン等)
 */
export async function parseGenericWebNews(feed) {
    const url = feed.source_target;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' } });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    const html = await res.text();

    const items = [];
    const urlObj = new URL(url);
    const origin = urlObj.origin;

    // aタグとそのテキストを正規表現で抽出
    const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1].trim();
        const inner = match[2];
        const text = stripTags(inner);

        // 記事リンクらしいパターン（docs, news, info, 記事ID等）
        const isArticleLink = (
            href.includes('/news/') ||
            href.includes('/info/') ||
            href.includes('/docs/') ||
            href.includes('/article/') ||
            /\/\d+\.html/.test(href)
        ) && !href.endsWith('/news/') && !href.endsWith('/info/');

        if (isArticleLink && text.length > 10) {
            const fullUrl = href.startsWith('http') ? href : origin + (href.startsWith('/') ? href : '/' + href);
            
            // 日付を探す
            const dateMatch = text.match(/\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2}|\d{1,2}月\d{1,2}日/);
            const detectedDate = dateMatch ? dateMatch[0] : new Date().toISOString().slice(0, 10);

            const hash = await generateContentHash(text + fullUrl);
            items.push({
                feed_id: feed.id,
                title: text.slice(0, 80),
                source_url: fullUrl,
                pdf_url: null,
                media_url: null,
                detected_date: detectedDate,
                content_hash: hash,
                raw_text: text.slice(0, 800)
            });
        }
    }

    return items;
}

/**
 * 6. Instagram 公開アカウント パーサー
 * RapidAPI Instagram Scraper Stable API 経由で最新投稿を取得
 */
export async function parseInstagramPublic(feed, env = {}) {
    const username = feed.source_target.replace(/^@/, '').replace(/https?:\/\/(?:www\.)?instagram\.com\//, '').replace(/\/.*$/, '').trim();
    const apiKey = env?.RAPIDAPI_KEY || 'a7b880469dmsh04098e91fad0728p1c7836jsnf3807a166598';
    const host = 'instagram-scraper-stable-api.p.rapidapi.com';
    const items = [];

    if (!apiKey) {
        console.warn(`[Instagram] No RAPIDAPI_KEY available for @${username}`);
        return items;
    }

    try {
        const url = `https://${host}/get_ig_user_posts.php`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': host,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({ username_or_url: username, amount: '6' })
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error(`[Instagram] RapidAPI returned status ${res.status} for @${username}:`, errText);
            return items;
        }

        const data = await res.json();
        const posts = data.posts || [];

        for (const p of posts) {
            const node = p.node || p;
            const captionText = node.caption?.text || '';
            const shortcode = node.code || node.shortcode || '';
            const postUrl = shortcode ? `https://www.instagram.com/p/${shortcode}/` : `https://www.instagram.com/${username}/`;
            const imageUrl = node.image_versions2?.candidates?.[0]?.url || node.display_url || null;
            
            let dateStr = new Date().toISOString().slice(0, 10);
            if (node.caption?.created_at) {
                try {
                    dateStr = new Date(node.caption.created_at * 1000).toISOString().slice(0, 10);
                } catch (e) {}
            }

            const cleanCaption = stripTags(captionText).trim();
            if (cleanCaption || imageUrl) {
                const titleSnippet = cleanCaption ? cleanCaption.split('\n')[0].slice(0, 60) : `Instagram投稿 (${dateStr})`;
                const hash = await generateContentHash(`ig-${username}-${shortcode || cleanCaption.slice(0, 50)}`);

                items.push({
                    feed_id: feed.id,
                    title: `【Instagram @${username}】${titleSnippet}`,
                    source_url: postUrl,
                    pdf_url: null,
                    media_url: imageUrl,
                    detected_date: dateStr,
                    content_hash: hash,
                    raw_text: `【Instagram @${username} 投稿 (${dateStr})】\n${cleanCaption}\n\n■ 投稿URL: ${postUrl}`
                });
            }
        }

    } catch (e) {
        console.error(`[Instagram] RapidAPI error for @${username}:`, e);
    }

    return items;
}

/**
 * 7. 長野経済研究所 (NERI) 飯綱町受託事業・りんごイベント パーサー
 * 委託事業親ページや受託実績、イベント相互リンクを自動探索し、「飯綱町」「りんご」「スイーツコンクール」「フェア」等の個別記事を自動検知
 */
export async function parseNeriIizuna(feed) {
    const items = [];
    const visitedUrls = new Set();
    const queue = [
        feed.source_target || 'https://www.neri.or.jp/060/solutions/achievements/about/2026/070/1747190816419.html',
        'https://www.neri.or.jp/060/solutions/achievements/about/2025/070/1747190816419.html',
        'https://www.neri.or.jp/060/solutions/achievements/about/2024/070/1747190816419.html',
        'https://www.neri.or.jp/060/solutions/achievements/event/20260513114943.html',
        'https://www.neri.or.jp/060/solutions/achievements/event/1756080392973.html',
        'https://www.neri.or.jp/li/solutions/achievements/index.html',
        'https://www.neri.or.jp/news.html'
    ];

    while (queue.length > 0 && visitedUrls.size < 12) {
        const currUrl = queue.shift();
        if (visitedUrls.has(currUrl)) continue;
        visitedUrls.add(currUrl);

        try {
            const res = await fetch(currUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
                signal: AbortSignal.timeout(5000)
            });
            if (!res.ok) continue;
            const html = await res.text();

            // このページ自体がイベント記事かチェック
            const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
            const pageTitle = h1Match ? stripTags(h1Match[1]).replace(/\s*\|\s*.*$/, '').trim() : '';

            const isEventArticle = (
                (currUrl.includes('/event/') || currUrl.includes('/contents/')) &&
                (/飯綱|いいづな|りんご|スイーツコンクール|英国りんご|マルシェ|ブラムリー/i.test(pageTitle) || /飯綱|いいづな|りんご|スイーツコンクール|英国りんご|マルシェ|ブラムリー/i.test(currUrl))
            );

            if (isEventArticle && pageTitle) {
                // 日付抽出
                const dateMatch = html.match(/(?:最終更新日|公開日|発表日|日付)[：:\s]*([0-9０-９年\/\.-]+(?:月[0-9０-９]+日)?)/i) 
                               || html.match(/([0-9]{4}[\/\.-][0-9]{1,2}[\/\.-][0-9]{1,2})/);
                const detectedDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString().slice(0, 10);

                // PDFリンク
                const pdfMatch = html.match(/href=["']([^"']+\.pdf)["']/i);
                let pdfUrl = null;
                if (pdfMatch) {
                    try { pdfUrl = new URL(pdfMatch[1], currUrl).href; } catch(e) {}
                }

                // OG画像
                const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content=["']([^"']+)["']/i);
                const mediaUrl = ogImageMatch ? ogImageMatch[1] : null;

                // 本文
                const cleanHtml = html
                    .replace(/<script[\s\S]*?<\/script>/gi, '')
                    .replace(/<style[\s\S]*?<\/style>/gi, '')
                    .replace(/<header[\s\S]*?<\/header>/gi, '')
                    .replace(/<footer[\s\S]*?<\/footer>/gi, '');
                const rawText = stripTags(cleanHtml).replace(/\s+/g, ' ').trim().slice(0, 2000);

                const hash = await generateContentHash(`neri-${pageTitle}-${currUrl}`);

                if (!items.some(it => it.content_hash === hash)) {
                    items.push({
                        feed_id: feed.id,
                        title: pageTitle,
                        source_url: currUrl,
                        pdf_url: pdfUrl,
                        media_url: mediaUrl,
                        detected_date: detectedDate,
                        content_hash: hash,
                        raw_text: rawText
                    });
                }
            }

            // 内部リンクを探索キューに追加
            const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
            let match;
            while ((match = linkRegex.exec(html)) !== null) {
                const href = match[1].trim();
                const linkText = stripTags(match[2]);

                if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) continue;

                let fullUrl;
                try {
                    fullUrl = new URL(href, currUrl).href;
                } catch {
                    continue;
                }

                if (fullUrl.includes('neri.or.jp') && !visitedUrls.has(fullUrl) && !fullUrl.endsWith('.pdf') && !fullUrl.includes('.pdf?')) {
                    if (
                        (fullUrl.includes('/event/') || fullUrl.includes('/contents/') || fullUrl.includes('/about/')) &&
                        (/飯綱|いいづな|りんご|スイーツコンクール|英国りんご|マルシェ|ブラムリー/i.test(linkText) || /飯綱|いいづな|りんご|スイーツコンクール|英国りんご|マルシェ|ブラムリー/i.test(fullUrl))
                    ) {
                        queue.push(fullUrl);
                    }
                }
            }

        } catch (e) {
            console.warn(`[NERI] Failed to crawl: ${currUrl}`, e);
        }
    }

    return items;
}

/**
 * 統合ディスパッチャー: feed オブジェクトに応じて適切なパーサーを実行
 */
export async function crawlFeed(feed, env = {}) {
    switch (feed.source_type) {
        case 'nagano_bojo':
            return await parseNaganoBojo(feed);
        case 'nagano_kajushiken':
            return await parseNaganoKajushiken(feed);
        case 'nagano_nosei':
            return await parseNaganoNosei(feed);
        case 'rss':
            return await parseStandardRss(feed);
        case 'web_news':
            return await parseGenericWebNews(feed);
        case 'instagram':
            return await parseInstagramPublic(feed, env);
        case 'neri':
            return await parseNeriIizuna(feed);
        default:
            throw new Error(`Unknown source_type: ${feed.source_type}`);
    }
}
