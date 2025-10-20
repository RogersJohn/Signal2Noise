import { GameState, PlayerState, EvidenceCard, ConspiracyCard, Position } from './types';
import { canSupportConspiracy } from './gameLogic';

// AI Personality Configuration
export interface AIPersonality {
  name: string;
  description: string;

  // Core traits (0-1 scale)
  riskTolerance: number;        // 0 = ultra-cautious, 1 = reckless
  bluffFrequency: number;       // 0 = never bluffs, 1 = bluffs constantly
  evidenceThreshold: number;    // 0 = broadcasts with any evidence, 1 = needs overwhelming evidence
  skepticism: number;           // 0 = trusts everyone, 1 = suspects all broadcasts
  specialization: number;       // 0 = spreads evidence evenly, 1 = focuses on few conspiracies

  // Strategic preferences
  preferHighTier: boolean;      // Prioritizes Tier 3 > Tier 2 > Tier 1
  credibilityConscious: boolean; // Avoids actions that lose credibility
  opportunistic: boolean;        // Exploits game state (low credibility players, consensus opportunities)
}

// ==================== PERSONALITY DEFINITIONS ====================

export const AI_PERSONALITIES: Record<string, AIPersonality> = {
  PARANOID_SKEPTIC: {
    name: 'The Paranoid Skeptic',
    description: 'Trusts no one, never bluffs, extremely cautious. Only broadcasts with overwhelming evidence.',
    riskTolerance: 0.1,
    bluffFrequency: 0.0,
    evidenceThreshold: 0.9,
    skepticism: 1.0,
    specialization: 0.3,
    preferHighTier: true,
    credibilityConscious: true,
    opportunistic: false
  },

  RECKLESS_GAMBLER: {
    name: 'The Reckless Gambler',
    description: 'Throws caution to the wind. Bluffs frequently, broadcasts without evidence, chases high scores.',
    riskTolerance: 0.95,
    bluffFrequency: 0.7,
    evidenceThreshold: 0.1,
    skepticism: 0.2,
    specialization: 0.8,
    preferHighTier: true,
    credibilityConscious: false,
    opportunistic: true
  },

  CALCULATED_STRATEGIST: {
    name: 'The Calculated Strategist',
    description: 'Analyzes risk vs reward. Strategic bluffs, adapts to game state, balanced approach.',
    riskTolerance: 0.6,
    bluffFrequency: 0.3,
    evidenceThreshold: 0.5,
    skepticism: 0.6,
    specialization: 0.5,
    preferHighTier: true,
    credibilityConscious: true,
    opportunistic: true
  },

  TRUTH_SEEKER: {
    name: 'The Truth Seeker',
    description: 'Obsessed with accuracy. Only broadcasts with strong evidence, never bluffs, methodical.',
    riskTolerance: 0.2,
    bluffFrequency: 0.0,
    evidenceThreshold: 0.85,
    skepticism: 0.5,
    specialization: 0.2,
    preferHighTier: false,
    credibilityConscious: true,
    opportunistic: false
  },

  CONSPIRACY_THEORIST: {
    name: 'The Conspiracy Theorist',
    description: 'Believes everything is connected. Broadcasts wildly, trusts all sources, spreads chaos.',
    riskTolerance: 0.8,
    bluffFrequency: 0.5,
    evidenceThreshold: 0.2,
    skepticism: 0.1,
    specialization: 0.1,
    preferHighTier: false,
    credibilityConscious: false,
    opportunistic: false
  },

  PROFESSIONAL_ANALYST: {
    name: 'The Professional Analyst',
    description: 'Data-driven and adaptive. Balances all factors, reads the table, makes optimal plays.',
    riskTolerance: 0.55,
    bluffFrequency: 0.25,
    evidenceThreshold: 0.6,
    skepticism: 0.7,
    specialization: 0.4,
    preferHighTier: true,
    credibilityConscious: true,
    opportunistic: true
  },

  OPPORTUNIST: {
    name: 'The Opportunist',
    description: 'Exploits weaknesses. Targets low-credibility players, jumps on consensus opportunities.',
    riskTolerance: 0.7,
    bluffFrequency: 0.4,
    evidenceThreshold: 0.4,
    skepticism: 0.8,
    specialization: 0.6,
    preferHighTier: true,
    credibilityConscious: true,
    opportunistic: true
  },

  CAUTIOUS_SCHOLAR: {
    name: 'The Cautious Scholar',
    description: 'Academic approach. Needs extensive evidence, risk-averse, builds reputation slowly.',
    riskTolerance: 0.15,
    bluffFrequency: 0.05,
    evidenceThreshold: 0.95,
    skepticism: 0.4,
    specialization: 0.3,
    preferHighTier: false,
    credibilityConscious: true,
    opportunistic: false
  },

  CHAOS_AGENT: {
    name: 'The Chaos Agent',
    description: 'Unpredictable and erratic. Random bluffs, ignores patterns, creates confusion.',
    riskTolerance: 0.9,
    bluffFrequency: 0.6,
    evidenceThreshold: 0.15,
    skepticism: 0.3,
    specialization: 0.1,
    preferHighTier: false,
    credibilityConscious: false,
    opportunistic: false
  },

  STEADY_BUILDER: {
    name: 'The Steady Builder',
    description: 'Consistent and reliable. Moderate risk, focuses on building audience over time.',
    riskTolerance: 0.4,
    bluffFrequency: 0.15,
    evidenceThreshold: 0.65,
    skepticism: 0.5,
    specialization: 0.5,
    preferHighTier: false,
    credibilityConscious: true,
    opportunistic: false
  }
};

