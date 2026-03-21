import React from 'react';
import { ActiveConspiracy, PlayerState } from '../../engine/types';

interface ConspiracyBoardProps {
  conspiracies: ActiveConspiracy[];
  players: PlayerState[];
  selectedConspiracyId: string | null;
  onSelectConspiracy: (id: string) => void;
  interactive: boolean;
}

const PLAYER_COLORS = ['#0f0', '#0af', '#f0a', '#fa0', '#a0f'];

export default function ConspiracyBoard({
  conspiracies, players, selectedConspiracyId, onSelectConspiracy, interactive
}: ConspiracyBoardProps) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>ACTIVE CONSPIRACIES</h3>
      <div style={styles.grid}>
        {conspiracies.map(c => {
          const isSelected = selectedConspiracyId === c.card.id;
          return (
            <button
              key={c.card.id}
              style={{
                ...styles.card,
                ...(isSelected ? styles.selected : {}),
                ...(interactive ? {} : styles.nonInteractive),
              }}
              onClick={() => interactive && onSelectConspiracy(c.card.id)}
              disabled={!interactive}
            >
              <div style={styles.icon}>{c.card.icon}</div>
              <div style={styles.name}>{c.card.name}</div>
              <div style={styles.description}>{c.card.description}</div>
              <div style={styles.evidence}>
                {players.map((p, i) => {
                  const count = c.evidenceAssignments.filter(a => a.playerId === p.id).length;
                  return count > 0 ? (
                    <span key={p.id} style={{ color: PLAYER_COLORS[i] }}>
                      {'●'.repeat(count)}{' '}
                    </span>
                  ) : null;
                })}
              </div>
              <div style={styles.broadcasts}>
                {c.broadcasts.map((b, i) => (
                  <span key={i} style={{
                    color: b.position === 'REAL' ? '#0f0' : '#f44',
                    marginRight: '4px',
                  }}>
                    {players.find(p => p.id === b.playerId)?.name}: {b.position}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '8px' },
  title: { color: '#0f0', fontFamily: 'monospace', fontSize: '14px', margin: '0 0 8px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px' },
  card: {
    background: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '4px',
    padding: '10px',
    textAlign: 'left',
    fontFamily: 'monospace',
    color: '#ccc',
    cursor: 'pointer',
    fontSize: '11px',
  },
  selected: { border: '2px solid #0f0', background: '#1a2a1a' },
  nonInteractive: { cursor: 'default' },
  icon: { fontSize: '24px', marginBottom: '4px' },
  name: { fontWeight: 'bold', color: '#fff', fontSize: '13px', marginBottom: '4px' },
  description: { color: '#888', fontSize: '10px', marginBottom: '6px', lineHeight: '1.3' },
  evidence: { marginTop: '4px', fontSize: '14px' },
  broadcasts: { marginTop: '4px', fontSize: '10px' },
};
