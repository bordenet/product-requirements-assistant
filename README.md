# Product Requirements Assistant

A structured 3-phase workflow tool for creating Product Requirements Documents with AI assistance.

## 🚀 Quick Start for Windows Users

**No installation or setup required!** Just download and run:

1. **Go to [Latest Release](https://github.com/bordenet/product-requirements-assistant/releases/latest)**
2. **Download ONE of these:**
   - **Electron Installer** (Recommended): `Product-Requirements-Assistant-Setup-X.X.X.exe` (~150MB)
     - Full installer with desktop shortcut
     - Double-click to install, launch from Start Menu
   - **WebView2 Portable**: `prd-assistant-windows-amd64.exe` (~10MB)
     - No installation needed, just download and run
     - Requires [WebView2 Runtime](https://developer.microsoft.com/microsoft-edge/webview2/) (usually pre-installed on Windows 10/11)
3. **Run the downloaded file**
   - Windows may show a security warning - click "More info" → "Run anyway"
4. **Start creating PRDs!**

📖 **See [QUICK_START_WINDOWS.md](QUICK_START_WINDOWS.md) for detailed instructions and troubleshooting**

---

## Features

- **3-Phase Workflow**: Initial draft (Claude), review (Gemini), finalization (Claude)
- **Copy/Paste Integration**: Works with Claude Sonnet 4.5 and Gemini 2.5 Pro
- **Local Storage**: Projects stored as JSON with markdown export
- **Interactive UI**: Streamlit-based web interface with live preview

## Screenshots

![Phase 1 Interface](docs/img/Screenshot--Phase1.png)
*Phase 1: Initial PRD generation with customizable prompts*

![Claude Integration](docs/img/Screenshot--ClaudePhase1.png)
*Copy/paste workflow with Claude Sonnet 4.5*

## Architecture

- **Backend**: Go REST API on port 8080
- **Frontend**: Streamlit web UI on port 8501
- **Storage**: Local filesystem

## Download Pre-Built Applications

**For non-technical users**: Just download and run - no coding required!

Pre-built executables available from [GitHub Releases](https://github.com/bordenet/product-requirements-assistant/releases/latest):

### Electron Client (Recommended - Full Installer)
- **Windows**: `Product-Requirements-Assistant-Setup-X.X.X.exe` (~150MB)
- **macOS**: `Product-Requirements-Assistant-X.X.X.dmg` (~150MB)
- **Linux**: `Product-Requirements-Assistant-X.X.X.AppImage` (~150MB)

**Includes**: Desktop shortcut, Start Menu entry, automatic updates

### WebView2 Native Client (Lightweight - Portable)
- **Windows**: `prd-assistant-windows-amd64.exe` (~10MB)
- **macOS (Intel)**: `prd-assistant-macos-amd64` (~9MB)
- **macOS (Apple Silicon)**: `prd-assistant-macos-arm64` (~8MB)
- **Linux**: `prd-assistant-linux-amd64` (~10MB)

**Requires**: OS-native browser engines (WebView2 on Windows, WebKit on macOS, WebKitGTK on Linux)

---

## For Developers

**The sections below are for developers who want to build from source or contribute.**

If you just want to **use** the application, download the pre-built executable above - no setup required!

---

## Development Setup (Developers Only)

### Quick Start

**macOS/Linux:**
```bash
./run.sh [-y|--yes]
```

**Windows (WSL - Ubuntu/Debian):**
```bash
./scripts/setup-windows-wsl.sh [-y|--yes]
```

**Windows (PowerShell - native, no WSL required):**
```powershell
.\scripts\setup-windows.ps1 [-AutoYes]
```

The setup scripts will:
- Install Go and Python if needed (via Homebrew/apt/Chocolatey)
- Install project dependencies
- Run tests
- Check for processes on ports 8080/8501 and offer to kill them
- Start backend and frontend
- Open http://localhost:8501

### Platform-Specific Scripts

**macOS:**
```bash
./scripts/setup-macos.sh [-y|--yes]
```

**Linux:**
```bash
./scripts/setup-linux.sh [-y|--yes]
```

**Windows WSL:**
```bash
./scripts/setup-windows-wsl.sh [-y|--yes]
```

**Windows PowerShell:**
```powershell
.\scripts\setup-windows.ps1 [-AutoYes]
```

Stop with `Ctrl+C`.

### Manual Setup

```bash
# Install dependencies
make install

# Terminal 1 - Backend
make run-backend

# Terminal 2 - Frontend
make run-frontend
```

Then open http://localhost:8501

## Usage

1. **Create Project**: Enter title, problems, and context
2. **Phase 1**: Copy prompt → Claude Sonnet 4.5 → paste response back
3. **Phase 2**: Copy prompt → Gemini 2.5 Pro → paste response back
4. **Phase 3**: Copy prompt → Claude → paste final PRD
5. **Export**: Download as markdown with full revision history

## Project Structure

```
product-requirements-assistant/
├── backend/          # Go server (port 8080)
├── frontend/         # Streamlit app (port 8501)
├── scripts/          # Setup and utility scripts
├── prompts/          # Prompt templates
├── outputs/          # Generated PRDs
├── venv/            # Python virtual environment
├── Makefile         # Common commands
└── run.sh           # Unified setup script
```

## Configuration

**Prompt Templates**: Edit in UI or directly in `prompts/` directory

**Validation Limits**:
- Title: 200 characters
- Problems/Description: 100KB
- Context: 50KB
- PRD Content: 200KB
- Max Request Size: 10MB

## Troubleshooting

**Port already in use:**
```bash
lsof -ti:8080 | xargs kill -9
lsof -ti:8501 | xargs kill -9
```

Or just run the setup script again - it will handle this automatically.

**Logs:**
```bash
tail -f backend.log frontend.log
```

See [LOGGING.md](docs/LOGGING.md) for detailed error documentation.

## Testing

```bash
# Run all tests
make test-all

# Backend tests only
make test-backend

# Integration tests
make test-integration

# Comprehensive validation (recommended before commits)
./scripts/validate-monorepo.sh --quick   # ~1-2 minutes (Unix/Linux/macOS)
./scripts/validate-monorepo.sh --full    # ~3-5 minutes (Unix/Linux/macOS)

# Windows PowerShell
.\scripts\validate-monorepo.ps1 -Quick   # ~1-2 minutes
.\scripts\validate-monorepo.ps1 -Full    # ~3-5 minutes
```

**Validation includes:**
- Dependency checks (Go, Python versions)
- Project structure validation
- Backend build and linting (go vet, gofmt)
- Backend tests (all test suites)
- Frontend linting (flake8, black)
- Security scanning (secret detection) - full mode only
- Git status check - full mode only

### Mock AI for Automated Testing

For automated testing without manual copy/paste, enable Mock AI:

```bash
export MOCK_AI_ENABLED=true
cd backend && go run .
```

Then use the generate endpoint to auto-complete phases:

```bash
# Generate Phase 1 response
curl -X POST http://localhost:8080/api/projects/{project_id}/generate/1

# Generate Phase 2 response
curl -X POST http://localhost:8080/api/projects/{project_id}/generate/2

# Generate Phase 3 response
curl -X POST http://localhost:8080/api/projects/{project_id}/generate/3
```

**⚠️ Note**: Mock AI is for testing/development only. See [docs/MOCK_AI.md](docs/MOCK_AI.md) for details.

## Quality Gates

This repository includes automated safety mechanisms:

**Pre-Commit Hooks** (prevents broken commits):
```bash
# Install hooks (one-time setup)
./scripts/install-hooks.sh
```

The hooks will automatically:
- ✅ Block compiled binaries from being committed
- ✅ Scan for secrets and credentials
- ✅ Ensure code quality before commits

**Validation System**:
```bash
# Quick validation (dependencies, builds, tests)
./scripts/validate-monorepo.sh --quick

# Full validation (includes security scans)
./scripts/validate-monorepo.sh --full
```

**To bypass hooks in emergencies**:
```bash
git commit --no-verify -m "Emergency fix"
```
⚠️ Only use `--no-verify` when absolutely necessary!

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)**: System design and technical details
- **[API Reference](docs/API.md)**: Complete API endpoint documentation
- **[Logging](docs/LOGGING.md)**: Logging configuration and troubleshooting
- **[Releasing](docs/RELEASING.md)**: Creating releases with semantic versioning
- **[Contributing](CONTRIBUTING.md)**: Development setup and contribution guidelines

## Development

Run `make help` to see all available commands.

```bash
# Install dependencies
make install

# Format code
make format

# Run linters
make lint

# Build binary
make build
```

### Creating Releases

Use the automated release tool for semantic versioning:

```bash
# Patch release (bug fixes)
./scripts/release.py patch

# Minor release (new features)
./scripts/release.py minor -m "Add sidebar improvements"

# Major release (breaking changes)
./scripts/release.py major

# Preview release without changes
./scripts/release.py minor --dry-run -v
```

See [docs/RELEASING.md](docs/RELEASING.md) for detailed release documentation.

## Known Limitations

- No direct API integration (requires manual copy/paste)
- Single user only
- Local storage only
- No real-time collaboration
- No version history beyond 3 phases
- Limited to text-based PRDs

## License

MIT License - see [LICENSE](./LICENSE)
