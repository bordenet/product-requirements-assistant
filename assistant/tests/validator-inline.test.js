/**
 * Tests for validator-inline.js module
 *
 * Tests the inline PRD validation and scoring functionality.
 */

import { validateDocument, getScoreColor, getScoreLabel } from '../js/validator-inline.js';

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

  test('should return zero scores for short content', () => {
    const result = validateDocument('Too short');
    expect(result.totalScore).toBe(0);
    expect(result.structure.issues).toContain('No content to validate');
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
    expect(result.structure.maxScore).toBe(25);
    expect(result.clarity.maxScore).toBe(30);
    expect(result.userFocus.maxScore).toBe(25);
    expect(result.technical.maxScore).toBe(20);
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

  test('should return Ready for Dev for score >= 70', () => {
    expect(getScoreLabel(70)).toBe('Ready for Dev');
    expect(getScoreLabel(79)).toBe('Ready for Dev');
  });

  test('should return Needs Work for score >= 50', () => {
    expect(getScoreLabel(50)).toBe('Needs Work');
    expect(getScoreLabel(69)).toBe('Needs Work');
  });

  test('should return Draft Quality for score >= 30', () => {
    expect(getScoreLabel(30)).toBe('Draft Quality');
    expect(getScoreLabel(49)).toBe('Draft Quality');
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
