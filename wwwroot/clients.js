// Глобальные переменные
let clients = [];
let currentSort = {
    column: 'lastName',
    direction: 'asc'
};

// Загрузка клиентов при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию перед загрузкой данных
    if (checkAuth()) {
        loadData();
        setupSorting();
    }
});

// Настройка сортировки
function setupSorting() {
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', function() {
            const column = this.dataset.sort;
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
            }
            
            // Обновляем визуальные индикаторы сортировки
            document.querySelectorAll('.sortable').forEach(h => {
                h.removeAttribute('data-direction');
            });
            this.setAttribute('data-direction', currentSort.direction);
            
            renderClients();
        });
    });
}

// Функция для загрузки данных
async function loadData() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/clients', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Ошибка при загрузке данных');
        }
        clients = await response.json();
        renderClients();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при загрузке данных');
    }
}

// Функция для отображения клиентов
function renderClients() {
    const tbody = document.getElementById('clientsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Сортировка клиентов
    const sortedClients = [...clients].sort((a, b) => {
        let aValue, bValue;
        
        switch (currentSort.column) {
            case 'id':
                aValue = parseInt(a.client_id) || 0;
                bValue = parseInt(b.client_id) || 0;
                break;
            case 'lastName':
                aValue = (a.last_name || '').toLowerCase();
                bValue = (b.last_name || '').toLowerCase();
                break;
            case 'firstName':
                aValue = (a.first_name || '').toLowerCase();
                bValue = (b.first_name || '').toLowerCase();
                break;
            case 'middleName':
                aValue = (a.middle_name || '').toLowerCase();
                bValue = (b.middle_name || '').toLowerCase();
                break;
            case 'company':
                aValue = (a.company_name || '').toLowerCase();
                bValue = (b.company_name || '').toLowerCase();
                break;
            case 'email':
                aValue = (a.email || '').toLowerCase();
                bValue = (b.email || '').toLowerCase();
                break;
            case 'phone':
                aValue = (a.phone || '').toLowerCase();
                bValue = (b.phone || '').toLowerCase();
                break;
            case 'address':
                aValue = (a.address || '').toLowerCase();
                bValue = (b.address || '').toLowerCase();
                break;
            default:
                aValue = a[currentSort.column] || '';
                bValue = b[currentSort.column] || '';
        }
        
        if (currentSort.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const isAdmin = localStorage.getItem('adminToken') !== null;

    sortedClients.forEach(client => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${client.client_id}</td>
            <td>${client.last_name}</td>
            <td>${client.first_name}</td>
            <td>${client.middle_name || ''}</td>
            <td>${client.company_name || ''}</td>
            <td>${client.email || ''}</td>
            <td>${client.phone || ''}</td>
            <td>${client.address || ''}</td>
            <td>
                ${isAdmin ? `
                    <button class="btn btn-sm btn-primary" onclick="editClient(${client.client_id})">Редактировать</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteClient(${client.client_id})">Удалить</button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Функция для показа модального окна добавления клиента
function showAddClientModal() {
    document.getElementById('clientId').value = '';
    document.getElementById('clientForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('clientModal'));
    modal.show();
}

// Функция для редактирования клиента
async function editClient(id) {
    try {
        const response = await fetch(`/api/clients/${id}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке клиента');
        }
        const client = await response.json();
        
        document.getElementById('clientId').value = client.client_id;
        document.getElementById('lastName').value = client.last_name;
        document.getElementById('firstName').value = client.first_name;
        document.getElementById('middleName').value = client.middle_name || '';
        document.getElementById('companyName').value = client.company_name || '';
        document.getElementById('email').value = client.email;
        document.getElementById('phone').value = client.phone;
        document.getElementById('address').value = client.address || '';
        
        const modal = new bootstrap.Modal(document.getElementById('clientModal'));
        modal.show();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при загрузке клиента');
    }
}

// Функция для сохранения клиента
async function saveClient() {
    const clientId = document.getElementById('clientId').value;
    const client = {
        lastName: document.getElementById('lastName').value,
        firstName: document.getElementById('firstName').value,
        middleName: document.getElementById('middleName').value,
        companyName: document.getElementById('companyName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
    };
    
    if (!client.lastName || !client.firstName || !client.email || !client.phone) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/clients/${clientId || ''}`, {
            method: clientId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(client)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при сохранении клиента');
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('clientModal'));
        modal.hide();
        loadData();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при сохранении клиента');
    }
}

// Функция для удаления клиента
async function deleteClient(id) {
    if (!confirm('Вы уверены, что хотите удалить этого клиента?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/clients/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при удалении клиента');
        }
        
        loadData();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при удалении клиента');
    }
} 