# Product Requirements Assistant - Pruning Plan

## 🎯 Objective

Transform product-requirements-assistant from a multi-backend monorepo into a lean, production-ready web app matching one-pager's clean architecture.

**Reference:** https://github.com/bordenet/one-pager

---

## 📊 Current State Analysis

### What We Have (Bloated Monorepo)

```
product-requirements-assistant/
├── backend/                    # ❌ Go REST API (8080) - REMOVE
├── frontend/                   # ❌ Python Streamlit UI (8501) - REMOVE
├── cmd/                        # ❌ Desktop clients (Electron, WebView2) - REMOVE
├── build/                      # ❌ Desktop build configs - REMOVE
├── dist/                       # ❌ Desktop build artifacts - REMOVE
├── internal/                   # ❌ Go internal packages - REMOVE
├── venv/                       # ❌ Python virtual environment - REMOVE
├── web/                        # ✅ KEEP - Move to root
│   ├── index.html             # ✅ Main app
│   ├── js/                    # ✅ ES6 modules
│   ├── css/                   # ✅ Styles
│   └── data/prompts.json      # ✅ Convert to .md files
├── prompts/                    # ✅ KEEP - Already has .md files
├── evolutionary-optimization/  # ✅ KEEP - Core methodology
├── tools/                      # ✅ KEEP - Optimization tools
├── docs/                       # ✅ KEEP - Clean up
├── scripts/                    # ✅ KEEP - Update
├── outputs/                    # ✅ KEEP - User data
├── inputs/                     # ✅ KEEP - User data
├── testdata/                   # ✅ KEEP - Test fixtures
├── Makefile                    # ❌ REMOVE - Go/Python build
├── requirements.txt            # ❌ REMOVE - Python deps
├── run.sh                      # ❌ REMOVE - Backend launcher
├── run-thick-clients.*         # ❌ REMOVE - Desktop launchers
└── README.md                   # ✅ KEEP - Rewrite
```

### What We Want (Lean Web App)

```
product-requirements-assistant/
├── index.html                  # Main application
├── js/                         # JavaScript modules
│   ├── app.js
│   ├── storage.js
│   ├── workflow.js
│   ├── projects.js
│   ├── project-view.js
│   ├── router.js
│   ├── ui.js
│   └── views.js
├── css/
│   └── styles.css
├── prompts/                    # LLM prompt templates (.md)
│   ├── phase1-claude-initial.md
│   ├── phase2-gemini-review.md
│   └── phase3-claude-synthesis.md
├── tests/                      # Jest unit tests
│   ├── storage.test.js
│   ├── workflow.test.js
│   ├── projects.test.js
│   └── ui.test.js
├── e2e/                        # Playwright E2E tests
│   └── workflow.spec.js
├── evolutionary-optimization/  # Prompt optimization
├── tools/                      # Optimization tools
├── docs/                       # Documentation (cleaned)
├── scripts/                    # Setup & deployment
├── outputs/                    # User PRD outputs
├── inputs/                     # User inputs
├── testdata/                   # Test fixtures
├── package.json                # Node.js dependencies
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup
├── .eslintrc.json              # ESLint rules
├── .gitignore                  # Simplified
├── README.md                   # Rewritten
├── CLAUDE.md                   # Updated
└── LICENSE
```

---

## 🗑️ Files/Directories to Remove

### Backend (Go)
- `backend/` - Entire directory
- `internal/api/` - Go API packages
- `internal/config/` - Go config
- `internal/core/` - Go core logic
- `internal/embed/` - Go embedded files
- `internal/metrics/` - Go metrics
- `internal/mock/` - Go mocks
- `backend/go.mod`, `backend/go.sum` - Go modules

### Frontend (Python)
- `frontend/` - Entire directory
- `venv/` - Python virtual environment
- `requirements.txt` - Python dependencies
- `frontend/__pycache__/` - Python cache

### Desktop Clients
- `cmd/electron/` - Electron client
- `cmd/webview/` - WebView2 client
- `cmd/web/` - Web launcher (if exists)
- `build/electron/` - Electron build configs
- `build/webview/` - WebView2 build configs
- `dist/electron/` - Electron artifacts
- `dist/webview/` - WebView2 artifacts

### Build System
- `Makefile` - Go/Python build system
- `run.sh` - Backend launcher
- `run-thick-clients.sh` - Desktop launcher
- `run-thick-clients.ps1` - Desktop launcher (Windows)
- `codecov.yml` - Go coverage config (if not needed)

### Temporary/Obsolete
- `temp-docs-2025-11-20/` - Temporary docs
- `web/` - Move contents to root, then delete

---

## ✅ Files to Keep and Update

### Core Application
- `web/index.html` → `index.html` (move to root)
- `web/js/` → `js/` (move to root)
- `web/css/` → `css/` (move to root)
- `prompts/` - Keep, already has .md files

### Configuration (New)
- `package.json` - CREATE (copy from one-pager)
- `jest.config.js` - CREATE
- `jest.setup.js` - CREATE
- `.eslintrc.json` - CREATE
- `.gitignore` - UPDATE (simplify)