// ==================== AI DECISION MAKING ====================

export interface AIDecision {
  action: 'broadcast' | 'pass';
  conspiracyId?: string;
  position?: Position;
  isBluff: boolean;
  confidence: number; // 0-1, how confident the AI is in this decision
}

export function makeAIDecision(
  gameState: GameState,
  playerIndex: number,
  personality: AIPersonality
): AIDecision {
  const player = gameState.players[playerIndex];
  const availableConspiracies = gameState.conspiracies.filter(c => !c.isRevealed);

  // PHASE 1: Evaluate each conspiracy option
  const evaluations = availableConspiracies.map(conspiracy => {
    const assignedEvidence = player.assignedEvidence[conspiracy.id] || [];
    const hasEvidence = assignedEvidence.length > 0;
    const evidenceCount = assignedEvidence.length;

    // Calculate base score for this conspiracy
    let score = 0;

    // Evidence strength bonus
    if (hasEvidence) {
      score += evidenceCount * 20;

      // Excitement mechanic consideration
      const excitementBonus = calculateExcitementValue(player, assignedEvidence);
      score += excitementBonus * 5;
    }

    // Tier preference
    if (personality.preferHighTier) {
      score += conspiracy.tier * 10;
    }

    // Specialization: prefer conspiracies we've already broadcast on
    if (personality.specialization > 0.5) {
      const previousBroadcasts = player.broadcastHistory.filter(
        h => h.conspiracyId === conspiracy.id
      ).length;
      score += previousBroadcasts * personality.specialization * 15;
    }

    // Opportunistic: check if others might be broadcasting on this too (consensus potential)
    if (personality.opportunistic) {
      const broadcastsOnThis = gameState.broadcastQueue.filter(
        b => b.conspiracyId === conspiracy.id && !b.isPassed
      ).length;
      if (broadcastsOnThis > 0) {
        score += broadcastsOnThis * 25;
      }
    }

    return {
      conspiracy,
      score,
      hasEvidence,
      evidenceCount
    };
  });

  // Sort by score
  evaluations.sort((a, b) => b.score - a.score);
  const bestOption = evaluations[0];

  if (!bestOption) {
    return { action: 'pass', isBluff: false, confidence: 1.0 };
  }

  // PHASE 2: Decide whether to broadcast or pass

  // Check evidence threshold
  const meetsEvidenceThreshold = bestOption.hasEvidence &&
    bestOption.evidenceCount >= Math.ceil(personality.evidenceThreshold * 5);

  // Decide if we're bluffing
  const willBluff = !bestOption.hasEvidence &&
    Math.random() < personality.bluffFrequency &&
    player.credibility > 3; // Don't bluff if low credibility

  // Risk check: can we afford to lose credibility?
  const canAffordRisk = personality.credibilityConscious ?
    player.credibility >= 5 :
    player.credibility >= 2;

  // PHASE 3: Make final decision
  if (meetsEvidenceThreshold || (willBluff && canAffordRisk)) {
    // Choose position based on personality
    const position = choosePosition(
      bestOption.conspiracy,
      bestOption.hasEvidence,
      personality,
      player
    );

    return {
      action: 'broadcast',
      conspiracyId: bestOption.conspiracy.id,
      position,
      isBluff: !bestOption.hasEvidence,
      confidence: bestOption.hasEvidence ? 0.8 : 0.4
    };
  }

  // Default: pass
  return { action: 'pass', isBluff: false, confidence: 0.6 };
}

