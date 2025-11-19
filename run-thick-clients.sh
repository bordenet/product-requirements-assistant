#!/bin/bash
set -e

# Product Requirements Assistant - Thick Client Launcher
# Builds and runs both WebView2 and Electron clients side-by-side for comparison

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down clients...${NC}"
    if [ ! -z "$WEBVIEW_PID" ]; then
        kill $WEBVIEW_PID 2>/dev/null || true
    fi
    if [ ! -z "$ELECTRON_PID" ]; then
        kill $ELECTRON_PID 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

# Print header
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Product Requirements Assistant - Thick Client Launcher${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v go &> /dev/null; then
    echo -e "${RED}✗ Go is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Go found: $(go version)${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

echo ""

# Menu
echo -e "${YELLOW}Select mode:${NC}"
echo "  1) Development (quick start, no build)"
echo "  2) Production (build binaries, then run)"
echo "  3) Build only (no run)"
echo ""
read -r -p "Enter choice [1-3]: " choice

case $choice in
    1)
        MODE="dev"
        ;;
    2)
        MODE="prod"
        ;;
    3)
        MODE="build"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""

# Build if needed
if [ "$MODE" = "prod" ] || [ "$MODE" = "build" ]; then
    echo -e "${YELLOW}Building WebView2 client...${NC}"
    cd cmd/webview

    # Ensure go.sum is up to date
    go mod tidy

    # Create dist directory if it doesn't exist
    mkdir -p ../../dist/webview

    # Detect platform and build
    if [[ "$OSTYPE" == "darwin"* ]]; then
        CGO_ENABLED=1 go build -o ../../dist/webview/prd-assistant .
        echo -e "${GREEN}✓ WebView2 built: dist/webview/prd-assistant${NC}"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        CGO_ENABLED=1 go build -o ../../dist/webview/prd-assistant .
        echo -e "${GREEN}✓ WebView2 built: dist/webview/prd-assistant${NC}"
    else
        echo -e "${YELLOW}⚠ Unsupported platform for WebView2 build${NC}"
    fi

    cd "$SCRIPT_DIR"
    echo ""
    
    echo -e "${YELLOW}Building Electron client...${NC}"
    cd cmd/electron
    npm install --silent
    echo -e "${GREEN}✓ Electron dependencies installed${NC}"
    
    cd "$SCRIPT_DIR"
    echo ""
fi

# Exit if build-only mode
if [ "$MODE" = "build" ]; then
    echo -e "${GREEN}Build complete!${NC}"
    exit 0
fi

# Run clients
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Starting Thick Clients${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start WebView2
echo -e "${YELLOW}Starting WebView2 client...${NC}"
if [ "$MODE" = "dev" ]; then
    cd cmd/webview
    go run . &
    WEBVIEW_PID=$!
    cd "$SCRIPT_DIR"
else
    ./dist/webview/prd-assistant &
    WEBVIEW_PID=$!
fi
echo -e "${GREEN}✓ WebView2 started (PID: $WEBVIEW_PID)${NC}"
echo ""

# Wait a moment for ports to be available
sleep 3

# Start Electron
echo -e "${YELLOW}Starting Electron client...${NC}"
cd cmd/electron
if [ "$MODE" = "dev" ]; then
    npm start &
    ELECTRON_PID=$!
else
    npm start &
    ELECTRON_PID=$!
fi
cd "$SCRIPT_DIR"
echo -e "${GREEN}✓ Electron started (PID: $ELECTRON_PID)${NC}"
echo ""

# Instructions
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Both clients are running!${NC}"
echo ""
echo -e "WebView2:  Native window (8.2MB bundle)"
echo -e "Electron:  Chromium window (150MB bundle)"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both clients${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Wait for user interrupt
wait

