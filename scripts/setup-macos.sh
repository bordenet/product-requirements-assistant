#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Parse command line arguments
AUTO_YES=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -y|--yes)
            AUTO_YES=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [-y|--yes]"
            echo "  -y, --yes    Automatically answer yes to prompts"
            exit 1
            ;;
    esac
done

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

TOTAL_STEPS=7
CURRENT_STEP=0

# --- Dependency Checks ---
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "Checking dependencies"

if ! command_exists brew; then
    print_error "Homebrew not found"
    echo "Please install Homebrew: https://brew.sh/"
    exit 1
fi

if ! command_exists go; then
    echo "  Installing Go..."
    brew install go >/dev/null 2>&1
    print_ok "Go installed"
else
    print_ok "Go"
fi

if ! command_exists python3; then
    echo "  Installing Python..."
    brew install python >/dev/null 2>&1
    print_ok "Python installed"
else
    print_ok "Python3"
fi

# --- Project Setup ---
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "Installing dependencies"
make install >/dev/null 2>&1
print_ok "Dependencies installed"

# --- Testing ---
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "Running tests"
make test-all >/dev/null 2>&1
print_ok "Unit tests passed"

# --- Clean up existing processes ---
CURRENT_STEP=$((CURRENT_STEP + 1))
print_step $CURRENT_STEP $TOTAL_STEPS "Cleaning up existing processes"

# Check if any ports are in use
PORTS_IN_USE=()
if lsof -ti:8080 >/dev/null 2>&1; then
    PORTS_IN_USE+=("8080 (backend)")
fi
if lsof -ti:8501 >/dev/null 2>&1; then
    PORTS_IN_USE+=("8501 (frontend)")
fi
if lsof -ti:8502 >/dev/null 2>&1; then
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

    # Skip prompt if -y flag is set
    if [ "$AUTO_YES" = true ]; then
        echo "Auto-confirming (--yes flag set)"
        response="y"
    else
        # Prompt with 3-second timeout (defaults to Yes)
        read -t 3 -p "Continue? [Y/n] (auto-yes in 3s): " response || response="y"
        echo ""
    fi

    # Default to yes if empty or timeout
    response=${response:-y}

    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled by user."
        exit 0
    fi
fi

# Kill processes on port 8080 (backend)
if lsof -ti:8080 >/dev/null 2>&1; then
    echo "  Killing existing process on port 8080..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null || true
    sleep 1
    print_ok "Port 8080 freed"
else
    print_ok "Port 8080 available"
fi

# Kill processes on port 8501 (frontend)
if lsof -ti:8501 >/dev/null 2>&1; then
    echo "  Killing existing process on port 8501..."
    lsof -ti:8501 | xargs kill -9 2>/dev/null || true
    sleep 1
    print_ok "Port 8501 freed"
else
    print_ok "Port 8501 available"
fi

# Also check for port 8502 (alternate Streamlit port)
if lsof -ti:8502 >/dev/null 2>&1; then
    echo "  Killing existing process on port 8502..."
    lsof -ti:8502 | xargs kill -9 2>/dev/null || true
    sleep 1
    print_ok "Port 8502 freed"
fi

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

# Wait indefinitely until user presses Ctrl+C
wait
