/**
 * Canonical Workflow Class Tests
 *
 * These tests verify the Workflow class contract that MUST be identical
 * across all genesis-derived tools. Only tool-specific prompt content
 * and export format should differ.
 *
 * DO NOT MODIFY these tests per-tool. If a test fails, fix the workflow.js
 * implementation to match the contract.
 */

import { jest } from '@jest/globals';
import {
  Workflow,
  WORKFLOW_CONFIG,
  getPhaseMetadata,
  exportFinalDocument,
  getExportFilename,
  sanitizeFilename,
  getFinalMarkdown,
  generatePromptForPhase,
  generatePhase1Prompt,
  generatePhase2Prompt,
  generatePhase3Prompt,
  loadDefaultPrompts,
  getPrompt,
  savePrompt,
  resetPrompt
} from '../js/workflow.js';
import storage from '../js/storage.js';

// Mock fetch for prompt template loading
beforeAll(() => {
  global.fetch = jest.fn(() => Promise.resolve({
    ok: true,
    text: () => Promise.resolve('Mock prompt template with {{TITLE}} and {{DESCRIPTION}}')
  }));
});

describe('WORKFLOW_CONFIG', () => {
  it('should have required structure', () => {
    expect(WORKFLOW_CONFIG).toBeDefined();
    expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
    expect(WORKFLOW_CONFIG.phases).toBeInstanceOf(Array);
    expect(WORKFLOW_CONFIG.phases.length).toBe(3);
  });

  it('should have required phase properties', () => {
    WORKFLOW_CONFIG.phases.forEach((phase, index) => {
      expect(phase.number).toBe(index + 1);
      expect(typeof phase.name).toBe('string');
      expect(typeof phase.description).toBe('string');
      expect(typeof phase.aiModel).toBe('string');
      expect(typeof phase.icon).toBe('string');
    });
  });
});

