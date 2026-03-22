import { useReducer, useState, useCallback, useRef } from 'react';
import { GameState, GameAction, GameConfig } from '../../engine/types';
import { createGame, applyAction, getWinner } from '../../engine/engine';
import { CONSPIRACIES } from '../../data/conspiracies';
import { EVIDENCE_CARDS } from '../../data/evidence';
import { Signal } from '../../ai/social/types';
import { AdvancedAI } from '../../ai/social/advancedAgent';

export type UIPhase =
  | 'COMMIT_PLAYER'
  | 'COMMIT_AI'
  | 'SIGNALS'
  | 'BROADCAST_WAITING'
  | 'BROADCAST_PLAYER'
  | 'BROADCAST_AI'
  | 'RESOLVE_DISPLAY'
  | 'GAME_OVER';

export interface GameUIState {
  engineState: GameState;
  uiPhase: UIPhase;
  signals: Signal[];
  signalDisplays: string[];
  aiNarration: string | null;
  selectedCardId: string | null;
}

function engineReducer(state: GameState, action: GameAction): GameState {
  try {
    return applyAction(state, action);
  } catch (e) {
    console.error('Invalid action:', action, e);
    return state;
  }
}

export function useGame(config: GameConfig) {
  const [engineState, dispatchEngine] = useReducer(
    engineReducer,
    config,
    (cfg) => createGame(cfg, CONSPIRACIES, EVIDENCE_CARDS)
  );

  const [uiPhase, setUIPhase] = useState<UIPhase>(() => {
    // Determine initial UI phase based on whether human goes first
    const state = createGame(config, CONSPIRACIES, EVIDENCE_CARDS);
    const firstPlayer = state.turnOrder[0];
    return config.humanPlayerIds.includes(firstPlayer) ? 'COMMIT_PLAYER' : 'COMMIT_AI';
  });

  const [signals, setSignals] = useState<Signal[]>([]);
  const [signalDisplays, setSignalDisplays] = useState<string[]>([]);
  const [aiNarration, setAINarration] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [aiSpeed, setAISpeed] = useState<'normal' | 'fast'>('normal');

  const dispatch = useCallback((action: GameAction) => {
    dispatchEngine(action);
  }, []);

  const isHumanTurn = useCallback((state: GameState): boolean => {
    if (state.phase === 'GAME_OVER' || state.phase === 'RESOLVE') return false;
    const currentId = state.turnOrder[state.currentPlayerIndex];
    const player = state.players.find(p => p.id === currentId);
    return player?.isHuman ?? false;
  }, []);

  const getCurrentPlayerId = useCallback((state: GameState): string => {
    return state.turnOrder[state.currentPlayerIndex];
  }, []);

  const getPlayerName = useCallback((state: GameState, playerId: string): string => {
    return state.players.find(p => p.id === playerId)?.name ?? playerId;
  }, []);

  // Advance one AI action, return narration text
  const advanceOneAICommit = useCallback((
    state: GameState,
    agents: AdvancedAI[]
  ): { narration: string; newPhase: UIPhase } | null => {
    const currentId = getCurrentPlayerId(state);
    const player = state.players.find(p => p.id === currentId);
    if (!player || player.isHuman) return null;

    const agent = agents.find(a => a.playerId === currentId);
    if (!agent) return null;

    const actions = agent.decideCommit(state);
    const assignedCount = actions.length;
    for (const a of actions) {
      try { dispatch(a); } catch { /* skip */ }
    }
    dispatch({ type: 'DONE_COMMITTING', playerId: currentId });

    const name = player.name;
    const narration = assignedCount > 0
      ? `${name} assigned ${assignedCount} card${assignedCount > 1 ? 's' : ''}`
      : `${name} committed nothing`;

    return { narration, newPhase: 'COMMIT_AI' };
  }, [dispatch, getCurrentPlayerId]);

  const advanceOneAIBroadcast = useCallback((
    state: GameState,
    agents: AdvancedAI[],
    currentSignals: Signal[]
  ): { narration: string } | null => {
    const currentId = getCurrentPlayerId(state);
    const player = state.players.find(p => p.id === currentId);
    if (!player || player.isHuman) return null;

    const agent = agents.find(a => a.playerId === currentId);
    if (!agent) return null;

    const action = agent.decideBroadcast(state, currentSignals);
    dispatch(action);

    if (action.type === 'BROADCAST') {
      const cid = (action as { conspiracyId: string }).conspiracyId;
      const pos = (action as { position: string }).position;
      const conspiracy = state.activeConspiracies.find(c => c.card.id === cid);
      const cname = conspiracy?.card.name ?? cid;
      return { narration: `${player.name} broadcasts ${pos} on ${cname}` };
    }
    return { narration: `${player.name} passes (drew 1 card)` };
  }, [dispatch, getCurrentPlayerId]);

  return {
    engineState,
    uiPhase,
    setUIPhase,
    signals,
    setSignals,
    signalDisplays,
    setSignalDisplays,
    aiNarration,
    setAINarration,
    selectedCardId,
    setSelectedCardId,
    aiSpeed,
    setAISpeed,
    dispatch,
    isHumanTurn,
    getCurrentPlayerId,
    getPlayerName,
    advanceOneAICommit,
    advanceOneAIBroadcast,
    winner: getWinner(engineState),
  };
}
