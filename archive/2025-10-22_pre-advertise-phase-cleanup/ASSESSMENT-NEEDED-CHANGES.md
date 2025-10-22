# Signal to Noise - Assessment of Needed Changes
## Based on New Consensus Mechanics Understanding

---

## Executive Summary

The game has fundamentally changed from **"find objective truth"** to **"build consensus through persuasion"**. This requires major changes to:
1. Core game logic (consensus detection, scoring)
2. Data structures (remove/change truthValue usage)
3. Documentation (existing docs contradict new rules)
4. Evidence mechanics (secret until revealed)

---

## DOCUMENTATION ASSESSMENT

### ❌ signal_noise_claude_md.md (OUTDATED - MAJOR CONFLICTS)

**Location**: Root directory

**Problems**:

1. **Consensus Detection** (Lines 113-123):
   - CURRENT: Requires 3 players agreeing on same position
   - NEW RULES: Majority of players (2 in 4P, 3 in 5P)
   - CONFLICT: Threshold is now dynamic based on player count

2. **Scoring Logic** (Lines 125-139):
   - CURRENT: `broadcast.position === conspiracy.truthValue` (objective truth)
   - NEW RULES: No objective truth - consensus IS the truth
   - CONFLICT: Entire scoring based on wrong premise

3. **Win Conditions** (Lines 141-142):
   - CURRENT: "12 conspiracies revealed? 6 rounds? 60 audience?"
   - NEW RULES: 6 rounds only, highest audience wins
   - CONFLICT: Multiple win conditions vs single condition

4. **Conspiracy Card Structure** (Lines 15-25):
   - CURRENT: Has `truthValue: 'REAL' | 'FAKE'` field
   - NEW RULES: Truth value on back (separate card), not revealed during game
   - CONFLICT: Structure assumes truth is game mechanic

5. **Evidence** (Lines 27-35):
   - CURRENT: "NO reliability or drama - every card worth 1 point"
   - NEW RULES: Evidence has excitement levels (boring/neutral/exciting) affecting scoring
   - CONFLICT: Completely different evidence system

6. **Player State** (Lines 38-51):
   - CURRENT: `credibility: number, // 0-10, only for tiebreaker in base game`
   - NEW RULES: Credibility affects scoring multiplier (+50%/-25%) and changes based on consensus participation
   - CONFLICT: Credibility has active game mechanics, not just tiebreaker

7. **Broadcast Object** (Lines 54-64):
   - CURRENT: `position: 'REAL' | 'FAKE'` (only 2 options)
   - NEW RULES: `position: 'REAL' | 'FAKE' | 'INCONCLUSIVE'` (3 options)
   - CONFLICT: Missing INCONCLUSIVE position

8. **Phase Structure** (Lines 91-109):
   - CURRENT: INVESTIGATE → BROADCAST → RESOLVE → CLEANUP
   - NEW RULES: GATHER → ASSIGN → BROADCAST → RESOLVE (with Round 1 having 2 gather+assign cycles)
   - CONFLICT: Different phase names and Round 1 special rules missing

9. **Evidence Assignment** (Lines 177-180):
   - CURRENT: Evidence visible when assigned
   - NEW RULES: Evidence face-down with player markers (secret until consensus)
   - CONFLICT: Hidden information mechanic missing

10. **Bluffing** (Missing):
    - CURRENT: No mention of bluffing mechanics
    - NEW RULES: Players can assign irrelevant evidence as bluffs, revealed when consensus reached
    - CONFLICT: Major mechanic completely missing

**RECOMMENDATION**: **REWRITE COMPLETELY** - This doc contradicts new rules at fundamental level

---

### ❌ PRINTING-INSTRUCTIONS.md (OUTDATED - MINOR UPDATES NEEDED)

**Location**: Root directory

**Problems**:

1. **Card Description** (Lines 31-42):
   - CURRENT: Describes old conspiracy cards with REAL/FAKE on front
   - NEW RULES: Conspiracy fronts have no truth value, truth indicators are separate cards
   - CONFLICT: References outdated card design

2. **Component List**:
   - CURRENT: Only lists conspiracy and evidence cards
   - NEW RULES: Also need player tokens, broadcast tokens, player boards
   - CONFLICT: Incomplete component list

**RECOMMENDATION**: **UPDATE** - Add references to new files (printable-cards-conspiracy-REVISED.html, player tokens, player boards)

---

## CODE ASSESSMENT

### ❌ src/types.ts (MINOR CHANGES NEEDED)

**Problems**:

