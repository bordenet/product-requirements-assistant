# Thick Client Launcher Scripts

Two launcher scripts are provided to build and run both thick clients side-by-side for comparison.

## Quick Start

### macOS / Linux
```bash
./run-thick-clients.sh
```

### Windows
```powershell
.\run-thick-clients.ps1
```

## Features

- **Prerequisites Check**: Validates Go, Node.js, and npm are installed
- **Three Modes**:
  1. **Development** - Quick start without building (uses `go run` and `npm start`)
  2. **Production** - Builds binaries first, then runs them
  3. **Build Only** - Just builds, doesn't run
- **Side-by-Side Launch**: Starts both WebView2 and Electron clients simultaneously
- **Graceful Shutdown**: Ctrl+C stops both clients cleanly

## Usage

### Development Mode (Fastest)

**macOS/Linux**:
```bash
./run-thick-clients.sh
# Select option 1
```

**Windows**:
```powershell
.\run-thick-clients.ps1
# Select option 1
```

This mode:
- Skips building binaries
- Uses `go run .` for WebView2
- Uses `npm start` for Electron
- Fastest for testing and development

### Production Mode

**macOS/Linux**:
```bash
./run-thick-clients.sh
# Select option 2
```

**Windows**:
```powershell
.\run-thick-clients.ps1
# Select option 2
```

This mode:
- Builds WebView2 binary
- Installs Electron dependencies
- Runs the built binaries
- Tests the actual production artifacts

### Build Only Mode

**macOS/Linux**:
```bash
./run-thick-clients.sh
# Select option 3
```

**Windows**:
```powershell
.\run-thick-clients.ps1
# Select option 3
```

This mode:
- Builds both clients
- Exits without running
- Useful for CI/CD or preparing releases

## What Happens

1. **Prerequisites Check**: Validates Go, Node.js, npm are installed
2. **Mode Selection**: Choose development, production, or build-only
3. **Build** (if production/build mode):
   - WebView2: Compiles Go binary with CGO
   - Electron: Installs npm dependencies
4. **Launch** (if not build-only):
   - Starts WebView2 client (native window)
   - Waits 3 seconds for ports to be available
   - Starts Electron client (Chromium window)
5. **Wait**: Both clients run until you press Ctrl+C
6. **Cleanup**: Both clients shut down gracefully

## Output Locations

### WebView2
- **macOS**: `dist/webview/prd-assistant`
- **Windows**: `dist\webview\prd-assistant.exe`
- **Linux**: `dist/webview/prd-assistant`

### Electron
- **Development**: Runs from `cmd/electron/`
- **Production**: Installers in `cmd/electron/dist/`

## Troubleshooting

### "Go is not installed"
Install Go 1.21+ from https://go.dev/dl/

### "Node.js is not installed"
Install Node.js 18+ from https://nodejs.org/

### "npm is not installed"
npm comes with Node.js. Reinstall Node.js.

### WebView2 build fails on macOS/Linux
Ensure you have CGO dependencies:
- **macOS**: Xcode Command Line Tools (`xcode-select --install`)
- **Linux**: WebKitGTK (`sudo apt-get install libwebkit2gtk-4.0-dev`)

### Electron fails to start
```bash
cd cmd/electron
rm -rf node_modules package-lock.json
npm install
```

### Ports already in use
The clients use ports 8080 (backend) and 8501 (frontend). Stop any other instances:
```bash
# macOS/Linux
lsof -ti:8080 | xargs kill
lsof -ti:8501 | xargs kill

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Both clients open the same window
This is expected! Both clients load the same Streamlit frontend. The difference is:
- **WebView2**: Uses OS-native browser engine (smaller, faster)
- **Electron**: Uses bundled Chromium (larger, consistent)

## Comparison

When both clients are running, compare:

| Aspect | How to Check |
|--------|-------------|
| **Startup Time** | Use a stopwatch from launch to window open |
| **Memory Usage** | Activity Monitor (macOS) / Task Manager (Windows) |
| **Bundle Size** | `ls -lh dist/webview/` vs Electron installer size |
| **Window Feel** | Does it feel native or like a web app? |
| **Performance** | Navigate through the 3-phase workflow |

## Next Steps

After testing both clients:
1. Note your preferences
2. Check memory usage in Activity Monitor / Task Manager
3. Compare startup times
4. Decide which client better fits your needs

## Scripts

- **run-thick-clients.sh** - Bash script for macOS/Linux (150 lines)
- **run-thick-clients.ps1** - PowerShell script for Windows (150 lines)

Both scripts are functionally identical, just platform-specific syntax.

