#!/usr/bin/env bash
# Product Requirements Assistant - Linux Setup Script
# Optimized for minimal vertical space with running timer

set -euo pipefail

# Source compact output library
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/compact.sh"

# Parse command line arguments
# shellcheck disable=SC2034
AUTO_YES=false
FORCE_INSTALL=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            export VERBOSE=1
            shift
            ;;
        -y|--yes)
            AUTO_YES=true
            shift
            ;;
        -f|--force)
            FORCE_INSTALL=true
            shift
            ;;
        -h|--help)
            cat << EOF
Usage: $(basename "$0") [OPTIONS]

Setup script for Linux (Ubuntu/Debian)

OPTIONS:
  -v, --verbose    Show detailed output (default: compact)
  -y, --yes        Automatically answer yes to prompts
  -f, --force      Force reinstall all dependencies
  -h, --help       Show this help message

EXAMPLES:
  $(basename "$0")              # Fast setup, only install missing items
  $(basename "$0") -v           # Verbose output
  $(basename "$0") -f           # Force reinstall everything
  $(basename "$0") -v -f        # Verbose + force reinstall

PERFORMANCE:
  First run:  ~2-3 minutes (installs everything)
  Subsequent: ~5-10 seconds (checks only, skips installed)

EOF
            exit 0
            ;;
        *)
            echo "Error: Unknown option: $1"
            echo "Run '$(basename "$0") --help' for usage information"
            exit 1
            ;;
    esac
done

# Navigate to project root
cd "$SCRIPT_DIR/.."
PROJECT_ROOT=$(pwd)

print_header "Product Requirements Assistant - Linux Setup"

# Cache file for tracking installed packages
CACHE_DIR="$PROJECT_ROOT/.setup-cache"
mkdir -p "$CACHE_DIR"

# Helper: Check if package is cached
is_cached() {
    local pkg="$1"
    [[ -f "$CACHE_DIR/$pkg" ]] && [[ $FORCE_INSTALL == false ]]
}

# Helper: Mark package as cached
mark_cached() {
    local pkg="$1"
    touch "$CACHE_DIR/$pkg"
}

# Step 1: Check Node.js
task_start "Checking Node.js"

if ! command -v node &>/dev/null; then
    task_start "Installing Node.js"
    # Update apt cache
    sudo apt-get update -qq 2>&1 | verbose
    # Install Node.js from NodeSource
    curl -fsSL https://deb.nodesource.com/setup_20.x 2>&1 | verbose | sudo -E bash - 2>&1 | verbose
    sudo apt-get install -y -qq nodejs 2>&1 | verbose
    mark_cached "nodejs"
    task_ok "Node.js installed"
fi
verbose "Node.js $(node --version)"
verbose "npm $(npm --version)"
task_ok "Node.js ready"

# Step 2: Install npm dependencies
PACKAGE_HASH=$(md5sum package.json 2>/dev/null | awk '{print $1}' || echo "none")
if [[ $FORCE_INSTALL == true ]] || ! is_cached "npm-deps-$PACKAGE_HASH"; then
    task_start "Installing npm dependencies"
    npm install 2>&1 | verbose
    mark_cached "npm-deps-$PACKAGE_HASH"
    task_ok "npm dependencies installed"
else
    task_skip "npm dependencies"
fi

# Step 3: Run linter
task_start "Running linter"
if npm run lint 2>&1 | verbose; then
    task_ok "Linter passed"
else
    task_warn "Linter found issues (run 'npm run lint:fix' to auto-fix)"
fi

# Step 4: Run tests
task_start "Running tests"
if npm test 2>&1 | verbose; then
    task_ok "Tests passed"
else
    task_fail "Tests failed"
    exit 1
fi

# Done
echo ""
print_header "✓ Setup complete! $(get_elapsed_time)"
echo ""
echo "Next steps:"
echo "  npm run serve       # Start local development server"
echo "  npm test            # Run tests"
echo "  npm run lint        # Run linter"
echo ""
echo "Run with -v for verbose output, -f to force reinstall"
