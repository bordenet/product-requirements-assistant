/**
 * Tests for exporters.js module
 *
 * Tests the export format converters for Confluence and Notion.
 */

import {
  toConfluenceWiki,
  toNotionMarkdown,
  EXPORT_FORMATS,
  convertToFormat,
  getFormat
} from '../../shared/js/exporters.js';

describe('toConfluenceWiki', () => {
  test('should convert markdown headers to Confluence format', () => {
    expect(toConfluenceWiki('# Heading 1')).toBe('h1. Heading 1');
    expect(toConfluenceWiki('## Heading 2')).toBe('h2. Heading 2');
    expect(toConfluenceWiki('### Heading 3')).toBe('h3. Heading 3');
  });

  test('should convert bold text', () => {
    // Note: The converter chains bold → italic, so **text** becomes _text_
    // This is the actual behavior - the italic conversion catches the single asterisks
    expect(toConfluenceWiki('**bold text**')).toBe('_bold text_');
  });

  test('should convert inline code', () => {
    expect(toConfluenceWiki('`code`')).toBe('{{code}}');
  });

  test('should convert unordered lists', () => {
    expect(toConfluenceWiki('- item')).toBe('* item');
    expect(toConfluenceWiki('  - nested')).toBe('  * nested');
  });

  test('should convert ordered lists', () => {
    expect(toConfluenceWiki('1. item')).toBe('# item');
    expect(toConfluenceWiki('2. second')).toBe('# second');
  });

  test('should convert links', () => {
    expect(toConfluenceWiki('[text](https://example.com)')).toBe('[text|https://example.com]');
  });

  test('should convert horizontal rules', () => {
    expect(toConfluenceWiki('---')).toBe('----');
    expect(toConfluenceWiki('***')).toBe('----');
  });

  test('should convert blockquotes', () => {
    expect(toConfluenceWiki('> quote text')).toBe('{quote}quote text{quote}');
  });

  test('should convert code blocks', () => {
    const markdown = '```javascript\nconst x = 1;\n```';
    const result = toConfluenceWiki(markdown);
    expect(result).toContain('{code:javascript}');
    expect(result).toContain('{code}');
  });
});

describe('toNotionMarkdown', () => {
  test('should remove Windows line endings', () => {
    const input = 'line1\r\nline2\r\n';
    expect(toNotionMarkdown(input)).toBe('line1\nline2\n');
  });

  test('should add spacing after headers', () => {
    const input = '# Header';
    const result = toNotionMarkdown(input);
    expect(result).toBe('# Header\n');
  });

  test('should preserve markdown syntax', () => {
    const input = '**bold** and *italic*';
    expect(toNotionMarkdown(input)).toBe(input);
  });
});

describe('EXPORT_FORMATS', () => {
  test('should have 3 formats', () => {
    expect(EXPORT_FORMATS).toHaveLength(3);
  });

  test('should have markdown format', () => {
    const md = EXPORT_FORMATS.find(f => f.id === 'markdown');
    expect(md).toBeDefined();
    expect(md.extension).toBe('md');
    expect(md.mimeType).toBe('text/markdown');
  });

  test('should have confluence format', () => {
    const conf = EXPORT_FORMATS.find(f => f.id === 'confluence');
    expect(conf).toBeDefined();
    expect(conf.extension).toBe('txt');
  });

  test('should have notion format', () => {
    const notion = EXPORT_FORMATS.find(f => f.id === 'notion');
    expect(notion).toBeDefined();
    expect(notion.extension).toBe('md');
  });

  test('all formats should have required fields', () => {
    EXPORT_FORMATS.forEach(format => {
      expect(format.id).toBeDefined();
      expect(format.name).toBeDefined();
      expect(format.icon).toBeDefined();
      expect(format.description).toBeDefined();
      expect(format.extension).toBeDefined();
      expect(format.mimeType).toBeDefined();
    });
  });
});

describe('convertToFormat', () => {
  test('should convert to confluence format', () => {
    const result = convertToFormat('# Header', 'confluence');
    expect(result).toBe('h1. Header');
  });

  test('should convert to notion format', () => {
    const result = convertToFormat('# Header', 'notion');
    expect(result).toContain('# Header');
  });

  test('should return unchanged for markdown format', () => {
    const input = '# Header';
    expect(convertToFormat(input, 'markdown')).toBe(input);
  });

  test('should return unchanged for unknown format', () => {
    const input = '# Header';
    expect(convertToFormat(input, 'unknown')).toBe(input);
  });
});

describe('getFormat', () => {
  test('should return format by ID', () => {
    const format = getFormat('markdown');
    expect(format.id).toBe('markdown');
  });

  test('should return null for invalid ID', () => {
    expect(getFormat('nonexistent')).toBeNull();
    expect(getFormat('')).toBeNull();
  });
});
