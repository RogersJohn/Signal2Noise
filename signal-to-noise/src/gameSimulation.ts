import { GameState, PlayerState, EvidenceCard, ConspiracyCard, BroadcastObject, Position } from './types';
import { initializeGame, drawCards, canSupportConspiracy, detectConsensus, checkWinCondition } from './gameLogic';
import { AIPersonality, makeAIDecision, PERSONALITY_NAMES, getPersonalityByName } from './aiPersonalities';

// Simulation Analytics
export interface GameAnalytics {
  totalGames: number;
  playerWins: { [playerId: string]: number };
  personalityWins: { [personality: string]: number };
  personalityStats: { [personality: string]: PersonalityPerformance };
  averageGameLength: number;
  averageAudienceScores: number[];
  consensusRate: number; // % of broadcasts that resulted in consensus
  bluffSuccessRate: number; // % of bluffs that didn't get caught
  excitementImpact: {
    flexiblePenalties: number;
    focusedBonuses: number;
    averageModifier: number;
  };
  winConditions: {
    audience60: number;
    twelveRevealed: number;
    sixRounds: number;
  };
  matchupResults: MatchupResult[];
}

export interface PersonalityPerformance {
  games: number;
  wins: number;
  totalBroadcasts: number;
  totalBluffs: number;
  successfulBluffs: number;
  failedBluffs: number;
  consensusParticipation: number;
  avgFinalCredibility: number;
  avgFinalAudience: number;
}

export interface MatchupResult {
  personalities: string[];
  winner: string;
  finalScores: number[];
  consensusCount: number;
  totalRounds: number;
}

