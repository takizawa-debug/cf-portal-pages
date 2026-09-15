/**
 * _middleware.js — Cloudflare Pages エッジSEOミドルウェア
 *
 * 役割:
 *   1. 旧URL (?id=xxx) → クリーンURL (/article/xxx) への301リダイレクト
 *   2. /article/[id] の内部リライトとSSRメタタグ注入
 *   3. 全HTMLページへの lang属性 / canonical / hreflang / JSON-LD / Twitter Card の注入
 *
 * 設計方針:
 *   - SEOタグは全てサーバーサイドで注入し、クライアントJS依存をゼロにする
 *   - 定数は冒頭で一元管理し、散在を防ぐ
 */

// ============================================================
// 定数定義（サイト全体で共通。ここだけ変更すれば全箇所に反映される）
// ============================================================
const BASE_URL = 'https://appletown-iizuna.com';
const ORG_NAME_JA = 'りんごのまちいいづな';
const ORG_NAME_EN = 'Appletown Iizuna';
const LOGO_URL = 'https://appletown-iizuna.com/img/apple-logo-red.png';
const DEFAULT_OG_IMAGE = 'https://appletown-iizuna.com/img/hero/ogp-thumbnail.jpg';
const LANGS = ['ja', 'en', 'zh'];

/** カテゴリスラッグ → 表示名のマッピング */
const CATEGORY_MAP = {
    'discover':   { ja: '知る',     en: 'Discover',   zh: '了解' },
    'savor':      { ja: '味わう',   en: 'Savor',      zh: '品嚐' },
    'experience': { ja: '体験する', en: 'Experience',  zh: '體驗' },
    'lifestyle':  { ja: '暮らす',   en: 'Living',      zh: '生活' },
    'business':   { ja: '営む',     en: 'Business',    zh: '營商' },
};

/** lang パラメータ → BCP47 言語タグへの変換 */
function toBCP47(lang) {
    if (lang === 'en') return 'en';
    if (lang === 'zh') return 'zh-Hant';
    return 'ja';
}

/** カテゴリ名を言語別に取得 */
function getCategoryName(slug, lang) {
    const cat = CATEGORY_MAP[slug];
    if (!cat) return slug;
    return cat[lang] || cat.ja;
}

/** 日本語カテゴリ名 → スラッグへの逆引き（DB の l1 カラムは日本語名で格納されているため） */
function categoryNameToSlug(jaName) {
    for (const [slug, names] of Object.entries(CATEGORY_MAP)) {
        if (names.ja === jaName) return slug;
    }
    return 'discover'; // フォールバック
}

// ============================================================
// HTMLRewriter ハンドラ群
// ============================================================

/**
 * <html> の lang 属性を動的に書き換える
 */
class HtmlLangHandler {
    constructor(lang) {
        this.bcp47 = toBCP47(lang);
    }
    element(element) {
        element.setAttribute('lang', this.bcp47);
    }
}

/**
 * <head> の末尾に canonical / hreflang / JSON-LD / Twitter Card / OGP拡張 / ファビコン を注入する
 */
class HeadInjector {
    /**
     * @param {Object} opts
     * @param {URL}    opts.url       - リクエストURL
     * @param {string} opts.lang      - 現在の言語 ('ja','en','zh')
     * @param {Array}  opts.jsonLd    - JSON-LDスキーマの配列
     * @param {Object} opts.seoData   - {title, description, og_image_url} (Twitter Card用)
     * @param {string} opts.ogType    - 'website' | 'article'
     */
    constructor(opts) {
        this.url = opts.url;
        this.lang = opts.lang;
        this.jsonLd = opts.jsonLd || [];
        this.seoData = opts.seoData || {};
        this.ogType = opts.ogType || 'website';
    }

