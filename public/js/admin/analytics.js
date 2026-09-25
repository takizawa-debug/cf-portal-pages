/**
 * admin-analytics.js — 管理画面アナリティクスダッシュボード
 * 役割: /api/analytics/summary と /api/analytics/realtime を呼び出し、各種チャート・テーブルを描画
 * 依存: Chart.js (CDN), Bootstrap 5, admin auth.js (apiFetch)
 */

// ==================== 状態管理 ====================
let _analyticsData = null;
let _realtimeTimer = null;
let _dailyChart = null;
let _hourlyChart = null;
let _allErrorDetails = [];

// ==================== タブ切替 ====================
function switchAnalyticsTab(tabId) {
    document.querySelectorAll('.analytics-subtab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.analytics-subpanel').forEach(p => p.style.display = 'none');
    const btn = document.querySelector(`[data-subtab="${tabId}"]`);
    if (btn) btn.classList.add('active');
    const panel = document.getElementById('subpanel-' + tabId);
    if (panel) panel.style.display = 'block';

    if (tabId === 'realtime') {
        loadRealtime();
        if (!_realtimeTimer) _realtimeTimer = setInterval(loadRealtime, 30000);
    } else {
        if (_realtimeTimer) { clearInterval(_realtimeTimer); _realtimeTimer = null; }
        if (!_analyticsData) loadAnalytics();
    }
}

// ==================== 期間パース ====================
function getAnalyticsPeriodParams() {
    const val = document.getElementById('analytics-period')?.value || '7';
    if (val.startsWith('hours:')) return `hours=${val.split(':')[1]}`;
    return `days=${val}`;
}

// ==================== リアルタイム ====================
async function loadRealtime() {
    try {
        const data = await apiFetch('/api/analytics/realtime');
        document.getElementById('realtime-count').textContent = data.active_users ?? 0;
        document.getElementById('realtime-updated').textContent = '最終更新: ' + new Date().toLocaleTimeString('ja-JP');

        // アクティブページ（タイトル優先表示）
        const pagesEl = document.getElementById('realtime-pages');
        if (data.active_pages?.length > 0) {
            pagesEl.innerHTML = data.active_pages.map(p => {
                const display = pathToTitle(p.title || p.path);
                return `<div class="d-flex justify-content-between small py-1 border-bottom">
                    <span class="text-truncate" style="max-width:180px;" title="${esc(p.path)}">${esc(display)}</span>
                    <span class="badge bg-brand">${p.count}</span>
                </div>`;
            }).join('');
        } else {
            pagesEl.innerHTML = '<div class="text-muted small">アクティブなページなし</div>';
        }

        // イベントストリーム（リッチカード形式）
        const streamEl = document.getElementById('realtime-stream');
        if (data.event_stream?.length > 0) {
            streamEl.innerHTML = data.event_stream.map(e => {
                const icon = eventIcon(e.event);
                const time = e.time ? new Date(e.time + 'Z').toLocaleTimeString('ja-JP') : '';
                const action = humanizeEvent(e.event, e.detail, e.title || e.path);
                const deviceIcon = e.device === 'mobile' ? '📱' : '🖥️';
                const location = [e.region, e.city].filter(Boolean).join(' ');

                return `<div class="d-flex gap-2 align-items-start small py-2 border-bottom" style="font-size:.78rem;">
                    <span style="font-size:1rem;flex-shrink:0;">${icon}</span>
                    <div class="flex-grow-1" style="min-width:0;">
                        <div class="fw-bold">${esc(action)}</div>
                        <div class="d-flex gap-2 text-muted" style="font-size:.68rem;">
                            <span>${deviceIcon}</span>
                            ${location ? `<span>📍${esc(location)}</span>` : ''}
                            <span class="ms-auto">${time}</span>
                        </div>
                    </div>
                </div>`;
            }).join('');
        } else {
            streamEl.innerHTML = '<div class="text-muted small">イベントなし</div>';
        }

        // セッション一覧テーブル
        renderRealtimeSessions(data.sessions || []);
    } catch (err) {
        console.error('Realtime load error:', err);
    }
}

/** セッション一覧テーブルを描画 */
function renderRealtimeSessions(sessions) {
    const el = document.getElementById('realtime-sessions');
    if (!sessions.length) {
        el.innerHTML = '<div class="text-muted small">アクティブなセッションなし</div>';
        return;
    }
    const rows = sessions.map(s => {
        const deviceIcon = s.device === 'mobile' ? '📱' : '🖥️';
        const action = humanizeEvent(s.last_action, s.action_detail, '');
        const page = pathToTitle(s.page_title || s.page);
        const location = [s.region, s.city].filter(Boolean).join(' ');
        const ago = s.last_seen ? timeAgo(s.last_seen) : '';

        return `<tr>
            <td class="text-muted" style="font-size:.7rem;">${esc(s.session_id)}</td>
            <td>${deviceIcon}</td>
            <td class="text-truncate" style="max-width:140px;" title="${esc(s.page)}">${esc(page)}</td>
            <td style="font-size:.72rem;">${esc(s.source || '')}</td>
            <td style="font-size:.72rem;">📍${esc(location)}</td>
            <td style="font-size:.72rem;">${esc(action)}</td>
            <td class="text-muted" style="font-size:.68rem;">${ago}</td>
        </tr>`;
    }).join('');

    el.innerHTML = `<table class="table table-sm table-hover mb-0" style="font-size:.78rem;">
        <thead><tr>
            <th>ID</th><th></th><th>ページ</th><th>流入元</th><th>地域</th><th>最終アクション</th><th>経過</th>
        </tr></thead>
        <tbody>${rows}</tbody>
    </table>`;
}

/** イベント名に対応するアイコンを返す */
function eventIcon(name) {
    const icons = {
        page_view: '📄', page_close: '🚪',
        card_click: '🍎', keyword_click: '🔑', search_submit: '🔍',
        sns_link_click: '📤', ui_click: '👆', tool_click: '🔧',
        modal_open: '📋', modal_close: '✖️',
        modal_pdf_generate: '📥', modal_share: '📤', modal_lang_switch: '🌐',
        exit_intent: '🚪', rage_click: '😤', field_hesitation: '✏️',
        js_error: '❌', resource_error: '⚠️',
    };
    return icons[name] || '📌';
}

