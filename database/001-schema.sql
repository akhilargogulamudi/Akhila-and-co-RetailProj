-- Initial empty-database schema generated from EF Core. Run once in a fresh database.
CREATE TABLE [Orders] (
    [Id] uniqueidentifier NOT NULL,
    [RequestId] uniqueidentifier NOT NULL,
    [Fingerprint] nvarchar(64) NOT NULL,
    [CustomerName] nvarchar(80) NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [Subtotal] decimal(12,2) NOT NULL,
    [Shipping] decimal(12,2) NOT NULL,
    [Total] decimal(12,2) NOT NULL,
    CONSTRAINT [PK_Orders] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Products] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(120) NOT NULL,
    [Category] nvarchar(40) NOT NULL,
    [Description] nvarchar(1000) NOT NULL,
    [Price] decimal(10,2) NOT NULL,
    [Stock] int NOT NULL,
    [Image] nvarchar(200) NOT NULL,
    CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_Product_Price] CHECK ([Price]>0),
    CONSTRAINT [CK_Product_Stock] CHECK ([Stock]>=0)
);
GO


CREATE TABLE [OrderItems] (
    [Id] int NOT NULL IDENTITY,
    [OrderId] uniqueidentifier NOT NULL,
    [ProductId] int NOT NULL,
    [ProductName] nvarchar(120) NOT NULL,
    [UnitPrice] decimal(10,2) NOT NULL,
    [Quantity] int NOT NULL,
    CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
    CONSTRAINT [CK_OrderItem_Quantity] CHECK ([Quantity] BETWEEN 1 AND 10),
    CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_OrderItems_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION
);
GO


IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'Description', N'Image', N'Name', N'Price', N'Stock') AND [object_id] = OBJECT_ID(N'[Products]'))
    SET IDENTITY_INSERT [Products] ON;
INSERT INTO [Products] ([Id], [Category], [Description], [Image], [Name], [Price], [Stock])
VALUES (1, N'Carry', N'A compact backpack for your commute, your workday, and everything in between.', N'/images/bag.jpg', N'Everyday Backpack', 28.0, 18),
(2, N'Home', N'A ceramic mug for your first coffee and your last tea. A simple shape for everyday rituals.', N'/images/mug.jpg', N'Quiet Morning Mug', 18.0, 24),
(3, N'Desk', N'Make room for a fresh idea. A notebook for small plans and the details worth keeping.', N'/images/journal.jpg', N'Daily Notes Journal', 16.0, 30),
(4, N'Carry', N'A reusable bottle for your desk and your day out. An easy everyday companion.', N'/images/bottle.jpg', N'Stay Hydrated Bottle', 32.0, 7),
(5, N'Desk', N'A focused light for reading, writing, and your next good idea.', N'/images/lamp.jpg', N'Focus Desk Lamp', 54.0, 5),
(6, N'Desk', N'A little space for your favorite playlist. Over-ear headphones for a quiet moment.', N'/images/headphones.jpg', N'Unwind Headphones', 68.0, 0);
IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'Description', N'Image', N'Name', N'Price', N'Stock') AND [object_id] = OBJECT_ID(N'[Products]'))
    SET IDENTITY_INSERT [Products] OFF;
GO


CREATE INDEX [IX_OrderItems_OrderId] ON [OrderItems] ([OrderId]);
GO


CREATE INDEX [IX_OrderItems_ProductId] ON [OrderItems] ([ProductId]);
GO


CREATE INDEX [IX_Orders_CreatedAt] ON [Orders] ([CreatedAt]);
GO


CREATE UNIQUE INDEX [IX_Orders_RequestId] ON [Orders] ([RequestId]);
GO


CREATE INDEX [IX_Products_Category_Id] ON [Products] ([Category], [Id]);
GO



