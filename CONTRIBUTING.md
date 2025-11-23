# Contributing to Product Requirements Assistant

Thank you for your interest in contributing! This guide will help you get started.

---

## 📚 Documentation

Before contributing, please review:
- **[Architecture](docs/architecture/ARCHITECTURE.md)** - System design
- **[API Reference](docs/architecture/API.md)** - Backend API
- **[Development Guide](docs/development/)** - Development tools
- **[Scripts Reference](scripts/README.md)** - Automation scripts

---

## 🚀 Development Setup

### Prerequisites

- **Go** 1.21 or higher
- **Python** 3.8 or higher
- **Make** (optional, but recommended)
- **Git**

### Quick Start

**Option 1: Automated Setup (Recommended)**

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

See [`scripts/README.md`](scripts/README.md) for details.

**Option 2: Manual Setup**

```bash
# Clone the repository
git clone https://github.com/bordenet/product-requirements-assistant.git
cd product-requirements-assistant

# Install dependencies
make install

# Run tests
make test-all

# Start development servers
# Terminal 1
make run-backend

# Terminal 2
make run-frontend
```

Open http://localhost:8501

## Code Standards

### Go Code

- Follow standard Go formatting (`gofmt`)
- Run `make format` before committing
- Run `make lint` to check for issues
- Add tests for new functionality
- Maintain test coverage

### Python Code

- Follow PEP 8 style guide
- Use type hints where appropriate
- Keep functions focused and small
- Add docstrings for public functions

### Commit Messages

Use conventional commit format:

```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Build process or auxiliary tool changes

Example:
```
feat(backend): add rate limiting middleware

Implements per-IP rate limiting with configurable limits.
Defaults to 100 requests per minute.

Closes #123
```

## Testing

### Backend Tests

```bash
# Run all tests
make test-backend

# Run specific test
cd backend && go test -run TestEndToEndWorkflow

# Run with coverage
cd backend && go test -cover ./...

# Run benchmarks
make benchmark
```

### Integration Tests

```bash
# Requires backend to be running
make test-integration
```

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Make** your changes
4. **Add** tests for new functionality
5. **Run** tests and linting (`make test-all && make lint`)
6. **Commit** your changes with conventional commit messages
7. **Push** to your fork (`git push origin feat/amazing-feature`)
8. **Open** a Pull Request

### PR Checklist

- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Code formatted (`make format`)
- [ ] No linting errors (`make lint`)
- [ ] Commit messages follow convention
- [ ] PR description explains changes

## 📁 Project Structure

```
product-requirements-assistant/
├── backend/          # Go REST API
│   ├── main.go      # Server entry point
│   ├── handlers.go  # HTTP handlers
│   ├── models.go    # Data structures
│   ├── storage.go   # File operations
│   ├── validation.go # Input validation
│   ├── config.go    # Configuration
│   ├── middleware.go # HTTP middleware
│   ├── metrics.go   # Metrics collection
│   ├── filepool.go  # File caching
│   └── paths.go     # Path management
├── frontend/        # Streamlit UI
│   ├── app.py       # Main application
│   └── api_client.py # Backend client
├── web/             # Browser-based web app
│   └── README.md    # See web/README.md
├── docs/            # Documentation
│   └── README.md    # See docs/README.md
├── scripts/         # Setup scripts
│   └── README.md    # See scripts/README.md
├── prompts/         # Prompt templates
│   └── README.md    # See prompts/README.md
├── testdata/        # Test fixtures
└── outputs/         # Generated PRDs
```

**See also:**
- [`README.md`](README.md) - Main project documentation
- [`docs/README.md`](docs/README.md) - Complete documentation index
- [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) - System architecture

## Adding New Features

### Backend Endpoint

1. Add route in [`backend/main.go`](backend/main.go)
2. Implement handler in [`backend/handlers.go`](backend/handlers.go)
3. Add validation if needed
4. Add tests in [`backend/e2e_test.go`](backend/e2e_test.go)
5. Update [`docs/architecture/API.md`](docs/architecture/API.md)

### Frontend Feature

1. Add UI components in [`frontend/app.py`](frontend/app.py)
2. Add API client methods in [`frontend/api_client.py`](frontend/api_client.py)
3. Test manually with backend running
4. Update documentation

### Web App Feature

1. Add UI components in [`web/index.html`](web/index.html)
2. Add JavaScript modules in [`web/js/`](web/js/)
3. Test in browser (see [`web/README.md`](web/README.md))
4. Update documentation

## Questions?

Open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements
