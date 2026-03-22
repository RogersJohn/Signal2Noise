import { createGame, applyAction, getWinner } from '../engine';
import { GameState, GameConfig, ConspiracyCard, EvidenceCard } from '../types';

const testConspiracies: ConspiracyCard[] = Array.from({ length: 12 }, (_, i) => ({
  id: `conspiracy_${i}`,
  name: `Conspiracy ${i}`,
  description: `Description ${i}`,
  icon: '🔍',
}));

const testEvidence: EvidenceCard[] = Array.from({ length: 48 }, (_, i) => ({
  id: `ev_${i}`,
  name: `Evidence ${i}`,
  targets: i < 12 ? ['ALL'] : [`conspiracy_${i % 5}`],
  specific: i >= 12,
  flavorText: `Flavor ${i}`,
}));

function createTestGame(playerCount = 4, seed = 42): GameState {
  const config: GameConfig = {
    playerNames: Array.from({ length: playerCount }, (_, i) => `Player ${i}`),
    humanPlayerIds: [],
    seed,
  };
  return createGame(config, testConspiracies, testEvidence);
}

describe('createGame', () => {
  it('creates game with correct initial state', () => {
    const state = createTestGame();
    expect(state.players).toHaveLength(4);
    expect(state.activeConspiracies).toHaveLength(5);
    expect(state.round).toBe(1);
    expect(state.phase).toBe('COMMIT');
    expect(state.consensusThreshold).toBe(2);
  });

  it('deals 5 cards to each player', () => {
    const state = createTestGame();
    state.players.forEach(p => expect(p.hand).toHaveLength(5));
  });

  it('starts credibility at 5', () => {
    const state = createTestGame();
    state.players.forEach(p => expect(p.credibility).toBe(5));
  });

  it('is deterministic with same seed', () => {
    const a = createTestGame(4, 42);
    const b = createTestGame(4, 42);
    expect(a.players.map(p => p.hand.map(c => c.id))).toEqual(
      b.players.map(p => p.hand.map(c => c.id))
    );
  });

  it('threshold is 3 for 5 players', () => {
    const state = createTestGame(5);
    expect(state.consensusThreshold).toBe(3);
  });
});

describe('ASSIGN_EVIDENCE', () => {
  it('removes card from hand and adds to conspiracy', () => {
    const state = createTestGame();
    const player = state.players[0];
    const card = player.hand.find(c => c.targets.includes('ALL'))!;
    const conspiracy = state.activeConspiracies[0];

    const next = applyAction(state, {
      type: 'ASSIGN_EVIDENCE',
      playerId: player.id,
      cardId: card.id,
      conspiracyId: conspiracy.card.id,
    });

    expect(next.players[0].hand).toHaveLength(4);
    expect(next.activeConspiracies[0].evidenceAssignments).toHaveLength(1);
  });

  it('throws on wrong phase', () => {
    let state = createTestGame();
    // Force to broadcast phase
    state = { ...state, phase: 'BROADCAST' };
    expect(() => applyAction(state, {
      type: 'ASSIGN_EVIDENCE',
      playerId: 'player_0',
      cardId: 'ev_0',
      conspiracyId: 'conspiracy_0',
    })).toThrow('Cannot assign evidence during BROADCAST phase');
  });

  it('throws if card not in hand', () => {
    const state = createTestGame();
    expect(() => applyAction(state, {
      type: 'ASSIGN_EVIDENCE',
      playerId: 'player_0',
      cardId: 'nonexistent',
      conspiracyId: state.activeConspiracies[0].card.id,
    })).toThrow('not in player\'s hand');
  });

  it('throws if card cannot support conspiracy', () => {
    const state = createTestGame();
    const player = state.players[0];
    const specificCard = player.hand.find(c => !c.targets.includes('ALL'));
    if (specificCard) {
      const otherConspiracy = state.activeConspiracies.find(
        c => !specificCard.targets.includes(c.card.id)
      );
      if (otherConspiracy) {
        expect(() => applyAction(state, {
          type: 'ASSIGN_EVIDENCE',
          playerId: player.id,
          cardId: specificCard.id,
          conspiracyId: otherConspiracy.card.id,
        })).toThrow('cannot support');
      }
    }
  });
});

