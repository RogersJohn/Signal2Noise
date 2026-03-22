import { shuffle, seededShuffle, draw, canSupport, isSpecificTo, dealHands, setupConspiracies } from '../deck';
import { EvidenceCard, ConspiracyCard } from '../types';

const makeCard = (id: string, targets: string[] = ['ALL'], specific = false, position: 'REAL' | 'FAKE' = 'REAL'): EvidenceCard => ({
  id, name: `Card ${id}`, targets, specific, position, flavorText: 'test',
});

const makeConspiracy = (id: string): ConspiracyCard => ({
  id, name: `Conspiracy ${id}`, description: 'test', icon: '🔍',
});

describe('shuffle', () => {
  it('returns a new array with same elements', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = shuffle(arr);
    expect(result).toHaveLength(arr.length);
    expect(result.sort()).toEqual(arr.sort());
    expect(result).not.toBe(arr); // new array
  });

  it('does not mutate original', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });
});

describe('seededShuffle', () => {
  it('produces deterministic results with same seed', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = seededShuffle(arr, 42);
    const b = seededShuffle(arr, 42);
    expect(a).toEqual(b);
  });

  it('produces different results with different seeds', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = seededShuffle(arr, 42);
    const b = seededShuffle(arr, 99);
    expect(a).not.toEqual(b);
  });
});

describe('draw', () => {
  it('draws N cards from top of deck', () => {
    const deck = [1, 2, 3, 4, 5];
    const drawn = draw(deck, 3);
    expect(drawn).toEqual([1, 2, 3]);
    expect(deck).toEqual([4, 5]);
  });

  it('draws all remaining if deck has fewer than N', () => {
    const deck = [1, 2];
    const drawn = draw(deck, 5);
    expect(drawn).toEqual([1, 2]);
    expect(deck).toEqual([]);
  });

  it('returns empty array from empty deck', () => {
    const deck: number[] = [];
    const drawn = draw(deck, 3);
    expect(drawn).toEqual([]);
  });
});

describe('canSupport', () => {
  it('returns true for ALL cards', () => {
    const card = makeCard('1', ['ALL']);
    expect(canSupport(card, 'chemtrails')).toBe(true);
    expect(canSupport(card, 'bigfoot')).toBe(true);
  });

  it('returns true for matching specific card', () => {
    const card = makeCard('1', ['chemtrails'], true);
    expect(canSupport(card, 'chemtrails')).toBe(true);
  });

  it('returns false for non-matching specific card', () => {
    const card = makeCard('1', ['chemtrails'], true);
    expect(canSupport(card, 'bigfoot')).toBe(false);
  });
});

describe('isSpecificTo', () => {
  it('returns true for specific card targeting conspiracy', () => {
    const card = makeCard('1', ['chemtrails'], true);
    expect(isSpecificTo(card, 'chemtrails')).toBe(true);
  });

  it('returns false for generic card', () => {
    const card = makeCard('1', ['ALL'], false);
    expect(isSpecificTo(card, 'chemtrails')).toBe(false);
  });

  it('returns false for specific card targeting different conspiracy', () => {
    const card = makeCard('1', ['bigfoot'], true);
    expect(isSpecificTo(card, 'chemtrails')).toBe(false);
  });
});

describe('dealHands', () => {
  it('deals correct hand sizes', () => {
    const deck = Array.from({ length: 20 }, (_, i) => makeCard(`c${i}`));
    const { hands, remainingDeck } = dealHands(deck, 4, 5);
    expect(hands).toHaveLength(4);
    hands.forEach(h => expect(h).toHaveLength(5));
    expect(remainingDeck).toHaveLength(0);
  });

  it('deals partial hands if deck is too small', () => {
    const deck = Array.from({ length: 7 }, (_, i) => makeCard(`c${i}`));
    const { hands } = dealHands(deck, 4, 5);
    expect(hands[0]).toHaveLength(5);
    expect(hands[1]).toHaveLength(2);
    expect(hands[2]).toHaveLength(0);
  });
});

describe('setupConspiracies', () => {
  it('sets up correct number of active conspiracies', () => {
    const deck = Array.from({ length: 12 }, (_, i) => makeConspiracy(`c${i}`));
    const { active, remaining } = setupConspiracies(deck, 5);
    expect(active).toHaveLength(5);
    expect(remaining).toHaveLength(7);
  });

  it('handles deck smaller than requested count', () => {
    const deck = Array.from({ length: 3 }, (_, i) => makeConspiracy(`c${i}`));
    const { active, remaining } = setupConspiracies(deck, 5);
    expect(active).toHaveLength(3);
    expect(remaining).toHaveLength(0);
  });
});
