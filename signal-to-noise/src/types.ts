// Core game data structures

export type TruthValue = 'REAL' | 'FAKE';
export type Tier = 1 | 2 | 3;
export type Phase = 'INVESTIGATE' | 'ADVERTISE' | 'BROADCAST' | 'RESOLVE' | 'CLEANUP';
export type Position = 'REAL' | 'FAKE' | 'INCONCLUSIVE';

export interface ConspiracyCard {
  id: string;
  name: string;
  description: string;
  tier: Tier;
  // truthValue is used ONLY for "Truth Matters" variant mode
  // In base game, consensus determines outcome, not objective truth
  truthValue: TruthValue;
  isRevealed: boolean;
  icon?: string; // Emoji/Unicode icon for visual identity
}

export interface EvidenceCard {
  id: string;
  name: string;
  supportedConspiracies: string[]; // conspiracy IDs or "ALL"
  flavorText: string;
  excitement: -1 | 0 | 1; // BORING (-1), NEUTRAL (0), EXCITING (+1)
  proofValue: 'REAL' | 'FAKE' | 'BLUFF'; // v5.0: What this evidence actually proves
  isBluff?: boolean; // DEPRECATED - use proofValue === 'BLUFF' instead
}

export interface BroadcastHistoryEntry {
  round: number;
  conspiracyId: string;
  evidenceIds: string[];
  position: Position;
  wasScored: boolean; // Did consensus happen?
}

export interface PlayerState {
  id: string;
  name: string;
  credibility: number; // 0-10
  audience: number; // victory points
  evidenceHand: EvidenceCard[];
  assignedEvidence: {
    [conspiracyId: string]: EvidenceCard[];
  };
  faceUpEvidence?: { // v5.0: Late-breaking evidence played face-up during BROADCAST
    [conspiracyId: string]: EvidenceCard[];
  };
  color: string;
  broadcastHistory: BroadcastHistoryEntry[];
  totalBluffs: number; // v5.1: Track cumulative bluffs for escalating penalties
}

export interface AdvertiseObject {
  id: string;
  playerId: string;
  conspiracyId: string;
  timestamp: number;
  isPassed?: boolean; // true if player passed in advertise phase
}

export interface BroadcastObject {
  id: string;
  playerId: string;
  conspiracyId: string;
  position: Position;
  evidenceCount: number;
  timestamp: number;
  isPassed?: boolean; // true if player passed instead of broadcasting
}

export interface AdvancedRules {
  counterBroadcasts: boolean;
  credibilityEffects: boolean;
  exposeAction: boolean;
  specialEvidence: boolean;
}

export interface GameState {
  conspiracies: ConspiracyCard[]; // 6 active
  conspiracyDeck: ConspiracyCard[];
  evidenceDeck: EvidenceCard[];
  players: PlayerState[];
  currentPlayerIndex: number;
  advertiseQueue: AdvertiseObject[]; // NEW: Players signal which conspiracy they're interested in
  broadcastQueue: BroadcastObject[];
  phase: Phase;
  round: number;
  gameOver: boolean;
  winner: string | null;
  advancedRules: AdvancedRules;
  // Track how many conspiracies have been revealed total
  totalRevealed: number;
}
