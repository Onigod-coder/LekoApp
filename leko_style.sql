-- Создание базы данных
CREATE DATABASE LekoStyle;
GO

USE LekoStyle;
GO

-- Таблица Categories
CREATE TABLE Categories (
  category_id INT PRIMARY KEY IDENTITY(1,1),
  category_name VARCHAR(100) NULL
);
GO

-- Таблица OrderStatus
CREATE TABLE OrderStatus (
  order_status_id INT PRIMARY KEY,
  status_name VARCHAR(50) NOT NULL
);
GO

-- Таблица Clients
CREATE TABLE Clients (
  client_id INT PRIMARY KEY IDENTITY(1,1),
  first_name VARCHAR(50) NULL,
  last_name VARCHAR(50) NULL,
  company_name VARCHAR(100) NULL,
  email VARCHAR(100) NULL,
  phone VARCHAR(20) NULL,
  address VARCHAR(255) NULL,
  created_at DATETIME DEFAULT GETDATE(),
  middle_name VARCHAR(50) NULL
);
GO

-- Таблица Products
CREATE TABLE Products (
  product_id INT PRIMARY KEY IDENTITY(1,1),
  product_name VARCHAR(100) NULL,
  category_id INT NULL,
  price DECIMAL(10,2) NULL,
  quantity_in_stock INT NULL,
  created_at DATETIME DEFAULT GETDATE()
);
GO

-- Добавляем ограничение внешнего ключа для Products
ALTER TABLE Products
ADD CONSTRAINT FK_Products_Categories 
FOREIGN KEY (category_id) REFERENCES Categories(category_id);
GO

-- Таблица Orders
CREATE TABLE Orders (
  order_id INT PRIMARY KEY IDENTITY(1,1),
  client_id INT NULL,
  order_date DATETIME DEFAULT GETDATE(),
  order_status_id INT NULL
);
GO

-- Добавляем ограничения внешних ключей для Orders
ALTER TABLE Orders
ADD CONSTRAINT FK_Orders_Clients 
FOREIGN KEY (client_id) REFERENCES Clients(client_id);

ALTER TABLE Orders
ADD CONSTRAINT FK_Orders_OrderStatus 
FOREIGN KEY (order_status_id) REFERENCES OrderStatus(order_status_id);
GO

-- Таблица OrderItems
CREATE TABLE OrderItems (
  order_item_id INT PRIMARY KEY IDENTITY(1,1),
  order_id INT NULL,
  product_id INT NULL,
  quantity INT NULL,
  price DECIMAL(10,2) NULL
);
GO

-- Добавляем ограничения внешних ключей для OrderItems
ALTER TABLE OrderItems
ADD CONSTRAINT FK_OrderItems_Orders 
FOREIGN KEY (order_id) REFERENCES Orders(order_id);

ALTER TABLE OrderItems
ADD CONSTRAINT FK_OrderItems_Products 
FOREIGN KEY (product_id) REFERENCES Products(product_id);
GO

-- Вставка данных в Categories
INSERT INTO Categories (category_name) VALUES 
('Эфирные масла'),
('Сырье для косметики'),
('Фармацевтические ингредиенты'),
('Химические вещества'),
('Пищевая добавка'),
('Ароматизаторы'),
('Красители'),
('Консерванты'),
('Упаковка'),
('Эко-продукты'),
('Натуральные экстракты'),
('Смеси эфирных масел'),
('Базовые масла'),
('Соль для ванн'),
('Чаи и настои'),
('Косметические масла'),
('Гидролаты'),
('Кремы и лосьоны'),
('Смеси для массажа'),
('Ароматерапия');
GO

-- Вставка данных в OrderStatus
INSERT INTO OrderStatus (order_status_id, status_name) VALUES 
(1, 'Новый'),
(2, 'В обработке'),
(3, 'Выполнен'),
(4, 'Отменен');
GO

