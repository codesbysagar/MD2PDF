import React from 'react';
import { Eye } from 'lucide-react';

interface MarkdownPreviewProps {
  html: string;
  wrapCode: boolean;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ html, wrapCode }) => {
  return (
    <div
      className="preview-wrapper"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
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
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <Eye size={14} color="var(--crimson-600)" />
          <span style={{ fontWeight: 600 }}>HTML Live Preview</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--text-muted)' }}>Browser Rendered</span>
        </div>

        <div style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>Light theme</span>
        </div>
      </div>

      <div
        className="preview-scroll-container"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      >
        <div style={{
          maxWidth: '860px',
          width: '100%',
          boxShadow: 'var(--shadow-md)',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          marginBottom: '32px'
        }}>
          {html ? (
            <div
              className={`markdown-body ${wrapCode ? 'wrap-code' : ''}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div style={{
              padding: '60px 40px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}>
              <p>Type some Markdown on the left to see the live preview.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