### Documentation
- `README.md` - REWRITE (match one-pager)
- `CLAUDE.md` - UPDATE (remove backend/frontend refs)
- `CONTRIBUTING.md` - KEEP
- `LICENSE` - KEEP
- `RELEASES.md` - KEEP

### Evolutionary Optimization
- `evolutionary-optimization/` - KEEP
- `tools/` - KEEP
- `prompts/` - KEEP (already .md files)

### Scripts
- `scripts/setup-macos.sh` - UPDATE (remove Go/Python)
- `scripts/setup-linux.sh` - UPDATE (remove Go/Python)
- `scripts/setup-windows-wsl.sh` - UPDATE (remove Go/Python)
- `scripts/setup-windows.ps1` - UPDATE (remove Go/Python)
- `scripts/deploy-web.sh` - UPDATE (deploy from root)
- `scripts/` - KEEP other scripts, review for relevance

### Data
- `outputs/` - KEEP
- `inputs/` - KEEP
- `testdata/` - KEEP

---

## 🔄 Migration Steps

### Phase 1: Analysis (CURRENT)
1. ✅ Document current structure
2. ✅ Identify all cruft
3. ✅ Create this pruning plan

### Phase 2: Preparation
1. Create `package.json` (copy from one-pager, adapt)
2. Create `jest.config.js`
3. Create `jest.setup.js`
4. Create `.eslintrc.json`
5. Update `.gitignore`

### Phase 3: File Movement
1. Move `web/index.html` → `index.html`
2. Move `web/js/` → `js/`
3. Move `web/css/` → `css/`
4. Verify `prompts/` already has .md files (no move needed)

### Phase 4: Deletion
1. Delete `backend/`
2. Delete `frontend/`
3. Delete `cmd/`
4. Delete `build/`
5. Delete `dist/`
6. Delete `internal/`
7. Delete `venv/`
8. Delete `requirements.txt`
9. Delete `Makefile`
10. Delete `run*.sh`, `run*.ps1`
11. Delete `temp-docs-2025-11-20/`
12. Delete `web/` (after moving contents)

### Phase 5: Script Updates
1. Update `scripts/setup-macos.sh`
2. Update `scripts/setup-linux.sh`
3. Update `scripts/setup-windows-wsl.sh`
4. Update `scripts/setup-windows.ps1`
5. Update `scripts/deploy-web.sh`

### Phase 6: Testing Infrastructure
1. Create `tests/` directory
2. Write `tests/storage.test.js`
3. Write `tests/workflow.test.js`
4. Write `tests/projects.test.js`
5. Write `tests/ui.test.js`
6. Create `e2e/` directory
7. Write `e2e/workflow.spec.js`

### Phase 7: Documentation Updates
1. Rewrite `README.md`
2. Update `CLAUDE.md`
3. Clean `docs/` directory
4. Update evolutionary optimization docs

### Phase 8: Quality Assurance
1. Run `npm install`
2. Run `npm run lint`
3. Run `npm run lint:fix`
4. Run `npm test`
5. Run `npm run test:coverage`
6. Manual functionality testing

### Phase 9: Finalization
1. Final cleanup
2. Git commit
3. Push to origin main

---

## 📈 Expected Outcomes

### Size Reduction
- **Before:** ~500MB (with node_modules, venv, Go binaries)
- **After:** ~50MB (with node_modules only)
- **Reduction:** 90% smaller

### Complexity Reduction
- **Before:** 3 runtimes (Go, Python, Node.js), 3 clients (web, Electron, WebView2)
- **After:** 1 runtime (Node.js for dev), 1 client (web)
- **Reduction:** 67% fewer moving parts

### Maintenance Burden
- **Before:** Maintain Go backend, Python frontend, Electron, WebView2, 3 build systems
- **After:** Maintain vanilla JS web app, 1 test framework
- **Reduction:** 80% less maintenance

### Test Coverage
- **Before:** Go tests (backend), Python tests (frontend), no JS tests
- **After:** Jest unit tests (4 suites), Playwright E2E tests
- **Improvement:** Comprehensive JS testing

---

## ⚠️ Critical Preservation

### Must NOT Break
1. ✅ 3-phase workflow (Claude → Gemini → Claude)
2. ✅ IndexedDB storage (all data client-side)
3. ✅ Export/import functionality
4. ✅ Privacy-first architecture (no server)
5. ✅ Evolutionary optimization tooling
6. ✅ Prompt templates

### Must Verify After Pruning
1. Create new project
2. Complete Phase 1 (Claude initial)
3. Complete Phase 2 (Gemini review)
4. Complete Phase 3 (Claude synthesis)
5. Export project as JSON
6. Import project from JSON
7. Export final PRD as Markdown
8. Run evolutionary optimizer
9. Run simulations

---

## 📝 Success Criteria

- [ ] All backend/frontend/desktop code removed
- [ ] Web app runs from root directory
- [ ] `npm install` works
- [ ] `npm test` passes with 70%+ coverage
- [ ] `npm run lint` passes
- [ ] Manual workflow test passes
- [ ] Evolutionary optimization still works
- [ ] Documentation accurate
- [ ] Repository size reduced by 80%+
- [ ] No broken links in docs

---

**Status:** READY TO EXECUTE
**Next Step:** Create package.json
