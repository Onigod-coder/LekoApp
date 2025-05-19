// Глобальные переменные
let orders = [];
let clients = [];
let products = [];
let orderStatuses = [
    { id: 1, name: 'Новый' },
    { id: 2, name: 'В обработке' },
    { id: 3, name: 'Выполнен' },
    { id: 4, name: 'Отменен' }
];

let currentSort = {
    column: 'date',
    direction: 'desc'
};

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию перед загрузкой данных
    if (checkAuth()) {
        loadData();
        setupSorting();
        updateUIForAuth();
    }
});

// Обновление UI в зависимости от авторизации
function updateUIForAuth() {
    const isAdmin = localStorage.getItem('adminToken') !== null;
    const addOrderBtn = document.getElementById('addOrderBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('loginBtn');

    if (addOrderBtn) addOrderBtn.style.display = isAdmin ? 'block' : 'none';
    if (logoutBtn) logoutBtn.style.display = isAdmin ? 'block' : 'none';
    if (loginBtn) loginBtn.style.display = isAdmin ? 'none' : 'block';
}

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
            
            renderOrders();
        });
    });
}

// Функция для загрузки данных
async function loadData() {
    try {
        const [ordersResponse, clientsResponse, productsResponse] = await Promise.all([
            fetch('/api/orders'),
            fetch('/api/clients'),
            fetch('/api/products')
        ]);

        if (!ordersResponse.ok || !clientsResponse.ok || !productsResponse.ok) {
            throw new Error('Ошибка при загрузке данных');
        }

        orders = await ordersResponse.json();
        clients = await clientsResponse.json();
        products = await productsResponse.json();

        renderOrders();
        populateClientSelect();
        populateStatusSelect();
        populateProductSelects();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при загрузке данных');
    }
}

