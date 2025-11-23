# Product Requirements Assistant

[![CI/CD](https://github.com/bordenet/product-requirements-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/product-requirements-assistant/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/bordenet/product-requirements-assistant/branch/main/graph/badge.svg?token=13a4e0d2-5d04-4b4e-9b0e-d07f16280fa1)](https://codecov.io/gh/bordenet/product-requirements-assistant)
[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A structured 3-phase workflow tool for creating Product Requirements Documents with AI assistance.

**🌐 [Launch Web App](https://bordenet.github.io/product-requirements-assistant/)**

## Quick Start

### Web App (Recommended)

**🌐 [Launch Web App](https://bordenet.github.io/product-requirements-assistant/)**

No installation required. Works on any device with a modern browser. All data stored locally in your browser.

### Local Development

```bash
# macOS/Linux
./run.sh

# Windows PowerShell
.\scripts\setup-windows.ps1
```

Then open http://localhost:8501

See [Development Setup](#development-setup) for details.

## Features

- **3-Phase Workflow**: Initial draft (Claude), review (Gemini), finalization (Claude)
- **Copy/Paste Integration**: Works with Claude Sonnet 4.5 and Gemini 2.5 Pro
- **Local Storage**: Projects stored as JSON with markdown export
- **Privacy-First**: 100% client-side, no server, no tracking

## Screenshots

[Screenshot placeholder: Phase 1 interface showing project setup and prompt generation]

[Screenshot placeholder: Claude integration showing copy/paste workflow]

## How It Works

1. **Create Project**: Enter title, problems, and context
2. **Phase 1**: Copy prompt to Claude Sonnet 4.5, paste response back
3. **Phase 2**: Copy prompt to Gemini 2.5 Pro, paste response back
4. **Phase 3**: Copy prompt to Claude, paste final PRD
5. **Export**: Download as markdown with full revision history

## Development Setup

### Prerequisites

- Go 1.21+
- Python 3.8+
- Node.js 16+ (for testing)

### Running from Source

```bash
# macOS/Linux
./run.sh

# Windows PowerShell
.\scripts\setup-windows.ps1
```

The setup scripts will:

- Install dependencies
- Run tests
- Start backend (port 8080) and frontend (port 8501)
- Open <http://localhost:8501>

### Manual Setup

```bash
# Install dependencies
make install

# Terminal 1 - Backend
make run-backend

# Terminal 2 - Frontend
make run-frontend
```

## Testing

```bash
# Run all tests
make test-all

# Backend tests only
make test-backend

# Comprehensive validation
./scripts/validate-monorepo.sh --quick
```

See [`docs/development/MOCK_AI.md`](docs/development/MOCK_AI.md) for automated testing with mock AI responses.

## Documentation

- [Architecture](docs/architecture/ARCHITECTURE.md) - System design
- [API Reference](docs/architecture/API.md) - Backend REST API
- [Contributing](CONTRIBUTING.md) - Development guidelines
- [Evolutionary Optimization](PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md) - LLM prompt tuning methodology

## Evolutionary Prompt Optimization

This repository contains the authoritative implementation of evolutionary prompt optimization:

- **+31.1% quality improvement** in 20 rounds (data-driven)
- **Objective scoring** with keep/discard logic
- **Proven mutation library** (Top 5 mutations deliver 71-73% of improvement)

Key files:

- `tools/evolutionary-optimizer.js` - Core optimization engine
- `tools/prd-scorer.js` - Objective PRD quality scorer
- `evolutionary-optimization/` - Test cases and results
- [`PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md`](PROMPT-FOR-GENESIS-EVOLUTIONARY-INTEGRATION.md) - Integration guide

## License

MIT License - see [LICENSE](./LICENSE)
