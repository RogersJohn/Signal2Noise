# Signal to Noise - Change Implementation Plan
## Based on User Approval

---

## USER CONFIRMATIONS

✅ **truthValue**: Keep in code for future "Truth Matters" variant mode
✅ **Consensus majority**: `Math.ceil(playerCount / 2)` (3P: 2, 4P: 2, 5P: 3)
✅ **Evidence revelation**: ALL players reveal when consensus reached
✅ **INCONCLUSIVE**: Scores 2 base points, doesn't count toward consensus
✅ **Position changing**: -2 credibility penalty for flip-flopping

---

## IMPLEMENTATION ORDER

### Phase 1: Core Types & Data (1-2 hours)

**File: src/types.ts**

1. Add INCONCLUSIVE to Position type:
```typescript
export type Position = 'REAL' | 'FAKE' | 'INCONCLUSIVE';
```

2. Update BroadcastObject to handle INCONCLUSIVE:
```typescript
export interface BroadcastObject {
  // ... existing fields
  position: Position; // Now supports INCONCLUSIVE
}
```

3. Add comment clarifying truthValue usage:
```typescript
export interface ConspiracyCard {
  // ... existing fields
  truthValue: TruthValue; // Used for "Truth Matters" variant only, NOT base game
}
```

**RESULT**: Type system supports new mechanics

---

### Phase 2: Core Game Logic (3-4 hours)

**File: src/gameLogic.ts**

1. **Fix detectConsensus** (Lines 124-150):
```typescript
export function detectConsensus(
  queue: { conspiracyId: string; position: Position; isPassed?: boolean }[],
  conspiracyId: string,
  playerCount: number
): { consensus: boolean; position: 'REAL' | 'FAKE' | null } {
  // Filter out INCONCLUSIVE and PASSED broadcasts
  const broadcasts = queue.filter(
    b => b.conspiracyId === conspiracyId &&
         !b.isPassed &&
         b.position !== 'INCONCLUSIVE'
  );

  const realCount = broadcasts.filter(b => b.position === 'REAL').length;
  const fakeCount = broadcasts.filter(b => b.position === 'FAKE').length;

  // Majority threshold
  const threshold = Math.ceil(playerCount / 2);

  if (realCount >= threshold) {
    return { consensus: true, position: 'REAL' };
  }
  if (fakeCount >= threshold) {
    return { consensus: true, position: 'FAKE' };
  }

  return { consensus: false, position: null };
}
```

2. **Fix checkWinCondition** (Lines 153-175):
```typescript
export function checkWinCondition(gameState: GameState): {
  gameOver: boolean;
  winner: string | null;
} {
  // ONLY win condition: 6 rounds completed
  if (gameState.round > 6) {
    return determineWinner(gameState.players);
  }

  return { gameOver: false, winner: null };
}
```

3. **Add comment to initializeGame** about Round 1:
```typescript
// NOTE: Round 1 has 2 GATHER phases (handled in game simulation)
// Initial deal is 3 cards, then Round 1 gives 2 more draws of 2 cards each
```

**RESULT**: Consensus detection and win conditions fixed

---

### Phase 3: Scoring System Rewrite (4-6 hours)

**File: src/gameSimulation.ts**

This is the BIGGEST change. Need to completely rewrite scoring logic.

**Current problematic code** (Lines 163-272):
```typescript
const isCorrect = broadcast.position === conspiracy.truthValue;
// ... awards points for being "correct"
```

**New scoring logic**:

1. **Remove all truthValue comparisons from scoring**

