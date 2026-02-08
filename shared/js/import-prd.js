/**
 * Import PRD Module
 * @module import-prd
 * Handles importing existing PRDs from Word/Google Docs via paste
 */

import { validateDocument, getScoreColor, getScoreLabel } from '../../validator/js/validator.js';
import { createProject } from './projects.js';
import { navigateTo } from './router.js';
import { showToast } from './ui.js';

// Document type configuration
const DOC_TYPE = 'Product Requirements Document';
const DOC_TYPE_SHORT = 'PRD';

// Score threshold - below this, we suggest LLM cleanup
const MINIMUM_VIABLE_SCORE = 30;

/**
 * Extract title from markdown using multiple strategies
 * Tries: H1 header, H2 header, first bold text, first non-empty line
 * @param {string} markdown - Markdown content
 * @returns {string|null} Extracted title or null
 */
function extractTitleFromMarkdown(markdown) {
  if (!markdown) return null;

  // Strategy 1: H1 header (# Title)
  const h1Match = markdown.match(/^#\s+(.+?)(?:\n|$)/m);
  if (h1Match) {
    // Remove "Document Type:" prefix if present (e.g., "Product Requirements Document: My Project")
    const title = h1Match[1].replace(new RegExp(`^${DOC_TYPE}:\\s*`, 'i'), '').trim();
    if (title) return title;
  }

  // Strategy 2: H2 header (## Title) - some docs use H2 for title
  const h2Match = markdown.match(/^##\s+(.+?)(?:\n|$)/m);
  if (h2Match) {
    const title = h2Match[1].replace(new RegExp(`^${DOC_TYPE}:\\s*`, 'i'), '').trim();
    if (title) return title;
  }

  // Strategy 3: First bold text (**Title** or __Title__)
  const boldMatch = markdown.match(/\*\*([^*]+)\*\*|__([^_]+)__/);
  if (boldMatch) {
    const title = (boldMatch[1] || boldMatch[2]).trim();
    if (title && title.length < 100) return title;  // Sanity check on length
  }

  // Strategy 4: First non-empty line (fallback)
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      // Take first 80 chars max
      return trimmed.substring(0, 80) + (trimmed.length > 80 ? '...' : '');
    }
  }

  return null;
}

// LLM prompt template for cleanup
const LLM_CLEANUP_PROMPT = `You are a documentation assistant. Convert this pasted Product Requirements Document content into clean, well-structured Markdown.

**Rules:**
- Preserve ALL substantive content
- Use proper Markdown headings (# ## ###)
- Convert bullet points to Markdown lists
- Convert tables to Markdown tables
- Remove formatting artifacts (font names, colors, etc.)
- Do NOT add commentary - output ONLY the cleaned Markdown

**Suggested Product Requirements Document Structure:**
# Product Requirements Document: [Product Name]
## Overview
## Problem Statement
## Goals & Success Metrics
## Target Users
## Requirements
### Functional Requirements
### Non-Functional Requirements
## Risks & Open Questions
## Timeline

**Content to convert:**
`;

/**
 * Convert HTML to Markdown using Turndown
 * @param {string} html - HTML content from paste
 * @returns {string} Markdown content
 */
export function convertHtmlToMarkdown(html) {
  // Check if TurndownService is available (loaded via script tag)
  if (typeof TurndownService === 'undefined') {
    console.warn('Turndown not loaded, returning plain text');
    // Fallback: strip HTML tags
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-'
  });

  // Keep tables
  turndownService.addRule('tables', {
    filter: ['table'],
    replacement: function(content, _node) {
      // Simple table conversion - preserve structure
      return '\n\n' + content + '\n\n';
    }
  });

  return turndownService.turndown(html);
}

/**
 * Generate the import modal HTML
 * @returns {string} Modal HTML
 */
