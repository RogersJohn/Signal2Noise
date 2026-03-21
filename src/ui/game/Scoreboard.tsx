import React from 'react';
import { PlayerState } from '../../engine/types';

interface ScoreboardProps {
  players: PlayerState[];
  currentPlayerId?: string;
}

export default function Scoreboard({ players, currentPlayerId }: ScoreboardProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score || b.credibility - a.credibility);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>SCOREBOARD</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Player</th>
            <th style={styles.th}>Score</th>
            <th style={styles.th}>Cred</th>
            <th style={styles.th}>Cards</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map(p => (
            <tr key={p.id} style={p.id === currentPlayerId ? styles.currentRow : {}}>
              <td style={styles.td}>
                {p.isHuman ? '👤' : '🤖'} {p.name}
              </td>
              <td style={{ ...styles.td, color: '#fa0' }}>{p.score}</td>
              <td style={{ ...styles.td, color: '#0af' }}>{p.credibility}</td>
              <td style={{ ...styles.td, color: '#888' }}>{p.hand.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '8px', fontFamily: 'monospace' },
  title: { color: '#0f0', fontSize: '14px', margin: '0 0 8px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  th: { textAlign: 'left', color: '#888', padding: '4px 8px', borderBottom: '1px solid #333' },
  td: { padding: '4px 8px', color: '#ccc' },
  currentRow: { background: '#1a2a1a' },
};
