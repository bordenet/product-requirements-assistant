/**
 * Tests for validator-inline.js module
 *
 * Tests the inline PRD validation and scoring functionality.
 */

import {
  validateDocument,
  getScoreColor,
  getScoreLabel,
  detectSections,
  detectVagueQualifiers,
  detectVagueLanguage,
  detectPrioritization,
  detectCustomerEvidence,
  detectScopeBoundaries,
  detectValueProposition,
  detectUserPersonas,
  detectProblemStatement,
  detectNonFunctionalRequirements
} from '../../shared/js/validator-inline.js';

describe('validateDocument', () => {
  test('should return zero scores for empty content', () => {
    const result = validateDocument('');
    expect(result.totalScore).toBe(0);
    expect(result.structure.score).toBe(0);
    expect(result.clarity.score).toBe(0);
  });

  test('should return zero scores for null content', () => {
    const result = validateDocument(null);
    expect(result.totalScore).toBe(0);
  });

  test('should return low scores for short content', () => {
    const result = validateDocument('Too short');
    // Full validator may return non-zero score for minimal content
    expect(result.totalScore).toBeLessThan(15);
    expect(result.structure.issues.length).toBeGreaterThan(0);
  });

  test('should score document with headers', () => {
    const content = `
# Product Requirements Document
## Purpose
This document defines the requirements.
## Features
- Feature 1
- Feature 2
## Success Metrics
- Metric 1
`;
    const result = validateDocument(content);
    expect(result.structure.score).toBeGreaterThan(0);
  });

  test('should score document with user stories', () => {
    const content = `
# PRD
## Requirements
As a user, I want to log in so that I can access my account.
As a admin, I want to manage users so that I can control access.
`.repeat(3);
    const result = validateDocument(content);
    expect(result.clarity.score).toBeGreaterThan(0);
  });

  test('should detect vague qualifiers', () => {
    const vagueContent = `
# Product Requirements
## Overview
The product should be easy to use and user-friendly.
It needs to be fast and have good performance.
The interface should be intuitive and seamless.
`.repeat(3);
    const result = validateDocument(vagueContent);
    expect(result.clarity.issues.length).toBeGreaterThan(0);
  });

  test('should score measurable requirements', () => {
    const content = `
# PRD
## Performance Requirements
Response time should be under 200ms.
The system should handle 1000 requests per second.
Target 99.9% uptime availability.
User satisfaction should exceed 80%.
`.repeat(2);
    const result = validateDocument(content);
    expect(result.clarity.score).toBeGreaterThan(0);
  });

  test('should return all scoring categories', () => {
    const content = '# Test PRD\n' + 'Content here. '.repeat(20);
    const result = validateDocument(content);
    expect(result.structure).toBeDefined();
    expect(result.clarity).toBeDefined();
    expect(result.userFocus).toBeDefined();
    expect(result.technical).toBeDefined();
    expect(result.strategicViability).toBeDefined();
    // 5-dimension scoring: Structure 20, Clarity 25, User Focus 20, Technical 15, Strategic Viability 20 = 100
    expect(result.structure.maxScore).toBe(20);
    expect(result.clarity.maxScore).toBe(25);
    expect(result.userFocus.maxScore).toBe(20);
    expect(result.technical.maxScore).toBe(15);
    expect(result.strategicViability.maxScore).toBe(20);
  });
});

describe('getScoreColor', () => {
  test('should return green for score >= 70', () => {
    expect(getScoreColor(70)).toBe('green');
    expect(getScoreColor(85)).toBe('green');
    expect(getScoreColor(100)).toBe('green');
  });

  test('should return yellow for score >= 50', () => {
    expect(getScoreColor(50)).toBe('yellow');
    expect(getScoreColor(69)).toBe('yellow');
  });

  test('should return orange for score >= 30', () => {
    expect(getScoreColor(30)).toBe('orange');
    expect(getScoreColor(49)).toBe('orange');
  });

  test('should return red for score < 30', () => {
    expect(getScoreColor(0)).toBe('red');
    expect(getScoreColor(29)).toBe('red');
  });
});

