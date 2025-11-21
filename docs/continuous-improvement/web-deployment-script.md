# Continuous Improvement: Web Deployment Script

**Date**: 2025-11-21  
**Issue**: Missing automated web deployment script for GitHub Pages  
**Severity**: Major oversight - fundamental capability gap  
**Status**: ✅ Resolved in product-requirements-assistant  
**Action Required**: Implement in one-pager and genesis repositories

---

## Problem Statement

We discovered a critical gap in our project infrastructure: **no automated deployment script for GitHub Pages**. This is a fundamental oversight for any web-based project using GitHub Pages as its deployment target.

### Impact

- **Manual deployment**: Error-prone, inconsistent process
- **No validation**: Missing pre-deployment checks for required files
- **No documentation**: Unclear deployment process for contributors
- **Genesis gap**: Template system doesn't include this critical script
- **Future projects**: All projects bootstrapped from genesis will inherit this gap

---

## Solution Implemented

Created `scripts/deploy-web.sh` in **product-requirements-assistant** repository with:

### Core Features

1. **Manpage-style help** (`-h | --help`)
   - Complete documentation with examples
   - Deployment process explanation
   - Exit status codes
   - See also references

2. **Compact output mode** (default)
   - Minimal vertical real estate usage
   - Running timer in top-right corner (yellow text on black background)
   - ANSI escape sequences for in-place updates
   - Uses `scripts/lib/compact.sh` library

3. **Verbose mode** (`-v | --verbose`)
   - Detailed output for debugging
   - Shows file operations and git commands
   - Full deployment process visibility

4. **Dry-run mode** (`-n | --dry-run`)
   - Preview deployment without making changes
   - Lists files that would be deployed
   - Validates environment and files

5. **Pre-deployment validation**
   - Checks git repository status
   - Verifies on main branch
   - Detects uncommitted changes
   - Validates required files exist

6. **Automated deployment process**
   - Copies `web/` to `docs/` directory
   - Excludes unnecessary files (.DS_Store, *.swp, README.md)
   - Commits with timestamped message
   - Pushes to origin/main
   - GitHub Pages auto-deploys from docs/

### Technical Implementation

**File**: `scripts/deploy-web.sh` (292 lines)

**Dependencies**:
- `scripts/lib/compact.sh` - Compact output library
- `rsync` - File synchronization
- `git` - Version control

**Key Functions**:
- `show_help()` - Manpage-style documentation
- `validate_environment()` - Git repository and branch checks
- `validate_files()` - Required file existence checks
- `copy_web_files()` - rsync web/ to docs/
- `commit_and_push()` - Git commit with timestamp
- `push_to_remote()` - Push to origin/main

**ANSI Features**:
- Timer display: `\033[s` (save cursor), `\033[u` (restore cursor)
- Yellow on black: `\033[1;33m` (yellow), `\033[40m` (black background)
- In-place updates: `\033[2K` (clear line), `\r` (carriage return)
- Cursor control: `\033[?25l` (hide), `\033[?25h` (show)

---

## Action Items

### 1. Implement in `one-pager` Repository

**Repository**: https://github.com/bordenet/one-pager

**Instructions for AI Assistant**:

When working in the `one-pager` repository, implement the following:

1. **Copy deployment script**:
   ```bash
   # Reference implementation from product-requirements-assistant
   # File: scripts/deploy-web.sh (292 lines)
   ```

2. **Adapt for one-pager project structure**:
   - Verify `web/` directory structure
   - Update `REQUIRED_FILES` array for one-pager's specific files
   - Ensure `docs/` is configured as GitHub Pages source
   - Update GitHub Pages URL in help text and success message

3. **Verify compact.sh library exists**:
   - Check if `scripts/lib/compact.sh` exists
   - If missing, copy from product-requirements-assistant
   - Ensure all ANSI escape sequences and timer functions are present

4. **Test deployment**:
   ```bash
   # Test help
   ./scripts/deploy-web.sh --help
   
   # Test dry-run
   ./scripts/deploy-web.sh --dry-run
   
   # Test verbose dry-run
   ./scripts/deploy-web.sh -n -v
   ```

