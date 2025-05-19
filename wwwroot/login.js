// Функция для входа в гостевом режиме
function enterGuestMode() {
    localStorage.setItem('isGuest', 'true');
    window.location.href = '/';
}

// Обработчик отправки формы входа
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('adminToken', data.token);
            localStorage.removeItem('isGuest');
            window.location.href = '/';
        } else {
            alert('Неверное имя пользователя или пароль');
        }
    } catch (error) {
        console.error('Ошибка при входе:', error);
        alert('Произошла ошибка при входе');
    }
}); 