/** イベント名+detailを人間が読める日本語行動文に変換 */
function humanizeEvent(eventName, detail, pageInfo) {
    const d = esc(detail || '');
    const page = esc(pageInfo || '');
    switch (eventName) {
        case 'page_view': return page ? `「${page}」を閲覧` : 'ページを閲覧';
        case 'page_close': return page ? `「${page}」を離脱` : 'ページを離脱';
        case 'card_click': return d ? `「${d}」カードをクリック` : 'カードをクリック';
        case 'keyword_click': return d ? `「${d}」キーワードをクリック` : 'キーワードをクリック';
        case 'search_submit': return d ? `「${d}」で検索` : '検索を実行';
        case 'sns_link_click': return d ? `${d} リンクをクリック` : 'SNSリンクをクリック';
        case 'ui_click': return d ? `「${d}」をクリック` : 'UI要素をクリック';
        case 'tool_click': return d ? `「${d}」ツールを使用` : 'ツールを使用';
        case 'modal_open': return d ? `「${d}」を開いた` : 'モーダルを開いた';
        case 'modal_close': return d ? `「${d}」を閉じた` : 'モーダルを閉じた';
        case 'modal_pdf_generate': return 'PDFを生成';
        case 'modal_share': return d ? `${d} でシェア` : 'シェアした';
        case 'modal_lang_switch': return d ? `言語を ${langLabel(d)} に切替` : '言語を切替';
        case 'exit_intent': return '離脱の兆候を検知';
        case 'rage_click': return d ? `「${d}」を連続クリック` : '連続クリック検知';
        case 'field_hesitation': return d ? `「${d}」で入力停滞` : 'フォームで入力停滞';
        case 'js_error': return 'JSエラー発生';
        default: return eventName + (d ? `: ${d}` : '');
    }
}

/** 言語コード→表示名 */
function langLabel(lang) {
    const m = { ja: '日本語', en: '英語', zh: '繁体中国語', 'zh-TW': '繁体中国語' };
    return m[lang] || lang;
}

/** パス→表示用ページ名（タイトルがない場合のフォールバック） */
function pathToTitle(pathOrTitle) {
    if (!pathOrTitle || pathOrTitle === '/') return 'トップページ';
    // 既にタイトルっぽい文字列ならそのまま返す
    if (pathOrTitle.includes(' ') || !pathOrTitle.startsWith('/')) return pathOrTitle;
    const map = {
        '/discover': '知る', '/savor': '味わう', '/experience': '体験する',
        '/lifestyle': '暮らす', '/business': '営む', '/contact': 'お問い合わせ',
        '/site-map': 'サイトマップ', '/site-policy': 'サイトポリシー',
        '/privacy-policy': 'プライバシーポリシー',
    };
    if (map[pathOrTitle]) return map[pathOrTitle];
    if (pathOrTitle.startsWith('/article/')) {
        try { return decodeURIComponent(pathOrTitle.split('/')[2]); } catch (_) {}
    }
    return pathOrTitle;
}

/** 経過時間を人間が読める文字列に変換 */
function timeAgo(dateStr) {
    try {
        const diff = Date.now() - new Date(dateStr + 'Z').getTime();
        const sec = Math.floor(diff / 1000);
        if (sec < 60) return `${sec}秒前`;
        const min = Math.floor(sec / 60);
        return `${min}分前`;
    } catch (_) { return ''; }
}

// ==================== サマリーデータ読み込み ====================
async function loadAnalytics() {
    const params = getAnalyticsPeriodParams();
    try {
        _analyticsData = await apiFetch(`/api/analytics/summary?${params}`);
        renderOverview(_analyticsData);
        renderContent(_analyticsData);
        renderBehavior(_analyticsData);
        renderAIVisibility(_analyticsData);
        renderSEOScore(_analyticsData);
        renderTechnical(_analyticsData);
    } catch (err) {
        console.error('Analytics load error:', err);
        document.getElementById('analytics-kpi').innerHTML = `<div class="alert alert-danger">${esc(err.message)}</div>`;
    }
}

// ==================== 概要タブ ====================
function renderOverview(d) {
    const o = d.overview;
    // KPIカード
    const kpis = [
        { label: 'セッション数', value: fmt(o.total_sessions), icon: '' },
        { label: 'ユニークユーザー', value: fmt(o.unique_visitors), icon: '' },
        { label: 'ページビュー', value: fmt(o.page_views), icon: '' },
        { label: 'PV/セッション', value: o.pv_per_session, icon: '' },
        { label: '平均滞在時間', value: msToHuman(o.avg_engaged_ms), icon: '' },
        { label: '平均スクロール', value: o.avg_scroll_depth + '%', icon: '' },
        { label: 'PDF発行数', value: fmt(o.pdf_generated), icon: '' },
        { label: '言語切替', value: fmt(o.lang_switches), icon: '' },
        { label: 'Engスコア', value: (o.avg_engagement_score || 0) + '/100', icon: '' },
        { label: '回遊率', value: ((o.deep_nav_rate || 0) * 100).toFixed(1) + '%', icon: '' },
    ];
    document.getElementById('analytics-kpi').innerHTML = `<div class="row g-2">${kpis.map(k =>
        `<div class="col-6 col-md-3"><div class="card border-0 shadow-sm bg-white p-2 text-center">
            <div class="text-muted" style="font-size:.7rem;">${k.icon} ${k.label}</div>
            <div class="fw-bold" style="font-size:1.3rem;color:var(--text2);">${k.value}</div>
        </div></div>`
    ).join('')}</div>`;

    // 日別チャート
    renderDailyChart(d.daily);
    // 時間帯チャート
    renderHourlyChart(d.hourly);
    // デバイス
    renderDevices(d.devices);
    // 言語
    renderLanguages(d.language_stats);
    // 地域
    renderGeo(d.geo_regions);
}