function choosePosition(
  conspiracy: ConspiracyCard,
  hasEvidence: boolean,
  personality: AIPersonality,
  player: PlayerState
): Position {
  // If bluffing, choose randomly with personality bias
  if (!hasEvidence) {
    // Reckless players might guess high-tier as REAL more often
    if (personality.riskTolerance > 0.7 && conspiracy.tier >= 2) {
      return Math.random() > 0.4 ? 'REAL' : 'FAKE';
    }
    return Math.random() > 0.5 ? 'REAL' : 'FAKE';
  }

  // With evidence, make educated guess based on context clues
  // In real game, AI doesn't know truth value, so this simulates deduction

  // Check broadcast history for patterns
  const previousReal = player.broadcastHistory.filter(
    h => h.position === 'REAL' && h.wasScored
  ).length;
  const previousFake = player.broadcastHistory.filter(
    h => h.position === 'FAKE' && h.wasScored
  ).length;

  // Balanced play: alternate if possible
  if (personality.name === 'The Professional Analyst') {
    if (previousReal > previousFake + 1) return 'FAKE';
    if (previousFake > previousReal + 1) return 'REAL';
  }

  // Conspiracy theorist believes everything is real
  if (personality.skepticism < 0.3) {
    return 'REAL';
  }

  // Paranoid skeptic thinks everything is fake
  if (personality.skepticism > 0.9) {
    return 'FAKE';
  }

  // Default: educated guess (50/50 but influenced by tier)
  // Higher tier = more likely to be sensational/fake in this game's theme
  const fakeChance = 0.5 + (conspiracy.tier - 2) * 0.1;
  return Math.random() < fakeChance ? 'FAKE' : 'REAL';
}

function calculateExcitementValue(
  player: PlayerState,
  evidence: EvidenceCard[]
): number {
  let totalModifier = 0;

  evidence.forEach(card => {
    const previousUses = player.broadcastHistory.filter(entry =>
      entry.evidenceIds.includes(card.id) && entry.wasScored
    ).length;

    if (card.excitement === -1 && previousUses > 0) {
      totalModifier -= 2; // BORING penalty
    } else if (card.excitement === 1 && previousUses > 0) {
      totalModifier += 2 * previousUses; // FOCUSED bonus (stacks!)
    }
  });

  return totalModifier;
}

// ==================== HELPER: Get Random Personality ====================

export function getRandomPersonality(): AIPersonality {
  const keys = Object.keys(AI_PERSONALITIES);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return AI_PERSONALITIES[randomKey];
}

// ==================== HELPER: Get Personality by Name ====================

export function getPersonalityByName(name: keyof typeof AI_PERSONALITIES): AIPersonality {
  return AI_PERSONALITIES[name];
}

// ==================== EXPORT LIST ====================

export const PERSONALITY_NAMES = Object.keys(AI_PERSONALITIES) as Array<keyof typeof AI_PERSONALITIES>;
