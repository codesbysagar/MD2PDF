import React, { useState } from 'react';
import {
  Sparkles,
  Printer,
  FileDown,
  Columns,
  Edit3,
  Eye,
  FileCheck,
  WrapText,
  Hash,
  ChevronLeft,
  ChevronRight,
  Sliders
} from 'lucide-react';
import type { PdfConfig, PageSize, MarginPreset, ActiveTab } from '../types';

interface VerticalToolboxProps {
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

export const VerticalToolbox: React.FC<VerticalToolboxProps> = ({
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className="vertical-toolbox"
      style={{
        width: isCollapsed ? '60px' : '250px',
        minWidth: isCollapsed ? '60px' : '250px',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        zIndex: 20,
        userSelect: 'none'
      }}
    >
      {/* Toolbox Top Bar with Collapse/Expand button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        padding: '12px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        minHeight: '48px',
        flexShrink: 0
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="var(--crimson-600)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Toolbox
            </span>
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Toolbox' : 'Collapse Toolbox'}
          aria-label={isCollapsed ? 'Expand Toolbox' : 'Collapse Toolbox'}
          style={{
            border: 'none',
            background: 'var(--bg-surface-hover)',
            color: 'var(--text-secondary)',
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Scrollable Tool Options */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: isCollapsed ? '12px 8px' : '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* 1. Primary Action: Generate PDF */}
        <div>
          <button
            onClick={onGeneratePdf}
            disabled={isGenerating}
            title={isCollapsed ? 'Generate PDF' : ''}
            style={{
              width: '100%',
              padding: isCollapsed ? '10px 0' : '9px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--crimson-600)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 10px var(--crimson-glow)',
              opacity: isGenerating ? 0.8 : 1,
              transition: 'all 0.15s ease'
            }}
            className={!isGenerating && !hasPdf ? 'animate-pulse-glow' : ''}
          >
            <Sparkles size={16} />
            {!isCollapsed && <span>{isGenerating ? 'Compiling...' : 'Generate PDF'}</span>}
          </button>

          {/* Secondary Actions: Download & Print */}
          <div style={{
            display: 'flex',
            flexDirection: isCollapsed ? 'column' : 'row',
            gap: '8px',
            marginTop: '8px'
          }}>
            <button
              onClick={onDownload}
              disabled={!hasPdf || isGenerating}
              title={hasPdf ? 'Download PDF' : 'Compile PDF first to download'}
              style={{
                flex: 1,
                padding: isCollapsed ? '8px 0' : '7px 10px',
                borderRadius: '6px',
                border: `1px solid ${hasPdf ? 'var(--crimson-600)' : 'var(--border-strong)'}`,
                backgroundColor: hasPdf ? 'var(--crimson-50)' : 'var(--bg-surface)',
                color: hasPdf ? 'var(--crimson-700)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: hasPdf && !isGenerating ? 'pointer' : 'not-allowed',
                opacity: hasPdf ? 1 : 0.5
              }}
            >
              <FileDown size={14} />
              {!isCollapsed && <span>Download</span>}
            </button>

            <button
              onClick={onPrint}
              disabled={!hasPdf || isGenerating}
              title={hasPdf ? 'Print PDF' : 'Compile PDF first to print'}
              style={{
                flex: 1,
                padding: isCollapsed ? '8px 0' : '7px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg-surface)',
                color: hasPdf ? 'var(--text-primary)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: hasPdf && !isGenerating ? 'pointer' : 'not-allowed',
                opacity: hasPdf ? 1 : 0.5
              }}
            >
              <Printer size={14} />
              {!isCollapsed && <span>Print</span>}
            </button>
          </div>
        </div>

        {/* 2. View Mode Section */}
        <div>
          {!isCollapsed && (
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              marginBottom: '8px'
            }}>
              View Mode
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => onChangeTab('split')}
              title="Split View"
              style={{
                width: '100%',
                padding: isCollapsed ? '8px 0' : '7px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'split' ? 'var(--bg-surface-active)' : 'transparent',
                color: activeTab === 'split' ? 'var(--crimson-600)' : 'var(--text-secondary)',
                fontSize: '12.5px',
                fontWeight: activeTab === 'split' ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              <Columns size={15} />
              {!isCollapsed && <span>Split Editor & View</span>}
            </button>

            <button
              onClick={() => onChangeTab('editor')}
              title="Markdown Editor"
              style={{
                width: '100%',
                padding: isCollapsed ? '8px 0' : '7px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'editor' ? 'var(--bg-surface-active)' : 'transparent',
                color: activeTab === 'editor' ? 'var(--crimson-600)' : 'var(--text-secondary)',
                fontSize: '12.5px',
                fontWeight: activeTab === 'editor' ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              <Edit3 size={15} />
              {!isCollapsed && <span>Editor Only</span>}
            </button>

            <button
              onClick={() => onChangeTab('preview')}
              title="Live HTML Preview"
              style={{
                width: '100%',
                padding: isCollapsed ? '8px 0' : '7px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'preview' ? 'var(--bg-surface-active)' : 'transparent',
                color: activeTab === 'preview' ? 'var(--crimson-600)' : 'var(--text-secondary)',
                fontSize: '12.5px',
                fontWeight: activeTab === 'preview' ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                cursor: 'pointer'
              }}
            >
              <Eye size={15} />
              {!isCollapsed && <span>HTML Live Preview</span>}
            </button>

            <button
              onClick={() => onChangeTab('pdf')}
              title="Vector PDF Preview"
              style={{
                width: '100%',
                padding: isCollapsed ? '8px 0' : '7px 10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === 'pdf' ? 'var(--bg-surface-active)' : 'transparent',
                color: activeTab === 'pdf' ? 'var(--crimson-600)' : 'var(--text-secondary)',
                fontSize: '12.5px',
                fontWeight: activeTab === 'pdf' ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileCheck size={15} />
                {!isCollapsed && <span>PDF Preview</span>}
              </div>
              {hasPdf && (
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--crimson-600)'
                }} />
              )}
            </button>
          </div>
        </div>

        {/* 3. PDF Configuration Settings */}
        {!isCollapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)'
            }}>
              PDF Geometry
            </div>

            {/* Page Size */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Page Size
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px'
              }}>
                {(['A4', 'Letter', 'A3', 'A5'] as PageSize[]).map((size) => (
                  <button
                    key={size}
                    onClick={() => onChangeConfig({ pageSize: size })}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: config.pageSize === size ? 600 : 500,
                      border: `1px solid ${config.pageSize === size ? 'var(--crimson-600)' : 'var(--border-strong)'}`,
                      backgroundColor: config.pageSize === size ? 'var(--crimson-50)' : 'var(--bg-surface)',
                      color: config.pageSize === size ? 'var(--crimson-700)' : 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Orientation
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => onChangeConfig({ orientation: 'portrait' })}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: config.orientation === 'portrait' ? 600 : 500,
                    border: `1px solid ${config.orientation === 'portrait' ? 'var(--crimson-600)' : 'var(--border-strong)'}`,
                    backgroundColor: config.orientation === 'portrait' ? 'var(--crimson-50)' : 'var(--bg-surface)',
                    color: config.orientation === 'portrait' ? 'var(--crimson-700)' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Portrait
                </button>
                <button
                  onClick={() => onChangeConfig({ orientation: 'landscape' })}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: config.orientation === 'landscape' ? 600 : 500,
                    border: `1px solid ${config.orientation === 'landscape' ? 'var(--crimson-600)' : 'var(--border-strong)'}`,
                    backgroundColor: config.orientation === 'landscape' ? 'var(--crimson-50)' : 'var(--bg-surface)',
                    color: config.orientation === 'landscape' ? 'var(--crimson-700)' : 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Landscape
                </button>
              </div>
            </div>

            {/* Margins Preset */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Margins
              </label>
              <select
                value={config.marginPreset}
                onChange={(e) => onChangeConfig({ marginPreset: e.target.value as MarginPreset })}
                style={{
                  padding: '6px 10px',
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
                <option value="normal">Normal (40pt)</option>
                <option value="narrow">Narrow (22pt)</option>
                <option value="wide">Wide (58pt)</option>
                <option value="custom">Custom...</option>
              </select>

              {/* Custom Margins Input Box if custom is selected */}
              {config.marginPreset === 'custom' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px',
                  marginTop: '4px'
                }}>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Top/Bottom</label>
                    <input
                      type="number"
                      value={config.customMargins.top}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        onChangeConfig({
                          customMargins: {
                            ...config.customMargins,
                            top: val,
                            bottom: val
                          }
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        fontSize: '11px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Left/Right</label>
                    <input
                      type="number"
                      value={config.customMargins.left}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        onChangeConfig({
                          customMargins: {
                            ...config.customMargins,
                            left: val,
                            right: val
                          }
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        fontSize: '11px',
                        border: '1px solid var(--border-strong)',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Options Toggles */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={config.wrapCode}
                  onChange={(e) => onChangeConfig({ wrapCode: e.target.checked })}
                  style={{ accentColor: 'var(--crimson-600)', cursor: 'pointer' }}
                />
                <WrapText size={14} color={config.wrapCode ? 'var(--crimson-600)' : 'var(--text-muted)'} />
                <span>Wrap long code lines</span>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={config.showPageNumbers}
                  onChange={(e) => onChangeConfig({ showPageNumbers: e.target.checked })}
                  style={{ accentColor: 'var(--crimson-600)', cursor: 'pointer' }}
                />
                <Hash size={14} color={config.showPageNumbers ? 'var(--crimson-600)' : 'var(--text-muted)'} />
                <span>Print page numbers</span>
              </label>
            </div>
          </div>
        ) : (
          /* Collapsed Mini Icons for quick reference */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-muted)'
          }}>
            <div
              title={`Page Size: ${config.pageSize}`}
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-surface-hover)',
                color: 'var(--crimson-700)'
              }}
            >
              {config.pageSize}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
