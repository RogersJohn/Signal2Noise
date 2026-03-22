// Signal sent between COMMIT and BROADCAST (structured cheap talk)
export interface Signal {
  senderId: string;
  conspiracyId: string;
  claimedStrength: 'weak' | 'moderate' | 'strong';
  intent: 'lead' | 'join' | 'avoid';
  truthful: boolean; // HIDDEN — tracked for analysis only
}

// Per-player trust score toward another player
export interface TrustEntry {
  targetId: string;
  score: number;            // -1.0 to +1.0
  betrayalCount: number;
  lastBetrayalRound: number | null;
  followThroughCount: number;
}

// Trust events detected after each round
export type TrustEvent =
  | { type: 'followed_through'; playerId: string; delta: 0.15 }
  | { type: 'betrayed_signal'; playerId: string; delta: -0.25 }
  | { type: 'joined_my_consensus'; playerId: string; delta: 0.1 }
  | { type: 'opposed_my_consensus'; playerId: string; delta: -0.15 }
  | { type: 'bandwagoned_my_evidence'; playerId: string; delta: -0.05 };

// Adaptive state that changes within a game
export interface AdaptiveState {
  currentDeceptionRate: number;
  currentRiskTolerance: number;
  grudges: Map<string, number>;        // playerId → grudge intensity (0-1)
  bluffsCaught: number;
  roundsSinceLastBetrayedBy: Map<string, number>;
}

// Full social state for one agent
export interface SocialState {
  playerId: string;
  trustScores: Map<string, TrustEntry>;
  signalHistory: Signal[][];           // indexed by round
  adaptiveState: AdaptiveState;
}

// Social personality — the tunable parameters
export interface SocialPersonality {
  name: string;
  baseDeceptionRate: number;           // 0-1
  signalInfluence: number;             // 0-1
  initialTrust: number;                // -1 to +1
  trustRecoveryRate: number;           // per round recovery
  betrayalMemory: number;              // rounds before betrayal stops affecting trust
  deceptionDecayPerCatch: number;      // how much deceptionRate drops when caught
  desperationThreshold: number;        // point deficit triggering risk escalation
  desperationBoost: number;            // risk tolerance increase when desperate
  retaliationRate: number;             // 0-1
  loyaltyRate: number;                 // 0-1
  opportunismRate: number;             // 0-1
  betrayalPointThreshold: number;      // minimum point advantage to justify betrayal
}

// Belief state from interpreting signals
export type BeliefState = Map<string, number>; // conspiracyId → belief weight

// Social game result metrics
export interface SocialMetrics {
  signalHonestyRate: number;
  bluffDetectionRate: number;
  betrayalCount: number;
  avgTrustAtEnd: number;
  trustPolarization: number;
  betrayalsByRound: number[];
  grudgesFormed: number;
  retaliationCount: number;
  desperationActivations: number;
}
