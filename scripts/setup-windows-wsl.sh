#!/bin/bash
# Product Requirements Assistant - Windows WSL Setup Script
# Optimized for Windows Subsystem for Linux (Ubuntu/Debian)

set -e

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/common.sh"

# Parse command line arguments
AUTO_YES=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -y|--yes)
            AUTO_YES=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [-y|--yes] [-h|--help]"
            echo ""
            echo "Setup script for Windows WSL (Ubuntu/Debian)"
            echo ""
            echo "Options:"
            echo "  -y, --yes    Automatically answer yes to prompts"
            echo "  -h, --help   Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Usage: $0 [-y|--yes] [-h|--help]"
            exit 1
            ;;
    esac
done

TOTAL_STEPS=7
CURRENT_STEP=0

# Detect WSL
if ! grep -qi microsoft /proc/version; then
    log_warn "This script is optimized for Windows WSL"
    log_warn "Detected environment: $(uname -a)"
    if [ "$AUTO_YES" = false ]; then
        read -p "Continue anyway? [y/N]: " response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "Setup cancelled."
            exit 0
        fi
    fi
fi

# Step 1: Check dependencies
CURRENT_STEP=$((CURRENT_STEP + 1))
log_step $CURRENT_STEP $TOTAL_STEPS "Checking dependencies"

# Update package list
if ! command_exists apt-get; then
    log_error "apt-get not found. This script requires Ubuntu/Debian-based WSL"
    exit 1
fi

log_info "Updating package list..."
sudo apt-get update -qq

# Install Go
if ! command_exists go; then
    log_info "Installing Go..."
    sudo apt-get install -y -qq golang-go
    log_ok "Go installed"
else
    GO_VERSION=$(go version | awk '{print $3}' | sed 's/go//')
    log_ok "Go $GO_VERSION"
fi

# Install Python
if ! command_exists python3; then
    log_info "Installing Python..."
    sudo apt-get install -y -qq python3 python3-pip python3-venv
    log_ok "Python installed"
else
    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    log_ok "Python $PYTHON_VERSION"
fi

# Install Node.js (for Electron client)
if ! command_exists node; then
    log_info "Installing Node.js..."
    # Install Node.js 20.x from NodeSource
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y -qq nodejs
    log_ok "Node.js installed"
else
    NODE_VERSION=$(node --version)
    log_ok "Node.js $NODE_VERSION"
fi

# Install make
if ! command_exists make; then
    log_info "Installing make..."
    sudo apt-get install -y -qq build-essential
    log_ok "Make installed"
else
    log_ok "Make"
fi

# Install curl (for health checks)
if ! command_exists curl; then
    log_info "Installing curl..."
    sudo apt-get install -y -qq curl
    log_ok "curl installed"
else
    log_ok "curl"
fi

# Install WebView2/GTK dependencies for thick client
log_info "Installing WebView2/GTK dependencies..."
sudo apt-get install -y -qq \
    libgtk-3-dev \
    libwebkit2gtk-4.1-dev \
    pkg-config
log_ok "WebView2/GTK dependencies installed"

# Step 2: Install project dependencies
CURRENT_STEP=$((CURRENT_STEP + 1))
log_step $CURRENT_STEP $TOTAL_STEPS "Installing project dependencies"

# Go dependencies
cd backend
go mod download
cd ..
log_ok "Go dependencies installed"

# Python dependencies - create venv if it doesn't exist
if [ ! -d "venv" ]; then
    log_info "Creating Python virtual environment..."
    python3 -m venv venv
    log_ok "Virtual environment created"
fi

log_info "Installing Python dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt
deactivate
log_ok "Python dependencies installed"

# Step 3: Run tests
CURRENT_STEP=$((CURRENT_STEP + 1))
log_step $CURRENT_STEP $TOTAL_STEPS "Running tests"

cd backend
go test ./... > /dev/null 2>&1
cd ..
log_ok "All tests passed"

# Step 4: Clean up existing processes
CURRENT_STEP=$((CURRENT_STEP + 1))
log_step $CURRENT_STEP $TOTAL_STEPS "Cleaning up existing processes"

PORTS_IN_USE=()
if lsof -ti:8080 >/dev/null 2>&1; then
    PORTS_IN_USE+=("8080 (backend)")
fi
if lsof -ti:8501 >/dev/null 2>&1; then
    PORTS_IN_USE+=("8501 (frontend)")
fi

if [ ${#PORTS_IN_USE[@]} -gt 0 ]; then
    echo ""
    log_warn "The following ports are currently in use:"
    for port in "${PORTS_IN_USE[@]}"; do
        echo "    - Port $port"
    done
    echo ""
    echo "This script will kill the processes using these ports."
    echo ""
    
    if [ "$AUTO_YES" = false ]; then
        read -t 3 -p "Continue? [Y/n] (auto-yes in 3s): " response || response="y"
        echo ""
        response=${response:-y}
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "Setup cancelled."
            exit 0
        fi
    fi
fi

# Kill processes
if lsof -ti:8080 >/dev/null 2>&1; then
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    sleep 1
    log_ok "Port 8080 freed"
else
    log_ok "Port 8080 available"
fi

if lsof -ti:8501 >/dev/null 2>&1; then
    lsof -ti:8501 | xargs kill -9 2>/dev/null || true
    sleep 1
    log_ok "Port 8501 freed"
else
    log_ok "Port 8501 available"
fi

# Step 5: Start backend
CURRENT_STEP=$((CURRENT_STEP + 1))
log_step $CURRENT_STEP $TOTAL_STEPS "Starting backend"

nohup make run-backend > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend health check
SECONDS=0
printf "  Waiting for backend"
while true; do
    response=$(curl -s -w "%{http_code}" "http://localhost:8080/api/health" -o /dev/null 2>/dev/null) || true
    if [ "$response" = "200" ]; then
        echo ""
        log_ok "Backend ready (PID: $BACKEND_PID)"
        break
    fi
    if [ $SECONDS -ge 30 ]; then
        echo ""
        log_error "Backend failed to start within 30 seconds"
        echo ""
        echo "Backend log:"
        cat backend.log
        exit 1
    fi
    printf "."
    sleep 1
done

# Step 6: Run integration tests
CURRENT_STEP=$((CURRENT_STEP + 1))
log_step $CURRENT_STEP $TOTAL_STEPS "Running integration tests"

if ! make test-integration >/dev/null 2>&1; then
    log_error "Integration tests failed"
    echo ""
    echo "Backend is still running (PID: $BACKEND_PID)"
    echo "Stop it with: kill $BACKEND_PID"
    exit 1
fi
log_ok "Integration tests passed"

# Cleanup handler
cleanup() {
    echo ""
    echo ""
    echo "Shutting down..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null && echo "  Backend stopped" || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null && echo "  Frontend stopped" || true
    fi
    echo "Done."
    exit 0
}

trap cleanup SIGINT SIGTERM

# Step 7: Start frontend
CURRENT_STEP=$((CURRENT_STEP + 1))
log_step $CURRENT_STEP $TOTAL_STEPS "Starting frontend"

nohup make run-frontend > frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3
log_ok "Frontend ready (PID: $FRONTEND_PID)"

# Application running
echo ""
echo "========================================"
echo "Application running"
echo "========================================"
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:8501"
echo ""
echo "WSL Note: Access from Windows at:"
echo "  http://$(hostname).local:8080"
echo "  http://$(hostname).local:8501"
echo ""
echo "Logs: tail -f backend.log frontend.log"
echo "Stop: Press Ctrl+C"
echo "========================================"
echo ""

# Wait indefinitely
wait