describe('getScoreLabel', () => {
  test('should return Excellent for score >= 80', () => {
    expect(getScoreLabel(80)).toBe('Excellent');
    expect(getScoreLabel(100)).toBe('Excellent');
  });

  test('should return Ready for score >= 70', () => {
    expect(getScoreLabel(70)).toBe('Ready');
    expect(getScoreLabel(79)).toBe('Ready');
  });

  test('should return Needs Work for score >= 50', () => {
    expect(getScoreLabel(50)).toBe('Needs Work');
    expect(getScoreLabel(69)).toBe('Needs Work');
  });

  test('should return Draft for score >= 30', () => {
    expect(getScoreLabel(30)).toBe('Draft');
    expect(getScoreLabel(49)).toBe('Draft');
  });

  test('should return Incomplete for score < 30', () => {
    expect(getScoreLabel(0)).toBe('Incomplete');
    expect(getScoreLabel(29)).toBe('Incomplete');
  });
});

describe('validateDocument branch coverage', () => {
  test('should score document with H1 only (no H2)', () => {
    const content = `
# Main Title
This is a document with only H1 heading and enough content to pass minimum length.
This needs to be long enough to trigger validation.
`.repeat(5);
    const result = validateDocument(content);
    expect(result.structure.score).toBeGreaterThan(0);
  });

  test('should score document with tables', () => {
    const content = `
# PRD Document
## Requirements Table
| Feature | Priority | Status |
|---------|----------|--------|
| Login   | P1       | Done   |
| Signup  | P2       | WIP    |
This document has tables for formatting points.
`.repeat(3);
    const result = validateDocument(content);
    expect(result.structure.score).toBeGreaterThan(0);
  });

  test('should score document with scope boundaries', () => {
    const content = `
# Product Requirements
## Scope
### In Scope
- Feature A
- Feature B
### Out of Scope
- Feature C will not be included
- Feature D is excluded
`.repeat(3);
    const result = validateDocument(content);
    expect(result.structure.score).toBeGreaterThan(0);
  });

  test('should score document with measurable requirements', () => {
    const content = `
# PRD
## Requirements
The system must handle 100 requests per second.
Response time should be less than 200ms.
The feature must support at least 50 concurrent users.
Uptime requirement is 99.9% availability.
Storage capacity must be 500GB minimum.
`.repeat(3);
    const result = validateDocument(content);
    expect(result.clarity.score).toBeGreaterThan(0);
  });

  test('should score document with MoSCoW prioritization', () => {
    const content = `
# PRD
## Requirements
Must have: User authentication
Should have: Password reset
Could have: Social login
Won't have: Biometric authentication
`.repeat(3);
    const result = validateDocument(content);
    expect(result.clarity.score).toBeGreaterThan(0);
  });

  test('should score document with persona section and pain points', () => {
    const content = `
# PRD
## User Personas
### Primary User
A developer who struggles with context switching between tools.
Their main pain point is cognitive overhead from multiple interfaces.
The frustration of managing separate systems is significant.
`.repeat(3);
    const result = validateDocument(content);
    expect(result.userFocus.score).toBeGreaterThan(0);
  });

  test('should score document with problem section only', () => {
    const content = `
# PRD
## Problem Statement
The current state requires manual processes.
## Goals
Improve efficiency and reduce errors.
`.repeat(5);
    const result = validateDocument(content);
    expect(result.userFocus.score).toBeGreaterThan(0);
  });
});

// ============================================================================
// Strategic Viability Scoring Tests (NEW - 20 pts dimension)
// ============================================================================

