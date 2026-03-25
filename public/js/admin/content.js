/* ============================
   Content (Articles) Management
   ============================ */

let contentModal = null;
const contentFields = [
    'id', 'status', 'type', 'site_scope', 'l1', 'l2', 'l3_label', 'title', 'lead_text', 'body_text',
    'l1_en', 'l2_en', 'l3_label_en', 'title_en', 'lead_text_en', 'body_text_en',
    'l1_tw', 'l2_tw', 'l3_label_tw', 'title_tw', 'lead_text_tw', 'body_text_tw',
    'image1', 'image2', 'image3', 'image4', 'image5', 'image6',
    'homepage', 'related1_url', 'related1_title', 'related2_url', 'related2_title', 'ec_site',
    'sns_instagram', 'sns_facebook', 'sns_x', 'sns_line', 'sns_tiktok',
    'address', 'contact_form_url', 'contact_email', 'contact_phone', 'remarks', 'download_url',
    'business_days', 'business_start', 'business_end', 'closed_days', 'business_remarks',
    'start_date', 'end_date', 'start_time', 'end_time', 'fee', 'belongings', 'target_audience',
    'organizer_name', 'organizer_contact', 'application_method', 'venue_remarks',
    'business_b_type', 'business_metadata'
];
let isContentEditing = false;

async function fetchContent() {
    const nCont = document.getElementById('newsSitemapContainer');
    const gCont = document.getElementById('generalSitemapContainer');
    if (nCont) nCont.innerHTML = '<div class="text-center text-muted py-5 bg-white rounded shadow-sm"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';
    if (gCont) gCont.innerHTML = '<div class="text-center text-muted py-5 bg-white rounded shadow-sm"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div>';
    
    // Hide General tab if not authorized
    const managedSites = window.managedSites || ['all'];
    const isMainEnabled = managedSites.includes('all') || managedSites.includes('main');
    if (!isMainEnabled) {
        document.getElementById('li-tab-general')?.classList.add('d-none');
        document.getElementById('pane-general')?.classList.add('d-none');
    }

    try {
        const res = await fetch('/api/posts');
        const data = await res.json();
        
        const newsData = data.filter(d => d.type === 'news');
        const generalData = data.filter(d => d.type === 'manual');
        
        renderContentSitemap(newsData, 'newsSitemapContainer');
        renderContentSitemap(generalData, 'generalSitemapContainer');
    } catch (e) { showStatus('エラーが発生しました', 'error'); }
}

function renderContentSitemap(data, containerId = 'contentSitemapContainer') {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    if (!data.length) { container.innerHTML = '<div class="text-center text-muted py-5 bg-white rounded shadow-sm">記事がありません</div>'; return; }

    const sitemap = {};
    data.forEach(item => {
        const l1 = item.l1 || '未分類';
        const l2 = item.l2 || '未分類';
        if (!sitemap[l1]) sitemap[l1] = {};
        if (!sitemap[l1][l2]) sitemap[l1][l2] = [];
        sitemap[l1][l2].push(item);
    });

    let html = '<div class="accordion" id="sitemapAccordion">';
    let counter = 0;

    const l1Order = window.LZ_CONFIG?.MENU_ORDER || ['知る', '味わう', '暮らす', '体験する', '営む'];
    const l1Keys = Object.keys(sitemap).sort((a, b) => {
        const idxA = l1Order.indexOf(a);
        const idxB = l1Order.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b, 'ja');
    });

    for (const l1 of l1Keys) {
        const l2Group = sitemap[l1];
        html += `<div class="bg-white rounded shadow-sm border p-3 mb-4">`;
        html += `<h4 class="fw-bold mb-3" style="color:var(--accent); border-bottom: 2px solid var(--accent); padding-bottom: 5px;"><i class="fa-solid fa-folder-open me-2"></i>${escapeHtml(l1)}</h4>`;

        for (const [l2, items] of Object.entries(l2Group)) {
            const collapseId = 'collapse_' + counter++;
            html += `
            <div class="accordion-item border-0 mb-2">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed bg-light rounded text-dark fw-bold border" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}">
                        <i class="fa-solid fa-folder me-2 text-warning"></i> ${escapeHtml(l2)} <span class="badge bg-secondary ms-2">${items.length}件</span>
                    </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse">
                    <div class="accordion-body p-2 pt-3 bg-white">
                        <div class="row g-3">
            `;

            items.forEach(item => {
                const title = item.title || '<span class="text-muted fst-italic">無題</span>';
                let l3Html = '';
                if (item.l3_label) l3Html = `<span class="badge bg-danger mb-2">${escapeHtml(item.l3_label)}</span>`;
                const imgSrc = item.image1 || 'https://images.unsplash.com/photo-1579619195026-6a56e5f8ceb0?q=80&w=300&auto=format&fit=crop';
                const date = item.created_at ? new Date(item.created_at).toLocaleDateString() : '-';

                html += `
                <div class="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                    <div class="card h-100 border shadow-sm article-card overflow-hidden" style="cursor:pointer; transition: 0.2s;" onclick='openArticlePreview(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
                        <img src="${imgSrc}" class="card-img-top object-fit-cover" style="height: 140px;" alt="画像">
                        <div class="card-body p-3">
                            ${l3Html}
                            <h6 class="card-title fw-bold mb-1" style="font-size:0.95rem;">${title}</h6>
                            <div class="text-muted small mb-2"><i class="fa-regular fa-clock me-1"></i> ${date}</div>
                        </div>
                        <div class="card-footer bg-white border-top-0 pt-0 text-end d-flex justify-content-end gap-2">
                            <button class="btn btn-sm btn-outline-danger fw-bold" onclick='event.stopPropagation(); deleteContentById("${item.id}")'><i class="fa-solid fa-trash"></i> 削除</button>
                            <button class="btn btn-sm btn-outline-brand fw-bold" onclick='event.stopPropagation(); openContentEditor(${JSON.stringify(item).replace(/'/g, "&apos;")})'><i class="fa-solid fa-pen"></i> 編集</button>
                        </div>
                    </div>
                </div>
                `;
            });
            html += `</div></div></div></div>`;
        }
        html += `</div>`;
    }
    html += '</div>';

    if (!document.getElementById('sitemapStyle')) {
        const style = document.createElement('style');
        style.id = 'sitemapStyle';
        style.innerHTML = `
            .article-card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; border-color: var(--accent)!important; }
            .accordion-button:not(.collapsed) { background-color: #f8dbdb; color: var(--accent); }
        `;
        document.head.appendChild(style);
    }
    container.innerHTML = html;
}

