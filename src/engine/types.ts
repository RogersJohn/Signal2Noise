// ── Card Types ──

export interface ConspiracyCard {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface EvidenceCard {
  id: string;
  name: string;
  targets: string[]; // conspiracy IDs or ['ALL']
  specific: boolean;
  position: Position; // 'REAL' or 'FAKE' — what this evidence supports
  flavorText: string;
}

// ── Player Types ──

export interface PlayerState {
  id: string;
  name: string;
  score: number;
  credibility: number;
  hand: EvidenceCard[];
  isHuman: boolean;
  strategyName?: string;
}

// ── Phase & Position ──

export type Phase = 'COMMIT' | 'BROADCAST' | 'RESOLVE' | 'GAME_OVER';
export type Position = 'REAL' | 'FAKE';

// ── Actions ──

export type GameAction =
  | { type: 'ASSIGN_EVIDENCE'; playerId: string; cardId: string; conspiracyId: string }
  | { type: 'DONE_COMMITTING'; playerId: string }
  | { type: 'BROADCAST'; playerId: string; conspiracyId: string; position: Position }
  | { type: 'PASS'; playerId: string }
  | { type: 'RESOLVE' }
  | { type: 'NEXT_ROUND' };

// ── Evidence Assignment Tracking ──

export interface EvidenceAssignment {
  cardId: string;
  playerId: string;
  conspiracyId: string;
  specific: boolean;
  position: Position; // the position this evidence supports
}

// ── Broadcast Tracking ──

export interface BroadcastEntry {
  playerId: string;
  conspiracyId: string;
  position: Position;
  isFirstOnConspiracy: boolean;
}

// ── Conspiracy State (active on board) ──

export interface ActiveConspiracy {
  card: ConspiracyCard;
  evidenceAssignments: EvidenceAssignment[];
  broadcasts: BroadcastEntry[];
}

// ── Round Result ──

export interface ConspiracyResult {
  conspiracyId: string;
  consensusReached: boolean;
  consensusPosition?: Position;
  majorityCount: number;
  threshold: number;
  playerResults: PlayerConspiracyResult[];
}

export interface PlayerConspiracyResult {
  playerId: string;
  position: Position;
  onMajority: boolean;
  hasEvidence: boolean;
  hasSpecificEvidence: boolean;
  evidenceMatchesBroadcast: boolean; // did their evidence position match their broadcast?
  isFirstMover: boolean;
  points: number;
  credibilityChange: number;
}

// ── Scoring Breakdown ──

export interface ScoringBreakdown {
  base: number;        // 3 with evidence, 2 bandwagon
  specificBonus: number; // +1 for specific evidence
  firstMoverBonus: number; // +1 for first broadcaster
  consensusSizeBonus: number; // +1 per player beyond threshold
  total: number;
}

// ── Game State ──

export interface GameState {
  players: PlayerState[];
  activeConspiracies: ActiveConspiracy[];
  conspiracyDeck: ConspiracyCard[];
  evidenceDeck: EvidenceCard[];
  discardPile: EvidenceCard[];
  round: number;
  maxRounds: number;
  phase: Phase;
  currentPlayerIndex: number;
  turnOrder: string[]; // player IDs in turn order (lowest score first)
  committedPlayers: string[];
  broadcastedPlayers: string[];
  roundResults: ConspiracyResult[];
  log: LogEntry[];
  consensusThreshold: number;
}

// ── Log Entry ──

export interface LogEntry {
  timestamp: number;
  round: number;
  phase: Phase;
  playerId?: string;
  action: string;
  details: string;
}

// ── Game Config ──

export interface GameConfig {
  playerNames: string[];
  humanPlayerIds: string[];
  aiStrategies?: string[];
  seed?: number;
}
