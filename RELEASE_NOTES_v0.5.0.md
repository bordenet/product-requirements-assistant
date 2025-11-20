# PRD Assistant v0.5.0

**Web-First • Privacy-First • 100% Client-Side**

Create Product Requirements Documents using a 3-phase AI workflow with Claude Sonnet 4.5 and Gemini 2.5 Pro.

---

## 🌐 **Recommended: Use the Web App**

**🚀 [Launch Web App](https://bordenet.github.io/product-requirements-assistant/)**

The web app is the **preferred way** to use PRD Assistant:

### Why Web App?
- ✅ **No download required** - instant access
- ✅ **Works everywhere** - Windows, Mac, Linux, mobile, tablets
- ✅ **Always up-to-date** - no manual updates needed
- ✅ **100% client-side** - all processing in your browser
- ✅ **Privacy-first** - no server, no tracking, no data collection
- ✅ **Offline capable** - works without internet after first load
- ✅ **Full features** - complete 3-phase AI workflow

### How It Works
1. Click the link above
2. Start creating PRDs immediately
3. All data stored locally in your browser (IndexedDB)
4. Export/import projects as JSON anytime

**No installation. No setup. No dependencies. Just works.**

---

## 🎯 What PRD Assistant Does

Create professional Product Requirements Documents using a proven 3-phase AI workflow:

### Phase 1: Initial Draft (Claude Sonnet 4.5)
- Generate comprehensive PRD from your requirements
- Copy/paste workflow with AI
- Structured output with all key sections

### Phase 2: Review & Refine (Gemini 2.5 Pro)
- Critical review and improvement suggestions
- Distill and simplify complex requirements
- Identify gaps and inconsistencies

### Phase 3: Final Comparison (Claude Sonnet 4.5)
- Compare both versions side-by-side
- Synthesize best elements from each
- Create final polished PRD

---

## 💾 Data & Privacy

- **Storage:** All data stored in your browser using IndexedDB (50MB-10GB capacity)
- **Privacy:** Zero server communication - everything runs client-side
- **Backup:** Export all projects as JSON files anytime
- **Portability:** Import JSON files to restore projects on any device
- **Security:** No API keys stored - you provide them per session

---

## 📦 Alternative: Windows Standalone Executable

**For users who prefer a local executable:**

Download `PRD-Assistant-Windows.exe` (5.7 MB) from the Assets section below.

### What It Is
A self-contained Windows executable that runs a local web server and opens the web app in your browser.

### When to Use It
- You prefer running executables over web apps
- You want a desktop shortcut
- You're working in an air-gapped environment

### How to Use It

**Step 1:** Download `PRD-Assistant-Windows.exe`

**Step 2:** Double-click to run

**What happens:**
1. Console window opens: "Starting PRD Assistant on http://localhost:8080"
2. Browser opens automatically to the app
3. Start creating PRDs

**Step 3:** Stop the app by closing the console window or pressing `Ctrl+C`

### Security Warning (Expected)

Windows Defender SmartScreen will show a warning because this app is not code-signed:

```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting
```

**To run:**
1. Click "More info"
2. Click "Run anyway"

**Why this happens:** Code signing certificates cost $474/year. This is a free, open-source project.

**Is it safe?** Yes. Source code: https://github.com/bordenet/product-requirements-assistant

### Technical Details
- **Size:** 5.7 MB
- **Dependencies:** None (Go binary with embedded web app)
- **Requirements:** Windows 10 or later
- **Architecture:** Standalone HTTP server on localhost:8080

---

## 📝 System Requirements

### Web App
- **Browser:** Chrome, Edge, Firefox, or Safari (modern version with ES6 modules support)
- **Internet:** Required for first load, then works offline
- **Storage:** Browser must allow IndexedDB (enabled by default)

### Windows Executable
- **OS:** Windows 10 or later
- **Browser:** Chrome, Edge, Firefox, or Safari (modern version)
- **RAM:** 100 MB
- **Disk:** 10 MB (plus space for your projects)

---

## 🐛 Troubleshooting

### Web App Issues

**Problem:** "Failed to load module" errors

**Solution:** Ensure you're using a modern browser (Chrome 61+, Firefox 60+, Safari 11+, Edge 79+)

**Problem:** Projects not saving

**Solution:** Check browser settings - IndexedDB must be enabled (it's enabled by default)

### Windows Executable Issues

**Problem:** Port 8080 already in use

**Solution:** Close other apps using port 8080, or run only one instance

**Problem:** Browser doesn't open automatically

**Solution:** Manually open browser and go to http://localhost:8080

**Problem:** Console window closes immediately

**Solution:** Open Command Prompt, run `PRD-Assistant-Windows.exe`, check error messages

---

## 🔗 Links

- **Web App:** https://bordenet.github.io/product-requirements-assistant/
- **Source Code:** https://github.com/bordenet/product-requirements-assistant
- **Documentation:** https://github.com/bordenet/product-requirements-assistant#readme
- **Issues:** https://github.com/bordenet/product-requirements-assistant/issues

---

## 🏗️ Technical Architecture

### Web App
- **Frontend:** Vanilla JavaScript (ES6 modules) + Tailwind CSS (CDN)
- **Storage:** Browser IndexedDB (50MB-10GB capacity)
- **Deployment:** GitHub Pages (static hosting)
- **Build:** None required - pure client-side code

### Windows Executable
- **Backend:** Go 1.21+ with embed.FS
- **Size:** 5.7 MB (web app embedded in binary)
- **Server:** HTTP server on localhost:8080
- **Compilation:** Static binary, zero dependencies

---

## 📄 License

MIT License - Free to use, modify, and distribute

---

## 🎯 Recommendation

**Use the web app** for the best experience. It's faster to access, works on all platforms, and is always up-to-date. The Windows executable is provided as an alternative for users who prefer local executables or need offline access.

