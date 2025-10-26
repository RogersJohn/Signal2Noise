/**
 * Evolutionary Agent: AI player whose strategy is determined by its genome
 *
 * This agent implements the AIPersonality interface but derives all decisions
 * from its genetic parameters, allowing strategies to evolve through natural selection.
 */

import { AIPersonality } from '../aiPersonalities';
import { StrategyGenome } from './strategyGenome';
import {
  GameState,
  PlayerState,
  EvidenceCard,
  ConspiracyCard,
  Position,
  AdvertiseObject,
} from '../types';

export class EvolutionaryAgent implements AIPersonality {
  name: string;
  description: string;
  genome: StrategyGenome;
  id: string;

  // AIPersonality interface requirements
  riskTolerance: number;
  bluffFrequency: number;
  evidenceThreshold: number;
  skepticism: number;
  specialization: number;
  preferHighTier: boolean;
  credibilityConscious: boolean;
  opportunistic: boolean;

  constructor(genome: StrategyGenome, id: string = 'evo-agent') {
    this.genome = genome;
    this.name = `Evo-${id}`;
    this.id = id;

    // Map genome to AIPersonality traits (for interface compatibility)
    this.description = 'Evolutionary AI agent';
    this.riskTolerance = genome.riskTolerance;
    this.bluffFrequency = genome.bluffTolerance;
    this.evidenceThreshold = (genome.minEvidenceForREAL + genome.minEvidenceForFAKE) / 20; // Normalize to 0-1
    this.skepticism = genome.counterBroadcastAggression;
    this.specialization = 1 - genome.explorationRate; // Less exploration = more specialization
    this.preferHighTier = false; // Neutral
    this.credibilityConscious = genome.bankruptcyAvoidance > 0.5;
    this.opportunistic = genome.advertiseCommitment < 0.5; // Low commitment = opportunistic
  }

  /**
   * Decide whether to investigate (draw evidence) this conspiracy
   */
  shouldInvestigate(
    conspiracy: ConspiracyCard,
    gameState: GameState,
    playerState: PlayerState
  ): boolean {
    const handSize = playerState.evidenceHand.length;
    const assignedCount = (playerState.assignedEvidence[conspiracy.id] || []).length;

    // Don't investigate if we're holding too many cards
    if (handSize >= this.genome.maxEvidenceToHold) {
      return false;
    }

    // Investigate if we have fewer than minimum evidence
    if (assignedCount < this.genome.minEvidenceToInvestigate) {
      return Math.random() < 0.8; // 80% chance to draw
    }

    // Random exploration
    return Math.random() < this.genome.explorationRate;
  }

  /**
   * Decide whether to advertise on this conspiracy
   */
  shouldAdvertise(
    conspiracy: ConspiracyCard,
    gameState: GameState,
    playerState: PlayerState
  ): boolean {
    const evidence = playerState.assignedEvidence[conspiracy.id] || [];

    // Don't advertise if no evidence
    if (evidence.length === 0) return false;

    // Early round check
    if (gameState.round < this.genome.minRoundToParticipate) {
      return false;
    }

    // Check if we have enough evidence to justify advertising
    const hasEnoughEvidence = evidence.length >= Math.min(
      this.genome.minEvidenceForREAL,
      this.genome.minEvidenceForFAKE
    ) / 2;

    if (!hasEnoughEvidence) return false;

    // Commitment level determines if we advertise
    return Math.random() < this.genome.advertiseCommitment * 0.7;
  }

