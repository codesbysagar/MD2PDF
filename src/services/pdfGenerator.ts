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
  normal: [40, 40, 40, 40],
  narrow: [22, 25, 22, 25],
  wide: [58, 50, 58, 50]
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

  // 1. Strip newlines only between block elements so htmlToPdfmake does NOT generate empty paragraphs,
  // while preserving exact newlines inside <pre><code> blocks and inline spans
  processedHtml = processedHtml.replace(
    /(<\/(?:h[1-6]|p|blockquote|table|thead|tbody|tr|ul|ol|hr|div|figure|figcaption)>)\s*[\r\n]+\s*(<(?:h[1-6]|p|blockquote|table|thead|tbody|tr|ul|ol|hr|div|figure|figcaption|pre))/gi,
    '$1$2'
  );

  if (wrapCode) {
    processedHtml = softWrapLongTokens(processedHtml);
  }

  // 2. Pre-process task checkboxes into clean glyphs
  processedHtml = processedHtml.replace(/<input[^>]*type=["']checkbox["'][^>]*checked[^>]*>/gi, '☑ ');
  processedHtml = processedHtml.replace(/<input[^>]*type=["']checkbox["'][^>]*>/gi, '☐ ');

  // 3. Resolve images
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
        placeholder.style.margin = '8px 0';
        placeholder.textContent = `[Image placeholder: ${alt}]`;
        img.replaceWith(placeholder);
      }
    }
  }

  return doc.body.innerHTML;
}

/**
 * Transforms parsed AST into clean, web-markdown-matching PDF elements:
 * - Blockquotes with a left border and gray background
 * - Code blocks with rounded-box borders, padding, and background
 * - Cleaner, tighter vertical margins without ghost paragraphs
 * - Tables with repeated headers and proper borders
 */
function postProcessPdfMakeAst(ast: any[], wrapCode: boolean): any[] {
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
        node.fontSize = 18;
        node.bold = true;
        node.color = '#1f2328';
        node.margin = [0, 10, 0, 6];
      } else if (level === 2) {
        node.fontSize = 14;
        node.bold = true;
        node.color = '#1f2328';
        node.margin = [0, 10, 0, 4];
      } else if (level === 3) {
        node.fontSize = 12;
        node.bold = true;
        node.color = '#1f2328';
        node.margin = [0, 8, 0, 3];
      } else {
        node.fontSize = 10.5;
        node.bold = true;
        node.color = '#1f2328';
        node.margin = [0, 6, 0, 2];
      }
      return node;
    }

    // 4. BLOCKQUOTE: Match web markdown with left border and light gray background
    if (node.nodeName === 'BLOCKQUOTE') {
      const children = Array.isArray(node.stack) ? node.stack : [node];
      const cleanedChildren = children.map((child: any) => {
        if (child && child.text && Array.isArray(child.text)) {
          for (const item of child.text) {
            if (item && typeof item === 'object') {
              delete item.margin;
              if (!item.color) item.color = '#57606a';
            }
          }
        }
        if (child && typeof child === 'object') {
          child.margin = [0, 0, 0, 3];
          if (!child.color) child.color = '#57606a';
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
          vLineWidth: (i: number) => (i === 0 ? 3.5 : 0),
          vLineColor: () => '#d0d7de',
          paddingLeft: () => 12,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6
        },
        margin: [0, 4, 0, 8]
      };
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

    // 5. Code block PRE: Match web markdown with border box, padding, and background
    if (node.nodeName === 'PRE' || (node.style && node.style.includes('html-pre'))) {
      node.preserveLeadingSpaces = true;
      node.fontSize = 8.5;
      node.lineHeight = 1.35;
      node.color = '#1f2328';
      node.margin = [0, 0, 0, 0];
      if (wrapCode) {
        node.noWrap = false;
      }

      // Normalize line breaks inside code blocks
      if (Array.isArray(node.text)) {
        for (const child of node.text) {
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
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 8,
          paddingBottom: () => 8
        },
        margin: [0, 4, 0, 8]
      };
    }

    // 6. HR horizontal rule: full width subtle divider line
    if (node.nodeName === 'HR') {
      return {
        table: {
          widths: ['*'],
          body: [[
            {
              text: '',
              border: [false, false, false, true]
            }
          ]]
        },
        layout: {
          hLineWidth: (i: number) => (i === 1 ? 0.75 : 0),
          vLineWidth: () => 0,
          hLineColor: () => '#d8dee4',
          paddingTop: () => 0,
          paddingBottom: () => 0
        },
        margin: [0, 6, 0, 8]
      };
    }

    // 7. Tables: Clean developer borders, header row repeating, no row slicing
    if (node.table) {
      node.table.headerRows = 1;
      node.table.dontBreakRows = true;
      if (!node.table.widths && node.table.body && node.table.body[0]) {
        node.table.widths = Array(node.table.body[0].length).fill('*');
      }
      node.margin = [0, 4, 0, 8];
      node.layout = {
        hLineWidth: (i: number, tableNode: any) =>
          i === 0 || i === 1 || i === tableNode.table.body.length ? 0.75 : 0.5,
        vLineWidth: () => 0,
        hLineColor: () => '#d0d7de',
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 5,
        paddingBottom: () => 5
      };
      return node;
    }

    // 8. Paragraphs: Set clean web-like bottom margin
    if (node.nodeName === 'P') {
      node.margin = [0, 0, 0, 6];
      node.lineHeight = 1.45;
      return node;
    }

    // 9. Lists: Tighter spacing
    if (node.nodeName === 'UL' || node.nodeName === 'OL') {
      node.margin = [0, 2, 0, 6];
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

  return ast.map(transformNode).filter(Boolean);
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
      p: { margin: [0, 0, 0, 6], lineHeight: 1.45, color: '#24292f' },
      th: {
        bold: true,
        fillColor: '#f6f8fa',
        color: '#1f2328'
      },
      td: {
        color: '#24292f'
      }
    }
  });

  // Post-process AST for high-fidelity web matching
  const finalContent = postProcessPdfMakeAst(rawPdfmakeContent, config.wrapCode);

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

  const docDefinition: any = {
    pageSize: config.pageSize,
    pageOrientation: config.orientation,
    pageMargins: [margins[0], margins[1], margins[2], config.showPageNumbers ? margins[3] + 15 : margins[3]],
    content: finalContent,
    defaultStyle: {
      fontSize: 10,
      lineHeight: 1.45,
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
        margin: [0, 8, 0, 0]
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