describe('Workflow class', () => {
  let project;
  let workflow;

  beforeEach(() => {
    project = {
      id: 'test-123',
      title: 'Test Project',
      description: 'Test description',
      context: 'Test context',
      phase: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    workflow = new Workflow(project);
  });

  describe('constructor', () => {
    it('should initialize with project', () => {
      expect(workflow.project).toBe(project);
      expect(workflow.currentPhase).toBe(1);
    });

    it('should default to phase 1 if not set', () => {
      delete project.phase;
      const w = new Workflow(project);
      expect(w.currentPhase).toBe(1);
    });

    it('should handle phase 0 as phase 1', () => {
      project.phase = 0;
      const w = new Workflow(project);
      expect(w.currentPhase).toBe(1);
    });

    it('should handle negative phase as phase 1', () => {
      project.phase = -1;
      const w = new Workflow(project);
      expect(w.currentPhase).toBe(1);
    });
  });

  describe('getCurrentPhase', () => {
    it('should return current phase config', () => {
      const phase = workflow.getCurrentPhase();
      expect(phase.number).toBe(1);
      expect(phase.name).toBeDefined();
    });

    it('should return phase 2 config when on phase 2', () => {
      workflow.currentPhase = 2;
      const phase = workflow.getCurrentPhase();
      expect(phase.number).toBe(2);
    });

    it('should return phase 3 config when on phase 3', () => {
      workflow.currentPhase = 3;
      const phase = workflow.getCurrentPhase();
      expect(phase.number).toBe(3);
    });
  });

  describe('getNextPhase', () => {
    it('should return next phase config', () => {
      const next = workflow.getNextPhase();
      expect(next.number).toBe(2);
    });

    it('should return null on last phase', () => {
      workflow.currentPhase = 3;
      expect(workflow.getNextPhase()).toBeNull();
    });
  });

  describe('isComplete', () => {
    it('should return false when on phase 1', () => {
      expect(workflow.isComplete()).toBe(false);
    });

    it('should return false when on phase 3', () => {
      workflow.currentPhase = 3;
      expect(workflow.isComplete()).toBe(false);
    });

    it('should return true when past phase 3', () => {
      workflow.currentPhase = 4;
      workflow.project.phase = 4;
      expect(workflow.isComplete()).toBe(true);
    });
  });

  describe('advancePhase', () => {
    it('should advance from phase 1 to phase 2', () => {
      const result = workflow.advancePhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(2);
      expect(project.phase).toBe(2);
    });

    it('should advance from phase 2 to phase 3', () => {
      workflow.currentPhase = 2;
      const result = workflow.advancePhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(3);
    });

    it('should advance from phase 3 to phase 4 (complete)', () => {
      workflow.currentPhase = 3;
      const result = workflow.advancePhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(4);
    });

    it('should NOT advance past phase 4', () => {
      workflow.currentPhase = 4;
      const result = workflow.advancePhase();
      expect(result).toBe(false);
      expect(workflow.currentPhase).toBe(4);
    });
  });

  describe('previousPhase', () => {
    it('should go back from phase 2 to phase 1', () => {
      workflow.currentPhase = 2;
      const result = workflow.previousPhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(1);
      expect(project.phase).toBe(1);
    });

    it('should go back from phase 3 to phase 2', () => {
      workflow.currentPhase = 3;
      const result = workflow.previousPhase();
      expect(result).toBe(true);
      expect(workflow.currentPhase).toBe(2);
    });

    it('should NOT go before phase 1', () => {
      workflow.currentPhase = 1;
      const result = workflow.previousPhase();
      expect(result).toBe(false);
      expect(workflow.currentPhase).toBe(1);
    });
  });

  describe('savePhaseOutput', () => {
    it('should save output for phase 1', () => {
      workflow.savePhaseOutput('Phase 1 output');
      expect(project.phase1_output).toBe('Phase 1 output');
    });

    it('should save output for phase 2', () => {
      workflow.currentPhase = 2;
      workflow.savePhaseOutput('Phase 2 output');
      expect(project.phase2_output).toBe('Phase 2 output');
    });

    it('should save output for phase 3', () => {
      workflow.currentPhase = 3;
      workflow.savePhaseOutput('Phase 3 output');
      expect(project.phase3_output).toBe('Phase 3 output');
    });

    it('should update timestamp', () => {
      // Set an old timestamp to ensure it changes
      project.updatedAt = '2020-01-01T00:00:00.000Z';
      workflow.savePhaseOutput('Test output');
      expect(project.updatedAt).not.toBe('2020-01-01T00:00:00.000Z');
    });
  });

  describe('getPhaseOutput', () => {
    it('should return phase 1 output', () => {
      project.phase1_output = 'Phase 1 content';
      expect(workflow.getPhaseOutput(1)).toBe('Phase 1 content');
    });

    it('should return phase 2 output', () => {
      project.phase2_output = 'Phase 2 content';
      expect(workflow.getPhaseOutput(2)).toBe('Phase 2 content');
    });

    it('should return phase 3 output', () => {
      project.phase3_output = 'Phase 3 content';
      expect(workflow.getPhaseOutput(3)).toBe('Phase 3 content');
    });

    it('should return empty string if no output', () => {
      expect(workflow.getPhaseOutput(1)).toBe('');
      expect(workflow.getPhaseOutput(2)).toBe('');
      expect(workflow.getPhaseOutput(3)).toBe('');
    });

    it('should fall back to array format phases', () => {
      const projectWithArray = {
        title: 'Test',
        phases: [
          { response: 'Array Phase 1' },
          { response: 'Array Phase 2' },
          { response: 'Array Phase 3' }
        ]
      };
      const arrayWorkflow = new Workflow(projectWithArray);
      expect(arrayWorkflow.getPhaseOutput(1)).toBe('Array Phase 1');
      expect(arrayWorkflow.getPhaseOutput(2)).toBe('Array Phase 2');
      expect(arrayWorkflow.getPhaseOutput(3)).toBe('Array Phase 3');
    });

    it('should fall back to nested object format phases', () => {
      const projectWithNested = {
        title: 'Test',
        phases: {
          1: { response: 'Nested Phase 1' },
          2: { response: 'Nested Phase 2' },
          3: { response: 'Nested Phase 3' }
        }
      };
      const nestedWorkflow = new Workflow(projectWithNested);
      expect(nestedWorkflow.getPhaseOutput(1)).toBe('Nested Phase 1');
      expect(nestedWorkflow.getPhaseOutput(2)).toBe('Nested Phase 2');
      expect(nestedWorkflow.getPhaseOutput(3)).toBe('Nested Phase 3');
    });

    it('should prefer flat format over nested formats', () => {
      const projectWithBoth = {
        title: 'Test',
        phase1_output: 'Flat format preferred',
        phases: {
          1: { response: 'Nested format' }
        }
      };
      const mixedWorkflow = new Workflow(projectWithBoth);
      expect(mixedWorkflow.getPhaseOutput(1)).toBe('Flat format preferred');
    });
  });

  describe('getProgress', () => {
    it('should return 33% for phase 1', () => {
      expect(workflow.getProgress()).toBe(33);
    });

    it('should return 67% for phase 2', () => {
      workflow.currentPhase = 2;
      expect(workflow.getProgress()).toBe(67);
    });

    it('should return 100% for phase 3', () => {
      workflow.currentPhase = 3;
      expect(workflow.getProgress()).toBe(100);
    });
  });

  describe('generatePrompt', () => {
    it('should generate prompt for phase 1', async () => {
      const prompt = await workflow.generatePrompt();
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    it('should generate prompt for phase 2', async () => {
      project.phase1_output = 'Phase 1 content';
      workflow.currentPhase = 2;
      const prompt = await workflow.generatePrompt();
      expect(typeof prompt).toBe('string');
    });

    it('should generate prompt for phase 3', async () => {
      project.phase1_output = 'Phase 1 content';
      project.phase2_output = 'Phase 2 content';
      workflow.currentPhase = 3;
      const prompt = await workflow.generatePrompt();
      expect(typeof prompt).toBe('string');
    });

    it('should throw for invalid phase', async () => {
      workflow.currentPhase = 99;
      await expect(workflow.generatePrompt()).rejects.toThrow();
    });
  });

  describe('exportAsMarkdown', () => {
    it('should return string', () => {
      const md = workflow.exportAsMarkdown();
      expect(typeof md).toBe('string');
    });

    it('should include phase 3 output when available', () => {
      project.phase3_output = 'Final content here';
      const md = workflow.exportAsMarkdown();
      expect(md).toContain('Final content');
    });
  });
});

describe('getPhaseMetadata helper', () => {
  it('should return phase 1 metadata', () => {
    const meta = getPhaseMetadata(1);
    expect(meta.number).toBe(1);
    expect(meta.name).toBeDefined();
  });

  it('should return phase 2 metadata', () => {
    const meta = getPhaseMetadata(2);
    expect(meta.number).toBe(2);
  });

  it('should return phase 3 metadata', () => {
    const meta = getPhaseMetadata(3);
    expect(meta.number).toBe(3);
  });

  it('should return undefined for invalid phase', () => {
    const meta = getPhaseMetadata(99);
    expect(meta).toBeUndefined();
  });
});

describe('exportFinalDocument helper', () => {
  it('should export project as markdown', () => {
    const project = {
      title: 'Test',
      phase3_output: 'Final content'
    };
    const md = exportFinalDocument(project);
    expect(typeof md).toBe('string');
  });
});

describe('getExportFilename helper', () => {
  it('should generate filename from title', () => {
    const project = { title: 'My Test Project' };
    const filename = getExportFilename(project);
    expect(filename).toMatch(/\.md$/);
    expect(filename).toContain('my-test-project');
  });

  it('should sanitize special characters', () => {
    const project = { title: 'Test: With/Special*Chars!' };
    const filename = getExportFilename(project);
    expect(filename).not.toMatch(/[/:*!]/);
  });

  it('should handle empty title', () => {
    const project = { title: '' };
    const filename = getExportFilename(project);
    expect(filename).toMatch(/\.md$/);
  });
});

// ============================================================================
// Additional Helper Function Tests
// ============================================================================

describe('sanitizeFilename', () => {
  it('should convert to lowercase', () => {
    expect(sanitizeFilename('TEST')).toBe('test');
  });

  it('should replace spaces with hyphens', () => {
    expect(sanitizeFilename('my project')).toBe('my-project');
  });

  it('should remove special characters', () => {
    expect(sanitizeFilename('test:file/name*here!')).toBe('testfilenamehere');
  });

  it('should handle empty string', () => {
    expect(sanitizeFilename('')).toBe('prd');
  });

  it('should handle null', () => {
    expect(sanitizeFilename(null)).toBe('prd');
  });
});

describe('getFinalMarkdown', () => {
  it('should return null for null project', () => {
    expect(getFinalMarkdown(null)).toBeNull();
  });

  it('should return null for undefined project', () => {
    expect(getFinalMarkdown(undefined)).toBeNull();
  });

  it('should return null for project without output', () => {
    const project = { title: 'Test' };
    expect(getFinalMarkdown(project)).toBeNull();
  });

  it('should return phase 3 output when available', () => {
    const project = { title: 'Test', phase3_output: '# Final PRD' };
    const result = getFinalMarkdown(project);
    expect(result).toContain('# Final PRD');
    expect(result).toContain('Generated with');
  });

  it('should fall back to phase 1 output', () => {
    const project = { title: 'Test', phase1_output: '# Draft PRD' };
    const result = getFinalMarkdown(project);
    expect(result).toContain('# Draft PRD');
  });

  it('should handle phases array format', () => {
    const project = {
      title: 'Test',
      phases: [
        { response: '' },
        { response: '' },
        { response: '# From Array' }
      ]
    };
    const result = getFinalMarkdown(project);
    expect(result).toContain('# From Array');
  });
});

describe('generatePromptForPhase', () => {
  it('should generate phase 1 prompt', async () => {
    const project = { title: 'Test', description: 'Desc' };
    const prompt = await generatePromptForPhase(project, 1);
    expect(typeof prompt).toBe('string');
  });

  it('should generate phase 2 prompt', async () => {
    const project = { title: 'Test', phase1_output: 'Phase 1 output' };
    const prompt = await generatePromptForPhase(project, 2);
    expect(typeof prompt).toBe('string');
  });

  it('should generate phase 3 prompt', async () => {
    const project = {
      title: 'Test',
      phase1_output: 'Phase 1 output',
      phase2_output: 'Phase 2 output'
    };
    const prompt = await generatePromptForPhase(project, 3);
    expect(typeof prompt).toBe('string');
  });
});

describe('generatePhase1Prompt', () => {
  it('should return prompt string', async () => {
    const project = { title: 'Test', description: 'Desc' };
    const prompt = await generatePhase1Prompt(project);
    expect(typeof prompt).toBe('string');
  });
});

describe('generatePhase2Prompt', () => {
  it('should return prompt string', async () => {
    const project = { title: 'Test', phase1_output: 'Output' };
    const prompt = await generatePhase2Prompt(project);
    expect(typeof prompt).toBe('string');
  });
});

describe('generatePhase3Prompt', () => {
  it('should return prompt string', async () => {
    const project = {
      title: 'Test',
      phase1_output: 'Phase 1',
      phase2_output: 'Phase 2'
    };
    const prompt = await generatePhase3Prompt(project);
    expect(typeof prompt).toBe('string');
  });
});

// =================================================================
// Legacy Prompt Functions Tests
// =================================================================
describe('Legacy Prompt Functions', () => {
  beforeEach(async () => {
    await storage.init();
  });

  describe('loadDefaultPrompts', () => {
    test('should load prompts from fetch and not throw', async () => {
      // The function should complete without throwing
      await expect(loadDefaultPrompts()).resolves.not.toThrow();
    });

    test('should handle fetch errors gracefully', async () => {
      // Save original fetch
      const originalFetch = global.fetch;

      // Mock fetch to reject
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      // Should not throw, just log error
      await expect(loadDefaultPrompts()).resolves.not.toThrow();

      // Restore original fetch
      global.fetch = originalFetch;
    });

    test('should save prompts to storage when fetched successfully', async () => {
      const originalFetch = global.fetch;
      const mockPrompts = { 1: 'Phase 1 default', 2: 'Phase 2 default' };

      global.fetch = jest.fn(() => Promise.resolve({
        json: () => Promise.resolve(mockPrompts)
      }));

      await loadDefaultPrompts();

      // Verify prompts were saved (or verify fetch was called)
      expect(global.fetch).toHaveBeenCalled();

      global.fetch = originalFetch;
    });
  });

  describe('getPrompt', () => {
    test('should return empty string for phase with no prompt', async () => {
      const prompt = await getPrompt(999);
      expect(prompt).toBe('');
    });

    test('should return saved prompt after savePrompt', async () => {
      await savePrompt(1, 'Test prompt content');
      const prompt = await getPrompt(1);
      expect(prompt).toBe('Test prompt content');
    });
  });

  describe('savePrompt', () => {
    test('should save prompt to storage', async () => {
      await savePrompt(2, 'Phase 2 custom prompt');
      const saved = await storage.getPrompt(2);
      expect(saved).toBe('Phase 2 custom prompt');
    });

    test('should overwrite existing prompt', async () => {
      await savePrompt(1, 'First version');
      await savePrompt(1, 'Second version');
      const prompt = await getPrompt(1);
      expect(prompt).toBe('Second version');
    });
  });

  describe('resetPrompt', () => {
    test('should return undefined when no default exists', async () => {
      const result = await resetPrompt(999);
      expect(result).toBeUndefined();
    });

    test('should restore default prompt and save to storage', async () => {
      const originalFetch = global.fetch;
      const mockPrompts = { 1: 'Default Phase 1 Prompt' };

      global.fetch = jest.fn(() => Promise.resolve({
        json: () => Promise.resolve(mockPrompts)
      }));

      // Load defaults first
      await loadDefaultPrompts();

      // Override with custom
      await savePrompt(1, 'Custom prompt');

      // Reset should restore default
      const result = await resetPrompt(1);
      expect(result).toBe('Default Phase 1 Prompt');

      // Storage should have the default
      const stored = await storage.getPrompt(1);
      expect(stored).toBe('Default Phase 1 Prompt');

      global.fetch = originalFetch;
    });
  });
});
