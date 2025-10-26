/**
 * Strategy Genome: Genetic representation of AI decision-making parameters
 *
 * Each gene represents a strategic parameter that can evolve through
 * genetic algorithm selection, crossover, and mutation.
 */

export interface StrategyGenome {
  // === Evidence Management ===
  minEvidenceToInvestigate: number;      // 0-5: Minimum evidence cards before investigating
  minEvidenceForREAL: number;            // 0-10: Real evidence needed to broadcast REAL
  minEvidenceForFAKE: number;            // 0-10: Fake evidence needed to broadcast FAKE
  maxEvidenceToHold: number;             // 0-10: Max evidence to hold (rest = low priority)

  // === Bluffing Strategy ===
  bluffTolerance: number;                // 0-1: Willingness to play BLUFF cards (0=never, 1=always)
  bluffWithREALEvidence: number;         // 0-1: Mix bluffs with real evidence
  bluffThreshold: number;                // 0-1: Minimum confidence before bluffing

  // === Betting & Risk ===
  baseBetSize: number;                   // 1-3: Default bet amount in advertise phase
  riskTolerance: number;                 // 0-1: Willingness to take risks (0=conservative, 1=aggressive)
  credibilityFloor: number;              // 0-10: Minimum credibility before becoming cautious
  bankruptcyAvoidance: number;           // 0-1: How much to avoid going bankrupt

  // === Position Preference ===
  realBias: number;                      // -1 to 1: Preference (-1=FAKE, 0=neutral, 1=REAL)
  inconclusiveTolerance: number;         // 0-1: Willingness to broadcast INCONCLUSIVE

  // === Broadcast Timing ===
  earlyBroadcastPref: number;            // 0-1: Prefer early broadcasts (0=wait, 1=rush)
  passingThreshold: number;              // 0-1: Willingness to broadcast (0=always pass, 1=never pass)
  minRoundToParticipate: number;         // 1-6: First round to start broadcasting

  // === Coalition & Social ===
  coalitionWillingness: number;          // 0-1: Tendency to align with other players
  followTheCrowdBias: number;            // 0-1: Match consensus vs think independently
  counterBroadcastAggression: number;    // 0-1: Willingness to counter-broadcast

  // === Late Game Strategy ===
  lateGameAggression: number;            // 0-1: Increase risk in final rounds
  comebackDesperation: number;           // 0-1: Take risks when behind
  protectLeadConservatism: number;       // 0-1: Play safe when ahead

  // === Advertise Phase ===
  advertiseCommitment: number;           // 0-1: Actually follow through on advertised conspiracies
  advertiseFakeouts: number;             // 0-1: Advertise one thing, broadcast another

  // === Meta ===
  adaptiveness: number;                  // 0-1: Adjust strategy based on opponent patterns
  explorationRate: number;               // 0-1: Try unusual plays vs stick to plan
}

/**
 * Create a random genome with all parameters initialized to random values
 */
export function createRandomGenome(): StrategyGenome {
  return {
    // Evidence
    minEvidenceToInvestigate: Math.floor(Math.random() * 6),
    minEvidenceForREAL: Math.floor(Math.random() * 11),
    minEvidenceForFAKE: Math.floor(Math.random() * 11),
    maxEvidenceToHold: Math.floor(Math.random() * 11),

    // Bluffing
    bluffTolerance: Math.random(),
    bluffWithREALEvidence: Math.random(),
    bluffThreshold: Math.random(),

    // Betting
    baseBetSize: Math.floor(Math.random() * 3) + 1,
    riskTolerance: Math.random(),
    credibilityFloor: Math.floor(Math.random() * 11),
    bankruptcyAvoidance: Math.random(),

    // Position
    realBias: (Math.random() * 2) - 1,
    inconclusiveTolerance: Math.random(),

    // Timing
    earlyBroadcastPref: Math.random(),
    passingThreshold: Math.random(),
    minRoundToParticipate: Math.floor(Math.random() * 6) + 1,

    // Coalition
    coalitionWillingness: Math.random(),
    followTheCrowdBias: Math.random(),
    counterBroadcastAggression: Math.random(),

    // Late game
    lateGameAggression: Math.random(),
    comebackDesperation: Math.random(),
    protectLeadConservatism: Math.random(),

    // Advertise
    advertiseCommitment: Math.random(),
    advertiseFakeouts: Math.random(),

    // Meta
    adaptiveness: Math.random(),
    explorationRate: Math.random(),
  };
}

