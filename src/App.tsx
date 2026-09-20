import { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { ProgressBar } from './components/ProgressBar';
import { MarkdownEditor } from './components/MarkdownEditor';
import { MarkdownPreview } from './components/MarkdownPreview';
import { PdfPreview } from './components/PdfPreview';
import { DocumentStatsBar } from './components/DocumentStatsBar';
import { HelpModal } from './components/HelpModal';
import { SAMPLE_TEMPLATES } from './utils/sampleMarkdown';
import type { MarkdownSample } from './utils/sampleMarkdown';
import { renderMarkdownToHtml } from './services/markdownRenderer';
import { generatePdfFromHtml } from './services/pdfGenerator';
import { printPdfBlob } from './services/printService';
import { downloadBlob } from './utils/fileHandler';
import { getPdfFilename } from './utils/filename';
import { calculateDocumentStats } from './utils/stats';
import type { PdfConfig, GenerationState, ActiveTab } from './types';
import './styles/index.css';
import './styles/markdown.css';
import './styles/print.css';

export function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Apply theme data-theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Markdown Document State
  const [sourceFilename, setSourceFilename] = useState<string>('cloudmesh-api-guide.md');
  const [markdown, setMarkdown] = useState<string>(SAMPLE_TEMPLATES[0].content);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<number | null>(null);

  // Layout View Tabs: 'split' | 'editor' | 'preview' | 'pdf'
  const [activeTab, setActiveTab] = useState<ActiveTab>('split');

  // Help Modal State
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // PDF Configuration
  const [config, setConfig] = useState<PdfConfig>({
    pageSize: 'A4',
    orientation: 'portrait',
    marginPreset: 'normal',
    customMargins: { top: 40, right: 40, bottom: 40, left: 40 },
    wrapCode: true,
    showPageNumbers: true,
    documentTitle: 'CloudMesh API Reference'
  });

  // Generation Engine State
  const [generationState, setGenerationState] = useState<GenerationState>({
    step: 'idle',
    progress: 0,
    message: '',
    pdfBlobUrl: null,
    pdfBlob: null,
    error: null,
    pageCount: 0,
    generatedAt: null
  });

  // Calculate Document Metrics
  const stats = useMemo(() => calculateDocumentStats(markdown), [markdown]);

  // Debounced Markdown -> HTML Render
  useEffect(() => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      const html = renderMarkdownToHtml(markdown);
      setRenderedHtml(html);
      setIsTyping(false);
    }, 120);

    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [markdown]);

  // Handle PDF Generation
  const handleGeneratePdf = async () => {
    if (generationState.step !== 'idle' && generationState.step !== 'ready' && generationState.step !== 'error') {
      return; // already running
    }

    try {
      setGenerationState((prev) => ({
        ...prev,
        step: 'parsing',
        progress: 10,
        message: 'Initializing vector PDF engine...',
        error: null
      }));

      // Extract document title from first H1 if available
      const titleMatch = markdown.match(/^#\s+(.+)$/m);
      const docTitle = titleMatch ? titleMatch[1].trim() : config.documentTitle;

      const currentConfig: PdfConfig = {
        ...config,
        documentTitle: docTitle
      };

      const result = await generatePdfFromHtml(
        renderedHtml,
        currentConfig,
        (step, progress, message) => {
          setGenerationState((prev) => ({
            ...prev,
            step,
            progress,
            message
          }));
        }
      );

      // Clean up previous blob URL if needed
      if (generationState.pdfBlobUrl) {
        URL.revokeObjectURL(generationState.pdfBlobUrl);
      }

      setGenerationState({
        step: 'ready',
        progress: 100,
        message: `Vector PDF ready (${result.pageCount} ${result.pageCount === 1 ? 'page' : 'pages'})`,
        pdfBlobUrl: result.blobUrl,
        pdfBlob: result.blob,
        error: null,
        pageCount: result.pageCount,
        generatedAt: new Date()
      });

      // Delight celebration animation
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#e11d48', '#fb7185', '#10b981', '#38bdf8']
      });

      // Switch tab to PDF preview if user was in preview mode or wants to see PDF
      if (activeTab === 'preview') {
        setActiveTab('pdf');
      }
    } catch (err: any) {
      console.error('PDF Generation Failed:', err);
      setGenerationState((prev) => ({
        ...prev,
        step: 'error',
        progress: 100,
        message: err?.message || 'Unable to generate PDF. Check content or reduce document size.',
        error: err?.message || 'Generation error'
      }));
    }
  };

  // Handle Download
  const handleDownload = () => {
    if (!generationState.pdfBlob) return;
    const filename = getPdfFilename(sourceFilename);
    downloadBlob(generationState.pdfBlob, filename);
  };

  // Handle Print
  const handlePrint = () => {
    if (generationState.pdfBlobUrl) {
      printPdfBlob(generationState.pdfBlobUrl);
    } else {
      window.print();
    }
  };

  // Handle Sample Template Load
  const handleSelectSample = (sample: MarkdownSample) => {
    setMarkdown(sample.content);
    setSourceFilename(`${sample.id}.md`);
  };

  // Handle Clear
  const handleClear = () => {
    if (markdown.trim() && window.confirm('Clear all Markdown content?')) {
      setMarkdown('');
      setSourceFilename('document.md');
      setGenerationState({
        step: 'idle',
        progress: 0,
        message: '',
        pdfBlobUrl: null,
        pdfBlob: null,
        error: null,
        pageCount: 0,
        generatedAt: null
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* 1. App Header */}
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onSelectSample={handleSelectSample}
        onOpenHelp={() => setIsHelpOpen(true)}
        isTyping={isTyping}
      />

      {/* 2. Main Toolbar */}
      <Toolbar
        config={config}
        onChangeConfig={(patch) => setConfig((prev) => ({ ...prev, ...patch }))}
        onGeneratePdf={handleGeneratePdf}
        onPrint={handlePrint}
        onDownload={handleDownload}
        isGenerating={generationState.step !== 'idle' && generationState.step !== 'ready' && generationState.step !== 'error'}
        hasPdf={Boolean(generationState.pdfBlobUrl)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* 3. Progress Bar with Crimson Glow & Shimmer */}
      <ProgressBar state={generationState} />

      {/* 4. Main Body Layout */}
      <main style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Split View */}
        {activeTab === 'split' && (
          <>
            <div style={{ flex: 1, minWidth: '320px', height: '100%', minHeight: 0, overflow: 'hidden' }}>
              <MarkdownEditor
                value={markdown}
                onChange={setMarkdown}
                onUploadFile={(name, content) => {
                  setSourceFilename(name);
                  setMarkdown(content);
                }}
                onClear={handleClear}
                onTriggerGenerate={handleGeneratePdf}
              />
            </div>
            <div style={{ flex: 1, minWidth: '320px', height: '100%', minHeight: 0, overflow: 'hidden' }}>
              <MarkdownPreview
                html={renderedHtml}
                wrapCode={config.wrapCode}
              />
            </div>
          </>
        )}

        {/* Editor Only View */}
        {activeTab === 'editor' && (
          <div style={{ flex: 1, height: '100%', minHeight: 0, overflow: 'hidden' }}>
            <MarkdownEditor
              value={markdown}
              onChange={setMarkdown}
              onUploadFile={(name, content) => {
                setSourceFilename(name);
                setMarkdown(content);
              }}
              onClear={handleClear}
              onTriggerGenerate={handleGeneratePdf}
            />
          </div>
        )}

        {/* HTML Live Preview View */}
        {activeTab === 'preview' && (
          <div style={{ flex: 1, height: '100%', minHeight: 0, overflow: 'hidden' }}>
            <MarkdownPreview
              html={renderedHtml}
              wrapCode={config.wrapCode}
            />
          </div>
        )}

        {/* PDF Preview View */}
        {activeTab === 'pdf' && (
          <div style={{ flex: 1, height: '100%', minHeight: 0, overflow: 'hidden' }}>
            <PdfPreview
              pdfBlobUrl={generationState.pdfBlobUrl}
              pageCount={generationState.pageCount}
              config={config}
              onGeneratePdf={handleGeneratePdf}
              onDownload={handleDownload}
              onPrint={handlePrint}
              isGenerating={generationState.step !== 'idle' && generationState.step !== 'ready' && generationState.step !== 'error'}
            />
          </div>
        )}
      </main>

      {/* 5. Document Stats & Live Indicator Bar */}
      <DocumentStatsBar stats={stats} isTyping={isTyping} />

      {/* 6. Help & Privacy Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
export default App;
