# 🍎 りんごのまちいいづな ポータルサイト

飯綱町の産業・観光・生活情報を一元化した多言語対応ポータルサイト。  
Cloudflare Pages + D1 + R2 による完全サーバーレスアーキテクチャで運用。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| **ホスティング** | Cloudflare Pages |
| **API / サーバーサイド** | Cloudflare Pages Functions (Workers) |
| **データベース** | Cloudflare D1 (SQLite) |
| **ストレージ** | Cloudflare R2 |
| **認証** | JWT (Web Crypto API) + Google OAuth + LINE Login |
| **通知** | LINE Messaging API + Resend (Email) |
| **AI** | Google Gemini API (記事生成・翻訳) |
| **CI/CD** | GitHub Actions |

## 前提条件

- Node.js 18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (`npm install -g wrangler`)
- Cloudflare アカウント（D1, R2, Pages がプロビジョニング済み）

## セットアップ

### 1. クローン & 依存インストール

```bash
git clone <repository-url>
cd 飯綱町りんごPRWEB
npm install
```

### 2. 環境変数の設定

`.dev.vars` を作成し、以下の変数を設定:

```env
GEMINI_API_KEY=<your-api-key>
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
LINE_CHANNEL_ID=<your-channel-id>
LINE_CHANNEL_SECRET=<your-channel-secret>
LINE_CHANNEL_ACCESS_TOKEN=<your-access-token>
RESEND_API_KEY=<your-resend-key>
```

### 3. ローカルDBの初期化

```bash
# スキーマ作成
npm run db:schema

# シードデータ投入
npm run db:seed
```

### 4. 開発サーバー起動

```bash
npm run dev
```

→ `http://localhost:8788` でアクセス可能

## npm Scripts

| コマンド | 説明 |
|---|---|
| `npm run dev` | ローカル開発サーバー起動 (port 8788) |
| `npm run preview` | ローカルモードでプレビュー |
| `npm run deploy` | 本番環境にデプロイ |
| `npm run db:schema` | ローカルDBにスキーマ適用 |
| `npm run db:seed` | ローカルDBにシードデータ投入 |
| `npm run db:migrate` | マイグレーション手順の表示 |

## ディレクトリ構造

```
飯綱町りんごPRWEB/
├── db/                        # データベース定義
│   ├── schema.sql             # 正規スキーマ（最新版）
│   ├── seed.sql               # メインシードデータ
│   ├── seed_*.sql / .js       # カテゴリ・SEOキーワード等のシード
│   └── migrations/            # 適用済みマイグレーション
│
├── functions/                 # Cloudflare Pages Functions
│   ├── _middleware.js          # SEO HTMLRewriter ミドルウェア
│   ├── api/                   # APIエンドポイント群
│   │   ├── frontend.js        # 公開API（コンテンツ取得）
│   │   ├── posts.js           # CMS投稿一覧
│   │   ├── auth/              # 認証（Google/LINE/メール）
│   │   ├── content/           # コンテンツCRUD
│   │   ├── media/             # R2メディアアップロード
│   │   ├── generate.js        # AI記事生成
│   │   ├── translate.js       # AI翻訳
│   │   ├── broadcast.js       # LINE/Email一斉配信
│   │   └── ...
│   ├── assets/                # R2プロキシ
│   └── utils/                 # 共通ユーティリティ
│       ├── auth.js            # JWT・認証ヘルパー
│       ├── response.js        # レスポンス標準化
│       └── notification.js    # 通知（LINE/Email）
│
├── public/                    # 静的ファイル（フロントエンド）
│   ├── index.html             # トップページ
│   ├── admin.html             # 管理画面（SPA）
│   ├── discover.html          # 知るページ
│   ├── savor.html             # 味わうページ
│   ├── lifestyle.html         # 暮らすページ
│   ├── experience.html        # 体験するページ
│   ├── business.html          # 営むページ
│   ├── css/                   # スタイルシート
│   ├── js/                    # JavaScript
│   │   ├── config.js          # グローバル設定・i18n辞書
│   │   ├── common.js          # 基盤コンポーネント
│   │   ├── admin/             # 管理画面モジュール群
│   │   └── ...
│   ├── sourapple/             # Sourappleサブサイト
│   └── Form/                  # 多言語帳票ツール
│
├── .github/workflows/         # CI/CDパイプライン
├── wrangler.toml              # Wrangler設定
└── package.json
```

## デプロイ

### 自動デプロイ（推奨）
`main` ブランチへのpushで自動デプロイ（GitHub Actions）

### 手動デプロイ
```bash
npm run deploy
```

### DBマイグレーション（本番）
```bash
npx wrangler d1 execute portal-db --file=db/migrations/<NNN_name>.sql
```

## 多言語対応

- 日本語（ja）、英語（en）、繁体中文（zh）の3言語対応
- 固定UIテキストは `public/js/config.js` の `I18N` 辞書で管理
- 動的コンテンツは `content_translations` テーブルで管理
- URL パラメータ `?lang=en` で言語切替

## 詳細設計

技術アーキテクチャの詳細は [ARCHITECTURE.md](ARCHITECTURE.md) を参照。
