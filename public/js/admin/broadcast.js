// Broadcast Management

async function sendBroadcast() {
    const audienceStr = document.getElementById('broadcast_audience').value;
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
            body: JSON.stringify({ audience: audienceStr, message: message })
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
