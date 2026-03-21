import { getConsensusThreshold, checkConsensus, isOnMajority } from '../consensus';
import { ActiveConspiracy, BroadcastEntry } from '../types';

function makeConspiracy(broadcasts: BroadcastEntry[]): ActiveConspiracy {
  return {
    card: { id: 'test', name: 'Test', description: 'test', icon: '🔍' },
    evidenceAssignments: [],
    broadcasts,
  };
}

function broadcast(playerId: string, position: 'REAL' | 'FAKE'): BroadcastEntry {
  return { playerId, conspiracyId: 'test', position, isFirstOnConspiracy: false };
}

describe('getConsensusThreshold', () => {
  it('returns 2 for 3 players', () => expect(getConsensusThreshold(3)).toBe(2));
  it('returns 2 for 4 players', () => expect(getConsensusThreshold(4)).toBe(2));
  it('returns 3 for 5 players', () => expect(getConsensusThreshold(5)).toBe(3));
});

describe('checkConsensus', () => {
  it('detects REAL consensus', () => {
    const c = makeConspiracy([broadcast('p1', 'REAL'), broadcast('p2', 'REAL')]);
    const result = checkConsensus(c, 2);
    expect(result.reached).toBe(true);
    expect(result.position).toBe('REAL');
    expect(result.majorityCount).toBe(2);
  });

  it('detects FAKE consensus', () => {
    const c = makeConspiracy([broadcast('p1', 'FAKE'), broadcast('p2', 'FAKE')]);
    const result = checkConsensus(c, 2);
    expect(result.reached).toBe(true);
    expect(result.position).toBe('FAKE');
  });

  it('returns no consensus when threshold not met', () => {
    const c = makeConspiracy([broadcast('p1', 'REAL'), broadcast('p2', 'FAKE')]);
    const result = checkConsensus(c, 2);
    expect(result.reached).toBe(false);
  });

  it('no consensus with no broadcasts', () => {
    const c = makeConspiracy([]);
    const result = checkConsensus(c, 2);
    expect(result.reached).toBe(false);
  });

  it('handles both sides reaching threshold — higher count wins', () => {
    const c = makeConspiracy([
      broadcast('p1', 'REAL'), broadcast('p2', 'REAL'), broadcast('p3', 'REAL'),
      broadcast('p4', 'FAKE'), broadcast('p5', 'FAKE'),
    ]);
    const result = checkConsensus(c, 2);
    expect(result.reached).toBe(true);
    expect(result.position).toBe('REAL');
  });

  it('no consensus when both sides tied at threshold', () => {
    const c = makeConspiracy([
      broadcast('p1', 'REAL'), broadcast('p2', 'REAL'),
      broadcast('p3', 'FAKE'), broadcast('p4', 'FAKE'),
    ]);
    const result = checkConsensus(c, 2);
    expect(result.reached).toBe(false);
  });

  it('5-player game needs 3 for consensus', () => {
    const c = makeConspiracy([
      broadcast('p1', 'REAL'), broadcast('p2', 'REAL'),
      broadcast('p3', 'FAKE'),
    ]);
    const result = checkConsensus(c, 3);
    expect(result.reached).toBe(false);
  });
});

describe('isOnMajority', () => {
  it('returns true when positions match', () => {
    expect(isOnMajority('REAL', 'REAL')).toBe(true);
  });

  it('returns false when positions differ', () => {
    expect(isOnMajority('REAL', 'FAKE')).toBe(false);
  });
});
