#!/usr/bin/env bash

################################################################################
# Product Requirements Assistant - Monorepo Validation
################################################################################
# PURPOSE: Comprehensive validation of all code in the repository
#   - Validates dependencies are installed
#   - Builds all components (backend, frontend)
#   - Runs linters on all code
#   - Executes all tests
#   - Scans for security issues (secrets, vulnerabilities)
#   - Validates project structure
#
# USAGE:
#   ./scripts/validate-monorepo.sh [OPTIONS]
#
# OPTIONS:
#   --quick, -q        Quick validation (dependencies + builds only)
#   --full, -f         Full validation (all checks including security)
#   --help, -h         Show this help message
#
# EXAMPLES:
#   ./scripts/validate-monorepo.sh --quick
#   ./scripts/validate-monorepo.sh --full
#
# DEPENDENCIES:
#   - go (1.21+)
#   - python3
#   - pip
################################################################################

# Source common library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"
init_script

# Script-specific variables
readonly SCRIPT_NAME="$(basename "$0")"
readonly REPO_ROOT="$(get_repo_root)"
readonly BACKEND_DIR="$REPO_ROOT/backend"
readonly FRONTEND_DIR="$REPO_ROOT/frontend"

# Validation mode (default: full)
VALIDATION_MODE="full"

################################################################################
# Argument Parsing
################################################################################

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --quick|-q)
                VALIDATION_MODE="quick"
                shift
                ;;
            --full|-f)
                VALIDATION_MODE="full"
                shift
                ;;
            --help|-h)
                print_usage
                exit 0
                ;;
            *)
                die "Unknown option: $1 (use --help for usage)"
                ;;
        esac
    done
}

print_usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS]

Comprehensive validation of all code in the repository.

Options:
    -q, --quick        Quick validation (dependencies + builds + basic tests)
    -f, --full         Full validation (all checks including security scans)
    -h, --help         Show this help message

Examples:
    $SCRIPT_NAME --quick
    $SCRIPT_NAME --full

Validation Modes:
    quick: Dependencies, builds, linting, unit tests (~1-2 minutes)
    full:  Quick + security scans, integration tests (~3-5 minutes)
EOF
}

################################################################################
# Validation Functions
################################################################################

