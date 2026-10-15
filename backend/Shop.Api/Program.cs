using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System.Threading.RateLimiting;
using Shop.Api;
var b = WebApplication.CreateBuilder(args);
b.WebHost.ConfigureKestrel(o => o.Limits.MaxRequestBodySize = 32768);
b.Services.AddDbContext<ShopDb>(o => o.UseSqlServer(b.Configuration.GetConnectionString("Shop") ?? throw new InvalidOperationException("Set ConnectionStrings__Shop. See README.md.")));
b.Services.AddScoped<CheckoutService>(); b.Services.AddOpenApi(); b.Services.AddProblemDetails();
b.Services.AddRateLimiter(o => { o.RejectionStatusCode = 429; o.AddPolicy("checkout", ctx => RateLimitPartition.GetFixedWindowLimiter(ctx.Connection.RemoteIpAddress?.ToString() ?? "local", _ => new FixedWindowRateLimiterOptions { PermitLimit = 30, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 })); });
var app = b.Build(); app.UseExceptionHandler(); app.UseRateLimiter();
app.Use(async (ctx, next) => { ctx.Response.Headers["X-Content-Type-Options"] = "nosniff"; ctx.Response.Headers["Referrer-Policy"] = "no-referrer"; await next(); });
app.UseDefaultFiles(); app.UseStaticFiles(); app.MapOpenApi();
app.MapGet("/api/health", async (ShopDb db) => await db.Database.CanConnectAsync() ? Results.Ok(new { status = "healthy", database = "SQL Server" }) : Results.Problem("Database unavailable", statusCode: 503));
app.MapGet("/api/products", async (ShopDb db, string? search, string? category, string? sort, int? page, int? pageSize, CancellationToken ct) =>
{
    var n = page ?? 1; var size = pageSize ?? 12;
    if (n < 1 || n > 10000 || size < 1 || size > 50 || (search?.Length ?? 0) > 100) return Results.BadRequest(new { message = "Invalid search or pagination." });
    var q = db.Products.AsNoTracking(); if (!string.IsNullOrWhiteSpace(search)) q = q.Where(p => p.Name.Contains(search.Trim())); if (!string.IsNullOrWhiteSpace(category) && category != "All") q = q.Where(p => p.Category == category);
    var total = await q.CountAsync(ct); var ordered = sort switch { "price-asc" => q.OrderBy(p => p.Price).ThenBy(p => p.Id), "price-desc" => q.OrderByDescending(p => p.Price).ThenBy(p => p.Id), _ => q.OrderBy(p => p.Id) };
    var items = await ordered.Skip((n - 1) * size).Take(size).ToListAsync(ct); return Results.Ok(new { items, total, page = n, pageSize = size });
});
app.MapGet("/api/products/{id:int}", async (int id, ShopDb db, CancellationToken ct) => { var p = await db.Products.AsNoTracking().SingleOrDefaultAsync(p => p.Id == id, ct); return p is null ? Results.NotFound(new { message = "Product not found." }) : Results.Ok(p); });
app.MapPost("/api/orders", async (CheckoutRequest r, CheckoutService svc, CancellationToken ct) =>
{
    try { return Results.Ok(await svc.Place(r, ct)); }
    catch (ShopException e) { return Results.Json(new { message = e.Message }, statusCode: e.Status); }
    catch (DbUpdateException e) when (e.InnerException is SqlException s && (s.Number == 2601 || s.Number == 2627)) { return Results.Conflict(new { message = "Request already processing. Retry with the same request ID." }); }
    catch (SqlException e) when (e.Number == 1205) { return Results.Conflict(new { message = "Another checkout overlapped. Please retry." }); }
}).RequireRateLimiting("checkout");
app.MapGet("/api/orders/{id:guid}", async (Guid id, ShopDb db, CancellationToken ct) => { var o = await db.Orders.AsNoTracking().Include(o => o.Items).SingleOrDefaultAsync(o => o.Id == id, ct); return o is null ? Results.NotFound(new { message = "Order not found." }) : Results.Ok(CheckoutService.ToDto(o)); });
app.MapFallback("/api/{**path}", () => Results.NotFound()); app.MapFallbackToFile("index.html");
if (args.Contains("--init") || args.Contains("--schema"))
{
    using var scope = app.Services.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<ShopDb>();
    if (args.Contains("--schema")) Console.WriteLine(db.Database.GenerateCreateScript()); else await db.Database.EnsureCreatedAsync();
    return;
}
app.Run();
public partial class Program { }
