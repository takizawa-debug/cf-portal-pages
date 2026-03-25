/* ============================
   User Management
   ============================ */

let userModal = null;
let isUserEditing = false;

async function fetchUsers() {
    document.getElementById('userTableBody').innerHTML = '<tr><td colspan="4" class="text-center text-muted">Loading...</td></tr>';
    try {
        const res = await fetch('/api/users');
        if (!res.ok) {
            document.getElementById('userTableBody').innerHTML = '<tr><td colspan="4" class="text-center text-danger">権限がありません</td></tr>';
            return;
        }
        const data = await res.json();
        renderUserTable(data.items);
    } catch (e) { showStatus('エラー', 'error'); }
}

function renderUserTable(items) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = '';
    items.forEach(u => {
        const date = u.created_at ? new Date(u.created_at).toLocaleDateString() : '-';
        const tr = document.createElement('tr');
        const badgeColor = u.role === 'admin' ? 'bg-danger' : (u.role === 'editor' ? 'bg-primary' : 'bg-secondary');
        const displayNameHtml = u.display_name ? `<br><small class="text-muted fw-normal">${u.display_name}</small>` : '';
        let scopeStr = '';
        try {
            const arr = JSON.parse(u.managed_sites || '["all"]');
            scopeStr = arr.includes('all') ? 'All' : arr.join(', ');
        } catch(e) { scopeStr = 'All'; }
        
        tr.innerHTML = `
            <td class="fw-bold">${u.username}${displayNameHtml}</td>
            <td><span class="badge ${badgeColor}">${u.role.toUpperCase()}</span> <small class="text-muted ms-1">[${scopeStr}]</small></td>
            <td class="text-muted small">${date}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-secondary fw-bold" onclick='openUserEditor(${JSON.stringify(u).replace(/'/g, "&apos;")})'>
                    <i class="fa-solid fa-pen"></i> 編集
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openUserEditor(user) {
    if (!userModal) {
        userModal = new bootstrap.Modal(document.getElementById('userModal'));
    }
    isUserEditing = !!user;
    document.getElementById('userModalTitle').innerText = user ? 'ユーザー編集' : '新規ユーザー';
    document.getElementById('btnDeleteUser').style.display = user ? 'inline-block' : 'none';
    document.getElementById('userForm').reset();

    if (user) {
        document.getElementById('usr_id').value = user.id;
        document.getElementById('usr_name').value = user.username;
        document.getElementById('usr_name').readOnly = true;
        document.getElementById('usr_role').value = user.role;
        document.getElementById('usr_pass').required = false;

        try {
            const arr = JSON.parse(user.managed_sites || '["all"]');
            document.getElementById('site_all').checked = arr.includes('all');
            document.getElementById('site_main').checked = arr.includes('main');
            document.getElementById('site_sourapple').checked = arr.includes('sourapple');
        } catch(e) {
            document.getElementById('site_all').checked = true;
        }
    } else {
        document.getElementById('usr_id').value = '';
        document.getElementById('usr_name').readOnly = false;
        document.getElementById('usr_name').value = '';
        document.getElementById('usr_pass').required = true;
        document.getElementById('usr_role').value = 'contributor';
        document.getElementById('site_all').checked = true;
        document.getElementById('site_main').checked = false;
        document.getElementById('site_sourapple').checked = false;
    }
    userModal.show();
}

async function saveUser() {
    const id = document.getElementById('usr_id').value;
    const username = document.getElementById('usr_name').value.trim();
    const password = document.getElementById('usr_pass').value;
    const role = document.getElementById('usr_role').value;

    if (!isUserEditing && (!username || !password)) return showStatus('必須項目を入力してください', 'error');

    let managed_sites = [];
    if (document.getElementById('site_all').checked) {
        managed_sites.push('all');
    } else {
        if (document.getElementById('site_main').checked) managed_sites.push('main');
        if (document.getElementById('site_sourapple').checked) managed_sites.push('sourapple');
    }
    if (managed_sites.length === 0) managed_sites = ['all'];

    const payload = { role, managed_sites };
    if (!isUserEditing) { payload.username = username; payload.password = password; }
    else if (password) { payload.password = password; }

    const method = isUserEditing ? 'PUT' : 'POST';
    const url = isUserEditing ? '/api/users/' + id : '/api/users';

    try {
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) {
            showStatus('保存しました');
            userModal.hide();
            fetchUsers();
        } else {
            const e = await res.json();
            showStatus(e.error || '保存エラー', 'error');
        }
    } catch (e) { showStatus('通信エラー', 'error'); }
}

async function deleteUser() {
    if (!confirm('本当に削除しますか？')) return;
    const id = document.getElementById('usr_id').value;
    try {
        const res = await fetch('/api/users/' + id, { method: 'DELETE' });
        if (res.ok) {
            showStatus('削除しました');
            userModal.hide();
            fetchUsers();
        } else {
            const e = await res.json();
            showStatus(e.error || 'エラー', 'error');
        }
    } catch (e) { showStatus('通信エラー', 'error'); }
}
