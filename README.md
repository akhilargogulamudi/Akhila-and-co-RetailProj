# The Akhila Edit

A small retail portfolio project for **Akhila Gogulamudi**: React + C# / ASP.NET Core + SQL Server + Entity Framework Core. Built with AI assistance, with an emphasis on understanding and extending the backend yourself.

## Included

Six sample products; catalog search/filter/sort; product details; persistent bag; quantity controls; demo checkout; receipts; server-calculated prices; SQL transactions; conditional inventory updates; idempotent checkout requests; database constraints; OpenAPI; tests; release scripts; UAT plan; detailed guide.

No real payments, deliveries, customer accounts or admin panel. Use sample names. Prices and shipping are fictional demonstration data.

## Start here

Read **docs/Project_Guide.html** in a browser, or docs/Project_Guide.md. The guide explains every layer, the build process, SQL design, setup, tests, deployment, troubleshooting, and a five-minute interview demonstration.

### Windows with your existing SQL Server

Prerequisites: .NET 10 SDK, Node 22, SQL Server 2025 Developer running, and permission to create a dedicated demo database. Use your actual SSMS server name.

```powershell
$env:ConnectionStrings__Shop='Server=localhost;Database=AkhilaEdit;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'
dotnet run --project backend/Shop.Api -- --init
dotnet run --project backend/Shop.Api --urls http://localhost:5080
```

In another terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173. React's proxy sends API calls to C# on port 5080.

### Local release deployment

Set the same connection string, then run `./deploy/publish-local.ps1`. Open http://localhost:5080. This serves the compiled React app and API together.

### Docker option

Copy .env.example to .env, choose a strong personal SQL_PASSWORD, then run `docker compose up --build -d`. Open http://localhost:8080 when the database health check succeeds. Docker files are prepared but Docker execution was unavailable here.

### Tests

Set TEST_SQL_CONNECTION to a disposable SQL Server database named AkhilaEdit_Tests, then run `./deploy/test.ps1`. The tests recreate this database; never use your main database.

## Verified result

**48 tests passed**: 28 C# unit/real SQL Server integration tests and 20 frontend logic/component tests. The local compiled release passed catalog, health, checkout, stock and receipt HTTP checks. See evidence/STATUS.md for exact boundaries.

**Not complete:** real-browser visual checks, owner UAT approval, and public cloud deployment. Cloud hosting needs your Azure (or another .NET hosting) account and SQL database. Do not represent this as a live public store yet.

## Database initialization

The explicit `--init` command uses EF Core EnsureCreated for a fresh demo database. It does not migrate an existing schema. database/001-schema.sql is a generated alternative for an empty database; use one initialization route, not both. Introduce a migration baseline before evolving a database with data you wish to retain.

## Portfolio ownership

Use this as a personal learning project. Run it, review the code, make a change and record your work. Be accurate about AI assistance and your own contributions; this is not employer work or independently authored production experience.
