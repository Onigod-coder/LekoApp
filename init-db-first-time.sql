-- Создание базы данных с поддержкой UTF-8
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LekoStyle')
BEGIN
    CREATE DATABASE LekoStyle
    COLLATE Cyrillic_General_CI_AS;
END
GO

USE LekoStyle;
GO

-- Set database collation to UTF-8
ALTER DATABASE LekoStyle COLLATE Cyrillic_General_CI_AS;
GO

-- Drop existing tables if they exist
IF OBJECT_ID('OrderItems', 'U') IS NOT NULL DROP TABLE OrderItems;
IF OBJECT_ID('Orders', 'U') IS NOT NULL DROP TABLE Orders;
IF OBJECT_ID('Products', 'U') IS NOT NULL DROP TABLE Products;
IF OBJECT_ID('Categories', 'U') IS NOT NULL DROP TABLE Categories;
IF OBJECT_ID('Clients', 'U') IS NOT NULL DROP TABLE Clients;
IF OBJECT_ID('OrderStatus', 'U') IS NOT NULL DROP TABLE OrderStatus;
GO

-- Таблица Categories
CREATE TABLE Categories (
  category_id INT PRIMARY KEY IDENTITY(1,1),
  category_name NVARCHAR(100) COLLATE Cyrillic_General_CI_AS NULL
);
GO

-- Таблица OrderStatus
CREATE TABLE OrderStatus (
  order_status_id INT PRIMARY KEY,
  status_name NVARCHAR(50) COLLATE Cyrillic_General_CI_AS NOT NULL
);
GO

-- Таблица Clients
CREATE TABLE Clients (
  client_id INT PRIMARY KEY IDENTITY(1,1),
  first_name NVARCHAR(50) COLLATE Cyrillic_General_CI_AS NULL,
  last_name NVARCHAR(50) COLLATE Cyrillic_General_CI_AS NULL,
  company_name NVARCHAR(100) COLLATE Cyrillic_General_CI_AS NULL,
  email NVARCHAR(100) COLLATE Cyrillic_General_CI_AS NULL,
  phone NVARCHAR(20) COLLATE Cyrillic_General_CI_AS NULL,
  address NVARCHAR(255) COLLATE Cyrillic_General_CI_AS NULL,
  created_at DATETIME DEFAULT GETDATE(),
  middle_name NVARCHAR(50) COLLATE Cyrillic_General_CI_AS NULL
);
GO