function renderDailyChart(daily) {
    const container = document.getElementById('analytics-daily');
    if (!daily?.length) { container.innerHTML = '<div class="text-muted small text-center py-3">データなし</div>'; return; }
    container.innerHTML = '<canvas id="chart-daily"></canvas>';
    if (_dailyChart) _dailyChart.destroy();
    const ctx = document.getElementById('chart-daily').getContext('2d');
    _dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: daily.map(d => d.date?.slice(5)),
            datasets: [
                { label: 'セッション', data: daily.map(d => d.sessions), borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,.1)', fill: true, tension: .3 },
                { label: 'PV', data: daily.map(d => d.page_views), borderColor: '#0d6efd', backgroundColor: 'rgba(13,110,253,.08)', fill: true, tension: .3 },
                { label: 'UU', data: daily.map(d => d.unique_visitors), borderColor: '#198754', backgroundColor: 'transparent', borderDash: [5, 3], tension: .3 },
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 } } } }, scales: { y: { beginAtZero: true }, x: { ticks: { font: { size: 9 } } } } }
    });
}

function renderHourlyChart(hourly) {
    const container = document.getElementById('analytics-hourly');
    if (!hourly?.length) { container.innerHTML = '<div class="text-muted small text-center py-3">データなし</div>'; return; }
    container.innerHTML = '<canvas id="chart-hourly"></canvas>';
    if (_hourlyChart) _hourlyChart.destroy();
    const ctx = document.getElementById('chart-hourly').getContext('2d');
    _hourlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: hourly.map(h => h.hour + '時'),
            datasets: [{ label: 'セッション', data: hourly.map(h => h.sessions), backgroundColor: 'rgba(220,53,69,.6)', borderRadius: 4 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { ticks: { font: { size: 9 } } } } }
    });
}

function renderDevices(devices) {
    const el = document.getElementById('analytics-devices');
    if (!devices?.length) { el.innerHTML = '<div class="text-muted small">データなし</div>'; return; }
    const colors = { mobile: '#0d6efd', desktop: '#198754', unknown: '#6c757d' };
    const labels = { mobile: 'モバイル', desktop: 'デスクトップ', unknown: '不明' };
    el.innerHTML = devices.map(d =>
        `<div class="d-flex justify-content-between align-items-center small py-1">
            <span>${labels[d.type] || d.type}</span>
            <div class="d-flex align-items-center gap-2" style="width:60%;">
                <div class="progress flex-grow-1" style="height:8px;"><div class="progress-bar" style="width:${d.pct}%;background:${colors[d.type] || '#6c757d'};"></div></div>
                <span class="text-muted" style="min-width:50px;text-align:right;">${d.sessions} (${d.pct}%)</span>
            </div>
        </div>`
    ).join('');
}

function renderLanguages(langs) {
    const el = document.getElementById('analytics-languages');
    if (!langs?.length) { el.innerHTML = '<div class="text-muted small">データなし</div>'; return; }
    const labels = { ja: '🇯🇵 日本語', en: '🇺🇸 English', zh: '🇹🇼 繁體中文' };
    const total = langs.reduce((s, l) => s + l.sessions, 0);
    el.innerHTML = langs.map(l => {
        const pct = total > 0 ? ((l.sessions / total) * 100).toFixed(1) : 0;
        return `<div class="d-flex justify-content-between align-items-center small py-1">
            <span>${labels[l.lang] || l.lang}</span>
            <div class="d-flex align-items-center gap-2" style="width:55%;">
                <div class="progress flex-grow-1" style="height:8px;"><div class="progress-bar bg-warning" style="width:${pct}%;"></div></div>
                <span class="text-muted" style="min-width:50px;text-align:right;">${l.sessions} (${pct}%)</span>
            </div>
        </div>`;
    }).join('');
}

function renderGeo(regions) {
    const el = document.getElementById('analytics-geo');
    if (!regions?.length) { el.innerHTML = '<div class="text-muted small">データなし</div>'; return; }
    const max = regions[0]?.sessions || 1;
    el.innerHTML = regions.slice(0, 8).map(r => {
        const pct = ((r.sessions / max) * 100).toFixed(0);
        return `<div class="d-flex justify-content-between align-items-center small py-1">
            <span>📍 ${esc(r.region)}</span>
            <div class="d-flex align-items-center gap-2" style="width:55%;">
                <div class="progress flex-grow-1" style="height:8px;"><div class="progress-bar bg-success" style="width:${pct}%;"></div></div>
                <span class="text-muted" style="min-width:35px;text-align:right;">${r.sessions}</span>
            </div>
        </div>`;
    }).join('');
}

