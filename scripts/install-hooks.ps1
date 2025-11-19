#!/usr/bin/env pwsh
# Product Requirements Assistant - Install Git Hooks (Windows PowerShell)
# Installs pre-commit hooks for quality gates

[CmdletBinding()]
[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param()

$ErrorActionPreference = 'Stop'

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $ScriptDir '..')

# Import compact output module
Import-Module "$ScriptDir\lib\Compact.psm1" -Force

if ($VerbosePreference -eq 'Continue') {
    Enable-VerboseMode
}

Write-CompactHeader 'Installing Git Hooks'

################################################################################
# Step 1: Check Git Repository
################################################################################

Start-Task 'Checking git repository'

if (-not (Test-Path '.git')) {
    Stop-Task 'Not a git repository'
    Write-Host ''
    Write-Host 'Run: git init'
    exit 1
}

Complete-Task 'Git repository found'

################################################################################
# Step 2: Create Hooks Directory
################################################################################

$hooksDir = '.git\hooks'
if (-not (Test-Path $hooksDir)) {
    Start-Task 'Creating hooks directory'
    New-Item -ItemType Directory -Path $hooksDir | Out-Null
    Complete-Task 'Hooks directory created'
} else {
    Skip-Task 'Hooks directory'
}

################################################################################
# Step 3: Create Pre-Commit Hook
################################################################################

Start-Task 'Creating pre-commit hook'

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
if (Get-Command git -ErrorAction SilentlyContinue) {
    try {
        git update-index --chmod=+x "$hooksDir\pre-commit" 2>$null
        Write-Verbose-Line 'Set executable bit on pre-commit hook'
    } catch {
        Write-Verbose-Line 'Could not set executable bit (this is OK on Windows)'
    }
}

Complete-Task 'Pre-commit hook installed'

################################################################################
# Step 4: Make Check Scripts Executable
################################################################################

Start-Task 'Configuring check scripts'

if (Test-Path 'scripts\check-binaries.sh') {
    if (Get-Command git -ErrorAction SilentlyContinue) {
        try {
            git update-index --chmod=+x 'scripts\check-binaries.sh' 2>$null
            git update-index --chmod=+x 'scripts\check-secrets.sh' 2>$null
            Write-Verbose-Line 'Set executable bit on check scripts'
        } catch {
            Write-Verbose-Line 'Could not set executable bit (this is OK on Windows)'
        }
    }
}

Complete-Task 'Check scripts configured'

################################################################################
# Done
################################################################################

Write-Host ''
Write-CompactHeader "Installation complete! $(Get-ElapsedTime)"
Write-Host ''
Write-Host 'The following checks will run on every commit:'
Write-Host '  • Binary detection (prevents compiled files)'
Write-Host '  • Secret scanning (prevents credential leaks)'
Write-Host ''
Write-Host 'To bypass hooks in emergencies: git commit --no-verify'
Write-Host '(Only use --no-verify when absolutely necessary!)'
Write-Host ''

exit 0
