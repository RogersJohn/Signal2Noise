import { TrustEntry, TrustEvent, SocialPersonality, Signal } from './types';
import { GameState, ActiveConspiracy } from '../../engine/types';

export function initializeTrust(
  playerIds: string[],
  myId: string,
  personality: SocialPersonality
): Map<string, TrustEntry> {
  const trust = new Map<string, TrustEntry>();
  for (const id of playerIds) {
    if (id === myId) continue;
    trust.set(id, {
      targetId: id,
      score: personality.initialTrust,
      betrayalCount: 0,
      lastBetrayalRound: null,
      followThroughCount: 0,
    });
  }
  return trust;
}

export function detectTrustEvents(
  myId: string,
  signals: Signal[],
  state: GameState,
  roundResults: GameState['roundResults']
): TrustEvent[] {
  const events: TrustEvent[] = [];

  // Check signal follow-through
  for (const signal of signals) {
    if (signal.senderId === myId) continue;

    const broadcast = state.activeConspiracies.flatMap(c => c.broadcasts)
      .find(b => b.playerId === signal.senderId);

    if (broadcast) {
      if (broadcast.conspiracyId === signal.conspiracyId) {
        events.push({ type: 'followed_through', playerId: signal.senderId, delta: 0.15 });
      } else {
        events.push({ type: 'betrayed_signal', playerId: signal.senderId, delta: -0.25 });
      }
    }
  }

  // Check consensus alignment
  const myBroadcast = state.activeConspiracies.flatMap(c => c.broadcasts)
    .find(b => b.playerId === myId);

  if (myBroadcast) {
    for (const result of roundResults) {
      if (!result.consensusReached) continue;
      const myResult = result.playerResults.find(r => r.playerId === myId);
      if (!myResult) continue;

      for (const pr of result.playerResults) {
        if (pr.playerId === myId) continue;
        if (pr.position === myResult.position) {
          events.push({ type: 'joined_my_consensus', playerId: pr.playerId, delta: 0.1 });
        } else {
          events.push({ type: 'opposed_my_consensus', playerId: pr.playerId, delta: -0.15 });
        }
      }
    }
  }

  return events;
}

export function updateTrust(
  current: Map<string, TrustEntry>,
  events: TrustEvent[],
  personality: SocialPersonality,
  round: number
): Map<string, TrustEntry> {
  const updated = new Map<string, TrustEntry>();

  for (const [id, entry] of current) {
    updated.set(id, { ...entry });
  }

  // Apply events
  const betrayedThisRound = new Set<string>();
  for (const event of events) {
    const entry = updated.get(event.playerId);
    if (!entry) continue;

    entry.score = clamp(entry.score + event.delta, -1, 1);

    if (event.type === 'betrayed_signal' || event.type === 'opposed_my_consensus') {
      entry.betrayalCount++;
      entry.lastBetrayalRound = round;
      betrayedThisRound.add(event.playerId);
    }
    if (event.type === 'followed_through') {
      entry.followThroughCount++;
    }
  }

  // Natural trust recovery
  for (const [id, entry] of updated) {
    if (betrayedThisRound.has(id)) continue;

    const roundsSinceBetrayal = entry.lastBetrayalRound !== null
      ? round - entry.lastBetrayalRound
      : Infinity;

    if (roundsSinceBetrayal > personality.betrayalMemory) {
      const diff = personality.initialTrust - entry.score;
      entry.score = clamp(
        entry.score + diff * personality.trustRecoveryRate,
        -1, 1
      );
    }
  }

  return updated;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getTrustScore(trust: Map<string, TrustEntry>, playerId: string): number {
  return trust.get(playerId)?.score ?? 0;
}
