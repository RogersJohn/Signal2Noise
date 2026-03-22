import React from 'react';
import { GameState } from '../../engine/types';

interface SignalDisplayProps {
  signalDisplays: string[];
  state: GameState;
  onDismiss: () => void;
}

export default function SignalDisplay({ signalDisplays, state, onDismiss }: SignalDisplayProps) {
  // Build per-AI evidence summaries
  const aiPlayers = state.players.filter(p => !p.isHuman);
  const summaries: string[] = aiPlayers.map(p => {
    let total = 0;
    const perConspiracy: string[] = [];
    for (const ac of state.activeConspiracies) {
      const count = ac.evidenceAssignments.filter(a => a.playerId === p.id).length;
      if (count > 0) {
        perConspiracy.push(`${count} to ${ac.card.name}`);
        total += count;
      }
    }
    if (total === 0) return `Committed: 0 cards`;
    return `Committed: ${perConspiracy.join(', ')}`;
  });

  return (
    <div data-testid="signal-panel" style={styles.panel}>
      <div style={styles.header}>📡 THE TABLE IS TALKING</div>
      <div style={styles.divider} />

      {signalDisplays.map((display, i) => (
        <div key={i} data-testid={`signal-entry-${i}`} style={styles.entry}>
          <div style={styles.flavorText}>{display}</div>
          <div style={styles.evidenceLine}>📊 {summaries[i] ?? ''}</div>
        </div>
      ))}

      <div style={styles.divider} />
      <div style={styles.hint}>
        Read their signals. Check the evidence counts. Who's telling the truth?
      </div>
      <button
        data-testid="dismiss-signals"
        style={styles.dismissBtn}
        onClick={onDismiss}
      >
        👀 I've Seen Enough — Broadcast →
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    background: '#111a11',
    border: '2px solid #0a3d0a',
    borderRadius: '8px',
    padding: '20px',
    margin: '12px',
    fontFamily: 'monospace',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  header: { color: '#0f0', fontSize: '18px', fontWeight: 'bold', textAlign: 'center', marginBottom: '8px' },
  divider: { borderTop: '1px solid #333', margin: '12px 0' },
  entry: { marginBottom: '16px', paddingLeft: '8px' },
  flavorText: { color: '#d1d5db', fontSize: '13px', fontStyle: 'italic', marginBottom: '4px' },
  evidenceLine: { color: '#a3b1c2', fontSize: '12px' },
  hint: { color: '#8b95a5', fontSize: '12px', textAlign: 'center', fontStyle: 'italic', marginBottom: '12px' },
  dismissBtn: {
    display: 'block',
    margin: '0 auto',
    background: '#0a3d0a',
    border: '2px solid #0f0',
    color: '#0f0',
    fontFamily: 'monospace',
    fontSize: '14px',
    padding: '10px 28px',
    cursor: 'pointer',
    borderRadius: '6px',
  },
};
