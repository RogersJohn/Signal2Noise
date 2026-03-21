import React, { useState } from 'react';
import { GameState, GameAction } from '../../engine/types';
import { canSupport } from '../../engine/deck';
import PlayerHand from './PlayerHand';
import ConspiracyBoard from './ConspiracyBoard';

interface CommitPhaseProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  isAITurn: boolean;
}

export default function CommitPhase({ state, dispatch, isAITurn }: CommitPhaseProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const humanPlayer = state.players.find(p => p.isHuman);

  if (!humanPlayer) return <div style={styles.waiting}>AI players are committing evidence...</div>;

  const isMyTurn = !state.committedPlayers.includes(humanPlayer.id);

  const handleSelectConspiracy = (conspiracyId: string) => {
    if (!selectedCardId || !isMyTurn) return;

    const card = humanPlayer.hand.find(c => c.id === selectedCardId);
    if (!card || !canSupport(card, conspiracyId)) return;

    dispatch({
      type: 'ASSIGN_EVIDENCE',
      playerId: humanPlayer.id,
      cardId: selectedCardId,
      conspiracyId,
    });
    setSelectedCardId(null);
  };

  const handleDoneCommitting = () => {
    dispatch({ type: 'DONE_COMMITTING', playerId: humanPlayer.id });
  };

  return (
    <div>
      <div style={styles.phaseHeader}>
        <h2 style={styles.phaseTitle}>📋 COMMIT PHASE — Round {state.round}/{state.maxRounds}</h2>
        <p style={styles.instruction}>
          {isAITurn ? 'Waiting for AI...' :
           isMyTurn ? 'Select a card, then click a conspiracy to assign it. Click DONE when finished.' :
           'Waiting for other players...'}
        </p>
      </div>
      <ConspiracyBoard
        conspiracies={state.activeConspiracies}
        players={state.players}
        selectedConspiracyId={null}
        onSelectConspiracy={handleSelectConspiracy}
        interactive={isMyTurn && selectedCardId !== null}
      />
      <PlayerHand
        cards={humanPlayer.hand}
        selectedCardId={selectedCardId}
        onSelectCard={setSelectedCardId}
        disabled={!isMyTurn}
      />
      {isMyTurn && (
        <button style={styles.doneButton} onClick={handleDoneCommitting}>
          ✓ DONE COMMITTING
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  phaseHeader: { padding: '8px', fontFamily: 'monospace' },
  phaseTitle: { color: '#0f0', fontSize: '16px', margin: '0 0 4px' },
  instruction: { color: '#888', fontSize: '12px', margin: 0 },
  waiting: { color: '#fa0', fontFamily: 'monospace', padding: '20px', textAlign: 'center' },
  doneButton: {
    background: '#0a3d0a',
    border: '1px solid #0f0',
    color: '#0f0',
    fontFamily: 'monospace',
    fontSize: '14px',
    padding: '8px 24px',
    cursor: 'pointer',
    margin: '8px',
    borderRadius: '4px',
  },
};
