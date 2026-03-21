import React from 'react';
import { GameState } from '../../engine/types';

interface ResolvePhaseProps {
  state: GameState;
}

export default function ResolvePhase({ state }: ResolvePhaseProps) {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>⚖️ RESOLVING — Round {state.round}/{state.maxRounds}</h2>
      {state.roundResults.length === 0 ? (
        <p style={styles.text}>Calculating results...</p>
      ) : (
        <div>
          {state.roundResults.map(result => (
            <div key={result.conspiracyId} style={styles.result}>
              <div style={styles.conspiracyName}>
                {result.conspiracyId}
                {result.consensusReached
                  ? <span style={styles.consensus}> — CONSENSUS: {result.consensusPosition}</span>
                  : <span style={styles.noConsensus}> — NO CONSENSUS</span>
                }
              </div>
              {result.playerResults.map(pr => (
                <div key={pr.playerId} style={styles.playerResult}>
                  <span style={{ color: pr.onMajority ? '#0f0' : '#f44' }}>
                    {state.players.find(p => p.id === pr.playerId)?.name}:
                  </span>
                  <span style={styles.points}> {pr.points} pts</span>
                  {pr.isFirstMover && <span style={styles.badge}> 🥇</span>}
                  {pr.hasSpecificEvidence && <span style={styles.badge}> 🎯</span>}
                  <span style={styles.credChange}>
                    {pr.credibilityChange > 0 ? ` +${pr.credibilityChange}` : pr.credibilityChange < 0 ? ` ${pr.credibilityChange}` : ''} cred
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '12px', fontFamily: 'monospace' },
  title: { color: '#fa0', fontSize: '16px', margin: '0 0 12px' },
  text: { color: '#888', fontSize: '12px' },
  result: { marginBottom: '12px', padding: '8px', background: '#1a1a2e', borderRadius: '4px' },
  conspiracyName: { color: '#fff', fontSize: '13px', marginBottom: '6px' },
  consensus: { color: '#0f0' },
  noConsensus: { color: '#888' },
  playerResult: { fontSize: '12px', marginLeft: '12px', marginBottom: '2px' },
  points: { color: '#fa0' },
  badge: { fontSize: '12px' },
  credChange: { color: '#888', fontSize: '10px' },
};
