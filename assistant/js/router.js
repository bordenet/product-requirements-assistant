/**
 * Router Module
 * @module router
 * Handles client-side routing
 * @module router
 */

import { renderProjectsList, renderNewProjectForm, renderEditProjectForm } from './views.js';
import { renderProjectView } from './project-view.js';
import storage from './storage.js';
import { formatBytes } from './ui.js';

const routes = {
  'home': renderProjectsList,
  'new-project': renderNewProjectForm,
  'project': renderProjectView,
  'edit-project': renderEditProjectForm
};

let currentRoute = null;
let currentParams = null;

/**
 * Update storage info in footer - called after every route render
 * @module router
 */
export async function updateStorageInfo() {
  const estimate = await storage.getStorageEstimate();
  const storageInfo = document.getElementById('storage-info');

  if (!storageInfo) return;

  if (estimate) {
    const used = formatBytes(estimate.usage || 0);
    const quota = formatBytes(estimate.quota || 0);
    const percent = ((estimate.usage / estimate.quota) * 100).toFixed(1);
    storageInfo.textContent = `Storage: ${used} / ${quota} (${percent}%)`;
  } else {
    storageInfo.textContent = 'Storage: Available';
  }
}

/**
 * Navigate to a route
 * @module router
 */
export async function navigateTo(route, ...params) {
  currentRoute = route;
  currentParams = params;

  // Update URL hash
  if (route === 'home') {
    window.location.hash = '';
  } else if (route === 'new-project') {
    window.location.hash = '#new';
  } else if (route === 'project' && params[0]) {
    window.location.hash = `#project/${params[0]}`;
  } else if (route === 'edit-project' && params[0]) {
    window.location.hash = `#edit/${params[0]}`;
  }

  // Render the route
  const handler = routes[route];
  if (handler) {
    await handler(...params);
    // Update footer stats after every route render
    await updateStorageInfo();
  } else {
    console.error(`Route not found: ${route}`);
    await navigateTo('home');
  }
}

/**
 * Initialize router
 * @module router
 */
export function initRouter() {
  // Handle hash changes
  window.addEventListener('hashchange', handleHashChange);

  // Handle initial load
  handleHashChange();
}

/**
 * Handle hash change events
 * @module router
 */
async function handleHashChange() {
  const hash = window.location.hash.slice(1); // Remove #

  if (!hash) {
    await navigateTo('home');
  } else if (hash === 'new') {
    await navigateTo('new-project');
  } else if (hash.startsWith('project/')) {
    const projectId = hash.split('/')[1];
    await navigateTo('project', projectId);
  } else if (hash.startsWith('edit/')) {
    const projectId = hash.split('/')[1];
    await navigateTo('edit-project', projectId);
  } else {
    await navigateTo('home');
  }
}

/**
 * Get current route
 * @module router
 */
export function getCurrentRoute() {
  return { route: currentRoute, params: currentParams };
}
