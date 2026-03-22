import { generateSignal, interpretSignals, getHighestBelief } from '../signalLayer';
import { initializeTrust } from '../trustTracker';
import { createInitialAdaptiveState } from '../adaptiveBehavior';
import { SocialPersonality, Signal } from '../types';
import { GameState, ActiveConspiracy } from '../../../engine/types';

const personality: SocialPersonality = {
  name: 'Test', baseDeceptionRate: 0.0, signalInfluence: 0.5,
  initialTrust: 0.3, trustRecoveryRate: 0.1, betrayalMemory: 2,
  deceptionDecayPerCatch: 0.05, desperationThreshold: 5, desperationBoost: 0.2,
  retaliationRate: 0.5, loyaltyRate: 0.5, opportunismRate: 0.5, betrayalPointThreshold: 3,
};

function makeState(conspiracyIds: string[], assignments: Record<string, string[]> = {}): GameState {
  const activeConspiracies: ActiveConspiracy[] = conspiracyIds.map(id => ({
    card: { id, name: id, description: '', icon: '' },
    evidenceAssignments: (assignments[id] ?? []).map(playerId => ({
      cardId: `card_${playerId}_${id}`, playerId, conspiracyId: id, specific: false,
    })),
    broadcasts: [],
  }));
  return { activeConspiracies, players: [{ id: 'p0' }, { id: 'p1' }] } as unknown as GameState;
}

describe('generateSignal', () => {
  it('honest signal matches best evidence conspiracy', () => {
    const state = makeState(['c1', 'c2'], { c1: ['p0', 'p0'], c2: ['p0'] });
    const adaptive = createInitialAdaptiveState({ ...personality, baseDeceptionRate: 0 });
    const signal = generateSignal(state, 'p0', personality, adaptive);
    expect(signal.conspiracyId).toBe('c1');
    expect(signal.truthful).toBe(true);
  });

  it('signal strength correlates with evidence count', () => {
    const state = makeState(['c1'], { c1: ['p0', 'p0'] });
    const adaptive = createInitialAdaptiveState({ ...personality, baseDeceptionRate: 0 });
    const signal = generateSignal(state, 'p0', personality, adaptive);
    expect(signal.claimedStrength).toBe('strong');
    expect(signal.intent).toBe('lead');
  });

  it('weak signal when no evidence', () => {
    const state = makeState(['c1', 'c2']);
    const adaptive = createInitialAdaptiveState({ ...personality, baseDeceptionRate: 0 });
    const signal = generateSignal(state, 'p0', personality, adaptive);
    expect(signal.claimedStrength).toBe('weak');
    expect(signal.intent).toBe('avoid');
  });

  it('bluff picks different conspiracy', () => {
    const state = makeState(['c1', 'c2'], { c1: ['p0', 'p0'] });
    const adaptive = createInitialAdaptiveState({ ...personality, baseDeceptionRate: 1.0 });
    const signal = generateSignal(state, 'p0', personality, adaptive);
    expect(signal.conspiracyId).not.toBe('c1');
    expect(signal.truthful).toBe(false);
  });
});

describe('interpretSignals', () => {
  it('higher trust produces higher belief weight', () => {
    const state = makeState(['c1', 'c2']);
    const trust = initializeTrust(['p0', 'p1', 'p2'], 'p0', { ...personality, initialTrust: 0.8 });
    const signals: Signal[] = [
      { senderId: 'p1', conspiracyId: 'c1', claimedStrength: 'weak', intent: 'join', truthful: true },
    ];
    const beliefs = interpretSignals(signals, 'p0', trust, state);
    expect(beliefs.get('c1')!).toBeGreaterThan(0);
  });

  it('suspicious signal (strong claim, 0 evidence) gets low weight', () => {
    const state = makeState(['c1', 'c2']); // no evidence for p1
    const trust = initializeTrust(['p0', 'p1'], 'p0', personality);
    const signals: Signal[] = [
      { senderId: 'p1', conspiracyId: 'c1', claimedStrength: 'strong', intent: 'lead', truthful: false },
    ];
    const beliefs = interpretSignals(signals, 'p0', trust, state);
    const weight = beliefs.get('c1')!;
    // Weight should be low due to credibility check (0.3 multiplier)
    expect(weight).toBeLessThan(0.5);
  });

  it('getHighestBelief returns conspiracy with most weight', () => {
    const beliefs = new Map([['c1', 0.5], ['c2', 0.8], ['c3', 0.2]]);
    const best = getHighestBelief(beliefs);
    expect(best?.conspiracyId).toBe('c2');
  });
});
