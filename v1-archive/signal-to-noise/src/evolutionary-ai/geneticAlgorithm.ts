/**
 * Genetic Algorithm: Evolve optimal strategies through natural selection
 *
 * Population of strategy genomes compete in games, and the fittest
 * strategies breed to create the next generation.
 */

import { StrategyGenome, createRandomGenome, crossover, mutate, genomeSimilarity, describeGenome } from './strategyGenome';
import { simulateGame } from '../gameSimulation';
import { genomeToAIPersonality } from './evolutionaryAgent';

export interface Individual {
  genome: StrategyGenome;
  id: string;
  fitness: number; // Win rate + bonus metrics
  gamesPlayed: number;
  wins: number;
  totalAudience: number;
  totalCredibility: number;
  bankruptcies: number;
  avgRank: number;
}

export interface Generation {
  generationNumber: number;
  population: Individual[];
  bestIndividual: Individual;
  avgFitness: number;
  diversityScore: number; // How different are the strategies?
  elapsedTime: number;
}

export interface EvolutionConfig {
  populationSize: number;
  generations: number;
  gamesPerIndividual: number; // Games to evaluate fitness
  playerCountsToTest: number[]; // [3, 4, 5] etc
  mutationRate: number;
  mutationStrength: number;
  eliteCount: number; // Top N individuals automatically survive
  tournamentSize: number; // For tournament selection
}

export const DEFAULT_CONFIG: EvolutionConfig = {
  populationSize: 50,
  generations: 20,
  gamesPerIndividual: 30, // 10 games each at 3p, 4p, 5p
  playerCountsToTest: [3, 4, 5],
  mutationRate: 0.15,
  mutationStrength: 0.2,
  eliteCount: 5,
  tournamentSize: 5,
};

export class GeneticAlgorithm {
  config: EvolutionConfig;
  generations: Generation[] = [];
  currentGeneration: number = 0;

  constructor(config: Partial<EvolutionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize population with random genomes
   */
  initializePopulation(): Individual[] {
    const population: Individual[] = [];

    for (let i = 0; i < this.config.populationSize; i++) {
      population.push({
        genome: createRandomGenome(),
        id: `gen0-${i}`,
        fitness: 0,
        gamesPlayed: 0,
        wins: 0,
        totalAudience: 0,
        totalCredibility: 0,
        bankruptcies: 0,
        avgRank: 0,
      });
    }

    return population;
  }

  /**
   * Evaluate fitness of entire population by simulating games
   */
  evaluatePopulation(population: Individual[]): Individual[] {
    console.log(`\n=== Evaluating Generation ${this.currentGeneration} ===`);
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
          // Create random opponents from population (excluding self)
          const opponents = this.selectRandomOpponents(population, individual, playerCount - 1);

          // Create AI personalities
          const allPlayers = [individual, ...opponents];
          const shuffledPlayers = this.shuffleArray(allPlayers); // Random turn order

          const aiPersonalities = shuffledPlayers.map(ind =>
            genomeToAIPersonality(ind.genome, ind.id)
          );

          // Simulate game
          const result = simulateGame(aiPersonalities);

          // Find where our individual placed
          // NOTE: Game uses hardcoded player names (Alice, Bob, Carol, Dave, Eve)
          const playerIndex = shuffledPlayers.findIndex(p => p.id === individual.id);
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

  /**
   * Select random opponents from population (excluding the individual being tested)
   */
  selectRandomOpponents(population: Individual[], exclude: Individual, count: number): Individual[] {
    const available = population.filter(ind => ind.id !== exclude.id);
    const selected: Individual[] = [];

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * available.length);
      selected.push(available[randomIndex]);
    }

    return selected;
  }

  /**
   * Tournament selection: pick best from random subset
   */
  tournamentSelection(population: Individual[]): Individual {
    const tournament: Individual[] = [];

    for (let i = 0; i < this.config.tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * population.length);
      tournament.push(population[randomIndex]);
    }

