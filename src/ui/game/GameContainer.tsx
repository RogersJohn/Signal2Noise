import React, { useEffect, useRef, useCallback } from 'react';
import { GameConfig } from '../../engine/types';
import { useGame, UIPhase } from '../hooks/useGame';
import { useAIAgents } from '../hooks/useAIAgents';
import GameView from './GameView';

interface GameContainerProps {
  playerName: string;
  aiCount: number;
  onBack: () => void;
}

export default function GameContainer({ playerName, aiCount, onBack }: GameContainerProps) {
  const { agents, agentInfos, generateSignals } = useAIAgents(aiCount);

  const names = [playerName, ...agentInfos.map(a => a.displayName)];
  const config: GameConfig = {
    playerNames: names,
    humanPlayerIds: ['player_0'],
    aiStrategies: ['', ...agentInfos.map(a => a.strategyName)],
  };

  const game = useGame(config);
  const {
    engineState: state, uiPhase, setUIPhase, dispatch,
    aiNarration, setAINarration, selectedCardId, setSelectedCardId,
    aiSpeed, setAISpeed, signals, setSignals, signalDisplays, setSignalDisplays,
    isHumanTurn, getCurrentPlayerId, advanceOneAICommit, advanceOneAIBroadcast,
  } = game;

  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const delay = aiSpeed === 'normal' ? 1500 : 400;

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Determine initial UI phase on engine phase changes
  useEffect(() => {
    if (state.phase === 'GAME_OVER') {
      setUIPhase('GAME_OVER');
      return;
    }

    if (state.phase === 'COMMIT') {
      const currentId = getCurrentPlayerId(state);
      const player = state.players.find(p => p.id === currentId);
      if (player?.isHuman && !state.committedPlayers.includes(currentId)) {
        setUIPhase('COMMIT_PLAYER');
      } else if (!state.committedPlayers.includes(currentId)) {
        setUIPhase('COMMIT_AI');
      }
    }
  }, [state.phase, state.round]);
  // Process AI commits
  useEffect(() => {
    if (uiPhase !== 'COMMIT_AI') return;
    if (state.phase !== 'COMMIT') return;

    const currentId = getCurrentPlayerId(state);
    const player = state.players.find(p => p.id === currentId);

    if (!player) return;

    if (player.isHuman) {
      setUIPhase('COMMIT_PLAYER');
      setAINarration(null);
      return;
    }

    timerRef.current = setTimeout(() => {
      const result = advanceOneAICommit(state, agents);
      if (result) {
        setAINarration(`🤖 ${result.narration}`);
      }
      // Check if all committed -> signals
      // The dispatch in advanceOneAICommit will trigger re-render
    }, delay);

    return clearTimer;
  }, [uiPhase, state, delay]);
  // Transition from COMMIT to SIGNALS when engine enters BROADCAST
  useEffect(() => {
    if (state.phase === 'BROADCAST' && uiPhase !== 'SIGNALS' && uiPhase !== 'BROADCAST_PLAYER' && uiPhase !== 'BROADCAST_AI' && uiPhase !== 'BROADCAST_WAITING') {
      const { signals: sigs, displays } = generateSignals(state);
      setSignals(sigs);
      setSignalDisplays(displays);
      setAINarration(null);
      setUIPhase('SIGNALS');
    }
  }, [state.phase]);
  // Process AI broadcasts
  useEffect(() => {
    if (uiPhase !== 'BROADCAST_AI' && uiPhase !== 'BROADCAST_WAITING') return;
    if (state.phase !== 'BROADCAST') return;

    const currentId = getCurrentPlayerId(state);
    const player = state.players.find(p => p.id === currentId);

    if (!player) return;

    if (player.isHuman) {
      setUIPhase('BROADCAST_PLAYER');
      setAINarration(null);
      return;
    }

    setUIPhase('BROADCAST_AI');
    timerRef.current = setTimeout(() => {
      const result = advanceOneAIBroadcast(state, agents, signals);
      if (result) {
        setAINarration(`🤖 ${result.narration}`);
      }
    }, delay);

    return clearTimer;
  }, [uiPhase, state, delay]);

  // Transition from BROADCAST_PLAYER to BROADCAST_AI after human broadcasts
  useEffect(() => {
    if (uiPhase !== 'BROADCAST_PLAYER') return;
    if (state.phase !== 'BROADCAST') return;

    const humanPlayer = state.players.find(p => p.isHuman);
    if (!humanPlayer) return;

    if (state.broadcastedPlayers.includes(humanPlayer.id)) {
      const currentId = getCurrentPlayerId(state);
      const nextPlayer = state.players.find(p => p.id === currentId);
      if (nextPlayer && !nextPlayer.isHuman) {
        setUIPhase('BROADCAST_AI');
      }
    }
  }, [uiPhase, state, getCurrentPlayerId, setUIPhase]);

  // Transition to RESOLVE when engine enters RESOLVE
  useEffect(() => {
    if (state.phase === 'RESOLVE' && uiPhase !== 'RESOLVE_DISPLAY') {
      dispatch({ type: 'RESOLVE' });
      setAINarration(null);
      setUIPhase('RESOLVE_DISPLAY');
    }
  }, [state.phase]);
  // Handlers
  const handleDoneCommitting = useCallback(() => {
    const humanPlayer = state.players.find(p => p.isHuman);
    if (!humanPlayer) return;
    dispatch({ type: 'DONE_COMMITTING', playerId: humanPlayer.id });
    setSelectedCardId(null);
    setUIPhase('COMMIT_AI');
  }, [state.players, dispatch, setSelectedCardId, setUIPhase]);

  const handleDismissSignals = useCallback(() => {
    const currentId = getCurrentPlayerId(state);
    const player = state.players.find(p => p.id === currentId);
    if (player?.isHuman) {
      setUIPhase('BROADCAST_PLAYER');
    } else {
      setUIPhase('BROADCAST_WAITING');
    }
  }, [state, getCurrentPlayerId, setUIPhase]);

  const handleContinueResolve = useCallback(() => {
    for (const agent of agents) {
      agent.onRoundEnd(state, signals);
    }
    dispatch({ type: 'NEXT_ROUND' });
    if (state.round >= state.maxRounds) {
      setUIPhase('GAME_OVER');
    } else {
      setUIPhase('COMMIT_AI'); // Will transition to COMMIT_PLAYER if human is first
    }
  }, [state, agents, signals, dispatch, setUIPhase]);

  const handleToggleSpeed = useCallback(() => {
    setAISpeed(s => s === 'normal' ? 'fast' : 'normal');
  }, [setAISpeed]);

  return (
    <div>
      <button style={backBtnStyle} onClick={onBack}>← Menu</button>
      <GameView
        state={state}
        uiPhase={uiPhase}
        dispatch={dispatch}
        aiNarration={aiNarration}
        aiSpeed={aiSpeed}
        onToggleSpeed={handleToggleSpeed}
        selectedCardId={selectedCardId}
        onSelectCard={setSelectedCardId}
        onDoneCommitting={handleDoneCommitting}
        signalDisplays={signalDisplays}
        onDismissSignals={handleDismissSignals}
        onContinueResolve={handleContinueResolve}
        onPlayAgain={onBack}
      />
    </div>
  );
}

const backBtnStyle: React.CSSProperties = {
  background: 'none', border: '1px solid #333', color: '#888',
  fontFamily: 'monospace', fontSize: '12px', padding: '4px 12px',
  cursor: 'pointer', margin: '8px', borderRadius: '3px',
};
