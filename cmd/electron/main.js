const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const BACKEND_PORT = 8080;
const FRONTEND_PORT = 8501;
const STARTUP_TIMEOUT = 30000; // 30 seconds

let mainWindow;
let backendProcess;
let frontendProcess;

// Find project root (development vs production)
function getProjectRoot() {
  if (app.isPackaged) {
    // Production: resources are in app.asar or extraResources
    return process.resourcesPath;
  } else {
    // Development: go up from cmd/electron to project root
    return path.join(__dirname, '../..');
  }
}

// Wait for server to be ready
function waitForServer(url, timeout) {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeout;
    const checkServer = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else if (Date.now() < deadline) {
          setTimeout(checkServer, 500);
        } else {
          resolve(false);
        }
      }).on('error', () => {
        if (Date.now() < deadline) {
          setTimeout(checkServer, 500);
        } else {
          resolve(false);
        }
      });
    };
    checkServer();
  });
}

// Start Go backend server
async function startBackend() {
  const projectRoot = getProjectRoot();
  const backendDir = path.join(projectRoot, 'backend');
  
  console.log('Starting backend from:', backendDir);
  
  backendProcess = spawn('go', ['run', '.'], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: BACKEND_PORT.toString(),
      MOCK_AI_ENABLED: 'true'
    },
    stdio: 'inherit'
  });

  backendProcess.on('error', (err) => {
    console.error('Backend process error:', err);
  });

  backendProcess.on('exit', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });

  // Wait for backend to be ready
  const ready = await waitForServer(`http://localhost:${BACKEND_PORT}/api/health`, STARTUP_TIMEOUT);
  if (!ready) {
    throw new Error('Backend failed to start');
  }
  console.log('Backend server ready');
}

// Start Streamlit frontend server
async function startFrontend() {
  const projectRoot = getProjectRoot();
  const frontendDir = path.join(projectRoot, 'frontend');
  const venvPython = path.join(projectRoot, 'venv', 'bin', 'python');
  
  // Use venv python if available, otherwise system python
  const pythonCmd = require('fs').existsSync(venvPython) ? venvPython : 'python3';
  
  console.log('Starting frontend from:', frontendDir);
  
  frontendProcess = spawn(pythonCmd, [
    '-m', 'streamlit', 'run', 'app.py',
    '--server.port', FRONTEND_PORT.toString(),
    '--server.headless', 'true',
    '--browser.gatherUsageStats', 'false'
  ], {
    cwd: frontendDir,
    env: {
      ...process.env,
      BACKEND_URL: `http://localhost:${BACKEND_PORT}`
    },
    stdio: 'inherit'
  });

  frontendProcess.on('error', (err) => {
    console.error('Frontend process error:', err);
  });

  frontendProcess.on('exit', (code) => {
    console.log(`Frontend process exited with code ${code}`);
  });

  // Wait for frontend to be ready
  const ready = await waitForServer(`http://localhost:${FRONTEND_PORT}`, STARTUP_TIMEOUT);
  if (!ready) {
    throw new Error('Frontend failed to start');
  }
  console.log('Frontend server ready');
}

// Create main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'Product Requirements Assistant',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../../build/electron/icons/icon.png')
  });

  mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);

  // Open DevTools in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize application
app.whenReady().then(async () => {
  try {
    console.log('Starting Product Requirements Assistant (Electron)');
    
    // Start backend and frontend servers
    await startBackend();
    await startFrontend();
    
    // Create window
    createWindow();
  } catch (error) {
    console.error('Failed to start application:', error);
    app.quit();
  }
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Cleanup on quit
app.on('before-quit', () => {
  console.log('Shutting down servers...');
  
  if (frontendProcess) {
    frontendProcess.kill();
  }
  
  if (backendProcess) {
    backendProcess.kill();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

