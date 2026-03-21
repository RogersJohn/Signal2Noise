import { EvidenceCard, ConspiracyCard } from './types';

/**
 * Fisher-Yates shuffle. Returns a new array.
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Seeded shuffle using a simple LCG PRNG.
 */
export function seededShuffle<T>(array: readonly T[], seed: number): T[] {
  const result = [...array];
  let s = seed;
  const next = (): number => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Draw N cards from the top of a deck. Mutates the deck array.
 * Returns fewer cards if deck doesn't have enough.
 */
export function draw<T>(deck: T[], count: number): T[] {
  return deck.splice(0, Math.min(count, deck.length));
}

/**
 * Check if an evidence card can support a given conspiracy.
 */
export function canSupport(card: EvidenceCard, conspiracyId: string): boolean {
  return card.targets.includes('ALL') || card.targets.includes(conspiracyId);
}

/**
 * Check if an evidence card is specific to a conspiracy.
 */
export function isSpecificTo(card: EvidenceCard, conspiracyId: string): boolean {
  return card.specific && card.targets.includes(conspiracyId);
}

/**
 * Deal initial hands to players from the evidence deck.
 * Returns the hands and remaining deck.
 */
export function dealHands(
  deck: EvidenceCard[],
  playerCount: number,
  handSize: number
): { hands: EvidenceCard[][]; remainingDeck: EvidenceCard[] } {
  const deckCopy = [...deck];
  const hands: EvidenceCard[][] = [];
  for (let i = 0; i < playerCount; i++) {
    hands.push(draw(deckCopy, handSize));
  }
  return { hands, remainingDeck: deckCopy };
}

/**
 * Set up 5 active conspiracies from the conspiracy deck.
 */
export function setupConspiracies(
  deck: ConspiracyCard[],
  count: number = 5
): { active: ConspiracyCard[]; remaining: ConspiracyCard[] } {
  const deckCopy = [...deck];
  const active = draw(deckCopy, count);
  return { active, remaining: deckCopy };
}
