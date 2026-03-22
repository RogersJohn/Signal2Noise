import {
  GameState,
  GameAction,
  GameConfig,
  PlayerState,
  ActiveConspiracy,
  EvidenceCard,
  EvidenceAssignment,
  BroadcastEntry,
  ConspiracyCard,
  LogEntry,
  Phase,
} from './types';
import { shuffle, seededShuffle, draw, canSupport, isSpecificTo, dealHands, setupConspiracies } from './deck';
import { getConsensusThreshold } from './consensus';
import { resolveAllConspiracies } from './scoring';

const STARTING_HAND = 5;
const DRAW_PER_ROUND = 2;
const MAX_HAND_SIZE = 7;
const MAX_ROUNDS = 6;
const ACTIVE_CONSPIRACIES = 5;
const STARTING_CREDIBILITY = 5;

// ── Game Creation ──

export function createGame(
  config: GameConfig,
  allConspiracies: ConspiracyCard[],
  allEvidence: EvidenceCard[]
): GameState {
  const shuffleFn = config.seed !== undefined
    ? <T>(arr: readonly T[]) => seededShuffle(arr, config.seed!)
    : shuffle;

  const shuffledConspiracies = shuffleFn(allConspiracies);
  const shuffledEvidence = shuffleFn(allEvidence);

  const { active, remaining: conspiracyDeck } = setupConspiracies(shuffledConspiracies, ACTIVE_CONSPIRACIES);
  const { hands, remainingDeck: evidenceDeck } = dealHands(shuffledEvidence, config.playerNames.length, STARTING_HAND);

  const players: PlayerState[] = config.playerNames.map((name, i) => ({
    id: `player_${i}`,
    name,
    score: 0,
    credibility: STARTING_CREDIBILITY,
    hand: hands[i],
    isHuman: config.humanPlayerIds.includes(`player_${i}`),
    strategyName: config.aiStrategies?.[i],
  }));

  const turnOrder = players.map(p => p.id);

  const activeConspiracies: ActiveConspiracy[] = active.map(card => ({
    card,
    evidenceAssignments: [],
    broadcasts: [],
  }));

  return {
    players,
    activeConspiracies,
    conspiracyDeck,
    evidenceDeck,
    discardPile: [],
    round: 1,
    maxRounds: MAX_ROUNDS,
    phase: 'COMMIT',
    currentPlayerIndex: 0,
    turnOrder,
    committedPlayers: [],
    broadcastedPlayers: [],
    roundResults: [],
    log: [],
    consensusThreshold: getConsensusThreshold(config.playerNames.length),
  };
}

// ── Turn Order ──

function computeTurnOrder(players: PlayerState[]): string[] {
  return [...players]
    .sort((a, b) => a.score - b.score || a.id.localeCompare(b.id))
    .map(p => p.id);
}

function getCurrentPlayerId(state: GameState): string {
  return state.turnOrder[state.currentPlayerIndex];
}

// ── Logging ──

function addLog(state: GameState, playerId: string | undefined, action: string, details: string): LogEntry {
  return {
    timestamp: Date.now(),
    round: state.round,
    phase: state.phase,
    playerId,
    action,
    details,
  };
}

// ── Action Handlers ──

function handleAssignEvidence(state: GameState, playerId: string, cardId: string, conspiracyId: string): GameState {
  if (state.phase !== 'COMMIT') {
    throw new Error(`Cannot assign evidence during ${state.phase} phase`);
  }

  if (state.committedPlayers.includes(playerId)) {
    throw new Error(`Player ${playerId} has already finished committing`);
  }

  const player = state.players.find(p => p.id === playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const cardIndex = player.hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) throw new Error(`Card ${cardId} not in player's hand`);

  const card = player.hand[cardIndex];
  if (!canSupport(card, conspiracyId)) {
    throw new Error(`Card ${cardId} cannot support conspiracy ${conspiracyId}`);
  }

  const conspiracy = state.activeConspiracies.find(c => c.card.id === conspiracyId);
  if (!conspiracy) throw new Error(`Conspiracy ${conspiracyId} not active`);

  const newHand = [...player.hand];
  newHand.splice(cardIndex, 1);

  const newPlayers = state.players.map(p =>
    p.id === playerId ? { ...p, hand: newHand } : p
  );

  const newConspiracies = state.activeConspiracies.map(c =>
    c.card.id === conspiracyId
      ? {
          ...c,
          evidenceAssignments: [
            ...c.evidenceAssignments,
            {
              cardId,
              playerId,
              conspiracyId,
              specific: isSpecificTo(card, conspiracyId),
            },
          ],
        }
      : c
  );

  return {
    ...state,
    players: newPlayers,
    activeConspiracies: newConspiracies,
    log: [...state.log, addLog(state, playerId, 'ASSIGN_EVIDENCE', `Assigned ${card.name} to ${conspiracyId}`)],
  };
}

