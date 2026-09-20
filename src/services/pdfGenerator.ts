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
  normal: [40, 42, 40, 42],
  narrow: [22, 25, 22, 25],
  wide: [58, 55, 58, 55]
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
  onProgress?.('highlighting', 35, 'Optimizing typography and code wrapping...');

  let processedHtml = html;

  if (wrapCode) {
    processedHtml = softWrapLongTokens(processedHtml);
  }

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

  const tables = Array.from(doc.querySelectorAll('table'));
  for (const table of tables) {
    table.setAttribute('data-pdfmake', JSON.stringify({
      layout: 'lightHorizontalLines'
    }));
  }

  return doc.body.innerHTML;
}

function postProcessPdfMakeAst(ast: any[], wrapCode: boolean): void {
  function traverse(node: any) {
    if (!node || typeof node !== 'object') return;

    if (node.nodeName && /^H[1-6]$/i.test(node.nodeName)) {
      node.keepWithNext = true;
      node.headlineLevel = parseInt(node.nodeName.charAt(1), 10);
    }

    if (node.table) {
      node.table.headerRows = 1;
      node.table.dontBreakRows = true;
      if (!node.table.widths && node.table.body && node.table.body[0]) {
        const colCount = node.table.body[0].length;
        node.table.widths = Array(colCount).fill('*');
      }
    }

    if (node.nodeName === 'PRE' || (node.style && node.style.includes('html-pre'))) {
      node.preserveLeadingSpaces = true;
      if (wrapCode) {
        node.noWrap = false;
      }
    }

    if (Array.isArray(node)) {
      for (const item of node) traverse(item);
    } else {
      if (Array.isArray(node.stack)) traverse(node.stack);
      if (Array.isArray(node.text) && typeof node.text !== 'string') traverse(node.text);
      if (Array.isArray(node.ul)) traverse(node.ul);
      if (Array.isArray(node.ol)) traverse(node.ol);
      if (node.table && Array.isArray(node.table.body)) {
        for (const row of node.table.body) {
          if (Array.isArray(row)) {
            for (const cell of row) traverse(cell);
          }
        }
      }
    }
  }

  traverse(ast);
}

export async function generatePdfFromHtml(
  html: string,
  config: PdfConfig,
  onProgress?: ProgressCallback
): Promise<{ blob: Blob; blobUrl: string; pageCount: number }> {
  onProgress?.('parsing', 15, 'Parsing document structure...');

  const preprocessedHtml = await preprocessHtmlForPdf(html, config.wrapCode, onProgress);

  onProgress?.('paginating', 65, 'Constructing pagination & layout trees...');
  const pdfmakeContent = htmlToPdfmake(preprocessedHtml, {
    window: window,
    tableAutoSize: true,
    defaultStyles: {
      b: { bold: true },
      strong: { bold: true },
      i: { italics: true },
      em: { italics: true },
      a: { color: '#0969da', decoration: 'underline' },
      h1: { fontSize: 20, bold: true, margin: [0, 14, 0, 8], color: '#1f2328' },
      h2: { fontSize: 16, bold: true, margin: [0, 12, 0, 6], color: '#1f2328' },
      h3: { fontSize: 13, bold: true, margin: [0, 10, 0, 4], color: '#1f2328' },
      h4: { fontSize: 11, bold: true, margin: [0, 8, 0, 4], color: '#1f2328' },
      p: { margin: [0, 4, 0, 6], lineHeight: 1.45, color: '#24292f' },
      code: {
        fontSize: 9,
        background: '#f6f8fa',
        color: '#1f2328'
      },
      pre: {
        fontSize: 8.5,
        background: '#f6f8fa',
        color: '#1f2328',
        margin: [0, 6, 0, 8]
      },
      blockquote: {
        italics: true,
        color: '#57606a',
        margin: [8, 4, 0, 6]
      },
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

  postProcessPdfMakeAst(pdfmakeContent, config.wrapCode);

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
    content: pdfmakeContent,
    defaultStyle: {
      fontSize: 10,
      lineHeight: 1.45,
      color: '#24292f'
    },
    styles: {
      'html-h1': { fontSize: 20, bold: true, margin: [0, 14, 0, 8], color: '#1f2328' },
      'html-h2': { fontSize: 16, bold: true, margin: [0, 12, 0, 6], color: '#1f2328' },
      'html-h3': { fontSize: 13, bold: true, margin: [0, 10, 0, 4], color: '#1f2328' },
      'html-h4': { fontSize: 11, bold: true, margin: [0, 8, 0, 4], color: '#1f2328' },
      'html-p': { margin: [0, 4, 0, 6], lineHeight: 1.45 },
      'html-pre': {
        fontSize: 8.5,
        margin: [0, 6, 0, 8]
      },
      'html-code': {
        fontSize: 9
      },
      'html-table': {
        margin: [0, 6, 0, 10]
      },
      'html-th': {
        bold: true,
        fillColor: '#f6f8fa',
        color: '#1f2328'
      },
      'html-blockquote': {
        italics: true,
        color: '#57606a',
        margin: [8, 4, 0, 6]
      }
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

    // Calculate actual page count
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
