-- 1. Create the new translation table
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

-- 2. Create the new contents table omitting the language and image columns
CREATE TABLE IF NOT EXISTS contents_new (
    id TEXT PRIMARY KEY,
    author_id TEXT,
    type TEXT DEFAULT 'manual',
    status TEXT DEFAULT 'draft',
    
    -- Base Japanese Info (kept as default/fallback for ease of use)
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
    
    -- Media (Images) replaced by JSON
    media_assets TEXT DEFAULT '[]',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Copy existing translation data into content_translations
-- English
INSERT INTO content_translations (id, content_id, locale, title, lead_text, body_text)
SELECT lower(hex(randomblob(16))), id, 'en', title_en, lead_text_en, body_text_en
FROM contents
WHERE (title_en IS NOT NULL AND title_en != '') OR (lead_text_en IS NOT NULL AND lead_text_en != '') OR (body_text_en IS NOT NULL AND body_text_en != '');

-- Traditional Chinese
INSERT INTO content_translations (id, content_id, locale, title, lead_text, body_text)
SELECT lower(hex(randomblob(16))), id, 'zh-TW', title_tw, lead_text_tw, body_text_tw
FROM contents
WHERE (title_tw IS NOT NULL AND title_tw != '') OR (lead_text_tw IS NOT NULL AND lead_text_tw != '') OR (body_text_tw IS NOT NULL AND body_text_tw != '');

-- 4. Copy existing data into contents_new
INSERT INTO contents_new (
    id, author_id, type, l1, l2, l3_label, title, lead_text, body_text,
    homepage, related1_url, related1_title, related2_url, related2_title, ec_site,
    sns_instagram, sns_facebook, sns_x, sns_line, sns_tiktok,
    address, contact_form_url, contact_email, contact_phone, remarks, download_url,
    business_days, business_start, business_end, closed_days, business_remarks,
    start_date, end_date, start_time, end_time, fee, belongings, target_audience,
    organizer_name, organizer_contact, application_method, venue_remarks,
    business_b_type, business_metadata, created_at,
    media_assets
)
SELECT 
    id, author_id, type, l1, l2, l3_label, title, lead_text, body_text,
    homepage, related1_url, related1_title, related2_url, related2_title, ec_site,
    sns_instagram, sns_facebook, sns_x, sns_line, sns_tiktok,
    address, contact_form_url, contact_email, contact_phone, remarks, download_url,
    business_days, business_start, business_end, closed_days, business_remarks,
    start_date, end_date, start_time, end_time, fee, belongings, target_audience,
    organizer_name, organizer_contact, application_method, venue_remarks,
    business_b_type, business_metadata, created_at,
    json_array(image1, image2, image3, image4, image5, image6)
FROM contents;

-- 5. Swap the tables
DROP TABLE contents;
ALTER TABLE contents_new RENAME TO contents;
