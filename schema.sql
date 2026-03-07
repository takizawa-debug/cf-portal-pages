DROP TABLE IF EXISTS contents;
DROP TABLE IF EXISTS posts; -- Old table cleanup

CREATE TABLE contents (
    id TEXT PRIMARY KEY,
    type TEXT DEFAULT 'manual', -- 'manual', 'instagram', or 'sheet_import'
    
    -- Japanese
    l1 TEXT,
    l2 TEXT,
    l3_label TEXT,
    title TEXT,
    lead_text TEXT,
    body_text TEXT,
    
    -- English
    l1_en TEXT,
    l2_en TEXT,
    l3_label_en TEXT,
    title_en TEXT,
    lead_text_en TEXT,
    body_text_en TEXT,
    
    -- Chinese (Traditional)
    l1_tw TEXT,
    l2_tw TEXT,
    l3_label_tw TEXT,
    title_tw TEXT,
    lead_text_tw TEXT,
    body_text_tw TEXT,
    
    -- Media
    image1 TEXT,
    image2 TEXT,
    image3 TEXT,
    image4 TEXT,
    image5 TEXT,
    image6 TEXT,
    
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
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