function handleDoneCommitting(state: GameState, playerId: string): GameState {
  if (state.phase !== 'COMMIT') {
    throw new Error(`Cannot finish committing during ${state.phase} phase`);
  }

  if (state.committedPlayers.includes(playerId)) {
    throw new Error(`Player ${playerId} has already finished committing`);
  }

  const newCommitted = [...state.committedPlayers, playerId];
  const allCommitted = newCommitted.length === state.players.length;

  return {
    ...state,
    committedPlayers: newCommitted,
    phase: allCommitted ? 'BROADCAST' : 'COMMIT',
    currentPlayerIndex: allCommitted ? 0 : state.currentPlayerIndex,
    log: [...state.log, addLog(state, playerId, 'DONE_COMMITTING', 'Finished committing evidence')],
  };
}

function handleBroadcast(state: GameState, playerId: string, conspiracyId: string, position: 'REAL' | 'FAKE'): GameState {
  if (state.phase !== 'BROADCAST') {
    throw new Error(`Cannot broadcast during ${state.phase} phase`);
  }

  const expectedPlayer = getCurrentPlayerId(state);
  if (playerId !== expectedPlayer) {
    throw new Error(`Not ${playerId}'s turn to broadcast (expected ${expectedPlayer})`);
  }

  if (state.broadcastedPlayers.includes(playerId)) {
    throw new Error(`Player ${playerId} has already broadcast`);
  }

  const conspiracy = state.activeConspiracies.find(c => c.card.id === conspiracyId);
  if (!conspiracy) throw new Error(`Conspiracy ${conspiracyId} not active`);

  const isFirst = conspiracy.broadcasts.length === 0;

  const newConspiracies = state.activeConspiracies.map(c =>
    c.card.id === conspiracyId
      ? {
          ...c,
          broadcasts: [
            ...c.broadcasts,
            { playerId, conspiracyId, position, isFirstOnConspiracy: isFirst },
          ],
        }
      : c
  );

  const newBroadcasted = [...state.broadcastedPlayers, playerId];
  const allBroadcasted = newBroadcasted.length === state.players.length;
  const nextIndex = allBroadcasted ? state.currentPlayerIndex : state.currentPlayerIndex + 1;

  return {
    ...state,
    activeConspiracies: newConspiracies,
    broadcastedPlayers: newBroadcasted,
    currentPlayerIndex: nextIndex,
    phase: allBroadcasted ? 'RESOLVE' : 'BROADCAST',
    log: [...state.log, addLog(state, playerId, 'BROADCAST', `Broadcast ${position} on ${conspiracyId}`)],
  };
}

function handlePass(state: GameState, playerId: string): GameState {
  if (state.phase !== 'BROADCAST') {
    throw new Error(`Cannot pass during ${state.phase} phase`);
  }

  const expectedPlayer = getCurrentPlayerId(state);
  if (playerId !== expectedPlayer) {
    throw new Error(`Not ${playerId}'s turn (expected ${expectedPlayer})`);
  }

  if (state.broadcastedPlayers.includes(playerId)) {
    throw new Error(`Player ${playerId} has already acted`);
  }

  const newBroadcasted = [...state.broadcastedPlayers, playerId];
  const allBroadcasted = newBroadcasted.length === state.players.length;
  const nextIndex = allBroadcasted ? state.currentPlayerIndex : state.currentPlayerIndex + 1;

  // Pass draws 1 card (respecting max hand size)
  const player = state.players.find(p => p.id === playerId)!;
  let newEvidenceDeck = [...state.evidenceDeck];
  let newPlayers = state.players;
  if (player.hand.length < MAX_HAND_SIZE && newEvidenceDeck.length > 0) {
    const drawn = draw(newEvidenceDeck, 1);
    newPlayers = state.players.map(p =>
      p.id === playerId ? { ...p, hand: [...p.hand, ...drawn] } : p
    );
  }

  return {
    ...state,
    players: newPlayers,
    evidenceDeck: newEvidenceDeck,
    broadcastedPlayers: newBroadcasted,
    currentPlayerIndex: nextIndex,
    phase: allBroadcasted ? 'RESOLVE' : 'BROADCAST',
    log: [...state.log, addLog(state, playerId, 'PASS', 'Passed on broadcasting, drew 1 card')],
  };
}

