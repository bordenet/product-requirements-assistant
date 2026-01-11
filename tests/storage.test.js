import storage from '../js/storage.js';

describe('Storage Module', () => {
  beforeEach(async () => {
    // Initialize database before each test
    await storage.init();
  });

  describe('init', () => {
    test('should initialize database successfully', async () => {
      await storage.init();
      expect(storage.db).toBeTruthy();
      expect(storage.db.name).toBe('prd-assistant');
    });

    test('should create required object stores', async () => {
      await storage.init();
      expect(storage.db.objectStoreNames.contains('projects')).toBe(true);
      expect(storage.db.objectStoreNames.contains('prompts')).toBe(true);
      expect(storage.db.objectStoreNames.contains('settings')).toBe(true);
    });
  });

  describe('saveProject and getProject', () => {
    test('should save and retrieve a project', async () => {
      const project = {
        id: crypto.randomUUID(),
        title: 'Test PRD',
        problems: 'Test problems',
        context: 'Test context',
        phase: 1,
        createdAt: new Date().toISOString(),
        phases: {
          1: { prompt: '', response: '', completed: false },
          2: { prompt: '', response: '', completed: false },
          3: { prompt: '', response: '', completed: false }
        }
      };

      await storage.saveProject(project);
      const retrieved = await storage.getProject(project.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved.id).toBe(project.id);
      expect(retrieved.title).toBe(project.title);
      expect(retrieved.problems).toBe(project.problems);
      expect(retrieved.context).toBe(project.context);
    });

    test('should update updatedAt timestamp on save', async () => {
      const project = {
        id: crypto.randomUUID(),
        title: 'Test PRD',
        problems: 'Test problems',
        context: 'Test context',
        phase: 1,
        createdAt: new Date().toISOString(),
        phases: {}
      };

      await storage.saveProject(project);
      const firstSave = await storage.getProject(project.id);
      const firstUpdatedAt = firstSave.updatedAt;

      // Wait a bit and save again
      await new Promise(resolve => setTimeout(resolve, 10));
      await storage.saveProject(project);
      const secondSave = await storage.getProject(project.id);

      expect(secondSave.updatedAt).not.toBe(firstUpdatedAt);
    });

    test('should return undefined for non-existent project', async () => {
      const retrieved = await storage.getProject('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllProjects', () => {
    test('should return empty array when no projects exist', async () => {
      const projects = await storage.getAllProjects();
      expect(Array.isArray(projects)).toBe(true);
    });

    test('should return all saved projects', async () => {
      const project1 = {
        id: crypto.randomUUID(),
        title: 'PRD 1',
        problems: 'Problems 1',
        context: 'Context 1',
        phase: 1,
        createdAt: new Date().toISOString(),
        phases: {}
      };

      const project2 = {
        id: crypto.randomUUID(),
        title: 'PRD 2',
        problems: 'Problems 2',
        context: 'Context 2',
        phase: 1,
        createdAt: new Date().toISOString(),
        phases: {}
      };

      await storage.saveProject(project1);
      await storage.saveProject(project2);

      const projects = await storage.getAllProjects();
      expect(projects.length).toBeGreaterThanOrEqual(2);

      const ids = projects.map(p => p.id);
      expect(ids).toContain(project1.id);
      expect(ids).toContain(project2.id);
    });

    test('should sort projects by updatedAt (newest first)', async () => {
      const project1 = {
        id: crypto.randomUUID(),
        title: 'Old PRD',
        problems: 'Problems',
        context: 'Context',
        phase: 1,
        createdAt: new Date().toISOString(),
        phases: {}
      };

      await storage.saveProject(project1);

      // Wait to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 100));

      const project2 = {
        id: crypto.randomUUID(),
        title: 'New PRD',
        problems: 'Problems',
        context: 'Context',
        phase: 1,
        createdAt: new Date().toISOString(),
        phases: {}
      };

      await storage.saveProject(project2);

      const projects = await storage.getAllProjects();
      const project2Index = projects.findIndex(p => p.id === project2.id);
      const project1Index = projects.findIndex(p => p.id === project1.id);

      expect(project2Index).toBeLessThan(project1Index);
    });
  });

  describe('deleteProject', () => {
    test('should delete a project', async () => {
      const project = {
        id: crypto.randomUUID(),
        title: 'Test PRD',
        problems: 'Test problems',
        context: 'Test context',
        phase: 1,
        createdAt: new Date().toISOString(),
        phases: {}
      };

      await storage.saveProject(project);
      await storage.deleteProject(project.id);
      const retrieved = await storage.getProject(project.id);

      expect(retrieved).toBeUndefined();
    });
  });

  describe('savePrompt and getPrompt', () => {
    test('should save and retrieve a prompt', async () => {
      const phase = 1;
      const content = 'Test prompt content for phase 1';

      await storage.savePrompt(phase, content);
      const retrieved = await storage.getPrompt(phase);

      expect(retrieved).toBe(content);
    });

    test('should return null for non-existent prompt', async () => {
      const retrieved = await storage.getPrompt(999);
      expect(retrieved).toBeNull();
    });

    test('should update existing prompt', async () => {
      const phase = 2;
      const content1 = 'First version';
      const content2 = 'Second version';

      await storage.savePrompt(phase, content1);
      await storage.savePrompt(phase, content2);
      const retrieved = await storage.getPrompt(phase);

      expect(retrieved).toBe(content2);
    });
  });

  describe('saveSetting and getSetting', () => {
    test('should save and retrieve a setting', async () => {
      const key = 'apiKey';
      const value = 'test-api-key-123';

      await storage.saveSetting(key, value);
      const retrieved = await storage.getSetting(key);

      expect(retrieved).toBe(value);
    });

    test('should return undefined for non-existent setting', async () => {
      const retrieved = await storage.getSetting('non-existent-key');
      expect(retrieved).toBeUndefined();
    });

    test('should update existing setting', async () => {
      const key = 'theme';
      const value1 = 'light';
      const value2 = 'dark';

      await storage.saveSetting(key, value1);
      await storage.saveSetting(key, value2);
      const retrieved = await storage.getSetting(key);

      expect(retrieved).toBe(value2);
    });
  });

  describe('getStorageEstimate', () => {
    test('should return storage estimate or null', async () => {
      const estimate = await storage.getStorageEstimate();
      // May be null if not supported, or an object with usage/quota
      if (estimate !== null) {
        expect(typeof estimate).toBe('object');
      }
    });
  });
});
