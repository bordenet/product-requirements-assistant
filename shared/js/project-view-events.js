/**
 * Project View Events Module
 * Handles event listeners for phase interactions
 * @module project-view-events
 */

import { getProject, updatePhase, updateProject, deleteProject } from './projects.js';
import { getPhaseMetadata, generatePromptForPhase, getFinalMarkdown, getExportFilename, Workflow, detectPromptPaste } from './workflow.js';
import { showToast, copyToClipboard, copyToClipboardAsync, showPromptModal, confirm, confirmWithRemember, showDocumentPreviewModal, createActionMenu } from './ui.js';
import { navigateTo } from './router.js';
import { renderPhaseContent } from './project-view-phase.js';
import { showDiffModal } from './project-view-diff.js';

// Injected helpers to avoid circular imports
let extractTitleFromMarkdownFn = null;
let updatePhaseTabStylesFn = null;
let renderProjectViewFn = null;

/**
 * Set helper functions from main module (avoids circular imports)
 */
export function setHelpers(helpers) {
  extractTitleFromMarkdownFn = helpers.extractTitleFromMarkdown;
  updatePhaseTabStylesFn = helpers.updatePhaseTabStyles;
  renderProjectViewFn = helpers.renderProjectView;
}

/**
 * Attach event listeners for phase interactions
 * @param {import('./types.js').Project} project - Project data
 * @param {import('./types.js').PhaseNumber} phase - Current phase number
 * @returns {void}
 */
