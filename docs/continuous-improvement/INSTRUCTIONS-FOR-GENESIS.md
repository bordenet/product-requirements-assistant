# Instructions for Genesis Repository

**Copy-paste this into the genesis VS Code instance:**

---

## Task: Implement Deployment Script Templates

Implement deployment script templates for genesis with placeholders for all future projects.

### Requirements

1. **Create `templates/scripts/deploy-web.sh.template`** with placeholders:
   - `{{PROJECT_NAME}}` - Project name for commit messages
   - `{{GITHUB_USER}}` - GitHub username
   - `{{GITHUB_REPO}}` - Repository name
   - `{{GITHUB_PAGES_URL}}` - Full GitHub Pages URL (e.g., `https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/`)
   - Source: Use `/Users/matt/GitHub/Personal/product-requirements-assistant/scripts/deploy-web.sh` as reference

2. **Copy `templates/scripts/lib/compact.sh`**:
   - No placeholders needed (it's generic)
   - Source: `/Users/matt/GitHub/Personal/product-requirements-assistant/scripts/lib/compact.sh`

3. **Create `templates/docs/deployment-howto-guide.md`**:
   - Explain deployment script usage
   - Customization instructions
   - Testing procedures
   - Examples with actual commands

### Update Genesis Documentation

Update these 4 files to include deployment script requirements:

1. **`01-AI-INSTRUCTIONS.md`**:
   - Add deployment script to "Required Scripts" section
   - Include in infrastructure setup steps

2. **`AI-EXECUTION-CHECKLIST.md`**:
   - Add deployment script creation step
   - Add deployment script testing step

3. **`05-QUALITY-STANDARDS.md`**:
   - Add deployment automation as quality requirement
   - Include in "Must Have" infrastructure

4. **`START-HERE.md`**:
   - Include deployment script in execution steps
   - Add to project structure creation

### Update Hello-World Example

1. **Add `examples/hello-world/scripts/deploy-web.sh`**:
   - Working deployment script (not a template)
   - Actual values for hello-world project
   - Must be executable and tested

2. **Add `examples/hello-world/scripts/lib/compact.sh`**:
   - Copy from product-requirements-assistant

3. **Test hello-world deployment script**:
   ```bash
   cd examples/hello-world
   ./scripts/deploy-web.sh --help
   ./scripts/deploy-web.sh --dry-run
   ```

### Template Placeholder Examples

In `deploy-web.sh.template`, replace:
- `"Product Requirements Assistant"` → `"{{PROJECT_NAME}}"`
- `bordenet` → `{{GITHUB_USER}}`
- `product-requirements-assistant` → `{{GITHUB_REPO}}`
- `https://bordenet.github.io/product-requirements-assistant/` → `https://{{GITHUB_USER}}.github.io/{{GITHUB_REPO}}/`

### Commit and Push

```bash
git add templates/ examples/hello-world/ 01-AI-INSTRUCTIONS.md AI-EXECUTION-CHECKLIST.md 05-QUALITY-STANDARDS.md START-HERE.md
git commit -m "Add deployment script templates and documentation

- Create templates/scripts/deploy-web.sh.template with placeholders
- Copy templates/scripts/lib/compact.sh for compact output
- Create templates/docs/deployment-howto-guide.md for adopters
- Update 01-AI-INSTRUCTIONS.md with deployment requirements
- Update AI-EXECUTION-CHECKLIST.md with deployment steps
- Update 05-QUALITY-STANDARDS.md with automation requirement
- Update START-HERE.md with deployment script creation
- Add working deployment script to examples/hello-world/

Implements continuous improvement from product-requirements-assistant
Ensures all future projects have deployment automation"
git push origin main
```

### Reference

- Source: `/Users/matt/GitHub/Personal/product-requirements-assistant/scripts/deploy-web.sh`
- Documentation: `/Users/matt/GitHub/Personal/product-requirements-assistant/docs/continuous-improvement/web-deployment-script.md`

### Quality Standards

- All templates must use `{{PLACEHOLDER}}` syntax
- Hello-world example must have working script
- All 4 genesis docs must be updated
- Deployment how-to guide must be comprehensive

---

**After completion, tell the user:**
- ✅ What was done
- ✅ Files created/updated
- ✅ Testing results
- ✅ What's left (if anything)
