/* ============================
   Category Master Management
   ============================ */

let categoriesMaster = [];
let categoryModal = null;
let isCategoryEditing = false;

async function fetchCategoriesMaster() {
    try {
        const res = await fetch('/api/categories');
        if (res.ok) {
            categoriesMaster = await res.json();
            populateCategoryL1();
            renderCategoryTable();
        }
    } catch (e) { }
}

function populateCategoryL1() {
    const l1Select = document.getElementById('field_l1');
    if (!l1Select) return;
    const currentVal = l1Select.value;
    l1Select.innerHTML = '<option value="">選択してください</option>';

    const l1s = [...new Set(categoriesMaster.filter(c => c.form_type === 'article').map(c => c.l1).filter(Boolean))];
    l1s.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val; opt.textContent = val;
        l1Select.appendChild(opt);
    });
    if (currentVal) l1Select.value = currentVal;
}

function updateCategoryL2() {
    const l1 = document.getElementById('field_l1').value;
    const l2Select = document.getElementById('field_l2');
    const l3Select = document.getElementById('field_l3_label');

    l2Select.innerHTML = '<option value="">選択してください</option>';
    l3Select.innerHTML = '<option value="">選択してください</option>';
    clearCategoryTranslations();

    if (!l1) return;

    const l2s = [...new Set(categoriesMaster.filter(c => c.l1 === l1 && c.form_type === 'article').map(c => c.l2).filter(Boolean))];
    l2s.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val; opt.textContent = val;
        l2Select.appendChild(opt);
    });
    syncCategoryTranslations();
}

function updateCategoryL3() {
    const l1 = document.getElementById('field_l1').value;
    const l2 = document.getElementById('field_l2').value;
    const l3Select = document.getElementById('field_l3_label');

    l3Select.innerHTML = '<option value="">選択してください</option>';
    clearCategoryTranslations();

    if (!l1 || !l2) return;

    const l3s = [...new Set(categoriesMaster.filter(c => c.l1 === l1 && c.l2 === l2 && c.form_type === 'article').map(c => c.l3).filter(Boolean))];
    l3s.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val; opt.textContent = val;
        l3Select.appendChild(opt);
    });

    syncCategoryTranslations();
}

function syncCategoryTranslations() {
    const l1 = document.getElementById('field_l1').value;
    const l2 = document.getElementById('field_l2').value;
    const l3 = document.getElementById('field_l3_label').value;

    let match = categoriesMaster.find(c => c.l1 === l1 && c.l2 === (l2 || "") && c.l3 === (l3 || "") && c.form_type === 'article');
    if (!match && !l3) {
        match = categoriesMaster.find(c => c.l1 === l1 && c.l2 === (l2 || "") && c.form_type === 'article');
    }
    if (!match && !l2) {
        match = categoriesMaster.find(c => c.l1 === l1 && c.form_type === 'article');
    }

    if (match) {
        document.getElementById('field_l1_en').value = match.l1_en || "";
        document.getElementById('field_l2_en').value = match.l2_en || "";
        document.getElementById('field_l3_label_en').value = match.l3_en || "";

        document.getElementById('field_l1_tw').value = match.l1_zh || "";
        document.getElementById('field_l2_tw').value = match.l2_zh || "";
        document.getElementById('field_l3_label_tw').value = match.l3_zh || "";
    } else {
        clearCategoryTranslations();
    }
}

function clearCategoryTranslations() {
    document.getElementById('field_l1_en').value = "";
    document.getElementById('field_l2_en').value = "";
    document.getElementById('field_l3_label_en').value = "";
    document.getElementById('field_l1_tw').value = "";
    document.getElementById('field_l2_tw').value = "";
    document.getElementById('field_l3_label_tw').value = "";
}

