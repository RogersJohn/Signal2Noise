import { runSimulations, simulateGame, runMonteCarloSimulation } from './gameSimulation';
import { AI_PERSONALITIES, getPersonalityByName } from './aiPersonalities';
import * as fs from 'fs';
import * as path from 'path';

describe('AI Personality-Based Game Simulations', () => {
  describe('2-Player Matchups', () => {
    test('Conservative vs Aggressive: Paranoid Skeptic vs Reckless Gambler', () => {
      const personalities = [
        AI_PERSONALITIES.PARANOID_SKEPTIC,
        AI_PERSONALITIES.RECKLESS_GAMBLER
      ];

      const analytics = runSimulations(100, personalities);

      console.log('\n=== MATCHUP: Paranoid Skeptic vs Reckless Gambler ===');
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

    test('Balanced Matchup: Calculated Strategist vs Professional Analyst', () => {
      const personalities = [
        AI_PERSONALITIES.CALCULATED_STRATEGIST,
        AI_PERSONALITIES.PROFESSIONAL_ANALYST
      ];

      const analytics = runSimulations(100, personalities);

      console.log('\n=== MATCHUP: Calculated Strategist vs Professional Analyst ===');
      console.log(`Games: ${analytics.totalGames}`);
      console.log(`Consensus Rate: ${(analytics.consensusRate * 100).toFixed(1)}%`);
      console.log(`Bluff Success Rate: ${(analytics.bluffSuccessRate * 100).toFixed(1)}%`);

      expect(analytics.consensusRate).toBeGreaterThan(0);
    });

    test('Specialist vs Generalist: Opportunist vs Steady Builder', () => {
      const personalities = [
        AI_PERSONALITIES.OPPORTUNIST,
        AI_PERSONALITIES.STEADY_BUILDER
      ];

      const analytics = runSimulations(100, personalities);

      console.log('\n=== MATCHUP: Opportunist vs Steady Builder ===');
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
      // Conservative players should have very few bluffs
      expect(totalBluffs).toBeLessThan(20);
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

      // Run matchups
      for (let i = 0; i < testPersonalities.length; i++) {
        for (let j = i + 1; j < testPersonalities.length; j++) {
          const p1Name = testPersonalities[i];
          const p2Name = testPersonalities[j];

          const personalities = [
            getPersonalityByName(p1Name as any),
            getPersonalityByName(p2Name as any)
          ];

          const analytics = runSimulations(50, personalities);

          const p1Wins = analytics.personalityWins[personalities[0].name] || 0;
          const p2Wins = analytics.personalityWins[personalities[1].name] || 0;

          matchupMatrix[p1Name][p2Name] = p1Wins;
          matchupMatrix[p2Name][p1Name] = p2Wins;

          console.log(`${p1Name} vs ${p2Name}: ${p1Wins}-${p2Wins}`);
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
          name: '2P: Balanced',
          personalities: [
            AI_PERSONALITIES.CALCULATED_STRATEGIST,
            AI_PERSONALITIES.PROFESSIONAL_ANALYST
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
});
