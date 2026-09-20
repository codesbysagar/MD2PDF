# MD2PDF — Client-Side Markdown to Vector PDF Generator

> **"Your Markdown never leaves your browser. PDF generation happens entirely on your device."**

A privacy-first, developer-focused web application that converts Markdown documents into clean, developer-friendly PDFs entirely in the browser with **zero server involvement**.

Designed for developers, engineers, technical writers, and students who need their study notes, technical documentation, API specs, and README files converted into clean, readable vector PDFs that look like naturally rendered web documentation rather than overly formatted office documents.

---

## Key Features

- **100% Client-Side Privacy**: No Markdown content, rendered HTML, or generated PDFs are ever uploaded to any backend or server. All processing runs locally in your browser memory.
- **Selectable & Searchable Vector PDF**: Generates native vector PDFs with selectable text, scalable typography, and small file sizes (tens of KB instead of multi-megabyte canvas snapshots).
- **Natural Web Documentation Aesthetics**: Rendered with GitHub/MDN-inspired typography, subtle table borders, padded code blocks, and clean developer documentation styling.
- **Always Light Mode PDF**: Even when you toggle the web application's dark mode UI, the generated PDF remains strictly in a clean, professional light document theme.
- **Intelligent Pagination & Overflow Handling**:
  - **100+ Line Code Blocks**: Code blocks naturally flow across multiple pages without awkward text cuts.
  - **Long Code Line Wrapping**: Code wrapping ensures long lines and URLs don't overflow the page margins while protecting whitespace and indentation.
  - **Multi-Page Tables**: Wide tables adapt proportionally, text wraps inside cells, and table headers automatically repeat across pages (`headerRows: 1`).
  - **Orphaned Heading Prevention**: Headings automatically stay attached to their following paragraphs (`keepWithNext: true`).
  - **Image Fallbacks**: Remote images are preloaded to data URLs; CORS-blocked or missing images render graceful placeholders instead of crashing PDF generation.
- **Page Sizes & Orientations**:
  - Sizes: **A4**, **A3**, **A5**, **Letter**
  - Layouts: **Portrait**, **Landscape**
  - Margins: **Normal** (40pt), **Narrow** (22pt), **Wide** (58pt), and **Custom**
- **Live HTML Preview & PDF Preview**:
  - Split View, Editor-Only, Live HTML View, and dedicated Vector PDF Preview with zoom and multi-page scrolling.
- **Direct Download & Browser Print**:
  - Instant sanitized file download (`javascript-notes.md` → `javascript-notes.pdf`).
  - Direct print integration invoking the browser print dialog for the generated PDF.
- **User-Friendly UI with Crimson Accent & Continuous Feedback**:
  - Uncluttered, developer-friendly interface with sleek crimson accent styling (`#dc143c`).
  - Real-time continuous progress animations, live typing status, and celebration feedback.
- **Firebase Hosting Free Plan Ready**: Fully static client-side web app compatible with Firebase Hosting Spark (free) plan.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Markdown Parsing**: `marked` (GitHub Flavored Markdown)
- **Syntax Highlighting**: `highlight.js`
- **Sanitization**: `DOMPurify` (Zero XSS / safe HTML injection)
- **Vector PDF Engine**: `pdfmake` + `html-to-pdfmake`
- **Icons**: `lucide-react`
- **Animations & Effects**: CSS keyframes + `canvas-confetti`

---

## Getting Started Locally

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone repository
git clone https://github.com/codesbysagar/MD2PDF.git
cd MD2PDF

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build & Firebase Hosting

The application is a purely static SPA, making it ideal for Firebase Hosting's free Spark plan:

```bash
# Compile and bundle static assets into dist/
npm run build

# Deploy to Firebase Hosting (free Spark plan)
npx firebase deploy --only hosting
```

The repository includes `firebase.json` with recommended security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy: no-referrer`) and single-page application routing.

---

## Keyboard Shortcuts

- <kbd>Ctrl</kbd> + <kbd>Enter</kbd> (or <kbd>Cmd</kbd> + <kbd>Enter</kbd>): Compile Vector PDF

---

## License

MIT License. See [LICENSE](LICENSE) for details.
