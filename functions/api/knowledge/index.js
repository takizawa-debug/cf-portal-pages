import { errorResponse, jsonResponse } from "../../utils/response.js";
import { authenticate, requireRole } from "../../utils/auth.js";
import * as xlsx from 'xlsx';
import mammoth from 'mammoth';


export async function onRequestGet(context) {
    const { env } = context;
    try {
        const { results } = await env.DB.prepare("SELECT * FROM knowledge_base ORDER BY created_at DESC").all();
        return jsonResponse(results);
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    // Auth Check
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin', 'editor']);
    // mammoth and xlsx do not work natively inside Cloudflare Workers without a bundler like webpack/esbuild.
    // Since this project runs on local Pages Dev / Workers, importing full Node.js libs directly into the worker script might crash if not polyfilled.
    // Instead of mammoth/xlsx, we will route ALL files (Word, Excel, PDF, Images) through the newly upgraded Gemini 2.5 Multimodal API.
    // Gemini 2.5 Flash natively supports and excels at parsing PDFs, Images, Word documents, and Excel sheets.

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
                    // Check if it's a Google Doc or Google Sheet URL
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
                        // Standard Web Scraping via Jina
                        const scrapeRes = await fetch(`https://r.jina.ai/${source_url}`);
                        if (scrapeRes.ok) content = await scrapeRes.text();
                    }
                    if (!content) throw new Error("Empty scrape result");
                } catch (e) {
                    return errorResponse("Could not scrape the provided URL. Ensure it is accessible.", 400);
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
                else type = 'file'; // Fallback

                const arrayBuffer = await file.arrayBuffer();

                if (type === 'excel') {
                    try {
                        const workbook = xlsx.read(arrayBuffer, { type: 'array' });
                        let sheetText = '';
                        workbook.SheetNames.forEach(sheetName => {
                            const worksheet = workbook.Sheets[sheetName];
                            sheetText += `--- Sheet: ${sheetName} ---\n`;
                            sheetText += xlsx.utils.sheet_to_csv(worksheet) + '\n';
                        });
                        content = sheetText;
                    } catch (e) {
                        return errorResponse("Failed to parse Excel file. Details: " + e.message, 500);
                    }
                } else if (type === 'word') {
                    try {
                        // mammoth takes an ArrayBuffer in browser/worker environments
                        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                        content = result.value;
                    } catch (e) {
                        return errorResponse("Failed to parse Word file. Details: " + e.message, 500);
                    }
                } else {
                    // Gemini Extractor Pipeline mainly for PDFs/Images
                    const bytes = new Uint8Array(arrayBuffer);
                    let binary = '';
                    const chunkSize = 8192;
                    for (let i = 0; i < bytes.length; i += chunkSize) {
                        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
                    }
                    const base64Data = btoa(binary);

                    const geminiApiKey = env.GEMINI_API_KEY;
                    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

                    let mime = file.type || 'application/pdf';

                    const geminiBody = {
                        contents: [{
                            parts: [
                                { text: "Extract all text content from this document. If this document is a PDF containing images, charts, graphs, or UI screenshots, explicitly provide a detailed, highly descriptive summary of those visual elements in Markdown format alongside the text. Do not provide conversational filler." },
                                { inlineData: { mimeType: mime, data: base64Data } }
                            ]
                        }]
                    };

                    try {
                        const geminiRes = await fetch(geminiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(geminiBody)
                        });

                        if (!geminiRes.ok) {
                            const errText = await geminiRes.text();
                            return errorResponse("Failed to parse document using AI. Details: " + errText, 500);
                        }

                        const data = await geminiRes.json();
                        content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    } catch (e) {
                        return errorResponse("Failed to connect to AI parser.", 500);
                    }
                }
            }
        }

        if (!title || (!content && type === 'text')) {
            return errorResponse("Title and content are required.", 400);
        }

        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        await env.DB.prepare(`
            INSERT INTO knowledge_base (id, title, content, type, source_url, last_scraped_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(id, title, content || '', type, source_url, type === 'url' ? now : null).run();

        return jsonResponse({ success: true, id, title });
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}
