/**
 * AI Mock Module
 * Provides mock AI responses for testing (localhost only)
 */

// Mock responses for each phase
const mockResponses = {
  1: `# User Authentication System

## 1. Executive Summary
This PRD defines requirements for a secure user authentication system that will reduce login-related support tickets from 150/week to 30/week and improve user retention from 72% to 85% within 6 months.

## 2. Problem Statement

### 2.1 Current State
Users currently experience 45-second average login times with a 23% failure rate on first attempt.

### 2.2 Impact
- Support team handles 150 authentication tickets/week (30 hours of effort)
- 28% of users abandon login after 2 failed attempts
- Revenue loss estimated at $45,000/month from churned users

## 3. Goals and Objectives

### 3.1 Business Goals
- Reduce support costs from $4,500/week to $900/week
- Increase monthly active users from 50,000 to 65,000

### 3.2 User Goals
- Complete login in <5 seconds
- Recover forgotten passwords in <2 minutes

### 3.3 Success Metrics
- **Metric:** Login success rate | **Baseline:** 77% | **Target:** 95% | **Timeline:** 3 months
- **Metric:** Average login time | **Baseline:** 45 sec | **Target:** 5 sec | **Timeline:** 3 months
- **Metric:** Support tickets/week | **Baseline:** 150 | **Target:** 30 | **Timeline:** 6 months

## 4. Proposed Solution

### 4.1 Core Functionality
- Single sign-on capability supporting 3+ identity providers
- Session management with configurable timeout (default 30 days)
- Self-service password recovery completing in <2 minutes

### 4.2 User Experience
Users will authenticate through a unified interface accessible on mobile and desktop.

## 5. Scope

### 5.1 In Scope
- FR1: User registration with email verification
- FR2: Password-based authentication
- FR3: Session management
- FR4: Password recovery

### 5.2 Out of Scope
- Biometric authentication
- Hardware token support

## 6. Requirements

### 6.1 Functional Requirements
- FR1: System must complete authentication in <2 seconds
- FR2: System must support 10,000 concurrent sessions

### 6.2 Non-Functional Requirements
- NFR1: 99.9% uptime during business hours
- NFR2: All credentials encrypted at rest and in transit`,

  2: `## Review Feedback

### Strengths
1. Clear quantified metrics with baselines and targets
2. Well-defined scope boundaries
3. Strong business justification with ROI

### Areas for Improvement
1. **Stakeholder section**: Missing - add impact analysis for each group
2. **Timeline**: Add specific milestones with dates
3. **Risks**: Section missing - add top 3-5 risks with mitigation
4. **Open Questions**: Add unresolved decisions

### Suggested Revisions
- Add Section 7: Stakeholders with quantified impact per group
- Add Section 8: Timeline with Q1-Q2 2024 milestones
- Add Section 9: Risks covering security, adoption, and integration
- Clarify NFR2: Define "concurrent sessions" measurement method`,

  3: `# User Authentication System - Final PRD

## 1. Executive Summary
This PRD defines requirements for a secure user authentication system that will reduce login-related support tickets from 150/week to 30/week (80% reduction) and improve user retention from 72% to 85% within 6 months post-launch.

## 2. Problem Statement

### 2.1 Current State
Users experience 45-second average login times with 23% first-attempt failure rate (measured Q4 2023).

### 2.2 Impact
- Support: 150 tickets/week requiring 30 hours effort ($4,500 cost)
- Retention: 28% abandonment after 2 failed attempts
- Revenue: $45,000/month loss from authentication-related churn

## 3. Goals and Objectives

### 3.1 Business Goals
- Reduce authentication support costs from $4,500/week to $900/week
- Increase MAU from 50,000 to 65,000 through improved retention

### 3.2 User Goals
- Complete login in <5 seconds on 10 Mbps connection
- Recover passwords via self-service in <2 minutes

### 3.3 Success Metrics
| Metric | Baseline | Target | Timeline | Measurement |
|--------|----------|--------|----------|-------------|
| Login success rate | 77% | 95% | 3 months | Analytics dashboard |
| Average login time | 45 sec | 5 sec | 3 months | P95 latency logs |
| Support tickets/week | 150 | 30 | 6 months | Zendesk reporting |

## 4-6. [Solution, Scope, Requirements]
*[Sections retained from draft with reviewer's enhancements]*

## 7. Stakeholders

### 7.1 End Users
- **Impact:** Login time reduced from 45s to <5s
- **Success:** 95% first-attempt success rate

### 7.2 Support Team
- **Impact:** Workload reduced from 150 to 30 tickets/week
- **Success:** <2 hour average response time

## 8. Timeline
- **M1:** Requirements finalized, design complete
- **M2-3:** Development and testing
- **M4:** Staged rollout (10% → 50% → 100%)

## 9. Risks and Mitigation
1. **Risk:** Low adoption | **Mitigation:** In-app tutorials, support training
2. **Risk:** Security vulnerabilities | **Mitigation:** Third-party security audit

## 10. Open Questions
1. Which identity providers to support at launch?
2. Session timeout duration for mobile vs. desktop?`
};

let mockModeEnabled = false;

/**
 * Initialize mock mode from localStorage
 */
export function initMockMode() {
  const saved = localStorage.getItem('aiMockMode');
  mockModeEnabled = saved === 'true';

  // Show toggle only on localhost
  if (isLocalhost()) {
    const toggle = document.getElementById('aiMockToggle');
    if (toggle) {
      toggle.classList.remove('hidden');
      const checkbox = document.getElementById('mockModeCheckbox');
      if (checkbox) {
        checkbox.checked = mockModeEnabled;
      }
    }
  }

  return mockModeEnabled;
}

/**
 * Check if running on localhost
 */
function isLocalhost() {
  return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname === '';
}

/**
 * Set mock mode enabled/disabled
 */
export function setMockMode(enabled) {
  mockModeEnabled = enabled;
  localStorage.setItem('aiMockMode', enabled.toString());

  const checkbox = document.getElementById('mockModeCheckbox');
  if (checkbox) {
    checkbox.checked = enabled;
  }

  return mockModeEnabled;
}

/**
 * Check if mock mode is enabled
 */
export function isMockMode() {
  return mockModeEnabled;
}

/**
 * Get mock response for a phase
 */
export function getMockResponse(phaseNumber) {
  return mockResponses[phaseNumber] || 'Mock response not available for this phase.';
}
