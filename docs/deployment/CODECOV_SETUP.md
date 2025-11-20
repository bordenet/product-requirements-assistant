# Codecov Setup Guide

This guide walks through setting up Codecov for code coverage reporting.

## Overview

Codecov provides:
- **Coverage badges** for README
- **Coverage reports** on pull requests
- **Coverage trends** over time
- **Coverage visualization** by file/function

## Prerequisites

- GitHub account with admin access to the repository
- Repository must be public or have a Codecov plan

## Setup Steps

### 1. Sign Up for Codecov

1. Go to https://about.codecov.io/sign-up/
2. Click **"Sign up with GitHub"**
3. Authorize Codecov to access your GitHub account
4. Select the repositories you want to enable (or enable all)

### 2. Get Your Upload Token

1. After signing up, go to https://app.codecov.io/gh/bordenet/product-requirements-assistant
2. Click **"Settings"** in the left sidebar
3. Copy the **"Repository Upload Token"** (starts with a UUID format)
4. Keep this token secure - you'll need it in the next step

### 3. Add Token to GitHub Secrets

**Option A: Using GitHub CLI (Recommended)**

```bash
# Replace YOUR_TOKEN_HERE with the actual token from Codecov
gh secret set CODECOV_TOKEN --body "YOUR_TOKEN_HERE"
```

**Option B: Using GitHub Web UI**

1. Go to https://github.com/bordenet/product-requirements-assistant/settings/secrets/actions
2. Click **"New repository secret"**
3. Name: `CODECOV_TOKEN`
4. Value: Paste the token from Codecov
5. Click **"Add secret"**

### 4. Verify Configuration

The CI workflow is already configured to use the token:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./backend/coverage.out
    flags: backend
    fail_ci_if_error: false
```

### 5. Update Badge Token (Optional)

The README badge includes a token parameter for private repos. For public repos, you can simplify:

**Current (works for both public and private):**
```markdown
[![codecov](https://codecov.io/gh/bordenet/product-requirements-assistant/graph/badge.svg?token=CODECOV_TOKEN)](https://codecov.io/gh/bordenet/product-requirements-assistant)
```

**Simplified (public repos only):**
```markdown
[![codecov](https://codecov.io/gh/bordenet/product-requirements-assistant/graph/badge.svg)](https://codecov.io/gh/bordenet/product-requirements-assistant)
```

### 6. Test the Integration

1. Make a small change to trigger CI (or push the setup commit)
2. Wait for CI to complete
3. Check the CI logs for "Upload coverage to Codecov" step
4. Verify upload succeeded (should see "Coverage report uploaded")
5. Visit https://app.codecov.io/gh/bordenet/product-requirements-assistant to see coverage

## Troubleshooting

### Token Not Found Error

**Error:** `Error: Codecov token not found`

**Solution:** Verify the secret is named exactly `CODECOV_TOKEN` (case-sensitive)

```bash
# Check if secret exists
gh secret list | grep CODECOV_TOKEN
```

### Upload Failed - 401 Unauthorized

**Error:** `Error uploading to Codecov: 401 Unauthorized`

**Solution:** Token is invalid or expired. Get a new token from Codecov settings.

### Upload Failed - 429 Rate Limit

**Error:** `Error uploading to Codecov: 429 Rate limit reached`

**Solution:** This happens when uploading without a token. Ensure `CODECOV_TOKEN` secret is set.

### Badge Not Updating

**Issue:** Badge shows "unknown" or old coverage percentage

**Solution:** 
1. Check that uploads are succeeding in CI logs
2. Clear browser cache
3. Wait a few minutes for Codecov to process the upload
4. Verify badge URL matches your repository

## Configuration Options

### Fail CI on Coverage Drop

To fail CI if coverage decreases:

```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./backend/coverage.out
    flags: backend
    fail_ci_if_error: true  # Changed from false
```

### Coverage Thresholds

Configure in `codecov.yml` at repository root:

```yaml
coverage:
  status:
    project:
      default:
        target: 80%
        threshold: 5%
    patch:
      default:
        target: 80%
```

## Resources

- **Codecov Dashboard:** https://app.codecov.io/gh/bordenet/product-requirements-assistant
- **Codecov Docs:** https://docs.codecov.com/
- **GitHub Action:** https://github.com/codecov/codecov-action
- **Support:** https://community.codecov.com/

## Security Notes

- ✅ Token is stored as a GitHub secret (encrypted)
- ✅ Token is not exposed in CI logs
- ✅ Token can be rotated at any time from Codecov settings
- ✅ `fail_ci_if_error: false` prevents CI failures if Codecov is down

