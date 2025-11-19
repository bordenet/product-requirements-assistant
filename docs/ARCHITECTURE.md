# Architecture Documentation

## System Overview

Product Requirements Assistant is a PRD creation tool with a 3-phase AI-assisted workflow. The application uses Claude Sonnet 4.5 and Gemini 2.5 Pro to generate comprehensive PRDs through an interactive copy/paste process.

## Architecture
- **Backend**: Go REST API server (port 8080)
- **Frontend**: Python Streamlit web application (port 8501)
- **Storage**: Local file system for projects, prompts, and outputs

## Key Directories
- `backend/`: Go REST API with handlers for project management
- `frontend/`: Streamlit UI with interactive workflow
- `prompts/`: Customizable prompt templates for each phase
- `inputs/`: Input documents and project data
- `outputs/`: Generated PRDs and project files (JSON format)

## Development Commands
```bash
# Install dependencies
make install

# Start backend (terminal 1)
make run-backend

# Start frontend (terminal 2) 
make run-frontend

# Test backend
make test-backend

# Format code
make format

# Clean outputs
make clean
```

## Technology Stack

### Backend
- **Language**: Go 1.21+
- **Router**: Gorilla Mux
- **CORS**: rs/cors
- **UUID**: google/uuid
- **Storage**: Local filesystem (JSON)

### Frontend
- **Framework**: Streamlit 1.28.2
- **HTTP Client**: Requests 2.31.0
- **Language**: Python 3.8+

### Infrastructure
- **Ports**: 8080 (backend), 8501 (frontend)
- **Deployment**: Local development, single-user
- **Data**: JSON files with markdown export

## Workflow
1. **Phase 1**: Generate initial prompt for Claude Sonnet 4.5
2. **Phase 2**: Review Phase 1 output with Gemini 2.5 Pro
3. **Phase 3**: Compare both versions and create final PRD with Claude Sonnet 4.5

## Files to Note
- `backend/main.go`: Main server entry point with API routes
- `backend/handlers.go`: API endpoint implementations
- `backend/models.go`: Data structures for projects and phases
- `backend/storage.go`: File system operations
- `frontend/app.py`: Main Streamlit application
- `frontend/api_client.py`: HTTP client for backend communication

## API Endpoints
- `GET /api/health`: Health check
- `POST /api/projects`: Create new project
- `GET /api/projects/{id}`: Get project details
- `POST /api/projects/{id}/phase/{phase}`: Update phase data
- `GET /api/prompts/{phase}`: Get prompt template
- `POST /api/prompts/{phase}`: Update prompt template
- `GET /api/projects`: List all projects

## Development Notes
- Backend serves on localhost:8080
- Frontend serves on localhost:8501
- CORS configured for cross-origin requests
- Project data stored as JSON files with UUID filenames
- Supports markdown export of final PRDs

---

## Development Protocols for AI Assistants

### Git Workflow

**Environment Detection**: This is a local development repository. When work is complete:
1. **Show the user what commands to run** - provide exact git commands as copyable text
2. **Let the user execute them** - they want to learn and maintain control
3. **Do NOT stage files or create commits** unless explicitly requested

**Commit Message Standards**:
```bash
# ✅ Good (imperative mood, specific)
git commit -m "Add pre-commit hook for binary detection"
git commit -m "Fix validation error in project creation"
git commit -m "Update ARCHITECTURE.md with development protocols"

# ❌ Bad (vague, past tense)
git commit -m "Updates"
git commit -m "Fixed stuff"
git commit -m "WIP"
```

### Code Quality Gates

**Go Compilation Protocol** (MANDATORY):
```bash
# 1. Fix linting errors
go vet ./...

# 2. CRITICAL: Check compilation
cd backend && go build

# 3. If imports are unused, remove them
# Then re-run both checks

# 4. Only declare work complete after BOTH pass
```

**Python Linting**:
```bash
# After editing Python files
cd frontend
flake8 . --max-line-length=120 --exclude=venv,__pycache__
black . --exclude='venv|__pycache__'
```

**Pre-Push Validation**:
```bash
# Before committing
./scripts/validate-monorepo.sh --quick    # ~1-2 minutes

# Before releasing
./scripts/validate-monorepo.sh --full     # ~3-5 minutes
```

### Build & Compilation Issues

**MANDATORY 5-Minute / 3-Attempt Escalation Policy**:

When encountering build/compilation errors:
1. **After 5 minutes OR 3 failed attempts**, STOP
2. **Generate web search query** with:
   - Exact error message
   - Environment details (Go version, OS version, tool versions)
   - Project structure (Go + Python + Streamlit)
   - Steps already attempted
3. **DO NOT continue troubleshooting** without external research
4. **Use search findings** to guide solution

**Why This Matters**: Build toolchain issues often have known solutions. Spending 30+ minutes on trial-and-error wastes time when a 2-minute search reveals the answer.

### Shell Script Standards

All shell scripts in this repository follow standardized conventions:

**Required Structure**:
```bash
#!/usr/bin/env bash

################################################################################
# Product Requirements Assistant - <Script Purpose>
################################################################################
# PURPOSE: <One sentence description>
# USAGE: ./<script-name> [options]
# DEPENDENCIES: <list tools>
################################################################################

# Source common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
init_script

# Main function
main() {
    log_header "Script Name"
    log_section "Step 1"
    # Do work
    log_success "Complete"
}

main "$@"
```

