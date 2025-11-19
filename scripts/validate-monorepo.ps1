#!/usr/bin/env pwsh
# Product Requirements Assistant - Windows Validation Script
# Validates the entire monorepo: builds, lints, tests, and security scans

[CmdletBinding()]
[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param(
    [switch]$Quick,
    [switch]$Full,
    [switch]$Help
)

$ErrorActionPreference = 'Stop'

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir '..')

# Import compact output module
Import-Module "$ScriptDir\lib\Compact.psm1" -Force

if ($VerbosePreference -eq 'Continue') {
    Enable-VerboseMode
}

# Show help
if ($Help) {
    Write-Host @"
Usage: .\validate-monorepo.ps1 [OPTIONS]

Validates the Product Requirements Assistant monorepo

OPTIONS:
  -Quick       Quick validation (dependencies, build, lint, tests) ~1-2 min
  -Full        Full validation (quick + security scans, git status) ~3-5 min
  -Verbose     Show detailed output (default: compact)
  -Help        Show this help message

EXAMPLES:
  .\validate-monorepo.ps1 -Quick
  .\validate-monorepo.ps1 -Full
  .\validate-monorepo.ps1 -Full -Verbose

"@
    exit 0
}

if (-not $Quick -and -not $Full) {
    Write-Host 'Error: Please specify -Quick or -Full' -ForegroundColor Red
    Write-Host ''
    Write-Host 'Run: .\validate-monorepo.ps1 -Help'
    exit 1
}

$mode = if ($Full) { 'full' } else { 'quick' }
Write-CompactHeader "Product Requirements Assistant - Monorepo Validation ($mode)"

################################################################################
# Step 1: Validate Dependencies
################################################################################

Start-Task 'Validating dependencies'

if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    Stop-Task 'Go not found'
    Write-Host ''
    Write-Host 'Please install Go 1.21+'
    exit 1
}
$goVersion = (go version) -replace 'go version go', '' -replace ' .*', ''
Write-Verbose-Line "Go version: $goVersion"

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Stop-Task 'Python not found'
    Write-Host ''
    Write-Host 'Please install Python 3.9+'
    exit 1
}
$pythonVersion = (python --version) -replace 'Python ', ''
Write-Verbose-Line "Python version: $pythonVersion"

Complete-Task 'Dependencies validated'

################################################################################
# Step 2: Validate Project Structure
################################################################################

Start-Task 'Validating project structure'

$requiredDirs = @('backend', 'frontend', 'prompts', 'scripts', 'docs')
foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        Stop-Task "Required directory missing: $dir"
        exit 1
    }
}

$requiredFiles = @('README.md', 'Makefile', '.gitignore', '.env.example')
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Stop-Task "Required file missing: $file"
        exit 1
    }
}

Complete-Task 'Project structure validated'

################################################################################
# Step 3: Build Backend
################################################################################

Start-Task 'Building backend (Go)'

Push-Location backend
try {
    Write-Verbose-Line 'Running go mod tidy...'
    go mod tidy 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
    if ($LASTEXITCODE -ne 0) {
        throw 'go mod tidy failed'
    }

    Write-Verbose-Line 'Building backend...'
    go build -o prd-assistant.exe . 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
    if ($LASTEXITCODE -ne 0) {
        throw 'Backend build failed'
    }
    
    Remove-Item prd-assistant.exe -ErrorAction SilentlyContinue
    Pop-Location
    Complete-Task 'Backend build successful'
} catch {
    Pop-Location
    Stop-Task "Backend build failed: $_"
    exit 1
}

################################################################################
# Step 4: Lint Backend
################################################################################

Start-Task 'Linting backend (Go)'

Push-Location backend
try {
    if (Get-Command golangci-lint -ErrorAction SilentlyContinue) {
        Write-Verbose-Line 'Running golangci-lint...'
        golangci-lint run 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
        if ($LASTEXITCODE -ne 0) {
            throw 'golangci-lint found issues'
        }
        Pop-Location
        Complete-Task 'Backend linting passed'
    } else {
        Pop-Location
        Write-TaskWarning 'golangci-lint not installed (skipping)'
    }
} catch {
    Pop-Location
    Stop-Task "Backend linting failed: $_"
    exit 1
}

################################################################################
# Step 5: Test Backend
################################################################################

Start-Task 'Testing backend (Go)'

Push-Location backend
try {
    Write-Verbose-Line 'Running go test...'
    go test ./... 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
    if ($LASTEXITCODE -ne 0) {
        throw 'Backend tests failed'
    }
    Pop-Location
    Complete-Task 'Backend tests passed'
} catch {
    Pop-Location
    Stop-Task "Backend tests failed: $_"
    exit 1
}

################################################################################
# Step 6: Lint Frontend
################################################################################

Start-Task 'Linting frontend (Python)'

Push-Location frontend
try {
    if (Get-Command flake8 -ErrorAction SilentlyContinue) {
        Write-Verbose-Line 'Running flake8...'
        flake8 . --max-line-length=120 --exclude=venv 2>&1 | ForEach-Object { Write-Verbose-Line $_ }
        if ($LASTEXITCODE -ne 0) {
            throw 'flake8 found issues'
        }
        Pop-Location
        Complete-Task 'Frontend linting passed'
    } else {
        Pop-Location
        Write-TaskWarning 'flake8 not installed (skipping)'
    }
} catch {
    Pop-Location
    Stop-Task "Frontend linting failed: $_"
    exit 1
}

################################################################################
# Step 7: Security Scans (Full mode only)
################################################################################

if ($Full) {
    Start-Task 'Scanning for secrets'

    $secretPatterns = @(
        'password\s*=\s*[''"][^''"]+[''"]',
        'api[_-]?key\s*=\s*[''"][^''"]+[''"]',
        'secret\s*=\s*[''"][^''"]+[''"]',
        'token\s*=\s*[''"][^''"]+[''"]'
    )

    $foundSecrets = $false
    foreach ($pattern in $secretPatterns) {
        $results = Get-ChildItem -Recurse -File -Exclude @('*.pyc', '*.exe', '*.dll') |
            Select-String -Pattern $pattern -CaseSensitive:$false

        if ($results) {
            $foundSecrets = $true
            foreach ($result in $results) {
                Write-Verbose-Line "Potential secret: $($result.Path):$($result.LineNumber)"
            }
        }
    }

    if ($foundSecrets) {
        Write-TaskWarning 'Potential secrets found (review verbose output)'
    } else {
        Complete-Task 'No secrets found'
    }

    Start-Task 'Checking git status'

    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-TaskWarning 'Uncommitted changes detected'
        Write-Verbose-Line $gitStatus
    } else {
        Complete-Task 'Git working tree clean'
    }
}

################################################################################
# Done
################################################################################

Write-Host ''
Write-CompactHeader "Validation complete! $(Get-ElapsedTime)"
Write-Host ''
Write-Host 'All checks passed successfully!'
Write-Host ''