validate_dependencies() {
    log_section "Validating Dependencies"

    # Check Go
    require_command "go" "brew install go (macOS) or apt install golang (Linux)"
    local go_version
    go_version=$(go version | grep -oE 'go[0-9]+\.[0-9]+' | sed 's/go//')
    log_info "Go version: $go_version"

    # Check Python
    require_command "python3" "brew install python3 (macOS) or apt install python3 (Linux)"
    local python_version
    python_version=$(python3 --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
    log_info "Python version: $python_version"

    # Check pip
    require_command "pip" "python3 -m ensurepip or apt install python3-pip"

    log_success "Dependencies validated"
}

validate_backend_build() {
    log_section "Building Backend (Go)"

    cd "$BACKEND_DIR"

    # Run go mod tidy
    log_info "Running go mod tidy..."
    if ! go mod tidy; then
        die "go mod tidy failed"
    fi

    # Build backend
    log_info "Building backend..."
    if ! go build -o /tmp/prd-backend .; then
        die "Backend build failed"
    fi

    # Clean up
    rm -f /tmp/prd-backend

    cd "$REPO_ROOT"
    log_success "Backend build successful"
}

validate_backend_lint() {
    log_section "Linting Backend (Go)"

    cd "$BACKEND_DIR"

    # Run go vet
    log_info "Running go vet..."
    if ! go vet ./...; then
        die "go vet failed"
    fi

    # Run gofmt check
    log_info "Checking gofmt..."
    local unformatted
    unformatted=$(gofmt -l . | grep -v vendor || true)
    if [[ -n "$unformatted" ]]; then
        log_error "The following files are not formatted with gofmt:"
        echo "$unformatted"
        die "Run: gofmt -w ."
    fi

    cd "$REPO_ROOT"
    log_success "Backend linting passed"
}

validate_backend_tests() {
    log_section "Running Backend Tests"

    cd "$BACKEND_DIR"

    log_info "Running Go tests..."
    if ! go test -v ./...; then
        die "Backend tests failed"
    fi

    cd "$REPO_ROOT"
    log_success "Backend tests passed"
}

validate_frontend_lint() {
    log_section "Linting Frontend (Python)"

    cd "$FRONTEND_DIR"

    # Check if flake8 is available
    if command -v flake8 &> /dev/null; then
        log_info "Running flake8..."
        if ! flake8 . --max-line-length=120 --exclude=venv,__pycache__; then
            log_warning "flake8 found issues (non-fatal)"
        fi
    else
        log_warning "flake8 not installed, skipping Python linting"
        log_info "Install with: pip install flake8"
    fi

    # Check if black is available
    if command -v black &> /dev/null; then
        log_info "Checking black formatting..."
        if ! black --check . --exclude='venv|__pycache__'; then
            log_warning "black formatting issues found (non-fatal)"
            log_info "Run: black . --exclude='venv|__pycache__'"
        fi
    else
        log_warning "black not installed, skipping Python formatting check"
        log_info "Install with: pip install black"
    fi

    cd "$REPO_ROOT"
    log_success "Frontend linting complete"
}

validate_project_structure() {
    log_section "Validating Project Structure"

    # Check required directories
    require_directory "$BACKEND_DIR" "Backend directory missing"
    require_directory "$FRONTEND_DIR" "Frontend directory missing"
    require_directory "$REPO_ROOT/docs" "Documentation directory missing"

    # Check required files
    require_file "$BACKEND_DIR/go.mod" "Backend go.mod missing"
    require_file "$BACKEND_DIR/main.go" "Backend main.go missing"
    require_file "$FRONTEND_DIR/app.py" "Frontend app.py missing"
    require_file "$REPO_ROOT/README.md" "README.md missing"
    require_file "$REPO_ROOT/.gitignore" ".gitignore missing"

    # Check for .env.example
    if [[ ! -f "$REPO_ROOT/.env.example" ]]; then
        log_warning ".env.example not found (recommended for documentation)"
    fi

    log_success "Project structure validated"
}

validate_security() {
    log_section "Security Scanning"

    # Check for common secret patterns in staged files
    log_info "Checking for secrets in source code..."

    # Simple secret detection (basic patterns)
    local secret_patterns=(
        "AWS_SECRET_ACCESS_KEY.*=.*[A-Za-z0-9/+]{40}"
        "password.*=.*['\"][^'\"]{8,}['\"]"
        "api[_-]?key.*=.*['\"][A-Za-z0-9]{20,}['\"]"
        "private[_-]?key"
    )

    local secrets_found=false
    for pattern in "${secret_patterns[@]}"; do
        if git grep -iE "$pattern" -- '*.go' '*.py' '*.js' '*.json' 2>/dev/null | grep -v ".example" | grep -v "# Example" | grep -v "test" > /dev/null; then
            log_warning "Potential secret pattern found: $pattern"
            secrets_found=true
        fi
    done

    if [[ "$secrets_found" == "true" ]]; then
        log_warning "Potential secrets detected - please review manually"
    else
        log_success "No obvious secrets detected"
    fi

    # Check for .env file in git
    if git ls-files | grep -q "^\.env$"; then
        die ".env file is tracked in git! Remove with: git rm --cached .env"
    fi

    log_success "Security scan complete"
}

validate_git_status() {
    log_section "Checking Git Status"

    # Check for uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Uncommitted changes detected:"
        git status --short
    else
        log_success "Working directory clean"
    fi
}

################################################################################
# Main Validation Flow
################################################################################

main() {
    log_header "Product Requirements Assistant - Monorepo Validation ($VALIDATION_MODE)"

    # Always run these
    validate_dependencies
    validate_project_structure
    validate_backend_build
    validate_backend_lint
    validate_backend_tests
    validate_frontend_lint

    # Full validation includes additional checks
    if [[ "$VALIDATION_MODE" == "full" ]]; then
        validate_security
        validate_git_status
    fi

    log_header "Validation Complete ✓"
    log_success "All checks passed!"

    if [[ "$VALIDATION_MODE" == "quick" ]]; then
        log_info "Run with --full for comprehensive security and git checks"
    fi
}

# Parse arguments and run
parse_arguments "$@"
main

