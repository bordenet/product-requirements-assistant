# Product Requirements Assistant - Thick Client Launcher (PowerShell)
# Builds and runs both WebView2 and Electron clients side-by-side

[CmdletBinding()]
param(
    [switch]$Verbose,
    [switch]$Force,
    [ValidateSet('dev', 'prod', 'build')]
    [string]$Mode
)

$ErrorActionPreference = 'Stop'

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Import compact output module
Import-Module "$ScriptDir\scripts\lib\Compact.psm1" -Force

if ($Verbose) {
    Enable-VerboseMode
}

# Cleanup function
$script:WebViewProcess = $null
$script:ElectronProcess = $null

function Invoke-Cleanup {
    Write-Verbose-Line 'Shutting down clients...'
    if ($script:WebViewProcess) {
        Stop-Process -Id $script:WebViewProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($script:ElectronProcess) {
        Stop-Process -Id $script:ElectronProcess.Id -Force -ErrorAction SilentlyContinue
    }
}

# Register cleanup on exit
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Invoke-Cleanup } | Out-Null

# Print header
Write-CompactHeader 'Product Requirements Assistant - Thick Client Launcher'

# Check prerequisites
Start-Task 'Checking prerequisites'

try {
    $goVersion = go version 2>&1
    Write-Verbose-Line "Go: $goVersion"
} catch {
    Fail-Task 'Go not installed'
    exit 1
}

try {
    $nodeVersion = node --version 2>&1
    Write-Verbose-Line "Node.js: $nodeVersion"
} catch {
    Fail-Task 'Node.js not installed'
    exit 1
}

try {
    $npmVersion = npm --version 2>&1
    Write-Verbose-Line "npm: $npmVersion"
} catch {
    Fail-Task 'npm not installed'
    exit 1
}

Complete-Task 'Prerequisites checked'

# Interactive mode selection if not specified
if (-not $Mode) {
    Write-Host ''
    Write-Host 'Select mode:' -ForegroundColor Yellow
    Write-Host '  1) Development (quick start, no build)'
    Write-Host '  2) Production (build binaries, then run)'
    Write-Host '  3) Build only (no run)'
    Write-Host ''
    $choice = Read-Host 'Enter choice [1-3]'
    
    switch ($choice) {
        '1' { $Mode = 'dev' }
        '2' { $Mode = 'prod' }
        '3' { $Mode = 'build' }
        default {
            Write-Host 'Invalid choice' -ForegroundColor Red
            exit 1
        }
    }
    Write-Host ''
}

# Build if needed
if ($Mode -eq 'prod' -or $Mode -eq 'build') {
    Start-Task 'Building WebView2 client'
    Set-Location cmd\webview
    
    go mod tidy 2>&1 | Write-Verbose-Line
    New-Item -ItemType Directory -Force -Path ..\..\dist\webview | Out-Null
    
    $env:CGO_ENABLED = '1'
    go build -o ..\..\dist\webview\prd-assistant.exe . 2>&1 | Write-Verbose-Line
    
    Set-Location $ScriptDir
    Complete-Task 'WebView2 client built'
    
    Start-Task 'Building Electron client'
    Set-Location cmd\electron
    npm install --silent 2>&1 | Write-Verbose-Line
    
    Set-Location $ScriptDir
    Complete-Task 'Electron client built'
}

# Exit if build-only mode
if ($Mode -eq 'build') {
    Write-Host ''
    Write-CompactHeader "Build complete! $(Get-ElapsedTime)"
    exit 0
}

# Run clients
Write-Host ''
Write-CompactSection 'Starting Thick Clients'

Start-Task 'Starting WebView2 client'
if ($Mode -eq 'dev') {
    Set-Location cmd\webview
    $script:WebViewProcess = Start-Process -FilePath 'go' -ArgumentList 'run', '.' -PassThru -WindowStyle Hidden
    Set-Location $ScriptDir
} else {
    $script:WebViewProcess = Start-Process -FilePath 'dist\webview\prd-assistant.exe' -PassThru -WindowStyle Hidden
}
Write-Verbose-Line "PID: $($script:WebViewProcess.Id)"
Complete-Task 'WebView2 client started'

# Wait for ports
Start-Sleep -Seconds 3

Start-Task 'Starting Electron client'
Set-Location cmd\electron
$script:ElectronProcess = Start-Process -FilePath 'npm' -ArgumentList 'start' -PassThru -WindowStyle Hidden
Set-Location $ScriptDir
Write-Verbose-Line "PID: $($script:ElectronProcess.Id)"
Complete-Task 'Electron client started'

# Instructions
Write-Host ''
Write-CompactHeader 'Both clients running!'
Write-Host ''
Write-Host 'WebView2:  Native window (30-50MB bundle)'
Write-Host 'Electron:  Chromium window (150MB bundle)'
Write-Host ''
Write-Host 'Press Ctrl+C to stop both clients' -ForegroundColor Yellow

# Wait for user interrupt
try {
    while ($true) {
        Start-Sleep -Seconds 1

        # Check if processes are still running
        if ($script:WebViewProcess.HasExited -and $script:ElectronProcess.HasExited) {
            Warn-Task 'Both clients have exited'
            break
        }
    }
} finally {
    Invoke-Cleanup
    Show-Cursor
}

