// Функция для проверки авторизации
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const isGuest = localStorage.getItem('isGuest') === 'true';
    
    // Если мы на странице логина, не делаем редирект
    if (window.location.pathname === '/login.html' || window.location.pathname === '/') {
        return true;
    }
    
    // Если нет ни токена, ни гостевого режима - редирект на логин
    if (!token && !isGuest) {
        window.location.href = '/login.html';
        return false;
    }
    
    return true;
}

// Функция для проверки прав администратора
function isAdmin() {
    return localStorage.getItem('adminToken') !== null;
}

// Функция для проверки необходимости авторизации
function requireAuth(callback) {
    if (!isAdmin()) {
        window.location.href = '/login.html';
        return;
    }
    callback();
}

// Функция для выхода из системы
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isGuest');
    window.location.href = '/login.html';
}

// Обработчик загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('loginBtn');
    const addClientBtn = document.getElementById('addClientBtn');
    const addProductBtn = document.getElementById('addProductBtn');
    const addOrderBtn = document.getElementById('addOrderBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            window.location.href = '/login.html';
        });
    }
    
    // Показываем/скрываем кнопки в зависимости от авторизации
    const token = localStorage.getItem('adminToken');
    const isGuest = localStorage.getItem('isGuest') === 'true';
    
    // Обновляем отображение кнопок авторизации
    if (logoutBtn) {
        logoutBtn.style.display = (token || isGuest) ? 'block' : 'none';
    }
    if (loginBtn) {
        loginBtn.style.display = (!token && !isGuest) ? 'block' : 'none';
    }

    // Обновляем отображение кнопок добавления
    if (addClientBtn) {
        addClientBtn.style.display = token ? 'block' : 'none';
    }
    if (addProductBtn) {
        addProductBtn.style.display = token ? 'block' : 'none';
    }
    if (addOrderBtn) {
        addOrderBtn.style.display = token ? 'block' : 'none';
    }
    
    // Проверяем авторизацию только если мы не на странице логина
    if (window.location.pathname !== '/login.html') {
        checkAuth();
    }
}); 