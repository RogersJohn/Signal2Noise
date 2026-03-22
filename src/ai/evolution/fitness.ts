import { Genome, FitnessConfig } from './types';
import { GameConfig, GameState } from '../../engine/types';
import { createGame, applyAction, getWinner } from '../../engine/engine';
import { getStrategy } from '../strategies';
import { createSocialAgent } from '../social/socialAgent';
import { Signal } from '../social/types';
import { CONSPIRACIES } from '../../data/conspiracies';
import { EVIDENCE_CARDS } from '../../data/evidence';

/**
 * Run a mixed game: genome agent (social) vs plain base strategy opponents.
 * Opponents use base strategies directly with no social layer.
 */
function runMixedGame(genome: Genome, opponentBases: string[], genomeBases: string): {
  won: boolean; score: number; honesty: number; trust: number;
} {
  const playerCount = 1 + opponentBases.length;
  const names = ['Evolved', ...opponentBases.map((n, i) => `${n}_${i}`)];
  const config: GameConfig = {
    playerNames: names,
    humanPlayerIds: [],
    aiStrategies: [genomeBases, ...opponentBases],
  };

  let state = createGame(config, CONSPIRACIES, EVIDENCE_CARDS);

  // Only the genome agent (index 0) has social layer
  const socialAgent = createSocialAgent(getStrategy(genomeBases), genome.genes);
  const baseStrategies = opponentBases.map(n => getStrategy(n));

  let totalSignals = 0;
  let honestSignals = 0;

  for (let round = 0; round < 6; round++) {
    // COMMIT
    for (const playerId of state.turnOrder) {
      const idx = state.players.findIndex(p => p.id === playerId);
      if (idx === 0) {
        // Genome agent
        const actions = socialAgent.decideCommit(state, playerId);
        for (const a of actions) {
          try { state = applyAction(state, a); } catch { /* skip */ }
        }
      } else {
        // Base strategy opponent
        const actions = baseStrategies[idx - 1].decideCommit(state, playerId);
        for (const a of actions) {
          try { state = applyAction(state, a); } catch { /* skip */ }
        }
      }
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId });
    }

    // Generate signal for genome agent only
    const genomeSignal = socialAgent.generateSignalAction(state, state.players[0].id);
    const signals: Signal[] = [genomeSignal];
    totalSignals++;
    if (genomeSignal.truthful) honestSignals++;

    // BROADCAST
    for (let i = 0; i < state.players.length; i++) {
      const pid = state.turnOrder[state.currentPlayerIndex];
      const idx = state.players.findIndex(p => p.id === pid);
      if (idx === 0) {
        const action = socialAgent.decideBroadcast(state, pid, signals);
        state = applyAction(state, action);
      } else {
        const action = baseStrategies[idx - 1].decideBroadcast(state, pid);
        state = applyAction(state, action);
      }
    }

    // RESOLVE
    state = applyAction(state, { type: 'RESOLVE' });

    // onRoundEnd for genome agent
    socialAgent.onRoundEnd(state, state.players[0].id, signals);

    // NEXT_ROUND
    state = applyAction(state, { type: 'NEXT_ROUND' });
    if (state.phase === 'GAME_OVER') break;
  }

  const winner = getWinner(state);
  const won = winner?.id === state.players[0].id;
  const score = state.players[0].score;
  const honesty = totalSignals > 0 ? honestSignals / totalSignals : 1;

  // Get end trust
  let avgTrust = 0;
  if (socialAgent.socialState?.trustScores) {
    let total = 0;
    let count = 0;
    for (const [, entry] of socialAgent.socialState.trustScores) {
      total += entry.score;
      count++;
    }
    avgTrust = count > 0 ? total / count : 0;
  }

  return { won, score, honesty, trust: avgTrust };
}

export function evaluateGenome(genome: Genome, config: FitnessConfig): number {
  let totalWins = 0;
  let totalScore = 0;
  let totalGames = 0;
  let totalHonesty = 0;
  let totalTrust = 0;

  for (let i = 0; i < config.gamesPerEvaluation; i++) {
    const opponents: string[] = [];
    for (let j = 0; j < 3; j++) {
      opponents.push(config.opponentPool[Math.floor(Math.random() * config.opponentPool.length)]);
    }
    const genomeBases = config.opponentPool[Math.floor(Math.random() * config.opponentPool.length)];

    const result = runMixedGame(genome, opponents, genomeBases);
    totalGames++;
    if (result.won) totalWins++;
    totalScore += result.score;
    totalHonesty += result.honesty;
    totalTrust += result.trust;
  }

  const winRate = totalWins / totalGames;
  const normalizedScore = (totalScore / totalGames) / 30;
  const avgHonesty = totalHonesty / totalGames;
  const avgTrust = totalTrust / totalGames;

  return (
    winRate * config.weights.winRate +
    normalizedScore * config.weights.avgScore +
    (1 - avgHonesty) * config.weights.signalFidelityPenalty +
    avgTrust * config.weights.trustAtEnd
  );
}
