import React from 'react';

interface ActionNarrationProps {
  narration: string | null;
  aiSpeed: 'normal' | 'fast';
  onToggleSpeed: () => void;
}

export default function ActionNarration({ narration, aiSpeed, onToggleSpeed }: ActionNarrationProps) {
  if (!narration) return null;

  return (
    <div data-testid="ai-narration" style={styles.bar}>
      <span style={styles.icon}>🤖</span>
      <span style={styles.text}>{narration}</span>
      <button
        data-testid="speed-toggle"
        style={styles.speedBtn}
        onClick={onToggleSpeed}
      >
        {aiSpeed === 'normal' ? 'Speed ▶▶' : 'Normal ▶'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  bar: {
    background: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '8px 16px',
    margin: '8px',
    fontFamily: 'monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  icon: { fontSize: '16px' },
  text: { color: '#fa0', fontSize: '13px', flex: 1 },
  speedBtn: {
    background: '#222',
    border: '1px solid #555',
    color: '#888',
    fontFamily: 'monospace',
    fontSize: '11px',
    padding: '4px 10px',
    cursor: 'pointer',
    borderRadius: '3px',
  },
};
