namespace Shop.Api;

public sealed class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string Image { get; set; } = "";
}
public sealed class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequestId { get; set; }
    public string Fingerprint { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public decimal Subtotal { get; set; }
    public decimal Shipping { get; set; }
    public decimal Total { get; set; }
    public List<OrderItem> Items { get; set; } = [];
}
public sealed class OrderItem
{
    public int Id { get; set; }
    public Guid OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
}
public record CartLine(int ProductId, int Quantity);
public record CheckoutRequest(Guid RequestId, string CustomerName, List<CartLine> Items);
public record OrderLineDto(int ProductId, string ProductName, int Quantity, decimal UnitPrice);
public record OrderDto(Guid Id, DateTime CreatedAt, decimal Subtotal, decimal Shipping, decimal Total, List<OrderLineDto> Items);
public sealed class ShopException(string message, int status = 400) : Exception(message) { public int Status { get; } = status; }
public static class Pricing
{
    public static decimal Shipping(decimal subtotal) => subtotal >= 75m ? 0m : 5m;
    public static List<CartLine> Validate(CheckoutRequest r)
    {
        if (r.RequestId == Guid.Empty) throw new ShopException("A request ID is required.");
        if (string.IsNullOrWhiteSpace(r.CustomerName) || r.CustomerName.Trim().Length > 80) throw new ShopException("Enter a name between 1 and 80 characters.");
        if (r.Items is null || r.Items.Count == 0 || r.Items.Count > 20) throw new ShopException("Choose between 1 and 20 products.");
        if (r.Items.Any(x => x is null || x.ProductId <= 0 || x.Quantity < 1 || x.Quantity > 10)) throw new ShopException("Quantities must be between 1 and 10.");
        if (r.Items.Select(x => x.ProductId).Distinct().Count() != r.Items.Count) throw new ShopException("Combine duplicate products into one line.");
        return r.Items.OrderBy(x => x.ProductId).ToList();
    }
}
