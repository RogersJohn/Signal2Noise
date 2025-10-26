import { simulateGame } from './gameSimulation';
import { AI_PERSONALITIES, AIPersonality, PERSONALITY_NAMES } from './aiPersonalities';
import * as fs from 'fs';
import * as path from 'path';

interface PersonalityStats {
  name: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  avgFinalAudience: number;
  avgFinalCredibility: number;
  totalBroadcasts: number;
  totalBluffs: number;
  bluffRate: number;
  bankruptcies: number;
  bankruptcyRate: number;
  avgRank: number; // 1.0 = always first, 4.0 = always last
}

interface PlayerCountStats {
  playerCount: number;
  gamesRun: number;
  avgGameLength: number;
  personalityStats: { [name: string]: PersonalityStats };
  winRateByPosition: number[]; // win rate for each starting position
  dominantPersonalities: string[];
  weakestPersonalities: string[];
}

// Run Monte Carlo simulation with random personality selection (duplicates allowed)
function runRandomMonteCarloForPlayerCount(
  playerCount: number,
  numGames: number
): PlayerCountStats {
  const allPersonalities = Object.values(AI_PERSONALITIES);
  const stats: PlayerCountStats = {
    playerCount,
    gamesRun: numGames,
    avgGameLength: 0,
    personalityStats: {},
    winRateByPosition: new Array(playerCount).fill(0),
    dominantPersonalities: [],
    weakestPersonalities: []
  };

  // Initialize personality stats
  allPersonalities.forEach(p => {
    stats.personalityStats[p.name] = {
      name: p.name,
      gamesPlayed: 0,
      wins: 0,
      winRate: 0,
      avgFinalAudience: 0,
      avgFinalCredibility: 0,
      totalBroadcasts: 0,
      totalBluffs: 0,
      bluffRate: 0,
      bankruptcies: 0,
      bankruptcyRate: 0,
      avgRank: 0
    };
  });

  let totalGameLength = 0;
  const positionWins = new Array(playerCount).fill(0);
  const positionGames = new Array(playerCount).fill(0);

  console.log(`\n=== Running ${numGames} games with ${playerCount} players ===`);

  for (let i = 0; i < numGames; i++) {
    // Randomly select personalities (allow duplicates)
    const selectedPersonalities: AIPersonality[] = [];
    for (let j = 0; j < playerCount; j++) {
      const randomIndex = Math.floor(Math.random() * allPersonalities.length);
      selectedPersonalities.push(allPersonalities[randomIndex]);
    }

    // Run game
    const result = simulateGame(selectedPersonalities);
    totalGameLength += result.finalState.round;

    // Track winner position
    const winnerIndex = result.finalState.players.findIndex(p => p.id === result.winner);
    if (winnerIndex >= 0) {
      positionWins[winnerIndex]++;
    }
    positionGames[winnerIndex]++;

    // Sort players by final audience (rank them)
    const rankedPlayers = [...result.finalState.players]
      .map((p, idx) => ({ player: p, personality: selectedPersonalities[idx], index: idx }))
      .sort((a, b) => {
        if (b.player.audience !== a.player.audience) {
          return b.player.audience - a.player.audience;
        }
        return b.player.credibility - a.player.credibility;
      });

    // Update stats for each player
    result.finalState.players.forEach((player, idx) => {
      const personality = selectedPersonalities[idx];
      const pStats = stats.personalityStats[personality.name];

      pStats.gamesPlayed++;
      pStats.avgFinalAudience += player.audience;
      pStats.avgFinalCredibility += player.credibility;

      // Find rank (1 = winner, playerCount = last place)
      const rank = rankedPlayers.findIndex(rp => rp.index === idx) + 1;
      pStats.avgRank += rank;

      // Track winner
      if (player.id === result.winner) {
        pStats.wins++;
      }

      // Track bankruptcies
      if (player.isBankrupt) {
        pStats.bankruptcies++;
      }

      // Count broadcasts and bluffs
      player.broadcastHistory.forEach(entry => {
        pStats.totalBroadcasts++;
        // Bluff = broadcast with no valid evidence
        if (entry.evidenceIds.length === 0) {
          pStats.totalBluffs++;
        }
      });
    });

    // Progress indicator
    if ((i + 1) % 100 === 0) {
      console.log(`  Completed ${i + 1}/${numGames} games...`);
    }
  }

  // Calculate averages and rates
  stats.avgGameLength = totalGameLength / numGames;

  Object.values(stats.personalityStats).forEach(pStats => {
    if (pStats.gamesPlayed > 0) {
      pStats.winRate = pStats.wins / pStats.gamesPlayed;
      pStats.avgFinalAudience /= pStats.gamesPlayed;
      pStats.avgFinalCredibility /= pStats.gamesPlayed;
      pStats.avgRank /= pStats.gamesPlayed;
      pStats.bluffRate = pStats.totalBroadcasts > 0 ?
        pStats.totalBluffs / pStats.totalBroadcasts : 0;
      pStats.bankruptcyRate = pStats.bankruptcies / pStats.gamesPlayed;
    }
  });

  // Calculate win rate by position
  for (let i = 0; i < playerCount; i++) {
    stats.winRateByPosition[i] = positionGames[i] > 0 ?
      positionWins[i] / positionGames[i] : 0;
  }

  // Identify dominant and weakest personalities
  const sortedByWinRate = Object.values(stats.personalityStats)
    .filter(p => p.gamesPlayed >= 50) // Minimum sample size
    .sort((a, b) => b.winRate - a.winRate);

  stats.dominantPersonalities = sortedByWinRate.slice(0, 3).map(p => p.name);
  stats.weakestPersonalities = sortedByWinRate.slice(-3).reverse().map(p => p.name);

  return stats;
}

