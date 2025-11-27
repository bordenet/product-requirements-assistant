import { test, expect } from '@playwright/test';

test.describe('Project Creation Workflow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');

    // Wait for app to initialize
    await page.waitForSelector('#app-container', { state: 'visible' });
  });

  test('should display home view with create project button', async ({ page }) => {
    await expect(page.locator('h2:has-text("Your Projects")')).toBeVisible();
    await expect(page.locator('button:has-text("Create New Project")')).toBeVisible();
  });

  test('should create a new project with valid inputs', async ({ page }) => {
    // Click create project button
    await page.click('button:has-text("Create New Project")');

    // Fill in project details
    await page.fill('input[placeholder*="Project Title"]', 'Test E2E Project');
    await page.fill('textarea[placeholder*="problems"]', 'Users need better analytics');
    await page.fill('textarea[placeholder*="context"]', 'B2B SaaS platform');

    // Submit form
    await page.click('button:has-text("Create Project")');

    // Should navigate to project view
    await expect(page.locator('h2:has-text("Test E2E Project")')).toBeVisible();
    await expect(page.locator('text=Users need better analytics')).toBeVisible();
  });

  test('should show validation error for empty title', async ({ page }) => {
    await page.click('button:has-text("Create New Project")');

    // Try to submit without filling required fields
    await page.click('button:has-text("Create Project")');

    // Should show validation message
    await expect(page.locator('text=/Please fill.*all required fields/i')).toBeVisible();
  });

  test('should cancel project creation', async ({ page }) => {
    await page.click('button:has-text("Create New Project")');
    await page.fill('input[placeholder*="Project Title"]', 'Test Project');

    // Click cancel
    await page.click('button:has-text("Cancel")');

    // Should return to home view
    await expect(page.locator('h2:has-text("Your Projects")')).toBeVisible();
  });

  test('should display created project in project list', async ({ page }) => {
    // Create a project
    await page.click('button:has-text("Create New Project")');
    await page.fill('input[placeholder*="Project Title"]', 'Listed Project');
    await page.fill('textarea[placeholder*="problems"]', 'Test problem');
    await page.fill('textarea[placeholder*="context"]', 'Test context');
    await page.click('button:has-text("Create Project")');

    // Go back to home
    await page.click('button:has-text("Back to Projects")');

    // Should see project in list
    await expect(page.locator('text=Listed Project')).toBeVisible();
  });
});
