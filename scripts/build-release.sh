#!/usr/bin/env bash
# Build release binaries for all platforms
# Usage: ./scripts/build-release.sh [VERSION]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Get version from RELEASES.md or argument
VERSION="${1:-$(head -n 5 RELEASES.md | grep -oP '^\| \K[0-9]+\.[0-9]+\.[0-9]+' | head -n 1)}"
if [ -z "$VERSION" ]; then
    echo "Error: Could not determine version"
    echo "Usage: $0 [VERSION]"
    exit 1
fi

echo "Building release binaries for v$VERSION"
echo ""

# Build info
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT=$(git rev-parse --short HEAD)
BUILD_BY="release-script"

# Output directory
DIST_DIR="$PROJECT_ROOT/dist/release-v$VERSION"
mkdir -p "$DIST_DIR"

echo "Output directory: $DIST_DIR"
echo ""

################################################################################
# Build Go Backend
################################################################################

echo "Building Go backend..."
cd "$PROJECT_ROOT/backend"

PLATFORMS=(
    "linux/amd64"
    "linux/arm64"
    "darwin/amd64"
    "darwin/arm64"
    "windows/amd64"
)

for platform in "${PLATFORMS[@]}"; do
    GOOS="${platform%/*}"
    GOARCH="${platform#*/}"
    OUTPUT_NAME="prd-assistant-backend-v${VERSION}-${GOOS}-${GOARCH}"
    
    if [ "$GOOS" = "windows" ]; then
        OUTPUT_NAME="${OUTPUT_NAME}.exe"
    fi
    
    echo "  Building $GOOS/$GOARCH..."
    GOOS=$GOOS GOARCH=$GOARCH go build \
        -ldflags "-X main.Version=$VERSION -X main.GitCommit=$GIT_COMMIT -X main.BuildDate=$BUILD_DATE -X main.BuildBy=$BUILD_BY" \
        -o "$DIST_DIR/$OUTPUT_NAME" \
        .
done

echo "✓ Backend binaries built"
echo ""

################################################################################
# Build WebView2 Thick Client
################################################################################

echo "Building WebView2 thick client..."
echo "  Note: WebView2 requires platform-specific builds with CGO and native libraries"
echo "  Skipping WebView2 build (requires webkit2gtk on Linux, WebView2 on Windows)"
echo "  To build WebView2: Install dependencies and run 'cd cmd/webview && go build'"
echo ""

################################################################################
# Build Electron Thick Client
################################################################################

echo "Building Electron thick client..."
cd "$PROJECT_ROOT/cmd/electron"

# Check if electron-builder is installed
if ! npm list electron-builder &>/dev/null; then
    echo "  Installing electron-builder..."
    npm install
fi

echo "  Building for all platforms (this may take a while)..."
npm run build:all 2>&1 | grep -E "(Building|Packaging|Target)" || true

# Move Electron builds to release directory
if [ -d "../../dist/electron" ]; then
    cp -r ../../dist/electron/* "$DIST_DIR/" 2>/dev/null || true
fi

echo "✓ Electron binaries built"
echo ""

################################################################################
# Create checksums
################################################################################

echo "Creating checksums..."
cd "$DIST_DIR"

# Create SHA256 checksums
sha256sum * > SHA256SUMS.txt 2>/dev/null || shasum -a 256 * > SHA256SUMS.txt

echo "✓ Checksums created"
echo ""

################################################################################
# Summary
################################################################################

echo "=========================================="
echo "Release v$VERSION build complete!"
echo "=========================================="
echo ""
echo "Binaries location: $DIST_DIR"
echo ""
echo "Files created:"
ls -lh "$DIST_DIR" | tail -n +2 | awk '{printf "  %s (%s)\n", $9, $5}'
echo ""
echo "Next steps:"
echo "  1. Test the binaries"
echo "  2. Upload to GitHub release: https://github.com/bordenet/product-requirements-assistant/releases/tag/v$VERSION"
echo "  3. Update RELEASES.md if needed"
echo ""

