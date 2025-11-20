#!/bin/bash
set -euo pipefail

echo "Building WebView2 Thick Client for Linux..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Build the WebView2 client
echo "Building Go binary..."
cd cmd/webview
GOOS=linux GOARCH=amd64 go build -o ../../dist/webview/prd-assistant-linux-amd64 .

echo "✅ Build complete: dist/webview/prd-assistant-linux-amd64"
echo ""
echo "Bundle size:"
ls -lh ../../dist/webview/prd-assistant-linux-amd64

echo ""
echo "To run: ./dist/webview/prd-assistant-linux-amd64"
echo ""
echo "Note: Requires WebKitGTK on Linux. Install with:"
echo "  Ubuntu/Debian: sudo apt-get install libwebkit2gtk-4.0-dev"
echo "  Fedora: sudo dnf install webkit2gtk3-devel"

