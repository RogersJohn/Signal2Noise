import { calculatePlayerScore, resolveConspiracy, resolveAllConspiracies, playerHasEvidence, playerHasSpecificEvidence, isFirstBroadcaster, doesEvidenceMatchBroadcast } from '../scoring';
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

function assignment(playerId: string, specific = false, position: 'REAL' | 'FAKE' = 'REAL'): EvidenceAssignment {
  return { cardId: `card_${playerId}`, playerId, conspiracyId: 'test', specific, position };
}

describe('calculatePlayerScore', () => {
  it('majority with evidence matching broadcast: 3 points', () => {
    const s = calculatePlayerScore(true, true, false, false, 2, 2, true);
    expect(s.total).toBe(3);
    expect(s.base).toBe(3);
  });

  it('majority with evidence NOT matching broadcast (bluff): 2 points', () => {
    const s = calculatePlayerScore(true, true, false, false, 2, 2, false);
    expect(s.total).toBe(2);
    expect(s.base).toBe(2);
  });

  it('majority with specific evidence matching: 4 points', () => {
    const s = calculatePlayerScore(true, true, true, false, 2, 2, true);
    expect(s.total).toBe(4);
    expect(s.specificBonus).toBe(1);
  });

  it('majority with specific evidence NOT matching: no specific bonus', () => {
    const s = calculatePlayerScore(true, true, true, false, 2, 2, false);
    expect(s.total).toBe(2);
    expect(s.specificBonus).toBe(0);
  });

  it('majority bandwagon (no evidence): 2 points', () => {
    const s = calculatePlayerScore(true, false, false, false, 2, 2);
    expect(s.total).toBe(2);
    expect(s.base).toBe(2);
  });

  it('first mover bonus is nerfed to 0', () => {
    const s = calculatePlayerScore(true, true, false, true, 2, 2, true);
    expect(s.firstMoverBonus).toBe(0);
    expect(s.total).toBe(3);
  });

  it('consensus size bonus: +1 per player beyond threshold', () => {
    const s = calculatePlayerScore(true, true, false, false, 4, 2, true);
    expect(s.consensusSizeBonus).toBe(2);
    expect(s.total).toBe(5);
  });

  it('minority side: 0 points', () => {
    const s = calculatePlayerScore(false, true, true, true, 2, 2, true);
    expect(s.total).toBe(0);
  });

  it('max scoring: specific match + consensus bonus', () => {
    const s = calculatePlayerScore(true, true, true, true, 4, 2, true);
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

describe('doesEvidenceMatchBroadcast', () => {
  it('returns true when evidence position matches broadcast', () => {
    const c = makeConspiracy([], [assignment('p1', false, 'REAL')]);
    expect(doesEvidenceMatchBroadcast(c, 'p1', 'REAL')).toBe(true);
  });

  it('returns false when evidence position differs from broadcast', () => {
    const c = makeConspiracy([], [assignment('p1', false, 'REAL')]);
    expect(doesEvidenceMatchBroadcast(c, 'p1', 'FAKE')).toBe(false);
  });

  it('returns false when player has no evidence', () => {
    const c = makeConspiracy([], []);
    expect(doesEvidenceMatchBroadcast(c, 'p1', 'REAL')).toBe(false);
  });

  it('uses majority position with mixed evidence', () => {
    const c = makeConspiracy([], [
      assignment('p1', false, 'REAL'),
      assignment('p1', false, 'REAL'),
      assignment('p1', false, 'FAKE'),
    ]);
    // 2 REAL vs 1 FAKE — majority is REAL
    expect(doesEvidenceMatchBroadcast(c, 'p1', 'REAL')).toBe(true);
    expect(doesEvidenceMatchBroadcast(c, 'p1', 'FAKE')).toBe(false);
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
  it('scores majority with matching evidence correctly', () => {
    const c = makeConspiracy(
      [broadcast('p1', 'REAL'), broadcast('p2', 'REAL'), broadcast('p3', 'FAKE')],
      [assignment('p1', false, 'REAL'), assignment('p2', false, 'REAL')]
    );
    const result = resolveConspiracy(c, 2);
    expect(result.consensusReached).toBe(true);
    expect(result.consensusPosition).toBe('REAL');

    const p1 = result.playerResults.find(r => r.playerId === 'p1')!;
    expect(p1.onMajority).toBe(true);
    expect(p1.hasEvidence).toBe(true);
    expect(p1.evidenceMatchesBroadcast).toBe(true);
    expect(p1.points).toBeGreaterThanOrEqual(3);
    expect(p1.credibilityChange).toBe(1);

    const p3 = result.playerResults.find(r => r.playerId === 'p3')!;
    expect(p3.onMajority).toBe(false);
    expect(p3.points).toBe(0);
    expect(p3.credibilityChange).toBe(-1);
  });

  it('scores majority with mismatching evidence as bluff (2 pts)', () => {
    const c = makeConspiracy(
      [broadcast('p1', 'REAL'), broadcast('p2', 'REAL')],
      [assignment('p1', false, 'FAKE')] // p1 has FAKE evidence but broadcast REAL
    );
    const result = resolveConspiracy(c, 2);
    const p1 = result.playerResults.find(r => r.playerId === 'p1')!;
    expect(p1.hasEvidence).toBe(true);
    expect(p1.evidenceMatchesBroadcast).toBe(false);
    expect(p1.points).toBe(2); // bluff = bandwagon points
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
      [assignment('p1', false, 'REAL')] // only p1 has evidence
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
      [assignment('p1', false, 'REAL'), assignment('p2', false, 'REAL')]
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
