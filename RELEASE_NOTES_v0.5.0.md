# PRD Assistant v0.5.0 - Windows Standalone

**Self-Contained • No Installation • 5.7 MB**

A single executable that runs the PRD Assistant web app locally on your Windows machine.

---

## 📦 What You Get

**One file:** `PRD-Assistant-Windows.exe` (5.7 MB)

- ✅ No installation required
- ✅ No Python, Go, or Node.js needed
- ✅ No dependencies to install
- ✅ All data stored locally in your browser
- ✅ Privacy-first (no server, no tracking)

---

## 🚀 How to Use

### Step 1: Download

Download `PRD-Assistant-Windows.exe` from the Assets section below.

### Step 2: Run

Double-click `PRD-Assistant-Windows.exe`

**What happens:**
1. A console window opens showing "Starting PRD Assistant on http://localhost:8080"
2. Your default browser opens automatically to the app
3. Start creating PRDs immediately!

### Step 3: Use the App

The web app runs 100% in your browser:
- Create unlimited projects
- 3-phase AI workflow (Claude + Gemini)
- Export/import projects as JSON
- All data stored in browser (IndexedDB)

### Step 4: Stop the App

Close the console window or press `Ctrl+C`

---

## 🔐 Security Note

Windows may show a security warning because this app is not code-signed:

```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting
```

**To run the app:**
1. Click "More info"
2. Click "Run anyway"

**Why this happens:** Code signing certificates cost $474/year. This is a free, open-source project.

**Is it safe?** Yes! The source code is available at https://github.com/bordenet/product-requirements-assistant

---

## 🎯 What It Does

Create Product Requirements Documents using a 3-phase AI workflow:

1. **Phase 1: Initial Draft** (Claude Sonnet 4.5)
   - Generate initial PRD from your requirements
   - Copy/paste workflow with AI

2. **Phase 2: Review & Refine** (Gemini 2.5 Pro)
   - Review and improve the draft
   - Distill and simplify

3. **Phase 3: Final Comparison** (Claude Sonnet 4.5)
   - Compare both versions
   - Create final PRD

---

## 💾 Data Storage

- **Where:** All data stored in your browser using IndexedDB
- **Privacy:** Nothing sent to any server
- **Backup:** Export all projects as JSON anytime
- **Portability:** Import JSON files to restore projects

---

## 🌐 Alternative: Web App

Don't want to download anything? Use the web app directly:

**Coming soon:** https://bordenet.github.io/product-requirements-assistant/

Same features, no download required!

---

## 🛠️ Technical Details

- **Built with:** Go 1.21+ using embed.FS
- **Web app:** Vanilla JavaScript + Tailwind CSS
- **Storage:** Browser IndexedDB (50MB-10GB capacity)
- **Server:** Local HTTP server on port 8080
- **Size:** 5.7 MB (web app embedded in executable)

---

## 🐛 Troubleshooting

### Port 8080 Already in Use

**Problem:** "listen tcp :8080: bind: address already in use"

**Solution:**
1. Close other apps using port 8080
2. Or change the port in the source code and rebuild

### Browser Doesn't Open

**Problem:** Browser doesn't open automatically

**Solution:**
1. Manually open your browser
2. Go to http://localhost:8080

### Console Window Closes Immediately

**Problem:** Console window flashes and closes

**Solution:**
1. Open Command Prompt
2. Run: `PRD-Assistant-Windows.exe`
3. Check for error messages

---

## 📝 System Requirements

- **OS:** Windows 10 or later
- **Browser:** Chrome, Edge, Firefox, or Safari (modern version)
- **RAM:** 100 MB
- **Disk:** 10 MB (plus space for your projects)

---

## 🔗 Links

- **Source Code:** https://github.com/bordenet/product-requirements-assistant
- **Documentation:** https://github.com/bordenet/product-requirements-assistant#readme
- **Issues:** https://github.com/bordenet/product-requirements-assistant/issues

---

## 📄 License

MIT License - Free to use, modify, and distribute

