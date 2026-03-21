import React from 'react';
import { GameState, GameAction, Position } from '../../engine/types';
import ConspiracyBoard from './ConspiracyBoard';

interface BroadcastPhaseProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  isAITurn: boolean;
}

export default function BroadcastPhase({ state, dispatch, isAITurn }: BroadcastPhaseProps) {
  const humanPlayer = state.players.find(p => p.isHuman);
  const currentPlayerId = state.turnOrder[state.currentPlayerIndex];
  const currentPlayer = state.players.find(p => p.id === currentPlayerId);
  const isMyTurn = humanPlayer?.id === currentPlayerId;

  const handleBroadcast = (conspiracyId: string, position: Position) => {
    if (!humanPlayer || !isMyTurn) return;
    dispatch({
      type: 'BROADCAST',
      playerId: humanPlayer.id,
      conspiracyId,
      position,
    });
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
          {isAITurn ? `Waiting for ${currentPlayer?.name}...` :
           isMyTurn ? 'Choose a conspiracy and declare REAL or FAKE, or PASS.' :
           'Waiting...'}
        </p>
      </div>

      <div style={styles.turnOrder}>
        <h4 style={styles.turnTitle}>Broadcast Order:</h4>
        {state.turnOrder.map((pid, i) => {
          const p = state.players.find(pl => pl.id === pid)!;
          const hasBroadcast = state.broadcastedPlayers.includes(pid);
          const isCurrent = pid === currentPlayerId;
          return (
            <span key={pid} style={{
              ...styles.playerTag,
              color: hasBroadcast ? '#555' : isCurrent ? '#0f0' : '#888',
              fontWeight: isCurrent ? 'bold' : 'normal',
            }}>
              {p.name}{hasBroadcast ? ' ✓' : isCurrent ? ' ◀' : ''}
              {i < state.turnOrder.length - 1 ? ' → ' : ''}
            </span>
          );
        })}
      </div>

      <ConspiracyBoard
        conspiracies={state.activeConspiracies}
        players={state.players}
        selectedConspiracyId={null}
        onSelectConspiracy={() => {}}
        interactive={false}
      />

      {isMyTurn && (
        <div style={styles.actions}>
          <p style={styles.actionLabel}>Pick a conspiracy:</p>
          {state.activeConspiracies.map(c => (
            <div key={c.card.id} style={styles.conspiracyActions}>
              <span style={styles.conspiracyName}>{c.card.icon} {c.card.name}</span>
              <button
                style={styles.realButton}
                onClick={() => handleBroadcast(c.card.id, 'REAL')}
              >
                REAL
              </button>
              <button
                style={styles.fakeButton}
                onClick={() => handleBroadcast(c.card.id, 'FAKE')}
              >
                FAKE
              </button>
            </div>
          ))}
          <button style={styles.passButton} onClick={handlePass}>
            ⏭ PASS
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  phaseHeader: { padding: '8px', fontFamily: 'monospace' },
  phaseTitle: { color: '#0af', fontSize: '16px', margin: '0 0 4px' },
  instruction: { color: '#888', fontSize: '12px', margin: 0 },
  turnOrder: { padding: '4px 8px', fontFamily: 'monospace', fontSize: '12px' },
  turnTitle: { color: '#888', margin: '0 0 4px', fontSize: '12px' },
  playerTag: { fontFamily: 'monospace' },
  actions: { padding: '8px', fontFamily: 'monospace' },
  actionLabel: { color: '#0af', fontSize: '12px', margin: '0 0 8px' },
  conspiracyActions: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  conspiracyName: { color: '#ccc', fontSize: '12px', minWidth: '200px' },
  realButton: {
    background: '#0a3d0a', border: '1px solid #0f0', color: '#0f0',
    fontFamily: 'monospace', padding: '4px 12px', cursor: 'pointer', borderRadius: '3px',
  },
  fakeButton: {
    background: '#3d0a0a', border: '1px solid #f44', color: '#f44',
    fontFamily: 'monospace', padding: '4px 12px', cursor: 'pointer', borderRadius: '3px',
  },
  passButton: {
    background: '#2a2a0a', border: '1px solid #fa0', color: '#fa0',
    fontFamily: 'monospace', fontSize: '14px', padding: '8px 24px', cursor: 'pointer',
    marginTop: '12px', borderRadius: '4px',
  },
};
