/* ============================
   Media Management
   ============================ */

let mediaCache = [];
let curMediaTargetId = null;
let currentMediaDir = null;

async function fetchMedia(isSelector) {
    if (!isSelector) {
        setLoading('mediaGrid', 4);
    } else {
        setLoading('mediaSelectGrid', 4);
    }
    try {
        const res = await apiFetch('/api/media');
        mediaCache = res;
        renderMediaGrid();
    } catch (err) {
        console.error("Media Error:", err);
        showStatus("メディアの取得に失敗しました", "error");
    }
}

function setMediaDir(dir) {
    currentMediaDir = dir;
    renderMediaGrid();
}

function renderMediaGrid() {
    const grid1 = document.getElementById('mediaGrid');
    const grid2 = document.getElementById('mediaSelectGrid');

    if (!mediaCache.length) {
        const emptyHtml = '<div class="col-12 text-center text-muted py-5"><i class="fa-regular fa-image display-4 mb-3 d-block opacity-25"></i>画像がありません。アップロードしてください。</div>';
        if (grid1) grid1.innerHTML = emptyHtml;
        if (grid2) grid2.innerHTML = emptyHtml;
        return;
    }

    // Group by directory
    const groups = {};
    mediaCache.forEach(m => {
        const parts = m.key.split('/');
        const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : 'ルート';
        if (!groups[dir]) groups[dir] = [];
        groups[dir].push(m);
    });

    const generateHtml = (isPicker) => {
        let html = '';

        if (currentMediaDir === null) {
            html += `<div class="col-12 mb-2"><span class="fw-bold text-secondary">フォルダを選択</span></div>`;
            Object.keys(groups).sort().forEach(dir => {
                const count = groups[dir].length;
                let displayDir = dir;
                if (window.userRole === 'contributor') {
                    if (dir.startsWith('media/')) displayDir = '自分の画像 (My Folder)';
                    else if (dir === 'shared' || dir.startsWith('shared/')) displayDir = '共通素材 (Shared)';
                }
                html += `
                    <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                        <div class="card h-100 border shadow-sm border-0 bg-white" style="cursor:pointer;" onclick="setMediaDir('${dir}')">
                            <div class="bg-light rounded d-flex align-items-center justify-content-center py-4 folder-card" style="position:relative;">
                                <i class="fa-solid fa-folder fa-4x text-warning"></i>
                                <span class="position-absolute bottom-0 end-0 mb-2 me-2 badge bg-secondary">${count}</span>
                            </div>
                            <div class="card-body p-2 text-center text-truncate fw-bold text-dark" title="${displayDir}">${displayDir}</div>
                        </div>
                    </div>
                `;
            });
        } else {
            let breadcrumbDisplay = currentMediaDir;
            if (window.userRole === 'contributor') {
                if (currentMediaDir.startsWith('media/')) breadcrumbDisplay = '自分の画像 (My Folder)';
                else if (currentMediaDir === 'shared' || currentMediaDir.startsWith('shared/')) breadcrumbDisplay = '共通素材 (Shared)';
            }
            html += `
                <div class="col-12 mb-3 d-flex align-items-center gap-2">
                    <button class="btn btn-outline-secondary btn-sm" onclick="setMediaDir(null)"><i class="fa-solid fa-arrow-left"></i> 戻る</button>
                    <span class="fw-bold fs-5 text-secondary"><i class="fa-solid fa-folder-open text-warning me-2"></i>${breadcrumbDisplay}</span>
                </div>
            `;

            const items = groups[currentMediaDir] || [];
            if (items.length === 0) {
                html += '<div class="col-12 text-muted mt-3">このフォルダは空です。</div>';
            }

            items.forEach(m => {
                const isImg = m.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;
                const date = m.uploaded ? new Date(m.uploaded).toLocaleString('ja-JP') : '';
                const size = m.size ? (m.size / 1024).toFixed(1) + ' KB' : '';

                let displayTitle = m.key.split('/').pop();
                try { displayTitle = decodeURIComponent(displayTitle); } catch (e) { }

                if (!isPicker) {
                    html += `
                        <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                            <div class="card h-100 border shadow-sm border-0 bg-white">
                                <div class="bg-light rounded-top d-flex align-items-center justify-content-center overflow-hidden" style="height: 120px; position:relative;">
                                    ${isImg ? `<img src="${m.url}" class="w-100 h-100 object-fit-cover">` : `<i class="fa-solid fa-file fa-3x text-muted"></i>`}
                                </div>
                                <div class="card-body p-2" style="font-size: 0.8rem;">
                                    <div class="text-truncate fw-bold text-dark" title="${m.key}">${displayTitle}</div>
                                    <div class="text-muted d-flex justify-content-between mt-1" style="font-size: 0.75rem;"><span>${size}</span> <span>${date.split(' ')[0]}</span></div>
                                </div>
                                <div class="card-footer p-2 bg-white border-top-0 d-flex gap-2">
                                    <button class="btn btn-sm btn-outline-brand flex-fill fw-bold" onclick="copyMediaUrl('${m.url}')" title="URLをコピー"><i class="fa-regular fa-copy"></i></button>
                                    <button class="btn btn-sm btn-outline-danger flex-fill fw-bold" onclick="deleteMedia('${m.key}')" title="削除"><i class="fa-solid fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="col-xl-3 col-lg-4 col-md-4 col-sm-6">
                            <div class="card h-100 border shadow-sm border-0 media-picker-card" style="cursor:pointer;" onclick="selectMediaUrl('${m.url}')">
                                <div class="bg-light rounded d-flex align-items-center justify-content-center overflow-hidden" style="height: 140px; position:relative;">
                                    ${isImg ? `<img src="${m.url}" class="w-100 h-100 object-fit-cover hover-zoom">` : `<i class="fa-solid fa-file fa-3x text-muted"></i>`}
                                    <div class="position-absolute bottom-0 w-100 p-2 text-white bg-dark bg-opacity-75 text-truncate small">${displayTitle}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
        }
        return html;
    };

    if (grid1) grid1.innerHTML = generateHtml(false);
    if (grid2) {
        grid2.innerHTML = generateHtml(true);
        if (!document.getElementById('mediaSelectStyle')) {
            const mStyle = document.createElement('style');
            mStyle.id = 'mediaSelectStyle';
            mStyle.innerHTML = `
                .media-picker-card:hover, .folder-card:hover { border: 2px solid var(--accent) !important; transform: translateY(-2px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;}
                .hover-zoom { transition: transform 0.3s; }
                .media-picker-card:hover .hover-zoom { transform: scale(1.05); }
            `;
            document.head.appendChild(mStyle);
        }
    }
}

async function uploadMedia(evt) {
    const files = evt.target.files;
    if (!files || files.length === 0) return;
    showStatus("アップロード中...", "info");

    let failures = 0;
    const btn = evt.target.previousElementSibling;
    if (btn) btn.disabled = true;

    for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        if (currentMediaDir) {
            formData.append('folder', currentMediaDir);
        }
        try {
            await apiFetch('/api/media', { method: 'POST', body: formData }, true);
        } catch (e) { failures++; }
    }
    evt.target.value = '';
    if (btn) btn.disabled = false;

    if (failures > 0) showStatus(failures + "件のアップロードに失敗しました", "error");
    else showStatus("画像がアップロードされました", "success");

    fetchMedia();
}

async function deleteMedia(key) {
    if (!confirm("本当にこの画像を削除しますか？\n※既に記事で使われている場合、画像が表示されなくなります！")) return;
    try {
        await apiFetch('/api/media', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
        });
        showStatus("削除しました", "success");
        fetchMedia();
    } catch (err) {
        showStatus(err.message, "error");
    }
}

function copyMediaUrl(url) {
    const loc = window.location.origin + url;
    navigator.clipboard.writeText(loc);
    showStatus("URLをコピーしました", "success");
}

function openMediaSelector(targetElementId) {
    curMediaTargetId = targetElementId;
    let el = document.getElementById('mediaSelectModal');
    let mModal = bootstrap.Modal.getInstance(el);
    if (!mModal) mModal = new bootstrap.Modal(el);

    el.style.zIndex = "1060";
    mModal.show();

    setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 1) {
            backdrops[backdrops.length - 1].style.zIndex = "1059";
        }
    }, 150);
}

function selectMediaUrl(url) {
    if (curMediaTargetId) {
        const el = document.getElementById(curMediaTargetId);
        if (el) {
            el.value = window.location.origin + url;
        }
    }
    let mModal = bootstrap.Modal.getInstance(document.getElementById('mediaSelectModal'));
    if (mModal) mModal.hide();
}
