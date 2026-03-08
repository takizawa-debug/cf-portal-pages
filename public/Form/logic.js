/**
 * logic.js - 制御エンジン（i18n・リファクタリング・最終FIX決定版）
 * 役割：ユーザー操作の検知、UIの動的変更、データの収集、API通信
 */
import { utils } from './utils.js';
import { i18n } from './i18n.js';
import { catLabels } from './templates.js';
import { generatePrintHTML } from './printLogic.js';
import { printStyles } from './printStyles.js';

export async function initFormLogic() {
  const ENDPOINT = "/api/contact";
  const days = i18n.lists.days;
  let currentFetchType = null;
  let uploadedFiles = [];

  const typeSelect = document.getElementById('art_type_select');
  const fieldsContainer = document.getElementById('article-fields-container');
  const lblTitle = document.getElementById('lbl-title');
  const lblLead = document.getElementById('lbl-lead');
  const inpTitle = document.getElementById('inp-title');
  const inpLead = document.getElementsByName('art_lead')[0];
  const inpBody = document.getElementsByName('art_body')[0];

  async function updateTypeView() {
    if (!typeSelect) return;
    const type = typeSelect.value;
    const set = i18n.types[type];
    const url = new URL(window.location);

    if (!type || !set) {
      if (fieldsContainer) fieldsContainer.style.display = 'none';
      url.searchParams.delete('type');
      window.history.replaceState({}, '', url.toString());
      return;
    }

    if (fieldsContainer) fieldsContainer.style.display = 'flex';
    url.searchParams.set('type', type);
    window.history.replaceState({}, '', url.toString());

    const lblDynCat = document.getElementById('lbl-dynamic-cat');
    if (lblDynCat) lblDynCat.textContent = catLabels[type];

    const btnPrintPdf = document.getElementById('btn-print-pdf');
    if (btnPrintPdf) {
      btnPrintPdf.style.display = 'none'; // Temporarily hide print button while fetching categories
    }

    lblTitle.textContent = set.title;
    lblLead.textContent = set.lead;
    inpLead.placeholder = set.leadPlaceholder || i18n.placeholders.art_lead;
    inpTitle.placeholder = i18n.placeholders.art_title || set.title;
    inpBody.placeholder = i18n.placeholders.art_body;
    if (document.getElementById('art_memo')) document.getElementById('art_memo').placeholder = i18n.placeholders.art_memo;
    if (document.getElementById('lbl-notes')) document.getElementById('lbl-notes').textContent = set.notes;

    const toggle = (id, cond) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = cond ? 'flex' : 'none';
        el.querySelectorAll('input, textarea, select').forEach(f => {
          if (cond) { if (f.dataset.needed === "true") f.required = true; }
          else { if (f.required) f.dataset.needed = "true"; f.required = false; }
        });
      }
    };

    toggle('pane-shop-detail', type === 'shop');
    toggle('pane-event-detail', type === 'event');
    toggle('pane-farmer-detail', type === 'farmer');
    toggle('ev-venue-box', type === 'event' || type === 'other');
    toggle('ev-org-field', type === 'event');
    toggle('box-writing-assist', type !== 'other');

    const isShop = type === 'shop';
    const zipBadge = document.getElementById('zipBadge'), addrBadge = document.getElementById('addrBadge');
    const zipInp = document.getElementById('zipCode'), addrInp = document.getElementById('addressField');
    if (zipBadge && addrBadge && zipInp && addrInp) {
      zipBadge.style.display = addrBadge.style.display = isShop ? 'inline-block' : 'none';
      zipInp.required = addrInp.required = isShop;
      zipBadge.textContent = addrBadge.textContent = i18n.ui.badges.required;
    }

    const venueBox = document.getElementById('ev-venue-box');
    if (venueBox) {
      const vLabel = venueBox.querySelector('.lz-label');
      if (vLabel) vLabel.textContent = (type === 'other') ? i18n.misc.other_venue_name : i18n.fields.ev_venue_name;
    }

    if (type !== 'farmer') {
      const invBox = document.getElementById('pr-invoice-num-box');
      if (invBox) invBox.style.display = 'none';
      ['pr-crop-fruit-input', 'pr-crop-veg-input', 'pr-crop-other-input'].forEach(id => {
        const el = document.getElementById(id); if (el) el.style.display = 'none';
      });
    }
    if (type !== 'event') {
      const evEnd = document.getElementById('ev-end-date-box'); if (evEnd) evEnd.style.display = 'none';
    }

    const sSimple = document.getElementById('shop-simple'), sCustom = document.getElementById('shop-custom');
    if (type !== 'shop') {
      if (sSimple) sSimple.style.display = 'none';
      if (sCustom) sCustom.style.display = 'none';
    } else if (sSimple && sCustom) {
      const mode = document.querySelector('input[name="shop_mode"]:checked')?.value || 'simple';
      sSimple.style.display = mode === 'simple' ? 'block' : 'none';
      sCustom.style.display = mode === 'custom' ? 'block' : 'none';
    }

    await loadAndBuildGenres(type);

    if (btnPrintPdf) {
      if (['shop', 'event', 'farmer'].includes(type) && currentFetchType === type) {
        btnPrintPdf.style.display = 'inline-block';
      }
    }
  }

  async function loadAndBuildGenres(type) {
    const container = document.getElementById('lz-dynamic-category-area');
    if (!container) return;
    currentFetchType = type;
    container.innerHTML = `<div style="font-size:0.9rem; color:#888;">${i18n.ui.status.loading_cat}</div>`;
    try {
      const res = await fetch(`${ENDPOINT}?mode=form_genres&type=${type}&_t=${Date.now()}`);
      const json = await res.json();
      if (type !== currentFetchType) return;
      if (!json.ok) throw new Error('Failed to fetch categories');

      let l1Html = '<div class="lz-choice-flex">';
      let l2Html = '';
      (json.l1_order || Object.keys(json.items)).forEach((l1, idx) => {
        const baseId = `gen-${idx}`;
        const isRootOther = l1 === i18n.ui.common.other;
        const idAttr = isRootOther ? 'id="catRootOtherCheck"' : '';

        l1Html += `<label class="lz-choice-item"><input type="checkbox" name="cat_l1" value="${l1}" ${idAttr} data-subid="${baseId}" data-l1key="${l1}"><span class="lz-choice-inner">${l1}</span></label>`;

        if (json.items[l1] && !isRootOther) {
          l2Html += `<div id="sub-${baseId}" class="lz-dynamic-sub-area" style="display:none;"><label class="lz-label" style="font-size:1.1rem; color:#5b3a1e;">${l1}${i18n.misc.genre_suffix}</label><div class="lz-choice-flex">`;
          json.items[l1].forEach(l2 => {
            const isOther = l2.includes(i18n.ui.common.other);
            l2Html += `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="cat_${baseId}" value="${l2}" class="${isOther ? 'lz-sub-trigger' : ''}"><span class="lz-choice-inner">${l2}</span></label>`;
          });
          l2Html += `</div><input type="text" name="cat_${baseId}_val" class="lz-input lz-sub-other-field" style="display:none;" placeholder="${i18n.placeholders.genre_detail}"></div>`;
        }
      });

      container.innerHTML = l1Html + '</div>' + l2Html + `<div id="sub-cat-root-other" class="lz-dynamic-sub-area" style="display:none; border-left-color: #cf3a3a;"><label class="lz-label">${i18n.fields.genre_free}</label><input type="text" name="cat_root_other_val" class="lz-input" placeholder="${i18n.placeholders.genre_free}"></div>`;

      const buildChips = (targetId, list, namePrefix) => {
        const area = document.getElementById(targetId);
        if (!area || !list) return;
        area.innerHTML = list.map(item => `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="${namePrefix}" value="${item}"><span class="lz-choice-inner">${item}</span></label>`).join('') +
          `<label class="lz-choice-item lz-sub-choice-item"><input type="checkbox" name="${namePrefix}" value="${i18n.ui.common.other}" class="pr-other-trigger" data-target="${targetId === 'area-apple-varieties' ? 'pr-variety-other-input' : 'pr-product-other-input'}"><span class="lz-choice-inner">${i18n.ui.common.other}</span></label>`;
        area.querySelectorAll('.pr-other-trigger').forEach(chk => {
          chk.onchange = (e) => {
            const inputEl = document.getElementById(e.target.dataset.target);
            if (inputEl) inputEl.style.display = e.target.checked ? 'block' : 'none';
          };
        });
      };
      buildChips('area-apple-varieties', json.appleVarieties, 'pr_variety');
      buildChips('area-apple-products', json.appleProducts, 'pr_product');

      bindDynamicEvents();
    } catch (e) { console.error(e); container.innerHTML = `<div style="color:#cf3a3a;">${i18n.ui.status.error_cat}</div>`; }
  }

  function bindDynamicEvents() {
    document.getElementsByName('cat_l1').forEach(c => {
      c.onchange = (e) => {
        const targetId = e.target.getAttribute('data-subid');
        const el = document.getElementById(`sub-${targetId}`);
        const isOtherCheckbox = e.target.id === 'catRootOtherCheck';

        if (el && !isOtherCheckbox) {
          const isChecked = e.target.checked;
          el.style.display = isChecked ? 'flex' : 'none';
          if (!isChecked) {
            el.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = false);
            const otherField = el.querySelector('.lz-sub-other-field');
            if (otherField) { otherField.style.display = 'none'; otherField.value = ''; }
          }
        }
        const isOtherChecked = document.getElementById('catRootOtherCheck')?.checked;
        const otherRoot = document.getElementById('sub-cat-root-other');
        if (otherRoot) otherRoot.style.display = isOtherChecked ? 'flex' : 'none';
      };
    });
    document.querySelectorAll('.lz-sub-trigger').forEach(trigger => {
      trigger.onchange = (e) => {
        const inp = e.target.closest('.lz-dynamic-sub-area').querySelector('.lz-sub-other-field');
        if (inp) inp.style.display = e.target.checked ? 'block' : 'none';
      };
    });
  }

  const customBody = document.getElementById('customSchedBody');
  if (customBody) {
    days.forEach((d, i) => {
      const tr = document.createElement('tr'); tr.id = `row-${d}`;
      tr.innerHTML = `<td><strong>${d}${i18n.ui.common.day_suffix}</strong></td><td data-label="${i18n.misc.closed}"><input type="checkbox" name="c_closed_${i}" class="lz-closed-trigger"></td><td data-label="${i18n.misc.open_time}"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_s_' + i)}</div></td><td data-label="${i18n.misc.close_time}"><div class="lz-time-box">${utils.createTimeSelectorHTML('c_e_' + i)}</div></td>`;
      customBody.appendChild(tr);
      const trigger = tr.querySelector('.lz-closed-trigger');
      const timeBoxes = tr.querySelectorAll('.lz-time-box');
      trigger.onchange = (e) => {
        const isClosed = e.target.checked;
        tr.style.opacity = isClosed ? "0.4" : "1";
        timeBoxes.forEach(box => {
          box.classList.toggle('is-disabled', isClosed);
          box.querySelectorAll('select').forEach(sel => sel.disabled = isClosed);
        });
      };
    });
  }

  const simpleBox = document.getElementById('box-simple-days');
  if (simpleBox) {
    days.forEach(d => {
      const l = document.createElement('label'); l.className = 'lz-day-chip';
      l.innerHTML = `<input type="checkbox" name="simple_days" value="${d}"><span class="lz-day-text">${d}</span>`;
      simpleBox.appendChild(l);
    });
  }

  const setHtml = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  setHtml('sel-simple-start', utils.createTimeSelectorHTML('simple_s'));
  setHtml('sel-simple-end', utils.createTimeSelectorHTML('simple_e'));
  setHtml('sel-ev-s', utils.createTimeSelectorHTML('ev_s'));
  setHtml('sel-ev-e', utils.createTimeSelectorHTML('ev_e'));

  function rebindTimeEvents() {
    document.querySelectorAll('select[name$="_h"]').forEach(hSelect => {
      hSelect.onchange = (e) => {
        if (e.target.value !== "") {
          const mSelectName = e.target.name.replace('_h', '_m');
          const mSelect = document.querySelector(`select[name="${mSelectName}"]`);
          if (mSelect && mSelect.value === "") mSelect.value = "00";
        }
      };
    });
  }

  rebindTimeEvents();

  document.querySelectorAll('.lz-form-tab').forEach(t => {
    t.addEventListener('click', () => {
      const activeType = t.dataset.type;
      const url = new URL(window.location);
      url.searchParams.set('form', activeType);
      if (activeType !== 'article') {
        url.searchParams.delete('type');
      }
      window.history.replaceState({}, '', url.toString());

      document.querySelectorAll('.lz-form-tab').forEach(x => x.classList.toggle('is-active', x === t));
      document.querySelectorAll('.lz-form-body').forEach(b => {
        b.classList.remove('is-active');
        b.querySelectorAll('[required]').forEach(el => { el.dataset.required = "true"; el.required = false; });
      });
      const target = document.getElementById(`pane-${t.dataset.type}`);
      if (target) {
        target.classList.add('is-active');
        target.querySelectorAll('[data-required="true"]').forEach(el => el.required = true);
      }

      if (t.dataset.type === 'article') {
        updateTypeView();
      }

      rebindTimeEvents();
    });
  });

  const zipBtn = document.getElementById('zipBtnAction');
  if (zipBtn) zipBtn.onclick = async () => {
    const zip = document.getElementById('zipCode').value;
    if (!zip) return alert(i18n.ui.alerts.zip_empty);
    try { document.getElementById('addressField').value = await utils.fetchAddress(zip); } catch (e) { alert(e.message); }
  };

  const linkBox = document.getElementById('box-link-section');
  if (linkBox) {
    linkBox.addEventListener('change', (e) => {
      if (e.target.name === 'link_trigger') {
        const checkedVals = Array.from(document.getElementsByName('link_trigger')).filter(i => i.checked).map(i => i.value);
        Object.keys(i18n.links).forEach(key => {
          const targetInp = document.getElementById(`f-${key}`);
          if (targetInp) targetInp.style.display = checkedVals.includes(key) ? (key === 'rel' ? 'flex' : 'block') : 'none';
        });
      }
    });
  }

  document.querySelectorAll('.pr-invoice-trigger').forEach(r => {
    r.addEventListener('change', (e) => {
      const numBox = document.getElementById('pr-invoice-num-box');
      if (numBox) numBox.style.display = e.target.value === 'yes' ? 'block' : 'none';
    });
  });
  document.querySelectorAll('.pr-crop-trigger').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const targetMap = { fruit: 'pr-crop-fruit-input', vegetable: 'pr-crop-veg-input', other: 'pr-crop-other-input' };
      const targetInput = document.getElementById(targetMap[e.target.value]);
      if (targetInput) targetInput.style.display = e.target.checked ? 'block' : 'none';
    });
  });

  const evEndDateBox = document.getElementById('ev-end-date-box');
  document.getElementsByName('ev_period_type').forEach(r => {
    r.addEventListener('change', (e) => { if (evEndDateBox) evEndDateBox.style.display = e.target.value === 'period' ? 'flex' : 'none'; });
  });

  const evS = document.getElementsByName('ev_sdate')[0];
  const evE = document.getElementsByName('ev_edate')[0];
  const validateEventDates = () => {
    if (evS.value && evE.value && evE.value < evS.value) {
      alert("終了日は開始日以降の日付を選択してください。");
      evE.value = "";
    }
  };
  if (evS && evE) {
    evS.addEventListener('change', validateEventDates);
    evE.addEventListener('change', validateEventDates);
  }

  document.getElementsByName('shop_mode').forEach(r => {
    r.onchange = (e) => {
      const s = document.getElementById('shop-simple'), c = document.getElementById('shop-custom');
      if (s) s.style.display = e.target.value === 'simple' ? 'block' : 'none';
      if (c) c.style.display = e.target.value === 'custom' ? 'block' : 'none';
    };
  });

  document.getElementsByName('cm').forEach(c => {
    c.onchange = () => {
      const v = Array.from(document.getElementsByName('cm')).filter(i => i.checked).map(i => i.value);
      ['form', 'email', 'tel', 'other'].forEach(m => {
        const el = document.getElementById(`cm-${m}-box`);
        if (el) el.style.display = v.includes(m) ? 'flex' : 'none';
      });
      const sync = document.getElementById('syncField');
      if (sync) sync.style.display = v.includes('email') ? 'flex' : 'none';
    };
  });

  const chkAssist = document.getElementById('chk-writing-assist');
  if (chkAssist && inpLead && inpBody) {
    const fieldLead = inpLead.closest('.lz-field'), fieldBody = inpBody.closest('.lz-field');
    const syncAssist = () => {
      const isHandled = chkAssist.checked;
      if (fieldLead) fieldLead.style.display = isHandled ? 'none' : 'flex';
      if (fieldBody) fieldBody.style.display = isHandled ? 'none' : 'flex';
      inpLead.required = inpBody.required = !isHandled;
      const msg = document.getElementById('msg-writing-assist');
      if (msg) msg.style.display = isHandled ? "block" : "none";
    };
    chkAssist.onchange = syncAssist; syncAssist();
  }

  const relUrl1 = document.getElementById('rel_url1'), relTitle1 = document.getElementById('rel_title1'), rel2Row = document.getElementById('rel-link2-row');
  if (relUrl1 && relTitle1 && rel2Row) {
    const toggleRel2 = () => { rel2Row.style.display = (relUrl1.value.trim() !== "" || relTitle1.value.trim() !== "") ? 'grid' : 'none'; };
    relUrl1.oninput = relTitle1.oninput = toggleRel2;
  }

  const pubMail = document.getElementById('pubEmail'), admMail = document.getElementById('adminEmail'), syncCheck = document.getElementById('syncCheck');
  if (pubMail && admMail && syncCheck) {
    pubMail.addEventListener('input', () => {
      const syncField = document.getElementById('syncField');
      if (syncField) syncField.style.display = pubMail.value.trim().length > 0 ? "block" : "none";
      if (syncCheck.checked) admMail.value = pubMail.value;
    });
    syncCheck.addEventListener('change', () => {
      if (syncCheck.checked) { admMail.value = pubMail.value; admMail.style.background = "#f0f0f0"; admMail.readOnly = true; }
      else { admMail.style.background = "#fafafa"; admMail.readOnly = false; }
    });
  }

  const imgInput = document.getElementById('art_images_input'), imgAddBtn = document.getElementById('imgAddBtn'), previewArea = document.getElementById('imgPreviewArea');
  if (imgAddBtn && imgInput) {
    imgAddBtn.onclick = () => imgInput.click();
    imgInput.onchange = (e) => {
      Array.from(e.target.files).forEach(file => {
        if (uploadedFiles.length >= 6) return;
        uploadedFiles.push(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          const div = document.createElement('div'); div.className = 'lz-img-container';
          div.innerHTML = `<img src="${event.target.result}"><div class="lz-img-remove">×</div>`;
          div.querySelector('.lz-img-remove').onclick = () => {
            div.remove(); uploadedFiles = uploadedFiles.filter(f => f !== file);
            imgAddBtn.style.display = 'flex';
          };
          previewArea.insertBefore(div, imgAddBtn);
          if (uploadedFiles.length >= 6) imgAddBtn.style.display = 'none';
        };
        reader.readAsDataURL(file);
      });
      imgInput.value = "";
    };
  }

  const form = document.getElementById('lz-article-form');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const activeTab = document.querySelector('.lz-form-tab.is-active').dataset.type;
      const formData = new FormData(form);
      const rawPayload = {};

      formData.forEach((value, key) => {
        if (rawPayload[key]) {
          if (!Array.isArray(rawPayload[key])) rawPayload[key] = [rawPayload[key]];
          rawPayload[key].push(value);
        } else { rawPayload[key] = value; }
      });

      const payload = {};
      const tabAllowedPrefixes = {
        report: ['rep_'],
        inquiry: ['inq_'],
        article: ['art_', 'cat_', 'shop_', 'ev_', 'pr_', 'writing_assist', 'simple_', 'c_', 'link_', 'cm_', 'cont_', 'admin_']
      };

      Object.keys(rawPayload).forEach(key => {
        if (tabAllowedPrefixes[activeTab].some(p => key.startsWith(p))) payload[key] = rawPayload[key];
      });

      if (activeTab === 'article') {
        const type = payload.art_type;
        const fieldsToClean = {
          shop: ['ev_', 'pr_'],
          event: ['shop_', 'pr_', 'simple_', 'c_'],
          farmer: ['shop_', 'ev_', 'simple_', 'c_'],
          other: ['shop_', 'ev_', 'pr_', 'writing_assist', 'simple_', 'c_']
        };

        if (fieldsToClean[type]) {
          Object.keys(payload).forEach(key => {
            if (fieldsToClean[type].some(p => key.startsWith(p))) delete payload[key];
          });
        }

        if (type === 'shop') {
          const mode = payload.shop_mode;
          if (mode === 'simple') {
            Object.keys(payload).forEach(key => { if (key.startsWith('c_')) delete payload[key]; });
          } else {
            Object.keys(payload).forEach(key => { if (key.startsWith('simple_')) delete payload[key]; });
          }
        }
      }

      const confirmOverlay = document.getElementById('lz-confirm-overlay');
      const confirmBody = document.getElementById('lz-confirm-body');
      let previewHtml = "";

      const l1Checkboxes = Array.from(document.querySelectorAll('input[name="cat_l1"]'));
      const l1KeyMap = l1Checkboxes.reduce((acc, chk) => {
        acc[chk.dataset.subid] = chk.dataset.l1key;
        return acc;
      }, {});

      const getLabel = (key) => {
        if (i18n.fields[key]) return i18n.fields[key];

        if (key.startsWith('link_')) {
          const linkKey = key.replace(/^link_/, '').replace(/_url\d*|_title\d*$/, '');
          return i18n.links[linkKey]?.label || key;
        }

        if (key.startsWith('cat_gen-') && !key.endsWith('_val')) {
          const subId = key.match(/cat_(gen-\d+)/)?.[1];
          const l1Label = l1KeyMap[subId];
          if (l1Label) return `${l1Label}${i18n.misc.genre_suffix}`;
        }

        return key.replace(/_val$/, '');
      };

      const translateValue = (value) => {
        if (Array.isArray(value)) return value.map(v => translateValue(v)).join(', ');
        return i18n.options[value] || value;
      };

      const processedKeys = new Set();
      const displayOrder = Object.keys(rawPayload);

      displayOrder.forEach(key => {
        if (processedKeys.has(key) || !Object.prototype.hasOwnProperty.call(payload, key)) return;

        let val = payload[key];
        const skipKeys = ['art_type', 'images', 'art_file_data', 'ev_period_type', 'shop_mode', 'art_file', 'link_trigger', 'pr_area_unit'];
        if (skipKeys.includes(key) || val === null || val.toString().trim() === "" || (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0)) return;

        let label = getLabel(key);
        let displayVal;

        if (key.startsWith('c_closed_')) {
          const dayIndex = key.replace('c_closed_', '');
          label = `${days[dayIndex]}${i18n.ui.common.day_suffix}`;
          displayVal = i18n.misc.closed;
        } else if (key.startsWith('c_s_') && key.endsWith('_h')) {
          const dayIndex = key.match(/c_s_(\d+)_h/)[1];
          const startH = val;
          const startM = payload[key.replace('_h', '_m')] || "00";
          const endKeyH = key.replace('_s_', '_e_');
          const endKeyM = endKeyH.replace('_h', '_m');
          const endH = payload[endKeyH];
          const endM = payload[endKeyM] || "00";

          if (endH) {
            displayVal = `${startH}:${startM} - ${endH}:${endM}`;
            label = `${days[dayIndex]}${i18n.ui.common.day_suffix}`;
            processedKeys.add(key.replace('_h', '_m'));
            processedKeys.add(endKeyH);
            processedKeys.add(endKeyM);
          }
        } else if (key.startsWith('simple_s_h')) {
          const startH = val;
          const startM = payload['simple_s_m'] || "00";
          const endH = payload['simple_e_h'];
          const endM = payload['simple_e_m'] || "00";
          if (endH) {
            displayVal = `${startH}:${startM} - ${endH}:${endM}`;
            label = i18n.misc.std_biz_hours;
            processedKeys.add('simple_s_m').add('simple_e_h').add('simple_e_m');
          }
        } else if (key.startsWith('ev_s_h')) {
          const startH = val;
          const startM = payload['ev_s_m'] || "00";
          const endH = payload['ev_e_h'];
          const endM = payload['ev_e_m'] || "00";
          if (endH) {
            displayVal = `${startH}:${startM} - ${endH}:${endM}`;
            label = i18n.fields.ev_stime;
            processedKeys.add('ev_s_m').add('ev_e_h').add('ev_e_m');
          }
        }
        else if (key.includes('_e_h') || key.endsWith('_m')) return;
        else {
          displayVal = translateValue(val);
        }

        if (key === 'pr_area') {
          displayVal += translateValue(payload.pr_area_unit || '');
        }

        previewHtml += `<div class="lz-modal-item"><div class="lz-modal-label">${label}</div><div class="lz-modal-value">${displayVal}</div></div>`;
        processedKeys.add(key);
      });

      if (uploadedFiles.length > 0) previewHtml += `<div class="lz-modal-item"><div class="lz-modal-label">${i18n.fields.art_images}</div><div class="lz-modal-value">${uploadedFiles.length} 枚</div></div>`;
      const docFile = form.querySelector('input[name="art_file"]')?.files[0];
      if (docFile) previewHtml += `<div class="lz-modal-item"><div class="lz-modal-label">${i18n.fields.art_file}</div><div class="lz-modal-value">${docFile.name}</div></div>`;

      confirmBody.innerHTML = previewHtml || `<div style="text-align:center; padding:20px;">入力内容がありません</div>`;
      confirmOverlay.style.display = 'flex';

      const isConfirmed = await new Promise(res => {
        document.getElementById('lz-btn-back').onclick = () => res(false);
        document.getElementById('lz-btn-go').onclick = () => res(true);
      });

      confirmOverlay.style.display = 'none';
      if (!isConfirmed) return;

      const allBtns = document.querySelectorAll('.lz-send-btn');
      allBtns.forEach(btn => { btn.disabled = true; btn.textContent = i18n.ui.buttons.sending; btn.style.opacity = '0.6'; });

      try {
        days.forEach((d, i) => { ['s_h', 's_m', 'e_h', 'e_m'].forEach(s => { const k = `c_${s}_${i}`; if (!payload[k]) payload[k] = ""; }); });

        if (uploadedFiles.length > 0) {
          payload.images = await Promise.all(uploadedFiles.map(file => new Promise(res => {
            const r = new FileReader(); r.onload = (ev) => res(ev.target.result); r.readAsDataURL(file);
          })));
        }

        if (docFile) {
          payload.art_file_name = docFile.name.replace(/\s+/g, '_');
          payload.art_file_data = await new Promise(res => {
            const r = new FileReader(); r.onload = (ev) => res(ev.target.result); r.readAsDataURL(docFile);
          });
        }

        const res = await fetch(ENDPOINT, { method: "POST", body: JSON.stringify(payload) });
        const result = await res.json();
        if (result.ok) {
          alert((i18n.types[payload.art_type]?.label || 'フォーム') + "の送信に成功しました！");
          window.location.reload();
        } else { throw new Error(result.error); }
      } catch (err) {
        alert(i18n.ui.alerts.send_error + "\\n理由: " + err.message);
        allBtns.forEach(btn => { btn.disabled = false; btn.textContent = i18n.ui.buttons.send; btn.style.opacity = '1'; });
      }
    };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const formTypeFromUrl = urlParams.get('form');
  const typeFromUrl = urlParams.get('type');

  if (typeSelect && typeFromUrl) {
    typeSelect.value = typeFromUrl;
  }

  if (typeSelect) {
    typeSelect.onchange = updateTypeView;
  }

  const btnPrintPdf = document.getElementById('btn-print-pdf');
  if (btnPrintPdf) {
    btnPrintPdf.style.display = 'none'; // Ensure hidden initially
    btnPrintPdf.addEventListener('click', () => {
      const type = typeSelect.value;
      if (!type) return;

      const dynamicCategoriesElements = document.querySelectorAll('input[name="cat_l1"]');
      const dynamicCategories = [];

      dynamicCategoriesElements.forEach(el => {
        const catName = el.nextElementSibling ? el.nextElementSibling.textContent.trim() : el.value;
        const subId = el.getAttribute('data-subid');
        const subArea = document.getElementById(`sub-${subId}`);

        if (subArea) {
          const subItems = Array.from(subArea.querySelectorAll('.lz-sub-choice-item .lz-choice-inner'))
            .map(subEl => subEl.textContent.trim());
          if (subItems.length > 0) {
            dynamicCategories.push({ label: catName, subItems: subItems });
          } else {
            dynamicCategories.push({ label: catName });
          }
        } else {
          dynamicCategories.push({ label: catName });
        }
      });

      const printHtml = generatePrintHTML(type, i18n, dynamicCategories);

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("ポップアップブロックを解除してください。");
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <title>${i18n.types[type].label || ''} 登録シート (手書き用)</title>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="print-btn-container">
            <button class="print-btn" onclick="window.print()">このページを印刷する</button>
          </div>
          <div class="print-page">
            ${printHtml}
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();

      // Allow styles to load before promping print dialogue
      setTimeout(() => {
        printWindow.print();
      }, 500);
    });
  }

  let tabToActivate = null;
  if (formTypeFromUrl) {
    tabToActivate = document.querySelector(`.lz-form-tab[data-type="${formTypeFromUrl}"]`);
  }

  if (!tabToActivate) {
    tabToActivate = document.querySelector('.lz-form-tab[data-type="report"]');
  }

  if (tabToActivate) {
    tabToActivate.click();
  }
}
