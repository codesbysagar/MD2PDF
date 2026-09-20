import React from 'react';
import {
  FileCheck,
  Download,
  Printer,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import type { PdfConfig } from '../types';

interface PdfPreviewProps {
  pdfBlobUrl: string | null;
  pageCount: number;
  config: PdfConfig;
  onGeneratePdf: () => void;
  onDownload: () => void;
  onPrint: () => void;
  isGenerating: boolean;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  pdfBlobUrl,
  pageCount,
  config,
  onGeneratePdf,
  onDownload,
  onPrint,
  isGenerating
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-app)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        fontSize: '12px',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <FileCheck size={15} color="var(--crimson-600)" />
          <span style={{ fontWeight: 600 }}>Compiled PDF Preview</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>

          {pdfBlobUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '1px 7px',
                borderRadius: '10px',
                backgroundColor: 'var(--crimson-50)',
                color: 'var(--crimson-700)',
                border: '1px solid var(--crimson-200)'
              }}>
                {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
              </span>

              <span style={{
                fontSize: '11px',
                padding: '1px 7px',
                borderRadius: '10px',
                backgroundColor: 'var(--bg-surface-hover)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}>
                {config.pageSize} {config.orientation}
              </span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Awaiting generation</span>
          )}
        </div>

        {pdfBlobUrl && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => window.open(pdfBlobUrl, '_blank')}
              title="Open PDF in a new browser window"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '5px',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <ExternalLink size={12} />
              <span>Full Tab</span>
            </button>

            <button
              onClick={onPrint}
              title="Print generated PDF"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '5px',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <Printer size={12} />
              <span>Print</span>
            </button>

            <button
              onClick={onDownload}
              title="Download PDF locally"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '5px',
                border: '1px solid var(--crimson-600)',
                backgroundColor: 'var(--crimson-600)',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 1px 4px var(--crimson-glow)'
              }}
            >
              <Download size={12} />
              <span>Download</span>
            </button>
          </div>
        )}
      </div>

      <div style={{
        flex: 1,
        position: 'relative',
        backgroundColor: '#525659',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {pdfBlobUrl ? (
          <iframe
            src={`${pdfBlobUrl}#view=FitH&toolbar=1`}
            title="Generated PDF Preview"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#525659'
            }}
          />
        ) : (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '40px 32px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            textAlign: 'center',
            maxWidth: '420px',
            margin: '20px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--crimson-50)',
              color: 'var(--crimson-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Sparkles size={26} />
            </div>

            <h3 style={{
              fontSize: '17px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '8px'
            }}>
              Ready to Compile Vector PDF
            </h3>

            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: '20px'
            }}>
              Compile your Markdown into a crisp, searchable vector PDF with true page boundaries and developer documentation styling.
            </p>

            <button
              onClick={onGeneratePdf}
              disabled={isGenerating}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--crimson-600)',
                color: '#ffffff',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px var(--crimson-glow)'
              }}
              className="animate-pulse-glow"
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'Compiling PDF...' : 'Generate PDF'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
