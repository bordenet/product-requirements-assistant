# Product Requirements Assistant - Windows Setup Script
# Installs dependencies and starts the application on Windows (non-WSL)

param(
    [switch]$AutoYes = $false
)

$ErrorActionPreference = "Stop"

# Color output functions
function Write-Step {
    param($Current, $Total, $Message)
    Write-Host ""
    Write-Host "[$Current/$Total] $Message" -ForegroundColor Cyan
}

function Write-OK {
    param($Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Err {
    param($Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

function Test-CommandExists {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Test-PortInUse {
    param($Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connections
}

function Stop-PortProcess {
    param($Port, $Name)
    if (Test-PortInUse $Port) {
        Write-Host "  Stopping process on port $Port..."
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 1
        Write-OK "Port $Port freed"
    } else {
        Write-OK "Port $Port available"
    }
}

$TotalSteps = 7
$CurrentStep = 0

# Step 1: Check dependencies
$CurrentStep++
Write-Step $CurrentStep $TotalSteps "Checking dependencies"

# Check for Chocolatey
if (-not (Test-CommandExists choco)) {
    Write-Err "Chocolatey not found"
    Write-Host ""
    Write-Host "Please install Chocolatey first:"
    Write-Host "  Run PowerShell as Administrator and execute:"
    Write-Host "  Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    exit 1
}
Write-OK "Chocolatey"

# Check/Install Go
if (-not (Test-CommandExists go)) {
    Write-Host "  Installing Go..."
    choco install golang -y | Out-Null
    refreshenv
    Write-OK "Go installed"
} else {
    $goVersion = (go version) -replace 'go version go', '' -replace ' .*', ''
    Write-OK "Go $goVersion"
}

# Check/Install Python
if (-not (Test-CommandExists python)) {
    Write-Host "  Installing Python..."
    choco install python -y | Out-Null
    refreshenv
    Write-OK "Python installed"
} else {
    $pythonVersion = (python --version) -replace 'Python ', ''
    Write-OK "Python $pythonVersion"
}

# Check/Install Make (via GnuWin32 or Make for Windows)
if (-not (Test-CommandExists make)) {
    Write-Host "  Installing Make..."
    choco install make -y | Out-Null
    refreshenv
    Write-OK "Make installed"
} else {
    Write-OK "Make"
}

# Step 2: Install project dependencies
$CurrentStep++
Write-Step $CurrentStep $TotalSteps "Installing project dependencies"

# Go dependencies
Push-Location backend
go mod download
Pop-Location
Write-OK "Go dependencies installed"

# Python dependencies
pip install -q -r requirements.txt
Write-OK "Python dependencies installed"

# Step 3: Run tests
$CurrentStep++
Write-Step $CurrentStep $TotalSteps "Running tests"

Push-Location backend
go test ./... | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Err "Tests failed"
    exit 1
}
Pop-Location
Write-OK "All tests passed"

# Step 4: Clean up existing processes
$CurrentStep++
Write-Step $CurrentStep $TotalSteps "Cleaning up existing processes"

$portsInUse = @()
if (Test-PortInUse 8080) { $portsInUse += "8080 (backend)" }
if (Test-PortInUse 8501) { $portsInUse += "8501 (frontend)" }
if (Test-PortInUse 8502) { $portsInUse += "8502 (frontend-alt)" }

if ($portsInUse.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  WARNING: The following ports are currently in use:" -ForegroundColor Yellow
    foreach ($port in $portsInUse) {
        Write-Host "    - Port $port"
    }
    Write-Host ""
    Write-Host "This script will stop the processes using these ports."
    Write-Host ""
    
    if (-not $AutoYes) {
        $response = Read-Host "Continue? [Y/n]"
        if ($response -and $response -notmatch '^[Yy]') {
            Write-Host "Setup cancelled by user."
            exit 0
        }
    }
}

Stop-PortProcess 8080 "backend"
Stop-PortProcess 8501 "frontend"
Stop-PortProcess 8502 "frontend-alt"

# Step 5: Start backend
$CurrentStep++
Write-Step $CurrentStep $TotalSteps "Starting backend"

$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    Set-Location backend
    go run .
}

# Wait for backend health check
$seconds = 0
Write-Host "  Waiting for backend" -NoNewline
while ($true) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host ""
            Write-OK "Backend ready (Job ID: $($backendJob.Id))"
            break
        }
    } catch {
        # Ignore errors during startup
    }

    if ($seconds -ge 30) {
        Write-Host ""
        Write-Err "Backend failed to start within 30 seconds"
        Write-Host ""
        Write-Host "Backend output:"
        Receive-Job $backendJob
        Stop-Job $backendJob
        Remove-Job $backendJob
        exit 1
    }

    Write-Host "." -NoNewline
    Start-Sleep -Seconds 1
    $seconds++
}

# Step 6: Run integration tests
$CurrentStep++
Write-Step $CurrentStep $TotalSteps "Running integration tests"

$testResult = & bash scripts/integration-test.sh 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Err "Integration tests failed"
    Write-Host $testResult
    Stop-Job $backendJob
    Remove-Job $backendJob
    exit 1
}
Write-OK "Integration tests passed"

# Step 7: Start frontend
$CurrentStep++
Write-Step $CurrentStep $TotalSteps "Starting frontend"

$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    streamlit run frontend/app.py --server.port=8501
}

Start-Sleep -Seconds 3
Write-OK "Frontend ready (Job ID: $($frontendJob.Id))"

# Application running
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Application running" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Backend:  http://localhost:8080"
Write-Host "Frontend: http://localhost:8501"
Write-Host ""
Write-Host "Stop: Press Ctrl+C"
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Cleanup handler
$cleanup = {
    Write-Host ""
    Write-Host "Shutting down..."
    if ($backendJob) {
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
        Write-Host "  Backend stopped"
    }
    if ($frontendJob) {
        Stop-Job $frontendJob -ErrorAction SilentlyContinue
        Remove-Job $frontendJob -ErrorAction SilentlyContinue
        Write-Host "  Frontend stopped"
    }
    Write-Host "Done."
}

# Register cleanup on Ctrl+C
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $cleanup | Out-Null

try {
    # Wait for user to press Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1

        # Check if jobs are still running
        if ($backendJob.State -ne 'Running') {
            Write-Err "Backend stopped unexpectedly"
            Receive-Job $backendJob
            break
        }
        if ($frontendJob.State -ne 'Running') {
            Write-Err "Frontend stopped unexpectedly"
            Receive-Job $frontendJob
            break
        }
    }
} finally {
    & $cleanup
}

