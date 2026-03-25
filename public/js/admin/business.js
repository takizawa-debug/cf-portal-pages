/* ============================
   Business Profile Management
   ============================ */

let cachedBusinessId = null;
let currentBizShops = [];
let currentBizFarmers = [];
let currentEditingSubId = null;
let currentEditingSubType = null;
let currentEditingProfileAuthor = null;

function filterFarmerVarieties(query) {
    const lowerq = query.toLowerCase();
    const container = document.getElementById('sub_farmer_variety_container');
    if (!container) return;
    const items = container.querySelectorAll('.form-check-inline');
    items.forEach(item => {
        const label = item.querySelector('label');
        if (!label) return;
        const text = label.innerText.toLowerCase();
        if (text.includes(lowerq)) {
            item.style.setProperty('display', 'inline-flex', 'important');
        } else {
            item.style.setProperty('display', 'none', 'important');
        }
    });
}

function enableBusinessEdit() {
    const fs = document.getElementById('business_form_fieldset');
    if (fs) fs.disabled = false;
    const editBtn = document.getElementById('business_edit_button_container');
    if (editBtn) {
        editBtn.classList.remove('d-flex');
        editBtn.classList.add('d-none');
        editBtn.style.display = '';
    }
    document.getElementById('business_save_button_container').style.display = 'block';
}

function disableBusinessEdit() {
    const fs = document.getElementById('business_form_fieldset');
    if (fs) fs.disabled = true;
    const editBtn = document.getElementById('business_edit_button_container');
    if (editBtn) {
        editBtn.classList.remove('d-none');
        editBtn.classList.add('d-flex');
        editBtn.style.display = '';
    }
    document.getElementById('business_save_button_container').style.display = 'none';
}

function cancelBusinessEdit() {
    disableBusinessEdit();
    loadBusinessProfile();
}

/* --- WIZARD ONBOARDING LOGIC --- */
let currentWizardStep = 0;

function startBusinessWizard() {
    currentWizardStep = 1;
    document.getElementById('biz_wizard_header').classList.remove('d-none');
    document.getElementById('business_save_button_container').classList.add('d-none');
    document.getElementById('biz_wizard_actions').classList.remove('d-none');
    document.querySelector('.content-area').scrollTo({top: 0, behavior: 'smooth'});
    renderWizardStep();
}

function renderWizardStep() {
    [1, 2, 3].forEach(s => {
        const el = document.getElementById('biz_step_' + s);
        if (el) el.classList.add('d-none');
        const btn = document.getElementById('btn_wiz_' + s);
        if (btn) btn.className = `btn rounded-circle position-relative fw-bold shadow-sm ${s <= currentWizardStep ? 'btn-brand' : 'btn-secondary'}`;
    });

    const btn4 = document.getElementById('btn_wiz_4');
    if (btn4) btn4.className = `btn rounded-circle position-relative fw-bold shadow-sm ${currentWizardStep === 4 ? 'btn-brand' : 'btn-secondary'}`;
    
    let progress = 0;
    if (currentWizardStep === 1) progress = 0;
    else if (currentWizardStep === 2) progress = 33;
    else if (currentWizardStep === 3) progress = 66;
    else progress = 100;
    document.getElementById('biz_wizard_progress').style.width = progress + '%';

    if (currentWizardStep <= 3) {
        document.getElementById('biz_step_' + currentWizardStep).classList.remove('d-none');
        document.getElementById('biz_wizard_actions').classList.remove('d-none');
        const saveCont = document.getElementById('business_save_button_container');
        if (saveCont) {
            saveCont.classList.add('d-none');
            saveCont.style.display = 'none';
        }

        const prevBtn = document.getElementById('btn_wiz_prev');
        if (prevBtn) prevBtn.style.visibility = currentWizardStep === 1 ? 'hidden' : 'visible';
        
        const skipBtn = document.getElementById('btn_wiz_skip');
        if (skipBtn) {
            if (currentWizardStep === 3) skipBtn.classList.remove('d-none');
            else skipBtn.classList.add('d-none');
        }
    } else {
        [1, 2, 3].forEach(s => {
            const el = document.getElementById('biz_step_' + s);
            if (el) el.classList.remove('d-none');
        });
        document.getElementById('biz_wizard_actions').classList.add('d-none');
        const saveCont = document.getElementById('business_save_button_container');
        if (saveCont) {
            saveCont.classList.remove('d-none');
            saveCont.style.display = 'block';
        }
        showStatus('最後に入力内容を確認し、問題なければ保存してください。', 'success');
    }
}

function bizWizardNext(isSkip = false) {
    if (currentWizardStep === 1 && !isSkip) {
        const name = document.getElementById('page_biz_corp_name').value;
        const rep = document.getElementById('page_biz_rep_name').value;
        if (!name || name.trim() === '') {
            showStatus('事業者名（会社名・屋号等）は必須項目のため入力してください。', 'error');
            document.getElementById('page_biz_corp_name').focus();
            return;
        }
        if (!rep || rep.trim() === '') {
            showStatus('代表者名は必須項目のため入力してください。', 'error');
            document.getElementById('page_biz_rep_name').focus();
            return;
        }
    } else if (currentWizardStep === 2 && !isSkip) {
        const zip = document.getElementById('page_biz_zip').value;
        const addr = document.getElementById('page_biz_address').value;
        if (!zip || zip.trim() === '') {
            showStatus('郵便番号は必須項目のため入力してください。', 'error');
            document.getElementById('page_biz_zip').focus();
            return;
        }
        if (!addr || addr.trim() === '') {
            showStatus('住所は必須項目のため入力してください。', 'error');
            document.getElementById('page_biz_address').focus();
            return;
        }
    }
    
    currentWizardStep++;
    renderWizardStep();
    document.querySelector('.content-area').scrollTo({top: 0, behavior: 'smooth'});
}

function bizWizardPrev() {
    if (currentWizardStep > 1) {
        currentWizardStep--;
        renderWizardStep();
        document.querySelector('.content-area').scrollTo({top: 0, behavior: 'smooth'});
    }
}

function exitWizard() {
    currentWizardStep = 0;
    const wizHeader = document.getElementById('biz_wizard_header');
    const wizActions = document.getElementById('biz_wizard_actions');
    if (wizHeader) wizHeader.classList.add('d-none');
    if (wizActions) wizActions.classList.add('d-none');
    
    [1, 2, 3].forEach(s => {
        const el = document.getElementById('biz_step_' + s);
        if (el) el.classList.remove('d-none');
    });
}
/* --- END WIZARD LOGIC --- */

function toggleSubContactFields() {
    const isChecked = document.getElementById('sub_use_custom_contact').checked;
    document.getElementById('sub_contact_fields').classList.toggle('d-none', !isChecked);
}

let allBusinessProfiles = []; // For Admin list views

