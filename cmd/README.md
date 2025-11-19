# Thick Client Applications

This directory contains two thick client implementations for the Product Requirements Assistant:

## 1. WebView2 Native Client (`webview/`)

**Platform**: Windows (primary), macOS, Linux  
**Bundle Size**: 30-50MB  
**Technology**: Go + WebView2/WebKit

### Features
- Native window using OS-provided browser engine
- Smallest bundle size
- Best performance on Windows
- No browser dependency

### Building

```bash
# Windows
./build/webview/build-windows.sh

# macOS
./build/webview/build-macos.sh

# Linux
./build/webview/build-linux.sh
```

### Running

```bash
# Development
cd cmd/webview
go run .

# Production
./dist/webview/prd-assistant-windows-amd64.exe  # Windows
./dist/webview/prd-assistant-macos-arm64        # macOS (Apple Silicon)
./dist/webview/prd-assistant-linux-amd64        # Linux
```

### Requirements

**Windows**: WebView2 runtime (built into Windows 11, auto-installs on Windows 10)  
**macOS**: WebKit (built-in)  
**Linux**: WebKitGTK (`sudo apt-get install libwebkit2gtk-4.0-dev`)

---

## 2. Electron Client (`electron/`)

**Platform**: Windows, macOS, Linux  
**Bundle Size**: 150-200MB  
**Technology**: Electron + Go + Streamlit

### Features
- Cross-platform consistency
- Familiar Chromium-based rendering
- Professional installers for all platforms
- Auto-update support (can be added)

### Building

```bash
# All platforms
./build/electron/build.sh

# Or individually
cd cmd/electron
npm install
npm run build:win     # Windows
npm run build:mac     # macOS
npm run build:linux   # Linux
```

### Running

```bash
# Development
cd cmd/electron
npm install
npm start

# Production
# Windows: Run the installer .exe
# macOS: Open the .dmg and drag to Applications
# Linux: Run the .AppImage
```

### Requirements

**Development**: Node.js 18+, npm  
**Production**: No additional requirements (Electron bundles everything)

---

## Comparison

| Feature | WebView2 Native | Electron |
|---------|----------------|----------|
| Bundle Size | 30-50MB | 150-200MB |
| Memory Usage | 50-80MB | 150-200MB |
| Startup Time | Fast | Medium |
| Cross-Platform | Yes (with caveats) | Yes (consistent) |
| Native Feel | Excellent | Good |
| Development Complexity | Low | Medium |
| Installer Size | Small | Large |
| Auto-Updates | Manual | Easy to add |

---

## Architecture

Both clients follow the same architecture:

```
Thick Client Launcher
├── Start Go Backend (port 8080)
├── Start Streamlit Frontend (port 8501)
└── Open Native Window → http://localhost:8501
```

### Differences

**WebView2**:
- Uses OS-provided browser engine (Edge on Windows, WebKit on macOS/Linux)
- Single Go binary
- Lightweight

**Electron**:
- Bundles Chromium browser
- Node.js + Go processes
- Heavier but more consistent

---

## Development

### WebView2 Client

```bash
cd cmd/webview
go mod download
go run .
```

### Electron Client

```bash
cd cmd/electron
npm install
npm start
```

---

## Testing

Both clients can be tested side-by-side:

1. Build both clients
2. Run them simultaneously (they use the same ports, so run one at a time)
3. Compare:
   - Startup time
   - Memory usage
   - Bundle size
   - User experience
   - Platform compatibility

---

## Production Deployment

### WebView2

1. Build for target platform
2. Create installer (Inno Setup for Windows, DMG for macOS)
3. Distribute single executable + installer

### Electron

1. Run `npm run build:all`
2. Distribute platform-specific installers from `dist/electron/`
3. Users run installer, get desktop shortcut

---

## Troubleshooting

### WebView2

**Windows**: If WebView2 runtime is missing, download from https://developer.microsoft.com/microsoft-edge/webview2/  
**macOS**: Ensure Xcode Command Line Tools are installed  
**Linux**: Install WebKitGTK development libraries

### Electron

**Build fails**: Ensure Node.js 18+ and npm are installed  
**App won't start**: Check that backend and frontend directories are accessible  
**Blank window**: Check console logs, ensure ports 8080 and 8501 are available

---

## Future Enhancements

- [ ] Auto-update support (Electron)
- [ ] Code signing for macOS and Windows
- [ ] Notarization for macOS
- [ ] Windows Store distribution
- [ ] Linux package managers (apt, snap, flatpak)
- [ ] Embedded Python runtime (eliminate venv dependency)
- [ ] Embedded Go binary (eliminate Go dependency)

