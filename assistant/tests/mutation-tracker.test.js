/**
 * Tests for mutation-tracker.js module
 *
 * Tests the prompt optimization tracking functionality.
 */

import {
  KNOWN_MUTATIONS,
  detectActiveMutations,
  getTotalImprovement,
  renderMutationBadge,
  renderMutationList,
  getMutationSummary
} from '../js/mutation-tracker.js';

describe('KNOWN_MUTATIONS', () => {
  test('should have 5 known mutations', () => {
    expect(KNOWN_MUTATIONS).toHaveLength(5);
  });

  test('each mutation should have required fields', () => {
    KNOWN_MUTATIONS.forEach(mutation => {
      expect(mutation.id).toBeDefined();
      expect(mutation.name).toBeDefined();
      expect(mutation.icon).toBeDefined();
      expect(mutation.phase).toBeDefined();
      expect(mutation.impact).toBeDefined();
      expect(mutation.description).toBeDefined();
      expect(mutation.detectionPattern).toBeInstanceOf(RegExp);
    });
  });

  test('should include ban-vague-language mutation', () => {
    const mutation = KNOWN_MUTATIONS.find(m => m.id === 'ban-vague-language');
    expect(mutation).toBeDefined();
    expect(mutation.impact).toBe('+6.0%');
  });

  test('should include adversarial-tension mutation', () => {
    const mutation = KNOWN_MUTATIONS.find(m => m.id === 'adversarial-tension');
    expect(mutation).toBeDefined();
    expect(mutation.phase).toBe(2);
  });
});

describe('detectActiveMutations', () => {
  test('should detect mutations by pattern', () => {
    const content = 'Mutation 1: Banned Vague Language in this prompt';
    const active = detectActiveMutations(content);
    expect(active).toHaveLength(1);
    expect(active[0].id).toBe('ban-vague-language');
  });

  test('should return empty array for no matches', () => {
    const content = 'Just a regular prompt with no mutations';
    const active = detectActiveMutations(content);
    expect(active).toHaveLength(0);
  });

  test('should detect multiple mutations', () => {
    const content = 'NEVER use these vague terms. Your Role is to CHALLENGE.';
    const active = detectActiveMutations(content);
    expect(active.length).toBeGreaterThanOrEqual(2);
  });
});

describe('getTotalImprovement', () => {
  test('should calculate total improvement', () => {
    const mutations = [
      { impact: '+6.0%' },
      { impact: '+2.5%' }
    ];
    expect(getTotalImprovement(mutations)).toBe('+8.5%');
  });

  test('should return +0.0% for empty array', () => {
    expect(getTotalImprovement([])).toBe('+0.0%');
  });

  test('should handle single mutation', () => {
    const mutations = [{ impact: '+3.0%' }];
    expect(getTotalImprovement(mutations)).toBe('+3.0%');
  });
});

describe('renderMutationBadge', () => {
  test('should render badge for active mutations', () => {
    const mutations = KNOWN_MUTATIONS.slice(0, 2);
    const html = renderMutationBadge(mutations);
    expect(html).toContain('2 optimizations active');
    expect(html).toContain('🧬');
    expect(html).toContain('bg-purple-100');
  });

  test('should render no optimizations message when empty', () => {
    const html = renderMutationBadge([]);
    expect(html).toContain('No optimizations active');
  });
});

describe('renderMutationList', () => {
  test('should render list of mutations', () => {
    const mutations = KNOWN_MUTATIONS.slice(0, 1);
    const html = renderMutationList(mutations);
    expect(html).toContain(mutations[0].name);
    expect(html).toContain(mutations[0].icon);
    expect(html).toContain(mutations[0].impact);
  });

  test('should render no optimizations message when empty', () => {
    const html = renderMutationList([]);
    expect(html).toContain('No prompt optimizations detected');
  });

  test('should include phase badge', () => {
    const mutations = [KNOWN_MUTATIONS[0]];
    const html = renderMutationList(mutations);
    expect(html).toContain('Phase 1');
  });
});

describe('getMutationSummary', () => {
  test('should return summary object', () => {
    const summary = getMutationSummary();
    expect(summary.count).toBe(KNOWN_MUTATIONS.length);
    expect(summary.totalImprovement).toBeDefined();
    expect(summary.mutations).toBe(KNOWN_MUTATIONS);
  });

  test('should calculate total improvement from all mutations', () => {
    const summary = getMutationSummary();
    expect(summary.totalImprovement).toMatch(/^\+\d+\.\d+%$/);
  });
});
