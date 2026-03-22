import {
  applyDeceptionDecay,
  applyDesperationEscalation,
  applyGrudgeUpdate,
  applyLateGameCalculation,
  createInitialAdaptiveState,
} from '../adaptiveBehavior';
import { SocialPersonality, TrustEvent } from '../types';

const personality: SocialPersonality = {
  name: 'Test', baseDeceptionRate: 0.3, signalInfluence: 0.5,
  initialTrust: 0.3, trustRecoveryRate: 0.1, betrayalMemory: 2,
  deceptionDecayPerCatch: 0.1, desperationThreshold: 5, desperationBoost: 0.2,
  retaliationRate: 0.5, loyaltyRate: 0.5, opportunismRate: 0.5, betrayalPointThreshold: 3,
};

describe('applyDeceptionDecay', () => {
  it('reduces deception rate when caught', () => {
    const state = createInitialAdaptiveState(personality);
    const result = applyDeceptionDecay(state, true, personality);
    expect(result.currentDeceptionRate).toBeCloseTo(0.2);
    expect(result.bluffsCaught).toBe(1);
  });

  it('does not change when not caught', () => {
    const state = createInitialAdaptiveState(personality);
    const result = applyDeceptionDecay(state, false, personality);
    expect(result.currentDeceptionRate).toBe(0.3);
  });

  it('never drops below 0.02', () => {
    let state = createInitialAdaptiveState({ ...personality, baseDeceptionRate: 0.05 });
    state = applyDeceptionDecay(state, true, personality);
    expect(state.currentDeceptionRate).toBe(0.02);
  });
});

describe('applyDesperationEscalation', () => {
  it('increases risk tolerance when behind and round >= 4', () => {
    const state = createInitialAdaptiveState(personality);
    const result = applyDesperationEscalation(state, 5, 15, 4, personality);
    expect(result.currentRiskTolerance).toBeGreaterThan(state.currentRiskTolerance);
  });

  it('does not trigger before round 4', () => {
    const state = createInitialAdaptiveState(personality);
    const result = applyDesperationEscalation(state, 5, 15, 3, personality);
    expect(result.currentRiskTolerance).toBe(state.currentRiskTolerance);
  });

  it('does not trigger when not behind by threshold', () => {
    const state = createInitialAdaptiveState(personality);
    const result = applyDesperationEscalation(state, 10, 12, 4, personality);
    expect(result.currentRiskTolerance).toBe(state.currentRiskTolerance);
  });

  it('caps risk tolerance at 0.95', () => {
    let state = createInitialAdaptiveState(personality);
    state.currentRiskTolerance = 0.9;
    const result = applyDesperationEscalation(state, 0, 20, 5, personality);
    expect(result.currentRiskTolerance).toBeLessThanOrEqual(0.95);
  });
});

describe('applyGrudgeUpdate', () => {
  it('increases grudge on betrayal', () => {
    const state = createInitialAdaptiveState(personality);
    const events: TrustEvent[] = [{ type: 'betrayed_signal', playerId: 'p1', delta: -0.25 }];
    const result = applyGrudgeUpdate(state, events, 1, personality);
    expect(result.grudges.get('p1')).toBeCloseTo(0.3);
  });

  it('grudge decays after betrayalMemory rounds', () => {
    let state = createInitialAdaptiveState(personality);
    const events: TrustEvent[] = [{ type: 'betrayed_signal', playerId: 'p1', delta: -0.25 }];
    state = applyGrudgeUpdate(state, events, 1, personality);

    // Round 4: after betrayalMemory (2) rounds, decay kicks in
    state = applyGrudgeUpdate(state, [], 4, personality);
    expect(state.grudges.get('p1') ?? 0).toBeLessThan(0.3);
  });

  it('grudge caps at 1.0', () => {
    let state = createInitialAdaptiveState(personality);
    for (let i = 0; i < 5; i++) {
      const events: TrustEvent[] = [{ type: 'betrayed_signal', playerId: 'p1', delta: -0.25 }];
      state = applyGrudgeUpdate(state, events, i + 1, personality);
    }
    expect(state.grudges.get('p1')).toBeLessThanOrEqual(1.0);
  });
});

describe('applyLateGameCalculation', () => {
  it('overrides risk tolerance in rounds 5-6 when behind', () => {
    const state = createInitialAdaptiveState(personality);
    const result = applyLateGameCalculation(state, 10, [10, 15, 8], 5);
    expect(result.currentRiskTolerance).toBeGreaterThanOrEqual(0.8);
  });

  it('does nothing before round 5', () => {
    const state = createInitialAdaptiveState(personality);
    const result = applyLateGameCalculation(state, 5, [5, 15, 8], 4);
    expect(result.currentRiskTolerance).toBe(state.currentRiskTolerance);
  });
});
