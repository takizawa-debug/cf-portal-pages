export const formStyles = `
  /* 基盤デザイン */
  .lz-form-wrap { padding: 20px 0px 60px !important; background: #fff; max-width: 1000px; margin: 0 auto; font-family: sans-serif; color: #333; }
  .lz-form-tabs { display: flex; gap: 4px; margin-bottom: 30px; border-bottom: 2px solid #f0f0f0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .lz-form-tab { padding: 16px 12px; cursor: pointer; font-weight: 800; font-size: 1.15rem; color: #aaa; flex: 1; text-align: center; border-bottom: 4px solid transparent; transition: 0.3s; white-space: nowrap; }
  .lz-form-tab.is-active { color: #cf3a3a; border-bottom-color: #cf3a3a; }
  
  .lz-form-body { display: none; flex-direction: column; gap: 32px; }
  .lz-form-body.is-active { display: flex; animation: lz-fade 0.4s ease; }
  @keyframes lz-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; } }

  /* 🍎 大項目のデザイン変更：縦線から水平ライン区切りへ */
  .lz-section-head { 
    font-size: 1.7rem; 
    font-weight: 900; 
    color: #5b3a1e; 
    padding: 10px 0; 
    margin: 60px 0 25px; 
    line-height: 1.4;
    border-bottom: 2px solid #eee; /* ベースとなる薄いグレーの横線 */
    position: relative;
    display: flex;
    align-items: center;
  }
  
  /* 赤いアクセントラインを下に重ねる */
  .lz-section-head::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 120px;
    height: 5px;
    background: #cf3a3a;
    border-radius: 2px;
  }
  .lz-field { display: flex; flex-direction: column; gap: 12px; }
  .lz-label { font-size: 1.25rem; font-weight: 800; color: #5b3a1e; display: flex; align-items: center; gap: 10px; }
  .lz-badge { font-size: 0.85rem; background: #cf3a3a; color: #fff; padding: 4px 10px; border-radius: 4px; font-weight: 900; }
  .lz-badge.opt { display: none !important; }
  
/* 🍎 入力項目全般：高さを58pxで統一し、中央寄せにする */
.lz-input, .lz-select { 
  padding: 0 16px !important; 
  border: 2px solid #eee; 
  border-radius: 12px; 
  font-size: 1.15rem; 
  background: #fafafa; 
  width: 100%; 
  box-sizing: border-box; 
  -webkit-appearance: none; 
  height: 58px !important; 
  line-height: 54px; 
}

/* 🍎 登録内容の選択プルダウンを特大＆強調にする */
  #art_type_select {
    font-size: 1.4rem !important; /* 一回り大きく */
    font-weight: 900 !important;   /* 極太にして視認性アップ */
    color: #5b3a1e;               /* 文字色をメインカラーに */
    border: 3px solid #eee;       /* 枠線を少し太く */
  }

  /* 選択肢（中身）の文字サイズ（※ブラウザにより反映状況が異なります） */
  #art_type_select option {
    font-size: 1.2rem;
    font-weight: normal;
  }

/* 🍎 日付入力（開始日・終了日）：アイコンと文字のズレを強制補正 */
input[type="date"].lz-input {
  display: inline-flex !important;
  align-items: center !important;
}

/* 🍎 textarea：複数行のため高さは自動、パディングは上下にも入れる */
.lz-textarea { 
  padding: 16px !important; /* 上下左右に余白を戻す */
  border: 2px solid #eee; 
  border-radius: 12px; 
  font-size: 1.15rem; 
  background: #fafafa; 
  width: 100%; 
  box-sizing: border-box; 
  height: auto !important; 
  min-height: 80px; 
}

  .lz-input:focus, .lz-textarea:focus, .lz-select:focus { border-color: #cf3a3a; background: #fff; outline: none; box-shadow: 0 0 0 4px rgba(207, 58, 58, 0.1); }

/* 🍎 カテゴリー・チップ選択の最終確定スタイル */
.lz-choice-flex { 
  display: flex !important; 
  flex-wrap: wrap !important; 
  justify-content: flex-start !important; 
  align-items: flex-start !important;
  gap: 6px !important; 
  width: 100% !important;
  text-align: left !important; 
  margin: 0 !important;
  padding: 0 !important;
}

.lz-choice-item { 
  position: relative !important; 
  cursor: pointer !important; 
  display: block !important; 
  width: auto !important; 
  flex: 0 0 auto !important; 
  margin: 0 !important; 
  padding: 0 !important;
}

.lz-choice-inner { 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 10px 18px; 
  background: #fff; 
  border: 1px solid #eee; 
  border-radius: 12px;
  font-size: 1.1rem; 
  font-weight: 800; 
  color: #666; 
  min-height: 50px; 
  box-sizing: border-box;
}
  .lz-choice-item input { position: absolute; opacity: 0; pointer-events: none; }
  .lz-choice-item input:checked + .lz-choice-inner { background: #cf3a3a; border-color: #cf3a3a; color: #fff; }

  /* 登録タイプ選択：文字に合わせて最小幅を微調整 */
  .lz-choice-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, auto)); gap: 8px; width: 100%; }

  /* 🍎 サブカテゴリーエリアの改善 */
  .lz-dynamic-sub-area { display: none; flex-direction: column; gap: 18px; padding: 15px 0 15px 15px; background: transparent; border-left: 6px solid #5b3a1e; margin: 12px 0; animation: lz-fade 0.3s ease; }
  .lz-sub-choice-item .lz-choice-inner { min-height: 44px; padding: 8px 18px; border-radius: 30px; font-size: 1.05rem; }
  .lz-sub-choice-item input:checked + .lz-choice-inner { background: #5b3a1e; border-color: #5b3a1e; }
  .lz-sub-other-field { display: none; margin-top: 5px; }

  /* 🍎 営業時間：スマホでの切れ防止・ラベル化 */
  .lz-time-row { display: flex; flex-direction: column; gap: 14px; width: 100%; }
  .lz-time-field { display: flex; align-items: center; gap: 12px; }
  .lz-time-label-sm { font-size: 1rem; font-weight: 800; color: #888; min-width: 85px; }
  .lz-time-box { display: flex; align-items: center; gap: 6px; width: fit-content !important; }
  .lz-time-select { padding: 14px 6px; border-radius: 10px; border: 2px solid #eee; font-size: 1.2rem; cursor: pointer; background: #fff; width: 110px !important; text-align: center; }
  .lz-time-box.is-disabled { opacity: 0.2; pointer-events: none; }

  /* 曜日チップ：サイズを50pxにアップ */
.lz-day-selector { 
  display: flex !important; 
  flex-wrap: wrap !important; 
  gap: 4px !important; 
  justify-content: flex-start !important; 
  width: 100% !important;
  margin-top: 8px;
  margin-bottom: 25px !important;
}

.lz-day-chip { 
  position: relative !important; 
  cursor: pointer !important;
  margin: 0 !important; 
  padding: 0 !important;
  flex: 0 0 auto !important;
}
  .lz-day-chip input { position: absolute; opacity: 0; }
  .lz-day-text { display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: #fff; border: 2px solid #eee; border-radius: 50%; font-weight: 800; font-size: 1.1rem; color: #888; transition: 0.2s; }
  .lz-day-chip input:checked + .lz-day-text { background: #cf3a3a; border-color: #cf3a3a; color: #fff; }

  /* 🍎 スケジュール・テーブル：文字サイズアップ */
  .lz-dynamic-detail { display: none; flex-direction: column; gap: 24px; padding: 0; background: transparent; border: none; }
  .lz-schedule-container { width: 100%; box-sizing: border-box; }
  .lz-schedule-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; }
  .lz-schedule-table th, .lz-schedule-table td { padding: 14px 18px; border: 1px solid #eee; text-align: center; font-size: 1.1rem; }
  .lz-schedule-table th { background: #fdfaf8; color: #5b3a1e; font-weight: 800; font-size: 1.05rem; }

  @media (max-width: 600px) {
    .lz-schedule-table, .lz-schedule-table tr, .lz-schedule-table td { display: block; width: 100%; border: none; box-sizing: border-box; }
    .lz-schedule-table thead { display: none; }
    .lz-schedule-table tr { border: 2px solid #f0e6e0; border-radius: 16px; padding: 15px; margin-bottom: 15px; background: #fff; }
    .lz-schedule-table td { position: relative; padding: 10px 0 10px 110px; text-align: left; min-height: 52px; display: flex; align-items: center; }
    .lz-schedule-table td::before { content: attr(data-label); position: absolute; left: 10px; font-weight: 900; color: #5b3a1e; font-size: 1rem; width: 95px; }
    .lz-schedule-table td:first-child { padding: 0; margin-bottom: 12px; font-size: 1.25rem; color: #cf3a3a; border-bottom: 2px solid #fdfaf8; padding-bottom: 10px; font-weight: 800; }
    .lz-schedule-table td:first-child::before { display: none; }
  }

  /* 🍎 画像プレビュー（正方形・×ボタン） */
  .lz-img-preview-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px; }
  .lz-img-container { position: relative; width: 110px; height: 110px; }
  .lz-img-container img { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; border: 2px solid #eee; }
  .lz-img-remove { 
    position: absolute; top: -8px; right: -8px; width: 28px; height: 28px; 
    background: #cf3a3a; color: #fff; border-radius: 50%; 
    display: flex; align-items: center; justify-content: center; 
    font-size: 18px; cursor: pointer; border: 2px solid #fff; font-weight: bold; 
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  }
  .lz-img-add-btn { 
    width: 110px; height: 110px; border: 2px dashed #ccc; border-radius: 12px; 
    display: flex; align-items: center; justify-content: center; 
    font-size: 32px; color: #999; cursor: pointer; transition: 0.3s; background: #fafafa;
  }
  .lz-img-add-btn:hover { border-color: #cf3a3a; color: #cf3a3a; background: #fff; }

  /* styles.js の .lz-zip-btn を検索して書き換え */
.lz-zip-btn { 
  background: #5b3a1e; 
  color: #fff; 
  border: none; 
  padding: 0 18px; 
  border-radius: 12px; 
  font-weight: 800; 
  cursor: pointer; 
  height: 58px; 
  font-size: 1.15rem; 
  display: flex;          /* 🍎 追加 */
  align-items: center;    /* 🍎 追加 */
  justify-content: center; /* 🍎 追加 */
}
  .lz-send-btn { background: #cf3a3a; color: #fff; padding: 24px; border: none; border-radius: 99px; font-weight: 900; font-size: 1.5rem; cursor: pointer; transition: 0.4s; margin-top: 60px; width: 100%; box-shadow: 0 10px 25px rgba(207, 58, 58, 0.2); }
  
  .lz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  @media (max-width: 600px) { .lz-grid { grid-template-columns: 1fr; } }

  /* 🍎 事務局代行：標準的なチェックボックス形式のスタイル */
  .lz-checkbox-label {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    font-size: 1.15rem;
    font-weight: 800;
    color: #5b3a1e;
    background: #fdfaf8; /* わずかに色をつけて目立たせる */
    padding: 16px;
    border-radius: 12px;
    border: 2px solid #eee;
    transition: 0.3s;
  }
  .lz-checkbox-label:hover { border-color: #cf3a3a; }
  .lz-checkbox-input {
    width: 24px;
    height: 24px;
    accent-color: #cf3a3a; /* チェックの色をテーマカラーに */
    cursor: pointer;
    flex-shrink: 0;
  }

  /* 🍎 非公開エリアの境界線デザイン（絵文字なし版） */
  .lz-private-boundary {
    margin: 100px 0 50px; /* 前後の余白をさらに広げて区切りを強調 */
    position: relative;
    text-align: center;
    border-top: 2px dashed #bbb; /* 少し濃いめのグレーの点線 */
  }

  .lz-private-label {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    padding: 0 25px;
    color: #888;
    font-weight: 800;
    font-size: 1.1rem;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  /* 🍎 確認モーダルのスタイル */
  .lz-confirm-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: none; align-items: center; justify-content: center; z-index: 10000; padding: 20px; backdrop-filter: blur(4px); }
  .lz-confirm-modal { background: #fff; width: 100%; max-width: 600px; max-height: 90vh; border-radius: 24px; display: flex; flex-direction: column; overflow: hidden; animation: lz-modal-up 0.3s ease; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
  @keyframes lz-modal-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .lz-confirm-head { padding: 24px; background: #fdfaf8; border-bottom: 1px solid #eee; text-align: center; }
  .lz-confirm-title { font-size: 1.4rem; font-weight: 900; color: #5b3a1e; }
  .lz-confirm-body { padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; }
  .lz-modal-item { display: flex; flex-direction: column; gap: 4px; padding-bottom: 12px; border-bottom: 1px dashed #eee; }
  .lz-modal-label { font-size: 0.9rem; color: #888; font-weight: 800; }
  .lz-modal-value { font-size: 1.1rem; color: #333; font-weight: 700; white-space: pre-wrap; line-height: 1.5; }
  .lz-confirm-foot { padding: 24px; display: grid; grid-template-columns: 1fr 1.5fr; gap: 12px; background: #fdfaf8; border-top: 1px solid #eee; }
  .lz-btn-back { background: #eee; color: #666; padding: 16px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; transition: 0.2s; }
  .lz-btn-go { background: #cf3a3a; color: #fff; padding: 16px; border-radius: 12px; border: none; font-weight: 900; font-size: 1.1rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(207, 58, 58, 0.3); }
  .lz-btn-back:hover { background: #ddd; }
  .lz-btn-go:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(207, 58, 58, 0.4); }
`;