let articlePreviewModalInstance = null;

function openArticlePreview(item) {
    if (!articlePreviewModalInstance) {
        articlePreviewModalInstance = new bootstrap.Modal(document.getElementById('articlePreviewModal'));
    }

    document.getElementById('previewTitle').innerHTML = item.title ? escapeHtml(item.title) : '<span class="text-muted fst-italic">無題</span>';

    const catHtml = [];
    if (item.l1) catHtml.push(`<span class="badge bg-dark">${escapeHtml(item.l1)}</span>`);
    if (item.l2) catHtml.push(`<span class="badge bg-secondary">${escapeHtml(item.l2)}</span>`);
    if (item.l3_label) catHtml.push(`<span class="badge bg-danger">${escapeHtml(item.l3_label)}</span>`);
    document.getElementById('previewCategories').innerHTML = catHtml.join('');

    const hdrImg = document.getElementById('previewHeaderImage');
    if (item.image1) {
        hdrImg.style.backgroundImage = `url('${item.image1}')`;
        hdrImg.style.display = 'block';
    } else {
        hdrImg.style.display = 'none';
    }

    document.getElementById('previewLead').innerText = item.lead_text || '';

    let bodyText = item.body_text || '';
    bodyText = escapeHtml(bodyText).replace(/\n/g, '<br>');
    document.getElementById('previewBody').innerHTML = bodyText;

    let galleryHtml = '';
    const images = [item.image2, item.image3, item.image4, item.image5, item.image6].filter(Boolean);
    if (images.length > 0) {
        images.forEach(img => {
            galleryHtml += `<div class="col-6 col-md-4"><img src="${img}" class="img-fluid rounded shadow-sm object-fit-cover" style="height: 120px; width: 100%;"></div>`;
        });
    }
    document.getElementById('previewGallery').innerHTML = galleryHtml;

    let metaHtml = '<ul class="list-unstyled mb-0">';
    if (item.address) metaHtml += `<li><i class="fa-solid fa-location-dot me-2"></i>${escapeHtml(item.address)}</li>`;
    if (item.homepage) metaHtml += `<li><i class="fa-solid fa-link me-2"></i><a href="${item.homepage}" target="_blank" class="text-decoration-none">${escapeHtml(item.homepage)}</a></li>`;
    metaHtml += '</ul>';

    const metaDiv = document.getElementById('previewMeta');
    if (item.address || item.homepage) {
        metaDiv.innerHTML = metaHtml;
        metaDiv.style.display = 'block';
    } else {
        metaDiv.style.display = 'none';
    }

    document.getElementById('previewEditBtn').onclick = () => {
        articlePreviewModalInstance.hide();
        openContentEditor(item);
    };

    articlePreviewModalInstance.show();
}

