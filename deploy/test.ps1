$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if(!$env:TEST_SQL_CONNECTION){throw 'Set TEST_SQL_CONNECTION to a disposable database ending in _Tests.'}
$env:ConnectionStrings__Shop=$env:TEST_SQL_CONNECTION
dotnet test backend/Shop.Tests --logger 'trx;LogFileName=backend-tests.trx' --results-directory evidence
if($LASTEXITCODE -ne 0){throw 'Backend tests failed'}
Push-Location frontend
try {npm ci;npm test;if($LASTEXITCODE -ne 0){throw 'Frontend tests failed'}} finally {Pop-Location}
