import {
  GameState,
  GameAction,
  ActiveConspiracy,
  EvidenceCard,
  Position,
} from '../engine/types';
import { canSupport, isSpecificTo } from '../engine/deck';

// ── Strategy Interface ──

export interface AIStrategy {
  name: string;
  decideCommit(state: GameState, playerId: string): GameAction[];
  decideBroadcast(state: GameState, playerId: string): GameAction;
}

// ── Helpers ──

function getPlayer(state: GameState, playerId: string) {
  return state.players.find(p => p.id === playerId)!;
}

function getSupportableConspiracies(card: EvidenceCard, state: GameState): ActiveConspiracy[] {
  return state.activeConspiracies.filter(c => canSupport(card, c.card.id));
}

function getEvidenceCountForPlayer(conspiracy: ActiveConspiracy, playerId: string): number {
  return conspiracy.evidenceAssignments.filter(a => a.playerId === playerId).length;
}

function getBroadcastCountForPosition(conspiracy: ActiveConspiracy, position: Position): number {
  return conspiracy.broadcasts.filter(b => b.position === position).length;
}

function getTotalBroadcasts(conspiracy: ActiveConspiracy): number {
  return conspiracy.broadcasts.length;
}

function getLeadingPosition(conspiracy: ActiveConspiracy): { position: Position; count: number } | null {
  const realCount = getBroadcastCountForPosition(conspiracy, 'REAL');
  const fakeCount = getBroadcastCountForPosition(conspiracy, 'FAKE');
  if (realCount === 0 && fakeCount === 0) return null;
  if (realCount >= fakeCount) return { position: 'REAL', count: realCount };
  return { position: 'FAKE', count: fakeCount };
}

function pickRandomPosition(): Position {
  return Math.random() < 0.5 ? 'REAL' : 'FAKE';
}

function assignCardToConspiracy(playerId: string, cardId: string, conspiracyId: string): GameAction {
  return { type: 'ASSIGN_EVIDENCE', playerId, cardId, conspiracyId };
}

/**
 * Get the majority evidence position for a player on a conspiracy.
 * Returns the position most of their evidence supports, or null if no evidence.
 */
function getEvidencePosition(conspiracy: ActiveConspiracy, playerId: string): Position | null {
  const assignments = conspiracy.evidenceAssignments.filter(a => a.playerId === playerId);
  if (assignments.length === 0) return null;
  const realCount = assignments.filter(a => a.position === 'REAL').length;
  const fakeCount = assignments.filter(a => a.position === 'FAKE').length;
  if (realCount > fakeCount) return 'REAL';
  if (fakeCount > realCount) return 'FAKE';
  return assignments[0].position; // tie: use first card's position
}

// ── Strategy 1: Evidence-Only ──
// Focused commit, only broadcasts with evidence, never bluffs

const evidenceOnly: AIStrategy = {
  name: 'Evidence-Only',

  decideCommit(state, playerId) {
    const player = getPlayer(state, playerId);
    const actions: GameAction[] = [];
    const usedCards = new Set<string>();

    // Assign specific cards first
    for (const card of player.hand) {
      if (card.specific && !usedCards.has(card.id)) {
        const target = state.activeConspiracies.find(c => canSupport(card, c.card.id));
        if (target) {
          actions.push(assignCardToConspiracy(playerId, card.id, target.card.id));
          usedCards.add(card.id);
        }
      }
    }

    // Assign 1-2 generic cards to the conspiracy with most specific evidence
    const genericCards = player.hand.filter(c => !c.specific && !usedCards.has(c.id));
    if (genericCards.length > 0 && actions.length > 0) {
      const targetId = (actions[0] as { conspiracyId: string }).conspiracyId;
      const toAssign = genericCards.slice(0, Math.min(1, genericCards.length));
      for (const card of toAssign) {
        actions.push(assignCardToConspiracy(playerId, card.id, targetId));
        usedCards.add(card.id);
      }
    }

    return actions;
  },

  decideBroadcast(state, playerId) {
    // Only broadcast on conspiracies where we have evidence — always match evidence position
    for (const conspiracy of state.activeConspiracies) {
      const myEvidence = getEvidenceCountForPlayer(conspiracy, playerId);
      if (myEvidence > 0) {
        const evidencePos = getEvidencePosition(conspiracy, playerId)!;
        return {
          type: 'BROADCAST',
          playerId,
          conspiracyId: conspiracy.card.id,
          position: evidencePos, // never bluffs
        };
      }
    }
    return { type: 'PASS', playerId };
  },
};

// ── Strategy 2: Aggressive ──
// Spread commit, broadcasts frequently, bluffs 20% when momentum is against evidence

