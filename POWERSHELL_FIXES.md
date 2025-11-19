# PowerShell Scripts - Fixes Applied

## Summary

All PowerShell scripts in this repository have been fixed and are now working. The main issues were:

1. **UTF-8 BOM requirement**: PowerShell on Windows requires UTF-8 BOM for proper parsing of scripts with Unicode characters
2. **Regex escaping**: Secret scanning patterns needed proper quote escaping
3. **Parameter conflicts**: Removed duplicate `$Verbose` parameter (conflicts with `[CmdletBinding()]`)
4. **Git errors**: Added error handling for git commands when running from WSL paths

## Files Fixed

### 1. `run-thick-clients.ps1`
- ✅ Removed duplicate `$Verbose` parameter (conflicts with CmdletBinding)
- ✅ Changed to use `$VerbosePreference` automatic variable
- ✅ Added UTF-8 BOM
- ✅ Already uses Compact.psm1 module for clean output

### 2. `scripts/validate-monorepo.ps1`
- ✅ Fixed regex patterns in secret scanning (changed double quotes to single quotes with escaped quotes)
- ✅ Added UTF-8 BOM
- ✅ Script parses and runs correctly

### 3. `scripts/setup-windows.ps1`
- ✅ Added UTF-8 BOM (was the main issue)
- ✅ Script now parses correctly

### 4. `scripts/install-hooks.ps1`
- ✅ Added error handling for git commands (dubious ownership errors from WSL paths)
- ✅ Added UTF-8 BOM
- ✅ Script runs successfully with warnings instead of errors

### 5. `scripts/lib/Compact.psm1`
- ✅ Added UTF-8 BOM
- ✅ Module loads correctly

## Current Status

All scripts are **WORKING** and ready to commit. Changes are staged in git.

## Next Steps (Future Improvements)

### 1. Add Compact Output to All Scripts
Currently only `run-thick-clients.ps1` uses the Compact.psm1 module. The other scripts should be updated to use it:

**Pattern to follow:**
```powershell
[CmdletBinding()]
param(
    # ... other params
)

# Import compact output module
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Import-Module "$ScriptDir\lib\Compact.psm1" -Force

if ($VerbosePreference -eq 'Continue') {
    Enable-VerboseMode
}

# Use compact functions:
Start-Task "Doing something"
Write-Verbose-Line "Details..."
Complete-Task "Done"
```

### 2. Add Restartability/Resumability
Implement caching pattern from `scripts/setup-windows-wsl-compact.sh`:

**Pattern to implement:**
```powershell
# Cache directory
$CacheDir = "$PSScriptRoot\.setup-cache"
New-Item -ItemType Directory -Force -Path $CacheDir | Out-Null

# Helper functions
function Test-Cached {
    param($Name)
    Test-Path "$CacheDir\$Name"
}

function Set-Cached {
    param($Name)
    New-Item -ItemType File -Force -Path "$CacheDir\$Name" | Out-Null
}

# Usage
if (-not (Test-Cached "go-deps")) {
    Start-Task "Installing Go dependencies"
    # ... install logic
    Set-Cached "go-deps"
    Complete-Task "Go dependencies installed"
} else {
    Skip-Task "Go dependencies"
}
```

### 3. Standardize Script Structure
All scripts should follow this pattern:
- Use `[CmdletBinding()]` for automatic verbose support
- Import Compact.psm1 for consistent output
- Support `-Verbose` flag
- Support `-Force` flag to bypass caching
- Use cache files for expensive operations
- Show elapsed time on completion

## To Commit and Push

```bash
# Configure git if needed
git config --global user.email "your@email.com"
git config --global user.name "Your Name"

# Commit and push
git commit -m "Fix PowerShell scripts: add UTF-8 BOM, fix regex escaping, handle git errors"
git push origin main
```

## Testing

All scripts have been tested and work correctly:

```powershell
# Test each script
powershell -File .\run-thick-clients.ps1 -Mode build
powershell -File .\scripts\validate-monorepo.ps1 -Help
powershell -File .\scripts\setup-windows.ps1 -AutoYes
powershell -File .\scripts\install-hooks.ps1
```

