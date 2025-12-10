const BASE_URL = 'http://localhost:8081/api';
const API_URL = `${BASE_URL}/auth`;

function switchTab(tab) {
    // UI Updates
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    // Find the clicked tab element carefully
    const activeTab = Array.from(document.querySelectorAll('.tab')).find(el => el.textContent.trim() === (tab === 'login' ? '로그인' : '회원가입'));
    if (activeTab) activeTab.classList.add('active');

    // Form Visibility
    if (tab === 'login') {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    } else {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
    }

    // Clear Messages and Inputs
    clearForms();
}

function clearForms() {
    document.getElementById('message').textContent = '';
    document.getElementById('message').className = '';

    // Clear all inputs
    document.querySelectorAll('input').forEach(input => input.value = '');
}

async function handleRequest(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(result.message || '오류가 발생했습니다.');
        }
        return result;
    } catch (error) {
        showMessage(error.message, true);
        throw error;
    }
}

function showMessage(msg, isError = false) {
    const el = document.getElementById('message');
    el.textContent = msg;
    el.className = isError ? 'error' : 'success';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in (simple check)
    const token = localStorage.getItem('accessToken');
    if (token) {
        showDashboard();
    }

    // Login Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                username: document.getElementById('loginUsername').value,
                password: document.getElementById('loginPassword').value
            };

            try {
                const res = await handleRequest('login', data);
                // Store tokens
                localStorage.setItem('accessToken', res.accessToken);
                if (res.refreshToken) {
                    localStorage.setItem('refreshToken', res.refreshToken);
                }
                showMessage('로그인 성공!');

                // Transition to Dashboard
                setTimeout(() => {
                    showDashboard();
                }, 500);
            } catch (e) { }
        });
    }

    // Register Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                username: document.getElementById('regUsername').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPassword').value
            };

            try {
                // Register request
                await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }).then(async res => {
                    const result = await res.json().catch(() => ({}));
                    if (res.ok) {
                        showMessage('회원가입 성공! 로그인해주세요.');
                        setTimeout(() => switchTab('login'), 1500);
                    } else {
                        throw new Error(result.message || '회원가입 실패 (이미 존재하는 아이디일 수 있습니다)');
                    }
                });
            } catch (e) {
                showMessage(e.message, true);
            }
        });
    }
});

// ==========================================
// Token Refresh Logic
// ==========================================

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
        console.log("Attempting to refresh token...");
        const response = await fetch(`${API_URL}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Token refreshed successfully!");
            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            return data.accessToken;
        } else {
            console.warn("Refresh failed, logging out.");
            logout();
            return null;
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        logout();
        return null;
    }
}

async function fetchWithAuth(url, options = {}) {
    let token = localStorage.getItem('accessToken');
    if (!token) {
        logout();
        throw new Error("No access token");
    }

    // Ensure headers exist
    if (!options.headers) options.headers = {};
    if (!(options.headers instanceof Headers)) {
        // Simple object headers
        options.headers['Authorization'] = 'Bearer ' + token;
    } else {
        // Headers object
        options.headers.set('Authorization', 'Bearer ' + token);
    }

    let response = await fetch(url, options);

    // If 401, try to refresh
    if (response.status === 401) {
        console.log('Access Token expired. Trying to refresh...');
        const newToken = await refreshAccessToken();

        if (newToken) {
            // Retry with new token
            if (!(options.headers instanceof Headers)) {
                options.headers['Authorization'] = 'Bearer ' + newToken;
            } else {
                options.headers.set('Authorization', 'Bearer ' + newToken);
            }
            response = await fetch(url, options);
        }
    }

    return response;
}
