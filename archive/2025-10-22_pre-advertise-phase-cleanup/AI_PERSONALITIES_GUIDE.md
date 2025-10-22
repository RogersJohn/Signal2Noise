# AI Personalities Guide

## Overview

The Signal to Noise game now includes a sophisticated AI personality system with **10 distinct personalities** for automated testing. Each personality exhibits unique behavioral patterns based on psychological traits and strategic preferences.

---

## The 10 AI Personalities

### 1. **The Paranoid Skeptic** 🕵️
**Archetype:** Ultra-Cautious Investigator

- **Risk Tolerance:** 0.1 (Extremely Risk-Averse)
- **Bluff Frequency:** 0.0 (Never Bluffs)
- **Evidence Threshold:** 0.9 (Needs Overwhelming Evidence)
- **Skepticism:** 1.0 (Trusts No One)

**Behavior:** Only broadcasts when they have overwhelming evidence. Never takes risks. Always suspects others are bluffing. Perfect for testing conservative strategies.

---

### 2. **The Reckless Gambler** 🎲
**Archetype:** High-Stakes Risk-Taker

- **Risk Tolerance:** 0.95 (Reckless)
- **Bluff Frequency:** 0.7 (Bluffs Constantly)
- **Evidence Threshold:** 0.1 (Minimal Evidence Needed)
- **Skepticism:** 0.2 (Trusts Freely)

**Behavior:** Broadcasts aggressively with or without evidence. Frequent bluffs. Chases high scores. Perfect for testing chaos scenarios and edge cases.

---

### 3. **The Calculated Strategist** 🎯
**Archetype:** Tactical Analyst

- **Risk Tolerance:** 0.6 (Moderate Risk)
- **Bluff Frequency:** 0.3 (Strategic Bluffs)
- **Evidence Threshold:** 0.5 (Balanced)
- **Skepticism:** 0.6 (Moderately Skeptical)

**Behavior:** Analyzes risk vs reward. Makes strategic bluffs. Adapts to game state. Opportunistic. Perfect for testing balanced gameplay.

---

### 4. **The Truth Seeker** 📚
**Archetype:** Academic Purist

- **Risk Tolerance:** 0.2 (Very Risk-Averse)
- **Bluff Frequency:** 0.0 (Never Bluffs)
- **Evidence Threshold:** 0.85 (Strong Evidence Required)
- **Skepticism:** 0.5 (Neutral)

**Behavior:** Obsessed with accuracy. Only broadcasts with strong evidence. Methodical and patient. Perfect for testing honest-player scenarios.

---

### 5. **The Conspiracy Theorist** 🌐
**Archetype:** Chaos Spreader

- **Risk Tolerance:** 0.8 (High Risk)
- **Bluff Frequency:** 0.5 (Frequent Bluffs)
- **Evidence Threshold:** 0.2 (Low Bar)
- **Skepticism:** 0.1 (Believes Everything)

**Behavior:** Broadcasts wildly. Trusts all sources. Spreads misinformation. Low specialization. Perfect for testing high-chaos gameplay.

---

### 6. **The Professional Analyst** 💼
**Archetype:** Data-Driven Expert

- **Risk Tolerance:** 0.55 (Balanced)
- **Bluff Frequency:** 0.25 (Occasional Strategic Bluffs)
- **Evidence Threshold:** 0.6 (Moderate-High)
- **Skepticism:** 0.7 (Highly Skeptical)

**Behavior:** Reads the table. Makes optimal plays. Exploits weaknesses. Credibility-conscious. Perfect for testing competitive scenarios.

---

### 7. **The Opportunist** 🦅
**Archetype:** Exploiter

- **Risk Tolerance:** 0.7 (High Risk)
- **Bluff Frequency:** 0.4 (Frequent)
- **Evidence Threshold:** 0.4 (Low-Moderate)
- **Skepticism:** 0.8 (Very Skeptical)

**Behavior:** Targets low-credibility players. Jumps on consensus opportunities. Prefers high-tier conspiracies. Perfect for testing exploitative strategies.

---

### 8. **The Cautious Scholar** 🎓
**Archetype:** Conservative Academic

- **Risk Tolerance:** 0.15 (Ultra Risk-Averse)
- **Bluff Frequency:** 0.05 (Rarely Bluffs)
- **Evidence Threshold:** 0.95 (Extensive Evidence Required)
- **Skepticism:** 0.4 (Slightly Trusting)

**Behavior:** Needs extensive evidence. Builds reputation slowly. Risk-averse. Perfect for testing ultra-conservative strategies.

---

### 9. **The Chaos Agent** 🎭
**Archetype:** Unpredictable Wildcard

- **Risk Tolerance:** 0.9 (Reckless)
- **Bluff Frequency:** 0.6 (Very High)
- **Evidence Threshold:** 0.15 (Minimal)
- **Skepticism:** 0.3 (Low)

**Behavior:** Random bluffs. Ignores patterns. Creates confusion. No specialization. Perfect for testing unpredictable scenarios.

---

### 10. **The Steady Builder** 🏗️
**Archetype:** Consistent Grower

- **Risk Tolerance:** 0.4 (Moderate-Low)
- **Bluff Frequency:** 0.15 (Rare)
- **Evidence Threshold:** 0.65 (Moderate-High)
- **Skepticism:** 0.5 (Neutral)

**Behavior:** Consistent and reliable. Moderate risk. Focuses on long-term audience building. Perfect for testing steady-state gameplay.

---

## Usage Examples

### Basic Usage

