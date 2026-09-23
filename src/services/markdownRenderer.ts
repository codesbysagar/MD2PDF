import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

// GitHub-inspired light syntax highlighting colors for PDF & HTML
export const SYNTAX_COLORS: Record<string, string> = {
  keyword: '#cf222e',
  built_in: '#953800',
  type: '#953800',
  literal: '#0550ae',
  number: '#0550ae',
  string: '#0a3069',
  comment: '#6e7781',
  doctag: '#6e7781',
  title: '#8250df',
  section: '#0550ae',
  attr: '#116329',
  attribute: '#116329',
  variable: '#953800',
  template_variable: '#953800',
  symbol: '#0550ae',
  bullet: '#0550ae',
  addition: '#116329',
  deletion: '#82071e',
  punctuation: '#24292f'
};

// Configure marked with custom renderer
const renderer = new marked.Renderer();

// Custom code block renderer with highlight.js and inline styling
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  let highlighted = '';
  const language = lang && hljs.getLanguage(lang) ? lang : '';

  try {
    if (language) {
      highlighted = hljs.highlight(text, { language, ignoreIllegals: true }).value;
    } else {
      highlighted = hljs.highlightAuto(text).value;
    }
  } catch {
    highlighted = escapeHtml(text);
  }

  // Inject inline styles for syntax colors so both HTML and pdfmake pick them up seamlessly
  for (const [key, color] of Object.entries(SYNTAX_COLORS)) {
    const classPattern = new RegExp(`class="hljs-${key}"`, 'g');
    highlighted = highlighted.replace(classPattern, `class="hljs-${key}" style="color: ${color};"`);
  }

  const langClass = language ? ` language-${escapeHtml(language)}` : '';
  return `<pre class="md-code-block"><code class="hljs${langClass}">${highlighted}</code></pre>`;
};

// Custom image renderer with responsive wrapper and error fallback
renderer.image = function ({ href, title, text }: { href: string; title?: string | null; text?: string }) {
  const safeHref = escapeHtml(href || '');
  const safeAlt = escapeHtml(text || 'Image');
  const safeTitle = title ? ` title="${escapeHtml(title)}"` : '';

  return `<figure class="md-figure"><img src="${safeHref}" alt="${safeAlt}"${safeTitle} class="md-image" loading="lazy" onerror="this.onerror=null;this.classList.add('md-img-failed');this.alt='[Image failed to load: '+this.alt+']';" /><figcaption class="md-figcaption">${safeAlt}</figcaption></figure>`;
};

// Custom table cell renderer: parse inline tokens (bold, italics, code, links, math, <br>, etc.)
// and preserve column alignment using both align attribute and inline style for HTML & pdfmake
renderer.tablecell = function (this: any, token: any) {
  const content = this.parser.parseInline(token.tokens);
  const tag = token.header ? 'th' : 'td';
  const alignAttr = token.align ? ` align="${token.align}" style="text-align: ${token.align};"` : '';
  return `<${tag}${alignAttr}>${content}</${tag}>\n`;
};

// Custom table renderer: use marked's built-in table layout while wrapping in responsive container
renderer.table = function (this: any, token: any) {
  const tableHtml = marked.Renderer.prototype.table.call(this, token);
  return `<div class="md-table-wrapper">${tableHtml.replace('<table', '<table class="md-table"')}</div>`;
};

// Custom list item renderer: parse inline tokens for full markdown compatibility in lists
renderer.listitem = function (this: any, item: any) {
  const content = this.parser.parse(item.tokens);
  if (item.task) {
    return `<li class="md-task-list-item">${content}</li>\n`;
  }
  return `<li>${content}</li>\n`;
};

marked.use({
  renderer,
  gfm: true,
  breaks: false
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Parses Markdown source and returns sanitized, safe HTML
 */
export function renderMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const rawHtml = marked.parse(markdown) as string;

  // Sanitize via DOMPurify
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['figure', 'figcaption', 'input'],
    ADD_ATTR: ['checked', 'disabled', 'type', 'target', 'loading', 'onerror', 'style'],
    ALLOW_DATA_ATTR: false
  });

  return cleanHtml;
}
