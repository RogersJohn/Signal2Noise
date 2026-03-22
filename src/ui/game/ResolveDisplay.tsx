import React from 'react';
import { GameState } from '../../engine/types';

interface ResolveDisplayProps {
  state: GameState;
  onContinue: () => void;
}

export default function ResolveDisplay({ state, onContinue }: ResolveDisplayProps) {
  const isLastRound = state.round >= state.maxRounds;

  return (
    <div data-testid="resolve-display" style={styles.container}>
      <h2 style={styles.title}>⚖️ ROUND {state.round} RESULTS</h2>

      {state.roundResults.length === 0 && (
        <p style={styles.noResults}>No conspiracies were broadcast on this round.</p>
      )}

      {state.roundResults.map(result => {
        const conspiracy = state.activeConspiracies.find(c => c.card.id === result.conspiracyId);
        const name = conspiracy?.card.name ?? result.conspiracyId;
        const icon = conspiracy?.card.icon ?? '🔍';

        return (
          <div key={result.conspiracyId} data-testid={`result-${result.conspiracyId}`} style={styles.resultCard}>
            <div style={styles.conspiracyHeader}>
              {result.consensusReached ? (
                <span style={styles.consensusYes}>
                  ✅ {icon} {name} — CONSENSUS: {result.consensusPosition} ({result.majorityCount} votes)
                </span>
              ) : (
                <span style={styles.consensusNo}>
                  ❌ {icon} {name} — NO CONSENSUS
                </span>
              )}
            </div>

            {result.playerResults.map(pr => {
              const player = state.players.find(p => p.id === pr.playerId);
              const pname = player?.name ?? pr.playerId;
              const reason = pr.points === 0
                ? (result.consensusReached ? '(minority)' : '(no consensus)')
                : (pr.hasEvidence && pr.evidenceMatchesBroadcast && pr.hasSpecificEvidence) ? '(evidence match + specific)'
                : (pr.hasEvidence && pr.evidenceMatchesBroadcast) ? '(evidence match)'
                : (pr.hasEvidence && !pr.evidenceMatchesBroadcast) ? '(bluff)'
                : '(bandwagon)';

              return (
                <div key={pr.playerId} data-testid={`player-score-${pr.playerId}`} style={styles.playerLine}>
                  <span style={{ color: pr.onMajority ? '#0f0' : '#f44', width: '160px', display: 'inline-block' }}>
                    {pname}:
                  </span>
                  <span style={{ color: '#fa0', width: '80px', display: 'inline-block' }}>
                    {pr.points > 0 ? `+${pr.points} pts` : '0 pts'}
                  </span>
                  <span style={{ color: '#9ca3af', width: '140px', display: 'inline-block' }}>{reason}</span>
                  <span style={{ color: pr.credibilityChange > 0 ? '#0af' : '#f44', fontSize: '12px' }}>
                    cred {pr.credibilityChange > 0 ? `+${pr.credibilityChange}` : pr.credibilityChange}
                  </span>
                </div>
              );
            })}

            {result.consensusReached && (
              <div style={styles.replacedNote}>→ {name} resolved and replaced.</div>
            )}
          </div>
        );
      })}

      <div style={styles.scoresSummary}>
        Updated scores: {state.players.map(p => `${p.name}: ${p.score}`).join(' | ')}
      </div>

      <button
        data-testid="continue-resolve"
        style={styles.continueBtn}
        onClick={onContinue}
      >
        {isLastRound ? '🏆 See Final Results →' : `Continue to Round ${state.round + 1} →`}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '16px', fontFamily: 'monospace', maxWidth: '700px', margin: '0 auto' },
  title: { color: '#fa0', fontSize: '18px', margin: '0 0 16px', textAlign: 'center' },
  noResults: { color: '#9ca3af', fontSize: '13px', textAlign: 'center' },
  resultCard: { background: '#1a1a2e', borderRadius: '6px', padding: '12px', marginBottom: '12px' },
  conspiracyHeader: { fontSize: '15px', marginBottom: '8px' },
  consensusYes: { color: '#0f0' },
  consensusNo: { color: '#9ca3af' },
  playerLine: { fontSize: '13px', marginLeft: '12px', marginBottom: '3px' },
  replacedNote: { color: '#8b95a5', fontSize: '12px', marginTop: '6px', fontStyle: 'italic' },
  scoresSummary: { color: '#fa0', fontSize: '14px', textAlign: 'center', margin: '16px 0', padding: '8px', background: '#1a1a0a', borderRadius: '4px' },
  continueBtn: {
    display: 'block', margin: '0 auto', background: '#0a3d0a', border: '2px solid #0f0',
    color: '#0f0', fontFamily: 'monospace', fontSize: '15px', padding: '10px 28px',
    cursor: 'pointer', borderRadius: '6px',
  },
};
