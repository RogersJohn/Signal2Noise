import { SocialPersonality } from './types';

export const SOCIAL_PERSONALITIES: Record<string, SocialPersonality> = {
  'Honest Broker': {
    name: 'Honest Broker',
    baseDeceptionRate: 0.05,
    signalInfluence: 0.8,
    initialTrust: 0.4,
    trustRecoveryRate: 0.15,
    betrayalMemory: 2,
    deceptionDecayPerCatch: 0.02,
    desperationThreshold: 6,
    desperationBoost: 0.15,
    retaliationRate: 0.1,
    loyaltyRate: 0.8,
    opportunismRate: 0.1,
    betrayalPointThreshold: 5,
  },

  'Sociopath': {
    name: 'Sociopath',
    baseDeceptionRate: 0.6,
    signalInfluence: 0.2,
    initialTrust: -0.3,
    trustRecoveryRate: 0.05,
    betrayalMemory: 6,
    deceptionDecayPerCatch: 0.05,
    desperationThreshold: 3,
    desperationBoost: 0.3,
    retaliationRate: 0.7,
    loyaltyRate: 0.1,
    opportunismRate: 0.9,
    betrayalPointThreshold: 1,
  },

  'Hustler': {
    name: 'Hustler',
    baseDeceptionRate: 0.25,
    signalInfluence: 0.6,
    initialTrust: 0.1,
    trustRecoveryRate: 0.1,
    betrayalMemory: 3,
    deceptionDecayPerCatch: 0.08,
    desperationThreshold: 4,
    desperationBoost: 0.2,
    retaliationRate: 0.3,
    loyaltyRate: 0.4,
    opportunismRate: 0.6,
    betrayalPointThreshold: 3,
  },

  'Diplomat': {
    name: 'Diplomat',
    baseDeceptionRate: 0.1,
    signalInfluence: 0.7,
    initialTrust: 0.3,
    trustRecoveryRate: 0.2,
    betrayalMemory: 2,
    deceptionDecayPerCatch: 0.03,
    desperationThreshold: 5,
    desperationBoost: 0.1,
    retaliationRate: 0.2,
    loyaltyRate: 0.7,
    opportunismRate: 0.3,
    betrayalPointThreshold: 4,
  },

  'Paranoid': {
    name: 'Paranoid',
    baseDeceptionRate: 0.15,
    signalInfluence: 0.3,
    initialTrust: -0.2,
    trustRecoveryRate: 0.03,
    betrayalMemory: 5,
    deceptionDecayPerCatch: 0.1,
    desperationThreshold: 4,
    desperationBoost: 0.25,
    retaliationRate: 0.8,
    loyaltyRate: 0.2,
    opportunismRate: 0.4,
    betrayalPointThreshold: 2,
  },

  'Chameleon': {
    name: 'Chameleon',
    baseDeceptionRate: 0.2,
    signalInfluence: 0.9,
    initialTrust: 0.2,
    trustRecoveryRate: 0.12,
    betrayalMemory: 3,
    deceptionDecayPerCatch: 0.06,
    desperationThreshold: 4,
    desperationBoost: 0.2,
    retaliationRate: 0.4,
    loyaltyRate: 0.5,
    opportunismRate: 0.5,
    betrayalPointThreshold: 3,
  },
};

export const SOCIAL_PERSONALITY_NAMES = Object.keys(SOCIAL_PERSONALITIES);

export function getSocialPersonality(name: string): SocialPersonality {
  const p = SOCIAL_PERSONALITIES[name];
  if (!p) throw new Error(`Unknown social personality: ${name}`);
  return p;
}
