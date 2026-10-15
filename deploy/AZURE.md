# Azure release runbook — prepared, not executed

Target: Azure App Service running the published ASP.NET Core application and Azure SQL Database. React is served by the same C# application. No separate frontend hosting or permissive CORS rule is needed.

1. Select the Azure subscription, resource group, region and spending limit. Confirm current App Service .NET 10 support in your region, or use the supplied container on an App Service Linux container host.
2. Provision a SQL logical server and an empty Azure SQL database. Configure the identity that will create the initial schema. Prefer Microsoft Entra authentication and managed identity for the application; do not put secrets in source control.
3. Configure SQL network access. Allow only your deployment machine for initialization and the application's required outbound addresses, or use private networking. Do not use an unrestricted internet firewall rule.
4. Set a temporary local `ConnectionStrings__Shop` with the Azure SQL endpoint and appropriate authorized credentials; use `Encrypt=True;TrustServerCertificate=False`. Run `dotnet run --project backend/Shop.Api -- --init` once against the fresh demo database. The initializer does not migrate an old schema.
5. Create a restricted database user for the application (SELECT on Products/Orders/OrderItems; INSERT on Orders/OrderItems; UPDATE on Products). Keep schema permissions with a separate deployment identity.
6. Run `npm ci` and `npm run build` in frontend. Run `dotnet publish backend/Shop.Api -c Release -o artifacts/shop` from the root. Copy frontend/dist contents into artifacts/shop/wwwroot.
7. Create or select App Service. Enable HTTPS-only. Set the `ConnectionStrings__Shop` application setting using managed identity or a Key Vault secret reference as appropriate. Never paste credentials into the README or a public issue.
8. ZIP the contents of artifacts/shop (not its parent directory) and deploy using App Service ZIP deployment. For a container instead, build the supplied Dockerfile, push to your authenticated container registry, and configure App Service to use that image.
9. Validate the live root page, `/api/health`, catalog, sample checkout and receipt. Verify SQL inventory, repeat the same request ID, and capture live deployment evidence. Record the actual URL only after these checks pass.
10. Save the release artifact and version, review logs, and rerun owner UAT. For rollback, redeploy the last compatible artifact; do not drop database tables. Plan database schema compatibility before future releases.

This runbook is not proof of a cloud deployment. Required inputs are the subscription, resource choices, authentication/authorization, and a hosting budget. The repository has no embedded Azure credentials.