async function loadBusinessProfile() {
    const btn = document.querySelector('button[onclick="saveBusinessProfile()"]');
    if (btn) btn.disabled = true;

    try {
        const res = await fetch('/api/posts');
        const data = await res.json();
        
        allBusinessProfiles = data.filter(i => i.type === 'business_profile');
        
        // Contributor behavior: load own generic profile
        if (window.userRole === 'contributor') {
            document.getElementById('company-list-container').style.display = 'none';
            document.getElementById('location-list-container').style.display = 'none';
            document.getElementById('company-form-container').style.display = 'block';
            document.getElementById('location-owner-container').style.display = 'block';

            const profile = allBusinessProfiles.find(i => i.author_id === window.userId);
            if (profile) {
                injectProfileIntoForm(profile);
            }
            if (cachedBusinessId) {
                disableBusinessEdit();
                exitWizard();
            } else {
                enableBusinessEdit();
                startBusinessWizard();
            }
        } 
        // Admin/Editor behavior: render aggregations
        else {
            document.getElementById('company-list-container').style.display = 'block';
            document.getElementById('location-list-container').style.display = 'block';
            document.getElementById('company-form-container').style.display = 'none';
            document.getElementById('location-owner-container').style.display = 'none';
            
            renderCompanyList(allBusinessProfiles);
            renderLocationList(allBusinessProfiles);
        }

    } catch (e) {
        console.error(e);
    }
    if (btn) btn.disabled = false;
}

