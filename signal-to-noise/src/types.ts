// Core game data structures

export type TruthValue = 'REAL' | 'FAKE';
export type Tier = 1 | 2 | 3;
export type Phase = 'INVESTIGATE' | 'BROADCAST' | 'RESOLVE' | 'CLEANUP';
export type Position = 'REAL' | 'FAKE';

export interface ConspiracyCard {
  id: string;
  name: string;
  description: string;
  tier: Tier;
  truthValue: TruthValue;
  isRevealed: boolean;
}

export interface EvidenceCard {
  id: string;
  name: string;
  supportedConspiracies: string[]; // conspiracy IDs or "ALL"
  flavorText: string;
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
  color: string;
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
  broadcastQueue: BroadcastObject[];
  phase: Phase;
  round: number;
  gameOver: boolean;
  winner: string | null;
  advancedRules: AdvancedRules;
  // Track how many conspiracies have been revealed total
  totalRevealed: number;
}