2. **Implement new audience formula**:
```typescript
function calculateAudiencePoints(
  broadcast: BroadcastObject,
  player: PlayerState,
  conspiracy: ConspiracyCard
): number {
  const assignedEvidence = player.assignedEvidence[broadcast.conspiracyId] || [];

  // BASE POINTS
  let basePoints = 0;
  if (broadcast.position === 'INCONCLUSIVE') {
    basePoints = 2;
  } else if (assignedEvidence.length > 0) {
    basePoints = 3; // Broadcasting with evidence
  } else {
    basePoints = 1; // Bandwagoning (no evidence)
  }

  // EVIDENCE BONUS
  let evidenceBonus = 0;
  const usedEvidenceIds = new Set();

  assignedEvidence.forEach(card => {
    // Specificity bonus
    const specificityBonus = card.supportedConspiracies.includes('ALL') ? 1 : 3;

    // Excitement multiplier
    let excitementMult = 1.0;
    if (card.excitement === 1) excitementMult = 1.5;
    if (card.excitement === -1) excitementMult = 0.5;

    // Novelty bonus (first use on this conspiracy)
    const isNovel = !player.broadcastHistory.some(h =>
      h.conspiracyId === broadcast.conspiracyId &&
      h.evidenceIds.includes(card.id)
    );
    const noveltyBonus = isNovel ? 2 : 0;

    evidenceBonus += Math.round(specificityBonus * excitementMult) + noveltyBonus;
  });

  // SUBTOTAL
  const subtotal = basePoints + evidenceBonus;

  // CREDIBILITY MODIFIER
  let finalScore = subtotal;
  if (player.credibility >= 7) {
    finalScore = Math.round(subtotal * 1.5); // +50% bonus
  } else if (player.credibility <= 3) {
    finalScore = Math.round(subtotal * 0.75); // -25% penalty
  }

  return finalScore;
}
```

3. **Rewrite consensus resolution**:
```typescript
// When consensus reached:
broadcasts.forEach(broadcast => {
  const player = gameState.players.find(p => p.id === broadcast.playerId);
  if (!player) return;

  // Award audience points (NO truth checking!)
  const audienceGain = calculateAudiencePoints(broadcast, player, conspiracy);
  player.audience += audienceGain;

  // Track broadcast history
  const assignedEvidence = player.assignedEvidence[broadcast.conspiracyId] || [];
  player.broadcastHistory.push({
    round: gameState.round,
    conspiracyId: broadcast.conspiracyId,
    evidenceIds: assignedEvidence.map(e => e.id),
    position: broadcast.position,
    wasScored: true
  });
});

// AFTER all broadcasts scored, adjust credibility
const majorityPosition = consensusResult.position; // 'REAL' or 'FAKE'
broadcasts.forEach(broadcast => {
  const player = gameState.players.find(p => p.id === broadcast.playerId);
  if (!player) return;

  // Skip INCONCLUSIVE broadcasts
  if (broadcast.position === 'INCONCLUSIVE') return;

  // Majority side: +1 credibility
  if (broadcast.position === majorityPosition) {
    player.credibility = Math.min(10, player.credibility + 1);
  } else {
    // Minority side: -1 credibility
    player.credibility = Math.max(0, player.credibility - 1);
  }
});
```

4. **Add evidence revelation**:
```typescript
// When consensus reached, reveal ALL evidence
console.log(`Consensus reached on ${conspiracy.name}: ${majorityPosition}`);
console.log('Evidence revealed:');
gameState.players.forEach(player => {
  const evidence = player.assignedEvidence[conspiracy.id] || [];
  if (evidence.length > 0) {
    console.log(`${player.name}:`, evidence.map(e => e.name));
    // Check for bluffs
    const hasBluffs = evidence.some(e => !canSupportConspiracy(e, conspiracy.id));
    if (hasBluffs) {
      console.log(`  ⚠️ ${player.name} was bluffing!`);
    }
  }
});
```

