# Development Documentation

Tools, workflows, and guides for developers working on the Product Requirements Assistant.

---

## 📄 Documents

### [`MOCK_AI.md`](./MOCK_AI.md)

**Purpose:** Mock AI system for automated testing

**Contents:**
- How to enable Mock AI mode
- Automated PRD generation for testing
- Mock response templates
- Test coverage and validation
- Integration with CI/CD

**Audience:** Developers, QA engineers, CI/CD maintainers

**Quick Start:**
```bash
# Enable Mock AI
export MOCK_AI_ENABLED=true
cd backend && go run .

# Generate mock responses
curl -X POST http://localhost:8080/api/projects/{id}/generate/1
curl -X POST http://localhost:8080/api/projects/{id}/generate/2
curl -X POST http://localhost:8080/api/projects/{id}/generate/3
```

**Use Cases:**
- Automated testing without manual copy/paste
- Integration tests
- CI/CD pipelines
- Demo data generation

---

### [`LOGGING.md`](./LOGGING.md)

**Purpose:** Logging configuration and troubleshooting guide

**Contents:**
- Log levels and formats
- Backend logging (Go)
- Frontend logging (Streamlit)
- Log file locations
- Debugging tips
- Common error messages and solutions

**Audience:** Developers, DevOps, support engineers

**Log Files:**
- Backend: `backend.log`
- Frontend: `frontend.log`

**Viewing Logs:**
```bash
# Tail both logs
tail -f backend.log frontend.log

# Search for errors
grep ERROR backend.log
```

---

### [`LAUNCHER_SCRIPTS.md`](./LAUNCHER_SCRIPTS.md)

**Purpose:** Documentation for thick client launcher scripts

**Contents:**
- How launcher scripts work
- Process management (starting/stopping backend and frontend)
- Error handling and recovery
- Platform-specific considerations
- Debugging launcher issues

**Audience:** Desktop app developers, packagers

**Launcher Scripts:**
- Electron: [`cmd/electron/launcher.sh`](../../cmd/electron/launcher.sh)
- WebView2: [`cmd/webview/launcher.sh`](../../cmd/webview/launcher.sh)

**What They Do:**
1. Start Go backend on port 8080
2. Start Streamlit frontend on port 8501
3. Wait for both to be ready
4. Open UI (Electron window or WebView2)
5. Handle shutdown gracefully

---

### [`COMPACT_OUTPUT_PATTERN.md`](./COMPACT_OUTPUT_PATTERN.md)

**Purpose:** Reusable pattern for shell scripts with minimal vertical real estate

**Contents:**
- Running timer (yellow text) in top-right corner
- In-place status updates (single line per task)
- Verbose mode (`-v` or `--verbose`) for detailed output
- Smart caching for resumable operations
- Professional symbols and colors
- Complete implementation guide

**Audience:** Developers implementing this pattern in ANY project

**Use This Guide To:**
- Implement compact output in other projects
- Create professional-looking shell scripts
- Minimize vertical real estate consumption
- Add running timers to your scripts
- Implement smart caching for performance

**Reference Implementation:**
- [`scripts/lib/compact.sh`](../../scripts/lib/compact.sh) - Production-ready Bash library
- [`scripts/lib/Compact.psm1`](../../scripts/lib/Compact.psm1) - PowerShell module
- [`scripts/setup-*.sh`](../../scripts/) - Example usage in setup scripts

**Performance:**
- First run: Normal execution time
- Cached run: 24x faster (e.g., 2 minutes → 5 seconds)

---

### [`THICK_CLIENT_LAUNCHER.md`](./THICK_CLIENT_LAUNCHER.md)

**Purpose:** Detailed documentation for thick client launcher implementation

**Contents:**
- Launcher architecture
- Process lifecycle management
- Error handling strategies
- Platform-specific quirks
- Troubleshooting guide

**Audience:** Desktop app developers, maintainers

**Platforms:**
- Windows: PowerShell and Bash (WSL)
- macOS: Bash
- Linux: Bash

---

## 🛠️ Development Tools

### Setup Scripts

**Quick Setup:**
```bash
# macOS
./scripts/setup-macos.sh -y

# Linux
./scripts/setup-linux.sh -y

# Windows (WSL)
./scripts/setup-windows-wsl.sh -y

# Windows (PowerShell)
.\scripts\setup-windows.ps1 -AutoYes
```

**See:** [`scripts/README.md`](../../scripts/README.md)

---

### Validation Scripts

**Quick Validation:**
```bash
./scripts/validate-monorepo.sh --quick  # ~1-2 minutes
```

**Full Validation:**
```bash
./scripts/validate-monorepo.sh --full   # ~3-5 minutes
```

**What's Validated:**
- Dependency versions (Go, Python)
- Project structure
- Backend build and linting
- Backend tests
- Frontend linting
- Security scanning (full mode)
- Git status (full mode)

---

### Git Hooks

**Install Hooks:**
```bash
./scripts/install-hooks.sh
```

**Hooks:**
- `check-binaries.sh` - Prevent binary commits
- `check-secrets.sh` - Scan for secrets

**See:** [`scripts/README.md`](../../scripts/README.md)

---

## 🧪 Testing

### Backend Tests

```bash
# All tests
make test-backend

# Specific package
cd backend && go test -v

# With coverage
cd backend && go test -cover
```

### Integration Tests

```bash
./scripts/integration-test.sh
```

### Mock AI Testing

```bash
export MOCK_AI_ENABLED=true
cd backend && go run .
# Use generate endpoints for automated testing
```

---

## 🔍 Debugging

### Backend Debugging

**Enable Verbose Logging:**
```bash
cd backend && go run . -v
```

**Check Logs:**
```bash
tail -f backend.log
```

**Common Issues:**
- Port 8080 already in use: `lsof -ti:8080 | xargs kill -9`
- File permissions: Check `outputs/` directory permissions

### Frontend Debugging

**Check Logs:**
```bash
tail -f frontend.log
```

**Common Issues:**
- Port 8501 already in use: `lsof -ti:8501 | xargs kill -9`
- Python dependencies: `pip install -r requirements.txt`

---

## 🔗 Related Documentation

- **[Architecture](../architecture/)** - System design and tech stack
- **[Deployment](../deployment/)** - Deployment and release guides
- **[Scripts](../../scripts/)** - Automation scripts
- **[Contributing](../../CONTRIBUTING.md)** - Contribution guidelines
