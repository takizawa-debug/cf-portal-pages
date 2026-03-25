import { errorResponse } from "../utils/response.js";
import { authenticate, requireRole } from '../utils/auth.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    // Auth Check
    const user = await authenticate(request, env);
    if (!user) return errorResponse("Unauthorized", 401);

    const roleError = requireRole(user, ['admin', 'editor']);
    if (roleError) return roleError;

    try {
        const { keyword, theme } = await request.json();

        // 1. Fetch SEO keywords
        const keywordsRes = await env.DB.prepare('SELECT keyword FROM seo_keywords ORDER BY priority DESC').all();
        const seoKeywords = keywordsRes.results.map(k => k.keyword).join(', ');

        // 2. Fetch Knowledge Base
        const knowledgeRes = await env.DB.prepare('SELECT title, content FROM knowledge_base').all();
        const knowledgeText = knowledgeRes.results.map(k => `【${k.title}】\n${k.content}`).join('\n\n');

        // 3. Construct Prompt
        const prompt = `あなたは飯綱町の公式ライターです。
以下の指示に従い、指定されたテーマについての記事を作成してください。

ターゲットテーマ/キーワード: ${keyword} ${theme ? `(${theme})` : ''}

【必須条件】
- 絶対にハルシネーション（嘘の生成）をしないこと。
- 提供された【ナレッジベース】の情報、および必要に応じて最新のWeb検索結果のみを使用して記事を作成すること。
- 以下の【SEOキーワード】を自然な文脈で可能な限り含めること。
SEOキーワード: ${seoKeywords}

【ナレッジベース】
${knowledgeText}

出力を以下のJSONフォーマットで返してください:
{
  "title": "記事のタイトル",
  "lead": "リード文（概要）",
  "body": "本文テキスト（HTMLタグを使わず、マークダウンも最小限で純粋なテキストにすること）"
}
`;

        // 4. Call Gemini API
        const geminiApiKey = env.GEMINI_API_KEY;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}`;

        const geminiRequestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            tools: [{
                googleSearch: {}
            }]
        };

        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(geminiRequestBody)
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.text();
            console.error("Gemini API Error:", errorData);
            return errorResponse("Failed to generate content from AI. Details: " + errorData, 500);
        }

        const data = await geminiResponse.json();

        // 5. Extract Content and Grounding Data
        const candidate = data.candidates?.[0];
        let responseText = candidate?.content?.parts?.[0]?.text || "{}";

        let generatedContent = {};
        try {
            // Strip markdown block if present
            const cleanText = responseText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
            generatedContent = JSON.parse(cleanText);
        } catch (e) {
            generatedContent = { title: "Error parsing AI response", lead: "", body: responseText };
        }

        // Extract sources
        let sourcesHtml = "";
        const groundingMetadata = candidate?.groundingMetadata;
        if (groundingMetadata && groundingMetadata.groundingChunks) {
            sourcesHtml += "<p><strong>参考リンク・参照元:</strong></p><ul>";

            // Add DB matches if used (heuristic: we know we provided DB info)
            if (knowledgeRes.results.length > 0) {
                sourcesHtml += "<li>内部ナレッジベース資料</li>";
            }

            // Parse Web chunks
            const webChunks = groundingMetadata.groundingChunks.filter(chunk => chunk.web);
            const seenUrls = new Set();
            for (const chunk of webChunks) {
                const uri = chunk.web.uri;
                const title = chunk.web.title;
                if (!seenUrls.has(uri)) {
                    seenUrls.add(uri);
                    sourcesHtml += `<li><a href="${uri}" target="_blank">${title}</a></li>`;
                }
            }
            sourcesHtml += "</ul>";
        }

        return Response.json({
            title: generatedContent.title || "",
            lead: generatedContent.lead || "",
            body: generatedContent.body || "",
            sources: sourcesHtml
        });

    } catch (error) {
        console.error("Generate API error:", error);
        return errorResponse("Internal Server Error", 500);
    }
}
