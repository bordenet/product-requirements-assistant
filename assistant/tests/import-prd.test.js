/**
 * Tests for Import PRD Module
 * @jest-environment jsdom
 *
 * Comprehensive test suite for the Import PRD feature that allows users
 * to paste existing PRDs from Word/Google Docs and convert them to Markdown.
 */

import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { convertHtmlToMarkdown, getImportModalHtml } from '../../shared/js/import-prd.js';

// Mock TurndownService globally with comprehensive conversion
class MockTurndownService {
  constructor(options = {}) {
    this.rules = [];
    this.options = options;
  }
  addRule(name, rule) {
    this.rules.push({ name, rule });
  }
  turndown(html) {
    // Comprehensive mock conversion that handles real-world HTML
    let result = html
      // Headings
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n')
      // Paragraphs
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      // Text formatting
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<u[^>]*>(.*?)<\/u>/gi, '_$1_')
      .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
      .replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
      // Lists
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
      .replace(/<ol[^>]*>|<\/ol>/gi, '\n')
      // Links
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      // Line breaks
      .replace(/<br\s*\/?>/gi, '\n')
      // Divs and spans (just extract content)
      .replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n')
      .replace(/<span[^>]*>(.*?)<\/span>/gi, '$1')
      // Strip remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Clean up whitespace
      .replace(/\n{3,}/g, '\n\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
    return result;
  }
}

global.TurndownService = MockTurndownService;

