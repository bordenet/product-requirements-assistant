/**
 * Project View Phase Content Module
 * Handles rendering individual phase content for PRD workflow
 * @module project-view-phase
 */

import { getPhaseMetadata } from './workflow.js';
import { escapeHtml } from './ui.js';
import { validateDocument, getScoreColor, getScoreLabel } from '../../validator/js/validator.js';

/**
 * Render the content for a specific phase
 * @param {import('./types.js').Project} project - Project data
 * @param {import('./types.js').PhaseNumber} phaseNumber - Phase to render
 * @returns {string} HTML string
 */
export function renderPhaseContent(project, phaseNumber) {
  const rawMeta = getPhaseMetadata(phaseNumber);
  // Defensive fallbacks for phase metadata - prevents "undefined" in UI
  const phaseDefaults = {
    1: { name: 'Initial Draft', icon: '📝', aiModel: 'Claude', description: 'Generate the first draft' },
    2: { name: 'Critical Review', icon: '🔍', aiModel: 'Gemini', description: 'Get a critical review' },
    3: { name: 'Final Synthesis', icon: '✨', aiModel: 'Claude', description: 'Combine into final document' }
  };
  const defaults = phaseDefaults[phaseNumber] || phaseDefaults[1];
  const meta = {
    name: rawMeta?.name || defaults.name,
    icon: rawMeta?.icon || defaults.icon,
    aiModel: rawMeta?.aiModel || defaults.aiModel,
    description: rawMeta?.description || defaults.description
  };
  // Debug logging to help identify WORKFLOW_CONFIG issues
  if (!rawMeta || !rawMeta.name || !rawMeta.aiModel) {
    console.warn('[PRD] Phase metadata missing or incomplete:', { phaseNumber, rawMeta, usedDefaults: true });
  }
  const phaseData = project.phases?.[phaseNumber] || { prompt: '', response: '', completed: false };
  // Determine AI URL based on phase (Phase 2 uses Gemini, others use Claude)
  const aiUrl = phaseNumber === 2 ? 'https://gemini.google.com' : 'https://claude.ai';
  // Color mapping for phases (canonical WORKFLOW_CONFIG doesn't include colors)
  const colorMap = { 1: 'blue', 2: 'green', 3: 'purple' };
  const color = colorMap[phaseNumber] || 'blue';
  // Textarea should be enabled if: has existing response OR prompt was already copied
  const textareaEnabled = phaseData.response || phaseData.prompt;

  // Completion banner with inline PRD scoring when Phase 3 is complete
  let completionBanner = '';
  if (phaseNumber === 3 && phaseData.completed) {
    completionBanner = renderCompletionBanner(phaseData.response || '');
  }

  return `
        ${completionBanner}

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="mb-6 flex justify-between items-start">
                <div>
                    <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        ${meta.icon} ${meta.name}
                    </h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-2">
                        ${meta.description}
                    </p>
                    <div class="inline-flex items-center px-3 py-1 bg-${color}-100 dark:bg-${color}-900/20 text-${color}-800 dark:text-${color}-300 rounded-full text-sm">
                        <span class="mr-2">🤖</span>
                        Use with ${meta.aiModel}
                    </div>
                </div>
                <!-- Overflow Menu (top-right) -->
                <button id="more-actions-btn" class="action-menu-trigger text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="More actions" aria-haspopup="menu" aria-expanded="false">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                    </svg>
                </button>
            </div>

            <!-- Step A: Copy Prompt to AI -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step A: Copy Prompt to AI
                </h4>
                <div class="flex gap-3 flex-wrap">
                    <button id="copy-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        📋 ${phaseData.prompt ? 'Copy Prompt Again' : 'Generate & Copy Prompt'}
                    </button>
                    <a
                        id="open-ai-btn"
                        href="${aiUrl}"
                        target="ai-assistant-tab"
                        rel="noopener noreferrer"
                        class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium ${phaseData.prompt ? 'hover:bg-green-700' : 'opacity-50 cursor-not-allowed pointer-events-none'}"
                        ${phaseData.prompt ? '' : 'aria-disabled="true"'}
                    >
                        🔗 Open ${phaseNumber === 2 ? 'Gemini' : 'Claude'}
                    </a>
                </div>
            </div>

            <!-- Step B: Paste Response -->
            <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step B: Paste ${meta.aiModel}'s Response
                </h4>
                <textarea
                    id="response-textarea"
                    rows="12"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    placeholder="Paste ${meta.aiModel}'s response here..."
                    ${!textareaEnabled ? 'disabled' : ''}
                >${escapeHtml(phaseData.response || '')}</textarea>

                <div class="mt-3 flex justify-between items-center">
                    ${phaseData.completed && phaseNumber < 3 ? `
                        <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Next Phase →
                        </button>
                    ` : phaseNumber < 3 ? `
                        <span class="text-sm text-gray-600 dark:text-gray-400">
                            Paste response to complete this phase
                        </span>
                    ` : '<span></span>'}
                    <button id="save-response-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600" ${!phaseData.response || phaseData.response.trim().length < 3 ? 'disabled' : ''}>
                        Save Response
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render completion banner with inline score
 * @param {string} content - The document content
 * @returns {string} HTML string
 */
function renderCompletionBanner(content) {
  const validationResult = validateDocument(content);
  const scoreColor = getScoreColor(validationResult.totalScore);
  const scoreLabel = getScoreLabel(validationResult.totalScore);

  return `
        <div class="mb-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div class="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h4 class="text-lg font-semibold text-green-800 dark:text-green-300 flex items-center">
                        <span class="mr-2">🎉</span> Your PRD is Complete!
                    </h4>
                    <p class="text-green-700 dark:text-green-400 mt-1">
                        <strong>Next steps:</strong> Preview & copy, then validate for detailed feedback.
                    </p>
                </div>
                <div class="flex gap-3 flex-wrap items-center">
                    <button id="export-complete-btn" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg">
                        📄 Preview & Copy
                    </button>
                    <button id="validate-score-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">
                        📋 Copy & Full Validation ↗
                    </button>
                </div>
            </div>

            ${renderInlineScore(validationResult, scoreColor, scoreLabel)}

            ${renderIssuesSummary(validationResult)}

            ${renderHelpSection()}
        </div>
    `;
}

/**
 * Render inline score breakdown
 */
function renderInlineScore(validationResult, scoreColor, scoreLabel) {
  return `
            <!-- Inline Quality Score -->
            <div class="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between mb-3">
                    <h5 class="font-semibold text-gray-900 dark:text-white flex items-center">
                        📊 Document Quality Rating
                    </h5>
                    <div class="flex items-center gap-2">
                        <span class="text-3xl font-bold text-${scoreColor}-600 dark:text-${scoreColor}-400">${validationResult.totalScore}</span>
                        <span class="text-gray-500 dark:text-gray-400">/100</span>
                        <span class="px-2 py-1 text-xs font-medium rounded-full bg-${scoreColor}-100 dark:bg-${scoreColor}-900/30 text-${scoreColor}-700 dark:text-${scoreColor}-300">${scoreLabel}</span>
                    </div>
                </div>

                <!-- Score Breakdown -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div class="p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                        <div class="text-gray-500 dark:text-gray-400 text-xs">Structure</div>
                        <div class="font-semibold text-gray-900 dark:text-white">${validationResult.structure.score}/${validationResult.structure.maxScore}</div>
                    </div>
                    <div class="p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                        <div class="text-gray-500 dark:text-gray-400 text-xs">Clarity</div>
                        <div class="font-semibold text-gray-900 dark:text-white">${validationResult.clarity.score}/${validationResult.clarity.maxScore}</div>
                    </div>
                    <div class="p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                        <div class="text-gray-500 dark:text-gray-400 text-xs">User Focus</div>
                        <div class="font-semibold text-gray-900 dark:text-white">${validationResult.userFocus.score}/${validationResult.userFocus.maxScore}</div>
                    </div>
                    <div class="p-2 rounded bg-gray-50 dark:bg-gray-700/50">
                        <div class="text-gray-500 dark:text-gray-400 text-xs">Technical</div>
                        <div class="font-semibold text-gray-900 dark:text-white">${validationResult.technical.score}/${validationResult.technical.maxScore}</div>
                    </div>
                </div>
            </div>
    `;
}

/**
 * Render issues summary section
 */
function renderIssuesSummary(validationResult) {
  const allIssues = [
    ...validationResult.structure.issues,
    ...validationResult.clarity.issues,
    ...validationResult.userFocus.issues,
    ...validationResult.technical.issues
  ];

  if (validationResult.totalScore < 70 && allIssues.length > 0) {
    return `
                <!-- Top Issues -->
                <details class="mt-3">
                    <summary class="text-sm text-orange-600 dark:text-orange-400 cursor-pointer hover:text-orange-700">
                        ⚠️ Top issues to address
                    </summary>
                    <ul class="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
                        ${allIssues.slice(0, 5).map(issue => `<li>${escapeHtml(issue)}</li>`).join('')}
                    </ul>
                </details>
    `;
  }

  if (validationResult.totalScore >= 70) {
    return `
                <p class="mt-3 text-sm text-green-600 dark:text-green-400">
                    ✓ Your PRD meets quality standards for development handoff.
                </p>
    `;
  }

  return '';
}

/**
 * Render help section
 */
function renderHelpSection() {
  return `
            <!-- Expandable Help Section -->
            <details class="mt-4">
                <summary class="text-sm text-green-700 dark:text-green-400 cursor-pointer hover:text-green-800 dark:hover:text-green-300">
                    Need help using your document?
                </summary>
                <div class="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    <ol class="list-decimal list-inside space-y-2">
                        <li>Click <strong>"Preview & Copy"</strong> to see your formatted document</li>
                        <li>Click <strong>"Copy Formatted Text"</strong> in the preview</li>
                        <li>Open <strong>Microsoft Word</strong> or <strong>Google Docs</strong> and paste</li>
                        <li>Use <strong><a href="./validator/" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">Full Validation</a></strong> for detailed AI-powered feedback</li>
                    </ol>
                </div>
            </details>
    `;
}
