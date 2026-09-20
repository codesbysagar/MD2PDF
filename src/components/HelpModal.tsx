import React from 'react';
import { X, ShieldCheck, FileText, Keyboard, Cpu, Layers } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-down"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          padding: '24px'
        }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--crimson-50)',
              color: 'var(--crimson-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={18} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              MD2PDF Guide & Privacy
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close guide modal"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Privacy Highlight Card */}
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '8px',
          padding: '14px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px'
        }}>
          <ShieldCheck size={22} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#065f46', margin: '0 0 4px 0' }}>
              Zero-Server Privacy Guarantee
            </h3>
            <p style={{ fontSize: '12px', color: '#047857', margin: 0, lineHeight: 1.5 }}>
              Your Markdown never leaves your browser. Parsing, syntax highlighting, pagination, and vector PDF compilation happen 100% on your local device.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              <Cpu size={15} color="var(--crimson-600)" />
              <span>Vector Text & Intelligent Pagination</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Unlike converters that take screenshots of HTML, MD2PDF constructs native vector PDF text (fully selectable and searchable). Headings automatically avoid page breaks, and long code blocks flow gracefully across pages.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              <Layers size={15} color="var(--crimson-600)" />
              <span>Light Document Theme Always</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Even if you use the dark mode UI, the generated PDF always uses a clean light document theme, matching developer documentation standards.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              <Keyboard size={15} color="var(--crimson-600)" />
              <span>Keyboard Shortcuts</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Compile PDF</span>
                <span><kbd style={{ padding: '2px 5px', background: 'var(--bg-app)', border: '1px solid var(--border-strong)', borderRadius: '4px' }}>Ctrl</kbd> + <kbd style={{ padding: '2px 5px', background: 'var(--bg-app)', border: '1px solid var(--border-strong)', borderRadius: '4px' }}>Enter</kbd></span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Close Button */}
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 18px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'var(--crimson-600)',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