-- Вставка данных в Clients
INSERT INTO Clients (first_name, last_name, company_name, email, phone, address, middle_name) VALUES 
('Иван', 'Иванов', 'Ивановская Фирма', 'ivanov@example.com', '+79001234567', 'Москва, ул. Ленина, д. 1', 'Иванович'),
('Мария', 'Петрова', 'Петрова и К', 'petrova@example.com', '+79007654321', 'Санкт-Петербург, ул. Пушкина, д. 2', 'Игоревна'),
('Александр', 'Сидоров', 'Сидоров АО', 'sidorov@example.com', '+79009876543', 'Екатеринбург, ул. Чехова, д. 3', 'Сидорович'),
('Ольга', 'Кузнецова', 'Кузнецова Групп', 'kuznetsova@example.com', '+79003456789', 'Новосибирск, ул. Горького, д. 4', 'Алексеевна'),
('Дмитрий', 'Смирнов', 'Смирнов ЛТД', 'smirnov@example.com', '+79004567890', 'Казань, ул. Лермонтова, д. 5', 'Дмитриевич'),
('Анна', 'Васильева', 'Васильева Партнеры', 'vasilieva@example.com', '+79005678901', 'Нижний Новгород, ул. Толстого, д. 6', 'Сергеевна'),
('Сергей', 'Михайлов', 'Михайлов и Ко', 'mikhailov@example.com', '+79006789012', 'Ростов-на-Дону, ул. Шолохова, д. 7', 'Николаевич'),
('Елена', 'Федорова', 'Федорова Сервис', 'fedorova@example.com', '+79007890123', 'Челябинск, ул. Куйбышева, д. 8', 'Викторовна'),
('Андрей', 'Соловьев', 'Соловьев Групп', 'soloviev@example.com', '+79008901234', 'Уфа, ул. Свердлова, д. 9', 'Романович'),
('Марина', 'Григорьева', 'Григорьева Бизнес', 'grigorieva@example.com', '+79009123456', 'Волгоград, ул. Невского, д. 10', 'Андреевна'),
('Николай', 'Зайцев', 'Зайцев и Партнеры', 'zaicev@example.com', '+79001234567', 'Воронеж, ул. Ленина, д. 11', 'Федорович'),
('Татьяна', 'Коваленко', 'Коваленко АО', 'kovalenko@example.com', '+79007654321', 'Красноярск, ул. Мира, д. 12', 'Григорьевна'),
('Виктор', 'Сергеев', 'Сергеев ЛТД', 'sergeev@example.com', '+79009876543', 'Тюмень, ул. Пушкина, д. 13', 'Станиславович'),
('Екатерина', 'Соловьева', 'Соловьева Групп', 'solovyeva@example.com', '+79003456789', 'Барнаул, ул. Чехова, д. 14', 'Владимировна'),
('Роман', 'Алексеев', 'Алексеев и Ко', 'alekseev@example.com', '+79004567890', 'Ижевск, ул. Горького, д. 15', 'Евгеньевич'),
('Светлана', 'Егорова', 'Егорова Партнеры', 'egorova@example.com', '+79005678901', 'Калуга, ул. Лермонтова, д. 16', 'Анатольевна'),
('Анатолий', 'Тихонов', 'Тихонов Групп', 'tikhonov@example.com', '+79006789012', 'Ставрополь, ул. Шолохова, д. 17', 'Валерьевич'),
('Надежда', 'Павлова', 'Павлова Сервис', 'pavlova@example.com', '+79007890123', 'Сочи, ул. Толстого, д. 18', 'Константиновна'),
('Григорий', 'Фролов', 'Фролов Бизнес', 'frolov@example.com', '+79008901234', 'Ярославль, ул. Свердлова, д. 19', 'Игоревич'),
('Людмила', 'Морозова', 'Морозова и Партнеры', 'morozova@example.com', '+79009123456', 'Симферополь, ул. Невского, д. 20', 'Витальевна'),
('Иванов', 'Иван', 'Иван Групп', 'Vanya@mail.ru', '89009562717', 'Поселок Гаврилово, д. 1', NULL),
('Игорь', 'Куклинов', 'КуклиКО', 'onigod7533@gmail.com', '89111001407', 'Брянцева,14', 'Антонович');
GO

-- Вставка данных в Products
INSERT INTO Products (product_name, category_id, price, quantity_in_stock) VALUES 
('Лаванда', 1, '1500.00', 100),
('Мелисса', 1, '2000.00', 80),
('Чайное дерево', 1, '2500.00', 50),
('Розмарин', 1, '1800.00', 70),
('Масло ши', 2, '1200.00', 90),
('Кокосовое масло', 2, '1100.00', 60),
('Гиалуроновая кислота', 3, '3000.00', 40),
('Экстракт алоэ', 2, '1600.00', 50),
('Глицерин', 3, '800.00', 100),
('Бензоат натрия', 4, '500.00', 150),
('Сорбат калия', 4, '700.00', 120),
('Пектин', 5, '900.00', 130),
('Меласса', 5, '600.00', 140),
('Куркумин', 6, '2500.00', 80),
('Экстракт зеленого чая', 6, '2200.00', 70),
('Куркума', 7, '1000.00', 200),
('Смесь эфирных масел для массажа', 8, '3000.00', 30),
('Ароматизатор ванили', 9, '1500.00', 100),
('Ароматизатор цитрусовый', 9, '1600.00', 90),
('Ароматизатор лаванды', 9, '1700.00', 80),
('Масло', 1, '500.00', 200);
GO