5. **Remove old bonuses that relied on truthValue**:
   - Remove "first broadcaster bonus" based on correctness
   - Remove "successful bluff" tracking based on correctness
   - Keep coordination bonuses (they don't need truth)

**RESULT**: Scoring system matches new consensus-based rules

---

### Phase 4: AI Strategy Rewrite (3-4 hours)

**File: src/aiPersonalities.ts**

**Current problem**: AI tries to deduce truthValue

**New approach**: AI focuses on consensus building

1. **Change AI decision making**:
```typescript
// OLD: AI tries to guess truth
const guessedTruth = deduceConspiracyTruth(...);

// NEW: AI evaluates consensus potential
const consensusPotential = evaluateConsensusOpportunity(
  gameState,
  conspiracy,
  playerPersonality
);
```

2. **Add consensus evaluation**:
```typescript
function evaluateConsensusOpportunity(
  gameState: GameState,
  conspiracy: ConspiracyCard,
  personality: AIPersonality
): { shouldBroadcast: boolean; position: Position } {
  // Check existing broadcasts on this conspiracy
  const existingBroadcasts = gameState.broadcastQueue.filter(
    b => b.conspiracyId === conspiracy.id && !b.isPassed
  );

  const realCount = existingBroadcasts.filter(b => b.position === 'REAL').length;
  const fakeCount = existingBroadcasts.filter(b => b.position === 'FAKE').length;

  // Personalities make different choices:
  // - Bandwagoner: Join majority
  // - Contrarian: Oppose majority
  // - Opportunist: Join if close to threshold
  // - Skeptic: Wait for more evidence

  // Return position that maximizes consensus potential for this personality
}
```

3. **Strategic bluffing**:
```typescript
// AI can assign irrelevant evidence to appear confident
function shouldBluff(personality: AIPersonality, gameState: GameState): boolean {
  // Aggressive personalities bluff more
  // Careful personalities bluff less
  // Bluffing risk: revealed when consensus reached
}
```

**RESULT**: AI plays consensus-building game, not truth-seeking game

---

### Phase 5: Documentation Updates (2-3 hours)

**File: signal_noise_claude_md.md**

**REWRITE** entire document to reflect:
- Consensus-based mechanics (no objective truth)
- Secret evidence assignment (face-down with markers)
- Bluffing mechanics (revealed when consensus reached)
- INCONCLUSIVE position
- New audience scoring formula
- Credibility affects scoring multiplier
- 6-round win condition
- Round 1 special rules (2 gather phases)

**File: PRINTING-INSTRUCTIONS.md**

**UPDATE** component list:
- Reference printable-cards-conspiracy-REVISED.html
- Add printable-player-tokens.html
- Add printable-player-boards.html
- Update totals (12 conspiracy fronts + 24 truth indicators, etc.)

---

### Phase 6: Testing & Validation (4-6 hours)

1. **Run existing tests**:
   - Fix gameLogic.test.ts to match new rules
   - Fix gameSimulation.test.ts to match new rules
   - Fix aiPersonalities.test.ts to match new rules

2. **Add new tests**:
   - Test INCONCLUSIVE broadcasts
   - Test majority consensus detection (2/3, 2/4, 3/5)
   - Test new audience formula
   - Test credibility modifiers
   - Test evidence revelation
   - Test 6-round win condition

3. **Simulation validation**:
   - Run 100-game simulations
   - Verify no crashes
   - Verify reasonable score distributions
   - Verify AI makes sensible decisions

---

## FILES TO CHANGE

1. ✏️ **src/types.ts** - Add INCONCLUSIVE, clarify truthValue
2. ✏️ **src/gameLogic.ts** - Fix consensus detection, win condition
3. ✏️ **src/gameSimulation.ts** - MAJOR rewrite of scoring system
4. ✏️ **src/aiPersonalities.ts** - Rewrite AI strategies
5. ✏️ **signal_noise_claude_md.md** - Complete rewrite
6. ✏️ **PRINTING-INSTRUCTIONS.md** - Update component references
7. ✏️ **src/gameLogic.test.ts** - Fix tests
8. ✏️ **src/gameSimulation.test.ts** - Fix tests
9. ✏️ **src/aiPersonalities.test.ts** - Fix tests

---

## FILES TO LEAVE ALONE

1. ✅ **src/data/conspiracies.ts** - Keep truthValue for variant mode
2. ✅ **src/data/evidence.ts** - Already correct!
3. ✅ **All printable HTML files** - Already created correctly
4. ✅ **GAME-RULES.md** - Already written with new rules
5. ✅ **SCORING-FORMULA.md** - Already correct

---

## ROLLBACK PLAN

If something breaks:
1. All changes will be in git commits
2. Can revert individual files
3. Tests will catch issues before merging

---

## ESTIMATED TIMELINE

- Phase 1 (Types): 1-2 hours
- Phase 2 (Logic): 3-4 hours
- Phase 3 (Scoring): 4-6 hours
- Phase 4 (AI): 3-4 hours
- Phase 5 (Docs): 2-3 hours
- Phase 6 (Testing): 4-6 hours

**TOTAL: 17-25 hours**

---

## READY TO PROCEED?

Please confirm:
- ✅ You've reviewed this plan
- ✅ You approve the changes listed
- ✅ You're ready for me to start Phase 1

**Once you give the go-ahead, I'll begin with Phase 1 (Types) and proceed through each phase sequentially.**