// ==================== コンテンツタブ ====================
function renderContent(d) {
    // ページ別PV
    const pagesEl = document.getElementById('analytics-pages');
    if (d.pages?.length) {
        const max = d.pages[0]?.views || 1;
        pagesEl.innerHTML = d.pages.map((p, i) => {
            const pct = ((p.views / max) * 100).toFixed(0);
            return `<div class="d-flex justify-content-between align-items-center small py-1 ${i % 2 === 0 ? '' : 'bg-light'}" style="padding:2px 4px;">
                <span class="text-truncate" style="max-width:250px;" title="${esc(p.path)}">${esc(p.path)}</span>
                <div class="d-flex align-items-center gap-2" style="width:40%;">
                    <div class="progress flex-grow-1" style="height:6px;"><div class="progress-bar bg-danger" style="width:${pct}%;"></div></div>
                    <span class="text-muted fw-bold" style="min-width:35px;text-align:right;">${fmt(p.views)}</span>
                </div>
            </div>`;
        }).join('');
    } else {
        pagesEl.innerHTML = '<div class="text-muted small">データなし</div>';
    }

    // 検索キーワード
    const searchEl = document.getElementById('analytics-search');
    if (d.search_analysis?.length) {
        searchEl.innerHTML = `<div style="max-height:250px;overflow-y:auto;">` +
            d.search_analysis.map((s, i) =>
                `<div class="d-flex justify-content-between small py-1 ${i % 2 === 0 ? '' : 'bg-light'}" style="padding:2px 4px;">
                    <span>${esc(s.term)}</span>
                    <span class="badge bg-secondary">${s.count}回</span>
                </div>`
            ).join('') + '</div>';
    } else {
        searchEl.innerHTML = '<div class="text-muted small">データなし</div>';
    }

    // コンテンツ有効性マトリクス（4象限: クリック数 × モーダル滞在・操作数）
    const matEl = document.getElementById('analytics-content-matrix');
    if (d.content_events?.length) {
        // 閾値: 中央値
        const clicks = d.content_events.map(c => c.clicks).sort((a, b) => a - b);
        const engagements = d.content_events.map(c => c.modal_opens + c.pdf + c.share).sort((a, b) => a - b);
        const medClicks = clicks[Math.floor(clicks.length / 2)] || 1;
        const medEng = engagements[Math.floor(engagements.length / 2)] || 1;

        const quadrants = { star: [], potential: [], declining: [], niche: [] };
        d.content_events.forEach(c => {
            const totalEng = c.modal_opens + c.pdf + c.share;
            if (c.clicks >= medClicks && totalEng >= medEng) quadrants.star.push(c);
            else if (c.clicks >= medClicks && totalEng < medEng) quadrants.declining.push(c);
            else if (c.clicks < medClicks && totalEng >= medEng) quadrants.niche.push(c);
            else quadrants.potential.push(c);
        });

        const qLabels = [
            { key: 'star', label: 'スター（高クリック×高エンゲージ）', color: '#198754' },
            { key: 'declining', label: '改善候補（高クリック×低エンゲージ）', color: '#ffc107' },
            { key: 'niche', label: '隠れた名記事（低クリック×高エンゲージ）', color: '#0d6efd' },
            { key: 'potential', label: '要テコ入れ（低クリック×低エンゲージ）', color: '#6c757d' },
        ];
        matEl.innerHTML = `<div class="row g-2">${qLabels.map(q => {
            const items = quadrants[q.key].slice(0, 5);
            return `<div class="col-md-6"><div class="p-2 border rounded" style="border-color:${q.color}!important;">
                <div class="small fw-bold mb-1" style="color:${q.color}">${q.label}</div>
                ${items.length ? items.map(c =>
                    `<div class="small text-truncate py-1 border-bottom">${esc(c.title)} <span class="text-muted">(${c.clicks}cl / ${c.modal_opens + c.pdf + c.share}eng)</span></div>`
                ).join('') : '<div class="small text-muted">なし</div>'}
            </div></div>`;
        }).join('')}</div>`;
    } else {
        matEl.innerHTML = '<div class="text-muted small">データなし</div>';
    }

    // 記事別パフォーマンス
    const evEl = document.getElementById('analytics-content-events');
    if (d.content_events?.length) {
        evEl.innerHTML = `<table class="table table-sm table-hover m-0" style="font-size:.8rem;">
            <thead class="table-light"><tr>
                <th>記事タイトル</th><th class="text-center">クリック</th><th class="text-center">モーダル</th>
                <th class="text-center">PDF</th><th class="text-center">共有</th><th class="text-center">言語切替</th>
            </tr></thead>
            <tbody>${d.content_events.map(c =>
                `<tr><td class="text-truncate" style="max-width:200px;" title="${esc(c.title)}">${esc(c.title)}</td>
                <td class="text-center">${c.clicks}</td><td class="text-center">${c.modal_opens}</td>
                <td class="text-center">${c.pdf}</td><td class="text-center">${c.share}</td>
                <td class="text-center">${c.lang_switch}</td></tr>`
            ).join('')}</tbody></table>`;
    } else {
        evEl.innerHTML = '<div class="text-muted small">データなし</div>';
    }
}

// ==================== ユーザー行動タブ ====================
function renderBehavior(d) {
    // リファラー
    const refEl = document.getElementById('analytics-referrers');
    if (d.referrers?.length) {
        const max = d.referrers[0]?.sessions || 1;
        refEl.innerHTML = d.referrers.map(r => {
            const pct = ((r.sessions / max) * 100).toFixed(0);
            const label = r.source.includes('google') ? r.source :
                          r.source.includes('line.me') ? 'LINE' :
                          r.source.includes('instagram') || r.source.includes('l.instagram') ? 'Instagram' :
                          r.source.includes('facebook') || r.source.includes('l.facebook') ? 'Facebook' :
                          r.source.includes('x.com') || r.source.includes('t.co') ? 'X (Twitter)' :
                          r.source;
            return `<div class="d-flex justify-content-between align-items-center small py-1">
                <span class="text-truncate" style="max-width:180px;">${esc(label)}</span>
                <div class="d-flex align-items-center gap-2" style="width:45%;">
                    <div class="progress flex-grow-1" style="height:6px;"><div class="progress-bar bg-primary" style="width:${pct}%;"></div></div>
                    <span class="text-muted" style="min-width:30px;text-align:right;">${r.sessions}</span>
                </div>
            </div>`;
        }).join('');
    } else {
        refEl.innerHTML = '<div class="text-muted small">データなし</div>';
    }

    // UTM
    const utmEl = document.getElementById('analytics-utm');
    if (d.utm_campaigns?.length) {
        utmEl.innerHTML = `<table class="table table-sm m-0" style="font-size:.78rem;">
            <thead class="table-light"><tr><th>ソース</th><th>メディア</th><th>キャンペーン</th><th class="text-end">セッション</th></tr></thead>
            <tbody>${d.utm_campaigns.map(u =>
                `<tr><td>${esc(u.source||'-')}</td><td>${esc(u.medium||'-')}</td><td>${esc(u.campaign||'-')}</td><td class="text-end fw-bold">${u.sessions}</td></tr>`
            ).join('')}</tbody></table>`;
    } else {
        utmEl.innerHTML = '<div class="text-muted small">データなし</div>';
    }

    // スクロール深度
    const scrollEl = document.getElementById('analytics-scroll');
    if (d.scroll_depth?.length) {
        scrollEl.innerHTML = d.scroll_depth.map(s => {
            const color = s.avg_depth >= 75 ? '#198754' : s.avg_depth >= 50 ? '#ffc107' : '#dc3545';
            return `<div class="d-flex justify-content-between align-items-center small py-1">
                <span class="text-truncate" style="max-width:200px;" title="${esc(s.path)}">${esc(s.path)}</span>
                <div class="d-flex align-items-center gap-2" style="width:40%;">
                    <div class="progress flex-grow-1" style="height:8px;"><div class="progress-bar" style="width:${s.avg_depth}%;background:${color};"></div></div>
                    <span class="text-muted" style="min-width:40px;text-align:right;">${s.avg_depth}%</span>
                </div>
            </div>`;
        }).join('');
    } else {
        scrollEl.innerHTML = '<div class="text-muted small">データなし</div>';
    }

    // フォーム停滞
    const fieldsEl = document.getElementById('analytics-fields');
    if (d.field_hesitations?.length) {
        fieldsEl.innerHTML = d.field_hesitations.map(f =>
            `<div class="d-flex justify-content-between small py-1">
                <span>${esc(f.field)}</span>
                <span class="text-muted">${f.count}回 (平均 ${(f.avg_pause_ms / 1000).toFixed(1)}秒停滞)</span>
            </div>`
        ).join('');
    } else {
        fieldsEl.innerHTML = '<div class="text-muted small">停滞データなし（良好！）</div>';
    }
}

