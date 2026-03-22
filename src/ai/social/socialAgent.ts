import { Signal, SocialPersonality, SocialState, BeliefState } from './types';
import { GameState, GameAction, Position } from '../../engine/types';
import { AIStrategy } from '../strategies';
import { initializeTrust, detectTrustEvents, updateTrust, getTrustScore } from './trustTracker';
import { generateSignal, interpretSignals, getHighestBelief } from './signalLayer';
import {
  createInitialAdaptiveState,
  applyDeceptionDecay,
  applyDesperationEscalation,
  applyGrudgeUpdate,
  applyLateGameCalculation,
} from './adaptiveBehavior';

export interface SocialAIStrategy {
  name: string;
  personality: SocialPersonality;
  socialState: SocialState;
  decideCommit(state: GameState, playerId: string): GameAction[];
  generateSignalAction(state: GameState, playerId: string): Signal;
  decideBroadcast(state: GameState, playerId: string, allSignals: Signal[]): GameAction;
  onRoundEnd(state: GameState, playerId: string, allSignals: Signal[]): void;
}

export function createSocialAgent(
  baseStrategy: AIStrategy,
  personality: SocialPersonality
): SocialAIStrategy {
  let socialState: SocialState | null = null;
  let lastSignal: Signal | null = null;

  function ensureInit(state: GameState, playerId: string): SocialState {
    if (!socialState) {
      socialState = {
        playerId,
        trustScores: initializeTrust(
          state.players.map(p => p.id),
          playerId,
          personality
        ),
        signalHistory: [],
        adaptiveState: createInitialAdaptiveState(personality),
      };
    }
    return socialState;
  }

  return {
    name: `${personality.name}+${baseStrategy.name}`,
    personality,
    get socialState() { return socialState!; },

    decideCommit(state, playerId) {
      ensureInit(state, playerId);
      return baseStrategy.decideCommit(state, playerId);
    },

    generateSignalAction(state, playerId) {
      const ss = ensureInit(state, playerId);
      lastSignal = generateSignal(state, playerId, personality, ss.adaptiveState);
      return lastSignal;
    },

    decideBroadcast(state, playerId, allSignals) {
      const ss = ensureInit(state, playerId);

      // Get base strategy recommendation
      const baseAction = baseStrategy.decideBroadcast(state, playerId);

      // Interpret signals
      const beliefs = interpretSignals(allSignals, playerId, ss.trustScores, state);
      const highestBelief = getHighestBelief(beliefs);

      // If no meaningful signals, follow base strategy
      if (!highestBelief || highestBelief.weight < 0.3) {
        return baseAction;
      }

      // Apply signal influence
      if (Math.random() > personality.signalInfluence) {
        return baseAction;
      }

      const beliefConspiracyId = highestBelief.conspiracyId;
      const baseConspiracyId = baseAction.type === 'BROADCAST'
        ? (baseAction as { conspiracyId: string }).conspiracyId
        : null;

      // If base matches highest belief, follow base
      if (baseConspiracyId === beliefConspiracyId) {
        return baseAction;
      }

      // Check if we have evidence on the belief conspiracy
      const beliefConspiracy = state.activeConspiracies.find(c => c.card.id === beliefConspiracyId);
      const hasEvidenceThere = beliefConspiracy
        ? beliefConspiracy.evidenceAssignments.some(a => a.playerId === playerId)
        : false;

      if (hasEvidenceThere) {
        // Switch to belief conspiracy since we have evidence
        const position = pickPosition(beliefs, beliefConspiracyId, allSignals);
        return { type: 'BROADCAST', playerId, conspiracyId: beliefConspiracyId, position };
      }

      // No evidence — check loyalty/opportunism
      const signaler = allSignals.find(s => s.conspiracyId === beliefConspiracyId && s.senderId !== playerId);
      const signalerTrust = signaler ? getTrustScore(ss.trustScores, signaler.senderId) : 0;

      // Loyalty: follow trusted player
      if (signalerTrust > 0 && Math.random() < personality.loyaltyRate) {
        const position = pickPosition(beliefs, beliefConspiracyId, allSignals);
        return { type: 'BROADCAST', playerId, conspiracyId: beliefConspiracyId, position };
      }

      // Opportunism: bandwagon for points
      if (Math.random() < personality.opportunismRate) {
        const position = pickPosition(beliefs, beliefConspiracyId, allSignals);
        return { type: 'BROADCAST', playerId, conspiracyId: beliefConspiracyId, position };
      }

      // Check for grudge retaliation
      if (signaler) {
        const grudge = ss.adaptiveState.grudges.get(signaler.senderId) ?? 0;
        if (grudge > 0.3 && Math.random() < personality.retaliationRate) {
          // Oppose the grudge target
          const opposing: Position = allSignals.some(s => s.senderId === signaler.senderId)
            ? (Math.random() < 0.5 ? 'REAL' : 'FAKE')
            : 'FAKE';
          const otherConspiracy = state.activeConspiracies.find(c => c.card.id !== beliefConspiracyId);
          if (otherConspiracy) {
            return { type: 'BROADCAST', playerId, conspiracyId: otherConspiracy.card.id, position: opposing };
          }
        }
      }

      return baseAction;
    },

    onRoundEnd(state, playerId, allSignals) {
      const ss = ensureInit(state, playerId);

      // Store signal history
      ss.signalHistory.push([...allSignals]);

      // Detect trust events
      const events = detectTrustEvents(playerId, allSignals, state, state.roundResults);

      // Update trust
      ss.trustScores = updateTrust(ss.trustScores, events, personality, state.round);

      // Check if our bluff was caught
      const wasCaught = lastSignal && !lastSignal.truthful &&
        Array.from(ss.trustScores.values()).some(t => t.score < 0);

      // Apply adaptations
      let adaptive = ss.adaptiveState;
      adaptive = applyDeceptionDecay(adaptive, !!wasCaught, personality);

      const myScore = state.players.find(p => p.id === playerId)?.score ?? 0;
      const leaderScore = Math.max(...state.players.map(p => p.score));
      adaptive = applyDesperationEscalation(adaptive, myScore, leaderScore, state.round, personality);
      adaptive = applyGrudgeUpdate(adaptive, events, state.round, personality);
      adaptive = applyLateGameCalculation(
        adaptive, myScore,
        state.players.map(p => p.score),
        state.round
      );

      ss.adaptiveState = adaptive;
      lastSignal = null;
    },
  };
}

function pickPosition(
  beliefs: BeliefState,
  conspiracyId: string,
  signals: Signal[]
): Position {
  // Follow the majority signal direction
  const relevantSignals = signals.filter(s => s.conspiracyId === conspiracyId);
  const realVotes = relevantSignals.filter(s => s.intent === 'lead' || s.intent === 'join').length;
  const total = relevantSignals.length;
  if (total > 0 && realVotes > total / 2) return 'REAL';
  if (total > 0) return 'FAKE';
  return Math.random() < 0.5 ? 'REAL' : 'FAKE';
}
