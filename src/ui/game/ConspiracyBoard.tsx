import React from 'react';
import { ActiveConspiracy, PlayerState } from '../../engine/types';
import { canSupport } from '../../engine/deck';

interface ConspiracyBoardProps {
  conspiracies: ActiveConspiracy[];
  players: PlayerState[];
  selectedCardTargets?: string[] | null; // targets of selected hand card
  onSelectConspiracy: (id: string) => void;
  interactive: boolean;
}

const PLAYER_COLORS = ['#0f0', '#0af', '#f0a', '#fa0', '#a0f'];

export default function ConspiracyBoard({
  conspiracies, players, selectedCardTargets, onSelectConspiracy, interactive,
}: ConspiracyBoardProps) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>ACTIVE CONSPIRACIES</h3>
      <div style={styles.grid}>
        {conspiracies.map(c => {
          const isValidTarget = selectedCardTargets
            ? (selectedCardTargets.includes('ALL') || selectedCardTargets.includes(c.card.id))
            : null;
          const isDimmed = selectedCardTargets !== null && selectedCardTargets !== undefined && !isValidTarget;
          const isHighlighted = isValidTarget === true;

          return (
            <button
              key={c.card.id}
              data-testid={`conspiracy-card-${c.card.id}`}
              style={{
                ...styles.card,
                ...(isHighlighted ? styles.highlighted : {}),
                ...(isDimmed ? styles.dimmed : {}),
                ...(interactive && isHighlighted ? { cursor: 'pointer' } : { cursor: 'default' }),
              }}
              onClick={() => interactive && isHighlighted && onSelectConspiracy(c.card.id)}
              disabled={!interactive || !isHighlighted}
            >
              <div style={styles.icon}>{c.card.icon}</div>
              <div style={styles.name}>{c.card.name}</div>
              <div style={styles.description} title={c.card.description}>
                {c.card.description.length > 80 ? c.card.description.slice(0, 80) + '...' : c.card.description}
              </div>
              <div style={styles.evidenceSection}>
                {players.map((p, i) => {
                  const count = c.evidenceAssignments.filter(a => a.playerId === p.id).length;
                  const specific = c.evidenceAssignments.filter(a => a.playerId === p.id && a.specific).length;
                  if (count === 0) return null;
                  return (
                    <span key={p.id} style={{ ...styles.evidenceBadge, color: PLAYER_COLORS[i] }}>
                      {p.isHuman ? 'You' : p.name.replace('The ', '')}: {count}{specific > 0 ? ` (${specific}🎯)` : ''}
                    </span>
                  );
                })}
              </div>
              <div style={styles.broadcastSection}>
                {c.broadcasts.map((b, i) => {
                  const pname = players.find(p => p.id === b.playerId)?.name ?? b.playerId;
                  return (
                    <span key={i} style={{
                      ...styles.broadcastBadge,
                      color: b.position === 'REAL' ? '#0f0' : '#f44',
                    }}>
                      {pname}: {b.position}
                    </span>
                  );
                })}
              </div>
              {isHighlighted && <div style={styles.assignLabel}>click to assign</div>}
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
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' },
  card: {
    background: '#1a1a2e', border: '1px solid #333', borderRadius: '6px', padding: '10px',
    textAlign: 'left', fontFamily: 'monospace', color: '#ccc', fontSize: '11px',
    transition: 'opacity 0.2s, border-color 0.2s',
  },
  highlighted: { border: '2px solid #0f0', background: '#1a2a1a' },
  dimmed: { opacity: 0.3 },
  icon: { fontSize: '24px', marginBottom: '4px' },
  name: { fontWeight: 'bold', color: '#fff', fontSize: '13px', marginBottom: '3px' },
  description: { color: '#666', fontSize: '10px', marginBottom: '6px', lineHeight: '1.3' },
  evidenceSection: { marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' },
  evidenceBadge: { fontSize: '10px', background: '#111', padding: '2px 4px', borderRadius: '2px' },
  broadcastSection: { marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' },
  broadcastBadge: { fontSize: '10px', padding: '2px 4px' },
  assignLabel: { color: '#0f0', fontSize: '10px', textAlign: 'center', marginTop: '4px' },
};
