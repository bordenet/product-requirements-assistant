#!/usr/bin/env pwsh
# Lint all PowerShell scripts using PSScriptAnalyzer

[Diagnostics.CodeAnalysis.SuppressMessageAttribute('PSAvoidUsingWriteHost', '')]
param()

$ErrorActionPreference = 'Continue'

$scripts = @(
    'run-thick-clients.ps1',
    'scripts\validate-monorepo.ps1',
    'scripts\setup-windows.ps1',
    'scripts\install-hooks.ps1',
    'scripts\lib\Compact.psm1',
    'lint-powershell.ps1'
)

$totalIssues = 0

foreach ($script in $scripts) {
    Write-Host "`n=== Analyzing $script ===" -ForegroundColor Cyan
    
    if (-not (Test-Path $script)) {
        Write-Host "File not found: $script" -ForegroundColor Red
        continue
    }
    
    $results = Invoke-ScriptAnalyzer -Path $script -Severity Warning,Error
    
    if ($results) {
        $results | Format-Table -Property Severity,Line,RuleName,Message -AutoSize
        $totalIssues += $results.Count
    } else {
        Write-Host "No issues found" -ForegroundColor Green
    }
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Total issues found: $totalIssues"

if ($totalIssues -gt 0) {
    exit 1
} else {
    Write-Host "All scripts passed linting!" -ForegroundColor Green
    exit 0
}

