import { Signal, SocialPersonality } from './types';
import { GameState, GameAction } from '../../engine/types';
import { getStrategy } from '../strategies';
import { getSocialPersonality } from './personalities';
import { createSocialAgent, SocialAIStrategy } from './socialAgent';

export interface AdvancedAI {
  readonly name: string;
  readonly personalityName: string;
  readonly playerId: string;
  decideCommit(state: GameState): GameAction[];
  generateSignal(state: GameState): Signal;
  decideBroadcast(state: GameState, allSignals: Signal[]): GameAction;
  onRoundEnd(state: GameState, allSignals: Signal[]): void;
}

export function createAdvancedAI(
  playerId: string,
  baseStrategyName: string,
  personalityName: string
): AdvancedAI {
  const personality = getSocialPersonality(personalityName);
  const baseStrategy = getStrategy(baseStrategyName);
  const socialAgent = createSocialAgent(baseStrategy, personality);

  return {
    name: `The ${personalityName}`,
    personalityName,
    playerId,

    decideCommit(state) {
      return socialAgent.decideCommit(state, playerId);
    },

    generateSignal(state) {
      return socialAgent.generateSignalAction(state, playerId);
    },

    decideBroadcast(state, allSignals) {
      return socialAgent.decideBroadcast(state, playerId, allSignals);
    },

    onRoundEnd(state, allSignals) {
      socialAgent.onRoundEnd(state, playerId, allSignals);
    },
  };
}
