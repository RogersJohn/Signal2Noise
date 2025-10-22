# Signal to Noise - Audience Scoring Formula

## Overview
Players score Audience Points when they broadcast about conspiracies. The formula considers evidence quality, credibility level, and broadcast strategy.

---

## Core Formula

```
AUDIENCE POINTS = BASE POINTS + EVIDENCE BONUS + CREDIBILITY MODIFIER
```

---

## 1. BASE POINTS (Broadcasting)

### Position Declared: REAL or FAKE
- **With Evidence (1+ cards)**: 3 points
- **Without Evidence (bandwagoning)**: 1 point

### Position Declared: INCONCLUSIVE (???)
- **Always**: 2 points
- *(Safer option but lower reward)*

---

## 2. EVIDENCE BONUS

Calculate for EACH evidence card played this round on the conspiracy you're broadcasting about:

### Card Specificity Bonus
- **Specific Evidence** (supports only THIS conspiracy): +3 points
- **Generic Evidence** (supports "ALL"): +1 point

### Excitement Level Multiplier
- **Exciting** (★★★): ×1.5
- **Neutral** (★☆☆): ×1.0
- **Boring** (☆☆☆): ×0.5

### Novelty Bonus
- **First time this evidence used on this conspiracy**: +2 points
- **Already used by another player**: +0 points

### Example Evidence Scoring:
```
Player plays "Flight Path Analysis" (★★★, specific to chemtrails, first use)
= (3 points × 1.5) + 2 = 4.5 + 2 = 6.5 points (round to 7)

Player plays "Common Sense" (☆☆☆, generic ALL, first use)
= (1 point × 0.5) + 2 = 0.5 + 2 = 2.5 points (round to 3)

Player plays "Follow the Money" (☆☆☆, generic ALL, already used)
= (1 point × 0.5) + 0 = 0.5 points (round to 1)
```

**Total Evidence Bonus** = Sum of all your evidence cards played on this conspiracy

---

## 3. CREDIBILITY MODIFIER

Your credibility affects your overall score:

### High Credibility (7-10)
- **+50% bonus** to total score
- Formula: `Total × 1.5`

### Medium Credibility (4-6)
- **No modifier** (neutral)
- Formula: `Total × 1.0`

### Low Credibility (0-3)
- **-25% penalty** to total score
- Formula: `Total × 0.75`

---

## Complete Scoring Examples

### Example 1: High-Value Broadcast
```
Player broadcasts REAL on "Moon Landing Hoax"
- Credibility: 8 (high)
- Evidence played:
  1. "Flag Movement Analysis" (★★★, specific, first use) = 7 points
  2. "Van Allen Radiation" (★★★, specific, first use) = 7 points

Calculation:
Base = 3 (broadcast with evidence)
Evidence Bonus = 7 + 7 = 14
Subtotal = 3 + 14 = 17
Credibility Modifier = 17 × 1.5 = 25.5
FINAL SCORE = 26 Audience Points
```

### Example 2: Bandwagoning
```
Player broadcasts REAL on "Election Rigging"
- Credibility: 5 (medium)
- Evidence played: NONE (copying another player's position)

Calculation:
Base = 1 (broadcast without evidence)
Evidence Bonus = 0
Subtotal = 1 + 0 = 1
Credibility Modifier = 1 × 1.0 = 1
FINAL SCORE = 1 Audience Point
```

### Example 3: Low Credibility with Good Evidence
```
Player broadcasts FAKE on "Chemtrails"
- Credibility: 2 (low)
- Evidence played:
  1. "Common Sense" (☆☆☆, generic, first use) = 3 points
  2. "Mainstream Media Silence" (☆☆☆, generic, already used) = 1 point

Calculation:
Base = 3 (broadcast with evidence)
Evidence Bonus = 3 + 1 = 4
Subtotal = 3 + 4 = 7
Credibility Modifier = 7 × 0.75 = 5.25
FINAL SCORE = 5 Audience Points
```

### Example 4: INCONCLUSIVE Signal
```
Player broadcasts INCONCLUSIVE on "Bigfoot"
- Credibility: 6 (medium)
- Evidence played: 1 card (signals interest but non-committal)
  1. "Eyewitness Accounts" (★☆☆, generic, first use) = 3 points

Calculation:
Base = 2 (inconclusive broadcast)
Evidence Bonus = 3
Subtotal = 2 + 3 = 5
Credibility Modifier = 5 × 1.0 = 5
FINAL SCORE = 5 Audience Points
```

---

## Special Rules

### Bluff Cards
- If you play a BLUFF card (isBluff: true), it counts as evidence for scoring
- **RISK**: When consensus is reached, bluffs are revealed
- Bluffing too much may hurt your credibility in future rounds

### Changing Your Broadcast Position
- If you change from REAL to FAKE (or vice versa) in a later round:
  - **Credibility**: -2 points
  - **Audience**: Score normally for the new broadcast
  - This represents flip-flopping and losing trust

### No Broadcast
- Players who don't broadcast score 0 points
- Credibility unchanged

---

## Credibility Changes

### When Consensus is Reached
- **Majority Side** (your position matches consensus): +1 Credibility
- **Minority Side** (your position opposes consensus): -1 Credibility
- **Did Not Broadcast**: No change
- **Broadcast INCONCLUSIVE**: No change

### Maximum/Minimum
- Credibility ranges from 0 to 10
- Cannot go below 0 or above 10

---

## Design Notes for Playtesting

### Tuning Parameters
If scoring feels off during playtests, adjust these values:

1. **Base Points**: Currently 3/1/2 (could adjust to 4/1/2 or 3/2/3)
2. **Specificity Bonus**: Currently 3 vs 1 (could be 4 vs 2)
3. **Excitement Multipliers**: Currently 1.5 / 1.0 / 0.5 (could be 2.0 / 1.0 / 0.5)
4. **Novelty Bonus**: Currently +2 (could be +3 or +1)
5. **Credibility Modifiers**: Currently +50% / 0% / -25% (could be +100% / 0% / -50%)

### Balance Goals
- **High credibility + good evidence** = big rewards (~20-30 pts)
- **Bandwagoning** = weak rewards (~1-3 pts)
- **Medium play** = moderate rewards (~5-10 pts)
- **Bluffing** = risky but can pay off in short term

### Quick Reference Table

| Scenario | Typical Score Range |
|----------|-------------------|
| Strong broadcast (high cred + specific evidence) | 20-30 points |
| Good broadcast (med cred + mixed evidence) | 8-15 points |
| Weak broadcast (low cred or generic evidence) | 3-7 points |
| Bandwagoning (no evidence) | 1-2 points |
| Inconclusive signal | 2-5 points |

---

**Target winning score**: ~60-80 audience points over 6 rounds
**Average per round**: ~10-13 points for a winning strategy

