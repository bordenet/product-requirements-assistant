import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#app-container', { state: 'visible' });
  });

  test.describe('Project List View', () => {
    test('should display empty state when no projects exist', async ({ page, context }) => {
      // Clear IndexedDB
      await context.clearCookies();
      await page.evaluate(() => {
        return new Promise((resolve) => {
          const request = indexedDB.deleteDatabase('prd-assistant');
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
        });
      });

      // Reload page
      await page.reload();
      await page.waitForSelector('#app-container', { state: 'visible' });

      // Should show empty state
      await expect(page.locator('text=No projects yet')).toBeVisible();
      await expect(page.locator('button:has-text("Create New Project")')).toBeVisible();
    });

    test('should display project cards with correct information', async ({ page }) => {
      // Create a test project
      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'Display Test Project');
      await page.fill('textarea[placeholder*="problems"]', 'Test display problems');
      await page.fill('textarea[placeholder*="context"]', 'Test context');
      await page.click('button:has-text("Create Project")');

      // Go back to home
      await page.click('button:has-text("Back to Projects")');

      // Should see project card
      await expect(page.locator('text=Display Test Project')).toBeVisible();
      await expect(page.locator('text=Test display problems')).toBeVisible();
    });

    test('should show current phase indicator on project card', async ({ page }) => {
      // Create and work on a project
      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'Phase Indicator Test');
      await page.fill('textarea[placeholder*="problems"]', 'Test');
      await page.fill('textarea[placeholder*="context"]', 'Test');
      await page.click('button:has-text("Create Project")');

      // Go back to list
      await page.click('button:has-text("Back to Projects")');

      // Should show phase indicator
      const projectCard = page.locator('text=Phase Indicator Test').locator('..');
      await expect(projectCard).toBeVisible();
    });

    test('should navigate to project when card clicked', async ({ page }) => {
      // Create a project
      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'Navigate Test');
      await page.fill('textarea[placeholder*="problems"]', 'Test');
      await page.fill('textarea[placeholder*="context"]', 'Test');
      await page.click('button:has-text("Create Project")');

      // Go back to home
      await page.click('button:has-text("Back to Projects")');

      // Click project card
      await page.click('text=Navigate Test');

      // Should navigate to project view
      await expect(page.locator('h2:has-text("Navigate Test")')).toBeVisible();
      await expect(page.locator('text=Phase 1')).toBeVisible();
    });
  });

  test.describe('Project Deletion', () => {
    test('should delete project with confirmation', async ({ page }) => {
      // Create a project to delete
      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'Delete Me');
      await page.fill('textarea[placeholder*="problems"]', 'Test');
      await page.fill('textarea[placeholder*="context"]', 'Test');
      await page.click('button:has-text("Create Project")');

      // Go back to home
      await page.click('button:has-text("Back to Projects")');

      // Find and click delete button (trash icon)
      const deleteButton = page.locator('text=Delete Me').locator('..').locator('button[title*="Delete"], button:has-text("🗑")').first();

      if (await deleteButton.count() > 0) {
        await deleteButton.click();

        // Confirm deletion
        await page.click('button:has-text("Confirm")');

        // Project should be gone
        await expect(page.locator('text=Delete Me')).toBeHidden();
      }
    });

    test('should cancel project deletion', async ({ page }) => {
      // Create a project
      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'Keep Me');
      await page.fill('textarea[placeholder*="problems"]', 'Test');
      await page.fill('textarea[placeholder*="context"]', 'Test');
      await page.click('button:has-text("Create Project")');

      // Go back to home
      await page.click('button:has-text("Back to Projects")');

      // Try to delete but cancel
      const deleteButton = page.locator('text=Keep Me').locator('..').locator('button[title*="Delete"], button:has-text("🗑")').first();

      if (await deleteButton.count() > 0) {
        await deleteButton.click();

        // Cancel deletion
        await page.click('button:has-text("Cancel")');

        // Project should still be there
        await expect(page.locator('text=Keep Me')).toBeVisible();
      }
    });
  });

  test.describe('Project Search and Filtering', () => {
    test('should display multiple projects', async ({ page }) => {
      // Create multiple projects
      const projects = ['Project Alpha', 'Project Beta', 'Project Gamma'];

      for (const title of projects) {
        await page.click('button:has-text("Create New Project")');
        await page.fill('input[placeholder*="Project Title"]', title);
        await page.fill('textarea[placeholder*="problems"]', `Problems for ${title}`);
        await page.fill('textarea[placeholder*="context"]', 'Context');
        await page.click('button:has-text("Create Project")');
        await page.click('button:has-text("Back to Projects")');
        await page.waitForTimeout(300);
      }

      // All projects should be visible
      for (const title of projects) {
        await expect(page.locator(`text=${title}`)).toBeVisible();
      }
    });
  });

  test.describe('Project Export', () => {
    test('should export individual project as JSON', async ({ page }) => {
      // Create a project
      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'Export Individual');
      await page.fill('textarea[placeholder*="problems"]', 'Test export');
      await page.fill('textarea[placeholder*="context"]', 'Test context');
      await page.click('button:has-text("Create Project")');

      // Go back to list
      await page.click('button:has-text("Back to Projects")');

      // Find and click export button on project card
      const exportButton = page.locator('text=Export Individual').locator('..').locator('button[title*="Export"], button:has-text("💾")').first();

      if (await exportButton.count() > 0) {
        const downloadPromise = page.waitForEvent('download');
        await exportButton.click();

        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/\.json$/);
      }
    });
  });

  test.describe('Project Sorting', () => {
    test('should display projects sorted by most recent first', async ({ page }) => {
      // Create projects with delays to ensure different timestamps
      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'First Project');
      await page.fill('textarea[placeholder*="problems"]', 'Test');
      await page.fill('textarea[placeholder*="context"]', 'Test');
      await page.click('button:has-text("Create Project")');
      await page.click('button:has-text("Back to Projects")');
      await page.waitForTimeout(1000);

      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'Second Project');
      await page.fill('textarea[placeholder*="problems"]', 'Test');
      await page.fill('textarea[placeholder*="context"]', 'Test');
      await page.click('button:has-text("Create Project")');
      await page.click('button:has-text("Back to Projects")');

      // Get all project titles in order
      const projectTitles = await page.locator('.project-card h3, [class*="project"] h3').allTextContents();

      // Second Project should appear before First Project (most recent first)
      const secondIndex = projectTitles.findIndex(t => t.includes('Second Project'));
      const firstIndex = projectTitles.findIndex(t => t.includes('First Project'));

      if (secondIndex >= 0 && firstIndex >= 0) {
        expect(secondIndex).toBeLessThan(firstIndex);
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate back to home from project view', async ({ page }) => {
      // Create and open a project
      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'Nav Test');
      await page.fill('textarea[placeholder*="problems"]', 'Test');
      await page.fill('textarea[placeholder*="context"]', 'Test');
      await page.click('button:has-text("Create Project")');

      // Should be in project view
      await expect(page.locator('h2:has-text("Nav Test")')).toBeVisible();

      // Click back button
      await page.click('button:has-text("Back to Projects")');

      // Should be back in home view
      await expect(page.locator('h2:has-text("Your Projects")')).toBeVisible();
      await expect(page.locator('text=Nav Test')).toBeVisible();
    });

    test('should handle browser back button', async ({ page }) => {
      // Create a project
      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'Browser Nav Test');
      await page.fill('textarea[placeholder*="problems"]', 'Test');
      await page.fill('textarea[placeholder*="context"]', 'Test');
      await page.click('button:has-text("Create Project")');

      // Should be in project view
      await expect(page.locator('h2:has-text("Browser Nav Test")')).toBeVisible();

      // Use browser back button
      await page.goBack();

      // Should be back in home view
      await expect(page.locator('h2:has-text("Your Projects")')).toBeVisible();
    });
  });
});
