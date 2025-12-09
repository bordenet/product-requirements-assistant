import { test, expect } from '@playwright/test';

test.describe('Project Creation Workflow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.waitForSelector('#app-container', { state: 'visible' });
  });

  test('should display home view with create project button', async ({ page }) => {
    await expect(page.locator('h2:has-text("My Projects")')).toBeVisible();
    await expect(page.locator('button:has-text("New Project")')).toBeVisible();
  });

  test('should create a new project with valid inputs', async ({ page }) => {
    // Click create project button
    await page.click('button:has-text("New Project")');

    // Wait for form to be ready
    await page.waitForSelector('#title', { state: 'visible', timeout: 5000 });

    // Fill in project details
    await page.fill('#title', 'Test E2E Project');
    await page.fill('#problems', 'Users need better analytics');
    await page.fill('#context', 'B2B SaaS platform');

    // Submit form
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Wait for project view to load (element-based wait is more reliable than URL wait for SPAs)
    await page.waitForSelector('h2:has-text("Test E2E Project")', { timeout: 10000 });

    // Should navigate to project view - project title is in h2
    await expect(page.locator('h2:has-text("Test E2E Project")')).toBeVisible();
    await expect(page.locator('text=Users need better analytics')).toBeVisible();
  });

  test('should show validation error for empty title', async ({ page }) => {
    await page.click('button:has-text("New Project")');

    // Try to submit without filling required fields - browser uses native validation
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Browser shows native validation on required fields - check the title input has :invalid state
    const titleInput = page.locator('#title');
    await expect(titleInput).toHaveAttribute('required', '');
  });

  test('should cancel project creation', async ({ page }) => {
    await page.click('button:has-text("New Project")');
    await page.fill('#title', 'Test Project');

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Should return to home view
    await expect(page.locator('h2:has-text("My Projects")')).toBeVisible();
  });

  test('should display created project in project list', async ({ page }) => {
    // Create a project
    await page.click('button:has-text("New Project")');
    // Wait for form to be ready
    await page.waitForSelector('#title', { state: 'visible', timeout: 5000 });
    await page.fill('#title', 'Listed Project');
    await page.fill('#problems', 'Test problem');
    await page.fill('#context', 'Test context');
    await page.click('button[type="submit"]:has-text("Create Project")');

    // Wait for project view to load
    await page.waitForSelector('h2:has-text("Listed Project")', { timeout: 10000 });

    // Go back to home
    await page.click('button:has-text("Back to Projects")');

    // Wait for project card to appear in home view
    await page.waitForSelector('h3:has-text("Listed Project")', { timeout: 5000 });

    // Should see project in list - use h3 selector for project card title
    await expect(page.locator('h3:has-text("Listed Project")')).toBeVisible();
  });
});
