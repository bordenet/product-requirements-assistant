# Product Requirements Assistant - Web App

**100% Client-Side • Privacy-First • No Server Required**

This is the browser-based version of the Product Requirements Assistant. All data is stored locally in your browser using IndexedDB - nothing is ever sent to any server.

---

## 🚀 Quick Start

### Local Development

1. **Serve the web app:**
   ```bash
   # Using Python
   cd web
   python3 -m http.server 8000

   # OR using Node.js
   npx http-server -p 8000
   ```

2. **Open in browser:**
   ```
   http://localhost:8000
   ```

### Deploy to CloudFront

See [docs/deployment/WEB_APP_DEPLOYMENT.md](../docs/deployment/WEB_APP_DEPLOYMENT.md) for complete deployment instructions.

---

## 📁 Project Structure

```
web/
├── index.html              # Main HTML file
├── js/
│   ├── app.js             # Main application entry point
│   ├── storage.js         # IndexedDB wrapper
│   ├── projects.js        # Project management
│   ├── workflow.js        # 3-phase workflow logic
│   ├── views.js           # Projects list and new project views
│   ├── project-view.js    # Project detail view
│   ├── router.js          # Client-side routing
│   └── ui.js              # UI utilities (toasts, modals, etc.)
├── css/
│   └── styles.css         # Custom styles
├── data/
│   └── prompts.json       # Default AI prompts
└── README.md              # This file
```

---

## 🏗️ Architecture

### 100% Client-Side

```
Browser
├── IndexedDB (Storage)
│   ├── projects/          # All project data
│   ├── prompts/           # Custom prompts
│   └── settings/          # User preferences
├── JavaScript (Logic)
│   ├── Project CRUD
│   ├── 3-Phase Workflow
│   └── Export/Import
└── UI (Tailwind CSS)
    ├── Projects List
    ├── Project Detail
    └── Phase Workflow
```

### No Backend Required

- **Storage:** IndexedDB (50MB-10GB+ capacity)
- **Export:** JSON files via File System Access API
- **Import:** JSON files via FileReader API
- **Privacy:** All data stays in your browser

---

## 🔐 Privacy & Security

### What We Store

- **Projects:** Stored in IndexedDB (local to your browser)
- **Prompts:** Stored in IndexedDB (local to your browser)
- **Settings:** Stored in IndexedDB (local to your browser)

### What We DON'T Store

- ❌ No server-side storage
- ❌ No cloud backups
- ❌ No analytics or tracking
- ❌ No cookies (except theme preference)
- ❌ No user accounts

### Data Portability

- **Export:** Download all projects as JSON anytime
- **Import:** Upload JSON files to restore projects
- **Compatible:** Same JSON format as desktop app

---

## 🎯 Features

### 3-Phase Workflow

1. **Phase 1: Initial Draft** (Claude Sonnet 4.5)
   - Generate initial PRD from requirements
   - Copy/paste workflow

2. **Phase 2: Review & Refine** (Gemini 2.5 Pro)
   - Review and improve the draft
   - Distill and simplify

3. **Phase 3: Final Comparison** (Claude Sonnet 4.5)
   - Compare both versions
   - Create final PRD

### Project Management

- ✅ Create unlimited projects
- ✅ Track progress across 3 phases
- ✅ Export individual projects as JSON
- ✅ Export all projects as backup
- ✅ Import projects from JSON

### Export Options

- **Individual Project:** JSON file
- **All Projects:** Backup JSON file
- **Final PRD:** Markdown file

---

## 🛠️ Development

### Technologies

- **Vanilla JavaScript** (ES6 modules)
- **Tailwind CSS** (via CDN)
- **IndexedDB** (native browser API)
- **File System Access API** (for export/import)

### Browser Support

- ✅ Chrome/Edge 86+
- ✅ Firefox 87+
- ✅ Safari 15.4+
- ⚠️ File System Access API requires Chrome/Edge 86+ (fallback to download for others)

### Storage Capacity

- **Chrome:** 60% of available disk space
- **Firefox:** 50% of available disk space
- **Safari:** 1GB (can request more)

Typical usage: ~1-5MB per project

---

## 📦 Deployment

### Static Hosting Options

1. **CloudFront + S3** (Recommended)
   - See [WEB_APP_DEPLOYMENT.md](../docs/deployment/WEB_APP_DEPLOYMENT.md)
   - Cost: $2-6/month

2. **GitHub Pages** (Free)
   ```bash
   # Push to gh-pages branch
   git subtree push --prefix web origin gh-pages
   ```

3. **Netlify/Vercel** (Free)
   - Drag and drop the `web/` folder
   - Auto-deploy on push

### Build Process

No build process required! This is pure vanilla JavaScript with no bundling needed.

Just deploy the `web/` folder as-is to any static hosting service.

---

## 🔄 Migration

### From Desktop App

1. **Export from desktop:** File → Export Project
2. **Import to web:** Click "Import" button
3. **Upload JSON file**

### To Desktop App

1. **Export from web:** Click project → Export
2. **Import to desktop:** File → Import Project
3. **Select JSON file**

**Same JSON format** - fully compatible!

---

## 🐛 Troubleshooting

### Storage Issues

**Problem:** "Storage quota exceeded"

**Solution:**
1. Export all projects as backup
2. Delete old projects
3. Clear browser data (keep cookies)
4. Re-import projects

### Import/Export Issues

**Problem:** "Failed to import projects"

**Solution:**
1. Check JSON file format
2. Ensure file is valid JSON
3. Try importing individual projects

### Browser Compatibility

**Problem:** "File System Access API not supported"

**Solution:**
- Use Chrome/Edge 86+ for best experience
- Firefox/Safari will use download fallback

---

## 📝 License

MIT License - Same as the main project

---

---

## 📸 Example Walkthrough

### MonkeyMoonshot Example

The `docs/MonkeyMoonshot/` directory contains a complete Phase 1 walkthrough using a light-hearted example project: "MonkeyMoonshot - Simian Space Program."

This example demonstrates the complete Phase 1 workflow:
1. **Tool generates prompt** - Our tool creates an optimized Phase 1 prompt
2. **Copy to Claude Code** - User pastes prompt into Claude Code (or Claude Sonnet 4.5)
3. **Claude generates PRD** - Claude creates the initial PRD draft
4. **Copy back to tool** - User pastes Claude's complete response back into our tool

**Screenshots** (7 total):
1. `01-tool-phase1-prompt.png` - Tool generates Phase 1 prompt
2. `02-claude-phase1-draft.png` - Claude begins generating PRD
3. `03-claude-phase1-continued.png` - Claude continues the PRD
4. `04-claude-phase1-complete.png` - Claude completes the PRD draft
5. `05-tool-paste-phase1-start.png` - Begin pasting Claude's response into tool
6. `06-tool-paste-phase1-continued.png` - Continue pasting
7. `07-phase2-ready.png` - Phase 1 complete, starting Phase 2

These screenshots are embedded in the main [README.md](../README.md) as expandable `<details>` sections for an elegant, interactive documentation experience.

**Purpose:** This example helps new users understand the copy/paste workflow pattern without needing to read lengthy documentation. The whimsical "MonkeyMoonshot" theme makes the process approachable and memorable. The same pattern continues for Phase 2 (Gemini review) and Phase 3 (final synthesis).

---

## 🔗 Links

- **Main Project:** [GitHub](https://github.com/bordenet/product-requirements-assistant)
- **Desktop Apps:** [Releases](https://github.com/bordenet/product-requirements-assistant/releases)
- **Documentation:** [docs/](../docs/)
