# Consensus Bonus Scoring System - Implementation Summary

**Version:** 6.0
**Date:** October 26, 2025
**Status:** ✅ Implemented and Tested

---

## Overview

Implemented **Option A: Consensus Bonus** scoring system to reward both truth-finding AND consensus alignment, addressing a gap in the original game design where consensus participation had no strategic value.

---

## The Problem (Before v6.0)

The previous scoring system only rewarded correctness about truth:

- ✅ Correct about truth + has evidence = **+3 audience**
- ❌ On consensus side but wrong = **NOTHING**
- ❌ Against consensus = **NOTHING** (even if correct!)

**Issue:** Consensus was just a trigger for resolution, not a scoring factor. There was no reward for being on the majority side, and no penalty for going against the crowd. This removed the social/strategic element of consensus building.

---

## The Solution (v6.0)

New four-tier scoring system that rewards both truth AND consensus:

### Scoring Table

| Scenario | Truth | Consensus | Evidence | Reward |
|----------|-------|-----------|----------|--------|
| **Best Case** | ✅ Correct | ✅ Aligned | ✅ Has | **+4 audience** (+3 base + +1 bonus) |
| **Good Case** | ✅ Correct | ❌ Against | ✅ Has | **+3 audience** |
| **Participation** | ❌ Wrong | ✅ Aligned | ✅ Has | **+1 audience** |
| **Worst Case** | ❌ Wrong | ❌ Against | Any | **NOTHING** |

---

## Implementation Details

### Code Changes

**File:** `src/gameSimulation.ts` (lines 252-281)

```typescript
// v6.0: CONSENSUS BONUS SCORING SYSTEM
const onConsensusSide = broadcast.position === majorityPosition;
const correctAboutTruth = truth !== 'TIE' && broadcast.position === truth;

if (correctAboutTruth && hasValidEvidence) {
  // Correct about truth with evidence: +3 base audience
  player.audience += 3;

  // Consensus bonus: +1 if also on consensus side
  if (onConsensusSide) {
    player.audience += 1;
    console.log(`  ✅ ${player.name} correct + consensus bonus: +4 audience total`);
  } else {
    console.log(`  ✅ ${player.name} correct (against consensus): +3 audience`);
  }
} else if (onConsensusSide && hasValidEvidence) {
  // On consensus side but wrong about truth: +1 participation reward
  player.audience += 1;
  console.log(`  📊 ${player.name} on consensus side (wrong about truth): +1 audience`);
}
// Otherwise: against consensus and wrong = NOTHING (no reward)
```

### Documentation Updates

**File:** `docs/rules/COMPREHENSIVE_RULES.md`

- Updated **Step 4: Score Points and Penalties** section (lines 250-278)
- Updated **Scoring & Penalties** reference table (lines 430-440)
- Updated example scoring scenarios with all four cases

---

## Strategic Implications

### 1. 🤝 Coalition Building Now Valuable
- Being on the majority side rewards you (+1 minimum)
- Even if wrong, you get participation credit
- **Encourages:** Social coordination and reading the room

### 2. 🎯 Truth Still Paramount
- +4 for correct + consensus (best outcome)
- +3 for correct alone (still good)
- **Maintains:** Core deduction gameplay

### 3. 🔍 Contrarian Play is Riskier
- If right: +3 audience (no bonus)
- If wrong: NOTHING (harsh penalty)
- **Creates:** Risk/reward decisions

### 4. 🎲 Interesting Decisions
- **Safe play:** Join majority for guaranteed +1
- **Bold play:** Go alone for truth (+3 if correct, 0 if wrong)
- **Optimal play:** Find truth AND consensus for +4

---

## Test Results

**Test File:** `src/consensus-bonus.test.ts`

```
PASS src/consensus-bonus.test.ts
  Consensus Bonus Scoring System (v6.0)
    ✓ Demonstrates new consensus-aware scoring (158 ms)
    ✓ Strategic implications of consensus bonus (14 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

**Sample Game Log Output:**
```
✅ Alice correct + consensus bonus: +4 audience total
✅ Bob correct + consensus bonus: +4 audience total
✅ Carol correct (against consensus): +3 audience
📊 Dave on consensus side (wrong about truth): +1 audience
```

---

## Addresses Evolution Findings

This change directly addresses **Issue #3** from the genetic algorithm evolution report:

**Previous Finding:**
> 📊 Coalition Mechanic Underutilized
> - Coalition Willingness: 9.2%
> - Follow the Crowd: 17.5%
> - **Implication:** Cooperation is not rewarding enough

**Expected Impact:**
- Evolved strategies should now show higher coalition willingness
- Following the consensus becomes a viable strategy
- Multiple paths to victory (truth-seeker vs consensus-builder)

---

## Next Steps

### Recommended: Re-run Evolution Test

To measure the impact of this change, run a new 50-generation evolution test:

```bash
npm test -- --testPathPattern=evolutionarySimulation.test.ts --watchAll=false --testNamePattern="Extended Evolution"
```

**Key metrics to watch:**
1. **Coalition Willingness** - Should increase from 9.2%
2. **Follow Crowd Bias** - Should increase from 17.5%
3. **Strategy Diversity** - Should increase from 10.1% (more viable paths)
4. **Best Win Rate** - May change as consensus-building becomes viable

### Optional: Implement Additional Options

From the strategic depth analysis, consider:
- **Option 3:** Investigation Depth System (add value to passing)
- **Option 5:** Source Burning (reward calculated risk-taking)
- **Option 7:** Retraction Mechanic (reduce death spirals)

---

## Files Modified

1. ✅ `src/gameSimulation.ts` - Scoring logic implementation
2. ✅ `docs/rules/COMPREHENSIVE_RULES.md` - Documentation updates
3. ✅ `src/consensus-bonus.test.ts` - Demonstration tests (new file)

**All changes compile cleanly and pass existing tests.**

---

## Version History

- **v5.x:** Original scoring - only rewards truth
- **v6.0:** Consensus bonus scoring - rewards truth + consensus alignment

---

**Implementation Complete** ✅
