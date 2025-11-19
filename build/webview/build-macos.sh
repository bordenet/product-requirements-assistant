#!/bin/bash
set -euo pipefail

echo "Building WebView2 Thick Client for macOS..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Build for both architectures
echo "Building Go binary for ARM64 (Apple Silicon)..."
cd cmd/webview
CGO_ENABLED=1 GOOS=darwin GOARCH=arm64 go build -o ../../dist/webview/prd-assistant-macos-arm64 .

echo "Building Go binary for AMD64 (Intel)..."
CGO_ENABLED=1 GOOS=darwin GOARCH=amd64 go build -o ../../dist/webview/prd-assistant-macos-amd64 .

echo "✅ Build complete:"
echo "  - dist/webview/prd-assistant-macos-arm64 (Apple Silicon)"
echo "  - dist/webview/prd-assistant-macos-amd64 (Intel)"
echo ""
echo "Bundle sizes:"
ls -lh ../../dist/webview/prd-assistant-macos-*

echo ""
echo "To run on Apple Silicon: ./dist/webview/prd-assistant-macos-arm64"
echo "To run on Intel: ./dist/webview/prd-assistant-macos-amd64"