    // Return best from tournament
    tournament.sort((a, b) => b.fitness - a.fitness);
    return tournament[0];
  }

  /**
   * Create next generation through selection and breeding
   */
  createNextGeneration(currentPopulation: Individual[]): Individual[] {
    const nextGeneration: Individual[] = [];

    // Elitism: keep top performers
    for (let i = 0; i < this.config.eliteCount; i++) {
      const elite = { ...currentPopulation[i] };
      elite.id = `gen${this.currentGeneration + 1}-elite${i}`;
      nextGeneration.push(elite);
    }

    // Fill rest of population through breeding
    let childId = 0;
    while (nextGeneration.length < this.config.populationSize) {
      // Select two parents via tournament
      const parent1 = this.tournamentSelection(currentPopulation);
      const parent2 = this.tournamentSelection(currentPopulation);

      // Crossover
      let childGenome = crossover(parent1.genome, parent2.genome);

      // Mutate
      childGenome = mutate(childGenome, this.config.mutationRate, this.config.mutationStrength);

      // Create new individual
      nextGeneration.push({
        genome: childGenome,
        id: `gen${this.currentGeneration + 1}-${childId++}`,
        fitness: 0,
        gamesPlayed: 0,
        wins: 0,
        totalAudience: 0,
        totalCredibility: 0,
        bankruptcies: 0,
        avgRank: 0,
      });
    }

    return nextGeneration;
  }

  /**
   * Calculate population diversity (how different are strategies?)
   */
  calculateDiversity(population: Individual[]): number {
    if (population.length < 2) return 0;

    let totalSimilarity = 0;
    let comparisons = 0;

    // Compare each pair
    for (let i = 0; i < population.length; i++) {
      for (let j = i + 1; j < Math.min(population.length, i + 10); j++) {
        // Sample 10 per individual to save time
        const similarity = genomeSimilarity(population[i].genome, population[j].genome);
        totalSimilarity += similarity;
        comparisons++;
      }
    }

    const avgSimilarity = totalSimilarity / comparisons;
    return 1 - avgSimilarity; // Diversity = 1 - similarity
  }

  /**
   * Run the genetic algorithm for configured number of generations
   */
  async evolve(): Promise<Generation[]> {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║        GENETIC ALGORITHM - STRATEGY EVOLUTION          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`Configuration:`);
    console.log(`  Population Size: ${this.config.populationSize}`);
    console.log(`  Generations: ${this.config.generations}`);
    console.log(`  Games per Individual: ${this.config.gamesPerIndividual}`);
    console.log(`  Player Counts: ${this.config.playerCountsToTest.join(', ')}`);
    console.log(`  Mutation Rate: ${this.config.mutationRate}`);
    console.log(`  Elite Count: ${this.config.eliteCount}`);
    console.log(`  Tournament Size: ${this.config.tournamentSize}\n`);

    const startTime = Date.now();

    // Initialize population
    let population = this.initializePopulation();

    // Evolve through generations
    for (let gen = 0; gen < this.config.generations; gen++) {
      this.currentGeneration = gen;
      const genStartTime = Date.now();

      // Evaluate fitness
      population = this.evaluatePopulation(population);

      // Calculate stats
      const bestIndividual = population[0];
      const avgFitness = population.reduce((sum, ind) => sum + ind.fitness, 0) / population.length;
      const diversityScore = this.calculateDiversity(population);

      // Store generation
      const generation: Generation = {
        generationNumber: gen,
        population: [...population],
        bestIndividual: { ...bestIndividual },
        avgFitness,
        diversityScore,
        elapsedTime: Date.now() - genStartTime,
      };
      this.generations.push(generation);

      // Report progress
      console.log(`\n┌─── Generation ${gen} Results ───┐`);
      console.log(`│ Best Fitness: ${bestIndividual.fitness.toFixed(2)}`);
      console.log(`│ Best Win Rate: ${((bestIndividual.wins / bestIndividual.gamesPlayed) * 100).toFixed(1)}%`);
      console.log(`│ Best Avg Rank: ${bestIndividual.avgRank.toFixed(2)}`);
      console.log(`│ Strategy: ${describeGenome(bestIndividual.genome)}`);
      console.log(`│ Avg Fitness: ${avgFitness.toFixed(2)}`);
      console.log(`│ Diversity: ${(diversityScore * 100).toFixed(1)}%`);
      console.log(`│ Time: ${(generation.elapsedTime / 1000).toFixed(1)}s`);
      console.log(`└────────────────────────────────┘`);

      // Create next generation (unless this is the last)
      if (gen < this.config.generations - 1) {
        population = this.createNextGeneration(population);
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n✅ Evolution Complete! Total time: ${(totalTime / 1000 / 60).toFixed(1)} minutes`);

    return this.generations;
  }

  /**
   * Utility: shuffle array
   */
  protected shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