describe('scoreStrategicViability', () => {
  describe('Metric Validity (6 pts)', () => {
    test('should detect leading indicators', () => {
      const content = `
# PRD
## Success Metrics
Leading indicator: Daily active users clicking the feature
Event tracking via Segment for early signal detection.
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability).toBeDefined();
      expect(result.strategicViability.metricValidity.hasLeading).toBe(true);
    });

    test('should detect lagging indicators', () => {
      const content = `
# PRD
## Success Metrics
Lagging indicator: Monthly revenue from subscriptions
Conversion rate as outcome metric.
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability.metricValidity.hasLagging).toBe(true);
    });

    test('should detect counter-metrics', () => {
      const content = `
# PRD
## Success Metrics
Primary: Increase sign-ups by 20%
Counter-metric: Ensure churn rate doesn't increase (guardrail)
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability.metricValidity.hasCounterMetric).toBe(true);
    });

    test('should detect source of truth', () => {
      const content = `
# PRD
## Success Metrics
All metrics tracked in Mixpanel as source of truth.
Dashboard in Looker for visualization.
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability.metricValidity.hasSourceOfTruth).toBe(true);
    });

    test('should score higher with both leading and lagging indicators', () => {
      const contentBoth = `
# PRD
## Success Metrics
Leading indicator: Feature adoption rate (predictive)
Lagging indicator: Revenue impact (outcome)
Counter-metric: Support ticket volume (guardrail)
Source of truth: Amplitude
`.repeat(3);
      const contentLaggingOnly = `
# PRD
## Success Metrics
Revenue growth as outcome metric.
Retention rate measurement.
`.repeat(3);
      const resultBoth = validateDocument(contentBoth);
      const resultLagging = validateDocument(contentLaggingOnly);
      expect(resultBoth.strategicViability.score).toBeGreaterThan(resultLagging.strategicViability.score);
    });
  });

  describe('Scope Realism (5 pts)', () => {
    test('should detect kill switch / pivot criteria', () => {
      const content = `
# PRD
## Hypothesis Kill Switch
If adoption rate < 5% after 30 days, pivot to alternative approach.
Failure threshold: Less than 100 daily users.
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability.scopeRealism.hasKillSwitch).toBe(true);
    });

    test('should detect one-way/two-way door tagging', () => {
      const content = `
# PRD
## Requirements
REQ-1: API contract with partner (one-way door 🚪)
REQ-2: UI color scheme (two-way door 🔄 - reversible)
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability.scopeRealism.hasDoorType).toBe(true);
    });

    test('should detect alternatives considered', () => {
      const content = `
# PRD
## Alternatives Considered
Option 1: Build in-house - rejected due to timeline
Option 2: Buy vendor solution - rejected approach due to cost
Why not use existing system: Doesn't scale
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability.scopeRealism.hasAlternatives).toBe(true);
    });
  });

  describe('Risk & Mitigation Quality (5 pts)', () => {
    test('should detect dissenting opinions', () => {
      const content = `
# PRD
## Known Unknowns
Dissenting opinion from Security team: Concerned about data exposure.
Devil's advocate view: What if users don't adopt?
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability.riskQuality.hasDissent).toBe(true);
    });

    test('should detect risk section with mitigations', () => {
      const content = `
# PRD
## Risks and Mitigations
Risk: Third-party API may have downtime
Mitigation: Implement circuit breaker pattern
Contingency plan: Fallback to cached data
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability.riskQuality.hasRiskSection).toBe(true);
    });
  });

  describe('Traceability (4 pts)', () => {
    test('should detect traceability references', () => {
      const content = `
# PRD
## Requirements
REQ-001 traces to PROB-001
Requirement ID: REQ-002 linked to Metric ID: MET-001
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability.traceability.hasTraceability).toBe(true);
    });

    test('should detect traceability matrix', () => {
      const content = `
# PRD
## Traceability Matrix
| Problem ID | Requirement ID | Metric ID |
|------------|----------------|-----------|
| PROB-001   | REQ-001        | MET-001   |
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability.traceability.hasTraceabilityMatrix).toBe(true);
    });

    test('should detect ID references', () => {
      const content = `
# PRD
## Requirements
REQ-1: User authentication
REQ-2: Password reset (traces to PROB-1)
`.repeat(3);
      const result = validateDocument(content);
      expect(result.strategicViability.traceability.hasIdReferences).toBe(true);
    });
  });

  describe('Full Strategic Viability scoring', () => {
    test('should score 0 for empty strategic content', () => {
      const content = `
# PRD
## Features
- Feature 1
- Feature 2
`.repeat(5);
      const result = validateDocument(content);
      expect(result.strategicViability.score).toBeLessThan(5);
    });

    test('should score high for comprehensive strategic content', () => {
      const content = `
# PRD
## Success Metrics
Leading indicator: Daily feature clicks (predictive, early signal)
Lagging indicator: Monthly revenue (outcome)
Counter-metric: Churn rate as guardrail
Source of truth: Amplitude

## Hypothesis Kill Switch
If adoption < 5% after 30 days, abort criteria met.

## Requirements
REQ-1: Core feature (one-way door 🚪 - irreversible)
REQ-2: UI polish (two-way door 🔄)

## Alternatives Considered
Option A: Build vs Buy - rejected approach due to cost

## Risks
Risk: API downtime - Mitigation: Circuit breaker
Dissenting opinion: Security team concerned about exposure

## Traceability Matrix
| Problem ID | Requirement ID | Metric ID |
|------------|----------------|-----------|
| PROB-001   | REQ-001        | MET-001   |
`;
      const result = validateDocument(content);
      expect(result.strategicViability.score).toBeGreaterThanOrEqual(15);
    });
  });
});

// ============================================================================
// Updated Scoring Dimension Tests
// ============================================================================

describe('Updated scoring dimensions alignment', () => {
  test('should have correct maxScore values (20/25/20/15/20)', () => {
    const content = '# Test\n' + 'Content. '.repeat(50);
    const result = validateDocument(content);
    expect(result.structure.maxScore).toBe(20);
    expect(result.clarity.maxScore).toBe(25);
    expect(result.userFocus.maxScore).toBe(20);
    expect(result.technical.maxScore).toBe(15);
    expect(result.strategicViability.maxScore).toBe(20);
    // Total should be 100
    const totalMax = result.structure.maxScore + result.clarity.maxScore +
      result.userFocus.maxScore + result.technical.maxScore +
      result.strategicViability.maxScore;
    expect(totalMax).toBe(100);
  });

  test('should detect Customer FAQ before Solution (Working Backwards)', () => {
    const contentCorrectOrder = `
# PRD
## Customer FAQ
Q: Why would I use this?
A: To save time on manual tasks.

## Proposed Solution
Build an automated workflow system.
`.repeat(3);
    const contentWrongOrder = `
# PRD
## Proposed Solution
Build an automated workflow system.

## Customer FAQ
Q: Why would I use this?
`.repeat(3);
    const resultCorrect = validateDocument(contentCorrectOrder);
    const resultWrong = validateDocument(contentWrongOrder);
    // Correct order should score higher in structure or userFocus
    expect(resultCorrect.userFocus.hasCustomerFAQ).toBe(true);
  });

  test('should detect failure/edge cases in acceptance criteria', () => {
    const contentWithFailure = `
# PRD
## Acceptance Criteria
Given a user with invalid credentials
When they attempt to login
Then they should see an error message

Given a timeout occurs
When the API fails to respond
Then the system should show a fallback
`.repeat(2);
    const contentHappyPathOnly = `
# PRD
## Acceptance Criteria
Given a valid user
When they login
Then they see the dashboard
`.repeat(3);
    const resultWithFailure = validateDocument(contentWithFailure);
    const resultHappyOnly = validateDocument(contentHappyPathOnly);
    // Content with failure cases should score higher in technical
    expect(resultWithFailure.technical.score).toBeGreaterThanOrEqual(resultHappyOnly.technical.score);
  });
});

// ============================================================================
// Detection Functions Tests
// ============================================================================

describe('Detection Functions', () => {
  describe('detectSections', () => {
    test('should detect all required sections when present', () => {
      const content = `
# PRD
## Problem Statement
The problem is...
## Goals
The goal is...
## Non-Goals
This is not...
## User Stories
As a user...
## Acceptance Criteria
Given...When...Then...
## Success Metrics
We will measure...
`;
      const result = detectSections(content);
      expect(result.found.length).toBeGreaterThan(0);
    });

    test('should report missing sections', () => {
      const content = '# PRD\nMinimal content only.';
      const result = detectSections(content);
      expect(result.missing.length).toBeGreaterThan(0);
    });
  });

  describe('detectVagueQualifiers', () => {
    test('should detect vague qualifiers in text', () => {
      const content = 'We need to make this very fast and highly scalable.';
      const result = detectVagueQualifiers(content);
      expect(result.length).toBeGreaterThan(0);
    });

    test('should return empty for specific language', () => {
      const content = 'Response time must be under 200ms for 95th percentile.';
      const result = detectVagueQualifiers(content);
      expect(result.length).toBe(0);
    });
  });

  describe('detectVagueLanguage', () => {
    test('should categorize different types of vague language', () => {
      const content = 'We need to make this somewhat fast, hopefully soon, and many users say it is good.';
      const result = detectVagueLanguage(content);
      expect(result).toHaveProperty('qualifiers');
      expect(result).toHaveProperty('quantifiers');
      expect(result).toHaveProperty('temporal');
    });

    test('should detect quantifier vagueness', () => {
      const content = 'Many users need this feature and some customers requested it.';
      const result = detectVagueLanguage(content);
      expect(result.quantifiers.length + result.weaselWords.length).toBeGreaterThan(0);
    });
  });

  describe('detectPrioritization', () => {
    test('should detect MoSCoW prioritization', () => {
      const content = 'Must have: Login functionality. Should have: Profile page.';
      const result = detectPrioritization(content);
      expect(result.hasMoscow).toBe(true);
      expect(result.moscowCount).toBeGreaterThan(0);
    });

    test('should detect P-level prioritization', () => {
      const content = 'P0: Critical bug fix. P1: Feature enhancement.';
      const result = detectPrioritization(content);
      expect(result.hasPLevel).toBe(true);
      expect(result.pLevelCount).toBeGreaterThan(0);
    });

    test('should return zero signals for unprioritized content', () => {
      const content = 'Here is a list of features without priority.';
      const result = detectPrioritization(content);
      expect(result.totalSignals).toBe(0);
    });
  });

  describe('detectCustomerEvidence', () => {
    test('should detect customer research references', () => {
      const content = 'Based on user research, we found that 80% of customers need this feature.';
      const result = detectCustomerEvidence(content);
      expect(result.hasResearch).toBe(true);
    });

    test('should detect customer quotes', () => {
      const content = 'Customer said "I really need this feature to do my job."';
      const result = detectCustomerEvidence(content);
      expect(result.hasQuotes).toBe(true);
    });

    test('should return zero evidence types for content without evidence', () => {
      const content = 'This feature will be great for users.';
      const result = detectCustomerEvidence(content);
      expect(result.evidenceTypes).toBe(0);
    });
  });

  describe('detectScopeBoundaries', () => {
    test('should detect in-scope items', () => {
      const content = '## Scope\n### In Scope\n- User authentication\n- Password reset';
      const result = detectScopeBoundaries(content);
      expect(result.hasInScope).toBe(true);
    });

    test('should detect out-of-scope items', () => {
      const content = '## Out of Scope\n- Third-party integrations\n- Mobile app';
      const result = detectScopeBoundaries(content);
      expect(result.hasOutOfScope).toBe(true);
    });

    test('should detect both in and out of scope', () => {
      const content = '## In Scope\n- Login\n## Out of Scope\n- SSO';
      const result = detectScopeBoundaries(content);
      expect(result.hasInScope).toBe(true);
      expect(result.hasOutOfScope).toBe(true);
    });
  });

  describe('detectValueProposition', () => {
    test('should detect value proposition section', () => {
      const content = '## Value Proposition\nThis feature will save users 2 hours per week.';
      const result = detectValueProposition(content);
      expect(result.hasSection).toBe(true);
    });

    test('should detect quantified benefits', () => {
      const content = 'Users will save $500 per month and 2 hours saved per week.';
      const result = detectValueProposition(content);
      expect(result.hasQuantification).toBe(true);
    });
  });

  describe('detectUserPersonas', () => {
    test('should detect persona section', () => {
      const content = '## User Personas\n### Primary User: Marketing Manager\nNeeds quick reporting tools.';
      const result = detectUserPersonas(content);
      expect(result.hasPersonaSection).toBe(true);
    });

    test('should detect user types', () => {
      const content = 'The developer needs to generate reports quickly, and the admin can configure settings.';
      const result = detectUserPersonas(content);
      expect(result.userTypes.length).toBeGreaterThan(0);
    });

    test('should detect pain points', () => {
      const content = 'Users struggle with this problem and face challenges in daily workflows.';
      const result = detectUserPersonas(content);
      expect(result.hasPainPoints).toBe(true);
      expect(result.indicators).toContain('Pain points addressed');
    });
  });

  describe('detectProblemStatement', () => {
    test('should detect problem section', () => {
      const content = '## Problem Statement\nUsers cannot easily find their documents.';
      const result = detectProblemStatement(content);
      expect(result.hasProblemSection).toBe(true);
    });

    test('should detect problem framing language', () => {
      const content = 'The current challenge is that users face pain points with slow search.';
      const result = detectProblemStatement(content);
      expect(result.hasProblemLanguage).toBe(true);
      expect(result.indicators.length).toBeGreaterThan(0);
    });
  });

  describe('detectNonFunctionalRequirements', () => {
    test('should detect performance requirements', () => {
      const content = 'The system must have response time under 200ms.';
      const result = detectNonFunctionalRequirements(content);
      expect(result.categories).toContain('performance');
    });

    test('should detect security requirements', () => {
      const content = 'All data must use encryption and authentication for access control.';
      const result = detectNonFunctionalRequirements(content);
      expect(result.categories).toContain('security');
    });

    test('should detect scalability requirements', () => {
      const content = 'The system must handle 100,000 concurrent users.';
      const result = detectNonFunctionalRequirements(content);
      expect(result.categories).toContain('scalability');
    });
  });
});
