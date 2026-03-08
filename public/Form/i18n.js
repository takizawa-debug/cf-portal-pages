/**
 * i18n.js - 多言語対応（日・英・中）完全網羅辞書 (リファクタリング・最終FIX版)
 * labels: フォーム各項目のラベル用
 * options: フォーム選択肢（checkbox, radio）の値の表示用
 * links: リンクとSNS入力欄の定義用
 */

const resources = {
  ja: {
    ui: {
      tabs: { report: "情報提供", inquiry: "お問い合わせ", article: "記事投稿" },
      badges: { required: "必須", optional: "任意", private: "非公開" },
      sections: {
        category: "登録内容の選択", basic: "基本情報", images: "画像・配布資料",
        location: "場所の情報", shop_detail: "営業に関する情報", event_detail: "開催日時",
        event_more: "開催詳細", producer_head: "栽培品種・加工品", producer_biz: "栽培・経営について",
        links: "各種リンク", inquiry_head: "問い合わせ先", notes_head: "備考",
        private_boundary: "ここからは非公開情報です", private_admin: "事務局への連絡（非公開）"
      },
      buttons: {
        zip_search: "住所検索",
        send: "この内容で送信する",
        sending: "送信中...",
        back: "修正する",
        confirm: "この内容で送信する",
        add_image: "＋"
      },
      common: {
        sync_label: "掲載用メールアドレスと同じにする",
        assist_label: "【文章作成が苦手な方へ】紹介文（概要・本文）の作成を事務局に任せる",
        assist_note: "⚠️ 注意事項：文章作成を委任する場合、内容がわかるHP・SNSのURL入力、またはチラシ画像・資料の添付を必ずお願いします。",
        confirm_title: "入力内容の確認",
        yes: "はい",
        no: "いいえ",
        other: "その他",
        day_suffix: "曜日"
      },
      status: { loading_cat: "カテゴリーを取得中...", error_cat: "カテゴリーの取得に失敗しました。" },
      alerts: {
        zip_empty: "郵便番号を入力してください",
        zip_invalid: "郵便番号を7桁で入力してください",
        address_not_found: "住所が見つかりませんでした",
        send_error: "送信に失敗しました"
      },
    },
    // Input Fields (name attributes mapped to labels)
    fields: {
      rep_name: "お名前", rep_content: "内容",
      inq_name: "お名前", inq_email: "メールアドレス", inq_content: "内容",
      art_type: "登録内容",
      art_title: "タイトル",
      art_lead: "概要・リード",
      art_body: "詳細本文",
      art_images: "画像（最大6枚）",
      art_file: "資料（PDF,Word,Excel,PowerPoint等）",
      art_memo: "補足情報",

      // Shop
      shop_zip: "郵便番号", shop_addr: "住所", shop_notes: "場所に関する注意事項",
      shop_mode: "営業日設定", shop_holiday_type: "祝日の営業",
      shop_notes_biz: "営業に関する注意事項",
      simple_days: "営業曜日",

      // Event
      ev_venue_name: "会場名",
      ev_period_type: "期間設定",
      ev_sdate: "開催日（開始日）", ev_edate: "終了日",
      ev_stime: "開始時刻", ev_etime: "終了時刻",
      ev_org_name: "主催者名", ev_fee: "参加費",
      ev_items: "参加者のもちもの", ev_target: "対象",

      // Farmer
      pr_variety: "栽培している品種", pr_product: "扱っている加工品",
      pr_area: "作付面積（りんご）", pr_area_unit: "単位",
      pr_staff: "従業員数", pr_other_crops: "りんご以外の栽培品目",
      pr_biz_type: "経営区分", pr_rep_name: "代表者名",
      pr_invoice: "インボイス登録", pr_invoice_num: "登録番号",

      // Contact
      cm_method: "問い合わせ方法",
      cm_url: "掲載用問い合わせフォームURL",
      cm_mail: "掲載用メールアドレス",
      cm_tel: "掲載用電話番号",
      cm_other: "その他の受付方法",
      cm_notes: "問い合わせに関する注意事項",

      // Admin
      cont_name: "投稿者・団体名",
      admin_email: "連絡用メールアドレス",
      admin_msg: "事務局への連絡事項",
      writing_assist: "事務局代行希望",

      // Dynamic Logic Labels
      cat_l1: "カテゴリー（大）",
      genre_free: "カテゴリーの詳細（自由記述）",
      cat_root_other_val: "カテゴリーの詳細（自由記述）",
      link_trigger: "表示するリンク・SNSの選択",

      // Related Links
      rel_url: "関連リンクURL", rel_title: "関連リンクのタイトル"
    },
    // Dynamic Labels & Placeholders
    types: {
      shop: { label: "お店の登録", title: "店名・施設名", lead: "お店の概要", cat_label: "お店のカテゴリを選択してください" },
      event: { label: "イベントの登録", title: "イベント名", lead: "イベントの概要", cat_label: "イベントのカテゴリを選択してください" },
      farmer: { label: "生産者の登録", title: "農園・団体名", lead: "生産者の概要", cat_label: "取り組みを選択してください" },
      other: { label: "記事の登録", title: "記事タイトル", lead: "記事の概要", cat_label: "記事のカテゴリを選択してください" }
    },
    placeholders: {
      rep_name: "ニックネーム可", rep_content: "町の発見を教えてください",
      art_type_unselected: "▼ 登録する内容を選択してください（未選択）",
      art_lead: "内容を一言で表すと？",
      art_body: "詳しい内容を教えてください",
      art_memo: "その他、補足情報があれば自由にご記入ください",
      limit_100: "（100文字以内）",

      ev_venue: "例：飯綱ふれあいパーク", zip: "389-1211", address: "",
      shop_notes: "注意事項があればご記入ください",
      shop_biz_notes: "（例）毎月最終月曜日は定休日です。ランチは売切次第終了。最新情報は公式Instagramをご確認ください。",

      ev_fee: "無料、500円 など", ev_items: "筆記用具、室内履き など", ev_target: "町内在住の方、小学生以上 など",
      ev_org: "個人名、または団体名",

      pr_variety: "その他の品種を具体的に記入", pr_product: "その他の加工品を具体的に記入",
      pr_area: "数値", pr_staff: "人数（専従・パート含む）",
      pr_fruit: "具体的な果物名をご記入ください", pr_veg: "具体的な野菜名をご記入ください", pr_other: "具体的な内容をご記入ください",
      pr_rep: "氏名をご記入ください", pr_invoice: "T1234567890123",

      cm_mail: "info@example.com", cm_tel: "026-...", cm_other: "窓口へ直接、など",
      cm_notes: "（例）対応時間は平日10:00〜17:00です。土日は電話が繋がりません。",

      admin_email: "example@mail.com",
      genre_detail: "具体的な内容をご記入ください", genre_free: "具体的にご記入ください"
    },
    options: {
      mode_simple: "標準設定", mode_custom: "曜日別設定",
      holiday_none: "設定しない（未回答）", holiday_follow: "曜日どおり営業 / 定休",
      holiday_open: "祝日は営業", holiday_closed: "祝日は休業", holiday_irregular: "不定休・特別ダイヤ",
      period_single: "1日のみ", period_range: "期間あり",

      unit_a: "a（アール）", unit_ha: "ha（ヘクタール）", unit_tan: "反", unit_cho: "町", unit_m2: "㎡", unit_tsubo: "坪",

      crop_fruit: "りんご以外の果物", crop_rice: "米", crop_soba: "そば", crop_veg: "野菜類", crop_other: "その他",

      pr_biz_indiv: "個人事業", pr_biz_corp: "法人",
      invoice_yes: "登録あり", invoice_no: "登録なし",

      cm_form: "WEBフォーム", cm_email: "メール", cm_tel: "電話番号",

      // Manual values
      individual: "個人事業", corp: "法人",
      none: "設定しない（未回答）", follow_regular: "曜日どおり営業 / 定休", always_open: "祝日は営業", always_closed: "祝日は休業", irregular: "不定休・特別ダイヤ",
      fruit: "りんご以外の果物", rice: "米", soba: "そば", veg: "野菜類",
      yes: "はい", no: "いいえ", on: "はい",
      a: "a（アール）", ha: "ha（ヘクタール）", tan: "反", cho: "町", m2: "㎡", tsubo: "坪"
    },
    links: {
      home: { label: "公式ホームページ", placeholder: "https://..." },
      ec: { label: "オンラインショップ", placeholder: "https://..." },
      ig: { label: "Instagram", placeholder: "@ユーザーネーム または プロフィールURL" },
      fb: { label: "Facebook", placeholder: "プロフィールURL" },
      x: { label: "X (旧Twitter)", placeholder: "@ユーザーネーム または プロフィールURL" },
      line: { label: "LINE公式アカウント", placeholder: "LINE ID または プロフィールURL" },
      tt: { label: "TikTok", placeholder: "@ユーザーネーム または プロフィールURL" },
      rel: { label: "関連リンク記事", placeholder: "" }
    },
    lists: {
      days: ["月", "火", "水", "木", "金", "土", "日"]
    },
    misc: {
      std_biz_hours: "標準営業時間", open_time: "営業開始", close_time: "営業終了",
      day: "曜日", closed: "休業",
      genre_suffix: "のジャンル",
      other_venue_name: "関連する場所の名称",
      hour: "時",
      minute: "分"
    }
  },
  en: {
    ui: {
      tabs: { report: "Report", inquiry: "Inquiry", article: "Post Article" },
      badges: { required: "Required", optional: "Optional", private: "Private" },
      sections: {
        category: "Select Type", basic: "Basic Info", images: "Images & Docs",
        location: "Location", shop_detail: "Business Info", event_detail: "Event Dates",
        event_more: "Event Details", producer_head: "Crops & Products", producer_biz: "Farm Management",
        links: "Links", inquiry_head: "Contact", notes_head: "Notes",
        private_boundary: "Below is Private Information", private_admin: "Admin Message (Private)"
      },
      buttons: {
        zip_search: "Search",
        send: "Submit",
        sending: "Sending...",
        back: "Edit",
        confirm: "Submit",
        add_image: "＋"
      },
      common: {
        sync_label: "Same as public email",
        assist_label: "[Writing Help] Let admin write the description",
        assist_note: "⚠️ Note: If delegating, please provide a URL or materials.",
        confirm_title: "Confirm Your Input",
        yes: "Yes",
        no: "No",
        other: "Other",
        day_suffix: ""
      },
      status: { loading_cat: "Loading categories...", error_cat: "Failed to load categories." },
      alerts: {
        zip_empty: "Please enter a zip code",
        zip_invalid: "Please enter a 7-digit zip code",
        address_not_found: "Address not found",
        send_error: "Failed to send"
      },
    },
    fields: {
      rep_name: "Name", rep_content: "Content",
      inq_name: "Name", inq_email: "Email", inq_content: "Content",
      art_type: "Post Type",
      art_title: "Title",
      art_lead: "Summary / Lead",
      art_body: "Detailed Description",
      art_images: "Images (Max 6)",
      art_file: "Files (PDF,Docs etc.)",
      art_memo: "Supplementary Info",

      shop_zip: "Zip Code", shop_addr: "Address", shop_notes: "Location Notes",
      shop_mode: "Schedule Mode", shop_holiday_type: "Holiday Hours",
      shop_notes_biz: "Business Notes",
      simple_days: "Business Days",

      ev_venue_name: "Venue Name",
      ev_period_type: "Period Settings",
      ev_sdate: "Start Date", ev_edate: "End Date",
      ev_stime: "Start Time", ev_etime: "End Time",
      ev_org_name: "Organizer Name", ev_fee: "Fee",
      ev_items: "Items to Bring", ev_target: "Target Audience",

      pr_variety: "Apple Varieties", pr_product: "Processed Products",
      pr_area: "Planting Area", pr_area_unit: "Unit",
      pr_staff: "Employees", pr_other_crops: "Other Crops",
      pr_biz_type: "Business Category", pr_rep_name: "Farmer Name",
      pr_invoice: "Invoice Registration", pr_invoice_num: "Reg. Number",

      cm_method: "Contact Method",
      cm_url: "Inquiry Form URL",
      cm_mail: "Public Email",
      cm_tel: "Public Phone",
      cm_other: "Other Contact",
      cm_notes: "Contact Notes",

      cont_name: "Poster/Org Name",
      admin_email: "Contact Email",
      admin_msg: "Message to Admin",
      writing_assist: "Writing Assistance",

      cat_l1: "Main Category",
      genre_free: "Category Details",
      cat_root_other_val: "Category Details",
      link_trigger: "Select links/social media",
      rel_url: "Related Link URL", rel_title: "Related Link Title"
    },
    types: {
      shop: { label: "Shop", title: "Shop/Facility Name", lead: "Shop Summary", cat_label: "Features (Multiple)" },
      event: { label: "Event", title: "Event Name", lead: "Event Summary", cat_label: "Genre (Multiple)" },
      farmer: { label: "Farmer", title: "Farm/Group Name", lead: "Farm Summary", cat_label: "Style (Multiple)" },
      other: { label: "Article", title: "Article Title", lead: "Article Summary", cat_label: "Genre (Multiple)" }
    },
    placeholders: {
      rep_name: "Nickname OK", rep_content: "Tell us what you found",
      art_type_unselected: "▼ Please select an option",
      art_lead: "Describe in one sentence.",
      art_body: "Provide details",
      art_memo: "Any other info",
      limit_100: " (Within 100 chars)",

      ev_venue: "e.g., Iizuna Park", zip: "389-1211", address: "",
      shop_notes: "Location notes",
      shop_biz_notes: "e.g., Closed last Mondays.",

      ev_fee: "Free, 500 yen", ev_items: "Shoes etc.", ev_target: "Residents etc.",
      ev_org: "Name",

      pr_variety: "Specify others", pr_product: "Specify others",
      pr_area: "Value", pr_staff: "Count",
      pr_fruit: "Specify fruits", pr_veg: "Specify vegetables", pr_other: "Details",
      pr_rep: "Full Name", pr_invoice: "T1234567890123",

      cm_mail: "info@example.com", cm_tel: "026-...", cm_other: "Direct visit etc.",
      cm_notes: "e.g., Weekdays only",

      admin_email: "example@mail.com",
      genre_detail: "Specific details", genre_free: "Specific details"
    },
    options: {
      mode_simple: "Standard", mode_custom: "By Day",
      holiday_none: "Not set", holiday_follow: "Follow Calendar",
      holiday_open: "Open on Holidays", holiday_closed: "Closed on Holidays", holiday_irregular: "Irregular",
      period_single: "1 Day Only", period_range: "Period",

      unit_a: "a", unit_ha: "ha", unit_tan: "Tan", unit_cho: "Cho", unit_m2: "㎡", unit_tsubo: "Tsubo",

      crop_fruit: "Other Fruit", crop_rice: "Rice", crop_soba: "Soba", crop_veg: "Vegetables", crop_other: "Other",

      pr_biz_indiv: "Individual", pr_biz_corp: "Corporation",
      invoice_yes: "Registered", invoice_no: "Not registered",

      cm_form: "Web Form", cm_email: "Email", cm_tel: "Phone",

      individual: "Individual", corp: "Corporation",
      none: "Not set", follow_regular: "Follow Calendar", always_open: "Open on Holidays", always_closed: "Closed on Holidays", irregular: "Irregular",
      fruit: "Other Fruit", rice: "Rice", soba: "Soba", veg: "Vegetables",
      yes: "Yes", no: "No", on: "Yes",
      a: "a", ha: "ha", tan: "Tan", cho: "Cho", m2: "㎡", tsubo: "Tsubo"
    },
    links: {
      home: { label: "Official Website", placeholder: "https://..." },
      ec: { label: "Online Shop", placeholder: "https://..." },
      ig: { label: "Instagram", placeholder: "@username or URL" },
      fb: { label: "Facebook", placeholder: "URL" },
      x: { label: "X (Twitter)", placeholder: "@username or URL" },
      line: { label: "LINE", placeholder: "ID or URL" },
      tt: { label: "TikTok", placeholder: "@username or URL" },
      rel: { label: "Related Article", placeholder: "" }
    },
    lists: {
      days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    },
    misc: {
      std_biz_hours: "Standard Hours", open_time: "Open", close_time: "Close",
      day: "Day", closed: "Closed",
      genre_suffix: " Genres",
      other_venue_name: "Related Location Name",
      hour: "hr",
      minute: "min"
    }
  },
  zh: {
    ui: {
      tabs: { report: "提供信息", inquiry: "咨询", article: "投稿文章" },
      badges: { required: "必填", optional: "选填", private: "不公开" },
      sections: {
        category: "选择类型", basic: "基本信息", images: "图片及資料",
        location: "地点信息", shop_detail: "营业信息", event_detail: "举办时间",
        event_more: "活动详情", producer_head: "品種与加工品", producer_biz: "经营信息",
        links: "各种链接", inquiry_head: "联系方式", notes_head: "备注",
        private_boundary: "以下为不公开信息", private_admin: "联系事务局（不公开）"
      },
      buttons: {
        zip_search: "搜索",
        send: "提交内容",
        sending: "正在发送...",
        back: "返回修改",
        confirm: "提交",
        add_image: "＋"
      },
      common: {
        sync_label: "与公开邮箱相同",
        assist_label: "【不擅长写作】委托事务局代写文章",
        assist_note: "⚠️ 注意事項：委托代写时，请提供相关网址或資料。",
        confirm_title: "确认输入内容",
        yes: "是",
        no: "否",
        other: "其他",
        day_suffix: ""
      },
      status: { loading_cat: "正在获取类别...", error_cat: "获取类别失败。" },
      alerts: {
        zip_empty: "请输入邮政编码",
        zip_invalid: "请输入7位邮政编码",
        address_not_found: "未找到住址",
        send_error: "发送失败"
      },
    },
    fields: {
      rep_name: "姓名", rep_content: "内容",
      inq_name: "姓名", inq_email: "电子邮箱", inq_content: "内容",
      art_type: "注册内容",
      art_title: "标题",
      art_lead: "摘要 / 导语",
      art_body: "详细内容",
      art_images: "图片（最多6张）",
      art_file: "资料（PDF,Word,Excel,PowerPoint等）",
      art_memo: "补充信息",

      shop_zip: "邮政编码", shop_addr: "详细地址", shop_notes: "地点注意事项",
      shop_mode: "营业日设置", shop_holiday_type: "节假日营业",
      shop_notes_biz: "营业注意事项",
      simple_days: "营业日",

      ev_venue_name: "会场名称",
      ev_period_type: "期间设置",
      ev_sdate: "举办日期", ev_edate: "结束日期",
      ev_stime: "开始时间", ev_etime: "结束时间",
      ev_org_name: "主办方名称", ev_fee: "费用",
      ev_items: "随身物品", ev_target: "对象范围",

      pr_variety: "栽培品種", pr_product: "加工产品",
      pr_area: "种植面积", pr_area_unit: "单位",
      pr_staff: "员工人数", pr_other_crops: "其他品種",
      pr_biz_type: "经营类别", pr_rep_name: "代表人姓名",
      pr_invoice: "发票注册", pr_invoice_num: "注册编号",

      cm_method: "联系方式",
      cm_url: "咨询表单链接",
      cm_mail: "公开邮箱",
      cm_tel: "公开电话",
      cm_other: "其他方式",
      cm_notes: "咨询注意事项",

      cont_name: "投稿者姓名",
      admin_email: "联系邮箱",
      admin_msg: "给事务局的留言",
      writing_assist: "委托代写",

      cat_l1: "主类别",
      genre_free: "类别详情",
      cat_root_other_val: "类别详情",
      link_trigger: "选择要显示的链接",
      rel_url: "相关链接URL", rel_title: "相关链接标题"
    },
    types: {
      shop: { label: "店铺", title: "店名/设施名", lead: "店铺概要", cat_label: "操作内容（多选）" },
      event: { label: "活动", title: "活动名称", lead: "活动概要", cat_label: "活动类型（多選）" },
      farmer: { label: "生产者注册", title: "农园/团体名", lead: "生产者概要", cat_label: "生产/销售风格（多選）" },
      other: { label: "文章", title: "文章标题", lead: "文章概要", cat_label: "文章类型（多選）" }
    },
    placeholders: {
      rep_name: "可填昵称", rep_content: "请告诉我们您的发现",
      art_type_unselected: "▼ 请选择注册内容",
      art_lead: "用一句话概括内容",
      art_body: "请填写详细内容",
      art_memo: "补充信息",
      limit_100: "（100字以内）",

      ev_venue: "例如：饭纲亲睦公园", zip: "389-1211", address: "",
      shop_notes: "有关地点的注意事项",
      shop_biz_notes: "例如：每月最后周一休。售完即止。",

      ev_fee: "免费、500日元等", ev_items: "文具、室内鞋等", ev_target: "居民、小学生等",
      ev_org: "个人或团体名",

      pr_variety: "具体填写其他品種", pr_product: "具体填写其他加工品",
      pr_area: "数值", pr_staff: "员工人数",
      pr_fruit: "具体填写水果名称", pr_veg: "具体填写蔬菜名称", pr_other: "具体填写詳細内容",
      pr_rep: "代表人姓名", pr_invoice: "T1234567890123",

      cm_mail: "info@example.com", cm_tel: "026-...", cm_other: "直接窗口办理等",
      cm_notes: "例如：仅限平日10:00-17:00。",

      admin_email: "example@mail.com",
      genre_detail: "请输入具体内容", genre_free: "请填写具体内容"
    },
    options: {
      mode_simple: "标准设置", mode_custom: "按星期设置",
      holiday_none: "未设置", holiday_follow: "按日历营业/休息",
      holiday_open: "节假日营业", holiday_closed: "节假日休息", holiday_irregular: "不定休/特别时段",
      period_single: "仅限1日", period_range: "期间内",

      unit_a: "a", unit_ha: "ha", unit_tan: "反", unit_cho: "町", unit_m2: "㎡", unit_tsubo: "坪",

      crop_fruit: "其他水果", crop_rice: "大米", crop_soba: "荞麦", crop_veg: "蔬菜", crop_other: "其他",

      pr_biz_indiv: "个人事业", pr_biz_corp: "法人",
      invoice_yes: "已注册", invoice_no: "未注册",

      cm_form: "表单", cm_email: "邮箱", cm_tel: "电话",

      individual: "个人事业", corp: "法人",
      none: "未设置", follow_regular: "按日历营业/休息", always_open: "节假日营业", always_closed: "节假日休息", irregular: "不定休/特别时段",
      fruit: "其他水果", rice: "大米", soba: "荞麦", veg: "蔬菜",
      yes: "是", no: "否", on: "是",
      a: "a", ha: "ha", tan: "反", cho: "町", m2: "㎡", tsubo: "坪"
    },
    links: {
      home: { label: "官方网站", placeholder: "https://..." },
      ec: { label: "网上商店", placeholder: "https://..." },
      ig: { label: "Instagram", placeholder: "@用户名 或 个人资料网址" },
      fb: { label: "Facebook", placeholder: "个人资料网址" },
      x: { label: "X (曾用名Twitter)", placeholder: "@用户名 或 个人资料网址" },
      line: { label: "LINE官方账号", placeholder: "LINE ID 或 个人资料网址" },
      tt: { label: "TikTok", placeholder: "@用户名 或 个人资料网址" },
      rel: { label: "相关文章链接", placeholder: "" }
    },
    lists: {
      days: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
    },
    misc: {
      std_biz_hours: "营业时间", open_time: "开始营业", close_time: "结束营业",
      day: "星期", closed: "休息",
      genre_suffix: " 类型",
      other_venue_name: "相关地点名称",
      hour: "时",
      minute: "分"
    }
  }
};

const getLang = () => {
  const params = new URLSearchParams(window.location.search);
  const lang = params.get('lang');
  if (resources[lang]) return lang;
  const browserLang = navigator.language.split('-')[0];
  return resources[browserLang] ? browserLang : 'ja';
};

export const i18n = resources[getLang()];

