# Product Requirements Assistant

A structured 3-phase workflow tool for creating Product Requirements Documents with AI assistance.

## 🚀 Quick Start for Windows Users

**Simple setup - no coding required!**

1. **Download** the backend: [prd-assistant-backend-v0.5.0-windows-amd64.exe](https://github.com/bordenet/product-requirements-assistant/releases/latest) (7.9 MB)
2. **Install Python 3.8+** if you don't have it: [python.org/downloads](https://www.python.org/downloads/)
3. **Clone this repository** or download as ZIP
4. **Run the setup script**: Open PowerShell in the project folder and run:
   ```powershell
   .\scripts\setup-windows.ps1
   ```
5. **Start creating PRDs!** The app will open in your browser

The setup script will:
- Install Python dependencies (Streamlit)
- Use the downloaded backend binary
- Start both backend and frontend
- Open http://localhost:8501 in your browser

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

## Platform Support

### Windows (Current Release v0.5.0)
- **Backend Binary** - Pre-built Go server (7.9 MB)
- **Requires**: Python 3.8+ for Streamlit frontend
- **Setup**: Run `.\scripts\setup-windows.ps1` after downloading binary

### Web Application ✨ NEW!
- **Browser-based** - No installation required, just open a URL
- **100% client-side** - All data stored in your browser (IndexedDB)
- **Privacy-first** - Zero server storage, zero tracking
- **Try it:** Run locally with `cd web && python3 -m http.server 8000`
- **Deploy:** CloudFront, GitHub Pages, Netlify, or any static host

### Coming Soon
- **Electron Installer** - One-click Windows installer (no Python needed)
- **Self-contained .exe** - Truly standalone Windows executable
- **macOS and Linux** - Native applications

## Architecture

- **Backend**: Go REST API on port 8080
- **Frontend**: Streamlit web UI on port 8501 (desktop) / Vanilla JS (web)
- **Storage**: Local filesystem (desktop) / IndexedDB (web)

## Download Pre-Built Binary

**Current Release: v0.5.0**

Download from [GitHub Releases](https://github.com/bordenet/product-requirements-assistant/releases/latest):

### Windows Backend Binary
- **File**: `prd-assistant-backend-v0.5.0-windows-amd64.exe` (7.9 MB)
- **What it is**: Pre-compiled Go backend server
- **What you need**: Python 3.8+ and this repository
- **How to use**:
  1. Download the .exe file
  2. Clone or download this repository
  3. Run `.\scripts\setup-windows.ps1`
  4. The script will use the binary and start the app

**Note**: This is the backend server only. The setup script handles the frontend (Streamlit) automatically.

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

## 📁 Project Structure

```
product-requirements-assistant/
├── backend/                    # Go REST API server (port 8080)
├── frontend/                   # Streamlit web UI (port 8501)
├── web/                        # Browser-based web app (100% client-side)
│   ├── js/                    # JavaScript modules
│   ├── css/                   # Styles
│   ├── data/                  # Default prompts
│   └── README.md              # Web app documentation
├── cmd/                        # Desktop application launchers
│   ├── electron/              # Electron client (~150MB)
│   └── webview/               # WebView2 client (~10MB)
├── scripts/                    # Automation scripts
│   ├── setup-*.sh             # Platform-specific setup
│   ├── validate-monorepo.*    # Code quality validation
│   ├── release.py             # Release automation
│   └── README.md              # Scripts documentation
├── prompts/                    # AI prompt templates
│   ├── claude_initial.txt     # Phase 1 prompt
│   ├── gemini_review.txt      # Phase 2 prompt
│   ├── claude_compare.txt     # Phase 3 prompt
│   └── README.md              # Prompts documentation
├── docs/                       # Documentation
│   ├── architecture/          # System design and API
│   ├── deployment/            # Deployment and releases
│   ├── development/           # Dev tools and workflows
│   ├── decisions/             # Design decisions
│   ├── guides/                # User guides
│   ├── _archive/              # Obsolete docs (historical)
│   └── README.md              # Documentation index
├── outputs/                    # Generated PRDs (local storage)
├── testdata/                   # Test fixtures
├── Makefile                    # Common development commands
├── run.sh                      # Quick start script
├── CONTRIBUTING.md             # Contribution guidelines
└── README.md                   # This file
```

**See also:**
- [`docs/README.md`](docs/README.md) - Complete documentation index
- [`scripts/README.md`](scripts/README.md) - Scripts reference
- [`prompts/README.md`](prompts/README.md) - Prompts documentation
- [`web/README.md`](web/README.md) - Web app guide

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

See [`docs/development/LOGGING.md`](docs/development/LOGGING.md) for detailed error documentation.

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

**⚠️ Note**: Mock AI is for testing/development only. See [`docs/development/MOCK_AI.md`](docs/development/MOCK_AI.md) for details.

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

## 📚 Documentation

**Complete Documentation:** [`docs/README.md`](docs/README.md)

### Quick Links

**For Users:**
- **[Quick Start (Windows)](QUICK_START_WINDOWS.md)** - Download and run on Windows
- **[Thick Clients Guide](docs/guides/THICK_CLIENTS_GUIDE.md)** - Desktop app user guide
- **[Web App Guide](web/README.md)** - Browser-based version

**For Developers:**
- **[Architecture](docs/architecture/ARCHITECTURE.md)** - System design and tech stack
- **[API Reference](docs/architecture/API.md)** - Backend REST API
- **[Contributing](CONTRIBUTING.md)** - Development setup and guidelines
- **[Scripts](scripts/README.md)** - Automation scripts reference

**For DevOps:**
- **[Releasing](docs/deployment/RELEASING.md)** - Creating releases
- **[Code Signing](docs/deployment/CODE_SIGNING.md)** - Windows security
- **[CloudFront Deployment](docs/deployment/CLOUDFRONT_HOSTING.md)** - Web app hosting

**Development Tools:**
- **[Mock AI](docs/development/MOCK_AI.md)** - Testing with mock responses
- **[Logging](docs/development/LOGGING.md)** - Debugging and troubleshooting
- **[Prompts](prompts/README.md)** - AI prompt templates

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

See [`docs/deployment/RELEASING.md`](docs/deployment/RELEASING.md) for detailed release documentation.

## Known Limitations

- No direct API integration (requires manual copy/paste)
- Single user only
- Local storage only
- No real-time collaboration
- No version history beyond 3 phases
- Limited to text-based PRDs

## License

MIT License - see [LICENSE](./LICENSE)
