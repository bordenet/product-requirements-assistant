#!/bin/bash

# Unified setup script that detects OS and runs appropriate setup
# Supports macOS and Linux (including WSL)
#
# Usage: ./run.sh [-y|--yes]
#   -y, --yes    Automatically answer yes to all prompts

set -e

# Show help
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo "Usage: $0 [-y|--yes] [-h|--help]"
    echo ""
    echo "Unified setup script for Product Requirements Assistant"
    echo ""
    echo "Options:"
    echo "  -y, --yes     Automatically answer yes to all prompts"
    echo "  -h, --help    Show this help message"
    echo ""
    echo "Supported platforms: macOS, Linux (Ubuntu/Debian, WSL)"
    exit 0
fi

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
