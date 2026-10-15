# The Akhila Edit
## A practical React, C# and SQL Server retail project

Prepared for **Akhila Gogulamudi**. This is a personal learning and portfolio project built with AI assistance. It is deliberately small enough to understand end to end. It does not claim to be a TJX system or reproduce confidential employer work.

## 1. What the application does

The shop sells six fictional everyday essentials: a backpack, mug, journal, bottle, lamp and headphones. Customers can browse, search, filter by category, sort by price, inspect a product, add available items to a bag, change quantities and place a demo order. The headphones begin out of stock so you can demonstrate that state. No card details, shipping address, real payment or delivery are involved. Use a sample name at checkout.

The browser remembers product IDs and quantities in local storage. The API reads actual prices from SQL Server at checkout. A successful checkout creates an order and its order lines, reduces inventory, and returns a receipt. If any item is unavailable, the whole database transaction rolls back.

Demo rules: at most 10 units of a product per order; up to 20 distinct lines per request; $5 demo shipping below $75 and free demo shipping at or above $75. Totals exclude tax. These are project rules, not a representation of actual sales-tax treatment.

## 2. The three parts, in simple language

**React is the shop counter.** It shows products and responds to clicks. Components and state decide what the customer sees. It is written in JavaScript/JSX and styled with CSS.

**ASP.NET Core is the order desk.** It receives HTTP requests, validates inputs, applies rules and asks the database to read or save information. It is written in C#. This project uses modern .NET 10 and ASP.NET Core, rather than the older Windows-only .NET Framework 4.x.

**SQL Server is the permanent record.** It stores products, stock, orders and order lines. Entity Framework Core translates C# data access into SQL. It is a data-access library, not a replacement database.

In development, React runs on port 5173 and forwards `/api` requests to the C# service on port 5080. In a release build, ASP.NET Core serves both the compiled React files and the API from one origin. The browser never connects directly to SQL Server and never receives the database password.

## 3. Where to start reading the code

| File | Responsibility |
|---|---|
| `frontend/src/main.jsx` | Storefront, dialogs, cart display and checkout form |
| `frontend/src/cart.js` | Cart validation, quantity changes and estimated totals |
| `frontend/src/api.js` | HTTP calls and readable error messages |
| `frontend/src/style.css` | Layout, colors, responsive rules and focus states |
| `backend/Shop.Api/Program.cs` | App setup, dependency injection, HTTP endpoints and middleware |
| `backend/Shop.Api/Models.cs` | Entities, request/response DTOs and input rules |
| `backend/Shop.Api/ShopDb.cs` | EF Core mappings, indexes, constraints and sample products |
| `backend/Shop.Api/CheckoutService.cs` | Checkout transaction, stock updates and retry handling |
| `backend/Shop.Tests` | C# unit tests and real SQL Server integration tests |
| `database/001-schema.sql` | Generated initial schema and sample catalog, when generation is verified |
| `deploy/publish-local.ps1` | Build and run a local release on Windows |
| `compose.yaml` and `Dockerfile` | Container packaging and local deployment configuration |
| `.github/workflows/ci.yml` | Prepared automated build/test workflow |
| `evidence` | Actual execution evidence; do not confuse prepared tests with passed tests |

Start with `Models.cs`, then `ShopDb.cs`, then `CheckoutService.cs`. Read `Program.cs` after you understand those responsibilities. Finish with the React request flow.

## 4. Database design

There are three business tables.

**Products:** Id, Name, Category, Description, Price, Stock and Image. `Price` is a SQL decimal, not floating-point. `Stock` is an integer with a database constraint preventing negative values. The category/ID index supports category browsing with stable ordering.

**Orders:** Id (random GUID), RequestId, Fingerprint, CustomerName, CreatedAt, Subtotal, Shipping and Total. A unique index on RequestId prevents two persisted orders with the same checkout request ID. CreatedAt is stored as UTC. The API omits the sample customer name from receipts.

**OrderItems:** Id, OrderId, ProductId, ProductName, UnitPrice and Quantity. One order has many order items. ProductId points to a product. ProductName and UnitPrice are snapshots: changing a catalog price later must not rewrite an old order's receipt. A foreign key prevents an order line referring to a nonexistent product. Quantities have a 1–10 database check.