// ==================== AI可視性タブ (リアルタイム & インテリジェンス強化版) ====================
function renderAIVisibility(d) {
    const ai = d.ai_visibility || {};
    const sq = d.search_quality || {};

    // 1. KPIカウント (総リクエスト数とセッション数を正確に区別して表示)
    const totalAiRequests = ai.total_ai_requests || (ai.ai_crawlers || []).reduce((s, c) => s + (c.requests || c.visits), 0);
    const totalAiSessions = (ai.ai_crawlers || []).reduce((s, c) => s + c.visits, 0);
    const searchCrawlTotal = (ai.search_crawlers || []).reduce((s, c) => s + (c.requests || c.visits), 0);
    const aiRefTotal = (ai.ai_referrals || []).reduce((s, c) => s + c.sessions, 0);

    // ユニークページ数
    const uniquePages = (ai.ai_crawlers || []).reduce((max, c) => Math.max(max, c.pages_crawled || 0), 0);

    document.getElementById('ai-crawl-count').textContent = fmt(totalAiRequests);
    const crawlSubEl = document.getElementById('ai-crawl-sub');
    if (crawlSubEl) crawlSubEl.textContent = `累計 ${fmt(totalAiSessions)} セッション訪問`;

    const pagesEl = document.getElementById('ai-pages-count');
    if (pagesEl) pagesEl.textContent = fmt(uniquePages) + ' p';

    document.getElementById('ai-referral-count').textContent = fmt(aiRefTotal) + ' 名';
    const refSubEl = document.getElementById('ai-referral-sub');
    if (refSubEl) refSubEl.textContent = aiRefTotal > 0 ? 'AIチャット画面から流入' : '今後成長が見込まれる領域';

    document.getElementById('search-crawl-count').textContent = fmt(searchCrawlTotal);
    const searchSubEl = document.getElementById('search-crawl-sub');
    if (searchSubEl) searchSubEl.textContent = 'Googlebot, Bingbot等';

    // 2. AIアクセスが意味すること（インテリジェンス解説）
    const insightsEl = document.getElementById('ai-intent-insights');
    if (insightsEl) {
        const aiC = ai.ai_crawlers || [];
        const hasMeta = aiC.some(c => c.name.toLowerCase().includes('meta'));
        const hasDuck = aiC.some(c => c.name.toLowerCase().includes('duck'));
        const hasPerp = aiC.some(c => c.name.toLowerCase().includes('perplexity'));
        const hasApple = aiC.some(c => c.name.toLowerCase().includes('apple'));
        const hasOpenAI = aiC.some(c => c.name.toLowerCase().includes('gpt') || c.name.toLowerCase().includes('chatgpt'));

        const cards = [];

        // Meta AI
        if (hasMeta) {
            cards.push(`
                <div class="col-md-6">
                    <div class="p-2 rounded border" style="background:#fcfaff; border-color:#e9d5ff !important;">
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="badge" style="background:#7c3aed;">Meta AI (Llama)</span>
                            <span class="fw-bold small text-dark">世界のSNS & AI検索の回答源</span>
                        </div>
                        <div class="text-muted" style="font-size:.78rem; line-height:1.45;">
                            <strong>【収集の目的・意味】</strong> Meta社（Instagram/WhatsApp/Facebook）の生成AIが、飯綱町のりんご品種や直売所、フェア情報を網羅的に事前学習・インデックス化しています。<br>
                            <strong>【効果】</strong> SNS上のAIアシスタントに「長野でおすすめのりんごは？」「高坂林檎とは？」と聞いた際、飯綱町の正確な情報が回答される土台が確立されています。
                        </div>
                    </div>
                </div>
            `);
        }

        // Perplexity & DuckDuckGo (リアルタイム回答エンジン)
        if (hasPerp || hasDuck) {
            cards.push(`
                <div class="col-md-6">
                    <div class="p-2 rounded border" style="background:#f0fdf4; border-color:#bbf7d0 !important;">
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="badge bg-success">Perplexity & DuckAssist</span>
                            <span class="fw-bold small text-dark">リアルタイム検索での直接引用</span>
                        </div>
                        <div class="text-muted" style="font-size:.78rem; line-height:1.45;">
                            <strong>【収集の目的・意味】</strong> ユーザーが「今週末の飯綱りんごイベント」「酸っぱいクッキングアップルの買える場所」等を質問した際、最新情報をリアルタイムに取得して回答に引用しています。<br>
                            <strong>【効果】</strong> 回答文中の出典リンク（脚注）としてポータルのURLが表示され、購買意欲の高いユーザーの直接送客につながります。
                        </div>
                    </div>
                </div>
            `);
        }

        // Apple Intelligence
        if (hasApple) {
            cards.push(`
                <div class="col-md-6">
                    <div class="p-2 rounded border" style="background:#f8fafc; border-color:#cbd5e1 !important;">
                        <div class="d-flex align-items-center gap-2 mb-1">
                            <span class="badge bg-dark">Apple Intelligence</span>
                            <span class="fw-bold small text-dark">iPhone / Siri / Safariの知識統合</span>
                        </div>
                        <div class="text-muted" style="font-size:.78rem; line-height:1.45;">
                            <strong>【収集の目的・意味】</strong> iOS端末でSiriやSpotlight検索を行った際に、飯綱町の観光・直売所スポットをデバイス上で直接レコメンドするための知識収集です。
                        </div>
                    </div>
                </div>
            `);
        }

        // 今後のアクション提言
        cards.push(`
            <div class="col-md-6">
                <div class="p-2 rounded border" style="background:#eff6ff; border-color:#bfdbfe !important;">
                    <div class="d-flex align-items-center gap-2 mb-1">
                        <span class="badge bg-primary">GEO (AI検索最適化) 提言</span>
                        <span class="fw-bold small text-dark">今後PV・送客をさらに増やす鍵</span>
                    </div>
                    <div class="text-muted" style="font-size:.78rem; line-height:1.45;">
                        AIは<strong>「直売所名」「品種ごとの味・旬」「営業時間・価格」</strong>などの構造化された実用情報を極めて高く評価しています。品種記事・直売所ページの更新を継続することで、AI検索経由の訪問者を継続的に拡大できます。
                    </div>
                </div>
            </div>
        `);

        insightsEl.innerHTML = cards.join('');
    }

    // 3. AIクローラー詳細一覧 (総収集数とセッション数を明記)
    const aiEl = document.getElementById('ai-crawlers-detail');
    if (ai.ai_crawlers?.length) {
        aiEl.innerHTML = ai.ai_crawlers.map(c => {
            const lastSeen = c.last_seen ? new Date(c.last_seen + 'Z').toLocaleDateString('ja-JP') + ' ' + new Date(c.last_seen + 'Z').toLocaleTimeString('ja-JP', {hour:'2-digit', minute:'2-digit'}) : '—';
            const req = c.requests || c.visits;
            return `<div class="d-flex justify-content-between align-items-center small py-2 border-bottom">
                <div>
                    <span class="fw-bold" style="color:#7c3aed; font-size:.9rem;">${esc(c.name)}</span><br>
                    <span class="text-muted" style="font-size:.73rem;">最終収集: ${lastSeen} ・ 巡回範囲: <strong>${c.pages_crawled}</strong> ページ</span>
                </div>
                <div class="text-end">
                    <span class="badge" style="background:#7c3aed; font-size:.85rem;">${fmt(req)} 回取得</span><br>
                    <span class="text-muted" style="font-size:.68rem;">(${c.visits} 訪問セッション)</span>
                </div>
            </div>`;
        }).join('');
    } else {
        aiEl.innerHTML = '<div class="text-muted small p-3 text-center">AIクローラーのアクセスなし（今後蓄積されます）</div>';
    }

    // 4. AI流入詳細
    const refEl = document.getElementById('ai-referrals-detail');
    if (ai.ai_referrals?.length) {
        refEl.innerHTML = ai.ai_referrals.map(r =>
            `<div class="d-flex justify-content-between align-items-center small py-2 border-bottom">
                <div>
                    <span class="badge bg-success me-1">${esc(r.source)}</span>
                    <span class="text-dark fw-bold">着地: <code>${esc(r.landing_page || '/')}</code></span>
                </div>
                <span class="badge bg-light text-dark border">${r.sessions} セッション</span>
            </div>`
        ).join('');
    } else {
        refEl.innerHTML = '<div class="text-muted small p-3 text-center">AIチャット（ChatGPT/Perplexity等）からの直接流入は現在1件前後。AIの知識学習が進むにつれ今後本格化します。</div>';
    }

    // 5. どのAIがどの情報にアクセスしたか（コンテンツ別詳細テーブル）
    const tbody = document.getElementById('ai-crawled-pages-body');
    if (tbody) {
        const pages = ai.ai_crawled_pages || [];
        if (pages.length) {
            tbody.innerHTML = pages.map(p => {
                let cleanUrl = p.page_url;
                let displayTitle = '';
                try {
                    const u = new URL(cleanUrl);
                    cleanUrl = u.pathname + u.search;
                    if (u.pathname.startsWith('/article/')) {
                        const articleSlug = decodeURIComponent(u.pathname.replace('/article/', ''));
                        displayTitle = `<span class="badge bg-secondary me-1">記事</span> <strong>${esc(articleSlug)}</strong> `;
                    } else if (u.pathname === '/experience') {
                        displayTitle = '<span class="badge bg-primary me-1">体験する</span> 農業体験・観光情報 ';
                    } else if (u.pathname === '/savor') {
                        displayTitle = '<span class="badge bg-danger me-1">味わう</span> 直売所・グルメ・シードル ';
                    } else if (u.pathname === '/discover') {
                        displayTitle = '<span class="badge bg-info text-dark me-1">知る</span> 飯綱町のりんごの歴史・特徴 ';
                    } else if (u.pathname === '/business') {
                        displayTitle = '<span class="badge bg-warning text-dark me-1">営む</span> 就農・事業者情報 ';
                    }
                    if (u.search.includes('lang=en')) displayTitle += '<span class="badge bg-light text-dark border">EN 英語</span>';
                    else if (u.search.includes('lang=zh')) displayTitle += '<span class="badge bg-light text-dark border">ZH 繁体字</span>';
                } catch (_) {}

                const lastCrawled = p.last_crawled ? new Date(p.last_crawled + 'Z').toLocaleDateString('ja-JP') + ' ' + new Date(p.last_crawled + 'Z').toLocaleTimeString('ja-JP', {hour:'2-digit', minute:'2-digit'}) : '—';

                return `<tr>
                    <td><span class="badge text-white" style="background:#7c3aed;">${esc(p.bot_name || 'AI Bot')}</span></td>
                    <td>
                        <div>${displayTitle}</div>
                        <div class="text-muted" style="font-size:.72rem; word-break:break-all;">${esc(cleanUrl)}</div>
                    </td>
                    <td class="text-end fw-bold text-dark">${fmt(p.hits)} 回</td>
                    <td class="text-end text-muted" style="font-size:.75rem;">${lastCrawled}</td>
                </tr>`;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted p-3">クロールログ集計中...</td></tr>';
        }
    }

    // 6. リアルタイムAIアクセスログ (タイムライン)
    const feedEl = document.getElementById('ai-recent-feed');
    if (feedEl) {
        const logs = ai.ai_recent_logs || [];
        if (logs.length) {
            feedEl.innerHTML = logs.map(l => {
                const dateObj = new Date(l.created_at + 'Z');
                const timeStr = dateObj.toLocaleTimeString('ja-JP', {hour:'2-digit', minute:'2-digit'});
                const dateStr = (dateObj.getMonth() + 1) + '/' + dateObj.getDate();
                let shortUrl = l.page_url;
                try {
                    const u = new URL(l.page_url);
                    shortUrl = decodeURIComponent(u.pathname + u.search);
                } catch (_) {}

                return `<div class="d-flex justify-content-between align-items-center py-1 border-bottom">
                    <div style="max-width:75%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        <span class="fw-bold" style="color:#7c3aed;">${esc(l.bot_name)}</span> 
                        <span class="text-dark">→ ${esc(shortUrl)}</span>
                    </div>
                    <span class="text-muted" style="font-size:.72rem;">${dateStr} ${timeStr}</span>
                </div>`;
            }).join('');
        } else {
            feedEl.innerHTML = '<div class="text-muted p-2 text-center">直近のAIアクセスを待機中...</div>';
        }
    }

    // 7. 検索エンジン分類
    const seEl = document.getElementById('search-engines-detail');
    if (sq.search_engines?.length) {
        const max = sq.search_engines[0]?.sessions || 1;
        const engineColors = { Google: '#4285f4', Bing: '#00809d', Yahoo: '#7b0099', DuckDuckGo: '#de5833', Baidu: '#2319dc' };
        seEl.innerHTML = `<div class="mb-2 small">オーガニック比率: <span class="fw-bold">${((sq.organic_ratio || 0) * 100).toFixed(1)}%</span></div>` +
            sq.search_engines.map(e => {
                const pct = ((e.sessions / max) * 100).toFixed(0);
                const color = engineColors[e.engine] || '#6c757d';
                return `<div class="d-flex justify-content-between align-items-center small py-1">
                    <span style="color:${color};font-weight:600;">${esc(e.engine)}</span>
                    <div class="d-flex align-items-center gap-2" style="width:55%;">
                        <div class="progress flex-grow-1" style="height:8px;"><div class="progress-bar" style="width:${pct}%;background:${color};"></div></div>
                        <span class="text-muted" style="min-width:50px;text-align:right;">${fmt(e.sessions)} 回</span>
                    </div>
                </div>`;
            }).join('');
    } else {
        seEl.innerHTML = '<div class="text-muted small">検索エンジン経由のアクセスなし</div>';
    }

    // 8. その他クローラー
    const otherEl = document.getElementById('other-crawlers-detail');
    const allOther = [...(ai.search_crawlers || []), ...(ai.social_crawlers || [])];
    if (allOther.length) {
        otherEl.innerHTML = allOther.map(c => {
            const req = c.requests || c.visits;
            return `<div class="d-flex justify-content-between small py-1 border-bottom">
                <span>🕷️ ${esc(c.name)}</span>
                <span class="text-muted">${fmt(req)} 回取得 (${c.visits} 訪問 / ${c.pages_crawled} ページ)</span>
            </div>`;
        }).join('');
    } else {
        otherEl.innerHTML = '<div class="text-muted small">データなし</div>';
    }
}

// ==================== SEOスコアタブ ====================
function renderSEOScore(d) {
    const cq = d.content_quality || {};
    const o = d.overview || {};
    const wv = d.web_vitals || {};
    const perf = d.performance_avg || {};

    // スコアカード
    const el = document.getElementById('seo-scorecard');
    const metrics = [
        { label: 'エンゲージメント', value: cq.avg_engagement_score || 0, max: 100, unit: '/100',
          rating: (cq.avg_engagement_score || 0) >= 60 ? 'good' : (cq.avg_engagement_score || 0) >= 30 ? 'needs' : 'poor' },
        { label: '回遊率', value: ((cq.deep_nav_rate || 0) * 100).toFixed(1), max: 100, unit: '%',
          rating: (cq.deep_nav_rate || 0) >= 0.3 ? 'good' : (cq.deep_nav_rate || 0) >= 0.15 ? 'needs' : 'poor' },
        { label: '平均スクロール', value: o.avg_scroll_depth || 0, max: 100, unit: '%',
          rating: (o.avg_scroll_depth || 0) >= 60 ? 'good' : (o.avg_scroll_depth || 0) >= 30 ? 'needs' : 'poor' },
        { label: 'PV/セッション', value: o.pv_per_session || 0, max: 5, unit: '',
          rating: (o.pv_per_session || 0) >= 2 ? 'good' : (o.pv_per_session || 0) >= 1.2 ? 'needs' : 'poor' },
    ];
    if (wv.lcp) metrics.push({ label: 'LCP', value: wv.lcp.avg, max: 4000, unit: 'ms', rating: wv.lcp.avg <= 2500 ? 'good' : wv.lcp.avg <= 4000 ? 'needs' : 'poor' });
    if (wv.cls) metrics.push({ label: 'CLS', value: wv.cls.avg, max: 0.25, unit: '', rating: wv.cls.avg <= 0.1 ? 'good' : wv.cls.avg <= 0.25 ? 'needs' : 'poor' });

    const rColors = { good: '#059669', needs: '#d97706', poor: '#dc2626' };
    const rLabels = { good: '優秀', needs: '要改善', poor: '要対策' };
    el.innerHTML = `<div class="row g-2">${metrics.map(m =>
        `<div class="col-6 col-md-3"><div class="border rounded p-2 text-center" style="border-color:${rColors[m.rating]}!important;">
            <div class="small text-muted">${m.label}</div>
            <div class="fw-bold" style="font-size:1.3rem;color:${rColors[m.rating]};">${m.value}${m.unit}</div>
            <div style="font-size:.6rem;color:${rColors[m.rating]};">${rLabels[m.rating]}</div>
        </div></div>`
    ).join('')}</div>`;

    // エンゲージメントスコア詳細
    const engEl = document.getElementById('engagement-scores-detail');
    if (cq.engagement_scores?.length) {
        engEl.innerHTML = cq.engagement_scores.map(e => {
            const color = e.avg_score >= 60 ? '#059669' : e.avg_score >= 30 ? '#d97706' : '#dc2626';
            const readPct = ((e.avg_read_ratio || 0) * 100).toFixed(0);
            return `<div class="d-flex justify-content-between align-items-center small py-2 border-bottom">
                <div class="text-truncate" style="max-width:200px;" title="${esc(e.path)}">${esc(e.path)}</div>
                <div class="d-flex align-items-center gap-2">
                    <span class="text-muted" style="font-size:.7rem;">読了${readPct}%</span>
                    <div class="progress" style="width:60px;height:8px;"><div class="progress-bar" style="width:${e.avg_score}%;background:${color};"></div></div>
                    <span class="fw-bold" style="color:${color};min-width:35px;text-align:right;">${e.avg_score}</span>
                </div>
            </div>`;
        }).join('');
    } else {
        engEl.innerHTML = '<div class="text-muted small">エンゲージメントデータなし（新規収集中）</div>';
    }

    // コピーテキスト
    const copyEl = document.getElementById('copied-content-detail');
    if (cq.copied_content?.length) {
        copyEl.innerHTML = cq.copied_content.map(c =>
            `<div class="small py-2 border-bottom">
                <div class="d-flex justify-content-between">
                    <span class="badge bg-secondary">${esc(c.path)}</span>
                    <span class="text-muted">${c.count}回コピー</span>
                </div>
                <div class="text-truncate mt-1" style="font-size:.75rem;color:#374151;" title="${esc(c.text)}">${esc(c.text)}</div>
            </div>`
        ).join('');
    } else {
        copyEl.innerHTML = '<div class="text-muted small">コピーデータなし（今後蓄積されます）</div>';
    }
}

// ==================== 技術タブ ====================
function renderTechnical(d) {
    // Web Vitals + パフォーマンス
    const perfEl = document.getElementById('analytics-perf');
    const lcp = d.web_vitals?.lcp;
    const cls = d.web_vitals?.cls;
    const perf = d.performance_avg;

    const metrics = [];
    if (lcp) metrics.push({ label: 'LCP', value: lcp.avg + 'ms', rating: lcp.avg <= 2500 ? 'good' : lcp.avg <= 4000 ? 'needs' : 'poor', samples: lcp.samples });
    if (cls) metrics.push({ label: 'CLS', value: cls.avg, rating: cls.avg <= 0.1 ? 'good' : cls.avg <= 0.25 ? 'needs' : 'poor', samples: cls.samples });
    if (perf?.samples > 0) {
        metrics.push({ label: 'TTFB', value: perf.ttfb + 'ms', rating: perf.ttfb <= 800 ? 'good' : perf.ttfb <= 1800 ? 'needs' : 'poor', samples: perf.samples });
        metrics.push({ label: 'Load Time', value: perf.load + 'ms', rating: perf.load <= 3000 ? 'good' : perf.load <= 6000 ? 'needs' : 'poor', samples: perf.samples });
    }

    if (metrics.length) {
        const ratingColors = { good: '#198754', needs: '#ffc107', poor: '#dc3545' };
        const ratingLabels = { good: '良好', needs: '要改善', poor: '不良' };
        perfEl.innerHTML = `<div class="row g-2">${metrics.map(m =>
            `<div class="col-6 col-md-3"><div class="border rounded p-2 text-center" style="border-color:${ratingColors[m.rating]}!important;">
                <div class="small text-muted">${m.label}</div>
                <div class="fw-bold" style="font-size:1.2rem;color:${ratingColors[m.rating]};">${m.value}</div>
                <div style="font-size:.65rem;color:${ratingColors[m.rating]};">${ratingLabels[m.rating]} (n=${m.samples})</div>
            </div></div>`
        ).join('')}</div>`;
    } else {
        perfEl.innerHTML = '<div class="text-muted small">パフォーマンスデータなし</div>';
    }

    // JSエラー
    const errEl = document.getElementById('analytics-errors');
    if (d.js_errors?.length) {
        errEl.innerHTML = d.js_errors.map(e =>
            `<div class="d-flex justify-content-between align-items-start small py-1 border-bottom">
                <div class="text-truncate" style="max-width:300px;"><code style="font-size:.75rem;">${esc(e.message)}</code><br><span class="text-muted" style="font-size:.65rem;">${esc(e.source||'')}</span></div>
                <span class="badge bg-danger">${e.count}</span>
            </div>`
        ).join('');
    } else {
        errEl.innerHTML = '<div class="text-muted small">JSエラーなし</div>';
    }

    // Rage Click
    const rageEl = document.getElementById('analytics-rage');
    if (d.rage_clicks?.length) {
        rageEl.innerHTML = d.rage_clicks.map(r =>
            `<div class="d-flex justify-content-between small py-1 border-bottom">
                <span><code>${esc(r.target)}</code></span>
                <span class="badge bg-warning text-dark">${r.count}</span>
            </div>`
        ).join('');
    } else {
        rageEl.innerHTML = '<div class="text-muted small">Rage Click なし</div>';
    }

    // エラー詳細ログ
    _allErrorDetails = d.error_details || [];
    renderErrorDetails();
}

function renderErrorDetails() {
    const showExternal = document.getElementById('show-external-errors')?.checked;
    const el = document.getElementById('analytics-error-details');
    let items = _allErrorDetails;
    if (!showExternal) {
        items = items.filter(e => {
            const msg = (e.message || '').toLowerCase();
            return !msg.includes('chrome-extension') && !msg.includes('moz-extension') && 
                   !msg.includes('safari-extension') && !msg.includes('gtag') && 
                   !msg.includes('fbq') && !msg.includes('Script error');
        });
    }
    if (items.length) {
        el.innerHTML = items.map(e => {
            const icon = e.type === 'js_error' ? 'JS' : 'RES';
            const time = e.time ? new Date(e.time + 'Z').toLocaleString('ja-JP') : '';
            return `<div class="small py-1 border-bottom" style="font-size:.75rem;">
                <div class="d-flex gap-2">${icon} <span class="text-muted">${time}</span> <span class="badge bg-secondary">${esc(e.path)}</span></div>
                <code>${esc(e.message)}</code>
            </div>`;
        }).join('');
    } else {
        el.innerHTML = '<div class="text-muted small">エラーログなし</div>';
    }
}

function toggleExternalErrors() {
    renderErrorDetails();
}

// ==================== ユーティリティ ====================
function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function fmt(n) { return (n || 0).toLocaleString(); }
function msToHuman(ms) {
    if (!ms || ms <= 0) return '0秒';
    const s = Math.round(ms / 1000);
    if (s < 60) return s + '秒';
    const m = Math.floor(s / 60);
    return m + '分' + (s % 60) + '秒';
}
