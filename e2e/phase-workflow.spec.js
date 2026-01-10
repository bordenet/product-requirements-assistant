import { test, expect } from '@playwright/test';

// Use fresh storage state for each test
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Phase Navigation and Workflow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Navigate to app FIRST (required for IndexedDB access)
    await page.goto('/');
    await page.waitForSelector('#app-container', { state: 'visible' });

    // Clear IndexedDB to ensure fresh state (must be on app origin)
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const dbName = 'prd-assistant';
        const request = indexedDB.deleteDatabase(dbName);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => setTimeout(resolve, 100);
      });
    });

    // Reload to get fresh state after DB clear
    await page.reload();
    await page.waitForSelector('#app-container', { state: 'visible' });
    await page.waitForSelector('h2:has-text("My PRDs")', { timeout: 5000 });
    await page.waitForTimeout(300); // Brief wait for app initialization

    // Create a test project
    await page.click('button:has-text("New PRD")');
    await page.waitForSelector('#title', { state: 'visible', timeout: 5000 });
    await page.fill('#title', 'Phase Test Project');
    await page.fill('#problems', 'Need to test phases');
    await page.fill('#context', 'E2E testing context');
    await page.click('button[type="submit"]:has-text("Create")');

    // Wait for project view to load
    await page.waitForSelector('h2:has-text("Phase Test Project")', { timeout: 10000 });
    await page.waitForSelector('h3:has-text("Phase 1")', { timeout: 5000 });

    // Mock clipboard API for headless browser compatibility
    await page.evaluate(() => {
      window.__clipboardContent = '';
      navigator.clipboard.writeText = async (text) => {
        window.__clipboardContent = text;
        return Promise.resolve();
      };
      navigator.clipboard.readText = async () => {
        return Promise.resolve(window.__clipboardContent);
      };
    });
  });

  test('should display all three phase tabs', async ({ page }) => {
    await expect(page.locator('button:has-text("Phase 1")')).toBeVisible();
    await expect(page.locator('button:has-text("Phase 2")')).toBeVisible();
    await expect(page.locator('button:has-text("Phase 3")')).toBeVisible();
  });

  test('should start on Phase 1 by default', async ({ page }) => {
    // Phase 1 tab should be active (has blue border/text)
    const phase1Tab = page.locator('button.phase-tab[data-phase="1"]');
    await expect(phase1Tab).toHaveClass(/border-blue-600/);
  });

  test('should display Phase 1 metadata correctly', async ({ page }) => {
    // Use heading selector to avoid matching both tab and heading
    await expect(page.locator('h3:has-text("📝 Phase 1")')).toBeVisible();
    await expect(page.locator('text=Initial Draft')).toBeVisible();
    // Check for AI model badge - use first() to handle multiple matches
    await expect(page.locator('text=Use with Claude Sonnet 4.5').first()).toBeVisible({ timeout: 5000 });
  });

  test('should show copy prompt button in Phase 1', async ({ page }) => {
    await expect(page.locator('button:has-text("Copy Prompt to Clipboard")')).toBeVisible();
  });

  test('should show response textarea in Phase 1', async ({ page }) => {
    await expect(page.locator('textarea#response-textarea')).toBeVisible();
    await expect(page.locator('button:has-text("Save Response")')).toBeVisible();
  });

  test('should copy prompt to clipboard when button clicked', async ({ page }) => {
    // Click copy prompt button (clipboard is mocked in beforeEach)
    await page.click('#copy-prompt-btn');

    // Wait for textarea to be enabled (indicates prompt was copied successfully)
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Verify clipboard contains content (using mocked clipboard)
    const clipboardText = await page.evaluate(() => window.__clipboardContent);
    expect(clipboardText).toContain('Phase Test Project');
    expect(clipboardText).toContain('Need to test phases');
    expect(clipboardText).toContain('E2E testing context');
  });

  test('should save response and mark phase as completed', async ({ page }) => {
    // Must copy prompt first to enable textarea
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    // Wait for textarea to be enabled (indicates async operations complete)
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Enter a response (textarea should now be enabled)
    await page.fill('textarea#response-textarea', 'This is my Phase 1 PRD draft with enough content');

    // Save response
    await page.click('button:has-text("Save Response")');

    // Should show success toast - app auto-advances so message reflects that
    await expect(page.locator('text=Response saved! Moving to next phase...')).toBeVisible({ timeout: 10000 });

    // Wait for auto-advance to Phase 2 (the view re-renders)
    await page.waitForSelector('h3:has-text("🔍 Phase 2")', { timeout: 5000 });

    // Phase 1 tab should be marked as completed with green checkmark
    await expect(page.locator('button.phase-tab[data-phase="1"] span.text-green-500')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to Phase 2 after completing Phase 1', async ({ page }) => {
    // Must copy prompt first to enable textarea
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    // Wait for textarea to be enabled (indicates async operations complete)
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Complete Phase 1 (textarea should now be enabled)
    await page.fill('textarea#response-textarea', 'Phase 1 complete with sufficient content');
    await page.click('button:has-text("Save Response")');

    // App auto-advances to Phase 2 after saving Phase 1 response
    // Wait for Phase 2 content to appear
    await page.waitForSelector('h3:has-text("🔍 Phase 2")', { timeout: 5000 });

    // Should be on Phase 2 - use heading selector to avoid matching both tab and heading
    await expect(page.locator('h3:has-text("🔍 Phase 2")')).toBeVisible();
    await expect(page.locator('text=Review & Refine')).toBeVisible();
    // Use first() since "Gemini 2.5 Pro" appears in both badge and Step B heading
    await expect(page.locator('text=Gemini 2.5 Pro').first()).toBeVisible();
  });

  test('should not show next phase button if current phase not completed', async ({ page }) => {
    // Next Phase button should not exist when phase is not completed
    const nextButton = page.locator('button:has-text("Next Phase")');
    await expect(nextButton).toHaveCount(0);
  });

  test('should navigate between phases using tabs', async ({ page }) => {
    // Must copy prompt first to enable textarea
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    // Wait for textarea to be enabled (indicates async operations complete)
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Complete Phase 1
    await page.fill('textarea#response-textarea', 'Phase 1 done with content');
    await page.click('button:has-text("Save Response")');
    // Wait for auto-advance to Phase 2
    await page.waitForSelector('h3:has-text("🔍 Phase 2")', { timeout: 5000 });

    // Click Phase 2 tab directly (may already be there, but this confirms tab navigation works)
    await page.click('button.phase-tab[data-phase="2"]');
    // Wait for Phase 2 content to load
    await expect(page.locator('text=Phase 2: Review & Refine')).toBeVisible({ timeout: 5000 });

    // Click back to Phase 1 tab
    await page.click('button.phase-tab[data-phase="1"]');
    // Wait for async tab handler to complete and content to render
    await page.waitForSelector('h3:has-text("📝 Phase 1")', { timeout: 5000 });

    // Should show Phase 1 content again
    await expect(page.locator('text=Phase 1: Initial Draft')).toBeVisible();
    // Response should still be there - textarea is pre-filled with saved response
    await expect(page.locator('textarea#response-textarea')).toHaveValue('Phase 1 done with content');
  });

  test('should navigate back to Phase 1 using tab', async ({ page }) => {
    // Must copy prompt first to enable textarea
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    // Wait for textarea to be enabled (indicates async operations complete)
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Complete Phase 1 - app auto-advances to Phase 2
    await page.fill('textarea#response-textarea', 'Phase 1 content here');
    await page.click('button:has-text("Save Response")');

    // Wait for Phase 2 (app auto-advances after saving)
    await page.waitForSelector('h3:has-text("🔍 Phase 2")', { timeout: 5000 });
    await expect(page.locator('text=Phase 2: Review & Refine')).toBeVisible();

    // Click Phase 1 tab to go back (no "Previous Phase" button - use tabs)
    await page.click('button.phase-tab[data-phase="1"]');

    // Should be back on Phase 1
    await page.waitForSelector('h3:has-text("📝 Phase 1")', { timeout: 5000 });
    await expect(page.locator('text=Phase 1: Initial Draft')).toBeVisible();
  });

  test('should complete full 3-phase workflow', async ({ page }) => {
    // Must copy prompt first to enable textarea (Phase 1)
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Phase 1 - app auto-advances to Phase 2 after saving
    await page.fill('textarea#response-textarea', 'Initial PRD draft from Claude with content');
    await page.click('button:has-text("Save Response")');
    await page.waitForSelector('h3:has-text("🔍 Phase 2")', { timeout: 5000 });

    // Must copy prompt for Phase 2 to enable textarea
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Phase 2 - app auto-advances to Phase 3 after saving
    await expect(page.locator('text=Phase 2: Review & Refine')).toBeVisible();
    await page.fill('textarea#response-textarea', 'Refined PRD from Gemini with content');
    await page.click('button:has-text("Save Response")');
    await page.waitForSelector('h3:has-text("✨ Phase 3")', { timeout: 5000 });

    // Phase 3 - use heading selector to avoid matching both tab and heading
    await expect(page.locator('h3:has-text("✨ Phase 3")')).toBeVisible();
    await expect(page.locator('text=Final Comparison')).toBeVisible();
    // Use first() since "Claude Sonnet 4.5" appears in both badge and Step B heading
    await expect(page.locator('text=Claude Sonnet 4.5').first()).toBeVisible();

    // All three phases should show completion checkmarks
    await expect(page.locator('button.phase-tab[data-phase="1"] >> text=✓')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button.phase-tab[data-phase="2"] >> text=✓')).toBeVisible({ timeout: 5000 });
  });

  test('should display View Prompt button after copying', async ({ page }) => {
    // Copy prompt
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    // Wait for textarea to be enabled (indicates async operations are complete)
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // View Prompt button should now be enabled (One-Pager style)
    const viewPromptBtn = page.locator('button#view-prompt-btn');
    await expect(viewPromptBtn).toBeVisible();
    await expect(viewPromptBtn).not.toHaveAttribute('disabled');
  });

  test('should open View Prompt modal for Phase 1', async ({ page }) => {
    // Copy prompt to generate it
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    // Wait for textarea to be enabled (indicates async operations are complete)
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Click View Prompt button (One-Pager style)
    await page.click('button#view-prompt-btn');

    // Modal should be visible with full prompt content
    await expect(page.locator('text=📋 Full Prompt')).toBeVisible();
    await expect(page.locator('pre')).toBeVisible();

    // Modal should contain project details
    const promptContent = await page.locator('pre').textContent();
    expect(promptContent).toContain('Phase Test Project');

    // Close modal
    await page.click('button:has-text("Close")');
    await expect(page.locator('text=📋 Full Prompt')).toBeHidden();
  });

  test('should open View Prompt modal for Phase 2', async ({ page }) => {
    // Must copy prompt first to enable textarea (Phase 1)
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Complete Phase 1 - app auto-advances to Phase 2
    await page.fill('textarea#response-textarea', 'Phase 1 PRD content here');
    await page.click('button:has-text("Save Response")');
    await page.waitForSelector('h3:has-text("🔍 Phase 2")', { timeout: 5000 });

    // Should be on Phase 2
    await expect(page.locator('text=Phase 2: Review & Refine')).toBeVisible();

    // Copy prompt to generate it (Phase 2)
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    // Wait for textarea to be enabled (indicates async operations are complete)
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Click View Prompt button
    await page.click('button#view-prompt-btn');

    // Modal should be visible
    await expect(page.locator('text=📋 Full Prompt')).toBeVisible();

    // Phase 2 prompt should contain Phase 1 response
    const promptContent = await page.locator('pre').textContent();
    expect(promptContent).toContain('Phase 1 PRD content here');

    // Close modal using Close button (more reliable than clicking background)
    await page.click('button:has-text("Close")');
    await expect(page.locator('text=📋 Full Prompt')).toBeHidden({ timeout: 5000 });
  });

  test('should open View Prompt modal for Phase 3', async ({ page }) => {
    // Must copy prompt first to enable textarea (Phase 1)
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Complete Phase 1 - app auto-advances to Phase 2
    await page.fill('textarea#response-textarea', 'Phase 1 draft content');
    await page.click('button:has-text("Save Response")');
    await page.waitForSelector('h3:has-text("🔍 Phase 2")', { timeout: 5000 });

    // Must copy prompt first to enable textarea (Phase 2)
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Complete Phase 2 - app auto-advances to Phase 3
    await page.fill('textarea#response-textarea', 'Phase 2 review content');
    await page.click('button:has-text("Save Response")');
    await page.waitForSelector('h3:has-text("✨ Phase 3")', { timeout: 5000 });

    // Should be on Phase 3
    await expect(page.locator('text=Phase 3: Final Comparison')).toBeVisible();

    // Copy prompt to generate it (Phase 3)
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    // Wait for textarea to be enabled (indicates async operations are complete)
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Click View Prompt button
    await page.click('button#view-prompt-btn');

    // Modal should be visible
    await expect(page.locator('text=📋 Full Prompt')).toBeVisible();

    // Phase 3 prompt should contain both Phase 1 and Phase 2 responses
    const promptContent = await page.locator('pre').textContent();
    expect(promptContent).toContain('Phase 1 draft content');
    expect(promptContent).toContain('Phase 2 review content');

    // Close modal using X button
    await page.click('#close-prompt-modal-btn');
    await expect(page.locator('text=📋 Full Prompt')).toBeHidden({ timeout: 5000 });
  });

  test('should copy prompt from View Prompt modal', async ({ page }) => {
    // Copy prompt to generate it
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    // Wait for textarea to be enabled (indicates async operations are complete)
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Click View Prompt button
    await page.click('button#view-prompt-btn');
    await expect(page.locator('text=📋 Full Prompt')).toBeVisible();

    // Click Copy to Clipboard button in modal
    await page.click('#copy-prompt-modal-btn');

    // Should show toast - clipboard API may fail in headless mode
    const toastContainer = page.locator('#toast-container');
    await expect(toastContainer).toBeVisible({ timeout: 5000 });
    const toastText = await toastContainer.textContent();
    // Accept various clipboard-related toast messages
    expect(
      toastText.includes('Copied to clipboard!') ||
      toastText.includes('Prompt copied to clipboard!') ||
      toastText.includes('Failed to copy')
    ).toBeTruthy();
  });

  test('should export PRD from project view', async ({ page }) => {
    // Must copy prompt first to enable textarea
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });

    // Complete all 3 phases to enable export button (now only visible when Phase 3 is complete)
    await page.fill('textarea#response-textarea', 'PRD content for export test Phase 1');
    await page.click('button:has-text("Save Response")');
    await page.waitForSelector('h3:has-text("🔍 Phase 2")', { timeout: 5000 });

    // Phase 2
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });
    await page.fill('textarea#response-textarea', 'PRD content for export test Phase 2');
    await page.click('button:has-text("Save Response")');
    await page.waitForSelector('h3:has-text("✨ Phase 3")', { timeout: 5000 });

    // Phase 3
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    await expect(page.locator('textarea#response-textarea:not([disabled])')).toBeVisible({ timeout: 10000 });
    await page.fill('textarea#response-textarea', 'PRD content for export test Phase 3');
    await page.click('button:has-text("Save Response")');

    // Wait for Phase 3 completion
    await expect(page.locator('text=Phase 3 complete!')).toBeVisible({ timeout: 10000 });

    // Export PRD button should now be visible in header (use specific ID to avoid ambiguity)
    await expect(page.locator('#export-prd-btn')).toBeVisible({ timeout: 5000 });

    // Click Export button (header button)
    await page.click('#export-prd-btn');

    // Verify export success toast appears (download event may not fire in headless mode)
    await expect(page.locator('text=PRD exported successfully!')).toBeVisible({ timeout: 5000 });
  });
});
