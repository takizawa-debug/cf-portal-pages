/**
 * feed-ai.js — Gemini による外部情報インテリジェンス分析エンジン
 * 公的リリース・新着情報を「飯綱町りんご栽培・地域振興」の文脈で考察し、発信記事ドラフトを生成
 */

/**
 * 不要なMarkdown装飾記号（**太字** や ###見出し など）を除去・自然な日本語テキストに整形
 */
export function cleanMarkdownFormatting(text) {
    if (!text) return '';
    return String(text)
        .replace(/\*\*([^*]+)\*\*/g, '$1')        // **太字** -> 太字
        .replace(/\*([^*]+)\*/g, '$1')             // *斜体* -> 通常文字
        .replace(/^#{1,6}\s*(.+)$/gm, '【$1】')    // ### 見出し -> 【見出し】
        .replace(/^\s*[-*]\s+/gm, '・')           // - リスト -> ・リスト
        .replace(/\n{3,}/g, '\n\n')                // 連続改行の整理
        .trim();
}

export async function analyzeFeedItemWithGemini(env, item, feed) {
    if (!env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is not set. Skipping AI analysis.');
        return {
            impact_level: 'medium',
            ai_commentary: '（APIキー未設定のためAI考察はスキップされました）',
            recommended_actions: '・元情報URLをご確認ください。',
            draft_title: cleanMarkdownFormatting(item.title),
            draft_lead: cleanMarkdownFormatting(item.title),
            draft_body: cleanMarkdownFormatting(`${item.raw_text || ''}\n\n■ 元情報URL: ${item.source_url || ''}`),
            suggested_l1: feed.target_l1 || '営む',
            suggested_l2: feed.target_l2 || '栽培支援',
            suggested_l3: feed.target_l3 || '栽培指導'
        };
    }

    const systemPrompt = `あなたは長野県上水内郡飯綱町のりんご産業・観光ポータルサイト「りんごのまちいいづな」のチーフ技術編集デスク（農業技術アドバイザー）です。

外部の公的機関（長野県病害虫防除部、果樹試験場、農村支援センター、飯綱町役場など）から検知された新着情報を、**飯綱町のりんご農家および地域関係者の視点**で深く分析・考察し、ポータルサイトに掲載するための記事ドラフトを作成してください。

### 【重要：文章作成の絶対ルール】
- **アスタリスク「**」や「*」などのMarkdown太字・強調記号は絶対に含めないでください。**
- 見出しには「###」ではなく「【見出し名】」を使用してください。
- 箇条書きにはハイフン「-」ではなく「・」を使用してください。
- 強調したい単語やイベント名は「」などのカギ括弧を使用してください。
- あくまで一般の読者や農家が自然に読めるクリーンで格調高い日本語テキスト（プレーンテキスト）として出力してください。

### 【影響度 (impact_level) の厳格な判定ルール】
本ポータルは「飯綱町りんごPR ＆ 栽培支援」に特化したサイトです。以下の明確な基準に従って判定してください：

- **"high" (高: りんご直結・最優先発信)**:
  1. 【りんごに関するイベント・販促・PR・体験企画】:
     - ブラムリーやりんご品種の飲食イベント、フェア、スイーツコンクール、摘果りんご活用講座、りんご学校マルシェ、りんご農家体験ツアー、収穫祭など「りんご」が主題の全情報
  2. 【飯綱町りんごPRキャラクター「みつどん」関連情報】:
     - 町公式りんごPRキャラクター「みつどん」の新色・グッズ販売、イベント出演、コラボ企画など「みつどん」に関する全情報（※りんごPRの超重要アイコン）
  3. 【りんご栽培・病害虫・技術指導】:
     - 病害虫の警報/注意報/特殊報（カメムシ、クビアカツヤカミキリ、黒星病、腐らん病、凍霜害等）
     - 果樹試験場のりんご肥大調査、熟度調査、生育・収穫期予測
  4. 【りんご・農業者向け支援施策】:
     - りんご農家や果樹園地への補助金、緊急給水、農業支援事業

- **"medium" (中: 地域食文化・他果樹・周辺観光)**:
  1. りんご以外の飯綱町の食・特産品・観光イベント（例: やたら祭り、地酒・ワイン、移住体験、ふるさと納税、歴史体験等）
  2. 果樹試験場のもも・ぶどう・すもも等の他果樹データ、一般ニュース

- **"low" (低: 関連薄・一般行政広報)**:
  1. りんごや農業・特産品・観光に直接関係しない一般的な町政・文化・行政広報（例: シールアート展、キッズデザイン賞受賞、一般町民講座、包括連携協定など）
  2. 水稲単体・他品目単独の情報

### 分析とドラフト作成のガイドライン:
1. **AI考察コメント (ai_commentary)**:
   - 専門用語を噛み砕き、「なぜ飯綱町の農家・関係者にとって重要なのか」「どのような背景があるのか」を論理的・平易に解説してください。
2. **推奨アクション (recommended_actions)**:
   - 現地の農家や事業者がいま園地・現場で行うべき具体的な作業・観察・連絡ポイントを「・」の箇条書きで示してください。
3. **発信記事ドラフト (draft_title, draft_lead, draft_body)**:
   - そのままポータルサイトに公開できる高品質な記事本文を作成してください。
   - 本文末尾には必ず「■ 詳細・元資料」として元のURLやPDFリンクへの誘導を記載してください。
4. **カテゴリ提案**:
   - feedのデフォルト設定 (${feed.target_l1} > ${feed.target_l2} > ${feed.target_l3}) を参考に、最適なL1/L2/L3を決定してください。

必ず以下のJSON形式のみを出力してください（Markdownコードブロックは含めず純粋なJSON文字列として出力してください）:
{
  "impact_level": "high" | "medium" | "low",
  "ai_commentary": "文字列（**記号なし）",
  "recommended_actions": "文字列（・で始まる箇条書き、**記号なし）",
  "draft_title": "文字列（**記号なし）",
  "draft_lead": "文字列（**記号なし）",
  "draft_body": "文字列（**記号なしの自然な記事本文）",
  "suggested_l1": "文字列",
  "suggested_l2": "文字列",
  "suggested_l3": "文字列"
}`;

    const userPrompt = `【検知情報】
■ 発信元: ${feed.name}
■ タイトル: ${item.title}
■ 発表日/日付: ${item.detected_date || '不明'}
■ 原文URL: ${item.source_url || 'なし'}
■ 添付PDF: ${item.pdf_url || 'なし'}
■ 動画/メディア: ${item.media_url || 'なし'}
■ 本文・抜粋テキスト:
${item.raw_text || item.title}`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error('Gemini API error:', errText);
            throw new Error(`Gemini API returned status ${res.status}`);
        }

        const data = await res.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsed = JSON.parse(rawJson);

        return {
            impact_level: parsed.impact_level || 'medium',
            ai_commentary: cleanMarkdownFormatting(parsed.ai_commentary || ''),
            recommended_actions: cleanMarkdownFormatting(parsed.recommended_actions || ''),
            draft_title: cleanMarkdownFormatting(parsed.draft_title || item.title),
            draft_lead: cleanMarkdownFormatting(parsed.draft_lead || ''),
            draft_body: cleanMarkdownFormatting(parsed.draft_body || item.raw_text),
            suggested_l1: parsed.suggested_l1 || feed.target_l1 || '営む',
            suggested_l2: parsed.suggested_l2 || feed.target_l2 || '栽培支援',
            suggested_l3: parsed.suggested_l3 || feed.target_l3 || '栽培指導'
        };
    } catch (e) {
        console.error('Failed to parse Gemini response for feed item:', e);
        return {
            impact_level: 'medium',
            ai_commentary: `（AI考察の生成中にエラーが発生しました: ${e.message}）`,
            recommended_actions: '・元情報をご確認の上、内容を精査してください。',
            draft_title: cleanMarkdownFormatting(item.title),
            draft_lead: '',
            draft_body: cleanMarkdownFormatting(item.raw_text || ''),
            suggested_l1: feed.target_l1 || '営む',
            suggested_l2: feed.target_l2 || '栽培支援',
            suggested_l3: feed.target_l3 || '栽培指導'
        };
    }
}
