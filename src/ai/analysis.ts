import { SimulationResult, AggregateStats } from './simulation';

export interface AnalysisReport {
  summary: string;
  meetsTargets: boolean;
  details: {
    consensusRate: { value: number; target: string; pass: boolean };
    closeGameRate: { value: number; target: string; pass: boolean };
    dominantStrategy: { value: string; maxWinRate: number; pass: boolean };
    bandwagonRate: { value: number; target: string; pass: boolean };
  };
}

export function analyzeResults(result: SimulationResult): AnalysisReport {
  const { aggregate } = result;

  const consensusPass = aggregate.consensusRate >= 0.40 && aggregate.consensusRate <= 0.65;
  const closeGamePass = aggregate.closeGameRate >= 0.60;

  const winRates = Object.entries(aggregate.winRateByStrategy);
  const maxWinRate = Math.max(...winRates.map(([, r]) => r));
  const dominantStrategy = winRates.find(([, r]) => r === maxWinRate)?.[0] ?? 'none';
  const noDominant = maxWinRate <= 0.55;

  const bandwagonRate = aggregate.pointSourceBreakdown.bandwagon;
  const bandwagonPass = bandwagonRate >= 0.03 && bandwagonRate <= 0.20;

  const meetsTargets = consensusPass && closeGamePass && noDominant && bandwagonPass;

  const lines: string[] = [
    `=== Simulation Analysis (${result.config.games} games) ===`,
    `Matchup: ${result.config.matchup.join(', ')}`,
    '',
    `Consensus Rate: ${(aggregate.consensusRate * 100).toFixed(1)}% (target: 40-65%)  ${consensusPass ? '✓' : '✗'}`,
    `Close Game Rate: ${(aggregate.closeGameRate * 100).toFixed(1)}% (target: >60%)  ${closeGamePass ? '✓' : '✗'}`,
    `Dominant Strategy: ${dominantStrategy} at ${(maxWinRate * 100).toFixed(1)}% (target: <55%)  ${noDominant ? '✓' : '✗'}`,
    `Bandwagon Points: ${(bandwagonRate * 100).toFixed(1)}% (target: 3-20%)  ${bandwagonPass ? '✓' : '✗'}`,
    '',
    'Win Rates:',
    ...winRates.map(([name, rate]) => `  ${name}: ${(rate * 100).toFixed(1)}%`),
    '',
    'Avg Scores:',
    ...Object.entries(aggregate.avgScoreByStrategy).map(([name, score]) => `  ${name}: ${score.toFixed(1)}`),
    '',
    'Point Sources:',
    `  Evidence: ${(aggregate.pointSourceBreakdown.evidence * 100).toFixed(1)}%`,
    `  Bandwagon: ${(aggregate.pointSourceBreakdown.bandwagon * 100).toFixed(1)}%`,
    `  First Mover: ${(aggregate.pointSourceBreakdown.firstMover * 100).toFixed(1)}%`,
    `  Consensus Bonus: ${(aggregate.pointSourceBreakdown.consensusBonus * 100).toFixed(1)}%`,
    '',
    meetsTargets ? '✓ ALL TARGETS MET' : '✗ SOME TARGETS NOT MET',
  ];

  return {
    summary: lines.join('\n'),
    meetsTargets,
    details: {
      consensusRate: { value: aggregate.consensusRate, target: '40-65%', pass: consensusPass },
      closeGameRate: { value: aggregate.closeGameRate, target: '>60%', pass: closeGamePass },
      dominantStrategy: { value: dominantStrategy, maxWinRate, pass: noDominant },
      bandwagonRate: { value: bandwagonRate, target: '3-20%', pass: bandwagonPass },
    },
  };
}

export function formatResultsJson(result: SimulationResult): string {
  return JSON.stringify({
    config: result.config,
    aggregate: result.aggregate,
    games: result.games.slice(0, 10), // Only include first 10 games for readability
  }, null, 2);
}
