import { runEvolution } from '../evolution';
import { EvolutionConfig } from '../types';
import { isValidGenome } from '../genome';

describe('evolution', () => {
  const smallConfig: EvolutionConfig = {
    populationSize: 8,
    generations: 3,
    eliteCount: 2,
    tournamentSize: 2,
    mutationRate: 0.15,
    mutationStrength: 0.1,
    fitnessConfig: {
      gamesPerEvaluation: 5,
      opponentPool: ['Evidence-Only', 'Aggressive', 'Follower'],
      weights: {
        winRate: 1.0,
        avgScore: 0.3,
        signalFidelityPenalty: -0.1,
        trustAtEnd: 0.1,
      },
    },
  };

  it('small evolution run completes without errors', () => {
    const result = runEvolution(smallConfig);
    expect(result.generations).toHaveLength(3);
    expect(result.finalPopulation.length).toBe(smallConfig.populationSize);
  }, 60000);

  it('final best genome has valid parameter ranges', () => {
    const result = runEvolution(smallConfig);
    const best = result.finalPopulation[0];
    expect(isValidGenome(best)).toBe(true);
    expect(best.fitness).toBeGreaterThanOrEqual(0);
  }, 60000);

  it('all generations have non-negative best fitness', () => {
    const result = runEvolution(smallConfig);
    for (const gen of result.generations) {
      expect(gen.bestFitness).toBeGreaterThanOrEqual(-0.5);
      expect(gen.avgFitness).toBeDefined();
    }
  }, 60000);

  it('population maintains correct size', () => {
    const result = runEvolution(smallConfig);
    expect(result.finalPopulation).toHaveLength(smallConfig.populationSize);
  }, 60000);
});
