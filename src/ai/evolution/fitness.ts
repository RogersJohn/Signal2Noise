import { Genome, FitnessConfig } from './types';
import { runSocialGame } from '../socialSimulation';
import { STRATEGY_NAMES, getStrategy } from '../strategies';

export function evaluateGenome(genome: Genome, config: FitnessConfig): number {
  let totalWins = 0;
  let totalScore = 0;
  let totalGames = 0;
  let totalHonesty = 0;
  let totalTrust = 0;

  for (let i = 0; i < config.gamesPerEvaluation; i++) {
    // Build matchup: genome agent + 3 random base opponents
    const opponents = [];
    for (let j = 0; j < 3; j++) {
      const baseName = config.opponentPool[Math.floor(Math.random() * config.opponentPool.length)];
      opponents.push(baseName);
    }

    // Genome agent uses a random base strategy as foundation
    const genomeBases = config.opponentPool[Math.floor(Math.random() * config.opponentPool.length)];

    const matchup = [
      { baseName: genomeBases, personality: genome.genes },
      ...opponents.map(name => ({
        baseName: name,
        personality: {
          ...genome.genes,
          name: 'Opponent',
          baseDeceptionRate: 0.1,
          signalInfluence: 0.3,
          initialTrust: 0.2,
          loyaltyRate: 0.4,
          opportunismRate: 0.3,
          retaliationRate: 0.2,
        },
      })),
    ];

    const result = runSocialGame(matchup, i);
    totalGames++;

    // Check if genome agent won
    if (result.winnerStrategy === genome.genes.name) {
      totalWins++;
    }

    // Track genome agent's score
    const genomeScore = result.finalScores[genome.genes.name] ?? 0;
    totalScore += genomeScore;
    totalHonesty += result.socialMetrics.signalHonestyRate;
    totalTrust += result.socialMetrics.avgTrustAtEnd;
  }

  const winRate = totalWins / totalGames;
  const avgScore = totalScore / totalGames;
  const maxPossibleScore = 30; // rough max for normalization
  const normalizedScore = avgScore / maxPossibleScore;
  const avgHonesty = totalHonesty / totalGames;
  const avgTrust = totalTrust / totalGames;

  // Fitness calculation
  const fitness =
    winRate * config.weights.winRate +
    normalizedScore * config.weights.avgScore +
    (1 - avgHonesty) * config.weights.signalFidelityPenalty + // penalize pure lying
    avgTrust * config.weights.trustAtEnd;

  return fitness;
}
