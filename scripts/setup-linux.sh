#!/bin/bash

# Cross-platform setup script for Product Requirements Assistant
# Supports macOS (Homebrew) and Linux (apt)

set -e

# Function to check if a command is available
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print step with consistent formatting
print_step() {
    echo ""
    echo "[$1/$2] $3"
}

# Print success
print_ok() {
    echo "  ✓ $1"
}

# Print error
print_error() {
    echo "  ✗ $1"
}

# Detect OS and set package manager
detect_os() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        PKG_MGR="brew"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        if command_exists apt-get; then
            PKG_MGR="apt"
        else
            print_error "Unsupported Linux distribution (apt not found)"
            exit 1
        fi
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Install package using appropriate package manager
install_package() {
    local pkg=$1
    case $PKG_MGR in
        brew)
            brew install "$pkg" >/dev/null 2>&1
            ;;
        apt)
            sudo apt-get update >/dev/null 2>&1
            sudo apt-get install -y "$pkg" >/dev/null 2>&1
            ;;
    esac
}

TOTAL_STEPS=7
CURRENT_STEP=0

# Detect OS
detect_os

# --- Dependency Checks ---
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "Checking dependencies"

# Check package manager
if [ "$PKG_MGR" = "brew" ] && ! command_exists brew; then
    print_error "Homebrew not found"
    echo "Please install Homebrew: https://brew.sh/"
    exit 1
fi

# Check/install Go
if ! command_exists go; then
    echo "  Installing Go..."
    case $PKG_MGR in
        brew)
            install_package go
            ;;
        apt)
            install_package golang-go
            ;;
    esac
    print_ok "Go installed"
else
    print_ok "Go"
fi

# Check/install Python3
if ! command_exists python3; then
    echo "  Installing Python3..."
    case $PKG_MGR in
        brew)
            install_package python
            ;;
        apt)
            install_package python3
            install_package python3-pip
            ;;
    esac
    print_ok "Python3 installed"
else
    print_ok "Python3"
fi

# Check/install pip
if ! command_exists pip3 && ! python3 -m pip --version >/dev/null 2>&1; then
    echo "  Installing pip..."
    case $PKG_MGR in
        brew)
            # pip comes with python on macOS
            ;;
        apt)
            install_package python3-pip
            ;;
    esac
    print_ok "pip installed"
fi

# --- Project Setup ---
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "Installing dependencies"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "  Creating Python virtual environment..."
    python3 -m venv venv >/dev/null 2>&1
fi

# Install dependencies
cd backend && go mod download && go mod tidy >/dev/null 2>&1
cd ..
./venv/bin/pip install -r requirements.txt >/dev/null 2>&1
print_ok "Dependencies installed"

# --- Testing ---
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "Running tests"
make test-all >/dev/null 2>&1
print_ok "Unit tests passed"

# --- Clean up existing processes ---
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "Cleaning up existing processes"

# Function to check if port is in use (cross-platform)
check_port() {
    local port=$1
    if command_exists lsof; then
        lsof -ti:$port >/dev/null 2>&1
    elif command_exists fuser; then
        fuser $port/tcp >/dev/null 2>&1
    elif command_exists nc; then
        nc -z localhost $port 2>/dev/null
    else
        return 1
    fi
}

# Check if any ports are in use
PORTS_IN_USE=()
if check_port 8080; then
    PORTS_IN_USE+=("8080 (backend)")
fi
if check_port 8501; then
    PORTS_IN_USE+=("8501 (frontend)")
fi
if check_port 8502; then
    PORTS_IN_USE+=("8502 (frontend-alt)")
fi

# If any ports are in use, warn the user
if [ ${#PORTS_IN_USE[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  WARNING: The following ports are currently in use:"
    for port in "${PORTS_IN_USE[@]}"; do
        echo "    - Port $port"
    done
    echo ""
    echo "This script will kill the processes using these ports."
    echo ""

    # Prompt with 3-second timeout (defaults to Yes)
    read -t 3 -p "Continue? [Y/n] (auto-yes in 3s): " response || response="y"
    echo ""

    # Default to yes if empty or timeout
    response=${response:-y}

    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled by user."
        exit 0
    fi
fi

# Function to kill process on port (cross-platform)
kill_port() {
    local port=$1
    if command_exists lsof; then
        # macOS and most Linux systems
        if lsof -ti:$port >/dev/null 2>&1; then
            echo "  Killing existing process on port $port..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 1
            print_ok "Port $port freed"
        else
            print_ok "Port $port available"
        fi
    elif command_exists fuser; then
        # Linux alternative if lsof not available
        if fuser $port/tcp >/dev/null 2>&1; then
            echo "  Killing existing process on port $port..."
            fuser -k $port/tcp 2>/dev/null || true
            sleep 1
            print_ok "Port $port freed"
        else
            print_ok "Port $port available"
        fi
    else
        # Fallback: just check if port is available
        if nc -z localhost $port 2>/dev/null; then
            print_error "Port $port is in use but cannot kill process (lsof/fuser not available)"
            echo "  Please manually stop the process using port $port"
            exit 1
        else
            print_ok "Port $port available"
        fi
    fi
}

# Kill processes on required ports
kill_port 8080  # Backend
kill_port 8501  # Frontend
kill_port 8502  # Alternate Streamlit port

# --- Running the Application ---
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "Starting backend"

nohup make run-backend > backend.log 2>&1 &
BACKEND_PID=$!

# Wait for backend health check
SECONDS=0
printf "  Waiting for backend"
while true; do
    response=$(curl -s -w "%{http_code}" "http://localhost:8080/api/health" -o /dev/null 2>/dev/null) || true
    if [ "$response" = "200" ]; then
        echo ""
        print_ok "Backend ready (PID: $BACKEND_PID)"
        break
    fi
    if [ $SECONDS -ge 30 ]; then
        echo ""
        print_error "Backend failed to start within 30 seconds"
        echo ""
        echo "Backend log:"
        cat backend.log
        exit 1
    fi
    printf "."
    sleep 1
done

# --- Integration Testing ---
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "Running integration tests"
if ! make test-integration >/dev/null 2>&1; then
    print_error "Integration tests failed"
    echo ""
    echo "Backend is still running (PID: $BACKEND_PID)"
    echo "Stop it with: kill $BACKEND_PID"
    exit 1
fi
print_ok "Integration tests passed"

# --- Cleanup Handler ---
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

# --- Frontend ---
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "Starting frontend"
nohup make run-frontend > frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 3
print_ok "Frontend ready (PID: $FRONTEND_PID)"

# --- Application Running ---
echo ""
echo "========================================"
echo "Application running"
echo "========================================"
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:8501"
echo ""
echo "Logs: tail -f backend.log frontend.log"
echo "Stop:  Press Ctrl+C"
echo "========================================"
echo ""

# Open browser (platform-specific)
if [ "$OS" = "macos" ]; then
    open http://localhost:8501 2>/dev/null || true
elif [ "$OS" = "linux" ]; then
    xdg-open http://localhost:8501 2>/dev/null || true
fi

# Wait indefinitely until user presses Ctrl+C
wait