function handleResolve(state: GameState): GameState {
  if (state.phase !== 'RESOLVE') {
    throw new Error('Cannot resolve outside RESOLVE phase');
  }

  const results = resolveAllConspiracies(state.activeConspiracies, state.consensusThreshold);

  // Apply scores and credibility
  let newPlayers = [...state.players.map(p => ({ ...p }))];
  for (const result of results) {
    for (const pr of result.playerResults) {
      const player = newPlayers.find(p => p.id === pr.playerId);
      if (player) {
        player.score += pr.points;
        player.credibility = Math.max(0, Math.min(10, player.credibility + pr.credibilityChange));
      }
    }
  }

  // Replace resolved conspiracies
  const resolvedIds = results.filter(r => r.consensusReached).map(r => r.conspiracyId);
  let newConspiracyDeck = [...state.conspiracyDeck];
  let newDiscardPile = [...state.discardPile];

  let newActiveConspiracies = state.activeConspiracies.map(ac => {
    if (resolvedIds.includes(ac.card.id)) {
      // Discard evidence cards from this conspiracy
      for (const assignment of ac.evidenceAssignments) {
        const player = state.players.find(p => p.id === assignment.playerId);
        if (player) {
          const card = player.hand.find(c => c.id === assignment.cardId);
          // Card was already removed from hand when assigned, so we just add to discard
        }
      }

      // Draw replacement from conspiracy deck
      if (newConspiracyDeck.length > 0) {
        const [replacement] = newConspiracyDeck.splice(0, 1);
        return { card: replacement, evidenceAssignments: [], broadcasts: [] };
      }
      return null; // No replacement available
    }
    // Clear broadcasts and evidence for next round on unresolved conspiracies
    return { ...ac, evidenceAssignments: [] as EvidenceAssignment[], broadcasts: [] as BroadcastEntry[] };
  }).filter((ac): ac is ActiveConspiracy => ac != null);

  return {
    ...state,
    players: newPlayers,
    activeConspiracies: newActiveConspiracies,
    conspiracyDeck: newConspiracyDeck,
    discardPile: newDiscardPile,
    roundResults: results,
    log: [...state.log, addLog(state, undefined, 'RESOLVE', `Round ${state.round} resolved. ${resolvedIds.length} conspiracies reached consensus.`)],
    phase: 'RESOLVE', // Will transition to next round via NEXT_ROUND
  };
}

function handleNextRound(state: GameState): GameState {
  if (state.phase !== 'RESOLVE') {
    throw new Error('Cannot advance round outside RESOLVE phase');
  }

  if (state.round >= state.maxRounds) {
    return {
      ...state,
      phase: 'GAME_OVER',
      log: [...state.log, addLog(state, undefined, 'GAME_OVER', 'Game complete!')],
    };
  }

  // Draw cards for each player
  let newEvidenceDeck = [...state.evidenceDeck];
  const newPlayers = state.players.map(p => {
    const drawCount = Math.min(DRAW_PER_ROUND, MAX_HAND_SIZE - p.hand.length);
    if (drawCount <= 0) return p;
    const drawn = draw(newEvidenceDeck, drawCount);
    return { ...p, hand: [...p.hand, ...drawn] };
  });

  const turnOrder = computeTurnOrder(newPlayers);

  return {
    ...state,
    players: newPlayers,
    evidenceDeck: newEvidenceDeck,
    round: state.round + 1,
    phase: 'COMMIT',
    currentPlayerIndex: 0,
    turnOrder,
    committedPlayers: [],
    broadcastedPlayers: [],
    roundResults: [],
    log: [...state.log, addLog(state, undefined, 'NEXT_ROUND', `Round ${state.round + 1} begins`)],
  };
}

// ── Main Reducer ──

export function applyAction(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ASSIGN_EVIDENCE':
      return handleAssignEvidence(state, action.playerId, action.cardId, action.conspiracyId);
    case 'DONE_COMMITTING':
      return handleDoneCommitting(state, action.playerId);
    case 'BROADCAST':
      return handleBroadcast(state, action.playerId, action.conspiracyId, action.position);
    case 'PASS':
      return handlePass(state, action.playerId);
    case 'RESOLVE':
      return handleResolve(state);
    case 'NEXT_ROUND':
      return handleNextRound(state);
  }
}

// ── Utility Functions ──

export function getWinner(state: GameState): PlayerState | null {
  if (state.phase !== 'GAME_OVER') return null;
  const sorted = [...state.players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.credibility - a.credibility;
  });
  return sorted[0];
}

export function getPlayerById(state: GameState, playerId: string): PlayerState | undefined {
  return state.players.find(p => p.id === playerId);
}

export function getEvidenceCount(conspiracy: ActiveConspiracy, playerId: string): number {
  return conspiracy.evidenceAssignments.filter(a => a.playerId === playerId).length;
}

export { STARTING_HAND, DRAW_PER_ROUND, MAX_HAND_SIZE, MAX_ROUNDS, ACTIVE_CONSPIRACIES, STARTING_CREDIBILITY };
