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
        const data = await apiFetch('/api/broadcast', {
            method: 'POST',
            body: JSON.stringify({ target_type: targetType, channel: channel, message: message })
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
