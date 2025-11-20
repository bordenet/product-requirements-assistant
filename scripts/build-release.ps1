#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build release binaries for all platforms

.DESCRIPTION
    Builds Go backend, WebView2 client, and Electron client for all supported platforms

.PARAMETER Version
    Version to build (e.g., "0.5.0"). If not specified, reads from RELEASES.md

.EXAMPLE
    .\scripts\build-release.ps1
    .\scripts\build-release.ps1 -Version "0.5.0"
#>

[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Version
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $PSScriptRoot

# Get version from RELEASES.md if not specified
if (-not $Version) {
    $releasesContent = Get-Content "$ProjectRoot\RELEASES.md" -Raw
    if ($releasesContent -match '\|\s*(\d+\.\d+\.\d+)\s*\|') {
        $Version = $Matches[1]
    } else {
        Write-Error "Could not determine version from RELEASES.md"
        exit 1
    }
}

Write-Host "Building release binaries for v$Version" -ForegroundColor Cyan
Write-Host ""

# Build info
$BuildDate = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$GitCommit = (git rev-parse --short HEAD).Trim()
$BuildBy = "release-script"

# Output directory
$DistDir = Join-Path $ProjectRoot "dist\release-v$Version"
New-Item -ItemType Directory -Force -Path $DistDir | Out-Null

Write-Host "Output directory: $DistDir"
Write-Host ""

################################################################################
# Build Go Backend
################################################################################

Write-Host "Building Go backend..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\backend"

$platforms = @(
    @{OS='linux'; Arch='amd64'},
    @{OS='linux'; Arch='arm64'},
    @{OS='darwin'; Arch='amd64'},
    @{OS='darwin'; Arch='arm64'},
    @{OS='windows'; Arch='amd64'}
)

foreach ($platform in $platforms) {
    $goos = $platform.OS
    $goarch = $platform.Arch
    $outputName = "prd-assistant-backend-v${Version}-${goos}-${goarch}"
    
    if ($goos -eq 'windows') {
        $outputName += '.exe'
    }
    
    Write-Host "  Building $goos/$goarch..." -ForegroundColor Gray
    
    $env:GOOS = $goos
    $env:GOARCH = $goarch
    
    $ldflags = "-X main.Version=$Version -X main.GitCommit=$GitCommit -X main.BuildDate=$BuildDate -X main.BuildBy=$BuildBy"
    
    go build -ldflags $ldflags -o "$DistDir\$outputName" . 2>&1 | Out-Null
}

Write-Host "✓ Backend binaries built" -ForegroundColor Green
Write-Host ""

################################################################################
# Build WebView2 Thick Client
################################################################################

Write-Host "Building WebView2 thick client..." -ForegroundColor Yellow
Write-Host "  Note: WebView2 requires platform-specific builds with CGO" -ForegroundColor Gray
Write-Host "  Building for current platform only: $((go env GOOS).Trim())/$((go env GOARCH).Trim())" -ForegroundColor Gray
Set-Location "$ProjectRoot\cmd\webview"

$currentOS = (go env GOOS).Trim()
$currentArch = (go env GOARCH).Trim()
$outputName = "prd-assistant-webview-v${Version}-${currentOS}-${currentArch}"

if ($currentOS -eq 'windows') {
    $outputName += '.exe'
}

Write-Host "  Building $currentOS/$currentArch..." -ForegroundColor Gray

$env:CGO_ENABLED = '1'
$ldflags = "-X main.Version=$Version -X main.GitCommit=$GitCommit -X main.BuildDate=$BuildDate"

go build -ldflags $ldflags -o "$DistDir\$outputName" . 2>&1 | Out-Null

Write-Host "✓ WebView2 binary built (current platform only)" -ForegroundColor Green
Write-Host ""

################################################################################
# Build Electron Thick Client
################################################################################

Write-Host "Building Electron thick client..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\cmd\electron"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Gray
    npm install 2>&1 | Out-Null
}

Write-Host "  Building for all platforms (this may take a while)..." -ForegroundColor Gray
npm run build:all 2>&1 | Select-String -Pattern "(Building|Packaging|Target)" | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }

# Move Electron builds to release directory
$electronDist = Join-Path $ProjectRoot "dist\electron"
if (Test-Path $electronDist) {
    Get-ChildItem $electronDist -File | Copy-Item -Destination $DistDir -Force
}

Write-Host "✓ Electron binaries built" -ForegroundColor Green
Write-Host ""

################################################################################
# Create checksums
################################################################################

Write-Host "Creating checksums..." -ForegroundColor Yellow
Set-Location $DistDir

$checksums = Get-ChildItem -File | Where-Object { $_.Name -ne 'SHA256SUMS.txt' } | ForEach-Object {
    $hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower()
    "$hash  $($_.Name)"
}

$checksums | Out-File -FilePath "SHA256SUMS.txt" -Encoding UTF8

Write-Host "✓ Checksums created" -ForegroundColor Green
Write-Host ""

################################################################################
# Summary
################################################################################

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Release v$Version build complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Binaries location: $DistDir"
Write-Host ""
Write-Host "Files created:"
Get-ChildItem $DistDir -File | ForEach-Object {
    $size = if ($_.Length -gt 1MB) { "{0:N2} MB" -f ($_.Length / 1MB) } else { "{0:N2} KB" -f ($_.Length / 1KB) }
    Write-Host "  $($_.Name) ($size)"
}
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Test the binaries"
Write-Host "  2. Upload to GitHub release: https://github.com/bordenet/product-requirements-assistant/releases/tag/v$Version"
Write-Host "  3. Update RELEASES.md if needed"
Write-Host ""

Set-Location $ProjectRoot

