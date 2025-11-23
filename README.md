# Product Requirements Assistant

[![CI/CD](https://github.com/bordenet/product-requirements-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/product-requirements-assistant/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/bordenet/product-requirements-assistant/branch/main/graph/badge.svg?token=13a4e0d2-5d04-4b4e-9b0e-d07f16280fa1)](https://codecov.io/gh/bordenet/product-requirements-assistant)
[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![Python Version](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/bordenet/product-requirements-assistant)](https://github.com/bordenet/product-requirements-assistant/releases/latest)

> **📊 QUALITY STATUS**: Test coverage: 63.19% (target: 70%). Workflow module needs additional testing (37.25% coverage). See [QUALITY_ASSESSMENT.md](QUALITY_ASSESSMENT.md) for details.

A structured 3-phase workflow tool for creating Product Requirements Documents with AI assistance.

**🌐 Try it now: [https://bordenet.github.io/product-requirements-assistant/](https://bordenet.github.io/product-requirements-assistant/)**

---

## 🤖 For AI Assistants

**READ THIS FIRST**: Before working on this codebase, read [`CLAUDE.md`](CLAUDE.md) for mandatory workflow requirements:
- ✅ ALWAYS lint code after creating/modifying it (`npm run lint`)
- ✅ ALWAYS run tests after creating/modifying tests (`npm test`)
- ✅ ALWAYS proactively communicate "what's left" - don't wait to be asked
- ❌ NEVER include `node_modules/`, `coverage/`, or build artifacts
- ❌ NEVER create files without linting and testing them

This ensures high-quality contributions that match Expedia Group engineering standards.

---

## Quick Start

### Option 1: Web App (Recommended)

Use the web app directly in your browser - no installation needed:

**🌐 [Launch Web App](https://bordenet.github.io/product-requirements-assistant/)**

- ✅ No download required
- ✅ Works on any device (Windows, Mac, Linux, mobile)
- ✅ 100% client-side - all data stored in your browser
- ✅ Privacy-first - no server, no tracking
- ✅ Export/import projects as JSON

### Option 2: Manual Setup (For Developers)

If you prefer to run from source or need to customize:

1. Install Python 3.8+ if needed: [python.org/downloads](https://www.python.org/downloads/)
2. Clone this repository or download as ZIP
3. Run the setup script: Open PowerShell in the project folder and run:
   ```powershell
   .\scripts\setup-windows.ps1
   ```
4. The application will open at http://localhost:8501

See [QUICK_START_WINDOWS.md](QUICK_START_WINDOWS.md) for detailed instructions and troubleshooting.

---

## Features

- 3-Phase Workflow: Initial draft (Claude), review (Gemini), finalization (Claude)
- Copy/Paste Integration: Works with Claude Sonnet 4.5 and Gemini 2.5 Pro
- Local Storage: Projects stored as JSON with markdown export
- Interactive UI: Streamlit-based web interface with live preview

## Screenshots

![Phase 1 Interface](docs/img/Screenshot--Phase1.png)
*Phase 1: Initial PRD generation with customizable prompts*

![Claude Integration](docs/img/Screenshot--ClaudePhase1.png)
*Copy/paste workflow with Claude Sonnet 4.5*

## Platform Support

### Web App (Recommended - All Platforms)
- **Live Demo**: [https://bordenet.github.io/product-requirements-assistant/](https://bordenet.github.io/product-requirements-assistant/)
- **Platform**: Any device with a modern browser (Windows, Mac, Linux, mobile)
- **Requirements**: None - 100% client-side
- **Privacy**: All data stored locally in browser (IndexedDB)
- **Features**: Full 3-phase workflow, export/import projects

### Local Development
- Clone repository and run from source
- Local testing: `cd web && python3 -m http.server 8000`
- Deployment: Compatible with GitHub Pages, Netlify, or any static host

### Desktop Applications (Optional)
For developers who want to build desktop applications:
- Electron builds available (see `cmd/electron/`)
- WebView2 builds available (see `cmd/webview/`)
- See [Development Guide](docs/development/DEVELOPMENT.md) for build instructions

## Evolutionary Prompt Optimization

**⚠️ This repository is the authoritative source for evolutionary prompt optimization methodology.**

We've developed tooling for optimizing LLM prompts through evolutionary testing:

- **+31.1% quality improvement** in 20 rounds (proven with data)
- **Objective scoring** with keep/discard logic (no subjective judgment)
- **Proven mutation library** (Top 5 mutations deliver 71-73% of improvement)
- **Out-of-the-box tooling** ready for Genesis-spawned projects

### For Genesis Integration

**Use:** [`PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md`](PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md) (1,063 lines)

This comprehensive prompt guides Claude in the Genesis repository to:
- ✅ **COPY** existing tools (don't recreate 526 lines of battle-tested code)
- ✅ Integrate optimization into all spawned projects
- ✅ Create project-type-specific scorers (PRD, one-pager, COE)
- ✅ Enable cross-project quality comparison

### For Other Projects

See [`docs/cross-project-prompts/`](docs/cross-project-prompts/) for integration guides:
- One-pager integration
- Legacy Genesis prompts (reference only)

### Key Files

- `tools/evolutionary-optimizer.js` - Core optimization engine (526 lines)
- `tools/prd-scorer.js` - Objective PRD quality scorer
- `tools/run-simulations.sh` - Batch simulation executor
- `evolutionary-optimization/` - Test cases, results, documentation
- `docs/continuous-improvement/SIMULATION-RESULTS-SUMMARY.md` - Complete analysis

## Architecture

- **Backend**: Go REST API on port 8080
- **Frontend**: Streamlit web UI on port 8501 (desktop) / Vanilla JS (web)
- **Storage**: Local filesystem (desktop) / IndexedDB (web)

## Download

### Web App (Recommended)
**🌐 [Launch Web App](https://bordenet.github.io/product-requirements-assistant/)**

No download required! Works on any device with a modern browser.

### Build from Source
For developers who want to build desktop applications or run from source:
- [Development Guide](docs/development/DEVELOPMENT.md)
- [Thick Clients Guide](docs/guides/THICK_CLIENTS_GUIDE.md)

---

## For Developers

The sections below are for developers who want to build from source or contribute.

If you want to use the application, download the pre-built executable above.

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

Note: Mock AI is for testing/development only. See [`docs/development/MOCK_AI.md`](docs/development/MOCK_AI.md) for details.

## Quality Gates

This repository includes automated safety mechanisms:

Pre-Commit Hooks (prevents broken commits):
```bash
# Install hooks (one-time setup)
./scripts/install-hooks.sh
```

The hooks will automatically:
- Block compiled binaries from being committed
- Scan for secrets and credentials
- Ensure code quality before commits

Validation System:
```bash
# Quick validation (dependencies, builds, tests)
./scripts/validate-monorepo.sh --quick

# Full validation (includes security scans)
./scripts/validate-monorepo.sh --full
```

To bypass hooks in emergencies:
```bash
git commit --no-verify -m "Emergency fix"
```
Note: Only use `--no-verify` when absolutely necessary.

## Documentation

Complete Documentation: [`docs/README.md`](docs/README.md)

### Quick Links

For Users:
- [Quick Start (Windows)](QUICK_START_WINDOWS.md) - Download and run on Windows
- [Thick Clients Guide](docs/guides/THICK_CLIENTS_GUIDE.md) - Desktop app user guide
- [Web App Guide](web/README.md) - Browser-based version

For Developers:
- [Architecture](docs/architecture/ARCHITECTURE.md) - System design and tech stack
- [API Reference](docs/architecture/API.md) - Backend REST API
- [Contributing](CONTRIBUTING.md) - Development setup and guidelines
- [Scripts](scripts/README.md) - Automation scripts reference

For DevOps:
- [Releasing](docs/deployment/RELEASING.md) - Creating releases
- [Code Signing](docs/deployment/CODE_SIGNING.md) - Windows security
- [CloudFront Deployment](docs/deployment/CLOUDFRONT_HOSTING.md) - Web app hosting

Development Tools:
- [Mock AI](docs/development/MOCK_AI.md) - Testing with mock responses
- [Logging](docs/development/LOGGING.md) - Debugging and troubleshooting
- [Prompts](prompts/README.md) - AI prompt templates

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

## Future Work

### Planned Improvements (v1.6+)

**Library-Based Architecture**:
- Refactor core business logic into `internal/core/` package
- Enable thick clients to run workflows in-process (no HTTP backend required)
- Reduce memory footprint and startup time for desktop applications
- See [`internal/README.md`](internal/README.md) for details

**Enhanced Testing**:
- Property-based testing for validation logic
- Fuzzing for input sanitization
- Performance benchmarks for file operations
- Cross-client end-to-end test matrix

**Developer Experience**:
- OpenAPI/Swagger specification for REST API
- GraphQL endpoint for flexible queries
- WebSocket support for real-time updates
- Plugin system for custom AI providers

**Deployment Options**:
- Docker Compose for containerized deployment
- Kubernetes manifests for cloud deployment
- Terraform modules for infrastructure as code
- CI/CD templates for GitHub Actions, GitLab CI, Jenkins

**User Features**:
- Version history and diff visualization
- Export to PDF, DOCX, Confluence
- Template library for common PRD types
- Collaborative editing with conflict resolution

See [`docs/decisions/REFACTORING_PLAN.md`](docs/decisions/REFACTORING_PLAN.md) for the detailed roadmap.

## Documentation

### Project Root
- `README.md` - This file (main project documentation)
- `CLAUDE.md` - AI assistant instructions (mandatory reading for AI contributors)
- `CONTRIBUTING.md` - Contribution guidelines
- `RELEASES.md` - Release notes
- `PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md` - Comprehensive Genesis integration guide

### docs/
- `docs/architecture/` - Architecture documentation and design decisions
  - `SAME-LLM-ADVERSARIAL-IMPLEMENTATION.md` - Same-LLM adversarial configuration
- `docs/continuous-improvement/` - Optimization results and analysis
  - `SIMULATION-RESULTS-SUMMARY.md` - Evolutionary optimization results
- `docs/cross-project-prompts/` - Integration prompts for other Genesis projects
  - Genesis integration prompts (current and legacy)
  - One-pager integration prompts
- `docs/deployment/` - Deployment guides
- `docs/development/` - Development guides
- `docs/guides/` - User guides

### Code Documentation
- `tools/README.md` - Evolutionary optimization tools documentation
- `evolutionary-optimization/README.md` - Optimization methodology overview
- `evolutionary-optimization/FINAL-REPORT.md` - Complete optimization analysis
- `prompts/README.md` - LLM prompt documentation

## License

MIT License - see [LICENSE](./LICENSE)
