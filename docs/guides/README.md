# User Guides

User-facing documentation for the Product Requirements Assistant.

---

## 📄 Documents

### [`THICK_CLIENTS_GUIDE.md`](./THICK_CLIENTS_GUIDE.md)

**Purpose:** Complete user guide for desktop applications

**Contents:**
- What are thick clients? (Electron vs WebView2)
- Installation instructions
- Getting started
- Using the 3-phase workflow
- Customizing prompts
- Exporting PRDs
- Troubleshooting
- FAQ

**Audience:** End users, non-technical users, product managers

**Platforms Covered:**
- **Electron:** Windows, macOS, Linux (~150MB)
- **WebView2:** Windows, macOS, Linux (~10MB)

**Quick Start:**
1. Download from [GitHub Releases](https://github.com/bordenet/product-requirements-assistant/releases/latest)
2. Install or run the executable
3. Create a new project
4. Follow the 3-phase workflow
5. Export your PRD

---

## 🚀 Quick Start Guides

### For Windows Users

**See:** [`QUICK_START_WINDOWS.md`](../../QUICK_START_WINDOWS.md) (root directory)

**Summary:**
- Download the installer or portable executable
- Handle Windows SmartScreen warnings
- Start creating PRDs immediately

**No installation or setup required!**

---

### For Web App Users

**See:** [`web/README.md`](../../web/README.md)

**Summary:**
- Open the web app URL (no installation)
- All data stored in your browser
- 100% privacy-first
- Works offline after first load

**Try it locally:**
```bash
cd web
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## 📖 User Documentation by Topic

### Getting Started

1. **Choose Your Platform:**
   - Desktop (Electron/WebView2): Download and install
   - Web: Open URL in browser

2. **Create Your First Project:**
   - Enter project title
   - Describe problems to solve
   - Add context and constraints

3. **Follow the 3-Phase Workflow:**
   - Phase 1: Claude generates initial PRD
   - Phase 2: Gemini reviews and refines
   - Phase 3: Claude compares and finalizes

4. **Export Your PRD:**
   - Download as Markdown
   - Share with your team

---

### Using the 3-Phase Workflow

**Phase 1: Initial Draft (Claude Sonnet 4.5)**
1. Click "Copy Prompt" button
2. Open [Claude.ai](https://claude.ai)
3. Paste the prompt
4. Copy Claude's response
5. Paste back into the app
6. Click "Save & Continue"

**Phase 2: Review & Refine (Gemini 2.5 Pro)**
1. Click "Copy Prompt" button (includes Phase 1 response)
2. Open [Gemini](https://gemini.google.com)
3. Paste the prompt
4. Copy Gemini's response
5. Paste back into the app
6. Click "Save & Continue"

**Phase 3: Final Comparison (Claude Sonnet 4.5)**
1. Click "Copy Prompt" button (includes both responses)
2. Open [Claude.ai](https://claude.ai)
3. Paste the prompt
4. Copy Claude's final PRD
5. Paste back into the app
6. Click "Save & Export"

---

### Customizing Prompts

**Desktop App:**
1. Navigate to your project
2. Click "Edit Prompts" for any phase
3. Modify the template text
4. Save changes

**Web App:**
1. Navigate to your project
2. Click the settings icon for any phase
3. Edit the prompt template
4. Save changes

**Default Prompts:**
- Located in [`prompts/`](../../prompts/) directory
- See [`prompts/README.md`](../../prompts/README.md) for details

---

### Exporting PRDs

**Export Formats:**
- **Markdown (.md):** Final PRD with formatting
- **JSON (.json):** Complete project data (for backup/migration)

**Desktop App:**
- Click "Export PRD" button
- Choose format
- Save to your computer

**Web App:**
- Click "Export" button
- File downloads automatically
- Compatible with desktop app

---

### Migrating Between Platforms

**Desktop → Web:**
1. Export project as JSON from desktop app
2. Open web app
3. Click "Import" button
4. Select the JSON file

**Web → Desktop:**
1. Export project as JSON from web app
2. Open desktop app
3. Click "Import" button
4. Select the JSON file

**Same JSON format - fully compatible!**

---

## 🔧 Troubleshooting

### Desktop App Issues

**Windows SmartScreen Warning:**
- Click "More info" → "Run anyway"
- See [`docs/deployment/CODE_SIGNING.md`](../deployment/CODE_SIGNING.md)

**Port Already in Use:**
- Close other instances of the app
- Or use setup scripts to kill processes:
  ```bash
  lsof -ti:8080 | xargs kill -9
  lsof -ti:8501 | xargs kill -9
  ```

**App Won't Start:**
- Check logs: `backend.log` and `frontend.log`
- See [`docs/development/LOGGING.md`](../development/LOGGING.md)

---

### Web App Issues

**Data Not Saving:**
- Check browser storage quota
- Clear browser cache and reload
- Try a different browser

**Import Not Working:**
- Ensure JSON file is valid
- Check browser console for errors
- Try exporting and re-importing

**Offline Mode:**
- Web app works offline after first load
- Requires internet for initial load only

---

## ❓ FAQ

**Q: Do I need to install anything?**
- Desktop: Yes, download and install the app
- Web: No, just open the URL

**Q: Where is my data stored?**
- Desktop: Local filesystem in `outputs/` directory
- Web: Browser IndexedDB (never sent to server)

**Q: Can I use this offline?**
- Desktop: Yes, fully offline
- Web: Yes, after first load

**Q: Do I need API keys?**
- No! Manual copy/paste workflow means no API keys required

**Q: Can I customize the prompts?**
- Yes! Edit prompts in the app or in [`prompts/`](../../prompts/) directory

**Q: Can I migrate between desktop and web?**
- Yes! Export as JSON and import on the other platform

**Q: Is my data private?**
- Yes! All data stored locally (filesystem or browser)
- No server storage, no tracking, no analytics

---

## 🔗 Related Documentation

- **[Architecture](../architecture/)** - How the system works
- **[Deployment](../deployment/)** - Hosting and releases
- **[Prompts](../../prompts/)** - Prompt templates
- **[Web App](../../web/)** - Web application
- **[Main README](../../README.md)** - Project overview