This version uses EF Core `EnsureCreatedAsync()` for an explicit first-time setup through `--init`. It is suitable for a fresh, isolated demo database. It does **not** upgrade an existing schema. Do not mix it with EF migrations later without a planned baseline transition. For the next version, adopt migrations before changing a database that contains data you want to keep.

Never point integration tests at your main database. Tests require a database name ending in `_Tests` and recreate its contents for isolation.

## 5. One checkout, step by step

1. The customer adds two mugs. React stores `{id: 2, quantity: 2}` in the bag. It shows an estimate of $36 plus $5 demo shipping.
2. The customer enters a sample name and selects **Place demo order**.
3. React creates a random request ID and sends product IDs and quantities to `POST /api/orders`. It does not send an authoritative price or total.
4. The C# endpoint passes the request to `CheckoutService` through dependency injection. Validation rejects empty names, empty bags, duplicate lines, null lines, invalid IDs and quantities outside 1–10.
5. The service creates a fingerprint from the normalized name and sorted cart. It starts a database transaction.
6. It checks whether RequestId was already saved. If the fingerprint matches, it returns that receipt. If it does not match, it returns HTTP 409.
7. For each product, the database executes a conditional stock decrement: update the product only where its stock is at least the requested quantity. A zero-row result means checkout cannot continue.
8. The service reads the product price from SQL Server. It builds order lines using those prices, calculates totals, and inserts the order and lines.
9. The transaction commits. If any earlier step throws, disposing the transaction rolls back all earlier stock updates.
10. React displays the receipt, clears the bag and refreshes the catalog.

A concrete example: mugs start at 24 units. Buying two should produce a $41 demo total, create one order with one line, and leave 22 mugs. Repeating the same request must return the same order and leave stock at 22.

## 6. Why the inventory logic is worth discussing

A weak approach reads stock, checks it in C#, then updates it later. Two requests can both read the last unit before either changes it. This project instead uses one conditional database UPDATE. SQL Server coordinates concurrent updates to the row. The entire checkout uses a transaction, so a failure on the second item restores a decrement already performed on the first.

Products are processed in ascending ID order to reduce deadlock risk. The service still handles SQL Server deadlock error 1205 with a conflict response. This is a practical safeguard, not a claim that deadlocks are impossible. Unique request IDs and transaction rollback also protect against duplicate order writes. A concurrent duplicate may initially return 409; retrying the same request after the winner commits returns the saved receipt.

The UI disables the submit button during checkout. That improves usability, but database constraints and idempotency provide the actual protection. Client controls alone are not a reliable security boundary.

## 7. API reference

| Method and path | Purpose | Important outcomes |
|---|---|---|
| GET `/api/health` | Check database connectivity | 200 healthy; 503 unavailable |
| GET `/api/products` | Browse products | Search, category, price sort and page parameters |
| GET `/api/products/{id}` | Read one product | 200 product; 404 missing |
| POST `/api/orders` | Validate and place a demo order | 200 receipt; 400 invalid input; 409 conflict; 429 rate limit |
| GET `/api/orders/{id}` | Retrieve a receipt | 200 receipt; 404 missing |
| GET `/openapi/v1.json` | Machine-readable API contract | Import into Postman |

Example product query: `/api/products?category=Desk&sort=price-asc&page=1&pageSize=2`.

Example order body:

```json
{
  "requestId": "d4b40dc1-020c-4e06-89e7-f47e9fa6c689",
  "customerName": "Sample Shopper",
  "items": [{"productId": 2, "quantity": 2}]
}
```

Use a fresh GUID for a genuinely new order. Reuse the previous GUID only to retry the same request. A receipt ID is unguessable but functions as a bearer capability; someone with that URL can read the limited receipt. There is no customer login or private account history in this version.

## 8. Run it on your Windows computer

You previously worked with Visual Studio 2026 and SQL Server 2025 Developer. This project uses that background. You also need the .NET 10 SDK and Node.js 22 or later compatible with the locked frontend dependencies. Check `dotnet --version`, `node --version` and `npm --version` first. Keep Node 22 for consistency with the supplied container and CI configuration.

Extract the ZIP to a short path such as `C:\Projects\Akhila_Edit`. Open that folder in VS Code, or open the API project in Visual Studio. Confirm your SQL Server service is running. Use the server name that already works in SSMS. A default local instance is commonly `localhost`; a named instance needs its actual name.

