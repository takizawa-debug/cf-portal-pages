CREATE TABLE IF NOT EXISTS seo_settings (
    page_path TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    og_image_url TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
