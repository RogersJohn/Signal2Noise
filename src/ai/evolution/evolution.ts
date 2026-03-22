import { EvolutionConfig, EvolutionResult, GenerationResult, Genome } from './types';
import { randomGenome, crossover, mutate, computeDiversity } from './genome';
import { evaluateGenome } from './fitness';

function tournamentSelect(population: Genome[], tournamentSize: number): Genome {
  let best: Genome | null = null;
  for (let i = 0; i < tournamentSize; i++) {
    const candidate = population[Math.floor(Math.random() * population.length)];
    if (!best || candidate.fitness > best.fitness) {
      best = candidate;
    }
  }
  return best!;
}

export function runEvolution(config: EvolutionConfig): EvolutionResult {
  // Initialize population
  let population = Array.from({ length: config.populationSize }, () =>
    randomGenome(0)
  );

  const generationResults: GenerationResult[] = [];
  let convergenceRound: number | null = null;
  let stableCount = 0;
  let prevBestFitness = -Infinity;

  for (let gen = 0; gen < config.generations; gen++) {
    // Evaluate all genomes
    for (const genome of population) {
      genome.fitness = evaluateGenome(genome, config.fitnessConfig);
    }

    // Sort by fitness (descending)
    population.sort((a, b) => b.fitness - a.fitness);

    const bestFitness = population[0].fitness;
    const avgFitness = population.reduce((sum, g) => sum + g.fitness, 0) / population.length;
    const diversity = computeDiversity(population);

    generationResults.push({
      generation: gen,
      bestFitness,
      avgFitness,
      bestGenome: { ...population[0] },
      diversityMetric: diversity,
    });

    // Check convergence
    if (prevBestFitness > 0) {
      const improvement = (bestFitness - prevBestFitness) / Math.abs(prevBestFitness);
      if (improvement < 0.01) {
        stableCount++;
        if (stableCount >= 5 && convergenceRound === null) {
          convergenceRound = gen;
        }
      } else {
        stableCount = 0;
      }
    }
    prevBestFitness = bestFitness;

    // Create next generation
    const nextPopulation: Genome[] = [];

    // Elite preservation
    for (let i = 0; i < config.eliteCount; i++) {
      nextPopulation.push({ ...population[i], generation: gen + 1 });
    }

    // Fill remaining with tournament selection + crossover + mutation
    while (nextPopulation.length < config.populationSize) {
      const parent1 = tournamentSelect(population, config.tournamentSize);
      const parent2 = tournamentSelect(population, config.tournamentSize);
      let child = crossover(parent1, parent2, gen + 1);
      child = mutate(child, config.mutationRate, config.mutationStrength);
      nextPopulation.push(child);
    }

    population = nextPopulation;
  }

  // Final evaluation
  for (const genome of population) {
    genome.fitness = evaluateGenome(genome, config.fitnessConfig);
  }
  population.sort((a, b) => b.fitness - a.fitness);

  return {
    config,
    generations: generationResults,
    finalPopulation: population,
    convergenceRound,
  };
}
