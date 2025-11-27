import { test, expect } from '@playwright/test';

test.describe('UI Features and Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#app-container', { state: 'visible' });
  });

  test.describe('Dark Mode', () => {
    test('should toggle dark mode on and off', async ({ page }) => {
      // Get initial theme state
      const htmlElement = page.locator('html');
      const initialHasLightMode = !(await htmlElement.getAttribute('class'))?.includes('dark');

      // Click theme toggle button
      await page.click('#theme-toggle');

      // Theme should have changed
      if (initialHasLightMode) {
        await expect(htmlElement).toHaveClass(/dark/);
      } else {
        const classes = await htmlElement.getAttribute('class');
        expect(classes).not.toContain('dark');
      }

      // Toggle back
      await page.click('#theme-toggle');

      // Should be back to initial state
      if (initialHasLightMode) {
        const classes = await htmlElement.getAttribute('class');
        expect(classes || '').not.toContain('dark');
      } else {
        await expect(htmlElement).toHaveClass(/dark/);
      }
    });

    test('should persist dark mode preference', async ({ page, context }) => {
      // Enable dark mode
      await page.click('#theme-toggle');
      await expect(page.locator('html')).toHaveClass(/dark/);

      // Reload page
      await page.reload();
      await page.waitForSelector('#app-container', { state: 'visible' });

      // Dark mode should still be enabled
      await expect(page.locator('html')).toHaveClass(/dark/);
    });
  });

  test.describe('Header and Navigation', () => {
    test('should display app title and description', async ({ page }) => {
      await expect(page.locator('h1:has-text("Product Requirements Assistant")')).toBeVisible();
      await expect(page.locator('text=100% Client-Side • Privacy-First')).toBeVisible();
    });

    test('should show export all and import buttons', async ({ page }) => {
      await expect(page.locator('button:has-text("Export All")')).toBeVisible();
      await expect(page.locator('button:has-text("Import")')).toBeVisible();
    });

    test('should open related projects menu', async ({ page }) => {
      // Click related projects button
      await page.click('#related-projects-btn');

      // Menu should be visible
      await expect(page.locator('#related-projects-menu')).toBeVisible();
      await expect(page.locator('text=One-Pager Generator')).toBeVisible();

      // Click outside to close
      await page.click('body');

      // Menu should be hidden
      await expect(page.locator('#related-projects-menu')).toBeHidden();
    });
  });

  test.describe('Privacy Notice', () => {
    test('should display privacy notice on first visit', async ({ page, context }) => {
      // Clear any existing storage
      await context.clearCookies();

      // Reload page
      await page.reload();
      await page.waitForSelector('#app-container', { state: 'visible' });

      // Privacy notice should be visible
      await expect(page.locator('#privacy-notice')).toBeVisible();
      await expect(page.locator('text=Your Privacy is Protected')).toBeVisible();
    });

    test('should close privacy notice when dismissed', async ({ page }) => {
      // If privacy notice is visible, close it
      const privacyNotice = page.locator('#privacy-notice');
      if (await privacyNotice.isVisible()) {
        await page.click('#close-privacy-notice');
        await expect(privacyNotice).toBeHidden();
      }
    });
  });

  test.describe('Toast Notifications', () => {
    test('should display toast notification on action', async ({ page }) => {
      // Create a project to trigger success toast
      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'Toast Test');
      await page.fill('textarea[placeholder*="problems"]', 'Test');
      await page.fill('textarea[placeholder*="context"]', 'Test');
      await page.click('button:has-text("Create Project")');

      // Wait for project view
      await page.waitForSelector('text=Toast Test');

      // Copy prompt (triggers toast)
      await page.click('button:has-text("Copy Prompt to Clipboard")');

      // Toast should appear
      await expect(page.locator('#toast-container >> text=Copied to clipboard!')).toBeVisible();

      // Toast should disappear after timeout
      await page.waitForTimeout(3500);
      await expect(page.locator('#toast-container >> text=Copied to clipboard!')).toBeHidden();
    });
  });

  test.describe('About Modal', () => {
    test('should open and close about modal', async ({ page }) => {
      // Click about link
      await page.click('#about-link');

      // Modal should be visible
      await expect(page.locator('text=📋 Product Requirements Assistant')).toBeVisible();
      await expect(page.locator('text=100% Client-Side:')).toBeVisible();
      await expect(page.locator('text=Privacy-First:')).toBeVisible();

      // Close modal
      await page.click('button:has-text("Close")');

      // Modal should be hidden
      await expect(page.locator('text=📋 Product Requirements Assistant').last()).toBeHidden();
    });

    test('should close about modal by clicking background', async ({ page }) => {
      // Open about modal
      await page.click('#about-link');
      await expect(page.locator('text=📋 Product Requirements Assistant')).toBeVisible();

      // Click background overlay
      await page.click('.fixed.inset-0.bg-black.bg-opacity-50', { position: { x: 0, y: 0 } });

      // Modal should be hidden
      await page.waitForTimeout(100);
      await expect(page.locator('text=View on GitHub →')).toBeHidden();
    });
  });

  test.describe('Storage Info', () => {
    test('should display storage information in footer', async ({ page }) => {
      await expect(page.locator('#storage-info')).toBeVisible();
      // Should show either storage stats or "Available"
      const storageText = await page.locator('#storage-info').textContent();
      expect(storageText).toMatch(/Storage:/);
    });
  });

  test.describe('Import/Export', () => {
    test('should trigger export on export all button', async ({ page }) => {
      // Create a project first
      await page.click('button:has-text("Create New Project")');
      await page.fill('input[placeholder*="Project Title"]', 'Export Test');
      await page.fill('textarea[placeholder*="problems"]', 'Test problem');
      await page.fill('textarea[placeholder*="context"]', 'Test context');
      await page.click('button:has-text("Create Project")');
      await page.waitForTimeout(500);

      // Go back to home
      await page.click('button:has-text("Back to Projects")');

      // Click export all
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export All")');

      // Verify download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/prd-assistant-backup.*\.json$/);
    });

    test('should open file picker on import button', async ({ page }) => {
      // Set up file chooser listener
      const fileChooserPromise = page.waitForEvent('filechooser');

      // Click import button
      await page.click('button:has-text("Import")');

      // File chooser should open
      const fileChooser = await fileChooserPromise;
      expect(fileChooser).toBeTruthy();
    });
  });

  test.describe('Loading States', () => {
    test('should show loading overlay during initialization', async ({ page }) => {
      // This is tricky to test as loading happens quickly
      // We can at least verify the loading overlay element exists
      const loadingOverlay = page.locator('#loading-overlay');
      expect(await loadingOverlay.count()).toBe(1);
    });
  });

  test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // App should still be functional
      await expect(page.locator('h1:has-text("Product Requirements Assistant")')).toBeVisible();
      await expect(page.locator('button:has-text("Create New Project")')).toBeVisible();
    });

    test('should be responsive on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });

      // App should still be functional
      await expect(page.locator('h1:has-text("Product Requirements Assistant")')).toBeVisible();
      await expect(page.locator('button:has-text("Create New Project")')).toBeVisible();
    });
  });
});
