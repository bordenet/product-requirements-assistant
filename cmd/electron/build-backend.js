#!/usr/bin/env node

/**
 * Build script for Electron packaging
 * 
 * This script:
 * 1. Compiles the Go backend for the target platform
 * 2. Bundles Python with Streamlit and dependencies
 * 3. Copies frontend files
 * 
 * Run before electron-builder to prepare all resources.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '../..');
const distDir = path.join(__dirname, 'dist');

// Determine target platform
const platform = process.platform;
const arch = process.arch;

console.log('='.repeat(60));
console.log('Building PRD Assistant for Electron');
console.log('='.repeat(60));
console.log(`Platform: ${platform}`);
console.log(`Architecture: ${arch}`);
console.log('');

// Clean dist directory
console.log('Cleaning dist directory...');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Step 1: Compile Go backend
console.log('');
console.log('Step 1: Compiling Go backend...');
const backendDir = path.join(projectRoot, 'backend');
const backendDistDir = path.join(distDir, 'backend');
fs.mkdirSync(backendDistDir, { recursive: true });

const exeName = platform === 'win32' ? 'prd-assistant.exe' : 'prd-assistant';
const backendExe = path.join(backendDistDir, exeName);

try {
  execSync(`go build -o "${backendExe}" .`, {
    cwd: backendDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      CGO_ENABLED: '0' // Static binary
    }
  });
  console.log(`✓ Backend compiled: ${backendExe}`);
} catch (error) {
  console.error('✗ Failed to compile backend');
  process.exit(1);
}

// Step 2: Bundle Python with Streamlit
console.log('');
console.log('Step 2: Bundling Python with Streamlit...');
console.log('');
console.log('⚠️  WARNING: Python bundling is complex and platform-specific.');
console.log('');
console.log('For a truly self-contained installer, you need:');
console.log('  1. Embedded Python distribution (Windows: python.org/downloads/windows/)');
console.log('  2. Install Streamlit and dependencies into embedded Python');
console.log('  3. Package everything with electron-builder');
console.log('');
console.log('This is a multi-hour task. For now, this build script will:');
console.log('  - Compile the Go backend ✓');
console.log('  - Copy frontend files ✓');
console.log('  - Skip Python bundling (requires manual setup)');
console.log('');
console.log('See: https://github.com/indygreg/python-build-standalone');
console.log('');

// Step 3: Copy frontend files
console.log('Step 3: Copying frontend files...');
const frontendSrc = path.join(projectRoot, 'frontend');
const frontendDist = path.join(distDir, 'frontend');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name !== '__pycache__' && entry.name !== '.pytest_cache') {
        copyDir(srcPath, destPath);
      }
    } else {
      if (entry.name.endsWith('.py') || entry.name.endsWith('.txt')) {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

copyDir(frontendSrc, frontendDist);
console.log(`✓ Frontend copied to: ${frontendDist}`);

// Summary
console.log('');
console.log('='.repeat(60));
console.log('Build Summary');
console.log('='.repeat(60));
console.log(`✓ Backend: ${backendExe}`);
console.log(`✓ Frontend: ${frontendDist}`);
console.log(`✗ Python: NOT BUNDLED (requires manual setup)`);
console.log('');
console.log('⚠️  The Electron installer will NOT be self-contained without Python.');
console.log('');
console.log('To create a truly self-contained installer:');
console.log('  1. Download embedded Python for your platform');
console.log('  2. Install Streamlit: python -m pip install streamlit requests');
console.log('  3. Copy to cmd/electron/dist/python/');
console.log('  4. Run: npm run build:win');
console.log('');

