// public/js/admin/seo.js

async function loadSEOSettings() {
    const pagePath = document.getElementById('seo_page_path').value;
    if (!pagePath) return;

    try {
        const response = await fetch(`/api/seo?path=${encodeURIComponent(pagePath)}`);
        if (!response.ok) throw new Error('Failed to fetch SEO settings');

        const data = await response.json();
        
        document.getElementById('seo_title').value = data?.title || '';
        document.getElementById('seo_description').value = data?.description || '';
        document.getElementById('seo_ogp_url').value = data?.og_image_url || '';
        document.getElementById('seo_favicon_url').value = data?.favicon_url || '';
        
        const preview = document.getElementById('seo_ogp_preview');
        if (data?.og_image_url) {
            preview.innerHTML = `<img src="${data.og_image_url}" alt="OGP Preview" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
            preview.innerHTML = `<i class="fa-solid fa-image text-muted fs-2"></i>`;
        }

        const favPreview = document.getElementById('seo_favicon_preview');
        if (data?.favicon_url) {
            favPreview.innerHTML = `<img src="${data.favicon_url}" alt="Favicon Preview" style="width:100%;height:100%;object-fit:cover;">`;
        } else {
            favPreview.innerHTML = `<i class="fa-solid fa-globe text-muted fs-4"></i>`;
        }
    } catch (err) {
        console.error(err);
        alert('SEO設定の読み込みに失敗しました。');
    }
}

async function saveSEOSettings() {
    const btn = document.getElementById('btnSaveSEO');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 保存中...';
    btn.disabled = true;

    const payload = {
        path: document.getElementById('seo_page_path').value,
        title: document.getElementById('seo_title').value,
        description: document.getElementById('seo_description').value,
        og_image_url: document.getElementById('seo_ogp_url').value,
        favicon_url: document.getElementById('seo_favicon_url').value
    };

    try {
        const response = await fetch('/api/seo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Failed to save SEO settings');
        alert('SEO設定を保存しました！直ちに本番環境へ反映されます。');
    } catch (err) {
        console.error(err);
        alert('SEO設定の保存に失敗しました。');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function uploadSEOImage(file) {
    if (!file) return;

    // Use the existing R2 upload endpoint
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'seo');

    try {
        const response = await fetch('/api/media', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        
        const imageUrl = data.url;
        document.getElementById('seo_ogp_url').value = imageUrl;
        
        const preview = document.getElementById('seo_ogp_preview');
        preview.innerHTML = `<img src="${imageUrl}" alt="OGP Preview" style="width:100%;height:100%;object-fit:cover;">`;

    } catch (err) {
        console.error(err);
        alert('画像のアップロードに失敗しました。');
    }
}

async function uploadSEOFavicon(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'seo/favicon');

    try {
        const response = await fetch('/api/media', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        
        const imageUrl = data.url;
        document.getElementById('seo_favicon_url').value = imageUrl;
        
        const preview = document.getElementById('seo_favicon_preview');
        preview.innerHTML = `<img src="${imageUrl}" alt="Favicon Preview" style="width:100%;height:100%;object-fit:cover;">`;

    } catch (err) {
        console.error(err);
        alert('ファビコンのアップロードに失敗しました。');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const seoBtn = document.getElementById('navSeoMgt');
    if (seoBtn) {
        seoBtn.addEventListener('click', () => {
            const selectEl = document.getElementById('seo_page_path');
            const managedSites = window.managedSites || ['all'];
            
            // Rebuild options based on scopes
            selectEl.innerHTML = '';
            
            if (managedSites.includes('all') || managedSites.includes('sourapple')) {
                const opt1 = document.createElement('option');
                opt1.value = '/sourapple';
                opt1.textContent = 'iizuna sour apple 特設サイト ( /sourapple/ )';
                selectEl.appendChild(opt1);
            }
            if (managedSites.includes('all') || managedSites.includes('main')) {
                const optMain = document.createElement('option');
                optMain.value = '/';
                optMain.textContent = 'りんごのまち・いいづな トップページ ( / )';
                selectEl.appendChild(optMain);
                
                const optAbout = document.createElement('option');
                optAbout.value = '/about';
                optAbout.textContent = 'りんごのまち・いいづな について ( /about )';
                selectEl.appendChild(optAbout);
            }
            
            if (selectEl.options.length > 0) {
                document.getElementById('seo_title').disabled = false;
                document.getElementById('seo_description').disabled = false;
                loadSEOSettings();
            } else {
                selectEl.innerHTML = '<option value="">アクセス可能なページがありません</option>';
                document.getElementById('seo_title').disabled = true;
                document.getElementById('seo_description').disabled = true;
            }
        });
    }
});