function renderCompanyList(profiles) {
    const tbody = document.getElementById('companyTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (profiles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">登録されている事業者がありません。</td></tr>';
        return;
    }
    
    profiles.forEach(p => {
        let bizObj = {};
        if (p.business_metadata) {
            try { bizObj = JSON.parse(p.business_metadata); } catch(e){}
        }
        const corpName = bizObj.corp_name || p.title || '(事業者名未設定)';
        const repName = bizObj.rep_name || '-';

        let locCount = 0;
        if (bizObj.shops) locCount += bizObj.shops.length;
        if (bizObj.farmers) locCount += bizObj.farmers.length;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold"><a href="#" class="text-decoration-none text-primary" onclick="viewCompanyLocations('${p.id}'); return false;"><i class="fa-solid fa-hotel me-1"></i> ${corpName}</a></td>
            <td>${repName}</td>
            <td class="text-center"><span class="badge bg-info text-dark">${locCount} 拠点</span></td>
            <td>${new Date(p.updated_at || p.created_at).toLocaleDateString()}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-brand" onclick="editBusinessProfile('${p.id}')">編集</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderLocationList(profiles) {
    const tbody = document.getElementById('locationTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    let allLocations = [];
    
    profiles.forEach(p => {
        if (!p.business_metadata) return;
        try {
            const bizObj = JSON.parse(p.business_metadata);
            const parentName = bizObj.corp_name || p.title || '事業者';
            
            if (bizObj.shops) {
                bizObj.shops.forEach(s => allLocations.push({ ...s, type: 'shop', parentBizId: p.id, parentBizName: parentName }));
            }
            if (bizObj.farmers) {
                bizObj.farmers.forEach(f => allLocations.push({ ...f, type: 'farmer', parentBizId: p.id, parentBizName: parentName }));
            }
        } catch (e) {
            console.error('Metadata parse error', e);
        }
    });
    
    if (allLocations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">登録されている拠点がありません。</td></tr>';
        return;
    }
    
    allLocations.forEach(loc => {
        const tr = document.createElement('tr');
        const badge = loc.type === 'shop' ? '<span class="badge bg-primary">店舗・施設</span>' : '<span class="badge bg-success">農園・生産</span>';
        const catInfo = loc.type === 'shop' ? (loc.category || '-') : (loc.variety || '-');
        tr.innerHTML = `
            <td>${badge}</td>
            <td class="fw-bold"><a href="#" class="text-decoration-none text-primary" onclick="viewLocationDetails('${loc.parentBizId}', '${loc.id}', '${loc.type}'); return false;"><i class="fa-solid fa-map-location-dot me-1"></i> ${loc.name || '(拠点名未設定)'}</a></td>
            <td class="text-muted small">${catInfo}</td>
            <td class="text-muted small">${loc.parentBizName || '-'}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary" onclick="editLocationProfile('${loc.parentBizId}', '${loc.id}', '${loc.type}')">編集</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function viewCompanyLocations(bizId) {
    const profile = allBusinessProfiles.find(p => p.id === bizId);
    if (!profile) return;
    
    let bizObj = {};
    if (profile.business_metadata) {
        try {
            bizObj = JSON.parse(profile.business_metadata);
        } catch(e){}
    }
    
    document.getElementById('clm_company_name').innerText = (bizObj.corp_name || profile.title || '事業者') + ' の登録情報';
    
    // Extract and Render Business Profile Details
    const detailsContainer = document.getElementById('clm_company_details');
    detailsContainer.innerHTML = '';
    
    if (bizObj.logo_url) {
        detailsContainer.innerHTML += `<div class="mb-4 text-center"><img src="${bizObj.logo_url}" class="rounded shadow-sm border" style="width: 120px; height: 120px; object-fit: cover;"></div>`;
    }
    
    const infoList = [
        { label: '事業者名', value: bizObj.corp_name },
        { label: '代表者名', value: bizObj.rep_name },
        { label: '紹介文', value: bizObj.description },
        { label: '経営形態', value: bizObj.ent_type === 'corp' ? '法人' : (bizObj.ent_type === 'individual' ? '個人事業主' : (bizObj.ent_type==='npo'?'NPO・団体等':'')) },
        { label: '従業員数', value: bizObj.staff ? bizObj.staff + '名' : '' },
        { label: 'インボイス', value: bizObj.invoice_num },
        { label: '郵便番号', value: bizObj.zip },
        { label: '住所', value: bizObj.address },
        { label: 'Email', value: bizObj.email },
        { label: '電話番号', value: bizObj.phone },
        { label: '公式HP', value: bizObj.url_home },
        { label: 'ECサイト', value: bizObj.url_ec },
        { label: 'Instagram', value: bizObj.url_ig },
        { label: 'Facebook', value: bizObj.url_fb },
        { label: 'X(Twitter)', value: bizObj.url_x },
        { label: 'LINE', value: bizObj.url_line },
        { label: '注意事項', value: bizObj.contact_remarks },
        { label: '備考', value: bizObj.remarks }
    ];
    
    let html = '<div class="row g-3">';
    let hasDetails = false;
    infoList.forEach(item => {
        if (item.value && item.value.trim() !== '') {
            hasDetails = true;
            html += `
            <div class="col-md-6">
                <div class="small text-muted fw-bold mb-1">${item.label}</div>
                <div class="fs-6">${escapeHtml(item.value)}</div>
            </div>`;
        }
    });
    html += '</div>';
    
    if (hasDetails) {
        detailsContainer.innerHTML = html;
        detailsContainer.style.display = 'block';
    } else {
        detailsContainer.style.display = 'none';
    }
    
    // Render Locations Table mapping over parsed bizObj
    const tbody = document.getElementById('companyLocationsTableBody');
    tbody.innerHTML = '';
    
    let locations = [];
    if (bizObj.shops) bizObj.shops.forEach(s => locations.push({...s, type: 'shop'}));
    if (bizObj.farmers) bizObj.farmers.forEach(f => locations.push({...f, type: 'farmer'}));
    
    if (locations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted py-4">登録されている拠点がありません。</td></tr>';
    } else {
        locations.forEach(loc => {
            const badge = loc.type === 'shop' ? '<span class="badge bg-primary">店舗・施設</span>' : '<span class="badge bg-success">農園・生産</span>';
            const catInfo = loc.type === 'shop' ? (loc.category || '-') : (loc.variety || '-');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${badge}</td>
                <td class="fw-bold">${loc.name || '-'}</td>
                <td class="text-muted small">${catInfo}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('companyLocationsModal'));
    modal.show();
}

const locFieldLabels = {
    name: "拠点名", zip: "郵便番号", address: "所在地", phone: "電話番号", email: "メールアドレス",
    url_home: "公式HP", url_ec: "ECサイト", url_ig: "Instagram", url_fb: "Facebook",
    url_x: "X (Twitter)", url_line: "LINE公式", intro: "紹介文", notes: "備考/その他の情報",
    biz_note: "営業の補足", holiday_type: "定休日", category: "カテゴリ", mode: "営業時間モード",
    simple_days: "営業曜日", variety: "栽培品種", variety_other: "その他の品種", product: "主な加工品",
    product_other: "その他の加工品", area: "栽培面積", area_unit: "面積単位", other_crops: "その他の作物群",
    crop_fruit_detail: "果樹類の詳細", crop_veg_detail: "野菜類の詳細", crop_other_detail: "その他の詳細",
    use_custom_contact: "独自連絡先を使用", image1: "画像1", image2: "画像2", image3: "画像3", image4: "画像4", image5: "画像5"
};

function viewLocationDetails(bizId, locId, type) {
    const profile = allBusinessProfiles.find(p => p.id === bizId);
    if (!profile) return;
    
    let locData = null;
    if (profile.business_metadata) {
        try {
            const bizObj = JSON.parse(profile.business_metadata);
            if (type === 'shop' && bizObj.shops) locData = bizObj.shops.find(s => s.id === locId);
            if (type === 'farmer' && bizObj.farmers) locData = bizObj.farmers.find(f => f.id === locId);
        } catch(e){}
    }
    if (!locData) return;
    
    document.getElementById('ldm_location_name').innerText = (locData.name || '拠点') + ' の詳細情報';
    const container = document.getElementById('ldm_details_container');
    container.innerHTML = '';
    
    const badge = type === 'shop' ? '<span class="badge bg-primary mb-3" style="width:fit-content;"><i class="fa-solid fa-store me-1"></i>店舗・施設</span>' : '<span class="badge bg-success mb-3" style="width:fit-content;"><i class="fa-solid fa-leaf me-1"></i>農園・生産</span>';
    container.innerHTML += badge;
    
    // Output images at the very top
    let imagesHtml = '';
    for(let i=1; i<=5; i++) {
        const imgUrl = locData['image' + i];
        if (imgUrl) {
            imagesHtml += `<a href="${imgUrl}" target="_blank"><img src="${imgUrl}" class="rounded shadow-sm border" style="height: 140px; width: auto; object-fit: cover; cursor: pointer;"></a>`;
        }
    }
    if (imagesHtml) {
        const imgRow = document.createElement('div');
        imgRow.className = 'd-flex gap-2 mb-4 pb-3 border-bottom overflow-auto';
        imgRow.innerHTML = imagesHtml;
        container.appendChild(imgRow);
    }
    
    const excludeKeys = ['id', 'type', 'c_closed_0', 'c_closed_1', 'c_closed_2', 'c_closed_3', 'c_closed_4', 'c_closed_5', 'c_closed_6', 'c_s_0_h', 'c_s_0_m', 'c_e_0_h', 'c_e_0_m', 'c_s_1_h', 'c_s_1_m', 'c_e_1_h', 'c_e_1_m', 'c_s_2_h', 'c_s_2_m', 'c_e_2_h', 'c_e_2_m', 'c_s_3_h', 'c_s_3_m', 'c_e_3_h', 'c_e_3_m', 'c_s_4_h', 'c_s_4_m', 'c_e_4_h', 'c_e_4_m', 'c_s_5_h', 'c_s_5_m', 'c_e_5_h', 'c_e_5_m', 'c_s_6_h', 'c_s_6_m', 'c_e_6_h', 'c_e_6_m', 'simple_s_h', 'simple_s_m', 'simple_e_h', 'simple_e_m'];
    
    Object.keys(locData).forEach(key => {
        if (excludeKeys.includes(key) || key.startsWith('image')) return;
        const val = locData[key];
        if (val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0) || val === false) return;
        
        let displayVal = Array.isArray(val) ? val.join(', ') : val;
        if (typeof displayVal === 'string' && displayVal.startsWith('http')) {
            displayVal = `<a href="${displayVal}" target="_blank" class="text-break">${displayVal} <i class="fa-solid fa-arrow-up-right-from-square small"></i></a>`;
        }
        if (key === 'use_custom_contact' && val === true) displayVal = 'はい（拠点固有の連絡先を使用）';
        if (key === 'mode') displayVal = val === 'simple' ? 'シンプル設定' : '変則設定';
        if (key === 'area_unit' && locData.area) return; // handled together maybe? We just show both. Better handled linearly for now.
        
        const label = locFieldLabels[key] || key;
        const row = document.createElement('div');
        row.className = 'd-flex flex-column mb-3 border-bottom pb-2';
        row.innerHTML = `<span class="text-muted small fw-bold mb-1">${label}</span><span class="text-dark">${displayVal}</span>`;
        container.appendChild(row);
    });
    
    const timeRow = document.createElement('div');
    timeRow.className = 'd-flex flex-column mb-3 border-bottom pb-2';
    
    if (type === 'shop' && locData.mode === 'custom') {
        let hoursHtml = '';
        const days = ['日', '月', '火', '水', '木', '金', '土'];
        const dNames = ['月', '火', '水', '木', '金', '土', '日'];
        for (let i=0; i<7; i++) {
            const isClosed = locData[`c_closed_${i}`];
            if (isClosed) {
                hoursHtml += `<div>${dNames[i]}曜: <span class="badge bg-secondary">休業</span></div>`;
            } else if (locData[`c_s_${i}_h`]) {
                const s = `${locData[`c_s_${i}_h`]}:${locData[`c_s_${i}_m`]||'00'}`;
                const e = `${locData[`c_e_${i}_h`]}:${locData[`c_e_${i}_m`]||'00'}`;
                hoursHtml += `<div>${dNames[i]}曜: ${s} 〜 ${e}</div>`;
            }
        }
        if (hoursHtml) {
            timeRow.innerHTML = `<span class="text-muted small fw-bold mb-1">変則営業時間</span><span class="text-dark">${hoursHtml}</span>`;
            container.appendChild(timeRow);
        }
    } else if (type === 'shop' && locData.mode === 'simple') {
        if (locData.simple_s_h) {
            const s = `${locData.simple_s_h}:${locData.simple_s_m||'00'}`;
            const e = `${locData.simple_e_h}:${locData.simple_e_m||'00'}`;
            timeRow.innerHTML = `<span class="text-muted small fw-bold mb-1">基本営業時間</span><span class="text-dark">${s} 〜 ${e}</span>`;
            container.appendChild(timeRow);
        }
    }
    
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('locationDetailsModal'));
    modal.show();
}

function injectProfileIntoForm(profile) {
    cachedBusinessId = profile.id;
    currentEditingProfileAuthor = profile.author_id || profile.author || null;
    if (profile.business_metadata) {
        try {
            const bizObj = JSON.parse(profile.business_metadata);
            for (let k in bizObj) {
                if (k === 'shops') {
                    currentBizShops = bizObj[k] || [];
                } else if (k === 'farmers') {
                    currentBizFarmers = bizObj[k] || [];
                } else {
                    const el = document.getElementById('page_biz_' + k);
                    if (el) {
                        if (el.type === 'checkbox') el.checked = bizObj[k] === true || bizObj[k] === 'true';
                        else el.value = bizObj[k];
                    }
                }
            }

            ['url_home', 'url_ec', 'url_ig', 'url_fb', 'url_x', 'url_line', 'email', 'phone'].forEach(k => {
                const el = document.getElementById('page_biz_' + k);
                const chk = document.getElementById('chk_page_biz_' + k);
                if (el && chk) {
                    chk.checked = !!el.value;
                    chk.dispatchEvent(new Event('change'));
                }
            });

            // Render Logo Preview
            const preview = document.getElementById('page_biz_logo_preview');
            if (preview && bizObj.logo_url) {
                preview.innerHTML = `<img src="${bizObj.logo_url}" style="width:100%; height:100%; object-fit:cover;">`;
            } else if (preview) {
                preview.innerHTML = '<i class="fa-solid fa-image text-muted fs-2"></i>';
            }
        } catch (e) { console.error('Error parsing business metadata', e); }
    }
    renderSubEntities();
}

function editBusinessProfile(bizId) {
    const profile = allBusinessProfiles.find(p => p.id === bizId);
    if (!profile) return;
    
    document.getElementById('company-list-container').style.display = 'none';
    document.getElementById('company-form-container').style.display = 'block';
    
    injectProfileIntoForm(profile);
    disableBusinessEdit();
    exitWizard();
}

function editLocationProfile(bizId, locationId, type) {
    const profile = allBusinessProfiles.find(p => p.id === bizId);
    if (!profile) return;
    injectProfileIntoForm(profile);
    openSubEntityModal(type, locationId);
}

function renderSubEntities() {
    const container = document.getElementById('sub-entity-cards-container');
    if (!container) return;
    container.innerHTML = '';

    if (currentBizShops.length === 0 && currentBizFarmers.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted small py-4 bg-light rounded border">登録されている店舗等はありません。</div>';
        return;
    }

    currentBizShops.forEach(shop => {
        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="card h-100 border-primary cursor-pointer shadow-sm hover-elevate transition-all" onclick="openSubEntityModal('shop', '${shop.id}')">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-primary"><i class="fa-solid fa-store"></i> お店・施設</span>
                        <i class="fa-solid fa-pen text-muted small"></i>
                    </div>
                    <h5 class="card-title fw-bold text-dark m-0">${shop.name}</h5>
                    <p class="small text-muted mt-2 mb-0 text-truncate">${shop.intro || '概要未入力'}</p>
                </div>
            </div>
        `;
        container.appendChild(col);
    });

    currentBizFarmers.forEach(farmer => {
        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="card h-100 border-success cursor-pointer shadow-sm hover-elevate transition-all" onclick="openSubEntityModal('farmer', '${farmer.id}')">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-success"><i class="fa-solid fa-leaf"></i> 農園・生産者</span>
                        <i class="fa-solid fa-pen text-muted small"></i>
                    </div>
                    <h5 class="card-title fw-bold text-dark m-0">${farmer.name}</h5>
                    <p class="small text-muted mt-2 mb-0 text-truncate">${farmer.intro || '概要未入力'}</p>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
}

function renderSubEntityCheckboxes(type) {
    if (type === 'shop') {
        const cont = document.getElementById('sub_shop_categories_container');
        cont.innerHTML = '';
        const shopCatsData = categoriesMaster.filter(c => c.form_type === 'shop' && c.l1);

        if (shopCatsData.length === 0) {
            const defaultCats = ['飲食', '買い物', '宿泊', '観光', '相談', '産業', '暮らし', 'その他'];
            defaultCats.forEach((cat, i) => {
                const div = document.createElement('div');
                div.className = 'form-check form-check-inline';
                div.innerHTML = `<input class="form-check-input sub-shop-l1" type="checkbox" id="scat_${i}" value="${cat}"><label class="form-check-label" for="scat_${i}">${cat}</label>`;
                cont.appendChild(div);
            });
            return;
        }

        const grouped = {};
        shopCatsData.forEach(c => {
            if (!grouped[c.l1]) grouped[c.l1] = [];
            if (c.l2) grouped[c.l1].push(c.l2);
        });

        Object.keys(grouped).forEach((l1, i) => {
            const l2s = [...new Set(grouped[l1])].filter(l2 => l2 && !l2.includes('自由記述') && !l2.includes('カテゴリーの詳細'));
            const div = document.createElement('div');
            div.className = 'col-12 mb-2 p-2 border rounded bg-white shadow-sm';

            let l2Html = '';
            if (l2s.length > 0) {
                l2Html += `<div class="d-flex flex-wrap gap-2 mt-2 pt-2 border-top" id="sub_shop_l2_container_${i}" style="display:none !important;">`;
                l2s.forEach((l2, j) => {
                    const isOther = l2 === 'その他' || l2 === 'その他の観光' || l2 === 'その他の相談' || l2 === 'その他の産業' || l2 === 'その他の体験' || l2 === 'その他（特産品など）' || l2 === 'その他の暮らし' || l2 === 'その他のサービス';
                    const otherInputId = `sub_shop_cat_other_${i}_${j}`;

                    const onchangeCb = isOther ? `onchange="document.getElementById('${otherInputId}').style.display=this.checked?'block':'none';"` : '';
                    const otherInputNode = isOther ? `<input type="text" class="form-control form-control-sm mt-1 mb-2 sub-shop-l2-other" id="${otherInputId}" placeholder="具体的な内容をご記入ください" style="display:none;" data-parent="${l2}">` : '';

                    l2Html += `
                    <div class="form-check form-check-inline align-items-center mb-0">
                        <input class="form-check-input sub-shop-l2" type="checkbox" id="scat_${i}_${j}" value="${l2}" ${onchangeCb}>
                        <label class="form-check-label text-muted small" for="scat_${i}_${j}">${l2}</label>
                    </div>${otherInputNode}`;
                });
                l2Html += `</div>`;
            }

            const isL1Other = l1 === 'その他';
            const l1OtherInputId = `sub_shop_l1_other_${i}`;
            const l1OnchangeCb = isL1Other ? `onchange="document.getElementById('${l1OtherInputId}').style.display=this.checked?'block':'none'; document.getElementById('sub_shop_l2_container_${i}').style.setProperty('display', this.checked ? 'flex' : 'none', 'important');"` : `onchange="const c = document.getElementById('sub_shop_l2_container_${i}'); if(c) c.style.setProperty('display', this.checked ? 'flex' : 'none', 'important');"`;
            const l1OtherInputNode = isL1Other ? `<div class="mt-2" style="display:none;" id="${l1OtherInputId}"><input type="text" class="form-control form-control-sm sub-shop-l1-other" placeholder="具体的なカテゴリをご記入ください"></div>` : '';

            div.innerHTML = `
                <div class="form-check fw-bold">
                    <input class="form-check-input sub-shop-l1" type="checkbox" id="scat_l1_${i}" value="${l1}" ${l1OnchangeCb}>
                    <label class="form-check-label text-dark" for="scat_l1_${i}">${l1}</label>
                </div>
                ${l1OtherInputNode}
                ${l2Html}
            `;
            cont.appendChild(div);
        });
    } else {
        const vCont = document.getElementById('sub_farmer_variety_container');
        vCont.innerHTML = '';
        const searchInput = document.getElementById('farmer_variety_search');
        if (searchInput) searchInput.value = '';

        let vars = applesMaster.map(a => a.name_ja);
        if (vars.length === 0) vars = ['ふじ', 'シナノスイート', '秋映', 'シナノゴールド', '紅玉'];

        vars.forEach((v, i) => {
            const div = document.createElement('div');
            div.className = 'form-check form-check-inline';
            div.innerHTML = `<input class="form-check-input" type="checkbox" id="fvar_${i}" value="${v}"><label class="form-check-label" for="fvar_${i}">${v}</label>`;
            vCont.appendChild(div);
        });
        const vOtherDiv = document.createElement('div');
        vOtherDiv.className = 'form-check form-check-inline';
        vOtherDiv.innerHTML = `<input class="form-check-input" type="checkbox" id="fvar_other_check" value="その他" onchange="document.getElementById('sub_farmer_variety_other').style.display=this.checked?'block':'none';"><label class="form-check-label" for="fvar_other_check">その他</label>`;
        vCont.appendChild(vOtherDiv);

        const pCont = document.getElementById('sub_farmer_product_container');
        pCont.innerHTML = '';

        let prodsMaster = categoriesMaster.filter(c => c.form_type === 'farmer' && c.l1 === '主な加工品目');
        let prods = prodsMaster.map(c => c.l2).filter(l2 => l2 && l2 !== 'その他');

        if (prods.length === 0) prods = ["シードル", "ジュース", "ジャム", "スイーツ"];

        prods.forEach((p, i) => {
            const div = document.createElement('div');
            div.className = 'form-check form-check-inline';
            div.innerHTML = `<input class="form-check-input" type="checkbox" id="fprod_${i}" value="${p}"><label class="form-check-label" for="fprod_${i}">${p}</label>`;
            pCont.appendChild(div);
        });
        const pOtherDiv = document.createElement('div');
        pOtherDiv.className = 'form-check form-check-inline';
        pOtherDiv.innerHTML = `<input class="form-check-input" type="checkbox" id="fprod_other_check" value="その他" onchange="document.getElementById('sub_farmer_product_other').style.display=this.checked?'block':'none';"><label class="form-check-label" for="fprod_other_check">その他</label>`;
        pCont.appendChild(pOtherDiv);
    }
}

function openSubEntityModal(type, id = null) {
    try {
        currentEditingSubType = type;
        currentEditingSubId = id || 'sub_' + Date.now();
        document.getElementById('subEntityForm').reset();
        document.getElementById('sub_id').value = currentEditingSubId;
        document.getElementById('sub_type').value = type;

        document.getElementById('sub_shop_fields').classList.toggle('d-none', type !== 'shop');
        document.getElementById('sub_farmer_fields').classList.toggle('d-none', type !== 'farmer');
        document.getElementById('btnDeleteSubEntity').style.display = id ? 'block' : 'none';

        renderSubEntityCheckboxes(type);

        let dataObj = null;
        if (id) {
            if (type === 'shop') dataObj = currentBizShops.find(s => s.id === id);
            if (type === 'farmer') dataObj = currentBizFarmers.find(f => f.id === id);
        }

        if (dataObj) {
            document.getElementById('sub_use_custom_contact').checked = dataObj.use_custom_contact || false;

            ['zip', 'address', 'url_home', 'url_ec', 'url_ig', 'url_fb', 'url_x', 'url_line', 'email', 'phone', 'image1', 'image2', 'image3', 'image4', 'image5'].forEach(k => {
                const el = document.getElementById('sub_' + k);
                if (el) el.value = dataObj[k] || '';
            });

            ['address', 'url_home', 'url_ec', 'url_ig', 'url_fb', 'url_x', 'url_line', 'email', 'phone'].forEach(k => {
                const chk = document.getElementById('chk_sub_' + k);
                if (chk) {
                    if (k === 'address') {
                        chk.checked = !!(dataObj.zip || dataObj.address);
                    } else {
                        chk.checked = !!dataObj[k];
                    }
                    chk.dispatchEvent(new Event('change'));
                }
            });

            if (type === 'shop') {
                document.getElementById('sub_shop_name').value = dataObj.name || '';
                document.getElementById('sub_shop_intro').value = dataObj.intro || '';

                const selCats = Array.isArray(dataObj.category) ? dataObj.category : (dataObj.category ? dataObj.category.split(',').map(s => s.trim()) : []);

                document.querySelectorAll('#sub_shop_categories_container .sub-shop-l1').forEach(chk => {
                    const isL1Other = chk.value === 'その他';
                    let matched = false;

                    if (isL1Other) {
                        const l1OtherItem = selCats.find(c => c === 'その他' || c.startsWith('その他('));
                        if (l1OtherItem) {
                            matched = true;
                            const otherInput = document.querySelector(`#${chk.id.replace('scat_l1_', 'sub_shop_l1_other_')}`);
                            if (otherInput) {
                                const pm = l1OtherItem.match(/その他\((.+)\)/);
                                otherInput.value = pm ? pm[1] : '';
                            }
                        }
                    } else {
                        matched = selCats.includes(chk.value);
                    }

                    if (matched) {
                        chk.checked = true;
                        chk.dispatchEvent(new Event('change'));
                    } else {
                        chk.checked = false;
                    }
                });

                document.querySelectorAll('#sub_shop_categories_container .sub-shop-l2').forEach(chk => {
                    const val = chk.value;
                    const isL2Other = val === 'その他' || val === 'その他の観光' || val === 'その他の相談' || val === 'その他の産業' || val === 'その他の体験' || val === 'その他（特産品など）' || val === 'その他の暮らし' || val === 'その他のサービス';
                    let matched = false;

                    if (isL2Other) {
                        const escapeRegExp = (string) => string.replace(/[.*+?^${()|[\]\\]/g, '\\$&');
                        const l2OtherItem = selCats.find(c => c === val || c.startsWith(`${val}(`));
                        if (l2OtherItem) {
                            matched = true;
                            const otherInput = document.querySelector(`#${chk.id.replace('scat_', 'sub_shop_cat_other_')}`);
                            if (otherInput) {
                                const re = new RegExp(`^${escapeRegExp(val)}\\((.+)\\)$`);
                                const pm = l2OtherItem.match(re);
                                otherInput.value = pm ? pm[1] : '';
                            }
                        }
                    } else {
                        matched = selCats.includes(val);
                    }

                    if (matched) {
                        chk.checked = true;
                        chk.dispatchEvent(new Event('change'));
                    } else {
                        chk.checked = false;
                    }
                });

                const mode = dataObj.mode || 'simple';
                const modeRadio = document.querySelector(`input[name="sub_shop_mode"][value="${mode}"]`);
                if (modeRadio) {
                    modeRadio.checked = true;
                    modeRadio.dispatchEvent(new Event('change'));
                }

                const sDays = dataObj.simple_days || [];
                ["月", "火", "水", "木", "金", "土", "日"].forEach((d, i) => {
                    const chk = document.getElementById(`sub_shop_simple_day_${i}`);
                    if (chk) chk.checked = sDays.includes(d);
                });
                document.getElementById('sub_shop_simple_s_h').value = dataObj.simple_s_h || '';
                document.getElementById('sub_shop_simple_s_m').value = dataObj.simple_s_m || '';
                document.getElementById('sub_shop_simple_e_h').value = dataObj.simple_e_h || '';
                document.getElementById('sub_shop_simple_e_m').value = dataObj.simple_e_m || '';

                for (let i = 0; i < 7; i++) {
                    const isClosed = dataObj[`c_closed_${i}`] || false;
                    const chk = document.getElementById(`sub_shop_c_closed_${i}`);
                    if (chk) {
                        chk.checked = isClosed;
                        chk.dispatchEvent(new Event('change'));
                    }
                    const elSh = document.getElementById(`sub_shop_c_s_${i}_h`); if (elSh) elSh.value = dataObj[`c_s_${i}_h`] || '';
                    const elSm = document.getElementById(`sub_shop_c_s_${i}_m`); if (elSm) elSm.value = dataObj[`c_s_${i}_m`] || '';
                    const elEh = document.getElementById(`sub_shop_c_e_${i}_h`); if (elEh) elEh.value = dataObj[`c_e_${i}_h`] || '';
                    const elEm = document.getElementById(`sub_shop_c_e_${i}_m`); if (elEm) elEm.value = dataObj[`c_e_${i}_m`] || '';
                }

                document.getElementById('sub_shop_holiday_type').value = dataObj.holiday_type || '';
                document.getElementById('sub_shop_biz_note').value = dataObj.biz_note || '';
                document.getElementById('sub_shop_notes').value = dataObj.notes || '';
                document.getElementById('sub_shop_intro').value = dataObj.intro || '';
            } else {
                document.getElementById('sub_farmer_name').value = dataObj.name || '';

                const varieties = Array.isArray(dataObj.variety) ? dataObj.variety : (dataObj.variety ? dataObj.variety.split(',').map(s => s.trim()) : []);
                document.querySelectorAll('#sub_farmer_variety_container input[type="checkbox"]').forEach(chk => {
                    if (chk.value !== "その他") { chk.checked = varieties.includes(chk.value); }
                    else {
                        if (varieties.includes("その他")) {
                            chk.checked = true;
                            document.getElementById('sub_farmer_variety_other').style.display = 'block';
                            document.getElementById('sub_farmer_variety_other').value = dataObj.variety_other || '';
                        } else {
                            chk.checked = false;
                            document.getElementById('sub_farmer_variety_other').style.display = 'none';
                        }
                    }
                });

                const products = Array.isArray(dataObj.product) ? dataObj.product : (dataObj.product ? dataObj.product.split(',').map(s => s.trim()) : []);
                document.querySelectorAll('#sub_farmer_product_container input[type="checkbox"]').forEach(chk => {
                    if (chk.value !== "その他") { chk.checked = products.includes(chk.value); }
                    else {
                        if (products.includes("その他")) {
                            chk.checked = true;
                            document.getElementById('sub_farmer_product_other').style.display = 'block';
                            document.getElementById('sub_farmer_product_other').value = dataObj.product_other || '';
                        } else {
                            chk.checked = false;
                            document.getElementById('sub_farmer_product_other').style.display = 'none';
                        }
                    }
                });

                document.getElementById('sub_farmer_area').value = dataObj.area || '';
                document.getElementById('sub_farmer_area_unit').value = dataObj.area_unit || 'a';

                const otherCrops = Array.isArray(dataObj.other_crops) ? dataObj.other_crops : (dataObj.other_crops ? dataObj.other_crops.split(',').map(s => s.trim()) : []);
                document.querySelectorAll('#sub_farmer_other_crops_container input[type="checkbox"]').forEach(chk => {
                    chk.checked = otherCrops.includes(chk.value);
                    chk.dispatchEvent(new Event('change'));
                });
                document.getElementById('crop_fruit_detail').value = dataObj.crop_fruit_detail || '';
                document.getElementById('crop_veg_detail').value = dataObj.crop_veg_detail || '';
                document.getElementById('crop_other_detail').value = dataObj.crop_other_detail || '';

                document.getElementById('sub_farmer_intro').value = dataObj.intro || '';
            }
            for(let i=1; i<=5; i++) {
                const val = document.getElementById('sub_image' + i) ? document.getElementById('sub_image' + i).value : '';
                const thumbContainer = document.getElementById('img_preview_container_sub_image' + i);
                const thumbImg = document.getElementById('img_preview_sub_image' + i);
                if(thumbContainer && thumbImg) {
                    if (val) {
                        thumbImg.src = val;
                        thumbContainer.style.display = 'block';
                    } else {
                        thumbImg.src = '';
                        thumbContainer.style.display = 'none';
                    }
                }
            }
            if(typeof updateLocationImageVisibility === 'function') updateLocationImageVisibility();
        } else {
            // New entry: hide all previews and cascade normally
            for(let i=1; i<=5; i++) {
                const thumbContainer = document.getElementById('img_preview_container_sub_image' + i);
                const thumbImg = document.getElementById('img_preview_sub_image' + i);
                if(thumbContainer && thumbImg) {
                    thumbImg.src = '';
                    thumbContainer.style.display = 'none';
                }
            }
            if(typeof updateLocationImageVisibility === 'function') updateLocationImageVisibility();
        }

        toggleSubContactFields();
        const sm = bootstrap.Modal.getOrCreateInstance(document.getElementById('subEntityModal'));
        sm.show();
    } catch (e) {
        alert("モーダル起動エラー: " + e.message);
        console.error("Modal Error:", e);
    }
}

async function saveSubEntity() {
    const type = currentEditingSubType;
    const isShop = type === 'shop';
    const nameEl = document.getElementById(isShop ? 'sub_shop_name' : 'sub_farmer_name');
    if (!nameEl.value.trim()) {
        alert('屋号・名称を入力してください。');
        return;
    }

    const obj = {
        id: currentEditingSubId,
        type: type,
        name: nameEl.value.trim(),
        use_custom_contact: document.getElementById('sub_use_custom_contact').checked,
        zip: document.getElementById('sub_zip') ? document.getElementById('sub_zip').value.trim() : '',
        address: document.getElementById('sub_address') ? document.getElementById('sub_address').value.trim() : '',
        url_home: document.getElementById('sub_url_home') ? document.getElementById('sub_url_home').value.trim() : '',
        phone: document.getElementById('sub_phone') ? document.getElementById('sub_phone').value.trim() : '',
        url_ec: document.getElementById('sub_url_ec') ? document.getElementById('sub_url_ec').value.trim() : '',
        url_ig: document.getElementById('sub_url_ig') ? document.getElementById('sub_url_ig').value.trim() : '',
        url_fb: document.getElementById('sub_url_fb') ? document.getElementById('sub_url_fb').value.trim() : '',
        url_x: document.getElementById('sub_url_x') ? document.getElementById('sub_url_x').value.trim() : '',
        url_line: document.getElementById('sub_url_line') ? document.getElementById('sub_url_line').value.trim() : '',
        email: document.getElementById('sub_email') ? document.getElementById('sub_email').value.trim() : '',
        image1: document.getElementById('sub_image1') ? document.getElementById('sub_image1').value.trim() : '',
        image2: document.getElementById('sub_image2') ? document.getElementById('sub_image2').value.trim() : '',
        image3: document.getElementById('sub_image3') ? document.getElementById('sub_image3').value.trim() : '',
        image4: document.getElementById('sub_image4') ? document.getElementById('sub_image4').value.trim() : '',
        image5: document.getElementById('sub_image5') ? document.getElementById('sub_image5').value.trim() : ''
    };

    if (isShop) {
        const cats = [];
        document.querySelectorAll('#sub_shop_categories_container .sub-shop-l1:checked').forEach(l1Chk => {
            let l1Val = l1Chk.value;
            if (l1Val === 'その他') {
                const l1OtherInput = document.querySelector(`#${l1Chk.id.replace('scat_l1_', 'sub_shop_l1_other_')}`);
                if (l1OtherInput && l1OtherInput.value.trim() !== '') {
                    l1Val = `その他(${l1OtherInput.value.trim()})`;
                }
            }
            cats.push(l1Val);
        });
        document.querySelectorAll('#sub_shop_categories_container .sub-shop-l2:checked').forEach(l2Chk => {
            let l2Val = l2Chk.value;
            const isOther = l2Val === 'その他' || l2Val === 'その他の観光' || l2Val === 'その他の相談' || l2Val === 'その他の産業' || l2Val === 'その他の体験' || l2Val === 'その他（特産品など）' || l2Val === 'その他の暮らし' || l2Val === 'その他のサービス';
            if (isOther) {
                const l2OtherInput = document.querySelector(`#${l2Chk.id.replace('scat_', 'sub_shop_cat_other_')}`);
                if (l2OtherInput && l2OtherInput.value.trim() !== '') {
                    l2Val = `${l2Val}(${l2OtherInput.value.trim()})`;
                }
            }
            cats.push(l2Val);
        });

        obj.category = cats.filter(c => c).join(', ');
        const checkedMode = document.querySelector('input[name="sub_shop_mode"]:checked');
        obj.mode = checkedMode ? checkedMode.value : 'simple';

        obj.simple_days = Array.from(document.querySelectorAll('input[id^="sub_shop_simple_day_"]:checked')).map(chk => chk.value);
        obj.simple_s_h = document.getElementById('sub_shop_simple_s_h').value;
        obj.simple_s_m = document.getElementById('sub_shop_simple_s_m').value;
        obj.simple_e_h = document.getElementById('sub_shop_simple_e_h').value;
        obj.simple_e_m = document.getElementById('sub_shop_simple_e_m').value;

        for (let i = 0; i < 7; i++) {
            const chk = document.getElementById(`sub_shop_c_closed_${i}`);
            obj[`c_closed_${i}`] = chk ? chk.checked : false;
            const elSh = document.getElementById(`sub_shop_c_s_${i}_h`); obj[`c_s_${i}_h`] = elSh ? elSh.value : '';
            const elSm = document.getElementById(`sub_shop_c_s_${i}_m`); obj[`c_s_${i}_m`] = elSm ? elSm.value : '';
            const elEh = document.getElementById(`sub_shop_c_e_${i}_h`); obj[`c_e_${i}_h`] = elEh ? elEh.value : '';
            const elEm = document.getElementById(`sub_shop_c_e_${i}_m`); obj[`c_e_${i}_m`] = elEm ? elEm.value : '';
        }

        obj.holiday_type = document.getElementById('sub_shop_holiday_type').value;
        obj.biz_note = document.getElementById('sub_shop_biz_note').value.trim();
        obj.notes = document.getElementById('sub_shop_notes').value.trim();
        obj.intro = document.getElementById('sub_shop_intro').value.trim();

        const idx = currentBizShops.findIndex(s => s.id === obj.id);
        if (idx > -1) currentBizShops[idx] = obj; else currentBizShops.push(obj);
    } else {
        const vars = Array.from(document.querySelectorAll('#sub_farmer_variety_container input[type="checkbox"]:checked')).map(chk => chk.value);
        obj.variety = vars.join(', ');
        obj.variety_other = document.getElementById('sub_farmer_variety_other').value.trim();

        const prods = Array.from(document.querySelectorAll('#sub_farmer_product_container input[type="checkbox"]:checked')).map(chk => chk.value);
        obj.product = prods.join(', ');
        obj.product_other = document.getElementById('sub_farmer_product_other').value.trim();

        obj.area = document.getElementById('sub_farmer_area').value.trim();
        obj.area_unit = document.getElementById('sub_farmer_area_unit').value;

        const crops = Array.from(document.querySelectorAll('#sub_farmer_other_crops_container input[type="checkbox"]:checked')).map(chk => chk.value);
        obj.other_crops = crops.join(', ');
        obj.crop_fruit_detail = document.getElementById('crop_fruit_detail').value.trim();
        obj.crop_veg_detail = document.getElementById('crop_veg_detail').value.trim();
        obj.crop_other_detail = document.getElementById('crop_other_detail').value.trim();

        obj.intro = document.getElementById('sub_farmer_intro').value.trim();

        const idx = currentBizFarmers.findIndex(f => f.id === obj.id);
        if (idx > -1) currentBizFarmers[idx] = obj; else currentBizFarmers.push(obj);
    }

    const mo = bootstrap.Modal.getInstance(document.getElementById('subEntityModal'));
    if (mo) mo.hide();

    renderSubEntities();
    
    if (window.userRole !== 'contributor') {
        await saveBusinessProfile(true);
        loadBusinessProfile(); // Admin returns to list
    }
}

async function deleteSubEntity() {
    if (!confirm('この情報を削除してもよろしいですか？')) return;
    const id = currentEditingSubId;
    if (currentEditingSubType === 'shop') currentBizShops = currentBizShops.filter(s => s.id !== id);
    if (currentEditingSubType === 'farmer') currentBizFarmers = currentBizFarmers.filter(f => f.id !== id);

    const mo = bootstrap.Modal.getInstance(document.getElementById('subEntityModal'));
    if (mo) mo.hide();
    renderSubEntities();

    if (window.userRole !== 'contributor') {
        await saveBusinessProfile(true);
        loadBusinessProfile(); // Admin returns to list
    }
}

async function saveBusinessProfile() {
    const btn = document.querySelector('button[onclick="saveBusinessProfile()"]');
    const bt = btn ? btn.innerHTML : '';
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 保存中';
        btn.disabled = true;
    }

    const bizData = {};
    document.querySelectorAll('[id^="page_biz_"]').forEach(el => {
        if (el.tagName === 'DIV' || el.tagName === 'SPAN') return;
        const key = el.id.replace('page_biz_', '');
        if (el.type === 'checkbox') {
            bizData[key] = el.checked;
        } else if (el.value !== undefined) {
            if (el.value.trim() !== '') bizData[key] = el.value.trim();
        }
    });

    bizData.shops = currentBizShops;
    bizData.farmers = currentBizFarmers;

    const payload = {
        type: 'business_profile',
        l1: 'business_root',
        title: document.getElementById('displayUsername').innerText + ' の事業者情報',
        business_b_type: (currentBizShops.length > 0 && currentBizFarmers.length > 0) ? 'both' : (currentBizShops.length > 0 ? 'shop' : (currentBizFarmers.length > 0 ? 'farmer' : 'none')),
        business_metadata: Object.keys(bizData).length > 0 ? JSON.stringify(bizData) : ''
    };

    const method = cachedBusinessId ? 'PUT' : 'POST';
    const url = cachedBusinessId ? '/api/content/' + cachedBusinessId : '/api/publish';

    try {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const r = await res.json();
        if (res.ok) {
            showStatus('保存しました');
            if (r.id) cachedBusinessId = r.id;
            
            if (window.userRole !== 'contributor') {
                loadBusinessProfile(); // Admin returns to list view
            } else {
                disableBusinessEdit();
                // Dynamically unlock restricted menus upon first valid profile save
                const nbp = document.getElementById('navBusinessProfile');
                if(nbp) nbp.classList.remove('d-none');
                const nmm = document.getElementById('navMediaMgt');
                if(nmm) nmm.classList.remove('d-none');
            }
        } else { showStatus('保存エラー', 'error'); }
    } catch (e) { showStatus('通信エラー', 'error'); }

    if (btn) {
        btn.innerHTML = bt;
        btn.disabled = false;
    }
}

// --- Business Logo Upload Function ---
async function uploadBusinessLogo(fileObj) {
    if (!fileObj) return;
    const btn = document.getElementById('btn_upload_biz_logo');
    if(btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> アップロード中'; }
    
    let folderTarget = 'business_logos';
    if(window.userRole === 'contributor') {
         folderTarget = `media/${window.userId}`;
    } else if (typeof currentEditingProfileAuthor !== 'undefined' && currentEditingProfileAuthor) {
         folderTarget = `media/${currentEditingProfileAuthor}`;
    }
    
    const formData = new FormData();
    formData.append('file', fileObj);
    formData.append('folder', folderTarget);
    
    try {
        const res = await apiFetch('/api/media', { method: 'POST', body: formData }, true);
        if (res.success && res.url) {
            document.getElementById('page_biz_logo_url').value = window.location.origin + res.url;
            document.getElementById('page_biz_logo_preview').innerHTML = `<img src="${window.location.origin + res.url}" style="width:100%; height:100%; object-fit:cover;">`;
        } else {
            alert('アップロードに失敗しました');
        }
    } catch(e) {
        alert('アップロード中にエラーが発生しました: ' + e.message);
    }
    
    if(btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-camera"></i> アップロード';
    }
    document.getElementById('file_biz_logo').value = '';
}

// --- Location Image Dedicated Upload Functions ---
async function uploadLocationImage(inputId, fileObj) {
    if (!fileObj) return;
    const btnId = 'btn_upload_' + inputId;
    const btn = document.getElementById(btnId);
    if(btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin fa-2x text-muted"></i>'; }
    
    // Auto-detect business context folder mapping
    let folderTarget = 'locations';
    if(window.userRole === 'contributor') {
         folderTarget = `media/${window.userId}`;
    } else if (typeof currentEditingProfileAuthor !== 'undefined' && currentEditingProfileAuthor) {
         folderTarget = `media/${currentEditingProfileAuthor}`;
    }
    
    const formData = new FormData();
    formData.append('file', fileObj);
    formData.append('folder', folderTarget);
    
    try {
        const res = await apiFetch('/api/media', { method: 'POST', body: formData }, true);
        if (res.success && res.url) {
            document.getElementById(inputId).value = window.location.origin + res.url;
            document.getElementById('img_preview_' + inputId).src = res.url;
            document.getElementById('img_preview_container_' + inputId).style.display = 'block';
            updateLocationImageVisibility();
        } else {
            alert('アップロードに失敗しました');
        }
    } catch(e) {
        alert('アップロード中にエラーが発生しました: ' + e.message);
    }
    
    // Clear file trigger to allow re-selection
    const fileElem = document.getElementById('file_' + inputId);
    if(fileElem) fileElem.value = '';
    
    if(btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-plus fa-2x text-muted border-0"></i>'; }
}

function updateLocationImageVisibility() {
    let lastFilled = 0;
    for(let i = 1; i <= 5; i++) {
        const val = document.getElementById('sub_image' + i) ? document.getElementById('sub_image' + i).value : '';
        if (val) lastFilled = i;
    }
    // Show filled ones, plus the first available empty one
    for(let i = 1; i <= 5; i++) {
        const container = document.getElementById('container_sub_image' + i);
        if(!container) continue;
        if (i <= lastFilled + 1 || i === 1) {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }
}

function triggerLocationImageUpload(inputId) {
    const fileTrigger = document.getElementById('file_' + inputId);
    if(fileTrigger) fileTrigger.click();
}

function removeLocationImage(inputId) {
    document.getElementById(inputId).value = '';
    document.getElementById('img_preview_' + inputId).src = '';
    document.getElementById('img_preview_container_' + inputId).style.display = 'none';
    updateLocationImageVisibility();
}
