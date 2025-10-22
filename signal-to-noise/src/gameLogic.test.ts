import {
  initializeGame,
  shuffle,
  drawCards,
  canSupportConspiracy,
  detectConsensus,
  checkWinCondition
} from './gameLogic';
import { GameState, EvidenceCard } from './types';

describe('GameLogic Unit Tests', () => {
  describe('shuffle', () => {
    it('should return array with same length', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled.length).toBe(arr.length);
    });

    it('should contain all original elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      arr.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });

    it('should not mutate original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffle(arr);
      expect(arr).toEqual(original);
    });
  });

  describe('initializeGame', () => {
    it('should throw error for invalid player count', () => {
      expect(() => initializeGame(2)).toThrow('Game requires 3-5 players');
      expect(() => initializeGame(6)).toThrow('Game requires 3-5 players');
    });

    it('should create valid game state for 3 players', () => {
      const game = initializeGame(3);
      expect(game.players.length).toBe(3);
      expect(game.conspiracies.length).toBe(5);  // v4.5: changed from 6 to 5
      expect(game.phase).toBe('INVESTIGATE');
      expect(game.round).toBe(1);
      expect(game.gameOver).toBe(false);
    });

    it('should create valid game state for 4 players', () => {
      const game = initializeGame(4);
      expect(game.players.length).toBe(4);
      expect(game.conspiracies.length).toBe(5);  // v4.5: changed from 6 to 5
      expect(game.phase).toBe('INVESTIGATE');
    });

    it('should deal 3 evidence cards to each player', () => {
      const game = initializeGame(3);
      game.players.forEach(player => {
        expect(player.evidenceHand.length).toBe(3);
      });
    });

    it('should initialize players with correct starting values', () => {
      const game = initializeGame(3);
      game.players.forEach(player => {
        expect(player.credibility).toBe(5);
        expect(player.audience).toBe(0);
        expect(player.assignedEvidence).toEqual({});
        expect(player.broadcastHistory).toEqual([]);
      });
    });

    it('should initialize unique player IDs and colors', () => {
      const game = initializeGame(4);
      const ids = game.players.map(p => p.id);
      const colors = game.players.map(p => p.color);
      expect(new Set(ids).size).toBe(4);
      expect(new Set(colors).size).toBe(4);
    });
  });

  describe('drawCards', () => {
    const mockCard1: EvidenceCard = {
      id: 'ev_001',
      name: 'Test Card 1',
      supportedConspiracies: ['ALL'],
      flavorText: 'Test',
      excitement: 0
    };

    const mockCard2: EvidenceCard = {
      id: 'ev_002',
      name: 'Test Card 2',
      supportedConspiracies: ['ALL'],
      flavorText: 'Test',
      excitement: 0
    };

    it('should draw cards up to hand limit', () => {
      const game = initializeGame(3);
      const player = game.players[0];
      const deck = [mockCard1, mockCard2];

      const result = drawCards(player, deck, 2);
      expect(result.updatedPlayer.evidenceHand.length).toBe(5); // 3 starting + 2 drawn
      expect(result.updatedDeck.length).toBe(0);
    });

    it('should respect hand limit of 5', () => {
      const game = initializeGame(3);
      const player = {
        ...game.players[0],
        evidenceHand: [mockCard1, mockCard1, mockCard1, mockCard1, mockCard1]
      };
      const deck = [mockCard2];

      const result = drawCards(player, deck, 1);
      expect(result.updatedPlayer.evidenceHand.length).toBe(5);
      expect(result.updatedDeck.length).toBe(1); // Card not drawn
    });

    it('should handle empty deck', () => {
      const game = initializeGame(3);
      const player = game.players[0];
      const deck: EvidenceCard[] = [];

      const result = drawCards(player, deck, 2);
      expect(result.updatedPlayer.evidenceHand.length).toBe(3); // Unchanged
      expect(result.updatedDeck.length).toBe(0);
    });
  });

  describe('canSupportConspiracy', () => {
    it('should support conspiracy with ALL tag', () => {
      const card: EvidenceCard = {
        id: 'ev_001',
        name: 'Test',
        supportedConspiracies: ['ALL'],
        flavorText: 'Test',
        excitement: 0
      };
      expect(canSupportConspiracy(card, 'any_conspiracy')).toBe(true);
    });

    it('should support specific conspiracy', () => {
      const card: EvidenceCard = {
        id: 'ev_002',
        name: 'Test',
        supportedConspiracies: ['chemtrails', 'moon_landing'],
        flavorText: 'Test',
        excitement: 1
      };
      expect(canSupportConspiracy(card, 'chemtrails')).toBe(true);
      expect(canSupportConspiracy(card, 'moon_landing')).toBe(true);
    });

    it('should not support unsupported conspiracy', () => {
      const card: EvidenceCard = {
        id: 'ev_003',
        name: 'Test',
        supportedConspiracies: ['chemtrails'],
        flavorText: 'Test',
        excitement: 1
      };
      expect(canSupportConspiracy(card, 'bigfoot')).toBe(false);
    });
  });

  describe('detectConsensus', () => {
    it('should detect consensus in 2-player game (2 votes required)', () => {
      const queue = [
        { conspiracyId: 'moon_landing', position: 'REAL' as const, isPassed: false },
        { conspiracyId: 'moon_landing', position: 'REAL' as const, isPassed: false }
      ];
      const result = detectConsensus(queue, 'moon_landing', 2);
      expect(result.consensus).toBe(true);
      expect(result.position).toBe('REAL');
    });

    it('should detect consensus in 4-player game (2 votes required)', () => {
      const queue = [
        { conspiracyId: 'chemtrails', position: 'FAKE' as const, isPassed: false },
        { conspiracyId: 'chemtrails', position: 'FAKE' as const, isPassed: false }
      ];
      const result = detectConsensus(queue, 'chemtrails', 4);
      expect(result.consensus).toBe(true);
      expect(result.position).toBe('FAKE');
    });

    it('should not detect consensus with insufficient votes', () => {
      const queue = [
        { conspiracyId: 'bigfoot', position: 'REAL' as const, isPassed: false },
        { conspiracyId: 'bigfoot', position: 'FAKE' as const, isPassed: false }
      ];
      const result = detectConsensus(queue, 'bigfoot', 3);
      expect(result.consensus).toBe(false);
      expect(result.position).toBe(null);
    });

    it('should ignore passed broadcasts', () => {
      const queue = [
        { conspiracyId: 'test', position: 'REAL' as const, isPassed: true },
        { conspiracyId: 'test', position: 'REAL' as const, isPassed: false }
      ];
      const result = detectConsensus(queue, 'test', 3);
      expect(result.consensus).toBe(false); // Only 1 non-passed vote (threshold is 2 for 3 players)
    });

    it('should handle split votes with consensus', () => {
      const queue = [
        { conspiracyId: 'test', position: 'REAL' as const, isPassed: false },
        { conspiracyId: 'test', position: 'REAL' as const, isPassed: false },
        { conspiracyId: 'test', position: 'FAKE' as const, isPassed: false },
        { conspiracyId: 'test', position: 'FAKE' as const, isPassed: false }
      ];
      const result = detectConsensus(queue, 'test', 4);
      expect(result.consensus).toBe(true); // 2 REAL = consensus (threshold is 2 for 4 players)
      expect(result.position).toBe('REAL');
    });
  });

  describe('checkWinCondition', () => {
    const createMockGameState = (): GameState => ({
      conspiracies: [],
      conspiracyDeck: [],
      evidenceDeck: [],
      players: [
        { id: 'p1', name: 'Alice', credibility: 5, audience: 10, evidenceHand: [], assignedEvidence: {}, color: '#fff', broadcastHistory: [] },
        { id: 'p2', name: 'Bob', credibility: 5, audience: 20, evidenceHand: [], assignedEvidence: {}, color: '#fff', broadcastHistory: [] }
      ],
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
    });

    it('should end game after 6 rounds', () => {
      const game = createMockGameState();
      game.round = 7;
      const result = checkWinCondition(game);
      expect(result.gameOver).toBe(true);
      expect(result.winner).toBe('p2'); // Bob has higher audience
    });

    it('should continue game if no win condition met', () => {
      const game = createMockGameState();
      const result = checkWinCondition(game);
      expect(result.gameOver).toBe(false);
      expect(result.winner).toBe(null);
    });

    it('should use credibility as tiebreaker', () => {
      const game = createMockGameState();
      game.players[0].audience = 30;
      game.players[1].audience = 30;
      game.players[0].credibility = 8;
      game.players[1].credibility = 5;
      game.round = 7;
      const result = checkWinCondition(game);
      expect(result.winner).toBe('p1'); // Alice wins on credibility tiebreaker
    });
  });
});