// Full game simulation with AI personalities
export function simulateGame(personalities: AIPersonality[]): {
  winner: string;
  finalState: GameState;
  analytics: Partial<GameAnalytics>;
} {
  if (personalities.length < 2 || personalities.length > 4) {
    throw new Error('Game requires 2-4 players');
  }

  const gameState = initializeGame(personalities.length);
  let totalBroadcasts = 0;
  let consensusCount = 0;
  let totalBluffs = 0;
  let successfulBluffs = 0;
  let hasHadFirstConsensus = false; // v3.3: Track first consensus bonus

  // v3.4: Track participation streaks for each player (consecutive broadcasts)
  const playerStreaks = new Array(gameState.players.length).fill(0);

  // Simulate game until win condition (v3.3: dynamic rounds = playerCount)
  const maxRounds = gameState.players.length;
  while (!gameState.gameOver && gameState.round <= maxRounds) {
    // v4.2: MULTI-INVESTIGATION PHASES (refined)
    // Round 1: 2 investigations (build your case!)
    // Round 2+: 1 investigation (normal pace)
    const investigationsThisRound = gameState.round === 1 ? 2 : 1;

    for (let invPhase = 0; invPhase < investigationsThisRound; invPhase++) {
      // INVESTIGATE PHASE (simplified - AI just keeps existing assignments)
      for (let idx = 0; idx < gameState.players.length; idx++) {
        const player = gameState.players[idx];

        // Draw cards (v3.7: reverted to draw back to 3)
        // v4.6: Filter to only evidence supporting active conspiracies
        const cardsNeeded = 3 - player.evidenceHand.length;
        const activeConspiracyIds = gameState.conspiracies.map(c => c.id);
        const result = drawCards(player, gameState.evidenceDeck, cardsNeeded, activeConspiracyIds);
        gameState.players[idx] = result.updatedPlayer;
        gameState.evidenceDeck = result.updatedDeck;

        // v4.2: AI assigns evidence strategically based on personality
        // Evidence assignments persist - this only assigns NEW cards from hand
        // On investigation 2, players get 3 MORE cards and assign them
        // This simulates "reinforce existing case OR start new investigation"
        const personality = personalities[idx];
        assignEvidenceIntelligently(gameState.players[idx], gameState.conspiracies, personality);
      }
    }

    // BROADCAST PHASE
    // v4.5: PERSISTENCE - Keep ALL broadcasts from previous rounds
    // Conspiracies stay on board after reveal, replaced only at cleanup
    // This allows broadcasts to accumulate even on "solved" conspiracies
    // (No filtering - all broadcasts persist)

    for (let i = 0; i < gameState.players.length; i++) {
      const playerIndex = (gameState.currentPlayerIndex + i) % gameState.players.length;
      const player = gameState.players[playerIndex];
      const personality = personalities[playerIndex];

      const decision = makeAIDecision(gameState, playerIndex, personality);

      if (decision.action === 'broadcast' && decision.conspiracyId && decision.position) {
        const assignedCards = player.assignedEvidence[decision.conspiracyId] || [];

        gameState.broadcastQueue.push({
          id: `broadcast_${Date.now()}_${playerIndex}`,
          playerId: player.id,
          conspiracyId: decision.conspiracyId,
          position: decision.position,
          evidenceCount: assignedCards.length,
          timestamp: Date.now(),
          isPassed: false
        });

        totalBroadcasts++;
        if (decision.isBluff) {
          totalBluffs++;
        }

        // v3.4: Increment participation streak
        playerStreaks[playerIndex]++;
      } else {
        // v3.4: Escalating pass penalty (rounds 1-2: -2, rounds 3+: -4)
        const passPenalty = gameState.round <= 2 ? 2 : 4;
        player.audience = Math.max(0, player.audience - passPenalty);

        // v3.4: Reset participation streak on pass
        playerStreaks[playerIndex] = 0;

        gameState.broadcastQueue.push({
          id: `pass_${Date.now()}_${playerIndex}`,
          playerId: player.id,
          conspiracyId: '',
          position: 'REAL',
          evidenceCount: 0,
          timestamp: Date.now(),
          isPassed: true
        });
      }
    }

    // RESOLVE PHASE
    const activeBroadcasts = gameState.broadcastQueue.filter(b => !b.isPassed);
    const conspiracyIds = new Set(activeBroadcasts.map(b => b.conspiracyId));

    conspiracyIds.forEach(conspiracyId => {
      const consensusResult = detectConsensus(gameState.broadcastQueue, conspiracyId, gameState.players.length);

      if (consensusResult.consensus && consensusResult.position) {
        consensusCount++;
        const conspiracy = gameState.conspiracies.find(c => c.id === conspiracyId);
        if (!conspiracy) return;

        // Award points and track bluffs
        const broadcasts = activeBroadcasts.filter(b => b.conspiracyId === conspiracyId);

        // Sort by timestamp to identify second broadcaster (v3.2)
        const sortedBroadcasts = [...broadcasts].sort((a, b) => a.timestamp - b.timestamp);

        broadcasts.forEach((broadcast, idx) => {
          const player = gameState.players.find(p => p.id === broadcast.playerId);
          if (!player) return;

          const isCorrect = broadcast.position === conspiracy.truthValue;
          const assignedEvidence = player.assignedEvidence[conspiracyId] || [];
          // v4.0: Bluff if no evidence OR all evidence are bluff cards
          const hasRealEvidence = assignedEvidence.some(card => !card.isBluff);
          const isBluff = assignedEvidence.length === 0 || !hasRealEvidence;

          // v4.5: First broadcaster risk/reward (leadership has consequences!)
          const isFirstBroadcaster = sortedBroadcasts[0].id === broadcast.id;
          if (isFirstBroadcaster) {
            if (isCorrect) {
              player.audience += 5; // Bold leadership rewarded!
            } else {
              player.audience = Math.max(0, player.audience - 3); // Bad leadership punished!
            }
          }

          // v3.2: Second broadcaster bonus (rewards joining, not leading)
          const isSecondBroadcaster = sortedBroadcasts.length >= 2 && sortedBroadcasts[1].id === broadcast.id;
          if (isSecondBroadcaster) {
            player.audience += 2;
          }

          // v3.5: Coordination bonus (+3 for matching an existing broadcast's position)
          const broadcastIndex = sortedBroadcasts.findIndex(b => b.id === broadcast.id);
          if (broadcastIndex > 0) {
            // Not the first broadcaster - check if we match any earlier broadcast's position
            const matchesEarlier = sortedBroadcasts.slice(0, broadcastIndex).some(
              b => b.position === broadcast.position
            );
            if (matchesEarlier) {
              player.audience += 3;
            }
          }

          // v3.2: Consensus bonus (if this broadcast triggered consensus)
          if (consensusResult.consensus) {
            player.audience += 5;
          }

          // v3.4: First consensus bonus increased (stronger race dynamic!)
          if (consensusResult.consensus && !hasHadFirstConsensus) {
            player.audience += 6;
          }

          // v3.4: Participation streak bonus (+2 per consecutive broadcast)
          const playerIndex = gameState.players.findIndex(p => p.id === player.id);
          if (playerIndex !== -1 && playerStreaks[playerIndex] > 1) {
            const streakBonus = (playerStreaks[playerIndex] - 1) * 2;
            player.audience += streakBonus;
          }

          if (isBluff) {
            if (isCorrect) {
              successfulBluffs++;
            }
          }

          if (isCorrect) {
            // Calculate excitement modifier
            let excitementMod = 0;
            assignedEvidence.forEach(card => {
              const previousUses = player.broadcastHistory.filter(h =>
                h.evidenceIds.includes(card.id) && h.wasScored
              ).length;

              if (card.excitement === -1 && previousUses > 0) {
                excitementMod -= 2;
              } else if (card.excitement === 1 && previousUses > 0) {
                excitementMod += 2 * previousUses;
              }
            });

            player.audience += Math.max(0, conspiracy.tier * 5 + excitementMod);

            // Track broadcast history
            player.broadcastHistory.push({
              round: gameState.round,
              conspiracyId,
              evidenceIds: assignedEvidence.map(e => e.id),
              position: broadcast.position,
              wasScored: true
            });
          } else {
            // Wrong guess
            // v4.6: Increased bluff penalty from -5 to -7 to discourage guessing
            const penalty = isBluff ? 7 : 3;
            player.credibility = Math.max(0, player.credibility - penalty);
          }
        });

        // Reveal conspiracy
        conspiracy.isRevealed = true;
        gameState.totalRevealed++;

        // v3.3: Mark that first consensus has occurred
        if (!hasHadFirstConsensus) {
          hasHadFirstConsensus = true;
        }
      }
    });

    // CLEANUP PHASE
    // v4.5: Replace revealed conspiracies at end of round (after all broadcasts resolve)
    gameState.conspiracies = gameState.conspiracies.map(conspiracy => {
      if (conspiracy.isRevealed && gameState.conspiracyDeck.length > 0) {
        const newConspiracy = gameState.conspiracyDeck[0];
        gameState.conspiracyDeck = gameState.conspiracyDeck.slice(1);
        return newConspiracy;
      }
      return conspiracy;
    });

    gameState.round++;

    // Check win condition
    const result = checkWinCondition(gameState);
    gameState.gameOver = result.gameOver;
    gameState.winner = result.winner;

    // Update current player (losing player goes first)
    const losingPlayerIndex = gameState.players.reduce((lowestIdx, player, idx, arr) =>
      player.audience < arr[lowestIdx].audience ? idx : lowestIdx
    , 0);
    gameState.currentPlayerIndex = losingPlayerIndex;
  }

  const winner = gameState.winner || gameState.players.reduce((prev, curr) =>
    curr.audience > prev.audience ? curr : prev
  ).id;

  return {
    winner,
    finalState: gameState,
    analytics: {
      consensusRate: totalBroadcasts > 0 ? consensusCount / totalBroadcasts : 0,
      bluffSuccessRate: totalBluffs > 0 ? successfulBluffs / totalBluffs : 0,
    }
  };
}

