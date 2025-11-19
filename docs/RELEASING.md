# Creating a Release

This document explains how to create a new release with downloadable executables.

## Automated Release Process

The GitHub Actions workflow automatically builds executables for all platforms when you create a git tag.

### Steps to Create a Release

1. **Ensure all changes are committed and pushed to main**
   ```bash
   git status  # Should show clean working tree
   ```

2. **Create and push a version tag**
   ```bash
   # Create tag (e.g., v1.5.0)
   git tag v1.5.0
   
   # Push tag to GitHub
   git push origin v1.5.0
   ```

3. **Wait for GitHub Actions to complete**
   - Go to: https://github.com/bordenet/product-requirements-assistant/actions
   - The "Build and Release" workflow will start automatically
   - Wait for all jobs to complete (~10-15 minutes)

4. **Verify the release**
   - Go to: https://github.com/bordenet/product-requirements-assistant/releases
   - The new release should be created with all executables attached

## What Gets Built

### WebView2 Native Client
- `prd-assistant-macos-amd64` - macOS Intel (8.7MB)
- `prd-assistant-macos-arm64` - macOS Apple Silicon (8.2MB)
- `prd-assistant-windows-amd64.exe` - Windows (~10MB)
- `prd-assistant-linux-amd64` - Linux (~10MB)

### Electron Client
- `*.dmg` - macOS installer (~150MB)
- `*.exe` - Windows installer (~150MB)
- `*.AppImage` - Linux portable app (~150MB)

## Manual Workflow Trigger

You can also trigger the build manually without creating a tag:

1. Go to: https://github.com/bordenet/product-requirements-assistant/actions
2. Click "Build and Release" workflow
3. Click "Run workflow"
4. Select branch (usually `main`)
5. Click "Run workflow"

**Note**: Manual runs will build the executables but won't create a GitHub Release automatically.

## Version Numbering

Follow semantic versioning:
- **Major** (v2.0.0): Breaking changes
- **Minor** (v1.5.0): New features, backward compatible
- **Patch** (v1.5.1): Bug fixes

## Troubleshooting

### Build fails on Windows
- Ensure CGO is properly configured
- Check that MinGW-w64 is available in the runner

### Build fails on Linux
- Ensure `libwebkit2gtk-4.0-dev` is installed
- Check the workflow logs for missing dependencies

### Electron build fails
- Verify `package.json` has correct build scripts
- Check that all dependencies are properly listed

### Release not created
- Ensure you pushed a tag starting with `v`
- Check that the workflow completed successfully
- Verify GITHUB_TOKEN has proper permissions

## Testing Before Release

Before creating a release tag, test the build process locally:

```bash
# Test WebView2 build
./run-thick-clients.sh
# Select option 3 (Build only)

# Test Electron build
cd cmd/electron
npm install
npm run build:mac  # or build:win, build:linux
```

## Deleting a Release

If you need to delete a release:

1. Delete the release on GitHub
2. Delete the tag locally and remotely:
   ```bash
   git tag -d v1.5.0
   git push origin :refs/tags/v1.5.0
   ```

## Next Steps After Release

1. Update README.md if needed
2. Announce the release
3. Monitor for issues
4. Plan next version

