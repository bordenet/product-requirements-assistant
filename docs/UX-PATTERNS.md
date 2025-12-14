# AI Workflow UX Patterns

Apply these UX patterns to Genesis-derived AI workflow tools for consistent, guided user experience.

## Pattern 1: Sequential Button Reveal

**Requirement**: The "Open AI" button (e.g., "Open Claude", "Open Gemini") must NOT be visible/clickable until AFTER the user clicks "Copy Prompt to Clipboard".

```html
<!-- Initial state: disabled with pointer-events-none -->
<a id="open-ai-btn" href="..." target="ai-assistant-tab"
   class="... opacity-50 cursor-not-allowed pointer-events-none"
   aria-disabled="true">
   🔗 Open Claude
</a>
```

```javascript
// After copy prompt clicked, enable the button:
copyPromptBtn.addEventListener('click', async () => {
  await copyToClipboard(prompt);
  
  const openAiBtn = document.getElementById('open-ai-btn');
  if (openAiBtn) {
    openAiBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
    openAiBtn.classList.add('hover:bg-green-700');
    openAiBtn.removeAttribute('aria-disabled');
  }
});
```

## Pattern 2: Sequential Textarea Enable

**Requirement**: The response textarea is disabled until the user has copied the prompt.

```html
<textarea id="response-textarea" disabled
   class="... disabled:opacity-50 disabled:cursor-not-allowed">
</textarea>
```

```javascript
// After copy prompt, enable textarea and focus:
if (responseTextarea) {
  responseTextarea.disabled = false;
  responseTextarea.classList.remove('opacity-50', 'cursor-not-allowed');
  responseTextarea.focus();
}
```

## Pattern 3: Shared Browser Tab

**Requirement**: All "Open AI" links share one browser tab to avoid tab explosion.

```html
<a href="https://claude.ai" target="ai-assistant-tab" rel="noopener noreferrer">
```

Use consistent target name `ai-assistant-tab` for all AI links.

## Pattern 4: Auto-Advance on Save

**Requirement**: Saving a response auto-advances to the next phase (except final phase).

```javascript
saveResponseBtn.addEventListener('click', async () => {
  await updatePhase(project.id, phase, prompt, response);
  
  if (phase < FINAL_PHASE) {
    showToast('Response saved! Moving to next phase...', 'success');
    // Navigate to next phase
  } else {
    showToast('Complete! Your document is ready.', 'success');
  }
});
```

## Pattern 5: Step A/B Labeling

**Requirement**: Use letters (A, B) for sub-steps within a phase, not numbers.

```html
<h4>Step A: Copy Prompt to AI</h4>
<h4>Step B: Paste Claude's Response</h4>
```

## Pattern 6: Dynamic AI Name Labels

**Requirement**: Show specific AI names, not generic "AI".

```javascript
const aiName = phase === 2 ? 'Gemini' : 'Claude';
// Use in labels:
`Paste ${aiName}'s Response`
`Open ${aiName}`
```

## Pattern 7: Footer Stats Auto-Update

**Requirement**: Footer project count updates immediately after create/delete.

```javascript
// In router.js - call after every route render:
export async function navigateTo(route, ...params) {
  await handler(...params);
  await updateStorageInfo(); // Always update footer
}
```

## Pattern 8: Phase Tab Underline Sync

**Requirement**: Active phase tab underline must update from ALL navigation points.

```javascript
function updatePhaseTabStyles(activePhase) {
  document.querySelectorAll('.phase-tab').forEach(tab => {
    const tabPhase = parseInt(tab.dataset.phase);
    if (tabPhase === activePhase) {
      tab.classList.add('border-b-2', 'border-blue-600', 'text-blue-600');
      tab.classList.remove('text-gray-600');
    } else {
      tab.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600');
      tab.classList.add('text-gray-600');
    }
  });
}

// Call from: tab clicks, prev/next buttons, auto-advance, initial render
```

## Reference Implementation

See: https://github.com/bordenet/one-pager/blob/main/js/project-view.js

