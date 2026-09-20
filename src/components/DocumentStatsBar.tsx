import React from 'react';
import type { DocumentStats } from '../types';
import { Clock, AlignLeft, Shield } from 'lucide-react';

interface DocumentStatsBarProps {
  stats: DocumentStats;
  isTyping: boolean;
}

export const DocumentStatsBar: React.FC<DocumentStatsBarProps> = ({ stats, isTyping }) => {
  return (
    <footer
      className="stats-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        gap: '12px',
        flexWrap: 'wrap'
      }}
    >
      {/* Left: Document Metrics */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlignLeft size={13} color="var(--text-muted)" />
          <strong style={{ color: 'var(--text-secondary)' }}>{stats.words.toLocaleString()}</strong> words
        </div>

        <span>•</span>

        <div>
          <strong style={{ color: 'var(--text-secondary)' }}>{stats.characters.toLocaleString()}</strong> characters
        </div>

        <span>•</span>

        <div>
          <strong style={{ color: 'var(--text-secondary)' }}>{stats.lines.toLocaleString()}</strong> lines
        </div>

        <span>•</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={13} color="var(--text-muted)" />
          <span>~{stats.readTimeMinutes} min read</span>
        </div>
      </div>

      {/* Right: Security & Sync Status with pulsing animation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isTyping ? 'var(--crimson-500)' : '#10b981',
              display: 'inline-block'
            }}
            className={isTyping ? 'animate-live-dot' : ''}
          />
          <span style={{ color: 'var(--text-secondary)' }}>
            {isTyping ? 'Live updating...' : 'Document parsed'}
          </span>
        </div>

        <span style={{ color: 'var(--border-strong)' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
          <Shield size={12} />
          <span>Client memory only</span>
        </div>
      </div>
    </footer>
  );
};