describe('Import PRD Module', () => {
  // ============================================================
  // convertHtmlToMarkdown Tests
  // ============================================================
  describe('convertHtmlToMarkdown', () => {
    describe('basic conversions', () => {
      test('converts basic HTML to Markdown', () => {
        const html = '<h1>Product Requirements</h1><p>This is a test.</p>';
        const result = convertHtmlToMarkdown(html);

        expect(result).toContain('# Product Requirements');
        expect(result).toContain('This is a test.');
      });

      test('handles empty input', () => {
        const result = convertHtmlToMarkdown('');
        expect(result).toBe('');
      });

      test('handles whitespace-only input', () => {
        const result = convertHtmlToMarkdown('   \n\t  ');
        expect(result).toBe('');
      });

      test('handles plain text without HTML', () => {
        const result = convertHtmlToMarkdown('Just plain text');
        expect(result).toBe('Just plain text');
      });
    });

    describe('heading conversions', () => {
      test('converts h1 to # heading', () => {
        const html = '<h1>Main Title</h1>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('# Main Title');
      });

      test('converts h2 to ## heading', () => {
        const html = '<h2>Section Title</h2>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('## Section Title');
      });

      test('converts h3 to ### heading', () => {
        const html = '<h3>Subsection</h3>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('### Subsection');
      });

      test('converts all heading levels h1-h6', () => {
        const html = '<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>';
        const result = convertHtmlToMarkdown(html);

        expect(result).toContain('# H1');
        expect(result).toContain('## H2');
        expect(result).toContain('### H3');
        expect(result).toContain('#### H4');
        expect(result).toContain('##### H5');
        expect(result).toContain('###### H6');
      });

      test('handles headings with attributes', () => {
        const html = '<h1 class="title" id="main">Title with Attributes</h1>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('# Title with Attributes');
      });
    });

    describe('text formatting conversions', () => {
      test('converts strong to bold', () => {
        const html = '<p><strong>Bold text</strong></p>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('**Bold text**');
      });

      test('converts b tag to bold', () => {
        const html = '<p><b>Bold text</b></p>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('**Bold text**');
      });

      test('converts em to italic', () => {
        const html = '<p><em>Italic text</em></p>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('*Italic text*');
      });

      test('converts i tag to italic', () => {
        const html = '<p><i>Italic text</i></p>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('*Italic text*');
      });

      test('converts code tags to inline code', () => {
        const html = '<p>Use <code>npm install</code> to install</p>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('`npm install`');
      });

      test('handles nested formatting', () => {
        const html = '<p><strong><em>Bold and italic</em></strong></p>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('**');
        expect(result).toContain('*');
      });

      test('handles mixed formatting in paragraph', () => {
        const html = '<p>Normal <strong>bold</strong> and <em>italic</em> text</p>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('**bold**');
        expect(result).toContain('*italic*');
        expect(result).toContain('Normal');
        expect(result).toContain('text');
      });
    });

    describe('list conversions', () => {
      test('converts unordered list', () => {
        const html = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
        const result = convertHtmlToMarkdown(html);

        expect(result).toContain('- Item 1');
        expect(result).toContain('- Item 2');
        expect(result).toContain('- Item 3');
      });

      test('converts ordered list', () => {
        const html = '<ol><li>First</li><li>Second</li><li>Third</li></ol>';
        const result = convertHtmlToMarkdown(html);

        // Our mock converts all lists to unordered
        expect(result).toContain('- First');
        expect(result).toContain('- Second');
        expect(result).toContain('- Third');
      });

      test('handles list items with formatting', () => {
        const html = '<ul><li><strong>Bold item</strong></li><li><em>Italic item</em></li></ul>';
        const result = convertHtmlToMarkdown(html);

        expect(result).toContain('**Bold item**');
        expect(result).toContain('*Italic item*');
      });

      test('handles empty list', () => {
        const html = '<ul></ul>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toBe('');
      });
    });

    describe('link conversions', () => {
      test('converts links to markdown format', () => {
        const html = '<a href="https://example.com">Example Link</a>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('[Example Link](https://example.com)');
      });

      test('handles links with special characters in URL', () => {
        const html = '<a href="https://example.com/path?query=value&other=123">Link</a>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('[Link](https://example.com/path?query=value&other=123)');
      });
    });

    describe('whitespace and cleanup', () => {
      test('collapses multiple newlines', () => {
        const html = '<p>First</p><p></p><p></p><p>Second</p>';
        const result = convertHtmlToMarkdown(html);
        // Should not have more than 2 consecutive newlines
        expect(result).not.toMatch(/\n{3,}/);
      });

      test('handles HTML entities', () => {
        const html = '<p>Less &lt; Greater &gt; Amp &amp; Quote &quot;</p>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('<');
        expect(result).toContain('>');
        expect(result).toContain('&');
        expect(result).toContain('"');
      });

      test('handles non-breaking spaces', () => {
        const html = '<p>Text&nbsp;with&nbsp;spaces</p>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('Text with spaces');
      });

      test('strips unknown HTML tags', () => {
        const html = '<custom-tag>Content</custom-tag>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toBe('Content');
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
      });
    });

    describe('Word/Google Docs specific patterns', () => {
      test('handles Word-style spans with classes', () => {
        const html = '<span class="MsoNormal" style="font-family: Arial;">Content</span>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toBe('Content');
      });

      test('handles Google Docs divs', () => {
        const html = '<div class="kix-paragraphrenderer">Paragraph content</div>';
        const result = convertHtmlToMarkdown(html);
        expect(result).toContain('Paragraph content');
      });

      test('handles complex nested structure from Word', () => {
        const html = `
          <div class="WordSection1">
            <h1 class="MsoTitle">Document Title</h1>
            <p class="MsoNormal"><span style="font-family: Arial;">Introduction paragraph.</span></p>
            <h2>Section 1</h2>
            <ul>
              <li class="MsoListParagraph">Item one</li>
              <li class="MsoListParagraph">Item two</li>
            </ul>
          </div>
        `;
        const result = convertHtmlToMarkdown(html);

        expect(result).toContain('# Document Title');
        expect(result).toContain('Introduction paragraph');
        expect(result).toContain('## Section 1');
        expect(result).toContain('- Item one');
        expect(result).toContain('- Item two');
      });
    });

    describe('fallback behavior', () => {
      test('falls back to plain text when Turndown not available', () => {
        const original = global.TurndownService;
        delete global.TurndownService;

        const html = '<p>Plain text content</p>';
        const result = convertHtmlToMarkdown(html);

        expect(result).toBe('Plain text content');

        global.TurndownService = original;
      });

      test('fallback strips all HTML tags', () => {
        const original = global.TurndownService;
        delete global.TurndownService;

        const html = '<div><p><strong>Bold</strong> and <em>italic</em></p></div>';
        const result = convertHtmlToMarkdown(html);

        expect(result).toBe('Bold and italic');
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');

        global.TurndownService = original;
      });

      test('fallback handles nested elements', () => {
        const original = global.TurndownService;
        delete global.TurndownService;

        const html = '<div><div><span>Nested content</span></div></div>';
        const result = convertHtmlToMarkdown(html);

        expect(result).toBe('Nested content');

        global.TurndownService = original;
      });
    });
  });

  // ============================================================
  // getImportModalHtml Tests
  // ============================================================
  describe('getImportModalHtml', () => {
    describe('required elements', () => {
      test('returns modal HTML with all required element IDs', () => {
        const html = getImportModalHtml();

        const requiredIds = [
          'import-modal',
          'import-modal-close',
          'import-paste-area',
          'import-convert-btn',
          'import-preview-step',
          'import-paste-step',
          'import-preview-area',
          'import-score-badge',
          'import-llm-suggestion',
          'import-save-btn',
          'import-cancel-btn',
          'import-copy-prompt-btn'
        ];

        requiredIds.forEach(id => {
          expect(html).toContain(`id="${id}"`);
        });
      });

      test('includes contenteditable paste area', () => {
        const html = getImportModalHtml();
        expect(html).toContain('contenteditable="true"');
      });

      test('includes textarea for preview', () => {
        const html = getImportModalHtml();
        expect(html).toContain('<textarea');
        expect(html).toContain('id="import-preview-area"');
      });
    });

    describe('modal structure', () => {
      test('has proper modal backdrop', () => {
        const html = getImportModalHtml();
        expect(html).toContain('fixed inset-0');
        expect(html).toContain('bg-black bg-opacity-50');
        expect(html).toContain('z-50');
      });

      test('has header with title', () => {
        const html = getImportModalHtml();
        expect(html).toContain('Import Existing PRD');
        expect(html).toContain('📋');
      });

      test('has close button in header', () => {
        const html = getImportModalHtml();
        expect(html).toContain('id="import-modal-close"');
        // Check for X icon SVG
        expect(html).toContain('M6 18L18 6M6 6l12 12');
      });

      test('has footer with action buttons', () => {
        const html = getImportModalHtml();
        expect(html).toContain('Cancel');
        expect(html).toContain('Save & Continue to Phase 1');
      });
    });

    describe('paste step', () => {
      test('includes instructions for pasting', () => {
        const html = getImportModalHtml();
        expect(html).toContain('Paste your PRD from Word, Google Docs');
        expect(html).toContain('convert it to Markdown automatically');
      });

      test('includes convert button', () => {
        const html = getImportModalHtml();
        expect(html).toContain('Convert to Markdown');
        expect(html).toContain('id="import-convert-btn"');
      });

      test('paste area has proper styling', () => {
        const html = getImportModalHtml();
        expect(html).toContain('border-dashed');
        expect(html).toContain('h-48');
      });
    });

    describe('preview step', () => {
      test('preview step is initially hidden', () => {
        const html = getImportModalHtml();
        expect(html).toContain('id="import-preview-step" class="hidden"');
      });

      test('includes score badge area', () => {
        const html = getImportModalHtml();
        expect(html).toContain('id="import-score-badge"');
      });

      test('preview textarea has monospace font', () => {
        const html = getImportModalHtml();
        expect(html).toContain('font-mono');
      });
    });

    describe('LLM suggestion section', () => {
      test('LLM suggestion is initially hidden', () => {
        const html = getImportModalHtml();
        expect(html).toContain('id="import-llm-suggestion" class="hidden');
      });

      test('includes warning about cleanup needed', () => {
        const html = getImportModalHtml();
        expect(html).toContain('may need cleanup');
        expect(html).toContain('⚠️');
      });

      test('includes copy prompt button', () => {
        const html = getImportModalHtml();
        expect(html).toContain('Copy LLM Prompt');
        expect(html).toContain('id="import-copy-prompt-btn"');
      });

      test('mentions Claude and ChatGPT', () => {
        const html = getImportModalHtml();
        expect(html).toContain('Claude/ChatGPT');
      });
    });

    describe('dark mode support', () => {
      test('includes dark mode classes', () => {
        const html = getImportModalHtml();
        expect(html).toContain('dark:bg-gray-800');
        expect(html).toContain('dark:text-white');
        expect(html).toContain('dark:border-gray-700');
      });
    });

    describe('accessibility', () => {
      test('includes labels for form elements', () => {
        const html = getImportModalHtml();
        expect(html).toContain('<label');
        expect(html).toContain('Paste your content here');
        expect(html).toContain('Converted Markdown');
      });
    });
  });

  // ============================================================
  // Real-world PRD conversion tests
  // ============================================================
  describe('Real-world PRD conversion scenarios', () => {
    test('converts a minimal PRD structure', () => {
      const html = `
        <h1>Product Requirements Document: User Authentication</h1>
        <h2>Overview</h2>
        <p>This document outlines the requirements for the user authentication system.</p>
        <h2>Problem Statement</h2>
        <p>Users need a secure way to authenticate.</p>
      `;
      const result = convertHtmlToMarkdown(html);

      expect(result).toContain('# Product Requirements Document: User Authentication');
      expect(result).toContain('## Overview');
      expect(result).toContain('## Problem Statement');
    });

    test('converts PRD with requirements list', () => {
      const html = `
        <h2>Functional Requirements</h2>
        <ul>
          <li>Users must be able to register with email</li>
          <li>Users must be able to login with password</li>
          <li>Users must be able to reset password</li>
        </ul>
      `;
      const result = convertHtmlToMarkdown(html);

      expect(result).toContain('## Functional Requirements');
      expect(result).toContain('- Users must be able to register with email');
      expect(result).toContain('- Users must be able to login with password');
      expect(result).toContain('- Users must be able to reset password');
    });

    test('converts PRD with success metrics', () => {
      const html = `
        <h2>Success Metrics</h2>
        <ul>
          <li><strong>Login success rate:</strong> > 99%</li>
          <li><strong>Average login time:</strong> < 2 seconds</li>
          <li><strong>Password reset completion:</strong> > 95%</li>
        </ul>
      `;
      const result = convertHtmlToMarkdown(html);

      expect(result).toContain('## Success Metrics');
      expect(result).toContain('**Login success rate:**');
      expect(result).toContain('> 99%');
    });

    test('handles PRD with mixed content types', () => {
      const html = `
        <h1>Feature: Dark Mode</h1>
        <p>Add dark mode support to improve <em>user experience</em> in low-light conditions.</p>
        <h2>User Stories</h2>
        <p>As a user, I want to:</p>
        <ul>
          <li>Toggle dark mode from settings</li>
          <li>Have my preference remembered</li>
        </ul>
        <h2>Technical Notes</h2>
        <p>Use <code>prefers-color-scheme</code> media query for system preference detection.</p>
      `;
      const result = convertHtmlToMarkdown(html);

      expect(result).toContain('# Feature: Dark Mode');
      expect(result).toContain('*user experience*');
      expect(result).toContain('## User Stories');
      expect(result).toContain('- Toggle dark mode from settings');
      expect(result).toContain('`prefers-color-scheme`');
    });
  });
});
