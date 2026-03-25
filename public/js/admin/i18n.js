/* ============================
   Admin UI Internationalization
   ============================ */

const i18n = {
    ja: {
        nav_title: "りんごのまちいいづな 管理サイト",
        menu_content: "記事管理", menu_users: "ユーザー管理", menu_keywords: "SEOキーワード管理", menu_knowledge: "ナレッジベース管理", menu_categories: "カテゴリマスタ管理", menu_apples: "品種管理マスタ", menu_inquiries: "お問い合わせ一覧", menu_media: "メディア管理",
        logout: "ログアウト", panel_content_title: "記事一覧", panel_users_title: "ユーザー一覧", panel_keyword_title: "SEOキーワード管理", panel_knowledge_title: "ナレッジベース", panel_media_title: "メディア管理",
        btn_refresh: "更新", btn_create: "新規作成", btn_create_user: "ユーザー追加", btn_create_keyword: "キーワード追加", btn_create_knowledge: "ドキュメント追加", btn_create_category: "カテゴリ追加", btn_upload_media: "アップロード",
        th_category: "カテゴリ", th_title: "タイトル", th_date: "登録日", th_action: "操作",
        th_userid: "ユーザーID", th_role: "権限", th_created: "作成日",
        th_keyword: "キーワード", th_priority: "重要度", th_doc_title: "ドキュメント名",
        tab_basic: "基本情報", tab_lang: "多言語設定", tab_media: "写真・リンク", tab_contact: "連絡先イベント"
    },
    en: {
        nav_title: "Iizuna Apple Town Admin Dashboard",
        menu_content: "Content", menu_users: "Users", menu_keywords: "Keywords", menu_knowledge: "Knowledge Base", menu_categories: "Categories", menu_apples: "Apple Varieties", menu_inquiries: "Inquiries", menu_media: "Media",
        logout: "Logout", panel_content_title: "Content List", panel_users_title: "User List", panel_keyword_title: "Keywords", panel_knowledge_title: "Knowledge", panel_media_title: "Media Library",
        btn_refresh: "Refresh", btn_create: "Create New", btn_create_user: "Add User", btn_create_keyword: "Add Keyword", btn_create_knowledge: "Add Doc", btn_create_category: "Add Category", btn_upload_media: "Upload",
        th_category: "Category", th_title: "Title", th_date: "Date", th_action: "Action",
        th_userid: "User ID", th_role: "Role", th_created: "Created At",
        th_keyword: "Keyword", th_priority: "Priority", th_doc_title: "Doc Title",
        tab_basic: "Basic Info", tab_lang: "Localization", tab_media: "Media/Links", tab_contact: "Contact/Event"
    },
    zh: {
        nav_title: "飯綱町蘋果 入口網站 管理介面",
        menu_content: "內容管理", menu_users: "用戶管理", menu_keywords: "關鍵字管理", menu_knowledge: "知識庫管理", menu_categories: "類別管理", menu_apples: "蘋果品種管理", menu_inquiries: "諮詢列表", menu_media: "媒體管理",
        logout: "登出", panel_content_title: "文章列表", panel_users_title: "用戶列表", panel_keyword_title: "關鍵字管理", panel_knowledge_title: "知識庫", panel_media_title: "媒體管理",
        btn_refresh: "更新", btn_create: "建立內容", btn_create_user: "新增用戶", btn_create_keyword: "添加關鍵字", btn_create_knowledge: "上傳文檔", btn_create_category: "新增類別", btn_upload_media: "上傳",
        th_category: "類別", th_title: "標題", th_date: "註冊日期", th_action: "操作",
        th_userid: "用戶 ID", th_role: "權限", th_created: "創建日期",
        th_keyword: "關鍵字", th_priority: "重要度", th_doc_title: "文件標題",
        tab_basic: "基本信息", tab_lang: "多語言設置", tab_media: "圖片與鏈接", tab_contact: "聯繫與活動"
    }
};

function changeUILanguage() {
    const lang = document.getElementById('uiLangSelect').value;
    const dict = i18n[lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerText = dict[key];
    });
}
