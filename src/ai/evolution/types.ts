import { SocialPersonality } from '../social/types';

export interface Genome {
  id: string;
  genes: SocialPersonality;
  fitness: number;
  generation: number;
}

export interface EvolutionConfig {
  populationSize: number;
  generations: number;
  eliteCount: number;
  tournamentSize: number;
  mutationRate: number;
  mutationStrength: number;
  fitnessConfig: FitnessConfig;
}

export interface FitnessConfig {
  gamesPerEvaluation: number;
  opponentPool: string[];
  weights: {
    winRate: number;
    avgScore: number;
    signalFidelityPenalty: number;
    trustAtEnd: number;
  };
}

export interface GenerationResult {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  bestGenome: Genome;
  diversityMetric: number;
}

export interface EvolutionResult {
  config: EvolutionConfig;
  generations: GenerationResult[];
  finalPopulation: Genome[];
  convergenceRound: number | null;
}
