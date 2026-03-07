DROP TABLE IF EXISTS posts;

CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'manual' or 'instagram'
    title_jp TEXT,
    title_en TEXT,
    title_tw TEXT,
    body_jp TEXT,
    body_en TEXT,
    body_tw TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
