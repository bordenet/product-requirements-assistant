#!/bin/bash

# Unified setup script that detects OS and runs appropriate setup
# Supports macOS and Linux (including WSL)

set -e

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Detected macOS - running macOS setup..."
    exec ./scripts/setup-macos.sh "$@"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Detected Linux - running Linux setup..."
    exec ./scripts/setup-linux.sh "$@"
else
    echo "Error: Unsupported operating system: $OSTYPE"
    echo "Supported platforms: macOS, Linux (Ubuntu/Debian, WSL)"
    exit 1
fi
