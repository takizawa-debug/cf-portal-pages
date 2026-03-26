import { errorResponse } from "../utils/response.js";
import { authenticate, requireRole } from "../utils/auth.js";

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const user = await authenticate(request, env);
        if (!user) return errorResponse("Unauthorized", 401);

        const roleError = requireRole(user, ['admin', 'editor']);
        if (roleError) return roleError;

        const body = await request.json();
        const { title, lead_text, body_text } = body;

        if (!title && !body_text) {
            return errorResponse('Missing content to translate', 400);
        }

        // Fetch keywords to act as glossary
        const { results: keywordsRow } = await env.DB.prepare("SELECT keyword FROM seo_keywords ORDER BY created_at DESC").all();
        const glossaryText = keywordsRow.map(k => k.keyword).join(', ');

        const geminiApiKey = env.GEMINI_API_KEY;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`;

        const createPrompt = (targetLang) => `
あなたは長野県飯綱町の「公式マスター・ローカライザー」であり、地域の魅力を世界へ発信するブランド戦略の専門家です。
単なる言葉の置き換えではなく、飯綱町の歴史、農業、そして「ちょうどいい田舎」という独自の空気感を、${targetLang}圏の読者の心に響く「一流のメディア・コンテンツ」へと昇華させてください。

### 【絶対遵守：出力言語の制限】
現在、あなたは **「${targetLang}」** への翻訳のみを担当しています。
- **指示された「${targetLang}」以外の言語（中国語など）は、結果の中に絶対に混ぜないでください。**
- JSONのキー ("theme", "lead", "body") も値も、すべて「${targetLang}」だけで構成してください。
- 以前相談した「品種名の英語併記」は、${targetLang}が中国語（簡体字・繁体字）の場合のみ適用し、現在の${targetLang}がEnglishの場合は不要です。

### 【用語定義：絶対遵守】
以下の単語が原文（テーマ、リード、本文）に含まれる場合、文脈を尊重しつつも、基本的には指定された翻訳（大文字小文字は問わない）を使用してください。
${glossaryText}

### 【中国語翻訳に関する重要指示】
- **品種名の英語併記**: 
  中国語（繁体字・簡体字）に翻訳する際、リンゴの品種名（特に海外品種）や、漢字だけでは正しく伝わりにくい固有名詞については、必ず**「中国語表記 (英語表記)」**の形式で出力してください。
  - 良い例：史密斯奶奶蘋果 (Granny Smith)、肯特之花 (Flower of Kent)
  - ※既に世界的に漢字のみで定着している地名等は除きますが、品種については原則併記してください。

### 【ミッション：事実に基づく精密なローカライズ】
翻訳を開始する前に、内蔵のGoogle検索ツールを用いて、以下のプロセスを必ず実行してください。

1. **徹底したファクトチェック（事実確認）**:
   - 固有名詞（地名、施設名、りんごの品種、郷土料理等）について、飯綱町公式の英語/中国語表記、または現地での「正式な読み」を検索して特定してください。
   - 例示としての「高坂りんご（Kosaka Apple）」のように、一般的な読み（Takasaka）とは異なる「地域特有の正解」が存在しないか、常に疑い、確認してから出力してください。

2. **カテゴリーに最適化されたトーン＆マナー**:
   - **【歴史・地理】**: 伝統と誇りが伝わる、洗練された「格調高い（Sophisticated）」文体。
   - **【品種図鑑・魅力】**: 読者の食欲と好奇心を刺激する、簡潔で「魅力的な（Engaging）」コピーライティング。
   - **【制度・アクセス・生活】**: 移住者や観光客に寄り添った、正確で「親切な（Pragmatic）」案内。

3. **文化的ニュアンスの翻訳（Transcreation）**:
   - 「日本一のりんご村」や「ちょうどいい田舎」といった言葉は、その背景にあるコミュニティの熱量や利便性を汲み取り、単なる直訳（No.1 village / Just right countryside）を避け、その土地の「誇り」が伝わる表現を選択してください。

### 【固有名詞の扱いに関する基本ガイドライン】
※これらは検索結果を優先するための指針です。
- **地名**: 牟礼（Mure）、三水（Samizu）など、合併前の旧村名や地区名のアイデンティティを尊重する。
- **施設**: いいづなコネクト（Iizuna Connect）等は固有名詞として維持。
- **栽培**: 丸葉（Maruba）、わい化（Waika）等の専門用語は、農学的な正確さを保つ。
- **品種**: 「ふじ」「秋映」「シナノスイート」等は、飯綱町産としてのブランドが伝わる綴りとする。

### 【翻訳対象データ】
以下が原文です：
テーマ(Theme): ${title || ''}
リード文(Lead): ${lead_text || ''}
本文(Body): ${body_text || ''}

### 【出力形式】
回答は必ず以下のJSON配列構造のみで返してください。余計な解説、言語タグ（\`\`\`json 等）、markdown装飾は一切禁止します。思考プロセスや検索結果の解説は一切含めないでください。
[
  {
    "theme": "${targetLang}でのテーマ",
    "lead": "${targetLang}でのリード文",
    "body": "${targetLang}での本文"
  }
]
`;

        async function callGemini(lang) {
            const bodyPayload = {
                contents: [{ parts: [{ text: createPrompt(lang) }] }],
                tools: [{ googleSearch: {} }] // Enable Google Search Grounding for fact checks
            };

            const res = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });

            if (!res.ok) {
                console.error("Gemini Error:", await res.text());
                throw new Error("Gemini API call failed");
            }

            const data = await res.json();
            let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

            // Strip markdown block if model ignored the instruction
            responseText = responseText.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();

            const parsed = JSON.parse(responseText);
            return parsed[0];
        }

        // Run translations in parallel
        const [englishRes, chineseRes] = await Promise.all([
            callGemini("English"),
            callGemini("繁体字中国語 (Traditional Chinese)")
        ]);

        return Response.json({
            ok: true,
            english: {
                title: englishRes.theme || '',
                lead_text: englishRes.lead || '',
                body_text: englishRes.body || ''
            },
            chinese: {
                title: chineseRes.theme || '',
                lead_text: chineseRes.lead || '',
                body_text: chineseRes.body || ''
            }
        });
    } catch (err) {
        console.error("Translation error", err);
        return errorResponse(err.message, 500);
    }
}
