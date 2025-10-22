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
  },

  SABOTEUR: {
    name: 'The Saboteur',
    description: 'Sets traps with high evidence on wrong positions. Sacrifices credibility to punish bandwagoners.',
    riskTolerance: 0.75,
    bluffFrequency: 0.3,
    evidenceThreshold: 0.3,
    skepticism: 0.6,
    specialization: 0.7,
    preferHighTier: true,
    credibilityConscious: false,
    opportunistic: false
  },

  META_READER: {
    name: 'The Meta-Reader',
    description: 'Detects traps and suspicious patterns. Avoids bandwagoning on questionable broadcasts.',
    riskTolerance: 0.5,
    bluffFrequency: 0.2,
    evidenceThreshold: 0.7,
    skepticism: 0.9,
    specialization: 0.4,
    preferHighTier: true,
    credibilityConscious: true,
    opportunistic: true
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

export interface AIAdvertiseDecision {
  action: 'advertise' | 'pass';
  conspiracyId?: string;
  confidence: number; // 0-1, how confident the AI is in this decision
  isTrap: boolean; // True if advertising without evidence (psychological warfare)
}

// ==================== ADVERTISE PHASE DECISION ====================
// New phase where players signal their intentions to influence others

export function makeAdvertiseDecision(
  gameState: GameState,
  playerIndex: number,
  personality: AIPersonality
): AIAdvertiseDecision {
  const player = gameState.players[playerIndex];
  const availableConspiracies = gameState.conspiracies;

  // Evaluate each conspiracy for advertising
  const evaluations = availableConspiracies.map(conspiracy => {
    const assignedEvidence = player.assignedEvidence[conspiracy.id] || [];
    const hasEvidence = assignedEvidence.length > 0;
    const evidenceCount = assignedEvidence.length;
    const realEvidence = assignedEvidence.filter(card => !card.isBluff);
    const hasRealEvidence = realEvidence.length > 0;

    let score = 0;

    // STRATEGY 1: Advertise where we have strong evidence (honest signaling)
    if (hasRealEvidence) {
      score += realEvidence.length * 30;

      // High-tier conspiracies more attractive for advertising
      if (personality.preferHighTier) {
        score += conspiracy.tier * 15;
      }

      // Specialization: advertise our focus area
      if (personality.specialization > 0.5) {
        const previousBroadcasts = player.broadcastHistory.filter(
          h => h.conspiracyId === conspiracy.id
        ).length;
        score += previousBroadcasts * 20;
      }
    }

    // STRATEGY 2: Deceptive advertising (traps) - advertise WITHOUT evidence
    // Some personalities use this to mislead opponents
    if (!hasRealEvidence && personality.bluffFrequency > 0.4) {
      // Riskier personalities may advertise false signals
      score += personality.riskTolerance * personality.bluffFrequency * 25;

      // Saboteur and Chaos Agent love setting traps
      if (personality.name === 'The Saboteur' || personality.name === 'The Chaos Agent') {
        score += 30;
      }
    }

    // STRATEGY 3: Follow the crowd (bandwagoning)
    // Check what others have advertised
    const advertisementsOnThis = gameState.advertiseQueue.filter(
      a => a.conspiracyId === conspiracy.id && !a.isPassed
    ).length;

    if (advertisementsOnThis > 0) {
      // Opportunists join popular conspiracies
      if (personality.opportunistic) {
        score += advertisementsOnThis * 20;
      }

      // Low-skepticism personalities easily influenced
      if (personality.skepticism < 0.5) {
        score += advertisementsOnThis * 15;
      }

      // High-skepticism personalities suspicious of popular choices
      if (personality.skepticism > 0.7) {
        score -= advertisementsOnThis * 10;
      }
    }

    // STRATEGY 4: Counter-signaling (contrarians)
    // Some personalities deliberately avoid what others advertise
    if (advertisementsOnThis > 0 && personality.skepticism > 0.8) {
      score *= 0.5; // Reduce appeal of popular choices
    }

    return {
      conspiracy,
      score,
      hasEvidence,
      evidenceCount,
      hasRealEvidence,
      isTrap: !hasRealEvidence
    };
  });

  // Sort by score
  evaluations.sort((a, b) => b.score - a.score);
  const bestOption = evaluations[0];

  if (!bestOption) {
    return { action: 'pass', confidence: 1.0, isTrap: false };
  }

  // DECISION: Advertise or Pass?

  // Very cautious personalities may pass to stay hidden
  if (personality.riskTolerance < 0.2 && Math.random() < 0.4) {
    return { action: 'pass', confidence: 0.7, isTrap: false };
  }

  // Paranoid Skeptic rarely advertises (keeps plans secret)
  if (personality.name === 'The Paranoid Skeptic' && Math.random() < 0.6) {
    return { action: 'pass', confidence: 0.8, isTrap: false };
  }

  // Cautious Scholar sometimes passes to observe
  if (personality.name === 'The Cautious Scholar' && !bestOption.hasRealEvidence) {
    return { action: 'pass', confidence: 0.6, isTrap: false };
  }

  // Meta-Reader may pass to observe others' patterns
  if (personality.name === 'The Meta-Reader' && gameState.advertiseQueue.length < 2 && Math.random() < 0.3) {
    return { action: 'pass', confidence: 0.5, isTrap: false };
  }

  // ADVERTISE on best option
  return {
    action: 'advertise',
    conspiracyId: bestOption.conspiracy.id,
    confidence: bestOption.hasRealEvidence ? 0.8 : 0.4,
    isTrap: bestOption.isTrap
  };
}

// ==================== BROADCAST PHASE DECISION ====================

export function makeAIDecision(
  gameState: GameState,
  playerIndex: number,
  personality: AIPersonality
): AIDecision {
  const player = gameState.players[playerIndex];
  // v4.5: Allow broadcasting on revealed conspiracies (cleanup happens at end of round)
  const availableConspiracies = gameState.conspiracies;

  // PHASE 1: Evaluate each conspiracy option
  const evaluations = availableConspiracies.map(conspiracy => {
    const assignedEvidence = player.assignedEvidence[conspiracy.id] || [];
    const hasEvidence = assignedEvidence.length > 0;
    const evidenceCount = assignedEvidence.length;

    // v4.0: Distinguish between real evidence and bluff cards
    const realEvidence = assignedEvidence.filter(card => !card.isBluff);
    const bluffCards = assignedEvidence.filter(card => card.isBluff);
    const hasRealEvidence = realEvidence.length > 0;

    // Calculate base score for this conspiracy
    let score = 0;

    // v4.6: EVIDENCE FIRST - Massively increased evidence value
    if (hasRealEvidence) {
      // Real evidence: DOUBLED points (20 → 40)
      score += realEvidence.length * 40;

      // v4.6: Confidence bonus - 3+ real evidence cards = strong case!
      if (realEvidence.length >= 3) {
        score += 50; // Big bonus for well-researched broadcasts
      }

      // Excitement mechanic consideration (only for real evidence)
      const excitementBonus = calculateExcitementValue(player, realEvidence);
      score += excitementBonus * 5;

      // v4.0: Bluff cards add modest bonus (cover/padding)
      score += bluffCards.length * 5;
    } else if (bluffCards.length > 0) {
      // v4.0: BLUFF CARDS ONLY - safer than pure bluffing
      // v4.6: Reduced value (15 → 10) to discourage bluff-only strategy
      score += bluffCards.length * 10;

      // Still requires risk tolerance
      score += personality.riskTolerance * personality.bluffFrequency * 20;
    } else {
      // PURE BLUFF: No evidence at all (very risky!)

      // v4.6: Reduced bluff appeal (30 → 15)
      score += personality.riskTolerance * personality.bluffFrequency * 15;

      // Desperate play: losing badly? Take risks!
      const avgAudience = gameState.players.reduce((sum, p) => sum + p.audience, 0) / gameState.players.length;
      if (player.audience < avgAudience - 10) {
        score += 15; // Desperation bonus (reduced from 20)
      }
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

    // v5.0: ADVERTISE PHASE INTEGRATION - Check who advertised interest
    // This is NEW psychological info that wasn't available before!
    const advertisementsOnThis = gameState.advertiseQueue.filter(
      a => a.conspiracyId === conspiracy.id && !a.isPassed
    ).length;

    // If multiple players advertised this, it signals potential consensus
    if (advertisementsOnThis > 0) {
      // Strong signal: multiple advertisements indicate bandwagon opportunity
      score += advertisementsOnThis * 15;

      // Opportunists LOVE following advertisements
      if (personality.opportunistic) {
        score += advertisementsOnThis * 20;
      }

      // Skeptics are suspicious of too many advertisements (possible trap?)
      if (personality.skepticism > 0.7 && advertisementsOnThis >= 2) {
        score -= advertisementsOnThis * 10;
      }

      // Meta-Reader detects traps: if someone advertised but likely has no evidence
      if (personality.name === 'The Meta-Reader' && advertisementsOnThis > 0 && !hasEvidence) {
        // Be cautious - might be a trap
        score *= 0.7;
      }
    }

    // v3.8: Enhanced Bandwagon Mechanics - Check actual broadcasts too
    // Check if others have already broadcast on this conspiracy (bandwagon effect)
    const broadcastsOnThis = gameState.broadcastQueue.filter(
      b => b.conspiracyId === conspiracy.id && !b.isPassed
    );
    if (broadcastsOnThis.length > 0) {
      // v4.6: REDUCED bandwagon bonus (50 → 20) - evidence should dominate!
      let bandwagonBonus = broadcastsOnThis.length * 20;

      // v4.6: REDUCED opportunistic bonus (30 → 10, total now 30 per broadcast)
      if (personality.opportunistic) {
        bandwagonBonus += broadcastsOnThis.length * 10;
      }

      // Skeptical personalities are more cautious about jumping on bandwagon
      if (personality.skepticism > 0.7 && !hasEvidence) {
        bandwagonBonus *= 0.5; // Half bonus if skeptical and no evidence
      }

      score += bandwagonBonus;

      // v3.8: Position Matching Bonus - extra points for agreeing on position
      // Check if there's a dominant position forming (encourages actual consensus)
      const realCount = broadcastsOnThis.filter(b => b.position === 'REAL').length;
      const fakeCount = broadcastsOnThis.filter(b => b.position === 'FAKE').length;

      if (realCount > 0 || fakeCount > 0) {
        // If there's a clear majority position, give bonus for likely matching it
        const dominantCount = Math.max(realCount, fakeCount);
        const positionMatchBonus = dominantCount * 20; // +20 per matching broadcast

        // Apply full bonus if we have evidence (likely to make informed choice)
        // Apply half bonus if bluffing (50% chance to guess right position)
        score += hasEvidence ? positionMatchBonus : positionMatchBonus * 0.5;
      }
    }

    return {
      conspiracy,
      score,
      hasEvidence,
      evidenceCount,
      hasRealEvidence
    };
  });

  // Sort by score
  evaluations.sort((a, b) => b.score - a.score);
  const bestOption = evaluations[0];

  if (!bestOption) {
    return { action: 'pass', isBluff: false, confidence: 1.0 };
  }

  // PHASE 2: Decide whether to broadcast or pass

  // v4.0: Check evidence threshold (based on REAL evidence)
  const meetsEvidenceThreshold = bestOption.hasRealEvidence &&
    bestOption.evidenceCount >= Math.ceil(personality.evidenceThreshold * 5);

  // v4.0: Decide if we're bluffing (bluff cards count as bluffing)
  const willBluff = !bestOption.hasRealEvidence &&
    Math.random() < personality.bluffFrequency &&
    player.credibility > 3; // Don't bluff if low credibility

  // Risk check: can we afford to lose credibility?
  const canAffordRisk = personality.credibilityConscious ?
    player.credibility >= 5 :
    player.credibility >= 2;

  // PHASE 3: Make final decision
  if (meetsEvidenceThreshold || (willBluff && canAffordRisk)) {
    // Choose position based on personality (v4.0: now considers real evidence)
    const position = choosePosition(
      bestOption.conspiracy,
      bestOption.hasRealEvidence, // v4.0: use real evidence, not bluff cards
      personality,
      player,
      gameState
    );

    return {
      action: 'broadcast',
      conspiracyId: bestOption.conspiracy.id,
      position,
      isBluff: !bestOption.hasRealEvidence, // v4.0: bluff cards = bluffing
      confidence: bestOption.hasRealEvidence ? 0.8 : 0.4
    };
  }

  // Default: pass
  return { action: 'pass', isBluff: false, confidence: 0.6 };
}

function choosePosition(
  conspiracy: ConspiracyCard,
  hasEvidence: boolean,
  personality: AIPersonality,
  player: PlayerState,
  gameState: GameState
): Position {
  // NEW: Consensus-based position selection (NO truth seeking!)
  // AI focuses on building/joining consensus, not finding objective truth

  const broadcastsOnThis = gameState.broadcastQueue.filter(
    b => b.conspiracyId === conspiracy.id && !b.isPassed && b.position !== 'INCONCLUSIVE'
  );

  const realCount = broadcastsOnThis.filter(b => b.position === 'REAL').length;
  const fakeCount = broadcastsOnThis.filter(b => b.position === 'FAKE').length;
  const totalBroadcasts = realCount + fakeCount;

  // STRATEGY 1: Follow existing majority (bandwagoning)
  if (totalBroadcasts > 0) {
    const majorityThreshold = Math.ceil(gameState.players.length / 2);
    const closeToConsensus = Math.max(realCount, fakeCount) >= majorityThreshold - 1;

    // BANDWAGONER behavior (low skepticism, or no evidence)
    if (!hasEvidence || personality.skepticism < 0.4) {
      // Always join the majority if one exists
      if (realCount > fakeCount) return 'REAL';
      if (fakeCount > realCount) return 'FAKE';
      // Tied: pick randomly
      return Math.random() > 0.5 ? 'REAL' : 'FAKE';
    }

    // OPPORTUNIST behavior (join if close to consensus for quick points)
    if (personality.opportunistic && closeToConsensus) {
      if (realCount > fakeCount) return 'REAL';
      if (fakeCount > realCount) return 'FAKE';
    }

    // CONTRARIAN behavior (high skepticism)
    if (personality.skepticism > 0.8 && hasEvidence) {
      // Sometimes oppose the majority to differentiate
      if (realCount > fakeCount && Math.random() < 0.4) return 'FAKE';
      if (fakeCount > realCount && Math.random() < 0.4) return 'REAL';
    }

    // DEFAULT: Likely follow majority, but with some independent thought
    if (realCount > fakeCount) {
      return Math.random() < 0.75 ? 'REAL' : 'FAKE';
    }
    if (fakeCount > realCount) {
      return Math.random() < 0.75 ? 'FAKE' : 'REAL';
    }
  }

  // STRATEGY 2: No existing broadcasts - make first move based on personality

  // Conspiracy theorist: believes most things are REAL
  if (personality.name === 'The Conspiracy Theorist') {
    return Math.random() < 0.7 ? 'REAL' : 'FAKE';
  }

  // Paranoid skeptic: thinks most things are FAKE
  if (personality.name === 'The Paranoid Skeptic') {
    return Math.random() < 0.7 ? 'FAKE' : 'REAL';
  }

  // Saboteur: intentionally makes unpredictable moves
  if (personality.name === 'The Saboteur') {
    return Math.random() > 0.5 ? 'REAL' : 'FAKE';
  }

  // STRATEGY 3: Balanced approach - vary positions for credibility/diversity
  const previousReal = player.broadcastHistory.filter(
    h => h.position === 'REAL' && h.wasScored
  ).length;
  const previousFake = player.broadcastHistory.filter(
    h => h.position === 'FAKE' && h.wasScored
  ).length;

  // Professional analyst: balanced portfolio of positions
  if (personality.name === 'The Professional Analyst') {
    if (previousReal > previousFake + 1) return 'FAKE';
    if (previousFake > previousReal + 1) return 'REAL';
  }

  // STRATEGY 4: Consider using INCONCLUSIVE (very cautious personalities)
  // INCONCLUSIVE = safe option, scores 2 points, doesn't affect credibility
  if (personality.evidenceThreshold > 0.85 && !hasEvidence && Math.random() < 0.3) {
    return 'INCONCLUSIVE';
  }

  // If ultra-cautious and low credibility, signal interest without committing
  if (personality.credibilityConscious && player.credibility < 4 && Math.random() < 0.25) {
    return 'INCONCLUSIVE';
  }

  // DEFAULT: Random choice with personality bias
  // Reckless personalities lean REAL, cautious lean FAKE
  const realBias = 0.5 + (personality.riskTolerance - 0.5) * 0.2;
  return Math.random() < realBias ? 'REAL' : 'FAKE';
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
