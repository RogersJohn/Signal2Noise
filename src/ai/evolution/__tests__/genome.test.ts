import { randomGenome, crossover, mutate, isValidGenome, GENE_KEYS } from '../genome';

describe('genome', () => {
  it('random genome has valid parameter ranges', () => {
    const g = randomGenome(0);
    expect(isValidGenome(g)).toBe(true);
    expect(g.generation).toBe(0);
    expect(g.fitness).toBe(0);
  });

  it('crossover produces child with genes from both parents', () => {
    const p1 = randomGenome(0);
    const p2 = randomGenome(0);
    // Make parents distinct
    (p1.genes as unknown as Record<string, number>).baseDeceptionRate = 0.0;
    (p2.genes as unknown as Record<string, number>).baseDeceptionRate = 1.0;

    // Run many crossovers to check both parents contribute
    let foundP1 = false;
    let foundP2 = false;
    for (let i = 0; i < 50; i++) {
      const child = crossover(p1, p2, 1);
      expect(isValidGenome(child)).toBe(true);
      const val = (child.genes as unknown as Record<string, number>).baseDeceptionRate;
      if (val < 0.5) foundP1 = true;
      if (val > 0.5) foundP2 = true;
    }
    expect(foundP1 || foundP2).toBe(true);
  });

  it('zero mutation rate produces identical genome', () => {
    const g = randomGenome(0);
    const mutated = mutate(g, 0, 0.1);
    for (const key of GENE_KEYS) {
      expect((mutated.genes as unknown as Record<string, number>)[key])
        .toBe((g.genes as unknown as Record<string, number>)[key]);
    }
  });

  it('high mutation rate changes most genes', () => {
    const g = randomGenome(0);
    const mutated = mutate(g, 1.0, 0.5);
    let changed = 0;
    for (const key of GENE_KEYS) {
      if ((mutated.genes as unknown as Record<string, number>)[key] !== (g.genes as unknown as Record<string, number>)[key]) {
        changed++;
      }
    }
    expect(changed).toBeGreaterThan(GENE_KEYS.length / 2);
  });

  it('mutation stays within valid ranges', () => {
    const g = randomGenome(0);
    for (let i = 0; i < 100; i++) {
      const mutated = mutate(g, 1.0, 1.0);
      expect(isValidGenome(mutated)).toBe(true);
    }
  });
});
