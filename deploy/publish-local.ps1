$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if(!$env:ConnectionStrings__Shop){throw 'Set ConnectionStrings__Shop first. See README.md.'}
Push-Location frontend
try {npm ci; if($LASTEXITCODE -ne 0){throw 'npm ci failed'}; npm run build;if($LASTEXITCODE -ne 0){throw 'React build failed'}} finally {Pop-Location}
dotnet publish backend/Shop.Api -c Release -o artifacts/shop
if($LASTEXITCODE -ne 0){throw 'API publish failed'}
New-Item -ItemType Directory -Force artifacts/shop/wwwroot | Out-Null
Copy-Item frontend/dist/* artifacts/shop/wwwroot -Recurse -Force
Push-Location artifacts/shop
try {
 dotnet Shop.Api.dll --init
 if($LASTEXITCODE -ne 0){throw 'Database setup failed'}
 $env:ASPNETCORE_ENVIRONMENT='Production'
 $env:ASPNETCORE_URLS='http://localhost:5080'
 dotnet Shop.Api.dll
} finally {Pop-Location}
