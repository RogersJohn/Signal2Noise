import { GameState, GameAction, LogEntry, Phase } from '../engine/types';

export interface StructuredLog {
  timestamp: number;
  round: number;
  phase: Phase;
  playerId?: string;
  actionType: string;
  details: Record<string, unknown>;
  stateSnapshot: {
    scores: Record<string, number>;
    handSizes: Record<string, number>;
    evidenceCounts: Record<string, Record<string, number>>;
  };
}

export function createStructuredLog(
  state: GameState,
  action: GameAction
): StructuredLog {
  const scores: Record<string, number> = {};
  const handSizes: Record<string, number> = {};
  state.players.forEach(p => {
    scores[p.id] = p.score;
    handSizes[p.id] = p.hand.length;
  });

  const evidenceCounts: Record<string, Record<string, number>> = {};
  state.activeConspiracies.forEach(c => {
    evidenceCounts[c.card.id] = {};
    state.players.forEach(p => {
      evidenceCounts[c.card.id][p.id] = c.evidenceAssignments.filter(
        a => a.playerId === p.id
      ).length;
    });
  });

  const details: Record<string, unknown> = { type: action.type };
  if ('playerId' in action) details.playerId = action.playerId;
  if ('cardId' in action) details.cardId = action.cardId;
  if ('conspiracyId' in action) details.conspiracyId = action.conspiracyId;
  if ('position' in action) details.position = action.position;

  return {
    timestamp: Date.now(),
    round: state.round,
    phase: state.phase,
    playerId: 'playerId' in action ? action.playerId : undefined,
    actionType: action.type,
    details,
    stateSnapshot: { scores, handSizes, evidenceCounts },
  };
}
