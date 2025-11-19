#!/usr/bin/env bash
# Product Requirements Assistant - Thick Client Launcher
# Builds and runs both WebView2 and Electron clients side-by-side

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Source compact output library
source "$SCRIPT_DIR/scripts/lib/compact.sh"

# Parse arguments
MODE=""
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            export VERBOSE=1
            shift
            ;;
        -m|--mode)
            MODE="$2"
            shift 2
            ;;
        -h|--help)
            cat << EOF
Usage: $(basename "$0") [OPTIONS]

Builds and runs WebView2 and Electron thick clients side-by-side.

OPTIONS:
  -v, --verbose    Show detailed output (default: compact)
  -m, --mode MODE  Set mode: dev, prod, or build (default: interactive)
  -h, --help       Show this help message

MODES:
  dev    Development mode (quick start, no build)
  prod   Production mode (build binaries, then run)
  build  Build only (no run)

EXAMPLES:
  $(basename "$0")              # Interactive mode selection
  $(basename "$0") -m dev       # Development mode
  $(basename "$0") -m prod -v   # Production mode with verbose output

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

# Cleanup function
WEBVIEW_PID=""
ELECTRON_PID=""

cleanup() {
    verbose "Shutting down clients..."
    if [ -n "$WEBVIEW_PID" ]; then
        kill "$WEBVIEW_PID" 2>/dev/null || true
    fi
    if [ -n "$ELECTRON_PID" ]; then
        kill "$ELECTRON_PID" 2>/dev/null || true
    fi
    Show-Cursor 2>/dev/null || printf "%s" "${ANSI_SHOW_CURSOR}"
}

trap cleanup SIGINT SIGTERM EXIT

print_header "Product Requirements Assistant - Thick Client Launcher"

# Check prerequisites
task_start "Checking prerequisites"

if ! command -v go &>/dev/null; then
    task_fail "Go not installed"
    exit 1
fi
verbose "Go: $(go version)"

if ! command -v node &>/dev/null; then
    task_fail "Node.js not installed"
    exit 1
fi
verbose "Node.js: $(node --version)"

if ! command -v npm &>/dev/null; then
    task_fail "npm not installed"
    exit 1
fi
verbose "npm: $(npm --version)"

task_ok "Prerequisites checked"

# Interactive mode selection if not specified
if [ -z "$MODE" ]; then
    echo ""
    echo "Select mode:"
    echo "  1) Development (quick start, no build)"
    echo "  2) Production (build binaries, then run)"
    echo "  3) Build only (no run)"
    echo ""
    read -r -p "Enter choice [1-3]: " choice

    case $choice in
        1) MODE="dev" ;;
        2) MODE="prod" ;;
        3) MODE="build" ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
    echo ""
fi

# Build if needed
if [ "$MODE" = "prod" ] || [ "$MODE" = "build" ]; then
    task_start "Building WebView2 client"
    cd cmd/webview

    go mod tidy 2>&1 | verbose
    mkdir -p ../../dist/webview

    # Detect platform and build
    if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
        CGO_ENABLED=1 go build -o ../../dist/webview/prd-assistant . 2>&1 | verbose
        verbose "Built: dist/webview/prd-assistant"
    else
        task_warn "Unsupported platform for WebView2 build"
        cd "$SCRIPT_DIR"
        exit 1
    fi

    cd "$SCRIPT_DIR"
    task_ok "WebView2 client built"

    task_start "Building Electron client"
    cd cmd/electron
    npm install --silent 2>&1 | verbose
    cd "$SCRIPT_DIR"
    task_ok "Electron client built"
fi

# Exit if build-only mode
if [ "$MODE" = "build" ]; then
    echo ""
    print_header "Build complete! $(get_elapsed_time)"
    exit 0
fi

# Run clients
echo ""
print_section "Starting Thick Clients"

task_start "Starting WebView2 client"
if [ "$MODE" = "dev" ]; then
    cd cmd/webview
    go run . >/dev/null 2>&1 &
    WEBVIEW_PID=$!
    cd "$SCRIPT_DIR"
else
    ./dist/webview/prd-assistant >/dev/null 2>&1 &
    WEBVIEW_PID=$!
fi
verbose "PID: $WEBVIEW_PID"
task_ok "WebView2 client started"

# Wait for ports
sleep 3

task_start "Starting Electron client"
cd cmd/electron
npm start >/dev/null 2>&1 &
ELECTRON_PID=$!
cd "$SCRIPT_DIR"
verbose "PID: $ELECTRON_PID"
task_ok "Electron client started"

# Instructions
echo ""
print_header "Both clients running!"
echo ""
echo "WebView2:  Native window (8.2MB bundle)"
echo "Electron:  Chromium window (150MB bundle)"
echo ""
echo "Press Ctrl+C to stop both clients"

# Wait for user interrupt
wait

