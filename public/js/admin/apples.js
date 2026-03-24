/* ============================
   Apple Varieties Master Management
   ============================ */

let applesMaster = [];
let appleModal = null;
let isAppleEditing = false;

async function fetchApplesMaster() {
    try {
        const response = await fetch('/api/apples');
        const data = await response.json();
        if (data.success) {
            applesMaster = data.apples;
            renderAppleTable();
        }
    } catch (err) {
        console.error('Failed to load apples:', err);
        const tbody = document.getElementById('appleTableBody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-danger text-center">データ取得エラー</td></tr>';
    }
}

function renderAppleTable() {
    const tbody = document.getElementById('appleTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!applesMaster.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">品種データがありません</td></tr>'; return; }

    applesMaster.forEach(a => {
        const tr = document.createElement('tr');
        const imgTag = a.official_image_url ? `<img src="${a.official_image_url}" alt="${a.name_ja}" class="rounded shadow-sm me-3" style="width: 48px; height: 48px; object-fit: cover; flex-shrink: 0;">` : `<div class="rounded bg-light border me-3 d-flex align-items-center justify-content-center text-muted" style="width: 48px; height: 48px; flex-shrink: 0;"><i class="fa-brands fa-apple"></i></div>`;
        tr.innerHTML = `
            <td>
                <div class="d-flex align-items-center">
                    ${imgTag}
                    <span class="fw-bold fs-6">${a.name_ja}</span>
                </div>
            </td>
            <td class="small text-muted">
                <div><span class="badge border text-dark me-1">EN</span>${a.name_en || '-'}</div>
                <div><span class="badge border text-dark me-1">ZH</span>${a.name_zh || '-'}</div>
            </td>
            <td class="small">
                <div class="mb-1"><i class="fa-solid fa-calendar-alt text-muted"></i> ${a.harvest_season || '-'}</div>
                <div><i class="fa-solid fa-leaf text-muted"></i> ${a.lineage || '-'}</div>
            </td>
            <td class="text-muted small" style="max-width:250px;">
                <div class="text-truncate">${a.summary || '-'}</div>
            </td>
            <td class="text-end" style="min-width:120px;">
                <button class="btn btn-sm btn-outline-secondary fw-bold" onclick='openAppleEditor(${JSON.stringify(a).replace(/'/g, "&apos;")})'>
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger fw-bold ms-1" onclick='deleteApple("${a.id}")'>
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAppleEditor(apple) {
    if (!appleModal) {
        appleModal = new bootstrap.Modal(document.getElementById('appleMasterModal'));
    }

    isAppleEditing = !!apple;
    document.getElementById('appleMasterForm').reset();

    if (apple) {
        document.getElementById('apple_id').value = apple.id || "";
        document.getElementById('apple_name_ja').value = apple.name_ja || "";
        document.getElementById('apple_name_en').value = apple.name_en || "";
        document.getElementById('apple_name_zh').value = apple.name_zh || "";

        const seasons = (apple.harvest_season || "").split(',').map(s => s.trim());
        Array.from(document.getElementById('apple_harvest_season').options).forEach(opt => {
            opt.selected = seasons.includes(opt.value);
        });

        document.getElementById('apple_lineage').value = apple.lineage || "";
        document.getElementById('apple_origin').value = apple.origin || "";
        document.getElementById('apple_official_image_url').value = apple.official_image_url || "";
        document.getElementById('apple_summary').value = apple.summary || "";
        document.getElementById('apple_description').value = apple.description || "";
    } else {
        document.getElementById('apple_id').value = "";
    }

    appleModal.show();
}

async function saveAppleMaster() {
    const id = document.getElementById('apple_id').value;
    const payload = {
        name_ja: document.getElementById('apple_name_ja').value.trim(),
        name_en: document.getElementById('apple_name_en').value.trim(),
        name_zh: document.getElementById('apple_name_zh').value.trim(),
        harvest_season: Array.from(document.getElementById('apple_harvest_season').selectedOptions).map(opt => opt.value).join(', '),
        lineage: document.getElementById('apple_lineage').value.trim(),
        origin: document.getElementById('apple_origin').value.trim(),
        official_image_url: document.getElementById('apple_official_image_url').value.trim(),
        summary: document.getElementById('apple_summary').value.trim(),
        description: document.getElementById('apple_description').value.trim()
    };

    if (!payload.name_ja) return showStatus("品種名(JA)は必須です", "error");

    const method = isAppleEditing ? 'PUT' : 'POST';
    const url = isAppleEditing ? '/api/apples/' + id : '/api/apples';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            showStatus('りんご品種を保存しました。', 'success');
            appleModal.hide();
            fetchApplesMaster();
        } else {
            const data = await res.json();
            showStatus(data.error || '保存エラー', 'error');
        }
    } catch (e) {
        showStatus('通信エラー', 'error');
    }
}

async function deleteApple(id) {
    if (!confirm('本当に削除しますか？')) return;
    try {
        const res = await fetch('/api/apples/' + id, { method: 'DELETE' });
        if (res.ok) {
            showStatus('削除しました。', 'success');
            fetchApplesMaster();
        } else {
            showStatus('削除エラー', 'error');
        }
    } catch (e) {
        showStatus('通信エラー', 'error');
    }
}
