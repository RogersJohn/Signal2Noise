/**
 * Genetic Algorithm With Fixed Opponent
 *
 * Extends the base genetic algorithm to include a fixed hand-crafted AI personality
 * in every game, allowing evolved strategies to be tested against known baselines.
 */

import { GeneticAlgorithm, Individual, EvolutionConfig } from './geneticAlgorithm';
import { simulateGame } from '../gameSimulation';
import { genomeToAIPersonality } from './evolutionaryAgent';
import { AI_PERSONALITIES, AIPersonality } from '../aiPersonalities';

export interface OpponentConfig extends EvolutionConfig {
  fixedOpponent: keyof typeof AI_PERSONALITIES; // Which personality to include
  opponentFrequency?: number; // 0-1: How often to include opponent (default: 1.0 = always)
}

export class GeneticAlgorithmWithOpponent extends GeneticAlgorithm {
  opponentConfig: OpponentConfig;
  opponentPersonality: AIPersonality;

  constructor(config: Partial<OpponentConfig> = {}) {
    super(config);
    this.opponentConfig = { ...this.config, fixedOpponent: 'RECKLESS_GAMBLER', opponentFrequency: 1.0, ...config } as OpponentConfig;
    this.opponentPersonality = AI_PERSONALITIES[this.opponentConfig.fixedOpponent];
  }

  /**
   * Override evaluatePopulation to include fixed opponent
   */
  evaluatePopulation(population: Individual[]): Individual[] {
    console.log(`\n=== Evaluating Generation ${this.currentGeneration} (with ${this.opponentPersonality.name}) ===`);
    console.log(`Population size: ${population.length}`);
    console.log(`Games per individual: ${this.config.gamesPerIndividual}`);

    const gamesPerPlayerCount = Math.floor(
      this.config.gamesPerIndividual / this.config.playerCountsToTest.length
    );

    // Reset fitness for this generation
    population.forEach(individual => {
      individual.fitness = 0;
      individual.gamesPlayed = 0;
      individual.wins = 0;
      individual.totalAudience = 0;
      individual.totalCredibility = 0;
      individual.bankruptcies = 0;
      individual.avgRank = 0;
    });

    // Test each individual
    population.forEach((individual, idx) => {
      if (idx % 10 === 0) {
        console.log(`  Evaluating individual ${idx + 1}/${population.length}...`);
      }

      let totalRank = 0;

      // Test at each player count
      this.config.playerCountsToTest.forEach(playerCount => {
        for (let game = 0; game < gamesPerPlayerCount; game++) {
          // Decide if we include opponent this game
          const includeOpponent = Math.random() < (this.opponentConfig.opponentFrequency || 1.0);

          let allPlayers: (Individual | AIPersonality)[];
          let shuffledPlayers: (Individual | AIPersonality)[];

          if (includeOpponent) {
            // Include fixed opponent + random evolved opponents
            const numEvolvedOpponents = playerCount - 2; // -1 for individual, -1 for fixed opponent
            const evolvedOpponents = this.selectRandomOpponents(population, individual, numEvolvedOpponents);

            allPlayers = [individual, this.opponentPersonality, ...evolvedOpponents];
            shuffledPlayers = this.shuffleArray(allPlayers);
          } else {
            // Normal: only evolved opponents
            const opponents = this.selectRandomOpponents(population, individual, playerCount - 1);
            allPlayers = [individual, ...opponents];
            shuffledPlayers = this.shuffleArray(allPlayers);
          }

          // Create AI personalities
          const aiPersonalities = shuffledPlayers.map(p => {
            if ('genome' in p) {
              // It's an Individual - convert to AI personality
              return genomeToAIPersonality((p as Individual).genome, (p as Individual).id);
            } else {
              // It's already an AIPersonality
              return p as AIPersonality;
            }
          });

          // Simulate game
          const result = simulateGame(aiPersonalities);

          // Find where our individual placed
          const playerIndex = shuffledPlayers.findIndex(p => {
            if ('genome' in p) {
              return (p as Individual).id === individual.id;
            }
            return false;
          });

          const playerNames = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'];
          const playerName = playerNames[playerIndex];
          const finalState = result.finalState.players.find(p => p.name === playerName);

          if (finalState) {
            // Track statistics
            individual.gamesPlayed++;
            individual.totalAudience += finalState.audience;
            individual.totalCredibility += finalState.credibility;

            // Determine rank (1 = winner, playerCount = loser)
            const sorted = [...result.finalState.players].sort((a, b) => {
              if (b.audience !== a.audience) return b.audience - a.audience;
              return b.credibility - a.credibility;
            });
            const rank = sorted.findIndex(p => p.name === playerName) + 1;
            totalRank += rank;

            if (rank === 1) {
              individual.wins++;
            }

            if (finalState.credibility === 0 || finalState.isBankrupt) {
              individual.bankruptcies++;
            }
          }
        }
      });

      // Calculate fitness (multi-objective) with safeguards
      if (individual.gamesPlayed > 0) {
        individual.avgRank = totalRank / individual.gamesPlayed;

        const winRate = individual.wins / individual.gamesPlayed;
        const avgAudience = individual.totalAudience / individual.gamesPlayed;
        const avgCredibility = individual.totalCredibility / individual.gamesPlayed;
        const bankruptcyRate = individual.bankruptcies / individual.gamesPlayed;
        const avgRank = individual.avgRank;

        // Fitness formula: prioritize win rate, then audience, then survival
        individual.fitness =
          winRate * 100 + // Win rate is most important
          avgAudience * 5 + // Audience points matter
          avgCredibility * 2 + // Staying alive is good
          (1 - bankruptcyRate) * 10 + // Avoid bankruptcy
          (avgRank > 0 ? (1 / avgRank) * 20 : 0); // Better average placement is good
      } else {
        // No games played - assign minimum fitness
        individual.avgRank = 999;
        individual.fitness = 0;
      }
    });

    // Sort by fitness
    population.sort((a, b) => b.fitness - a.fitness);

    return population;
  }
}
