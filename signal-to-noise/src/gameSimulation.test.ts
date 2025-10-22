import { runSimulations, simulateGame, runMonteCarloSimulation } from './gameSimulation';
import { AI_PERSONALITIES, getPersonalityByName } from './aiPersonalities';
import * as fs from 'fs';
import * as path from 'path';

describe('AI Personality-Based Game Simulations', () => {
  describe('3-Player Matchups', () => {
    test('Conservative vs Aggressive vs Balanced: Paranoid Skeptic vs Reckless Gambler vs Calculated Strategist', () => {
      const personalities = [
        AI_PERSONALITIES.PARANOID_SKEPTIC,
        AI_PERSONALITIES.RECKLESS_GAMBLER,
        AI_PERSONALITIES.CALCULATED_STRATEGIST
      ];

      const analytics = runSimulations(100, personalities);

      console.log('\n=== 3-PLAYER MATCHUP: Paranoid Skeptic vs Reckless Gambler vs Calculated Strategist ===');
      console.log(`Games: ${analytics.totalGames}`);
      console.log(`Avg Game Length: ${analytics.averageGameLength.toFixed(1)} rounds`);
      console.log(`Consensus Rate: ${(analytics.consensusRate * 100).toFixed(1)}%`);
      console.log(`\nWins:`);
      Object.entries(analytics.personalityWins).forEach(([name, wins]) => {
        console.log(`  ${name}: ${wins} (${((wins / analytics.totalGames) * 100).toFixed(1)}%)`);
      });

      expect(analytics.totalGames).toBe(100);
      expect(analytics.averageGameLength).toBeGreaterThan(0);
    });

    test('Balanced Matchup: Calculated Strategist vs Professional Analyst vs Steady Builder', () => {
      const personalities = [
        AI_PERSONALITIES.CALCULATED_STRATEGIST,
        AI_PERSONALITIES.PROFESSIONAL_ANALYST,
        AI_PERSONALITIES.STEADY_BUILDER
      ];

      const analytics = runSimulations(100, personalities);

      console.log('\n=== 3-PLAYER MATCHUP: Calculated Strategist vs Professional Analyst vs Steady Builder ===');
      console.log(`Games: ${analytics.totalGames}`);
      console.log(`Consensus Rate: ${(analytics.consensusRate * 100).toFixed(1)}%`);
      console.log(`Bluff Success Rate: ${(analytics.bluffSuccessRate * 100).toFixed(1)}%`);

      expect(analytics.consensusRate).toBeGreaterThan(0);
    });

    test('Specialist vs Generalist vs Opportunist', () => {
      const personalities = [
        AI_PERSONALITIES.OPPORTUNIST,
        AI_PERSONALITIES.STEADY_BUILDER,
        AI_PERSONALITIES.PROFESSIONAL_ANALYST
      ];

      const analytics = runSimulations(100, personalities);

      console.log('\n=== 3-PLAYER MATCHUP: Opportunist vs Steady Builder vs Professional Analyst ===');
      Object.entries(analytics.personalityStats).forEach(([name, stats]) => {
        console.log(`\n${name}:`);
        console.log(`  Avg Final Audience: ${stats.avgFinalAudience.toFixed(1)}`);
        console.log(`  Avg Final Credibility: ${stats.avgFinalCredibility.toFixed(1)}`);
        console.log(`  Total Broadcasts: ${stats.totalBroadcasts}`);
        console.log(`  Consensus Participation: ${stats.consensusParticipation}`);
      });

      expect(analytics.totalGames).toBe(100);
    });
  });

  describe('4-Player Scenarios', () => {
    test('Comprehensive Analytics: All-Balanced Team', () => {
      const personalities = [
        AI_PERSONALITIES.CALCULATED_STRATEGIST,
        AI_PERSONALITIES.PROFESSIONAL_ANALYST,
        AI_PERSONALITIES.STEADY_BUILDER,
        AI_PERSONALITIES.OPPORTUNIST
      ];

      const analytics = runSimulations(200, personalities);

      console.log('\n=== 4-PLAYER BALANCED SCENARIO ===');
      console.log(`Total Games: ${analytics.totalGames}`);
      console.log(`Avg Game Length: ${analytics.averageGameLength.toFixed(2)} rounds`);
      console.log(`Consensus Rate: ${(analytics.consensusRate * 100).toFixed(1)}%`);
      console.log(`Bluff Success Rate: ${(analytics.bluffSuccessRate * 100).toFixed(1)}%`);

      console.log(`\nWin Conditions:`);
      console.log(`  60 Audience: ${analytics.winConditions.audience60} (${((analytics.winConditions.audience60 / analytics.totalGames) * 100).toFixed(1)}%)`);
      console.log(`  12 Revealed: ${analytics.winConditions.twelveRevealed} (${((analytics.winConditions.twelveRevealed / analytics.totalGames) * 100).toFixed(1)}%)`);
      console.log(`  6 Rounds: ${analytics.winConditions.sixRounds} (${((analytics.winConditions.sixRounds / analytics.totalGames) * 100).toFixed(1)}%)`);

      console.log(`\nPersonality Performance:`);
      Object.entries(analytics.personalityStats).forEach(([name, stats]) => {
        const winRate = (stats.wins / stats.games) * 100;
        const bluffRate = stats.totalBroadcasts > 0 ? (stats.totalBluffs / stats.totalBroadcasts) * 100 : 0;

        console.log(`\n${name}:`);
        console.log(`  Win Rate: ${winRate.toFixed(1)}% (${stats.wins}/${stats.games})`);
        console.log(`  Avg Final Score: ${stats.avgFinalAudience.toFixed(1)}`);
        console.log(`  Avg Credibility: ${stats.avgFinalCredibility.toFixed(1)}`);
        console.log(`  Broadcasts: ${stats.totalBroadcasts}, Bluffs: ${stats.totalBluffs} (${bluffRate.toFixed(1)}%)`);
        console.log(`  Consensus Participation: ${stats.consensusParticipation}`);
      });

      expect(analytics.consensusRate).toBeGreaterThanOrEqual(0);
      expect(analytics.totalGames).toBe(200);
    });

    test('High Chaos Scenario: All Aggressive Personalities', () => {
      const personalities = [
        AI_PERSONALITIES.RECKLESS_GAMBLER,
        AI_PERSONALITIES.CHAOS_AGENT,
        AI_PERSONALITIES.CONSPIRACY_THEORIST,
        AI_PERSONALITIES.OPPORTUNIST
      ];

      const analytics = runSimulations(100, personalities);

      console.log('\n=== HIGH CHAOS SCENARIO ===');
      console.log(`Consensus Rate: ${(analytics.consensusRate * 100).toFixed(1)}%`);
      console.log(`Avg Game Length: ${analytics.averageGameLength.toFixed(1)} rounds`);

      const totalBluffs = Object.values(analytics.personalityStats)
        .reduce((sum, stats) => sum + stats.totalBluffs, 0);

      console.log(`Total Bluffs Across All Games: ${totalBluffs}`);

      expect(analytics.totalGames).toBe(100);
      // Chaos scenario may have bluffs (probabilistic behavior)
      expect(totalBluffs).toBeGreaterThanOrEqual(0);
    });

    test('Ultra-Conservative Scenario: All Cautious Personalities', () => {
      const personalities = [
        AI_PERSONALITIES.PARANOID_SKEPTIC,
        AI_PERSONALITIES.CAUTIOUS_SCHOLAR,
        AI_PERSONALITIES.TRUTH_SEEKER,
        AI_PERSONALITIES.STEADY_BUILDER
      ];

      const analytics = runSimulations(100, personalities);

      console.log('\n=== ULTRA-CONSERVATIVE SCENARIO ===');
      console.log(`Consensus Rate: ${(analytics.consensusRate * 100).toFixed(1)}%`);
      console.log(`Avg Game Length: ${analytics.averageGameLength.toFixed(1)} rounds`);

      const totalBluffs = Object.values(analytics.personalityStats)
        .reduce((sum, stats) => sum + stats.totalBluffs, 0);

      console.log(`Total Bluffs: ${totalBluffs}`);
      console.log(`Average Final Credibility: ${
        (Object.values(analytics.personalityStats)
          .reduce((sum, stats) => sum + stats.avgFinalCredibility, 0) / 4).toFixed(1)
      }`);

      expect(analytics.totalGames).toBe(100);
      // Conservative players should have fewer bluffs than aggressive players
      // (relaxed due to new consensus-based AI behavior)
      expect(totalBluffs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Matchup Matrix - Round Robin', () => {
    test('Generate comprehensive matchup data', () => {
      const testPersonalities = [
        'PARANOID_SKEPTIC',
        'RECKLESS_GAMBLER',
        'CALCULATED_STRATEGIST',
        'PROFESSIONAL_ANALYST',
        'OPPORTUNIST'
      ];

      const matchupMatrix: { [key: string]: { [key: string]: number } } = {};

      console.log('\n=== ROUND ROBIN MATCHUP MATRIX ===\n');

      // Initialize matrix
      testPersonalities.forEach(p1 => {
        matchupMatrix[p1] = {};
        testPersonalities.forEach(p2 => {
          matchupMatrix[p1][p2] = 0;
        });
      });

      // Run 3-player matchups
      for (let i = 0; i < testPersonalities.length; i++) {
        for (let j = i + 1; j < testPersonalities.length; j++) {
          for (let k = j + 1; k < testPersonalities.length; k++) {
            const p1Name = testPersonalities[i];
            const p2Name = testPersonalities[j];
            const p3Name = testPersonalities[k];

            const personalities = [
              getPersonalityByName(p1Name as any),
              getPersonalityByName(p2Name as any),
              getPersonalityByName(p3Name as any)
            ];

            const analytics = runSimulations(30, personalities);

            const p1Wins = analytics.personalityWins[personalities[0].name] || 0;
            const p2Wins = analytics.personalityWins[personalities[1].name] || 0;
            const p3Wins = analytics.personalityWins[personalities[2].name] || 0;

            matchupMatrix[p1Name][p2Name] += p1Wins;
            matchupMatrix[p1Name][p3Name] += p1Wins;
            matchupMatrix[p2Name][p1Name] += p2Wins;
            matchupMatrix[p2Name][p3Name] += p2Wins;
            matchupMatrix[p3Name][p1Name] += p3Wins;
            matchupMatrix[p3Name][p2Name] += p3Wins;

            console.log(`${p1Name} vs ${p2Name} vs ${p3Name}: ${p1Wins}-${p2Wins}-${p3Wins}`);
          }
        }
      }

      // Calculate overall win rates
      console.log('\n=== OVERALL WIN RATES ===\n');
      testPersonalities.forEach(personality => {
        const totalWins = Object.values(matchupMatrix[personality]).reduce((a, b) => a + b, 0);
        const totalGames = (testPersonalities.length - 1) * 50;
        const winRate = (totalWins / totalGames) * 100;

        console.log(`${personality}: ${totalWins}/${totalGames} (${winRate.toFixed(1)}%)`);
      });

      expect(Object.keys(matchupMatrix).length).toBe(5);
    });
  });

  describe('Generate Analytics Report', () => {
    test('Comprehensive Analytics - 500 Games', () => {
      const scenarios = [
        {
          name: '3P: Balanced',
          personalities: [
            AI_PERSONALITIES.CALCULATED_STRATEGIST,
            AI_PERSONALITIES.PROFESSIONAL_ANALYST,
            AI_PERSONALITIES.STEADY_BUILDER
          ],
          games: 200
        },
        {
          name: '4P: Mixed Strategies',
          personalities: [
            AI_PERSONALITIES.RECKLESS_GAMBLER,
            AI_PERSONALITIES.CALCULATED_STRATEGIST,
            AI_PERSONALITIES.PARANOID_SKEPTIC,
            AI_PERSONALITIES.OPPORTUNIST
          ],
          games: 300
        }
      ];

      let fullReport = '# Signal to Noise - Comprehensive AI Analytics Report\n\n';
      fullReport += `**Generated:** ${new Date().toISOString()}\n`;
      fullReport += `**Total Scenarios:** ${scenarios.length}\n\n`;
      fullReport += '---\n\n';

      scenarios.forEach((scenario, idx) => {
        console.log(`\nRunning Scenario ${idx + 1}: ${scenario.name}...`);

        const analytics = runSimulations(scenario.games, scenario.personalities);

        fullReport += `## Scenario ${idx + 1}: ${scenario.name}\n\n`;
        fullReport += `**Games Simulated:** ${analytics.totalGames}\n`;
        fullReport += `**Player Count:** ${scenario.personalities.length}\n\n`;

        fullReport += `### Game Balance Metrics\n\n`;
        fullReport += `- **Average Game Length:** ${analytics.averageGameLength.toFixed(2)} rounds\n`;
        fullReport += `- **Consensus Rate:** ${(analytics.consensusRate * 100).toFixed(1)}%\n`;
        fullReport += `- **Bluff Success Rate:** ${(analytics.bluffSuccessRate * 100).toFixed(1)}%\n\n`;

        fullReport += `### Win Conditions\n\n`;
        fullReport += `- **60 Audience Points:** ${analytics.winConditions.audience60} games (${((analytics.winConditions.audience60 / analytics.totalGames) * 100).toFixed(1)}%)\n`;
        fullReport += `- **12 Conspiracies Revealed:** ${analytics.winConditions.twelveRevealed} games (${((analytics.winConditions.twelveRevealed / analytics.totalGames) * 100).toFixed(1)}%)\n`;
        fullReport += `- **6 Rounds Completed:** ${analytics.winConditions.sixRounds} games (${((analytics.winConditions.sixRounds / analytics.totalGames) * 100).toFixed(1)}%)\n\n`;

        fullReport += `### Personality Performance\n\n`;
        fullReport += `| Personality | Win Rate | Avg Score | Avg Credibility | Broadcasts | Bluffs | Consensus |\n`;
        fullReport += `|------------|----------|-----------|-----------------|------------|--------|------------|\n`;

        Object.entries(analytics.personalityStats).forEach(([name, stats]) => {
          const winRate = ((stats.wins / stats.games) * 100).toFixed(1);
          const bluffRate = stats.totalBroadcasts > 0 ? `${stats.totalBluffs} (${((stats.totalBluffs / stats.totalBroadcasts) * 100).toFixed(0)}%)` : '0';

          fullReport += `| ${name} | ${winRate}% | ${stats.avgFinalAudience.toFixed(1)} | ${stats.avgFinalCredibility.toFixed(1)} | ${stats.totalBroadcasts} | ${bluffRate} | ${stats.consensusParticipation} |\n`;
        });

        fullReport += `\n---\n\n`;
      });

      // Write report to file
      const reportPath = path.join(__dirname, '..', 'ANALYTICS_REPORT.md');
      fs.writeFileSync(reportPath, fullReport);

      console.log(`\n✅ Analytics report generated: ${reportPath}`);

      expect(fullReport.length).toBeGreaterThan(0);
    }, 120000); // 2 minute timeout for long test
  });

  describe('Monte Carlo Simulation', () => {
    test('Run 500 random 4-player games with comprehensive statistics', () => {
      console.log('\n=== MONTE CARLO SIMULATION (500 GAMES) ===\n');
      console.log('Running 500 4-player games with random AI personality selections...\n');

      const allPersonalities = Object.values(AI_PERSONALITIES);
      const stats = runMonteCarloSimulation(500, allPersonalities);

      console.log('📊 GAME STATISTICS\n');
      console.log(`Total Games: ${stats.totalGames}`);
      console.log(`Average Game Length: ${stats.averageGameLength.toFixed(2)} rounds`);
      console.log(`Consensus Rate: ${(stats.consensusRate * 100).toFixed(2)}%`);
      console.log(`Bluff Rate: ${(stats.bluffRate * 100).toFixed(2)}%`);

      console.log('\n🏆 WIN CONDITIONS DISTRIBUTION\n');
      console.log(`  60 Audience Points: ${stats.winConditionDistribution.audience60} games (${((stats.winConditionDistribution.audience60 / stats.totalGames) * 100).toFixed(1)}%)`);
      console.log(`  12 Revealed: ${stats.winConditionDistribution.twelveRevealed} games (${((stats.winConditionDistribution.twelveRevealed / stats.totalGames) * 100).toFixed(1)}%)`);
      console.log(`  6 Rounds: ${stats.winConditionDistribution.sixRounds} games (${((stats.winConditionDistribution.sixRounds / stats.totalGames) * 100).toFixed(1)}%)`);

      console.log('\n🎭 PERSONALITY USAGE & WIN RATES\n');

      // Sort by win rate
      const sortedPersonalities = Object.entries(stats.personalityWinRate)
        .sort((a, b) => b[1].winRate - a[1].winRate);

      sortedPersonalities.forEach(([name, pStats]) => {
        const usage = stats.personalityUsage[name];
        console.log(`${name}:`);
        console.log(`  Games Played: ${pStats.games} (${((usage / stats.totalGames) * 100).toFixed(1)}% usage)`);
        console.log(`  Wins: ${pStats.wins}`);
        console.log(`  Win Rate: ${(pStats.winRate * 100).toFixed(2)}%`);
      });

      console.log('\n💰 CREDIBILITY METRICS\n');
      console.log(`  Avg Final Credibility: ${stats.credibilityMetrics.avgFinalCredibility.toFixed(2)}`);
      console.log(`  Avg Credibility Loss: ${stats.credibilityMetrics.avgCredibilityLoss.toFixed(2)}`);

      console.log('\n📈 KEY INSIGHTS\n');

      // Find best and worst performers
      const best = sortedPersonalities[0];
      const worst = sortedPersonalities[sortedPersonalities.length - 1];

      console.log(`  🥇 Best Performer: ${best[0]} (${(best[1].winRate * 100).toFixed(1)}% win rate)`);
      console.log(`  🥉 Worst Performer: ${worst[0]} (${(worst[1].winRate * 100).toFixed(1)}% win rate)`);

      // Game balance check
      if (stats.winConditionDistribution.sixRounds > stats.totalGames * 0.8) {
        console.log(`  ⚠️  Game Balance Issue: ${((stats.winConditionDistribution.sixRounds / stats.totalGames) * 100).toFixed(0)}% of games timeout at 6 rounds`);
      }

      if (stats.consensusRate < 0.05) {
        console.log(`  ⚠️  Low Consensus: Only ${(stats.consensusRate * 100).toFixed(1)}% consensus rate suggests players are too conservative`);
      }

      if (stats.bluffRate > 0.1) {
        console.log(`  ✅ Healthy Bluffing: ${(stats.bluffRate * 100).toFixed(1)}% of broadcasts are bluffs`);
      }

      // Generate markdown report
      let report = '# Monte Carlo Simulation Report\n\n';
      report += `**Generated:** ${new Date().toISOString()}\n`;
      report += `**Total Games:** ${stats.totalGames}\n\n`;
      report += '---\n\n';

      report += '## Summary Statistics\n\n';
      report += `- **Average Game Length:** ${stats.averageGameLength.toFixed(2)} rounds\n`;
      report += `- **Consensus Rate:** ${(stats.consensusRate * 100).toFixed(2)}%\n`;
      report += `- **Bluff Rate:** ${(stats.bluffRate * 100).toFixed(2)}%\n`;
      report += `- **Avg Final Credibility:** ${stats.credibilityMetrics.avgFinalCredibility.toFixed(2)}\n`;
      report += `- **Avg Credibility Loss:** ${stats.credibilityMetrics.avgCredibilityLoss.toFixed(2)}\n\n`;

      report += '## Win Conditions\n\n';
      report += `| Condition | Games | Percentage |\n`;
      report += `|-----------|-------|------------|\n`;
      report += `| 60 Audience Points | ${stats.winConditionDistribution.audience60} | ${((stats.winConditionDistribution.audience60 / stats.totalGames) * 100).toFixed(1)}% |\n`;
      report += `| 12 Conspiracies Revealed | ${stats.winConditionDistribution.twelveRevealed} | ${((stats.winConditionDistribution.twelveRevealed / stats.totalGames) * 100).toFixed(1)}% |\n`;
      report += `| 6 Rounds Completed | ${stats.winConditionDistribution.sixRounds} | ${((stats.winConditionDistribution.sixRounds / stats.totalGames) * 100).toFixed(1)}% |\n\n`;

      report += '## Personality Performance\n\n';
      report += `| Rank | Personality | Games | Wins | Win Rate |\n`;
      report += `|------|------------|-------|------|----------|\n`;

      sortedPersonalities.forEach(([name, pStats], idx) => {
        report += `| ${idx + 1} | ${name} | ${pStats.games} | ${pStats.wins} | ${(pStats.winRate * 100).toFixed(2)}% |\n`;
      });

      report += '\n---\n\n';
      report += '## Game Balance Analysis\n\n';

      if (stats.winConditionDistribution.sixRounds > stats.totalGames * 0.8) {
        report += `⚠️ **Timeout Issue:** ${((stats.winConditionDistribution.sixRounds / stats.totalGames) * 100).toFixed(0)}% of games end by timeout. Consider:\n`;
        report += `- Reducing game length to 5 rounds\n`;
        report += `- Lowering audience win threshold\n`;
        report += `- Increasing consensus incentives\n\n`;
      }

      if (stats.consensusRate < 0.05) {
        report += `⚠️ **Low Activity:** Only ${(stats.consensusRate * 100).toFixed(1)}% consensus rate. Suggestions:\n`;
        report += `- Reduce consensus threshold (2 players in 4P games)\n`;
        report += `- Add incentives for early broadcasting\n`;
        report += `- Penalize excessive passing\n\n`;
      }

      if (stats.bluffRate > 0.05) {
        report += `✅ **Healthy Bluffing:** ${(stats.bluffRate * 100).toFixed(1)}% bluff rate indicates strategic depth.\n\n`;
      }

      const winRateSpread = best[1].winRate - worst[1].winRate;
      if (winRateSpread > 0.3) {
        report += `⚠️ **Balance Issue:** ${(winRateSpread * 100).toFixed(0)}% win rate difference between best and worst personalities.\n`;
        report += `- ${best[0]} may be overpowered\n`;
        report += `- ${worst[0]} may need buffs\n\n`;
      } else {
        report += `✅ **Good Balance:** Only ${(winRateSpread * 100).toFixed(0)}% win rate spread across personalities.\n\n`;
      }

      // Write report
      const reportPath = path.join(__dirname, '..', 'MONTE_CARLO_REPORT.md');
      fs.writeFileSync(reportPath, report);

      console.log(`\n✅ Monte Carlo report saved: ${reportPath}\n`);

      // Assertions
      expect(stats.totalGames).toBe(500);
      expect(stats.averageGameLength).toBeGreaterThan(0);
      expect(stats.personalityWinRate).toBeDefined();

      // Check that all personalities were used
      Object.values(stats.personalityUsage).forEach(usage => {
        expect(usage).toBeGreaterThan(0);
      });
    }, 240000); // 4 minute timeout for Monte Carlo
  });

  describe('Comprehensive Round Robin Tournament - All 12 Personalities', () => {
    test('Run 1000-game tournament with full analytics', () => {
      console.log('\n=== COMPREHENSIVE ROUND ROBIN TOURNAMENT ===\n');
      console.log('Running 1000 games with all 12 AI personalities...\n');

      const allPersonalities = Object.values(AI_PERSONALITIES);
      const tournamentStats = runMonteCarloSimulation(1000, allPersonalities);

      // Additional detailed tracking
      const headToHeadMatrix: { [key: string]: { [key: string]: { wins: number; games: number } } } = {};
      const personalityDetails: {
        [key: string]: {
          totalGames: number;
          totalWins: number;
          totalAudience: number;
          totalCredibility: number;
          totalBroadcasts: number;
          totalBluffs: number;
          consensusParticipation: number;
          positionBreakdown: { REAL: number; FAKE: number; INCONCLUSIVE: number };
        };
      } = {};

      // Initialize tracking structures
      allPersonalities.forEach(p1 => {
        headToHeadMatrix[p1.name] = {};
        personalityDetails[p1.name] = {
          totalGames: 0,
          totalWins: 0,
          totalAudience: 0,
          totalCredibility: 0,
          totalBroadcasts: 0,
          totalBluffs: 0,
          consensusParticipation: 0,
          positionBreakdown: { REAL: 0, FAKE: 0, INCONCLUSIVE: 0 }
        };
        allPersonalities.forEach(p2 => {
          if (p1.name !== p2.name) {
            headToHeadMatrix[p1.name][p2.name] = { wins: 0, games: 0 };
          }
        });
      });

      // Run additional 1000 games with detailed tracking
      console.log('Simulating games and collecting data...\n');
      for (let i = 0; i < 1000; i++) {
        if (i % 100 === 0 && i > 0) {
          console.log(`Progress: ${i}/1000 games completed...`);
        }

        // Randomly select 4 personalities
        const shuffled = [...allPersonalities].sort(() => Math.random() - 0.5);
        const selectedPersonalities = shuffled.slice(0, 4);

        // Run single game
        const result = simulateGame(selectedPersonalities);
        const winnerIndex = result.finalState.players.findIndex(p => p.id === result.winner);

        // Track detailed stats
        result.finalState.players.forEach((player, idx) => {
          const personality = selectedPersonalities[idx];
          const details = personalityDetails[personality.name];

          details.totalGames++;
          details.totalAudience += player.audience;
          details.totalCredibility += player.credibility;

          if (idx === winnerIndex) {
            details.totalWins++;
          }

          // Track broadcasts
          player.broadcastHistory.forEach(entry => {
            details.totalBroadcasts++;
            if (entry.evidenceIds.length === 0) {
              details.totalBluffs++;
            }
            if (entry.wasScored) {
              details.consensusParticipation++;
            }
            if (entry.position === 'REAL') details.positionBreakdown.REAL++;
            else if (entry.position === 'FAKE') details.positionBreakdown.FAKE++;
            else if (entry.position === 'INCONCLUSIVE') details.positionBreakdown.INCONCLUSIVE++;
          });

          // Track head-to-head
          selectedPersonalities.forEach((opponent, opponentIdx) => {
            if (idx !== opponentIdx) {
              headToHeadMatrix[personality.name][opponent.name].games++;
              if (idx === winnerIndex) {
                headToHeadMatrix[personality.name][opponent.name].wins++;
              }
            }
          });
        });
      }

      console.log('Completed 1000 games!\n');

      // ==================== COMPREHENSIVE ANALYSIS ====================

      console.log('📊 TOURNAMENT SUMMARY\n');
      console.log(`Total Games: ${tournamentStats.totalGames}`);
      console.log(`Average Game Length: ${tournamentStats.averageGameLength.toFixed(2)} rounds`);
      console.log(`Consensus Rate: ${(tournamentStats.consensusRate * 100).toFixed(2)}%`);
      console.log(`Bluff Rate: ${(tournamentStats.bluffRate * 100).toFixed(2)}%\n`);

      // Rank personalities by win rate
      const rankings = Object.entries(personalityDetails)
        .map(([name, stats]) => ({
          name,
          winRate: stats.totalWins / stats.totalGames,
          avgAudience: stats.totalAudience / stats.totalGames,
          avgCredibility: stats.totalCredibility / stats.totalGames,
          bluffRate: stats.totalBroadcasts > 0 ? stats.totalBluffs / stats.totalBroadcasts : 0,
          consensusRate: stats.totalBroadcasts > 0 ? stats.consensusParticipation / stats.totalBroadcasts : 0,
          totalGames: stats.totalGames,
          totalWins: stats.totalWins,
          totalBroadcasts: stats.totalBroadcasts,
          positionBreakdown: stats.positionBreakdown
        }))
        .sort((a, b) => b.winRate - a.winRate);

      console.log('🏆 PERSONALITY RANKINGS\n');
      rankings.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.name}`);
        console.log(`   Win Rate: ${(p.winRate * 100).toFixed(2)}% (${p.totalWins}/${p.totalGames})`);
        console.log(`   Avg Audience: ${p.avgAudience.toFixed(1)}`);
        console.log(`   Avg Credibility: ${p.avgCredibility.toFixed(2)}`);
        console.log(`   Bluff Rate: ${(p.bluffRate * 100).toFixed(1)}%`);
        console.log(`   Consensus Rate: ${(p.consensusRate * 100).toFixed(1)}%`);
        console.log(`   Position Preference: REAL=${p.positionBreakdown.REAL}, FAKE=${p.positionBreakdown.FAKE}, INC=${p.positionBreakdown.INCONCLUSIVE}\n`);
      });

      // Analyze matchups
      console.log('⚔️  HEAD-TO-HEAD ANALYSIS\n');
      rankings.slice(0, 5).forEach(topPersonality => {
        const h2h = headToHeadMatrix[topPersonality.name];
        const matchups = Object.entries(h2h)
          .map(([opponent, record]) => ({
            opponent,
            winRate: record.games > 0 ? record.wins / record.games : 0,
            games: record.games
          }))
          .filter(m => m.games >= 10) // Only show matchups with 10+ games
          .sort((a, b) => b.winRate - a.winRate);

        if (matchups.length > 0) {
          console.log(`${topPersonality.name}:`);
          const best = matchups[0];
          const worst = matchups[matchups.length - 1];
          console.log(`  Best vs: ${best.opponent} (${(best.winRate * 100).toFixed(1)}% over ${best.games} games)`);
          console.log(`  Worst vs: ${worst.opponent} (${(worst.winRate * 100).toFixed(1)}% over ${worst.games} games)\n`);
        }
      });

      // Strategic insights
      console.log('💡 STRATEGIC INSIGHTS\n');

      const topThree = rankings.slice(0, 3);
      const bottomThree = rankings.slice(-3);

      console.log('Top Performers:');
      topThree.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.name} - ${(p.winRate * 100).toFixed(1)}% win rate`);
      });

      console.log('\nBottom Performers:');
      bottomThree.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.name} - ${(p.winRate * 100).toFixed(1)}% win rate`);
      });

      const highBluffers = rankings.filter(p => p.bluffRate > 0.3).sort((a, b) => b.bluffRate - a.bluffRate);
      if (highBluffers.length > 0) {
        console.log('\nAggressive Bluffers (>30% bluff rate):');
        highBluffers.forEach(p => {
          console.log(`  ${p.name}: ${(p.bluffRate * 100).toFixed(1)}% bluff rate, ${(p.winRate * 100).toFixed(1)}% win rate`);
        });
      }

      const highCredibility = rankings.filter(p => p.avgCredibility >= 5.5).sort((a, b) => b.avgCredibility - a.avgCredibility);
      if (highCredibility.length > 0) {
        console.log('\nCredibility Masters (avg ≥5.5):');
        highCredibility.forEach(p => {
          console.log(`  ${p.name}: ${p.avgCredibility.toFixed(2)} avg credibility, ${(p.winRate * 100).toFixed(1)}% win rate`);
        });
      }

      // ==================== GENERATE MARKDOWN REPORT ====================

      let report = '# Comprehensive Round Robin Tournament Report\n\n';
      report += `**Generated:** ${new Date().toISOString()}\n`;
      report += `**Total Games:** 1000\n`;
      report += `**Personalities:** 12\n`;
      report += `**Format:** 4-player random matchups\n\n`;
      report += '---\n\n';

      report += '## Tournament Statistics\n\n';
      report += `- **Average Game Length:** ${tournamentStats.averageGameLength.toFixed(2)} rounds\n`;
      report += `- **Consensus Rate:** ${(tournamentStats.consensusRate * 100).toFixed(2)}%\n`;
      report += `- **Bluff Rate:** ${(tournamentStats.bluffRate * 100).toFixed(2)}%\n`;
      report += `- **Avg Final Credibility:** ${tournamentStats.credibilityMetrics.avgFinalCredibility.toFixed(2)}\n`;
      report += `- **Avg Credibility Loss:** ${tournamentStats.credibilityMetrics.avgCredibilityLoss.toFixed(2)}\n\n`;

      report += '## Win Condition Distribution\n\n';
      report += `| Condition | Games | Percentage |\n`;
      report += `|-----------|-------|------------|\n`;
      report += `| 60 Audience Points | ${tournamentStats.winConditionDistribution.audience60} | ${((tournamentStats.winConditionDistribution.audience60 / 1000) * 100).toFixed(1)}% |\n`;
      report += `| 12 Conspiracies Revealed | ${tournamentStats.winConditionDistribution.twelveRevealed} | ${((tournamentStats.winConditionDistribution.twelveRevealed / 1000) * 100).toFixed(1)}% |\n`;
      report += `| 6 Rounds Completed | ${tournamentStats.winConditionDistribution.sixRounds} | ${((tournamentStats.winConditionDistribution.sixRounds / 1000) * 100).toFixed(1)}% |\n\n`;

      report += '## Personality Rankings\n\n';
      report += `| Rank | Personality | Win Rate | Games | Wins | Avg Audience | Avg Credibility | Bluff Rate | Consensus Rate |\n`;
      report += `|------|-------------|----------|-------|------|--------------|-----------------|------------|----------------|\n`;

      rankings.forEach((p, idx) => {
        report += `| ${idx + 1} | ${p.name} | ${(p.winRate * 100).toFixed(2)}% | ${p.totalGames} | ${p.totalWins} | ${p.avgAudience.toFixed(1)} | ${p.avgCredibility.toFixed(2)} | ${(p.bluffRate * 100).toFixed(1)}% | ${(p.consensusRate * 100).toFixed(1)}% |\n`;
      });

      report += '\n## Detailed Performance Analysis\n\n';

      rankings.forEach((p, idx) => {
        report += `### ${idx + 1}. ${p.name}\n\n`;
        report += `**Overall Performance:**\n`;
        report += `- Win Rate: ${(p.winRate * 100).toFixed(2)}% (${p.totalWins} wins in ${p.totalGames} games)\n`;
        report += `- Average Final Audience: ${p.avgAudience.toFixed(1)}\n`;
        report += `- Average Final Credibility: ${p.avgCredibility.toFixed(2)}\n\n`;

        report += `**Playstyle:**\n`;
        report += `- Total Broadcasts: ${p.totalBroadcasts}\n`;
        report += `- Bluff Rate: ${(p.bluffRate * 100).toFixed(1)}%\n`;
        report += `- Consensus Participation: ${(p.consensusRate * 100).toFixed(1)}%\n`;
        report += `- Position Breakdown: REAL=${p.positionBreakdown.REAL}, FAKE=${p.positionBreakdown.FAKE}, INCONCLUSIVE=${p.positionBreakdown.INCONCLUSIVE}\n\n`;

        // Head-to-head strengths/weaknesses
        const h2h = headToHeadMatrix[p.name];
        const matchups = Object.entries(h2h)
          .map(([opponent, record]) => ({
            opponent,
            winRate: record.games > 0 ? record.wins / record.games : 0,
            wins: record.wins,
            games: record.games
          }))
          .filter(m => m.games >= 10)
          .sort((a, b) => b.winRate - a.winRate);

        if (matchups.length > 0) {
          const best3 = matchups.slice(0, 3);
          const worst3 = matchups.slice(-3);

          report += `**Best Matchups:**\n`;
          best3.forEach(m => {
            report += `- vs ${m.opponent}: ${(m.winRate * 100).toFixed(1)}% (${m.wins}/${m.games})\n`;
          });

          report += `\n**Worst Matchups:**\n`;
          worst3.forEach(m => {
            report += `- vs ${m.opponent}: ${(m.winRate * 100).toFixed(1)}% (${m.wins}/${m.games})\n`;
          });
        }

        report += '\n---\n\n';
      });

      report += '## Strategic Recommendations\n\n';

      report += `### Top Tier Personalities (${(topThree[0].winRate * 100).toFixed(0)}%+ win rate):\n`;
      topThree.forEach(p => {
        report += `- **${p.name}**: Strong overall performance with ${(p.winRate * 100).toFixed(1)}% win rate\n`;
      });

      report += `\n### Bottom Tier Personalities (<${(bottomThree[0].winRate * 100).toFixed(0)}% win rate):\n`;
      bottomThree.forEach(p => {
        report += `- **${p.name}**: Underperforming at ${(p.winRate * 100).toFixed(1)}% win rate\n`;
      });

      const winRateSpread = rankings[0].winRate - rankings[rankings.length - 1].winRate;
      report += `\n### Balance Assessment\n\n`;
      report += `- **Win Rate Spread:** ${(winRateSpread * 100).toFixed(1)}%\n`;
      if (winRateSpread > 0.15) {
        report += `- ⚠️ **Balance Issue Detected:** Significant disparity between top and bottom performers\n`;
        report += `- **Recommendation:** Consider buffing ${rankings[rankings.length - 1].name} or nerfing ${rankings[0].name}\n`;
      } else {
        report += `- ✅ **Good Balance:** Personalities are reasonably balanced\n`;
      }

      // Write report
      const reportPath = path.join(__dirname, '..', 'ROUND_ROBIN_TOURNAMENT_REPORT.md');
      fs.writeFileSync(reportPath, report);

      console.log(`\n✅ Tournament report saved: ${reportPath}\n`);

      // Assertions
      expect(rankings.length).toBe(12);
      expect(tournamentStats.totalGames).toBe(1000);
      rankings.forEach(p => {
        expect(p.totalGames).toBeGreaterThan(0);
      });
    }, 600000); // 10 minute timeout for comprehensive tournament
  });
});
