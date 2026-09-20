import React from 'react';
import {
  FileDown,
  Printer,
  Sparkles,
  Columns,
  Edit3,
  Eye,
  FileCheck,
  WrapText,
  Hash
} from 'lucide-react';
import type { PdfConfig, PageSize, PageOrientation, MarginPreset, ActiveTab } from '../types';

interface ToolbarProps {
  config: PdfConfig;
  onChangeConfig: (newConfig: Partial<PdfConfig>) => void;
  onGeneratePdf: () => void;
  onPrint: () => void;
  onDownload: () => void;
  isGenerating: boolean;
  hasPdf: boolean;
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  config,
  onChangeConfig,
  onGeneratePdf,
  onPrint,
  onDownload,
  isGenerating,
  hasPdf,
  activeTab,
  onChangeTab
}) => {
  return (
    <div
      className="toolbar-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        gap: '16px',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 25
      }}
    >
      {/* Left side: View tabs & PDF Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Tab View Switcher */}
        <div style={{
          display: 'inline-flex',
          backgroundColor: 'var(--bg-app)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => onChangeTab('split')}
            title="Split Editor & Preview"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'split' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'split' ? 'var(--crimson-600)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'split' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Columns size={14} />
            <span>Split</span>
          </button>

          <button
            onClick={() => onChangeTab('editor')}
            title="Markdown Editor only"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'editor' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'editor' ? 'var(--crimson-600)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'editor' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Edit3 size={14} />
            <span>Editor</span>
          </button>

          <button
            onClick={() => onChangeTab('preview')}
            title="Rendered Markdown Preview"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'preview' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'preview' ? 'var(--crimson-600)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'preview' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Eye size={14} />
            <span>HTML</span>
          </button>

          <button
            onClick={() => onChangeTab('pdf')}
            title="Compiled PDF Preview"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'pdf' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'pdf' ? 'var(--crimson-600)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'pdf' ? 'var(--shadow-sm)' : 'none',
              position: 'relative'
            }}
          >
            <FileCheck size={14} />
            <span>PDF Preview</span>
            {hasPdf && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--crimson-600)',
                marginLeft: '-2px'
              }} />
            )}
          </button>
        </div>

        {/* Separator */}
        <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--border-subtle)' }} />

        {/* Page Size Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Size:</span>
          <select
            value={config.pageSize}
            onChange={(e) => onChangeConfig({ pageSize: e.target.value as PageSize })}
            aria-label="PDF Page Size"
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-strong)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="A5">A5</option>
            <option value="Letter">Letter</option>
          </select>
        </div>

        {/* Orientation Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Layout:</span>
          <select
            value={config.orientation}
            onChange={(e) => onChangeConfig({ orientation: e.target.value as PageOrientation })}
            aria-label="Page Orientation"
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-strong)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </div>

        {/* Margins Preset Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Margins:</span>
          <select
            value={config.marginPreset}
            onChange={(e) => onChangeConfig({ marginPreset: e.target.value as MarginPreset })}
            aria-label="Page Margins"
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-strong)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="normal">Normal</option>
            <option value="narrow">Narrow</option>
            <option value="wide">Wide</option>
            <option value="custom">Custom...</option>
          </select>
        </div>

        {/* Wrap Code Lines Toggle */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          title="Intelligently wrap long lines in code blocks so they never overflow the PDF page"
        >
          <input
            type="checkbox"
            checked={config.wrapCode}
            onChange={(e) => onChangeConfig({ wrapCode: e.target.checked })}
            style={{ accentColor: 'var(--crimson-600)', cursor: 'pointer' }}
          />
          <WrapText size={14} color={config.wrapCode ? 'var(--crimson-600)' : 'var(--text-muted)'} />
          <span>Wrap code</span>
        </label>

        {/* Page Numbers Toggle */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            userSelect: 'none'
          }}
          title="Print page numbers (e.g. Page 1 of 3) in PDF footer"
        >
          <input
            type="checkbox"
            checked={config.showPageNumbers}
            onChange={(e) => onChangeConfig({ showPageNumbers: e.target.checked })}
            style={{ accentColor: 'var(--crimson-600)', cursor: 'pointer' }}
          />
          <Hash size={14} color={config.showPageNumbers ? 'var(--crimson-600)' : 'var(--text-muted)'} />
          <span>Page numbers</span>
        </label>
      </div>

      {/* Right side: Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Generate PDF Primary Button with Crimson Accent */}
        <button
          onClick={onGeneratePdf}
          disabled={isGenerating}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'var(--crimson-600)',
            color: '#ffffff',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px var(--crimson-glow)',
            opacity: isGenerating ? 0.8 : 1,
            transform: isGenerating ? 'none' : 'translateY(0)',
            transition: 'all 0.15s ease'
          }}
          className={!isGenerating && !hasPdf ? 'animate-pulse-glow' : ''}
        >
          <Sparkles size={16} />
          <span>{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
        </button>

        {/* Print Button */}
        <button
          onClick={onPrint}
          disabled={!hasPdf || isGenerating}
          title={hasPdf ? 'Print generated PDF directly' : 'Generate PDF first to enable print'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '6px',
            border: '1px solid var(--border-strong)',
            backgroundColor: 'var(--bg-surface)',
            color: hasPdf ? 'var(--text-primary)' : 'var(--text-muted)',
            cursor: hasPdf && !isGenerating ? 'pointer' : 'not-allowed',
            opacity: hasPdf ? 1 : 0.5
          }}
        >
          <Printer size={15} />
          <span>Print</span>
        </button>

        {/* Download Button */}
        <button
          onClick={onDownload}
          disabled={!hasPdf || isGenerating}
          title={hasPdf ? 'Download vector PDF locally' : 'Generate PDF first to download'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '6px',
            border: `1px solid ${hasPdf ? 'var(--crimson-600)' : 'var(--border-strong)'}`,
            backgroundColor: hasPdf ? 'var(--crimson-50)' : 'var(--bg-surface)',
            color: hasPdf ? 'var(--crimson-700)' : 'var(--text-muted)',
            cursor: hasPdf && !isGenerating ? 'pointer' : 'not-allowed',
            opacity: hasPdf ? 1 : 0.5
          }}
        >
          <FileDown size={15} />
          <span>Download PDF</span>
        </button>
      </div>
    </div>
  );
};