Open PowerShell in the project root:

```powershell
$env:ConnectionStrings__Shop='Server=localhost;Database=AkhilaEdit;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'
dotnet restore backend/Shop.Api
dotnet run --project backend/Shop.Api -- --init
dotnet run --project backend/Shop.Api --urls http://localhost:5080
```

Integrated Security uses your Windows account. It needs permission to create the demo database for initialization. If you use SQL authentication, set your own username and password in the environment variable; never commit them. `TrustServerCertificate=True` is for local development with the local server's certificate, not the recommended setting for a cloud database.

Open a second PowerShell window in the project root:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. Leave both terminals running. Stop each with Ctrl+C when finished. You do not need a React backend: Vite's development proxy forwards API requests to C#.

## 9. Run the release build locally

From the project root, set the connection string as above, then run:

```powershell
./deploy/publish-local.ps1
```

The script compiles React, publishes C#, copies the frontend into `wwwroot`, initializes a fresh database if needed, and starts the release output. Open `http://localhost:5080`. This is a local deployment of the compiled application, not a public internet URL.

If PowerShell blocks scripts under your organization's policy, follow that policy; you can run the documented build commands individually instead of changing system-wide execution settings.

## 10. Docker deployment option

Install and start Docker Desktop with Linux containers. SQL Server's supplied container requires an x86-64 environment; this configuration is intended for a Windows x64 or Linux x64 host.

```powershell
Copy-Item .env.example .env
# Edit .env and choose your own strong SQL_PASSWORD.
docker compose up --build -d
```

Open `http://localhost:8080` after `http://localhost:8080/api/health` reports healthy. SQL Server is not published on a host port in this setup; only the shop binds to localhost. The initialization service waits for database readiness, then creates the schema and sample products. The shop starts after initialization succeeds.

`docker compose logs -f shop` shows API logs. `docker compose down` stops services while preserving the named data volume. Do not add `-v` unless you intentionally want to delete your demo data. The bundled SA account is a local demonstration convenience; use a separate restricted application identity for cloud hosting.

Docker configuration is supplied independently of whether Docker execution was available during verification. Check `evidence/STATUS.md` for the actual verification boundary.

## 11. Test it in layers

**Unit tests** exercise input validation, stable processing order and shipping thresholds without a database.

**SQL Server integration tests** create a separate test database, start the real ASP.NET Core application in a test host, send HTTP requests, and check database state. They cover catalog search/filter/sort, totals, stock changes, replayed requests, conflicting keys, rollback, concurrency, missing routes and client price tampering. These tests fail explicitly if SQL Server is unavailable; they do not silently substitute SQLite or an in-memory provider.

**Frontend tests** verify stored-cart recovery, quantity rules, removal, unavailable products, subtotal and shipping. Component/browser checks are recorded separately so a passing cart function is not mistaken for a passing user journey.

Run the C# tests on Windows:

```powershell
$env:TEST_SQL_CONNECTION='Server=localhost;Database=AkhilaEdit_Tests;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'
./deploy/test.ps1
```

The test script sets the API connection to the test database. Afterward, set your main connection string again before running the shop. Test output belongs in `evidence`. The prepared CI workflow runs the same suites with a disposable SQL Server service when you upload the repository to GitHub. A workflow file being present does not mean a cloud CI run already happened.

## 12. User acceptance testing

UAT asks whether the application behaves as you expect as its owner. Automated tests help, but they cannot provide your personal acceptance. Use `docs/UAT.md`. Perform each user journey, record the result, and write your name and date in the sign-off section only after you have actually reviewed it. Agent-executed checks are labeled as such.

Use sample data. Test both happy paths and failures: a successful mug order, an empty bag, unavailable headphones, increasing beyond available stock, filtering to no results, and retrying after a failure. Inspect the SQL data after checkout to connect the UI result to the backend behavior.

## 13. Inspect the database in SSMS

Connect to your server and expand Databases → AkhilaEdit → Tables. Run:

```sql
SELECT Id, Name, Price, Stock FROM dbo.Products ORDER BY Id;
SELECT Id, CreatedAt, Subtotal, Shipping, Total FROM dbo.Orders ORDER BY CreatedAt DESC;
SELECT OrderId, ProductName, Quantity, UnitPrice
FROM dbo.OrderItems ORDER BY Id DESC;
```

