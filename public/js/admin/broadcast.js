// Broadcast Management

async function updateBroadcastPreview() {
    const targetType = document.getElementById('broadcast_target_type').value;
    const channel = document.getElementById('broadcast_channel').value;
    const badge = document.getElementById('broadcast_preview_badge');
    
    badge.className = 'badge bg-secondary py-2 px-3 fw-normal';
    badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> 計算中...';

    try {
        const res = await apiFetch(`/api/broadcast_preview?target_type=${targetType}&channel=${channel}&t=${Date.now()}`);
        if (res.ok) {
            badge.className = 'badge bg-brand py-2 px-3 fw-bold';
            badge.innerHTML = `<i class="fa-solid fa-users me-1"></i> 配信予定: ${res.count}件 (LINE: ${res.line_count}, Email: ${res.email_count})`;
        } else {
            badge.className = 'badge bg-danger py-2 px-3 fw-normal';
            badge.innerText = 'エラー: 計算失敗';
        }
    } catch(e) {
        badge.className = 'badge bg-danger py-2 px-3 fw-normal';
        badge.innerText = '通信エラー';
    }
}

async function sendBroadcast() {
    const targetType = document.getElementById('broadcast_target_type').value;
    const channel = document.getElementById('broadcast_channel').value;
    const message = document.getElementById('broadcast_message').value;

    if (!message || message.trim() === '') {
        showStatus('メッセージを入力してください。', 'error');
        return;
    }

    if (!confirm('メッセージの一斉送信を実行します。よろしいですか？')) return;

    const btn = document.getElementById('btn_send_broadcast');
    const ogHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 送信中...';
    document.getElementById('broadcast_result_container').classList.add('d-none');

    try {
        // Assume apiFetch is available from auth.js/ui.js
        const payload = {
            target_type: targetType,
            channel: channel,
            message: message,
            image_urls: typeof broadcastAttachments !== 'undefined' ? broadcastAttachments.map(a => a.url) : []
        };
        const data = await apiFetch('/api/broadcast', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (data.ok && data.summary) {
            document.getElementById('broadcast_result_container').classList.remove('d-none');
            
            const ls = data.summary.line;
            const es = data.summary.email;
            
            document.getElementById('res_line_attempt').innerText = ls.attempted;
            document.getElementById('res_line_success').innerText = ls.success;
            document.getElementById('res_line_fail').innerText = ls.failed;
            
            document.getElementById('res_email_attempt').innerText = es.attempted;
            document.getElementById('res_email_success').innerText = es.success;
            document.getElementById('res_email_fail').innerText = es.failed;

            document.getElementById('broadcast_message').value = '';
            showStatus('送信が完了しました', 'success');
        } else {
            showStatus(data.error || '送信エラーが発生しました', 'error');
        }
    } catch(e) {
        showStatus('通信エラー: ' + e.message, 'error');
    }

    btn.disabled = false;
    btn.innerHTML = ogHtml;
}

/* ============================
   Broadcast Attachment UI (Phase 19 Multi-Array)
============================ */
let broadcastAttachments = [];
const MAX_ATTACHMENTS = 4;
const MAX_TOTAL_SIZE_MB = 10;
const MAX_TOTAL_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

function openBroadcastMediaPicker() {
    window.currentMediaSelectTarget = 'broadcast_media_catcher_multi';
    if (typeof renderMediaSelectGrid === 'function') renderMediaSelectGrid();
    new bootstrap.Modal(document.getElementById('mediaSelectModal')).show();
}

function removeBroadcastAttachment(idx) {
    broadcastAttachments.splice(idx, 1);
    renderBroadcastAttachments();
}

function renderBroadcastAttachments() {
    const list = document.getElementById('broadcast_attachment_list');
    const status = document.getElementById('broadcast_attachment_status');
    if (!list || !status) return;

    list.innerHTML = '';
    let currentTotalBytes = broadcastAttachments.reduce((sum, a) => sum + a.size, 0);
    const mbTotal = (currentTotalBytes / (1024 * 1024)).toFixed(1);

    status.innerHTML = `<span class="${currentTotalBytes > MAX_TOTAL_BYTES * 0.8 ? 'text-danger' : 'text-secondary'}">
        <i class="fa-solid fa-chart-pie me-1"></i> ${broadcastAttachments.length} / ${MAX_ATTACHMENTS}件 (${mbTotal} MB / ${MAX_TOTAL_SIZE_MB}MB)
    </span>`;

    broadcastAttachments.forEach((att, idx) => {
        const itemMb = (att.size / (1024 * 1024)).toFixed(2);
        const iconHtml = att.isImage 
            ? `<img src="${att.url}" class="w-100 h-100 object-fit-cover" style="border-radius:3px;">` 
            : `<i class="fa-solid fa-file text-muted fa-lg"></i>`;

        list.innerHTML += `
            <div class="d-flex align-items-center bg-white border rounded p-2 shadow-sm gap-3">
                <div style="width:40px; height:40px;" class="bg-light d-flex justify-content-center align-items-center rounded border">
                    ${iconHtml}
                </div>
                <div class="flex-grow-1" style="min-width:0;">
                    <div class="fw-bold small text-truncate text-dark">${att.name}</div>
                    <div class="text-muted" style="font-size:0.75rem;">${itemMb} MB</div>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="removeBroadcastAttachment(${idx})" title="削除"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Hidden injection to trap events from media.js
    const hiddenCatcher = document.createElement('input');
    hiddenCatcher.type = 'hidden';
    hiddenCatcher.id = 'broadcast_media_catcher_multi';
    document.body.appendChild(hiddenCatcher);

    hiddenCatcher.addEventListener('input', async function() {
        const url = this.value;
        this.value = ''; 
        if (!url) return;

        if (broadcastAttachments.length >= MAX_ATTACHMENTS) {
            alert(`添付ファイルは最大${MAX_ATTACHMENTS}個までです。制限を越えるためブロックしました。`);
            return;
        }
        if (broadcastAttachments.find(a => a.url === url)) {
            alert('そのファイルは既に添付されています。');
            return;
        }

        const initialBtnHtml = document.getElementById('broadcast_attachment_status').innerHTML;
        document.getElementById('broadcast_attachment_status').innerHTML = '<span class="text-muted"><i class="fa-solid fa-spinner fa-spin me-1"></i> 計算中...</span>';

        try {
            const res = await fetch(url, { method: 'HEAD' });
            const sizeBytes = parseInt(res.headers.get('content-length') || '0', 10);
            
            const currentTotal = broadcastAttachments.reduce((sum, a) => sum + a.size, 0);
            if (currentTotal + sizeBytes > MAX_TOTAL_BYTES) {
                alert(`ファイルの合計サイズが ${MAX_TOTAL_SIZE_MB} MB を超えます。\n送信インフラの制限のため追加できません。`);
                renderBroadcastAttachments();
                return;
            }

            let filename = url.split('/').pop() || 'file';
            try { filename = decodeURIComponent(filename); } catch (e) { }

            broadcastAttachments.push({
                url: url,
                name: filename,
                size: sizeBytes,
                isImage: url.match(/\.(jpeg|jpg|png|webp|gif|svg)$/i) !== null
            });
            renderBroadcastAttachments();

        } catch (error) {
            console.error(error);
            alert("ファイルの容量検出に失敗しました。ファイルがアクセス可能か確認してください。");
            document.getElementById('broadcast_attachment_status').innerHTML = initialBtnHtml;
        }
    });
});