function openContentEditor(item, newType) {
    if (!contentModal) {
        contentModal = new bootstrap.Modal(document.getElementById('contentModal'));
    }
    isContentEditing = !!item;
    document.getElementById('contentModalTitle').innerText = item ? '記事編集' : '新規作成';
    document.getElementById('btnDeleteContent').style.display = item ? 'inline-block' : 'none';
    document.getElementById('contentForm').reset();
    const targetEl = document.getElementById('content_broadcast_target');
    if (targetEl) targetEl.value = 'editors';

    let targetType = 'manual';
    if (item) targetType = item.type || 'manual';
    else if (newType) targetType = newType;

    let typeEl = document.getElementById('field_type');
    if (!typeEl) {
        typeEl = document.createElement('input');
        typeEl.type = 'hidden';
        typeEl.id = 'field_type';
        document.getElementById('contentForm').appendChild(typeEl);
    }
    typeEl.value = targetType;

    populateCategoryL1();

    // Dynamically configure site_scope dropdown
    const scopeEl = document.getElementById('field_site_scope');
    if (scopeEl) {
        scopeEl.innerHTML = '';
        const managedSites = window.managedSites || ['all'];
        
        if (targetType === 'manual') {
            scopeEl.innerHTML += `<option value="main">りんごのまち・いいづな (Main)</option>`;
        } else {
            if (managedSites.includes('all') || managedSites.includes('main')) {
                scopeEl.innerHTML += `<option value="main">りんごのまち・いいづな (Main)</option>`;
            }
            if (managedSites.includes('all') || managedSites.includes('sourapple')) {
                scopeEl.innerHTML += `<option value="sourapple">iizuna sour apple (特設)</option>`;
            }
        }
        if (scopeEl.options.length > 0) scopeEl.selectedIndex = 0;
    }
    
    // Will set item values below which correctly updates scopeEl if item.site_scope exists

    const triggerEl = document.querySelector('#editorTabs button[data-bs-target="#tab-basic"]');
    bootstrap.Tab.getInstance(triggerEl)?.show() || new bootstrap.Tab(triggerEl).show();

    if (item) {
        const l1El = document.getElementById('field_l1');
        if (l1El) { l1El.value = item.l1 || ''; updateCategoryL2(); }

        const l2El = document.getElementById('field_l2');
        if (l2El) { l2El.value = item.l2 || ''; updateCategoryL3(); }

        const l3El = document.getElementById('field_l3_label');
        if (l3El) { l3El.value = item.l3_label || ''; }

        contentFields.forEach(f => {
            if (f === 'l1' || f === 'l2' || f === 'l3_label') return;
            const el = document.getElementById('field_' + f);
            if (el) el.value = item[f] || '';
        });

        if (item.business_metadata) {
            try {
                const bizObj = JSON.parse(item.business_metadata);
                for (let k in bizObj) {
                    const el = document.getElementById('biz_' + k);
                    if (el) el.value = bizObj[k];
                }
            } catch (e) { }
        }
    } else {
        document.querySelectorAll('[id^="biz_"]').forEach(el => el.value = '');
    }
    toggleSiteScopeFormFields();
    toggleBizFormType();
    contentModal.show();
}

function toggleSiteScopeFormFields() {
    const typeEl = document.getElementById('field_type');
    const isNews = typeEl && typeEl.value === 'news';

    document.getElementById('wrap_l1')?.classList.toggle('d-none', isNews);
    document.getElementById('wrap_l2')?.classList.toggle('d-none', isNews);
    document.getElementById('wrap_l3')?.classList.toggle('d-none', isNews);
    document.getElementById('wrap_lead_text')?.classList.toggle('d-none', isNews);
    document.getElementById('wrap_image6')?.classList.toggle('d-none', isNews);
    document.getElementById('wrap_media_extras')?.classList.toggle('d-none', isNews);

    document.getElementById('ai-generation-box')?.classList.toggle('d-none', isNews);

    document.getElementById('lang-tab')?.parentElement.classList.toggle('d-none', isNews);
    document.getElementById('contact-tab')?.parentElement.classList.toggle('d-none', isNews);

    if (isNews) {
        const activeTab = document.querySelector('#editorTabs .nav-link.active');
        if (activeTab && (activeTab.id === 'lang-tab' || activeTab.id === 'contact-tab')) {
            const triggerEl = document.querySelector('#editorTabs button[data-bs-target="#tab-basic"]');
            bootstrap.Tab.getInstance(triggerEl)?.show() || new bootstrap.Tab(triggerEl).show();
        }
    }

    const broadcastTarget = document.getElementById('content_broadcast_target');
    if (broadcastTarget) {
        Array.from(broadcastTarget.options).forEach(opt => {
            if (['all', 'shop', 'farmer'].includes(opt.value)) {
                opt.classList.toggle('d-none', isNews);
            }
        });
        
        if (isNews && ['all', 'shop', 'farmer'].includes(broadcastTarget.value)) {
            broadcastTarget.value = 'editors';
        }
    }
}

