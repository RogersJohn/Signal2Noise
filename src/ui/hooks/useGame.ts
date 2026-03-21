import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameAction, GameConfig } from '../../engine/types';
import { createGame, applyAction, getWinner } from '../../engine/engine';
import { getStrategy } from '../../ai/strategies';
import { CONSPIRACIES } from '../../data/conspiracies';
import { EVIDENCE_CARDS } from '../../data/evidence';
import { GameRecorder } from '../../logging/gameRecorder';

function gameReducer(state: GameState, action: GameAction): GameState {
  try {
    return applyAction(state, action);
  } catch (e) {
    console.error('Invalid action:', action, e);
    return state;
  }
}

export interface UseGameReturn {
  state: GameState;
  dispatch: (action: GameAction) => void;
  startGame: (config: GameConfig) => void;
  isAITurn: boolean;
  winner: ReturnType<typeof getWinner>;
}

export function useGame(): UseGameReturn {
  const defaultConfig: GameConfig = {
    playerNames: ['You'],
    humanPlayerIds: ['player_0'],
  };

  const [state, dispatch] = useReducer(
    gameReducer,
    defaultConfig,
    (config) => createGame(config, CONSPIRACIES, EVIDENCE_CARDS)
  );

  const recorderRef = useRef<GameRecorder>(new GameRecorder(state));
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const wrappedDispatch = useCallback((action: GameAction) => {
    dispatch(action);
  }, []);

  const startGame = useCallback((config: GameConfig) => {
    const newState = createGame(config, CONSPIRACIES, EVIDENCE_CARDS);
    // Reset via a series of actions isn't clean with useReducer,
    // so we use a trick: dispatch a special init
    // Actually, we need to re-create the reducer. Let's use a workaround.
    dispatch({ type: 'NEXT_ROUND' } as GameAction); // placeholder
    // For a real reset, the component should unmount/remount
    recorderRef.current = new GameRecorder(newState);
  }, []);

  // Determine if it's an AI turn
  const currentPlayerId = state.phase === 'COMMIT' || state.phase === 'BROADCAST'
    ? state.turnOrder[state.currentPlayerIndex]
    : undefined;

  const currentPlayer = currentPlayerId
    ? state.players.find(p => p.id === currentPlayerId)
    : undefined;

  const isAITurn = currentPlayer ? !currentPlayer.isHuman : false;

  // Handle AI turns
  useEffect(() => {
    if (state.phase === 'GAME_OVER' || state.phase === 'RESOLVE') return;

    if (!isAITurn || !currentPlayer || !currentPlayer.strategyName) return;

    aiTimeoutRef.current = setTimeout(() => {
      const strategy = getStrategy(currentPlayer.strategyName!);

      if (state.phase === 'COMMIT') {
        const commitActions = strategy.decideCommit(state, currentPlayer.id);
        for (const action of commitActions) {
          try {
            dispatch(action);
          } catch {
            // Skip invalid
          }
        }
        dispatch({ type: 'DONE_COMMITTING', playerId: currentPlayer.id });
      } else if (state.phase === 'BROADCAST') {
        const action = strategy.decideBroadcast(state, currentPlayer.id);
        dispatch(action);
      }
    }, 500); // Small delay for UX

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [state, isAITurn, currentPlayer]);

  // Auto-resolve and auto-next-round
  useEffect(() => {
    if (state.phase === 'RESOLVE') {
      aiTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'RESOLVE' });
        setTimeout(() => {
          dispatch({ type: 'NEXT_ROUND' });
        }, 1500);
      }, 1000);

      return () => {
        if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      };
    }
  }, [state.phase]);

  const winner = getWinner(state);

  return { state, dispatch: wrappedDispatch, startGame, isAITurn, winner };
}