export function attachPhaseEventListeners(project, phase) {
  const copyPromptBtn = document.getElementById('copy-prompt-btn');
  const saveResponseBtn = document.getElementById('save-response-btn');
  const responseTextarea = document.getElementById('response-textarea');
  const nextPhaseBtn = document.getElementById('next-phase-btn');
  const exportCompleteBtn = document.getElementById('export-complete-btn');

  /**
   * Enable workflow progression after prompt is copied
   */
  const enableWorkflowProgression = async (prompt) => {
    // Save prompt but DON'T auto-advance - user is still working on this phase
    await updatePhase(project.id, phase, prompt, project.phases?.[phase]?.response || '', { skipAutoAdvance: true });

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
  };

  // Export complete button handler (Phase 3 CTA - Preview & Copy)
  if (exportCompleteBtn) {
    exportCompleteBtn.addEventListener('click', () => {
      const markdown = getFinalMarkdown(project);
      if (markdown) {
        showDocumentPreviewModal(markdown, 'Your PRD is Ready', getExportFilename(project));
      } else {
        showToast('No PRD content to export', 'warning');
      }
    });
  }

  // Validate & Score button - copies final draft and opens validator
  document.getElementById('validate-score-btn')?.addEventListener('click', async () => {
    const markdown = getFinalMarkdown(project);
    if (markdown) {
      try {
        await copyToClipboard(markdown);
        showToast('Document copied! Opening validator...', 'success');
        setTimeout(() => {
          window.open('./validator/', '_blank', 'noopener,noreferrer');
        }, 500);
      } catch {
        showToast('Failed to copy. Please try again.', 'error');
      }
    } else {
      showToast('No content to copy', 'warning');
    }
  });

  // CRITICAL: Safari transient activation fix - call copyToClipboardAsync synchronously
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', async () => {
      // Check if warning was previously acknowledged
      const warningAcknowledged = localStorage.getItem('external-ai-warning-acknowledged');

      if (!warningAcknowledged) {
        const result = await confirmWithRemember(
          'You are about to copy a prompt that may contain proprietary data.\n\n' +
                  '• This prompt will be pasted into an external AI service (Claude/Gemini)\n' +
                  '• Data sent to these services is processed on third-party servers\n' +
                  '• For sensitive documents, use an internal tool like LibreGPT instead\n\n' +
                  'Do you want to continue?',
          'External AI Warning',
          { confirmText: 'Copy Prompt', cancelText: 'Cancel' }
        );

        if (!result.confirmed) {
          showToast('Copy cancelled', 'info');
          return;
        }

        // Remember the choice permanently if checkbox was checked
        if (result.remember) {
          localStorage.setItem('external-ai-warning-acknowledged', 'true');
        }
      }

      let generatedPrompt = null;
      const promptPromise = (async () => {
        const prompt = await generatePromptForPhase(project, phase);
        if (!prompt) {
          throw new Error('Failed to generate prompt');
        }
        generatedPrompt = prompt;
        return prompt;
      })();

      copyToClipboardAsync(promptPromise)
        .then(async () => {
          showToast('Prompt copied to clipboard!', 'success');
          await enableWorkflowProgression(generatedPrompt);
        })
        .catch((error) => {
          console.error('Error copying prompt:', error);
          showToast(`Failed to copy prompt: ${error.message}`, 'error');
        });
    });
  }

  // Update button state as user types
  if (responseTextarea) {
    responseTextarea.addEventListener('input', () => {
      const hasEnoughContent = responseTextarea.value.trim().length >= 3;
      if (saveResponseBtn) {
        saveResponseBtn.disabled = !hasEnoughContent;
      }
    });
  }

  if (saveResponseBtn) {
    saveResponseBtn.addEventListener('click', async () => {
      const response = responseTextarea ? responseTextarea.value.trim() : '';
      if (response && response.length >= 3) {
        // Check if user accidentally pasted the prompt instead of the AI response
        const promptCheck = detectPromptPaste(response);
        if (promptCheck.isPrompt) {
          showToast(promptCheck.reason, 'error');
          return;
        }

        try {
          // Re-fetch project from storage to ensure we have fresh data (not stale closure)
          const freshProject = await getProject(project.id);

          // Generate prompt if it hasn't been generated yet
          let prompt = freshProject.phases?.[phase]?.prompt || '';
          if (!prompt) {
            prompt = await generatePromptForPhase(freshProject, phase);
          }
          await updatePhase(project.id, phase, prompt, response);

          // Auto-advance to next phase if not on final phase
          if (phase < 3) {
            showToast('Response saved! Moving to next phase...', 'success');
            // Re-fetch the updated project and advance
            const updatedProject = await getProject(project.id);
            updatePhaseTabStylesFn(phase + 1);
            // Add completion checkmark to the current phase tab
            const currentPhaseTab = document.querySelector(`button.phase-tab[data-phase="${phase}"]`);
            if (currentPhaseTab && !currentPhaseTab.querySelector('.text-green-500')) {
              currentPhaseTab.insertAdjacentHTML('beforeend', '<span class="ml-2 text-green-500">✓</span>');
            }
            document.getElementById('phase-content').innerHTML = renderPhaseContent(updatedProject, phase + 1);
            attachPhaseEventListeners(updatedProject, phase + 1);
          } else {
            // Phase 3 complete - extract and update project title if changed
            const extractedTitle = extractTitleFromMarkdownFn(response);
            if (extractedTitle && extractedTitle !== freshProject.title) {
              await updateProject(project.id, { title: extractedTitle });
              showToast(`Phase 3 complete! Title updated to "${extractedTitle}"`, 'success');
            } else {
              showToast('Phase 3 complete! Your PRD is ready.', 'success');
            }
            renderProjectViewFn(project.id);
          }
        } catch (error) {
          console.error('Error saving response:', error);
          showToast(`Failed to save response: ${error.message}`, 'error');
        }
      } else {
        showToast('Please enter at least 3 characters', 'warning');
      }
    });
  }

  // Next phase button - re-fetch project to ensure fresh data
  if (nextPhaseBtn && project.phases?.[phase]?.completed) {
    nextPhaseBtn.addEventListener('click', async () => {
      const nextPhase = phase + 1;

      // Re-fetch project from storage to get fresh data
      const freshProject = await getProject(project.id);
      freshProject.phase = nextPhase;

      updatePhaseTabStylesFn(nextPhase);
      document.getElementById('phase-content').innerHTML = renderPhaseContent(freshProject, nextPhase);
      attachPhaseEventListeners(freshProject, nextPhase);
    });
  }

  // Setup overflow "More" menu with secondary actions
  const moreActionsBtn = document.getElementById('more-actions-btn');
  if (moreActionsBtn) {
    const phaseData = project.phases?.[phase] || {};
    const hasPrompt = !!phaseData.prompt;

    // Build menu items based on current state
    const menuItems = [];

    // View Prompt (only if prompt exists)
    if (hasPrompt) {
      menuItems.push({
        label: 'View Prompt',
        icon: '👁️',
        onClick: async () => {
          const meta = getPhaseMetadata(phase);
          const prompt = await generatePromptForPhase(project, phase);
          showPromptModal(prompt, `Phase ${phase}: ${meta.name} Prompt`, () => enableWorkflowProgression(prompt));
        }
      });
    }

    // Edit Details (always available)
    menuItems.push({
      label: 'Edit Details',
      icon: '✏️',
      onClick: () => navigateTo('edit-project', project.id)
    });

    // Compare Phases (only if 2+ phases completed)
    const workflow = new Workflow(project);
    const completedCount = [1, 2, 3].filter(p => workflow.getPhaseOutput(p)).length;
    if (completedCount >= 2) {
      menuItems.push({
        label: 'Compare Phases',
        icon: '🔄',
        onClick: () => {
          const phases = {
            1: workflow.getPhaseOutput(1),
            2: workflow.getPhaseOutput(2),
            3: workflow.getPhaseOutput(3)
          };
          const completedPhases = Object.entries(phases).filter(([, v]) => v).map(([k]) => parseInt(k));
          showDiffModal(project, phases, completedPhases);
        }
      });
    }

    // Validate (only if Phase 3 complete)
    if (project.phases?.[3]?.completed) {
      menuItems.push({
        label: 'Copy & Full Validation',
        icon: '📋',
        onClick: async () => {
          const markdown = getFinalMarkdown(project);
          if (markdown) {
            try {
              await copyToClipboard(markdown);
              showToast('Document copied! Opening validator...', 'success');
              setTimeout(() => {
                window.open('./validator/', '_blank', 'noopener,noreferrer');
              }, 500);
            } catch {
              showToast('Failed to copy. Please try again.', 'error');
            }
          }
        }
      });
    }

    // Separator before destructive action
    menuItems.push({ separator: true });

    // Delete (destructive)
    menuItems.push({
      label: 'Delete...',
      icon: '🗑️',
      destructive: true,
      onClick: async () => {
        if (await confirm(`Are you sure you want to delete "${project.title}"?`, 'Delete PRD')) {
          await deleteProject(project.id);
          showToast('PRD deleted', 'success');
          navigateTo('home');
        }
      }
    });

    createActionMenu({
      triggerElement: moreActionsBtn,
      items: menuItems,
      position: 'bottom-end'
    });
  }
}
