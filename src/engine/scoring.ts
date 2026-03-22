import {
  ActiveConspiracy,
  ConspiracyResult,
  PlayerConspiracyResult,
  ScoringBreakdown,
  Position,
} from './types';
import { checkConsensus, ConsensusCheck } from './consensus';

/**
 * Calculate the scoring breakdown for a single player on a single conspiracy.
 */
export function calculatePlayerScore(
  onMajority: boolean,
  hasEvidence: boolean,
  hasSpecificEvidence: boolean,
  isFirstMover: boolean,
  majorityCount: number,
  threshold: number
): ScoringBreakdown {
  if (!onMajority) {
    return { base: 0, specificBonus: 0, firstMoverBonus: 0, consensusSizeBonus: 0, total: 0 };
  }

  const base = hasEvidence ? 3 : 2;
  const specificBonus = hasSpecificEvidence ? 1 : 0;
  const firstMoverBonus = 0;
  const consensusSizeBonus = Math.max(0, majorityCount - threshold);
  const total = base + specificBonus + firstMoverBonus + consensusSizeBonus;

  return { base, specificBonus, firstMoverBonus, consensusSizeBonus, total };
}

/**
 * Check if a player has evidence assigned to a conspiracy.
 */
export function playerHasEvidence(
  conspiracy: ActiveConspiracy,
  playerId: string
): boolean {
  return conspiracy.evidenceAssignments.some(a => a.playerId === playerId);
}

/**
 * Check if a player has specific evidence assigned to a conspiracy.
 */
export function playerHasSpecificEvidence(
  conspiracy: ActiveConspiracy,
  playerId: string
): boolean {
  return conspiracy.evidenceAssignments.some(
    a => a.playerId === playerId && a.specific
  );
}

/**
 * Check if a player was the first to broadcast on a conspiracy.
 */
export function isFirstBroadcaster(
  conspiracy: ActiveConspiracy,
  playerId: string
): boolean {
  return conspiracy.broadcasts.length > 0 && conspiracy.broadcasts[0].playerId === playerId;
}

/**
 * Resolve a single conspiracy: check consensus, calculate scores.
 */
export function resolveConspiracy(
  conspiracy: ActiveConspiracy,
  threshold: number
): ConspiracyResult {
  const consensus: ConsensusCheck = checkConsensus(conspiracy, threshold);

  const playerResults: PlayerConspiracyResult[] = conspiracy.broadcasts.map(broadcast => {
    if (!consensus.reached || !consensus.position) {
      return {
        playerId: broadcast.playerId,
        position: broadcast.position,
        onMajority: false,
        hasEvidence: playerHasEvidence(conspiracy, broadcast.playerId),
        hasSpecificEvidence: playerHasSpecificEvidence(conspiracy, broadcast.playerId),
        isFirstMover: isFirstBroadcaster(conspiracy, broadcast.playerId),
        points: 0,
        credibilityChange: 0,
      };
    }

    const onMajority = broadcast.position === consensus.position;
    const hasEvidence = playerHasEvidence(conspiracy, broadcast.playerId);
    const hasSpecific = playerHasSpecificEvidence(conspiracy, broadcast.playerId);
    const isFirst = isFirstBroadcaster(conspiracy, broadcast.playerId);

    const scoring = calculatePlayerScore(
      onMajority,
      hasEvidence,
      hasSpecific,
      isFirst,
      consensus.majorityCount,
      threshold
    );

    return {
      playerId: broadcast.playerId,
      position: broadcast.position,
      onMajority,
      hasEvidence,
      hasSpecificEvidence: hasSpecific,
      isFirstMover: isFirst,
      points: scoring.total,
      credibilityChange: onMajority ? 1 : -1,
    };
  });

  return {
    conspiracyId: conspiracy.card.id,
    consensusReached: consensus.reached,
    consensusPosition: consensus.position,
    majorityCount: consensus.majorityCount,
    threshold,
    playerResults,
  };
}

/**
 * Resolve all active conspiracies for the round.
 */
export function resolveAllConspiracies(
  conspiracies: ActiveConspiracy[],
  threshold: number
): ConspiracyResult[] {
  return conspiracies
    .filter(c => c.broadcasts.length > 0)
    .map(c => resolveConspiracy(c, threshold));
}
