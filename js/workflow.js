/**
 * Workflow Module
 * @module workflow
 * Handles the 3-phase PRD workflow logic
 */

import storage from './storage.js';
import { updatePhase } from './projects.js';
import { copyToClipboard, showToast } from './ui.js';
import {
  WORKFLOW_CONFIG,
  generatePhase1Prompt as genPhase1,
  generatePhase2Prompt as genPhase2,
  generatePhase3Prompt as genPhase3
} from './prompts.js';

// Re-export WORKFLOW_CONFIG for backward compatibility
export { WORKFLOW_CONFIG };

/**
 * Helper to get phase data, handling both object and array formats
 * @param {Object} project - Project object
 * @param {number} phaseNum - 1-based phase number
 * @returns {Object} Phase data object with prompt, response, completed
 */
function getPhaseData(project, phaseNum) {
  const defaultPhase = { prompt: '', response: '', completed: false };
  if (!project.phases) return defaultPhase;

  // Array format first (legacy)
  if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
    return project.phases[phaseNum - 1];
  }
  // Object format (canonical)
  if (project.phases[phaseNum] && typeof project.phases[phaseNum] === 'object') {
    return project.phases[phaseNum];
  }
  return defaultPhase;
}

/**
 * Generate prompt for Phase 1 (Claude Initial)
 * Wrapper for backward compatibility - delegates to prompts.js
 * @module workflow
 */
export async function generatePhase1Prompt(project) {
  const formData = {
    title: project.title || '',
    problems: project.problems || '',
    context: project.context || ''
  };
  return await genPhase1(formData);
}

/**
 * Generate prompt for Phase 2 (Gemini Review)
 * Wrapper for backward compatibility - delegates to prompts.js
 * @module workflow
 */
export async function generatePhase2Prompt(project) {
  const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output yet]';
  return await genPhase2(phase1Output);
}

/**
 * Generate prompt for Phase 3 (Claude Compare)
 * Wrapper for backward compatibility - delegates to prompts.js
 * @module workflow
 */
export async function generatePhase3Prompt(project) {
  const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output yet]';
  const phase2Output = getPhaseData(project, 2).response || '[No Phase 2 output yet]';
  return await genPhase3(phase1Output, phase2Output);
}

// Default prompts (loaded from prompts.json) - legacy, kept for backward compatibility
let defaultPrompts = {};

/**
 * Load default prompts - legacy function kept for backward compatibility
 * @module workflow
 */
export async function loadDefaultPrompts() {
  try {
    const response = await fetch('data/prompts.json');
    defaultPrompts = await response.json();

    // Save to IndexedDB if not already saved
    for (const [phase, content] of Object.entries(defaultPrompts)) {
      const existing = await storage.getPrompt(parseInt(phase));
      if (!existing) {
        await storage.savePrompt(parseInt(phase), content);
      }
    }
  } catch (error) {
    console.error('Failed to load default prompts:', error);
  }
}

/**
 * Get prompt for a phase - legacy function kept for backward compatibility
 * @module workflow
 */
export async function getPrompt(phase) {
  const prompt = await storage.getPrompt(phase);
  return prompt || defaultPrompts[phase] || '';
}

/**
 * Save custom prompt
 * @module workflow
 */
export async function savePrompt(phase, content) {
  await storage.savePrompt(phase, content);
}

/**
 * Reset prompt to default
 * @module workflow
 */
export async function resetPrompt(phase) {
  const defaultPrompt = defaultPrompts[phase];
  if (defaultPrompt) {
    await storage.savePrompt(phase, defaultPrompt);
  }
  return defaultPrompt;
}

/**
 * Get the appropriate prompt generator for a phase
 * Uses prompts.js module for template loading and variable replacement
 * @module workflow
 */
export async function generatePromptForPhase(project, phase) {
  const formData = {
    title: project.title || '',
    problems: project.problems || '',
    context: project.context || ''
  };

  switch (phase) {
  case 1:
    return await genPhase1(formData);
  case 2: {
    const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output yet]';
    return await genPhase2(phase1Output);
  }
  case 3: {
    const phase1Output = getPhaseData(project, 1).response || '[No Phase 1 output yet]';
    const phase2Output = getPhaseData(project, 2).response || '[No Phase 2 output yet]';
    return await genPhase3(phase1Output, phase2Output);
  }
  default:
    throw new Error(`Invalid phase: ${phase}`);
  }
}

/**
 * Copy prompt to clipboard
 * @module workflow
 */
export async function copyPromptToClipboard(project, phase) {
  const prompt = await generatePromptForPhase(project, phase);
  await copyToClipboard(prompt);

  // Save the generated prompt to the project
  await updatePhase(project.id, phase, prompt, project.phases[phase].response);
}

/**
 * Get phase metadata
 * @module workflow
 */
export function getPhaseMetadata(phase) {
  const metadata = {
    1: {
      title: 'Phase 1: Initial Draft',
      ai: 'Claude Sonnet 4.5',
      description: 'Generate the initial PRD based on your requirements',
      color: 'blue',
      icon: '📝'
    },
    2: {
      title: 'Phase 2: Review & Refine',
      ai: 'Gemini 2.5 Pro',
      description: 'Review and improve the initial draft',
      color: 'purple',
      icon: '🔍'
    },
    3: {
      title: 'Phase 3: Final Comparison',
      ai: 'Claude Sonnet 4.5',
      description: 'Compare both versions and create the final PRD',
      color: 'green',
      icon: '✨'
    }
  };

  return metadata[phase] || {};
}

/**
 * Export final PRD as markdown
 * @module workflow
 */
export async function exportFinalPRD(project) {
  const finalResponse = project.phases[3].response || project.phases[2].response || project.phases[1].response;
  const attribution = '\n\n---\n\n*Generated with [Product Requirements Assistant](https://bordenet.github.io/product-requirements-assistant/)*';

  if (!finalResponse) {
    showToast('No PRD content to export', 'warning');
    return;
  }

  const content = finalResponse + attribution;
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(project.title)}-PRD.md`;
  a.click();
  URL.revokeObjectURL(url);

  showToast('PRD exported successfully!', 'success');
}

/**
 * Sanitize filename
 * @module workflow
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 50);
}

/**
 * Generate export filename for a project
 * @module workflow
 * @param {Object} project - Project object
 * @returns {string} Filename with .md extension
 */
export function getExportFilename(project) {
  return `${sanitizeFilename(project.title)}-PRD.md`;
}

/**
 * Get the final markdown content from a project
 * @module workflow
 * @param {Object} project - Project object
 * @returns {string|null} The markdown content or null if none exists
 */
export function getFinalMarkdown(project) {
  return project.phases?.[3]?.response || project.phases?.[2]?.response || project.phases?.[1]?.response || null;
}
