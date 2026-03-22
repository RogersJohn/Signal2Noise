import React from 'react';
import { GameState, GameAction } from '../../engine/types';
import { UIPhase } from '../hooks/useGame';
import CommitPhase from './CommitPhase';
import SignalDisplay from './SignalDisplay';
import BroadcastPhase from './BroadcastPhase';
import ResolveDisplay from './ResolveDisplay';
import GameOverScreen from './GameOverScreen';
import ActionNarration from './ActionNarration';
import Scoreboard from './Scoreboard';
import GameLog from './GameLog';

interface GameViewProps {
  state: GameState;
  uiPhase: UIPhase;
  dispatch: (action: GameAction) => void;
  aiNarration: string | null;
  aiSpeed: 'normal' | 'fast';
  onToggleSpeed: () => void;
  selectedCardId: string | null;
  onSelectCard: (id: string) => void;
  onDoneCommitting: () => void;
  signalDisplays: string[];
  onDismissSignals: () => void;
  onContinueResolve: () => void;
  onPlayAgain: () => void;
}

export default function GameView({
  state, uiPhase, dispatch, aiNarration, aiSpeed, onToggleSpeed,
  selectedCardId, onSelectCard, onDoneCommitting,
  signalDisplays, onDismissSignals, onContinueResolve, onPlayAgain,
}: GameViewProps) {
  if (uiPhase === 'GAME_OVER') {
    return <GameOverScreen state={state} onPlayAgain={onPlayAgain} />;
  }

  const currentPlayerId = state.turnOrder[state.currentPlayerIndex];
  const isPlayerCommit = uiPhase === 'COMMIT_PLAYER';
  const isPlayerBroadcast = uiPhase === 'BROADCAST_PLAYER';

  return (
    <div style={styles.container}>
      <ActionNarration narration={aiNarration} aiSpeed={aiSpeed} onToggleSpeed={onToggleSpeed} />

      <div style={styles.main}>
        <div style={styles.gameArea}>
          {(uiPhase === 'COMMIT_PLAYER' || uiPhase === 'COMMIT_AI') && (
            <CommitPhase
              state={state}
              dispatch={dispatch}
              selectedCardId={selectedCardId}
              onSelectCard={onSelectCard}
              onDoneCommitting={onDoneCommitting}
              isPlayerTurn={isPlayerCommit}
            />
          )}

          {uiPhase === 'SIGNALS' && (
            <SignalDisplay
              signalDisplays={signalDisplays}
              state={state}
              onDismiss={onDismissSignals}
            />
          )}

          {(uiPhase === 'BROADCAST_PLAYER' || uiPhase === 'BROADCAST_WAITING' || uiPhase === 'BROADCAST_AI') && (
            <BroadcastPhase
              state={state}
              dispatch={dispatch}
              isPlayerTurn={isPlayerBroadcast}
            />
          )}

          {uiPhase === 'RESOLVE_DISPLAY' && (
            <ResolveDisplay state={state} onContinue={onContinueResolve} />
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
};
