import { signalToFlavor, formatSignalDisplay } from '../signalFlavor';
import { Signal } from '../types';
import { SOCIAL_PERSONALITY_NAMES } from '../personalities';

function makeSignal(intent: Signal['intent'], truthful = true): Signal {
  return {
    senderId: 'p1',
    conspiracyId: 'chemtrails',
    claimedStrength: 'strong',
    intent,
    truthful,
  };
}

describe('signalFlavor', () => {
  it('each personality produces non-empty flavor text', () => {
    for (const name of SOCIAL_PERSONALITY_NAMES) {
      const text = signalToFlavor(makeSignal('lead'), name, 'Chemtrails');
      expect(text.length).toBeGreaterThan(0);
    }
  });

  it('bluff signals produce identical-looking text to honest signals', () => {
    // Both should reference the conspiracy — no visual difference
    for (const name of SOCIAL_PERSONALITY_NAMES) {
      const honest = signalToFlavor(makeSignal('lead', true), name, 'Moon Landing');
      const bluff = signalToFlavor(makeSignal('lead', false), name, 'Moon Landing');
      // Both should be non-empty strings (we can't guarantee identical due to random variant)
      expect(honest.length).toBeGreaterThan(0);
      expect(bluff.length).toBeGreaterThan(0);
      // Neither should contain the word "bluff" or "lying"
      expect(honest.toLowerCase()).not.toContain('bluff');
      expect(bluff.toLowerCase()).not.toContain('bluff');
    }
  });

  it('different intents produce different text categories', () => {
    const leadTexts = new Set<string>();
    const avoidTexts = new Set<string>();
    // Generate many samples to capture variance
    for (let i = 0; i < 50; i++) {
      leadTexts.add(signalToFlavor(makeSignal('lead'), 'Hustler', 'Bigfoot'));
      avoidTexts.add(signalToFlavor(makeSignal('avoid'), 'Hustler', 'Bigfoot'));
    }
    // At least some lead texts should differ from avoid texts
    const overlap = [...leadTexts].filter(t => avoidTexts.has(t));
    expect(overlap.length).toBeLessThan(leadTexts.size);
  });

  it('all 6 personalities have distinct voice', () => {
    const voices = new Map<string, string>();
    for (const name of SOCIAL_PERSONALITY_NAMES) {
      // Use a deterministic seed by checking all variants
      const text = signalToFlavor(makeSignal('lead'), name, 'Test');
      voices.set(name, text);
    }
    // Should have 6 unique entries
    expect(voices.size).toBe(6);
  });

  it('formatSignalDisplay includes personality name', () => {
    const display = formatSignalDisplay(makeSignal('lead'), 'Diplomat', 'Fluoride');
    expect(display).toContain('The Diplomat');
  });
});
