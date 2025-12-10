function showDashboard() {
    // Hide Auth Container, Show Dashboard
    document.querySelector('.auth-container').classList.add('hidden');
    document.querySelector('.dashboard-container').classList.remove('hidden');
    document.querySelector('.dashboard-container').style.display = 'block';

    fetchUserProfile();
}

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Reset Views
    document.querySelector('.dashboard-container').classList.add('hidden');
    document.querySelector('.dashboard-container').style.display = 'none';
    document.querySelector('.auth-container').classList.remove('hidden');

    // Reset Forms
    clearForms();
    switchTab('login');
}

async function fetchUserProfile() {
    const token = localStorage.getItem('accessToken');
    if (!token) return logout();

    try {
        const response = await fetchWithAuth(`${API_URL}/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response && response.ok) {
            const user = await response.json();
            document.getElementById('p-username').textContent = user.username;
            document.getElementById('p-role').textContent = user.role || 'USER';
            document.getElementById('p-id').textContent = user.id || '-';

            // Show Admin Menu if Admin
            if (user.role === 'ADMIN') {
                document.getElementById('nav-admin').style.display = 'block';
                fetchUserList();
            } else {
                document.getElementById('nav-admin').style.display = 'none';
            }

            // Show Profile Section by default
            showSection('profile');

        } else {
            console.error('Failed to fetch profile (Handled)');
        }
    } catch (error) {
        console.error('Error fetching profile:', error);
        logout();
    }
}

function showSection(sectionId) {
    // Hide all sections
    document.getElementById('section-profile').style.display = 'none';
    document.getElementById('section-admin').style.display = 'none';

    // Remove active class from all nav items
    document.getElementById('nav-profile').classList.remove('active');
    document.getElementById('nav-admin').classList.remove('active');

    // Show selected section
    const section = document.getElementById(`section-${sectionId}`);
    if (section) section.style.display = 'block';

    const nav = document.getElementById(`nav-${sectionId}`);
    if (nav) nav.classList.add('active');
}

async function fetchUserList() {
    try {
        const response = await fetchWithAuth(`${BASE_URL}/admin/users`);
        if (response.ok) {
            const users = await response.json();

            // Update Stats
            document.getElementById('stat-total-users').textContent = users.length;
            document.getElementById('stat-admin-users').textContent = users.filter(u => u.role === 'ADMIN').length;

            const tbody = document.getElementById('user-table-body');
            tbody.innerHTML = '';
            users.forEach(user => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td><span class="badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'}">${user.role}</span></td>
                    <td>
                        ${user.role !== 'ADMIN' ?
                        `<button class="btn btn-sm btn-outline-danger" onclick="kickUser('${user.username}')">Kick</button>` :
                        '-'}
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error fetching user list:', error);
    }
}

async function kickUser(username) {
    if (!confirm(`정말로 사용자 '${username}'님을 강제 로그아웃 시키겠습니까?\n(다음 토큰 갱신 시점에 로그아웃 됩니다)`)) return;

    try {
        const response = await fetchWithAuth(`${BASE_URL}/admin/users/${username}/kick`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert(`사용자 '${username}'님의 연결이 끊어졌습니다.\n(재로그인 차단됨)`);
        } else {
            alert('강제 로그아웃 처리에 실패했습니다.');
        }
    } catch (error) {
        console.error('Error kicking user:', error);
        alert('오류가 발생했습니다.');
    }
}

function togglePublicDocs(show) {
    const authContainer = document.querySelector('.auth-container');
    const docsContainer = document.querySelector('.public-docs-container');

    if (show) {
        authContainer.classList.add('hidden'); // Uses existing hidden class or style
        authContainer.style.display = 'none'; // Force hide just in case
        docsContainer.style.display = 'block';
    } else {
        docsContainer.style.display = 'none';
        authContainer.classList.remove('hidden');
        authContainer.style.display = 'block'; // Restore
    }
}

