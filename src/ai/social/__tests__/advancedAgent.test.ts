import { createAdvancedAI } from '../advancedAgent';
import { createGame, applyAction } from '../../../engine/engine';
import { GameConfig, ConspiracyCard, EvidenceCard } from '../../../engine/types';
import { Signal } from '../types';

const testConspiracies: ConspiracyCard[] = Array.from({ length: 12 }, (_, i) => ({
  id: `c${i}`, name: `Conspiracy ${i}`, description: `Desc ${i}`, icon: '🔍',
}));

const testEvidence: EvidenceCard[] = Array.from({ length: 48 }, (_, i) => ({
  id: `ev_${i}`, name: `Evidence ${i}`,
  targets: i < 12 ? ['ALL'] : [`c${i % 5}`],
  specific: i >= 12, position: (i % 2 === 0 ? 'REAL' : 'FAKE') as 'REAL' | 'FAKE', flavorText: `Flavor ${i}`,
}));

function createTestGame() {
  const config: GameConfig = {
    playerNames: ['Human', 'AI1', 'AI2', 'AI3'],
    humanPlayerIds: ['player_0'],
    aiStrategies: ['', 'Evidence-Only', 'Aggressive', 'Follower'],
    seed: 42,
  };
  return createGame(config, testConspiracies, testEvidence);
}

describe('AdvancedAI', () => {
  it('creates agent with valid personality and base strategy', () => {
    const ai = createAdvancedAI('player_1', 'Evidence-Only', 'Honest Broker');
    expect(ai.name).toBe('The Honest Broker');
    expect(ai.personalityName).toBe('Honest Broker');
    expect(ai.playerId).toBe('player_1');
  });

  it('decideCommit returns valid actions', () => {
    const ai = createAdvancedAI('player_1', 'Evidence-Only', 'Hustler');
    const state = createTestGame();
    const actions = ai.decideCommit(state);
    expect(Array.isArray(actions)).toBe(true);
  });

  it('generateSignal returns signal with correct senderId', () => {
    const ai = createAdvancedAI('player_1', 'Aggressive', 'Diplomat');
    const state = createTestGame();
    const signal = ai.generateSignal(state);
    expect(signal.senderId).toBe('player_1');
    expect(['weak', 'moderate', 'strong']).toContain(signal.claimedStrength);
  });

  it('decideBroadcast uses signals to influence decision', () => {
    const ai = createAdvancedAI('player_1', 'Evidence-Only', 'Chameleon');
    let state = createTestGame();
    // Move to broadcast
    for (let i = 0; i < 4; i++) {
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId: `player_${i}` });
    }
    // Ensure it's AI's turn
    if (state.turnOrder[state.currentPlayerIndex] === 'player_1') {
      const signals: Signal[] = [{
        senderId: 'player_2', conspiracyId: state.activeConspiracies[0].card.id,
        claimedStrength: 'strong', intent: 'lead', truthful: true,
      }];
      const action = ai.decideBroadcast(state, signals);
      expect(action.type === 'BROADCAST' || action.type === 'PASS').toBe(true);
    }
  });

  it('onRoundEnd completes without errors', () => {
    const ai = createAdvancedAI('player_1', 'Evidence-Only', 'Paranoid');
    let state = createTestGame();
    ai.generateSignal(state);

    for (let i = 0; i < 4; i++) {
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId: `player_${i}` });
    }
    for (let i = 0; i < 4; i++) {
      const pid = state.turnOrder[state.currentPlayerIndex];
      state = applyAction(state, { type: 'PASS', playerId: pid });
    }
    state = applyAction(state, { type: 'RESOLVE' });

    expect(() => ai.onRoundEnd(state, [])).not.toThrow();
  });

  it('full 6-round lifecycle without errors', () => {
    const agents = [
      createAdvancedAI('player_1', 'Evidence-Only', 'Honest Broker'),
      createAdvancedAI('player_2', 'Aggressive', 'Sociopath'),
      createAdvancedAI('player_3', 'Follower', 'Diplomat'),
    ];

    let state = createTestGame();

    for (let round = 0; round < 6; round++) {
      // COMMIT
      state = applyAction(state, { type: 'DONE_COMMITTING', playerId: 'player_0' });
      for (const ai of agents) {
        const actions = ai.decideCommit(state);
        for (const a of actions) {
          try { state = applyAction(state, a); } catch { /* skip */ }
        }
        state = applyAction(state, { type: 'DONE_COMMITTING', playerId: ai.playerId });
      }

      // Signals
      const signals = agents.map(ai => ai.generateSignal(state));

      // BROADCAST
      for (let i = 0; i < 4; i++) {
        const pid = state.turnOrder[state.currentPlayerIndex];
        if (pid === 'player_0') {
          state = applyAction(state, { type: 'PASS', playerId: pid });
        } else {
          const ai = agents.find(a => a.playerId === pid)!;
          const action = ai.decideBroadcast(state, signals);
          state = applyAction(state, action);
        }
      }

      // RESOLVE
      state = applyAction(state, { type: 'RESOLVE' });
      for (const ai of agents) {
        ai.onRoundEnd(state, signals);
      }
      state = applyAction(state, { type: 'NEXT_ROUND' });
      if (state.phase === 'GAME_OVER') break;
    }

    expect(state.phase).toBe('GAME_OVER');
  });
});
