import { calculatePlayerScore, resolveConspiracy, resolveAllConspiracies, playerHasEvidence, playerHasSpecificEvidence, isFirstBroadcaster } from '../scoring';
import { ActiveConspiracy, BroadcastEntry, EvidenceAssignment } from '../types';

function makeConspiracy(
  broadcasts: BroadcastEntry[],
  assignments: EvidenceAssignment[] = []
): ActiveConspiracy {
  return {
    card: { id: 'test', name: 'Test', description: 'test', icon: '🔍' },
    evidenceAssignments: assignments,
    broadcasts,
  };
}

function broadcast(playerId: string, position: 'REAL' | 'FAKE', isFirst = false): BroadcastEntry {
  return { playerId, conspiracyId: 'test', position, isFirstOnConspiracy: isFirst };
}

function assignment(playerId: string, specific = false): EvidenceAssignment {
  return { cardId: `card_${playerId}`, playerId, conspiracyId: 'test', specific };
}

describe('calculatePlayerScore', () => {
  it('majority with evidence: 3 points', () => {
    const s = calculatePlayerScore(true, true, false, false, 2, 2);
    expect(s.total).toBe(3);
    expect(s.base).toBe(3);
  });

  it('majority with specific evidence: 4 points', () => {
    const s = calculatePlayerScore(true, true, true, false, 2, 2);
    expect(s.total).toBe(4);
    expect(s.specificBonus).toBe(1);
  });

  it('majority bandwagon (no evidence): 2 points', () => {
    const s = calculatePlayerScore(true, false, false, false, 2, 2);
    expect(s.total).toBe(2);
    expect(s.base).toBe(2);
  });

  it('first mover bonus is nerfed to 0', () => {
    const s = calculatePlayerScore(true, true, false, true, 2, 2);
    expect(s.firstMoverBonus).toBe(0);
    expect(s.total).toBe(3);
  });

  it('consensus size bonus: +1 per player beyond threshold', () => {
    const s = calculatePlayerScore(true, true, false, false, 4, 2);
    expect(s.consensusSizeBonus).toBe(2);
    expect(s.total).toBe(5);
  });

  it('minority side: 0 points', () => {
    const s = calculatePlayerScore(false, true, true, true, 2, 2);
    expect(s.total).toBe(0);
  });

  it('max scoring: specific + consensus bonus (first mover nerfed)', () => {
    const s = calculatePlayerScore(true, true, true, true, 4, 2);
    // base 3 + specific 1 + first mover 0 + consensus (4-2)=2 = 6
    expect(s.total).toBe(6);
  });
});

describe('playerHasEvidence', () => {
  it('returns true when player has assigned evidence', () => {
    const c = makeConspiracy([], [assignment('p1')]);
    expect(playerHasEvidence(c, 'p1')).toBe(true);
  });

  it('returns false when player has no evidence', () => {
    const c = makeConspiracy([], [assignment('p2')]);
    expect(playerHasEvidence(c, 'p1')).toBe(false);
  });
});

describe('playerHasSpecificEvidence', () => {
  it('returns true for specific assignment', () => {
    const c = makeConspiracy([], [assignment('p1', true)]);
    expect(playerHasSpecificEvidence(c, 'p1')).toBe(true);
  });

  it('returns false for generic assignment', () => {
    const c = makeConspiracy([], [assignment('p1', false)]);
    expect(playerHasSpecificEvidence(c, 'p1')).toBe(false);
  });
});

describe('isFirstBroadcaster', () => {
  it('returns true for first broadcaster', () => {
    const c = makeConspiracy([broadcast('p1', 'REAL'), broadcast('p2', 'REAL')]);
    expect(isFirstBroadcaster(c, 'p1')).toBe(true);
  });

  it('returns false for second broadcaster', () => {
    const c = makeConspiracy([broadcast('p1', 'REAL'), broadcast('p2', 'REAL')]);
    expect(isFirstBroadcaster(c, 'p2')).toBe(false);
  });
});

describe('resolveConspiracy', () => {
  it('scores majority with evidence correctly', () => {
    const c = makeConspiracy(
      [broadcast('p1', 'REAL'), broadcast('p2', 'REAL'), broadcast('p3', 'FAKE')],
      [assignment('p1'), assignment('p2')]
    );
    const result = resolveConspiracy(c, 2);
    expect(result.consensusReached).toBe(true);
    expect(result.consensusPosition).toBe('REAL');

    const p1 = result.playerResults.find(r => r.playerId === 'p1')!;
    expect(p1.onMajority).toBe(true);
    expect(p1.hasEvidence).toBe(true);
    expect(p1.points).toBeGreaterThanOrEqual(3);
    expect(p1.credibilityChange).toBe(1);

    const p3 = result.playerResults.find(r => r.playerId === 'p3')!;
    expect(p3.onMajority).toBe(false);
    expect(p3.points).toBe(0);
    expect(p3.credibilityChange).toBe(-1);
  });

  it('no consensus: everyone gets 0', () => {
    const c = makeConspiracy(
      [broadcast('p1', 'REAL'), broadcast('p2', 'FAKE')],
      [assignment('p1')]
    );
    const result = resolveConspiracy(c, 2);
    expect(result.consensusReached).toBe(false);
    result.playerResults.forEach(r => {
      expect(r.points).toBe(0);
      expect(r.credibilityChange).toBe(0);
    });
  });

  it('bandwagon scores 2 points', () => {
    const c = makeConspiracy(
      [broadcast('p1', 'REAL'), broadcast('p2', 'REAL')],
      [assignment('p1')] // only p1 has evidence
    );
    const result = resolveConspiracy(c, 2);
    const p2 = result.playerResults.find(r => r.playerId === 'p2')!;
    expect(p2.hasEvidence).toBe(false);
    // p2 base is 2 (bandwagon), no consensus bonus since majority=threshold
    expect(p2.points).toBe(2);
  });

  it('first mover gets +1 bonus', () => {
    const c = makeConspiracy(
      [broadcast('p1', 'REAL'), broadcast('p2', 'REAL')],
      [assignment('p1'), assignment('p2')]
    );
    const result = resolveConspiracy(c, 2);
    const p1 = result.playerResults.find(r => r.playerId === 'p1')!;
    const p2 = result.playerResults.find(r => r.playerId === 'p2')!;
    expect(p1.isFirstMover).toBe(true);
    expect(p2.isFirstMover).toBe(false);
    expect(p1.points).toBe(p2.points); // first mover bonus nerfed to 0
  });
});

describe('resolveAllConspiracies', () => {
  it('only resolves conspiracies with broadcasts', () => {
    const conspiracies: ActiveConspiracy[] = [
      makeConspiracy([broadcast('p1', 'REAL'), broadcast('p2', 'REAL')]),
      makeConspiracy([]), // no broadcasts
    ];
    const results = resolveAllConspiracies(conspiracies, 2);
    expect(results).toHaveLength(1);
  });
});
