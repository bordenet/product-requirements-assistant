/**
 * Tests for prd-templates.js module
 *
 * Tests the PRD template definitions and retrieval functions.
 */

import { PRD_TEMPLATES, getTemplate, getAllTemplates } from '../js/prd-templates.js';

describe('PRD_TEMPLATES', () => {
  test('should have 5 templates defined', () => {
    expect(Object.keys(PRD_TEMPLATES)).toHaveLength(5);
  });

  test('should have blank template', () => {
    expect(PRD_TEMPLATES.blank).toBeDefined();
    expect(PRD_TEMPLATES.blank.id).toBe('blank');
    expect(PRD_TEMPLATES.blank.name).toBe('Blank PRD');
    expect(PRD_TEMPLATES.blank.problems).toBe('');
    expect(PRD_TEMPLATES.blank.context).toBe('');
  });

  test('should have newFeature template', () => {
    expect(PRD_TEMPLATES.newFeature).toBeDefined();
    expect(PRD_TEMPLATES.newFeature.id).toBe('newFeature');
    expect(PRD_TEMPLATES.newFeature.name).toBe('New Feature');
    expect(PRD_TEMPLATES.newFeature.problems).toContain('pain point');
  });

  test('should have platformMigration template', () => {
    expect(PRD_TEMPLATES.platformMigration).toBeDefined();
    expect(PRD_TEMPLATES.platformMigration.id).toBe('platformMigration');
    expect(PRD_TEMPLATES.platformMigration.name).toBe('Platform Migration');
    expect(PRD_TEMPLATES.platformMigration.problems).toContain('migrating');
  });

  test('should have internalTool template', () => {
    expect(PRD_TEMPLATES.internalTool).toBeDefined();
    expect(PRD_TEMPLATES.internalTool.id).toBe('internalTool');
    expect(PRD_TEMPLATES.internalTool.name).toBe('Internal Tool');
  });

  test('should have apiPlatform template', () => {
    expect(PRD_TEMPLATES.apiPlatform).toBeDefined();
    expect(PRD_TEMPLATES.apiPlatform.id).toBe('apiPlatform');
    expect(PRD_TEMPLATES.apiPlatform.name).toBe('API / Platform');
  });

  test('all templates should have required fields', () => {
    Object.values(PRD_TEMPLATES).forEach(template => {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.icon).toBeDefined();
      expect(template.description).toBeDefined();
      expect(typeof template.problems).toBe('string');
      expect(typeof template.context).toBe('string');
    });
  });
});

describe('getTemplate', () => {
  test('should return template by ID', () => {
    const template = getTemplate('blank');
    expect(template).toBe(PRD_TEMPLATES.blank);
  });

  test('should return newFeature template', () => {
    const template = getTemplate('newFeature');
    expect(template.name).toBe('New Feature');
  });

  test('should return null for invalid ID', () => {
    expect(getTemplate('nonexistent')).toBeNull();
    expect(getTemplate('')).toBeNull();
    expect(getTemplate(null)).toBeNull();
  });

  test('should return null for undefined', () => {
    expect(getTemplate(undefined)).toBeNull();
  });
});

describe('getAllTemplates', () => {
  test('should return array of all templates', () => {
    const templates = getAllTemplates();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates).toHaveLength(5);
  });

  test('should include all template objects', () => {
    const templates = getAllTemplates();
    const ids = templates.map(t => t.id);
    expect(ids).toContain('blank');
    expect(ids).toContain('newFeature');
    expect(ids).toContain('platformMigration');
    expect(ids).toContain('internalTool');
    expect(ids).toContain('apiPlatform');
  });

  test('each template should have name and icon', () => {
    const templates = getAllTemplates();
    templates.forEach(template => {
      expect(template.name).toBeDefined();
      expect(template.icon).toBeDefined();
    });
  });
});