1. **ConspiracyCard Interface** (Lines 8-16):
   - CURRENT: `truthValue: TruthValue` is always present
   - NEW RULES: Truth value should be optional or separate from active game
   - QUESTION: Should truthValue still exist for "Truth Matters" variant mode?

2. **Position Type** (Line 6):
   - CURRENT: `type Position = 'REAL' | 'FAKE';`
   - NEW RULES: Should be `type Position = 'REAL' | 'FAKE' | 'INCONCLUSIVE';`
   - CONFLICT: Missing INCONCLUSIVE option

3. **BroadcastObject** (Lines 48-56):
   - CURRENT: Missing `isInconclusive` flag or position needs INCONCLUSIVE option
   - NEW RULES: Needs to support INCONCLUSIVE broadcasts
   - CONFLICT: Type doesn't support new mechanic

**RECOMMENDATION**: **MODIFY** types to support INCONCLUSIVE and clarify truthValue usage

---

### ❌ src/gameLogic.ts (MAJOR CHANGES NEEDED)

**Problems**:

1. **initializeGame** (Lines 16-75):
   - CURRENT: Deals 3 evidence cards initially
   - NEW RULES: Round 1 has 2 GATHER phases (draw 2 cards each = 4 total)
   - CONFLICT: Initial deal doesn't match Round 1 special rules

2. **detectConsensus** (Lines 124-150):
   - CURRENT: Hardcoded threshold = 3 broadcasts
   - NEW RULES: Majority of players (dynamic: 2/4, 3/5, 2/3)
   - CONFLICT: Wrong consensus threshold

3. **checkWinCondition** (Lines 153-175):
   - CURRENT: Multiple win conditions (10 revealed, playerCount rounds, 50 audience)
   - NEW RULES: Single win condition (6 rounds, highest audience)
   - CONFLICT: Wrong victory conditions

4. **Evidence Secret Assignment**:
   - CURRENT: No implementation of face-down evidence with player markers
   - NEW RULES: Evidence assigned face-down, revealed only when consensus reached
   - CONFLICT: Missing core mechanic

**RECOMMENDATION**: **MAJOR REWRITE** - Consensus, win conditions, and evidence mechanics need complete overhaul

---

### ❌ src/gameSimulation.ts (MAJOR CHANGES NEEDED - FUNDAMENTAL CONFLICTS)

**Problems**:

1. **Scoring Logic** (Lines 163-272):
   - CURRENT: Entire scoring based on `broadcast.position === conspiracy.truthValue`
   - NEW RULES: Scoring based on audience formula (base + evidence + credibility modifier), NOT objective truth
   - CONFLICT: **CRITICAL** - Entire scoring system is wrong

2. **Consensus Resolution** (Lines 156-272):
   - CURRENT: Awards points for being "correct" (matching truthValue)
   - NEW RULES: Majority side gets +1 credibility, minority gets -1, no "correct" answer
   - CONFLICT: Fundamentally wrong game mechanic

3. **Evidence Revelation**:
   - CURRENT: No evidence revelation mechanic
   - NEW RULES: When consensus reached, ALL evidence on that conspiracy is revealed
   - CONFLICT: Missing bluff detection/revelation

4. **Audience Scoring**:
   - CURRENT: Simple `conspiracy.tier * 5` formula
   - NEW RULES: Complex formula with base points, evidence bonuses (specificity, excitement, novelty), credibility modifiers
   - CONFLICT: Completely different scoring system

5. **First Broadcaster Bonus** (Lines 179-187):
   - CURRENT: Rewards/punishes based on being "correct"
   - NEW RULES: No objective correctness - should reward consensus building
   - CONFLICT: Wrong incentive structure

6. **Bluff Tracking** (Lines 224-228):
   - CURRENT: Tracks `isCorrect` for bluffs
   - NEW RULES: Bluffs are simply revealed when consensus happens, no "correct/wrong"
   - CONFLICT: Wrong bluff mechanic

7. **Round Structure** (Lines 71-96):
   - CURRENT: investigationsThisRound = (round === 1 ? 2 : 1) is correct
   - NEW RULES: **THIS IS ACTUALLY CORRECT** - Round 1 has 2 investigations
   - STATUS: ✅ This part is fine!

8. **Conspiracy Replacement** (Lines 275-283):
   - CURRENT: Replaces revealed conspiracies
   - NEW RULES: Should still replace, but "revealed" means "consensus reached", not "truth revealed"
   - CONFLICT: Terminology confusion (isRevealed should mean consensus, not truth)

