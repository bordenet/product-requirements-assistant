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

# Step 1: System dependencies
task_start "Checking system dependencies"

# Update apt cache only if needed (once per day)
if [[ $FORCE_INSTALL == true ]] || ! is_cached "apt-updated-$(date +%Y%m%d)"; then
    verbose "Updating package list..."
    sudo apt-get update -qq 2>&1 | verbose
    mark_cached "apt-updated-$(date +%Y%m%d)"
fi

# Check Go
if ! command -v go &>/dev/null; then
    task_fail "Go not installed"
    echo "Install Go 1.21+ from: https://go.dev/dl/"
    exit 1
fi
verbose "Go $(go version | awk '{print $3}' | sed 's/go//')"

# Check Python
if ! command -v python3 &>/dev/null; then
    task_start "Installing Python"
    sudo apt-get install -y -qq python3 python3-pip python3-venv 2>&1 | verbose
    mark_cached "python3"
    task_ok "Python installed"
fi
verbose "Python $(python3 --version | awk '{print $2}')"

# Check Node.js
if ! command -v node &>/dev/null; then
    task_start "Installing Node.js"
    curl -fsSL https://deb.nodesource.com/setup_20.x 2>&1 | verbose | sudo -E bash - 2>&1 | verbose
    sudo apt-get install -y -qq nodejs 2>&1 | verbose
    mark_cached "nodejs"
    task_ok "Node.js installed"
fi
verbose "Node.js $(node --version)"

# Check WebView2/GTK dependencies
if [[ $FORCE_INSTALL == true ]] || ! is_cached "webview-deps"; then
    if ! dpkg -l | grep -q libwebkit2gtk-4.1-dev 2>/dev/null; then
        task_start "Installing WebView2/GTK dependencies"
        sudo apt-get install -y -qq libgtk-3-dev libwebkit2gtk-4.1-dev pkg-config 2>&1 | verbose
        mark_cached "webview-deps"
        task_ok "WebView2/GTK dependencies installed"
    else
        task_skip "WebView2/GTK dependencies"
    fi
else
    task_skip "WebView2/GTK dependencies"
fi

task_ok "System dependencies ready"

# Step 2: Go dependencies
if [[ $FORCE_INSTALL == true ]] || ! is_cached "go-deps"; then
    task_start "Installing Go dependencies"
    cd backend
    go mod download 2>&1 | verbose
    cd ..
    mark_cached "go-deps"
    task_ok "Go dependencies installed"
else
    task_skip "Go dependencies"
fi

# Step 3: Python virtual environment
if [ ! -d "venv" ]; then
    task_start "Creating Python virtual environment"
    python3 -m venv venv 2>&1 | verbose
    task_ok "Virtual environment created"
else
    task_skip "Python virtual environment"
fi

# Step 4: Python dependencies (smart check)
REQUIREMENTS_HASH=$(md5sum requirements.txt | awk '{print $1}')
if [[ $FORCE_INSTALL == true ]] || ! is_cached "py-deps-$REQUIREMENTS_HASH"; then
    task_start "Installing Python dependencies"
    source venv/bin/activate

    if [[ $FORCE_INSTALL == true ]]; then
        pip install -q -r requirements.txt 2>&1 | verbose
    else
        # Check each package individually (faster than full install)
        while IFS= read -r pkg; do
            [[ -z "$pkg" ]] && continue
            [[ "$pkg" =~ ^# ]] && continue
            pkg_name=$(echo "$pkg" | cut -d'=' -f1 | cut -d'>' -f1 | cut -d'<' -f1 | tr -d ' ')
            if ! pip show "$pkg_name" &>/dev/null; then
                verbose "Installing $pkg_name..."
                pip install -q "$pkg" 2>&1 | verbose
            fi
        done < requirements.txt
    fi

    deactivate
    mark_cached "py-deps-$REQUIREMENTS_HASH"
    task_ok "Python dependencies installed"
else
    task_skip "Python dependencies"
fi

# Step 5: Quick validation
task_start "Validating setup"
cd backend
if go build -o /tmp/prd-test . 2>&1 | verbose; then
    rm -f /tmp/prd-test
    cd ..
    task_ok "Setup validated"
else
    cd ..
    task_fail "Validation failed"
    exit 1
fi

# Done
echo ""
print_header "✓ Setup complete! $(get_elapsed_time)"
echo ""
echo "Next steps:"
echo "  make run-backend    # Start Go backend (port 8080)"
echo "  make run-frontend   # Start Streamlit frontend (port 8501)"
echo "  ./run-thick-clients.sh  # Launch desktop clients"
echo ""
echo "Run with -v for verbose output, -f to force reinstall"

