using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using System.Text.Encodings.Web;
using System.Text.Unicode;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Configure services
builder.Services.AddSingleton<HtmlEncoder>(HtmlEncoder.Create(UnicodeRanges.All));
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Encoder = System.Text.Encodings.Web.JavaScriptEncoder.Create(UnicodeRanges.All);
    options.JsonSerializerOptions.PropertyNamingPolicy = null;
    options.JsonSerializerOptions.WriteIndented = true;
});

// Configure response encoding
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.ValueLengthLimit = int.MaxValue;
    options.MultipartBodyLengthLimit = int.MaxValue;
    options.MultipartHeadersLengthLimit = int.MaxValue;
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// Configure response encoding
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Content-Type", "application/json; charset=utf-8");
    await next();
});

// Get connection string from configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=db,1433;Database=LekoStyle;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;MultipleActiveResultSets=true;Encrypt=True;CharSet=utf8;";

Console.WriteLine("Attempting to connect to database...");

// Function to test database connection
async Task<bool> TestConnection()
{
    try
    {
        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        Console.WriteLine("Successfully connected to database!");
        return true;
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Failed to connect to database: {ex.Message}");
        Console.WriteLine($"Connection string: {connectionString.Replace("YourStrong@Passw0rd", "*****")}");
        return false;
    }
}

// Wait for database to be ready
var maxRetries = 30;
var retryCount = 0;
while (!await TestConnection() && retryCount < maxRetries)
{
    retryCount++;
    Console.WriteLine($"Retry {retryCount} of {maxRetries}...");
    await Task.Delay(2000); // Wait 2 seconds between retries
}

if (retryCount >= maxRetries)
{
    throw new Exception("Could not connect to database after multiple retries");
}

// Enable static files
app.UseStaticFiles();

