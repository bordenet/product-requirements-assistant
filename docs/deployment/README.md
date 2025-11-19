# Deployment Documentation

Guides for deploying, releasing, and hosting the Product Requirements Assistant.

---

## 📄 Documents

### [`RELEASING.md`](./RELEASING.md)

**Purpose:** How to create and publish releases

**Contents:**
- Semantic versioning strategy
- Release workflow with [`scripts/release.py`](../../scripts/release.py)
- GitHub Actions automation
- Building binaries for all platforms
- Release checklist

**Audience:** Maintainers, release managers

**Quick Start:**
```bash
# Patch release (bug fixes: 0.1.0 -> 0.1.1)
./scripts/release.py patch

# Minor release (new features: 0.1.0 -> 0.2.0)
./scripts/release.py minor -m "Add new feature"

# Major release (breaking changes: 0.1.0 -> 1.0.0)
./scripts/release.py major
```

---

### [`CODE_SIGNING.md`](./CODE_SIGNING.md)

**Purpose:** Windows code signing guide and cost-benefit analysis

**Contents:**
- Why code signing matters (Windows SmartScreen warnings)
- Certificate types and costs ($300-500/year)
- How to obtain and use certificates
- Signing process for Electron and WebView2 apps
- Alternative: User instructions for bypassing SmartScreen

**Audience:** Release managers, Windows developers

**Key Decision:** Currently unsigned - users see SmartScreen warnings but can bypass with "More info" → "Run anyway"

---

### [`CLOUDFRONT_HOSTING.md`](./CLOUDFRONT_HOSTING.md)

**Purpose:** Web app architecture and CloudFront deployment strategy

**Contents:**
- 100% client-side architecture
- Browser storage strategy (IndexedDB)
- Privacy-first design (zero server storage)
- Cost analysis ($2-6/month)
- Desktop vs Web comparison
- Migration path between platforms

**Audience:** DevOps, web developers, architects

**Key Features:**
- No backend required
- All data stored in browser
- Works offline after first load
- Compatible with desktop app (same JSON format)

---

### [`WEB_APP_IMPLEMENTATION.md`](./WEB_APP_IMPLEMENTATION.md)

**Purpose:** Technical implementation details for the web app

**Contents:**
- IndexedDB schema and API
- JavaScript module structure
- Export/import with File System Access API
- Storage quota management
- Browser compatibility

**Audience:** Web developers, frontend engineers

**Tech Stack:**
- Vanilla JavaScript (ES6 modules)
- IndexedDB for storage
- Tailwind CSS for styling
- No frameworks or build tools

---

### [`WEB_APP_DEPLOYMENT.md`](./WEB_APP_DEPLOYMENT.md)

**Purpose:** Step-by-step CloudFront deployment guide

**Contents:**
- AWS S3 bucket setup
- CloudFront distribution configuration
- Custom domain with SSL (Route 53 + ACM)
- GitHub Actions CI/CD pipeline
- Cache headers and invalidation
- Alternative hosting (GitHub Pages, Netlify, Vercel)

**Audience:** DevOps engineers, deployment managers

**Deployment Options:**
1. **CloudFront + S3** ($2-6/month) - Recommended for production
2. **GitHub Pages** (Free) - Good for demos
3. **Netlify/Vercel** (Free) - Easy drag-and-drop
4. **Local** (Free) - `cd web && python3 -m http.server 8000`

---

### [`DEPLOY_STREAMLIT_CLOUD.md`](./DEPLOY_STREAMLIT_CLOUD.md)

**Purpose:** Alternative deployment option using Streamlit Cloud

**Contents:**
- Streamlit Cloud setup
- Deployment configuration
- Limitations vs CloudFront

**Audience:** Developers looking for quick deployment

**Note:** This is an alternative to CloudFront, not the recommended approach for the web app.

---

## 🚀 Deployment Quick Reference

### Desktop Applications

**Build Locally:**
```bash
# Electron (all platforms)
cd cmd/electron
npm install
npm run build

# WebView2 (current platform)
cd cmd/webview
go build -o ../../dist/webview/prd-assistant
```

**Automated Builds:**
- GitHub Actions builds all platforms on release
- See [`.github/workflows/release.yml`](../../.github/workflows/release.yml)

**Platforms:**
- Windows: Electron installer (.exe) + WebView2 portable (.exe)
- macOS: Electron DMG + WebView2 binaries (Intel & Apple Silicon)
- Linux: Electron AppImage + WebView2 binary

---

### Web Application

**Deploy to CloudFront:**
```bash
# Manual deployment
aws s3 sync web/ s3://your-bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

**Automated Deployment:**
- GitHub Actions deploys on push to `main`
- See [`.github/workflows/deploy-web.yml`](../../.github/workflows/deploy-web.yml)

**Requirements:**
- AWS account with S3 and CloudFront
- GitHub secrets configured (AWS credentials, bucket name, distribution ID)

---

### Local Development

**Desktop App:**
```bash
# Terminal 1 - Backend
make run-backend

# Terminal 2 - Frontend
make run-frontend

# Open http://localhost:8501
```

**Web App:**
```bash
cd web
python3 -m http.server 8000
# Open http://localhost:8000
```

---

## 📊 Deployment Comparison

| Feature | Desktop (Electron) | Desktop (WebView2) | Web (CloudFront) |
|---------|-------------------|-------------------|------------------|
| **Size** | ~150MB | ~10MB | ~75KB |
| **Installation** | Full installer | Portable .exe | None (browser) |
| **Offline** | ✅ Full | ✅ Full | ✅ After first load |
| **Updates** | Auto-update | Manual download | Instant (refresh) |
| **Storage** | Filesystem | Filesystem | IndexedDB |
| **Privacy** | ✅ 100% local | ✅ 100% local | ✅ 100% local |
| **Cost** | Free (unsigned) | Free | $2-6/month |
| **Platforms** | Win/Mac/Linux | Win/Mac/Linux | Any browser |

---

## 🔗 Related Documentation

- **[Architecture](../architecture/)** - System design and tech stack
- **[Development](../development/)** - Development tools and workflows
- **[Scripts](../../scripts/)** - Automation scripts
- **[Web App](../../web/)** - Web application source code