/**
 * Crossover: Blend two parent genomes to create a child
 * Uses uniform crossover (50% chance to inherit from each parent per gene)
 */
export function crossover(parent1: StrategyGenome, parent2: StrategyGenome): StrategyGenome {
  const child: StrategyGenome = { ...parent1 };

  // For each gene, randomly pick from parent1 or parent2
  (Object.keys(child) as Array<keyof StrategyGenome>).forEach(key => {
    if (Math.random() < 0.5) {
      child[key] = parent2[key];
    }
  });

  return child;
}

/**
 * Mutate: Randomly modify genes with small perturbations
 */
export function mutate(genome: StrategyGenome, mutationRate: number = 0.1, mutationStrength: number = 0.2): StrategyGenome {
  const mutated = { ...genome };

  (Object.keys(mutated) as Array<keyof StrategyGenome>).forEach(key => {
    if (Math.random() < mutationRate) {
      const currentValue = mutated[key];

      // Determine valid range for this gene
      let min: number, max: number;
      if (key.includes('minEvidence') || key === 'maxEvidenceToHold' || key === 'credibilityFloor') {
        min = 0;
        max = 10;
      } else if (key === 'minEvidenceToInvestigate') {
        min = 0;
        max = 5;
      } else if (key === 'baseBetSize') {
        min = 1;
        max = 3;
      } else if (key === 'minRoundToParticipate') {
        min = 1;
        max = 6;
      } else if (key === 'realBias') {
        min = -1;
        max = 1;
      } else {
        // Most genes are 0-1 probabilities
        min = 0;
        max = 1;
      }

      // Add random perturbation
      const range = max - min;
      const delta = (Math.random() - 0.5) * 2 * mutationStrength * range;
      const newValue = currentValue + delta;

      // Clamp to valid range
      mutated[key] = Math.max(min, Math.min(max, newValue));

      // Round integers
      if (key.includes('min') || key.includes('max') || key === 'baseBetSize') {
        mutated[key] = Math.round(mutated[key]);
      }
    }
  });

  return mutated;
}

/**
 * Calculate similarity between two genomes (0 = completely different, 1 = identical)
 */
export function genomeSimilarity(genome1: StrategyGenome, genome2: StrategyGenome): number {
  const keys = Object.keys(genome1) as Array<keyof StrategyGenome>;
  let totalDifference = 0;

  keys.forEach(key => {
    const val1 = genome1[key];
    const val2 = genome2[key];

    // Normalize difference based on expected range
    let maxRange: number;
    if (key.includes('minEvidence') || key === 'maxEvidenceToHold' || key === 'credibilityFloor') {
      maxRange = 10;
    } else if (key === 'minEvidenceToInvestigate') {
      maxRange = 5;
    } else if (key === 'baseBetSize') {
      maxRange = 2; // 1-3
    } else if (key === 'minRoundToParticipate') {
      maxRange = 5; // 1-6
    } else if (key === 'realBias') {
      maxRange = 2; // -1 to 1
    } else {
      maxRange = 1;
    }

    totalDifference += Math.abs(val1 - val2) / maxRange;
  });

  return 1 - (totalDifference / keys.length);
}

/**
 * Generate a human-readable summary of a genome's strategy
 */
export function describeGenome(genome: StrategyGenome): string {
  const traits: string[] = [];

  // Risk profile
  if (genome.riskTolerance > 0.7) traits.push('aggressive');
  else if (genome.riskTolerance < 0.3) traits.push('conservative');

  // Bluffing
  if (genome.bluffTolerance > 0.6) traits.push('heavy bluffer');
  else if (genome.bluffTolerance < 0.2) traits.push('honest');

  // Timing
  if (genome.earlyBroadcastPref > 0.7) traits.push('early broadcaster');
  else if (genome.earlyBroadcastPref < 0.3) traits.push('patient');

  // Social
  if (genome.coalitionWillingness > 0.6) traits.push('team player');
  else if (genome.coalitionWillingness < 0.3) traits.push('solo operator');

  // Evidence standards
  if (genome.minEvidenceForREAL > 7 && genome.minEvidenceForFAKE > 7) traits.push('evidence hoarder');
  else if (genome.minEvidenceForREAL < 3 && genome.minEvidenceForFAKE < 3) traits.push('low evidence threshold');

  return traits.join(', ') || 'balanced';
}