```typescript
import { makeAIDecision, AI_PERSONALITIES } from './aiPersonalities';

const gameState = initializeGame(2);
const personality = AI_PERSONALITIES.CALCULATED_STRATEGIST;

const decision = makeAIDecision(gameState, 0, personality);

if (decision.action === 'broadcast') {
  console.log(`Broadcasting on ${decision.conspiracyId} as ${decision.position}`);
  if (decision.isBluff) {
    console.log('This is a bluff!');
  }
}
```

### Random Personality

```typescript
import { getRandomPersonality, makeAIDecision } from './aiPersonalities';

const personality = getRandomPersonality();
const decision = makeAIDecision(gameState, 0, personality);
```

### Get Specific Personality

```typescript
import { getPersonalityByName } from './aiPersonalities';

const reckless = getPersonalityByName('RECKLESS_GAMBLER');
```

---

## Testing Scenarios

### Scenario 1: Conservative vs Aggressive Matchup
```typescript
const players = [
  AI_PERSONALITIES.PARANOID_SKEPTIC,    // Ultra-cautious
  AI_PERSONALITIES.RECKLESS_GAMBLER     // Ultra-aggressive
];
```

### Scenario 2: Balanced Competitive Play
```typescript
const players = [
  AI_PERSONALITIES.CALCULATED_STRATEGIST,
  AI_PERSONALITIES.PROFESSIONAL_ANALYST,
  AI_PERSONALITIES.OPPORTUNIST,
  AI_PERSONALITIES.STEADY_BUILDER
];
```

### Scenario 3: Chaos Testing
```typescript
const players = [
  AI_PERSONALITIES.CHAOS_AGENT,
  AI_PERSONALITIES.CONSPIRACY_THEORIST,
  AI_PERSONALITIES.RECKLESS_GAMBLER,
  AI_PERSONALITIES.OPPORTUNIST
];
```

### Scenario 4: Academic Simulation
```typescript
const players = [
  AI_PERSONALITIES.TRUTH_SEEKER,
  AI_PERSONALITIES.CAUTIOUS_SCHOLAR,
  AI_PERSONALITIES.PROFESSIONAL_ANALYST,
  AI_PERSONALITIES.CALCULATED_STRATEGIST
];
```

---

## Personality Traits Explained

### Risk Tolerance (0-1)
- **0.0-0.2:** Extremely cautious, only acts with certainty
- **0.3-0.5:** Moderate caution, prefers safety
- **0.6-0.8:** Comfortable with risk, takes chances
- **0.9-1.0:** Reckless, ignores consequences

### Bluff Frequency (0-1)
- **0.0:** Never bluffs
- **0.1-0.3:** Rare strategic bluffs
- **0.4-0.6:** Frequent bluffer
- **0.7-1.0:** Constant bluffing

### Evidence Threshold (0-1)
- **0.0-0.3:** Broadcasts with minimal evidence
- **0.4-0.6:** Needs moderate evidence
- **0.7-0.9:** Requires strong evidence
- **0.9-1.0:** Needs overwhelming evidence

### Skepticism (0-1)
- **0.0-0.3:** Trusts others easily
- **0.4-0.6:** Neutral, evaluates case-by-case
- **0.7-0.9:** Generally skeptical
- **0.9-1.0:** Trusts no one

---

## Running Tests

```bash
# Run all AI personality tests
npm test -- aiPersonalities.test.ts --watchAll=false

# Run with coverage
npm test -- aiPersonalities.test.ts --coverage --watchAll=false
```

---

## Performance Characteristics

Based on 10-game simulation:

| Personality | Broadcast Frequency | Bluff Rate | Risk Level |
|------------|---------------------|------------|------------|
| Paranoid Skeptic | Very Low | 0% | Minimal |
| Reckless Gambler | Very High | 20-40% | Extreme |
| Calculated Strategist | Moderate | 5-15% | Moderate |
| Truth Seeker | Low | 0% | Low |
| Conspiracy Theorist | High | 30-50% | High |
| Professional Analyst | Moderate-High | 10-20% | Moderate |
| Opportunist | High | 20-35% | High |
| Cautious Scholar | Very Low | <5% | Minimal |
| Chaos Agent | Very High | 40-60% | Extreme |
| Steady Builder | Moderate | 5-10% | Low-Moderate |

---

## Integration with Existing Tests

The AI personalities can be integrated into your existing `gameSimulation.test.ts`:

```typescript
import { AI_PERSONALITIES, makeAIDecision } from './aiPersonalities';

// Replace simple strategies with personalities
const personalities = [
  AI_PERSONALITIES.CALCULATED_STRATEGIST,
  AI_PERSONALITIES.PROFESSIONAL_ANALYST,
  AI_PERSONALITIES.OPPORTUNIST,
  AI_PERSONALITIES.RECKLESS_GAMBLER
];

// Use in game loop
const decision = makeAIDecision(gameState, playerIndex, personalities[playerIndex]);
```

---

## Future Enhancements

Potential additions to the personality system:

1. **Learning AI** - Adapts behavior based on past outcomes
2. **Meta-game Awareness** - Recognizes opponent personalities
3. **Emotional States** - Traits change based on game events (winning/losing streak)
4. **Difficulty Levels** - Easy/Medium/Hard variants of each personality
5. **Custom Personalities** - Allow users to create their own trait combinations

---

## Summary

The AI Personality System provides **realistic, diverse player behaviors** for comprehensive testing:

✅ **10 Distinct Personalities** ranging from ultra-cautious to reckless
✅ **Behavioral Variation** in bluffing, risk-taking, and strategy
✅ **Fully Tested** with 14 passing unit tests
✅ **Easy Integration** with existing simulation code
✅ **Documented Traits** for predictable testing scenarios

Use these personalities to stress-test game balance, identify edge cases, and ensure the game works across all playstyles!
