DROP TABLE IF EXISTS contents;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS posts; -- Old table cleanup

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'contributor', -- 'admin', 'editor', 'contributor'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE contents (
    id TEXT PRIMARY KEY,
    author_id TEXT,
    type TEXT DEFAULT 'manual', -- 'manual', 'instagram', or 'sheet_import'
    status TEXT DEFAULT 'draft',
    
    -- Japanese (Base default language)
    l1 TEXT,
    l2 TEXT,
    l3_label TEXT,
    title TEXT,
    lead_text TEXT,
    body_text TEXT,
    
    -- Links
    homepage TEXT,
    related1_url TEXT,
    related1_title TEXT,
    related2_url TEXT,
    related2_title TEXT,
    ec_site TEXT,
    sns_instagram TEXT,
    sns_facebook TEXT,
    sns_x TEXT,
    sns_line TEXT,
    sns_tiktok TEXT,
    
    -- Contact & Location
    address TEXT,
    contact_form_url TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    remarks TEXT,
    download_url TEXT,
    
    -- Business Hours
    business_days TEXT,
    business_start TEXT,
    business_end TEXT,
    closed_days TEXT,
    business_remarks TEXT,
    
    -- Events
    start_date TEXT,
    end_date TEXT,
    start_time TEXT,
    end_time TEXT,
    fee TEXT,
    belongings TEXT,
    target_audience TEXT,
    organizer_name TEXT,
    organizer_contact TEXT,
    application_method TEXT,
    venue_remarks TEXT,
    
    -- Business specifics
    business_b_type TEXT,
    business_metadata TEXT,
    
    -- Media Array
    media_assets TEXT DEFAULT '[]',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_translations (
    id TEXT PRIMARY KEY,
    content_id TEXT NOT NULL,
    locale TEXT NOT NULL,
    title TEXT,
    lead_text TEXT,
    body_text TEXT,
    UNIQUE(content_id, locale),
    FOREIGN KEY(content_id) REFERENCES contents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seo_keywords (
    id TEXT PRIMARY KEY,
    keyword TEXT UNIQUE NOT NULL,
    priority INTEGER DEFAULT 1,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_base (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text',         -- 'text', 'url', 'pdf', 'word'
    source_url TEXT,                  -- Reference URL if applicable
    last_scraped_at DATETIME,         -- Timestamp for last crawl
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    form_type TEXT DEFAULT 'shop',
    l1 TEXT,
    l2 TEXT,
    l3 TEXT,
    l1_en TEXT,
    l2_en TEXT,
    l3_en TEXT,
    l1_zh TEXT,
    l2_zh TEXT,
    l3_zh TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE apple_varieties (
    id TEXT PRIMARY KEY,
    name_ja TEXT NOT NULL,
    name_en TEXT,
    name_zh TEXT,
    harvest_season TEXT,
    lineage TEXT,
    origin TEXT,
    official_image_url TEXT,
    summary TEXT,
    description TEXT,
    display_order INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS form_submissions (
    id TEXT PRIMARY KEY,
    form_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    files_json TEXT,
    status TEXT DEFAULT 'unread',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
