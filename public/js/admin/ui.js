/* ============================
   UI Utilities & Panel Management
   ============================ */

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function setLoading(elementId, colspan = 5) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const content = `<div class="d-flex justify-content-center py-5"><div class="spinner-border text-brand" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
    if (el.tagName === 'TBODY') {
        el.innerHTML = `<tr><td colspan="${colspan}" class="text-center py-5">${content}</td></tr>`;
    } else {
        el.innerHTML = content;
    }
}

function showStatus(msg, type = 'success') {
    const st = document.getElementById('status');
    st.innerText = msg;
    st.style.color = type === 'success' ? '#10b981' : '#ef4444';
    st.classList.add('show');
    setTimeout(() => st.classList.remove('show'), 3000);
}

function switchMainPanel(panelId, btnEl) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');

    document.querySelectorAll('.nav-item-custom').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');

    if (panelId === 'user-panel') fetchUsers();
    else if (panelId === 'architecture-panel') {
        const archPanel = document.getElementById('architecture-panel');
        if (!archPanel.dataset.mermaidRendered && typeof mermaid !== 'undefined') {
            mermaid.init(undefined, archPanel.querySelectorAll('.mermaid'));
            archPanel.dataset.mermaidRendered = 'true';
        }
    }
    else if (panelId === 'business-panel') {
        loadBusinessProfile();
    }
    else if (panelId === 'company-account-panel') {
        loadBusinessProfile();
    }
    else if (panelId === 'keyword-panel') fetchKeywords();
    else if (panelId === 'knowledge-panel') fetchKnowledge();
    else if (panelId === 'category-panel') fetchCategoriesMaster();
    else if (panelId === 'apple-panel') fetchApplesMaster();
    else if (panelId === 'inquiry-panel') fetchInquiries();
    else if (panelId === 'media-panel') fetchMedia();
    else fetchContent();
}

async function fetchAddressFromZip(zipInputId, addressInputId) {
    const zipInput = document.getElementById(zipInputId);
    const addressInput = document.getElementById(addressInputId);
    if (!zipInput || !addressInput) return;

    let zip = zipInput.value.replace(/[^0-9]/g, '');
    if (zip.length === 7) {
        try {
            const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zip}`);
            const data = await res.json();
            if (data.status === 200 && data.results && data.results.length > 0) {
                const addr = data.results[0];
                const fullAddress = (addr.address1 || '') + (addr.address2 || '') + (addr.address3 || '');
                addressInput.value = fullAddress;
                addressInput.dispatchEvent(new Event('input'));
            }
        } catch (e) {
            console.error('Zip code fetch error', e);
        }
    }
}

// Initialize application
function init() {
    checkAuth();
}

// Run on load
init();
