/* ============================
   Inquiry Management
   ============================ */

async function fetchInquiries() {
    setLoading('inquiryTableBody', 5);
    try {
        const res = await apiFetch('/api/inquiries');
        const tbody = document.getElementById('inquiryTableBody');
        tbody.innerHTML = '';
        if (!res.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">お問い合わせはありません</td></tr>';
            return;
        }

        res.forEach(item => {
            const statusBadge = item.status === 'unread'
                ? '<span class="badge bg-danger rounded-pill">未読</span>'
                : '<span class="badge bg-secondary rounded-pill">確認済</span>';

            let filesHTML = '-';
            try {
                const files = JSON.parse(item.files_json || '[]');
                if (files.length > 0) {
                    filesHTML = `<span class="badge bg-info"><i class="fa-solid fa-paperclip"></i> ${files.length}件の添付</span>`;
                }
            } catch (e) { }

            const tr = document.createElement('tr');
            tr.style.cursor = 'pointer';
            tr.onclick = (e) => {
                if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'I') {
                    viewInquiry(item);
                }
            };

            tr.innerHTML = `
                <td>${statusBadge}</td>
                <td class="small">${new Date(item.created_at).toLocaleString('ja-JP')}</td>
                <td><span class="badge bg-light text-dark border">${item.form_type}</span></td>
                <td>${filesHTML}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-brand" onclick="viewInquiry(${escapeHtml(JSON.stringify(item))})">
                        詳細確認
                    </button>
                    ${item.status === 'unread' ? `
                    <button class="btn btn-sm btn-outline-secondary" onclick="markInquiry('${item.id}', 'read', event)">
                        既読
                    </button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        document.getElementById('inquiryTableBody').innerHTML = `<tr><td colspan="5" class="text-danger text-center"><i class="fa-solid fa-triangle-exclamation"></i> 取得に失敗: ${err.message}</td></tr>`;
    }
}

async function markInquiry(id, targetStatus, event) {
    if (event) event.stopPropagation();
    try {
        await apiFetch('/api/inquiries/status', {
            method: 'PUT',
            body: JSON.stringify({ id, status: targetStatus })
        });
        fetchInquiries();
    } catch (err) {
        alert('ステータスの更新に失敗しました: ' + err.message);
    }
}

function viewInquiry(itemObj) {
    const item = typeof itemObj === 'string' ? JSON.parse(itemObj) : itemObj;

    const tbody = document.getElementById('inquiryDetailBody');

    let payload = {};
    try { payload = JSON.parse(item.payload_json); } catch (e) { }

    let files = [];
    try { files = JSON.parse(item.files_json); } catch (e) { }

    let html = `
        <div class="bg-white p-3 border rounded mb-3 shadow-sm">
            <h6 class="fw-bold border-bottom pb-2 text-brand">送信メタデータ</h6>
            <div class="row text-sm">
                <div class="col-6 mb-2"><strong>ID:</strong> <span class="text-muted">${item.id}</span></div>
                <div class="col-6 mb-2"><strong>投稿日時:</strong> <span class="text-muted">${new Date(item.created_at).toLocaleString('ja-JP')}</span></div>
                <div class="col-6 mb-2"><strong>フォーム種別:</strong> <span class="badge bg-secondary">${item.form_type}</span></div>
            </div>
        </div>
    `;

    html += `<h6 class="fw-bold text-dark mb-3 mt-4"><i class="fa-solid fa-list-ul"></i> 入力情報</h6><table class="table table-bordered table-striped" style="font-size:0.9rem;"><tbody>`;
    for (let [key, val] of Object.entries(payload)) {
        if (typeof val === 'object') val = JSON.stringify(val);
        html += `<tr><th style="width:30%; background:#f8f9fa;">${escapeHtml(key)}</th><td>${escapeHtml(String(val)).replace(/\n/g, '<br>')}</td></tr>`;
    }
    html += `</tbody></table>`;

    if (files && files.length > 0) {
        html += `<h6 class="fw-bold text-dark mt-4 mb-3"><i class="fa-solid fa-folder-open"></i> 添付ファイル (R2 Storage)</h6><ul class="list-group list-group-flush border rounded">`;
        files.forEach(f => {
            html += `<li class="list-group-item d-flex justify-content-between align-items-center bg-light text-sm">
                <span><i class="fa-solid ${f.type === 'image' ? 'fa-image' : 'fa-file-pdf'} text-muted me-2"></i> ${escapeHtml(f.fileName || f.key.split('/').pop())}</span>
                <span class="badge bg-secondary rounded-pill">Object Key: ${f.key}</span>
            </li>`;
        });
        html += `</ul>`;
    }

    if (item.status === 'unread') {
        markInquiry(item.id, 'read', null);
    }

    tbody.innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById('inquiryDetailModal'));
    modal.show();
}
