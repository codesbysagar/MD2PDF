import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import type { PdfConfig, GenerationStep } from '../types';

// Ensure pdfMake has virtual fonts loaded
let vfs: any = (pdfFonts as any).pdfMake?.vfs || (pdfFonts as any).default || pdfFonts;
if (vfs && vfs.vfs) vfs = vfs.vfs;
if (vfs) {
  (pdfMake as any).vfs = vfs;
}

export const PAGE_SIZES: Record<string, [number, number]> = {
  A4: [595.28, 841.89],
  A3: [841.89, 1190.55],
  A5: [419.53, 595.28],
  Letter: [612.0, 792.0]
};

export const MARGIN_PRESETS = {
  normal: [36, 36, 36, 36],
  narrow: [20, 24, 20, 24],
  wide: [54, 48, 54, 48]
};

export interface ProgressCallback {
  (step: GenerationStep, percent: number, message: string): void;
}

async function resolveImageToDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:image/')) return url;

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function softWrapLongTokens(html: string): string {
  return html.replace(/([^\s<>&"']{50,})/g, (match) => {
    return match.replace(/.{35}/g, '$&\u200B');
  });
}

async function preprocessHtmlForPdf(
  html: string,
  wrapCode: boolean,
  onProgress?: ProgressCallback
): Promise<string> {
  onProgress?.('highlighting', 35, 'Optimizing typography and spacing...');

  let processedHtml = html;

  // 1. Unwrap table wrappers so htmlToPdfmake parses clean, direct <table> elements
  processedHtml = processedHtml.replace(
    /<div class=["']md-table-wrapper["']>\s*(<table[\s\S]*?<\/table>)\s*<\/div>/gi,
    '$1'
  );

  // 2. Strip inter-element whitespace between all block & void elements (hr, table, p, h1-h6, etc.)
  // while strictly preserving indentation and whitespace inside <pre><code> blocks
  processedHtml = processedHtml.replace(
    />\s+<(?!\/code)(h[1-6]|p|blockquote|table|thead|tbody|tr|th|td|ul|ol|li|hr|div|pre)/gi,
    '><$1'
  );
  processedHtml = processedHtml.replace(
    /(<\/(?:h[1-6]|p|blockquote|table|thead|tbody|tr|th|td|ul|ol|li|div|pre)>|<hr\s*\/?>)\s+<(?!\/code)/gi,
    '$1<'
  );

  if (wrapCode) {
    processedHtml = softWrapLongTokens(processedHtml);
  }

  // 3. Pre-process task checkboxes into clean glyphs regardless of attribute ordering
  processedHtml = processedHtml.replace(/<input(?=[^>]*\btype=["']checkbox["'])(?=[^>]*\bchecked\b)[^>]*>/gi, '☑ ');
  processedHtml = processedHtml.replace(/<input(?=[^>]*\btype=["']checkbox["'])[^>]*>/gi, '☐ ');

  // 4. Resolve images
  onProgress?.('highlighting', 50, 'Resolving images and vector assets...');
  const parser = new DOMParser();
  const doc = parser.parseFromString(processedHtml, 'text/html');
  const imgElements = Array.from(doc.querySelectorAll('img'));

  for (const img of imgElements) {
    const src = img.getAttribute('src');
    const alt = img.getAttribute('alt') || 'Image';
    if (src) {
      const dataUrl = await resolveImageToDataUrl(src);
      if (dataUrl) {
        img.setAttribute('src', dataUrl);
      } else {
        const placeholder = doc.createElement('div');
        placeholder.style.padding = '8px 12px';
        placeholder.style.border = '1px dashed #d0d7de';
        placeholder.style.backgroundColor = '#f6f8fa';
        placeholder.style.color = '#57609a';
        placeholder.style.fontSize = '9pt';
        placeholder.style.borderRadius = '4px';
        placeholder.style.margin = '6px 0';
        placeholder.textContent = `[Image placeholder: ${alt}]`;
        img.replaceWith(placeholder);
      }
    }
  }

  return doc.body.innerHTML;
}

function normalizeCodeTextInlines(inlines: any[]): any[] {
  const result: any[] = [];
  for (let i = 0; i < inlines.length; i++) {
    const curr = inlines[i];
    if (curr && typeof curr === 'object' && curr.text === '\n') {
      if (result.length > 0) {
        const prev = result[result.length - 1];
        if (typeof prev.text === 'string') {
          prev.text += '\n';
        } else {
          result.push(curr);
        }
      } else {
        result.push(curr);
      }
    } else {
      result.push(curr);
    }
  }
  return result;
}

function extractCellText(cell: any): string {
  if (!cell) return '';
  if (typeof cell === 'string') return cell.trim();
  if (typeof cell.text === 'string') return cell.text.trim();
  if (Array.isArray(cell.text)) {
    return cell.text
      .map((t: any) => (typeof t === 'string' ? t : (t?.text || '')))
      .join('')
      .trim();
  }
  if (Array.isArray(cell.stack)) {
    return cell.stack.map(extractCellText).join(' ').trim();
  }
  return '';
}

function getColMaxCharLength(body: any[][], colIdx: number): number {
  let maxLen = 0;
  const sampleRows = Math.min(body.length, 12);
  for (let r = 0; r < sampleRows; r++) {
    const cell = body[r]?.[colIdx];
    const text = extractCellText(cell);
    if (text.length > maxLen) {
      maxLen = text.length;
    }
  }
  return maxLen;
}

/**
 * Transforms parsed AST into clean, web-markdown-matching PDF elements:
 * - Blockquotes with clean callout border, tight padding, and zero ghost lines
 * - Code blocks with rounded box borders and compact line height
 * - Horizontal rules as crisp vector canvas lines without phantom table text
 * - Tables spanning full printable width with proportional columns
 * - Tight, non-additive vertical spacing that mirrors CSS margin collapsing
 * - Orphan prevention keeping headings and intro sentences together with content
 */
function postProcessPdfMakeAst(ast: any[], wrapCode: boolean, printableWidth: number): any[] {
  function transformNode(node: any): any {
    if (!node || typeof node !== 'object') return node;

    // 1. Filter out empty ghost paragraphs created by whitespace
    if (
      typeof node.text === 'string' &&
      node.text.trim() === '' &&
      !node.nodeName &&
      !node.stack &&
      !node.table &&
      !node.canvas
    ) {
      return null;
    }

    // 2. Clean margins on inline text fragments inside node.text so lines don't get huge gaps
    if (Array.isArray(node.text)) {
      for (const inline of node.text) {
        if (inline && typeof inline === 'object') {
          if (inline.margin) {
            delete inline.margin;
          }
          if (inline.marginBottom) {
            delete inline.marginBottom;
          }
        }
      }
    }

    // 3. Headings: Keep with next and tight, clean web-like margins
    if (node.nodeName && /^H[1-6]$/i.test(node.nodeName)) {
      node.keepWithNext = true;
      const level = parseInt(node.nodeName.charAt(1), 10);
      delete node.marginBottom;

      if (level === 1) {
        node.fontSize = 17;
        node.bold = true;
        node.color = '#1f2328';
        node.margin = [0, 0, 0, 5];
      } else if (level === 2) {
        node.fontSize = 13;
        node.bold = true;
        node.color = '#1f2328';
        node.margin = [0, 9, 0, 3];
      } else if (level === 3) {
        node.fontSize = 11;
        node.bold = true;
        node.color = '#1f2328';
        node.margin = [0, 7, 0, 3];
      } else {
        node.fontSize = 10;
        node.bold = true;
        node.color = '#1f2328';
        node.margin = [0, 5, 0, 2];
      }
      return node;
    }

    // 4. BLOCKQUOTE: Match web markdown with left border, light gray background, and zero ghost lines
    if (node.nodeName === 'BLOCKQUOTE') {
      const rawChildren = Array.isArray(node.stack) ? node.stack : [node];
      // Filter out empty whitespace nodes that htmlToPdfMake injects around blockquotes
      const filteredChildren = rawChildren.filter((c: any) => {
        if (!c) return false;
        if (typeof c.text === 'string' && c.text.trim() === '') return false;
        return true;
      });

      const cleanedChildren = filteredChildren.map((child: any) => {
        if (child && child.text && Array.isArray(child.text)) {
          for (const item of child.text) {
            if (item && typeof item === 'object') {
              delete item.margin;
              delete item.marginBottom;
              if (!item.color) item.color = '#57606a';
            }
          }
        }
        if (child && typeof child === 'object') {
          child.margin = [0, 0, 0, 2];
          delete child.marginBottom;
          if (!child.color) child.color = '#57606a';
          child.lineHeight = 1.35;
        }
        return child;
      });

      return {
        table: {
          widths: ['*'],
          body: [[
            {
              stack: cleanedChildren,
              fillColor: '#f6f8fa',
              border: [true, false, false, false]
            }
          ]]
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: (i: number) => (i === 0 ? 3 : 0),
          vLineColor: () => '#d0d7de',
          paddingLeft: () => 10,
          paddingRight: () => 8,
          paddingTop: () => 4,
          paddingBottom: () => 4
        },
        margin: [0, 2, 0, 5]
      };
    }

    // 5. Code block PRE: Match web markdown with border box, padding, and background
    if (node.nodeName === 'PRE' || (node.style && node.style.includes('html-pre'))) {
      node.preserveLeadingSpaces = true;
      node.fontSize = 8.5;
      node.lineHeight = 1.3;
      node.color = '#1f2328';
      node.margin = [0, 0, 0, 0];
      if (wrapCode) {
        node.noWrap = false;
      }

      // Normalize line breaks inside code blocks
      if (Array.isArray(node.text)) {
        for (const child of node.text) {
          if (child && typeof child === 'object') {
            delete child.margin;
            delete child.marginBottom;
            child.fontSize = 8.5;
            child.lineHeight = 1.3;
          }
          if (child && Array.isArray(child.text)) {
            child.text = normalizeCodeTextInlines(child.text);
          }
        }
        node.text = normalizeCodeTextInlines(node.text);
      }

      return {
        table: {
          widths: ['*'],
          body: [[
            {
              stack: [node],
              fillColor: '#f6f8fa',
              border: [true, true, true, true]
            }
          ]]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#d0d7de',
          vLineColor: () => '#d0d7de',
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6
        },
        margin: [0, 2, 0, 5]
      };
    }

    // 6. HR horizontal rule: Clean vector canvas line across printable width
    if (node.nodeName === 'HR') {
      return {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: printableWidth,
            y2: 0,
            lineWidth: 0.75,
            lineColor: '#d8dee4'
          }
        ],
        margin: [0, 6, 0, 6]
      };
    }

    // 7. Tables: Clean developer borders, repeated headers, proportional full-width sizing
    if (node.table) {
      node.table.headerRows = 1;
      node.table.dontBreakRows = true;
      if (node.table.body && node.table.body[0]) {
        const colCount = node.table.body[0].length;
        if (colCount === 1) {
          node.table.widths = ['*'];
        } else if (colCount === 2) {
          const col0Len = getColMaxCharLength(node.table.body, 0);
          node.table.widths = col0Len <= 25 ? ['auto', '*'] : ['*', '*'];
        } else if (colCount === 3) {
          const col0Len = getColMaxCharLength(node.table.body, 0);
          const col1Len = getColMaxCharLength(node.table.body, 1);
          const w0 = col0Len <= 15 ? 'auto' : '*';
          const w1 = col1Len <= 20 ? 'auto' : '*';
          node.table.widths = [w0, w1, '*'];
        } else {
          // 4+ columns (e.g. cheatsheet, comparison, matrix)
          // Keep compact index columns (e.g. #, ID, No) as 'auto' and distribute content columns with '*'
          const widths: string[] = [];
          for (let colIdx = 0; colIdx < colCount; colIdx++) {
            const maxLen = getColMaxCharLength(node.table.body, colIdx);
            if (maxLen <= 5 && colIdx === 0) {
              widths.push('auto');
            } else {
              widths.push('*');
            }
          }
          if (!widths.includes('*')) {
            widths[widths.length - 1] = '*';
          }
          node.table.widths = widths;
        }
      }
      node.margin = [0, 2, 0, 5];
      node.layout = {
        hLineWidth: (i: number, tableNode: any) =>
          i === 0 || i === 1 || i === tableNode.table.body.length ? 0.75 : 0.5,
        vLineWidth: () => 0,
        hLineColor: () => '#d0d7de',
        paddingLeft: () => 6,
        paddingRight: () => 6,
        paddingTop: () => 4,
        paddingBottom: () => 4
      };
      return node;
    }

    // 8. Paragraphs: Set clean web-like bottom margin
    if (node.nodeName === 'P') {
      node.margin = [0, 0, 0, 4];
      node.lineHeight = 1.35;
      return node;
    }

    // 9. Lists: Tighter spacing
    if (node.nodeName === 'UL' || node.nodeName === 'OL') {
      node.margin = [0, 2, 0, 4];
      delete node.marginBottom;
      return node;
    }

    // Recurse into children
    if (Array.isArray(node.stack)) {
      node.stack = node.stack.map(transformNode).filter(Boolean);
    }
    if (Array.isArray(node.ul)) {
      node.ul = node.ul.map(transformNode).filter(Boolean);
    }
    if (Array.isArray(node.ol)) {
      node.ol = node.ol.map(transformNode).filter(Boolean);
    }

    return node;
  }

  const processed = ast.map(transformNode).filter(Boolean);

  // 10. Prevent orphan section intros: if a heading is followed by a short intro paragraph
  // and then a table, canvas line, or code block, keep the paragraph with next element
  for (let i = 0; i < processed.length - 1; i++) {
    const curr = processed[i];
    const prev = i > 0 ? processed[i - 1] : null;
    const next = processed[i + 1];

    if (
      curr &&
      curr.nodeName === 'P' &&
      prev &&
      prev.nodeName &&
      /^H[1-6]$/i.test(prev.nodeName) &&
      next &&
      (next.table || next.canvas || next.nodeName === 'PRE' || (next.stack && next.stack[0]?.nodeName === 'PRE'))
    ) {
      curr.keepWithNext = true;
    }
  }

  return processed;
}

export async function generatePdfFromHtml(
  html: string,
  config: PdfConfig,
  onProgress?: ProgressCallback
): Promise<{ blob: Blob; blobUrl: string; pageCount: number }> {
  onProgress?.('parsing', 15, 'Parsing document structure...');

  const preprocessedHtml = await preprocessHtmlForPdf(html, config.wrapCode, onProgress);

  onProgress?.('paginating', 65, 'Constructing pagination & layout trees...');
  const rawPdfmakeContent = htmlToPdfmake(preprocessedHtml, {
    window: window,
    tableAutoSize: true,
    defaultStyles: {
      b: { bold: true },
      strong: { bold: true },
      i: { italics: true },
      em: { italics: true },
      a: { color: '#0969da', decoration: 'underline' },
      code: {
        fontSize: 8.5,
        background: '#f6f8fa',
        color: '#1f2328'
      },
      p: { margin: [0, 0, 0, 4], lineHeight: 1.35, color: '#24292f' },
      th: {
        bold: true,
        fillColor: '#f6f8fa',
        color: '#1f2328',
        fontSize: 9
      },
      td: {
        color: '#24292f',
        fontSize: 8.5
      }
    }
  });

  let margins: [number, number, number, number];
  if (config.marginPreset === 'custom') {
    margins = [
      config.customMargins.left,
      config.customMargins.top,
      config.customMargins.right,
      config.customMargins.bottom
    ];
  } else {
    margins = MARGIN_PRESETS[config.marginPreset] as [number, number, number, number];
  }

  const pageDimensions = PAGE_SIZES[config.pageSize] || PAGE_SIZES.A4;
  const pageWidth = config.orientation === 'landscape' ? pageDimensions[1] : pageDimensions[0];
  const printableWidth = Math.max(100, pageWidth - margins[0] - margins[2]);

  // Post-process AST for high-fidelity web matching
  const finalContent = postProcessPdfMakeAst(rawPdfmakeContent, config.wrapCode, printableWidth);

  const docDefinition: any = {
    pageSize: config.pageSize,
    pageOrientation: config.orientation,
    pageMargins: [margins[0], margins[1], margins[2], config.showPageNumbers ? margins[3] + 12 : margins[3]],
    content: finalContent,
    defaultStyle: {
      fontSize: 9.5,
      lineHeight: 1.35,
      color: '#24292f'
    }
  };

  if (config.showPageNumbers) {
    docDefinition.footer = (currentPage: number, pageCount: number) => {
      return {
        columns: [
          {
            text: config.documentTitle || 'MD2PDF Document',
            alignment: 'left',
            fontSize: 8,
            color: '#8c959f',
            margin: [margins[0], 0, 0, 0]
          },
          {
            text: `Page ${currentPage} of ${pageCount}`,
            alignment: 'right',
            fontSize: 8,
            color: '#8c959f',
            margin: [0, 0, margins[2], 0]
          }
        ],
        margin: [0, 6, 0, 0]
      };
    };
  }

  onProgress?.('compiling', 85, 'Rendering vector PDF stream...');

  try {
    const pdfDocGenerator = (pdfMake as any).createPdf(docDefinition);
    const blob: Blob = await pdfDocGenerator.getBlob();

    onProgress?.('ready', 100, 'PDF generation complete!');
    const blobUrl = URL.createObjectURL(blob);

    let pageCount = 1;
    try {
      const buffer = await blob.arrayBuffer();
      const text = new TextDecoder('latin1').decode(buffer);
      const matches = text.match(/\/Type\s*\/Page\b/g);
      if (matches && matches.length > 0) {
        pageCount = matches.length;
      }
    } catch {
      // fallback
    }

    return { blob, blobUrl, pageCount };
  } catch (err: any) {
    onProgress?.('error', 100, err?.message || 'PDF compilation failed');
    throw err;
  }
}
