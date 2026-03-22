import * as fs from 'fs';
import * as path from 'path';
import { EvolutionConfig, EvolutionResult } from './types';
import { runEvolution } from './evolution';
import { GENE_KEYS } from './genome';

export function runAndSave(config: EvolutionConfig, outputDir: string): EvolutionResult {
  const result = runEvolution(config);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  // Analyze dominant traits
  const topGenomes = result.finalPopulation.slice(0, 5);
  const dominantTraits: Record<string, number> = {};
  for (const key of GENE_KEYS) {
    const values = topGenomes.map(g => (g.genes as unknown as Record<string, number>)[key]);
    dominantTraits[key] = values.reduce((a, b) => a + b, 0) / values.length;
  }

  const optimalDeception = dominantTraits['baseDeceptionRate'];
  const optimalTrust = dominantTraits['initialTrust'];

  let trustProfile = 'neutral';
  if (optimalTrust > 0.2) trustProfile = 'high initial trust';
  else if (optimalTrust < -0.1) trustProfile = 'low initial trust';
  else trustProfile = 'moderate initial trust';

  const recoverySpeed = dominantTraits['trustRecoveryRate'] > 0.12 ? 'fast' : 'slow';
  const memory = dominantTraits['betrayalMemory'] > 3.5 ? 'long' : 'short';

  let interpretation = 'The evolved agent is ';
  if (optimalDeception < 0.15) interpretation += 'an Honest Broker type: mostly truthful, ';
  else if (optimalDeception > 0.4) interpretation += 'a Deceptive type: frequently bluffs, ';
  else interpretation += 'a Diplomat type: selectively deceptive, ';
  interpretation += `${trustProfile}, ${recoverySpeed} recovery, ${memory} memory`;

  const fullResult = {
    config,
    generations: result.generations,
    finalBest: result.finalPopulation[0],
    convergenceRound: result.convergenceRound,
    analysis: {
      dominantTraits,
      optimalDeceptionRate: optimalDeception,
      optimalTrustProfile: `${trustProfile}, ${recoverySpeed} recovery, ${memory} memory`,
      interpretation,
    },
  };

  // Save full results
  const resultsPath = path.join(outputDir, `evolution_${timestamp}.json`);
  fs.writeFileSync(resultsPath, JSON.stringify(fullResult, null, 2));

  // Save top 5 as named personalities
  const personalities = topGenomes.map((g, i) => ({
    ...g.genes,
    name: `Evolved_${i + 1}`,
    fitness: g.fitness,
  }));

  const personalitiesPath = path.join(outputDir, `evolved_personalities_${timestamp}.json`);
  fs.writeFileSync(personalitiesPath, JSON.stringify(personalities, null, 2));

  console.log(`Evolution results saved to ${resultsPath}`);
  console.log(`Top 5 personalities saved to ${personalitiesPath}`);

  return result;
}
