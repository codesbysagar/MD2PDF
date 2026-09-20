import React, { useRef, useState } from 'react';
import { Upload, Trash2, Copy, Check, FileText } from 'lucide-react';
import { readFileAsText } from '../utils/fileHandler';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUploadFile: (filename: string, content: string) => void;
  onClear: () => void;
  onTriggerGenerate: () => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  onUploadFile,
  onClear,
  onTriggerGenerate
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lineCount = Math.max(1, value.split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onTriggerGenerate();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      try {
        const text = await readFileAsText(file);
        onUploadFile(file.name, text);
      } catch (err: any) {
        alert(err?.message || 'Error reading file.');
      }
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      try {
        const text = await readFileAsText(file);
        onUploadFile(file.name, text);
      } catch (err: any) {
        alert(err?.message || 'Error reading file.');
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="editor-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        position: 'relative'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-app)',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
          <FileText size={14} color="var(--crimson-600)" />
          <span style={{ fontWeight: 600 }}>Markdown Input</span>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--text-muted)' }}>{lineCount} lines</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".md,.markdown,.txt"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload .md file from disk"
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
            <Upload size={13} />
            <span>Upload .md</span>
          </button>

          <button
            onClick={handleCopy}
            title="Copy Markdown to clipboard"
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
            {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onClear}
            title="Clear editor"
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
              color: 'var(--crimson-700)',
              cursor: 'pointer'
            }}
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flex: 1,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 8px 16px 16px',
          textAlign: 'right',
          userSelect: 'none',
          color: 'var(--text-muted)',
          fontSize: '13px',
          lineHeight: '1.6',
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          backgroundColor: 'var(--bg-app)',
          borderRight: '1px solid var(--border-subtle)',
          minWidth: '42px',
          overflowY: 'hidden'
        }}>
          {lineNumbers.slice(0, 1000).map((num) => (
            <div key={num}>{num}</div>
          ))}
          {lineNumbers.length > 1000 && <div>...</div>}
        </div>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste your Markdown here, or drag & drop a .md file..."
          spellCheck={false}
          style={{
            flex: 1,
            height: '100%',
            padding: '16px',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '13.5px',
            lineHeight: '1.6',
            fontFamily: 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            whiteSpace: 'pre',
            tabSize: 2
          }}
        />

        {isDragging && (
          <div style={{
            position: 'absolute',
            inset: '8px',
            border: '2px dashed var(--crimson-600)',
            borderRadius: '10px',
            backgroundColor: 'rgba(225, 29, 72, 0.08)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            zIndex: 50,
            pointerEvents: 'none'
          }} className="animate-fade-in">
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--crimson-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 16px var(--crimson-glow)'
            }}>
              <Upload size={28} />
            </div>
            <p style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--crimson-700)',
              margin: 0
            }}>
              Drop Markdown file to load (.md, .markdown)
            </p>
          </div>
        )}
      </div>

      <div style={{
        padding: '6px 16px',
        backgroundColor: 'var(--bg-app)',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '11px',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Tip: Press <kbd style={{ padding: '1px 4px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '3px' }}>Ctrl</kbd> + <kbd style={{ padding: '1px 4px', background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', borderRadius: '3px' }}>Enter</kbd> to compile PDF</span>
        <span>Drag & drop supported</span>
      </div>
    </div>
  );
};