-- Таблица Products
CREATE TABLE Products (
  product_id INT PRIMARY KEY IDENTITY(1,1),
  product_name NVARCHAR(100) COLLATE Cyrillic_General_CI_AS NULL,
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
(N'Эфирные масла'),
(N'Сырье для косметики'),
(N'Фармацевтические ингредиенты'),
(N'Химические вещества'),
(N'Пищевая добавка'),
(N'Ароматизаторы'),
(N'Красители'),
(N'Консерванты'),
(N'Упаковка'),
(N'Эко-продукты'),
(N'Натуральные экстракты'),
(N'Смеси эфирных масел'),
(N'Базовые масла'),
(N'Соль для ванн'),
(N'Чаи и настои'),
(N'Косметические масла'),
(N'Гидролаты'),
(N'Кремы и лосьоны'),
(N'Смеси для массажа'),
(N'Ароматерапия');
GO

-- Вставка данных в OrderStatus
INSERT INTO OrderStatus (order_status_id, status_name) VALUES 
(1, N'Новый'),
(2, N'В обработке'),
(3, N'Выполнен'),
(4, N'Отменен');
GO

-- Вставка данных в Clients
INSERT INTO Clients (first_name, last_name, company_name, email, phone, address, middle_name) VALUES 
(N'Иван', N'Иванов', N'Ивановская Фирма', N'ivanov@example.com', N'+79001234567', N'Москва, ул. Ленина, д. 1', N'Иванович'),
(N'Мария', N'Петрова', N'Петрова и К', N'petrova@example.com', N'+79007654321', N'Санкт-Петербург, ул. Пушкина, д. 2', N'Игоревна'),
(N'Александр', N'Сидоров', N'Сидоров АО', N'sidorov@example.com', N'+79009876543', N'Екатеринбург, ул. Чехова, д. 3', N'Сидорович'),
(N'Ольга', N'Кузнецова', N'Кузнецова Групп', N'kuznetsova@example.com', N'+79003456789', N'Новосибирск, ул. Горького, д. 4', N'Алексеевна'),
(N'Дмитрий', N'Смирнов', N'Смирнов ЛТД', N'smirnov@example.com', N'+79004567890', N'Казань, ул. Лермонтова, д. 5', N'Дмитриевич'),
(N'Анна', N'Васильева', N'Васильева Партнеры', N'vasilieva@example.com', N'+79005678901', N'Нижний Новгород, ул. Толстого, д. 6', N'Сергеевна'),
(N'Сергей', N'Михайлов', N'Михайлов и Ко', N'mikhailov@example.com', N'+79006789012', N'Ростов-на-Дону, ул. Шолохова, д. 7', N'Николаевич'),
(N'Елена', N'Федорова', N'Федорова Сервис', N'fedorova@example.com', N'+79007890123', N'Челябинск, ул. Куйбышева, д. 8', N'Викторовна'),
(N'Андрей', N'Соловьев', N'Соловьев Групп', N'soloviev@example.com', N'+79008901234', N'Уфа, ул. Свердлова, д. 9', N'Романович'),
(N'Марина', N'Григорьева', N'Григорьева Бизнес', N'grigorieva@example.com', N'+79009123456', N'Волгоград, ул. Невского, д. 10', N'Андреевна'),
(N'Николай', N'Зайцев', N'Зайцев и Партнеры', N'zaicev@example.com', N'+79001234567', N'Воронеж, ул. Ленина, д. 11', N'Федорович'),
(N'Татьяна', N'Коваленко', N'Коваленко АО', N'kovalenko@example.com', N'+79007654321', N'Красноярск, ул. Мира, д. 12', N'Григорьевна'),
(N'Виктор', N'Сергеев', N'Сергеев ЛТД', N'sergeev@example.com', N'+79009876543', N'Тюмень, ул. Пушкина, д. 13', N'Станиславович'),
(N'Екатерина', N'Соловьева', N'Соловьева Групп', N'solovyeva@example.com', N'+79003456789', N'Барнаул, ул. Чехова, д. 14', N'Владимировна'),
(N'Роман', N'Алексеев', N'Алексеев и Ко', N'alekseev@example.com', N'+79004567890', N'Ижевск, ул. Горького, д. 15', N'Евгеньевич'),
(N'Светлана', N'Егорова', N'Егорова Партнеры', N'egorova@example.com', N'+79005678901', N'Калуга, ул. Лермонтова, д. 16', N'Анатольевна'),
(N'Анатолий', N'Тихонов', N'Тихонов Групп', N'tikhonov@example.com', N'+79006789012', N'Ставрополь, ул. Шолохова, д. 17', N'Валерьевич'),
(N'Надежда', N'Павлова', N'Павлова Сервис', N'pavlova@example.com', N'+79007890123', N'Сочи, ул. Толстого, д. 18', N'Константиновна'),
(N'Григорий', N'Фролов', N'Фролов Бизнес', N'frolov@example.com', N'+79008901234', N'Ярославль, ул. Свердлова, д. 19', N'Игоревич'),
(N'Людмила', N'Морозова', N'Морозова и Партнеры', N'morozova@example.com', N'+79009123456', N'Симферополь, ул. Невского, д. 20', N'Витальевна'),
(N'Иванов', N'Иван', N'Иван Групп', N'Vanya@mail.ru', N'89009562717', N'Поселок Гаврилово, д. 1', NULL),
(N'Игорь', N'Куклинов', N'КуклиКО', N'onigod7533@gmail.com', N'89111001407', N'Брянцева,14', N'Антонович');
GO

-- Вставка данных в Products
INSERT INTO Products (product_name, category_id, price, quantity_in_stock) VALUES 
(N'Лаванда', 1, '1500.00', 100),
(N'Мелисса', 1, '2000.00', 80),
(N'Чайное дерево', 1, '2500.00', 50),
(N'Розмарин', 1, '1800.00', 70),
(N'Масло ши', 2, '1200.00', 90),
(N'Кокосовое масло', 2, '1100.00', 60),
(N'Гиалуроновая кислота', 3, '3000.00', 40),
(N'Экстракт алоэ', 2, '1600.00', 50),
(N'Глицерин', 3, '800.00', 100),
(N'Бензоат натрия', 4, '500.00', 150),
(N'Сорбат калия', 4, '700.00', 120),
(N'Пектин', 5, '900.00', 130),
(N'Меласса', 5, '600.00', 140),
(N'Куркумин', 6, '2500.00', 80),
(N'Экстракт зеленого чая', 6, '2200.00', 70),
(N'Куркума', 7, '1000.00', 200),
(N'Смесь эфирных масел для массажа', 8, '3000.00', 30),
(N'Ароматизатор ванили', 9, '1500.00', 100),
(N'Ароматизатор цитрусовый', 9, '1600.00', 90),
(N'Ароматизатор лаванды', 9, '1700.00', 80),
(N'Масло', 1, '500.00', 200);
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

-- Вставка данных в OrderItems
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