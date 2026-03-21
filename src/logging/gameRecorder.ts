import { GameState, GameAction } from '../engine/types';
import { createStructuredLog, StructuredLog } from './logger';

export interface GameStateSummary {
  scores: Record<string, number>;
  credibility: Record<string, number>;
  round: number;
  phase: string;
}

export interface GameTranscript {
  id: string;
  timestamp: string;
  config: { playerCount: number; strategies: string[] };
  actions: Array<{
    timestamp: number;
    action: GameAction;
    stateAfter: GameStateSummary;
  }>;
  result: { winner: string; finalScores: Record<string, number> };
}

export class GameRecorder {
  private transcript: GameTranscript;

  constructor(state: GameState) {
    const strategies = state.players.map(p => p.strategyName ?? 'human');
    this.transcript = {
      id: `game_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      config: {
        playerCount: state.players.length,
        strategies,
      },
      actions: [],
      result: { winner: '', finalScores: {} },
    };
  }

  record(action: GameAction, stateAfter: GameState): void {
    const summary: GameStateSummary = {
      scores: {},
      credibility: {},
      round: stateAfter.round,
      phase: stateAfter.phase,
    };

    stateAfter.players.forEach(p => {
      summary.scores[p.id] = p.score;
      summary.credibility[p.id] = p.credibility;
    });

    this.transcript.actions.push({
      timestamp: Date.now(),
      action,
      stateAfter: summary,
    });
  }

  finalize(state: GameState, winnerId: string): GameTranscript {
    const finalScores: Record<string, number> = {};
    state.players.forEach(p => {
      finalScores[p.id] = p.score;
    });

    this.transcript.result = {
      winner: winnerId,
      finalScores,
    };

    return this.transcript;
  }

  getTranscript(): GameTranscript {
    return this.transcript;
  }
}
