/**
 * Main Application Entry Point
 * @module app
 */

import storage from './storage.js';
import { initRouter, updateStorageInfo } from './router.js';
import { loadDefaultPrompts } from './workflow.js';
import { exportAllProjects, importProjects } from './projects.js';
import { showToast, showLoading, hideLoading } from './ui.js';

/**
 * Initialize the application
 * @module app
 */
async function init() {
  try {
    showLoading('Initializing...');

    // Initialize IndexedDB
    await storage.init();
    console.log('✓ Storage initialized');

    // Load default prompts
    await loadDefaultPrompts();
    console.log('✓ Prompts loaded');

    // Initialize router
    initRouter();
    console.log('✓ Router initialized');

    // Setup global event listeners
    setupGlobalEventListeners();
    console.log('✓ Event listeners attached');

    // Update storage info
    await updateStorageInfo();

    hideLoading();
    console.log('✓ App ready');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    hideLoading();
    showToast('Failed to initialize app. Please refresh the page.', 'error', 5000);
  }
}

/**
 * Setup global event listeners
 * @module app
 */
function setupGlobalEventListeners() {
  // Related projects dropdown
  const relatedProjectsBtn = document.getElementById('related-projects-btn');
  const relatedProjectsMenu = document.getElementById('related-projects-menu');

  relatedProjectsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    relatedProjectsMenu.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    relatedProjectsMenu.classList.add('hidden');
  });

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Export all button
  const exportAllBtn = document.getElementById('export-all-btn');
  exportAllBtn.addEventListener('click', async () => {
    try {
      await exportAllProjects();
      showToast('All projects exported successfully!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showToast('Failed to export projects', 'error');
    }
  });

  // Import button
  const importBtn = document.getElementById('import-btn');
  importBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          showLoading('Importing...');
          const count = await importProjects(file);
          hideLoading();
          showToast(`Imported ${count} project${count > 1 ? 's' : ''} successfully!`, 'success');
          window.location.hash = '';
        } catch (error) {
          hideLoading();
          console.error('Import failed:', error);
          showToast('Failed to import projects. Please check the file format.', 'error');
        }
      }
    };
    input.click();
  });

  // Close privacy notice
  const closePrivacyNotice = document.getElementById('close-privacy-notice');
  closePrivacyNotice.addEventListener('click', () => {
    document.getElementById('privacy-notice').remove();
    storage.saveSetting('privacy-notice-dismissed', true);
  });

  // Check if privacy notice was dismissed
  storage.getSetting('privacy-notice-dismissed').then(dismissed => {
    if (dismissed) {
      document.getElementById('privacy-notice')?.remove();
    }
  });

  // About link
  const aboutLink = document.getElementById('about-link');
  aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    showAboutModal();
  });

}

/**
 * Toggle dark/light theme
 * @module app
 */
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');

  if (isDark) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    storage.saveSetting('theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    storage.saveSetting('theme', 'dark');
  }
}

/**
 * Load saved theme
 * @module app
 */
function loadTheme() {
  // Use localStorage for immediate synchronous access
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
}



/**
 * Show about modal
 * @module app
 */
function showAboutModal() {
  const prdDocUrl = 'https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/Project_Planning_Mechanisms%3A_Documents.md#prd-the-what-and-why';
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl shadow-xl">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📋 Product Requirements Assistant
            </h3>
            <div class="text-gray-700 dark:text-gray-300 space-y-3 mb-6">
                <p>A structured 3-phase workflow tool for creating <a href="${prdDocUrl}" target="_blank" rel="noopener" class="text-blue-600 dark:text-blue-400 hover:underline">Product Requirements Documents (PRDs)</a> with AI assistance.</p>
                <p><strong>100% Client-Side:</strong> All your data is stored locally in your browser using IndexedDB. Nothing is ever sent to any server.</p>
                <p><strong>Privacy-First:</strong> No tracking, no analytics, no cookies (except preferences).</p>
                <p><strong>Open Source:</strong> Available on GitHub under MIT license.</p>
            </div>
            <div class="flex justify-between items-center">
                <a href="https://github.com/bordenet/product-requirements-assistant" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">
                    View on GitHub →
                </a>
                <button id="close-about-btn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Close
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  modal.querySelector('#close-about-btn').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Load theme before init
loadTheme();

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
