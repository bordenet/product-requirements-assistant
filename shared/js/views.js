/**
 * Views Module
 * @module views
 * Handles rendering different views/screens
 * @module views
 */

import { getAllProjects, createProject, deleteProject, getProject, updateProject } from './projects.js';
import { formatDate, escapeHtml, confirm, showToast, showDocumentPreviewModal } from './ui.js';
import { navigateTo } from './router.js';
import { getFinalMarkdown, getExportFilename } from './workflow.js';
import { getAllTemplates, getTemplate } from './document-specific-templates.js';
import { validateDocument, getScoreColor, getScoreLabel } from '../../validator/js/validator.js';
import { showImportModal } from './import-prd.js';

// PRD documentation URL
const PRD_DOC_URL = 'https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/Project_Planning_Mechanisms%3A_Documents.md#prd-the-what-and-why';

/**
 * Render the projects list view
 * @module views
 */
export async function renderProjectsList() {
  const projects = await getAllProjects();

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="mb-6 flex items-center justify-between">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white">
                My <a href="${PRD_DOC_URL}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300">PRDs</a>
            </h2>
            <button id="new-project-btn" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                + New PRD
            </button>
        </div>

        ${projects.length === 0 ? `
            <div class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <span class="text-6xl mb-4 block">📋</span>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No PRDs yet
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first <a href="${PRD_DOC_URL}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300">Product Requirements Document</a>
                </p>
                <button id="new-project-btn-empty" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    + Create Your First PRD
                </button>
            </div>
        ` : `
            <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                ${projects.map(project => {
    // Check if all phases are complete
    const isComplete = project.phases &&
                        project.phases[1]?.completed &&
                        project.phases[2]?.completed &&
                        project.phases[3]?.completed;

    // Count COMPLETED phases (not current phase)
    const completedPhases = project.phases
      ? [1, 2, 3].filter(phase => project.phases[phase]?.completed).length
      : 0;

    // Calculate score for completed projects
    let scoreData = null;
    if (isComplete && project.phases?.[3]?.response) {
      const validation = validateDocument(project.phases[3].response);
      scoreData = {
        score: validation.totalScore,
        color: getScoreColor(validation.totalScore),
        label: getScoreLabel(validation.totalScore)
      };
    }
    return `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer" data-project-id="${project.id}">
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-3">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                                    ${escapeHtml(project.title)}
                                </h3>
                                <div class="flex items-center space-x-2">
                                    ${isComplete ? `
                                    <button class="preview-project-btn text-gray-400 hover:text-blue-600 transition-colors" data-project-id="${project.id}" title="Preview & Copy">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                    ` : ''}
                                    <button class="delete-project-btn text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}" title="Delete">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            ${scoreData ? `
                            <!-- Completed: Show quality score -->
                            <div class="mb-3">
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">Quality Score</span>
                                    <span class="text-xs font-medium text-${scoreData.color}-600 dark:text-${scoreData.color}-400">${scoreData.score}% · ${scoreData.label}</span>
                                </div>
                                <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                    <div class="bg-${scoreData.color}-500 h-1.5 rounded-full" style="width: ${scoreData.score}%"></div>
                                </div>
                            </div>
                            ` : `
                            <!-- In Progress: Show phase progress as segments (green=done, blue=current, gray=future) -->
                            <div class="flex items-center space-x-2 mb-3">
                                <div class="flex space-x-1 flex-1">
                                    ${[1, 2, 3].map(phase => {
    const isCompleted = project.phases && project.phases[phase]?.completed;
    const currentPhase = project.phase || project.currentPhase || 1;
    const isCurrent = phase === currentPhase && !isCompleted;
    const colorClass = isCompleted ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600';
    return `<div class="flex-1 h-1.5 rounded ${colorClass}"></div>`;
  }).join('')}
                                </div>
                                <span class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">${completedPhases}/3</span>
                            </div>
                            `}

                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                ${escapeHtml(project.problems || '')}
                            </p>

                            <div class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                Updated ${formatDate(project.updatedAt)}
                            </div>
                        </div>
                    </div>
                `;}).join('')}
            </div>
        `}
    `;

  // Event listeners
  const newProjectBtns = container.querySelectorAll('#new-project-btn, #new-project-btn-empty');
  newProjectBtns.forEach(btn => {
    btn.addEventListener('click', () => navigateTo('new-project'));
  });

  const projectCards = container.querySelectorAll('[data-project-id]');
  projectCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-project-btn') && !e.target.closest('.preview-project-btn')) {
        navigateTo('project', card.dataset.projectId);
      }
    });
  });

  // Preview buttons (for completed projects)
  const previewBtns = container.querySelectorAll('.preview-project-btn');
  previewBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const markdown = getFinalMarkdown(project);
        if (markdown) {
          showDocumentPreviewModal(markdown, 'Your PRD is Ready', getExportFilename(project));
        } else {
          showToast('No content to preview', 'warning');
        }
      }
    });
  });

  const deleteBtns = container.querySelectorAll('.delete-project-btn');
  deleteBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const projectId = btn.dataset.projectId;
      const project = projects.find(p => p.id === projectId);

      if (await confirm(`Are you sure you want to delete "${project.title}"?`, 'Delete Project')) {
        await deleteProject(projectId);
        showToast('Project deleted', 'success');
        renderProjectsList();
      }
    });
  });
}

/**
 * Render the new project form
 * @module views
 */
export function renderNewProjectForm() {
  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="max-w-5xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to Projects
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Create New <a href="${PRD_DOC_URL}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300">PRD</a>
                </h2>

                <!-- Template Selector -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Choose a Template
                    </label>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" id="template-selector">
                        ${getAllTemplates().map(t => `
                            <button type="button"
                                class="template-btn p-2 border-2 rounded-lg text-center transition-all hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${t.id === 'blank' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600'}"
                                data-template-id="${t.id}">
                                <span class="text-lg block mb-0.5">${t.icon}</span>
                                <span class="text-xs font-medium text-gray-900 dark:text-white block line-clamp-1">${t.name}</span>
                                <span class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">${t.description}</span>
                            </button>
                        `).join('')}
                        <!-- Import Existing PRD tile -->
                        <button type="button"
                            id="import-prd-btn"
                            class="p-2 border-2 border-dashed rounded-lg text-center transition-all hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 border-gray-300 dark:border-gray-600">
                            <span class="text-lg block mb-0.5">📥</span>
                            <span class="text-xs font-medium text-gray-900 dark:text-white block line-clamp-1">Import PRD</span>
                            <span class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">Paste from Word/Docs</span>
                        </button>
                    </div>
                </div>

                <form id="new-project-form" class="space-y-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Project Title <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., User Authentication System"
                        >
                    </div>

                    <div>
                        <label for="problems" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Problems to Solve <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="problems"
                            name="problems"
                            required
                            rows="8"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                            placeholder="Describe the problems this project will address..."
                        ></textarea>
                    </div>

                    <div>
                        <label for="context" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional Context
                        </label>
                        <textarea
                            id="context"
                            name="context"
                            rows="10"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                            placeholder="Any simplifications, considerations, constraints, or other context..."
                        ></textarea>
                    </div>

                    <!-- Footer (ADR-style: Create on left, Cancel on right) -->
                    <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button type="submit" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Create
                        </button>
                        <button type="button" id="cancel-btn" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => navigateTo('home'));
  document.getElementById('cancel-btn').addEventListener('click', () => navigateTo('home'));

  // Import PRD button handler
  document.getElementById('import-prd-btn').addEventListener('click', () => {
    showImportModal();
  });

  // Template selector event handlers
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const templateId = btn.dataset.templateId;
      const template = getTemplate(templateId);

      if (template) {
        // Update selection UI
        document.querySelectorAll('.template-btn').forEach(b => {
          b.classList.remove('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');
          b.classList.add('border-gray-200', 'dark:border-gray-600');
        });
        btn.classList.remove('border-gray-200', 'dark:border-gray-600');
        btn.classList.add('border-blue-500', 'bg-blue-50', 'dark:bg-blue-900/20');

        // Populate form fields with template content
        document.getElementById('problems').value = template.problems;
        document.getElementById('context').value = template.context;
      }
    });
  });

  document.getElementById('new-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const target = /** @type {HTMLFormElement} */ (e.target);
    const formData = Object.fromEntries(new FormData(target));
    const project = await createProject(/** @type {import('./types.js').ProjectFormData} */ (formData));
    showToast('Project created successfully!', 'success');
    navigateTo('project', project.id);
  });
}

/**
 * Render the edit project form
 * @module views
 */
export async function renderEditProjectForm(projectId) {
  const project = await getProject(projectId);

  if (!project) {
    showToast('Project not found', 'error');
    navigateTo('home');
    return;
  }

  const container = document.getElementById('app-container');
  container.innerHTML = `
        <div class="max-w-5xl mx-auto">
            <div class="mb-6">
                <button id="back-btn" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                    <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    Back to PRD
                </button>
            </div>

            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Edit <a href="${PRD_DOC_URL}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-700 dark:hover:text-blue-300">PRD</a> Details
                </h2>

                <form id="edit-project-form" class="space-y-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Project Title <span class="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            required
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            value="${escapeHtml(project.title)}"
                        >
                    </div>

                    <div>
                        <label for="problems" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Problems to Solve <span class="text-red-500">*</span>
                        </label>
                        <textarea
                            id="problems"
                            name="problems"
                            required
                            rows="4"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >${escapeHtml(project.problems)}</textarea>
                    </div>

                    <div>
                        <label for="context" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Additional Context
                        </label>
                        <textarea
                            id="context"
                            name="context"
                            rows="6"
                            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >${escapeHtml(project.context || '')}</textarea>
                    </div>

                    <!-- Footer (One-Pager style: Save and Cancel on left, Delete on right) -->
                    <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div class="flex gap-3">
                            <button type="submit" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                                Save Changes
                            </button>
                            <button type="button" id="cancel-btn" class="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                                Cancel
                            </button>
                        </div>
                        <button type="button" id="delete-btn" class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                            Delete
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

  // Event listeners
  document.getElementById('back-btn').addEventListener('click', () => navigateTo('project', projectId));
  document.getElementById('cancel-btn').addEventListener('click', () => navigateTo('project', projectId));

  document.getElementById('delete-btn').addEventListener('click', async () => {
    if (await confirm(`Are you sure you want to delete "${project.title}"?`, 'Delete PRD')) {
      await deleteProject(projectId);
      showToast('PRD deleted', 'success');
      navigateTo('home');
    }
  });

  document.getElementById('edit-project-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const title = formData.get('title');
    const problems = formData.get('problems');
    const context = formData.get('context') || '';

    await updateProject(projectId, { title, problems, context });
    showToast('Changes saved!', 'success');
    navigateTo('project', projectId);
  });
}
