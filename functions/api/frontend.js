import { jsonResponse, optionsResponse } from "../utils/response";
export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const l1 = url.searchParams.get('l1');
    const l2 = url.searchParams.get('l2');
    const all = url.searchParams.get('all');

    try {
        let results = [];

        if (url.searchParams.get('mode') === 'keywords') {
            // Return keywords for modal-search.js auto-linking
            const { results: kwRows } = await env.DB.prepare("SELECT keyword FROM seo_keywords").all();

            const items = kwRows.map(row => {
                const kw = row.keyword;
                // Parse "りんご (en: Apple, zh: 苹果)" if that format exists
                const item = { ja: kw };
                const matchEn = kw.match(/en:\s*([^,)]+)/);
                if (matchEn) item.en = matchEn[1].trim();
                const matchZh = kw.match(/zh:\s*([^,)]+)/);
                if (matchZh) item.zh = matchZh[1].trim();

                // Clean up 'ja' to only be the base word if it has parens
                item.ja = kw.split('(')[0].trim();
                return item;
            });
            return jsonResponse({ ok: true, items });
        }

        const q = url.searchParams.get('q');
        let dbRows = [];

        if (q) {
            // Search via keyword (q)
            let searchPattern = `%${q}%`;
            // If the query is just spaces (used in sitemap to fetch all), we match everything
            if (q.trim() === '') {
                searchPattern = '%';
            }

            const { results: searchRows } = await env.DB.prepare(`
                SELECT * FROM contents 
                WHERE title LIKE ? 
                   OR lead_text LIKE ? 
                   OR body_text LIKE ? 
                   OR l1 LIKE ? 
                   OR l2 LIKE ?
                ORDER BY created_at DESC
                LIMIT 1000
            `).bind(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern).all();
            dbRows = searchRows;
        } else if (all === '1') {
            // header.js navigation expects basic l1 -> l2 mapping
            const { results: allRows } = await env.DB.prepare(
                "SELECT l1, l2, l3_label as l3, l1_en, l2_en, l3_label_en as l3_en, l1_tw as l1_zh, l2_tw as l2_zh, l3_label_tw as l3_zh FROM contents"
            ).all();
            results = allRows; // direct assignment for 'all' mode
        } else if (l1 && l2) {
            // section.js expects full data filtered by l1 and l2
            const { results: catRows } = await env.DB.prepare(
                "SELECT * FROM contents WHERE l1 = ? AND l2 = ?"
            ).bind(l1, l2).all();
            dbRows = catRows;
        }

        // Only map if dbRows has items (which happens for 'q' or 'l1/l2')
        if (dbRows.length > 0) {
            results = dbRows.map(row => {
                const sns = {
                    instagram: row.sns_instagram,
                    facebook: row.sns_facebook,
                    x: row.sns_x,
                    line: row.sns_line,
                    tiktok: row.sns_tiktok
                };

                const relatedArticles = [];
                if (row.related1_url) relatedArticles.push({ url: row.related1_url, title: row.related1_title });
                if (row.related2_url) relatedArticles.push({ url: row.related2_url, title: row.related2_title });

                const subImages = [
                    row.image2, row.image3, row.image4, row.image5, row.image6
                ].filter(Boolean);

                // Create the mapped object
                return {
                    id: row.id ? row.id.toString() : "",
                    l1: row.l1,
                    l2: row.l2,
                    l3: row.l3_label,
                    title: row.title,
                    lead: row.lead_text,
                    body: row.body_text,
                    en: {
                        l1: row.l1_en,
                        l2: row.l2_en,
                        l3: row.l3_label_en,
                        title: row.title_en,
                        lead: row.lead_text_en,
                        body: row.body_text_en
                    },
                    zh: {
                        l1: row.l1_tw,
                        l2: row.l2_tw,
                        l3: row.l3_label_tw,
                        title: row.title_tw,
                        lead: row.lead_text_tw,
                        body: row.body_text_tw
                    },
                    mainImage: row.image1,
                    subImages: subImages,
                    home: row.homepage,
                    relatedArticles: relatedArticles,
                    ec: row.ec_site,
                    sns: sns,
                    address: row.address,
                    form: row.contact_form_url,
                    email: row.contact_email,
                    tel: row.contact_phone,
                    note: row.remarks,
                    downloadUrl: row.download_url,
                    bizDays: row.business_days,
                    hoursCombined: `${row.business_start || ''} - ${row.business_end || ''}`.trim() === '-' ? '' : `${row.business_start || ''} - ${row.business_end || ''}`,
                    holiday: row.closed_days,
                    bizNote: row.business_remarks,
                    eventDate: `${row.start_date || ''} - ${row.end_date || ''}`.trim() === '-' ? '' : `${row.start_date || ''} - ${row.end_date || ''}`,
                    eventTime: `${row.start_time || ''} - ${row.end_time || ''}`.trim() === '-' ? '' : `${row.start_time || ''} - ${row.end_time || ''}`,
                    fee: row.fee,
                    bring: row.belongings,
                    target: row.target_audience,
                    organizer: row.organizer_name,
                    orgTel: row.organizer_contact,
                    orgApply: row.application_method,
                    venueNote: row.venue_remarks
                };
            });
        }

        // Return the payload wrapped in { ok: true, items: [...] } exactly as the GAS endpoint did
        return jsonResponse({ ok: true, items: results });
    } catch (error) {
        return jsonResponse({ ok: false, error: error.message }, 500);
    }
}

export async function onRequestOptions() {
    return optionsResponse();
}
