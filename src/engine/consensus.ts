import { ActiveConspiracy, Position } from './types';

export interface ConsensusCheck {
  reached: boolean;
  position?: Position;
  realCount: number;
  fakeCount: number;
  majorityCount: number;
  threshold: number;
}

/**
 * Get the consensus threshold for a given player count.
 * Math.ceil(playerCount / 2) — i.e. 2 for 3-4 players, 3 for 5 players.
 */
export function getConsensusThreshold(playerCount: number): number {
  return Math.ceil(playerCount / 2);
}

/**
 * Check if consensus was reached on a conspiracy.
 */
export function checkConsensus(
  conspiracy: ActiveConspiracy,
  threshold: number
): ConsensusCheck {
  const realCount = conspiracy.broadcasts.filter(b => b.position === 'REAL').length;
  const fakeCount = conspiracy.broadcasts.filter(b => b.position === 'FAKE').length;

  const realReached = realCount >= threshold;
  const fakeReached = fakeCount >= threshold;

  // If both reach threshold, the one with more wins. If tied, no consensus.
  if (realReached && fakeReached) {
    if (realCount > fakeCount) {
      return { reached: true, position: 'REAL', realCount, fakeCount, majorityCount: realCount, threshold };
    } else if (fakeCount > realCount) {
      return { reached: true, position: 'FAKE', realCount, fakeCount, majorityCount: fakeCount, threshold };
    }
    return { reached: false, realCount, fakeCount, majorityCount: Math.max(realCount, fakeCount), threshold };
  }

  if (realReached) {
    return { reached: true, position: 'REAL', realCount, fakeCount, majorityCount: realCount, threshold };
  }

  if (fakeReached) {
    return { reached: true, position: 'FAKE', realCount, fakeCount, majorityCount: fakeCount, threshold };
  }

  return { reached: false, realCount, fakeCount, majorityCount: Math.max(realCount, fakeCount), threshold };
}

/**
 * Determine if a player is on the majority side.
 */
export function isOnMajority(
  playerPosition: Position,
  consensusPosition: Position
): boolean {
  return playerPosition === consensusPosition;
}
