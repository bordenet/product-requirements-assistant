/**
 * IndexedDB Storage Module
 * Handles all client-side data persistence
 */

const DB_NAME = 'prd-assistant';
const DB_VERSION = 1;

class Storage {
  constructor() {
    this.db = null;
  }

  /**
     * Initialize the database
     */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          projectStore.createIndex('title', 'title', { unique: false });
          projectStore.createIndex('phase', 'phase', { unique: false });
        }

        // Prompts store
        if (!db.objectStoreNames.contains('prompts')) {
          db.createObjectStore('prompts', { keyPath: 'phase' });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
     * Get all projects, sorted by last updated
     */
  async getAllProjects() {
    const tx = this.db.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');
    const index = store.index('updatedAt');
        
    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev'); // Descending order
      const projects = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          projects.push(cursor.value);
          cursor.continue();
        } else {
          resolve(projects);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Get a single project by ID
     */
  async getProject(id) {
    const tx = this.db.transaction('projects', 'readonly');
    const store = tx.objectStore('projects');
        
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Save a project (create or update)
     */
  async saveProject(project) {
    project.updatedAt = new Date().toISOString();
        
    const tx = this.db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
        
    return new Promise((resolve, reject) => {
      const request = store.put(project);
      request.onsuccess = () => resolve(project);
      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Delete a project
     */
  async deleteProject(id) {
    const tx = this.db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
        
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Get a prompt by phase
     */
  async getPrompt(phase) {
    const tx = this.db.transaction('prompts', 'readonly');
    const store = tx.objectStore('prompts');
        
    return new Promise((resolve, reject) => {
      const request = store.get(phase);
      request.onsuccess = () => resolve(request.result?.content || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Save a prompt
     */
  async savePrompt(phase, content) {
    const tx = this.db.transaction('prompts', 'readwrite');
    const store = tx.objectStore('prompts');
        
    return new Promise((resolve, reject) => {
      const request = store.put({ phase, content });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Get a setting
     */
  async getSetting(key) {
    const tx = this.db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
        
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Save a setting
     */
  async saveSetting(key, value) {
    const tx = this.db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
        
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
     * Get storage usage estimate
     */
  async getStorageEstimate() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate();
    }
    return null;
  }
}

export default new Storage();

