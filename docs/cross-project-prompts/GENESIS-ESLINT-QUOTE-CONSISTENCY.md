# Genesis Template Enhancement: ESLint Quote Style Consistency

**Date:** 2024-12-01  
**Source:** product-requirements-assistant ESLint configuration  
**Priority:** MEDIUM - Code style consistency across Genesis-spawned apps  

---

## 🎯 Issue: Quote Style Inconsistency

### The Problem
When AI assistants generate ES6 import statements, they often default to their preferred quote style (usually single quotes), which may not match the project's ESLint configuration.

**Common Scenario:**
1. Genesis spawns a new app with ESLint configured for single quotes
2. AI assistant generates new code with double quotes (or vice versa)
3. Linter fails with quote style violations
4. Developer has to manually fix all quote violations

### Current State in product-requirements-assistant
**ESLint Config:** Single quotes required
```json
{
  "rules": {
    "quotes": ["error", "single"]
  }
}
```

**All imports use single quotes (correct):**
```javascript
import storage from './storage.js';
import { initRouter } from './router.js';
import { loadDefaultPrompts } from './workflow.js';
```

**Linter:** ✅ PASSES (0 errors)

---

## ✅ The Solution for Genesis

### 1. Standardize Quote Style Across All Templates

**Recommendation:** Use **single quotes** for all Genesis templates.

**Rationale:**
- Single quotes are the JavaScript community standard
- Matches ESLint default recommendations
- Consistent with product-requirements-assistant (the reference implementation)
- Avoids escaping in HTML strings

### 2. Update Genesis Template Files

**Files to Update:**

```bash
genesis/templates/web-app/js/app-template.js
genesis/templates/web-app/js/workflow-template.js
genesis/templates/web-app/js/storage-template.js
genesis/templates/web-app/js/router-template.js
genesis/templates/web-app/js/views-template.js
genesis/templates/web-app/js/project-view-template.js
genesis/templates/web-app/js/ui-template.js
genesis/templates/web-app/js/projects-template.js
```

**Search Pattern:** `import .* from ".*";`  
**Replace With:** Single-quoted versions

**Example:**
```javascript
// BEFORE (inconsistent)
import { initRouter } from "./router.js";
import storage from "./storage.js";

// AFTER (consistent)
import { initRouter } from './router.js';
import storage from './storage.js';
```

### 3. Verify ESLint Template Configuration

**File:** `genesis/templates/web-app/.eslintrc-template.json`

Ensure it enforces single quotes:
```json
{
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": ["warn"],
    "no-console": "off"
  }
}
```

### 4. Add ESLint Auto-Fix to Genesis Spawn Script

**File:** `genesis/spawn.sh`

Add after project creation:

```bash
# Auto-fix quote style violations
echo "🔧 Fixing code style..."
cd "$PROJECT_DIR"
npm run lint:fix 2>/dev/null || npx eslint --fix js/**/*.js tests/**/*.js 2>/dev/null || true
echo "✅ Code style fixed"
```

This ensures any quote style inconsistencies are automatically fixed during project creation.

---

## 🧪 Testing Strategy

### Add Quote Style Test to Genesis Validator

**File:** `genesis/genesis-validator/validators/eslint-validator.js`

```javascript
function validateQuoteStyle(projectDir) {
  const jsFiles = glob.sync(`${projectDir}/js/**/*.js`);
  const testFiles = glob.sync(`${projectDir}/tests/**/*.js`);
  const allFiles = [...jsFiles, ...testFiles];
  
  const violations = [];
  
  allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check for double-quoted imports when single quotes are required
      if (/import .* from ".*";/.test(line)) {
        violations.push({
          file: path.relative(projectDir, file),
          line: index + 1,
          issue: 'Import uses double quotes, should use single quotes'
        });
      }
    });
  });
  
  return violations;
}
```

---

## 📋 Genesis CLAUDE.md Addition

Add this section to `genesis/templates/CLAUDE.md`:

```markdown
## 📝 Code Style Standards

### Quote Style
This project uses **single quotes** for all JavaScript strings and imports.

**Correct:**
```javascript
import { foo } from './bar.js';
const message = 'Hello world';
```

**Incorrect:**
```javascript
import { foo } from "./bar.js";  // ❌ Double quotes
const message = "Hello world";   // ❌ Double quotes
```

**Exception:** Use double quotes inside single-quoted strings:
```javascript
const html = '<div class="container">Content</div>';  // ✅ Correct
```

### Auto-Fix
Run `npm run lint:fix` to automatically fix quote style violations.
```

---

## 🎓 Lessons for Genesis

### 1. **Consistency > Personal Preference**
Pick one quote style and enforce it everywhere. Don't mix.

### 2. **Auto-Fix is Your Friend**
Always include `lint:fix` script in package.json:
```json
{
  "scripts": {
    "lint": "eslint js/**/*.js tests/**/*.js",
    "lint:fix": "eslint --fix js/**/*.js tests/**/*.js"
  }
}
```

### 3. **Document the Standard**
Add quote style to CLAUDE.md so AI assistants know the project's preference.

### 4. **Validate in CI**
Pre-commit hooks should catch quote style violations:
```yaml
# .pre-commit-config.yaml
- id: eslint
  name: eslint
  entry: npm run lint
  language: system
  pass_filenames: false
```

---

## 📊 Impact Assessment

### Genesis Templates Affected
All JavaScript templates in:
- `genesis/templates/web-app/js/*.js`
- `genesis/templates/web-app/tests/*.js`

### Recommended Action
1. **Audit all Genesis templates** for quote style consistency
2. **Run ESLint --fix** on all template files
3. **Update spawn script** to auto-fix quote style
4. **Add validation** to genesis-validator
5. **Document standard** in CLAUDE.md template

---

## ✅ Success Criteria

After implementing this in Genesis:

- [ ] All template files use single quotes consistently
- [ ] ESLint config enforces single quotes
- [ ] Spawn script auto-fixes quote violations
- [ ] CLAUDE.md documents quote style standard
- [ ] Genesis validator checks quote style
- [ ] All spawned projects pass linting immediately

**Expected Result:** No more quote style violations in Genesis-spawned apps.

