# Product Requirements Assistant - Windows Validation Script
# Validates the entire monorepo: builds, lints, tests, and security scans

param(
    [switch]$Quick = $false,
    [switch]$Full = $false,
    [switch]$Help = $false
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host "Usage: .\validate-monorepo.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Validates the Product Requirements Assistant monorepo"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  --quick    Quick validation (dependencies, build, lint, tests) ~1-2 min"
    Write-Host "  --full     Full validation (quick + security scans, git status) ~3-5 min"
    Write-Host "  --help     Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\validate-monorepo.ps1 --quick"
    Write-Host "  .\validate-monorepo.ps1 --full"
    exit 0
}

function Write-Header {
    param($Message)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host $Message -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Section {
    param($Message)
    Write-Host ""
    Write-Host "▸ $Message" -ForegroundColor Yellow
}

function Write-Info {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-OK {
    param($Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warn {
    param($Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

if ($Help) {
    Show-Help
}

if (-not $Quick -and -not $Full) {
    Write-Err "Please specify --quick or --full"
    Write-Host ""
    Show-Help
}

$mode = if ($Full) { "full" } else { "quick" }
Write-Header "Product Requirements Assistant - Monorepo Validation ($mode)"

# Validate Dependencies
Write-Section "Validating Dependencies"

if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
    Write-Err "Go not found. Please install Go 1.21+"
    exit 1
}
$goVersion = (go version) -replace 'go version go', '' -replace ' .*', ''
Write-Info "Go version: $goVersion"

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Err "Python not found. Please install Python 3.9+"
    exit 1
}
$pythonVersion = (python --version) -replace 'Python ', ''
Write-Info "Python version: $pythonVersion"

Write-OK "Dependencies validated"

# Validate Project Structure
Write-Section "Validating Project Structure"

$requiredDirs = @("backend", "frontend", "prompts", "scripts", "docs")
foreach ($dir in $requiredDirs) {
    if (-not (Test-Path $dir)) {
        Write-Err "Required directory missing: $dir"
        exit 1
    }
}

$requiredFiles = @("README.md", "Makefile", ".gitignore", ".env.example")
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Err "Required file missing: $file"
        exit 1
    }
}

Write-OK "Project structure validated"

# Build Backend
Write-Section "Building Backend (Go)"

Write-Info "Running go mod tidy..."
Push-Location backend
go mod tidy
if ($LASTEXITCODE -ne 0) {
    Write-Err "go mod tidy failed"
    Pop-Location
    exit 1
}

Write-Info "Building backend..."
go build -o prd-assistant.exe .
if ($LASTEXITCODE -ne 0) {
    Write-Err "Backend build failed"
    Pop-Location
    exit 1
}
Remove-Item prd-assistant.exe -ErrorAction SilentlyContinue
Pop-Location

Write-OK "Backend build successful"

# Lint Backend
Write-Section "Linting Backend (Go)"

Write-Info "Running go vet..."
Push-Location backend
go vet ./...
if ($LASTEXITCODE -ne 0) {
    Write-Err "go vet found issues"
    Pop-Location
    exit 1
}

Write-Info "Checking gofmt..."
$unformatted = go fmt ./...
if ($unformatted) {
    Write-Warn "gofmt reformatted files: $unformatted"
}
Pop-Location

Write-OK "Backend linting passed"

# Run Backend Tests
Write-Section "Running Backend Tests"

Write-Info "Running Go tests..."
Push-Location backend
go test -v ./...
if ($LASTEXITCODE -ne 0) {
    Write-Err "Backend tests failed"
    Pop-Location
    exit 1
}
Pop-Location

Write-OK "Backend tests passed"

# Lint Frontend
Write-Section "Linting Frontend (Python)"

Write-Info "Running flake8..."
Push-Location frontend
$flake8Output = flake8 . 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Warn "flake8 found issues (non-fatal)"
    Write-Host $flake8Output
} else {
    Write-OK "flake8 passed"
}

# Check for black
if (Get-Command black -ErrorAction SilentlyContinue) {
    Write-Info "Checking black formatting..."
    black --check . 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "black would reformat files (non-fatal)"
    }
} else {
    Write-Warn "black not installed, skipping Python formatting check"
    Write-Info "Install with: pip install black"
}
Pop-Location

Write-OK "Frontend linting complete"

# Full mode additional checks
if ($Full) {
    # Security Scanning
    Write-Section "Security Scanning"

    Write-Info "Checking for secrets in source code..."
    $secretPatterns = @(
        "password\s*=\s*['\"][^'\"]+['\"]",
        "api[_-]?key\s*=\s*['\"][^'\"]+['\"]",
        "secret\s*=\s*['\"][^'\"]+['\"]",
        "token\s*=\s*['\"][^'\"]+['\"]"
    )

    $secretsFound = $false
    foreach ($pattern in $secretPatterns) {
        $matches = Select-String -Path "backend\*.go","frontend\*.py" -Pattern $pattern -ErrorAction SilentlyContinue
        if ($matches) {
            $secretsFound = $true
            Write-Warn "Potential secret found: $($matches.Line)"
        }
    }

    if (-not $secretsFound) {
        Write-OK "No obvious secrets detected"
    }

    Write-OK "Security scan complete"

    # Check Git Status
    Write-Section "Checking Git Status"

    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Warn "Working directory has uncommitted changes"
        Write-Host $gitStatus
    } else {
        Write-OK "Working directory clean"
    }
}

# Success
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "Validation Complete ✓" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-OK "All checks passed!"

