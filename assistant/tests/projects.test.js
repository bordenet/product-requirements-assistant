import { createProject, getAllProjects, getProject, updatePhase, updateProject, deleteProject, importProjects, exportProject, exportAllProjects, extractTitleFromMarkdown } from '../js/projects.js';
import storage from '../js/storage.js';

describe('Projects Module', () => {
  beforeEach(async () => {
    // Initialize database before each test
    await storage.init();
  });

  describe('createProject', () => {
    test('should create a new project with correct structure', async () => {
      const title = 'Test PRD';
      const problems = 'Problem statement';
      const context = 'Context information';

      const project = await createProject({ title, problems, context });

      expect(project).toBeTruthy();
      expect(project.id).toBeTruthy();
      expect(project.title).toBe(title);
      expect(project.problems).toBe(problems);
      expect(project.context).toBe(context);
      expect(project.phase).toBe(1);
      expect(project.createdAt).toBeTruthy();
      expect(project.updatedAt).toBeTruthy();
      expect(project.phases).toBeTruthy();
      expect(project.phases[1]).toBeTruthy();
      expect(project.phases[2]).toBeTruthy();
      expect(project.phases[3]).toBeTruthy();
    });

    test('should trim whitespace from inputs', async () => {
      const project = await createProject({ title: '  Title  ', problems: '  Problems  ', context: '  Context  ' });

      expect(project.title).toBe('Title');
      expect(project.problems).toBe('Problems');
      expect(project.context).toBe('Context');
    });

    test('should initialize all phases as incomplete', async () => {
      const project = await createProject({ title: 'Test', problems: 'Problems', context: 'Context' });

      expect(project.phases[1].completed).toBe(false);
      expect(project.phases[2].completed).toBe(false);
      expect(project.phases[3].completed).toBe(false);
    });

    test('should save project to storage', async () => {
      const project = await createProject({ title: 'Test', problems: 'Problems', context: 'Context' });
      const retrieved = await storage.getProject(project.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved.id).toBe(project.id);
    });
  });

  describe('getAllProjects', () => {
    test('should return all projects', async () => {
      await createProject({ title: 'PRD 1', problems: 'Problems 1', context: 'Context 1' });
      await createProject({ title: 'PRD 2', problems: 'Problems 2', context: 'Context 2' });

      const projects = await getAllProjects();

      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getProject', () => {
    test('should retrieve a specific project', async () => {
      const created = await createProject({ title: 'Test PRD', problems: 'Problems', context: 'Context' });
      const retrieved = await getProject(created.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.title).toBe(created.title);
    });

    test('should return undefined for non-existent project', async () => {
      const retrieved = await getProject('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('updatePhase', () => {
    test('should update phase data', async () => {
      const project = await createProject({ title: 'Test PRD', problems: 'Problems', context: 'Context' });
      const prompt = 'Test prompt';
      const response = 'Test response';

      await updatePhase(project.id, 1, prompt, response);
      const updated = await getProject(project.id);

      expect(updated.phases[1].prompt).toBe(prompt);
      expect(updated.phases[1].response).toBe(response);
    });

    test('should throw error for non-existent project', async () => {
      await expect(updatePhase('non-existent-id', 1, 'prompt', 'response'))
        .rejects.toThrow('Project not found');
    });
  });

  describe('updatePhase with completion', () => {
    test('should mark phase as completed when response is provided', async () => {
      const project = await createProject({ title: 'Test PRD', problems: 'Problems', context: 'Context' });
      await updatePhase(project.id, 1, 'prompt', 'response');

      const updated = await getProject(project.id);

      expect(updated.phases[1].completed).toBe(true);
      expect(updated.phases[1].response).toBe('response');
    });

    test('should advance to next phase when response is provided', async () => {
      const project = await createProject({ title: 'Test PRD', problems: 'Problems', context: 'Context' });
      await updatePhase(project.id, 1, 'prompt', 'response');

      const updated = await getProject(project.id);

      expect(updated.phase).toBe(2);
    });

    test('should not advance beyond phase 3', async () => {
      const project = await createProject({ title: 'Test PRD', problems: 'Problems', context: 'Context' });

      // Complete phase 1 and 2 to get to phase 3
      await updatePhase(project.id, 1, 'prompt1', 'response1');
      await updatePhase(project.id, 2, 'prompt2', 'response2');

      // Now complete phase 3
      await updatePhase(project.id, 3, 'prompt3', 'response3');

      const updated = await getProject(project.id);

      expect(updated.phase).toBe(3); // Should stay at 3, not advance to 4
    });
  });

  describe('deleteProject', () => {
    test('should delete a project', async () => {
      const project = await createProject({ title: 'Test PRD', problems: 'Problems', context: 'Context' });
      await deleteProject(project.id);
      const retrieved = await getProject(project.id);

      expect(retrieved).toBeUndefined();
    });
  });

  describe('importProjects', () => {
    test('should import project from JSON file', async () => {
      const original = await createProject({ title: 'Test PRD', problems: 'Problems', context: 'Context' });

      // Create a mock File object
      const jsonContent = JSON.stringify(original);
      const file = new File([jsonContent], 'project.json', { type: 'application/json' });

      // Delete original
      await storage.deleteProject(original.id);

      // Import
      const imported = await importProjects(file);

      expect(imported).toBe(1);

      // Verify it was imported
      const retrieved = await getProject(original.id);
      expect(retrieved).toBeTruthy();
      expect(retrieved.title).toBe(original.title);
    });

    test('should import multiple projects from backup file', async () => {
      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        projects: [
          await createProject({ title: 'Project 1', problems: 'Problems 1', context: 'Context 1' }),
          await createProject({ title: 'Project 2', problems: 'Problems 2', context: 'Context 2' })
        ]
      };

      const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
      const file = new File([blob], 'backup.json', { type: 'application/json' });

      const imported = await importProjects(file);

      expect(imported).toBe(2);
    });

    test('should reject invalid file format', async () => {
      const invalidData = { invalid: 'data' };
      const blob = new Blob([JSON.stringify(invalidData)], { type: 'application/json' });
      const file = new File([blob], 'invalid.json', { type: 'application/json' });

      await expect(importProjects(file)).rejects.toThrow('Invalid file format');
    });

    test('should reject malformed JSON', async () => {
      const blob = new Blob(['not valid json'], { type: 'application/json' });
      const file = new File([blob], 'malformed.json', { type: 'application/json' });

      await expect(importProjects(file)).rejects.toThrow();
    });

    test('should handle empty backup file', async () => {
      const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        projectCount: 0,
        projects: []
      };

      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
      const file = new File([blob], 'empty-backup.json', { type: 'application/json' });

      const importedCount = await importProjects(file);
      expect(importedCount).toBe(0);
    });
  });

  describe('updateProject', () => {
    test('should update project fields', async () => {
      const project = await createProject({ title: 'Original Title', problems: 'Problems', context: 'Context' });

      const updated = await updateProject(project.id, {
        title: 'Updated Title',
        problems: 'Updated Problems'
      });

      expect(updated.title).toBe('Updated Title');
      expect(updated.problems).toBe('Updated Problems');
      expect(updated.context).toBe('Context'); // Unchanged
    });

    test('should throw error for non-existent project', async () => {
      await expect(updateProject('non-existent-id', { title: 'Test' }))
        .rejects.toThrow('Project not found');
    });
  });

  describe('exportProject', () => {
    let capturedBlob;
    let originalCreateElement;

    beforeEach(() => {
      capturedBlob = null;
      global.URL.createObjectURL = jest.fn((blob) => {
        capturedBlob = blob;
        return 'blob:mock-url';
      });
      global.URL.revokeObjectURL = jest.fn();
      originalCreateElement = document.createElement.bind(document);
    });

    afterEach(() => {
      document.createElement = originalCreateElement;
    });

    test('should export single project as JSON', async () => {
      const project = await createProject({ title: 'Export Test', problems: 'Problems', context: 'Context' });

      await exportProject(project.id);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('should include correct project data in blob', async () => {
      const project = await createProject({ title: 'Blob Test', problems: 'Test Problems', context: 'Test Context' });

      await exportProject(project.id);

      expect(capturedBlob).toBeInstanceOf(Blob);

      // Use FileReader to read the blob content
      const blobContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(capturedBlob);
      });

      const exportedData = JSON.parse(blobContent);
      expect(exportedData.id).toBe(project.id);
      expect(exportedData.title).toBe('Blob Test');
    });

    test('should throw error for non-existent project', async () => {
      await expect(exportProject('non-existent-id'))
        .rejects.toThrow('Project not found');
    });
  });

  describe('exportAllProjects', () => {
    let capturedBlob;
    let capturedDownloadName;
    let originalCreateElement;

    beforeEach(() => {
      capturedBlob = null;
      capturedDownloadName = null;
      global.URL.createObjectURL = jest.fn((blob) => {
        capturedBlob = blob;
        return 'blob:mock-url';
      });
      global.URL.revokeObjectURL = jest.fn();
      originalCreateElement = document.createElement.bind(document);
    });

    afterEach(() => {
      document.createElement = originalCreateElement;
    });

    test('should export all projects as backup JSON', async () => {
      await createProject({ title: 'Project 1', problems: 'Problems 1', context: 'Context 1' });
      await createProject({ title: 'Project 2', problems: 'Problems 2', context: 'Context 2' });

      await exportAllProjects();

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('should include all projects in backup with correct format', async () => {
      // Clear all existing projects first
      const existingProjects = await getAllProjects();
      for (const p of existingProjects) {
        await deleteProject(p.id);
      }

      await createProject({ title: 'Test Project 1', problems: 'Problems 1', context: 'Context 1' });
      await createProject({ title: 'Test Project 2', problems: 'Problems 2', context: 'Context 2' });

      await exportAllProjects();

      expect(capturedBlob).toBeInstanceOf(Blob);

      // Use FileReader to read the blob content
      const blobContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(capturedBlob);
      });

      const backupData = JSON.parse(blobContent);
      expect(backupData).toHaveProperty('version');
      expect(backupData).toHaveProperty('exportedAt');
      expect(backupData).toHaveProperty('projectCount', 2);
      expect(backupData).toHaveProperty('projects');
      expect(Array.isArray(backupData.projects)).toBe(true);
      expect(backupData.projects).toHaveLength(2);
    });

    test('should include correct filename with date', async () => {
      const mockAnchor = {
        href: '',
        set download(value) { capturedDownloadName = value; },
        get download() { return capturedDownloadName; },
        click: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') return mockAnchor;
        return originalCreateElement(tag);
      });

      await createProject({ title: 'Test', problems: 'Problems', context: 'Context' });
      await exportAllProjects();

      expect(capturedDownloadName).toMatch(/^prd-assistant-backup-\d{4}-\d{2}-\d{2}\.json$/);
    });

    test('should export empty backup if no projects', async () => {
      // Clear all projects
      const projects = await getAllProjects();
      for (const project of projects) {
        await deleteProject(project.id);
      }

      await exportAllProjects();

      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  // =================================================================
  // extractTitleFromMarkdown Tests
  // =================================================================
  describe('extractTitleFromMarkdown', () => {
    test('should return empty string for null input', () => {
      expect(extractTitleFromMarkdown(null)).toBe('');
    });

    test('should return empty string for empty input', () => {
      expect(extractTitleFromMarkdown('')).toBe('');
    });

    test('should extract H1 header', () => {
      const md = '# My Document Title\n\nSome content here.';
      expect(extractTitleFromMarkdown(md)).toBe('My Document Title');
    });

    test('should skip PRESS RELEASE header', () => {
      const md = '# PRESS RELEASE\n\n**Exciting Headline Here**\n\nContent...';
      expect(extractTitleFromMarkdown(md)).toBe('Exciting Headline Here');
    });

    test('should extract bold headline after PRESS RELEASE', () => {
      const md = '# PRESS RELEASE\n**Company Announces New Feature**\n\nDetails follow.';
      expect(extractTitleFromMarkdown(md)).toBe('Company Announces New Feature');
    });

    test('should extract first bold line as fallback', () => {
      const md = 'Some text\n**This Is A Good Headline Title**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('This Is A Good Headline Title');
    });

    test('should reject too-short bold text', () => {
      const md = '**Short**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('');
    });

    test('should reject bold text ending with period (sentences)', () => {
      const md = '**This is a sentence ending with period.**\n\nMore content.';
      expect(extractTitleFromMarkdown(md)).toBe('');
    });
  });
});
