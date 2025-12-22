/**
 * Project Detail View Module
 * Handles rendering the project workflow view
 */

import { getProject, updatePhase, updateProject } from './projects.js';
import { getPhaseMetadata, generatePromptForPhase, exportFinalPRD } from './workflow.js';
import { escapeHtml, showToast, copyToClipboard } from './ui.js';
import { navigateTo } from './router.js';

/**
 * Extract title from markdown content (looks for # Title at the beginning)
 * @param {string} markdown - The markdown content
 * @returns {string|null} - The extracted title or null if not found
 */
export function extractTitleFromMarkdown(markdown) {
  if (!markdown) return null;

  // Look for first H1 heading (# Title)
  const match = markdown.match(/^#\s+(.+?)$/m);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}

/**
 * Update phase tab styles to reflect the active phase
 */
function updatePhaseTabStyles(activePhase) {
  document.querySelectorAll('.phase-tab').forEach(tab => {
    const tabPhase = parseInt(tab.dataset.phase);
    if (tabPhase === activePhase) {
      tab.classList.remove('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
      tab.classList.add('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
    } else {
      tab.classList.remove('border-b-2', 'border-blue-600', 'text-blue-600', 'dark:text-blue-400');
      tab.classList.add('text-gray-600', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-gray-200');
    }
  });
}

/**
 * Render the project detail view
 */
export async function renderProjectView(projectId) {
  const project = await getProject(projectId);

  if (!project) {
    showToast('Project not found', 'error');
    navigateTo('home');
    return;
  }

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="mb-6">
            <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center mb-4">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Projects
            </button>

            <div class="flex items-start justify-between">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        ${escapeHtml(project.title)}
                    </h2>
                    <p class="text-gray-600 dark:text-gray-400">
                        ${escapeHtml(project.problems)}
                    </p>
                </div>
                <button id="export-prd-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Export PRD
                </button>
            </div>
        </div>

        <!-- Phase Tabs -->
        <div class="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex space-x-1">
                ${[1, 2, 3].map(phase => {
    const meta = getPhaseMetadata(phase);
    const isActive = project.phase === phase;
    const isCompleted = project.phases[phase].completed;

    return `
                        <button
                            class="phase-tab px-6 py-3 font-medium transition-colors ${
  isActive
    ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
}"
                            data-phase="${phase}"
                        >
                            <span class="mr-2">${meta.icon}</span>
                            Phase ${phase}
                            ${isCompleted ? '<span class="ml-2 text-green-500">✓</span>' : ''}
                        </button>
                    `;
  }).join('')}
            </div>
        </div>

        <!-- Phase Content -->
        <div id="phase-content">
            ${renderPhaseContent(project, project.phase)}
        </div>
    `;

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => navigateTo('home'));
  document.getElementById('export-prd-btn').addEventListener('click', () => exportFinalPRD(project));

  document.querySelectorAll('.phase-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const phase = parseInt(tab.dataset.phase);
      project.phase = phase;
      updatePhaseTabStyles(phase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase);
      attachPhaseEventListeners(project, phase);
    });
  });

  attachPhaseEventListeners(project, project.phase);
}

/**
 * Render content for a specific phase
 */
function renderPhaseContent(project, phase) {
  const meta = getPhaseMetadata(phase);
  const phaseData = project.phases[phase];
  // Determine AI URL based on phase (Phase 2 uses Gemini, others use Claude)
  const aiUrl = phase === 2 ? 'https://gemini.google.com' : 'https://claude.ai';
  // Textarea should be enabled if: has existing response OR prompt was already copied
  const textareaEnabled = phaseData.response || phaseData.prompt;

  return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div class="mb-6">
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    ${meta.icon} ${meta.title}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-2">
                    ${meta.description}
                </p>
                <div class="inline-flex items-center px-3 py-1 bg-${meta.color}-100 dark:bg-${meta.color}-900/20 text-${meta.color}-800 dark:text-${meta.color}-300 rounded-full text-sm">
                    <span class="mr-2">🤖</span>
                    Use with ${meta.ai}
                </div>
            </div>

            <!-- Step A: Generate Prompt -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step A: Copy Prompt to AI
                </h4>
                <div class="flex gap-3 flex-wrap">
                    <button id="copy-prompt-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        📋 Copy Prompt to Clipboard
                    </button>
                    <a
                        id="open-ai-btn"
                        href="${aiUrl}"
                        target="ai-assistant-tab"
                        rel="noopener noreferrer"
                        class="px-6 py-3 bg-green-600 text-white rounded-lg transition-colors font-medium opacity-50 cursor-not-allowed pointer-events-none"
                        aria-disabled="true"
                    >
                        🔗 Open ${phase === 2 ? 'Gemini' : 'Claude'}
                    </a>
                </div>
                ${phaseData.prompt ? `
                    <div class="mt-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Prompt:</span>
                            <button class="view-prompt-btn text-blue-600 dark:text-blue-400 hover:underline text-sm">
                                View Full Prompt
                            </button>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                            ${escapeHtml(phaseData.prompt.substring(0, 200))}...
                        </p>
                    </div>
                ` : ''}
            </div>

            <!-- Step B: Paste Response -->
            <div class="mb-6">
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Step B: Paste ${meta.ai}'s Response
                </h4>
                <textarea
                    id="response-textarea"
                    rows="12"
                    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
                    placeholder="Paste ${meta.ai}'s response here..."
                    ${!textareaEnabled ? 'disabled' : ''}
                >${escapeHtml(phaseData.response || '')}</textarea>

                <div class="mt-3 flex justify-between items-center">
                    <span class="text-sm text-gray-600 dark:text-gray-400">
                        ${phaseData.completed ? '✓ Phase completed' : 'Paste response to complete this phase'}
                    </span>
                    <button id="save-response-btn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600" ${!phaseData.response || phaseData.response.trim().length < 3 ? 'disabled' : ''}>
                        Save Response
                    </button>
                </div>
            </div>

            <!-- Navigation -->
            <div class="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <button id="prev-phase-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors ${phase === 1 ? 'invisible' : ''}">
                    ← Previous Phase
                </button>
                ${phaseData.completed && phase < 3 ? `
                <button id="next-phase-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Next Phase →
                </button>
                ` : '<div></div>'}
            </div>
        </div>
    `;
}

/**
 * Show the full prompt in a modal
 */
function showPromptModal(prompt) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
  modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                    📋 Full Prompt
                </h3>
                <button id="close-prompt-modal-btn" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
            <div class="p-4 overflow-y-auto flex-1">
                <pre class="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">${escapeHtml(prompt)}</pre>
            </div>
            <div class="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                <button id="copy-prompt-modal-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2">
                    📋 Copy to Clipboard
                </button>
                <button id="close-prompt-modal-btn-2" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();

  modal.querySelector('#close-prompt-modal-btn').addEventListener('click', closeModal);
  modal.querySelector('#close-prompt-modal-btn-2').addEventListener('click', closeModal);
  modal.querySelector('#copy-prompt-modal-btn').addEventListener('click', async () => {
    await copyToClipboard(prompt);
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/**
 * Attach event listeners for phase interactions
 */
function attachPhaseEventListeners(project, phase) {
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const saveResponseBtn = document.getElementById('save-response-btn');
  const responseTextarea = document.getElementById('response-textarea');
  const prevPhaseBtn = document.getElementById('prev-phase-btn');
  const nextPhaseBtn = document.getElementById('next-phase-btn');
  const viewPromptBtn = document.querySelector('.view-prompt-btn');

  // View Full Prompt button handler
  if (viewPromptBtn && project.phases[phase].prompt) {
    viewPromptBtn.addEventListener('click', () => {
      showPromptModal(project.phases[phase].prompt);
    });
  }

  copyPromptBtn.addEventListener('click', async () => {
    try {
      const prompt = await generatePromptForPhase(project, phase);
      if (!prompt) {
        showToast('Failed to generate prompt. Please try again.', 'error');
        return;
      }
      await copyToClipboard(prompt);
      showToast('Prompt copied to clipboard!', 'success');
      // Save prompt but DON'T auto-advance - user is still working on this phase
      await updatePhase(project.id, phase, prompt, project.phases[phase].response, { skipAutoAdvance: true });

      // Enable the "Open AI" button now that prompt is copied
      const openAiBtn = document.getElementById('open-ai-btn');
      if (openAiBtn) {
        openAiBtn.classList.remove('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
        openAiBtn.removeAttribute('aria-disabled');
      }

      // Enable the response textarea now that prompt is copied
      if (responseTextarea) {
        responseTextarea.disabled = false;
        responseTextarea.classList.remove('opacity-50', 'cursor-not-allowed');
        responseTextarea.focus();
      }
    } catch (error) {
      console.error('Error copying prompt:', error);
      showToast(`Failed to copy prompt: ${error.message}`, 'error');
    }
  });

  // Update button state as user types
  responseTextarea.addEventListener('input', () => {
    const hasEnoughContent = responseTextarea.value.trim().length >= 3;
    saveResponseBtn.disabled = !hasEnoughContent;
  });

  saveResponseBtn.addEventListener('click', async () => {
    const response = responseTextarea.value.trim();
    if (response && response.length >= 3) {
      // Generate prompt if it hasn't been generated yet
      let prompt = project.phases[phase].prompt;
      if (!prompt) {
        prompt = await generatePromptForPhase(project, phase);
      }
      await updatePhase(project.id, phase, prompt, response);

      // Auto-advance to next phase if not on final phase
      if (phase < 3) {
        showToast('Response saved! Moving to next phase...', 'success');
        // Re-fetch the updated project and advance
        const updatedProject = await getProject(project.id);
        updatedProject.phase = phase + 1;
        updatePhaseTabStyles(phase + 1);
        document.getElementById('phase-content').innerHTML = renderPhaseContent(updatedProject, phase + 1);
        attachPhaseEventListeners(updatedProject, phase + 1);
      } else {
        // Phase 3 complete - extract and update project title if changed
        const extractedTitle = extractTitleFromMarkdown(response);
        if (extractedTitle && extractedTitle !== project.title) {
          await updateProject(project.id, { title: extractedTitle });
          showToast(`Phase 3 complete! Title updated to "${extractedTitle}"`, 'success');
        } else {
          showToast('Phase 3 complete! Your PRD is ready.', 'success');
        }
        renderProjectView(project.id);
      }
    } else {
      showToast('Please enter at least 3 characters', 'warning');
    }
  });

  if (prevPhaseBtn) {
    prevPhaseBtn.addEventListener('click', () => {
      project.phase = phase - 1;
      updatePhaseTabStyles(phase - 1);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase - 1);
      attachPhaseEventListeners(project, phase - 1);
    });
  }

  if (nextPhaseBtn && project.phases[phase].completed) {
    nextPhaseBtn.addEventListener('click', () => {
      project.phase = phase + 1;
      updatePhaseTabStyles(phase + 1);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(project, phase + 1);
      attachPhaseEventListeners(project, phase + 1);
    });
  }
}
