# AGENTS.md

## プロジェクト概要
**飯綱町多言語アップルプロジェクト (Appletown Iizuna Multilingual Project)**
本プロジェクトは、飯綱町の観光・農業情報を多言語（日・英・中）で発信し、収集したデータを蓄積・活用するためのシステムです。
旧GAS（Google Apps Script）アーキテクチャから完全移行し、現在は **Cloudflare Pages + D1 + R2** を用いたサーバーレス構成で運用されています。

## 技術スタック
- **Frontend**: Vanilla JS / HTML / CSS (ディレクトリ: `public/`)
- **Backend / API**: Cloudflare Pages Functions (ディレクトリ: `functions/`)
- **Database**: Cloudflare D1 (SQLite) (スキーマ定義: `db/schema.sql`)
- **Storage**: Cloudflare R2
- **Authentication**: JWT, Google OAuth, LINE Login
- **AI / Translation**: Google Gemini API (`gemini-2.5-flash`)
- **DevOps**: GitHub Actions, Wrangler CLI

## 重要環境変数 (`.dev.vars` / Cloudflare Secrets)
以下の変数は `env` オブジェクト（Cloudflare Functionsのコンテキスト）を通じて取得します。**コードセット内にハードコードしてはいけません。**

| キー名 | 役割 | 備考 |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Gemini API Key | `functions/api/generate.js` や `translate.js` で使用 |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | 認証関連で使用 |
| `LINE_CHANNEL_ID` | LINE Login / Messaging API | 認証や通知関連で使用 |
| `RESEND_API_KEY` | Resend API Key | メール一斉配信や通知で使用 |

## ディレクトリ構成と役割
### `public/` (Frontend)
静的ファイル群。
- `index.html`, `admin.html` などの画面エントリポイント
- `js/`, `css/` 等のフロントエンドリソース

### `functions/` (Backend API)
Cloudflare Pages Functions によるサーバーレスAPIエンドポイント。
- `api/frontend.js`: 公開用データ取得エンドポイント
- `api/content/`: CMSのデータCRUD操作
- `api/translate.js`, `api/generate.js`: AI機能連携

### `db/` (Database & Schema)
Cloudflare D1のデータベース定義。ここが**Source of Truth**となります。
- `schema.sql`: データベースの正規テーブル定義
- `seed.sql`: シードデータ
- `migrations/`: D1マイグレーションファイル

## データ構造とスキーマ定義 (Source of Truth)
### `db/schema.sql` ⇔ D1 データベース
フロントエンド・バックエンド間のデータ構造の期待値は、すべて `db/schema.sql` に依存します。
- 記事（Posts）やカテゴリ（Categories）などのテーブル構成を変更する場合は、必ずマイグレーションを作成し、スキーマ定義を更新すること。
- **多言語対応**: 動的コンテンツの多言語化は `content_translations` などのデータベーステーブルで行い、固定UIテキストは `public/js/config.js` の `I18N` 辞書で管理します。

## コーディング規約 & エージェント運用ルール

### 1. 言語・コメント
- **ソースコード**: 原則として変数名などは英語（CamelCase または snake_case ※DBスキーマに合わせる）。
- **コメント**: **日本語**で記述すること。特に関数の役割、引数、戻り値についてはJSDoc形式で記述する。

### 2. 安全性・セキュリティ
- APIキーなどのシークレットは必ず `env` から取得する。
- 外部API呼び出し (`fetch`) は必ず `try-catch` で囲み、エラーハンドリングを適切に行う。
- SQLインジェクションを防ぐため、D1へのクエリは必ずプレースホルダ (`?`, `.bind()`) を使用する。

### 3. 多言語対応 (i18n)
- ユーザー向けの表示文言はハードコードせず、`config.js` の辞書定義またはDBの翻訳テーブルを利用する。
- Geminiプロンプト内での言語指定や用語統一指示（Glossary）を遵守する。

### 4. デプロイ運用 (Wrangler / GitHub Actions)
- ローカル開発は `npm run dev` で行い、DB変更は `npm run db:schema` 等を利用する。
- 本番デプロイは原則として GitHub Actions (`main` ブランチへのpush) で行う。
- 手動でデプロイする場合は `npm run deploy` を使用する。

## エージェント・タスク実行チェックリスト
- [ ] **変更の影響範囲確認**: データベース構造を変更する場合、`schema.sql` を更新し、マイグレーション手順を考慮したか？
- [ ] **D1クエリの安全性**: SQL実行時にバインド変数を利用しているか？
- [ ] **AIプロンプト**: AI APIの呼び出し時、期待するJSON出力フォーマットが保証されているか？
- [ ] **環境変数の参照**: `.dev.vars` や `env` オブジェクトから正しくシークレットを参照しているか？

---
*このファイルはエージェント（あなた）が常に参照すべき指針です。タスク開始時に必ず読み返してください。*
