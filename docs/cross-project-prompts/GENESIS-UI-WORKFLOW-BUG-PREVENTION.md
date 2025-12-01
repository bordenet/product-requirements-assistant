# Genesis Template Enhancement: UI Workflow Bug Prevention

**Date:** 2024-12-01  
**Source:** product-requirements-assistant bug fix (commit 0b63573)  
**Priority:** HIGH - Affects all Genesis-spawned apps with multi-step workflows  

---

## 🐛 Bug Pattern Discovered

### The Problem
Genesis-spawned apps with multi-step workflows have a critical UX bug where **Save buttons fail if users skip intermediate steps**.

**Specific Case from product-requirements-assistant:**
1. User creates a new project
2. User skips "Copy Prompt to Clipboard" button
3. User pastes AI response directly into textarea
4. User clicks "Save Response" button
5. **BUG:** Save fails silently because prompt was never generated

### Root Cause
```javascript
// BAD: Assumes prompt was already generated
saveResponseBtn.addEventListener('click', async () => {
  const response = responseTextarea.value.trim();
  if (response) {
    // This fails if user never clicked "Copy Prompt"
    await updatePhase(project.id, phase, project.phases[phase].prompt, response);
  }
});
```

The code assumes users follow the "happy path" workflow, but real users skip steps.

---

## ✅ The Fix

### Make Workflows Forgiving
```javascript
// GOOD: Auto-generate missing data if user skipped steps
saveResponseBtn.addEventListener('click', async () => {
  const response = responseTextarea.value.trim();
  if (response) {
    // Generate prompt if it hasn't been generated yet
    let prompt = project.phases[phase].prompt;
    if (!prompt) {
      prompt = await generatePromptForPhase(project, phase);
    }
    await updatePhase(project.id, phase, prompt, response);
    showToast('Response saved successfully!', 'success');
    renderProjectView(project.id);
  } else {
    showToast('Please enter a response', 'warning');
  }
});
```

### Key Principle
**Never assume users follow the intended workflow order. Auto-generate missing dependencies.**

---

## 🧪 Why Tests Missed This

### The Testing Gap
Unit tests tested individual functions in isolation:
```javascript
// This test ALWAYS sets up the prompt first
test('should save response', async () => {
  await savePrompt(1, 'Template');  // ← Always called
  const project = await createProject('Title', 'Problems', 'Context');
  await updatePhase(project.id, 1, 'prompt', 'response');
  // Test passes, but doesn't catch the UX bug
});
```

### What Was Missing
**Workflow/integration tests** that simulate real user behavior:
```javascript
test('should save response even if prompt was never generated', async () => {
  await savePrompt(1, 'Template');
  const project = await createProject('Title', 'Problems', 'Context');
  
  // Verify prompt is initially empty (user hasn't clicked "Copy Prompt")
  expect(project.phases[1].prompt).toBe('');
  
  // User pastes response WITHOUT generating prompt first
  const response = 'AI response pasted directly';
  
  // UI should auto-generate prompt when saving
  let prompt = project.phases[1].prompt;
  if (!prompt) {
    prompt = await generatePromptForPhase(project, 1);
  }
  await updatePhase(project.id, 1, prompt, response);
  
  // Verify both prompt and response were saved
  const updated = await getProject(project.id);
  expect(updated.phases[1].prompt).toBeTruthy();
  expect(updated.phases[1].response).toBe(response);
});
```

---

## 📋 Genesis Template Updates Needed

### 1. Update UI Event Handler Templates

**File:** `genesis/templates/js/workflow-view.js` (or equivalent)

Add this pattern to all "Save" button handlers:

```javascript
// Template for Save button handlers in multi-step workflows
saveBtn.addEventListener('click', async () => {
  const userInput = textarea.value.trim();
  
  if (!userInput) {
    showToast('Please enter data', 'warning');
    return;
  }
  
  // AUTO-GENERATE MISSING DEPENDENCIES
  // Check if any required data is missing from previous steps
  let requiredData = state.requiredData;
  if (!requiredData) {
    // User skipped a step - generate it now
    requiredData = await generateRequiredData(state);
  }
  
  // Now save with complete data
  await saveState(state.id, requiredData, userInput);
  showToast('Saved successfully!', 'success');
  refreshView();
});
```

### 2. Add Workflow Testing Template

**File:** `genesis/templates/tests/workflow-integration.test.js`

```javascript
describe('Workflow edge cases - user skips steps', () => {
  test('should handle user skipping intermediate steps', async () => {
    // Create initial state
    const state = await createState('data');
    
    // Verify required data is initially empty
    expect(state.requiredData).toBe('');
    
    // User skips step that generates requiredData
    // and goes directly to final step
    const finalInput = 'User input';
    
    // System should auto-generate missing data
    let requiredData = state.requiredData;
    if (!requiredData) {
      requiredData = await generateRequiredData(state);
    }
    
    await saveState(state.id, requiredData, finalInput);
    
    // Verify everything was saved correctly
    const updated = await getState(state.id);
    expect(updated.requiredData).toBeTruthy();
    expect(updated.finalInput).toBe(finalInput);
  });
});
```