function assignEvidenceIntelligently(
  player: PlayerState,
  conspiracies: ConspiracyCard[],
  personality: AIPersonality
): void {
  // Clear hand assignments (keep existing assigned evidence)
  const cardsToAssign = [...player.evidenceHand];
  player.evidenceHand = [];

  cardsToAssign.forEach(card => {
    const validConspiracies = conspiracies.filter(c =>
      !c.isRevealed && canSupportConspiracy(card, c.id)
    );

    if (validConspiracies.length === 0) {
      player.evidenceHand.push(card); // Keep in hand
      return;
    }

    // Choose conspiracy based on personality
    let targetConspiracy: ConspiracyCard;

    if (personality.specialization > 0.7) {
      // Specialist: Focus on conspiracies we already have evidence for
      const existing = validConspiracies.filter(c =>
        player.assignedEvidence[c.id] && player.assignedEvidence[c.id].length > 0
      );
      targetConspiracy = existing.length > 0
        ? existing[0]
        : validConspiracies[0];
    } else if (personality.preferHighTier) {
      // Prefer high-tier conspiracies
      targetConspiracy = validConspiracies.sort((a, b) => b.tier - a.tier)[0];
    } else {
      // Balanced: spread evidence
      targetConspiracy = validConspiracies[Math.floor(Math.random() * validConspiracies.length)];
    }

    if (!player.assignedEvidence[targetConspiracy.id]) {
      player.assignedEvidence[targetConspiracy.id] = [];
    }
    player.assignedEvidence[targetConspiracy.id].push(card);
  });
}

