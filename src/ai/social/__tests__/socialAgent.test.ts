import { createSocialAgent } from '../socialAgent';
import { SOCIAL_PERSONALITIES } from '../personalities';
import { STRATEGIES } from '../../strategies';
import { createGame, applyAction } from '../../../engine/engine';
import { GameConfig, ConspiracyCard, EvidenceCard } from '../../../engine/types';

const testConspiracies: ConspiracyCard[] = Array.from({ length: 12 }, (_, i) => ({
  id: `c${i}`, name: `Conspiracy ${i}`, description: `Desc ${i}`, icon: '🔍',
}));

const testEvidence: EvidenceCard[] = Array.from({ length: 48 }, (_, i) => ({
  id: `ev_${i}`, name: `Evidence ${i}`,
  targets: i < 12 ? ['ALL'] : [`c${i % 5}`],
  specific: i >= 12, position: (i % 2 === 0 ? 'REAL' : 'FAKE') as 'REAL' | 'FAKE', flavorText: `Flavor ${i}`,
}));

function createTestGame(playerCount = 4) {
  const config: GameConfig = {
    playerNames: Array.from({ length: playerCount }, (_, i) => `P${i}`),
    humanPlayerIds: [],
    aiStrategies: Array(playerCount).fill('Evidence-Only'),
    seed: 42,
  };
  return createGame(config, testConspiracies, testEvidence);
}

describe('SocialAgent', () => {
  it('follows base strategy when no signals exist', () => {
    const agent = createSocialAgent(STRATEGIES['Evidence-Only'], SOCIAL_PERSONALITIES['Honest Broker']);
    let state = createTestGame();
    // Move to broadcast
    for (let i = 0; i < 4; i++) {
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId: `player_${i}` });
    }
    const action = agent.decideBroadcast(state, 'player_0', []);
    expect(action.type === 'BROADCAST' || action.type === 'PASS').toBe(true);
  });

  it('generates a valid signal', () => {
    const agent = createSocialAgent(STRATEGIES['Aggressive'], SOCIAL_PERSONALITIES['Hustler']);
    const state = createTestGame();
    const signal = agent.generateSignalAction(state, 'player_0');
    expect(signal.senderId).toBe('player_0');
    expect(['weak', 'moderate', 'strong']).toContain(signal.claimedStrength);
    expect(['lead', 'join', 'avoid']).toContain(signal.intent);
  });

  it('onRoundEnd updates social state without errors', () => {
    const agent = createSocialAgent(STRATEGIES['Evidence-Only'], SOCIAL_PERSONALITIES['Diplomat']);
    let state = createTestGame();
    agent.generateSignalAction(state, 'player_0');

    // Complete a round
    for (let i = 0; i < 4; i++) {
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId: `player_${i}` });
    }
    for (let i = 0; i < 4; i++) {
      const pid = state.turnOrder[state.currentPlayerIndex];
      state = applyAction(state, { type: 'PASS', playerId: pid });
    }
    state = applyAction(state, { type: 'RESOLVE' });

    // Should not throw
    agent.onRoundEnd(state, 'player_0', []);
  });

  it('full round lifecycle works end to end', () => {
    const agents = [
      createSocialAgent(STRATEGIES['Evidence-Only'], SOCIAL_PERSONALITIES['Honest Broker']),
      createSocialAgent(STRATEGIES['Aggressive'], SOCIAL_PERSONALITIES['Sociopath']),
      createSocialAgent(STRATEGIES['Follower'], SOCIAL_PERSONALITIES['Diplomat']),
      createSocialAgent(STRATEGIES['Cautious'], SOCIAL_PERSONALITIES['Paranoid']),
    ];

    let state = createTestGame();

    // COMMIT
    for (let i = 0; i < 4; i++) {
      const actions = agents[i].decideCommit(state, `player_${i}`);
      for (const a of actions) {
        try { state = applyAction(state, a); } catch { /* skip */ }
      }
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId: `player_${i}` });
    }

    // Generate signals
    const signals = agents.map((a, i) => a.generateSignalAction(state, `player_${i}`));

    // BROADCAST
    for (let i = 0; i < 4; i++) {
      const pid = state.turnOrder[state.currentPlayerIndex];
      const agentIdx = state.players.findIndex(p => p.id === pid);
      const action = agents[agentIdx].decideBroadcast(state, pid, signals);
      state = applyAction(state, action);
    }

    // RESOLVE
    state = applyAction(state, { type: 'RESOLVE' });

    // onRoundEnd
    for (let i = 0; i < 4; i++) {
      agents[i].onRoundEnd(state, `player_${i}`, signals);
    }

    expect(state.roundResults).toBeDefined();
  });
});
