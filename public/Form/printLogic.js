export const generatePrintHTML = (type, strings, dynamicCategories = []) => {
  const typeConfig = strings.types[type];
  if (!typeConfig) {
    return "<div>Invalid form type.</div>";
  }

  // HTMLビルダ関数群
  const el = (tag, html, className = '') => `<${tag} class="${className}">${html}</${tag}>`;
  const row = (html) => el('div', html, 'field-row');
  const label = (text, req = false) => `
    <div class="field-label">
      ${req ? `<span class="badge-req">${strings.ui.badges.required}</span>` : `<span class="badge-opt">${strings.ui.badges.optional}</span>`}
      ${text}
    </div>`;

  const box = (t = 'text', subtext = '') => `
    <div class="field-input">
      <div class="input-box ${t === 'textarea' ? 'textarea' : t === 'textarea-large' ? 'textarea-large' : ''}"></div>
      ${subtext ? `<div class="sub-text">${subtext}</div>` : ''}
    </div>`;

  const checkboxList = (items) => {
    return `
    <div class="field-input checkbox-grid">
      ${items.map(item => {
      if (typeof item === 'object' && item !== null) {
        // It's a structured category object
        let out = `<div class="checkbox-group">`;
        out += `<div class="checkbox-item" style="font-weight: bold;"><span class="checkbox-box"></span> ${item.label}</div>`;
        if (item.subItems && item.subItems.length > 0) {
          out += `<div class="sub-category-list">`;
          out += `<span style="margin-right: 6px;">※該当するものに丸:</span>`;
          out += item.subItems.map(sub => `<span style="margin-right: 8px;">${sub}</span>`).join('');
          out += `</div>`;
        }
        out += `</div>`;
        return out;
      } else {
        // Standard string item
        return `<div class="checkbox-item"><span class="checkbox-box"></span> ${item}</div>`;
      }
    }).join('')}
    </div>`;
  };

  const radioList = (items) => `
    <div class="field-input checkbox-grid" style="grid-template-columns: repeat(2, 1fr);">
      ${items.map(item => `
        <div class="radio-item"><span class="radio-circle"></span> ${item}</div>
      `).join('')}
    </div>`;

  let html = '';

  // 1. タイトル
  html += el('div', `${typeConfig.label} 登録シート (手書き用)`, 'doc-title');
  html += el('div', `記入日: 　　　年　　月　　日`, 'doc-info');

  // 2. 基本情報セクション
  html += el('div', strings.ui.sections.basic, 'section-title');
  html += row(label(typeConfig.title, true) + box('text'));

  // カテゴリ（選択式）は手で書けるように空欄をいくつか用意
  const catItems = dynamicCategories.length > 0
    ? dynamicCategories
    : ["_______________________", "_______________________", "_______________________", "_______________________", "_______________________", "_______________________"];

  html += row(label(typeConfig.cat_label, true) + checkboxList(catItems));

  html += row(label(typeConfig.lead, true) + box('textarea', '※100文字以内でご記入ください'));
  html += row(label(strings.fields.art_body, true) + box('textarea-large', '※詳しい内容をご記入ください'));

  // 3. 各タイプ固有のセクション
  if (type === 'shop') {
    html += el('div', strings.ui.sections.location, 'section-title');
    html += row(label(strings.fields.shop_zip, true) + box('text'));
    html += row(label(strings.fields.shop_addr, true) + box('textarea'));
    html += row(label("場所に関する注意事項") + box('textarea'));

    html += el('div', strings.ui.sections.shop_detail, 'section-title');
    html += row(
      label(strings.fields.simple_days) +
      checkboxList(strings.lists.days)
    );
    html += row(label(strings.misc.std_biz_hours) + `
      <div class="field-input multi-input-row">
        <div class="input-box"></div> <span class="time-dash">〜</span> <div class="input-box"></div>
      </div>
    `);
    html += row(label(strings.fields.shop_holiday_type) + radioList([
      strings.options.holiday_none, strings.options.holiday_follow,
      strings.options.holiday_open, strings.options.holiday_closed, strings.options.holiday_irregular
    ]));
    html += row(label(strings.fields.shop_notes_biz) + box('textarea'));
  }

  if (type === 'event') {
    html += el('div', strings.ui.sections.location, 'section-title');
    html += row(label(strings.fields.ev_venue_name) + box('text'));

    html += el('div', strings.ui.sections.event_detail, 'section-title');
    html += row(label("開催日（単日なら1つ、期間なら2つ）") + `
      <div class="field-input multi-input-row">
        <div class="input-box"></div> <span class="time-dash">〜</span> <div class="input-box"></div>
      </div>
    `);
    html += row(label("開催時間") + `
      <div class="field-input multi-input-row">
        <div class="input-box"></div> <span class="time-dash">〜</span> <div class="input-box"></div>
      </div>
    `);

    html += el('div', strings.ui.sections.event_more, 'section-title');
    html += row(label(strings.fields.ev_fee) + box('text'));
    html += row(label(strings.fields.ev_items) + box('text'));
    html += row(label(strings.fields.ev_target) + box('text'));
  }

  if (type === 'farmer') {
    html += el('div', strings.ui.sections.producer_head, 'section-title');
    html += row(label(strings.fields.pr_variety) + box('textarea'));
    html += row(label(strings.fields.pr_product) + box('textarea'));

    html += el('div', strings.ui.sections.producer_biz, 'section-title');
    html += row(label("作付面積 / 単位") + `
      <div class="field-input multi-input-row">
        <div class="input-box" style="flex:2;"></div> <div class="input-box" style="flex:1;">アール / ha / 反など</div>
      </div>
    `);
    html += row(label(strings.fields.pr_staff) + box('text'));
    html += row(label(strings.fields.pr_other_crops) + checkboxList([
      strings.options.crop_fruit, strings.options.crop_rice, strings.options.crop_soba,
      strings.options.crop_veg, strings.options.crop_other
    ]));
    html += row(label("その他の作物品目名等") + box('text'));
    html += row(label(strings.fields.pr_rep_name) + box('text'));
    html += row(label(strings.fields.pr_invoice_num) + box('text', '※インボイス登録がある場合はTから始まる番号'));
  }

  // 4. リンク類と連絡先
  html += el('div', strings.ui.sections.links, 'section-title');
  html += row(label("関連リンク1 (URL・タイトル)") + box('textarea'));
  html += row(label("SNSアカウントやHPなど") + box('textarea', '※必要に応じてアカウントIDやURLをご記入ください'));

  html += el('div', strings.ui.sections.inquiry_head, 'section-title');
  if (type === 'event') {
    html += row(label(strings.fields.ev_org_name, true) + box('text'));
  }
  html += row(label(strings.fields.cm_method) + checkboxList([
    strings.options.cm_form, strings.options.cm_email, strings.options.cm_tel, "その他"
  ]));
  html += row(label("公開用の連絡先・URL等") + box('textarea'));
  html += row(label(strings.fields.cm_notes) + box('textarea'));

  // 5. 非公開情報
  html += `<div class="private-boundary"><span class="private-label">${strings.ui.sections.private_boundary}</span></div>`;
  html += el('div', strings.ui.sections.private_admin, 'section-title');
  html += row(label(strings.fields.cont_name, true) + box('text'));
  html += row(label(strings.fields.admin_email, true) + box('text'));
  html += row(label("代行作成の希望", false) + checkboxList(["紹介文の作成を事務局に任せる"]));
  html += row(label(strings.fields.admin_msg, false) + box('textarea'));

  return html;
}
