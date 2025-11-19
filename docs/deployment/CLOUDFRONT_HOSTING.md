# CloudFront Hosting Strategy

## User Requirement

**CRITICAL:** All documents must be stored **locally in the browser**, NOT in AWS/cloud storage.

This is a **privacy-first, client-side-only** web application.

---

## Current Architecture (Desktop-Only)

```
┌─────────────────────────────────────────┐
│  Thick Client (Electron/WebView2)      │
│  ┌───────────────────────────────────┐ │
│  │  Go Backend (localhost:8080)      │ │
│  │  - REST API                       │ │
│  │  - File system storage            │ │
│  │  - Prompt management              │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │  Streamlit Frontend (:8501)       │ │
│  │  - Python web server              │ │
│  │  - Server-side rendering          │ │
│  │  - WebSocket connections          │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Problems for CloudFront:**
- ❌ Streamlit requires Python server (not static)
- ❌ Streamlit uses WebSockets for reactivity
- ❌ Go backend needs server infrastructure
- ❌ File system storage (local only)

**Good News:**
- ✅ No backend needed (client-side only)
- ✅ No database needed (browser storage)
- ✅ No authentication needed (local data)
- ✅ Perfect for CloudFront (pure static)

## Solution: Pure Static Client-Side App

### RECOMMENDED: Static HTML/JS + Browser Storage

**Architecture:**
```
CloudFront (CDN)
└── S3: Static Files
    ├── index.html
    ├── app.js (vanilla JS or React)
    ├── styles.css
    └── prompts.json (embedded)

Browser (Client-Side Only)
├── IndexedDB: Project storage (5MB-50MB+)
├── LocalStorage: Settings/preferences
└── File System Access API: Import/Export
```

**Data Flow:**
```
User Browser
├── Load static app from CloudFront (once)
├── Store ALL data in IndexedDB (local)
├── Export projects as JSON (download)
└── Import projects from JSON (upload)
```

**Pros:**
- ✅ **100% client-side** - no backend needed
- ✅ **Privacy-first** - data never leaves browser
- ✅ **Offline-capable** - works without internet (after first load)
- ✅ **Zero AWS costs** - just S3 + CloudFront (~$1-5/month)
- ✅ **Fast** - no API calls, instant responses
- ✅ **Simple** - just HTML/JS/CSS
- ✅ **Portable** - export/import JSON files

**Cons:**
- ❌ Rewrite frontend (Streamlit → HTML/JS)
- ❌ Data lost if browser cache cleared (mitigated by export)
- ❌ No sync across devices (by design - privacy)
- ❌ No collaboration features (single-user)

**Effort:** 🟡 Medium (1-2 weeks)
**Cost:** 💰 Very Low ($1-5/month)

---

## Browser Storage Options

### IndexedDB (Recommended)

**Capacity:** 50MB - 10GB+ (browser-dependent)

```javascript
// Store projects in IndexedDB
const db = await openDB('prd-assistant', 1, {
  upgrade(db) {
    db.createObjectStore('projects', { keyPath: 'id' });
  }
});

// Save project
await db.put('projects', project);

// Load all projects
const projects = await db.getAll('projects');
```

**Pros:**
- ✅ Large storage (50MB+)
- ✅ Structured data
- ✅ Fast queries
- ✅ Async API

### LocalStorage (Settings Only)

**Capacity:** 5-10MB

```javascript
// Store user preferences
localStorage.setItem('theme', 'dark');
localStorage.setItem('lastProjectId', project.id);
```

**Use for:**
- User preferences
- UI state
- Last opened project

### File System Access API (Export/Import)

```javascript
// Export project as JSON
const handle = await window.showSaveFilePicker({
  suggestedName: `${project.title}.json`,
  types: [{
    description: 'PRD Project',
    accept: { 'application/json': ['.json'] }
  }]
});
const writable = await handle.createWritable();
await writable.write(JSON.stringify(project, null, 2));
await writable.close();

