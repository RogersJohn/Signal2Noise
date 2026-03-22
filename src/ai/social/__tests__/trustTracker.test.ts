import { initializeTrust, updateTrust, getTrustScore, detectTrustEvents } from '../trustTracker';
import { SocialPersonality, TrustEvent } from '../types';

const testPersonality: SocialPersonality = {
  name: 'Test',
  baseDeceptionRate: 0.2,
  signalInfluence: 0.5,
  initialTrust: 0.3,
  trustRecoveryRate: 0.1,
  betrayalMemory: 2,
  deceptionDecayPerCatch: 0.05,
  desperationThreshold: 5,
  desperationBoost: 0.2,
  retaliationRate: 0.5,
  loyaltyRate: 0.5,
  opportunismRate: 0.5,
  betrayalPointThreshold: 3,
};

describe('initializeTrust', () => {
  it('creates trust entries for all other players', () => {
    const trust = initializeTrust(['p0', 'p1', 'p2'], 'p0', testPersonality);
    expect(trust.size).toBe(2);
    expect(trust.has('p0')).toBe(false);
    expect(trust.has('p1')).toBe(true);
  });

  it('starts at initialTrust', () => {
    const trust = initializeTrust(['p0', 'p1'], 'p0', testPersonality);
    expect(getTrustScore(trust, 'p1')).toBe(0.3);
  });
});

describe('updateTrust', () => {
  it('follow-through increases trust', () => {
    const trust = initializeTrust(['p0', 'p1'], 'p0', testPersonality);
    const events: TrustEvent[] = [{ type: 'followed_through', playerId: 'p1', delta: 0.15 }];
    const updated = updateTrust(trust, events, testPersonality, 1);
    expect(getTrustScore(updated, 'p1')).toBeGreaterThan(0.3);
  });

  it('betrayal decreases trust asymmetrically', () => {
    const trust = initializeTrust(['p0', 'p1'], 'p0', testPersonality);
    const events: TrustEvent[] = [{ type: 'betrayed_signal', playerId: 'p1', delta: -0.25 }];
    const updated = updateTrust(trust, events, testPersonality, 1);
    expect(getTrustScore(updated, 'p1')).toBeCloseTo(0.05);
  });

  it('trust clamps to [-1, +1]', () => {
    const trust = initializeTrust(['p0', 'p1'], 'p0', testPersonality);
    const events: TrustEvent[] = Array(10).fill({ type: 'betrayed_signal', playerId: 'p1', delta: -0.25 });
    const updated = updateTrust(trust, events, testPersonality, 1);
    expect(getTrustScore(updated, 'p1')).toBe(-1);
  });

  it('trust recovers toward initial value over time', () => {
    const trust = initializeTrust(['p0', 'p1'], 'p0', testPersonality);
    // Betray in round 1
    const events: TrustEvent[] = [{ type: 'betrayed_signal', playerId: 'p1', delta: -0.25 }];
    let updated = updateTrust(trust, events, testPersonality, 1);
    const afterBetrayal = getTrustScore(updated, 'p1');

    // No events in round 4 (after betrayalMemory of 2 rounds)
    updated = updateTrust(updated, [], testPersonality, 4);
    expect(getTrustScore(updated, 'p1')).toBeGreaterThan(afterBetrayal);
  });

  it('betrayal memory suppresses recovery for N rounds', () => {
    const trust = initializeTrust(['p0', 'p1'], 'p0', testPersonality);
    const events: TrustEvent[] = [{ type: 'betrayed_signal', playerId: 'p1', delta: -0.25 }];
    let updated = updateTrust(trust, events, testPersonality, 1);
    const afterBetrayal = getTrustScore(updated, 'p1');

    // Round 2 is within betrayalMemory — no recovery
    updated = updateTrust(updated, [], testPersonality, 2);
    expect(getTrustScore(updated, 'p1')).toBeCloseTo(afterBetrayal);
  });
});