// Run Monte Carlo across all player counts
export function runComprehensiveMonteCarloAnalysis(
  gamesPerPlayerCount: number = 500
): void {
  console.log('\n┌─────────────────────────────────────────────────────────┐');
  console.log('│  RANDOM PERSONALITY MONTE CARLO ANALYSIS                │');
  console.log('│  Testing exploitable weaknesses in AI personalities     │');
  console.log('└─────────────────────────────────────────────────────────┘\n');

  const results: PlayerCountStats[] = [];

  // Run simulations for 3, 4, and 5 players
  for (const playerCount of [3, 4, 5]) {
    const stats = runRandomMonteCarloForPlayerCount(playerCount, gamesPerPlayerCount);
    results.push(stats);
  }

  // Generate comprehensive report
  generateComprehensiveReport(results);
}

function generateComprehensiveReport(results: PlayerCountStats[]): void {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];

  let report = '# Random Personality Monte Carlo Analysis\n\n';
  report += `**Generated:** ${new Date().toLocaleString()}\n`;
  report += `**Purpose:** Identify exploitable weaknesses in AI personalities\n`;
  report += `**Method:** Random personality selection with duplicates allowed\n`;
  report += `**Games per player count:** ${results[0].gamesRun}\n`;
  report += `**Total games:** ${results.reduce((sum, r) => sum + r.gamesRun, 0)}\n\n`;
  report += '---\n\n';

  // Section 1: Executive Summary
  report += '## Executive Summary\n\n';

  results.forEach(stats => {
    report += `### ${stats.playerCount}-Player Games\n\n`;
    report += `- **Games Simulated:** ${stats.gamesRun}\n`;
    report += `- **Average Game Length:** ${stats.avgGameLength.toFixed(2)} rounds\n`;
    report += `- **Dominant Personalities:** ${stats.dominantPersonalities.join(', ')}\n`;
    report += `- **Weakest Personalities:** ${stats.weakestPersonalities.join(', ')}\n\n`;

    // Position bias analysis
    report += `**Starting Position Win Rates:**\n`;
    stats.winRateByPosition.forEach((rate, idx) => {
      report += `- Position ${idx + 1}: ${(rate * 100).toFixed(2)}%\n`;
    });
    report += '\n';
  });

  report += '---\n\n';

  // Section 2: Detailed Personality Analysis
  report += '## Detailed Personality Performance\n\n';

  // Create master ranking across all player counts
  const masterRankings: { [name: string]: { totalGames: number; totalWins: number; avgWinRate: number; avgRank: number; } } = {};

  Object.keys(results[0].personalityStats).forEach(name => {
    let totalGames = 0;
    let totalWins = 0;
    let totalRank = 0;
    let count = 0;

    results.forEach(stats => {
      const pStats = stats.personalityStats[name];
      totalGames += pStats.gamesPlayed;
      totalWins += pStats.wins;
      totalRank += pStats.avgRank;
      count++;
    });

    masterRankings[name] = {
      totalGames,
      totalWins,
      avgWinRate: totalGames > 0 ? totalWins / totalGames : 0,
      avgRank: totalRank / count
    };
  });

  const sortedMaster = Object.entries(masterRankings)
    .sort((a, b) => b[1].avgWinRate - a[1].avgWinRate);

  report += '### Overall Rankings (All Player Counts Combined)\n\n';
  report += '| Rank | Personality | Total Games | Win Rate | Avg Rank | Total Wins |\n';
  report += '|------|-------------|-------------|----------|----------|------------|\n';

  sortedMaster.forEach(([name, data], idx) => {
    report += `| ${idx + 1} | ${name} | ${data.totalGames} | ${(data.avgWinRate * 100).toFixed(2)}% | ${data.avgRank.toFixed(2)} | ${data.totalWins} |\n`;
  });

  report += '\n';

  // Section 3: Player Count Breakdown
  results.forEach(stats => {
    report += `### ${stats.playerCount}-Player Game Analysis\n\n`;

    const sorted = Object.values(stats.personalityStats)
      .sort((a, b) => b.winRate - a.winRate);

    report += '| Rank | Personality | Games | Win Rate | Avg Audience | Avg Cred | Bluff Rate | Bankruptcy Rate | Avg Rank |\n';
    report += '|------|-------------|-------|----------|--------------|----------|------------|-----------------|----------|\n';

    sorted.forEach((p, idx) => {
      report += `| ${idx + 1} | ${p.name} | ${p.gamesPlayed} | ${(p.winRate * 100).toFixed(2)}% | ${p.avgFinalAudience.toFixed(1)} | ${p.avgFinalCredibility.toFixed(2)} | ${(p.bluffRate * 100).toFixed(1)}% | ${(p.bankruptcyRate * 100).toFixed(1)}% | ${p.avgRank.toFixed(2)} |\n`;
    });

    report += '\n';
  });

  // Section 4: Exploitable Weaknesses
  report += '---\n\n## Exploitable Weaknesses Analysis\n\n';

  // Identify patterns
  report += '### High Bankruptcy Risk Personalities\n\n';
  const highBankruptcy: { name: string; rate: number; playerCount: number }[] = [];
  results.forEach(stats => {
    Object.values(stats.personalityStats).forEach(p => {
      if (p.bankruptcyRate > 0.15 && p.gamesPlayed >= 50) {
        highBankruptcy.push({
          name: p.name,
          rate: p.bankruptcyRate,
          playerCount: stats.playerCount
        });
      }
    });
  });

  if (highBankruptcy.length > 0) {
    highBankruptcy.sort((a, b) => b.rate - a.rate);
    report += 'Personalities with >15% bankruptcy rate:\n\n';
    highBankruptcy.forEach(p => {
      report += `- **${p.name}** (${p.playerCount}p): ${(p.rate * 100).toFixed(1)}% bankruptcy rate\n`;
    });
    report += '\n**Exploitation Strategy:** Target these personalities with aggressive bluffing - they will self-destruct.\n\n';
  } else {
    report += 'No personalities show concerning bankruptcy rates.\n\n';
  }

  report += '### Passive/Underperforming Personalities\n\n';
  const underperformers = sortedMaster.slice(-3);
  report += 'Bottom 3 performers across all formats:\n\n';
  underperformers.forEach(([name, data]) => {
    report += `- **${name}**: ${(data.avgWinRate * 100).toFixed(2)}% win rate (avg rank: ${data.avgRank.toFixed(2)})\n`;
  });
  report += '\n**Exploitation Strategy:** These personalities are weak - they won\'t challenge you for consensus.\n\n';

  report += '### Dominant/Overpowered Personalities\n\n';
  const overperformers = sortedMaster.slice(0, 3);
  report += 'Top 3 performers across all formats:\n\n';
  overperformers.forEach(([name, data]) => {
    report += `- **${name}**: ${(data.avgWinRate * 100).toFixed(2)}% win rate (avg rank: ${data.avgRank.toFixed(2)})\n`;
  });
  report += '\n**Counter Strategy:** These personalities will compete aggressively - form coalitions against them.\n\n';

  report += '### Position Bias Analysis\n\n';
  results.forEach(stats => {
    const maxRate = Math.max(...stats.winRateByPosition);
    const minRate = Math.min(...stats.winRateByPosition);
    const spread = maxRate - minRate;

    report += `**${stats.playerCount}-Player Games:**\n`;
    report += `- Highest win rate: Position ${stats.winRateByPosition.indexOf(maxRate) + 1} (${(maxRate * 100).toFixed(2)}%)\n`;
    report += `- Lowest win rate: Position ${stats.winRateByPosition.indexOf(minRate) + 1} (${(minRate * 100).toFixed(2)}%)\n`;
    report += `- Position advantage spread: ${(spread * 100).toFixed(2)}%\n`;

    if (spread > 0.05) {
      report += `- **⚠️ SIGNIFICANT POSITION BIAS DETECTED** - Going ${stats.winRateByPosition.indexOf(maxRate) + 1}${stats.winRateByPosition.indexOf(maxRate) === 0 ? 'st' : stats.winRateByPosition.indexOf(maxRate) === 1 ? 'nd' : 'rd'} provides measurable advantage\n`;
    }
    report += '\n';
  });

  report += '---\n\n## Key Insights\n\n';

  // Generate insights
  const topPerformer = sortedMaster[0];
  const bottomPerformer = sortedMaster[sortedMaster.length - 1];
  const winRateGap = topPerformer[1].avgWinRate - bottomPerformer[1].avgWinRate;

  report += `1. **Performance Gap:** The best personality (${topPerformer[0]}) has a ${(winRateGap * 100).toFixed(1)}% higher win rate than the worst (${bottomPerformer[0]}). ${winRateGap > 0.15 ? 'This is a SIGNIFICANT imbalance.' : 'This represents reasonable balance.'}\n\n`;

  // Check if aggressive bluffing pays off
  const aggressiveBluffers = sortedMaster.filter(([name]) => {
    const pStats = results[1].personalityStats[name]; // Use 4-player stats as baseline
    return pStats.bluffRate > 0.3;
  }).map(([name, data]) => ({ name, winRate: data.avgWinRate }));

  if (aggressiveBluffers.length > 0) {
    const avgBlufferWinRate = aggressiveBluffers.reduce((sum, p) => sum + p.winRate, 0) / aggressiveBluffers.length;
    const overallAvgWinRate = sortedMaster.reduce((sum, [, data]) => sum + data.avgWinRate, 0) / sortedMaster.length;

    report += `2. **Bluffing Strategy:** Aggressive bluffers (>30% bluff rate) have an average win rate of ${(avgBlufferWinRate * 100).toFixed(2)}%, ${avgBlufferWinRate > overallAvgWinRate ? 'ABOVE' : 'below'} the overall average of ${(overallAvgWinRate * 100).toFixed(2)}%. ${avgBlufferWinRate > overallAvgWinRate ? 'Bluffing is rewarded in the current implementation.' : 'The bluff penalty system is working as intended.'}\n\n`;
  }

  report += `3. **Player Count Effects:** ${results.length} player count configurations tested. ${results.some(r => Math.max(...r.winRateByPosition) - Math.min(...r.winRateByPosition) > 0.05) ? 'Position bias detected in some configurations - turn order matters.' : 'No significant position bias detected.'}\n\n`;

  report += '---\n\n';
  report += `**Report Generated:** ${new Date().toLocaleString()}\n`;
  report += `**Analysis Complete** ✅\n`;

  // Write report to file
  const reportPath = path.join(__dirname, '..', 'RANDOM_MONTE_CARLO_ANALYSIS.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n✅ Report written to: ${reportPath}`);
  console.log('\n' + '='.repeat(60));
  console.log(report);
  console.log('='.repeat(60));
}

// Run if executed directly
if (require.main === module) {
  runComprehensiveMonteCarloAnalysis(500);
}
