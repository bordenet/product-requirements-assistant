/**
 * Validator tests - Comprehensive scoring tests
 * Tests all exported functions for PRD validation
 */

import {
  scoreDocumentStructure,
  scoreRequirementsClarity,
  scoreUserFocus,
  scoreTechnicalQuality,
  validatePRD,
  detectVagueQualifiers,
  detectVagueLanguage,
  countUserStories,
  countAcceptanceCriteria,
  countMeasurableRequirements,
  detectUserPersonas,
  detectProblemStatement,
  detectNonFunctionalRequirements,
  detectPrioritization,
  detectCustomerEvidence,
  detectScopeBoundaries,
  detectValueProposition
} from '../js/validator.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixtures = JSON.parse(
  readFileSync(join(__dirname, '../testdata/scoring-fixtures.json'), 'utf-8')
);

// ============================================================================
// detectVagueQualifiers tests
// ============================================================================
describe('detectVagueQualifiers', () => {
  test('detects vague qualifiers in text', () => {
    const input = 'The system should be fast and easy to use.';
    const result = detectVagueQualifiers(input);
    expect(result.found).toBe(true);
    expect(result.qualifiers).toContain('fast');
    expect(result.qualifiers).toContain('easy to use');
  });

  test('detects multiple vague qualifiers', () => {
    const input = 'The system should be scalable, intuitive, and responsive.';
    const result = detectVagueQualifiers(input);
    expect(result.found).toBe(true);
    expect(result.count).toBeGreaterThanOrEqual(3);
  });

  test('returns empty for specific language', () => {
    const input = 'Response time must be under 200ms with 99.9% uptime.';
    const result = detectVagueQualifiers(input);
    expect(result.found).toBe(false);
    expect(result.count).toBe(0);
  });
});

// ============================================================================
// countUserStories tests
// ============================================================================
describe('countUserStories', () => {
  test('counts user stories in standard format', () => {
    const input = 'As a user, I want to save my progress so that I can continue later.';
    expect(countUserStories(input)).toBe(1);
  });

  test('counts multiple user stories', () => {
    const input = `
      As a user, I want to save my progress so that I can continue later.
      As an admin, I want to manage users so that I can control access.
    `;
    expect(countUserStories(input)).toBe(2);
  });

  test('returns 0 when no user stories', () => {
    const input = 'The system should save user data.';
    expect(countUserStories(input)).toBe(0);
  });
});

// ============================================================================
// countAcceptanceCriteria tests
// ============================================================================
describe('countAcceptanceCriteria', () => {
  test('counts Given/When/Then format', () => {
    const input = 'Given a user is logged in, When they click save, Then data is persisted.';
    expect(countAcceptanceCriteria(input)).toBe(1);
  });

  test('returns 0 when no acceptance criteria', () => {
    const input = 'The user should be able to save data.';
    expect(countAcceptanceCriteria(input)).toBe(0);
  });
});

// ============================================================================
// scoreDocumentStructure tests
// ============================================================================
describe('scoreDocumentStructure', () => {
  describe('fixture-based tests', () => {
    fixtures.documentStructure.forEach(({ name, input, expected }) => {
      test(name, () => {
        const result = scoreDocumentStructure(input);
        expect(result.score).toBeGreaterThanOrEqual(expected.minScore);
      });
    });
  });

  test('returns expected structure', () => {
    const input = '# Purpose\nSome content\n\n## Features\nFeature list';
    const result = scoreDocumentStructure(input);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('maxScore');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('strengths');
    expect(result.maxScore).toBe(20);
  });
});

// ============================================================================
// scoreRequirementsClarity tests
// ============================================================================
describe('scoreRequirementsClarity', () => {
  describe('fixture-based tests', () => {
    fixtures.requirementsClarity.forEach(({ name, input, expected }) => {
      test(name, () => {
        const result = scoreRequirementsClarity(input);
        if (expected.minScore !== undefined) {
          expect(result.score).toBeGreaterThanOrEqual(expected.minScore);
        }
        if (expected.maxScore !== undefined) {
          expect(result.score).toBeLessThanOrEqual(expected.maxScore);
        }
      });
    });
  });

  test('returns expected structure', () => {
    const input = 'As a user, I want to save data so that I can access it later.';
    const result = scoreRequirementsClarity(input);
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('maxScore');
    expect(result).toHaveProperty('vagueQualifiers');
    expect(result).toHaveProperty('userStoryCount');
    expect(result.maxScore).toBe(25);
  });
});

// ============================================================================
// validatePRD tests
// ============================================================================
describe('validatePRD', () => {
  test('returns zero scores for empty input', () => {
    const result = validatePRD('');
    expect(result.totalScore).toBe(0);
  });

  test('returns complete structure', () => {
    const input = '# Purpose\nSolving problem X\n\n## User Personas\nAs a user, I want...';
    const result = validatePRD(input);
    expect(result).toHaveProperty('totalScore');
    expect(result).toHaveProperty('structure');
    expect(result).toHaveProperty('clarity');
    expect(result).toHaveProperty('userFocus');
    expect(result).toHaveProperty('technical');
  });
});

