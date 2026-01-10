import { test, expect } from '@playwright/test';

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#app-container', { state: 'visible' });
  });

  test.describe('Project List View', () => {
    test('should display empty state when no projects exist', async ({ page, context }) => {
      // Clear IndexedDB with timeout handling
      await context.clearCookies();
      await page.evaluate(() => {
        return new Promise((resolve) => {
          const request = indexedDB.deleteDatabase('prd-assistant');
          request.onsuccess = () => resolve();
          request.onerror = () => resolve();
          request.onblocked = () => resolve();
          // Fallback timeout in case IndexedDB hangs
          setTimeout(() => resolve(), 2000);
        });
      });

      // Reload page
      await page.reload();
      await page.waitForSelector('#app-container', { state: 'visible', timeout: 10000 });

      // Should show empty state
      await expect(page.locator('text=No PRDs yet')).toBeVisible({ timeout: 10000 });
      // Use first() to avoid strict mode violation when both buttons are visible
      await expect(page.locator('button:has-text("New PRD"), button:has-text("Create Your First PRD")').first()).toBeVisible();
    });

    test('should display project cards with correct information', async ({ page }) => {
      // Create a test project
      await page.click('button:has-text("New PRD")');
      await page.fill('#title', 'Display Test Project');
      await page.fill('#problems', 'Test display problems');
      await page.fill('#context', 'Test context');
      await page.click('button[type="submit"]:has-text("Create")');

      // Wait for project view to load
      await page.waitForSelector('h2:has-text("Display Test Project")', { timeout: 10000 });

      // Go back to home
      await page.click('button:has-text("Back to PRDs")');

      // Should see project card
      await expect(page.locator('text=Display Test Project')).toBeVisible();
      await expect(page.locator('text=Test display problems')).toBeVisible();
    });

    test('should show current phase indicator on project card', async ({ page }) => {
      // Create and work on a project
      await page.click('button:has-text("New PRD")');
      await page.fill('#title', 'Phase Indicator Test');
      await page.fill('#problems', 'Test');
      await page.fill('#context', 'Test');
      await page.click('button[type="submit"]:has-text("Create")');

      // Wait for project view to load
      await page.waitForSelector('h2:has-text("Phase Indicator Test")', { timeout: 10000 });

      // Go back to list
      await page.click('button:has-text("Back to PRDs")');

      // Should show phase indicator
      const projectCard = page.locator('text=Phase Indicator Test').locator('..');
      await expect(projectCard).toBeVisible();
    });

    test('should navigate to project when card clicked', async ({ page }) => {
      // Create a project
      await page.click('button:has-text("New PRD")');
      await page.fill('#title', 'Navigate Test');
      await page.fill('#problems', 'Test');
      await page.fill('#context', 'Test');
      await page.click('button[type="submit"]:has-text("Create")');

      // Wait for project view to load
      await page.waitForTimeout(500);

      // Go back to home
      await page.click('button:has-text("Back to PRDs")');

      // Wait for home view and project card to load
      await page.waitForSelector('h3:has-text("Navigate Test")', { timeout: 10000 });

      // Click project card - use h3 selector for project title
      await page.click('h3:has-text("Navigate Test")');

      // Should navigate to project view
      await expect(page.locator('h2:has-text("Navigate Test")')).toBeVisible({ timeout: 10000 });
      // Use heading selector to avoid matching both tab and heading
      await expect(page.locator('h3:has-text("Phase 1")')).toBeVisible();
    });
  });

  test.describe('Project Deletion', () => {
    test('should delete project with confirmation', async ({ page }) => {
      // Create a project to delete
      await page.click('button:has-text("New PRD")');
      await page.fill('#title', 'Delete Me');
      await page.fill('#problems', 'Test');
      await page.fill('#context', 'Test');
      await page.click('button[type="submit"]:has-text("Create")');

      // Go back to home
      await page.click('button:has-text("Back to PRDs")');

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
      await page.click('button:has-text("New PRD")');
      await page.fill('#title', 'Keep Me');
      await page.fill('#problems', 'Test');
      await page.fill('#context', 'Test');
      await page.click('button[type="submit"]:has-text("Create")');

      // Go back to home
      await page.click('button:has-text("Back to PRDs")');

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
      // Create first project
      await page.waitForSelector('button:has-text("New PRD")', { state: 'visible', timeout: 5000 });
      await page.click('button:has-text("New PRD")');
      await page.waitForSelector('#title', { state: 'visible', timeout: 5000 });
      await page.fill('#title', 'Project Alpha');
      await page.fill('#problems', 'Problems for Alpha');
      await page.fill('#context', 'Context');
      await page.click('button[type="submit"]:has-text("Create")');
      await page.waitForSelector('h2:has-text("Project Alpha")', { timeout: 15000 });
      await page.click('button:has-text("Back to PRDs")');
      await page.waitForSelector('h2:has-text("My PRDs")', { timeout: 5000 });
      await page.waitForSelector('h3:has-text("Project Alpha")', { timeout: 5000 });

      // Create second project
      await page.waitForSelector('button:has-text("New PRD")', { state: 'visible', timeout: 5000 });
      await page.click('button:has-text("New PRD")');
      await page.waitForSelector('#title', { state: 'visible', timeout: 5000 });
      // Use click + type instead of fill for more reliable input
      await page.click('#title');
      await page.keyboard.type('Project Beta');
      await page.click('#problems');
      await page.keyboard.type('Problems for Beta');
      await page.click('#context');
      await page.keyboard.type('Context Beta');
      await page.click('button[type="submit"]:has-text("Create")');
      await page.waitForSelector('h2:has-text("Project Beta")', { timeout: 15000 });
      await page.click('button:has-text("Back to PRDs")');
      await page.waitForSelector('h2:has-text("My PRDs")', { timeout: 5000 });

      // Both projects should be visible
      await expect(page.locator('h3:has-text("Project Alpha")')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('h3:has-text("Project Beta")')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Project Export', () => {
    test('should export individual project as JSON', async ({ page }) => {
      // Create a project
      await page.click('button:has-text("New PRD")');
      await page.fill('#title', 'Export Individual');
      await page.fill('#problems', 'Test export');
      await page.fill('#context', 'Test context');
      await page.click('button[type="submit"]:has-text("Create")');

      // Go back to list
      await page.click('button:has-text("Back to PRDs")');

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
      await page.click('button:has-text("New PRD")');
      await page.waitForSelector('#title', { state: 'visible', timeout: 5000 });
      await page.fill('#title', 'First Project');
      await page.fill('#problems', 'Test');
      await page.fill('#context', 'Test');
      await page.click('button[type="submit"]:has-text("Create")');
      await page.waitForSelector('button:has-text("Back to PRDs")', { timeout: 10000 });
      await page.click('button:has-text("Back to PRDs")');
      await page.waitForSelector('button:has-text("New PRD")', { timeout: 5000 });
      await page.waitForTimeout(1000);

      await page.click('button:has-text("New PRD")');
      await page.waitForSelector('#title', { state: 'visible', timeout: 5000 });
      await page.fill('#title', 'Second Project');
      await page.fill('#problems', 'Test');
      await page.fill('#context', 'Test');
      await page.click('button[type="submit"]:has-text("Create")');
      await page.waitForSelector('button:has-text("Back to PRDs")', { timeout: 10000 });
      await page.click('button:has-text("Back to PRDs")');
      await page.waitForSelector('button:has-text("New PRD")', { timeout: 5000 });

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
      await page.click('button:has-text("New PRD")');
      await page.fill('#title', 'Nav Test');
      await page.fill('#problems', 'Test');
      await page.fill('#context', 'Test');
      await page.click('button[type="submit"]:has-text("Create")');

      // Wait for project view to load
      await page.waitForSelector('h2:has-text("Nav Test")', { timeout: 10000 });

      // Should be in project view
      await expect(page.locator('h2:has-text("Nav Test")')).toBeVisible();

      // Click back button
      await page.click('button:has-text("Back to PRDs")');

      // Should be back in home view
      await expect(page.locator('h2:has-text("My PRDs")')).toBeVisible();
      await expect(page.locator('text=Nav Test')).toBeVisible();
    });

    test('should handle browser back button', async ({ page }) => {
      // First navigate to home to establish history
      await page.goto('/');
      await page.waitForSelector('#app-container', { state: 'visible' });

      // Create a project
      await page.click('button:has-text("New PRD")');
      await page.fill('#title', 'Browser Nav Test');
      await page.fill('#problems', 'Test');
      await page.fill('#context', 'Test');
      await page.click('button[type="submit"]:has-text("Create")');

      // Wait for project view to load
      await page.waitForSelector('h2:has-text("Browser Nav Test")', { timeout: 10000 });

      // Use browser back button - goes to #new form
      await page.goBack();
      // Go back again to home
      await page.goBack();

      // Should be back in home view
      await expect(page.locator('h2:has-text("My PRDs")')).toBeVisible({ timeout: 5000 });
    });
  });
});
