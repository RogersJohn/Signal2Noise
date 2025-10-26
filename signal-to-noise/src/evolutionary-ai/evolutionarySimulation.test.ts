/**
 * Evolutionary Simulation Test Suite
 *
 * Run genetic algorithm evolution to discover optimal strategies
 * and expose game design flaws.
 */

import { GeneticAlgorithm, Generation } from './geneticAlgorithm';
import { GeneticAlgorithmWithOpponent } from './geneticAlgorithmWithOpponent';
import { describeGenome } from './strategyGenome';
import * as fs from 'fs';
import * as path from 'path';

describe('Evolutionary AI Strategy Discovery', () => {
  test('Quick Evolution Test - 10 generations, small population', async () => {
    console.log('\n┌────────────────────────────────────────────────────┐');
    console.log('│  EVOLUTIONARY AI - QUICK TEST                      │');
    console.log('│  10 generations, 20 agents, 15 games each          │');
    console.log('└────────────────────────────────────────────────────┘\n');

    const ga = new GeneticAlgorithm({
      populationSize: 20,
      generations: 10,
      gamesPerIndividual: 15, // 5 games each at 3p, 4p, 5p
      playerCountsToTest: [3, 4, 5],
      mutationRate: 0.15,
      mutationStrength: 0.2,
      eliteCount: 3,
      tournamentSize: 5,
    });

    const generations = await ga.evolve();

    // Generate report
    const report = generateEvolutionReport(generations, 'Quick Test');
    const reportPath = path.join(process.cwd(), 'EVOLUTION_QUICK_TEST.md');
    fs.writeFileSync(reportPath, report);

    console.log(`\n📊 Report saved to: EVOLUTION_QUICK_TEST.md`);

    expect(generations.length).toBe(10);
    expect(generations[9].bestIndividual.fitness).toBeGreaterThan(0);
  }, 600000); // 10 minute timeout

  test.skip('Full Evolution - 20 generations, larger population', async () => {
    console.log('\n┌────────────────────────────────────────────────────┐');
    console.log('│  EVOLUTIONARY AI - FULL EVOLUTION                  │');
    console.log('│  20 generations, 50 agents, 30 games each          │');
    console.log('└────────────────────────────────────────────────────┘\n');

    const ga = new GeneticAlgorithm({
      populationSize: 50,
      generations: 20,
      gamesPerIndividual: 30, // 10 games each at 3p, 4p, 5p
      playerCountsToTest: [3, 4, 5],
      mutationRate: 0.15,
      mutationStrength: 0.2,
      eliteCount: 5,
      tournamentSize: 5,
    });

    const generations = await ga.evolve();

    // Generate report
    const report = generateEvolutionReport(generations, 'Full Evolution');
    const reportPath = path.join(process.cwd(), 'EVOLUTION_FULL.md');
    fs.writeFileSync(reportPath, report);

    console.log(`\n📊 Report saved to: EVOLUTION_FULL.md`);

    expect(generations.length).toBe(20);
  }, 1800000); // 30 minute timeout

  test('Extended Evolution vs Reckless Gambler - 50 generations', async () => {
    console.log('\n┌────────────────────────────────────────────────────┐');
    console.log('│  EVOLUTIONARY AI VS RECKLESS GAMBLER              │');
    console.log('│  50 generations, 30 agents, 30 games each         │');
    console.log('│  Testing evolved strategies vs hand-crafted AI    │');
    console.log('└────────────────────────────────────────────────────┘\n');

    const ga = new GeneticAlgorithmWithOpponent({
      populationSize: 30,
      generations: 50,
      gamesPerIndividual: 30,
      playerCountsToTest: [3, 4, 5],
      mutationRate: 0.15,
      mutationStrength: 0.2,
      eliteCount: 5,
      tournamentSize: 5,
      fixedOpponent: 'RECKLESS_GAMBLER', // Include this personality in every game
    });

    const generations = await ga.evolve();

    // Generate report with mechanic analytics
    const report = generateEvolutionReportWithMechanics(generations, 'Extended Evolution vs Reckless Gambler');
    const reportPath = path.join(process.cwd(), 'EVOLUTION_VS_RECKLESS_GAMBLER.md');
    fs.writeFileSync(reportPath, report);

    console.log(`\n📊 Report saved to: EVOLUTION_VS_RECKLESS_GAMBLER.md`);

    expect(generations.length).toBe(50);
  }, 3600000); // 60 minute timeout
});

