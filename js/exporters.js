/**
 * Export Formatters - Convert markdown to different wiki formats
 * @module exporters
 */

/**
 * Convert markdown to Confluence wiki markup
 * Confluence uses its own wiki syntax, not markdown
 * @param {string} markdown - The markdown content
 * @returns {string} Confluence wiki markup
 */
export function toConfluenceWiki(markdown) {
  let wiki = markdown;

  // Headers: # H1 → h1. H1
  wiki = wiki.replace(/^#{6}\s+(.+)$/gm, 'h6. $1');
  wiki = wiki.replace(/^#{5}\s+(.+)$/gm, 'h5. $1');
  wiki = wiki.replace(/^#{4}\s+(.+)$/gm, 'h4. $1');
  wiki = wiki.replace(/^###\s+(.+)$/gm, 'h3. $1');
  wiki = wiki.replace(/^##\s+(.+)$/gm, 'h2. $1');
  wiki = wiki.replace(/^#\s+(.+)$/gm, 'h1. $1');

  // Bold: **text** → *text*
  wiki = wiki.replace(/\*\*([^*]+)\*\*/g, '*$1*');

  // Italic: *text* or _text_ → _text_
  wiki = wiki.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '_$1_');
  wiki = wiki.replace(/_([^_]+)_/g, '_$1_');

  // Code blocks: ```lang ... ``` → {code:lang} ... {code}
  wiki = wiki.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return lang ? `{code:${lang}}\n${code}{code}` : `{code}\n${code}{code}`;
  });

  // Inline code: `code` → {{code}}
  wiki = wiki.replace(/`([^`]+)`/g, '{{$1}}');

  // Unordered lists: - item → * item (Confluence uses *)
  wiki = wiki.replace(/^(\s*)-\s+/gm, '$1* ');

  // Ordered lists: 1. item → # item (Confluence uses #)
  wiki = wiki.replace(/^(\s*)\d+\.\s+/gm, '$1# ');

  // Links: [text](url) → [text|url]
  wiki = wiki.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '[$1|$2]');

  // Horizontal rule: --- or *** → ----
  wiki = wiki.replace(/^[-*]{3,}$/gm, '----');

  // Blockquotes: > text → {quote}text{quote}
  // (simplified - handles single line quotes)
  wiki = wiki.replace(/^>\s+(.+)$/gm, '{quote}$1{quote}');

  return wiki;
}

/**
 * Convert markdown to Notion-friendly format
 * Notion imports markdown well, but we can add toggle blocks and callouts
 * @param {string} markdown - The markdown content
 * @returns {string} Notion-optimized markdown
 */
export function toNotionMarkdown(markdown) {
  let notion = markdown;

  // Convert sections with content into toggle blocks
  // Headers followed by content become toggles
  // Note: Notion doesn't have a native toggle syntax, but we can use
  // collapsible callouts or just return clean markdown

  // Add callout blocks for important sections
  // Convert blockquotes to callout format (Notion recognizes > as callouts too)

  // For now, markdown works well in Notion - just clean it up
  // Remove any Windows line endings
  notion = notion.replace(/\r\n/g, '\n');

  // Ensure proper spacing after headers
  notion = notion.replace(/^(#+\s+.+)$/gm, '$1\n');

  return notion;
}

/**
 * Available export formats
 */
export const EXPORT_FORMATS = [
  {
    id: 'markdown',
    name: 'Markdown (.md)',
    icon: '📄',
    description: 'Standard markdown file',
    extension: 'md',
    mimeType: 'text/markdown'
  },
  {
    id: 'confluence',
    name: 'Confluence Wiki',
    icon: '🔷',
    description: 'Atlassian Confluence wiki markup',
    extension: 'txt',
    mimeType: 'text/plain'
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '⬛',
    description: 'Notion-optimized markdown',
    extension: 'md',
    mimeType: 'text/markdown'
  }
];

/**
 * Convert markdown to specified format
 * @param {string} markdown - The markdown content
 * @param {string} formatId - The format ID
 * @returns {string} Converted content
 */
export function convertToFormat(markdown, formatId) {
  switch (formatId) {
  case 'confluence':
    return toConfluenceWiki(markdown);
  case 'notion':
    return toNotionMarkdown(markdown);
  case 'markdown':
  default:
    return markdown;
  }
}

/**
 * Get format by ID
 * @param {string} formatId - The format ID
 * @returns {Object|null} Format object or null
 */
export function getFormat(formatId) {
  return EXPORT_FORMATS.find(f => f.id === formatId) || null;
}
