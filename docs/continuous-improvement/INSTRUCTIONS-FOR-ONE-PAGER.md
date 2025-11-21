# Instructions for One-Pager Repository

**Copy-paste this into the one-pager VS Code instance:**

---

## Task: Implement Web Deployment Script

Implement the web deployment script for one-pager. The compact.sh library is already at `scripts/lib/compact.sh`. 

### Requirements

1. **Create `scripts/deploy-web.sh`** adapted for one-pager's flat structure:
   - Copy root files to `docs/` (not `web/` to `docs/`)
   - Source: Use `/Users/matt/GitHub/Personal/product-requirements-assistant/scripts/deploy-web.sh` as reference

2. **REQUIRED_FILES array**:
   ```bash
   readonly REQUIRED_FILES=(
       "index.html"
       "css/styles.css"
       "js/app.js"
       "js/documentGenerator.js"
       "js/promptManager.js"
   )
   ```

3. **Rsync configuration** - Exclude these files:
   - `.git`
   - `node_modules`
   - `coverage`
   - `.DS_Store`
   - `*.swp`
   - `README.md`
   - `CLAUDE.md`
   - `GENESIS-PROCESS-IMPROVEMENTS.md`
   - `TODO-DEPLOYMENT-SCRIPT.md`
   - `package.json`
   - `package-lock.json`
   - `jest.config.js`
   - `jest.setup.js`
   - `.eslintrc.json`
   - `.gitignore`
   - `tests`
   - `scripts`

4. **GitHub Pages URL**: `https://bordenet.github.io/one-pager/`

5. **Deployment process**:
   ```bash
   rsync -a --delete \
       --exclude='.git' \
       --exclude='node_modules' \
       --exclude='coverage' \
       --exclude='.DS_Store' \
       --exclude='*.swp' \
       --exclude='README.md' \
       --exclude='CLAUDE.md' \
       --exclude='GENESIS-PROCESS-IMPROVEMENTS.md' \
       --exclude='TODO-DEPLOYMENT-SCRIPT.md' \
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

### Testing

Test with these commands:
```bash
./scripts/deploy-web.sh --help
./scripts/deploy-web.sh --dry-run
./scripts/deploy-web.sh -n -v
```

### Documentation

Update `README.md` with deployment instructions:

```markdown
## Deployment

Deploy to GitHub Pages:

\`\`\`bash
# Deploy with minimal output
./scripts/deploy-web.sh

# Deploy with verbose output
./scripts/deploy-web.sh --verbose

# Preview deployment without changes
./scripts/deploy-web.sh --dry-run

# Show help
./scripts/deploy-web.sh --help
\`\`\`

Live app: https://bordenet.github.io/one-pager/
```

### Quality Checks

1. Run linter: `npm run lint` or `npm run lint:fix`
2. Run tests: `npm test`
3. Verify all tests pass

### Commit and Push

```bash
git add scripts/ README.md
git commit -m "Add web deployment script with compact output

- Create scripts/deploy-web.sh adapted for flat structure
- Use scripts/lib/compact.sh for compact output
- Support -v/--verbose, -n/--dry-run, -h/--help flags
- Update README.md with deployment instructions
- Rsync root files to docs/ excluding dev files

Implements continuous improvement from product-requirements-assistant"
git push origin main
```

### Reference

- Source: `/Users/matt/GitHub/Personal/product-requirements-assistant/scripts/deploy-web.sh`
- Documentation: `/Users/matt/GitHub/Personal/product-requirements-assistant/docs/continuous-improvement/web-deployment-script.md`

---

**After completion, tell the user:**
- ✅ What was done
- ✅ Linting results
- ✅ Test results
- ✅ What's left (if anything)
