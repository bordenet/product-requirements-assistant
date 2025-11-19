#!/bin/bash
set -euo pipefail

echo "Building WebView2 Thick Client for Windows..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Build the WebView2 client
echo "Building Go binary..."
cd cmd/webview
GOOS=windows GOARCH=amd64 go build -o ../../dist/webview/prd-assistant-windows-amd64.exe .

echo "✅ Build complete: dist/webview/prd-assistant-windows-amd64.exe"
echo ""
echo "Bundle size:"
ls -lh ../../dist/webview/prd-assistant-windows-amd64.exe

echo ""
echo "To run: ./dist/webview/prd-assistant-windows-amd64.exe"

