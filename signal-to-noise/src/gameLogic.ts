import { GameState, PlayerState, EvidenceCard } from './types';
import { CONSPIRACY_DECK } from './data/conspiracies';
import { EVIDENCE_DECK } from './data/evidence';

// Fisher-Yates shuffle
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Initialize game state
export function initializeGame(playerCount: number): GameState {
  if (playerCount < 3 || playerCount > 5) {
    throw new Error('Game requires 3-5 players');
  }

  // Shuffle decks
  const shuffledConspiracies = shuffle([...CONSPIRACY_DECK]);
  const shuffledEvidence = shuffle([...EVIDENCE_DECK]);

  // v4.5: Deal 5 conspiracies (more variety, conspiracies stay on board after reveal)
  const conspiracies = shuffledConspiracies.slice(0, 5);
  const conspiracyDeck = shuffledConspiracies.slice(5);

  // Create players (v4.0: expanded to 5 players)
  const playerColors = ['#3b82f6', '#ef4444', '#10b981', '#a855f7', '#f59e0b']; // blue, red, green, purple, orange
  const playerNames = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'];

  const players: PlayerState[] = [];
  let evidenceIndex = 0;

  for (let i = 0; i < playerCount; i++) {
    // Deal 3 evidence cards to each player initially
    // NOTE: Round 1 has 2 GATHER phases (handled in simulation/gameplay)
    // Round 1: Players will draw 2 cards twice (4 total in Round 1)
    // Round 2+: Players draw 2 cards once per round
    const evidenceHand = shuffledEvidence.slice(evidenceIndex, evidenceIndex + 3);
    evidenceIndex += 3;

    players.push({
      id: `player_${i + 1}`,
      name: playerNames[i],
      credibility: 5,
      audience: 0,
      evidenceHand,
      assignedEvidence: {},
      color: playerColors[i],
      broadcastHistory: []
    });
  }

  // Remaining evidence becomes the deck
  const evidenceDeck = shuffledEvidence.slice(evidenceIndex);

  return {
    conspiracies,
    conspiracyDeck,
    evidenceDeck,
    players,
    currentPlayerIndex: 0,
    advertiseQueue: [],
    broadcastQueue: [],
    phase: 'INVESTIGATE',
    round: 1,
    gameOver: false,
    winner: null,
    advancedRules: {
      counterBroadcasts: false,
      credibilityEffects: false,
      exposeAction: false,
      specialEvidence: false
    },
    totalRevealed: 0
  };
}

// Draw cards for a player
export function drawCards(
  player: PlayerState,
  deck: EvidenceCard[],
  count: number,
  activeConspiracies?: string[] // v4.6: Optional filter for active conspiracies
): { updatedPlayer: PlayerState; updatedDeck: EvidenceCard[] } {
  const handLimit = 5; // v3.7: reverted from 7 back to original
  const currentHandSize = player.evidenceHand.length;

  // v4.6: Filter deck to only cards that support active conspiracies
  // This solves the mismatch problem while preserving deduction
  let availableDeck = deck;
  if (activeConspiracies && activeConspiracies.length > 0) {
    availableDeck = deck.filter(card =>
      card.supportedConspiracies.includes('ALL') ||
      card.supportedConspiracies.some(id => activeConspiracies.includes(id))
    );
  }

  const cardsToAdd = Math.min(count, handLimit - currentHandSize, availableDeck.length);

  if (cardsToAdd <= 0) {
    return { updatedPlayer: player, updatedDeck: deck };
  }

  const drawnCards = availableDeck.slice(0, cardsToAdd);

  // Remove drawn cards from original deck (not filtered deck)
  const updatedDeck = deck.filter(card => !drawnCards.includes(card));

  const updatedPlayer = {
    ...player,
    evidenceHand: [...player.evidenceHand, ...drawnCards]
  };

  return { updatedPlayer, updatedDeck };
}

// Check if evidence card supports a conspiracy
export function canSupportConspiracy(evidence: EvidenceCard, conspiracyId: string): boolean {
  return (
    evidence.supportedConspiracies.includes('ALL') ||
    evidence.supportedConspiracies.includes(conspiracyId)
  );
}

// Consensus detection
export function detectConsensus(
  queue: { conspiracyId: string; position: 'REAL' | 'FAKE' | 'INCONCLUSIVE'; isPassed?: boolean }[],
  conspiracyId: string,
  playerCount: number
): { consensus: boolean; position: 'REAL' | 'FAKE' | null } {
  // Filter to only broadcasts on this conspiracy that aren't passed
  // ALSO exclude INCONCLUSIVE broadcasts - they don't count toward consensus
  const broadcasts = queue.filter(
    b => b.conspiracyId === conspiracyId &&
         !b.isPassed &&
         b.position !== 'INCONCLUSIVE'
  );

  const realCount = broadcasts.filter(b => b.position === 'REAL').length;
  const fakeCount = broadcasts.filter(b => b.position === 'FAKE').length;

  // NEW: Majority threshold = Math.ceil(playerCount / 2)
  // 3 players: 2 needed (majority)
  // 4 players: 2 needed (majority)
  // 5 players: 3 needed (majority)
  const threshold = Math.ceil(playerCount / 2);

  if (realCount >= threshold) {
    return { consensus: true, position: 'REAL' };
  }
  if (fakeCount >= threshold) {
    return { consensus: true, position: 'FAKE' };
  }

  return { consensus: false, position: null };
}

// Check win conditions
export function checkWinCondition(gameState: GameState): {
  gameOver: boolean;
  winner: string | null;
} {
  // NEW: ONLY win condition is completing 6 rounds
  // After Round 6, highest audience wins (tiebreak: credibility)
  if (gameState.round > 6) {
    return determineWinner(gameState.players);
  }

  return { gameOver: false, winner: null };
}

function determineWinner(players: PlayerState[]): {
  gameOver: boolean;
  winner: string;
} {
  const sorted = [...players].sort((a, b) => {
    // Sort by audience (descending)
    if (b.audience !== a.audience) {
      return b.audience - a.audience;
    }
    // Tiebreaker: credibility (descending)
    return b.credibility - a.credibility;
  });

  return {
    gameOver: true,
    winner: sorted[0].id
  };
}
