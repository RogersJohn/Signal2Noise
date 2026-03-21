import { GameState, PlayerState, EvidenceCard, ConspiracyCard, Position } from './types';
import { canSupportConspiracy } from './gameLogic';
import { AIPersonality } from './aiPersonalities';

// ==================== GENOME STRUCTURE ====================

export interface AgentGenome {
  // INVESTIGATE phase genes (evidence assignment strategy)
  evidenceConcentration: number;    // 0=spread thin across many, 1=stack on one conspiracy
  bluffTolerance: number;           // 0=never bluff, 1=bluff frequently
  riskAversion: number;             // 0=aggressive/reckless, 1=cautious/conservative

  // ADVERTISE phase genes (signaling strategy)
  honestyBias: number;              // 0=deceptive signaling, 1=always honest
  bandwagonTendency: number;        // 0=independent, 1=follow others' ads
  advertisingFrequency: number;     // 0=rarely advertise (pass often), 1=always advertise

  // BROADCAST phase genes (claim strategy)
  consensusThreshold: number;       // 0=broadcast alone, 1=only with strong consensus signals
  inconclusiveUsage: number;        // 0=never use INCONCLUSIVE, 1=use often (safe play)
  minorityAggression: number;       // 0=avoid broadcasting when outnumbered, 1=broadcast anyway

  // Strategic meta-genes
  credibilityPriority: number;      // 0=ignore credibility, 1=protect at all costs
  longTermThinking: number;         // 0=maximize immediate points, 1=plan for future rounds

  // NEWLY ADDED: Position preference
  positionBias: number;             // 0=prefer FAKE, 0.5=neutral, 1=prefer REAL
}

// ==================== EVOLVED AGENT ====================

export class EvolvedAgent {
  genome: AgentGenome;
  fitness: number;
  totalGamesPlayed: number;
  totalScore: number;
  generationBorn: number;
  id: string;

  constructor(genome: AgentGenome, generation: number = 0) {
    this.genome = genome;
    this.fitness = 0;
    this.totalGamesPlayed = 0;
    this.totalScore = 0;
    this.generationBorn = generation;
    this.id = Math.random().toString(36).substring(7);
  }

  // Convert genome to AIPersonality-compatible format for use with existing simulation
  toPersonality(): AIPersonality {
    return {
      name: `Evolved Agent Gen${this.generationBorn} (${this.id})`,
      description: `Genome: ${this.getGenomeDescription()}`,

      // Map genome genes to personality traits
      riskTolerance: 1 - this.genome.riskAversion,
      bluffFrequency: this.genome.bluffTolerance,
      evidenceThreshold: this.genome.consensusThreshold * 0.5, // Scale to 0-0.5 range
      skepticism: this.genome.riskAversion,
      specialization: this.genome.evidenceConcentration,

      preferHighTier: this.genome.longTermThinking > 0.5,
      credibilityConscious: this.genome.credibilityPriority > 0.6,
      opportunistic: this.genome.bandwagonTendency > 0.5
    };
  }

  getGenomeDescription(): string {
    const traits: string[] = [];

    if (this.genome.bluffTolerance > 0.7) traits.push('Bluffer');
    else if (this.genome.bluffTolerance < 0.3) traits.push('Honest');

    if (this.genome.riskAversion > 0.7) traits.push('Cautious');
    else if (this.genome.riskAversion < 0.3) traits.push('Reckless');

    if (this.genome.credibilityPriority > 0.7) traits.push('Credibility-Focused');
    if (this.genome.bandwagonTendency > 0.7) traits.push('Bandwagoner');
    if (this.genome.evidenceConcentration > 0.7) traits.push('Specialist');

    return traits.length > 0 ? traits.join(', ') : 'Balanced';
  }

  updateFitness(scoreThisGame: number): void {
    this.totalGamesPlayed++;
    this.totalScore += scoreThisGame;
    // Fitness = average score per game
    this.fitness = this.totalScore / this.totalGamesPlayed;
  }

  clone(): EvolvedAgent {
    const clonedGenome = { ...this.genome };
    const clone = new EvolvedAgent(clonedGenome, this.generationBorn);
    clone.fitness = this.fitness;
    clone.totalGamesPlayed = this.totalGamesPlayed;
    clone.totalScore = this.totalScore;
    return clone;
  }
}

