# Windows Testing Checklist for v0.5.0

**File to test:** `PRD-Assistant-Windows.exe` (5.7 MB)  
**Download:** https://github.com/bordenet/product-requirements-assistant/releases/tag/v0.5.0

---

## Pre-Test Setup

- [ ] Clean Windows machine (or VM)
- [ ] No Go installed
- [ ] No Python installed
- [ ] No Node.js installed
- [ ] Modern browser installed (Chrome, Edge, Firefox)

---

## Test 1: Download and Security Warning

### Steps:
1. Download `PRD-Assistant-Windows.exe` from GitHub release
2. Navigate to Downloads folder
3. Double-click the .exe file

### Expected Behavior:
- Windows Defender SmartScreen shows warning:
  ```
  Windows protected your PC
  Microsoft Defender SmartScreen prevented an unrecognized app from starting
  ```
- Click "More info"
- Click "Run anyway"

### ✅ Pass Criteria:
- [ ] Security warning appears (expected)
- [ ] "Run anyway" option is available
- [ ] App starts after clicking "Run anyway"

---

## Test 2: Application Startup

### Expected Behavior:
1. Console window opens with message:
   ```
   Starting PRD Assistant on http://localhost:8080
   Press Ctrl+C to stop
   ```
2. Default browser opens automatically
3. Browser navigates to http://localhost:8080
4. Web app loads successfully

### ✅ Pass Criteria:
- [ ] Console window appears and stays open
- [ ] Browser opens automatically (within 2 seconds)
- [ ] Web app loads without errors
- [ ] No error messages in console window

---

## Test 3: Web App Functionality

### Steps:
1. Click "New Project" button
2. Fill in project details:
   - Title: "Test Project"
   - Problems: "Testing the app"
   - Context: "This is a test"
3. Click "Create Project"
4. Verify project appears in list

### ✅ Pass Criteria:
- [ ] "New Project" button works
- [ ] Form accepts input
- [ ] Project is created successfully
- [ ] Project appears in projects list
- [ ] No JavaScript errors in browser console (F12)

---

## Test 4: Data Persistence

### Steps:
1. Create a project (as in Test 3)
2. Close the browser tab
3. Close the console window (or press Ctrl+C)
4. Re-run `PRD-Assistant-Windows.exe`
5. Browser opens again
6. Check if project still exists

### ✅ Pass Criteria:
- [ ] App restarts successfully
- [ ] Browser opens again
- [ ] Previously created project is still visible
- [ ] Data persisted in browser (IndexedDB)

---

## Test 5: 3-Phase Workflow

### Steps:
1. Open an existing project
2. Click "Start Phase 1"
3. Verify prompt is displayed
4. Copy prompt to clipboard
5. Paste into Claude (or mock response)
6. Paste response back into app
7. Click "Save and Continue"

### ✅ Pass Criteria:
- [ ] Phase 1 prompt displays correctly
- [ ] Copy to clipboard works
- [ ] Can paste response into textarea
- [ ] "Save and Continue" advances to Phase 2
- [ ] Phase 2 prompt displays correctly

---

## Test 6: Export Functionality

### Steps:
1. Create a project with some data
2. Click project to open details
3. Click "Export" button
4. Verify JSON file downloads

### ✅ Pass Criteria:
- [ ] Export button is visible
- [ ] Clicking export triggers download
- [ ] JSON file is valid (can open in text editor)
- [ ] JSON contains project data

---

## Test 7: Port Conflict Handling

### Steps:
1. Start `PRD-Assistant-Windows.exe`
2. Without closing it, run it again (double-click .exe again)

### Expected Behavior:
- Second instance should fail with error:
  ```
  listen tcp :8080: bind: address already in use
  ```

### ✅ Pass Criteria:
- [ ] Second instance shows error message
- [ ] First instance continues running
- [ ] Error message is clear and understandable

---

## Test 8: Shutdown

### Steps:
1. With app running, close the console window
2. Verify browser tab still shows the page (but server is stopped)
3. Try to refresh the page

### Expected Behavior:
- Closing console window stops the server
- Browser shows "Unable to connect" when refreshed

### ✅ Pass Criteria:
- [ ] Console window closes cleanly
- [ ] No error dialogs appear
- [ ] Browser shows connection error on refresh (expected)

---

## Test 9: Browser Compatibility

### Steps:
1. Run `PRD-Assistant-Windows.exe`
2. If Edge opens, manually open Chrome and go to http://localhost:8080
3. Test basic functionality in different browser

### ✅ Pass Criteria:
- [ ] App works in Edge
- [ ] App works in Chrome
- [ ] App works in Firefox (if installed)
- [ ] UI renders correctly in all browsers

---

## Test 10: File Size and Performance

### Checks:
- [ ] .exe file is approximately 5.7 MB
- [ ] App starts in < 2 seconds
- [ ] Browser opens in < 2 seconds
- [ ] Web app loads in < 1 second
- [ ] No noticeable lag when using the app

---

## Issues to Report

If any test fails, please report:

1. **Test number and name**
2. **What you expected to happen**
3. **What actually happened**
4. **Error messages** (from console window or browser console)
5. **Screenshots** (if applicable)
6. **Windows version** (e.g., Windows 10, Windows 11)
7. **Browser and version** (e.g., Chrome 120, Edge 119)

---

## Success Criteria

**All tests must pass** for v0.5.0 to be considered ready for public release.

**Critical tests** (must pass):
- Test 2: Application Startup
- Test 3: Web App Functionality
- Test 4: Data Persistence

**Important tests** (should pass):
- Test 5: 3-Phase Workflow
- Test 6: Export Functionality

**Nice to have** (can have minor issues):
- Test 7: Port Conflict Handling
- Test 9: Browser Compatibility

---

## After Testing

Once all tests pass:
- [ ] Update this checklist with results
- [ ] Commit test results to repository
- [ ] Announce v0.5.0 is ready for use
- [ ] Share with colleagues for feedback

