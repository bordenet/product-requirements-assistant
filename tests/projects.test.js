import { createProject, getAllProjects, getProject, updatePhase, updateProject, deleteProject, importProjects, exportProject, exportAllProjects } from '../js/projects.js';
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

      const project = await createProject(title, problems, context);

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
      const project = await createProject('  Title  ', '  Problems  ', '  Context  ');

      expect(project.title).toBe('Title');
      expect(project.problems).toBe('Problems');
      expect(project.context).toBe('Context');
    });

    test('should initialize all phases as incomplete', async () => {
      const project = await createProject('Test', 'Problems', 'Context');

      expect(project.phases[1].completed).toBe(false);
      expect(project.phases[2].completed).toBe(false);
      expect(project.phases[3].completed).toBe(false);
    });

    test('should save project to storage', async () => {
      const project = await createProject('Test', 'Problems', 'Context');
      const retrieved = await storage.getProject(project.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved.id).toBe(project.id);
    });
  });

  describe('getAllProjects', () => {
    test('should return all projects', async () => {
      await createProject('PRD 1', 'Problems 1', 'Context 1');
      await createProject('PRD 2', 'Problems 2', 'Context 2');

      const projects = await getAllProjects();

      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getProject', () => {
    test('should retrieve a specific project', async () => {
      const created = await createProject('Test PRD', 'Problems', 'Context');
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
      const project = await createProject('Test PRD', 'Problems', 'Context');
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
      const project = await createProject('Test PRD', 'Problems', 'Context');
      await updatePhase(project.id, 1, 'prompt', 'response');

      const updated = await getProject(project.id);

      expect(updated.phases[1].completed).toBe(true);
      expect(updated.phases[1].response).toBe('response');
    });

    test('should advance to next phase when response is provided', async () => {
      const project = await createProject('Test PRD', 'Problems', 'Context');
      await updatePhase(project.id, 1, 'prompt', 'response');

      const updated = await getProject(project.id);

      expect(updated.phase).toBe(2);
    });

    test('should not advance beyond phase 3', async () => {
      const project = await createProject('Test PRD', 'Problems', 'Context');

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
      const project = await createProject('Test PRD', 'Problems', 'Context');
      await deleteProject(project.id);
      const retrieved = await getProject(project.id);

      expect(retrieved).toBeUndefined();
    });
  });

  describe('importProjects', () => {
    test('should import project from JSON file', async () => {
      const original = await createProject('Test PRD', 'Problems', 'Context');

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
          await createProject('Project 1', 'Problems 1', 'Context 1'),
          await createProject('Project 2', 'Problems 2', 'Context 2')
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
  });

  describe('updateProject', () => {
    test('should update project fields', async () => {
      const project = await createProject('Original Title', 'Problems', 'Context');

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
    beforeEach(() => {
      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    test('should export single project as JSON', async () => {
      const project = await createProject('Export Test', 'Problems', 'Context');

      await exportProject(project.id);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('should throw error for non-existent project', async () => {
      await expect(exportProject('non-existent-id'))
        .rejects.toThrow('Project not found');
    });
  });

  describe('exportAllProjects', () => {
    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = jest.fn();
    });

    test('should export all projects as backup JSON', async () => {
      await createProject('Project 1', 'Problems 1', 'Context 1');
      await createProject('Project 2', 'Problems 2', 'Context 2');

      await exportAllProjects();

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
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
});
