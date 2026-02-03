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
 * Helper to get phase output - supports both flat and nested formats for backward compatibility
 * @param {Object} project - Project object
 * @param {number} phaseNum - 1-based phase number
 * @returns {string} Phase output or empty string
 */
function getPhaseOutputInternal(project, phaseNum) {
  // Flat format (canonical) - check first
  const flatKey = `phase${phaseNum}_output`;
  if (project[flatKey]) {
    return project[flatKey];
  }
  // Nested format (legacy) - fallback
  if (project.phases) {
    if (Array.isArray(project.phases) && project.phases[phaseNum - 1]) {
      return project.phases[phaseNum - 1].response || '';
    }
    if (project.phases[phaseNum] && typeof project.phases[phaseNum] === 'object') {
      return project.phases[phaseNum].response || '';
    }
  }
  return '';
}

export class Workflow {
  constructor(project) {
    this.project = project;
    // Clamp phase to valid range (1 minimum)
    const rawPhase = project.phase || 1;
    this.currentPhase = Math.max(1, rawPhase);
  }

  /**
   * Get current phase configuration
   */
  getCurrentPhase() {
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase);
  }

  /**
   * Get next phase configuration
   */
  getNextPhase() {
    if (this.currentPhase >= WORKFLOW_CONFIG.phaseCount) {
      return null;
    }
    return WORKFLOW_CONFIG.phases.find(p => p.number === this.currentPhase + 1);
  }

  /**
   * Check if workflow is complete
   */
  isComplete() {
    return this.currentPhase > WORKFLOW_CONFIG.phaseCount;
  }

  /**
   * Advance to next phase
   */
  advancePhase() {
    // Allow advancing up to phase 4 (complete state)
    if (this.currentPhase <= WORKFLOW_CONFIG.phaseCount) {
      this.currentPhase++;
      this.project.phase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
   * Go back to previous phase
   */
  previousPhase() {
    if (this.currentPhase > 1) {
      this.currentPhase--;
      this.project.phase = this.currentPhase;
      return true;
    }
    return false;
  }

  /**
   * Generate prompt for current phase
   * Uses prompts.js module for template loading and variable replacement
   */
  async generatePrompt() {
    const p = this.project;

    switch (this.currentPhase) {
    case 1: {
      const formData = {
        title: p.title || '',
        problems: p.problems || '',
        context: p.context || ''
      };
      return await genPhase1(formData);
    }
    case 2: {
      const phase1Output = getPhaseOutputInternal(p, 1) || '[Phase 1 output not yet generated]';
      return await genPhase2(phase1Output);
    }
    case 3: {
      const phase1Output = getPhaseOutputInternal(p, 1) || '[Phase 1 output not yet generated]';
      const phase2Output = getPhaseOutputInternal(p, 2) || '[Phase 2 output not yet generated]';
      return await genPhase3(phase1Output, phase2Output);
    }
    default:
      throw new Error(`Invalid phase: ${this.currentPhase}`);
    }
  }

  /**
   * Save phase output (uses flat structure: project.phase1_output, etc.)
   */
  savePhaseOutput(output) {
    const phaseKey = `phase${this.currentPhase}_output`;
    this.project[phaseKey] = output;
    this.project.updatedAt = new Date().toISOString();
  }

  /**
   * Get phase output
   */
  getPhaseOutput(phaseNumber) {
    return getPhaseOutputInternal(this.project, phaseNumber);
  }

  /**
   * Export final output as Markdown
   */
  exportAsMarkdown() {
    const footer = `

---

*Generated with [Product Requirements Assistant](https://bordenet.github.io/product-requirements-assistant/)*

**📋 Ready to iterate?** Validate and improve your PRD with the [PRD Validator](https://bordenet.github.io/prd-validator/) — get actionable feedback to strengthen your document.`;

    // Return Phase 3 output if available, otherwise earlier phases (flat format first)
    const phase3Output = this.getPhaseOutput(3);
    const phase2Output = this.getPhaseOutput(2);
    const phase1Output = this.getPhaseOutput(1);

    const finalResponse = phase3Output || phase2Output || phase1Output;

    if (finalResponse) {
      return finalResponse + footer;
    }

    // Fallback to project metadata
    let markdown = `# ${this.project.title || 'Untitled PRD'}\n\n`;
    markdown += `## Problem Statement\n\n${this.project.problems || ''}\n\n`;
    markdown += `## Context\n\n${this.project.context || ''}\n`;
    return markdown + footer;
  }

  /**
   * Get workflow progress percentage
   */
  getProgress() {
    return Math.round((this.currentPhase / WORKFLOW_CONFIG.phaseCount) * 100);
  }
}

/**
 * Standalone helper functions for use in views
 * These provide a simpler API for common workflow operations
 */

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
 * Get metadata for a specific phase
 * @param {number} phaseNumber - Phase number (1, 2, 3, etc.)
 * @returns {Object} Phase metadata
 */
export function getPhaseMetadata(phaseNumber) {
  return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}

/**
 * Generate prompt for a specific phase
 * @param {Object} project - Project object
 * @param {number} phaseNumber - Phase number
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePromptForPhase(project, phaseNumber) {
  const workflow = new Workflow(project);
  workflow.currentPhase = phaseNumber;
  return await workflow.generatePrompt();
}

/**
 * Generate prompt for Phase 1 (Claude Initial)
 * Wrapper for backward compatibility - delegates to Workflow class
 * @module workflow
 */
export async function generatePhase1Prompt(project) {
  return await generatePromptForPhase(project, 1);
}

/**
 * Generate prompt for Phase 2 (Gemini Review)
 * Wrapper for backward compatibility - delegates to Workflow class
 * @module workflow
 */
export async function generatePhase2Prompt(project) {
  return await generatePromptForPhase(project, 2);
}

/**
 * Generate prompt for Phase 3 (Claude Compare)
 * Wrapper for backward compatibility - delegates to Workflow class
 * @module workflow
 */
export async function generatePhase3Prompt(project) {
  return await generatePromptForPhase(project, 3);
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
 * Export final document as Markdown
 * @param {Object} project - Project object
 * @returns {string} Markdown content
 */
export function exportFinalDocument(project) {
  const workflow = new Workflow(project);
  return workflow.exportAsMarkdown();
}

/**
 * Export final PRD as markdown (triggers download)
 * @module workflow
 */
export async function exportFinalPRD(project) {
  const content = exportFinalDocument(project);
  const filename = getExportFilename(project);

  if (!content || content.includes('Untitled PRD')) {
    showToast('No PRD content to export', 'warning');
    return;
  }

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
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
  const name = filename || 'prd';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

/**
 * Generate export filename for a project
 * @module workflow
 * @param {Object} project - Project object
 * @returns {string} Filename with .md extension
 */
export function getExportFilename(project) {
  const title = project.title || project.name || 'prd';
  return `${sanitizeFilename(title)}-prd.md`;
}

/**
 * Get the final markdown content from a project
 * @module workflow
 * @param {Object} project - Project object
 * @returns {string|null} The markdown content or null if none exists
 */
export function getFinalMarkdown(project) {
  if (!project) return null;

  const footer = `

---

*Generated with [Product Requirements Assistant](https://bordenet.github.io/product-requirements-assistant/)*

**📋 Ready to iterate?** Validate and improve your PRD with the [PRD Validator](https://bordenet.github.io/prd-validator/) — get actionable feedback to strengthen your document.`;

  // Flat format first (canonical), then nested format (legacy)
  const phase3Output = project.phase3_output || project.phases?.[3]?.response;
  const phase2Output = project.phase2_output || project.phases?.[2]?.response;
  const phase1Output = project.phase1_output || project.phases?.[1]?.response;

  const finalResponse = phase3Output || phase2Output || phase1Output;

  if (finalResponse) {
    return finalResponse + footer;
  }

  return null;
}