// API endpoints
app.MapGet("/api/products", async (HttpContext context) =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        var products = await db.QueryAsync(@"
            SELECT p.*, c.category_name 
            FROM Products p 
            LEFT JOIN Categories c ON p.category_id = c.category_id
            ORDER BY p.product_name");
            
        // Debug logging
        foreach (var product in products)
        {
            Console.WriteLine($"Product: {product.product_name}, Category: {product.category_name}");
        }
        
        return Results.Ok(products);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in /api/products endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapGet("/api/products/{id}", async (int id) =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        var product = await db.QueryFirstOrDefaultAsync(@"
            SELECT p.*, c.category_name 
            FROM Products p 
            LEFT JOIN Categories c ON p.category_id = c.category_id 
            WHERE p.product_id = @Id", new { Id = id });
        
        if (product == null)
            return Results.NotFound();
            
        return Results.Ok(product);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in /api/products/{id} endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapPost("/api/products", async (Product product) =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        var sql = @"
            INSERT INTO Products (product_name, category_id, price, quantity_in_stock)
            VALUES (@ProductName, @CategoryId, @Price, @QuantityInStock);
            SELECT CAST(SCOPE_IDENTITY() as int)";
            
        var id = await db.QuerySingleAsync<int>(sql, product);
        return Results.Created($"/api/products/{id}", new { id });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in POST /api/products endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapPut("/api/products/{id}", async (int id, Product product) =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        var sql = @"
            UPDATE Products 
            SET product_name = @ProductName,
                category_id = @CategoryId,
                price = @Price,
                quantity_in_stock = @QuantityInStock
            WHERE product_id = @Id";
            
        await db.ExecuteAsync(sql, new { 
            product.ProductName, 
            product.CategoryId, 
            product.Price, 
            product.QuantityInStock, 
            Id = id 
        });
        
        return Results.Ok();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in PUT /api/products/{id} endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapDelete("/api/products/{id}", async (int id) =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        await db.ExecuteAsync("DELETE FROM Products WHERE product_id = @Id", new { Id = id });
        return Results.Ok();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in DELETE /api/products/{id} endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapGet("/api/categories", async () =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        var categories = await db.QueryAsync("SELECT * FROM Categories");
        return Results.Ok(categories);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in /api/categories endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

// API endpoints for clients
app.MapGet("/api/clients", async () =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        var clients = await db.QueryAsync("SELECT * FROM Clients");
        return Results.Ok(clients);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in /api/clients endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapGet("/api/clients/{id}", async (int id) =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        var client = await db.QueryFirstOrDefaultAsync(
            "SELECT * FROM Clients WHERE client_id = @Id", 
            new { Id = id });
        
        if (client == null)
            return Results.NotFound();
            
        return Results.Ok(client);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in /api/clients/{id} endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapPost("/api/clients", async (Client client) =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        var sql = @"
            INSERT INTO Clients (last_name, first_name, middle_name, company_name, email, phone, address)
            VALUES (@LastName, @FirstName, @MiddleName, @CompanyName, @Email, @Phone, @Address);
            SELECT CAST(SCOPE_IDENTITY() as int)";
            
        var id = await db.QuerySingleAsync<int>(sql, client);
        return Results.Created($"/api/clients/{id}", new { id });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in POST /api/clients endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapPut("/api/clients/{id}", async (int id, Client client) =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        var sql = @"
            UPDATE Clients 
            SET last_name = @LastName,
                first_name = @FirstName,
                middle_name = @MiddleName,
                company_name = @CompanyName,
                email = @Email,
                phone = @Phone,
                address = @Address
            WHERE client_id = @Id";
            
        await db.ExecuteAsync(sql, new { 
            client.LastName, 
            client.FirstName, 
            client.MiddleName, 
            client.CompanyName, 
            client.Email, 
            client.Phone, 
            client.Address, 
            Id = id 
        });
        
        return Results.Ok();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in PUT /api/clients/{id} endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapDelete("/api/clients/{id}", async (int id) =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        await db.ExecuteAsync("DELETE FROM Clients WHERE client_id = @Id", new { Id = id });
        return Results.Ok();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in DELETE /api/clients/{id} endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

// API endpoints for orders
app.MapGet("/api/orders", async () =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        var orders = await db.QueryAsync(@"
            SELECT o.*, 
                   CONCAT(c.last_name, ' ', c.first_name, ' ', ISNULL(c.middle_name, '')) as client_name,
                   (SELECT SUM(oi.quantity * p.price) 
                    FROM OrderItems oi 
                    JOIN Products p ON oi.product_id = p.product_id 
                    WHERE oi.order_id = o.order_id) as total_amount
            FROM Orders o
            JOIN Clients c ON o.client_id = c.client_id
            ORDER BY o.order_date DESC");
        return Results.Ok(orders);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in /api/orders endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapGet("/api/orders/{id}", async (int id) =>
{
    using IDbConnection db = new SqlConnection(connectionString);
    try
    {
        var order = await db.QueryFirstOrDefaultAsync(@"
            SELECT o.*, 
                   CONCAT(c.last_name, ' ', c.first_name, ' ', ISNULL(c.middle_name, '')) as client_name
            FROM Orders o
            JOIN Clients c ON o.client_id = c.client_id
            WHERE o.order_id = @Id", 
            new { Id = id });
        
        if (order == null)
            return Results.NotFound();
            
        var items = await db.QueryAsync(@"
            SELECT oi.*, p.product_name, p.price
            FROM OrderItems oi
            JOIN Products p ON oi.product_id = p.product_id
            WHERE oi.order_id = @Id",
            new { Id = id });
            
        order.items = items;
        return Results.Ok(order);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error in /api/orders/{id} endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

app.MapPost("/api/orders", async (Order order) =>
{
    Console.WriteLine($"Received POST request for new order");
    Console.WriteLine($"Order data: ClientId={order.ClientId}, Status={order.Status}");
    Console.WriteLine($"Items count: {order.Items?.Count ?? 0}");
    
    using var db = new SqlConnection(connectionString);
    await db.OpenAsync();
    using var transaction = await db.BeginTransactionAsync();
    try
    {
        // Проверяем существование клиента
        var client = await db.QueryFirstOrDefaultAsync(
            "SELECT * FROM Clients WHERE client_id = @ClientId",
            new { order.ClientId },
            transaction
        );
        
        if (client == null)
        {
            Console.WriteLine($"Client {order.ClientId} not found");
            return Results.BadRequest(new { error = $"Client {order.ClientId} not found" });
        }

        // Проверяем существование статуса
        var orderStatus = await db.QueryFirstOrDefaultAsync(
            "SELECT order_status_id FROM OrderStatus WHERE order_status_id = @StatusId",
            new { StatusId = order.Status },
            transaction
        );
        
        if (orderStatus == null)
        {
            Console.WriteLine($"Status ID {order.Status} not found");
            return Results.BadRequest(new { error = $"Status ID {order.Status} not found" });
        }
        
        // Создание заказа
        var orderSql = @"
            INSERT INTO Orders (client_id, order_date, order_status_id)
            VALUES (@ClientId, GETDATE(), @OrderStatusId);
            SELECT CAST(SCOPE_IDENTITY() as int)";
            
        Console.WriteLine($"Executing order insert SQL: {orderSql}");
        Console.WriteLine($"Parameters: ClientId={order.ClientId}, OrderStatusId={order.Status}");
        
        var orderId = await db.QuerySingleAsync<int>(orderSql, new { 
            order.ClientId, 
            OrderStatusId = order.Status
        }, transaction);
        
        Console.WriteLine($"Created order with ID: {orderId}");
        
        // Добавление товаров в заказ
        foreach (var item in order.Items)
        {
            Console.WriteLine($"Processing item: ProductId={item.ProductId}, Quantity={item.Quantity}");
            
            // Проверяем существование товара и его количество
            var product = await db.QueryFirstOrDefaultAsync(
                "SELECT * FROM Products WHERE product_id = @ProductId",
                new { item.ProductId },
                transaction
            );
            
            if (product == null)
            {
                throw new Exception($"Product {item.ProductId} not found");
            }
            
            if (product.quantity_in_stock < item.Quantity)
            {
                throw new Exception($"Not enough stock for product {item.ProductId}. Available: {product.quantity_in_stock}, Requested: {item.Quantity}");
            }
            
            var itemSql = @"
                INSERT INTO OrderItems (order_id, product_id, quantity, price)
                VALUES (@OrderId, @ProductId, @Quantity, @Price)";
                
            await db.ExecuteAsync(itemSql, new {
                OrderId = orderId,
                item.ProductId,
                item.Quantity,
                Price = product.price
            }, transaction);
            
            // Обновление количества товара на складе
            var updateStockSql = @"
                UPDATE Products 
                SET quantity_in_stock = quantity_in_stock - @Quantity
                WHERE product_id = @ProductId";
                
            await db.ExecuteAsync(updateStockSql, new {
                item.Quantity,
                item.ProductId
            }, transaction);
        }
        
        await transaction.CommitAsync();
        Console.WriteLine("Transaction committed successfully");
        return Results.Created($"/api/orders/{orderId}", new { id = orderId });
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        Console.WriteLine($"Error in POST /api/orders endpoint: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        return Results.BadRequest(new { error = ex.Message });
    }
});

app.MapPut("/api/orders/{id}", async (int id, Order order) =>
{
    Console.WriteLine($"Received PUT request for order {id}");
    Console.WriteLine($"Order data: ClientId={order.ClientId}, Status={order.Status}");
    Console.WriteLine($"Items count: {order.Items?.Count ?? 0}");
    
    // Валидация данных
    if (order.Status <= 0)
    {
        Console.WriteLine("Status is required");
        return Results.BadRequest(new { error = "Status is required" });
    }
    
    if (order.Items == null || !order.Items.Any())
    {
        Console.WriteLine("Order must contain at least one item");
        return Results.BadRequest(new { error = "Order must contain at least one item" });
    }
    
    foreach (var item in order.Items)
    {
        if (item.ProductId <= 0)
        {
            Console.WriteLine($"Invalid ProductId in item: {item.ProductId}");
            return Results.BadRequest(new { error = $"Invalid ProductId in item: {item.ProductId}" });
        }
        
        if (item.Quantity <= 0)
        {
            Console.WriteLine($"Invalid Quantity in item: {item.Quantity}");
            return Results.BadRequest(new { error = $"Invalid Quantity in item: {item.Quantity}" });
        }
    }
    
    using var db = new SqlConnection(connectionString);
    await db.OpenAsync();
    using var transaction = await db.BeginTransactionAsync();
    try
    {
        // Проверяем существование заказа
        var existingOrder = await db.QueryFirstOrDefaultAsync(
            "SELECT * FROM Orders WHERE order_id = @Id",
            new { Id = id },
            transaction
        );
        
        if (existingOrder == null)
        {
            Console.WriteLine($"Order {id} not found");
            return Results.NotFound(new { error = $"Order {id} not found" });
        }
        
        // Получаем ID статуса заказа
        var orderStatus = await db.QueryFirstOrDefaultAsync(
            "SELECT order_status_id FROM OrderStatus WHERE order_status_id = @StatusId",
            new { StatusId = order.Status },
            transaction
        );
        
        if (orderStatus == null)
        {
            Console.WriteLine($"Status ID {order.Status} not found");
            return Results.BadRequest(new { error = $"Status ID {order.Status} not found" });
        }
        
        // Обновление заказа (только статус)
        var orderSql = @"
            UPDATE Orders 
            SET order_status_id = @OrderStatusId
            WHERE order_id = @Id";
            
        Console.WriteLine($"Executing order update SQL: {orderSql}");
        Console.WriteLine($"Parameters: OrderStatusId={order.Status}, Id={id}");
        
        await db.ExecuteAsync(orderSql, new { 
            OrderStatusId = order.Status,
            Id = id 
        }, transaction);
        
        // Получение старых товаров заказа
        var oldItems = await db.QueryAsync<OrderItem>(
            "SELECT * FROM OrderItems WHERE order_id = @Id",
            new { Id = id },
            transaction
        );
        
        Console.WriteLine($"Found {oldItems.Count()} old items");
        
        // Возврат товаров на склад
        foreach (var item in oldItems)
        {
            var returnStockSql = @"
                UPDATE Products 
                SET quantity_in_stock = quantity_in_stock + @Quantity
                WHERE product_id = @ProductId";
                
            Console.WriteLine($"Returning item to stock: ProductId={item.ProductId}, Quantity={item.Quantity}");
            
            await db.ExecuteAsync(returnStockSql, new {
                item.Quantity,
                item.ProductId
            }, transaction);
        }
        
        // Удаление старых товаров заказа
        await db.ExecuteAsync(
            "DELETE FROM OrderItems WHERE order_id = @Id",
            new { Id = id },
            transaction
        );
        
        Console.WriteLine("Deleted old order items");
        
        // Добавление новых товаров в заказ
        foreach (var item in order.Items)
        {
            Console.WriteLine($"Adding new item: ProductId={item.ProductId}, Quantity={item.Quantity}");
            
            // Проверяем существование товара и его количество
            var product = await db.QueryFirstOrDefaultAsync(
                "SELECT * FROM Products WHERE product_id = @ProductId",
                new { item.ProductId },
                transaction
            );
            
            if (product == null)
            {
                throw new Exception($"Product {item.ProductId} not found");
            }
            
            if (product.quantity_in_stock < item.Quantity)
            {
                throw new Exception($"Not enough stock for product {item.ProductId}. Available: {product.quantity_in_stock}, Requested: {item.Quantity}");
            }
            
            var itemSql = @"
                INSERT INTO OrderItems (order_id, product_id, quantity, price)
                VALUES (@OrderId, @ProductId, @Quantity, @Price)";
                
            await db.ExecuteAsync(itemSql, new {
                OrderId = id,
                item.ProductId,
                item.Quantity,
                Price = product.price
            }, transaction);
            
            // Обновление количества товара на складе
            var updateStockSql = @"
                UPDATE Products 
                SET quantity_in_stock = quantity_in_stock - @Quantity
                WHERE product_id = @ProductId";
                
            await db.ExecuteAsync(updateStockSql, new {
                item.Quantity,
                item.ProductId
            }, transaction);
        }
        
        await transaction.CommitAsync();
        Console.WriteLine("Transaction committed successfully");
        return Results.Ok();
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        Console.WriteLine($"Error in PUT /api/orders/{id} endpoint: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        return Results.BadRequest(new { error = ex.Message });
    }
});

app.MapDelete("/api/orders/{id}", async (int id) =>
{
    using var db = new SqlConnection(connectionString);
    await db.OpenAsync();
    using var transaction = db.BeginTransaction();
    try
    {
        // Получение товаров заказа
        var items = await db.QueryAsync<OrderItem>(
            "SELECT * FROM OrderItems WHERE order_id = @Id",
            new { Id = id },
            transaction
        );
        
        // Возврат товаров на склад
        foreach (var item in items)
        {
            var returnStockSql = @"
                UPDATE Products 
                SET quantity_in_stock = quantity_in_stock + @Quantity
                WHERE product_id = @ProductId";
                
            await db.ExecuteAsync(returnStockSql, new {
                item.Quantity,
                item.ProductId
            }, transaction);
        }
        
        // Удаление товаров заказа
        await db.ExecuteAsync(
            "DELETE FROM OrderItems WHERE order_id = @Id",
            new { Id = id },
            transaction
        );
        
        // Удаление заказа
        await db.ExecuteAsync(
            "DELETE FROM Orders WHERE order_id = @Id",
            new { Id = id },
            transaction
        );
        
        transaction.Commit();
        return Results.Ok();
    }
    catch (Exception ex)
    {
        transaction.Rollback();
        Console.WriteLine($"Error in DELETE /api/orders/{id} endpoint: {ex.Message}");
        return Results.Problem($"Database error: {ex.Message}");
    }
});

// API endpoints for authentication
app.MapPost("/api/auth/login", async (LoginRequest request) =>
{
    // В реальном приложении здесь должна быть проверка учетных данных в базе данных
    // Для демонстрации используем фиксированные учетные данные
    if (request.Username == "admin" && request.Password == "Admin123!")
    {
        // В реальном приложении здесь должен генерироваться JWT токен
        // Для демонстрации используем простой токен
        return Results.Ok(new { token = "demo_token" });
    }
    
    return Results.Unauthorized();
});

// Добавляем middleware для проверки авторизации
app.Use(async (context, next) =>
{
    // Пропускаем проверку для публичных эндпоинтов
    if (context.Request.Path.StartsWithSegments("/api/auth/login") ||
        context.Request.Path.StartsWithSegments("/api/products") ||
        context.Request.Path.StartsWithSegments("/api/categories"))
    {
        await next();
        return;
    }
    
    // Проверяем токен для защищенных эндпоинтов
    if (context.Request.Path.StartsWithSegments("/api/clients") ||
        context.Request.Path.StartsWithSegments("/api/orders"))
    {
        // Разрешаем GET запросы для просмотра данных
        if (context.Request.Method == "GET")
        {
            await next();
            return;
        }
        
        // Для остальных методов (POST, PUT, DELETE) требуем токен
        var authHeader = context.Request.Headers["Authorization"].ToString();
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            context.Response.StatusCode = 401;
            return;
        }

        var token = authHeader.Replace("Bearer ", "");
        
        // В реальном приложении здесь должна быть проверка JWT токена
        // Для демонстрации проверяем простой токен
        if (string.IsNullOrEmpty(token) || token != "demo_token")
        {
            context.Response.StatusCode = 401;
            return;
        }
    }
    
    await next();
});

// Redirect root to index.html
app.MapGet("/", () => Results.Redirect("/index.html"));

Console.WriteLine("Starting web application...");
app.Run();

// Models
public class Product
{
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public int? CategoryId { get; set; }
    public decimal Price { get; set; }
    public int QuantityInStock { get; set; }
    public string? CategoryName { get; set; }
}

public class Client
{
    public int ClientId { get; set; }
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? CompanyName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
}

public class Order
{
    public int OrderId { get; set; }
    public int ClientId { get; set; }
    public DateTime OrderDate { get; set; }
    public int Status { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}

public class OrderItem
{
    public int OrderItemId { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? ProductName { get; set; }
    public decimal Price { get; set; }
}

public class LoginRequest
{
    public string Username { get; set; }
    public string Password { get; set; }
} 