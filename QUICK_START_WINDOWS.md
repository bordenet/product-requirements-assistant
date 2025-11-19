# Quick Start Guide for Windows Users

**No coding, no setup, no repository cloning required!**

Just download one file and run it. That's it.

---

## Step 1: Download the Application

1. **Go to**: [Latest Release](https://github.com/bordenet/product-requirements-assistant/releases/latest)
2. **Scroll down** to "Assets" section
3. **Download ONE of these files:**

### Option A: Electron Installer (Recommended for Most Users)

**File**: `Product-Requirements-Assistant-Setup-X.X.X.exe` (~150MB)

✅ **Pros:**
- Full installer with desktop shortcut
- Launch from Start Menu
- Automatic updates
- No additional dependencies

❌ **Cons:**
- Larger download (~150MB)

### Option B: WebView2 Portable (Advanced Users)

**File**: `prd-assistant-windows-amd64.exe` (~10MB)

✅ **Pros:**
- Tiny download (~10MB)
- No installation needed
- Portable (run from USB drive)

❌ **Cons:**
- Requires WebView2 Runtime (usually pre-installed on Windows 10/11)
- No desktop shortcut

---

## Step 2: Run the Application

### If you downloaded the Electron Installer:

1. **Double-click** the downloaded `.exe` file
2. **Windows Security Warning** (normal for downloaded files):
   - Click "More info"
   - Click "Run anyway"
3. **Follow the installation wizard**
   - Click "Next" → "Install" → "Finish"
4. **Launch the app**:
   - From Start Menu: Search for "Product Requirements Assistant"
   - Or double-click the desktop shortcut

### If you downloaded the WebView2 Portable:

1. **Double-click** `prd-assistant-windows-amd64.exe`
2. **Windows Security Warning** (normal for downloaded files):
   - Click "More info"
   - Click "Run anyway"
3. **The application window opens automatically**

---

## Step 3: Start Creating PRDs

The application window will open. You can now:

1. **Create a new project** - Click "New Project"
2. **Enter your requirements** - Describe what you want to build
3. **Follow the 3-phase workflow**:
   - Phase 1: Generate initial PRD with Claude
   - Phase 2: Review with Gemini
   - Phase 3: Finalize with Claude
4. **Export your PRD** - Download as Markdown

**No coding required!** Just copy/paste between the app and your AI chat windows.

---

## Troubleshooting

### "Windows protected your PC" Warning

This is normal for downloaded executables. To run:
1. Click "More info"
2. Click "Run anyway"

### WebView2 Runtime Missing (WebView2 version only)

If you see an error about WebView2:
1. Download WebView2 Runtime from: https://developer.microsoft.com/microsoft-edge/webview2/
2. Install it
3. Run the application again

### Application Won't Start

1. Make sure you downloaded the correct file for Windows
2. Try right-click → "Run as administrator"
3. Check Windows Event Viewer for error details

---

## ❓ Frequently Asked Questions

### Do I need to install Git or clone the repository?

**No!** Just download the `.exe` file and run it. You don't need:
- Git
- GitHub account
- Command line / terminal
- Any programming tools

This is a **ready-to-use application**, not source code.

### Do I need to install Python or Go?

**No!** The executable includes everything you need. Just download and run.

### Can I run this without an internet connection?

**Yes!** The app runs entirely on your computer. You only need internet to:
- Download the app (one time)
- Copy/paste to Claude/Gemini (when creating PRDs)

### Where is my data stored?

All your projects are stored **locally on your computer** in:
- `C:\Users\YourName\AppData\Local\ProductRequirementsAssistant\`

Your data never leaves your machine.

---

## 👨‍💻 For Developers

If you want to build from source or contribute:
- See [README.md](README.md) for development setup
- See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines

---

## 🆘 Need Help?

- [Report an issue](https://github.com/bordenet/product-requirements-assistant/issues)
- [View documentation](docs/)
- [Watch tutorial video](#) (coming soon)

