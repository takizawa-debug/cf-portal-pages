/* ============================
   Authentication & API Fetch
   ============================ */

async function checkAuth() {
    const tempSession = localStorage.getItem('temp_session_id');
    if (tempSession) {
        try {
            await fetch('/api/auth/set_cookie', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: tempSession })
            });
            localStorage.removeItem('temp_session_id');
        } catch(e) {
            console.error("Session token injection failed", e);
        }
    }

    try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
            window.location.href = '/login.html';
            return;
        }
        const data = await res.json();
        document.getElementById('displayUsername').innerText = data.user.display_name || data.user.username;
        document.getElementById('displayRole').innerText = ''; // Role logic retained natively, but display hidden per user request

        // Store global role reference for localized UI tasks
        window.userRole = data.user.role;
        window.userId = data.user.id;
        try {
            window.managedSites = JSON.parse(data.user.managed_sites || '["all"]');
        } catch {
            window.managedSites = ['all'];
        }

        // Reset all constrained navigations first
        const restrictedNavs = [
            'navContentMgt', 'navBusinessProfile', 'navUserMgt', 'navArchitecture', 'navCategoryMgt', 'navAppleMgt',
            'navKeywordMgt', 'navKnowledgeMgt', 'navInquiryMgt', 'navMediaMgt', 'navSeoMgt',
            'navCompanyAccount', 'navBroadcast'
        ];
        restrictedNavs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('d-none');
        });

        // Apply RBAC Rules based on admin_ui_rbac_plan.md
        if (data.user.role === 'admin') {
            ['navContentMgt', 'navBusinessProfile', 'navUserMgt', 'navArchitecture', 'navCategoryMgt', 'navAppleMgt', 
             'navKeywordMgt', 'navSeoMgt', 'navKnowledgeMgt', 'navInquiryMgt', 'navMediaMgt', 'navCompanyAccount', 'navBroadcast'].forEach(id => {
                 const el = document.getElementById(id);
                 if (el) el.classList.remove('d-none');
             });
             switchMainPanel('content-panel', document.getElementById('navContentMgt'));
        } else if (data.user.role === 'editor') {
            // Editor: No System Setup, No Account Manage
            const editorNavs = ['navContentMgt', 'navBusinessProfile', 'navArchitecture', 'navKeywordMgt', 'navKnowledgeMgt', 'navInquiryMgt', 'navBroadcast'];
            
            // Allow media management and SEO management strictly if they manage the Main site
            if (window.managedSites.includes('all') || window.managedSites.includes('main')) {
                editorNavs.push('navMediaMgt');
                editorNavs.push('navSeoMgt');
            }

            editorNavs.forEach(id => {
                 const el = document.getElementById(id);
                 if (el) el.classList.remove('d-none');
             });
             switchMainPanel('content-panel', document.getElementById('navContentMgt'));
        } else if (data.user.role === 'contributor') {
            // Contributor: General Article Management natively hidden.
            ['navCompanyAccount'].forEach(id => {
                 const el = document.getElementById(id);
                 if(el) el.classList.remove('d-none');
            });

            // Gating Logic
            try {
                const postsRes = await fetch('/api/posts');
                const postsData = await postsRes.json();
                const myBiz = postsData.find(i => i.type === 'business_profile' && i.author_id === window.userId);
                
                if (myBiz && myBiz.title && myBiz.title.trim() !== '') {
                    // Profile Onboarded
                    document.getElementById('navBusinessProfile').classList.remove('d-none');
                    document.getElementById('navMediaMgt').classList.remove('d-none');
                    switchMainPanel('business-panel', document.getElementById('navBusinessProfile'));
                } else {
                    // Incomplete Onboarding
                    switchMainPanel('company-account-panel', document.getElementById('navCompanyAccount'));
                    showStatus('先に「事業者(アカウント)管理」の必須情報を入力・保存してください。', 'error');
                }
            } catch (e) {
                console.error("Contributor Onboarding Check Error:", e);
                switchMainPanel('company-account-panel', document.getElementById('navCompanyAccount'));
            }

            // Contributor Specific Restrictions inside Content/Profile Editors
            ['lang-tab', 'ai-generation-box', 'business-tab-li'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (id === 'lang-tab' && el.parentElement) el.parentElement.style.display = 'none';
                    else el.style.display = 'none';
                }
            });

            document.getElementById('field_business_metadata') || document.body.insertAdjacentHTML('beforeend', '<input type="hidden" id="field_business_metadata">');
        }

        // Initial background fetch exclusively for users utilizing the full scope
        if (data.user.role !== 'contributor') {
            fetchMedia();
            fetchCategoriesMaster();
            fetchApplesMaster();
            fetchContent();
        } else {
            // Fetch media aggressively since contributors also have media storage
            fetchMedia();
        }
    } catch (e) { window.location.href = '/login.html'; }
}

async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.clear();
    localStorage.setItem('logout_trigger', Date.now());
    window.location.href = '/login.html';
}

// Multi-Tab Synchronization Observer
window.addEventListener('storage', (e) => {
    if (e.key === 'logout_trigger') {
        window.location.href = '/login.html';
    } else if (e.key === 'admin_id' && e.newValue && window.userId && e.newValue !== window.userId) {
        // Automatically sync background tabs if the user changes accounts in another window
        window.location.reload();
    }
});

async function apiFetch(url, options = {}, isFormData = false) {
    if (!isFormData && options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        options.body = JSON.stringify(options.body);
    }
    const res = await fetch(url, options);
    if (res.status === 401 || res.status === 403) {
        window.location.href = '/login.html';
        throw new Error("Unauthorized");
    }
    if (!res.ok) {
        let errText = res.statusText;
        try {
            const errObj = await res.json();
            errText = errObj.error || errText;
        } catch (e) { }
        throw new Error(errText);
    }
    return await res.json();
}
