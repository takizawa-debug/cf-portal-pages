/**
 * feeds.js — 外部情報監視・AI考察・ワンクリック記事化 管理画面UI
 */

let currentFeedTab = 'pending';
let allFeedSources = [];
let currentRawFeedItems = [];

/**
 * UTC日時文字列を日本時間 (JST: YYYY/MM/DD HH:mm) に変換
 */
function formatJstDateTime(utcStr) {
    if (!utcStr) return '未巡回';
    try {
        const isoString = utcStr.includes('T') ? utcStr : utcStr.replace(' ', 'T') + 'Z';
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return utcStr;
        
        return new Intl.DateTimeFormat('ja-JP', {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(date);
    } catch {
        return utcStr;
    }
}

/**
 * 外部フィードパネルの初期化
 */
async function initFeedsPanel() {
    await Promise.all([
        fetchFeedItems(currentFeedTab),
        fetchFeedSources()
    ]);
}

/**
 * タブ切り替え
 */
function switchFeedSubTab(tabName) {
    currentFeedTab = tabName;
    document.querySelectorAll('#feedSubTabs .nav-link').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // 検索窓をリセット
    const searchInput = document.getElementById('feedSearchInput');
    if (searchInput) searchInput.value = '';

    if (tabName === 'sources') {
        document.getElementById('feedItemsContainer').classList.add('d-none');
        document.getElementById('feedSourcesContainer').classList.remove('d-none');
        fetchFeedSources();
    } else {
        document.getElementById('feedItemsContainer').classList.remove('d-none');
        document.getElementById('feedSourcesContainer').classList.add('d-none');
        fetchFeedItems(tabName);
    }
}

/**
 * アイテム一覧取得
 */
async function fetchFeedItems(status = 'pending') {
    const listEl = document.getElementById('feedItemsList');
    if (!listEl) return;

    listEl.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-danger" role="status"></div><p class="mt-2 text-muted">フィード情報を読み込み中...</p></div>';

    try {
        const res = await fetch(`/api/feeds/items?status=${status}&limit=100`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        // キャッシュ保持
        currentRawFeedItems = data.items || [];

        // バッジ件数更新
        updateFeedBadges(data.counts);

        // フィルター & ソート適用
        applyFeedFilters();

    } catch (e) {
        console.error('Failed to fetch feed items:', e);
        listEl.innerHTML = `<div class="alert alert-danger">データの取得に失敗しました: ${e.message}</div>`;
    }
}

/**
 * フィルター ＆ 検索 ＆ ソート適用
 */
function applyFeedFilters() {
    const listEl = document.getElementById('feedItemsList');
    if (!listEl) return;

    const searchTerm = (document.getElementById('feedSearchInput')?.value || '').trim().toLowerCase();
    const impactFilter = document.getElementById('filterImpact')?.value || 'all';
    const sourceFilter = document.getElementById('filterSourceType')?.value || 'all';
    const sortOrder = document.getElementById('sortFeedItems')?.value || 'date_desc';

    let filtered = [...currentRawFeedItems];

    // 1. 影響度フィルター
    if (impactFilter !== 'all') {
        filtered = filtered.filter(item => item.impact_level === impactFilter);
    }

    // 2. ソース種別フィルター
    if (sourceFilter !== 'all') {
        if (sourceFilter === 'pref') {
            filtered = filtered.filter(item => ['nagano_bojo', 'nagano_kajushiken', 'nagano_nosei'].includes(item.source_type));
        } else if (sourceFilter === 'town') {
            filtered = filtered.filter(item => item.source_type === 'rss');
        } else if (sourceFilter === 'community') {
            filtered = filtered.filter(item => item.source_type === 'web_news');
        } else if (sourceFilter === 'instagram') {
            filtered = filtered.filter(item => item.source_type === 'instagram');
        }
    }

    // 3. キーワード検索
    if (searchTerm) {
        filtered = filtered.filter(item => {
            const title = (item.title || '').toLowerCase();
            const commentary = (item.ai_commentary || '').toLowerCase();
            const draft = (item.draft_title || '' + item.draft_body || '').toLowerCase();
            const sourceName = (item.feed_name || '').toLowerCase();
            return title.includes(searchTerm) || commentary.includes(searchTerm) || draft.includes(searchTerm) || sourceName.includes(searchTerm);
        });
    }

    // 日付正規化ヘルパー (和暦・全角対応)
    const getSortableDate = (str) => {
        if (!str) return '1970-01-01';
        let s = String(str).trim();
        const reiwaMatch = s.match(/令和([0-9０-９元]+)年([0-9０-９]+)月([0-9０-９]+)日/);
        if (reiwaMatch) {
            let yr = reiwaMatch[1] === '元' ? 1 : parseInt(reiwaMatch[1].replace(/[０-９]/g, m => "0123456789"["０１２３４５６７８９".indexOf(m)]), 10);
            let mo = parseInt(reiwaMatch[2].replace(/[０-９]/g, m => "0123456789"["０１２３４５６７８９".indexOf(m)]), 10);
            let da = parseInt(reiwaMatch[3].replace(/[０-９]/g, m => "0123456789"["０１２３４５６７８９".indexOf(m)]), 10);
            return `${2018 + yr}-${String(mo).padStart(2, '0')}-${String(da).padStart(2, '0')}`;
        }
        const isoMatch = s.match(/(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/);
        if (isoMatch) {
            return `${isoMatch[1]}-${String(isoMatch[2]).padStart(2, '0')}-${String(isoMatch[3]).padStart(2, '0')}`;
        }
        return s.slice(0, 10);
    };

    // 4. ソート処理
    const impactWeight = { 'high': 3, 'medium': 2, 'low': 1 };
    filtered.sort((a, b) => {
        const dateA = getSortableDate(a.detected_date);
        const dateB = getSortableDate(b.detected_date);

        if (sortOrder === 'impact_desc') {
            const diff = (impactWeight[b.impact_level] || 0) - (impactWeight[a.impact_level] || 0);
            if (diff !== 0) return diff;
            return dateB.localeCompare(dateA);
        } else if (sortOrder === 'date_asc') {
            return dateA.localeCompare(dateB);
        } else if (sortOrder === 'created_desc') {
            return (b.created_at || '').localeCompare(a.created_at || '');
        } else {
            // date_desc (デフォルト: 発表日新しい順)
            return dateB.localeCompare(dateA);
        }
    });

    // カウンター更新
    const countEl = document.getElementById('feedDisplayCount');
    if (countEl) countEl.textContent = filtered.length;

    // 空表示判定
    if (filtered.length === 0) {
        listEl.innerHTML = `
            <div class="card border-0 shadow-sm p-5 text-center text-muted">
                <i class="fa-solid fa-filter-circle-xmark fa-3x mb-3 text-secondary"></i>
                <h5>条件に一致する情報が見つかりませんでした</h5>
                <p class="small text-secondary mb-0">フィルター条件を変更するか、検索キーワードをクリアしてください。</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = filtered.map(item => renderFeedItemCard(item)).join('');
}

/**
 * バッジ件数更新
 */
function updateFeedBadges(counts) {
    if (!counts) return;
    const badgeSidebar = document.getElementById('feedPendingBadge');
    if (badgeSidebar) {
        if (counts.pending > 0) {
            badgeSidebar.textContent = counts.pending;
            badgeSidebar.classList.remove('d-none');
        } else {
            badgeSidebar.classList.add('d-none');
        }
    }

    const tabPendingBadge = document.getElementById('badgeTabPending');
    if (tabPendingBadge) tabPendingBadge.textContent = counts.pending || 0;
    const tabPublishedBadge = document.getElementById('badgeTabPublished');
    if (tabPublishedBadge) tabPublishedBadge.textContent = counts.published || 0;
    const tabDismissedBadge = document.getElementById('badgeTabDismissed');
    if (tabDismissedBadge) tabDismissedBadge.textContent = counts.dismissed || 0;
}

/**
 * 単一アイテムカードのHTML生成
 */
function renderFeedItemCard(item) {
    const isPending = item.status === 'pending';
    const isPublished = item.status === 'published';

    // 影響度バッジ
    let impactBadge = '';
    if (item.impact_level === 'high') {
        impactBadge = '<span class="badge bg-danger px-3 py-2 fw-bold"><i class="fa-solid fa-triangle-exclamation me-1"></i>影響度: 高 (要警戒)</span>';
    } else if (item.impact_level === 'low') {
        impactBadge = '<span class="badge bg-secondary px-3 py-2">影響度: 低 (参考)</span>';
    } else {
        impactBadge = '<span class="badge bg-warning text-dark px-3 py-2 fw-bold">影響度: 中 (定例・通常)</span>';
    }

    // 発信元アイコン
    let sourceIcon = '<i class="fa-solid fa-building-columns text-primary"></i>';
    if (item.source_type === 'instagram') sourceIcon = '<i class="fa-brands fa-instagram text-danger"></i>';
    else if (item.source_type === 'rss') sourceIcon = '<i class="fa-solid fa-rss text-warning"></i>';

    const safeItemJson = encodeURIComponent(JSON.stringify(item));

    return `
    <div class="card border-0 shadow-sm mb-4" id="card-${item.id}" style="border-radius: 12px; overflow: hidden;">
        <div class="card-header bg-white border-bottom p-3 d-flex flex-wrap align-items-center justify-content-between gap-2">
            <div class="d-flex align-items-center gap-2">
                <span class="fs-5">${sourceIcon}</span>
                <span class="fw-bold text-secondary small">${escapeHtml(item.feed_name)}</span>
                <span class="text-muted small">·</span>
                <span class="text-muted small"><i class="fa-regular fa-calendar me-1"></i>${escapeHtml(item.detected_date || '不明')}</span>
            </div>
            <div>${impactBadge}</div>
        </div>

        <div class="card-body p-4">
            <h4 class="fw-bold mb-3" style="color: #2c3e50; line-height: 1.4;">
                ${escapeHtml(item.title)}
            </h4>

            <!-- リンク類 -->
            <div class="mb-3 d-flex flex-wrap gap-3 small">
                ${item.source_url ? `<a href="${escapeHtml(item.source_url)}" target="_blank" class="text-decoration-none text-primary fw-bold"><i class="fa-solid fa-arrow-up-right-from-square me-1"></i>元ページを開く</a>` : ''}
                ${item.pdf_url ? `<a href="${escapeHtml(item.pdf_url)}" target="_blank" class="text-decoration-none text-danger fw-bold"><i class="fa-solid fa-file-pdf me-1"></i>添付PDF資料</a>` : ''}
                ${item.media_url ? `<a href="${escapeHtml(item.media_url)}" target="_blank" class="text-decoration-none text-danger fw-bold"><i class="fa-brands fa-youtube me-1"></i>動画を見る</a>` : ''}
            </div>

            <!-- AI考察アコーディオン -->
            <div class="p-3 mb-3" style="background: #f0f7ff; border-left: 4px solid #0d6efd; border-radius: 0 8px 8px 0;">
                <div class="fw-bold text-primary mb-2 d-flex align-items-center">
                    <i class="fa-solid fa-robot me-2"></i>AI技術考察（飯綱町りんご栽培視点）
                </div>
                <p class="mb-2 text-dark" style="line-height: 1.7; font-size: 0.95rem; white-space: pre-wrap;">${escapeHtml(item.ai_commentary || '（考察なし）')}</p>
                
                ${item.recommended_actions ? `
                <div class="mt-2 pt-2 border-top border-primary-subtle">
                    <span class="fw-bold text-dark small"><i class="fa-solid fa-clipboard-check me-1 text-success"></i>農家への推奨アクション:</span>
                    <div class="small text-secondary mt-1 ps-2" style="white-space: pre-wrap;">${escapeHtml(item.recommended_actions)}</div>
                </div>
                ` : ''}
            </div>

            <!-- 発信ドラフトプレビュー -->
            <div class="p-3 mb-3" style="background: #fffdf5; border: 1px dashed #e67e22; border-radius: 8px;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold text-warning-emphasis small"><i class="fa-solid fa-pen-nib me-1"></i>提案発信ドラフト</span>
                    <span class="badge bg-light text-dark border small">${escapeHtml(item.suggested_l1 || '営む')} ＞ ${escapeHtml(item.suggested_l2 || '栽培支援')} ＞ ${escapeHtml(item.suggested_l3 || '栽培指導')}</span>
                </div>
                <h6 class="fw-bold text-dark mb-1">${escapeHtml(item.draft_title || item.title)}</h6>
                ${item.draft_lead ? `<p class="small text-muted mb-2">${escapeHtml(item.draft_lead)}</p>` : ''}
                <div class="small text-secondary p-2 bg-white rounded border" style="max-height: 120px; overflow-y: auto; white-space: pre-wrap;">${escapeHtml(item.draft_body || '')}</div>
            </div>

            <!-- アクションボタン群 -->
            <div class="d-flex flex-wrap justify-content-between align-items-center pt-2 border-top">
                <div class="text-muted small">
                    ${item.email_sent_at ? `<i class="fa-solid fa-envelope-circle-check text-success me-1"></i>メール通知済 (${formatJstDateTime(item.email_sent_at)})` : '<i class="fa-regular fa-clock me-1"></i>未通知'}
                    ${item.published_content_id ? `<span class="badge bg-success ms-2"><i class="fa-solid fa-check me-1"></i>記事公開済</span>` : ''}
                </div>
                
                <div class="d-flex flex-wrap gap-2">
                    <button class="btn btn-sm btn-outline-info text-dark" id="btn-reanalyze-${item.id}" onclick="reanalyzeFeedItem('${item.id}')" title="Gemini 2.5 Flash で考察を再生成">
                        <i class="fa-solid fa-robot me-1 text-primary"></i>AI考察を再生成
                    </button>
                    ${isPending ? `
                        <button class="btn btn-sm btn-outline-secondary" onclick="updateItemStatus('${item.id}', 'dismissed')">
                            <i class="fa-solid fa-eye-slash me-1"></i>見送る
                        </button>
                        <button class="btn btn-sm btn-danger fw-bold" onclick="openPublishModal('${safeItemJson}')">
                            <i class="fa-solid fa-wand-magic-sparkles me-1"></i>✨ この内容で記事作成・公開
                        </button>
                    ` : ''}
                    ${item.status === 'dismissed' ? `
                        <button class="btn btn-sm btn-outline-primary" onclick="updateItemStatus('${item.id}', 'pending')">
                            <i class="fa-solid fa-rotate-left me-1"></i>未処理に戻す
                        </button>
                    ` : ''}
                    ${isPublished ? `
                        <button class="btn btn-sm btn-outline-success" onclick="openPublishedArticle('${item.published_content_id}')">
                            <i class="fa-solid fa-arrow-up-right-from-square me-1"></i>公開記事を確認
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * 単一アイテムのAI考察を再生成 (Gemini 2.5 Flash)
 */
async function reanalyzeFeedItem(itemId) {
    const btn = document.getElementById(`btn-reanalyze-${itemId}`);
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>AI考察生成中...';
    }

    try {
        const res = await fetch('/api/feeds/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: itemId, action: 'reanalyze' })
        });
        if (!res.ok) throw new Error('AI考察の再生成に失敗しました');

        fetchFeedItems(currentFeedTab);
    } catch (e) {
        alert(e.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

/**
 * ステータス更新（見送り / 未処理）
 */
async function updateItemStatus(itemId, newStatus) {
    try {
        const res = await fetch('/api/feeds/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: itemId, status: newStatus })
        });
        if (!res.ok) throw new Error('ステータス更新に失敗しました');
        
        // カードをフェードアウトして削除
        const card = document.getElementById(`card-${itemId}`);
        if (card) card.remove();
        
        // 件数を再集計
        fetchFeedItems(currentFeedTab);
    } catch (e) {
        alert(e.message);
    }
}

/**
 * 手動巡回実行
 */
async function triggerFeedCrawl(feedId = null) {
    const btn = document.getElementById('btnTriggerCrawl');
    const originalText = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>巡回中 (Gemini AI解析)...';
    }

    try {
        const res = await fetch('/api/feeds/crawl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feed_id: feedId })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        const resObj = data.result;
        alert(`巡回が完了しました！\n\n・チェックしたソース: ${resObj.checked_feeds}件\n・検出アイテム: ${resObj.total_detected}件\n・新着アイテム: ${resObj.new_items}件${resObj.errors.length > 0 ? `\n・エラー: ${resObj.errors.length}件` : ''}`);
        
        // リフレッシュ
        fetchFeedItems(currentFeedTab);
        fetchFeedSources();

    } catch (e) {
        alert(`巡回に失敗しました: ${e.message}`);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
}

function cleanMarkdownText(str) {
    if (!str) return '';
    return String(str)
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/^#{1,6}\s*(.+)$/gm, '【$1】')
        .replace(/^\s*[-*]\s+/gm, '・')
        .trim();
}

/**
 * 記事作成・公開モーダルを開く
 */
function openPublishModal(encodedItemJson) {
    const item = JSON.parse(decodeURIComponent(encodedItemJson));

    document.getElementById('pubFeedItemId').value = item.id;
    document.getElementById('pubFeedTitle').value = cleanMarkdownText(item.draft_title || item.title);
    document.getElementById('pubFeedLead').value = cleanMarkdownText(item.draft_lead || '');
    document.getElementById('pubFeedBody').value = cleanMarkdownText(item.draft_body || item.raw_text || '');
    document.getElementById('pubFeedL1').value = item.suggested_l1 || '営む';
    document.getElementById('pubFeedL2').value = item.suggested_l2 || '栽培支援';
    document.getElementById('pubFeedL3').value = item.suggested_l3 || '栽培指導';
    document.getElementById('pubFeedPdfUrl').value = item.pdf_url || '';
    document.getElementById('pubFeedType').value = 'news';

    const modal = new bootstrap.Modal(document.getElementById('feedPublishModal'));
    modal.show();
}

/**
 * 記事公開の送信実行
 */
async function submitFeedPublish() {
    const submitBtn = document.getElementById('btnSubmitFeedPublish');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>公開中...';

    const payload = {
        feed_item_id: document.getElementById('pubFeedItemId').value,
        title: document.getElementById('pubFeedTitle').value.trim(),
        lead_text: document.getElementById('pubFeedLead').value.trim(),
        body_text: document.getElementById('pubFeedBody').value.trim(),
        l1: document.getElementById('pubFeedL1').value,
        l2: document.getElementById('pubFeedL2').value,
        l3_label: document.getElementById('pubFeedL3').value,
        download_url: document.getElementById('pubFeedPdfUrl').value.trim() || null,
        type: document.getElementById('pubFeedType').value,
        status: 'published',
        site_scope: 'main'
    };

    try {
        const res = await fetch('/api/feeds/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || '公開に失敗しました');
        }

        const data = await res.json();
        alert('✨ 記事を公開しました！\nトップページお知らせおよび各カテゴリページに反映されました。多言語翻訳も自動実行されます。');

        bootstrap.Modal.getInstance(document.getElementById('feedPublishModal')).hide();
        fetchFeedItems(currentFeedTab);

    } catch (e) {
        alert(e.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '🚀 この内容で公開する';
    }
}

/**
 * 監視ソース一覧取得
 */
async function fetchFeedSources() {
    const listEl = document.getElementById('feedSourcesList');
    if (!listEl) return;

    try {
        const res = await fetch('/api/feeds/sources');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        allFeedSources = data.sources || [];

        listEl.innerHTML = allFeedSources.map(s => renderSourceRow(s)).join('');

    } catch (e) {
        console.error('Failed to fetch sources:', e);
        listEl.innerHTML = `<tr><td colspan="6" class="text-danger">取得エラー: ${e.message}</td></tr>`;
    }
}

/**
 * 監視ソース行のレンダリング
 */
function renderSourceRow(s) {
    let typeBadge = '';
    if (s.source_type === 'instagram') typeBadge = '<span class="badge bg-danger"><i class="fa-brands fa-instagram me-1"></i>Instagram</span>';
    else if (s.source_type === 'rss') typeBadge = '<span class="badge bg-warning text-dark"><i class="fa-solid fa-rss me-1"></i>RSS</span>';
    else if (s.source_type === 'neri') typeBadge = '<span class="badge bg-info text-dark"><i class="fa-solid fa-network-wired me-1"></i>NERI受託自動探索</span>';
    else if (s.source_type === 'nagano_bojo') typeBadge = '<span class="badge bg-primary">県病害虫防除部</span>';
    else if (s.source_type === 'nagano_kajushiken') typeBadge = '<span class="badge bg-primary">果樹試験場</span>';
    else if (s.source_type === 'nagano_nosei') typeBadge = '<span class="badge bg-primary">農村支援センター</span>';
    else typeBadge = '<span class="badge bg-secondary"><i class="fa-solid fa-globe me-1"></i>Web</span>';

    const statusToggle = s.is_active ? 
        `<button class="btn btn-sm btn-success fw-bold" onclick="toggleSourceActive('${s.id}', 0)">稼働中</button>` : 
        `<button class="btn btn-sm btn-secondary" onclick="toggleSourceActive('${s.id}', 1)">停止中</button>`;

    return `
    <tr>
        <td class="fw-bold">${escapeHtml(s.name)}</td>
        <td>${typeBadge}</td>
        <td><small class="text-muted text-break">${escapeHtml(s.source_target)}</small></td>
        <td><small>${escapeHtml(s.target_l1)} ＞ ${escapeHtml(s.target_l2)} ＞ ${escapeHtml(s.target_l3)}</small></td>
        <td>
            <small class="text-muted">${formatJstDateTime(s.last_checked_at)}</small>
            ${s.last_error ? `<br><small class="text-danger" title="${escapeHtml(s.last_error)}"><i class="fa-solid fa-triangle-exclamation"></i> エラー</small>` : ''}
        </td>
        <td>
            <div class="d-flex align-items-center gap-2">
                ${statusToggle}
                <button class="btn btn-sm btn-outline-primary" title="このソースだけテスト巡回" onclick="triggerFeedCrawl('${s.id}')">
                    <i class="fa-solid fa-play"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" title="削除" onclick="deleteFeedSource('${s.id}', '${escapeHtml(s.name)}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    </tr>
    `;
}

/**
 * 監視ソース有効/停止切替
 */
async function toggleSourceActive(sourceId, newActiveState) {
    try {
        const res = await fetch('/api/feeds/sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggle_active', id: sourceId, is_active: newActiveState })
        });
        if (!res.ok) throw new Error('切替に失敗しました');
        fetchFeedSources();
    } catch (e) {
        alert(e.message);
    }
}

/**
 * 監視ソース削除
 */
async function deleteFeedSource(sourceId, sourceName) {
    if (!confirm(`監視ソース「${sourceName}」を削除しますか？\n（過去に検知した記事データは削除されません）`)) return;

    try {
        const res = await fetch('/api/feeds/sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id: sourceId })
        });
        if (!res.ok) throw new Error('削除に失敗しました');
        fetchFeedSources();
    } catch (e) {
        alert(e.message);
    }
}

/**
 * 新規監視ソース作成モーダルを開く
 */
function openAddSourceModal() {
    document.getElementById('formAddSource').reset();
    const modal = new bootstrap.Modal(document.getElementById('modalAddSource'));
    modal.show();
}

/**
 * 新規監視ソース保存
 */
async function submitAddSource() {
    const payload = {
        name: document.getElementById('srcName').value.trim(),
        source_type: document.getElementById('srcType').value,
        source_target: document.getElementById('srcTarget').value.trim(),
        target_l1: document.getElementById('srcL1').value,
        target_l2: document.getElementById('srcL2').value,
        target_l3: document.getElementById('srcL3').value,
        is_active: 1
    };

    if (!payload.name || !payload.source_target) {
        alert('ソース名と対象URL/アカウント名を入力してください');
        return;
    }

    try {
        const res = await fetch('/api/feeds/sources', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('保存に失敗しました');
        
        const modalEl = document.getElementById('modalAddSource');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        fetchFeedSources();
    } catch (e) {
        alert(e.message);
    }
}

/**
 * URL直接インポートモーダルを開く
 */
function openImportUrlModal() {
    document.getElementById('importPageUrl').value = '';
    const modal = new bootstrap.Modal(document.getElementById('modalImportUrl'));
    modal.show();
}

/**
 * URL直接インポート送信
 */
async function submitImportUrl() {
    const urlInput = document.getElementById('importPageUrl');
    const feedSelect = document.getElementById('importFeedId');
    const submitBtn = document.getElementById('btnSubmitImportUrl');
    const url = urlInput.value.trim();

    if (!url || !url.startsWith('http')) {
        alert('有効なURL（https://...）を入力してください');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>AI解析・インポート中...';

    try {
        const res = await fetch('/api/feeds/import-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url,
                feed_id: feedSelect.value
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'インポートに失敗しました');

        alert(data.message || 'インポートが完了しました！');

        const modalEl = document.getElementById('modalImportUrl');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        // 未処理タブに切り替えて再取得
        switchFeedSubTab('pending');

    } catch (e) {
        alert(`インポートエラー: ${e.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles me-1"></i>インポート ＆ AI解析';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