**RECOMMENDATION**: **MASSIVE REWRITE** - The entire scoring, consensus, and bluff detection system contradicts new rules

---

### ❌ src/aiPersonalities.ts (CHANGES NEEDED)

**Problems**:

1. **AI Decision Making**:
   - CURRENT: AI tries to guess truthValue of conspiracies
   - NEW RULES: AI should focus on building consensus, not finding truth
   - CONFLICT: AI strategy is wrong

2. **Bluffing Logic**:
   - CURRENT: AI might intentionally choose wrong position
   - NEW RULES: AI should bluff by assigning irrelevant evidence, not wrong positions
   - CONFLICT: Bluffing implemented incorrectly

**RECOMMENDATION**: **REWRITE AI LOGIC** - AI needs to focus on consensus-building strategies, not truth-seeking

---

### ✅ src/data/conspiracies.ts (MOSTLY FINE)

**Status**: The conspiracy cards themselves (name, description, tier, icon) are fine. Only issue:

**Problem**:
- CURRENT: Cards have `truthValue: 'REAL' | 'FAKE'` hardcoded
- NEW RULES: Truth value should be on separate indicator cards (backs)
- SOLUTION: Either remove truthValue from main cards OR keep it for variant "Truth Matters" mode

**RECOMMENDATION**: **KEEP AS IS** for now, decide if truthValue is for variant mode only

---

### ✅ src/data/evidence.ts (FINE)

**Status**: Evidence cards with excitement levels and supportedConspiracies are correct!

**RECOMMENDATION**: **NO CHANGES NEEDED**

---

## SUMMARY OF REQUIRED CHANGES

### Priority 1: CRITICAL (Game-Breaking)

1. **gameSimulation.ts** - Rewrite entire scoring system
   - Remove all references to `conspiracy.truthValue` in scoring
   - Implement new audience formula (base + evidence + credibility)
   - Change consensus resolution to award credibility, not points
   - Add evidence revelation when consensus reached

2. **gameLogic.ts** - Fix consensus detection
   - Change threshold from hardcoded 3 to majority (Math.ceil(playerCount / 2))
   - Fix win condition to be "6 rounds, highest audience"

3. **types.ts** - Add INCONCLUSIVE position
   - Change Position type to include 'INCONCLUSIVE'

### Priority 2: IMPORTANT (Rules Correctness)

4. **signal_noise_claude_md.md** - Rewrite completely
   - Document consensus-based mechanics, not truth-based
   - Add secret evidence assignment
   - Add bluffing rules
   - Add INCONCLUSIVE position
   - Add new audience scoring formula

5. **gameLogic.ts** - Implement secret evidence
   - Add data structure for face-down evidence with player markers
   - Add evidence revelation mechanic

6. **aiPersonalities.ts** - Rewrite AI strategies
   - Focus on consensus building, not truth seeking
   - Implement strategic bluffing (assign irrelevant evidence)

### Priority 3: POLISH (Documentation)

7. **PRINTING-INSTRUCTIONS.md** - Update component list
   - Reference new card files
   - Add player tokens and boards

8. **Data Structures** - Clarify truthValue usage
   - Decide if truthValue is for variant mode only
   - Document when it's used vs ignored

---

## QUESTIONS FOR USER

Before making changes, please confirm:

1. **Truth Value**: Should `conspiracy.truthValue` still exist in the code for a "Truth Matters" variant mode? Or completely remove it?

2. **Consensus Definition**: Confirm majority = Math.ceil(playerCount / 2)?
   - 3 players: 2 needed
   - 4 players: 2 needed
   - 5 players: 3 needed

3. **Win Condition**: Confirm only win condition is "After Round 6, highest audience wins"?

4. **Evidence Revelation**: When consensus is reached, do ALL players reveal ALL their evidence on that conspiracy? Or only players who broadcast?

5. **INCONCLUSIVE Scoring**: Confirm INCONCLUSIVE broadcasts:
   - Score 2 base points
   - Can have evidence (scores normally)
   - Don't count toward consensus threshold
   - Don't affect credibility when consensus reached

6. **Changing Broadcast**: Confirm -2 credibility penalty for changing position in later round?

---

## ESTIMATED EFFORT

- **Documentation Rewrite**: 4-6 hours
- **Code Changes (gameLogic + gameSimulation)**: 8-12 hours
- **AI Personality Rewrite**: 4-6 hours
- **Testing & Debugging**: 6-8 hours
- **TOTAL**: 22-32 hours

---

**READY FOR YOUR APPROVAL TO PROCEED**
