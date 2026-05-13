const API_URL = '/api/index.php';

// Глобальные переменные
let currentUser = null;

// Функция для API запросов
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_URL}/${endpoint}`, options);
    return await response.json();
}

// Проверка авторизации
function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const authLink = document.getElementById('auth-link');
    const profileLink = document.getElementById('profile-link');
    
    if (isLoggedIn === 'true') {
        if (authLink) authLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'inline';
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
    } else {
        if (authLink) authLink.style.display = 'inline';
        if (profileLink) profileLink.style.display = 'none';
    }
}

// Выход из системы
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    alert('Вы вышли из системы');
    window.location.href = 'index.html';
}