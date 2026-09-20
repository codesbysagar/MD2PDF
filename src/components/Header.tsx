import React from 'react';
import { FileText, ShieldCheck, Moon, Sun, HelpCircle } from 'lucide-react';
import { SAMPLE_TEMPLATES } from '../utils/sampleMarkdown';
import type { MarkdownSample } from '../utils/sampleMarkdown';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onSelectSample: (sample: MarkdownSample) => void;
  onOpenHelp: () => void;
  isTyping: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onSelectSample,
  onOpenHelp,
  isTyping
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-surface)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {/* Brand & Live Activity Dot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: 'var(--crimson-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px var(--crimson-glow)',
          transition: 'transform 0.2s ease',
          cursor: 'pointer'
        }}>
          <FileText size={20} strokeWidth={2.4} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              MD<span style={{ color: 'var(--crimson-600)' }}>2</span>PDF
            </h1>

            {/* Continuous Pulse Activity Indicator */}
            <div
              title={isTyping ? 'Syncing edits in browser...' : 'Client-side ready'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 500,
                backgroundColor: isTyping ? 'var(--crimson-50)' : 'var(--bg-surface-hover)',
                color: isTyping ? 'var(--crimson-700)' : 'var(--text-secondary)',
                border: `1px solid ${isTyping ? 'var(--crimson-200)' : 'var(--border-subtle)'}`,
                transition: 'all 0.2s ease'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isTyping ? 'var(--crimson-600)' : '#10b981',
                  display: 'inline-block'
                }}
                className={isTyping ? 'animate-live-dot' : ''}
              />
              {isTyping ? 'Editing...' : 'Ready'}
            </div>
          </div>

          <p style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            margin: 0
          }}>
            Client-Side Markdown to Vector PDF
          </p>
        </div>
      </div>

      {/* Privacy Guarantee Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 500,
        backgroundColor: 'var(--bg-surface-hover)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-subtle)'
      }}>
        <ShieldCheck size={14} color="#10b981" />
        <span>100% Client-Side</span>
        <span style={{ color: 'var(--text-muted)' }}>•</span>
        <span style={{ color: 'var(--text-muted)' }}>Zero Server Upload</span>
      </div>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Sample Templates Dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            defaultValue=""
            onChange={(e) => {
              const sample = SAMPLE_TEMPLATES.find((s) => s.id === e.target.value);
              if (sample) {
                onSelectSample(sample);
                e.target.value = '';
              }
            }}
            aria-label="Load Sample Template"
            style={{
              appearance: 'none',
              padding: '6px 28px 6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1px solid var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="" disabled>
              📄 Load Sample...
            </option>
            {SAMPLE_TEMPLATES.map((sample) => (
              <option key={sample.id} value={sample.id}>
                {sample.name}
              </option>
            ))}
          </select>
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            fontSize: '10px',
            color: 'var(--text-muted)'
          }}>
            ▼
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light UI' : 'Switch to Dark UI'}
          title={theme === 'dark' ? 'Switch to Light UI (PDF remains Light)' : 'Switch to Dark UI (PDF remains Light)'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '6px',
            border: '1px solid var(--border-strong)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Help & Privacy Modal */}
        <button
          onClick={onOpenHelp}
          aria-label="Help and Documentation"
          title="Product Guide & Privacy Guarantee"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-strong)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <HelpCircle size={15} />
          <span>Guide</span>
        </button>
      </div>
    </header>
  );
};