  /**
   * Decide advertise position and bet amount
   */
  decideAdvertise(
    conspiracy: ConspiracyCard,
    gameState: GameState,
    playerState: PlayerState
  ): { position: Position; betAmount: number } | null {
    if (!this.shouldAdvertise(conspiracy, gameState, playerState)) {
      return null;
    }

    const evidence = playerState.assignedEvidence[conspiracy.id] || [];
    const realEvidence = evidence.filter(e => e.proofValue === 'REAL');
    const fakeEvidence = evidence.filter(e => e.proofValue === 'FAKE');

    // Determine position based on evidence + bias
    let position: Position;
    const realCount = realEvidence.length;
    const fakeCount = fakeEvidence.length;

    const adjustedRealCount = realCount + (this.genome.realBias * 2);
    const adjustedFakeCount = fakeCount - (this.genome.realBias * 2);

    if (adjustedRealCount > adjustedFakeCount) {
      position = 'REAL';
    } else if (adjustedFakeCount > adjustedRealCount) {
      position = 'FAKE';
    } else {
      position = Math.random() < 0.5 ? 'REAL' : 'FAKE';
    }

    // Bet sizing based on confidence and risk tolerance
    let betAmount = this.genome.baseBetSize;

    // Adjust bet based on credibility
    if (playerState.credibility < this.genome.credibilityFloor) {
      betAmount = Math.max(1, betAmount - 1); // More conservative when low credibility
    }

    // Risk tolerance can increase bet
    if (this.genome.riskTolerance > 0.7 && playerState.audience < 5) {
      betAmount = Math.min(3, betAmount + 1); // Take bigger risks when behind
    }

    return { position, betAmount: Math.max(1, Math.min(3, betAmount)) };
  }

  /**
   * Decide whether to broadcast on this conspiracy
   */
  shouldBroadcast(
    conspiracy: ConspiracyCard,
    gameState: GameState,
    playerState: PlayerState
  ): boolean {
    // Check passing threshold (HIGHER threshold = LESS likely to pass)
    // Invert so that 0 = always pass, 1 = never pass
    if (Math.random() > this.genome.passingThreshold) {
      return false; // Random passing based on genome
    }

    // Don't broadcast if too early
    if (gameState.round < this.genome.minRoundToParticipate) {
      return false;
    }

    const evidence = playerState.assignedEvidence[conspiracy.id] || [];

    // Need at least some evidence to broadcast
    if (evidence.length === 0) return false;

    // Check if we meet evidence threshold
    const realEvidence = evidence.filter(e => e.proofValue === 'REAL');
    const fakeEvidence = evidence.filter(e => e.proofValue === 'FAKE');
    const bluffEvidence = evidence.filter(e => e.proofValue === 'BLUFF');

    const hasEnoughForREAL = realEvidence.length >= this.genome.minEvidenceForREAL;
    const hasEnoughForFAKE = fakeEvidence.length >= this.genome.minEvidenceForFAKE;

    // Can we broadcast with real evidence?
    if (hasEnoughForREAL || hasEnoughForFAKE) {
      return true;
    }

    // Maybe broadcast with bluffs if tolerance is high
    if (bluffEvidence.length > 0 && Math.random() < this.genome.bluffTolerance) {
      return true;
    }

    // Late game desperation
    if (gameState.round >= 5 && playerState.audience < 5) {
      return Math.random() < this.genome.comebackDesperation;
    }

    return false;
  }

