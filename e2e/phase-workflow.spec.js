import { test, expect } from '@playwright/test';

test.describe('Phase Navigation and Workflow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/');
    await page.waitForSelector('#app-container', { state: 'visible' });

    // Create a test project
    await page.click('button:has-text("Create New Project")');
    await page.fill('input[placeholder*="Project Title"]', 'Phase Test Project');
    await page.fill('textarea[placeholder*="problems"]', 'Need to test phases');
    await page.fill('textarea[placeholder*="context"]', 'E2E testing context');
    await page.click('button:has-text("Create Project")');

    // Wait for project view to load
    await page.waitForSelector('text=Phase 1');
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
    await expect(page.locator('text=📝')).toBeVisible();
    await expect(page.locator('text=Phase 1: Initial Draft')).toBeVisible();
    await expect(page.locator('text=Claude Sonnet 4.5')).toBeVisible();
  });

  test('should show copy prompt button in Phase 1', async ({ page }) => {
    await expect(page.locator('button:has-text("Copy Prompt to Clipboard")')).toBeVisible();
  });

  test('should show response textarea in Phase 1', async ({ page }) => {
    await expect(page.locator('textarea#response-textarea')).toBeVisible();
    await expect(page.locator('button:has-text("Save Response")')).toBeVisible();
  });

  test('should copy prompt to clipboard when button clicked', async ({ page }) => {
    // Click copy prompt button
    await page.click('button:has-text("Copy Prompt to Clipboard")');

    // Should show success toast
    await expect(page.locator('text=Copied to clipboard!')).toBeVisible();

    // Verify clipboard contains content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('Phase Test Project');
    expect(clipboardText).toContain('Need to test phases');
    expect(clipboardText).toContain('E2E testing context');
  });

  test('should save response and mark phase as completed', async ({ page }) => {
    // Enter a response
    await page.fill('textarea#response-textarea', 'This is my Phase 1 PRD draft');

    // Save response
    await page.click('button:has-text("Save Response")');

    // Should show success toast
    await expect(page.locator('text=Response saved successfully!')).toBeVisible();

    // Phase should be marked as completed (green checkmark)
    await expect(page.locator('button.phase-tab[data-phase="1"] >> text=✓')).toBeVisible();
  });

  test('should navigate to Phase 2 after completing Phase 1', async ({ page }) => {
    // Complete Phase 1
    await page.fill('textarea#response-textarea', 'Phase 1 complete');
    await page.click('button:has-text("Save Response")');

    // Wait for page to update
    await page.waitForTimeout(500);

    // Click Next Phase button
    await page.click('button:has-text("Next Phase")');

    // Should be on Phase 2
    await expect(page.locator('text=🔍')).toBeVisible();
    await expect(page.locator('text=Phase 2: Review & Refine')).toBeVisible();
    await expect(page.locator('text=Gemini 2.5 Pro')).toBeVisible();
  });

  test('should not allow next phase if current phase not completed', async ({ page }) => {
    // Next button should be disabled/grayed out
    const nextButton = page.locator('button:has-text("Next Phase")');
    await expect(nextButton).toHaveClass(/opacity-50/);
  });

  test('should navigate between phases using tabs', async ({ page }) => {
    // Complete Phase 1
    await page.fill('textarea#response-textarea', 'Phase 1 done');
    await page.click('button:has-text("Save Response")');
    await page.waitForTimeout(500);

    // Click Phase 2 tab directly
    await page.click('button.phase-tab[data-phase="2"]');

    // Should show Phase 2 content
    await expect(page.locator('text=Phase 2: Review & Refine')).toBeVisible();

    // Click back to Phase 1 tab
    await page.click('button.phase-tab[data-phase="1"]');

    // Should show Phase 1 content again
    await expect(page.locator('text=Phase 1: Initial Draft')).toBeVisible();
    // Response should still be there
    await expect(page.locator('textarea#response-textarea')).toHaveValue('Phase 1 done');
  });

  test('should use Previous Phase button to go back', async ({ page }) => {
    // Complete Phase 1 and go to Phase 2
    await page.fill('textarea#response-textarea', 'Phase 1 content');
    await page.click('button:has-text("Save Response")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Next Phase")');

    // Should be on Phase 2
    await expect(page.locator('text=Phase 2: Review & Refine')).toBeVisible();

    // Click Previous Phase button
    await page.click('button:has-text("Previous Phase")');

    // Should be back on Phase 1
    await expect(page.locator('text=Phase 1: Initial Draft')).toBeVisible();
  });

  test('should complete full 3-phase workflow', async ({ page }) => {
    // Phase 1
    await page.fill('textarea#response-textarea', 'Initial PRD draft from Claude');
    await page.click('button:has-text("Save Response")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Next Phase")');

    // Phase 2
    await expect(page.locator('text=Phase 2: Review & Refine')).toBeVisible();
    await page.fill('textarea#response-textarea', 'Refined PRD from Gemini');
    await page.click('button:has-text("Save Response")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Next Phase")');

    // Phase 3
    await expect(page.locator('text=✨')).toBeVisible();
    await expect(page.locator('text=Phase 3: Final Comparison')).toBeVisible();
    await expect(page.locator('text=Claude Sonnet 4.5')).toBeVisible();

    // All three phases should show completion checkmarks
    await expect(page.locator('button.phase-tab[data-phase="1"] >> text=✓')).toBeVisible();
    await expect(page.locator('button.phase-tab[data-phase="2"] >> text=✓')).toBeVisible();
  });

  test('should display generated prompt preview after copying', async ({ page }) => {
    // Copy prompt
    await page.click('button:has-text("Copy Prompt to Clipboard")');
    await page.waitForTimeout(500);

    // Should show prompt preview
    await expect(page.locator('text=Generated Prompt:')).toBeVisible();
    await expect(page.locator('button:has-text("View Full Prompt")')).toBeVisible();
  });

  test('should export PRD from project view', async ({ page }) => {
    // Complete Phase 1
    await page.fill('textarea#response-textarea', 'PRD content for export');
    await page.click('button:has-text("Save Response")');
    await page.waitForTimeout(500);

    // Click Export PRD button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export PRD")');

    // Verify download started
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.md$/);
  });
});
