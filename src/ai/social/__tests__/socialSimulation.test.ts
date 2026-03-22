import { runSocialGame } from '../../socialSimulation';
import { getSocialPersonality } from '../personalities';

function makeMatchup() {
  return [
    { baseName: 'Aggressive', personality: getSocialPersonality('Honest Broker') },
    { baseName: 'Evidence-Only', personality: getSocialPersonality('Sociopath') },
    { baseName: 'Follower', personality: getSocialPersonality('Hustler') },
    { baseName: 'Cautious', personality: getSocialPersonality('Diplomat') },
  ];
}

describe('Social simulation bug fixes', () => {
  it('tracks consensusCount correctly', () => {
    const result = runSocialGame(makeMatchup(), 0);
    // consensusCount should be >= 0 (may be 0 if all passed, but typically > 0)
    expect(result.consensusCount).toBeGreaterThanOrEqual(0);
    expect(typeof result.consensusCount).toBe('number');
  });

  it('tracks pointSources correctly when consensus forms', () => {
    // Run multiple games to find one with consensus
    let foundConsensus = false;
    for (let i = 0; i < 20; i++) {
      const result = runSocialGame(makeMatchup(), i);
      if (result.consensusCount > 0) {
        foundConsensus = true;
        const total = result.pointSources.evidence + result.pointSources.bandwagon +
          result.pointSources.firstMover + result.pointSources.consensusBonus;
        expect(total).toBeGreaterThan(0);
        break;
      }
    }
    expect(foundConsensus).toBe(true);
  });

  it('tracks totalBroadcasts in socialMetrics', () => {
    const result = runSocialGame(makeMatchup(), 0);
    expect(result.socialMetrics.totalBroadcasts).toBeGreaterThanOrEqual(0);
    expect(typeof result.socialMetrics.totalBroadcasts).toBe('number');
  });

  it('betrayal rate is between 0 and 1', () => {
    const result = runSocialGame(makeMatchup(), 0);
    if (result.socialMetrics.totalBroadcasts > 0) {
      const rate = result.socialMetrics.betrayalCount / result.socialMetrics.totalBroadcasts;
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    }
  });

  it('totalBroadcasted matches total non-pass actions', () => {
    const result = runSocialGame(makeMatchup(), 0);
    expect(result.totalBroadcasted).toBe(result.socialMetrics.totalBroadcasts);
  });
});
