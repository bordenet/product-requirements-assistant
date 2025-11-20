/**
 * Workflow Module
 * Handles the 3-phase PRD workflow logic
 */

import storage from './storage.js';
import { updatePhase } from './projects.js';
import { copyToClipboard, showToast } from './ui.js';

// Default prompts (loaded from prompts.json)
let defaultPrompts = {};

/**
 * Load default prompts
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
 * Get prompt for a phase
 */
export async function getPrompt(phase) {
    const prompt = await storage.getPrompt(phase);
    return prompt || defaultPrompts[phase] || '';
}

/**
 * Save custom prompt
 */
export async function savePrompt(phase, content) {
    await storage.savePrompt(phase, content);
}

/**
 * Reset prompt to default
 */
export async function resetPrompt(phase) {
    const defaultPrompt = defaultPrompts[phase];
    if (defaultPrompt) {
        await storage.savePrompt(phase, defaultPrompt);
    }
    return defaultPrompt;
}

/**
 * Generate prompt for Phase 1 (Claude Initial)
 */
export async function generatePhase1Prompt(project) {
    const template = await getPrompt(1);
    
    // Replace placeholders
    const prompt = template
        .replace('%s', project.title)
        .replace('%s', project.problems)
        .replace('%s', project.context);
    
    return prompt;
}

/**
 * Generate prompt for Phase 2 (Gemini Review)
 */
export async function generatePhase2Prompt(project) {
    const template = await getPrompt(2);
    const phase1Response = project.phases[1].response;
    
    // Replace placeholder
    const prompt = template.replace('[PASTE CLAUDE\'S ORIGINAL PRD HERE]', phase1Response);
    
    return prompt;
}

/**
 * Generate prompt for Phase 3 (Claude Compare)
 */
export async function generatePhase3Prompt(project) {
    const template = await getPrompt(3);
    const phase1Response = project.phases[1].response;
    const phase2Response = project.phases[2].response;
    
    // Replace placeholders
    const prompt = template
        .replace('[PASTE CLAUDE\'S ORIGINAL PRD HERE]', phase1Response)
        .replace('[PASTE GEMINI\'S PRD RENDITION HERE]', phase2Response);
    
    return prompt;
}

/**
 * Get the appropriate prompt generator for a phase
 */
export async function generatePromptForPhase(project, phase) {
    switch (phase) {
        case 1:
            return await generatePhase1Prompt(project);
        case 2:
            return await generatePhase2Prompt(project);
        case 3:
            return await generatePhase3Prompt(project);
        default:
            throw new Error(`Invalid phase: ${phase}`);
    }
}

/**
 * Copy prompt to clipboard
 */
export async function copyPromptToClipboard(project, phase) {
    const prompt = await generatePromptForPhase(project, phase);
    await copyToClipboard(prompt);
    
    // Save the generated prompt to the project
    await updatePhase(project.id, phase, prompt, project.phases[phase].response);
}

/**
 * Get phase metadata
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
 */
export async function exportFinalPRD(project) {
    const finalResponse = project.phases[3].response || project.phases[2].response || project.phases[1].response;
    
    if (!finalResponse) {
        showToast('No PRD content to export', 'warning');
        return;
    }

    const blob = new Blob([finalResponse], { type: 'text/markdown' });
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
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9]/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase()
        .substring(0, 50);
}