  /**
   * Decide broadcast position and evidence selection
   */
  decideBroadcast(
    conspiracy: ConspiracyCard,
    gameState: GameState,
    playerState: PlayerState
  ): { position: Position; evidence: EvidenceCard[] } | null {
    if (!this.shouldBroadcast(conspiracy, gameState, playerState)) {
      return null;
    }

    const availableEvidence = playerState.assignedEvidence[conspiracy.id] || [];
    const realEvidence = availableEvidence.filter(e => e.proofValue === 'REAL');
    const fakeEvidence = availableEvidence.filter(e => e.proofValue === 'FAKE');
    const bluffEvidence = availableEvidence.filter(e => e.proofValue === 'BLUFF');

    // Determine position
    let position: Position;
    let selectedEvidence: EvidenceCard[] = [];

    // Check advertise fakeout strategy
    const advertised = gameState.advertiseQueue.find(
      a => a.playerId === playerState.id && a.conspiracyId === conspiracy.id
    );

    const shouldFakeout = advertised && Math.random() < this.genome.advertiseFakeouts;

    if (shouldFakeout && advertised) {
      // Broadcast opposite of what we advertised
      position = advertised.position === 'REAL' ? 'FAKE' : 'REAL';
    } else {
      // Normal position selection based on evidence
      const realCount = realEvidence.length;
      const fakeCount = fakeEvidence.length;
      const adjustedRealCount = realCount + (this.genome.realBias * 2);
      const adjustedFakeCount = fakeCount - (this.genome.realBias * 2);

      if (adjustedRealCount > adjustedFakeCount) {
        position = 'REAL';
      } else if (adjustedFakeCount > adjustedRealCount) {
        position = 'FAKE';
      } else {
        position = Math.random() < 0.5 ? 'REAL' : 'FAKE';
      }
    }

    // Select evidence to play
    if (position === 'REAL') {
      selectedEvidence = [...realEvidence];

      // Mix in bluffs?
      if (this.genome.bluffWithREALEvidence > 0.5 && bluffEvidence.length > 0) {
        const bluffsToAdd = Math.floor(bluffEvidence.length * this.genome.bluffTolerance);
        selectedEvidence = [...selectedEvidence, ...bluffEvidence.slice(0, bluffsToAdd)];
      }
    } else if (position === 'FAKE') {
      selectedEvidence = [...fakeEvidence];

      // Mix in bluffs?
      if (this.genome.bluffWithREALEvidence > 0.5 && bluffEvidence.length > 0) {
        const bluffsToAdd = Math.floor(bluffEvidence.length * this.genome.bluffTolerance);
        selectedEvidence = [...selectedEvidence, ...bluffEvidence.slice(0, bluffsToAdd)];
      }
    }

    // Fallback: if no evidence for chosen position, use bluffs or switch position
    if (selectedEvidence.length === 0) {
      if (bluffEvidence.length > 0 && Math.random() < this.genome.bluffTolerance) {
        selectedEvidence = bluffEvidence;
      } else {
        // Switch position
        position = position === 'REAL' ? 'FAKE' : 'REAL';
        selectedEvidence = position === 'REAL' ? realEvidence : fakeEvidence;
      }
    }

    // Still no evidence? Use whatever we have
    if (selectedEvidence.length === 0) {
      selectedEvidence = availableEvidence;
    }

    return selectedEvidence.length > 0 ? { position, evidence: selectedEvidence } : null;
  }

  /**
   * Select which conspiracy to prioritize this turn
   */
  selectConspiracyPriority(
    conspiracies: ConspiracyCard[],
    gameState: GameState,
    playerState: PlayerState
  ): ConspiracyCard {
    // Score each conspiracy
    const scores = conspiracies.map(conspiracy => {
      const evidence = playerState.assignedEvidence[conspiracy.id] || [];
      const realCount = evidence.filter(e => e.proofValue === 'REAL').length;
      const fakeCount = evidence.filter(e => e.proofValue === 'FAKE').length;

      let score = evidence.length * 10; // Base: more evidence = higher priority

      // Bias toward REAL conspiracies if we have real bias
      if (this.genome.realBias > 0 && realCount > fakeCount) {
        score += this.genome.realBias * 20;
      }

      // Bias toward FAKE if we have fake bias
      if (this.genome.realBias < 0 && fakeCount > realCount) {
        score += Math.abs(this.genome.realBias) * 20;
      }

      // Early broadcast preference
      if (this.genome.earlyBroadcastPref > 0.5) {
        score += 10; // Prefer any conspiracy if we want to broadcast early
      }

      return { conspiracy, score };
    });

    // Sort by score and pick highest
    scores.sort((a, b) => b.score - a.score);
    return scores[0].conspiracy;
  }
}

/**
 * Create an AI personality from a genome (for compatibility with existing simulation)
 */
export function genomeToAIPersonality(genome: StrategyGenome, id: string): AIPersonality {
  return new EvolutionaryAgent(genome, id);
}