    element(element) {
        const path = this.url.pathname;
        const canonicalUrl = `${BASE_URL}${path}`;
        const siteName = this.lang === 'ja' ? ORG_NAME_JA : ORG_NAME_EN;
        const ogLocale = this.lang === 'en' ? 'en_US' : (this.lang === 'zh' ? 'zh_TW' : 'ja_JP');

        // === ファビコン (Favicon & Apple Touch Icon) ===
        element.append(`<link rel="icon" href="/favicon.ico" sizes="any">`, { html: true });
        element.append(`<link rel="icon" type="image/png" href="/favicon.png">`, { html: true });
        element.append(`<link rel="apple-touch-icon" href="/img/apple-logo-red.png">`, { html: true });

        // === Canonical（パラメータなしの正規URL）===
        element.append(`<link rel="canonical" href="${canonicalUrl}">`, { html: true });

        // === Hreflang（多言語 alternate）===
        for (const l of LANGS) {
            element.append(`<link rel="alternate" hreflang="${l}" href="${BASE_URL}${path}?lang=${l}">`, { html: true });
        }
        element.append(`<link rel="alternate" hreflang="x-default" href="${BASE_URL}${path}?lang=ja">`, { html: true });

        // === OGP メタタグ拡張 ===
        element.append(`<meta property="og:url" content="${canonicalUrl}">`, { html: true });
        element.append(`<meta property="og:type" content="${this.ogType}">`, { html: true });
        element.append(`<meta property="og:site_name" content="${escapeAttr(siteName)}">`, { html: true });
        element.append(`<meta property="og:locale" content="${ogLocale}">`, { html: true });

        const image = this.seoData.og_image_url || DEFAULT_OG_IMAGE;
        if (image === DEFAULT_OG_IMAGE) {
            element.append(`<meta property="og:image:width" content="1200">`, { html: true });
            element.append(`<meta property="og:image:height" content="630">`, { html: true });
        }

        // === Twitter Card ===
        const title = this.seoData.title || '';
        const desc = this.seoData.description || '';
        element.append(`<meta name="twitter:card" content="summary_large_image">`, { html: true });
        if (title) element.append(`<meta name="twitter:title" content="${escapeAttr(title)}">`, { html: true });
        if (desc) element.append(`<meta name="twitter:description" content="${escapeAttr(desc)}">`, { html: true });
        if (image) element.append(`<meta name="twitter:image" content="${escapeAttr(image)}">`, { html: true });

        // === JSON-LD 構造化データ ===
        for (const schema of this.jsonLd) {
            element.append(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`, { html: true });
        }
    }
}

/**
 * title / meta[name=description] / og:* / twitter:* を書き換える
 * HTMLに既存のタグをSSRで確実に上書きするためのハンドラ
 */
class MetaRewriter {
    /**
     * @param {Object} seoData - {title, description, og_image_url, og_url, og_type, favicon_url}
     */
    constructor(seoData) {
        this.seoData = seoData;
    }

    element(element) {
        if (element.tagName === 'title' && this.seoData.title) {
            element.setInnerContent(this.seoData.title);
        } else if (element.tagName === 'meta') {
            const name = element.getAttribute('name');
            const property = element.getAttribute('property');

            // --- meta[name=...] 系 ---
            if (name === 'description' && this.seoData.description) {
                element.setAttribute('content', this.seoData.description);
            } else if (name === 'twitter:title' && this.seoData.title) {
                element.setAttribute('content', this.seoData.title);
            } else if (name === 'twitter:description' && this.seoData.description) {
                element.setAttribute('content', this.seoData.description);
            } else if (name === 'twitter:image' && this.seoData.og_image_url) {
                element.setAttribute('content', toAbsoluteUrl(this.seoData.og_image_url));
            }

            // --- meta[property=...] 系 (OGP) ---
            if (property === 'og:title' && this.seoData.title) {
                element.setAttribute('content', this.seoData.title);
            } else if (property === 'og:description' && this.seoData.description) {
                element.setAttribute('content', this.seoData.description);
            } else if (property === 'og:image' && this.seoData.og_image_url) {
                element.setAttribute('content', toAbsoluteUrl(this.seoData.og_image_url));
            } else if (property === 'og:url' && this.seoData.og_url) {
                element.setAttribute('content', this.seoData.og_url);
            } else if (property === 'og:type' && this.seoData.og_type) {
                element.setAttribute('content', this.seoData.og_type);
            }
        } else if (element.tagName === 'link') {
            const rel = element.getAttribute('rel');
            if ((rel === 'icon' || rel === 'shortcut icon' || rel === 'apple-touch-icon') && this.seoData.favicon_url) {
                element.setAttribute('href', this.seoData.favicon_url);
            }
        }
    }
}

// ============================================================
// JSON-LD ビルダー群
// ============================================================

/** Organization スキーマ（全ページ共通） */
function buildOrganization() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": ORG_NAME_JA,
        "alternateName": ORG_NAME_EN,
        "url": BASE_URL,
        "logo": LOGO_URL,
        "description": "長野県飯綱町産りんごの総合ポータルサイト。品種・観光・体験・生産者情報を多言語で発信。",
        "areaServed": {
            "@type": "Place",
            "name": "長野県上水内郡飯綱町",
            "geo": { "@type": "GeoCoordinates", "latitude": 36.7557, "longitude": 138.2135 }
        }
    };
}

/** WebSite スキーマ（トップページ用） */
function buildWebSite() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": ORG_NAME_JA,
        "alternateName": ORG_NAME_EN,
        "url": BASE_URL,
        "inLanguage": ["ja", "en", "zh-Hant"],
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${BASE_URL}/discover?lang=ja&search={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };
}

/**
 * BreadcrumbList スキーマ
 * @param {Array<{name:string, url:string}>} items - パンくずの各段
 */
function buildBreadcrumbList(items) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": item.name,
            "item": item.url
        }))
    };
}

/**
 * Article スキーマ（記事詳細ページ用）
 * Google Rich Results の必須/推奨フィールドを全て網羅
 */
function buildArticle(opts) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": opts.title,
        "description": opts.description,
        "image": opts.imageUrl || DEFAULT_OG_IMAGE,
        "datePublished": opts.createdAt || opts.updatedAt || new Date().toISOString(),
        "dateModified": opts.updatedAt || new Date().toISOString(),
        "author": {
            "@type": "Organization",
            "name": ORG_NAME_JA,
            "url": BASE_URL
        },
        "publisher": {
            "@type": "Organization",
            "name": ORG_NAME_JA,
            "logo": {
                "@type": "ImageObject",
                "url": LOGO_URL
            }
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": opts.pageUrl
        },
        "inLanguage": toBCP47(opts.lang)
    };
}

/** CollectionPage スキーマ（カテゴリページ用） */
function buildCollectionPage(name, url) {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": name,
        "url": url,
        "isPartOf": {
            "@type": "WebSite",
            "name": ORG_NAME_JA,
            "url": BASE_URL
        }
    };
}

/** Event スキーマ（イベント記事用） */
function buildEvent(article, pageUrl) {
    if (!article.start_date) return null;
    return {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": article.title,
        "description": stripAndTruncate(article.lead_text || article.body_text || '', 160),
        "startDate": article.start_date,
        "endDate": article.end_date || article.start_date,
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "eventStatus": "https://schema.org/EventScheduled",
        "location": {
            "@type": "Place",
            "name": article.organizer_name || "飯綱町",
            "address": {
                "@type": "PostalAddress",
                "addressRegion": "長野県",
                "addressLocality": "上水内郡飯綱町",
                "streetAddress": article.address || ""
            }
        },
        "image": [toAbsoluteUrl(extractImageUrl(article.media_assets))],
        "organizer": {
            "@type": "Organization",
            "name": article.organizer_name || ORG_NAME_JA,
            "url": BASE_URL
        },
        "offers": {
            "@type": "Offer",
            "price": article.fee ? article.fee.replace(/[^0-9]/g, '') || "0" : "0",
            "priceCurrency": "JPY",
            "availability": "https://schema.org/InStock",
            "url": pageUrl
        }
    };
}

/** LocalBusiness スキーマ（店舗・直売所・生産者記事用） */
function buildLocalBusiness(article, pageUrl) {
    if (!article.address && !article.contact_phone) return null;
    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": article.title,
        "description": stripAndTruncate(article.lead_text || article.body_text || '', 160),
        "image": toAbsoluteUrl(extractImageUrl(article.media_assets)),
        "url": pageUrl,
        "telephone": article.contact_phone || undefined,
        "address": {
            "@type": "PostalAddress",
            "addressRegion": "長野県",
            "addressLocality": "上水内郡飯綱町",
            "streetAddress": article.address || ""
        },
        "priceRange": "¥"
    };
}

/**
 * 記事詳細ページにSSRセマンティックコンテンツを注入するハンドラ
 * Googlebot / クローラーが初期HTMLからタイトル・見出し・本文・パンくずを即座にインデックスできるようにする
 */
class ArticleContentInjector {
    constructor(article, categoryName, categorySlug) {
        this.article = article;
        this.categoryName = categoryName;
        this.categorySlug = categorySlug;
    }
    element(element) {
        const title = escapeAttr(this.article.title || '');
        const lead = escapeAttr(this.article.lead_text || '');
        const body = (this.article.body_text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
        const ssrHtml = `
            <div id="ssr-article-content" class="visually-hidden" aria-hidden="false">
                <nav aria-label="breadcrumb">
                    <ol>
                        <li><a href="/">ホーム</a></li>
                        <li><a href="/${escapeAttr(this.categorySlug)}">${escapeAttr(this.categoryName)}</a></li>
                        <li aria-current="page">${title}</li>
                    </ol>
                </nav>
                <article>
                    <h1>${title}</h1>
                    ${lead ? `<p class="lead">${lead}</p>` : ''}
                    <div class="body">${body}</div>
                </article>
            </div>
        `;
        element.prepend(ssrHtml, { html: true });
    }
}

/**
 * カテゴリページにSSR記事一覧リストを注入するハンドラ
 * クローラーが初期HTMLから内部リンクと記事要約を即座に発見・巡回できるようにする
 */
class CategoryArticlesInjector {
    constructor(articles, catName, catSlug) {
        this.articles = articles || [];
        this.catName = catName;
        this.catSlug = catSlug;
    }
    element(element) {
        if (!this.articles || this.articles.length === 0) return;
        const itemsHtml = this.articles.map(a => {
            const enc = encodeURIComponent(a.title);
            const lead = a.lead_text ? `<p>${escapeAttr(stripAndTruncate(a.lead_text, 100))}</p>` : '';
            return `<li><a href="/article/${enc}"><h3>${escapeAttr(a.title)}</h3></a>${lead}</li>`;
        }).join('');

        const html = `
            <div id="ssr-category-index" class="visually-hidden" aria-label="${escapeAttr(this.catName)} 記事一覧">
                <h2>${escapeAttr(this.catName)} 関連情報・記事一覧</h2>
                <ul>${itemsHtml}</ul>
            </div>
        `;
        element.append(html, { html: true });
    }
}

// ============================================================
// ユーティリティ
// ============================================================

/** HTML属性値のエスケープ（XSS防止） */
function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** 相対URLを絶対URLに変換（OGP画像等で必須） */
function toAbsoluteUrl(url) {
    if (!url) return DEFAULT_OG_IMAGE;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** HTMLタグを除去してプレーンテキストにし、指定文字数で切り詰める */
function stripAndTruncate(html, maxLen = 160) {
    return (html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, maxLen);
}

/** 記事のメイン画像URLを media_assets JSON から抽出 */
function extractImageUrl(mediaAssetsJson) {
    try {
        const assets = JSON.parse(mediaAssetsJson || '[]');
        if (Array.isArray(assets) && assets.length > 0) return assets[0];
    } catch (_) {}
    return DEFAULT_OG_IMAGE;
}

// ============================================================
// メインリクエストハンドラ
// ============================================================

export async function onRequest({ request, next, env }) {
    // GETリクエストのみ処理
    if (request.method !== 'GET') {
        return next();
    }

    const url = new URL(request.url);
    let path = url.pathname;

    // API エンドポイントはミドルウェアの対象外
    if (path.startsWith('/api/')) {
        return next();
    }

    // ─── /sitemap.xml: ミドルウェア内で直接生成して正しい Content-Type で返す ───
    if (path === '/sitemap.xml') {
        return generateSitemap(env);
    }

    const lang = url.searchParams.get('lang') || 'ja';

    // ─── 1. 旧URL 301リダイレクト (/discover?id=xxx → /article/xxx) ───
    if (!path.startsWith('/api/') && !path.startsWith('/admin') && url.searchParams.has('id')) {
        const idParam = url.searchParams.get('id');
        if (idParam) {
            const newUrl = new URL(request.url);
            newUrl.pathname = `/article/${encodeURIComponent(idParam)}`;
            newUrl.searchParams.delete('id');
            return Response.redirect(newUrl.toString(), 301);
        }
    }

    // ─── 2. /article/[id] の内部リライト & SSR ───
    if (path.startsWith('/article/')) {
        const encodedId = path.split('/')[2];
        if (encodedId) {
            return handleArticlePage(url, encodedId, lang, request, next, env);
        }
    }

    // ─── 3. 通常の静的ページへのSSR注入 ───
    const response = await next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
        return response;
    }

    // 末尾スラッシュの正規化
    if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
    }

    // 管理画面・ログイン画面はSEO注入不要
    if (path.startsWith('/admin') || path === '/login.html' || path === '/register.html' || path === '/setup-password.html') {
        return response;
    }

    return handleStaticPage(url, path, lang, response, env);
}

// ============================================================
// 記事ページ処理
// ============================================================
async function handleArticlePage(url, encodedId, lang, request, next, env) {
    const articleId = decodeURIComponent(encodedId);

    // 内部リライト: /article/xxx → /article（Cloudflare Pagesは.html拡張子で308を返すため拡張子なし）
    const rewriteUrl = new URL(request.url);
    rewriteUrl.pathname = '/article';
    rewriteUrl.search = ''; // クエリパラメータを除去してクリーンなフェッチ
    const rewriteReq = new Request(rewriteUrl.toString(), {
        method: 'GET',
        headers: request.headers,
    });

    let response = await env.ASSETS.fetch(rewriteReq);
    // 308/301リダイレクトの場合はリダイレクト先を追従
    if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (location) {
            response = await env.ASSETS.fetch(new Request(new URL(location, rewriteUrl).toString()));
        }
    }
    if (!response.ok) {
        response = await next();
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
        return response;
    }

    try {
        // DBから記事データを取得（created_at, イベント・店舗情報も取得）
        const stmt = env.DB.prepare(`
            SELECT c.title, c.lead_text, c.body_text, c.media_assets,
                   c.created_at, c.updated_at, c.l1,
                   c.address, c.contact_phone, c.start_date, c.end_date, c.fee, c.organizer_name,
                   t_en.title as title_en, t_en.lead_text as lead_en, t_en.body_text as body_en,
                   t_tw.title as title_tw, t_tw.lead_text as lead_tw, t_tw.body_text as body_tw
            FROM contents c
            LEFT JOIN content_translations t_en ON c.id = t_en.content_id AND t_en.locale = 'en'
            LEFT JOIN content_translations t_tw ON c.id = t_tw.content_id AND t_tw.locale = 'zh-TW'
            WHERE c.title = ? AND c.status = 'published'
        `);
        const article = await stmt.bind(articleId).first();

        if (article) {
            // 言語に応じた表示タイトル・説明文を決定
            let displayTitle = article.title;
            let displayDesc = article.lead_text || article.body_text || '';

            if (lang === 'en' && article.title_en) {
                displayTitle = article.title_en;
                displayDesc = article.lead_en || article.body_en || displayDesc;
            } else if (lang === 'zh' && article.title_tw) {
                displayTitle = article.title_tw;
                displayDesc = article.lead_tw || article.body_tw || displayDesc;
            }

            displayDesc = stripAndTruncate(displayDesc, 160);
            const imageUrl = extractImageUrl(article.media_assets);
            const l1Value = article.l1 || '';
            // DB の l1 はスラッグか日本語名のどちらかが入る可能性があるため両方対応
            const categorySlug = CATEGORY_MAP[l1Value] ? l1Value : categoryNameToSlug(l1Value);
            const categoryName = getCategoryName(categorySlug, lang);
            const pageUrl = `${BASE_URL}${url.pathname}`;
            const absoluteImageUrl = toAbsoluteUrl(imageUrl);

            const siteName = lang === 'ja' ? ORG_NAME_JA : ORG_NAME_EN;
            const seoData = {
                title: `${displayTitle} | ${categoryName} | ${siteName}`,
                description: displayDesc,
                og_image_url: absoluteImageUrl,
                og_url: pageUrl,
                og_type: 'article'
            };

            // JSON-LD: Organization + Article + BreadcrumbList(3段)
            const jsonLd = [
                buildOrganization(),
                buildArticle({
                    title: displayTitle,
                    description: displayDesc,
                    imageUrl: absoluteImageUrl,
                    createdAt: article.created_at,
                    updatedAt: article.updated_at,
                    pageUrl,
                    lang
                }),
                buildBreadcrumbList([
                    { name: lang === 'en' ? 'Home' : (lang === 'zh' ? '首頁' : 'ホーム'), url: `${BASE_URL}/` },
                    { name: categoryName, url: `${BASE_URL}/${categorySlug}` },
                    { name: displayTitle, url: pageUrl }
                ])
            ];

            // イベント記事なら Event スキーマを追加
            const eventSchema = buildEvent(article, pageUrl);
            if (eventSchema) jsonLd.push(eventSchema);

            // 店舗・施設情報があれば LocalBusiness スキーマを追加
            const bizSchema = buildLocalBusiness(article, pageUrl);
            if (bizSchema) jsonLd.push(bizSchema);

            return new HTMLRewriter()
                .on('html', new HtmlLangHandler(lang))
                .on('head', new HeadInjector({ url, lang, jsonLd, seoData, ogType: 'article' }))
                .on('title', new MetaRewriter(seoData))
                .on('meta', new MetaRewriter(seoData))
                .on('body', new ArticleContentInjector(article, categoryName, categorySlug))
                .transform(response);
        }
    } catch (err) {
        console.error('Article SSR Error:', err);
    }

    // 記事が見つからない場合でも、基本的なSSRは適用する
    return new HTMLRewriter()
        .on('html', new HtmlLangHandler(lang))
        .on('head', new HeadInjector({ url, lang, jsonLd: [buildOrganization()], seoData: {}, ogType: 'article' }))
        .transform(response);
}

// ============================================================
// 静的ページ処理
// ============================================================
async function handleStaticPage(url, path, lang, response, env) {
    try {
        // seo_settings テーブルからカスタムSEO設定を取得（テーブルが無くてもエラーにしない）
        let seoData = null;
        try {
            const stmt = env.DB.prepare('SELECT title, description, og_image_url, favicon_url FROM seo_settings WHERE page_path = ?');
            seoData = await stmt.bind(path).first();
        } catch (e) {
            // seo_settings テーブルが存在しない環境（ローカル等）では無視
        }

        // ページ種別に応じた JSON-LD を構築
        const jsonLd = [buildOrganization()];
        const categorySlug = path.substring(1); // '/discover' → 'discover'
        const isCategory = !!CATEGORY_MAP[categorySlug];
        let categoryArticles = [];

        if (path === '/' || path === '') {
            // トップページ: WebSite スキーマ
            jsonLd.push(buildWebSite());
        }

        if (isCategory) {
            // カテゴリページ: CollectionPage + BreadcrumbList(2段)
            const catName = getCategoryName(categorySlug, lang);
            const catUrl = `${BASE_URL}${path}`;
            jsonLd.push(buildCollectionPage(catName, catUrl));
            jsonLd.push(buildBreadcrumbList([
                { name: lang === 'en' ? 'Home' : (lang === 'zh' ? '首頁' : 'ホーム'), url: `${BASE_URL}/` },
                { name: catName, url: catUrl }
            ]));

            // クローラー向けSSRインデックス用にDBからカテゴリ記事一覧を取得（最大20件）
            try {
                const jaName = CATEGORY_MAP[categorySlug]?.ja || '';
                const stmt = env.DB.prepare(`
                    SELECT title, lead_text, l2, updated_at
                    FROM contents
                    WHERE status = 'published' AND (l1 = ? OR l1 = ?)
                    ORDER BY updated_at DESC
                    LIMIT 20
                `);
                const res = await stmt.bind(categorySlug, jaName).all();
                categoryArticles = res.results || [];
            } catch (_) {}
        }

        // SEOデータの構築（seo_settingsがあればそちらを優先）
        const effectiveSeoData = seoData || {};

        let rewriter = new HTMLRewriter()
            .on('html', new HtmlLangHandler(lang))
            .on('head', new HeadInjector({
                url,
                lang,
                jsonLd,
                seoData: effectiveSeoData,
                ogType: 'website'
            }));

        // カテゴリページの場合は初期HTMLに記事一覧を注入
        if (isCategory && categoryArticles.length > 0) {
            const catName = getCategoryName(categorySlug, lang);
            rewriter = rewriter.on('body', new CategoryArticlesInjector(categoryArticles, catName, categorySlug));
        }

        // seo_settings にデータがあればメタタグも書き換え
        if (seoData) {
            rewriter = rewriter
                .on('title', new MetaRewriter(seoData))
                .on('meta', new MetaRewriter(seoData))
                .on('link', new MetaRewriter(seoData));
        }

        return rewriter.transform(response);

    } catch (err) {
        console.error('SEO Middleware Error:', err);
        return response;
    }
}

// ============================================================
// サイトマップ生成（ミドルウェア内で直接レスポンスを構築）
// ============================================================

/** サイトマップ用の静的ページ定義 */
const SITEMAP_STATIC_PAGES = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/discover', priority: '0.9', changefreq: 'weekly' },
    { path: '/savor', priority: '0.9', changefreq: 'weekly' },
    { path: '/experience', priority: '0.9', changefreq: 'weekly' },
    { path: '/lifestyle', priority: '0.8', changefreq: 'weekly' },
    { path: '/business', priority: '0.8', changefreq: 'weekly' },
    { path: '/news', priority: '0.8', changefreq: 'weekly' },
    { path: '/business-guide', priority: '0.6', changefreq: 'monthly' },
    { path: '/contact', priority: '0.5', changefreq: 'monthly' },
    { path: '/site-map', priority: '0.3', changefreq: 'monthly' },
    { path: '/site-policy', priority: '0.2', changefreq: 'yearly' },
    { path: '/privacy-policy', priority: '0.2', changefreq: 'yearly' },
];

function buildSitemapEntry(canonicalPath, lastmod, changefreq, priority) {
    let entry = `  <url>\n`;
    entry += `    <loc>${BASE_URL}${canonicalPath}</loc>\n`;
    entry += `    <lastmod>${lastmod}</lastmod>\n`;
    entry += `    <changefreq>${changefreq}</changefreq>\n`;
    entry += `    <priority>${priority}</priority>\n`;
    for (const lang of LANGS) {
        entry += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${BASE_URL}${canonicalPath}?lang=${lang}"/>\n`;
    }
    entry += `    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${canonicalPath}?lang=ja"/>\n`;
    entry += `  </url>\n`;
    return entry;
}

/**
 * サイトマップXMLを生成して返す
 * ミドルウェア内で直接Responseを構築するため、Content-Type が確実に application/xml になる
 */
async function generateSitemap(env) {
    let contentItems = [];
    try {
        const result = await env.DB.prepare(`
            SELECT c.id, c.title, c.l1, c.updated_at
            FROM contents c
            WHERE c.status = 'published' AND c.l1 != 'business_root'
            ORDER BY c.updated_at DESC
        `).all();
        contentItems = result.results || [];
    } catch (_) {}

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

    for (const page of SITEMAP_STATIC_PAGES) {
        xml += buildSitemapEntry(page.path, today, page.changefreq, page.priority);
    }

    for (const item of contentItems) {
        const encodedTitle = encodeURIComponent(item.title || item.id);
        const lastmod = item.updated_at ? item.updated_at.split('T')[0].split(' ')[0] : today;
        xml += buildSitemapEntry(`/article/${encodedTitle}`, lastmod, 'weekly', '0.7');
    }

    xml += `</urlset>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
