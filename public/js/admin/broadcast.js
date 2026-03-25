// Broadcast Management

async function updateBroadcastPreview() {
    const targetType = document.getElementById('broadcast_target_type').value;
    const channel = document.getElementById('broadcast_channel').value;
    const badge = document.getElementById('broadcast_preview_badge');
    
    badge.className = 'badge bg-secondary py-2 px-3 fw-normal';
    badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> 計算中...';

    try {
        // Add cache buster to circumvent aggressive edge caching
        const timestamp = Date.now();
        const res = await apiFetch(`/api/broadcast_preview?target_type=${targetType}&channel=${channel}&t=${timestamp}`);
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

    let scheduledAt = null;
    if (document.getElementById('timingSchedule').checked) {
        const localVal = document.getElementById('broadcast_scheduled_at').value;
        if (!localVal) {
            alert("予約送信の日時を指定してください。");
            return;
        }
        
        // Convert the user's localized browser Date strictly into SQLite native UTC mapping 
        // Example: '2026-03-25T21:55' JST -> '2026-03-25 12:55:00' UTC
        const d = new Date(localVal);
        const pad = n => n.toString().padStart(2, '0');
        scheduledAt = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
    }

    if (!message || message.trim() === '') {
        alert("メッセージ本文を入力してください。");
        return;
    }
    
    if (scheduledAt) {
        if (!confirm("指定した日時での予約送信を確定しますか？")) return;
    } else {
        if (!confirm("本当に一斉送信を実行しますか？この操作は取り消せません。")) return;
    }

    const btn = document.getElementById('btn_send_broadcast');
    const ogHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>送信処理中...';
    document.getElementById('broadcast_result_container').classList.add('d-none');

    try {
        // Assume apiFetch is available from auth.js/ui.js
        const payload = {
            target_type: targetType,
            channel: channel,
            message: message,
            image_urls: typeof broadcastAttachments !== 'undefined' ? broadcastAttachments.map(a => a.url) : [],
            scheduled_at: scheduledAt
        };
        const data = await apiFetch('/api/broadcast', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        if (data.ok && data.summary) {
            document.getElementById('broadcast_result_container').classList.remove('d-none');
            
            if (scheduledAt) {
                document.getElementById('broadcast_result_container').innerHTML = `
                    <h5 class="fw-bold mb-3 text-brand"><i class="fa-solid fa-clock me-2"></i>配信予約完了</h5>
                    <p class="text-muted small">指定された日時に自動的に送信処理が実行されます。</p>
                    <button class="btn btn-sm btn-outline-secondary w-100" onclick="toggleBroadcastView('list')">履歴一覧に戻る</button>
                `;
            } else {
                document.getElementById('res_line_attempt').innerText = data.summary.line.attempted;
                document.getElementById('res_line_success').innerText = data.summary.line.success;
                document.getElementById('res_line_fail').innerText = data.summary.line.failed;

                document.getElementById('res_email_attempt').innerText = data.summary.email.attempted;
                document.getElementById('res_email_success').innerText = data.summary.email.success;
                document.getElementById('res_email_fail').innerText = data.summary.email.failed;
            }
            
            document.getElementById('broadcast_message').value = '';
            // Reset attachments safely
            if (typeof broadcastAttachments !== 'undefined') {
                broadcastAttachments = [];
                renderBroadcastAttachments();
            }
            
            alert(scheduledAt ? "予約を確定しました！" : "一斉送信が完了しました！");
            if(scheduledAt) {
                toggleBroadcastView('list');
            }
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
    if (typeof openMediaSelector === 'function') {
        openMediaSelector('broadcast_media_catcher_multi');
    } else {
        console.error("openMediaSelector is not accessible.");
    }
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

    // Automatically load history list on init
    loadBroadcastHistory();
});

/* ============================
   Broadcast History & Views
============================ */
function toggleBroadcastView(view) {
    const listEl = document.getElementById('broadcast_view_list');
    const formEl = document.getElementById('broadcast_view_form');
    const btnNew = document.getElementById('btn_broadcast_new');
    const btnBack = document.getElementById('btn_broadcast_back');

    if (view === 'list') {
        listEl.classList.remove('d-none');
        formEl.classList.add('d-none');
        btnNew.classList.remove('d-none');
        btnBack.classList.add('d-none');
        loadBroadcastHistory(); // Refresh
    } else {
        listEl.classList.add('d-none');
        formEl.classList.remove('d-none');
        btnNew.classList.add('d-none');
        btnBack.classList.remove('d-none');
        document.getElementById('broadcast_result_container').classList.add('d-none');
    }
}

async function loadBroadcastHistory() {
    const tbody = document.getElementById('broadcast_history_tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5"><i class="fa-solid fa-spinner fa-spin me-2"></i>履歴を読み込み中...</td></tr>';
    
    try {
        const res = await apiFetch('/api/broadcast', { method: 'GET' });
        if (!res.ok) throw new Error(res.error || "Fetch failed");

        if (res.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-5">送信履歴がありません</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        res.data.forEach(item => {
            const isPending = item.status === 'pending';
            const isFailed = item.status === 'failed';
            
            let statusBadge = '<span class="badge bg-secondary">完了</span>';
            if (isPending) statusBadge = '<span class="badge bg-warning text-dark"><i class="fa-regular fa-clock me-1"></i>予約待機</span>';
            if (isFailed) statusBadge = '<span class="badge bg-danger">失敗</span>';
            if (item.status === 'processing') statusBadge = '<span class="badge bg-info"><i class="fa-solid fa-spinner fa-spin"></i> 処理中</span>';

            // Append 'Z' to strictly force SQLite YYYY-MM-DD HH:MM:SS blocks gracefully reverting back locally
            const parseDate = (sqlDate) => {
                if (!sqlDate) return '-';
                return new Date(sqlDate.replace(' ', 'T') + 'Z').toLocaleString('ja-JP');
            };

            const scheduledStr = parseDate(item.scheduled_at);
            const sentStr = item.sent_at ? parseDate(item.sent_at) : '即時';
            const timeDisplay = isPending ? `<span class="text-warning fw-bold">${scheduledStr}</span>` : `<span class="text-muted small">送信:</span> ${sentStr}`;

            const channelStr = item.channel === 'both' ? 'LINE & Email' : item.channel;
            const targetStr = item.target_type === 'all' ? '全体(contributor)' : item.target_type;

            let resultHtml = '<span class="text-muted">-</span>';
            if (item.result_json && !isPending) {
                try {
                    const r = JSON.parse(item.result_json);
                    resultHtml = `<div class="small">L: ${r.line?.success||0}件 E: ${r.email?.success||0}件</div>`;
                } catch(e) {}
            }

            const prefix = item.message.substring(0, 30) + (item.message.length > 30 ? '...' : '');

            tbody.innerHTML += `
                <tr>
                    <td>${statusBadge}</td>
                    <td>${timeDisplay}</td>
                    <td><div class="small fw-bold">${targetStr}</div><div class="small text-muted">${channelStr}</div></td>
                    <td><div class="small text-muted text-wrap" style="max-height: 40px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(prefix)}</div></td>
                    <td>${resultHtml}</td>
                </tr>
            `;
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">読み込みに失敗しました</td></tr>';
    }
}