// Run multiple simulations
export function runSimulations(
  numGames: number,
  personalities: AIPersonality[]
): GameAnalytics {
  const analytics: GameAnalytics = {
    totalGames: numGames,
    playerWins: {},
    personalityWins: {},
    personalityStats: {},
    averageGameLength: 0,
    averageAudienceScores: [],
    consensusRate: 0,
    bluffSuccessRate: 0,
    excitementImpact: {
      flexiblePenalties: 0,
      focusedBonuses: 0,
      averageModifier: 0
    },
    winConditions: {
      audience60: 0,
      twelveRevealed: 0,
      sixRounds: 0
    },
    matchupResults: []
  };

  // Initialize personality stats
  personalities.forEach(p => {
    analytics.personalityStats[p.name] = {
      games: 0,
      wins: 0,
      totalBroadcasts: 0,
      totalBluffs: 0,
      successfulBluffs: 0,
      failedBluffs: 0,
      consensusParticipation: 0,
      avgFinalCredibility: 0,
      avgFinalAudience: 0
    };
  });

  let totalConsensusRate = 0;
  let totalBluffSuccessRate = 0;
  let totalGameLength = 0;

  for (let i = 0; i < numGames; i++) {
    const result = simulateGame(personalities);

    totalGameLength += result.finalState.round;
    totalConsensusRate += result.analytics.consensusRate || 0;
    totalBluffSuccessRate += result.analytics.bluffSuccessRate || 0;

    // Track wins
    const winnerIndex = result.finalState.players.findIndex(p => p.id === result.winner);
    if (winnerIndex >= 0) {
      const winnerPersonality = personalities[winnerIndex];
      analytics.personalityWins[winnerPersonality.name] =
        (analytics.personalityWins[winnerPersonality.name] || 0) + 1;
      analytics.personalityStats[winnerPersonality.name].wins++;
    }

    // Track win conditions
    if (result.finalState.players.some(p => p.audience >= 60)) {
      analytics.winConditions.audience60++;
    } else if (result.finalState.totalRevealed >= 12) {
      analytics.winConditions.twelveRevealed++;
    } else {
      analytics.winConditions.sixRounds++;
    }

    // Update personality stats
    result.finalState.players.forEach((player, idx) => {
      const personality = personalities[idx];
      const stats = analytics.personalityStats[personality.name];

      stats.games++;
      stats.avgFinalCredibility += player.credibility;
      stats.avgFinalAudience += player.audience;

      // Count broadcasts and bluffs from history
      player.broadcastHistory.forEach(entry => {
        stats.totalBroadcasts++;
        if (entry.wasScored) {
          stats.consensusParticipation++;
        }
        if (entry.evidenceIds.length === 0) {
          stats.totalBluffs++;
        }
      });
    });

    // Store matchup result
    analytics.matchupResults.push({
      personalities: personalities.map(p => p.name),
      winner: personalities[winnerIndex]?.name || 'Unknown',
      finalScores: result.finalState.players.map(p => p.audience),
      consensusCount: result.finalState.totalRevealed,
      totalRounds: result.finalState.round
    });
  }

  // Calculate averages
  analytics.averageGameLength = totalGameLength / numGames;
  analytics.consensusRate = totalConsensusRate / numGames;
  analytics.bluffSuccessRate = totalBluffSuccessRate / numGames;

  Object.values(analytics.personalityStats).forEach(stats => {
    if (stats.games > 0) {
      stats.avgFinalCredibility /= stats.games;
      stats.avgFinalAudience /= stats.games;
    }
  });

  return analytics;
}

// ==================== MONTE CARLO SIMULATOR ====================

