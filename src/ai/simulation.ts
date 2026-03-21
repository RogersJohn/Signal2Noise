import { GameState, GameAction, GameConfig } from '../engine/types';
import { createGame, applyAction, getWinner } from '../engine/engine';
import { getStrategy, STRATEGY_NAMES } from './strategies';
import { CONSPIRACIES } from '../data/conspiracies';
import { EVIDENCE_CARDS } from '../data/evidence';

// ── Types ──

export interface SimulationConfig {
  games: number;
  matchup: string[];
  seed?: number;
}

export interface GameResult {
  gameIndex: number;
  winner: string;
  winnerStrategy: string;
  finalScores: Record<string, number>;
  finalCredibility: Record<string, number>;
  consensusCount: number;
  totalBroadcasted: number;
  pointSources: {
    evidence: number;
    bandwagon: number;
    firstMover: number;
    consensusBonus: number;
  };
}

export interface AggregateStats {
  consensusRate: number;
  closeGameRate: number;
  winRateByStrategy: Record<string, number>;
  avgScoreByStrategy: Record<string, number>;
  pointSourceBreakdown: {
    evidence: number;
    bandwagon: number;
    firstMover: number;
    consensusBonus: number;
  };
}

export interface SimulationResult {
  config: SimulationConfig;
  aggregate: AggregateStats;
  games: GameResult[];
}

// ── Simulation Runner ──

function runSingleGame(matchup: string[], gameIndex: number): GameResult {
  const config: GameConfig = {
    playerNames: matchup.map((s, i) => `${s}_${i}`),
    humanPlayerIds: [],
    aiStrategies: matchup,
  };

  let state = createGame(config, CONSPIRACIES, EVIDENCE_CARDS);
  let totalConsensus = 0;
  let totalBroadcasted = 0;
  let pointSources = { evidence: 0, bandwagon: 0, firstMover: 0, consensusBonus: 0 };

  for (let round = 0; round < 6; round++) {
    // COMMIT phase
    for (const playerId of state.turnOrder) {
      const strategy = getStrategy(matchup[state.players.findIndex(p => p.id === playerId)]);
      const commitActions = strategy.decideCommit(state, playerId);
      for (const action of commitActions) {
        try {
          state = applyAction(state, action);
        } catch {
          // Skip invalid assignments
        }
      }
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId });
    }

    // BROADCAST phase
    for (let i = 0; i < state.players.length; i++) {
      const playerId = state.turnOrder[state.currentPlayerIndex];
      const strategy = getStrategy(matchup[state.players.findIndex(p => p.id === playerId)]);
      const action = strategy.decideBroadcast(state, playerId);
      state = applyAction(state, action);

      if (action.type === 'BROADCAST') totalBroadcasted++;
    }

    // RESOLVE
    const preScores = state.players.map(p => p.score);
    state = applyAction(state, { type: 'RESOLVE' });

    // Track point sources from results
    for (const result of state.roundResults) {
      if (result.consensusReached) totalConsensus++;
      for (const pr of result.playerResults) {
        if (pr.onMajority) {
          if (pr.hasEvidence) {
            pointSources.evidence += 3;
            if (pr.hasSpecificEvidence) pointSources.evidence += 1;
          } else {
            pointSources.bandwagon += 2;
          }
          if (pr.isFirstMover) pointSources.firstMover += 1;
          const consensusBonus = Math.max(0, result.majorityCount - result.threshold);
          pointSources.consensusBonus += consensusBonus;
        }
      }
    }

    // NEXT_ROUND
    state = applyAction(state, { type: 'NEXT_ROUND' });
    if (state.phase === 'GAME_OVER') break;
  }

  const winner = getWinner(state);
  const winnerIdx = state.players.findIndex(p => p.id === winner?.id);

  const finalScores: Record<string, number> = {};
  const finalCredibility: Record<string, number> = {};
  state.players.forEach((p, i) => {
    finalScores[matchup[i]] = p.score;
    finalCredibility[matchup[i]] = p.credibility;
  });

  return {
    gameIndex,
    winner: winner?.name ?? 'none',
    winnerStrategy: winnerIdx >= 0 ? matchup[winnerIdx] : 'none',
    finalScores,
    finalCredibility,
    consensusCount: totalConsensus,
    totalBroadcasted,
    pointSources,
  };
}

export function runSimulation(config: SimulationConfig): SimulationResult {
  const games: GameResult[] = [];

  for (let i = 0; i < config.games; i++) {
    games.push(runSingleGame(config.matchup, i));
  }

  // Aggregate stats
  const totalGames = games.length;
  const totalConspiraciesPerGame = 5 * 6; // 5 active × 6 rounds max
  const totalPossibleConsensus = totalGames * totalConspiraciesPerGame;

  const totalConsensus = games.reduce((sum, g) => sum + g.consensusCount, 0);
  const consensusRate = totalConsensus / (totalGames * 6); // per round average

  // Close game rate: top 2 players within 2 points
  const closeGames = games.filter(g => {
    const scores = Object.values(g.finalScores).sort((a, b) => b - a);
    return scores.length >= 2 && scores[0] - scores[1] <= 2;
  }).length;
  const closeGameRate = closeGames / totalGames;

  // Win rate by strategy
  const winCounts: Record<string, number> = {};
  const scoreSums: Record<string, number> = {};
  const scoreCounts: Record<string, number> = {};

  for (const name of STRATEGY_NAMES) {
    winCounts[name] = 0;
    scoreSums[name] = 0;
    scoreCounts[name] = 0;
  }

  for (const game of games) {
    winCounts[game.winnerStrategy] = (winCounts[game.winnerStrategy] || 0) + 1;
    for (const [strategy, score] of Object.entries(game.finalScores)) {
      scoreSums[strategy] = (scoreSums[strategy] || 0) + score;
      scoreCounts[strategy] = (scoreCounts[strategy] || 0) + 1;
    }
  }

  const winRateByStrategy: Record<string, number> = {};
  const avgScoreByStrategy: Record<string, number> = {};

  for (const name of config.matchup) {
    winRateByStrategy[name] = (winCounts[name] || 0) / totalGames;
    avgScoreByStrategy[name] = scoreCounts[name] ? scoreSums[name] / scoreCounts[name] : 0;
  }

  // Point source breakdown
  const totalPoints = games.reduce((sum, g) => {
    const { evidence, bandwagon, firstMover, consensusBonus } = g.pointSources;
    return sum + evidence + bandwagon + firstMover + consensusBonus;
  }, 0);

  const totalEvidence = games.reduce((s, g) => s + g.pointSources.evidence, 0);
  const totalBandwagon = games.reduce((s, g) => s + g.pointSources.bandwagon, 0);
  const totalFirstMover = games.reduce((s, g) => s + g.pointSources.firstMover, 0);
  const totalConsensusBonus = games.reduce((s, g) => s + g.pointSources.consensusBonus, 0);

  const pointSourceBreakdown = totalPoints > 0
    ? {
        evidence: totalEvidence / totalPoints,
        bandwagon: totalBandwagon / totalPoints,
        firstMover: totalFirstMover / totalPoints,
        consensusBonus: totalConsensusBonus / totalPoints,
      }
    : { evidence: 0, bandwagon: 0, firstMover: 0, consensusBonus: 0 };

  return {
    config,
    aggregate: {
      consensusRate: totalConsensus / (totalGames * 6),
      closeGameRate,
      winRateByStrategy,
      avgScoreByStrategy,
      pointSourceBreakdown,
    },
    games,
  };
}
