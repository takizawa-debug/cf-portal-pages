# Database Migrations

このディレクトリには、D1データベースに適用済みのマイグレーションSQLがアーカイブされています。

## 命名規則

```
NNN_<description>.sql
```

- `NNN`: 3桁の連番（001〜）
- `<description>`: スネークケースで変更内容を簡潔に記述

## 適用方法

```bash
# ローカル開発環境
npx wrangler d1 execute portal-db --local --file=db/migrations/<filename>.sql

# 本番環境（注意: 本番データに直接影響します）
npx wrangler d1 execute portal-db --file=db/migrations/<filename>.sql
```

## 適用済みマイグレーション一覧

| # | ファイル | 内容 | 状態 |
|---|---|---|---|
| 001 | `001_alter_users.sql` | users に display_name カラム追加 | ✅ 適用済み |
| 002 | `002_alter_contents.sql` | contents に business_b_type, business_metadata カラム追加 | ✅ 適用済み |
| 003 | `003_create_forms.sql` | form_submissions テーブル作成 | ✅ 適用済み |
| 004 | `004_setup_seo.sql` | seo_settings テーブル作成 | ✅ 適用済み |
| 005 | `005_update_seo_favicon.sql` | seo_settings に favicon_url カラム追加 | ✅ 適用済み |
| 006 | `006_update_seo_paths.sql` | seo_settings の sourapple パス修正 | ✅ 適用済み |
| 007 | `007_update_contents_site_scope.sql` | contents に site_scope カラム追加 | ✅ 適用済み |
| 008 | `008_update_users_managed_sites.sql` | users に managed_sites カラム追加 | ✅ 適用済み |
| 009 | `009_migrate_v2.sql` | V2スキーマ移行（画像→media_assets JSON、翻訳テーブル分離） | ✅ 適用済み |

## 新しいマイグレーションの追加

1. 上記テーブルに従い、次の連番でSQLファイルを作成
2. ローカルで検証後、本番に適用
3. `schema.sql` も合わせて最新に更新すること