// ============================================================================
// detectVagueLanguage tests (enhanced categorized detection)
// ============================================================================
describe('detectVagueLanguage', () => {
  test('detects vague qualifiers', () => {
    const input = 'The system should be fast and easy to use.';
    const result = detectVagueLanguage(input);
    expect(result.qualifiers).toContain('fast');
    expect(result.qualifiers).toContain('easy to use');
  });

  test('detects imprecise quantifiers', () => {
    const input = 'Many users will need several features with various options.';
    const result = detectVagueLanguage(input);
    expect(result.quantifiers).toContain('many');
    expect(result.quantifiers).toContain('several');
    expect(result.quantifiers).toContain('various');
  });

  test('detects temporal vagueness', () => {
    const input = 'This will be delivered soon and should happen quickly.';
    const result = detectVagueLanguage(input);
    expect(result.temporal).toContain('soon');
    expect(result.temporal).toContain('quickly');
  });

  test('detects weasel words', () => {
    // Note: "might" was removed from weaselWords - it's legitimate in risks/assumptions sections
    const input = 'Users should be able to do this. It could potentially work and is typically fine.';
    const result = detectVagueLanguage(input);
    expect(result.weaselWords).toContain('should be able to');
    expect(result.weaselWords).toContain('could potentially');
    expect(result.weaselWords).toContain('typically');
  });

  test('detects marketing fluff', () => {
    const input = 'This best-in-class solution is cutting-edge and world-class.';
    const result = detectVagueLanguage(input);
    expect(result.marketingFluff).toContain('best-in-class');
    expect(result.marketingFluff).toContain('cutting-edge');
    expect(result.marketingFluff).toContain('world-class');
  });

  test('detects unquantified comparatives', () => {
    const input = 'This is better and faster than the old system. It is more efficient.';
    const result = detectVagueLanguage(input);
    expect(result.unquantifiedComparatives).toContain('better');
    expect(result.unquantifiedComparatives).toContain('faster');
    expect(result.unquantifiedComparatives).toContain('more efficient');
  });

  test('returns total count across all categories', () => {
    const input = 'This fast, best-in-class solution will be delivered soon.';
    const result = detectVagueLanguage(input);
    expect(result.totalCount).toBeGreaterThanOrEqual(3);
  });

  test('returns empty categories when no vague language', () => {
    const input = 'Response time must be under 200ms with 99.9% uptime.';
    const result = detectVagueLanguage(input);
    expect(result.totalCount).toBe(0);
  });
});

// ============================================================================
// detectPrioritization tests
// ============================================================================
describe('detectPrioritization', () => {
  test('detects MoSCoW prioritization', () => {
    const input = 'Must have: login. Should have: dashboard. Could have: themes.';
    const result = detectPrioritization(input);
    expect(result.hasMoscow).toBe(true);
    expect(result.moscowCount).toBeGreaterThanOrEqual(3);
  });

  test('detects P-level prioritization', () => {
    const input = 'P0: Critical login bug. P1: Dashboard improvements. P2: Nice to have.';
    const result = detectPrioritization(input);
    expect(result.hasPLevel).toBe(true);
    expect(result.pLevelCount).toBeGreaterThanOrEqual(3);
  });

  test('detects tiered/phased prioritization', () => {
    const input = 'MVP features include login. Phase 2 will add reporting. V2 includes analytics.';
    const result = detectPrioritization(input);
    expect(result.hasTiered).toBe(true);
  });

  test('detects priority section', () => {
    const input = '# Priority\nFeatures ranked by importance.\n\n## High Priority\nLogin system.';
    const result = detectPrioritization(input);
    expect(result.hasPrioritySection).toBe(true);
  });

  test('returns false when no prioritization', () => {
    const input = 'The system needs login and dashboard features.';
    const result = detectPrioritization(input);
    expect(result.hasMoscow).toBe(false);
    expect(result.hasPLevel).toBe(false);
    expect(result.hasTiered).toBe(false);
  });
});

