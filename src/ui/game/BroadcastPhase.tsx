import React from 'react';
import { GameState, GameAction, Position } from '../../engine/types';
import ConspiracyBoard from './ConspiracyBoard';

interface BroadcastPhaseProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  isPlayerTurn: boolean;
}

export default function BroadcastPhase({ state, dispatch, isPlayerTurn }: BroadcastPhaseProps) {
  const humanPlayer = state.players.find(p => p.isHuman);
  const currentPlayerId = state.turnOrder[state.currentPlayerIndex];
  const currentPlayer = state.players.find(p => p.id === currentPlayerId);
  const isMyTurn = humanPlayer?.id === currentPlayerId && isPlayerTurn;

  const handleBroadcast = (conspiracyId: string, position: Position) => {
    if (!humanPlayer || !isMyTurn) return;
    dispatch({ type: 'BROADCAST', playerId: humanPlayer.id, conspiracyId, position });
  };

  const handlePass = () => {
    if (!humanPlayer || !isMyTurn) return;
    dispatch({ type: 'PASS', playerId: humanPlayer.id });
  };

  return (
    <div>
      <div style={styles.phaseHeader}>
        <h2 style={styles.phaseTitle}>📡 BROADCAST PHASE — Round {state.round}/{state.maxRounds}</h2>
        <p style={styles.instruction}>
          {isMyTurn
            ? 'Choose a conspiracy and declare REAL or FAKE, or PASS to draw a card.'
            : `Waiting for ${currentPlayer?.name ?? 'AI'}...`}
        </p>
      </div>

      <div style={styles.turnOrder}>
        {state.turnOrder.map((pid, i) => {
          const p = state.players.find(pl => pl.id === pid)!;
          const done = state.broadcastedPlayers.includes(pid);
          const isCurrent = pid === currentPlayerId;
          return (
            <span key={pid} style={{
              color: done ? '#8b95a5' : isCurrent ? '#0f0' : '#9ca3af',
              fontWeight: isCurrent ? 'bold' : 'normal',
              fontFamily: 'monospace', fontSize: '13px',
            }}>
              {p.name}{done ? ' ✓' : isCurrent ? ' ◀' : ''}
              {i < state.turnOrder.length - 1 ? ' → ' : ''}
            </span>
          );
        })}
      </div>

      <ConspiracyBoard
        conspiracies={state.activeConspiracies}
        players={state.players}
        selectedCardTargets={undefined}
        onSelectConspiracy={() => {}}
        interactive={false}
      />

      {isMyTurn && humanPlayer && (
        <div style={styles.actions}>
          {state.activeConspiracies.map(c => {
            const myEvidence = c.evidenceAssignments.filter(a => a.playerId === humanPlayer.id);
            const hasEvidence = myEvidence.length > 0;
            const hasSpecific = myEvidence.some(a => a.specific);
            const realEvidence = myEvidence.filter(a => a.position === 'REAL').length;
            const fakeEvidence = myEvidence.filter(a => a.position === 'FAKE').length;
            const evidencePosition = realEvidence >= fakeEvidence ? 'REAL' : 'FAKE';

            const realVotes = c.broadcasts.filter(b => b.position === 'REAL').length;
            const fakeVotes = c.broadcasts.filter(b => b.position === 'FAKE').length;
            const threshold = state.consensusThreshold;

            // Calculate projected points for each broadcast choice
            const realMatchesEvidence = hasEvidence && evidencePosition === 'REAL';
            const fakeMatchesEvidence = hasEvidence && evidencePosition === 'FAKE';
            const realBase = hasEvidence ? (realMatchesEvidence ? 3 : 2) : 2;
            const fakeBase = hasEvidence ? (fakeMatchesEvidence ? 3 : 2) : 2;
            const realSpecific = (hasSpecific && realMatchesEvidence) ? 1 : 0;
            const fakeSpecific = (hasSpecific && fakeMatchesEvidence) ? 1 : 0;

            return (
              <div key={c.card.id} data-testid={`point-projection-${c.card.id}`} style={styles.conspiracyRow}>
                <div style={styles.conspiracyInfo}>
                  <span style={styles.conspiracyName}>{c.card.icon} {c.card.name}</span>
                  <span style={styles.evidenceInfo}>
                    {hasEvidence
                      ? `${myEvidence.length} card${myEvidence.length > 1 ? 's' : ''} ${hasSpecific ? '(specific 🎯)' : '(generic 📋)'} — ${realEvidence > 0 && fakeEvidence > 0 ? `${realEvidence} REAL, ${fakeEvidence} FAKE` : evidencePosition}`
                      : 'No evidence'}
                  </span>
                </div>
                <div style={styles.projections}>
                  <span style={{
                    ...styles.projLabel,
                    color: realMatchesEvidence ? '#0f0' : '#9ca3af',
                  }}>
                    REAL: ~{realVotes + 1 >= threshold ? (realBase + realSpecific) : 0} pts
                    {realMatchesEvidence ? ' (matches)' : hasEvidence ? ' (bluff)' : ''}
                    {realVotes > 0 && ` [${realVotes} voted]`}
                  </span>
                  <span style={{
                    ...styles.projLabel,
                    color: fakeMatchesEvidence ? '#f44' : '#9ca3af',
                  }}>
                    FAKE: ~{fakeVotes + 1 >= threshold ? (fakeBase + fakeSpecific) : 0} pts
                    {fakeMatchesEvidence ? ' (matches)' : hasEvidence ? ' (bluff)' : ''}
                    {fakeVotes > 0 && ` [${fakeVotes} voted]`}
                  </span>
                </div>
                <div style={styles.buttons}>
                  <button
                    data-testid={`broadcast-real-${c.card.id}`}
                    style={styles.realButton}
                    onClick={() => handleBroadcast(c.card.id, 'REAL')}
                  >REAL</button>
                  <button
                    data-testid={`broadcast-fake-${c.card.id}`}
                    style={styles.fakeButton}
                    onClick={() => handleBroadcast(c.card.id, 'FAKE')}
                  >FAKE</button>
                </div>
              </div>
            );
          })}

          <button data-testid="broadcast-pass" style={styles.passButton} onClick={handlePass}>
            ⏭ PASS — Score 0, draw 1 card for next round
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  phaseHeader: { padding: '8px', fontFamily: 'monospace' },
  phaseTitle: { color: '#0af', fontSize: '18px', margin: '0 0 4px' },
  instruction: { color: '#9ca3af', fontSize: '13px', margin: 0 },
  turnOrder: { padding: '4px 8px' },
  actions: { padding: '8px', fontFamily: 'monospace' },
  conspiracyRow: { background: '#1a1a2e', borderRadius: '4px', padding: '8px', marginBottom: '8px' },
  conspiracyInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  conspiracyName: { color: '#fff', fontSize: '14px' },
  evidenceInfo: { color: '#9ca3af', fontSize: '12px' },
  projections: { display: 'flex', gap: '16px', marginBottom: '6px' },
  projLabel: { fontSize: '12px' },
  buttons: { display: 'flex', gap: '8px' },
  realButton: {
    background: '#0a3d0a', border: '1px solid #0f0', color: '#0f0',
    fontFamily: 'monospace', padding: '4px 16px', cursor: 'pointer', borderRadius: '3px', fontSize: '13px',
  },
  fakeButton: {
    background: '#3d0a0a', border: '1px solid #f44', color: '#f44',
    fontFamily: 'monospace', padding: '4px 16px', cursor: 'pointer', borderRadius: '3px', fontSize: '13px',
  },
  passButton: {
    background: '#2a2a0a', border: '1px solid #fa0', color: '#fa0',
    fontFamily: 'monospace', fontSize: '14px', padding: '8px 24px',
    cursor: 'pointer', marginTop: '12px', borderRadius: '4px', width: '100%',
  },
};
