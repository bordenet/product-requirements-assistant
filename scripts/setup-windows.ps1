#!/usr/bin/env pwsh
# Product Requirements Assistant - Windows Setup Script
# Optimized for minimal vertical space with running timer and caching

[CmdletBinding()]
[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param(
    [switch]$AutoYes,
    [switch]$Force,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

# Get script directory and navigate to project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir '..')
$ProjectRoot = Get-Location

# Import compact output module
Import-Module "$ScriptDir\lib\Compact.psm1" -Force

if ($VerbosePreference -eq 'Continue') {
    Enable-VerboseMode
}

# Show help
if ($Help) {
    Write-Host @"
Usage: .\setup-windows.ps1 [OPTIONS]

Setup script for Windows (non-WSL)

OPTIONS:
  -Verbose     Show detailed output (default: compact)
  -AutoYes     Automatically answer yes to prompts
  -Force       Force reinstall all dependencies
  -Help        Show this help message

EXAMPLES:
  .\setup-windows.ps1              # Fast setup, only install missing items
  .\setup-windows.ps1 -Verbose     # Verbose output
  .\setup-windows.ps1 -Force       # Force reinstall everything
  .\setup-windows.ps1 -Verbose -Force  # Verbose + force reinstall

PERFORMANCE:
  First run:  ~2-3 minutes (installs everything)
  Subsequent: ~5-10 seconds (checks only, skips installed)

"@
    exit 0
}

Write-CompactHeader 'Product Requirements Assistant - Windows Setup'

# Cache directory for tracking installed packages
$CacheDir = Join-Path $ProjectRoot '.setup-cache'
New-Item -ItemType Directory -Force -Path $CacheDir | Out-Null

# Helper: Check if package is cached
function Test-Cached {
    param([string]$Name)
    (Test-Path (Join-Path $CacheDir $Name)) -and (-not $Force)
}

# Helper: Mark package as cached
function Set-Cached {
    [Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseShouldProcessForStateChangingFunctions', '')]
    param([string]$Name)
    New-Item -ItemType File -Force -Path (Join-Path $CacheDir $Name) | Out-Null
}

# Helper: Test if command exists
function Test-CommandExist {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Helper: Test if port is in use
function Test-PortInUse {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connections
}

# Helper: Stop process on port
function Stop-PortProcess {
    [Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSUseShouldProcessForStateChangingFunctions', '')]
    param([int]$Port)

    if (Test-PortInUse $Port) {
        Write-Verbose-Line "Stopping process on port $Port..."
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 1
    }
}

################################################################################
# Step 1: Check Prerequisites
################################################################################

Start-Task 'Checking prerequisites'

# Check Go
if (-not (Test-CommandExist 'go')) {
    Stop-Task 'Go not installed'
    Write-Host ''
    Write-Host 'Install Go 1.21+ from: https://go.dev/dl/'
    exit 1
}
$goVersion = (go version) -replace 'go version go', '' -replace ' .*', ''
Write-Verbose-Line "Go $goVersion"

# Check Python
if (-not (Test-CommandExist 'python')) {
    Stop-Task 'Python not installed'
    Write-Host ''
    Write-Host 'Install Python 3.11+ from: https://www.python.org/downloads/'
    exit 1
}
$pythonVersion = (python --version) -replace 'Python ', ''
Write-Verbose-Line "Python $pythonVersion"

# Check Node.js
if (-not (Test-CommandExist 'node')) {
    Stop-Task 'Node.js not installed'
    Write-Host ''
    Write-Host 'Install Node.js 20+ from: https://nodejs.org/'
    exit 1
}
$nodeVersion = node --version
Write-Verbose-Line "Node.js $nodeVersion"

# Check npm
if (-not (Test-CommandExist 'npm')) {
    Stop-Task 'npm not installed'
    Write-Host ''
    Write-Host 'npm should come with Node.js. Reinstall Node.js.'
    exit 1
}
$npmVersion = npm --version
Write-Verbose-Line "npm $npmVersion"

Complete-Task 'Prerequisites checked'

################################################################################
# Step 2: Go Dependencies
################################################################################

if (-not (Test-Cached 'go-deps')) {
    Start-Task 'Installing Go dependencies'
    Set-Location backend
    go mod download 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
    Set-Location $ProjectRoot
    Set-Cached 'go-deps'
    Complete-Task 'Go dependencies installed'
} else {
    Skip-Task 'Go dependencies'
}

################################################################################
# Step 3: Python Virtual Environment
################################################################################

if (-not (Test-Path 'venv')) {
    Start-Task 'Creating Python virtual environment'
    python -m venv venv 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
    Complete-Task 'Virtual environment created'
} else {
    Skip-Task 'Python virtual environment'
}

################################################################################
# Step 4: Python Dependencies
################################################################################

$requirementsHash = (Get-FileHash requirements.txt -Algorithm SHA256).Hash
if (-not (Test-Cached "py-deps-$requirementsHash")) {
    Start-Task 'Installing Python dependencies'

    # Activate virtual environment
    & .\venv\Scripts\Activate.ps1

    if ($Force) {
        pip install -r requirements.txt --quiet 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
    } else {
        # Only install missing packages
        $installed = pip list --format=freeze
        Get-Content requirements.txt | ForEach-Object {
            $pkg = $_ -replace '==.*', '' -replace '>=.*', '' -replace '~=.*', ''
            if ($pkg -and -not ($installed -match "^$pkg==")) {
                Write-Verbose-Line "Installing $pkg..."
                pip install $_ --quiet 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
            }
        }
    }

    deactivate
    Set-Cached "py-deps-$requirementsHash"
    Complete-Task 'Python dependencies installed'
} else {
    Skip-Task 'Python dependencies'
}

################################################################################
# Step 5: Validation
################################################################################

Start-Task 'Validating setup'

Set-Location backend
try {
    go build -o nul . 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
    Write-Verbose-Line 'Go backend builds successfully'
} catch {
    Set-Location $ProjectRoot
    Stop-Task 'Go backend build failed'
    exit 1
}
Set-Location $ProjectRoot

& .\venv\Scripts\Activate.ps1
try {
    python -c "import flask, pillow" 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
    Write-Verbose-Line 'Python imports work'
} catch {
    deactivate
    Stop-Task 'Python imports failed'
    exit 1
}
deactivate

Complete-Task 'Setup validated'

################################################################################
# Step 6: Port Cleanup
################################################################################

Start-Task 'Checking ports'

$portsToCheck = @(
    @{Port=8080; Name='Backend'},
    @{Port=3000; Name='Frontend'}
)

$portsInUse = @()
foreach ($portInfo in $portsToCheck) {
    if (Test-PortInUse $portInfo.Port) {
        $portsInUse += $portInfo
    }
}

if ($portsInUse.Count -gt 0) {
    Write-TaskWarning "Ports in use: $($portsInUse.Port -join ', ')"

    if ($AutoYes) {
        Write-Verbose-Line 'Auto-confirming port cleanup (--AutoYes flag set)'
        $response = 'y'
    } else {
        Write-Host ''
        Write-Host 'The following ports are in use:'
        foreach ($portInfo in $portsInUse) {
            Write-Host "  - Port $($portInfo.Port) ($($portInfo.Name))"
        }
        Write-Host ''
        $response = Read-Host 'Stop these processes? (Y/n)'
        if (-not $response) { $response = 'y' }
    }

    if ($response -eq 'y' -or $response -eq 'Y') {
        foreach ($portInfo in $portsInUse) {
            Stop-PortProcess $portInfo.Port
        }
        Complete-Task 'Ports cleaned up'
    } else {
        Write-TaskWarning 'Ports not cleaned up'
    }
} else {
    Complete-Task 'Ports available'
}

################################################################################
# Step 7: Environment File
################################################################################

if (-not (Test-Path '.env')) {
    if (Test-Path '.env.example') {
        Start-Task 'Creating .env from .env.example'
        Copy-Item '.env.example' '.env'
        Complete-Task '.env created'
    } else {
        Write-TaskWarning '.env.example not found, skipping .env creation'
    }
} else {
    Write-Verbose-Line '.env exists'
}

################################################################################
# Done
################################################################################

Write-Host ''
Write-CompactHeader "Setup complete! $(Get-ElapsedTime)"
Write-Host ''
Write-Host 'To start the application:'
Write-Host '  .\venv\Scripts\Activate.ps1'
Write-Host '  cd backend'
Write-Host '  go run .'
Write-Host ''
Write-Host 'Or use the launcher scripts:'
Write-Host '  .\run-thick-clients.ps1 -Mode dev'
Write-Host ''
