# Scripts Directory

Automation scripts for setup, validation, testing, and release management.

---

## 📋 Quick Reference

| Script | Purpose | Platform |
|--------|---------|----------|
| [`setup-macos.sh`](#setup-macossh) | Development environment setup | macOS |
| [`setup-linux.sh`](#setup-linuxsh) | Development environment setup | Linux |
| [`setup-windows-wsl.sh`](#setup-windows-wslsh) | Development environment setup | Windows (WSL) |
| [`setup-windows.ps1`](#setup-windowsps1) | Development environment setup | Windows (PowerShell) |
| [`validate-monorepo.sh`](#validate-monorepo) | Code quality validation | Unix/Linux/macOS |
| [`validate-monorepo.ps1`](#validate-monorepo) | Code quality validation | Windows (PowerShell) |
| [`release.py`](#releasepy) | Automated release management | All |
| [`install-hooks.sh`](#install-hooks) | Install git pre-commit hooks | Unix/Linux/macOS |
| [`install-hooks.ps1`](#install-hooks) | Install git pre-commit hooks | Windows (PowerShell) |
| [`integration-test.sh`](#integration-testsh) | End-to-end integration tests | Unix/Linux/macOS |
| [`check-binaries.sh`](#check-binariessh) | Prevent binary commits | All (git hook) |
| [`check-secrets.sh`](#check-secretssh) | Scan for secrets/credentials | All (git hook) |

---

## 🚀 Setup Scripts

### `setup-macos.sh`

**Purpose:** One-command development environment setup for macOS

**Usage:**
```bash
./scripts/setup-macos.sh [OPTIONS]
```

**Options:**
- `-y, --yes` - Auto-accept all prompts
- `-v, --verbose` - Show detailed output
- `-f, --force` - Force reinstall dependencies

**What it does:**
1. Installs Homebrew (if needed)
2. Installs Go 1.21+ and Python 3.8+
3. Installs project dependencies
4. Runs tests
5. Starts backend (port 8080) and frontend (port 8501)
6. Opens http://localhost:8501

**Features:**
- ✅ Smart caching (5-10 second subsequent runs)
- ✅ Kills processes on ports 8080/8501 if needed
- ✅ Compact output with running timer
- ✅ Validates setup with quick build test

---

### `setup-linux.sh`

**Purpose:** One-command development environment setup for Linux

**Usage:**
```bash
./scripts/setup-linux.sh [OPTIONS]
```

**Options:** Same as `setup-macos.sh`

**Package Manager:** Uses `apt` (Debian/Ubuntu)

---

### `setup-windows-wsl.sh`

**Purpose:** One-command development environment setup for Windows Subsystem for Linux

**Usage:**
```bash
./scripts/setup-windows-wsl.sh [OPTIONS]
```

**Options:** Same as `setup-macos.sh`

**Requirements:** WSL with Ubuntu/Debian

---

### `setup-windows.ps1`

**Purpose:** Native Windows setup (no WSL required)

**Usage:**
```powershell
.\scripts\setup-windows.ps1 [-AutoYes] [-Verbose] [-Force]
```

**What it does:**
1. Installs Chocolatey (if needed)
2. Installs Go and Python via Chocolatey
3. Sets up Python virtual environment
4. Installs dependencies
5. Runs tests
6. Starts backend and frontend

**Requirements:** PowerShell 5.1+ with Administrator privileges

---

## ✅ Validation Scripts

### `validate-monorepo.sh` / `validate-monorepo.ps1`

**Purpose:** Comprehensive code quality validation

**Usage:**
```bash
# Quick validation (~1-2 minutes)
./scripts/validate-monorepo.sh --quick

# Full validation (~3-5 minutes)
./scripts/validate-monorepo.sh --full
```

**PowerShell:**
```powershell
.\scripts\validate-monorepo.ps1 -Quick
.\scripts\validate-monorepo.ps1 -Full
```

**Checks:**
- ✅ Dependency versions (Go, Python)
- ✅ Project structure
- ✅ Backend build and linting (`go vet`, `gofmt`)
- ✅ Backend tests (all test suites)
- ✅ Frontend linting (`flake8`, `black`)
- ✅ Security scanning (full mode only)
- ✅ Git status check (full mode only)

---

## 📦 Release Management

### `release.py`

**Purpose:** Automated semantic versioning and GitHub releases

**Usage:**
```bash
# Patch release (bug fixes: 0.1.0 -> 0.1.1)
./scripts/release.py patch

# Minor release (new features: 0.1.0 -> 0.2.0)
./scripts/release.py minor -m "Add new feature"

# Major release (breaking changes: 0.1.0 -> 1.0.0)
./scripts/release.py major

# Preview without making changes
./scripts/release.py minor --dry-run -v
```

**What it does:**
1. Validates git status (clean working directory)
2. Increments version number
3. Creates git tag
4. Pushes to GitHub
5. Triggers GitHub Actions to build binaries

**See also:** [`docs/deployment/RELEASING.md`](../docs/deployment/RELEASING.md)

---

## 🔒 Git Hooks

### `install-hooks.sh` / `install-hooks.ps1`

**Purpose:** Install pre-commit hooks for code quality

**Usage:**
```bash
./scripts/install-hooks.sh
```

**PowerShell:**
```powershell
.\scripts\install-hooks.ps1
```

**Hooks installed:**
- [`check-binaries.sh`](#check-binariessh) - Prevent compiled binaries from being committed
- [`check-secrets.sh`](#check-secretssh) - Scan for secrets and credentials

---

### `check-binaries.sh`

**Purpose:** Prevent accidental commits of compiled binaries

**Triggered:** Automatically on `git commit`

**Blocks:**
- Executable files in `backend/`, `dist/`, `build/`
- Files with execute permissions
- Known binary extensions

---

### `check-secrets.sh`

**Purpose:** Scan staged files for secrets and credentials

**Triggered:** Automatically on `git commit`

**Detects:**
- API keys and tokens
- Private keys (RSA, EC)
- AWS credentials
- Database passwords
- Generic secrets patterns

---

## 🧪 Testing Scripts

### `integration-test.sh`

**Purpose:** End-to-end integration tests

**Usage:**
```bash
./scripts/integration-test.sh
```

**What it tests:**
1. Backend API endpoints
2. Project CRUD operations
3. 3-phase workflow
4. Export/import functionality

---

## 📁 Library Scripts

### `lib/compact.sh`

**Purpose:** Shared library for compact output formatting

**Used by:** All setup scripts

**Features:**
- Running timer in top-right corner
- In-place status updates (minimal vertical space)
- Symbols: ✓ (success), ✗ (fail), ⚠ (warn), ○ (cached)
- Verbose mode support

**See also:** [`docs/development/COMPACT_OUTPUT_STATUS.md`](../docs/development/COMPACT_OUTPUT_STATUS.md)

---

### `lib/common.sh`

**Purpose:** Shared utility functions for shell scripts

**Functions:**
- Color output
- Error handling
- Platform detection
- Process management

---

## 🔗 Related Documentation

- **[Development Guide](../docs/development/)** - Development workflows and tools
- **[Deployment Guide](../docs/deployment/)** - Release and deployment processes
- **[Contributing](../CONTRIBUTING.md)** - Contribution guidelines