// Функция для отображения заказов
function renderOrders() {
    const tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Сортировка заказов
    const sortedOrders = [...orders].sort((a, b) => {
        let aValue, bValue;
        
        switch (currentSort.column) {
            case 'id':
                aValue = parseInt(a.order_id) || 0;
                bValue = parseInt(b.order_id) || 0;
                break;
            case 'client_name':
                aValue = (a.client_name || '').toLowerCase();
                bValue = (b.client_name || '').toLowerCase();
                break;
            case 'date':
                aValue = new Date(a.order_date).getTime();
                bValue = new Date(b.order_date).getTime();
                break;
            case 'status_name':
                aValue = (a.status_name || 'Новый').toLowerCase();
                bValue = (b.status_name || 'Новый').toLowerCase();
                break;
            case 'total_amount':
                aValue = parseFloat(a.total_amount) || 0;
                bValue = parseFloat(b.total_amount) || 0;
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

    sortedOrders.forEach(order => {
        const status = orderStatuses.find(s => s.id === order.order_status_id) || orderStatuses[0];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.order_id}</td>
            <td>${order.client_name || ''}</td>
            <td>${new Date(order.order_date).toLocaleDateString()}</td>
            <td>${status.name}</td>
            <td>${order.total_amount?.toFixed(2) || '0.00'} ₽</td>
            <td>
                ${isAdmin ? `
                    <button class="btn btn-sm btn-primary" onclick="editOrder(${order.order_id})">Редактировать</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.order_id})">Удалить</button>
                ` : ''}
                <button class="btn btn-sm btn-info" onclick="viewOrderDetails(${order.order_id})">Просмотр</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Функция для заполнения выпадающего списка клиентов
function populateClientSelect() {
    const select = document.getElementById('clientId');
    if (!select) return;

    select.innerHTML = '<option value="">Выберите клиента</option>';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.client_id;
        option.textContent = `${client.last_name} ${client.first_name} ${client.middle_name || ''}`;
        select.appendChild(option);
    });
}

// Функция для заполнения выпадающего списка статусов
function populateStatusSelect() {
    const select = document.getElementById('statusId');
    if (!select) return;

    select.innerHTML = '<option value="">Выберите статус</option>';
    orderStatuses.forEach(status => {
        const option = document.createElement('option');
        option.value = status.id;
        option.textContent = status.name;
        select.appendChild(option);
    });
}

// Функция для заполнения выпадающих списков товаров
function populateProductSelects() {
    const selects = document.querySelectorAll('.product-select');
    if (!selects.length) return;

    selects.forEach(select => {
        select.innerHTML = '<option value="">Выберите товар</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.product_id;
            option.textContent = `${product.product_name} (${product.price?.toFixed(2) || '0.00'} ₽)`;
            select.appendChild(option);
        });
    });
}

// Функция для сброса формы заказа
function resetOrderForm() {
    const orderId = document.getElementById('orderId');
    const clientId = document.getElementById('clientId');
    const statusId = document.getElementById('statusId');
    const itemsContainer = document.getElementById('orderItems');
    const clientSelectContainer = clientId.closest('.mb-3');
    
    if (orderId) orderId.value = '';
    if (statusId) statusId.value = '';
    if (itemsContainer) itemsContainer.innerHTML = '';
    
    // Восстанавливаем select для выбора клиента
    if (clientSelectContainer) {
        clientSelectContainer.innerHTML = `
            <label for="clientId" class="form-label">Клиент</label>
            <select class="form-select" id="clientId" required></select>
        `;
        populateClientSelect(); // Заполняем список клиентов
    }
}

// Функция для показа модального окна добавления заказа
function showAddOrderModal() {
    resetOrderForm();
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
}

// Функция для редактирования заказа
async function editOrder(id) {
    try {
        const response = await fetch(`/api/orders/${id}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке заказа');
        }
        const order = await response.json();
        
        const orderId = document.getElementById('orderId');
        const clientId = document.getElementById('clientId');
        const statusId = document.getElementById('statusId');
        const itemsContainer = document.getElementById('orderItems');
        const clientSelectContainer = clientId.closest('.mb-3');
        
        if (!orderId || !clientId || !statusId || !itemsContainer) {
            throw new Error('Не найдены необходимые элементы формы');
        }
        
        // Заменяем select на текст с ФИО клиента
        if (clientSelectContainer) {
            clientSelectContainer.innerHTML = `
                <label class="form-label">Клиент</label>
                <div class="form-control-plaintext">${order.client_name}</div>
                <input type="hidden" id="clientId" value="${order.client_id}">
            `;
        }
        
        // Заполняем данные заказа
        orderId.value = order.order_id;
        statusId.value = order.order_status_id;
        
        // Заполняем товары заказа
        itemsContainer.innerHTML = '';
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                addOrderItem(item);
            });
        } else {
            addOrderItem();
        }
        
        const modal = new bootstrap.Modal(document.getElementById('orderModal'));
        modal.show();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при загрузке заказа');
    }
}

// Функция для добавления строки товара
function addOrderItem(item = null) {
    const itemsContainer = document.getElementById('orderItems');
    if (!itemsContainer) return;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item mb-3';
    itemDiv.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <select class="form-select product-select" required>
                    <option value="">Выберите товар</option>
                </select>
            </div>
            <div class="col-md-5">
                <input type="number" class="form-control quantity-input" min="1" value="${item?.quantity || 1}" required>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-danger" onclick="this.closest('.order-item').remove()">×</button>
            </div>
        </div>
    `;
    itemsContainer.appendChild(itemDiv);
    
    // Заполняем выпадающий список товаров
    const select = itemDiv.querySelector('.product-select');
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.product_id;
        option.textContent = `${product.product_name} (${product.price?.toFixed(2) || '0.00'} ₽)`;
        if (item && item.product_id === product.product_id) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

// Функция для сохранения заказа
async function saveOrder() {
    const orderId = document.getElementById('orderId');
    const clientId = document.getElementById('clientId');
    const statusId = document.getElementById('statusId');
    
    if (!orderId || !clientId || !statusId) {
        alert('Не найдены необходимые элементы формы');
        return;
    }

    if (!statusId.value) {
        alert('Пожалуйста, выберите статус заказа');
        return;
    }

    // Получаем ID статуса
    const selectedStatusId = parseInt(statusId.value);
    if (isNaN(selectedStatusId)) {
        alert('Некорректный ID статуса');
        return;
    }
    console.log('Выбранный ID статуса:', selectedStatusId);

    // Проверяем значение ID клиента
    const clientIdValue = parseInt(clientId.value);
    if (isNaN(clientIdValue)) {
        alert('Некорректный ID клиента');
        return;
    }
    console.log('ID клиента:', clientIdValue, 'Тип:', typeof clientIdValue);

    // Собираем данные заказа
    const orderData = {
        ClientId: clientIdValue,
        Status: selectedStatusId,
        Items: Array.from(document.querySelectorAll('.order-item')).map(item => {
            const productId = parseInt(item.querySelector('.product-select').value);
            const quantity = parseInt(item.querySelector('.quantity-input').value);
            const product = products.find(p => p.product_id === productId);
            
            return {
                ProductId: productId,
                Quantity: quantity,
                Price: product?.price || 0
            };
        })
    };
    
    if (orderData.Items.length === 0) {
        alert('Пожалуйста, добавьте хотя бы один товар в заказ');
        return;
    }

    // Проверяем, что все товары выбраны
    if (orderData.Items.some(item => !item.ProductId)) {
        alert('Пожалуйста, выберите все товары');
        return;
    }

    // Логируем данные перед отправкой
    console.log('Отправляемые данные заказа:', JSON.stringify(orderData, null, 2));
    
    try {
        const token = localStorage.getItem('adminToken');
        const url = orderId.value ? `/api/orders/${orderId.value}` : '/api/orders';
        const method = orderId.value ? 'PUT' : 'POST';

        console.log('URL запроса:', url);
        console.log('Метод запроса:', method);

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            let errorMessage = 'Ошибка при сохранении заказа';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                console.error('Ошибка при разборе ответа:', e);
            }
            throw new Error(errorMessage);
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
        modal.hide();
        loadData();
    } catch (error) {
        console.error('Ошибка:', error);
        alert(error.message || 'Произошла ошибка при сохранении заказа');
    }
}

// Функция для удаления заказа
async function deleteOrder(id) {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/orders/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при удалении заказа');
        }
        
        loadData();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при удалении заказа');
    }
}

// Просмотр деталей заказа
async function viewOrderDetails(id) {
    try {
        const response = await fetch(`/api/orders/${id}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке заказа');
        }
        const order = await response.json();
        
        const detailOrderId = document.getElementById('detailOrderId');
        const detailClientName = document.getElementById('detailClientName');
        const detailOrderDate = document.getElementById('detailOrderDate');
        const detailOrderStatus = document.getElementById('detailOrderStatus');
        const detailTotalAmount = document.getElementById('detailTotalAmount');
        const detailOrderItems = document.getElementById('detailOrderItems');
        
        if (!detailOrderId || !detailClientName || !detailOrderDate || 
            !detailOrderStatus || !detailTotalAmount || !detailOrderItems) {
            throw new Error('Не найдены необходимые элементы формы');
        }
        
        detailOrderId.textContent = order.order_id;
        detailClientName.textContent = order.client_name || 'Не указан';
        detailOrderDate.textContent = new Date(order.order_date).toLocaleDateString();
        const status = orderStatuses.find(s => s.id === order.order_status_id) || orderStatuses[0];
        detailOrderStatus.textContent = status.name;
        detailTotalAmount.textContent = `${order.total_amount?.toFixed(2) || '0.00'} ₽`;
        
        detailOrderItems.innerHTML = '';
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const row = document.createElement('tr');
                const itemTotal = item.price * item.quantity;
                row.innerHTML = `
                    <td>${item.product_name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toFixed(2)} ₽</td>
                    <td>${itemTotal.toFixed(2)} ₽</td>
                `;
                detailOrderItems.appendChild(row);
            });
        }
        
        const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        modal.show();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при загрузке деталей заказа');
    }
} 