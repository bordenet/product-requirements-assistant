#!/usr/bin/env pwsh
# Test all PowerShell scripts to verify they work correctly

[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param()

$ErrorActionPreference = 'Continue'

Write-Host "`n=== Testing PowerShell Scripts ===" -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# Test 1: Lint all scripts
Write-Host "Test 1: Linting all scripts..." -ForegroundColor Yellow
$lintResult = & .\lint-powershell.ps1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ All scripts pass linting" -ForegroundColor Green
} else {
    Write-Host "  ✗ Linting failed" -ForegroundColor Red
    $allPassed = $false
}

# Test 2: install-hooks.ps1 help
Write-Host "`nTest 2: install-hooks.ps1 (dry run)..." -ForegroundColor Yellow
try {
    $output = & .\scripts\install-hooks.ps1 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ install-hooks.ps1 works" -ForegroundColor Green
    } else {
        Write-Host "  ✗ install-hooks.ps1 failed with exit code $LASTEXITCODE" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  ✗ install-hooks.ps1 threw exception: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 3: setup-windows.ps1 help
Write-Host "`nTest 3: setup-windows.ps1 -Help..." -ForegroundColor Yellow
try {
    $output = & .\scripts\setup-windows.ps1 -Help 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ setup-windows.ps1 -Help works" -ForegroundColor Green
    } else {
        Write-Host "  ✗ setup-windows.ps1 -Help failed" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  ✗ setup-windows.ps1 -Help threw exception: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 4: validate-monorepo.ps1 help
Write-Host "`nTest 4: validate-monorepo.ps1 -Help..." -ForegroundColor Yellow
try {
    $output = & .\scripts\validate-monorepo.ps1 -Help 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ validate-monorepo.ps1 -Help works" -ForegroundColor Green
    } else {
        Write-Host "  ✗ validate-monorepo.ps1 -Help failed" -ForegroundColor Red
        $allPassed = $false
    }
} catch {
    Write-Host "  ✗ validate-monorepo.ps1 -Help threw exception: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 5: Compact module loads
Write-Host "`nTest 5: Compact.psm1 module loads..." -ForegroundColor Yellow
try {
    Import-Module .\scripts\lib\Compact.psm1 -Force
    $functions = @('Start-Task', 'Complete-Task', 'Stop-Task', 'Write-TaskWarning', 'Skip-Task', 'Write-Verbose-Line', 'Write-CompactHeader', 'Write-CompactSection', 'Enable-VerboseMode', 'Show-Cursor', 'Get-ElapsedTime')
    $allFunctionsExist = $true
    foreach ($func in $functions) {
        if (-not (Get-Command $func -ErrorAction SilentlyContinue)) {
            Write-Host "  ✗ Function $func not exported" -ForegroundColor Red
            $allFunctionsExist = $false
        }
    }
    if ($allFunctionsExist) {
        Write-Host "  ✓ Compact.psm1 loads and exports all functions" -ForegroundColor Green
    } else {
        $allPassed = $false
    }
} catch {
    Write-Host "  ✗ Compact.psm1 failed to load: $_" -ForegroundColor Red
    $allPassed = $false
}

# Test 6: UTF-8 BOM check
Write-Host "`nTest 6: UTF-8 BOM present in all scripts..." -ForegroundColor Yellow
$scriptsToCheck = @(
    'run-thick-clients.ps1',
    'scripts\validate-monorepo.ps1',
    'scripts\setup-windows.ps1',
    'scripts\install-hooks.ps1',
    'scripts\lib\Compact.psm1'
)
$allHaveBOM = $true
foreach ($script in $scriptsToCheck) {
    $bytes = [System.IO.File]::ReadAllBytes($script)
    if ($bytes[0] -ne 0xEF -or $bytes[1] -ne 0xBB -or $bytes[2] -ne 0xBF) {
        Write-Host "  ✗ $script missing UTF-8 BOM" -ForegroundColor Red
        $allHaveBOM = $false
    }
}
if ($allHaveBOM) {
    Write-Host "  ✓ All scripts have UTF-8 BOM" -ForegroundColor Green
} else {
    $allPassed = $false
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "All tests passed! ✓" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed! ✗" -ForegroundColor Red
    exit 1
}

