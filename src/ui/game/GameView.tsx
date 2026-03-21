import React from 'react';
import { GameState, GameAction } from '../../engine/types';
import CommitPhase from './CommitPhase';
import BroadcastPhase from './BroadcastPhase';
import ResolvePhase from './ResolvePhase';
import Scoreboard from './Scoreboard';
import GameLog from './GameLog';
import { getWinner } from '../../engine/engine';

interface GameViewProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  isAITurn: boolean;
}

export default function GameView({ state, dispatch, isAITurn }: GameViewProps) {
  const winner = getWinner(state);
  const currentPlayerId = state.turnOrder[state.currentPlayerIndex];

  if (state.phase === 'GAME_OVER') {
    return (
      <div style={styles.container}>
        <div style={styles.gameOver}>
          <h1 style={styles.gameOverTitle}>🏆 GAME OVER</h1>
          <p style={styles.winnerText}>
            {winner ? `${winner.name} wins with ${winner.score} points!` : 'No winner'}
          </p>
          <Scoreboard players={state.players} />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.gameArea}>
          {state.phase === 'COMMIT' && (
            <CommitPhase state={state} dispatch={dispatch} isAITurn={isAITurn} />
          )}
          {state.phase === 'BROADCAST' && (
            <BroadcastPhase state={state} dispatch={dispatch} isAITurn={isAITurn} />
          )}
          {state.phase === 'RESOLVE' && (
            <ResolvePhase state={state} />
          )}
        </div>
        <div style={styles.sidebar}>
          <Scoreboard players={state.players} currentPlayerId={currentPlayerId} />
          <GameLog entries={state.log} />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { background: '#0a0a0a', minHeight: '100vh', color: '#ccc' },
  main: { display: 'flex', gap: '8px' },
  gameArea: { flex: 1 },
  sidebar: { width: '280px', borderLeft: '1px solid #222', flexShrink: 0 },
  gameOver: { textAlign: 'center', padding: '40px', fontFamily: 'monospace' },
  gameOverTitle: { color: '#fa0', fontSize: '32px' },
  winnerText: { color: '#0f0', fontSize: '18px' },
};
