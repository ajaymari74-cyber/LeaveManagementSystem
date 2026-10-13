# Check Leave Management System Services Status
$Host.UI.RawUI.WindowTitle = "LMS Services Health Check"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   LEAVE MANAGEMENT SYSTEM - SERVICES HEALTH CHECK        " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

function Test-PortStatus {
    param([int]$Port, [string]$ServiceName)
    $conn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    if ($conn) {
        return @{
            Service = $ServiceName
            Port = $Port
            Status = "RUNNING"
            PID = ($conn | Select-Object -First 1).OwningProcess
            Color = "Green"
        }
    } else {
        return @{
            Service = $ServiceName
            Port = $Port
            Status = "STOPPED"
            PID = "-"
            Color = "Red"
        }
    }
}

$services = @(
    (Test-PortStatus -Port 3306 -ServiceName "MySQL Database (Port 3306)"),
    (Test-PortStatus -Port 5000 -ServiceName "Node.js Audit Service (Port 5000)"),
    (Test-PortStatus -Port 8080 -ServiceName "Spring Boot Backend (Port 8080)"),
    (Test-PortStatus -Port 3000 -ServiceName "Frontend Web Server (Port 3000)")
)

foreach ($s in $services) {
    if ($s.Status -eq "RUNNING") {
        Write-Host " [OK]   " -ForegroundColor Green -NoNewline
        Write-Host "$($s.Service.PadRight(35)) -> Status: RUNNING (PID: $($s.PID))" -ForegroundColor Green
    } else {
        Write-Host " [FAIL] " -ForegroundColor Red -NoNewline
        Write-Host "$($s.Service.PadRight(35)) -> Status: NOT RUNNING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "----------------- API Health & Connectivity -----------------" -ForegroundColor Cyan

# Test Audit Service
try {
    $auditHealth = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host " [OK] Audit Service Health: UP (MongoDB: $($auditHealth.mongoConnected))" -ForegroundColor Green
} catch {
    Write-Host " [WARN] Audit Service Endpoint: Unreachable or Offline" -ForegroundColor Yellow
}

# Test Spring Boot Auth / Leaves
try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $body = @{ email = "ajaydeveloper@gmail.com"; password = "ajay1234" } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $body -ContentType "application/json" -WebSession $session -TimeoutSec 3 -ErrorAction Stop
    Write-Host " [OK] Spring Boot API: Active (Authenticated: $($loginRes.data.email), Role: $($loginRes.data.role))" -ForegroundColor Green
} catch {
    Write-Host " [WARN] Spring Boot API: Unreachable or Login Failed" -ForegroundColor Yellow
}

# Test Frontend HTTP
try {
    $fe = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host " [OK] Frontend Web App: Active (Status: $($fe.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host " [WARN] Frontend Server: Unreachable" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