export interface MonteCarloStats {
  totalGames: number;
  personalityUsage: { [personality: string]: number };
  personalityWinRate: { [personality: string]: { wins: number; games: number; winRate: number } };
  averageGameLength: number;
  consensusRate: number;
  bluffRate: number;
  winConditionDistribution: {
    audience60: number;
    twelveRevealed: number;
    sixRounds: number;
  };
  personalityMatchups: {
    [personality: string]: {
      bestAgainst: string[];
      worstAgainst: string[];
      avgPerformance: number;
    };
  };
  excitementMetrics: {
    avgFlexiblePenalties: number;
    avgFocusedBonuses: number;
    avgExcitementModifier: number;
  };
  credibilityMetrics: {
    avgFinalCredibility: number;
    avgCredibilityLoss: number;
  };
}

export function runMonteCarloSimulation(
  numGames: number,
  availablePersonalities: AIPersonality[]
): MonteCarloStats {
  const stats: MonteCarloStats = {
    totalGames: numGames,
    personalityUsage: {},
    personalityWinRate: {},
    averageGameLength: 0,
    consensusRate: 0,
    bluffRate: 0,
    winConditionDistribution: {
      audience60: 0,
      twelveRevealed: 0,
      sixRounds: 0
    },
    personalityMatchups: {},
    excitementMetrics: {
      avgFlexiblePenalties: 0,
      avgFocusedBonuses: 0,
      avgExcitementModifier: 0
    },
    credibilityMetrics: {
      avgFinalCredibility: 0,
      avgCredibilityLoss: 0
    }
  };

  // Initialize personality stats
  availablePersonalities.forEach(p => {
    stats.personalityUsage[p.name] = 0;
    stats.personalityWinRate[p.name] = { wins: 0, games: 0, winRate: 0 };
    stats.personalityMatchups[p.name] = {
      bestAgainst: [],
      worstAgainst: [],
      avgPerformance: 0
    };
  });

  let totalGameLength = 0;
  let totalConsensusRate = 0;
  let totalBluffs = 0;
  let totalBroadcasts = 0;
  let totalCredibilityStart = 0;
  let totalCredibilityEnd = 0;

  // Run simulations
  for (let i = 0; i < numGames; i++) {
    // Randomly select 4 personalities
    const shuffled = [...availablePersonalities].sort(() => Math.random() - 0.5);
    const selectedPersonalities = shuffled.slice(0, 4);

    // Track usage
    selectedPersonalities.forEach(p => {
      stats.personalityUsage[p.name]++;
    });

    // Run game
    const result = simulateGame(selectedPersonalities);

    // Track game length
    totalGameLength += result.finalState.round;

    // Track consensus and bluffs
    totalConsensusRate += result.analytics.consensusRate || 0;

    // Track win condition (v3 thresholds: 40 audience, 10 revealed, 5 rounds)
    if (result.finalState.players.some(p => p.audience >= 40)) {
      stats.winConditionDistribution.audience60++;
    } else if (result.finalState.totalRevealed >= 10) {
      stats.winConditionDistribution.twelveRevealed++;
    } else {
      stats.winConditionDistribution.sixRounds++;
    }

    // Track winner
    const winnerIndex = result.finalState.players.findIndex(p => p.id === result.winner);
    if (winnerIndex >= 0) {
      const winnerPersonality = selectedPersonalities[winnerIndex];
      stats.personalityWinRate[winnerPersonality.name].wins++;
    }

    // Track all participants
    result.finalState.players.forEach((player, idx) => {
      const personality = selectedPersonalities[idx];
      stats.personalityWinRate[personality.name].games++;

      // Track credibility
      totalCredibilityStart += 5; // Starting credibility
      totalCredibilityEnd += player.credibility;

      // Track bluffs and broadcasts
      player.broadcastHistory.forEach(entry => {
        totalBroadcasts++;
        if (entry.evidenceIds.length === 0) {
          totalBluffs++;
        }
      });
    });
  }

  // Calculate averages
  stats.averageGameLength = totalGameLength / numGames;
  stats.consensusRate = totalConsensusRate / numGames;
  stats.bluffRate = totalBroadcasts > 0 ? totalBluffs / totalBroadcasts : 0;
  stats.credibilityMetrics.avgFinalCredibility = totalCredibilityEnd / (numGames * 4);
  stats.credibilityMetrics.avgCredibilityLoss =
    (totalCredibilityStart - totalCredibilityEnd) / (numGames * 4);

  // Calculate win rates
  Object.keys(stats.personalityWinRate).forEach(name => {
    const pStats = stats.personalityWinRate[name];
    if (pStats.games > 0) {
      pStats.winRate = pStats.wins / pStats.games;
    }
  });

  return stats;
}
