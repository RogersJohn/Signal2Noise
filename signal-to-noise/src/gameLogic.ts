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
  if (playerCount < 2 || playerCount > 4) {
    throw new Error('Game requires 2-4 players');
  }

  // Shuffle decks
  const shuffledConspiracies = shuffle([...CONSPIRACY_DECK]);
  const shuffledEvidence = shuffle([...EVIDENCE_DECK]);

  // Deal 6 conspiracies to the board
  const conspiracies = shuffledConspiracies.slice(0, 6);
  const conspiracyDeck = shuffledConspiracies.slice(6);

  // Create players
  const playerColors = ['#3b82f6', '#ef4444', '#10b981', '#a855f7']; // blue, red, green, purple
  const playerNames = ['Alice', 'Bob', 'Carol', 'Dave'];

  const players: PlayerState[] = [];
  let evidenceIndex = 0;

  for (let i = 0; i < playerCount; i++) {
    // Deal 3 evidence cards to each player
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
  count: number
): { updatedPlayer: PlayerState; updatedDeck: EvidenceCard[] } {
  const handLimit = 5;
  const currentHandSize = player.evidenceHand.length;
  const cardsToAdd = Math.min(count, handLimit - currentHandSize, deck.length);

  if (cardsToAdd <= 0) {
    return { updatedPlayer: player, updatedDeck: deck };
  }

  const drawnCards = deck.slice(0, cardsToAdd);
  const updatedDeck = deck.slice(cardsToAdd);
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
  queue: { conspiracyId: string; position: 'REAL' | 'FAKE'; isPassed?: boolean }[],
  conspiracyId: string,
  playerCount: number
): { consensus: boolean; position: 'REAL' | 'FAKE' | null } {
  const broadcasts = queue.filter(
    b => b.conspiracyId === conspiracyId && !b.isPassed
  );

  const realCount = broadcasts.filter(b => b.position === 'REAL').length;
  const fakeCount = broadcasts.filter(b => b.position === 'FAKE').length;

  // Dynamic threshold: 2 players need 2 broadcasts, 3-4 players need 3
  const threshold = playerCount === 2 ? 2 : 3;

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
  // End if 12 conspiracies revealed
  if (gameState.totalRevealed >= 12) {
    return determineWinner(gameState.players);
  }

  // End if 6 rounds completed
  if (gameState.round > 6) {
    return determineWinner(gameState.players);
  }

  // End if any player reaches 60 audience
  const hasWinner = gameState.players.some(p => p.audience >= 60);
  if (hasWinner) {
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