const aggressive: AIStrategy = {
  name: 'Aggressive',

  decideCommit(state, playerId) {
    const player = getPlayer(state, playerId);
    const actions: GameAction[] = [];
    const usedCards = new Set<string>();

    // Spread cards across conspiracies
    for (const card of player.hand) {
      if (usedCards.has(card.id)) continue;
      const targets = getSupportableConspiracies(card, state);
      if (targets.length > 0) {
        // Pick the one with fewest assignments from this player
        const target = targets.reduce((best, t) =>
          getEvidenceCountForPlayer(t, playerId) < getEvidenceCountForPlayer(best, playerId) ? t : best
        );
        actions.push(assignCardToConspiracy(playerId, card.id, target.card.id));
        usedCards.add(card.id);
        if (actions.length >= 3) break; // Assign up to 3 cards
      }
    }

    return actions;
  },

  decideBroadcast(state, playerId) {
    const withEvidence = state.activeConspiracies.filter(
      c => getEvidenceCountForPlayer(c, playerId) > 0
    );

    if (withEvidence.length > 0) {
      const target = withEvidence[0];
      const evidencePos = getEvidencePosition(target, playerId)!;
      const leading = getLeadingPosition(target);
      // Bluff 20% of the time if momentum is on the other side
      const shouldBluff = leading && leading.position !== evidencePos && Math.random() < 0.2;
      const position = shouldBluff ? leading!.position : evidencePos;
      return { type: 'BROADCAST', playerId, conspiracyId: target.card.id, position };
    }

    // If no evidence, still broadcast aggressively on random conspiracy
    const target = state.activeConspiracies[Math.floor(Math.random() * state.activeConspiracies.length)];
    return {
      type: 'BROADCAST',
      playerId,
      conspiracyId: target.card.id,
      position: pickRandomPosition(),
    };
  },
};

// ── Strategy 3: Follower ──
// Light commit, heavily uses sequential info, follows whatever's been broadcast

const follower: AIStrategy = {
  name: 'Follower',

  decideCommit(state, playerId) {
    const player = getPlayer(state, playerId);
    const actions: GameAction[] = [];

    // Assign only 1 card
    const card = player.hand[0];
    if (card) {
      const targets = getSupportableConspiracies(card, state);
      if (targets.length > 0) {
        actions.push(assignCardToConspiracy(playerId, card.id, targets[0].card.id));
      }
    }

    return actions;
  },

  decideBroadcast(state, playerId) {
    const threshold = state.consensusThreshold;

    // Look for near-consensus conspiracies to bandwagon (70% of the time, follow regardless of evidence)
    if (Math.random() < 0.7) {
      for (const conspiracy of state.activeConspiracies) {
        const realCount = getBroadcastCountForPosition(conspiracy, 'REAL');
        const fakeCount = getBroadcastCountForPosition(conspiracy, 'FAKE');

        if (realCount === threshold - 1) {
          return { type: 'BROADCAST', playerId, conspiracyId: conspiracy.card.id, position: 'REAL' as Position };
        }
        if (fakeCount === threshold - 1) {
          return { type: 'BROADCAST', playerId, conspiracyId: conspiracy.card.id, position: 'FAKE' as Position };
        }
      }
    }

    // 50% chance to pass if no near-consensus opportunity
    if (Math.random() < 0.5) {
      return { type: 'PASS', playerId };
    }

    // Follow the leading position on any conspiracy
    for (const conspiracy of state.activeConspiracies) {
      const leading = getLeadingPosition(conspiracy);
      if (leading && leading.count > 0) {
        return {
          type: 'BROADCAST',
          playerId,
          conspiracyId: conspiracy.card.id,
          position: leading.position,
        };
      }
    }

    return { type: 'PASS', playerId };
  },
};

// ── Strategy 4: Cautious ──
// Focused commit, only broadcasts when evidence matches forming consensus

