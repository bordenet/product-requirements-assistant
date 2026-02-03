import { initRouter, navigateTo, getCurrentRoute, updateStorageInfo } from '../js/router.js';
import storage from '../js/storage.js';
import { createProject, deleteProject, getAllProjects } from '../js/projects.js';

describe('Router Module', () => {
  beforeEach(async () => {
    // Initialize database
    await storage.init();

    // Clear all projects
    const allProjects = await getAllProjects();
    for (const project of allProjects) {
      await deleteProject(project.id);
    }

    // Set up DOM
    document.body.innerHTML = '<div id="app-container"></div><span id="storage-info"></span><div id="toast-container"></div>';

    // Reset hash
    window.location.hash = '';
  });

  describe('navigateTo', () => {
    test('should navigate to home route', async () => {
      await navigateTo('home');
      const { route } = getCurrentRoute();
      expect(route).toBe('home');
    });

    test('should navigate to new-project route', async () => {
      await navigateTo('new-project');
      const { route } = getCurrentRoute();
      expect(route).toBe('new-project');
    });

    test('should navigate to project route with ID', async () => {
      const project = await createProject('Test PRD', 'Problems', 'Context');
      await navigateTo('project', project.id);
      const { route, params } = getCurrentRoute();
      expect(route).toBe('project');
      expect(params[0]).toBe(project.id);
    });

    test('should update URL hash for home', async () => {
      await navigateTo('home');
      expect(window.location.hash).toBe('');
    });

    test('should update URL hash for new-project', async () => {
      await navigateTo('new-project');
      expect(window.location.hash).toBe('#new');
    });

    test('should update URL hash for project', async () => {
      const project = await createProject('Test PRD', 'Problems', 'Context');
      await navigateTo('project', project.id);
      expect(window.location.hash).toBe(`#project/${project.id}`);
    });

    test('should update URL hash for edit-project', async () => {
      const project = await createProject('Test PRD', 'Problems', 'Context');
      await navigateTo('edit-project', project.id);
      expect(window.location.hash).toBe(`#edit/${project.id}`);
    });
  });

  describe('getCurrentRoute', () => {
    test('should return current route and params after navigation', async () => {
      const project = await createProject('Test PRD', 'Problems', 'Context');
      await navigateTo('project', project.id);
      const { route, params } = getCurrentRoute();
      expect(route).toBe('project');
      expect(params).toContain(project.id);
    });
  });

  describe('initRouter', () => {
    test('should handle empty hash on init', () => {
      window.location.hash = '';
      initRouter();
      // Should navigate to home by default
      const { route } = getCurrentRoute();
      expect(route).toBe('home');
    });

    test('should handle new hash on init', () => {
      window.location.hash = '#new';
      initRouter();
      const { route } = getCurrentRoute();
      expect(route).toBe('new-project');
    });

    test('should handle project hash on init', () => {
      window.location.hash = '#project/test-123';
      initRouter();
      const { route, params } = getCurrentRoute();
      expect(route).toBe('project');
      expect(params[0]).toBe('test-123');
    });

    test('should handle edit hash on init', () => {
      window.location.hash = '#edit/test-456';
      initRouter();
      const { route, params } = getCurrentRoute();
      expect(route).toBe('edit-project');
      expect(params[0]).toBe('test-456');
    });
  });

  describe('updateStorageInfo', () => {
    test('should update storage info element', async () => {
      await updateStorageInfo();

      const storageInfo = document.getElementById('storage-info');
      expect(storageInfo.textContent).toBeTruthy();
    });

    test('should handle missing storage info element gracefully', async () => {
      document.getElementById('storage-info').remove();

      // Should not throw
      await expect(updateStorageInfo()).resolves.not.toThrow();
    });
  });
});
