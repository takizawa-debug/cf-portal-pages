/* ============================
   SEO Keywords Management
   ============================ */

let keywordModal = null;
let isKeywordEditing = false;

async function fetchKeywords() {
    document.getElementById('keywordTableBody').innerHTML = '<tr><td colspan="5" class="text-center text-muted">Loading...</td></tr>';
    try {
        const res = await fetch('/api/keywords');
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderKeywordTable(data);
    } catch (e) { showStatus('エラー', 'error'); }
}

function extractTranslations(rawString) {
    let ja = rawString;
    let en = "";
    let zh = "";
    const match = rawString.match(/(.+?)\s*\(\s*en:\s*(.*?),\s*zh:\s*(.*?)\s*\)/i);
    if (match) {
        ja = match[1].trim();
        en = match[2].trim();
        zh = match[3].trim();
    }
    return { ja, en, zh };
}

function renderKeywordTable(items) {
    const tbody = document.getElementById('keywordTableBody');
    tbody.innerHTML = '';
    if (!items || !items.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">キーワードがありません。</td></tr>'; return; }
    items.forEach(k => {
        const { ja, en, zh } = extractTranslations(k.keyword);
        const date = k.created_at ? new Date(k.created_at).toLocaleDateString() : '-';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold"><span class="badge bg-danger rounded-pill px-3 py-1 fs-6">${ja}</span></td>
            <td class="text-muted">${en || '-'}</td>
            <td class="text-muted">${zh || '-'}</td>
            <td class="text-muted small">${date}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary fw-bold" onclick='openKeywordEditor(${JSON.stringify(k).replace(/'/g, "&apos;")})'>
                    <i class="fa-solid fa-pen"></i> 編集
                </button>
                <button class="btn btn-sm btn-outline-danger fw-bold ms-1" onclick='deleteKeyword("${k.id}")'>
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openKeywordEditor(item) {
    if (!keywordModal) {
        keywordModal = new bootstrap.Modal(document.getElementById('keywordModal'));
    }
    isKeywordEditing = !!item;
    document.getElementById('keywordForm').reset();

    if (item) {
        const { ja, en, zh } = extractTranslations(item.keyword);
        document.getElementById('kw_id').value = item.id;
        document.getElementById('kw_name_ja').value = ja;
        document.getElementById('kw_name_en').value = en;
        document.getElementById('kw_name_zh').value = zh;
        document.getElementById('btnDeleteKeyword').style.display = 'inline-block';
    } else {
        document.getElementById('kw_id').value = '';
        document.getElementById('btnDeleteKeyword').style.display = 'none';
    }
    keywordModal.show();
}

async function saveKeyword() {
    const id = document.getElementById('kw_id').value;
    const ja = document.getElementById('kw_name_ja').value.trim();
    const en = document.getElementById('kw_name_en').value.trim();
    const zh = document.getElementById('kw_name_zh').value.trim();

    if (!ja) return showStatus('日本語キーワードは必須です', 'error');

    let formatKeyword = ja;
    if (en || zh) {
        formatKeyword = `${ja} (en: ${en || ''}, zh: ${zh || ''})`;
    }

    const method = isKeywordEditing ? 'PUT' : 'POST';
    const url = isKeywordEditing ? '/api/keywords/' + id : '/api/keywords';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keyword: formatKeyword, priority: 'high' })
        });
        if (res.ok) {
            showStatus('保存しました');
            keywordModal.hide();
            fetchKeywords();
        } else { showStatus('保存エラー', 'error'); }
    } catch (e) { showStatus('通信エラー', 'error'); }
}

async function deleteKeyword(id) {
    if (!confirm('削除しますか？')) return;
    try {
        const res = await fetch('/api/keywords/' + id, { method: 'DELETE' });
        if (res.ok) { showStatus('削除しました'); fetchKeywords(); }
    } catch (e) { }
}
