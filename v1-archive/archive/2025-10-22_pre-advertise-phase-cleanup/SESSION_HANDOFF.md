# Signal to Noise - Session Handoff Notes
**Date:** 2025-10-20
**Version:** v4.6 (Evidence First - Incomplete)

---

## Executive Summary

**Good News:** The game IS working as an evidence-based consensus game! Players accumulate 3-5 real evidence cards and broadcast with them.

**Bad News:** The bluff rate analytics are broken, reporting 96% bluffs when players actually have evidence.

---

## Current State (v4.6)

### What's Working ✅
1. **Evidence filtering** - Players only draw cards for active conspiracies (85% usable rate)
2. **Incentive structure** - Evidence scoring (170pts) >> Bandwagon (30pts)
3. **Consensus mechanics** - 20% consensus rate with 3-broadcast threshold
4. **AI behavior** - Players successfully accumulate 3-5 evidence cards before broadcasting
5. **Delayed replacement** - Conspiracies stay on board until end-of-round cleanup

### What's Broken 🐛

**CRITICAL BUG: Bluff Rate Counting**

**Location:** `gameSimulation.ts:138`
```typescript
if (decision.isBluff) {  // ❌ WRONG SOURCE
  totalBluffs++;
}
```

**Problem:**
- Bluff counter uses `decision.isBluff` from AI decision (gameSimulation.ts:138)
- Actual bluff detection uses `assignedEvidence` at resolve time (gameSimulation.ts:177)
- These don't match!

**Evidence from diagnostic logging:**
```
📢 Broadcast: Bob → mayor_embezzlement
   Evidence: 3 real, 0 bluff           // ✅ Player HAS evidence

🔍 Bluff Check: Bob on mayor_embezzlement
   Cards: REAL, REAL, REAL
   isBluff: false                      // ✅ Correctly detected as NOT bluff

But decision.isBluff was true          // ❌ Analytics counted it as bluff
```

**Result:** 96% reported bluff rate despite players having evidence!

---

## v4.6 Implementation Details

### Changes Made
1. **gameLogic.ts:78-114** - Added `activeConspiracies` parameter to drawCards(), filters deck
2. **gameSimulation.ts:84-85** - Passes active conspiracy IDs when drawing
3. **aiPersonalities.ts:216-249** - Evidence scoring: 40pts/card, +50 confidence bonus
4. **aiPersonalities.ts:270-283** - Bandwagon scoring: Reduced to 20-30pts total
5. **gameLogic.ts:137-150** - Consensus threshold: 2 → 3 broadcasts
6. **gameSimulation.ts:257-259** - Bluff penalty: -5 → -7 credibility
7. **evidence.ts:446-573** - Added 18 new 'ALL' evidence cards (53% of deck)

### Evidence Deck Composition (v4.6)
- **Total:** 78 cards
- **Generic ('ALL'):** 41 cards (53%)
- **Conspiracy-specific:** 21 cards (27%)
- **Bluff cards:** 16 cards (21%)

With 5 of 12 conspiracies active:
- 53% 'ALL' + ~30% matching specific = **~85% usable evidence** ✅

---

## The Fix (For Next Session)

### Option 1: Use Actual Evidence (Recommended)
Change bluff counting to check actual assigned evidence:

```typescript
// gameSimulation.ts:138
if (decision.action === 'broadcast' && decision.conspiracyId) {
  totalBroadcasts++;

  // v4.6 FIX: Check actual evidence, not AI decision
  const assignedCards = player.assignedEvidence[decision.conspiracyId] || [];
  const hasRealEvidence = assignedCards.some(card => !card.isBluff);
  const isActualBluff = assignedCards.length === 0 || !hasRealEvidence;

  if (isActualBluff) {
    totalBluffs++;
  }
}
```

### Option 2: Fix AI Decision Flag
Investigate why `bestOption.hasRealEvidence` doesn't match actual evidence at broadcast time. Possible timing issue with evidence assignments.

---

## Test Results Summary

| Version | Consensus | Bluff Rate | Status | Notes |
|---------|-----------|------------|--------|-------|
| v4.0 | 0.81% | 36% | ✅ Best | Bluff cards + persistence |
| v4.2 | 0.73% | 40% | ✅ Good | 2 investigations, perfect bluff rate |
| v4.3 | 0.68% | 18.75% | ❌ Failed | Bandwagon too strong (100pts) |
| v4.4 | 0.59% | 33.33% | ❌ Failed | N-1 conspiracies = too much churn |
| v4.5 | 65.86% | 96.69% | ⚠️ Partial | Great consensus, but 'ALL' evidence killed deduction |
| v4.6 | 20.14% | **96.07%** | 🐛 **Broken Metric** | Players HAVE evidence, counting is wrong |

---

## Game Design Analysis (From This Session)

### Core Problem Identified
The game became "Bandwagon: The Guessing Game" instead of "Evidence-Based Consensus":

**Root Cause:** Incentive misalignment
- Bandwagon bonus (80pts) > Evidence bonus (60pts max)
- Consensus threshold too low (2 broadcasts) = no time to investigate
- Evidence-conspiracy mismatch = 56% of deck unusable

### Solution Implemented (v4.6)
1. **Massive evidence buff:** 170pts total for 3-card case
2. **Bandwagon nerf:** 30pts total
3. **Smart filtering:** Only draw usable evidence
4. **More investigation time:** Consensus needs 3 broadcasts

### Expected Result
Evidence gathering becomes optimal strategy → 35-40% bluff rate → healthy strategic depth

### Actual Result
✅ Evidence gathering IS happening (players have 3-5 cards)
❌ Metrics broken (false 96% bluff rate)

---

## Files Modified (v4.6)

1. **gameLogic.ts** - drawCards() filtering, consensus threshold
2. **gameSimulation.ts** - Pass active conspiracies, bluff penalty
3. **aiPersonalities.ts** - Scoring rebalance
4. **evidence.ts** - Added 18 generic evidence cards
5. **signal_noise_rules.md** - Documentation

---

## Next Session Priority

### Immediate (5 minutes)
1. Fix bluff counting bug (see Option 1 above)
2. Run Monte Carlo test
3. Verify 35-40% bluff rate achieved

### If Bluff Rate Still High
- Investigate `bestOption.hasRealEvidence` computation
- Check evidence assignment timing
- Add logging to trace evidence through AI decision

### If Bluff Rate Correct
- Remove all temporary fixes
- Update documentation with final v4.6 results
- Run full test suite
- Commit as v4.6 final

---

## Commands to Resume

```bash
cd signal-to-noise

# Run quick test
npm test -- --testPathPattern=gameSimulation.test.ts --watchAll=false --testNamePattern="Monte Carlo"

# Check consensus + bluff rates
# Target: 15-25% consensus, 35-40% bluff rate

# If good, run full suite
npm test
```

---

## Key Files Reference

- **Bluff counting bug:** gameSimulation.ts:138
- **Actual bluff detection:** gameSimulation.ts:177
- **AI decision:** aiPersonalities.ts:349
- **Evidence scoring:** aiPersonalities.ts:216-249
- **Bandwagon scoring:** aiPersonalities.ts:270-283

---

## Version History Context

- **v4.0-v4.4:** Iterating on consensus rate (0.43% baseline → 0.81% peak)
- **v4.5:** Hit 65% consensus but lost evidence gameplay (all 'ALL' cards)
- **v4.6:** Fixed incentives, restored deduction, discovered metrics bug

The game loop is correct. The analytics are lying. Fix the lie, ship the game.
