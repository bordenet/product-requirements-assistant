# E2E Test Suite

This directory contains comprehensive end-to-end tests for the Product Requirements Assistant using Playwright.

## Test Coverage

### 1. Project Creation Workflow (`project-creation.spec.js`)
- Home view display
- Create new project with valid inputs
- Form validation
- Project cancellation
- Project list display

### 2. Phase Navigation and Workflow (`phase-workflow.spec.js`)
- Phase tabs display (1, 2, 3)
- Phase metadata and UI elements
- Clipboard copy functionality
- Response saving
- Phase navigation (next/previous)
- Full 3-phase workflow completion
- PRD export

### 3. UI Features and Interactions (`ui-features.spec.js`)
- Dark mode toggle and persistence
- Header and navigation elements
- Privacy notice
- Toast notifications
- About modal
- Storage info display
- Import/Export functionality
- Responsive design (mobile/tablet)

### 4. Project Management (`project-management.spec.js`)
- Project list view and empty states
- Project cards display
- Phase indicators
- Project deletion with confirmation
- Project export (JSON)
- Project sorting (most recent first)
- Navigation (back button, browser history)

## Running Tests

### Prerequisites
```bash
npm install
```

### Run all E2E tests
```bash
npm run test:e2e
```

### Run specific test file
```bash
npx playwright test e2e/project-creation.spec.js
```

### Run tests in headed mode (visible browser)
```bash
npx playwright test --headed
```

### Run tests in debug mode
```bash
npx playwright test --debug
```

## Configuration

Tests are configured via `playwright.config.js` to:
- Run on Chromium browser
- Automatically start local dev server on port 8000
- Capture traces on first retry for debugging
- Use parallel execution for faster runs

## Environment Notes

E2E tests require a proper browser environment. In some headless/CI environments, you may encounter browser crashes. If tests fail with "Page crashed" errors:

1. Try running in headed mode: `npx playwright test --headed`
2. Update Playwright browsers: `npx playwright install`
3. Check system requirements: https://playwright.dev/docs/intro

## Test Philosophy

These tests focus on:
- User-facing behavior and visual elements
- Critical user workflows
- Integration between components
- Actual browser interactions (clicks, typing, navigation)

They complement the unit tests in `/tests` which focus on:
- Individual module functionality
- Business logic
- Data persistence
- Edge cases and error handling
