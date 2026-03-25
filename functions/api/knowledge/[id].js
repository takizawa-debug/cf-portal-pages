import { errorResponse, jsonResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";
import * as xlsx from 'xlsx';
import mammoth from 'mammoth';

export async function onRequestPut(context) {
    const { request, env, params } = context;

    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    const id = params.id;
    if (!id) return errorResponse("Missing ID", 400);

    try {
        const contentType = request.headers.get('content-type') || '';
        let title = '';
        let content = '';
        let type = 'text';
        let source_url = null;

        if (contentType.includes('application/json')) {
            const data = await request.json();
            title = data.title;
            content = data.content || '';
            type = data.type || 'text';
            source_url = data.source_url || null;

            if (type === 'url' && source_url) {
                try {
                    const isGoogleDoc = source_url.includes('docs.google.com/document/d/');
                    const isGoogleSheet = source_url.includes('docs.google.com/spreadsheets/d/');

                    if (isGoogleDoc) {
                        const docId = source_url.split('/d/')[1].split('/')[0];
                        const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
                        const res = await fetch(exportUrl);
                        if (res.ok) content = await res.text();
                    } else if (isGoogleSheet) {
                        const sheetId = source_url.split('/d/')[1].split('/')[0];
                        const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
                        const res = await fetch(exportUrl);
                        if (res.ok) content = await res.text();
                    } else {
                        const scrapeRes = await fetch(`https://r.jina.ai/${source_url}`);
                        if (scrapeRes.ok) content = await scrapeRes.text();
                    }
                    if (!content) throw new Error("Empty scrape result");
                } catch (e) {
                    return errorResponse("Could not scrape the provided URL.", 400);
                }
            }
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            title = formData.get('title');

            const file = formData.get('file');
            if (file && file.size > 0) {
                const fileName = file.name.toLowerCase();
                if (fileName.endsWith('.pdf')) type = 'pdf';
                else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) type = 'excel';
                else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) type = 'word';
                else type = 'file';

                const arrayBuffer = await file.arrayBuffer();

                if (type === 'excel') {
                    const workbook = xlsx.read(arrayBuffer, { type: 'array' });
                    let sheetText = '';
                    workbook.SheetNames.forEach(sheetName => {
                        sheetText += `--- Sheet: ${sheetName} ---\n`;
                        sheetText += xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]) + '\n';
                    });
                    content = sheetText;
                } else if (type === 'word') {
                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                    content = result.value;
                } else {
                    const bytes = new Uint8Array(arrayBuffer);
                    let binary = '';
                    for (let i = 0; i < bytes.length; i += 8192) {
                        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
                    }
                    const base64Data = btoa(binary);
                    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

                    const geminiBody = {
                        contents: [{
                            parts: [
                                { text: "Extract all text content. Summarize visual elements in Markdown." },
                                { inlineData: { mimeType: file.type || 'application/pdf', data: base64Data } }
                            ]
                        }]
                    };
                    const geminiRes = await fetch(geminiUrl, { method: 'POST', body: JSON.stringify(geminiBody) });
                    if (geminiRes.ok) {
                        const data = await geminiRes.json();
                        content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    } else throw new Error(await geminiRes.text());
                }
            } else {
                // Keep existing text if no new file is uploaded
                const existing = await env.DB.prepare("SELECT content FROM knowledge_base WHERE id = ?").bind(id).first();
                if (existing) content = existing.content;
                type = formData.get('type') || 'pdf'; // Maintain existing type
            }
        }

        if (!title) return errorResponse("Title is required.", 400);

        const now = new Date().toISOString();
        const updateResult = await env.DB.prepare(`
            UPDATE knowledge_base
            SET title=?, content=?, type=?, source_url=?, last_scraped_at=?
            WHERE id=?
        `).bind(title, content, type, source_url, type === 'url' ? now : null, id).run();

        if (updateResult.meta.changes === 0) return errorResponse("Knowledge item not found", 404);
        return jsonResponse({ success: true, id, title });

    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;

    // Auth Check
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    try {
        const id = params.id;
        if (!id) return errorResponse("Missing ID", 400);

        const result = await env.DB.prepare("DELETE FROM knowledge_base WHERE id = ?").bind(id).run();

        if (result.meta.changes === 0) {
            return errorResponse("Knowledge item not found", 404);
        }

        return jsonResponse({ success: true });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
