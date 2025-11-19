# Product Requirements Assistant - Install Git Hooks (Windows PowerShell)
# Installs pre-commit hooks for quality gates

$ErrorActionPreference = "Stop"

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

function Write-OK {
    param($Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Info {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Warn {
    param($Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

Write-Header "Installing Git Hooks"

# Check if .git directory exists
if (-not (Test-Path ".git")) {
    Write-Err "Not a git repository. Run: git init"
    exit 1
}

# Create hooks directory if it doesn't exist
$hooksDir = ".git\hooks"
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir | Out-Null
}

# Create pre-commit hook
Write-Section "Creating pre-commit hook"

$preCommitContent = @'
#!/usr/bin/env bash
################################################################################
# Pre-Commit Hook - Quality Gate
################################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Pre-Commit Quality Gate"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for binaries
if [[ -f "$SCRIPT_DIR/scripts/check-binaries.sh" ]]; then
    bash "$SCRIPT_DIR/scripts/check-binaries.sh"
fi

# Check for secrets
if [[ -f "$SCRIPT_DIR/scripts/check-secrets.sh" ]]; then
    bash "$SCRIPT_DIR/scripts/check-secrets.sh"
fi

echo ""
echo "✅ Pre-commit checks passed!"
echo ""

exit 0
'@

Set-Content -Path "$hooksDir\pre-commit" -Value $preCommitContent -NoNewline

# On Windows, Git hooks need to be executable
# Git for Windows handles this automatically, but we'll ensure it
if (Get-Command git -ErrorAction SilentlyContinue) {
    git update-index --chmod=+x "$hooksDir\pre-commit" 2>$null
}

Write-OK "Pre-commit hook installed"

# Make check scripts executable (if on Git Bash/WSL)
Write-Section "Making check scripts executable"
if (Test-Path "scripts\check-binaries.sh") {
    if (Get-Command git -ErrorAction SilentlyContinue) {
        git update-index --chmod=+x "scripts\check-binaries.sh" 2>$null
        git update-index --chmod=+x "scripts\check-secrets.sh" 2>$null
    }
}
Write-OK "Check scripts configured"

Write-Header "Installation Complete"
Write-OK "Git hooks installed successfully!"
Write-Host ""
Write-Info "The following checks will run on every commit:"
Write-Info "  • Binary detection (prevents compiled files)"
Write-Info "  • Secret scanning (prevents credential leaks)"
Write-Host ""
Write-Info "To bypass hooks in emergencies: git commit --no-verify"
Write-Warn "Only use --no-verify when absolutely necessary!"
Write-Host ""

