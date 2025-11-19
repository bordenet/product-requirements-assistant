# Repository Refactoring Plan - v1.5 Thick Clients

## Current Structure Issues

1. **Flat backend directory** - All Go files in one directory
2. **No separation of concerns** - Web app vs thick client code mixed
3. **Documentation sprawl** - Multiple v1.5 docs without clear hierarchy
4. **No build infrastructure** - No dedicated build scripts for thick clients
5. **Test data clutter** - outputs/ directory has test artifacts

## Proposed Structure

```
product-requirements-assistant/
├── cmd/                          # Application entry points
│   ├── web/                      # Current web application (v1.0)
│   │   └── main.go              # Web server entry point
│   ├── webview/                  # WebView2 thick client (v1.5)
│   │   └── main.go              # WebView2 launcher
│   └── electron/                 # Electron thick client (v1.5)
│       ├── main.js              # Electron main process
│       ├── preload.js           # Electron preload script
│       └── package.json         # Electron dependencies
├── internal/                     # Private application code
│   ├── api/                     # HTTP handlers and routes
│   │   ├── handlers.go          # API handlers
│   │   ├── routes.go            # Route definitions
│   │   └── middleware.go        # HTTP middleware
│   ├── core/                    # Core business logic
│   │   ├── models.go            # Data structures
│   │   ├── storage.go           # File operations
│   │   ├── validation.go        # Input validation
│   │   └── filepool.go          # File caching
│   ├── mock/                    # Mock AI system
│   │   ├── generator.go         # Mock generator
│   │   └── templates.go         # Response templates
│   ├── config/                  # Configuration
│   │   ├── config.go            # Config loading
│   │   └── paths.go             # Path management
│   ├── metrics/                 # Metrics and monitoring
│   │   └── metrics.go           # Metrics collection
│   └── embed/                   # Embedded assets for thick clients
│       ├── frontend.go          # Embedded Streamlit files
│       └── backend.go           # Embedded Go server
├── frontend/                     # Streamlit UI (unchanged)
│   ├── app.py
│   └── api_client.py
├── build/                        # Build scripts and configurations
│   ├── webview/                 # WebView2 build scripts
│   │   ├── build-windows.sh
│   │   ├── build-macos.sh
│   │   ├── build-linux.sh
│   │   └── installer/           # Installer configurations
│   │       ├── windows.iss      # Inno Setup script
│   │       └── icon.ico         # Application icon
│   └── electron/                # Electron build scripts
│       ├── build.sh
│       ├── package.sh
│       └── icons/               # Platform-specific icons
│           ├── icon.icns        # macOS
│           ├── icon.ico         # Windows
│           └── icon.png         # Linux
├── dist/                         # Build outputs (gitignored)
│   ├── webview/
│   │   ├── prd-assistant-windows-amd64.exe
│   │   ├── prd-assistant-macos-arm64
│   │   └── prd-assistant-linux-amd64
│   └── electron/
│       ├── PRD-Assistant-Setup-1.5.0.exe
│       ├── PRD-Assistant-1.5.0.dmg
│       └── PRD-Assistant-1.5.0.AppImage
├── docs/                         # Documentation (reorganized)
│   ├── architecture/            # Architecture docs
│   │   ├── OVERVIEW.md          # System overview
│   │   ├── WEB_APP.md           # v1.0 web application
│   │   ├── WEBVIEW_CLIENT.md    # v1.5 WebView2 thick client
│   │   └── ELECTRON_CLIENT.md   # v1.5 Electron thick client
│   ├── api/                     # API documentation
│   │   └── API.md               # API reference
│   ├── development/             # Development guides
│   │   ├── CONTRIBUTING.md      # Contribution guide
│   │   ├── LOGGING.md           # Logging guide
│   │   └── MOCK_AI.md           # Mock AI guide
│   └── decisions/               # Architecture decision records
│       ├── V1.5_PROPOSAL.md
│       ├── V1.5_RECOMMENDATION.md
│       ├── THICK_CLIENT_DECISION.md
│       └── WINDOWS_THICK_CLIENT.md
├── backend/                      # DEPRECATED - kept for compatibility
│   └── README.md                # Migration notice
├── scripts/                      # Setup and validation scripts (unchanged)
├── prompts/                      # Prompt templates (unchanged)
├── inputs/                       # Input documents (unchanged)
├── outputs/                      # Generated PRDs (unchanged)
├── testdata/                     # Test fixtures (unchanged)
├── .gitignore                    # Updated for new structure
├── Makefile                      # Updated for new structure
├── PROJECT_PLAN.md              # Updated project plan
└── README.md                     # Updated documentation
```

## Migration Strategy

### Phase 1: Create New Structure (No Breaking Changes)
1. Create new directory structure
2. Copy files to new locations (keep originals)
3. Update import paths in new files
4. Add build scripts for both thick clients
5. Test that new structure works

### Phase 2: Update Build System
1. Update Makefile with new targets
2. Create build scripts for WebView2 client
3. Create build scripts for Electron client
4. Update .gitignore for dist/ directory

### Phase 3: Documentation Reorganization
1. Move docs to new hierarchy
2. Update cross-references
3. Create migration guide

### Phase 4: Deprecate Old Structure
1. Add deprecation notices to backend/
2. Update README with new structure
3. Keep old structure for one release cycle

## Benefits

1. **Clear Separation**: Web app vs thick clients clearly separated
2. **Standard Go Layout**: Follows Go project layout standards (cmd/, internal/)
3. **Build Infrastructure**: Dedicated build/ directory for each client type
4. **Documentation Hierarchy**: Organized by purpose (architecture, api, development, decisions)
5. **Scalability**: Easy to add new client types or features
6. **No Breaking Changes**: Old structure still works during migration

## Implementation Order

1. ✅ Create refactoring plan (this document)
2. [ ] Create new directory structure
3. [ ] Migrate backend code to internal/
4. [ ] Create cmd/web/main.go (current web app)
5. [ ] Create cmd/webview/main.go (WebView2 client)
6. [ ] Create cmd/electron/ (Electron client)
7. [ ] Create build scripts
8. [ ] Reorganize documentation
9. [ ] Update Makefile and README
10. [ ] Test all three configurations

