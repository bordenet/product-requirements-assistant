# Architecture Documentation

System design, technical architecture, and API documentation.

---

## 📄 Documents

### [`ARCHITECTURE.md`](./ARCHITECTURE.md)

**Purpose:** Complete system architecture overview

**Contents:**
- System overview and design philosophy
- Technology stack (Go backend, Streamlit frontend, Vanilla JS web)
- Component architecture
- Desktop clients (Electron, WebView2)
- Web client (CloudFront + IndexedDB)
- Data flow and storage
- Development workflow
- Deployment architecture

**Audience:** Developers, architects, technical contributors

**Key Sections:**
- Backend: Go REST API (port 8080)
- Frontend: Streamlit (port 8501) for desktop, Vanilla JS for web
- Storage: Local filesystem (desktop) vs IndexedDB (web)
- 3-phase workflow implementation
- Project structure and file organization

---

### [`API.md`](./API.md)

**Purpose:** Complete REST API reference documentation

**Contents:**
- Base URL and endpoints
- Request/response formats
- Error handling
- Authentication (none - local only)
- Rate limiting (none - local only)

**Audience:** Frontend developers, integration developers, API consumers

**Endpoints Documented:**

**Projects:**
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

**Phases:**
- `GET /api/projects/{id}/phases/{phase}` - Get phase data
- `PUT /api/projects/{id}/phases/{phase}` - Update phase data
- `POST /api/projects/{id}/generate/{phase}` - Generate mock AI response (testing only)

**Prompts:**
- `GET /api/prompts/{phase}` - Get prompt template
- `PUT /api/prompts/{phase}` - Update prompt template
- `POST /api/prompts/{phase}/reset` - Reset to default

**Export:**
- `GET /api/projects/{id}/export` - Export project as JSON
- `GET /api/projects/{id}/export/markdown` - Export final PRD as Markdown

**Health:**
- `GET /health` - Health check endpoint

---

## 🏗️ Architecture Highlights

### Multi-Platform Support

**Desktop Applications:**
- **Electron:** Cross-platform (Windows, macOS, Linux) - ~150MB
- **WebView2:** Native OS browser engines - ~10MB

**Web Application:**
- **CloudFront:** Static hosting with browser storage
- **100% client-side:** No backend required
- **Privacy-first:** All data in browser IndexedDB

### Technology Stack

**Backend:**
- Language: Go 1.21+
- Framework: Standard library (`net/http`)
- Storage: Local filesystem (JSON files)
- Port: 8080

**Frontend (Desktop):**
- Language: Python 3.8+
- Framework: Streamlit
- Port: 8501

**Frontend (Web):**
- Language: JavaScript (ES6 modules)
- Framework: None (vanilla JS)
- CSS: Tailwind CSS (via CDN)
- Storage: IndexedDB

### Data Flow

```
User Input
    ↓
Frontend (Streamlit or Web)
    ↓
Backend API (Go) [Desktop only]
    ↓
Local Storage (Filesystem or IndexedDB)
    ↓
AI Copy/Paste Workflow
    ↓
Export (JSON or Markdown)
```

---

## 🔗 Related Documentation

- **[Deployment](../deployment/)** - How to deploy and release
- **[Development](../development/)** - Development tools and workflows
- **[Guides](../guides/)** - User-facing documentation
- **[Main README](../../README.md)** - Project overview

