import { Signal, SocialPersonality, AdaptiveState, BeliefState, TrustEntry } from './types';
import { GameState, ActiveConspiracy, Position } from '../../engine/types';
import { getTrustScore } from './trustTracker';

export function generateSignal(
  state: GameState,
  playerId: string,
  personality: SocialPersonality,
  adaptiveState: AdaptiveState
): Signal {
  // Find conspiracy where this player has most evidence
  let bestConspiracy = '';
  let bestCount = 0;

  for (const ac of state.activeConspiracies) {
    const count = ac.evidenceAssignments.filter(a => a.playerId === playerId).length;
    if (count > bestCount) {
      bestCount = count;
      bestConspiracy = ac.card.id;
    }
  }

  // Decide whether to bluff
  if (Math.random() < adaptiveState.currentDeceptionRate) {
    // Pick a different conspiracy for bluff
    const otherConspiracies = state.activeConspiracies
      .filter(c => c.card.id !== bestConspiracy)
      .sort((a, b) => {
        // Prefer conspiracies where others have evidence (more credible bluff)
        const aCount = a.evidenceAssignments.filter(e => e.playerId !== playerId).length;
        const bCount = b.evidenceAssignments.filter(e => e.playerId !== playerId).length;
        return bCount - aCount;
      });

    const bluffTarget = otherConspiracies.length > 0
      ? otherConspiracies[0].card.id
      : bestConspiracy;

    return {
      senderId: playerId,
      conspiracyId: bluffTarget,
      claimedStrength: 'strong',
      intent: 'lead',
      truthful: false,
    };
  }

  // Honest signal
  const strength: Signal['claimedStrength'] = bestCount >= 2 ? 'strong' : bestCount === 1 ? 'moderate' : 'weak';
  const intent: Signal['intent'] = bestCount >= 2 ? 'lead' : bestCount === 1 ? 'join' : 'avoid';

  return {
    senderId: playerId,
    conspiracyId: bestConspiracy || state.activeConspiracies[0].card.id,
    claimedStrength: strength,
    intent: intent,
    truthful: true,
  };
}

export function interpretSignals(
  signals: Signal[],
  myId: string,
  trustScores: Map<string, TrustEntry>,
  state: GameState
): BeliefState {
  const beliefs: BeliefState = new Map();

  // Initialize all active conspiracies with zero belief
  for (const ac of state.activeConspiracies) {
    beliefs.set(ac.card.id, 0);
  }

  for (const signal of signals) {
    if (signal.senderId === myId) continue;

    const trust = getTrustScore(trustScores, signal.senderId);

    // Cross-reference: check visible commit count vs claimed strength
    const conspiracy = state.activeConspiracies.find(c => c.card.id === signal.conspiracyId);
    const visibleCommits = conspiracy
      ? conspiracy.evidenceAssignments.filter(a => a.playerId === signal.senderId).length
      : 0;

    const credible = isCredible(signal.claimedStrength, visibleCommits);
    const weight = ((trust + 1) / 2) * (credible ? 1.0 : 0.3);

    const current = beliefs.get(signal.conspiracyId) ?? 0;
    beliefs.set(signal.conspiracyId, current + weight);
  }

  return beliefs;
}

function isCredible(claimedStrength: Signal['claimedStrength'], visibleCommits: number): boolean {
  switch (claimedStrength) {
    case 'strong': return visibleCommits >= 2;
    case 'moderate': return visibleCommits >= 1;
    case 'weak': return true; // claiming weak is always credible
  }
}

export function getHighestBelief(beliefs: BeliefState): { conspiracyId: string; weight: number } | null {
  let best: { conspiracyId: string; weight: number } | null = null;
  for (const [id, weight] of beliefs) {
    if (weight > 0 && (!best || weight > best.weight)) {
      best = { conspiracyId: id, weight };
    }
  }
  return best;
}
