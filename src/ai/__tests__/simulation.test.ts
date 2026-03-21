import { runSimulation, SimulationConfig } from '../simulation';
import { analyzeResults } from '../analysis';

describe('AI Simulation', () => {
  const config: SimulationConfig = {
    games: 200,
    matchup: ['Evidence-Only', 'Aggressive', 'Follower', 'Cautious'],
  };

  let result: ReturnType<typeof runSimulation>;
  let analysis: ReturnType<typeof analyzeResults>;

  beforeAll(() => {
    result = runSimulation(config);
    analysis = analyzeResults(result);
  });

  it('completes all games without errors', () => {
    expect(result.games).toHaveLength(200);
  });

  it('consensus rate is within acceptable range', () => {
    expect(analysis.details.consensusRate.value).toBeGreaterThanOrEqual(0.10);
    expect(analysis.details.consensusRate.value).toBeLessThanOrEqual(0.90);
  });

  it('close game rate is reasonable', () => {
    expect(analysis.details.closeGameRate.value).toBeGreaterThanOrEqual(0.20);
  });

  it('no single strategy dominates (win rate <70%)', () => {
    expect(analysis.details.dominantStrategy.maxWinRate).toBeLessThanOrEqual(0.70);
  });

  it('all games have a winner', () => {
    for (const game of result.games) {
      expect(game.winner).not.toBe('none');
    }
  });

  it('scores are non-negative', () => {
    for (const game of result.games) {
      for (const score of Object.values(game.finalScores)) {
        expect(score).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('Mixed 5-strategy simulation', () => {
  it('runs with all 5 strategies (5 players)', () => {
    const config: SimulationConfig = {
      games: 50,
      matchup: ['Evidence-Only', 'Aggressive', 'Follower', 'Cautious', 'Opportunist'],
    };
    const result = runSimulation(config);
    expect(result.games).toHaveLength(50);

    for (const game of result.games) {
      expect(game.winner).not.toBe('none');
    }
  });
});
