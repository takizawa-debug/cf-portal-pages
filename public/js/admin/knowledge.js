/* ============================
   Knowledge Base Management
   ============================ */

let knowledgeModal = null;

function toggleKnowledgeInput() {
    const type = document.getElementById('kn_type').value;
    document.getElementById('kn_input_text').style.display = type === 'text' ? 'block' : 'none';
    document.getElementById('kn_input_url').style.display = type === 'url' ? 'block' : 'none';
    document.getElementById('kn_input_pdf').style.display = type === 'pdf' ? 'block' : 'none';
}

async function fetchKnowledge() {
    document.getElementById('knowledgeTableBody').innerHTML = '<tr><td colspan="3" class="text-center text-muted">Loading...</td></tr>';
    try {
        const res = await fetch('/api/knowledge');
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderKnowledgeTable(data);
    } catch (e) { showStatus('エラー', 'error'); }
}

function renderKnowledgeTable(items) {
    const tbody = document.getElementById('knowledgeTableBody');
    tbody.innerHTML = '';
    if (!items || !items.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">ドキュメントがありません</td></tr>';
        return;
    }
    items.forEach(k => {
        const date = k.created_at ? new Date(k.created_at).toLocaleDateString() : '-';
        const preview = (k.content || '').substring(0, 80) + '...';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold">${escapeHtml(k.title)}</td>
            <td class="text-muted small" style="max-width:300px;">${escapeHtml(preview)}</td>
            <td class="text-end" style="min-width:180px;">
                <button class="btn btn-sm btn-outline-secondary fw-bold" onclick='openKnowledgeEditor(${JSON.stringify(k).replace(/'/g, "&apos;")})'>
                    <i class="fa-solid fa-pen"></i> 編集
                </button>
                <button class="btn btn-sm btn-outline-danger fw-bold ms-1" onclick='deleteKnowledge("${k.id}")'>
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openKnowledgeEditor(item) {
    if (!knowledgeModal) {
        knowledgeModal = new bootstrap.Modal(document.getElementById('knowledgeModal'));
    }
    document.getElementById('knowledgeForm').reset();
    document.getElementById('kn_type').value = 'text';
    toggleKnowledgeInput();

    if (item) {
        document.getElementById('kn_id').value = item.id;
        document.getElementById('kn_title').value = item.title;
        document.getElementById('kn_content').value = item.content || '';
        document.getElementById('btnDeleteKnowledge').style.display = 'inline-block';
    } else {
        document.getElementById('kn_id').value = '';
        document.getElementById('btnDeleteKnowledge').style.display = 'none';
    }
    knowledgeModal.show();
}

async function saveKnowledge() {
    const id = document.getElementById('kn_id').value;
    const title = document.getElementById('kn_title').value.trim();
    const type = document.getElementById('kn_type').value;

    if (!title) return showStatus('タイトルは必須です', 'error');

    let url, fetchOptions;

    if (type === 'text') {
        const content = document.getElementById('kn_content').value.trim();
        if (!content) return showStatus('本文を入力してください', 'error');
        const payload = { title, content };
        const method = id ? 'PUT' : 'POST';
        url = id ? '/api/knowledge/' + id : '/api/knowledge';
        fetchOptions = { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) };
    } else if (type === 'url') {
        const sourceUrl = document.getElementById('kn_source_url').value.trim();
        if (!sourceUrl) return showStatus('URLを入力してください', 'error');
        const method = id ? 'PUT' : 'POST';
        url = id ? '/api/knowledge/' + id : '/api/knowledge';
        fetchOptions = { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, source_url: sourceUrl }) };
    } else {
        const fileInput = document.getElementById('kn_file');
        if (!fileInput.files.length) return showStatus('ファイルを選択してください', 'error');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', fileInput.files[0]);
        const method = id ? 'PUT' : 'POST';
        url = id ? '/api/knowledge/' + id : '/api/knowledge';
        fetchOptions = { method, body: formData };
    }

    document.getElementById('kn_loading').style.display = 'block';
    const saveBtn = document.querySelector('#knowledgeModal .btn-brand');
    const cancelBtn = document.querySelector('#knowledgeModal .btn-secondary');
    if (saveBtn) saveBtn.disabled = true;
    if (cancelBtn) cancelBtn.disabled = true;

    try {
        const res = await fetch(url, fetchOptions);
        if (res.ok) {
            showStatus('保存しました');
            knowledgeModal.hide();
            fetchKnowledge();
        } else {
            const e = await res.json();
            showStatus(e.error || 'エラー: ' + res.statusText, 'error');
        }
    } catch (e) {
        showStatus('通信エラー', 'error');
    } finally {
        document.getElementById('kn_loading').style.display = 'none';
        if (saveBtn) saveBtn.disabled = false;
        if (cancelBtn) cancelBtn.disabled = false;
    }
}

async function deleteKnowledge(id) {
    if (!confirm('削除しますか？')) return;
    try {
        const res = await fetch('/api/knowledge/' + id, { method: 'DELETE' });
        if (res.ok) { showStatus('削除しました'); fetchKnowledge(); }
    } catch (e) { }
}
