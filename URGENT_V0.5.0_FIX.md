# URGENT: v0.5.0 Electron Installer is Broken

**Status**: Critical - Installer requires Go and Python (defeats purpose)  
**Impact**: Users cannot run the installer  
**Root Cause**: Packaged source code instead of compiled binaries  

---

## Immediate Actions Required

### 1. Delete v0.5.0 Release (5 minutes)

```bash
# Delete the broken release
gh release delete v0.5.0 --yes

# Delete the tag
git tag -d v0.5.0
git push origin :refs/tags/v0.5.0
```

**Why**: Prevents more users from downloading broken installer

---

### 2. Promote Web App as Primary Option (30 minutes)

The **web app is already fully functional** and is a better solution:

✅ **No installation required** - just visit a URL  
✅ **Works on all platforms** - Windows, macOS, Linux, mobile  
✅ **Privacy-first** - all data stored in browser (IndexedDB)  
✅ **Tiny** - 75KB vs 150MB Electron  
✅ **No dependencies** - no Go, Python, Node.js needed  

**Action**: Update README.md to make web app the primary option

---

### 3. Update README.md

Replace the "Quick Start" section with:

```markdown
## Quick Start

### Option 1: Web App (Recommended)

**No installation required** - works in any modern browser:

1. Visit: https://bordenet.github.io/product-requirements-assistant/
2. Start creating PRDs immediately
3. All data stored locally in your browser (privacy-first)

**Features**:
- 3-phase AI workflow (Claude + Gemini)
- Unlimited projects
- Export/import as JSON
- Works offline after first load
- No server, no tracking, no accounts

### Option 2: Desktop Setup (For Developers)

If you prefer to run locally or need to customize:

1. Install Python 3.8+
2. Clone this repository
3. Run: `.\scripts\setup-windows.ps1` (Windows) or `./scripts/setup-macos.sh` (macOS)
4. Open http://localhost:8501

See [QUICK_START_WINDOWS.md](QUICK_START_WINDOWS.md) for detailed instructions.
```

---

### 4. Deploy Web App to GitHub Pages (10 minutes)

```bash
# Create gh-pages branch with web app
git subtree push --prefix web origin gh-pages

# Or use GitHub Actions to auto-deploy
```

**Result**: Web app available at https://bordenet.github.io/product-requirements-assistant/

---

### 5. Create v0.6.0 Release (Web App) (15 minutes)

```bash
# Tag the current commit
git tag -a v0.6.0 -m "v0.6.0 - Web App Release

Primary release is now the web application:
- No installation required
- Works on all platforms
- Privacy-first (all data in browser)
- 75KB total size

Desktop setup still available for developers who want to run locally."

# Push tag
git push origin v0.6.0

# Create release on GitHub
gh release create v0.6.0 \
  --title "v0.6.0 - Web Application" \
  --notes "See README.md for web app link and usage instructions"
```

---

## Why This is the Right Solution

### Problems with Electron Installer

1. **Complexity**: Bundling Python + Streamlit is 4-6 hours of work
2. **Size**: 150-250MB installer (vs 75KB web app)
3. **Platform-specific**: Need separate builds for Windows/macOS/Linux
4. **Maintenance**: Electron security updates, Python updates, Streamlit updates
5. **Testing**: Requires testing on clean machines for each platform

### Benefits of Web App

1. **Simplicity**: Already works, no build process needed
2. **Size**: 75KB (2000x smaller than Electron)
3. **Cross-platform**: Works everywhere with a browser
4. **Maintenance**: Static files, no runtime dependencies
5. **Testing**: Test once in browser, works everywhere

### User Experience

**Electron Installer**:
- Download 150MB
- Run installer
- Wait for installation
- Launch app
- Hope it works

**Web App**:
- Click link
- Start using immediately
- Works on phone, tablet, desktop
- No installation, no updates

---

## Timeline

| Task | Time | Priority |
|------|------|----------|
| Delete v0.5.0 release | 5 min | CRITICAL |
| Update README.md | 30 min | HIGH |
| Deploy to GitHub Pages | 10 min | HIGH |
| Create v0.6.0 release | 15 min | MEDIUM |
| **Total** | **1 hour** | |

---

## Communication

### To Users Who Downloaded v0.5.0

"We discovered that the v0.5.0 Windows installer requires Go and Python to be installed, which defeats the purpose of a self-contained installer. We've removed this release and are now recommending the web application, which requires no installation and works on all platforms. We apologize for the inconvenience."

### To Colleagues

"The v0.5.0 Electron installer was released prematurely without proper testing. It packaged source code instead of compiled binaries, requiring users to have Go and Python installed. We've pivoted to promoting the web application as the primary option, which is a better user experience anyway (no installation, works everywhere, privacy-first). Lesson learned: always test packaged installers on clean machines before releasing."

---

## Next Steps

1. ✅ Delete v0.5.0 release
2. ✅ Update README.md
3. ✅ Deploy web app to GitHub Pages
4. ✅ Create v0.6.0 release
5. ✅ Update all documentation to promote web app
6. ✅ Add this incident to docs/decisions/ for future reference

---

## Long-Term

If you still want a desktop app in the future:

1. **WebView2 Native** (better than Electron):
   - 30-50MB (vs 150MB Electron)
   - Uses system browser engine
   - See `cmd/webview/` for implementation

2. **Tauri** (modern alternative to Electron):
   - 5-10MB installers
   - Rust + system webview
   - Better performance and security

But honestly, the **web app is the best solution** for this use case.

