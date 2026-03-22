import { GameState, GameConfig } from '../engine/types';
import { createGame, applyAction, getWinner } from '../engine/engine';
import { getStrategy, STRATEGY_NAMES } from './strategies';
import { createSocialAgent, SocialAIStrategy } from './social/socialAgent';
import { getSocialPersonality } from './social/personalities';
import { SocialPersonality, Signal, SocialMetrics } from './social/types';
import { CONSPIRACIES } from '../data/conspiracies';
import { EVIDENCE_CARDS } from '../data/evidence';
import { GameResult } from './simulation';

export interface SocialGameResult extends GameResult {
  socialMetrics: SocialMetrics;
}

export interface SocialSimulationConfig {
  games: number;
  socialMatchup: Array<{ baseName: string; personalityName: string }>;
}

export interface SocialSimulationResult {
  config: SocialSimulationConfig;
  games: SocialGameResult[];
  aggregate: {
    avgSignalHonesty: number;
    avgBetrayalRate: number;
    avgEndTrust: number;
    winRateByPersonality: Record<string, number>;
    avgScoreByPersonality: Record<string, number>;
  };
}

export function runSocialGame(
  matchup: Array<{ baseName: string; personality: SocialPersonality }>,
  gameIndex: number
): SocialGameResult {
  const names = matchup.map((m, i) => `${m.personality.name}_${i}`);
  const config: GameConfig = {
    playerNames: names,
    humanPlayerIds: [],
    aiStrategies: matchup.map(m => m.baseName),
  };

  let state = createGame(config, CONSPIRACIES, EVIDENCE_CARDS);

  // Create social agents
  const agents: SocialAIStrategy[] = matchup.map((m, i) =>
    createSocialAgent(getStrategy(m.baseName), m.personality)
  );

  let totalSignals = 0;
  let honestSignals = 0;
  let totalBetrayals = 0;
  const betrayalsByRound: number[] = [];
  let grudgesFormed = 0;
  let retaliationCount = 0;
  let desperationActivations = 0;
  let dishonestSignalsDetected = 0;
  let dishonestSignalsTotal = 0;

  for (let round = 0; round < 6; round++) {
    let roundBetrayals = 0;

    // COMMIT
    for (const playerId of state.turnOrder) {
      const idx = state.players.findIndex(p => p.id === playerId);
      const actions = agents[idx].decideCommit(state, playerId);
      for (const a of actions) {
        try { state = applyAction(state, a); } catch { /* skip */ }
      }
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId });
    }

    // Generate signals
    const signals: Signal[] = [];
    for (let i = 0; i < agents.length; i++) {
      const signal = agents[i].generateSignalAction(state, state.players[i].id);
      signals.push(signal);
      totalSignals++;
      if (signal.truthful) honestSignals++;
    }

    // BROADCAST
    for (let i = 0; i < state.players.length; i++) {
      const pid = state.turnOrder[state.currentPlayerIndex];
      const agentIdx = state.players.findIndex(p => p.id === pid);
      const action = agents[agentIdx].decideBroadcast(state, pid, signals);
      state = applyAction(state, action);

      // Track betrayals (signal said one conspiracy, broadcast on another)
      const playerSignal = signals.find(s => s.senderId === pid);
      if (playerSignal && action.type === 'BROADCAST') {
        const broadcastCid = (action as { conspiracyId: string }).conspiracyId;
        if (broadcastCid !== playerSignal.conspiracyId) {
          roundBetrayals++;
          totalBetrayals++;
        }
        // Track dishonest signal detection
        if (!playerSignal.truthful) {
          dishonestSignalsTotal++;
          // Was it detected? Check if others have low trust for this player
          const otherAgents = agents.filter((_, idx) => state.players[idx].id !== pid);
          const detected = otherAgents.some(a => {
            const trust = a.socialState?.trustScores?.get(pid);
            return trust && trust.score < 0;
          });
          if (detected) dishonestSignalsDetected++;
        }
      }
    }

    betrayalsByRound.push(roundBetrayals);

    // RESOLVE
    state = applyAction(state, { type: 'RESOLVE' });

    // onRoundEnd
    for (let i = 0; i < agents.length; i++) {
      const prevGrudgeCount = agents[i].socialState?.adaptiveState?.grudges?.size ?? 0;
      const prevDesp = agents[i].socialState?.adaptiveState?.currentRiskTolerance ?? 0.5;

      agents[i].onRoundEnd(state, state.players[i].id, signals);

      const newGrudgeCount = agents[i].socialState?.adaptiveState?.grudges?.size ?? 0;
      if (newGrudgeCount > prevGrudgeCount) grudgesFormed += (newGrudgeCount - prevGrudgeCount);

      const newDesp = agents[i].socialState?.adaptiveState?.currentRiskTolerance ?? 0.5;
      if (newDesp > prevDesp + 0.05) desperationActivations++;
    }

    // NEXT_ROUND
    state = applyAction(state, { type: 'NEXT_ROUND' });
    if (state.phase === 'GAME_OVER') break;
  }

  const winner = getWinner(state);
  const winnerIdx = state.players.findIndex(p => p.id === winner?.id);

  // Compute end trust stats
  let totalTrust = 0;
  let trustCount = 0;
  const trustValues: number[] = [];
  for (const agent of agents) {
    if (agent.socialState?.trustScores) {
      for (const [, entry] of agent.socialState.trustScores) {
        totalTrust += entry.score;
        trustValues.push(entry.score);
        trustCount++;
      }
    }
  }

  const avgTrust = trustCount > 0 ? totalTrust / trustCount : 0;
  const trustStddev = trustCount > 0
    ? Math.sqrt(trustValues.reduce((sum, v) => sum + (v - avgTrust) ** 2, 0) / trustCount)
    : 0;

  const finalScores: Record<string, number> = {};
  const finalCredibility: Record<string, number> = {};
  state.players.forEach((p, i) => {
    finalScores[matchup[i].personality.name] = p.score;
    finalCredibility[matchup[i].personality.name] = p.credibility;
  });

  return {
    gameIndex,
    winner: winner?.name ?? 'none',
    winnerStrategy: winnerIdx >= 0 ? matchup[winnerIdx].personality.name : 'none',
    finalScores,
    finalCredibility,
    consensusCount: 0,
    totalBroadcasted: 0,
    pointSources: { evidence: 0, bandwagon: 0, firstMover: 0, consensusBonus: 0 },
    socialMetrics: {
      signalHonestyRate: totalSignals > 0 ? honestSignals / totalSignals : 1,
      bluffDetectionRate: dishonestSignalsTotal > 0 ? dishonestSignalsDetected / dishonestSignalsTotal : 0,
      betrayalCount: totalBetrayals,
      avgTrustAtEnd: avgTrust,
      trustPolarization: trustStddev,
      betrayalsByRound,
      grudgesFormed,
      retaliationCount,
      desperationActivations,
    },
  };
}