const cautious: AIStrategy = {
  name: 'Cautious',

  decideCommit(state, playerId) {
    const player = getPlayer(state, playerId);
    const actions: GameAction[] = [];
    const usedCards = new Set<string>();

    // Find best conspiracy to focus on (most specific cards we have)
    let bestConspiracy: ActiveConspiracy | null = null;
    let bestCount = 0;
    for (const conspiracy of state.activeConspiracies) {
      const specificCount = player.hand.filter(
        c => isSpecificTo(c, conspiracy.card.id) && !usedCards.has(c.id)
      ).length;
      if (specificCount > bestCount) {
        bestCount = specificCount;
        bestConspiracy = conspiracy;
      }
    }

    if (bestConspiracy) {
      // Assign all specific cards + generics to this conspiracy
      for (const card of player.hand) {
        if (usedCards.has(card.id)) continue;
        if (canSupport(card, bestConspiracy.card.id)) {
          actions.push(assignCardToConspiracy(playerId, card.id, bestConspiracy.card.id));
          usedCards.add(card.id);
          if (actions.length >= 3) break;
        }
      }
    }

    return actions;
  },

  decideBroadcast(state, playerId) {
    // Only broadcast if we have 2+ evidence on a conspiracy — match evidence position
    for (const conspiracy of state.activeConspiracies) {
      if (getEvidenceCountForPlayer(conspiracy, playerId) >= 2) {
        const evidencePos = getEvidencePosition(conspiracy, playerId)!;
        // Only broadcast if evidence matches forming consensus (or no consensus yet)
        const leading = getLeadingPosition(conspiracy);
        if (!leading || leading.position === evidencePos) {
          return {
            type: 'BROADCAST',
            playerId,
            conspiracyId: conspiracy.card.id,
            position: evidencePos,
          };
        }
      }
    }

    // Or if consensus is very close and we're on the majority side with matching evidence
    for (const conspiracy of state.activeConspiracies) {
      const leading = getLeadingPosition(conspiracy);
      if (leading && leading.count >= state.consensusThreshold - 1) {
        const evidencePos = getEvidencePosition(conspiracy, playerId);
        if (evidencePos === leading.position) {
          return {
            type: 'BROADCAST',
            playerId,
            conspiracyId: conspiracy.card.id,
            position: leading.position,
          };
        }
      }
    }

    return { type: 'PASS', playerId };
  },
};

// ── Strategy 5: Opportunist ──
// Spread commit, bluffs when expected value of joining majority exceeds honest play

const opportunist: AIStrategy = {
  name: 'Opportunist',

  decideCommit(state, playerId) {
    const player = getPlayer(state, playerId);
    const actions: GameAction[] = [];
    const usedCards = new Set<string>();

    // Spread evidence across 2-3 conspiracies
    const conspiracies = [...state.activeConspiracies].sort(() => Math.random() - 0.5);
    let assigned = 0;

    for (const card of player.hand) {
      if (usedCards.has(card.id) || assigned >= 3) break;
      const target = conspiracies.find(c => canSupport(card, c.card.id));
      if (target) {
        actions.push(assignCardToConspiracy(playerId, card.id, target.card.id));
        usedCards.add(card.id);
        assigned++;
      }
    }

    return actions;
  },

  decideBroadcast(state, playerId) {
    const threshold = state.consensusThreshold;

    // Bandwagon if consensus is forming — bluff to join majority even if evidence disagrees
    for (const conspiracy of state.activeConspiracies) {
      const leading = getLeadingPosition(conspiracy);
      if (leading && leading.count >= threshold - 1) {
        return {
          type: 'BROADCAST',
          playerId,
          conspiracyId: conspiracy.card.id,
          position: leading.position,
        };
      }
    }

    // Otherwise broadcast where we have evidence, matching evidence position
    for (const conspiracy of state.activeConspiracies) {
      if (getEvidenceCountForPlayer(conspiracy, playerId) > 0) {
        const evidencePos = getEvidencePosition(conspiracy, playerId)!;
        const leading = getLeadingPosition(conspiracy);
        // If momentum is against evidence, bluff to join majority (opportunistic)
        if (leading && leading.position !== evidencePos && leading.count >= 1) {
          return {
            type: 'BROADCAST',
            playerId,
            conspiracyId: conspiracy.card.id,
            position: leading.position,
          };
        }
        return {
          type: 'BROADCAST',
          playerId,
          conspiracyId: conspiracy.card.id,
          position: evidencePos,
        };
      }
    }

    // Last resort: join any broadcast in progress
    for (const conspiracy of state.activeConspiracies) {
      const leading = getLeadingPosition(conspiracy);
      if (leading) {
        return {
          type: 'BROADCAST',
          playerId,
          conspiracyId: conspiracy.card.id,
          position: leading.position,
        };
      }
    }

    return { type: 'PASS', playerId };
  },
};

// ── Strategy Registry ──

export const STRATEGIES: Record<string, AIStrategy> = {
  'Evidence-Only': evidenceOnly,
  'Aggressive': aggressive,
  'Follower': follower,
  'Cautious': cautious,
  'Opportunist': opportunist,
};

export function getStrategy(name: string): AIStrategy {
  const strategy = STRATEGIES[name];
  if (!strategy) throw new Error(`Unknown strategy: ${name}`);
  return strategy;
}

export const STRATEGY_NAMES = Object.keys(STRATEGIES);
