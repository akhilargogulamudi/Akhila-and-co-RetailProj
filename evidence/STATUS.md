# Verification status — 9 September 2026

| Area | Result | Evidence |
|---|---|---|
| C# build | PASS; 0 warnings, 0 errors | Executed .NET 10 SDK build |
| C# unit and SQL integration tests | PASS: 28/28, zero skipped | backend-tests.trx; backend-test-console.txt |
| React logic and component tests | PASS: 20/20 | frontend-tests.json |
| React production build | PASS | Vite production output generated |
| Local production deployment | PASS | deployment-smoke.json |
| SQL engine | SQL Server 2025 Developer 17.0.4030.1 | Real engine used by tests, no in-memory substitution |
| Checkout smoke | PASS: 2 mugs, $41 total, stock 24→22, receipt retrieved | deployment-smoke.json |
| Browser visual/mobile/keyboard QA | NOT EXECUTED | Supported preview runtime could not start the full stack |
| Owner UAT approval | PENDING | docs/UAT.md |
| Docker execution | NOT EXECUTED | Docker/Compose files prepared; no Docker runtime available |
| GitHub-hosted CI | NOT EXECUTED | Workflow prepared; not run on a connected GitHub repository |
| Public cloud deployment | PENDING | Needs .NET hosting and SQL account; deploy/AZURE.md |

Frontend component tests use jsdom, mocked HTTP responses and stubbed dialog open/close methods. They are not real-browser tests. Backend tests use WebApplicationFactory and a real disposable SQL Server database. The release smoke check uses real HTTP against the compiled ASP.NET Core application.

The temporary local services were stopped after verification. The localhost address used during testing is not an internet-accessible deployment. Reproduce it on your computer with deploy/publish-local.ps1.