export function runSocialSimulation(config: SocialSimulationConfig): SocialSimulationResult {
  const games: SocialGameResult[] = [];

  for (let i = 0; i < config.games; i++) {
    const matchup = config.socialMatchup.map(m => ({
      baseName: m.baseName,
      personality: getSocialPersonality(m.personalityName),
    }));
    games.push(runSocialGame(matchup, i));
  }

  // Aggregate
  const personalityNames = [...new Set(config.socialMatchup.map(m => m.personalityName))];
  const winCounts: Record<string, number> = {};
  const scoreSums: Record<string, number> = {};
  const scoreCounts: Record<string, number> = {};

  for (const name of personalityNames) {
    winCounts[name] = 0;
    scoreSums[name] = 0;
    scoreCounts[name] = 0;
  }

  for (const game of games) {
    if (winCounts[game.winnerStrategy] !== undefined) {
      winCounts[game.winnerStrategy]++;
    }
    for (const [name, score] of Object.entries(game.finalScores)) {
      if (scoreSums[name] !== undefined) {
        scoreSums[name] += score;
        scoreCounts[name]++;
      }
    }
  }

  const winRateByPersonality: Record<string, number> = {};
  const avgScoreByPersonality: Record<string, number> = {};
  for (const name of personalityNames) {
    winRateByPersonality[name] = winCounts[name] / config.games;
    avgScoreByPersonality[name] = scoreCounts[name] > 0 ? scoreSums[name] / scoreCounts[name] : 0;
  }

  return {
    config,
    games,
    aggregate: {
      avgSignalHonesty: games.reduce((s, g) => s + g.socialMetrics.signalHonestyRate, 0) / games.length,
      avgBetrayalRate: games.reduce((s, g) => s + g.socialMetrics.betrayalCount, 0) / (games.length * 6 * config.socialMatchup.length),
      avgEndTrust: games.reduce((s, g) => s + g.socialMetrics.avgTrustAtEnd, 0) / games.length,
      winRateByPersonality,
      avgScoreByPersonality,
    },
  };
}
