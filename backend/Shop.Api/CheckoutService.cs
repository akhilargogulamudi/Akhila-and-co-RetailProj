using System.Data;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
namespace Shop.Api;

public sealed class CheckoutService(ShopDb db, ILogger<CheckoutService> log)
{
    public async Task<OrderDto> Place(CheckoutRequest r, CancellationToken ct)
    {
        var lines = Pricing.Validate(r);
        var fingerprint = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(r.CustomerName.Trim() + "|" + string.Join(";", lines.Select(x => $"{x.ProductId}:{x.Quantity}")))));
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, ct);
        var existing = await db.Orders.AsNoTracking().Include(o => o.Items).SingleOrDefaultAsync(o => o.RequestId == r.RequestId, ct);
        if (existing is not null) { if (existing.Fingerprint != fingerprint) throw new ShopException("This request ID belongs to a different cart.", 409); return ToDto(existing); }
        var order = new Order { RequestId = r.RequestId, Fingerprint = fingerprint, CustomerName = r.CustomerName.Trim() };
        foreach (var line in lines)
        {
            // A single conditional UPDATE locks and decrements the row atomically.
            // Processing IDs in order reduces deadlock risk across multi-product orders.
            var changed = await db.Products.Where(p => p.Id == line.ProductId && p.Stock >= line.Quantity).ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - line.Quantity), ct);
            if (changed == 0) throw new ShopException("An item is unavailable in that quantity. Update your bag and try again.", 409);
            var p = await db.Products.AsNoTracking().SingleAsync(p => p.Id == line.ProductId, ct);
            order.Items.Add(new() { ProductId = p.Id, ProductName = p.Name, UnitPrice = p.Price, Quantity = line.Quantity });
        }
        order.Subtotal = order.Items.Sum(x => x.UnitPrice * x.Quantity); order.Shipping = Pricing.Shipping(order.Subtotal); order.Total = order.Subtotal + order.Shipping;
        db.Orders.Add(order); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        log.LogInformation("Demo order {OrderId} saved with {LineCount} lines", order.Id, order.Items.Count);
        return ToDto(order);
    }
    public static OrderDto ToDto(Order o) => new(o.Id, o.CreatedAt, o.Subtotal, o.Shipping, o.Total, o.Items.Select(i => new OrderLineDto(i.ProductId, i.ProductName, i.Quantity, i.UnitPrice)).ToList());
}