function renderCategoryTable() {
    const bodies = {
        'article': document.getElementById('categoryArticleTableBody'),
        'shop': document.getElementById('categoryShopTableBody'),
        'farmer': document.getElementById('categoryFarmerTableBody'),
        'event': document.getElementById('categoryEventTableBody')
    };

    const grouped = { 'article': [], 'shop': [], 'farmer': [], 'event': [] };
    categoriesMaster.forEach(c => {
        if (grouped[c.form_type]) {
            grouped[c.form_type].push(c);
        }
    });

    Object.keys(bodies).forEach(type => {
        const tbody = bodies[type];
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const list = grouped[type];
        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">カテゴリがありません</td></tr>';
        } else {
            list.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="fw-bold">${c.l1 || '-'}</td>
                    <td>${c.l2 || '<span class="text-muted">-</span>'}</td>
                    <td>${c.l3 || '<span class="text-muted">-</span>'}</td>
                    <td class="text-muted small">
                        ${c.l1_en ? `<div><span class="badge bg-light text-dark border me-1">EN</span> ${c.l1_en} / ${c.l2_en || ''} / ${c.l3_en || ''}</div>` : '-'}
                    </td>
                    <td class="text-muted small">
                        ${c.l1_zh ? `<div><span class="badge bg-light text-dark border me-1">ZH</span> ${c.l1_zh} / ${c.l2_zh || ''} / ${c.l3_zh || ''}</div>` : '-'}
                    </td>
                    <td class="text-end" style="min-width:120px;">
                        <button class="btn btn-sm btn-outline-secondary fw-bold" onclick='openCategoryEditor(${JSON.stringify(c).replace(/'/g, "&apos;")})'>
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger fw-bold ms-1" onclick='deleteCategoryMaster("${c.id}")'><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    });
}

async function deleteCategoryMaster(id) {
    if (!confirm('削除しますか？')) return;
    await fetch('/api/categories/' + id, { method: 'DELETE' });
    fetchCategoriesMaster();
}

function openCategoryEditor(item) {
    if (!categoryModal) {
        categoryModal = new bootstrap.Modal(document.getElementById('categoryMasterModal'));
    }
    isCategoryEditing = !!item;
    document.getElementById('categoryMasterForm').reset();

    if (item) {
        document.getElementById('cat_id').value = item.id;
        document.getElementById('cat_form_type').value = item.form_type || 'shop';
        document.getElementById('cat_l1').value = item.l1 || "";
        document.getElementById('cat_l2').value = item.l2 || "";
        document.getElementById('cat_l3').value = item.l3 || "";
        document.getElementById('cat_l1_en').value = item.l1_en || "";
        document.getElementById('cat_l2_en').value = item.l2_en || "";
        document.getElementById('cat_l3_en').value = item.l3_en || "";
        document.getElementById('cat_l1_zh').value = item.l1_zh || "";
        document.getElementById('cat_l2_zh').value = item.l2_zh || "";
        document.getElementById('cat_l3_zh').value = item.l3_zh || "";
    } else {
        document.getElementById('cat_id').value = '';
    }
    categoryModal.show();
}

async function saveCategoryMaster() {
    const id = document.getElementById('cat_id').value;
    const method = isCategoryEditing ? 'PUT' : 'POST';
    const url = isCategoryEditing ? '/api/categories/' + id : '/api/categories';

    const payload = {
        form_type: document.getElementById('cat_form_type').value,
        l1: document.getElementById('cat_l1').value.trim(),
        l2: document.getElementById('cat_l2').value.trim(),
        l3: document.getElementById('cat_l3').value.trim(),
        l1_en: document.getElementById('cat_l1_en').value.trim(),
        l2_en: document.getElementById('cat_l2_en').value.trim(),
        l3_en: document.getElementById('cat_l3_en').value.trim(),
        l1_zh: document.getElementById('cat_l1_zh').value.trim(),
        l2_zh: document.getElementById('cat_l2_zh').value.trim(),
        l3_zh: document.getElementById('cat_l3_zh').value.trim()
    };
    if (!payload.l1) return showStatus('大カテゴリ(L1)は必須です', 'error');

    const saveBtn = document.querySelector('#categoryMasterModal .btn-brand');
    if (saveBtn) saveBtn.disabled = true;

    try {
        const res = await fetch(url, {
            method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (res.ok) { showStatus('保存しました'); categoryModal.hide(); fetchCategoriesMaster(); }
        else { showStatus('保存エラー', 'error'); }
    } catch (e) {
        showStatus('通信エラー', 'error');
    } finally {
        if (saveBtn) saveBtn.disabled = false;
    }
}
