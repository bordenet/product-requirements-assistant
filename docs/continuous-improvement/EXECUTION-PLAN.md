# Deployment Script Implementation - Execution Plan

**Created**: 2025-11-21  
**Status**: 🚧 IN PROGRESS  
**Repositories**: product-requirements-assistant, one-pager, genesis

---

## Overview

This document tracks the execution of implementing web deployment scripts across three repositories:
1. ✅ **product-requirements-assistant** - Reference implementation (COMPLETE)
2. 🚧 **one-pager** - Adapt for flat structure (IN PROGRESS)
3. ⏳ **genesis** - Create templates (PENDING)

---

## Phase 1: Product Requirements Assistant ✅ COMPLETE

### Completed Tasks
- [x] Created `scripts/deploy-web.sh` (292 lines)
- [x] Created `docs/continuous-improvement/web-deployment-script.md` (364 lines)
- [x] Created `docs/continuous-improvement/README.md` (150 lines)
- [x] Committed: `3a3de22` - Add web deployment script
- [x] Committed: `8aa3f96` - Add continuous improvement documentation
- [x] Pushed to origin/main
- [x] CI passing (7 check runs)

---

## Phase 2: One-Pager Repository 🚧 IN PROGRESS

### Repository Analysis

**Structure**: Flat (no `web/` directory)
- `index.html` - Main app file (root level)
- `css/` - Styles
- `js/` - JavaScript modules
- `tests/` - Jest tests
- `prompts/` - Prompt templates
- `templates/` - Document templates

**GitHub Pages**: Not currently configured (no `docs/` directory)

**Scripts**: No `scripts/` directory exists

### Adaptation Strategy

Since one-pager has a flat structure, we need to:
1. Create `scripts/` and `scripts/lib/` directories
2. Copy `compact.sh` library
3. Create `deploy-web.sh` that copies root files to `docs/`
4. Adapt `REQUIRED_FILES` to match one-pager's structure

### Required Files for One-Pager

```bash
readonly REQUIRED_FILES=(
    "index.html"
    "css/styles.css"
    "js/app.js"
    "js/documentGenerator.js"
    "js/promptManager.js"
    "prompts/one-pager-prompt.md"
    "templates/one-pager-template.md"
)
```

### Deployment Process for One-Pager

```bash
# Copy root-level files to docs/
rsync -a --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    --exclude='coverage' \
    --exclude='.DS_Store' \
    --exclude='*.swp' \
    --exclude='README.md' \
    --exclude='CLAUDE.md' \
    --exclude='GENESIS-PROCESS-IMPROVEMENTS.md' \
    --exclude='package.json' \
    --exclude='package-lock.json' \
    --exclude='jest.config.js' \
    --exclude='jest.setup.js' \
    --exclude='.eslintrc.json' \
    --exclude='.gitignore' \
    --exclude='tests' \
    --exclude='scripts' \
    ./ docs/
```

### Tasks

- [/] Verify one-pager repository structure
- [ ] Create `scripts/` directory
- [ ] Create `scripts/lib/` directory
- [ ] Copy `compact.sh` from product-requirements-assistant
- [ ] Create `deploy-web.sh` adapted for flat structure
- [ ] Test with `--help`
- [ ] Test with `--dry-run`
- [ ] Test with `-v`
- [ ] Update README.md with deployment instructions
- [ ] Commit changes
- [ ] Push to origin/main
- [ ] Verify checklist complete

---

## Phase 3: Genesis Repository ⏳ PENDING

### Repository Analysis

**Structure**: Template system in `genesis/` directory
- `genesis/01-AI-INSTRUCTIONS.md`
- `genesis/AI-EXECUTION-CHECKLIST.md`
- `genesis/05-QUALITY-STANDARDS.md`
- `genesis/START-HERE.md`
- `genesis/templates/` - Template files
- `genesis/examples/hello-world/` - Working example

### Template Strategy

1. **Create template with placeholders**:
   - `{{PROJECT_NAME}}` - Project name
   - `{{GITHUB_USER}}` - GitHub username
   - `{{GITHUB_REPO}}` - Repository name
   - `{{GITHUB_PAGES_URL}}` - Full GitHub Pages URL

2. **Create how-to guide**:
   - `genesis/templates/docs/deployment-howto-guide.md`
   - Explain deployment script usage
   - Customization instructions
   - Testing procedures

3. **Update genesis documentation**:
   - Add to `01-AI-INSTRUCTIONS.md`
   - Add to `AI-EXECUTION-CHECKLIST.md`
   - Add to `05-QUALITY-STANDARDS.md`
   - Add to `START-HERE.md`

4. **Update hello-world example**:
   - Add working `scripts/deploy-web.sh`
   - Add `scripts/lib/compact.sh`
   - Test deployment script

### Tasks

- [ ] Analyze genesis template structure
- [ ] Create `templates/scripts/deploy-web.sh.template`
- [ ] Create `templates/scripts/lib/compact.sh`
- [ ] Create `templates/docs/deployment-howto-guide.md`
- [ ] Update `01-AI-INSTRUCTIONS.md`
- [ ] Update `AI-EXECUTION-CHECKLIST.md`
- [ ] Update `05-QUALITY-STANDARDS.md`
- [ ] Update `START-HERE.md`
- [ ] Add to `examples/hello-world/scripts/deploy-web.sh`
- [ ] Add to `examples/hello-world/scripts/lib/compact.sh`
- [ ] Test hello-world deployment script
- [ ] Commit changes
- [ ] Push to origin/main
- [ ] Verify checklist complete

---

## Phase 4: Cross-Repository Navigation ⏳ PENDING

### Create RELATED_PROJECTS.md

Template structure:
```markdown
# Related Projects

## Product Requirements Assistant
- **Purpose**: 3-phase AI workflow for creating Product Requirements Documents
- **GitHub**: https://github.com/bordenet/product-requirements-assistant
- **Live App**: https://bordenet.github.io/product-requirements-assistant/
- **Status**: Production - Gold Standard

## One-Pager
- **Purpose**: AI-powered one-page document generator
- **GitHub**: https://github.com/bordenet/one-pager
- **Live App**: https://bordenet.github.io/one-pager/
- **Status**: Production

## Genesis
- **Purpose**: Project template system for bootstrapping new projects
- **GitHub**: https://github.com/bordenet/genesis
- **Status**: Template System
```

### Tasks

- [ ] Create `RELATED_PROJECTS.md` in product-requirements-assistant
- [ ] Create `RELATED_PROJECTS.md` in one-pager
- [ ] Create `RELATED_PROJECTS.md` template in genesis
- [ ] Update README.md in each repo to reference RELATED_PROJECTS.md
- [ ] Commit and push all changes

---

## Execution Notes

### One-Pager Specific Considerations

1. **Flat Structure**: No `web/` directory, files at root
2. **Deployment Target**: Copy root files to `docs/` (excluding dev files)
3. **GitHub Pages**: Need to configure in repository settings
4. **Required Files**: Different from product-requirements-assistant

### Genesis Specific Considerations

1. **Template Placeholders**: Use `{{VARIABLE}}` syntax
2. **How-To Guide**: Must be deployed to each new project
3. **Hello-World**: Must have working deployment script
4. **Documentation**: Update all 4 key genesis docs

---

**Last Updated**: 2025-11-21  
**Next Action**: Complete one-pager implementation
