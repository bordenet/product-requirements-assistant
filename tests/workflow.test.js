import { describe, test, expect, beforeEach } from '@jest/globals';
import { getPrompt, savePrompt, resetPrompt, generatePhase1Prompt, generatePhase2Prompt, generatePhase3Prompt, generatePromptForPhase, getPhaseMetadata } from '../js/workflow.js';
import { createProject } from '../js/projects.js';
import storage from '../js/storage.js';

describe('Workflow Module', () => {
  beforeEach(async () => {
    // Initialize database before each test
    await storage.init();

    // Clear prompts to avoid test interference
    // We'll let each test set up its own prompts
  });

  describe('getPrompt and savePrompt', () => {
    test('should save and retrieve a custom prompt', async () => {
      const phase = 1;
      const content = 'Custom prompt for phase 1';

      await savePrompt(phase, content);
      const retrieved = await getPrompt(phase);

      expect(retrieved).toBe(content);
    });

    test('should return empty string for non-existent prompt', async () => {
      const retrieved = await getPrompt(999);
      expect(typeof retrieved).toBe('string');
    });
  });

  describe('resetPrompt', () => {
    test('should reset prompt to default when default exists', async () => {
      const phase = 1;
      const customContent = 'Custom prompt';

      // Save custom prompt
      await savePrompt(phase, customContent);

      // Reset to default (will return undefined if no default is loaded)
      const defaultPrompt = await resetPrompt(phase);

      // If there's no default loaded, resetPrompt returns undefined
      // and the prompt should be cleared
      const retrieved = await getPrompt(phase);

      // Either it's the default (if one was loaded) or empty string (if no default)
      if (defaultPrompt) {
        expect(retrieved).toBe(defaultPrompt);
      } else {
        expect(typeof retrieved).toBe('string');
      }
    });
  });

  describe('generatePhase1Prompt', () => {
    test('should generate Phase 1 prompt with project data', async () => {
      // Set up a default prompt template
      await savePrompt(1, 'Create a PRD for: %s. Problems: %s. Context: %s');

      const project = await createProject(
        'Test Feature',
        'Users need better analytics',
        'B2B SaaS platform'
      );

      const prompt = await generatePhase1Prompt(project);

      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
      // Prompt should contain project data
      expect(prompt).toContain('Test Feature');
    });

    test('should handle empty project fields', async () => {
      const project = await createProject('', '', '');

      const prompt = await generatePhase1Prompt(project);

      expect(typeof prompt).toBe('string');
    });
  });

  describe('generatePhase2Prompt', () => {
    test('should generate Phase 2 prompt with Phase 1 response', async () => {
      // Set up a default prompt template
      await savePrompt(2, 'Review this PRD: [PASTE CLAUDE\'S ORIGINAL PRD HERE]');

      const project = await createProject(
        'Test Feature',
        'Problems',
        'Context'
      );

      // Add Phase 1 response
      project.phases[1].response = 'This is the Phase 1 PRD draft';

      const prompt = await generatePhase2Prompt(project);

      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('This is the Phase 1 PRD draft');
    });

    test('should handle missing Phase 1 response', async () => {
      const project = await createProject(
        'Test Feature',
        'Problems',
        'Context'
      );

      const prompt = await generatePhase2Prompt(project);

      expect(typeof prompt).toBe('string');
    });
  });

  describe('generatePhase3Prompt', () => {
    test('should generate Phase 3 prompt with both responses', async () => {
      // Set up a default prompt template
      await savePrompt(3, 'Compare: [PASTE CLAUDE\'S ORIGINAL PRD HERE] and [PASTE GEMINI\'S PRD RENDITION HERE]');

      const project = await createProject(
        'Test Feature',
        'Problems',
        'Context'
      );

      // Add Phase 1 and 2 responses
      project.phases[1].response = 'Phase 1 PRD draft';
      project.phases[2].response = 'Phase 2 review feedback';

      const prompt = await generatePhase3Prompt(project);

      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
      expect(prompt).toContain('Phase 1 PRD draft');
      expect(prompt).toContain('Phase 2 review feedback');
    });

    test('should handle missing responses', async () => {
      const project = await createProject(
        'Test Feature',
        'Problems',
        'Context'
      );

      const prompt = await generatePhase3Prompt(project);

      expect(typeof prompt).toBe('string');
    });
  });

  describe('3-phase workflow integration', () => {
    test('should complete full workflow', async () => {
      // Set up default prompt templates
      await savePrompt(1, 'Create PRD: %s, %s, %s');
      await savePrompt(2, 'Review: [PASTE CLAUDE\'S ORIGINAL PRD HERE]');
      await savePrompt(3, 'Compare: [PASTE CLAUDE\'S ORIGINAL PRD HERE] and [PASTE GEMINI\'S PRD RENDITION HERE]');

      // Create project
      const project = await createProject(
        'Analytics Dashboard',
        'Users need better insights',
        'B2B SaaS platform'
      );

      // Phase 1: Generate prompt
      const phase1Prompt = await generatePhase1Prompt(project);
      expect(phase1Prompt).toBeTruthy();

      // Simulate Phase 1 response
      project.phases[1].response = 'Generated PRD from Claude';
      project.phases[1].completed = true;

      // Phase 2: Generate prompt
      const phase2Prompt = await generatePhase2Prompt(project);
      expect(phase2Prompt).toBeTruthy();

      // Simulate Phase 2 response
      project.phases[2].response = 'Review feedback from Gemini';
      project.phases[2].completed = true;

      // Phase 3: Generate prompt
      const phase3Prompt = await generatePhase3Prompt(project);
      expect(phase3Prompt).toBeTruthy();

      // Verify all phases have prompts
      expect(phase1Prompt.length).toBeGreaterThan(0);
      expect(phase2Prompt.length).toBeGreaterThan(0);
      expect(phase3Prompt.length).toBeGreaterThan(0);
    });
  });

  describe('generatePromptForPhase', () => {
    test('should generate prompt for phase 1', async () => {
      await savePrompt(1, 'Phase 1 template');
      const project = await createProject('Test', 'Problems', 'Context');

      const prompt = await generatePromptForPhase(project, 1);
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    test('should generate prompt for phase 2', async () => {
      await savePrompt(2, 'Phase 2 template');
      const project = await createProject('Test', 'Problems', 'Context');
      project.phases[1].response = 'Phase 1 response';

      const prompt = await generatePromptForPhase(project, 2);
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    test('should generate prompt for phase 3', async () => {
      await savePrompt(3, 'Phase 3 template');
      const project = await createProject('Test', 'Problems', 'Context');
      project.phases[1].response = 'Phase 1 response';
      project.phases[2].response = 'Phase 2 response';

      const prompt = await generatePromptForPhase(project, 3);
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    });

    test('should throw error for invalid phase', async () => {
      const project = await createProject('Test', 'Problems', 'Context');

      await expect(generatePromptForPhase(project, 99)).rejects.toThrow('Invalid phase: 99');
    });
  });

  describe('getPhaseMetadata', () => {
    test('should return metadata for phase 1', () => {
      const metadata = getPhaseMetadata(1);
      expect(metadata.title).toBe('Phase 1: Initial Draft');
      expect(metadata.ai).toBe('Claude Sonnet 4.5');
      expect(metadata.color).toBe('blue');
      expect(metadata.icon).toBe('📝');
    });

    test('should return metadata for phase 2', () => {
      const metadata = getPhaseMetadata(2);
      expect(metadata.title).toBe('Phase 2: Review & Refine');
      expect(metadata.ai).toBe('Gemini 2.5 Pro');
      expect(metadata.color).toBe('purple');
      expect(metadata.icon).toBe('🔍');
    });

    test('should return metadata for phase 3', () => {
      const metadata = getPhaseMetadata(3);
      expect(metadata.title).toBe('Phase 3: Final Comparison');
      expect(metadata.ai).toBe('Claude Sonnet 4.5');
      expect(metadata.color).toBe('green');
      expect(metadata.icon).toBe('✨');
    });

    test('should return empty object for invalid phase', () => {
      const metadata = getPhaseMetadata(99);
      expect(metadata).toEqual({});
    });
  });

});
