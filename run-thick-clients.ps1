# Product Requirements Assistant - Thick Client Launcher (PowerShell)
# Builds and runs both WebView2 and Electron clients side-by-side for comparison

$ErrorActionPreference = "Stop"

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Colors
function Write-Header { Write-Host $args[0] -ForegroundColor Blue }
function Write-Success { Write-Host $args[0] -ForegroundColor Green }
function Write-Warning { Write-Host $args[0] -ForegroundColor Yellow }
function Write-Error { Write-Host $args[0] -ForegroundColor Red }

# Cleanup function
$WebViewProcess = $null
$ElectronProcess = $null

function Cleanup {
    Write-Warning "`nShutting down clients..."
    if ($WebViewProcess) {
        Stop-Process -Id $WebViewProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($ElectronProcess) {
        Stop-Process -Id $ElectronProcess.Id -Force -ErrorAction SilentlyContinue
    }
}

# Register cleanup on Ctrl+C
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Cleanup }

# Print header
Write-Header "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Header "  Product Requirements Assistant - Thick Client Launcher"
Write-Header "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# Check prerequisites
Write-Warning "Checking prerequisites..."

try {
    $goVersion = go version
    Write-Success "✓ Go found: $goVersion"
} catch {
    Write-Error "✗ Go is not installed"
    exit 1
}

try {
    $nodeVersion = node --version
    Write-Success "✓ Node.js found: $nodeVersion"
} catch {
    Write-Error "✗ Node.js is not installed"
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Success "✓ npm found: $npmVersion"
} catch {
    Write-Error "✗ npm is not installed"
    exit 1
}

Write-Host ""

# Menu
Write-Warning "Select mode:"
Write-Host "  1) Development (quick start, no build)"
Write-Host "  2) Production (build binaries, then run)"
Write-Host "  3) Build only (no run)"
Write-Host ""
$choice = Read-Host "Enter choice [1-3]"

switch ($choice) {
    "1" { $Mode = "dev" }
    "2" { $Mode = "prod" }
    "3" { $Mode = "build" }
    default {
        Write-Error "Invalid choice"
        exit 1
    }
}

Write-Host ""

# Build if needed
if ($Mode -eq "prod" -or $Mode -eq "build") {
    Write-Warning "Building WebView2 client..."
    Set-Location cmd\webview

    # Ensure go.sum is up to date
    go mod tidy

    # Create dist directory if it doesn't exist
    New-Item -ItemType Directory -Force -Path ..\..\dist\webview | Out-Null

    # Build for Windows
    $env:CGO_ENABLED = "1"
    go build -o ..\..\dist\webview\prd-assistant.exe .
    Write-Success "✓ WebView2 built: dist\webview\prd-assistant.exe"

    Set-Location $ScriptDir
    Write-Host ""
    
    Write-Warning "Building Electron client..."
    Set-Location cmd\electron
    npm install --silent
    Write-Success "✓ Electron dependencies installed"
    
    Set-Location $ScriptDir
    Write-Host ""
}

# Exit if build-only mode
if ($Mode -eq "build") {
    Write-Success "Build complete!"
    exit 0
}

# Run clients
Write-Header "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Header "  Starting Thick Clients"
Write-Header "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# Start WebView2
Write-Warning "Starting WebView2 client..."
if ($Mode -eq "dev") {
    Set-Location cmd\webview
    $WebViewProcess = Start-Process -FilePath "go" -ArgumentList "run", "." -PassThru -WindowStyle Hidden
    Set-Location $ScriptDir
} else {
    $WebViewProcess = Start-Process -FilePath "dist\webview\prd-assistant.exe" -PassThru -WindowStyle Hidden
}
Write-Success "✓ WebView2 started (PID: $($WebViewProcess.Id))"
Write-Host ""

# Wait for ports to be available
Start-Sleep -Seconds 3

# Start Electron
Write-Warning "Starting Electron client..."
Set-Location cmd\electron
$ElectronProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -WindowStyle Hidden
Set-Location $ScriptDir
Write-Success "✓ Electron started (PID: $($ElectronProcess.Id))"
Write-Host ""

# Instructions
Write-Header "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Success "Both clients are running!"
Write-Host ""
Write-Host "WebView2:  Native window (30-50MB bundle)"
Write-Host "Electron:  Chromium window (150MB bundle)"
Write-Host ""
Write-Warning "Press Ctrl+C to stop both clients"
Write-Header "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Wait for user interrupt
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Check if processes are still running
        if ($WebViewProcess.HasExited -and $ElectronProcess.HasExited) {
            Write-Warning "Both clients have exited"
            break
        }
    }
} finally {
    Cleanup
}

