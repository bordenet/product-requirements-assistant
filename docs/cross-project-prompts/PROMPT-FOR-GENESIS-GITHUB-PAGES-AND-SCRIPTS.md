# Prompt for Claude in Genesis: Prevent GitHub Pages and Script Path Issues

**Context:** You are Claude working in the Genesis repository workspace. This prompt contains lessons learned from production issues in spawned projects.

**Objective:** Update Genesis templates and spawn scripts to prevent two common architectural issues that cause drift and broken tooling.

---

## 🐛 Issue 1: Scripts Fail When Run From Different Directories

**Problem:** Shell scripts that check for files relative to CWD fail when invoked from subdirectories.

**Example Failure:**
```bash
~/project/scripts $ ./deploy-web.sh
✗ Missing required files:
  - index.html        # Exists at ~/project/index.html, but script checks CWD
  - css/styles.css
  - js/app.js
```

**Root Cause:** Script validates files relative to current working directory, not the repository root.

**Fix Pattern - Add to ALL shell scripts:**
```bash
#!/usr/bin/env bash
set -euo pipefail

# Determine repo root (works from any directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Change to repo root so relative paths work
cd "${REPO_ROOT}"

# Now use absolute paths OR relative paths (both work)
readonly REQUIRED_FILES=(
    "${REPO_ROOT}/index.html"
    "${REPO_ROOT}/css/styles.css"
)
```

**Action for Genesis:**
1. Update all template scripts in `genesis/` to use this pattern
2. Add this pattern to `docs/development/SHELL_SCRIPT_PATTERN.md` (or similar)
3. Update spawn scripts to inject `REPO_ROOT` boilerplate into generated scripts

---

## 🐛 Issue 2: Duplicate Files in docs/ When GitHub Pages Serves From Root

**Problem:** When GitHub Pages is configured to serve from `/` (root), having a `docs/` folder with duplicate app files creates drift.

**Two Valid Architectures:**

### Architecture A: GitHub Pages serves from `/docs`
```
project/
├── index.html          ← Source of truth (development)
├── js/
├── css/
├── docs/               ← Deployment target (synced copy)
│   ├── index.html      ← Copied by deploy script
│   ├── js/
│   └── css/
└── scripts/
    └── deploy-web.sh   ← Syncs root → docs/
```
- ✅ `docs/` contains app files (they're the deployment copy)
- ✅ `deploy-web.sh` syncs root → docs on deploy
- ✅ GitHub Pages source: `/docs`

### Architecture B: GitHub Pages serves from `/` (root)
```
project/
├── index.html          ← Source AND deployment (same files)
├── js/
├── css/
├── docs/               ← Documentation ONLY, NOT app files
│   ├── STYLE_GUIDE.md
│   └── API.md
└── .gitignore          ← Must prevent app file duplication in docs/
```
- ✅ No duplication - root IS the deployment
- ✅ `docs/` contains only documentation
- ❌ NEVER put `docs/js/`, `docs/css/`, `docs/index.html`
- ✅ GitHub Pages source: `/` (root)

**The Bug:** Projects using Architecture B accidentally had Architecture A's file structure:
```bash
# BAD: Duplicates that drift out of sync
docs/
├── js/app.js           ← Duplicate of js/app.js (WRONG!)
├── css/styles.css      ← Duplicate of css/styles.css (WRONG!)
└── index.html          ← Duplicate of index.html (WRONG!)
```

**Action for Genesis:**
1. Add `.gitignore` entries to prevent accidental duplication:
   ```gitignore
   # Prevent app file duplication in docs/ (GitHub Pages serves from root)
   docs/js/
   docs/css/
   docs/index.html
   docs/data/
   ```
2. Document the two architectures in spawn scripts
3. Ask user during spawn: "GitHub Pages source: root (/) or /docs?"
4. Configure `.gitignore` and scripts based on answer

---

## 📋 Checklist for Genesis Updates

### Template Updates
- [ ] All shell scripts use `REPO_ROOT` pattern
- [ ] Scripts validate files using absolute paths
- [ ] `.gitignore` template includes anti-duplication entries for Architecture B

### Spawn Script Updates
- [ ] Ask user which GitHub Pages architecture they want
- [ ] Generate appropriate `.gitignore` based on answer
- [ ] Generate `deploy-web.sh` only for Architecture A (docs/ deployment)
- [ ] Skip `deploy-web.sh` for Architecture B (no sync needed)

### Documentation Updates
- [ ] Add `SHELL_SCRIPT_PATTERN.md` with `REPO_ROOT` pattern
- [ ] Add `GITHUB_PAGES_ARCHITECTURES.md` explaining both options
- [ ] Update README with quick reference

---

## 🔍 Validation Commands

After updating Genesis, validate with:

```bash
# Test script from different directories
cd genesis/examples/hello-world/scripts && ./some-script.sh  # Should work
cd genesis/examples/hello-world && ./scripts/some-script.sh  # Should work

# Verify no accidental duplication in Architecture B projects
ls docs/ | grep -E "^(js|css|index\.html)$"  # Should find nothing
```

---

## 📚 Reference

**Source Issues:**
- product-requirements-assistant: `deploy-web.sh` failed from `scripts/` directory
- one-pager: Duplicate files in `docs/` drifted out of sync

**Fixed Commits:**
- product-requirements-assistant: `14a99a9` - "fix: make deploy-web.sh work from any directory"
- one-pager: `52939bd` - "fix: remove duplicate app files from docs/ and update .gitignore"

---

**Status:** Ready to execute
**Version:** 1.0

