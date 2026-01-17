# Setup Database Script for Class-Lib
# This script creates the MySQL database and tables

$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$schemaFile = Join-Path $PSScriptRoot "server\src\sql\schema.sql"

if (-not (Test-Path $mysqlPath)) {
    Write-Host "ERROR: MySQL not found at $mysqlPath" -ForegroundColor Red
    Write-Host "Please install MySQL or update the mysqlPath variable in this script." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $schemaFile)) {
    Write-Host "ERROR: Schema file not found at $schemaFile" -ForegroundColor Red
    exit 1
}

Write-Host "Creating database and tables..." -ForegroundColor Green
Write-Host "You will be prompted for your MySQL root password." -ForegroundColor Yellow
Write-Host ""

# Read the schema file and pipe it to MySQL
Get-Content $schemaFile | & $mysqlPath -u root -p

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Database 'class_lib' created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Make sure server/.env file exists with your MySQL password" -ForegroundColor White
    Write-Host "2. Run: npm run server:seed" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✗ Error creating database. Check your MySQL password and try again." -ForegroundColor Red
}