/**
 * Generate comprehensive evolution report
 */
function generateEvolutionReport(generations: Generation[], testName: string): string {
  const firstGen = generations[0];
  const lastGen = generations[generations.length - 1];

  let report = `# Evolutionary AI Strategy Discovery Report\n\n`;
  report += `**Test:** ${testName}\n`;
  report += `**Generated:** ${new Date().toLocaleString()}\n`;
  report += `**Generations:** ${generations.length}\n`;
  report += `**Population Size:** ${firstGen.population.length}\n\n`;
  report += `---\n\n`;

  // Executive Summary
  report += `## Executive Summary\n\n`;
  report += `### Evolution Progress\n\n`;
  report += `- **Initial Best Fitness:** ${firstGen.bestIndividual.fitness.toFixed(2)}\n`;
  report += `- **Final Best Fitness:** ${lastGen.bestIndividual.fitness.toFixed(2)}\n`;
  report += `- **Improvement:** ${((lastGen.bestIndividual.fitness / firstGen.bestIndividual.fitness - 1) * 100).toFixed(1)}%\n\n`;

  report += `### Best Strategy Evolved\n\n`;
  const best = lastGen.bestIndividual;
  report += `- **Win Rate:** ${((best.wins / best.gamesPlayed) * 100).toFixed(1)}%\n`;
  report += `- **Average Rank:** ${best.avgRank.toFixed(2)}\n`;
  report += `- **Average Audience:** ${(best.totalAudience / best.gamesPlayed).toFixed(1)}\n`;
  report += `- **Average Credibility:** ${(best.totalCredibility / best.gamesPlayed).toFixed(1)}\n`;
  report += `- **Bankruptcy Rate:** ${((best.bankruptcies / best.gamesPlayed) * 100).toFixed(1)}%\n`;
  report += `- **Strategy Profile:** ${describeGenome(best.genome)}\n\n`;

  // Generation-by-Generation Progress
  report += `## Generation Progress\n\n`;
  report += `| Gen | Best Fitness | Best Win Rate | Avg Fitness | Diversity | Time (s) |\n`;
  report += `|-----|--------------|---------------|-------------|-----------|----------|\n`;

  generations.forEach(gen => {
    const bestWinRate = ((gen.bestIndividual.wins / gen.bestIndividual.gamesPlayed) * 100).toFixed(1);
    report += `| ${gen.generationNumber} | ${gen.bestIndividual.fitness.toFixed(2)} | ${bestWinRate}% | ${gen.avgFitness.toFixed(2)} | ${(gen.diversityScore * 100).toFixed(1)}% | ${(gen.elapsedTime / 1000).toFixed(1)} |\n`;
  });

  report += `\n`;

  // Top 10 Evolved Strategies
  report += `## Top 10 Evolved Strategies (Final Generation)\n\n`;
  report += `| Rank | ID | Win Rate | Avg Rank | Fitness | Strategy Profile |\n`;
  report += `|------|-------|----------|----------|---------|------------------|\n`;

  lastGen.population.slice(0, 10).forEach((individual, idx) => {
    const winRate = ((individual.wins / individual.gamesPlayed) * 100).toFixed(1);
    report += `| ${idx + 1} | ${individual.id} | ${winRate}% | ${individual.avgRank.toFixed(2)} | ${individual.fitness.toFixed(2)} | ${describeGenome(individual.genome)} |\n`;
  });

  report += `\n`;

  // Detailed Genome Analysis of Best Strategy
  report += `## Best Strategy - Detailed Genome\n\n`;
  report += `### Evidence Management\n`;
  report += `- Min Evidence to Investigate: ${best.genome.minEvidenceToInvestigate}\n`;
  report += `- Min Evidence for REAL: ${best.genome.minEvidenceForREAL}\n`;
  report += `- Min Evidence for FAKE: ${best.genome.minEvidenceForFAKE}\n`;
  report += `- Max Evidence to Hold: ${best.genome.maxEvidenceToHold}\n\n`;

  report += `### Bluffing Strategy\n`;
  report += `- Bluff Tolerance: ${(best.genome.bluffTolerance * 100).toFixed(1)}%\n`;
  report += `- Bluff with REAL Evidence: ${(best.genome.bluffWithREALEvidence * 100).toFixed(1)}%\n`;
  report += `- Bluff Threshold: ${(best.genome.bluffThreshold * 100).toFixed(1)}%\n\n`;

  report += `### Betting & Risk\n`;
  report += `- Base Bet Size: ${best.genome.baseBetSize}\n`;
  report += `- Risk Tolerance: ${(best.genome.riskTolerance * 100).toFixed(1)}%\n`;
  report += `- Credibility Floor: ${best.genome.credibilityFloor}\n`;
  report += `- Bankruptcy Avoidance: ${(best.genome.bankruptcyAvoidance * 100).toFixed(1)}%\n\n`;

  report += `### Position Preference\n`;
  report += `- REAL Bias: ${best.genome.realBias.toFixed(2)} (${best.genome.realBias > 0 ? 'prefers REAL' : best.genome.realBias < 0 ? 'prefers FAKE' : 'neutral'})\n`;
  report += `- Inconclusive Tolerance: ${(best.genome.inconclusiveTolerance * 100).toFixed(1)}%\n\n`;

  report += `### Broadcast Timing\n`;
  report += `- Early Broadcast Preference: ${(best.genome.earlyBroadcastPref * 100).toFixed(1)}%\n`;
  report += `- Passing Threshold: ${(best.genome.passingThreshold * 100).toFixed(1)}%\n`;
  report += `- Min Round to Participate: ${best.genome.minRoundToParticipate}\n\n`;

  report += `### Coalition & Social\n`;
  report += `- Coalition Willingness: ${(best.genome.coalitionWillingness * 100).toFixed(1)}%\n`;
  report += `- Follow the Crowd Bias: ${(best.genome.followTheCrowdBias * 100).toFixed(1)}%\n`;
  report += `- Counter-Broadcast Aggression: ${(best.genome.counterBroadcastAggression * 100).toFixed(1)}%\n\n`;

  report += `### Late Game Strategy\n`;
  report += `- Late Game Aggression: ${(best.genome.lateGameAggression * 100).toFixed(1)}%\n`;
  report += `- Comeback Desperation: ${(best.genome.comebackDesperation * 100).toFixed(1)}%\n`;
  report += `- Protect Lead Conservatism: ${(best.genome.protectLeadConservatism * 100).toFixed(1)}%\n\n`;

  report += `### Advertise Phase\n`;
  report += `- Advertise Commitment: ${(best.genome.advertiseCommitment * 100).toFixed(1)}%\n`;
  report += `- Advertise Fakeouts: ${(best.genome.advertiseFakeouts * 100).toFixed(1)}%\n\n`;

  report += `### Meta\n`;
  report += `- Adaptiveness: ${(best.genome.adaptiveness * 100).toFixed(1)}%\n`;
  report += `- Exploration Rate: ${(best.genome.explorationRate * 100).toFixed(1)}%\n\n`;

  // Exploit Detection
  report += `## Exploit Detection Analysis\n\n`;
  report += `### Potential Game Balance Issues\n\n`;

  // Check for dominant strategies
  const topWinRate = (lastGen.bestIndividual.wins / lastGen.bestIndividual.gamesPlayed) * 100;
  if (topWinRate > 60) {
    report += `🚨 **CRITICAL: Dominant Strategy Detected**\n`;
    report += `- The evolved strategy has a ${topWinRate.toFixed(1)}% win rate, suggesting a potentially broken strategy.\n`;
    report += `- Review the genome parameters above for exploitable patterns.\n\n`;
  } else if (topWinRate > 45) {
    report += `⚠️ **WARNING: Strong Strategy Evolved**\n`;
    report += `- The best strategy achieves ${topWinRate.toFixed(1)}% win rate (expected ~${(100 / firstGen.population.length).toFixed(1)}% for balanced game).\n`;
    report += `- This may indicate an imbalanced mechanic.\n\n`;
  } else {
    report += `✅ **Balanced Competition**\n`;
    report += `- Win rate is ${topWinRate.toFixed(1)}%, suggesting no single dominant strategy.\n\n`;
  }

  // Check for convergence (low diversity)
  if (lastGen.diversityScore < 0.2) {
    report += `🚨 **CRITICAL: Strategy Convergence Detected**\n`;
    report += `- Population diversity is only ${(lastGen.diversityScore * 100).toFixed(1)}%.\n`;
    report += `- All strategies are converging to the same approach, suggesting a "solved" game.\n\n`;
  } else if (lastGen.diversityScore < 0.4) {
    report += `⚠️ **WARNING: Low Strategy Diversity**\n`;
    report += `- Diversity is ${(lastGen.diversityScore * 100).toFixed(1)}%, indicating strategies are becoming similar.\n\n`;
  } else {
    report += `✅ **Healthy Strategy Diversity**\n`;
    report += `- Diversity is ${(lastGen.diversityScore * 100).toFixed(1)}%, suggesting multiple viable approaches.\n\n`;
  }

  // Check bankruptcy rates
  const bankruptcyRate = (best.bankruptcies / best.gamesPlayed) * 100;
  if (bankruptcyRate > 20) {
    report += `⚠️ **High Bankruptcy Rate**\n`;
    report += `- Even the best strategy goes bankrupt ${bankruptcyRate.toFixed(1)}% of the time.\n`;
    report += `- Consider adjusting credibility penalties or game length.\n\n`;
  }

  report += `---\n\n`;
  report += `**Analysis Complete** ✅\n`;

  return report;
}

