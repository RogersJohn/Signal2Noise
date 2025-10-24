import { GameState, PlayerState, EvidenceCard, ConspiracyCard, BroadcastObject, AdvertiseObject, Position } from './types';
import { initializeGame, drawCards, canSupportConspiracy, detectConsensus, checkWinCondition } from './gameLogic';
import { AIPersonality, makeAIDecision, makeAdvertiseDecision, PERSONALITY_NAMES, getPersonalityByName } from './aiPersonalities';

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

  // NEW: Game always runs for 6 rounds
  const maxRounds = 6;
  while (!gameState.gameOver && gameState.round <= maxRounds) {
    // v4.2: MULTI-INVESTIGATION PHASES (refined)
    // Round 1: 2 investigations (build your case!)
    // Round 2+: 1 investigation (normal pace)
    const investigationsThisRound = gameState.round === 1 ? 2 : 1;

    for (let invPhase = 0; invPhase < investigationsThisRound; invPhase++) {
      // INVESTIGATE PHASE (simplified - AI just keeps existing assignments)
      for (let idx = 0; idx < gameState.players.length; idx++) {
        const player = gameState.players[idx];

        // v5.0: Draw 3 cards per investigation phase (max hand: 10)
        // v4.6: Filter to only evidence supporting active conspiracies
        const activeConspiracyIds = gameState.conspiracies.map(c => c.id);
        const result = drawCards(player, gameState.evidenceDeck, 3, activeConspiracyIds);
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

    // ADVERTISE PHASE (v5.0: NEW PHASE for psychological warfare)
    // Players signal which conspiracy interests them
    // This creates opportunities for bandwagoning or sets traps
    for (let i = 0; i < gameState.players.length; i++) {
      const playerIndex = (gameState.currentPlayerIndex + i) % gameState.players.length;
      const personality = personalities[playerIndex];

      const advertiseDecision = makeAdvertiseDecision(gameState, playerIndex, personality);

      if (advertiseDecision.action === 'advertise' && advertiseDecision.conspiracyId) {
        gameState.advertiseQueue.push({
          id: `advertise_${Date.now()}_${playerIndex}`,
          playerId: gameState.players[playerIndex].id,
          conspiracyId: advertiseDecision.conspiracyId,
          timestamp: Date.now(),
          isPassed: false
        });
      } else {
        // Player passes on advertising (keeps plans secret)
        gameState.advertiseQueue.push({
          id: `advertise_pass_${Date.now()}_${playerIndex}`,
          playerId: gameState.players[playerIndex].id,
          conspiracyId: '',
          timestamp: Date.now(),
          isPassed: true
        });
      }
    }

    // POST-ADVERTISE EVIDENCE PLACEMENT PHASE
    // After all advertisements are visible, each player can place ONE more evidence card
    for (let i = 0; i < gameState.players.length; i++) {
      const playerIndex = (gameState.currentPlayerIndex + i) % gameState.players.length;
      const player = gameState.players[playerIndex];
      const personality = personalities[playerIndex];

      // AI decides where to place bonus evidence card (if any available)
      if (player.evidenceHand.length > 0) {
        assignEvidenceIntelligently(player, gameState.conspiracies, personality);
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

      // Check if player advertised a conspiracy but is now broadcasting elsewhere
      // Penalty: -1 audience for not following through on advertisement
      const playerAdvertisement = gameState.advertiseQueue.find(
        a => a.playerId === player.id && !a.isPassed
      );

      if (playerAdvertisement &&
          decision.action === 'broadcast' &&
          decision.conspiracyId !== playerAdvertisement.conspiracyId) {
        // Player advertised one conspiracy but is broadcasting on a different one
        player.audience = Math.max(0, player.audience - 1);
        console.log(`  ⚠️ ${player.name} advertised ${playerAdvertisement.conspiracyId} but broadcast on ${decision.conspiracyId} (-1 audience penalty)`);
      }

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
      } else {
        // Pass penalty: lose 2 audience points
        const passPenalty = 2;
        player.audience = Math.max(0, player.audience - passPenalty);

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

        // NEW: Consensus-based scoring (NO truth checking!)
        const broadcasts = activeBroadcasts.filter(b => b.conspiracyId === conspiracyId);
        const majorityPosition = consensusResult.position; // 'REAL' or 'FAKE'

        // STEP 1: Award audience points to ALL broadcasters (regardless of position)
        broadcasts.forEach((broadcast) => {
          const player = gameState.players.find(p => p.id === broadcast.playerId);
          if (!player) return;

          // Calculate audience points using new formula
          const audienceGain = calculateAudiencePoints(broadcast, player, conspiracy);
          player.audience += audienceGain;

          // Track broadcast history
          const assignedEvidence = player.assignedEvidence[conspiracyId] || [];
          player.broadcastHistory.push({
            round: gameState.round,
            conspiracyId,
            evidenceIds: assignedEvidence.map(e => e.id),
            position: broadcast.position,
            wasScored: true
          });
        });

        // STEP 2: Adjust credibility based on consensus majority/minority
        broadcasts.forEach((broadcast) => {
          const player = gameState.players.find(p => p.id === broadcast.playerId);
          if (!player) return;

          // Skip INCONCLUSIVE broadcasts for credibility adjustment
          if (broadcast.position === 'INCONCLUSIVE') return;

          const assignedEvidence = player.assignedEvidence[conspiracyId] || [];
          const hasRealEvidence = assignedEvidence.some(card => canSupportConspiracy(card, conspiracyId));

          // v5.1: ESCALATING BLUFF PENALTY - Cumulative punishment for repeat offenders
          // 1st bluff: -2, 2nd: -3, 3rd: -4, 4th+: -5 (capped)
          if (!hasRealEvidence) {
            const bluffPenalty = Math.min(player.totalBluffs + 2, 5);
            player.credibility = Math.max(0, player.credibility - bluffPenalty);
            player.totalBluffs++; // Increment bluff counter
            console.log(`  ⚠️ ${player.name} bluffed (bluff #${player.totalBluffs}) - ${bluffPenalty} credibility penalty`);
          }

          // Majority side: +1 credibility
          if (broadcast.position === majorityPosition) {
            player.credibility = Math.min(10, player.credibility + 1);
          } else {
            // Minority side: -3 credibility (increased from -2)
            player.credibility = Math.max(0, player.credibility - 3);
          }
        });

        // STEP 3: Evidence revelation - ALL players reveal their evidence on this conspiracy
        console.log(`\n=== Consensus reached on "${conspiracy.name}": ${majorityPosition} ===`);
        console.log('Evidence revealed:');
        gameState.players.forEach(p => {
          const evidence = p.assignedEvidence[conspiracyId] || [];
          if (evidence.length > 0) {
            const evidenceNames = evidence.map(e => e.name).join(', ');
            console.log(`  ${p.name}: [${evidenceNames}]`);

            // Check for bluffs (evidence that doesn't support this conspiracy)
            const bluffs = evidence.filter(e => !canSupportConspiracy(e, conspiracyId));
            if (bluffs.length > 0) {
              console.log(`    ⚠️ BLUFFING: ${bluffs.map(b => b.name).join(', ')}`);
              if (bluffs.length === evidence.length) {
                console.log(`    ⚠️ ${p.name} had NO real evidence!`);
              }
            }
          }
        });

        // Reveal conspiracy
        conspiracy.isRevealed = true;
        gameState.totalRevealed++;
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

    // v5.0: Clear advertise queue for next round (advertisements only relevant for current round)
    gameState.advertiseQueue = [];

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
    }
  };
}

// NEW: Calculate audience points using consensus-based formula
function calculateAudiencePoints(
  broadcast: BroadcastObject,
  player: PlayerState,
  conspiracy: ConspiracyCard
): number {
  const assignedEvidence = player.assignedEvidence[broadcast.conspiracyId] || [];

  // BASE POINTS
  let basePoints = 0;
  if (broadcast.position === 'INCONCLUSIVE') {
    basePoints = 2; // Safe option
  } else if (assignedEvidence.length > 0) {
    basePoints = 3; // Broadcasting with evidence
  } else {
    basePoints = 1; // Bandwagoning (no evidence)
  }

  // Q33: TIER BONUS (harder conspiracies with less evidence get bonus points)
  const tierBonus = conspiracy.tier; // Tier 1: +1, Tier 2: +2, Tier 3: +3
  basePoints += tierBonus;

  // EVIDENCE BONUS
  let evidenceBonus = 0;

  assignedEvidence.forEach((card, index) => {
    // Q27: Diminishing returns - first card full bonus, subsequent cards reduced to +1
    let specificityBonus;
    if (index === 0) {
      // First card: full specificity bonus
      specificityBonus = card.supportedConspiracies.includes('ALL') ? 1 : 3;
    } else {
      // Subsequent cards: reduced to +1 (diminishing returns)
      specificityBonus = 1;
    }

    // Excitement multiplier
    let excitementMult = 1.0;
    if (card.excitement === 1) excitementMult = 2.0;  // Exciting (×2.0)
    if (card.excitement === -1) excitementMult = 0.5; // Boring (×0.5)

    // Apply multiplier with proper rounding
    let multipliedValue = specificityBonus * excitementMult;
    let roundedValue;
    if (card.excitement === -1) {
      // Boring cards (×0.5): Round UP on odd numbers (e.g., 3×0.5=1.5 → 2, 1×0.5=0.5 → 1)
      roundedValue = Math.ceil(multipliedValue);
    } else {
      // Normal rounding for exciting and neutral cards
      roundedValue = Math.round(multipliedValue);
    }

    // Novelty bonus (first use on this specific conspiracy, not global)
    const isNovel = !player.broadcastHistory.some(h =>
      h.conspiracyId === broadcast.conspiracyId &&
      h.evidenceIds.includes(card.id)
    );
    const noveltyBonus = isNovel ? 2 : 0;

    evidenceBonus += roundedValue + noveltyBonus;
  });

  // SUBTOTAL
  const subtotal = basePoints + evidenceBonus;

  // CREDIBILITY MODIFIER
  let finalScore = subtotal;
  if (player.credibility >= 7) {
    finalScore = Math.round(subtotal * 1.5); // High credibility: +50% bonus
  } else if (player.credibility <= 3) {
    finalScore = Math.round(subtotal * 0.75); // Low credibility: -25% penalty
  }
  // Medium credibility (4-6): no modifier

  return finalScore;
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