### 3. Add to Genesis CLAUDE.md Template

**File:** `genesis/templates/CLAUDE.md`

Add this section after "Testing Standards":

```markdown
## 🎯 UI Workflow Principles

### Never Assume Linear User Behavior
Users will skip steps, go backwards, and use the app in unexpected ways.

**BAD:**
```javascript
// Assumes user clicked Button A before Button B
buttonB.addEventListener('click', () => {
  const data = state.dataFromButtonA;  // ❌ Might be undefined
  saveData(data);
});
```

**GOOD:**
```javascript
// Auto-generates missing data if user skipped Button A
buttonB.addEventListener('click', () => {
  let data = state.dataFromButtonA;
  if (!data) {
    data = generateDataFromButtonA();  // ✅ Forgiving workflow
  }
  saveData(data);
});
```

### Test Non-Linear Workflows
Always add tests for users skipping steps:

```javascript
test('should handle user skipping step 1', async () => {
  const state = await createState();
  expect(state.step1Data).toBe('');  // User never did step 1

  // User goes directly to step 2
  await handleStep2(state);

  // System should auto-generate step 1 data
  const updated = await getState();
  expect(updated.step1Data).toBeTruthy();
});
```
```

### 4. Update Genesis Spawn Script

**File:** `genesis/spawn.sh`

Add validation check after creating test templates:

```bash
# After copying test templates
echo "📝 Adding workflow edge case tests..."

# Check if project has multi-step workflows
if grep -q "phase\|step\|workflow" "$PROJECT_DIR/js/"*.js 2>/dev/null; then
  cat >> "$PROJECT_DIR/tests/workflow.test.js" << 'EOF'

describe('Workflow edge cases - user skips steps', () => {
  test('should handle non-linear user behavior', async () => {
    // TODO: Add test for users skipping intermediate steps
    // See: docs/cross-project-prompts/GENESIS-UI-WORKFLOW-BUG-PREVENTION.md
  });
});
EOF

  echo "⚠️  REMINDER: Add workflow edge case tests"
  echo "   See: docs/cross-project-prompts/GENESIS-UI-WORKFLOW-BUG-PREVENTION.md"
fi
```

---

## 🎓 Lessons for Genesis

### 1. **Forgiving UX > Strict Workflows**
Don't force users into a specific order. Auto-generate missing dependencies.

### 2. **Test User Behavior, Not Just Functions**
Unit tests catch logic bugs. Integration tests catch UX bugs.

### 3. **Empty String ≠ Intentionally Empty**
```javascript
// BAD: Can't distinguish between "not set" and "intentionally empty"
phases: { 1: { prompt: '', response: '' } }

// BETTER: Use null/undefined for "not set"
phases: { 1: { prompt: null, response: null } }

// BEST: Add explicit flags
phases: { 1: { prompt: null, response: null, promptGenerated: false } }
```

### 4. **Add Workflow Validation to Pre-commit**
```bash
# In .pre-commit-config.yaml
- id: workflow-test-check
  name: Check for workflow edge case tests
  entry: bash -c 'grep -r "skips steps\|non-linear" tests/ || (echo "Missing workflow edge case tests" && exit 1)'
  language: system
  pass_filenames: false
```

---

## 📊 Impact Assessment

### Apps Affected
All Genesis-spawned apps with:
- Multi-step workflows (Phase 1 → Phase 2 → Phase 3)
- "Generate" + "Save" button patterns
- State that depends on previous steps

### Known Affected Projects
- ✅ **product-requirements-assistant** - FIXED (commit 0b63573)
- ⚠️ **one-pager** - NEEDS REVIEW
- ⚠️ **architecture-decision-record** - NEEDS REVIEW
- ⚠️ **coe-generator** - NEEDS REVIEW (if exists)

### Recommended Action
1. Apply this pattern to Genesis templates immediately
2. Audit existing Genesis-spawned projects for this bug
3. Add workflow edge case tests to all projects
4. Update CLAUDE.md in all projects with UX principles

---

## 🔗 References

- **Bug Fix Commit:** product-requirements-assistant@0b63573
- **Test Coverage:** Added 2 new tests in `tests/workflow.test.js`
- **Files Changed:**
  - `js/project-view.js` - Added auto-generation of missing prompt
  - `tests/workflow.test.js` - Added workflow edge case tests

---

## ✅ Success Criteria for Genesis Integration

After integrating this into Genesis:

- [ ] All new Genesis-spawned apps include workflow edge case test templates
- [ ] CLAUDE.md template includes "UI Workflow Principles" section
- [ ] Spawn script warns about adding workflow tests for multi-step apps
- [ ] Event handler templates use forgiving workflow pattern
- [ ] Pre-commit hook validates workflow test coverage (optional)

**Expected Result:** Future Genesis-spawned apps won't have this class of bugs.