describe('DONE_COMMITTING', () => {
  it('marks player as committed', () => {
    const state = createTestGame();
    const next = applyAction(state, { type: 'DONE_COMMITTING', playerId: 'player_0' });
    expect(next.committedPlayers).toContain('player_0');
    expect(next.phase).toBe('COMMIT'); // not all committed yet
  });

  it('transitions to BROADCAST when all committed', () => {
    let state = createTestGame();
    for (let i = 0; i < 4; i++) {
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId: `player_${i}` });
    }
    expect(state.phase).toBe('BROADCAST');
  });

  it('throws if already committed', () => {
    let state = createTestGame();
    state = applyAction(state, { type: 'DONE_COMMITTING', playerId: 'player_0' });
    expect(() => applyAction(state, { type: 'DONE_COMMITTING', playerId: 'player_0' }))
      .toThrow('already finished committing');
  });
});

describe('BROADCAST', () => {
  function getBroadcastState(): GameState {
    let state = createTestGame();
    for (let i = 0; i < 4; i++) {
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId: `player_${i}` });
    }
    return state;
  }

  it('adds broadcast to conspiracy', () => {
    const state = getBroadcastState();
    const currentPlayer = state.turnOrder[0];
    const conspiracy = state.activeConspiracies[0];
    const next = applyAction(state, {
      type: 'BROADCAST',
      playerId: currentPlayer,
      conspiracyId: conspiracy.card.id,
      position: 'REAL',
    });
    const updated = next.activeConspiracies.find(c => c.card.id === conspiracy.card.id)!;
    expect(updated.broadcasts).toHaveLength(1);
    expect(updated.broadcasts[0].position).toBe('REAL');
  });

  it('transitions to RESOLVE when all broadcast', () => {
    let state = getBroadcastState();
    const conspiracy = state.activeConspiracies[0];
    for (let i = 0; i < 4; i++) {
      const pid = state.turnOrder[state.currentPlayerIndex];
      state = applyAction(state, {
        type: 'BROADCAST',
        playerId: pid,
        conspiracyId: conspiracy.card.id,
        position: 'REAL',
      });
    }
    expect(state.phase).toBe('RESOLVE');
  });

  it('throws if wrong player tries to broadcast', () => {
    const state = getBroadcastState();
    const wrongPlayer = state.turnOrder[1];
    expect(() => applyAction(state, {
      type: 'BROADCAST',
      playerId: wrongPlayer,
      conspiracyId: state.activeConspiracies[0].card.id,
      position: 'REAL',
    })).toThrow('Not');
  });

  it('throws during wrong phase', () => {
    const state = createTestGame(); // COMMIT phase
    expect(() => applyAction(state, {
      type: 'BROADCAST',
      playerId: 'player_0',
      conspiracyId: state.activeConspiracies[0].card.id,
      position: 'REAL',
    })).toThrow('Cannot broadcast during COMMIT');
  });
});

describe('PASS', () => {
  function getBroadcastState(): GameState {
    let state = createTestGame();
    for (let i = 0; i < 4; i++) {
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId: `player_${i}` });
    }
    return state;
  }

  it('marks player as having acted', () => {
    const state = getBroadcastState();
    const currentPlayer = state.turnOrder[0];
    const next = applyAction(state, { type: 'PASS', playerId: currentPlayer });
    expect(next.broadcastedPlayers).toContain(currentPlayer);
  });

  it('all players passing leads to RESOLVE', () => {
    let state = getBroadcastState();
    for (let i = 0; i < 4; i++) {
      const pid = state.turnOrder[state.currentPlayerIndex];
      state = applyAction(state, { type: 'PASS', playerId: pid });
    }
    expect(state.phase).toBe('RESOLVE');
  });
});

