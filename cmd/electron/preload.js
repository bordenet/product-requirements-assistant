// Preload script for Electron
// This script runs before the web page is loaded and has access to both
// Node.js APIs and the web page's DOM

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  version: process.versions.electron
});

console.log('Preload script loaded');

