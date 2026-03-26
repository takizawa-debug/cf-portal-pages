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

    // Build hierarchical folder parse
    const rootFolders = {}; // map of folder -> count
    const subFolders = {};  // map of parent -> map of child -> count
    const filesInPath = {}; // map of path -> array of files
    
    // Seed persistent administrative media folders ensuring UI access even when buckets hold 0 files
    rootFolders['official'] = 0;
    if (window.userRole !== 'contributor') {
        rootFolders['media'] = 0;
        rootFolders['library'] = 0;
    } else {
        rootFolders[`media/${window.userId}`] = 0;
    }
    
    mediaCache.forEach(m => {
        const parts = m.key.split('/');
        const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : 'ルート';
        
        if (!filesInPath[dir]) filesInPath[dir] = [];
        filesInPath[dir].push(m);
        
        if (window.userRole !== 'contributor' && dir.startsWith('media/')) {
            const parent = 'media';
            const childDir = dir;
            if (!rootFolders[parent]) rootFolders[parent] = 0;
            rootFolders[parent] += 1;
            
            if (!subFolders[parent]) subFolders[parent] = {};
            if (!subFolders[parent][childDir]) subFolders[parent][childDir] = 0;
            subFolders[parent][childDir] += 1;
        } else {
            if (!rootFolders[dir]) rootFolders[dir] = 0;
            rootFolders[dir] += 1;
        }
    });

    const generateHtml = (isPicker) => {
        let html = '';

        if (currentMediaDir === null) {
            html += `<div class="col-12 mb-2"><span class="fw-bold text-secondary">フォルダを選択</span></div>`;
            Object.keys(rootFolders).sort().forEach(dir => {
                const count = rootFolders[dir];
                let displayDir = dir;
                
                if (dir === 'official') displayDir = '公式配布素材 (Official)';
                else if (dir === 'library') displayDir = '運営・パブリック画像 (Library)';
                else if (dir === 'media' && window.userRole !== 'contributor') displayDir = '事業者画像全般 (Media)';
                else if (window.userRole === 'contributor' && dir.startsWith('media/')) displayDir = '自分の画像 (My Folder)';

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
        } else if (subFolders[currentMediaDir]) {
            html += `
                <div class="col-12 mb-3 d-flex align-items-center gap-2">
                    <button class="btn btn-outline-secondary btn-sm" onclick="setMediaDir(null)"><i class="fa-solid fa-arrow-left"></i> 戻る</button>
                    <span class="fw-bold fs-5 text-secondary"><i class="fa-solid fa-folder-open text-warning me-2"></i>事業者画像全般 (Media)</span>
                </div>
            `;
            const children = subFolders[currentMediaDir];
            Object.keys(children).sort().forEach(childDir => {
                const count = children[childDir];
                const displayDir = childDir.replace('media/', ''); 
                html += `
                    <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">
                        <div class="card h-100 border shadow-sm border-0 bg-white" style="cursor:pointer;" onclick="setMediaDir('${childDir}')">
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
            let pBtn = `setMediaDir(null)`;
            if (window.userRole !== 'contributor' && currentMediaDir.startsWith('media/')) {
                breadcrumbDisplay = currentMediaDir.replace('media/', '');
                pBtn = `setMediaDir('media')`;
            } else if (currentMediaDir === 'official') {
                breadcrumbDisplay = '公式配布素材 (Official)';
            } else if (window.userRole === 'contributor' && currentMediaDir.startsWith('media/')) {
                breadcrumbDisplay = '自分の画像 (My Folder)';
            } else if (currentMediaDir === 'library') {
                breadcrumbDisplay = '運営・パブリック画像 (Library)';
            }

            // TOS Block for Contributors in Official
            if (currentMediaDir === 'official' && window.userRole === 'contributor' && !localStorage.getItem('official_media_agreed')) {
                return html + `
                <div class="col-12 mb-3 d-flex align-items-center gap-2">
                    <button class="btn btn-outline-secondary btn-sm" onclick="${pBtn}"><i class="fa-solid fa-arrow-left"></i> 戻る</button>
                    <span class="fw-bold fs-5 text-secondary"><i class="fa-solid fa-folder-open text-warning me-2"></i>${breadcrumbDisplay}</span>
                </div>
                <div class="col-12 my-4">
                    <div class="card shadow-sm border-brand">
                        <div class="card-header bg-brand text-white fw-bold">
                            <i class="fa-solid fa-circle-exclamation me-1"></i> 公式配布素材の利用規約
                        </div>
                        <div class="card-body bg-white p-4">
                            <div class="bg-light p-3 rounded mb-4 text-muted" style="height: 200px; overflow-y: scroll; font-size: 0.9rem;">
                                <h5 class="fw-bold text-dark">基本利用条件</h5>
                                <p>これらの素材は、当ポータルサイトに登録済みの事業者様に対し、宣伝・広報活動を目的とした無償利用を許諾するものです。</p>
                                <h5 class="fw-bold text-dark mt-4">禁止事項</h5>
                                <ul>
                                    <li>素材を改変し、公序良俗に反する目的で利用すること（著しい色調変更や悪意ある変形等）</li>
                                    <li>素材自体を二次販売、単体での再配布、または商標登録等を行うこと</li>
                                    <li>当自治体・運営団体と無関係の事業や、誤解を招くような文脈での利用</li>
                                </ul>
                                <p class="mt-4">ご不明な点がございましたら、運営窓口へお問い合わせください。</p>
                            </div>
                            <div class="form-check mb-4">
                                <input class="form-check-input border-brand" type="checkbox" id="tosAgreeCheck" onchange="document.getElementById('tosAgreeBtn').disabled = !this.checked">
                                <label class="form-check-label fw-bold text-dark" for="tosAgreeCheck">
                                    利用規約の内容を確認し、同意します
                                </label>
                            </div>
                            <button class="btn btn-brand px-4 py-2 fw-bold" id="tosAgreeBtn" disabled onclick="agreeToTerms()"><i class="fa-solid fa-check"></i> 同意して画像を閲覧・利用する</button>
                        </div>
                    </div>
                </div>
                `;
            }

            html += `
                <div class="col-12 mb-3 d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-outline-secondary btn-sm" onclick="${pBtn}"><i class="fa-solid fa-arrow-left"></i> 戻る</button>
                        <span class="fw-bold fs-5 text-secondary"><i class="fa-solid fa-folder-open text-warning me-2"></i>${breadcrumbDisplay}</span>
                    </div>
                </div>
            `;

            // Enforce upload button restriction
            const uploadBtn = document.querySelector('button[onclick*="mediaUploadInput"]');
            if (uploadBtn) {
                if (currentMediaDir === 'official' && window.userRole === 'contributor') {
                    uploadBtn.style.display = 'none';
                } else {
                    uploadBtn.style.display = 'inline-block';
                }
            }

            const items = filesInPath[currentMediaDir] || [];
            if (items.length === 0) {
                html += '<div class="col-12 text-muted mt-3">このフォルダは空です。</div>';
            }

            items.forEach(m => {
                const isImg = m.url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null;
                const date = m.uploaded ? new Date(m.uploaded).toLocaleString('ja-JP') : '';
                const size = m.size ? (m.size / 1024).toFixed(1) + ' KB' : '';

                let displayTitle = m.key.split('/').pop();
                try { displayTitle = decodeURIComponent(displayTitle); } catch (e) { }
                
                // Show delete logic
                let canDelete = true;
                if (currentMediaDir === 'official' && (window.userRole === 'editor' || window.userRole === 'contributor')) {
                    canDelete = false;
                }
                const deleteBtnHtml = canDelete ? `<button class="btn btn-sm btn-outline-danger flex-fill fw-bold" onclick="deleteMedia('${m.key}')" title="削除"><i class="fa-solid fa-trash"></i></button>` : '';

                // Download logic
                const downloadBtnHtml = `<button class="btn btn-sm btn-outline-secondary flex-fill fw-bold" onclick="downloadImage('${m.url}', '${displayTitle}')" title="ダウンロード"><i class="fa-solid fa-download"></i></button>`;

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
                                    ${downloadBtnHtml}
                                    ${deleteBtnHtml}
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

function agreeToTerms() {
    localStorage.setItem('official_media_agreed', '1');
    renderMediaGrid();
}

async function downloadImage(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
        showStatus('ダウンロードが完了しました', 'success');
    } catch(e) {
        showStatus('ダウンロードに失敗しました', 'error');
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
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
    let mModal = bootstrap.Modal.getInstance(document.getElementById('mediaSelectModal'));
    if (mModal) mModal.hide();
}
