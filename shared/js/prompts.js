/**
 * Product Requirements Assistant Prompts Module
 * @module prompts
 *
 * Manages workflow configuration and prompt generation for PRDs.
 * Prompts are stored in prompts/ directory as markdown files.
 */

export const WORKFLOW_CONFIG = {
  phaseCount: 3,
  phases: [
    {
      number: 1,
      name: 'Initial Draft',
      icon: '📝',
      aiModel: 'Claude',
      description: 'Generate the first draft of your PRD using Claude'
    },
    {
      number: 2,
      name: 'Critical Review',
      icon: '🔍',
      aiModel: 'Gemini',
      description: 'Get a critical review and improvements from Gemini'
    },
    {
      number: 3,
      name: 'Final Synthesis',
      icon: '✨',
      aiModel: 'Claude',
      description: 'Combine the best elements into a polished final PRD'
    }
  ]
};

// Cache for loaded prompt templates
const promptCache = {};

/**
 * Detect base path for shared assets based on current location
 * Works from both root (/) and assistant/ subdirectory
 */
function getSharedBasePath() {
  const path = window.location.pathname;
  // If we're in /assistant/, go up one level to reach /shared/
  if (path.includes('/assistant/') || path.endsWith('/assistant')) {
    return '../shared/';
  }
  // If we're at root, shared/ is a direct child
  return 'shared/';
}

/**
 * Load prompt template from markdown file
 * @param {number} phaseNumber - Phase number (1, 2, or 3)
 * @returns {Promise<string>} Prompt template
 */
async function loadPromptTemplate(phaseNumber) {
  if (promptCache[phaseNumber]) {
    return promptCache[phaseNumber];
  }

  try {
    const basePath = getSharedBasePath();
    const response = await fetch(`${basePath}prompts/phase${phaseNumber}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load prompt template for phase ${phaseNumber}`);
    }
    const template = await response.text();
    promptCache[phaseNumber] = template;
    return template;
  } catch (error) {
    console.error(`Error loading prompt template for phase ${phaseNumber}:`, error);
    throw error;
  }
}

/**
 * Preload all prompt templates to avoid network delay on first click.
 * This ensures clipboard operations happen within Safari's transient activation window.
 * Call this when the app initializes or when entering a project view.
 * @returns {Promise<void>}
 */
export async function preloadPromptTemplates() {
  const phases = Array.from({ length: WORKFLOW_CONFIG.phaseCount }, (_, i) => i + 1);
  await Promise.all(phases.map(phase => loadPromptTemplate(phase)));
}

/**
 * Replace template variables with actual values
 * Uses {{VAR_NAME}} syntax (double braces, SCREAMING_SNAKE_CASE)
 * @param {string} template - Template string
 * @param {Object} vars - Variables to replace
 * @returns {string} Processed template
 */
function replaceTemplateVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  }

  // Safety check: detect and remove any remaining placeholders
  // This prevents unsubstituted {{PLACEHOLDER}} from reaching the LLM
  const remaining = result.match(/\{\{[A-Z_]+\}\}/g);
  if (remaining) {
    console.warn('[prompts] Unsubstituted placeholders detected:', remaining);
    result = result.replace(/\{\{[A-Z_]+\}\}/g, '');
  }

  return result;
}

/**
 * Phase 1 Prompt: Initial Draft Generation
 * @param {Object} formData - Form data (title, problems, context)
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePhase1Prompt(formData) {
  const template = await loadPromptTemplate(1);
  return replaceTemplateVars(template, {
    TITLE: formData.title || '',
    PROBLEMS: formData.problems || '',
    CONTEXT: formData.context || ''
  });
}

/**
 * Phase 2 Prompt: Critical Review
 * @param {string} phase1Output - Output from phase 1
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePhase2Prompt(phase1Output) {
  const template = await loadPromptTemplate(2);
  return replaceTemplateVars(template, {
    PHASE1_OUTPUT: phase1Output
  });
}

/**
 * Phase 3 Prompt: Final Synthesis
 * @param {string} phase1Output - Output from phase 1
 * @param {string} phase2Output - Output from phase 2
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePhase3Prompt(phase1Output, phase2Output) {
  const template = await loadPromptTemplate(3);
  return replaceTemplateVars(template, {
    PHASE1_OUTPUT: phase1Output,
    PHASE2_OUTPUT: phase2Output
  });
}

/**
 * Get phase metadata
 * @param {number} phaseNumber - Phase number
 * @returns {Object|undefined} Phase metadata
 */
export function getPhaseMetadata(phaseNumber) {
  return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}
