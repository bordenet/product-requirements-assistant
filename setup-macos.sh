#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Function to check if a command is available
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# --- Dependency Checks ---
echo "Checking for dependencies..."

# Check for Homebrew
if ! command_exists brew; then
    echo "Homebrew not found. Please install Homebrew to continue: https://brew.sh/"
    exit 1
fi

# Check for Go
if ! command_exists go; then
    echo "Go not found. Installing Go with Homebrew..."
    brew install go
else
    echo "Go is already installed."
fi

# Check for Python
if ! command_exists python3; then
    echo "Python 3 not found. Installing Python with Homebrew..."
    brew install python
else
    echo "Python 3 is already installed."
fi

# --- Project Setup ---
echo "Setting up the project..."

# Install dependencies
make install

# --- Testing ---
echo "Running tests..."

# Run backend tests
make test-all

# Run integration tests
make test-integration

# --- Running the Application ---
echo "Starting the application..."

# Start the backend in the background
echo "Starting backend server..."
make run-backend &
BACKEND_PID=$!

# Give the backend a moment to start
sleep 5

# Start the frontend
echo "Starting frontend application..."
make run-frontend

# --- Application Running ---
echo ""
echo "========================================"
echo "The application is now running."
echo "Backend is running in the background (PID: $BACKEND_PID)."
echo "Frontend is running in the foreground."
echo ""
echo "To stop the application:"
echo "1. Press Ctrl+C in this terminal to stop the frontend."
echo "2. Stop the backend by running: kill $BACKEND_PID"
echo "========================================"
