/**
 * Sanitizes a filename to ensure safe download and cross-platform compatibility
 */
export function sanitizeFilename(name: string, fallback: string = 'document'): string {
  if (!name || typeof name !== 'string') return fallback;

  // Remove path traversals
  let sanitized = name.replace(/^.*[\\/]/, '');

  // Strip .md, .markdown, .txt extensions if present
  sanitized = sanitized.replace(/\.(md|markdown|mdown|mkd|txt)$/i, '');

  // Replace spaces and invalid characters with hyphens or underscores
  sanitized = sanitized
    .trim()
    .replace(/[^a-zA-Z0-9-_\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (!sanitized || sanitized === '-') {
    return fallback;
  }

  return sanitized;
}

export function getPdfFilename(sourceFilename: string): string {
  const base = sanitizeFilename(sourceFilename, 'document');
  return `${base}.pdf`;
}
