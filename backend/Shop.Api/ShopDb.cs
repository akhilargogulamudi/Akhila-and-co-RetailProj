using Microsoft.EntityFrameworkCore;
namespace Shop.Api;

public sealed class ShopDb(DbContextOptions<ShopDb> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Product>(e =>
        {
            e.Property(p => p.Name).HasMaxLength(120); e.Property(p => p.Category).HasMaxLength(40); e.Property(p => p.Description).HasMaxLength(1000); e.Property(p => p.Image).HasMaxLength(200); e.Property(p => p.Price).HasPrecision(10, 2);
            e.HasIndex(p => new { p.Category, p.Id });
            e.ToTable("Products", t => { t.HasCheckConstraint("CK_Product_Stock", "[Stock]>=0"); t.HasCheckConstraint("CK_Product_Price", "[Price]>0"); });
            e.HasData(
             new Product { Id = 1, Name = "Everyday Backpack", Category = "Carry", Price = 28, Stock = 18, Image = "/images/bag.jpg", Description = "A compact backpack for your commute, your workday, and everything in between." },
             new Product { Id = 2, Name = "Quiet Morning Mug", Category = "Home", Price = 18, Stock = 24, Image = "/images/mug.jpg", Description = "A ceramic mug for your first coffee and your last tea. A simple shape for everyday rituals." },
             new Product { Id = 3, Name = "Daily Notes Journal", Category = "Desk", Price = 16, Stock = 30, Image = "/images/journal.jpg", Description = "Make room for a fresh idea. A notebook for small plans and the details worth keeping." },
             new Product { Id = 4, Name = "Stay Hydrated Bottle", Category = "Carry", Price = 32, Stock = 7, Image = "/images/bottle.jpg", Description = "A reusable bottle for your desk and your day out. An easy everyday companion." },
             new Product { Id = 5, Name = "Focus Desk Lamp", Category = "Desk", Price = 54, Stock = 5, Image = "/images/lamp.jpg", Description = "A focused light for reading, writing, and your next good idea." },
             new Product { Id = 6, Name = "Unwind Headphones", Category = "Desk", Price = 68, Stock = 0, Image = "/images/headphones.jpg", Description = "A little space for your favorite playlist. Over-ear headphones for a quiet moment." });
        });
        b.Entity<Order>(e => { e.HasIndex(o => o.RequestId).IsUnique(); e.HasIndex(o => o.CreatedAt); e.Property(o => o.Fingerprint).HasMaxLength(64); e.Property(o => o.CustomerName).HasMaxLength(80); e.Property(o => o.Subtotal).HasPrecision(12, 2); e.Property(o => o.Shipping).HasPrecision(12, 2); e.Property(o => o.Total).HasPrecision(12, 2); });
        b.Entity<OrderItem>(e => { e.Property(i => i.ProductName).HasMaxLength(120); e.Property(i => i.UnitPrice).HasPrecision(10, 2); e.HasOne<Product>().WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict); e.ToTable("OrderItems", t => t.HasCheckConstraint("CK_OrderItem_Quantity", "[Quantity] BETWEEN 1 AND 10")); });
    }
}