describe('RESOLVE', () => {
  function getResolveState(): GameState {
    let state = createTestGame();
    // Assign evidence
    const p0 = state.players[0];
    const genericCard = p0.hand.find(c => c.targets.includes('ALL'))!;
    if (genericCard) {
      state = applyAction(state, {
        type: 'ASSIGN_EVIDENCE',
        playerId: p0.id,
        cardId: genericCard.id,
        conspiracyId: state.activeConspiracies[0].card.id,
      });
    }
    // All commit
    for (let i = 0; i < 4; i++) {
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId: `player_${i}` });
    }
    // All broadcast REAL on conspiracy 0
    const cid = state.activeConspiracies[0].card.id;
    for (let i = 0; i < 4; i++) {
      const pid = state.turnOrder[state.currentPlayerIndex];
      state = applyAction(state, {
        type: 'BROADCAST', playerId: pid, conspiracyId: cid, position: 'REAL',
      });
    }
    return state;
  }

  it('resolves and updates scores', () => {
    let state = getResolveState();
    state = applyAction(state, { type: 'RESOLVE' });
    // At least one player should have scored
    const totalScore = state.players.reduce((sum, p) => sum + p.score, 0);
    expect(totalScore).toBeGreaterThan(0);
  });

  it('throws outside RESOLVE phase', () => {
    const state = createTestGame();
    expect(() => applyAction(state, { type: 'RESOLVE' })).toThrow('Cannot resolve outside RESOLVE');
  });
});

describe('NEXT_ROUND', () => {
  function getPostResolveState(): GameState {
    let state = createTestGame();
    for (let i = 0; i < 4; i++) {
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId: `player_${i}` });
    }
    for (let i = 0; i < 4; i++) {
      const pid = state.turnOrder[state.currentPlayerIndex];
      state = applyAction(state, { type: 'PASS', playerId: pid });
    }
    state = applyAction(state, { type: 'RESOLVE' });
    return state;
  }

  it('advances to next round', () => {
    let state = getPostResolveState();
    state = applyAction(state, { type: 'NEXT_ROUND' });
    expect(state.round).toBe(2);
    expect(state.phase).toBe('COMMIT');
    expect(state.committedPlayers).toEqual([]);
    expect(state.broadcastedPlayers).toEqual([]);
  });

  it('draws cards for players', () => {
    let state = getPostResolveState();
    const handSizeBefore = state.players[0].hand.length;
    state = applyAction(state, { type: 'NEXT_ROUND' });
    // Each player drew 1 card from passing + 2 from next round
    expect(state.players[0].hand.length).toBeLessThanOrEqual(7); // max hand size
    expect(state.players[0].hand.length).toBeGreaterThan(handSizeBefore);
  });

  it('game over after 6 rounds', () => {
    let state = getPostResolveState();
    state = { ...state, round: 6 };
    state = applyAction(state, { type: 'NEXT_ROUND' });
    expect(state.phase).toBe('GAME_OVER');
  });
});

describe('getWinner', () => {
  it('returns null during active game', () => {
    const state = createTestGame();
    expect(getWinner(state)).toBeNull();
  });

  it('returns highest scorer', () => {
    let state = createTestGame();
    state = { ...state, phase: 'GAME_OVER' };
    state.players[2].score = 100;
    const winner = getWinner(state);
    expect(winner?.id).toBe('player_2');
  });

  it('breaks ties with credibility', () => {
    let state = createTestGame();
    state = { ...state, phase: 'GAME_OVER' };
    state.players[0].score = 10;
    state.players[1].score = 10;
    state.players[0].credibility = 7;
    state.players[1].credibility = 8;
    const winner = getWinner(state);
    expect(winner?.id).toBe('player_1');
  });
});

describe('full game flow', () => {
  it('can play a complete game deterministically', () => {
    let state = createTestGame(4, 123);

    for (let round = 0; round < 6; round++) {
      expect(state.phase).toBe('COMMIT');

      // All players commit without assigning
      for (let i = 0; i < 4; i++) {
        state = applyAction(state, { type: 'DONE_COMMITTING', playerId: `player_${i}` });
      }
      expect(state.phase).toBe('BROADCAST');

      // All players pass
      for (let i = 0; i < 4; i++) {
        const pid = state.turnOrder[state.currentPlayerIndex];
        state = applyAction(state, { type: 'PASS', playerId: pid });
      }
      expect(state.phase).toBe('RESOLVE');

      state = applyAction(state, { type: 'RESOLVE' });
      state = applyAction(state, { type: 'NEXT_ROUND' });
    }

    expect(state.phase).toBe('GAME_OVER');
  });
});
