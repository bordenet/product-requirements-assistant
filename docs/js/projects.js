/**
 * Project Management Module
 * Handles project CRUD operations and business logic
 * @module projects
 */

import storage from './storage.js';

/**
 * Create a new project
 */
export async function createProject(title, problems, context) {
  const project = {
    id: crypto.randomUUID(),
    title: title.trim(),
    problems: problems.trim(),
    context: context.trim(),
    phase: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    phases: {
      1: { prompt: '', response: '', completed: false },
      2: { prompt: '', response: '', completed: false },
      3: { prompt: '', response: '', completed: false }
    }
  };

  await storage.saveProject(project);
  return project;
}

/**
 * Get all projects
 */
export async function getAllProjects() {
  return await storage.getAllProjects();
}

/**
 * Get a single project
 */
export async function getProject(id) {
  return await storage.getProject(id);
}

/**
 * Update project phase data
 * @param {string} projectId - The project ID
 * @param {number} phase - The phase number
 * @param {string} prompt - The prompt text
 * @param {string} response - The response text
 * @param {Object} options - Optional configuration
 * @param {boolean} options.skipAutoAdvance - If true, don't auto-advance to next phase
 */
export async function updatePhase(projectId, phase, prompt, response, options = {}) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  project.phases[phase] = {
    prompt: prompt || '',
    response: response || '',
    completed: !!response
  };

  // Auto-advance to next phase if current phase is completed (unless skipAutoAdvance is set)
  if (response && phase < 3 && !options.skipAutoAdvance) {
    project.phase = phase + 1;
  }

  project.updatedAt = new Date().toISOString();
  await storage.saveProject(project);
  return project;
}

/**
 * Update project metadata
 */
export async function updateProject(projectId, updates) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  Object.assign(project, updates);
  await storage.saveProject(project);
  return project;
}

/**
 * Delete a project
 */
export async function deleteProject(id) {
  await storage.deleteProject(id);
}

/**
 * Export a single project as JSON
 */
export async function exportProject(projectId) {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFilename(project.title)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export all projects as a backup JSON
 */
export async function exportAllProjects() {
  const projects = await storage.getAllProjects();

  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    projectCount: projects.length,
    projects: projects
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `prd-assistant-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import projects from JSON file
 */
export async function importProjects(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = JSON.parse(e.target.result);
        let imported = 0;

        if (content.version && content.projects) {
          // Backup file format
          for (const project of content.projects) {
            await storage.saveProject(project);
            imported++;
          }
        } else if (content.id && content.title) {
          // Single project format
          await storage.saveProject(content);
          imported = 1;
        } else {
          throw new Error('Invalid file format');
        }

        resolve(imported);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/**
 * Sanitize filename for export
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .substring(0, 50);
}
