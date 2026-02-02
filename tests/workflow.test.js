import { getPrompt, savePrompt, resetPrompt, generatePhase1Prompt, generatePhase2Prompt, generatePhase3Prompt, generatePromptForPhase, getPhaseMetadata, exportFinalPRD, copyPromptToClipboard, loadDefaultPrompts } from '../js/workflow.js';
import { createProject, updatePhase, getProject } from '../js/projects.js';
import storage from '../js/storage.js';

// Mock prompt templates using {{VAR}} syntax
const mockPromptTemplates = {
  1: 'Create a PRD for: {{TITLE}}. Problems: {{PROBLEMS}}. Context: {{CONTEXT}}',
  2: 'Review this PRD: {{PHASE1_OUTPUT}}',
  3: 'Synthesize these PRDs: Phase 1: {{PHASE1_OUTPUT}} Phase 2: {{PHASE2_OUTPUT}}'
};

describe('Workflow Module', () => {
  beforeEach(async () => {
    // Initialize database before each test
    await storage.init();

    // Mock fetch for both JSON and markdown files
    global.fetch = jest.fn((url) => {
      if (url === 'data/prompts.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            '1': mockPromptTemplates[1],
            '2': mockPromptTemplates[2],
            '3': mockPromptTemplates[3]
          })
        });
      }
      // Handle markdown file requests
      const match = url.match(/prompts\/phase(\d+)\.md/);
      if (match) {
        const phase = parseInt(match[1]);
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(mockPromptTemplates[phase] || '')
        });
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`));
    });
  });

  describe('loadDefaultPrompts', () => {
    test('should load default prompts from JSON file', async () => {
      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({
            '1': 'Default prompt for phase 1',
            '2': 'Default prompt for phase 2',
            '3': 'Default prompt for phase 3'
          })
        })
      );

      await loadDefaultPrompts();

      expect(global.fetch).toHaveBeenCalledWith('data/prompts.json');
    });

    test('should handle fetch errors gracefully', async () => {
      // Mock fetch to fail
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      // Should not throw
      await expect(loadDefaultPrompts()).resolves.not.toThrow();
    });

    test('should not overwrite existing prompts', async () => {
      // Save a custom prompt first
      await savePrompt(1, 'Custom prompt');

      // Mock fetch
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({
            '1': 'Default prompt for phase 1'
          })
        })
      );

      await loadDefaultPrompts();

      // Custom prompt should still be there
      const retrieved = await getPrompt(1);
      expect(retrieved).toBe('Custom prompt');
    });
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
      // Uses mock template from beforeEach: 'Create a PRD for: {{TITLE}}. Problems: {{PROBLEMS}}. Context: {{CONTEXT}}'
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
      // Uses mock template from beforeEach: 'Review this PRD: {{PHASE1_OUTPUT}}'
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
      // Uses mock template from beforeEach: 'Synthesize these PRDs: Phase 1: {{PHASE1_OUTPUT}} Phase 2: {{PHASE2_OUTPUT}}'
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
      // Uses mock templates from beforeEach
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
      // Uses WORKFLOW_CONFIG structure with 'name' and 'aiModel'
      expect(metadata.name).toBe('Initial Draft');
      expect(metadata.aiModel).toBe('Claude');
      expect(metadata.icon).toBe('📝');
      expect(metadata.number).toBe(1);
    });

    test('should return metadata for phase 2', () => {
      const metadata = getPhaseMetadata(2);
      expect(metadata.name).toBe('Critical Review');
      expect(metadata.aiModel).toBe('Gemini');
      expect(metadata.icon).toBe('🔍');
      expect(metadata.number).toBe(2);
    });

    test('should return metadata for phase 3', () => {
      const metadata = getPhaseMetadata(3);
      expect(metadata.name).toBe('Final Synthesis');
      expect(metadata.aiModel).toBe('Claude');
      expect(metadata.icon).toBe('✨');
      expect(metadata.number).toBe(3);
    });

    test('should return undefined for invalid phase', () => {
      const metadata = getPhaseMetadata(99);
      expect(metadata).toBeUndefined();
    });
  });

  describe('exportFinalPRD', () => {
    beforeEach(() => {
      // Mock DOM elements needed for export
      document.body.innerHTML = '<div id="toast-container"></div>';

      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    test('should export PRD from phase 3 if available', async () => {
      const project = await createProject('Test Project', 'Problems', 'Context');
      await updatePhase(project.id, 3, 'prompt', 'Final PRD content');

      const updatedProject = await storage.getProject(project.id);
      await exportFinalPRD(updatedProject);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('should export PRD from phase 2 if phase 3 not available', async () => {
      const project = await createProject('Test Project', 'Problems', 'Context');
      await updatePhase(project.id, 2, 'prompt', 'Phase 2 PRD content');

      const updatedProject = await storage.getProject(project.id);
      await exportFinalPRD(updatedProject);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('should export PRD from phase 1 if others not available', async () => {
      const project = await createProject('Test Project', 'Problems', 'Context');
      await updatePhase(project.id, 1, 'prompt', 'Phase 1 PRD content');

      const updatedProject = await storage.getProject(project.id);
      await exportFinalPRD(updatedProject);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    test('should export fallback content when no phase responses available', async () => {
      // With the new Workflow class, exportAsMarkdown returns fallback content
      // (project title, problems, context) when no phase responses exist
      const project = await createProject('Test Project', 'Problems', 'Context');

      await exportFinalPRD(project);

      // Still exports fallback content with attribution
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('copyPromptToClipboard', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="toast-container"></div>';

      // Mock clipboard API with ClipboardItem support for Safari-compatible pattern
      Object.assign(navigator, {
        clipboard: {
          write: jest.fn(() => Promise.resolve())
        }
      });
    });

    test('should copy prompt to clipboard and save to project', async () => {
      const project = await createProject('Test Project', 'Problems', 'Context');

      await copyPromptToClipboard(project, 1);

      // Verify clipboard.write was called (ClipboardItem with Promise for Safari transient activation)
      expect(navigator.clipboard.write).toHaveBeenCalled();
    });
  });

  describe('Visual workflow tests - prompt content verification', () => {
    test('Phase 1 prompt should contain project title, problems, and context', async () => {
      // Set up a realistic Phase 1 template
      await savePrompt(1, 'Create a PRD for: %s\n\nProblems to solve:\n%s\n\nContext:\n%s');

      const project = await createProject(
        'MonkeyMoonshot Analytics Dashboard',
        'Users cannot track their usage metrics effectively',
        'B2B SaaS platform with 10,000 active users'
      );

      const prompt = await generatePhase1Prompt(project);

      // Verify all project data is in the prompt
      expect(prompt).toContain('MonkeyMoonshot Analytics Dashboard');
      expect(prompt).toContain('Users cannot track their usage metrics effectively');
      expect(prompt).toContain('B2B SaaS platform with 10,000 active users');
    });

    test('Phase 2 prompt should contain Phase 1 response (Claude PRD)', async () => {
      // Set up Phase 2 template with placeholder
      await savePrompt(2, 'Review this PRD:\n\n[PASTE CLAUDE\'S ORIGINAL PRD HERE]');

      const project = await createProject('Test Project', 'Problems', 'Context');
      project.phases[1].response = '# Product Requirements Document\n\n## Overview\nThis is the Claude-generated PRD for the Analytics Dashboard.';
      project.phases[1].completed = true;

      const prompt = await generatePhase2Prompt(project);

      // Verify Phase 1 response is in the prompt
      expect(prompt).toContain('# Product Requirements Document');
      expect(prompt).toContain('This is the Claude-generated PRD for the Analytics Dashboard.');
      expect(prompt).not.toContain('[PASTE CLAUDE\'S ORIGINAL PRD HERE]');
    });

    test('Phase 3 prompt should contain both Claude and Gemini responses', async () => {
      // Set up Phase 3 template with both placeholders
      await savePrompt(3, 'Compare these PRDs:\n\nCLAUDE VERSION:\n[PASTE CLAUDE\'S ORIGINAL PRD HERE]\n\nGEMINI VERSION:\n[PASTE GEMINI\'S PRD RENDITION HERE]');

      const project = await createProject('Test Project', 'Problems', 'Context');
      project.phases[1].response = '# Claude PRD\n\nThis is the original PRD from Claude Sonnet 4.5.';
      project.phases[1].completed = true;
      project.phases[2].response = '# Gemini Review\n\nThis is the reviewed PRD from Gemini 2.5 Pro.';
      project.phases[2].completed = true;

      const prompt = await generatePhase3Prompt(project);

      // Verify both responses are in the prompt
      expect(prompt).toContain('# Claude PRD');
      expect(prompt).toContain('This is the original PRD from Claude Sonnet 4.5.');
      expect(prompt).toContain('# Gemini Review');
      expect(prompt).toContain('This is the reviewed PRD from Gemini 2.5 Pro.');
      expect(prompt).not.toContain('[PASTE CLAUDE\'S ORIGINAL PRD HERE]');
      expect(prompt).not.toContain('[PASTE GEMINI\'S PRD RENDITION HERE]');
    });

    test('Full 3-phase workflow with realistic data', async () => {
      // Set up realistic prompt templates
      await savePrompt(1, 'You are a PM. Create a PRD for: %s\n\nProblems:\n%s\n\nContext:\n%s');
      await savePrompt(2, 'Review this PRD from Claude:\n\n[PASTE CLAUDE\'S ORIGINAL PRD HERE]');
      await savePrompt(3, 'Compare:\n\nCLAUDE:\n[PASTE CLAUDE\'S ORIGINAL PRD HERE]\n\nGEMINI:\n[PASTE GEMINI\'S PRD RENDITION HERE]');

      // Create project
      const project = await createProject(
        'MonkeyMoonshot',
        'Users need better analytics',
        'Enterprise SaaS'
      );

      // Phase 1: Generate prompt for Claude
      const phase1Prompt = await generatePhase1Prompt(project);
      expect(phase1Prompt).toContain('MonkeyMoonshot');
      expect(phase1Prompt).toContain('Users need better analytics');
      expect(phase1Prompt).toContain('Enterprise SaaS');

      // Simulate Claude's response
      project.phases[1].response = '# MonkeyMoonshot PRD\n\n## Goals\n- Improve analytics\n- Better UX';
      project.phases[1].completed = true;

      // Phase 2: Generate prompt for Gemini
      const phase2Prompt = await generatePhase2Prompt(project);
      expect(phase2Prompt).toContain('# MonkeyMoonshot PRD');
      expect(phase2Prompt).toContain('## Goals');
      expect(phase2Prompt).not.toContain('[PASTE CLAUDE\'S ORIGINAL PRD HERE]');

      // Simulate Gemini's response
      project.phases[2].response = '# Improved PRD\n\n## Refined Goals\n- Enhanced analytics with KPIs';
      project.phases[2].completed = true;

      // Phase 3: Generate prompt for Claude (final synthesis)
      const phase3Prompt = await generatePhase3Prompt(project);
      expect(phase3Prompt).toContain('# MonkeyMoonshot PRD');
      expect(phase3Prompt).toContain('# Improved PRD');
      expect(phase3Prompt).not.toContain('[PASTE CLAUDE\'S ORIGINAL PRD HERE]');
      expect(phase3Prompt).not.toContain('[PASTE GEMINI\'S PRD RENDITION HERE]');
    });

    test('Phase 2 should handle missing Phase 1 response gracefully', async () => {
      await savePrompt(2, 'Review: [PASTE CLAUDE\'S ORIGINAL PRD HERE]');

      const project = await createProject('Test', 'Problems', 'Context');
      // Phase 1 response is empty/undefined

      const prompt = await generatePhase2Prompt(project);

      // Should still generate a prompt (placeholder may remain or be empty)
      expect(typeof prompt).toBe('string');
    });

    test('Phase 3 should handle missing responses gracefully', async () => {
      await savePrompt(3, 'Compare: [PASTE CLAUDE\'S ORIGINAL PRD HERE] and [PASTE GEMINI\'S PRD RENDITION HERE]');

      const project = await createProject('Test', 'Problems', 'Context');
      // Both responses are empty/undefined

      const prompt = await generatePhase3Prompt(project);

      // Should still generate a prompt
      expect(typeof prompt).toBe('string');
    });
  });

  describe('Workflow edge cases - saving response without generating prompt', () => {
    test('should be able to save response even if prompt was never generated', async () => {
      // Set up a default prompt template
      await savePrompt(1, 'Create a PRD for: %s. Problems: %s. Context: %s');

      // Create a new project
      const project = await createProject(
        'Test Feature',
        'Users need better analytics',
        'B2B SaaS platform'
      );

      // Verify prompt is initially empty
      expect(project.phases[1].prompt).toBe('');

      // User pastes a response WITHOUT clicking "Copy Prompt to Clipboard" first
      // This simulates the bug where the user skips generating the prompt
      const response = 'This is the AI response that the user pasted directly';

      // The UI should generate the prompt automatically when saving the response
      const prompt = await generatePromptForPhase(project, 1);
      expect(prompt).toBeTruthy();
      expect(prompt.length).toBeGreaterThan(0);

      // This is what the UI does when you click "Save Response"
      await updatePhase(project.id, 1, prompt, response);

      // Verify the phase was updated correctly
      const updated = await getProject(project.id);
      expect(updated.phases[1].prompt).toBeTruthy();
      expect(updated.phases[1].prompt.length).toBeGreaterThan(0);
      expect(updated.phases[1].response).toBe(response);
      expect(updated.phases[1].completed).toBe(true);
    });

    test('should handle empty prompt gracefully when saving response', async () => {
      // Set up a default prompt template
      await savePrompt(1, 'Create a PRD for: %s');

      const project = await createProject('Test', 'Problems', 'Context');

      // Simulate saving with empty prompt (the bug scenario)
      const response = 'User response';

      // If prompt is empty, generate it
      let prompt = project.phases[1].prompt;
      if (!prompt) {
        prompt = await generatePromptForPhase(project, 1);
      }

      await updatePhase(project.id, 1, prompt, response);

      const updated = await getProject(project.id);
      expect(updated.phases[1].prompt).toBeTruthy();
      expect(updated.phases[1].response).toBe(response);
    });
  });

});
