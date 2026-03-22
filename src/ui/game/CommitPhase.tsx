import React from 'react';
import { GameState, GameAction } from '../../engine/types';
import { canSupport } from '../../engine/deck';
import PlayerHand from './PlayerHand';
import ConspiracyBoard from './ConspiracyBoard';

interface CommitPhaseProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  selectedCardId: string | null;
  onSelectCard: (id: string) => void;
  onDoneCommitting: () => void;
  isPlayerTurn: boolean;
}

export default function CommitPhase({
  state, dispatch, selectedCardId, onSelectCard, onDoneCommitting, isPlayerTurn,
}: CommitPhaseProps) {
  const humanPlayer = state.players.find(p => p.isHuman);
  if (!humanPlayer) return null;

  const isMyTurn = isPlayerTurn && !state.committedPlayers.includes(humanPlayer.id);
  const selectedCard = humanPlayer.hand.find(c => c.id === selectedCardId);
  const selectedCardTargets = selectedCard ? selectedCard.targets : null;

  const handleSelectConspiracy = (conspiracyId: string) => {
    if (!selectedCardId || !isMyTurn || !selectedCard) return;
    if (!canSupport(selectedCard, conspiracyId)) return;
    dispatch({
      type: 'ASSIGN_EVIDENCE', playerId: humanPlayer.id,
      cardId: selectedCardId, conspiracyId,
    });
    onSelectCard('');
  };

  // Build evidence summary with position breakdown
  const myEvidence: Array<{ name: string; total: number; specific: number; realCount: number; fakeCount: number }> = [];
  for (const ac of state.activeConspiracies) {
    const assignments = ac.evidenceAssignments.filter(a => a.playerId === humanPlayer.id);
    if (assignments.length > 0) {
      myEvidence.push({
        name: ac.card.name,
        total: assignments.length,
        specific: assignments.filter(a => a.specific).length,
        realCount: assignments.filter(a => a.position === 'REAL').length,
        fakeCount: assignments.filter(a => a.position === 'FAKE').length,
      });
    }
  }

  const hasCommitted = myEvidence.length > 0;

  return (
    <div>
      <div style={styles.phaseHeader}>
        <h2 style={styles.phaseTitle}>📋 COMMIT PHASE — Round {state.round}/{state.maxRounds}</h2>
        <p style={styles.instruction}>
          {isMyTurn
            ? 'Select a card, then click a highlighted conspiracy to assign it.'
            : 'Waiting for other players...'}
        </p>
      </div>

      <ConspiracyBoard
        conspiracies={state.activeConspiracies}
        players={state.players}
        selectedCardTargets={selectedCardTargets}
        onSelectConspiracy={handleSelectConspiracy}
        interactive={isMyTurn && selectedCardId !== null}
      />

      {myEvidence.length > 0 && (
        <div data-testid="evidence-summary" style={styles.summary}>
          <strong style={styles.summaryTitle}>Your committed evidence:</strong>
          {myEvidence.map(e => {
            const positionLabel = e.realCount > 0 && e.fakeCount > 0
              ? `${e.realCount} REAL, ${e.fakeCount} FAKE`
              : e.realCount > 0 ? 'supports REAL' : 'supports FAKE';
            return (
              <div key={e.name} style={styles.summaryLine}>
                {e.name}: {e.total} card{e.total > 1 ? 's' : ''}{' '}
                ({e.specific > 0 ? `${e.specific} specific 🎯` : 'generic 📋'})
                {' — '}{positionLabel}
              </div>
            );
          })}
        </div>
      )}

      <PlayerHand
        cards={humanPlayer.hand}
        selectedCardId={selectedCardId}
        onSelectCard={onSelectCard}
        disabled={!isMyTurn}
      />

      {isMyTurn && (
        <button
          data-testid="done-committing"
          style={styles.doneButton}
          onClick={onDoneCommitting}
        >
          {hasCommitted
            ? '✓ DONE — Proceed to signals'
            : 'Nothing to commit — click to proceed anyway'}
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  phaseHeader: { padding: '8px', fontFamily: 'monospace' },
  phaseTitle: { color: '#0f0', fontSize: '18px', margin: '0 0 4px' },
  instruction: { color: '#9ca3af', fontSize: '13px', margin: 0 },
  summary: {
    background: '#1a1a0a', border: '1px solid #333', borderRadius: '4px',
    padding: '8px 12px', margin: '8px', fontFamily: 'monospace', fontSize: '13px',
  },
  summaryTitle: { color: '#fa0', display: 'block', marginBottom: '4px' },
  summaryLine: { color: '#d1d5db', marginLeft: '8px', marginBottom: '2px' },
  doneButton: {
    background: '#0a3d0a', border: '1px solid #0f0', color: '#0f0',
    fontFamily: 'monospace', fontSize: '14px', padding: '8px 24px',
    cursor: 'pointer', margin: '8px', borderRadius: '4px',
  },
};