// ==================== GENETIC OPERATORS ====================

export function createRandomGenome(): AgentGenome {
  return {
    evidenceConcentration: Math.random(),
    bluffTolerance: Math.random(),
    riskAversion: Math.random(),
    honestyBias: Math.random(),
    bandwagonTendency: Math.random(),
    advertisingFrequency: Math.random(),
    consensusThreshold: Math.random(),
    inconclusiveUsage: Math.random(),
    minorityAggression: Math.random(),
    credibilityPriority: Math.random(),
    longTermThinking: Math.random(),
    positionBias: Math.random()
  };
}

export function crossover(parent1: AgentGenome, parent2: AgentGenome): AgentGenome {
  // Uniform crossover: each gene has 50% chance from either parent
  const child: AgentGenome = {} as AgentGenome;
  const genes = Object.keys(parent1) as (keyof AgentGenome)[];

  for (const gene of genes) {
    child[gene] = Math.random() < 0.5 ? parent1[gene] : parent2[gene];
  }

  return child;
}

export function mutate(genome: AgentGenome, mutationRate: number = 0.1, mutationStrength: number = 0.2): AgentGenome {
  const mutated: AgentGenome = { ...genome };
  const genes = Object.keys(mutated) as (keyof AgentGenome)[];

  for (const gene of genes) {
    if (Math.random() < mutationRate) {
      // Add random noise within [-mutationStrength, +mutationStrength]
      const noise = (Math.random() - 0.5) * 2 * mutationStrength;
      mutated[gene] = Math.max(0, Math.min(1, mutated[gene] + noise));
    }
  }

  return mutated;
}

// ==================== EVOLUTION UTILITIES ====================

export interface GenerationStats {
  generation: number;
  populationSize: number;
  bestFitness: number;
  avgFitness: number;
  worstFitness: number;
  fitnessStdDev: number;

  // Gene distribution statistics
  geneDistribution: Record<keyof AgentGenome, {
    min: number;
    max: number;
    avg: number;
    stdDev: number;
  }>;

  // Dominant archetype (closest to average genome)
  dominantArchetype: AgentGenome;

  // Best agent this generation
  bestAgent: {
    id: string;
    fitness: number;
    genome: AgentGenome;
    description: string;
  };
}

export function calculateGenerationStats(population: EvolvedAgent[], generation: number): GenerationStats {
  const fitnesses = population.map(agent => agent.fitness);
  const avgFitness = fitnesses.reduce((sum, f) => sum + f, 0) / population.length;
  const variance = fitnesses.reduce((sum, f) => sum + Math.pow(f - avgFitness, 2), 0) / population.length;
  const stdDev = Math.sqrt(variance);

  const bestAgent = population.reduce((best, agent) =>
    agent.fitness > best.fitness ? agent : best
  );

  // Calculate gene distributions
  const geneDistribution: any = {};
  const genes = Object.keys(population[0].genome) as (keyof AgentGenome)[];

  for (const gene of genes) {
    const values = population.map(agent => agent.genome[gene]);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;

    geneDistribution[gene] = {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: avg,
      stdDev: Math.sqrt(variance)
    };
  }

  // Dominant archetype is the average genome
  const dominantArchetype: AgentGenome = {} as AgentGenome;
  for (const gene of genes) {
    dominantArchetype[gene] = geneDistribution[gene].avg;
  }

  return {
    generation,
    populationSize: population.length,
    bestFitness: Math.max(...fitnesses),
    avgFitness,
    worstFitness: Math.min(...fitnesses),
    fitnessStdDev: stdDev,
    geneDistribution,
    dominantArchetype,
    bestAgent: {
      id: bestAgent.id,
      fitness: bestAgent.fitness,
      genome: bestAgent.genome,
      description: bestAgent.getGenomeDescription()
    }
  };
}

export function selectParents(population: EvolvedAgent[], tournamentSize: number = 3): [EvolvedAgent, EvolvedAgent] {
  // Tournament selection: pick best from random subset
  const selectOne = (): EvolvedAgent => {
    const tournament = [];
    for (let i = 0; i < tournamentSize; i++) {
      tournament.push(population[Math.floor(Math.random() * population.length)]);
    }
    return tournament.reduce((best, agent) =>
      agent.fitness > best.fitness ? agent : best
    );
  };

  return [selectOne(), selectOne()];
}