5. **Update documentation**:
   - Add deployment instructions to README.md
   - Reference the script in contributing guidelines
   - Document GitHub Pages URL

**Specific Changes for one-pager**:
- Update `REQUIRED_FILES` to match one-pager's web app structure
- Update GitHub Pages URL: `https://bordenet.github.io/one-pager/`
- Verify `docs/` directory is gitignored or tracked (check project convention)

---

### 2. Implement in `genesis` Repository

**Repository**: https://github.com/bordenet/genesis

**Critical Importance**: This is the **most important** action item. Genesis is the template system that bootstraps all future projects. Missing this script means every new project will inherit the same gap.

**Instructions for AI Assistant**:

When working in the `genesis` repository, implement the following:

1. **Add to template structure**:
   ```
   genesis/
   ├── templates/
   │   ├── scripts/
   │   │   ├── deploy-web.sh.template
   │   │   └── lib/
   │   │       └── compact.sh.template
   ```

2. **Create template files**:
   - Copy `scripts/deploy-web.sh` from product-requirements-assistant
   - Convert to template with placeholders:
     - `{{PROJECT_NAME}}` - Project name for commit messages
     - `{{GITHUB_USER}}` - GitHub username
     - `{{GITHUB_REPO}}` - Repository name
     - `{{GITHUB_PAGES_URL}}` - Full GitHub Pages URL
   - Copy `scripts/lib/compact.sh` (no placeholders needed - it's generic)

3. **Update genesis documentation**:
   - Add deployment script to `01-AI-INSTRUCTIONS.md`
   - Include in `AI-EXECUTION-CHECKLIST.md`
   - Document in `05-QUALITY-STANDARDS.md`
   - Add to `START-HERE.md` execution steps

4. **Update hello-world example**:
   - Add `scripts/deploy-web.sh` to `examples/hello-world/`
   - Ensure it's functional and tested
   - Include in hello-world's README.md

5. **Add to execution checklist**:
   ```markdown
   ## Step 7: Create Deployment Infrastructure

   - [ ] Copy scripts/deploy-web.sh.template to scripts/deploy-web.sh
   - [ ] Replace {{PROJECT_NAME}} with actual project name
   - [ ] Replace {{GITHUB_USER}} with actual GitHub username
   - [ ] Replace {{GITHUB_REPO}} with actual repository name
   - [ ] Replace {{GITHUB_PAGES_URL}} with actual GitHub Pages URL
   - [ ] Make executable: chmod +x scripts/deploy-web.sh
   - [ ] Test with --help flag
   - [ ] Test with --dry-run flag
   - [ ] Verify compact.sh library is present
   ```

6. **Update quality standards**:
   - Add "Deployment automation" to required infrastructure
   - Include deployment script in pre-commit checklist
   - Document as mandatory for web-based projects

**Template Placeholders**:

```bash
# In deploy-web.sh.template

# Line ~95: GitHub Pages URL in help text
GITHUB PAGES URL
    {{GITHUB_PAGES_URL}}

# Line ~175: Commit message
local commit_msg="Deploy {{PROJECT_NAME}} to GitHub Pages

# Line ~265: Success message
echo "  {{GITHUB_PAGES_URL}}"
```

**Genesis Integration Points**:

1. **`01-AI-INSTRUCTIONS.md`** - Add deployment script to "Required Scripts" section
2. **`AI-EXECUTION-CHECKLIST.md`** - Add deployment script creation step
3. **`05-QUALITY-STANDARDS.md`** - Add deployment automation requirement
4. **`START-HERE.md`** - Include in Step 6 (Create Project Structure)
5. **`templates/project-structure/`** - Add scripts/deploy-web.sh.template
6. **`examples/hello-world/`** - Include working deployment script

---

## Verification Checklist

### For one-pager Repository

- [ ] `scripts/deploy-web.sh` exists and is executable
- [ ] `scripts/lib/compact.sh` exists
- [ ] `./scripts/deploy-web.sh --help` shows correct GitHub Pages URL
- [ ] `./scripts/deploy-web.sh --dry-run` validates successfully
- [ ] `REQUIRED_FILES` array matches one-pager's web structure
- [ ] Documentation updated with deployment instructions
- [ ] Script tested with verbose mode
- [ ] Script tested with actual deployment (if safe to do so)

### For genesis Repository

- [ ] `templates/scripts/deploy-web.sh.template` exists
- [ ] `templates/scripts/lib/compact.sh.template` exists (or compact.sh if no placeholders)
- [ ] Template contains all necessary placeholders
- [ ] `01-AI-INSTRUCTIONS.md` documents deployment script
- [ ] `AI-EXECUTION-CHECKLIST.md` includes deployment script steps
- [ ] `05-QUALITY-STANDARDS.md` requires deployment automation
- [ ] `START-HERE.md` includes deployment script in execution steps
- [ ] `examples/hello-world/scripts/deploy-web.sh` exists and works
- [ ] hello-world README.md documents deployment process
- [ ] All placeholders documented in template README

---

## Lessons Learned

### What Went Wrong

1. **Assumption of manual deployment**: We assumed GitHub Pages deployment was a manual process
2. **No template checklist**: Genesis didn't have a comprehensive infrastructure checklist
3. **Example incompleteness**: hello-world example didn't include deployment automation
4. **Documentation gap**: No deployment process documentation in any project

### Prevention for Future

1. **Comprehensive checklists**: Every project type needs a complete infrastructure checklist
2. **Working examples**: Examples must be fully functional, not just demonstrations
3. **Template completeness**: Genesis templates must include ALL operational scripts
4. **Documentation requirements**: Deployment process must be documented in every project
5. **AI execution validation**: Genesis must include self-validation that AI can execute

### Genesis Improvements

1. **Add infrastructure categories**:
   - Build scripts
   - Test scripts
   - Deployment scripts
   - Quality gate scripts
   - Setup/installation scripts

2. **Mandatory script checklist**:
   - [ ] Build automation
   - [ ] Test automation
   - [ ] Deployment automation
   - [ ] Linting automation
   - [ ] Pre-commit hooks

3. **Template validation**:
   - Genesis should validate that all required scripts exist
   - AI should verify each script is functional
   - Examples should demonstrate every script

---

## Reference Implementation

**Source Repository**: https://github.com/bordenet/product-requirements-assistant
**Source File**: `scripts/deploy-web.sh`
**Source Commit**: `3a3de22`
**Lines of Code**: 292
**Dependencies**: `scripts/lib/compact.sh` (164 lines)

**Key Features to Preserve**:
- Manpage-style help with examples
- Compact output with running timer
- Verbose mode for debugging
- Dry-run mode for validation
- Pre-deployment validation
- ANSI escape sequences for minimal vertical output
- Yellow-on-black timer in top-right corner

**Testing Commands**:
```bash
# Help
./scripts/deploy-web.sh --help

# Dry-run (minimal output)
./scripts/deploy-web.sh --dry-run

# Dry-run (verbose output)
./scripts/deploy-web.sh -n -v

# Actual deployment (minimal output)
./scripts/deploy-web.sh

# Actual deployment (verbose output)
./scripts/deploy-web.sh -v
```

---

## AI Assistant Instructions

When you encounter this document in a repository:

1. **Read the entire document** to understand context and requirements
2. **Identify which repository** you're working in (one-pager or genesis)
3. **Follow the specific instructions** for that repository
4. **Use the reference implementation** from product-requirements-assistant as the source
5. **Verify all checklist items** before marking complete
6. **Test thoroughly** with --help, --dry-run, and -v flags
7. **Update documentation** to reference the new deployment script
8. **Commit with descriptive message** referencing this continuous improvement document

**Do NOT**:
- Skip validation steps
- Assume the script will work without testing
- Forget to make the script executable
- Omit documentation updates
- Create the script without the compact.sh library

**Success Criteria**:
- Script runs without errors
- Help text is complete and accurate
- Dry-run mode validates correctly
- Timer displays in top-right corner
- Verbose mode shows detailed output
- All checklist items verified

---

**End of Continuous Improvement Document**


