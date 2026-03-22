import { AdaptiveState, SocialPersonality, TrustEvent } from './types';

export function applyDeceptionDecay(
  adaptiveState: AdaptiveState,
  wasCaught: boolean,
  personality: SocialPersonality
): AdaptiveState {
  if (!wasCaught) return adaptiveState;

  return {
    ...adaptiveState,
    currentDeceptionRate: Math.max(0.02, adaptiveState.currentDeceptionRate - personality.deceptionDecayPerCatch),
    bluffsCaught: adaptiveState.bluffsCaught + 1,
  };
}

export function applyDesperationEscalation(
  adaptiveState: AdaptiveState,
  myScore: number,
  leaderScore: number,
  round: number,
  personality: SocialPersonality
): AdaptiveState {
  if (round < 4) return adaptiveState;
  if (leaderScore - myScore < personality.desperationThreshold) return adaptiveState;

  return {
    ...adaptiveState,
    currentRiskTolerance: Math.min(0.95, adaptiveState.currentRiskTolerance + personality.desperationBoost),
  };
}

export function applyGrudgeUpdate(
  adaptiveState: AdaptiveState,
  events: TrustEvent[],
  round: number,
  personality: SocialPersonality
): AdaptiveState {
  const grudges = new Map(adaptiveState.grudges);
  const roundsSince = new Map(adaptiveState.roundsSinceLastBetrayedBy);

  // Process betrayal events
  for (const event of events) {
    if (event.type === 'betrayed_signal' || event.type === 'opposed_my_consensus') {
      const current = grudges.get(event.playerId) ?? 0;
      grudges.set(event.playerId, Math.min(1.0, current + 0.3));
      roundsSince.set(event.playerId, round);
    }
  }

  // Decay old grudges
  for (const [playerId, intensity] of grudges) {
    const lastBetrayal = roundsSince.get(playerId) ?? 0;
    if (round - lastBetrayal > personality.betrayalMemory) {
      const decayed = intensity - 0.1;
      if (decayed <= 0) {
        grudges.delete(playerId);
        roundsSince.delete(playerId);
      } else {
        grudges.set(playerId, decayed);
      }
    }
  }

  return {
    ...adaptiveState,
    grudges,
    roundsSinceLastBetrayedBy: roundsSince,
  };
}

export function applyLateGameCalculation(
  adaptiveState: AdaptiveState,
  myScore: number,
  allScores: number[],
  round: number
): AdaptiveState {
  if (round < 5) return adaptiveState;

  const maxScore = Math.max(...allScores);
  const canWin = maxScore - myScore <= 6; // plausible catch-up range

  if (canWin && myScore < maxScore) {
    return {
      ...adaptiveState,
      currentRiskTolerance: Math.max(adaptiveState.currentRiskTolerance, 0.8),
    };
  }

  return adaptiveState;
}

export function createInitialAdaptiveState(personality: SocialPersonality): AdaptiveState {
  return {
    currentDeceptionRate: personality.baseDeceptionRate,
    currentRiskTolerance: 0.5,
    grudges: new Map(),
    bluffsCaught: 0,
    roundsSinceLastBetrayedBy: new Map(),
  };
}