function toggleBizFormType() {
    const el = document.getElementById('field_business_b_type');
    if (!el) return;
    const type = el.value;
    document.getElementById('biz-shop-block').classList.toggle('d-none', type !== 'shop');
    document.getElementById('biz-farmer-block').classList.toggle('d-none', type !== 'farmer');
}

async function saveContent() {
    const bizData = {};
    document.querySelectorAll('[id^="biz_"]').forEach(el => {
        const key = el.id.replace('biz_', '');
        if (el.value.trim() !== '') bizData[key] = el.value.trim();
    });
    const fieldMeta = document.getElementById('field_business_metadata');
    if (fieldMeta) fieldMeta.value = Object.keys(bizData).length > 0 ? JSON.stringify(bizData) : '';

    const payload = {};
    contentFields.forEach(f => {
        if (f === 'id') return;
        const el = document.getElementById('field_' + f);
        if (el) payload[f] = (el.value.trim() !== '') ? el.value.trim() : null;
    });

    const targetEl = document.getElementById('content_broadcast_target');
    if (targetEl && targetEl.value !== 'none') {
        payload.broadcast_target = targetEl.value;
    }

    const method = isContentEditing ? 'PUT' : 'POST';
    const url = isContentEditing ? '/api/content/' + document.getElementById('field_id').value : '/api/publish';

    try {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
            showStatus('保存しました');
            contentModal.hide();
            fetchContent();
        } else { showStatus('保存エラー', 'error'); }
    } catch (e) { showStatus('通信エラー', 'error'); }
}

async function deleteContent() {
    if (!confirm('本当に削除しますか？')) return;
    const id = document.getElementById('field_id').value;
    try {
        const res = await fetch('/api/content/' + id, { method: 'DELETE' });
        if (res.ok) {
            showStatus('削除しました');
            contentModal.hide();
            fetchContent();
        }
    } catch (e) { showStatus('削除エラー', 'error'); }
}

async function deleteContentById(id) {
    if (!confirm('本当にこの記事を削除しますか？')) return;
    try {
        const res = await fetch('/api/content/' + id, { method: 'DELETE' });
        if (res.ok) {
            showStatus('記事を削除しました');
            fetchContent();
        } else {
            showStatus('削除に失敗しました', 'error');
        }
    } catch (e) {
        showStatus('削除エラー', 'error');
    }
}