-- Вставка данных в Orders с правильным форматом даты
INSERT INTO Orders (client_id, order_date, order_status_id) VALUES 
(1, '2023-01-15T10:00:00', 3),
(2, '2023-01-16T11:30:00', 3),
(3, '2023-01-17T09:45:00', 1),
(4, '2023-06-18T14:20:00', 3),
(5, '2023-01-19T16:00:00', 1),
(6, '2023-01-20T12:15:00', 3),
(7, '2023-01-21T08:30:00', 3),
(8, '2023-01-22T10:45:00', 3),
(9, '2024-05-23T13:00:00', 2),
(10, '2024-01-24T15:30:00', 3),
(11, '2023-01-25T17:00:00', 3),
(12, '2023-11-26T11:15:00', 3),
(13, '2023-07-27T09:30:00', 3),
(14, '2023-01-28T14:45:00', 3),
(15, '2023-01-29T16:00:00', 3),
(16, '2024-04-30T12:30:00', 3),
(17, '2023-01-31T10:00:00', 1),
(18, '2023-02-01T11:15:00', 2),
(19, '2023-02-02T13:30:00', 3),
(20, '2023-02-03T15:45:00', 1);
GO

-- Вставка данных в OrderItems (убедимся, что order_id и product_id существуют)
INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES 
(1, 1, 5, '1500.00'),
(1, 2, 2, '2000.00'),
(2, 3, 3, '2500.00'),
(2, 4, 1, '1800.00'),
(3, 5, 4, '1200.00'),
(3, 6, 3, '1100.00'),
(4, 7, 2, '3000.00'),
(4, 8, 5, '1600.00'),
(5, 9, 10, '800.00'),
(5, 10, 8, '500.00'),
(6, 11, 6, '700.00'),
(6, 12, 10, '900.00'),
(7, 13, 4, '2500.00'),
(7, 14, 3, '2200.00'),
(8, 15, 1, '1000.00'),
(8, 16, 2, '3000.00'),
(9, 17, 5, '1500.00'),
(9, 18, 3, '1600.00'),
(10, 19, 4, '1700.00'),
(10, 20, 2, '1500.00'),
(11, 1, 7, '1500.00'),
(11, 2, 5, '2000.00');
GO

-- Создание хранимых процедур
CREATE PROCEDURE AddClient
    @first_name VARCHAR(50),
    @last_name VARCHAR(50),
    @company_name VARCHAR(100),
    @email VARCHAR(100),
    @phone VARCHAR(20),
    @address VARCHAR(255)
AS
BEGIN
    INSERT INTO Clients (first_name, last_name, company_name, email, phone, address)
    VALUES (@first_name, @last_name, @company_name, @email, @phone, @address);
END;
GO

CREATE PROCEDURE AddProduct
    @product_name VARCHAR(100),
    @category_id INT,
    @price DECIMAL(10,2),
    @quantity_in_stock INT
AS
BEGIN
    INSERT INTO Products (product_name, category_id, price, quantity_in_stock)
    VALUES (@product_name, @category_id, @price, @quantity_in_stock);
END;
GO

CREATE PROCEDURE CountTotalProducts
AS
BEGIN
    SELECT COUNT(*) AS total_products FROM Products;
END;
GO

CREATE PROCEDURE DeleteClientById
    @client_id INT
AS
BEGIN
    DELETE FROM Clients
    WHERE client_id = @client_id;
END;
GO

CREATE PROCEDURE GetClientOrders
    @client_id INT
AS
BEGIN
    SELECT * FROM Orders
    WHERE Orders.client_id = @client_id;
END;
GO

CREATE PROCEDURE GetOrderById
    @order_id INT
AS
BEGIN
    SELECT * FROM Orders
    WHERE Orders.order_id = @order_id;
END;
GO

CREATE PROCEDURE GetProductsByCategory
    @category_name VARCHAR(100)
AS
BEGIN
    SELECT * FROM Products p
    WHERE p.category_id = (SELECT category_id FROM Categories c WHERE c.category_name = @category_name);
END;
GO

CREATE PROCEDURE UpdateOrderStatus
    @order_id INT,
    @new_status INT
AS
BEGIN
    UPDATE Orders
    SET order_status_id = @new_status
    WHERE Orders.order_id = @order_id;
END;
GO