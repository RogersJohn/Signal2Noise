import React from 'react';
import { GameState, PlayerState } from '../../engine/types';
import { getWinner } from '../../engine/engine';

interface GameOverScreenProps {
  state: GameState;
  onPlayAgain: () => void;
}

const MEDALS = ['🏆', '🥈', '🥉'];

export default function GameOverScreen({ state, onPlayAgain }: GameOverScreenProps) {
  const sorted = [...state.players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.credibility - a.credibility;
  });

  const winner = sorted[0];

  return (
    <div data-testid="game-over" style={styles.container}>
      <h1 style={styles.title}>🏆 GAME OVER</h1>
      <p style={styles.winnerText}>
        {winner.name} wins with {winner.score} points!
      </p>

      <div style={styles.rankings}>
        <h3 style={styles.sectionTitle}>FINAL RANKINGS</h3>
        {sorted.map((p, i) => (
          <div key={p.id} style={styles.rankRow}>
            <span style={styles.medal}>{MEDALS[i] ?? ' '}</span>
            <span style={styles.rankName}>
              {p.isHuman ? '👤' : '🤖'} {p.name}
            </span>
            <span style={styles.rankScore}>{p.score} pts</span>
            <span style={styles.rankCred}>cred {p.credibility}</span>
            {p.strategyName && (
              <span style={styles.rankStrategy}>({p.strategyName})</span>
            )}
          </div>
        ))}
      </div>

      <button style={styles.playAgain} onClick={onPlayAgain}>
        ▶ Play Again
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { textAlign: 'center', padding: '40px', fontFamily: 'monospace', maxWidth: '500px', margin: '0 auto' },
  title: { color: '#fa0', fontSize: '32px', margin: '0 0 8px' },
  winnerText: { color: '#0f0', fontSize: '18px', margin: '0 0 30px' },
  rankings: { textAlign: 'left', background: '#1a1a2e', borderRadius: '8px', padding: '16px', marginBottom: '24px' },
  sectionTitle: { color: '#9ca3af', fontSize: '13px', margin: '0 0 12px', textTransform: 'uppercase' as const },
  rankRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px' },
  medal: { fontSize: '18px', width: '24px' },
  rankName: { color: '#fff', flex: 1 },
  rankScore: { color: '#fa0', width: '60px' },
  rankCred: { color: '#0af', width: '60px', fontSize: '12px' },
  rankStrategy: { color: '#8b95a5', fontSize: '11px' },
  playAgain: {
    background: '#0a3d0a', border: '2px solid #0f0', color: '#0f0',
    fontFamily: 'monospace', fontSize: '16px', padding: '12px 36px',
    cursor: 'pointer', borderRadius: '6px',
  },
};
