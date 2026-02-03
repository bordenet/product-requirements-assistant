/**
 * Mutation Tracker - Detects and displays active prompt optimizations
 * @module mutation-tracker
 *
 * The PRD Assistant prompts have been optimized through evolutionary tuning.
 * This module tracks which mutations are currently active in the prompts.
 */

/**
 * Known mutations from evolutionary optimization
 * Each mutation has a name, description, target phase, and detection pattern
 */
export const KNOWN_MUTATIONS = [
  {
    id: 'ban-vague-language',
    name: 'Ban Vague Language',
    icon: '🎯',
    phase: 1,
    impact: '+6.0%',
    description: 'Forces specificity by banning vague terms like "improve", "enhance", "better"',
    detectionPattern: /Mutation 1: Banned Vague Language|NEVER use these vague terms/i
  },
  {
    id: 'no-implementation',
    name: 'Focus on What, Not How',
    icon: '🚫',
    phase: 1,
    impact: '+5.4%',
    description: 'Prevents technical implementation details in PRDs',
    detectionPattern: /Mutation 2: Focus on.*NOT.*How|FORBIDDEN.*Implementation/i
  },
  {
    id: 'adversarial-tension',
    name: 'Adversarial Review',
    icon: '⚔️',
    phase: 2,
    impact: '+2.9%',
    description: 'Phase 2 genuinely challenges Phase 1 rather than just improving it',
    detectionPattern: /Mutation 3: Enhance Adversarial Tension|Your Role is to CHALLENGE/i
  },
  {
    id: 'stakeholder-impact',
    name: 'Stakeholder Impact',
    icon: '👥',
    phase: 1,
    impact: '+2.6%',
    description: 'Requires quantified impact for each stakeholder group',
    detectionPattern: /Mutation 4: Stakeholder Impact|Role.*Impact.*Needs.*Success Criteria/i
  },
  {
    id: 'quantified-metrics',
    name: 'Quantified Success Metrics',
    icon: '📊',
    phase: 1,
    impact: '+2.5%',
    description: 'Requires baseline + target + timeline for all metrics',
    detectionPattern: /Mutation 5: Require Quantified Success Metrics|Baseline.*Target.*Timeline/i
  }
];

/**
 * Detect which mutations are active in a prompt
 * @param {string} promptContent - The prompt markdown content
 * @returns {Array} Array of active mutation objects
 */
export function detectActiveMutations(promptContent) {
  return KNOWN_MUTATIONS.filter(mutation => mutation.detectionPattern.test(promptContent));
}

/**
 * Get total quality improvement from active mutations
 * @param {Array} activeMutations - Array of active mutation objects
 * @returns {string} Total improvement percentage as string
 */
export function getTotalImprovement(activeMutations) {
  const total = activeMutations.reduce((sum, m) => {
    const pct = parseFloat(m.impact.replace(/[+%]/g, ''));
    return sum + (isNaN(pct) ? 0 : pct);
  }, 0);
  return `+${total.toFixed(1)}%`;
}

/**
 * Render mutation status badge HTML
 * @param {Array} activeMutations - Array of active mutation objects
 * @returns {string} HTML string for mutation status badge
 */
export function renderMutationBadge(activeMutations) {
  if (activeMutations.length === 0) {
    return '<span class="text-gray-500 text-sm">No optimizations active</span>';
  }

  const improvement = getTotalImprovement(activeMutations);

  return `
    <div class="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
      <span class="font-medium">🧬 ${activeMutations.length} optimizations active</span>
      <span class="text-purple-500 dark:text-purple-400">${improvement} quality</span>
    </div>
  `;
}

/**
 * Render detailed mutation list HTML
 * @param {Array} activeMutations - Array of active mutation objects
 * @returns {string} HTML string for mutation list
 */
export function renderMutationList(activeMutations) {
  if (activeMutations.length === 0) {
    return '<p class="text-gray-500">No prompt optimizations detected.</p>';
  }

  return `
    <div class="space-y-2">
      ${activeMutations.map(m => `
        <div class="flex items-start gap-3 p-2 rounded bg-gray-50 dark:bg-gray-700/50">
          <span class="text-lg">${m.icon}</span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-900 dark:text-white">${m.name}</span>
              <span class="px-1.5 py-0.5 text-xs rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">${m.impact}</span>
              <span class="px-1.5 py-0.5 text-xs rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">Phase ${m.phase}</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">${m.description}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Get mutation summary for display
 * @returns {Object} Summary object with count, improvement, and mutations array
 */
export function getMutationSummary() {
  return {
    count: KNOWN_MUTATIONS.length,
    totalImprovement: getTotalImprovement(KNOWN_MUTATIONS),
    mutations: KNOWN_MUTATIONS
  };
}
