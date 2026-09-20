import React from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { GenerationState } from '../types';

interface ProgressBarProps {
  state: GenerationState;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ state }) => {
  if (state.step === 'idle') return null;

  const isComplete = state.step === 'ready';
  const isError = state.step === 'error';

  return (
    <div
      className="animate-slide-down"
      style={{
        padding: '10px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        zIndex: 30
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px'
      }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
          {isComplete ? (
            <CheckCircle2 size={16} color="#10b981" />
          ) : isError ? (
            <AlertCircle size={16} color="var(--crimson-600)" />
          ) : (
            <Loader2 size={16} color="var(--crimson-600)" className="animate-spin" />
          )}

          <span style={{
            color: isError ? 'var(--crimson-600)' : isComplete ? '#10b981' : 'var(--text-primary)'
          }}>
            {state.message}
          </span>
        </div>

        {/* Progress Percentage & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '10px',
            backgroundColor: isComplete ? 'rgba(16, 185, 129, 0.1)' : 'var(--crimson-50)',
            color: isComplete ? '#10b981' : 'var(--crimson-700)',
            border: `1px solid ${isComplete ? 'rgba(16, 185, 129, 0.2)' : 'var(--crimson-200)'}`
          }}>
            {state.progress}%
          </span>
        </div>
      </div>

      {/* Animated Glowing Progress Track */}
      <div style={{
        width: '100%',
        height: '4px',
        backgroundColor: 'var(--bg-surface-hover)',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div
          style={{
            height: '100%',
            width: `${state.progress}%`,
            background: isComplete
              ? '#10b981'
              : isError
              ? 'var(--crimson-600)'
              : 'linear-gradient(90deg, var(--crimson-600), var(--crimson-400), var(--crimson-600))',
            backgroundSize: '200% 100%',
            borderRadius: '2px',
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: isComplete || isError ? 'none' : 'waveBar 2s infinite linear',
            boxShadow: isComplete ? '0 0 8px rgba(16, 185, 129, 0.4)' : '0 0 8px var(--crimson-glow)'
          }}
        />
      </div>
    </div>
  );
};
