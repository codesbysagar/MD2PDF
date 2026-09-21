export interface MarkdownSample {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const SAMPLE_TEMPLATES: MarkdownSample[] = [
  {
    id: 'welcome-guide',
    name: 'Welcome Guide',
    description: 'Quick start guide demonstrating Markdown formatting and PDF generation',
    content: `# Welcome to MD2PDF

> **Privacy Notice:** 100% client-side processing. Your document content never leaves your browser.

Welcome to **MD2PDF** — a clean, privacy-first tool to convert your Markdown notes, specifications, and documentation into publication-quality Vector PDFs.

---

## Quick Start Guide

1. **Edit or Paste:** Type your Markdown on the left editor panel or use the **Upload .md** button.
2. **Real-time Preview:** See formatted HTML on the right as you type.
3. **Configure Layout:** Adjust page size, orientation, and margins in the left toolbox.
4. **Compile & Download:** Click **Generate PDF** to create a vector PDF ready to print or download.

---

## Markdown Features Showcase

### Syntax Highlighted Code

\`\`\`typescript
interface ExportConfig {
  pageSize: 'A4' | 'Letter' | 'A3' | 'A5';
  orientation: 'portrait' | 'landscape';
  marginPreset: 'normal' | 'narrow' | 'wide';
}

export function exportDocument(title: string, config: ExportConfig): void {
  console.log(\`Compiling "\${title}" to vector PDF...\`);
}
\`\`\`

### Data Tables

| Feature | Supported | Description |
| :--- | :---: | :--- |
| Vector Typography | Yes | Crisp, selectable, and searchable text |
| Syntax Highlighting | Yes | Accurate code coloring across languages |
| Clean Page Breaks | Yes | Headers repeat and sections avoid awkward splits |
| Offline Processing | Yes | Zero server uploads; works completely locally |

### Task Checklist

- [x] Write Markdown documentation
- [x] Configure page geometry and orientation
- [ ] Export high-resolution Vector PDF

---

> **Tip:** You can press **Ctrl + Enter** (or **Cmd + Enter**) at any time to quickly compile your PDF.
`
  }
];