async function runAutoTranslate() {
    const btn = document.getElementById('aiBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 翻訳中...';
    btn.disabled = true;

    const payload = {
        title: document.getElementById('field_title').value,
        lead_text: document.getElementById('field_lead_text').value,
        body_text: document.getElementById('field_body_text').value
    };

    try {
        const res = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json();
        if (data.ok) {
            document.getElementById('field_title_en').value = data.english.title || '';
            document.getElementById('field_lead_text_en').value = data.english.lead_text || '';
            document.getElementById('field_body_text_en').value = data.english.body_text || '';
            document.getElementById('field_title_tw').value = data.chinese.title || '';
            document.getElementById('field_lead_text_tw').value = data.chinese.lead_text || '';
            document.getElementById('field_body_text_tw').value = data.chinese.body_text || '';
            showStatus('翻訳が完了しました');
        } else { showStatus('翻訳に失敗しました', 'error'); }
    } catch (e) { showStatus('通信エラー', 'error'); }
    btn.innerHTML = '<i class="fa-solid fa-language"></i> 翻訳実行';
    btn.disabled = false;
}

async function generateArticleWithAI() {
    const keywordObj = document.getElementById('ai_keyword');
    const themeObj = document.getElementById('ai_theme');
    const btn = document.getElementById('btnGenerateAI');

    const keyword = keywordObj.value.trim();
    const theme = themeObj.value.trim();

    if (!keyword) {
        alert("検索キーワードを入力してください。");
        return;
    }

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 生成中...';
    btn.disabled = true;

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword, theme })
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg);
        }

        const data = await response.json();

        if (data.title) document.getElementById('field_l3_label').value = data.title;
        if (data.lead) document.getElementById('field_lead_text').value = data.lead;

        let combinedBody = data.body;
        if (data.sources) {
            combinedBody += '\n\n' + data.sources;
        }

        if (combinedBody) document.getElementById('field_body_text').value = combinedBody;

        showStatus("AIによる記事生成が完了しました！内容を確認・調整してください。", 'success');

        const currentLang = document.querySelector('.lang-btn.active').getAttribute('data-lang');
        if (currentLang !== 'ja') {
            document.querySelector('.lang-btn[data-lang="ja"]').click();
        }

    } catch (err) {
        console.error(err);
        alert("AI生成に失敗しました: " + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function exportContentCSV() {
    const btn = document.getElementById('btnExportCSV');
    if(btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 出力中...';
        btn.disabled = true;
    }

    try {
        const res = await fetch('/api/posts');
        const data = await res.json();

        if (!data || data.length === 0) {
            alert("エクスポートする記事データがありません。");
            return;
        }

        // Define headers based on contentFields and adding standard metadata fields
        const excludeFields = ['business_metadata']; // skip raw JSON if you want, or keep it. Let's keep it based on requirement, the db has all.
        const headers = [
            'id', 'created_at', 'updated_at', 'author_id', ...contentFields
        ];
        
        // Remove duplicates in headers just in case
        const uniqueHeaders = [...new Set(headers)];

        // Generate CSV string
        let csvContent = '\uFEFF'; // BOM to support Japanese characters in Excel
        
        // Add header row
        csvContent += uniqueHeaders.map(h => `"${h}"`).join(',') + '\n';
        
        // Add data rows
        data.forEach(row => {
            const rowData = uniqueHeaders.map(header => {
                let cellData = row[header];
                if (cellData === null || cellData === undefined) {
                    cellData = '';
                } else if (typeof cellData === 'object') {
                    cellData = JSON.stringify(cellData);
                } else {
                    cellData = String(cellData);
                }
                
                // Escape double quotes by doubling them, and wrap field in double quotes
                cellData = cellData.replace(/"/g, '""');
                return `"${cellData}"`;
            });
            csvContent += rowData.join(',') + '\n';
        });

        // Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        
        link.setAttribute("href", url);
        link.setAttribute("download", `articles_export_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showStatus('CSVを出力しました');

    } catch (error) {
        console.error("CSV Export failed:", error);
        showStatus('CSV出力に失敗しました', 'error');
    } finally {
        if(btn) {
            btn.innerHTML = '<i class="fa-solid fa-download"></i> CSVエクスポート';
            btn.disabled = false;
        }
    }
}

function parseCSV(str) {
    let arr = [];
    let quote = false;
    let col = 0, row = 0;
    
    for (let c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c+1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';

        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
        if (cc == '"') { quote = !quote; continue; }
        if (cc == ',' && !quote) { ++col; continue; }
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }
        
        arr[row][col] += cc;
    }
    
    // Remove last row if it's completely empty
    if (arr.length > 0 && arr[arr.length - 1].length === 1 && arr[arr.length - 1][0] === '') {
        arr.pop();
    }
    return arr;
}

async function importContentCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!confirm(`${file.name} をインポートします。よろしいですか？\n※既存IDが存在する場合は上書き更新、空欄の場合は新規登録されます。`)) {
        event.target.value = '';
        return;
    }

    const btn = document.getElementById('btnImportCSV');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> インポート中...';
    btn.disabled = true;

    try {
        const text = await file.text();
        // Remove BOM if exists
        const cleanText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
        const rows = parseCSV(cleanText);

        if (rows.length < 2) {
            throw new Error('データが見つかりません。ヘッダー行と少なくとも1件のデータが必要です。');
        }

        const headers = rows[0];
        const payload = [];

        for (let i = 1; i < rows.length; i++) {
            const rowData = rows[i];
            const item = {};
            let isEmptyRow = true;
            headers.forEach((header, index) => {
                let val = rowData[index] || '';
                if (val.trim() !== '') isEmptyRow = false;
                item[header] = val;
            });
            
            if (!isEmptyRow) {
                payload.push(item);
            }
        }

        const res = await fetch('/api/content/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (data.ok) {
            showStatus(`CSVをインポートしました (${data.inserted}件追加, ${data.updated}件更新)`, 'success');
            fetchContent();
        } else {
            showStatus(`インポート失敗: ${data.error}`, 'error');
        }

    } catch (e) {
        console.error('Import CSV Error:', e);
        showStatus(`インポートエラー: ${e.message}`, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        event.target.value = ''; // Reset input to allow re-upload
    }
}
