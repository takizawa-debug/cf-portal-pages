class SEOHandler {
    constructor(seoData) {
        this.seoData = seoData;
    }

    element(element) {
        if (element.tagName === 'title' && this.seoData.title) {
            element.setInnerContent(this.seoData.title);
        } else if (element.tagName === 'meta') {
            const name = element.getAttribute('name');
            const property = element.getAttribute('property');
            
            if (name === 'description' && this.seoData.description) {
                element.setAttribute('content', this.seoData.description);
            } else if (property === 'og:title' && this.seoData.title) {
                element.setAttribute('content', this.seoData.title);
            } else if (property === 'og:description' && this.seoData.description) {
                element.setAttribute('content', this.seoData.description);
            } else if (property === 'og:image' && this.seoData.og_image_url) {
                element.setAttribute('content', this.seoData.og_image_url);
            } else if (name === 'twitter:title' && this.seoData.title) {
                element.setAttribute('content', this.seoData.title);
            } else if (name === 'twitter:description' && this.seoData.description) {
                element.setAttribute('content', this.seoData.description);
            } else if (name === 'twitter:image' && this.seoData.og_image_url) {
                element.setAttribute('content', this.seoData.og_image_url);
            }
        }
    }
}

export async function onRequest({ request, next, env }) {
    // Only intercept GET requests
    if (request.method !== 'GET') {
        return next();
    }

    const response = await next();
    const contentType = response.headers.get("content-type") || "";
    
    // Only process text/html
    if (!contentType.includes("text/html")) {
        return response;
    }

    try {
        // Fetch custom SEO configuration from D1 (hardcoded path 'sourapple' for this directory)
        const stmt = env.DB.prepare('SELECT title, description, og_image_url FROM seo_settings WHERE page_path = ?');
        const seoData = await stmt.bind('sourapple').first();

        // If no custom settings, return as-is
        if (!seoData) {
            return response;
        }

        // Apply HTMLRewriter to strategically replace meta tags
        return new HTMLRewriter()
            .on('title', new SEOHandler(seoData))
            .on('meta', new SEOHandler(seoData))
            .transform(response);
            
    } catch (err) {
        console.error("SEO Middleware Error:", err);
        return response; // Fallback to original
    }
}