**Available Logging Functions** (from `scripts/lib/common.sh`):
- `log_info "message"` - Standard information
- `log_success "message"` - Operation completed
- `log_warning "message"` - Non-fatal issues
- `log_error "message"` - Errors (continues)
- `die "message"` - Fatal errors (exits)
- `log_header "title"` - Major section
- `log_section "title"` - Minor section

**Never use raw `echo`** - always use the logging functions for consistency.

### Safety Net

This repository has automated safety mechanisms:

**Pre-Commit Hooks** (installed via `./scripts/install-hooks.sh`):
- ✅ Binary detection - prevents compiled files from being committed
- ✅ Secret scanning - prevents credentials from being committed
- ✅ Optional validation - can run quick checks on every commit

**Validation System** (`./scripts/validate-monorepo.sh`):
- `--quick`: Dependencies, builds, linting, tests (~1-2 min)
- `--full`: Quick + security scans, git status (~3-5 min)

**To bypass hooks in emergencies**:
```bash
git commit --no-verify -m "Emergency fix"
```
⚠️ Only use `--no-verify` when absolutely necessary!

### Token Conservation

**Efficient File Reading**:
```bash
# ❌ Bad: Read entire large file
view backend/handlers.go

# ✅ Good: Search for specific code
view backend/handlers.go --search "CreateProject"

# ✅ Better: Use codebase-retrieval for discovery
codebase-retrieval "Where is the project creation handler?"
```

**Avoid Redundant Operations**:
- Don't re-read files you just read unless user reports issues
- Trust your context from recent reads
- Use parallel tool calls when reading multiple files

### Common Tasks

**Start Development Environment**:
```bash
# Terminal 1: Backend
make run-backend

# Terminal 2: Frontend
make run-frontend

# Terminal 3: Watch logs
tail -f backend/server.log
```

**Run All Tests**:
```bash
make test-all
```

**Validate Before Commit**:
```bash
./scripts/validate-monorepo.sh --quick
```

**Format All Code**:
```bash
make format
```

**Clean Build Artifacts**:
```bash
make clean
```

### Debugging Protocol

**Backend Issues**:
```bash
# Check backend logs
tail -f backend/server.log

# Test API directly
curl http://localhost:8080/api/health

# Run backend tests with verbose output
cd backend && go test -v ./...
```

**Frontend Issues**:
```bash
# Check Streamlit logs in terminal
# Streamlit shows errors in browser and terminal

# Test API client
cd frontend && python3 -c "from api_client import APIClient; print(APIClient().health_check())"
```

**Validation Issues**:
```bash
# Run with debug output
DEBUG=1 ./scripts/validate-monorepo.sh --quick

# Run individual checks
cd backend && go vet ./...
cd backend && go build
cd frontend && flake8 .
```

### Project Structure Validation

Required directories:
- `backend/` - Go REST API
- `frontend/` - Streamlit UI
- `docs/` - Documentation
- `scripts/` - Automation scripts
- `scripts/lib/` - Common shell library
- `prompts/` - Prompt templates
- `inputs/` - Input documents
- `outputs/` - Generated PRDs

Required files:
- `backend/go.mod` - Go dependencies
- `backend/main.go` - Backend entry point
- `frontend/app.py` - Frontend entry point
- `README.md` - Project documentation
- `.gitignore` - Git ignore patterns
- `Makefile` - Build automation

### Security Best Practices

**Never commit**:
- `.env` files (use `.env.example` as template)
- Compiled binaries (build from source)
- API keys or credentials
- Large binary files

**Pre-commit hooks will block**:
- Compiled binaries (Mach-O, ELF, PE32)
- Common secret patterns (AWS keys, API keys, passwords)

**If you need to commit something blocked**:
1. Review why it's blocked
2. Ensure it's safe
3. Use `git commit --no-verify` only if absolutely necessary
4. Document why in commit message

### Quick Reference

**Before Starting Work**:
1. Check git status if another AI worked on this
2. Read this ARCHITECTURE.md file
3. Understand the current state of the codebase

**During Work**:
1. Escalate build issues after 5min / 3 attempts
2. Run `go build` after linting fixes (Go projects)
3. Use logging functions in shell scripts (no raw `echo`)
4. Never modify source files in place (use build/ directory)

**Before Committing**:
1. Run `./scripts/validate-monorepo.sh --quick`
2. Check that you haven't staged binaries or credentials
3. Write descriptive commit message (imperative mood)

**After Work Complete**:
1. Show user the git commands to run
2. Let user execute them (don't run git commands yourself)
3. Provide summary of changes made

---

## Maintenance

**Weekly**:
- Run `./scripts/validate-monorepo.sh --full`
- Review pre-commit hook execution times

**Monthly**:
- Update dependencies (`go get -u ./...`, `pip list --outdated`)
- Review `.gitignore` for new artifact patterns

**When Adding New Features**:
- Update this ARCHITECTURE.md with new patterns
- Add tests for new functionality
- Update API.md if adding new endpoints
- Run full validation before committing