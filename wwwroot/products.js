// Глобальные переменные
let products = [];
let categories = [];
let currentSort = {
    column: 'name',
    direction: 'asc'
};

// Загрузка данных при загрузке страницы
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
            
            renderProducts();
        });
    });
}

// Функция для загрузки данных
async function loadData() {
    try {
        const [productsResponse, categoriesResponse] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/categories')
        ]);

        if (!productsResponse.ok || !categoriesResponse.ok) {
            throw new Error('Ошибка при загрузке данных');
        }

        products = await productsResponse.json();
        categories = await categoriesResponse.json();

        renderProducts();
        populateCategorySelect();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при загрузке данных');
    }
}

// Функция для отображения товаров
function renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Сортировка товаров
    const sortedProducts = [...products].sort((a, b) => {
        let aValue, bValue;
        
        switch (currentSort.column) {
            case 'id':
                aValue = parseInt(a.product_id) || 0;
                bValue = parseInt(b.product_id) || 0;
                break;
            case 'name':
                aValue = (a.product_name || '').toLowerCase();
                bValue = (b.product_name || '').toLowerCase();
                break;
            case 'category':
                aValue = (a.category_name || '').toLowerCase();
                bValue = (b.category_name || '').toLowerCase();
                break;
            case 'price':
                aValue = parseFloat(a.price) || 0;
                bValue = parseFloat(b.price) || 0;
                break;
            case 'quantity':
                aValue = parseInt(a.quantity_in_stock) || 0;
                bValue = parseInt(b.quantity_in_stock) || 0;
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

    sortedProducts.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.product_id}</td>
            <td>${product.product_name}</td>
            <td>${product.category_name || ''}</td>
            <td>${product.price?.toFixed(2) || '0.00'} ₽</td>
            <td>${product.quantity_in_stock || 0}</td>
            <td>
                ${isAdmin ? `
                    <button class="btn btn-sm btn-primary" onclick="editProduct(${product.product_id})">Редактировать</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.product_id})">Удалить</button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Функция для заполнения выпадающего списка категорий
function populateCategorySelect() {
    const select = document.getElementById('categoryId');
    if (!select) return;

    select.innerHTML = '<option value="">Выберите категорию</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = category.category_name;
        select.appendChild(option);
    });
}

// Функция для показа модального окна добавления товара
function showAddProductModal() {
    document.getElementById('productId').value = '';
    document.getElementById('productForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

// Функция для редактирования товара
async function editProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке товара');
        }
        const product = await response.json();
        
        document.getElementById('productId').value = product.product_id;
        document.getElementById('productName').value = product.product_name;
        document.getElementById('categoryId').value = product.category_id || '';
        document.getElementById('price').value = product.price;
        document.getElementById('quantity').value = product.quantity_in_stock;
        
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при загрузке товара');
    }
}

// Функция для сохранения товара
async function saveProduct() {
    const productId = document.getElementById('productId').value;
    const product = {
        productName: document.getElementById('productName').value,
        categoryId: document.getElementById('categoryId').value,
        price: parseFloat(document.getElementById('price').value),
        quantityInStock: parseInt(document.getElementById('quantity').value)
    };
    
    if (!product.productName || !product.categoryId || isNaN(product.price) || isNaN(product.quantityInStock)) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
    }
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/products/${productId || ''}`, {
            method: productId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(product)
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при сохранении товара');
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        modal.hide();
        loadData();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при сохранении товара');
    }
}

// Функция для удаления товара
async function deleteProduct(id) {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка при удалении товара');
        }
        
        loadData();
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при удалении товара');
    }
} 