// ============================================================================
// detectCustomerEvidence tests
// ============================================================================
describe('detectCustomerEvidence', () => {
  test('detects user research references', () => {
    const input = 'Based on user research, we found that customers prefer simple interfaces.';
    const result = detectCustomerEvidence(input);
    expect(result.hasResearch).toBe(true);
    expect(result.researchTerms).toContain('user research');
  });

  test('detects data-backed statements', () => {
    const input = 'Data shows that 75% of users abandon checkout. Analytics indicate high bounce rates.';
    const result = detectCustomerEvidence(input);
    expect(result.hasData).toBe(true);
  });

  test('detects customer quotes', () => {
    const input = 'One user said "I wish I could save my progress" during interviews.';
    const result = detectCustomerEvidence(input);
    expect(result.hasQuotes).toBe(true);
    expect(result.quoteCount).toBeGreaterThanOrEqual(1);
  });

  test('detects feedback references', () => {
    const input = 'Customer feedback indicates this is a top feature request. NPS scores dropped.';
    const result = detectCustomerEvidence(input);
    expect(result.hasFeedback).toBe(true);
  });

  test('returns evidence types count', () => {
    const input = 'User research shows 80% of users want this. "Please add dark mode" was common feedback.';
    const result = detectCustomerEvidence(input);
    expect(result.evidenceTypes).toBeGreaterThanOrEqual(2);
  });

  test('returns false when no customer evidence', () => {
    const input = 'The system should have a login feature and dashboard.';
    const result = detectCustomerEvidence(input);
    expect(result.hasResearch).toBe(false);
    expect(result.hasData).toBe(false);
    expect(result.hasQuotes).toBe(false);
    expect(result.hasFeedback).toBe(false);
  });
});

// ============================================================================
// detectScopeBoundaries tests
// ============================================================================
describe('detectScopeBoundaries', () => {
  test('detects in-scope language', () => {
    const input = 'In scope: user authentication, dashboard. We will build the core features.';
    const result = detectScopeBoundaries(input);
    expect(result.hasInScope).toBe(true);
  });

  test('detects out-of-scope language', () => {
    const input = 'Out of scope: mobile app, third-party integrations. We will not build analytics.';
    const result = detectScopeBoundaries(input);
    expect(result.hasOutOfScope).toBe(true);
  });

  test('detects both in-scope and out-of-scope', () => {
    const input = 'In scope: login. Out of scope: SSO. Future consideration: mobile app.';
    const result = detectScopeBoundaries(input);
    expect(result.hasInScope).toBe(true);
    expect(result.hasOutOfScope).toBe(true);
    expect(result.hasBothBoundaries).toBe(true);
  });

  test('detects scope section', () => {
    const input = '# Scope\n## In Scope\nLogin\n## Out of Scope\nMobile';
    const result = detectScopeBoundaries(input);
    expect(result.hasScopeSection).toBe(true);
  });

  test('returns false when no scope boundaries', () => {
    const input = 'The system should have login and dashboard features.';
    const result = detectScopeBoundaries(input);
    expect(result.hasInScope).toBe(false);
    expect(result.hasOutOfScope).toBe(false);
  });
});

// ============================================================================
// detectValueProposition tests
// ============================================================================
describe('detectValueProposition', () => {
  test('should detect Value Proposition section header', () => {
    const text = `
## 3. Value Proposition

### 3.1 Value to Customer
Customers save 40 hours saved on manual data entry.

### 3.2 Value to Company
Revenue impact increased from 1M to 2M annually.
    `;
    const result = detectValueProposition(text);
    expect(result.hasSection).toBe(true);
    expect(result.hasCustomerValue).toBe(true);
    expect(result.hasCompanyValue).toBe(true);
    expect(result.hasBothPerspectives).toBe(true);
    expect(result.hasQuantification).toBe(true);
    expect(result.qualityScore).toBeGreaterThanOrEqual(3);
  });

  test('should detect customer value patterns', () => {
    const text = 'The value to customer includes faster processing and reduced errors.';
    const result = detectValueProposition(text);
    expect(result.hasCustomerValue).toBe(true);
  });

  test('should detect company value patterns', () => {
    const text = 'The value to company is increased revenue impact and cost savings.';
    const result = detectValueProposition(text);
    expect(result.hasCompanyValue).toBe(true);
  });

  test('should detect quantified benefits', () => {
    const text = 'This will save 20 hours saved and costs reduced from 100.';
    const result = detectValueProposition(text);
    expect(result.hasQuantification).toBe(true);
    expect(result.quantifiedCount).toBeGreaterThanOrEqual(2);
  });

  test('should detect vague value language', () => {
    const text = 'This will improve the experience and streamline the workflow.';
    const result = detectValueProposition(text);
    expect(result.hasVagueValue).toBe(true);
    expect(result.vagueCount).toBeGreaterThanOrEqual(1);
  });

  test('should calculate quality score correctly', () => {
    // Full quality (4 pts): section + both perspectives + quantified + low vague
    const highQuality = `
## Value Proposition
### Value to Customer
Saves 30 hours saved for each user.
### Value to Company
Cost savings increased from 100K to 500K.
    `;
    expect(detectValueProposition(highQuality).qualityScore).toBe(4);

    // No value proposition content
    const noValue = 'This is a product requirement document.';
    expect(detectValueProposition(noValue).qualityScore).toBe(1); // Only the no-vague point
  });

  test('should return zero quality for vague-only content', () => {
    const vagueOnly = 'This will improve the experience and enhance the process.';
    const result = detectValueProposition(vagueOnly);
    expect(result.hasVagueValue).toBe(true);
    expect(result.hasBothPerspectives).toBe(false);
    expect(result.hasQuantification).toBe(false);
  });
});
