# Start All Leave Management System Services
$Host.UI.RawUI.WindowTitle = "Leave Management System Launcher"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     LAUNCHING LEAVE MANAGEMENT SYSTEM (ALL SERVICES)     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = Resolve-Path (Join-Path $PSScriptRoot "..")

# Helper function to check if a port is listening
function Check-Port {
    param([int]$Port)
    $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    return ($null -ne $conn)
}

# 1. Check MySQL
Write-Host "[1/4] Checking MySQL Database..." -ForegroundColor Yellow
if (Check-Port 3306) {
    Write-Host "      MySQL is already running on port 3306." -ForegroundColor Green
} else {
    Write-Host "      MySQL is not listening on port 3306. Attempting to start MySQL service..." -ForegroundColor Yellow
    try {
        Start-Service MySQL80 -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    } catch {}
    if (Check-Port 3306) {
        Write-Host "      MySQL service started successfully!" -ForegroundColor Green
    } else {
        Write-Host "      [WARNING] Please ensure MySQL is running on port 3306 with database 'leave_management'." -ForegroundColor Red
    }
}

# 2. Audit Service (Port 5000)
Write-Host "[2/4] Starting Audit Microservice (Port 5000)..." -ForegroundColor Yellow
if (Check-Port 5000) {
    Write-Host "      Audit service is already running on port 5000." -ForegroundColor Green
} else {
    $auditDir = Join-Path $rootPath "backend\audit-service"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$auditDir'; Write-Host 'Starting LMS Audit Service (Port 5000)...' -ForegroundColor Cyan; node server.js"
    Write-Host "      Audit service process launched." -ForegroundColor Green
}

# 3. Spring Boot Backend (Port 8080)
Write-Host "[3/4] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
if (Check-Port 8080) {
    Write-Host "      Spring Boot backend is already running on port 8080." -ForegroundColor Green
} else {
    $springDir = Join-Path $rootPath "backend\spring-boot"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$springDir'; Write-Host 'Starting LMS Spring Boot API (Port 8080)...' -ForegroundColor Cyan; .\mvnw.cmd spring-boot:run"
    Write-Host "      Spring Boot startup initiated (may take ~10-15 seconds)..." -ForegroundColor Green
}

# 4. Frontend Server (Port 3000)
Write-Host "[4/4] Starting Frontend Web Server (Port 3000)..." -ForegroundColor Yellow
if (Check-Port 3000) {
    Write-Host "      Frontend server is already running on port 3000." -ForegroundColor Green
} else {
    $frontendDir = Join-Path $rootPath "frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; Write-Host 'Starting LMS Frontend Web Server (Port 3000)...' -ForegroundColor Cyan; node server.js"
    Write-Host "      Frontend server launched." -ForegroundColor Green
}

Write-Host ""
Write-Host "Waiting 5 seconds for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Run status check
& (Join-Path $PSScriptRoot "check-services.ps1")

Write-Host ""
Write-Host "Opening application in browser: http://localhost:3000" -ForegroundColor Cyan
Start-Process "http://localhost:3000"