Compare these results before and after checkout. `database/inspection.sql` includes a joined receipt query and an inventory integrity check. Read an actual execution plan before claiming an index improved performance; a six-product dataset is too small to support meaningful scalability claims.

## 14. Public hosting: the remaining external step

A real public deployment of this stack needs a .NET-capable host and SQL Server or Azure SQL. The default Sites runtime executes JavaScript Workers; it cannot execute this C# API or host SQL Server. Publishing only the React files there would not be a complete working deployment, so this project does not present a mock storefront as a deployed .NET application.

The intended cloud destination is Azure App Service plus Azure SQL. Choose an existing or new Azure subscription and budget before provisioning paid services. This package includes a release deployment runbook in `deploy/AZURE.md`. No subscription, cloud database, or paid hosting account has been provisioned by this project. A live cloud link remains pending until the account is available and the actual release is deployed and tested there.

## 15. Security and scope decisions

No real payment processor, customer accounts, admin console, email delivery, taxes or fulfillment are implemented. No login means no private order-history screen. The API limits checkout requests and request body size, returns friendly errors, uses parameterized EF Core data access, validates inputs, and uses database constraints. The receipt exposes only order lines and totals.

The application is a portfolio demo, not a production commerce service. Before allowing real customers, add authentication and authorization, payment-provider verification and webhooks, secret management, an appropriate tax/fulfillment design, backups, monitoring, a data-retention policy and security review. Do not describe those as completed features.

The sample SQL runtime is Developer edition for development/testing; use the appropriate licensed SQL offering for actual production workloads. Azure SQL is a separate managed service.

## 16. How to make it genuinely your project

Start by running the application and tracing one request. Then make a change yourself, write a test for it, and commit it. Useful small improvements: add an in-stock-only filter, add a product category with seed data, implement a receipt copy button, or introduce EF migrations for version 2.

Keep a short development journal: what you changed, why, how you tested it, and what you learned. Record your actual contributions. You can accurately describe this as a personal project developed with AI assistance, which you reviewed, tested and extended after doing that work. Do not claim that the generated code was independently written by you or that it handled employer production traffic.

## 17. A five-minute interview demonstration

Minute 1: show the catalog, search and filters. Explain React state and the API contract.

Minute 2: add two mugs, show the bag estimate and place a sample order. Explain server-calculated prices.

Minute 3: show the new SQL order and reduced stock. Explain the three tables and price snapshots.

Minute 4: open the transaction and concurrency tests. Explain what fails if stock is read and updated separately.

Minute 5: show your test results and one change you made yourself. State the actual deployment status and the next improvement you would make.

## 18. Common problems and fixes

| Symptom | Check |
|---|---|
| Collection cannot load | Is the API on port 5080 running? Does `/api/health` succeed? |
| SQL login failed | Use the same instance/authentication that works in SSMS; check database permissions. |
| Database not found | Run the explicit `--init` step with a user allowed to create it. |
| Existing DB schema differs | EnsureCreated does not upgrade schemas. Use a new demo DB or plan a migration. |
| HTTPS certificate error locally | Check the documented local connection-string certificate setting. |
| Bag says stock changed | Refresh and reduce/remove the affected item. |
| Checkout returns 409 | Stock or request identity conflicted; inspect the response and retry the same unchanged request where appropriate. |
| Tests fail at setup | Confirm test DB name ends in `_Tests`, SQL Server is reachable, and test login can recreate it. |
| React page blank | Run `npm ci`, inspect the build output and browser console, and verify the API serves the built assets. |
| Docker SQL takes time | Wait for the health check and inspect `docker compose logs db`. |

## 19. Reference documentation

- [React: managing state](https://react.dev/learn/managing-state)
- [ASP.NET Core Minimal APIs](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis)
- [EF Core transactions](https://learn.microsoft.com/ef/core/saving/transactions)
- [EF Core EnsureCreated](https://learn.microsoft.com/ef/core/managing-schemas/ensure-created)
- [SQL Server Linux containers](https://learn.microsoft.com/sql/linux/quickstart-install-connect-docker)
- [Azure App Service .NET deployment](https://learn.microsoft.com/azure/app-service/quickstart-dotnetcore)

Always use the execution evidence bundled with this release for claims about this specific project. Documentation and prepared commands describe how to run it; they do not substitute for an actual successful test or deployment.
