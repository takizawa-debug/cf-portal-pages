export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const l1 = url.searchParams.get('l1');
    const l2 = url.searchParams.get('l2');
    const all = url.searchParams.get('all');

    try {
        let results = [];

        if (all === '1') {
            // header.js navigation expects basic l1 -> l2 mapping
            const { results: dbRows } = await env.DB.prepare(
                "SELECT l1, l2, l3_label as l3, l1_en, l2_en, l3_label_en as l3_en, l1_tw as l1_zh, l2_tw as l2_zh, l3_label_tw as l3_zh FROM contents"
            ).all();
            results = dbRows;
        } else if (l1 && l2) {
            // section.js expects full data filtered by l1 and l2
            const { results: dbRows } = await env.DB.prepare(
                "SELECT * FROM contents WHERE l1 = ? AND l2 = ?"
            ).bind(l1, l2).all();

            // Map the rows to look exactly like the GAS output
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
        return new Response(JSON.stringify({ ok: true, items: results }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
    });
}
