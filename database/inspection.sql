-- Run against your AkhilaEdit demo database, not a production database.
SELECT Id, Name, Category, Price, Stock FROM dbo.Products ORDER BY Id;
SELECT Id, CreatedAt, Subtotal, Shipping, Total FROM dbo.Orders ORDER BY CreatedAt DESC;
SELECT o.Id, o.CreatedAt, i.ProductName, i.Quantity, i.UnitPrice,
       i.Quantity * i.UnitPrice AS LineTotal
FROM dbo.Orders o JOIN dbo.OrderItems i ON o.Id=i.OrderId ORDER BY o.CreatedAt DESC;
-- Should return no rows:
SELECT * FROM dbo.Products WHERE Stock < 0;
SELECT RequestId, COUNT(*) AS Copies FROM dbo.Orders GROUP BY RequestId HAVING COUNT(*) > 1;
