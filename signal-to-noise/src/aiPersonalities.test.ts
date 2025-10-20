import { initializeGame } from './gameLogic';
import {
  AI_PERSONALITIES,
  makeAIDecision,
  getRandomPersonality,
  getPersonalityByName,
  AIPersonality,
  PERSONALITY_NAMES
} from './aiPersonalities';
import { GameState, PlayerState } from './types';

describe('AI Personality System', () => {
  describe('Personality Definitions', () => {
    test('All personalities have required properties', () => {
      Object.values(AI_PERSONALITIES).forEach(personality => {
        expect(personality.name).toBeDefined();
        expect(personality.description).toBeDefined();
        expect(personality.riskTolerance).toBeGreaterThanOrEqual(0);
        expect(personality.riskTolerance).toBeLessThanOrEqual(1);
        expect(personality.bluffFrequency).toBeGreaterThanOrEqual(0);
        expect(personality.bluffFrequency).toBeLessThanOrEqual(1);
      });
    });

    test('Personalities have distinct traits', () => {
      const paranoid = AI_PERSONALITIES.PARANOID_SKEPTIC;
      const reckless = AI_PERSONALITIES.RECKLESS_GAMBLER;

      expect(paranoid.riskTolerance).toBeLessThan(reckless.riskTolerance);
      expect(paranoid.bluffFrequency).toBeLessThan(reckless.bluffFrequency);
      expect(paranoid.skepticism).toBeGreaterThan(reckless.skepticism);
    });
  });

  describe('AI Decision Making', () => {
    test('Paranoid Skeptic rarely broadcasts without strong evidence', () => {
      const gameState = initializeGame(2);
      const personality = AI_PERSONALITIES.PARANOID_SKEPTIC;

      // Clear evidence to force potential bluff scenario
      gameState.players[0].assignedEvidence = {};

      const decision = makeAIDecision(gameState, 0, personality);

      // Paranoid should pass when no evidence
      expect(decision.action).toBe('pass');
    });

    test('Reckless Gambler broadcasts even without evidence', () => {
      const gameState = initializeGame(2);
      const personality = AI_PERSONALITIES.RECKLESS_GAMBLER;

      // Set high credibility to allow bluffing
      gameState.players[0].credibility = 10;
      gameState.players[0].assignedEvidence = {};

      let broadcastCount = 0;
      const trials = 20;

      for (let i = 0; i < trials; i++) {
        const decision = makeAIDecision(gameState, 0, personality);
        if (decision.action === 'broadcast') {
          broadcastCount++;
        }
      }

      // Reckless should broadcast frequently even without evidence
      expect(broadcastCount).toBeGreaterThan(trials * 0.3);
    });

    test('Truth Seeker only broadcasts with strong evidence', () => {
      const gameState = initializeGame(2);
      const personality = AI_PERSONALITIES.TRUTH_SEEKER;
      const player = gameState.players[0];

      // Give player some evidence but not much
      const conspiracy = gameState.conspiracies[0];
      const evidenceCards = gameState.evidenceDeck.slice(0, 2);
      player.assignedEvidence[conspiracy.id] = evidenceCards;

      const decision = makeAIDecision(gameState, 0, personality);

      // With only 2 cards and high threshold (0.85), Truth Seeker should likely pass
      // (needs 0.85 * 5 = ~4-5 evidence cards)
      if (decision.action === 'broadcast') {
        expect(decision.isBluff).toBe(false);
      }
    });

    test('Calculated Strategist makes balanced decisions', () => {
      const gameState = initializeGame(2);
      const personality = AI_PERSONALITIES.CALCULATED_STRATEGIST;
      const player = gameState.players[0];

      // Give moderate evidence
      const conspiracy = gameState.conspiracies[0];
      const evidenceCards = gameState.evidenceDeck.slice(0, 3);
      player.assignedEvidence[conspiracy.id] = evidenceCards;
      player.credibility = 7;

      const decision = makeAIDecision(gameState, 0, personality);

      // Strategist should broadcast with moderate evidence
      expect(decision.action).toBe('broadcast');
      expect(decision.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Personality Showcase - 4-Player Game Simulation', () => {
    test('Simulate 10 rounds with diverse personalities', () => {
      const results = simulatePersonalityShowcase(10);

      expect(results.totalGames).toBe(10);
      expect(results.personalityStats).toBeDefined();

      // Log results for visibility
      console.log('\n=== AI PERSONALITY SHOWCASE ===\n');
      console.log(`Games Simulated: ${results.totalGames}\n`);

      Object.entries(results.personalityStats).forEach(([name, stats]) => {
        console.log(`${name}:`);
        console.log(`  Broadcasts: ${stats.broadcastCount}`);
        console.log(`  Bluffs: ${stats.bluffCount} (${((stats.bluffCount / stats.broadcastCount) * 100 || 0).toFixed(1)}%)`);
        console.log(`  Avg Credibility: ${stats.avgCredibility.toFixed(1)}`);
        console.log(`  Avg Audience: ${stats.avgAudience.toFixed(1)}\n`);
      });
    });
  });
});

// ==================== SIMULATION HELPER ====================

interface PersonalityStats {
  broadcastCount: number;
  bluffCount: number;
  passCount: number;
  avgCredibility: number;
  avgAudience: number;
  wins: number;
}

interface ShowcaseResults {
  totalGames: number;
  personalityStats: Record<string, PersonalityStats>;
}

function simulatePersonalityShowcase(numGames: number): ShowcaseResults {
  const stats: Record<string, PersonalityStats> = {};

  // Initialize stats for each personality
  Object.keys(AI_PERSONALITIES).forEach(key => {
    stats[key] = {
      broadcastCount: 0,
      bluffCount: 0,
      passCount: 0,
      avgCredibility: 0,
      avgAudience: 0,
      wins: 0
    };
  });

  for (let game = 0; game < numGames; game++) {
    const gameState = initializeGame(4);

    // Assign different personalities to each player
    const personalities = [
      AI_PERSONALITIES.PARANOID_SKEPTIC,
      AI_PERSONALITIES.RECKLESS_GAMBLER,
      AI_PERSONALITIES.CALCULATED_STRATEGIST,
      AI_PERSONALITIES.TRUTH_SEEKER
    ];

    // Simulate 3 rounds of INVESTIGATE phase decisions
    for (let round = 0; round < 3; round++) {
      for (let playerIndex = 0; playerIndex < 4; playerIndex++) {
        const player = gameState.players[playerIndex];
        const personality = personalities[playerIndex];
        const personalityKey = Object.keys(AI_PERSONALITIES).find(
          key => AI_PERSONALITIES[key as keyof typeof AI_PERSONALITIES] === personality
        )!;

        // Give player some random evidence
        if (round === 0) {
          const conspiracy = gameState.conspiracies[playerIndex % 6];
          const evidenceCount = Math.floor(Math.random() * 4) + 1;
          player.assignedEvidence[conspiracy.id] = gameState.evidenceDeck.slice(0, evidenceCount);
        }

        const decision = makeAIDecision(gameState, playerIndex, personality);

        if (decision.action === 'broadcast') {
          stats[personalityKey].broadcastCount++;
          if (decision.isBluff) {
            stats[personalityKey].bluffCount++;
          }
        } else {
          stats[personalityKey].passCount++;
        }

        // Track stats
        stats[personalityKey].avgCredibility += player.credibility;
        stats[personalityKey].avgAudience += player.audience;
      }
    }
  }

  // Calculate averages
  Object.keys(stats).forEach(key => {
    const totalActions = stats[key].broadcastCount + stats[key].passCount;
    if (totalActions > 0) {
      stats[key].avgCredibility /= totalActions;
      stats[key].avgAudience /= totalActions;
    }
  });

  return {
    totalGames: numGames,
    personalityStats: stats
  };
}

// ==================== BEHAVIORAL TESTING ====================

describe('Personality Behavioral Tests', () => {
  test('Paranoid Skeptic exhibits ultra-cautious behavior', () => {
    const personality = AI_PERSONALITIES.PARANOID_SKEPTIC;

    expect(personality.riskTolerance).toBeLessThan(0.2);
    expect(personality.bluffFrequency).toBe(0);
    expect(personality.skepticism).toBeGreaterThan(0.9);
    expect(personality.credibilityConscious).toBe(true);
  });

  test('Reckless Gambler exhibits high-risk behavior', () => {
    const personality = AI_PERSONALITIES.RECKLESS_GAMBLER;

    expect(personality.riskTolerance).toBeGreaterThan(0.8);
    expect(personality.bluffFrequency).toBeGreaterThan(0.5);
    expect(personality.credibilityConscious).toBe(false);
  });

  test('Chaos Agent is unpredictable', () => {
    const personality = AI_PERSONALITIES.CHAOS_AGENT;

    expect(personality.riskTolerance).toBeGreaterThan(0.8);
    expect(personality.specialization).toBeLessThan(0.2);
    expect(personality.evidenceThreshold).toBeLessThan(0.2);
  });

  test('Professional Analyst is balanced', () => {
    const personality = AI_PERSONALITIES.PROFESSIONAL_ANALYST;

    expect(personality.riskTolerance).toBeGreaterThan(0.4);
    expect(personality.riskTolerance).toBeLessThan(0.7);
    expect(personality.opportunistic).toBe(true);
    expect(personality.credibilityConscious).toBe(true);
  });

  test('All 10 personalities are accessible', () => {
    expect(PERSONALITY_NAMES.length).toBe(10);
    expect(Object.keys(AI_PERSONALITIES).length).toBe(10);
  });

  test('getRandomPersonality returns valid personality', () => {
    const random = getRandomPersonality();
    expect(random.name).toBeDefined();
    expect(random.riskTolerance).toBeGreaterThanOrEqual(0);
    expect(random.riskTolerance).toBeLessThanOrEqual(1);
  });

  test('getPersonalityByName retrieves correct personality', () => {
    const strategist = getPersonalityByName('CALCULATED_STRATEGIST');
    expect(strategist.name).toBe('The Calculated Strategist');
  });
});
