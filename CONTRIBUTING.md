# Contributing to Product Requirements Assistant

## Development Setup

### Prerequisites

- Go 1.21 or higher
- Python 3.8 or higher
- Make

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/product-requirements-assistant.git
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

## Project Structure

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
├── docs/            # Documentation
├── scripts/         # Setup scripts
├── prompts/         # Prompt templates
├── testdata/        # Test fixtures
└── outputs/         # Generated PRDs
```

## Adding New Features

### Backend Endpoint

1. Add route in `backend/main.go`
2. Implement handler in `backend/handlers.go`
3. Add validation if needed
4. Add tests in `backend/e2e_test.go`
5. Update `docs/API.md`

### Frontend Feature

1. Add UI components in `frontend/app.py`
2. Add API client methods in `frontend/api_client.py`
3. Test manually with backend running
4. Update documentation

## Questions?

Open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- Suggestions for improvements