export function getImportModalHtml() {
  return `
    <div id="import-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            📋 Import Existing PRD
          </h2>
          <button id="import-modal-close" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-4 overflow-y-auto flex-1">
          <!-- Instructions -->
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Paste your PRD from Word, Google Docs, or any source below. We'll convert it to Markdown automatically.
          </p>

          <!-- Paste Area -->
          <div id="import-paste-step">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Paste your content here
            </label>
            <div
              id="import-paste-area"
              contenteditable="true"
              class="w-full h-48 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Paste from Word or Google Docs..."
            ></div>
            <button id="import-convert-btn" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Convert to Markdown
            </button>
          </div>

          <!-- Preview Area (hidden initially) -->
          <div id="import-preview-step" class="hidden">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Converted Markdown
              </label>
              <div id="import-score-badge" class="text-sm font-medium"></div>
            </div>
            <textarea
              id="import-preview-area"
              class="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
            ></textarea>

            <!-- LLM Suggestion (shown when score is low) -->
            <div id="import-llm-suggestion" class="hidden mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p class="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ The converted document may need cleanup. Copy this prompt to Claude/ChatGPT:
              </p>
              <button id="import-copy-prompt-btn" class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm">
                Copy LLM Prompt
              </button>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button id="import-cancel-btn" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            Cancel
          </button>
          <button id="import-save-btn" class="hidden px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Save & Continue to Phase 1
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show the import modal and wire up event handlers
 */
export function showImportModal() {
  // Add modal to DOM
  const modalContainer = document.createElement('div');
  modalContainer.innerHTML = getImportModalHtml();
  document.body.appendChild(modalContainer.firstElementChild);

  const modal = document.getElementById('import-modal');
  const pasteArea = document.getElementById('import-paste-area');
  const convertBtn = document.getElementById('import-convert-btn');
  const previewStep = document.getElementById('import-preview-step');
  const pasteStep = document.getElementById('import-paste-step');
  const previewArea = document.getElementById('import-preview-area');
  const scoreBadge = document.getElementById('import-score-badge');
  const llmSuggestion = document.getElementById('import-llm-suggestion');
  const saveBtn = document.getElementById('import-save-btn');
  const copyPromptBtn = document.getElementById('import-copy-prompt-btn');

  let convertedMarkdown = '';

  // Close modal handlers
  const closeModal = () => modal.remove();
  document.getElementById('import-modal-close').addEventListener('click', closeModal);
  document.getElementById('import-cancel-btn').addEventListener('click', closeModal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Convert button handler
  convertBtn.addEventListener('click', () => {
    const html = pasteArea.innerHTML;
    if (!html || html === '<br>' || html.trim() === '') {
      showToast('Please paste some content first', 'error');
      return;
    }

    // Convert HTML to Markdown
    convertedMarkdown = convertHtmlToMarkdown(html);

    // Show preview
    pasteStep.classList.add('hidden');
    previewStep.classList.remove('hidden');
    previewArea.value = convertedMarkdown;

    // Validate and show score
    const validation = validateDocument(convertedMarkdown);
    const score = validation.totalScore;
    const color = getScoreColor(score);
    const label = getScoreLabel(score);

    scoreBadge.innerHTML = `
      <span class="px-2 py-1 rounded text-${color}-700 dark:text-${color}-400 bg-${color}-100 dark:bg-${color}-900/30">
        ${score}% · ${label}
      </span>
    `;

    // Show save button
    saveBtn.classList.remove('hidden');

    // Show LLM suggestion if score is low
    if (score < MINIMUM_VIABLE_SCORE) {
      llmSuggestion.classList.remove('hidden');
    }
  });

  // Copy LLM prompt handler
  copyPromptBtn.addEventListener('click', () => {
    const prompt = LLM_CLEANUP_PROMPT + previewArea.value;
    navigator.clipboard.writeText(prompt).then(() => {
      showToast('Prompt copied! Paste into Claude or ChatGPT.', 'success');
    });
  });

  // Save handler - create project and go to Phase 1
  let isSaving = false;
  saveBtn.addEventListener('click', async () => {
    // Prevent double-clicks / multiple submissions
    if (isSaving) return;
    isSaving = true;
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const markdown = previewArea.value;
      if (!markdown.trim()) { showToast('No content to save', 'error'); return; }

      // Extract title using multiple strategies (H1, H2, bold text, first line)
      const title = extractTitleFromMarkdown(markdown) || `Imported ${DOC_TYPE_SHORT}`;

      const project = await createProject({ title, problems: `(Imported from existing ${DOC_TYPE_SHORT})`, context: `(Imported from existing ${DOC_TYPE_SHORT})` });
      if (!project || !project.id) { showToast('Failed to create project', 'error'); return; }

      const { updateProject } = await import('./projects.js');
      await updateProject(project.id, {
        phases: { ...project.phases, 1: { ...project.phases[1], response: markdown, completed: false, startedAt: new Date().toISOString() } },
        importedContent: markdown,
        isImported: true  // Flag to skip edit-form redirect
      });

      closeModal();
      showToast(`${DOC_TYPE_SHORT} imported! Review and refine in Phase 1.`, 'success');
      navigateTo('project/' + project.id);
    } finally {
      isSaving = false;
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save & Continue to Phase 1';
    }
  });

  // Focus paste area
  pasteArea.focus();
}
