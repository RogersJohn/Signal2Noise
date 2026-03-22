import { Genome } from './types';
import { SocialPersonality } from '../social/types';

const GENE_RANGES: Record<keyof Omit<SocialPersonality, 'name'>, [number, number]> = {
  baseDeceptionRate: [0, 1],
  signalInfluence: [0, 1],
  initialTrust: [-1, 1],
  trustRecoveryRate: [0, 0.3],
  betrayalMemory: [1, 6],
  deceptionDecayPerCatch: [0, 0.2],
  desperationThreshold: [2, 8],
  desperationBoost: [0, 0.4],
  retaliationRate: [0, 1],
  loyaltyRate: [0, 1],
  opportunismRate: [0, 1],
  betrayalPointThreshold: [1, 6],
};

const GENE_KEYS = Object.keys(GENE_RANGES) as Array<keyof Omit<SocialPersonality, 'name'>>;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function gaussianNoise(stddev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  return stddev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export function randomGenome(generation: number): Genome {
  const genes: Record<string, number> = {};
  for (const key of GENE_KEYS) {
    const [min, max] = GENE_RANGES[key];
    genes[key] = randomInRange(min, max);
  }

  return {
    id: `gen${generation}_${Math.random().toString(36).slice(2, 8)}`,
    genes: { name: 'Evolved', ...genes } as SocialPersonality,
    fitness: 0,
    generation,
  };
}

export function crossover(parent1: Genome, parent2: Genome, generation: number): Genome {
  const genes: Record<string, number> = {};
  for (const key of GENE_KEYS) {
    genes[key] = Math.random() < 0.5
      ? (parent1.genes as unknown as Record<string, number>)[key]
      : (parent2.genes as unknown as Record<string, number>)[key];
  }

  return {
    id: `gen${generation}_${Math.random().toString(36).slice(2, 8)}`,
    genes: { name: 'Evolved', ...genes } as SocialPersonality,
    fitness: 0,
    generation,
  };
}

export function mutate(genome: Genome, mutationRate: number, mutationStrength: number): Genome {
  const genes: Record<string, number> = {};
  for (const key of GENE_KEYS) {
    const value = (genome.genes as unknown as Record<string, number>)[key];
    if (Math.random() < mutationRate) {
      const [min, max] = GENE_RANGES[key];
      const range = max - min;
      const noise = gaussianNoise(mutationStrength * range);
      genes[key] = clamp(value + noise, min, max);
    } else {
      genes[key] = value;
    }
  }

  return {
    ...genome,
    genes: { name: 'Evolved', ...genes } as SocialPersonality,
  };
}

export function computeDiversity(population: Genome[]): number {
  if (population.length === 0) return 0;

  let totalVariance = 0;
  for (const key of GENE_KEYS) {
    const values = population.map(g => (g.genes as unknown as Record<string, number>)[key]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
    totalVariance += Math.sqrt(variance);
  }

  return totalVariance / GENE_KEYS.length;
}

export function isValidGenome(genome: Genome): boolean {
  for (const key of GENE_KEYS) {
    const value = (genome.genes as unknown as Record<string, number>)[key];
    const [min, max] = GENE_RANGES[key];
    if (value < min || value > max) return false;
  }
  return true;
}

export { GENE_KEYS, GENE_RANGES };
