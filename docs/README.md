# Documentation Index

**Product Requirements Assistant** - Documentation organized by category.

---

## 📖 Quick Links

### For Users
- **[Thick Clients Guide](guides/THICK_CLIENTS_GUIDE.md)** - How to use desktop apps (Electron/WebView2)
- **[Quick Start (Windows)](../QUICK_START_WINDOWS.md)** - Download and run on Windows

### For Developers
- **[Architecture](architecture/ARCHITECTURE.md)** - System overview and tech stack
- **[API Reference](architecture/API.md)** - Backend REST API endpoints
- **[Mock AI](development/MOCK_AI.md)** - Testing with mock AI responses

### For DevOps
- **[Releasing](deployment/RELEASING.md)** - How to create releases
- **[Code Signing](deployment/CODE_SIGNING.md)** - Windows code signing guide
- **[CloudFront Hosting](deployment/CLOUDFRONT_HOSTING.md)** - Web app deployment

---

## 📁 Documentation Structure

```
docs/
├── architecture/       # System design and API docs
├── deployment/         # Deployment and release guides
├── development/        # Development tools and workflows
├── decisions/          # Historical design decisions
├── guides/            # User-facing guides
├── img/               # Screenshots and diagrams
└── _archive/          # Obsolete docs (kept for reference)
```

---

## 🏗️ Architecture

**[architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md)**
- System overview
- Technology stack (Go backend, Streamlit frontend)
- Desktop clients (Electron, WebView2)
- Web client (CloudFront + IndexedDB)
- Development workflow

**[architecture/API.md](architecture/API.md)**
- REST API endpoints
- Request/response formats
- Error handling

---

## 🚀 Deployment

**[deployment/CLOUDFRONT_HOSTING.md](deployment/CLOUDFRONT_HOSTING.md)**
- Web app architecture (100% client-side)
- Browser storage strategy (IndexedDB)
- Privacy-first design
- Cost analysis ($2-6/month)

**[deployment/WEB_APP_IMPLEMENTATION.md](deployment/WEB_APP_IMPLEMENTATION.md)**
- Technical implementation details
- IndexedDB schema and API
- Export/import with File System Access API

**[deployment/WEB_APP_DEPLOYMENT.md](deployment/WEB_APP_DEPLOYMENT.md)**
- CloudFront setup guide
- S3 bucket configuration
- Custom domain with SSL
- GitHub Actions CI/CD

**[deployment/RELEASING.md](deployment/RELEASING.md)**
- Semantic versioning
- GitHub releases workflow
- Building binaries for all platforms

**[deployment/CODE_SIGNING.md](deployment/CODE_SIGNING.md)**
- Windows code signing certificates
- SmartScreen warnings
- Cost-benefit analysis

**[deployment/DEPLOY_STREAMLIT_CLOUD.md](deployment/DEPLOY_STREAMLIT_CLOUD.md)**
- Alternative: Streamlit Cloud hosting
- Quick deployment option (not CloudFront)

---

## 🛠️ Development

**[development/MOCK_AI.md](development/MOCK_AI.md)**
- Mock AI system for testing
- Automated PRD generation
- Test coverage

**[development/LOGGING.md](development/LOGGING.md)**
- Logging configuration
- Log levels and formats
- Debugging tips

**[development/LAUNCHER_SCRIPTS.md](development/LAUNCHER_SCRIPTS.md)**
- Thick client launcher scripts
- Process management
- Error handling

---

## 📚 Guides

**[guides/THICK_CLIENTS_GUIDE.md](guides/THICK_CLIENTS_GUIDE.md)**
- Desktop app user guide
- Electron vs WebView2
- Installation and usage

---

## 🗂️ Decisions

**[decisions/THICK_CLIENT_DECISION.md](decisions/THICK_CLIENT_DECISION.md)**
- Why we built desktop clients
- Electron vs WebView2 comparison
- Historical context

**[decisions/REFACTORING_PLAN.md](decisions/REFACTORING_PLAN.md)**
- Historical refactoring decisions
- Code organization improvements

---

## 📦 Platform Support

### Desktop Applications
- **Electron** - Cross-platform (Windows, macOS, Linux)
- **WebView2** - Native (Windows, macOS, Linux)

### Web Application
- **CloudFront** - Static hosting with browser storage
- **100% client-side** - No backend, maximum privacy

---

## 🔐 Privacy & Security

All deployment options prioritize user privacy:

- **Desktop:** Data stored in local file system
- **Web:** Data stored in browser IndexedDB (never sent to server)
- **Export/Import:** User controls their data (JSON files)

---

## 📝 Contributing

When adding new documentation:

1. **Choose the right category:**
   - `architecture/` - System design, APIs
   - `deployment/` - Deployment, releases, infrastructure
   - `development/` - Dev tools, testing, debugging
   - `guides/` - User-facing documentation
   - `decisions/` - Design decisions (historical)

2. **Update this README** with a link to your new doc

3. **Keep docs up-to-date** with code changes

4. **Archive obsolete docs** to `_archive/` (don't delete)

---

## 🗄️ Archive

Obsolete documentation is kept in `_archive/` for historical reference:
- V1.5 planning docs (superseded by current implementation)
- Old testing results
- Deprecated guides

These are kept for context but should not be used for current development.

