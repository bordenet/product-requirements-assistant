# Web App Implementation Guide

## Architecture: 100% Client-Side

**Zero Backend, Zero Cloud Storage, Maximum Privacy**

```
┌─────────────────────────────────────────────────────┐
│  CloudFront CDN (Static Files Only)                │
│  ├── index.html                                     │
│  ├── app.js                                         │
│  ├── styles.css                                     │
│  └── prompts.json                                   │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│  User's Browser (All Logic + Storage)              │
│  ┌───────────────────────────────────────────────┐ │
│  │  Application Logic (JavaScript)               │ │
│  │  - Project management                         │ │
│  │  - 3-phase workflow                           │ │
│  │  - Prompt editing                             │ │
│  │  - Export/Import                              │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │  IndexedDB (Persistent Storage)               │ │
│  │  - Projects (unlimited)                       │ │
│  │  - Custom prompts                             │ │
│  │  - User preferences                           │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │  File System Access API                       │ │
│  │  - Export projects as JSON                    │ │
│  │  - Import projects from JSON                  │ │
│  │  - Export PRD as Markdown                     │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core
- **HTML5** - Semantic markup
- **Vanilla JavaScript** (ES6+) - No framework overhead
- **CSS3** - Modern styling (Grid, Flexbox)
- **IndexedDB** - Client-side database

### Libraries (Minimal)
- **idb** (5KB) - IndexedDB wrapper
- **marked** (20KB) - Markdown rendering (optional)
- **Tailwind CSS** (CDN) - Utility-first CSS

### Total Bundle Size
- **HTML/JS/CSS:** ~50KB (gzipped)
- **Libraries:** ~25KB (gzipped)
- **Total:** ~75KB (vs 150MB Electron!)

---

## File Structure

```
web/
├── index.html              # Main HTML file
├── js/
│   ├── app.js             # Main application logic
│   ├── storage.js         # IndexedDB wrapper
│   ├── projects.js        # Project management
│   ├── workflow.js        # 3-phase workflow
│   ├── prompts.js         # Prompt management
│   ├── export.js          # Export/import logic
│   └── ui.js              # UI helpers
├── css/
│   └── styles.css         # Custom styles
├── data/
│   └── prompts.json       # Default prompts
└── README.md              # Web app documentation
```

---

## Core Features

### 1. Project Management

**Create Project:**
```javascript
async function createProject(title, problems, context) {
  const project = {
    id: crypto.randomUUID(),
    title,
    problems,
    context,
    phase: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phases: {
      1: { prompt: '', response: '', completed: false },
      2: { prompt: '', response: '', completed: false },
      3: { prompt: '', response: '', completed: false }
    }
  };
  
  await db.put('projects', project);
  return project;
}
```

**List Projects:**
```javascript
async function listProjects() {
  const projects = await db.getAll('projects');
  return projects.sort((a, b) => 
    new Date(b.updatedAt) - new Date(a.updatedAt)
  );
}
```

**Delete Project:**
```javascript
async function deleteProject(id) {
  await db.delete('projects', id);
}
```

### 2. IndexedDB Storage

**Initialize Database:**
```javascript
import { openDB } from 'idb';

const db = await openDB('prd-assistant', 1, {
  upgrade(db) {
    // Projects store
    const projectStore = db.createObjectStore('projects', { 
      keyPath: 'id' 
    });
    projectStore.createIndex('updatedAt', 'updatedAt');
    projectStore.createIndex('title', 'title');
    
    // Prompts store
    db.createObjectStore('prompts', { keyPath: 'phase' });
    
    // Settings store
    db.createObjectStore('settings', { keyPath: 'key' });
  }
});
```

**Storage Capacity:**
- Chrome: 60% of available disk space
- Firefox: 50% of available disk space
- Safari: 1GB (can request more)

**Typical Usage:**
- 1 project: ~10KB
- 100 projects: ~1MB
- 10,000 projects: ~100MB (plenty of headroom!)

### 3. Export/Import

**Export Single Project:**
```javascript
async function exportProject(projectId) {
  const project = await db.get('projects', projectId);
  
  // Use File System Access API
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
}
```

**Export All Projects:**
```javascript
async function exportAllProjects() {
  const projects = await db.getAll('projects');
  const prompts = await db.getAll('prompts');
  
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projects,
    prompts
  };
  
  // Download as JSON
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prd-assistant-backup-${Date.now()}.json`;
  a.click();
}
```

**Import Projects:**
```javascript
async function importProjects() {
  const [fileHandle] = await window.showOpenFilePicker({
    types: [{
      description: 'PRD Project or Backup',
      accept: { 'application/json': ['.json'] }
    }],
    multiple: false
  });
  
  const file = await fileHandle.getFile();
  const content = JSON.parse(await file.text());
  
  // Check if it's a single project or backup
  if (content.version && content.projects) {
    // Backup file
    for (const project of content.projects) {
      await db.put('projects', project);
    }
    return content.projects.length;
  } else {
    // Single project
    await db.put('projects', content);
    return 1;
  }
}
```

---

## Next: UI Implementation

See [WEB_APP_UI.md](WEB_APP_UI.md) for UI design and components.

