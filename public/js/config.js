/* --- config.js (多言語対応・辞書統合版) --- */
window.LZ_CONFIG = {
  // ① GASエンドポイント (検索エンドポイントも統合)
  ENDPOINT: "/api/frontend",
  SEARCH_ENDPOINT: "/api/frontend",

  // ② アナリティクス
  ANALYTICS: {
    ENDPOINT: "https://script.google.com/macros/s/AKfycbyMsHN1c9KSk3DUfU94Z7Axr18-8TYAEOWuJSGh3_upEFNAAc4Z9PmrA3uXbbRoGACXSg/exec",
    VISITOR_COOKIE: "apz_vid_v1",
    VISITOR_LSKEY: "apz_vid_ls_v1",
    SESSION_TTL: 30 * 60 * 1000
  },

  // ③ 共通アセット
  ASSETS: {
    LOGO_WHITE: "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca7ecd0-96ba-013e-3700-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E7%99%BD.png",
    LOGO_RED: "https://s3-ap-northeast-1.amazonaws.com/s3.peraichi.com/userData/cadd36d5-015f-4440-aa3c-b426c32c22a0/img/8ca4e300-96ba-013e-36ff-0a58a9feac02/%E3%82%8A%E3%82%93%E3%81%93%E3%82%99%E3%83%AD%E3%82%B3%E3%82%99_%E8%B5%A4.png"
  },

  // ④ ナビゲーション設定
  MENU_ORDER: ["知る", "味わう", "暮らす", "体験する", "営む"],
  MENU_URL: {
    "知る": "/discover",
    "味わう": "/savor",
    "暮らす": "/lifestyle",
    "体験する": "/experience",
    "営む": "/business"
  },

  // ⑤ フッター用設定
  FOOTER_LINKS: [
    { label: "お問い合わせ", url: "/contact" },
    { label: "サイトマップ", url: "/site-map" },
    { label: "サイトポリシー", url: "/site-policy" },
    { label: "個人情報保護方針", url: "/privacy-policy" }
  ],
  COPYRIGHT: "© 2026 Iizuna Town All Rights Reserved.",

  // ⑥ 多言語設定
  LANG: {
    DEFAULT: "ja",
    SUPPORTED: ["ja", "en", "zh"],
    LABELS: {
      ja: "日本語",
      en: "English",
      zh: "繁體中文"
    },
    // 固定文言の辞書データ（検索・モーダル・全ラベル統合版）
    I18N: {
      ja: {
        "知る": "知る", "味わう": "味わう", "体験する": "体験する", "暮らす": "暮らす", "営む": "営む",
        "お問い合わせ": "お問い合わせ", "サイトマップ": "サイトマップ", "サイトポリシー": "サイトポリシー", "個人情報保護方針": "個人情報保護方針",
        "一覧へ戻る": "一覧へ戻る", "詳しく見る": "詳しく見る", "詳しくはこちら": "詳しくはこちら",
        "サイト内記事検索": "サイト内記事検索", "何をお探しですか？": "何をお探しですか？", "おすすめキーワード": "おすすめキーワード",
        "検索しています...": "検索しています...", "見つかりませんでした": "見つかりませんでした",

        "住所": "住所",
        "問い合わせ電話": "問い合わせ電話",
        "問い合わせメール": "問い合わせメール",
        "問い合わせフォーム": "問い合わせフォーム",
        "営業曜日": "営業曜日",
        "定休日": "定休日",
        "営業時間": "営業時間",
        "営業注意事項": "営業注意事項",
        "開催日": "開催日",
        "開催時間": "開催時間",
        "参加費": "参加費",
        "対象": "対象",
        "申し込み方法": "申し込み方法",
        "もちもの": "もちもの",
        "会場注意事項": "会場注意事項",
        "備考": "備考",
        "主催者名": "主催者名",
        "主催者連絡先": "主催者連絡先",

        "共有": "共有", "保存": "保存", "印刷": "印刷", "閉じる": "閉じる",
        "共有テキストをコピーしました！": "共有テキストをコピーしました！",
        "PDFを作成して新しいタブで開きます。よろしいですか？": "PDFを作成して新しいタブで開きます。よろしいですか？",
        "PDF生成に失敗しました。": "PDF生成に失敗しました。",
        "本PDFデータは飯綱町産りんごPR事業の一環で作成されました。": "本PDFデータは飯綱町産りんごPR事業の一環で作成されました。",
        "search_res_title": "「{0}」に関連する情報",
        "back_to_article": "← 記事に戻る",
        "searching": "検索しています...",
        "not_found": "見つかりませんでした",
        "hashtags": "#いいづなりんご #飯綱町"
      },
      en: {
        "知る": "Discover", "味わう": "Savor", "体験する": "Experience", "暮らす": "Lifestyle", "営む": "Business",
        "お問い合わせ": "Contact Us", "サイトマップ": "Sitemap", "サイトポリシー": "Site Policy", "個人情報保護方針": "Privacy Policy",
        "一覧へ戻る": "Back to List", "詳しく見る": "Read More", "詳しくはこちら": "Click here for details",
        "サイト内記事検索": "Article Search", "何をお探しですか？": "What are you looking for?", "おすすめキーワード": "Recommended Keywords",
        "検索しています...": "Searching...", "見つかりませんでした": "No results found",

        "住所": "Address",
        "問い合わせ電話": "Inquiry Phone",
        "問い合わせメール": "Inquiry Email",
        "問い合わせフォーム": "Inquiry Form",
        "営業曜日": "Business Days",
        "定休日": "Closed",
        "営業時間": "Hours",
        "営業注意事項": "Business Notes",
        "開催日": "Event Date",
        "開催時間": "Event Time",
        "参加費": "Fee",
        "対象": "Target",
        "申し込み方法": "How to apply",
        "もちもの": "What to bring",
        "会場注意事項": "Venue Notes",
        "備考": "Notes",
        "主催者名": "Organizer",
        "主催者連絡先": "Organizer Contact",

        "共有": "Share", "保存": "Save", "印刷": "Print", "閉じる": "Close",
        "共有テキストをコピーしました！": "Copied sharing text!",
        "PDFを作成して新しいタブで開きます。よろしいですか？": "Create PDF and open in a new tab. Are you sure?",
        "PDF生成に失敗しました。": "Failed to generate PDF.",
        "本PDFデータは飯綱町産りんごPR事業の一環で作成されました。": "This PDF data was created as part of the Iizuna Town apple PR project.",
        "search_res_title": "Information related to \"{0}\"",
        "back_to_article": "← Back to Article",
        "searching": "Searching...",
        "not_found": "No results found.",
        "hashtags": "#IizunaApples #IizunaTown #NaganoJapan"
      },
      zh: {
        "知る": "探索", "味わう": "品味", "体験する": "體驗", "暮らす": "生活", "営む": "經營",
        "お問い合わせ": "聯絡我們", "サイトマップ": "網站地圖", "サイトポリシー": "網站政策", "個人情報保護方針": "隱私政策",
        "一覧へ戻る": "回到列表", "詳しく見る": "查看詳情", "詳しくはこちら": "詳情請點此",
        "サイト内記事検索": "站內文章搜尋", "何をお探しですか？": "您在尋找什麼？", "おすすめキーワード": "推薦關鍵字",
        "検索しています...": "正在搜尋...", "見つかりませんでした": "未找到結果",

        "住所": "地址",
        "問い合わせ電話": "聯絡電話",
        "問い合わせメール": "聯絡電子郵件",
        "問い合わせフォーム": "聯絡表單",
        "営業曜日": "營業日",
        "定休日": "定休日",
        "営業時間": "營業時間",
        "営業注意事項": "營業注意事項",
        "開催日": "舉辦日期",
        "開催時間": "舉辦時間",
        "参加費": "參加費用",
        "対象": "對象",
        "申し込み方法": "報名方法",
        "もちもの": "攜帶物品",
        "会場注意事項": "會場注意事項",
        "備考": "備註",
        "主催者名": "主辦單位",
        "主催者連絡先": "主辦單位聯絡方式",

        "共有": "分享", "保存": "保存", "列印": "列印", "閉じる": "關閉",
        "共有テキストをコピーしました！": "已複製分享文字！",
        "PDFを作成して新しいタブで開きます。よろしいですか？": "將建立 PDF 並在全分頁開啟。確定嗎？",
        "PDF生成に失敗しました。": "PDF 建立失敗。",
        "本PDFデータは飯綱町産りんごPR事業の一環で作成されました。": "本 PDF 資料為飯綱町蘋果推廣事業的一環。",
        "search_res_title": "与“{0}”相关的信息",
        "back_to_article": "← 返回文章",
        "searching": "正在搜索...",
        "not_found": "未找到相关内容",
        "hashtags": "#飯綱蘋果 #飯綱町 #長野旅遊"
      }
    }
  }
};