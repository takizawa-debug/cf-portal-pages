/* ============================
   Authentication & API Fetch
   ============================ */

async function checkAuth() {
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

        // Reset all constrained navigations first
        const restrictedNavs = [
            'navContentMgt', 'navBusinessProfile', 'navUserMgt', 'navArchitecture', 'navCategoryMgt', 'navAppleMgt',
            'navKeywordMgt', 'navKnowledgeMgt', 'navInquiryMgt', 'navMediaMgt',
            'navCompanyAccount' // New menu for business account setting
        ];
        restrictedNavs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('d-none');
        });

        // Apply RBAC Rules based on admin_ui_rbac_plan.md
        if (data.user.role === 'admin') {
            ['navContentMgt', 'navBusinessProfile', 'navUserMgt', 'navArchitecture', 'navCategoryMgt', 'navAppleMgt', 
             'navKeywordMgt', 'navKnowledgeMgt', 'navInquiryMgt', 'navMediaMgt', 'navCompanyAccount'].forEach(id => {
                 const el = document.getElementById(id);
                 if (el) el.classList.remove('d-none');
             });
             switchMainPanel('content-panel', document.getElementById('navContentMgt'));
        } else if (data.user.role === 'editor') {
            // Editor: No System Setup, No Account Manage
            ['navContentMgt', 'navBusinessProfile', 'navArchitecture', 'navKeywordMgt', 'navKnowledgeMgt', 'navInquiryMgt', 'navMediaMgt'].forEach(id => {
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
    window.location.href = '/login.html';
}

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