/**
 * Generate evolution report WITH mechanic analytics
 */
function generateEvolutionReportWithMechanics(generations: Generation[], testName: string): string {
  // Start with base report
  let report = generateEvolutionReport(generations, testName);

  // Add mechanic analytics section
  const firstGen = generations[0];
  const lastGen = generations[generations.length - 1];
  const best = lastGen.bestIndividual;

  report += `\n## Mechanic Usage Analysis\n\n`;
  report += `This section analyzes which game mechanics the evolved strategy uses and exploits.\n\n`;

  report += `### Evidence Strategy\n`;
  report += `- **Min Evidence for REAL**: ${best.genome.minEvidenceForREAL} (${best.genome.minEvidenceForREAL < 3 ? 'Low threshold - aggressive' : best.genome.minEvidenceForREAL > 7 ? 'High threshold - conservative' : 'Moderate'})\n`;
  report += `- **Min Evidence for FAKE**: ${best.genome.minEvidenceForFAKE} (${best.genome.minEvidenceForFAKE < 3 ? 'Low threshold - aggressive' : best.genome.minEvidenceForFAKE > 7 ? 'High threshold - conservative' : 'Moderate'})\n`;
  report += `- **Max Evidence to Hold**: ${best.genome.maxEvidenceToHold} (${best.genome.maxEvidenceToHold < 3 ? 'Plays cards quickly' : best.genome.maxEvidenceToHold > 7 ? 'Hoards evidence' : 'Balanced'})\n\n`;

  report += `### Bluffing Mechanic\n`;
  report += `- **Bluff Tolerance**: ${(best.genome.bluffTolerance * 100).toFixed(1)}%\n`;
  if (best.genome.bluffTolerance < 0.2) {
    report += `- ⚠️ **RARELY USED**: Bluff cards are barely utilized (<20% tolerance)\n`;
    report += `- **Implication**: Either bluffing is too risky or the penalties are too harsh\n`;
  } else if (best.genome.bluffTolerance > 0.7) {
    report += `- ⚠️ **HEAVILY EXPLOITED**: Bluff cards used frequently (>70% tolerance)\n`;
    report += `- **Implication**: Bluffing may be too rewarding or penalties too lenient\n`;
  } else {
    report += `- ✅ **BALANCED**: Bluff cards used moderately\n`;
  }
  report += `\n`;

  report += `### Advertise Phase Mechanic\n`;
  report += `- **Advertise Commitment**: ${(best.genome.advertiseCommitment * 100).toFixed(1)}%\n`;
  report += `- **Advertise Fakeouts**: ${(best.genome.advertiseFakeouts * 100).toFixed(1)}%\n`;
  if (best.genome.advertiseCommitment < 0.3) {
    report += `- ⚠️ **RARELY USED**: Low commitment suggests advertise phase is being ignored\n`;
  } else if (best.genome.advertiseFakeouts > 0.6) {
    report += `- 📊 **FAKEOUT STRATEGY**: High fakeout rate suggests deception is effective\n`;
  }
  report += `\n`;

  report += `### Passing Behavior\n`;
  report += `- **Passing Threshold**: ${(best.genome.passingThreshold * 100).toFixed(1)}% (willingness to broadcast)\n`;
  if (best.genome.passingThreshold < 0.3) {
    report += `- ⚠️ **EXCESSIVE PASSING**: Strategy passes frequently (>70% pass rate)\n`;
    report += `- **Implication**: Passing may be too safe or broadcasting too risky\n`;
  } else if (best.genome.passingThreshold > 0.8) {
    report += `- ⚠️ **NEVER PASSES**: Strategy broadcasts almost always\n`;
    report += `- **Implication**: Passing mechanic is underutilized\n`;
  } else {
    report += `- ✅ **BALANCED**: Strategic passing is used appropriately\n`;
  }
  report += `\n`;

  report += `### Timing Strategy\n`;
  report += `- **Min Round to Participate**: Round ${best.genome.minRoundToParticipate}\n`;
  report += `- **Early Broadcast Preference**: ${(best.genome.earlyBroadcastPref * 100).toFixed(1)}%\n`;
  if (best.genome.minRoundToParticipate >= 4) {
    report += `- 📊 **LATE GAME FOCUS**: Waits until round 4+ to participate\n`;
    report += `- **Implication**: Early game may not be rewarding enough\n`;
  } else if (best.genome.minRoundToParticipate <= 2 && best.genome.earlyBroadcastPref > 0.7) {
    report += `- 📊 **EARLY AGGRESSION**: Rushes to broadcast in early rounds\n`;
    report += `- **Implication**: Early game provides significant advantages\n`;
  }
  report += `\n`;

  report += `### Coalition Mechanic\n`;
  report += `- **Coalition Willingness**: ${(best.genome.coalitionWillingness * 100).toFixed(1)}%\n`;
  report += `- **Follow the Crowd**: ${(best.genome.followTheCrowdBias * 100).toFixed(1)}%\n`;
  if (best.genome.coalitionWillingness > 0.6 && best.genome.followTheCrowdBias > 0.6) {
    report += `- 📊 **COALITION STRATEGY**: High team play and consensus following\n`;
    report += `- **Implication**: Cooperation is more rewarding than solo play\n`;
  } else if (best.genome.coalitionWillingness < 0.3) {
    report += `- 📊 **SOLO OPERATOR**: Avoids coalitions and independent thinking\n`;
  }
  report += `\n`;

  report += `### Risk Management\n`;
  report += `- **Risk Tolerance**: ${(best.genome.riskTolerance * 100).toFixed(1)}%\n`;
  report += `- **Bankruptcy Avoidance**: ${(best.genome.bankruptcyAvoidance * 100).toFixed(1)}%\n`;
  report += `- **Credibility Floor**: ${best.genome.credibilityFloor}\n`;
  if (best.genome.riskTolerance < 0.3 && best.genome.bankruptcyAvoidance > 0.7) {
    report += `- 📊 **ULTRA-CONSERVATIVE**: Survival prioritized over winning\n`;
    report += `- **Implication**: Credibility penalties may be too harsh\n`;
  } else if (best.genome.riskTolerance > 0.7) {
    report += `- 📊 **HIGH RISK TOLERANCE**: Willing to gamble credibility\n`;
  }
  report += `\n`;

  report += `## Key Mechanic Insights\n\n`;

  const insights: string[] = [];

  // Detect underutilized mechanics
  if (best.genome.bluffTolerance < 0.2) {
    insights.push('🚨 **Bluff mechanic underutilized** - Consider reducing bluff penalties or making bluffs more valuable');
  }
  if (best.genome.advertiseCommitment < 0.3) {
    insights.push('🚨 **Advertise phase ignored** - This mechanic may not provide enough strategic value');
  }
  if (best.genome.minRoundToParticipate >= 4) {
    insights.push('🚨 **Early game underutilized** - Players wait until round 4+, suggesting early rounds lack rewards');
  }
  if (best.genome.riskTolerance < 0.3 && best.genome.bankruptcyAvoidance > 0.7) {
    insights.push('🚨 **Overly conservative strategies dominate** - Consider reducing credibility penalties');
  }
  if (best.genome.coalitionWillingness > 0.7 && best.genome.followTheCrowdBias > 0.7) {
    insights.push('📊 **Coalition play dominates** - Solo strategies may need buffs');
  }

  // Detect overused mechanics
  if (best.genome.passingThreshold > 0.9) {
    insights.push('⚠️ **Passing mechanic rarely used** - Consider making passing more attractive or broadcasting more costly');
  }
  if (best.genome.bluffTolerance > 0.7) {
    insights.push('⚠️ **Bluffing heavily exploited** - Consider increasing bluff penalties');
  }

  // Balanced mechanics
  if (insights.length === 0) {
    insights.push('✅ **Mechanics appear balanced** - No single mechanic is clearly under/overutilized');
  }

  insights.forEach(insight => {
    report += `${insight}\n\n`;
  });

  report += `---\n\n`;
  report += `**Mechanic Analysis Complete** ✅\n`;

  return report;
}