// Import project from JSON
const [fileHandle] = await window.showOpenFilePicker({
  types: [{
    description: 'PRD Project',
    accept: { 'application/json': ['.json'] }
  }]
});
const file = await fileHandle.getFile();
const project = JSON.parse(await file.text());
```

**Pros:**
- ✅ User controls files
- ✅ Backup/restore
- ✅ Share between devices
- ✅ Version control (Git)

---

## Implementation Plan

### Phase 1: Create Static Web App (1-2 weeks)

**Tech Stack:**
- Vanilla JavaScript (or React if preferred)
- IndexedDB for storage (via `idb` library)
- File System Access API for export/import
- Tailwind CSS for styling

**File Structure:**
```
web/
├── index.html
├── js/
│   ├── app.js           # Main application
│   ├── storage.js       # IndexedDB wrapper
│   ├── prompts.js       # Embedded prompts
│   └── export.js        # Import/export logic
├── css/
│   └── styles.css
└── prompts/
    └── prompts.json     # Default prompts
```

**Features:**
1. ✅ Create new PRD projects
2. ✅ 3-phase workflow (same as desktop)
3. ✅ Edit prompts (stored in IndexedDB)
4. ✅ Export project as JSON
5. ✅ Import project from JSON
6. ✅ Export PRD as Markdown
7. ✅ List all projects
8. ✅ Delete projects
9. ✅ Dark/light theme

### Phase 2: Deploy to CloudFront (1 day)

**Infrastructure:**
```
Route 53 (DNS)
└── CloudFront Distribution
    ├── Origin: S3 Bucket (static files)
    ├── SSL Certificate (ACM)
    ├── Cache: 1 year (immutable assets)
    └── Error Pages: SPA routing
```

**Deployment:**
```bash
# Build static files
cd web && npm run build

# Upload to S3
aws s3 sync dist/ s3://prd-assistant-web/

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1234567890 \
  --paths "/*"
```

**Cost Breakdown:**
- S3 storage: $0.023/GB/month (~$0.10/month)
- CloudFront: $0.085/GB transfer (~$1-5/month)
- Route 53: $0.50/month
- **Total: ~$2-6/month**

---

## Privacy & Security Features

### Data Privacy
- ✅ **Zero server storage** - all data in browser
- ✅ **No analytics** - no tracking scripts
- ✅ **No cookies** - except for preferences
- ✅ **No authentication** - no user accounts
- ✅ **Offline-capable** - works without internet

### Data Portability
- ✅ **Export all projects** as JSON
- ✅ **Import from JSON** files
- ✅ **Backup to local disk** anytime
- ✅ **Version control** - commit JSON to Git

### Browser Compatibility
- ✅ Chrome/Edge 86+ (IndexedDB, File System Access API)
- ✅ Firefox 87+ (IndexedDB, fallback for File System API)
- ✅ Safari 15.2+ (IndexedDB, fallback for File System API)

---

## Migration Path (Desktop → Web)

Users can migrate from desktop app to web app:

1. **Export from desktop:**
   - Desktop app saves to `outputs/*.json`
   - Copy JSON files

2. **Import to web:**
   - Open web app
   - Click "Import Project"
   - Select JSON file(s)
   - Projects appear in web app

3. **Sync strategy:**
   - Use Git to sync JSON files
   - Or use cloud storage (Dropbox, Google Drive)
   - Or manual export/import

---

## Comparison: Desktop vs Web

| Feature | Desktop (Electron) | Web (CloudFront) |
|---------|-------------------|------------------|
| **Installation** | Download .exe | Open URL |
| **Storage** | File system | IndexedDB |
| **Offline** | ✅ Always | ✅ After first load |
| **Updates** | Manual download | Auto (cache invalidation) |
| **Data Sync** | Manual (Git) | Manual (export/import) |
| **Privacy** | ✅ Local files | ✅ Browser storage |
| **Size** | 150MB | 500KB |
| **Startup** | 2-3 seconds | Instant |
| **Cost** | Free (unsigned) | $2-6/month |

---

## Next Steps

### Option A: Vanilla JavaScript (Faster)
- **Timeline:** 1 week
- **Pros:** No build step, simple
- **Cons:** More manual DOM manipulation

### Option B: React (More Maintainable)
- **Timeline:** 2 weeks
- **Pros:** Component-based, easier to maintain
- **Cons:** Build step, larger bundle

**Recommendation:** Start with **Vanilla JS** for speed, migrate to React later if needed.

---

## Ready to Build?

I can create:
1. **Proof of concept** (1-2 days) - Basic UI + IndexedDB
2. **Full implementation** (1-2 weeks) - Complete feature parity
3. **Deployment guide** - CloudFront setup

**Which would you like me to start with?**

