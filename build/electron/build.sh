#!/bin/bash
set -euo pipefail

echo "Building Electron Thick Client..."

# Navigate to project root
cd "$(dirname "$0")/../.."

# Install Electron dependencies
echo "Installing Electron dependencies..."
cd cmd/electron
npm install

# Build for all platforms
echo "Building Electron app for all platforms..."
npm run build:all

echo "✅ Build complete!"
echo ""
echo "Installers created in dist/electron/:"
ls -lh ../../dist/electron/

echo ""
echo "Windows: dist/electron/PRD-Assistant-Setup-1.5.0.exe"
echo "macOS: dist/electron/PRD-Assistant-1.5.0.dmg"
echo "Linux: dist/electron/PRD-Assistant-1.5.0.AppImage"

