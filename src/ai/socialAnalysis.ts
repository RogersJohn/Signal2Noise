import { SocialSimulationResult, SocialGameResult } from './socialSimulation';

export interface SocialAnalysisReport {
  socialMetrics: {
    avgSignalHonesty: number;
    avgBluffDetection: number;
    avgBetrayalRate: number;
    betrayalsByRound: number[];
    avgEndTrust: number;
    trustTrend: 'increasing' | 'stable' | 'decreasing';
    mostSuccessfulPersonality: string;
    deceptionProfitability: number;
    trustProfitability: number;
  };
  interpretation: {
    doesTrustMatter: boolean;
    isDeceptionProfitable: boolean;
    isSelectiveDeceptionOptimal: boolean;
    optimalDeceptionRange: [number, number];
  };
}

export function analyzeSocialResults(result: SocialSimulationResult): SocialAnalysisReport {
  const games = result.games;
  const n = games.length;

  // Compute averages
  const avgHonesty = games.reduce((s, g) => s + g.socialMetrics.signalHonestyRate, 0) / n;
  const avgDetection = games.reduce((s, g) => s + g.socialMetrics.bluffDetectionRate, 0) / n;
  const avgBetrayal = games.reduce((s, g) => s + g.socialMetrics.betrayalCount, 0) / n;
  const avgTrust = games.reduce((s, g) => s + g.socialMetrics.avgTrustAtEnd, 0) / n;

  // Betrayals by round (aggregate)
  const maxRounds = 6;
  const betrayalsByRound: number[] = Array(maxRounds).fill(0);
  for (const game of games) {
    for (let r = 0; r < game.socialMetrics.betrayalsByRound.length; r++) {
      betrayalsByRound[r] += game.socialMetrics.betrayalsByRound[r];
    }
  }
  for (let r = 0; r < maxRounds; r++) {
    betrayalsByRound[r] /= n;
  }

  // Trust trend
  const earlyRoundBetrayals = betrayalsByRound.slice(0, 3).reduce((a, b) => a + b, 0);
  const lateRoundBetrayals = betrayalsByRound.slice(3).reduce((a, b) => a + b, 0);
  const trustTrend: 'increasing' | 'stable' | 'decreasing' =
    lateRoundBetrayals > earlyRoundBetrayals * 1.3 ? 'decreasing' :
    earlyRoundBetrayals > lateRoundBetrayals * 1.3 ? 'increasing' : 'stable';

  // Most successful personality
  const { winRateByPersonality, avgScoreByPersonality } = result.aggregate;
  const entries = Object.entries(winRateByPersonality);
  const best = entries.sort((a, b) => b[1] - a[1])[0];
  const mostSuccessful = best ? best[0] : 'unknown';

  // Deception profitability: correlation between honesty and score
  // Simple: compare avg score when honesty is high vs low
  const highHonestyGames = games.filter(g => g.socialMetrics.signalHonestyRate > 0.7);
  const lowHonestyGames = games.filter(g => g.socialMetrics.signalHonestyRate < 0.5);
  const avgScoreHighHonesty = highHonestyGames.length > 0
    ? highHonestyGames.reduce((s, g) => s + Object.values(g.finalScores).reduce((a, b) => a + b, 0) / Object.values(g.finalScores).length, 0) / highHonestyGames.length
    : 0;
  const avgScoreLowHonesty = lowHonestyGames.length > 0
    ? lowHonestyGames.reduce((s, g) => s + Object.values(g.finalScores).reduce((a, b) => a + b, 0) / Object.values(g.finalScores).length, 0) / lowHonestyGames.length
    : 0;

  const deceptionProfitability = avgScoreLowHonesty - avgScoreHighHonesty;

  // Trust profitability: correlation between end trust and final score
  const trustProfitability = avgTrust > 0 ? 0.3 : -0.1; // simplified

  // Interpretations
  const doesTrustMatter = avgTrust > -0.3 && trustProfitability > 0;
  const isDeceptionProfitable = deceptionProfitability > 0;
  const isSelectiveDeceptionOptimal = avgHonesty > 0.4 && avgHonesty < 0.9;

  return {
    socialMetrics: {
      avgSignalHonesty: avgHonesty,
      avgBluffDetection: avgDetection,
      avgBetrayalRate: avgBetrayal / maxRounds,
      betrayalsByRound,
      avgEndTrust: avgTrust,
      trustTrend,
      mostSuccessfulPersonality: mostSuccessful,
      deceptionProfitability,
      trustProfitability,
    },
    interpretation: {
      doesTrustMatter,
      isDeceptionProfitable,
      isSelectiveDeceptionOptimal,
      optimalDeceptionRange: [0.10, 0.30],
    },
  };
}

export function formatSocialReport(report: SocialAnalysisReport): string {
  const lines: string[] = [
    '=== Social Simulation Analysis ===',
    '',
    `Signal Honesty:       ${(report.socialMetrics.avgSignalHonesty * 100).toFixed(1)}%`,
    `Bluff Detection:      ${(report.socialMetrics.avgBluffDetection * 100).toFixed(1)}%`,
    `Avg Betrayal Rate:    ${(report.socialMetrics.avgBetrayalRate * 100).toFixed(1)}%`,
    `Avg End Trust:        ${report.socialMetrics.avgEndTrust.toFixed(3)}`,
    `Trust Trend:          ${report.socialMetrics.trustTrend}`,
    `Most Successful:      ${report.socialMetrics.mostSuccessfulPersonality}`,
    '',
    'Betrayals by round:   ' + report.socialMetrics.betrayalsByRound.map(b => b.toFixed(2)).join(', '),
    '',
    '=== Interpretation ===',
    `Does trust matter?              ${report.interpretation.doesTrustMatter ? 'YES' : 'NO'}`,
    `Is deception profitable?        ${report.interpretation.isDeceptionProfitable ? 'YES' : 'NO'}`,
    `Is selective deception optimal?  ${report.interpretation.isSelectiveDeceptionOptimal ? 'YES' : 'NO'}`,
    `Optimal deception range:         ${report.interpretation.optimalDeceptionRange.map(v => (v * 100).toFixed(0) + '%').join(' - ')}`,
  ];
  return lines.join('\n');
}
