# Signal to Noise v2 - Digital Prototype Implementation Guide

## Project Overview

Build a simplified, accessible web-based prototype. Base game first (simple), then add advanced modules as optional toggles.

**Target:** 40 hours for base game MVP, +10 hours per advanced module
**Tech Stack:** React with hooks, local state only
**Players:** 3-5 (hot-seat multiplayer)

**NOTE**: This document is an old implementation guide. For current game rules, see:
- **GAME-RULES.md** - Complete game rules with consensus mechanics
- **SCORING-FORMULA.md** - Audience point calculation details

---

## Core Data Structures (Simplified)

### Conspiracy Card
```javascript
{
  id: string,
  name: string,
  description: string,
  tier: 1 | 2 | 3,
  truthValue: 'REAL' | 'FAKE',  // Used ONLY for "Truth Matters" variant mode
                                 // In base game, consensus determines outcome
  isRevealed: boolean
}
```

### Evidence Card (SIMPLIFIED)
```javascript
{
  id: string,
  name: string,
  supportedConspiracies: string[],  // IDs this could support
  flavorText: string
  // NO reliability or drama - every card worth 1 point
}
```

### Player State (SIMPLIFIED)
```javascript
{
  id: string,
  name: string,
  credibility: number,  // 0-10, only for tiebreaker in base game
  audience: number,  // victory points
  evidenceHand: EvidenceCard[],
  assignedEvidence: {
    [conspiracyId]: EvidenceCard[]
  },
  color: string
}
```

### Broadcast Object (SIMPLIFIED)
```javascript
{
  id: string,
  playerId: string,
  conspiracyId: string,
  position: 'REAL' | 'FAKE' | 'INCONCLUSIVE',  // Added INCONCLUSIVE (???) option
  evidenceCount: number,  // don't need full cards, just count
  timestamp: number,
  isPassed?: boolean  // true if player passed instead of broadcasting
}
```

### Game State (SIMPLIFIED)
```javascript
{
  conspiracies: ConspiracyCard[],  // 6 active
  conspiracyDeck: ConspiracyCard[],
  evidenceDeck: EvidenceCard[],
  players: PlayerState[],
  currentPlayerIndex: number,
  broadcastQueue: BroadcastObject[],
  phase: 'INVESTIGATE' | 'BROADCAST' | 'RESOLVE' | 'CLEANUP',
  round: number,
  gameOver: boolean,
  winner: string | null,
  
  // Advanced rules toggles
  advancedRules: {
    counterBroadcasts: boolean,
    credibilityEffects: boolean,
    exposeAction: boolean,
    specialEvidence: boolean
  }
}
```

---

## Implementation Priority - BASE GAME ONLY

### Phase 1: Minimal Data (8 hours)

1. **Card data** (3 hours)
   - 12 conspiracy cards (name, tier, description)
   - 40 evidence cards (name, supported conspiracies list)
   - Store as JSON constants

2. **State setup** (3 hours)
   - Game state object with useState
   - Shuffle and deal functions
   - Setup function (deal 3 evidence, set credibility to 5)

3. **Phase transitions** (2 hours)
   - Simple state machine: INVESTIGATE → BROADCAST → RESOLVE → CLEANUP → repeat
   - Button to advance phase (manual for now)
   - Round counter

### Phase 2: Core Logic (10 hours)

4. **Consensus detection** (3 hours)
   ```javascript
   function detectConsensus(queue, conspiracyId, playerCount) {
     // Filter out INCONCLUSIVE and PASSED broadcasts
     const broadcasts = queue.filter(b =>
       b.conspiracyId === conspiracyId &&
       !b.isPassed &&
       b.position !== 'INCONCLUSIVE'
     );

     const realCount = broadcasts.filter(b => b.position === 'REAL').length;
     const fakeCount = broadcasts.filter(b => b.position === 'FAKE').length;

     // Majority threshold: 3P = 2, 4P = 2, 5P = 3
     const threshold = Math.ceil(playerCount / 2);

     if (realCount >= threshold) return { consensus: true, position: 'REAL' };
     if (fakeCount >= threshold) return { consensus: true, position: 'FAKE' };
     return { consensus: false, position: null };
   }
   ```

5. **Scoring calculator** (3 hours)
   ```javascript
   function scoreConsensus(broadcasts, conspiracy, majorityPosition) {
     // STEP 1: Award audience points (NO truth checking!)
     broadcasts.forEach(broadcast => {
       const player = getPlayer(broadcast.playerId);
       const audiencePoints = calculateAudiencePoints(broadcast, player, conspiracy);
       player.audience += audiencePoints;
     });

     // STEP 2: Adjust credibility based on majority/minority
     broadcasts.forEach(broadcast => {
       const player = getPlayer(broadcast.playerId);
       if (broadcast.position === 'INCONCLUSIVE') return;  // Skip INCONCLUSIVE

       if (broadcast.position === majorityPosition) {
         player.credibility = Math.min(10, player.credibility + 1);  // Majority
       } else {
         player.credibility = Math.max(0, player.credibility - 1);  // Minority
       }
     });
   }

   // See SCORING-FORMULA.md for complete audience calculation details
   ```

6. **Win condition** (2 hours)
   - Check after each round: Has round 6 completed?
   - Game ends ONLY after 6 rounds
   - Winner: Highest audience points (tiebreak: credibility)

7. **Validation helpers** (2 hours)
   - Can player broadcast? (can broadcast with OR without evidence)
   - Is action legal for current phase?
   - Hand limit enforcement (5 cards max)

### Phase 3: UI Basics (12 hours)

8. **Game board** (3 hours)
   - 6 conspiracy cards in a row
   - Show name, tier (★), description
   - Hide/reveal truth value
   - Simple colored rectangles with text

9. **Player area** (3 hours)
   - Evidence hand: cards in a row, click to select
   - Assignment area: show which conspiracy each card assigned to
   - Stats: credibility bar (0-10), audience number big and bold

10. **Broadcast queue** (3 hours)
    - Timeline showing broadcasts in order
    - For each: player name, conspiracy name, REAL/FAKE, evidence count
    - Number them (1, 2, 3...)

11. **Action buttons** (3 hours)
    - INVESTIGATE phase: "Assign Evidence" (select card, select conspiracy), "Done Investigating"
    - BROADCAST phase: "REAL", "FAKE", "INCONCLUSIVE (???)", "Pass"
    - RESOLVE phase: "Next Broadcast" (step through), "Continue to Cleanup"
    - Always show current phase prominently

### Phase 4: Game Flow (10 hours)

12. **Investigation phase** (3 hours)
    - All players draw 2 cards
    - Current player assigns evidence (click card → click conspiracy)
    - Shows "Pass device to [Next Player]" between players
    - "Done" button when all players finished

13. **Broadcast phase** (3 hours)
    - Current player's turn
    - Select conspiracy (can broadcast with OR without evidence)
    - Click REAL, FAKE, or INCONCLUSIVE (???) button
    - Broadcast added to queue (visible to all)
    - Auto-advance to next player
    - OR click Pass (no broadcast, credibility safe)

14. **Resolution phase** (3 hours)
    - Button to step through queue one broadcast at a time
    - For each broadcast:
      - Highlight the broadcast
      - Check for consensus on that conspiracy
      - If consensus: reveal ALL evidence, calculate scores, show updates
      - Consensus determines outcome (not objective truth)
      - If no consensus: "No resolution" message
    - After all broadcasts processed: "Continue" button

15. **Cleanup phase** (1 hour)
    - Replace revealed conspiracies automatically
    - Clear queue and assigned evidence
    - Increment round
    - Check win condition
    - If game over: show winner
    - If not: advance to INVESTIGATE phase

---

## Minimal UI Design

**Color scheme:**
- Conspiracy tiers: 1★ = tan, 2★ = red, 3★ = blue
- Players: 5 distinct colors (blue, red, green, purple, orange)
- Phase indicator: big banner at top
- Broadcast positions: REAL = green checkmark, FAKE = red X, INCONCLUSIVE = ???

**Layout:**
```
+------------------------------------------+
|  PHASE: BROADCAST    Round 2             |
+------------------------------------------+
|  [Conspiracy 1] [Conspiracy 2] ...       |
|  (central board - 6 cards)               |
+------------------------------------------+
|  BROADCAST QUEUE:                        |
|  1. Alice: Moon Landing = FAKE (3 ev)    |
|  2. Bob: PASSED                          |
|  3. Carol: Moon Landing = REAL (2 ev)    |
+------------------------------------------+
|  YOUR HAND:                              |
|  [Card] [Card] [Card]                    |
+------------------------------------------+
|  YOUR ASSIGNMENTS:                       |
|  Moon Landing: 3 cards                   |
|  Chemtrails: 2 cards                     |
+------------------------------------------+
|  [Broadcast] [Pass] [Done]               |
+------------------------------------------+
|  Audience: 24   Credibility: ████░ 7/10  |
+------------------------------------------+
```

**No animations needed.** Just state updates and text.

---

## Implementation Checklist (Base Game)

Build in this exact order:

- [ ] Setup game state with 2 players
- [ ] Deal evidence cards
- [ ] Display conspiracy board
- [ ] Display player hand
- [ ] Click card → click conspiracy → assign (face-down)
- [ ] Advance to BROADCAST phase
- [ ] Select conspiracy, click REAL/FAKE → add to queue
- [ ] Display queue updates
- [ ] Pass action works
- [ ] All players broadcast or pass → advance to RESOLVE
- [ ] Step through queue, check consensus per conspiracy
- [ ] Reveal truth on consensus
- [ ] Calculate and apply scores
- [ ] Replace revealed conspiracies
- [ ] Clear queue, advance round
- [ ] Check win condition
- [ ] Display winner screen

**If all checkboxes work → base game is done.**

---

## Advanced Module Implementation

### Module 1: Counter-Broadcasts (+8 hours)

**New data:**
```javascript
{
  broadcast: {
    ...existing,
    isCounterBroadcast: boolean,
    targetBroadcastId: string | null
  }
}
```

**New UI:**
- During BROADCAST phase: show "Counter-Broadcast" button
- Select existing broadcast from queue → takes opposite position automatically
- Mark both broadcasts as "CONTESTED"

**Resolution changes:**
- If counter-broadcast exists, check it before consensus
- Resolve confrontation immediately:
  - Reveal truth
  - Winner: (evidence × tier × 2) + steal 5 audience from loser
  - Loser: -5 credibility, -5 audience
- Remove both broadcasts from queue

**Implementation:**
1. Add counter-broadcast button to UI (2 hrs)
2. Link broadcasts together (target reference) (2 hrs)
3. Confrontation resolution logic (3 hrs)
4. UI indicators for contested broadcasts (1 hr)

### Module 2: Credibility Effects (+6 hours)

**Logic changes:**
```javascript
function consensusThreshold(broadcasts) {
  const highCredPlayers = broadcasts.filter(b => 
    getPlayer(b.playerId).credibility >= 7
  ).length;
  
  const lowCredPlayers = broadcasts.filter(b => 
    getPlayer(b.playerId).credibility <= 3
  ).length;
  
  if (highCredPlayers >= 2) return 2;  // only need 2 more
  if (lowCredPlayers >= 1) return 4;   // need 4 total
  return 3;  // standard
}
```

**Scoring changes:**
- High cred wrong: -5 instead of -3
- Low cred wrong: -1 instead of -3

**Implementation:**
1. Modify consensus detection (2 hrs)
2. Modify scoring penalties (2 hrs)
3. UI indicator showing credibility tier effects (2 hrs)

### Module 3: Exposé Action (+4 hours)

**New data:**
```javascript
{
  player: {
    ...existing,
    exposeUsed: boolean
  }
}
```

**New UI:**
- Button during BROADCAST phase: "Exposé (costs 10 audience)"
- Select conspiracy → immediately reveal truth
- All broadcasts in queue on that conspiracy resolve now

**Implementation:**
1. Add action button with validation (10 audience required) (1 hr)
2. Immediate resolution trigger (2 hrs)
3. Mark as used (can't use twice) (1 hr)

### Module 4: Special Evidence (+6 hours)

**New evidence types:**
```javascript
{
  evidenceCard: {
    ...existing,
    special: 'SMOKING_GUN' | 'RED_HERRING' | null,
    pointValue: 1 | 3  // Smoking Gun = 3
  }
}
```

**Scoring changes:**
- Smoking Gun: +5 bonus if correct
- Red Herring: -5 credibility if wrong (instead of -3)

**Implementation:**
1. Add 10 special cards to deck (1 hr)
2. Display special card indicators in UI (2 hrs)
3. Modify scoring for special evidence (2 hrs)
4. Test edge cases (1 hr)

---

## Advanced Rules Toggle UI

```javascript
// Game setup screen
<div>
  <h2>Advanced Rules</h2>
  <label>
    <input type="checkbox" onChange={toggleCounterBroadcasts} />
    Counter-Broadcasts (adds direct conflict)
  </label>
  <label>
    <input type="checkbox" onChange={toggleCredibilityEffects} />
    Credibility Effects (reputation matters)
  </label>
  <label>
    <input type="checkbox" onChange={toggleExpose} />
    Exposé Action (spend audience for info)
  </label>
  <label>
    <input type="checkbox" onChange={toggleSpecialEvidence} />
    Special Evidence Cards (high-risk cards)
  </label>
</div>
```

Store in game state, check flags before applying rules.

---

## Testing Priority

**Base game must be bulletproof:**
- 2-player game completes without errors
- 4-player game works
- Consensus detection is accurate
- Scoring math is correct
- Win conditions trigger properly

**Advanced modules can have bugs** - they're optional, players expect experimental features to be rough.

---

## Content Generation

### Conspiracy Cards (12 needed)

**Tier 1 (6 cards):**
- Chemtrails Control Weather
- Celebrity Death Hoax: [Name] Is Alive
- Crop Circles Are Alien Messages
- Bigfoot Sighting Cover-Up
- Subliminal Advertising in Music
- Fluoride Mind Control

**Tier 2 (4 cards):**
- Moon Landing Was Faked
- Pharmaceutical Company Hides Cure
- Election Rigging Software
- Government Weather Machine

**Tier 3 (2 cards):**
- Mayor Embezzling City Funds
- Tech Company Selling User Data to Foreign Governments

### Evidence Cards (40 needed)

Use this template:

```javascript
{
  id: "evidence_1",
  name: "Leaked Documents",
  supportedConspiracies: ["moon_landing", "pharma_coverup", "mayor_embezzlement"],
  flavorText: "Classified papers surfaced online last month"
},
{
  id: "evidence_2",
  name: "Anonymous Whistleblower",
  supportedConspiracies: ["ALL"],  // supports everything
  flavorText: "Former insider speaks out on condition of anonymity"
},
{
  id: "evidence_3",
  name: "Viral Social Media Post",
  supportedConspiracies: ["celebrity_death", "chemtrails", "crop_circles"],
  flavorText: "Shared 50k times before being deleted"
}
```

Generate 40 variations. Mix specific (supports 1-3 conspiracies) with generic (supports many).

---

## Success Criteria

**Base game MVP:**
- 2 humans play complete game
- Consensus triggers correctly
- Scoring is accurate
- Game ends properly
- Takes 30-45 minutes to play

**Advanced modules:**
- Each module can be toggled on/off
- Combined modules don't break each other
- UI clearly shows which rules are active

---

## Development Tips

**Start with hardcoded state:**
```javascript
const [gameState, setGameState] = useState({
  phase: 'BROADCAST',
  round: 1,
  players: [
    { id: 'p1', name: 'Alice', credibility: 5, audience: 0, evidenceHand: [...], assignedEvidence: {} },
    { id: 'p2', name: 'Bob', credibility: 5, audience: 0, evidenceHand: [...], assignedEvidence: {} }
  ],
  conspiracies: [...],
  broadcastQueue: []
});
```

Get one phase working perfectly before adding the next.

**Logging is your friend:**
```javascript
console.log('Checking consensus for:', conspiracyId);
console.log('Broadcasts:', queue.filter(b => b.conspiracyId === conspiracyId));
console.log('Consensus result:', detectConsensus(queue, conspiracyId));
```

**Test scoring manually:**
- Create a broadcast with 3 evidence on 2★ conspiracy
- Manually set truth to REAL
- Check: does player gain 6 audience? (3 × 2)
- If not, debug scoring function

---

## What Not to Build

- ❌ Animations (state changes are enough)
- ❌ Sound effects
- ❌ AI opponent (hot-seat only)
- ❌ Online multiplayer
- ❌ Mobile responsive design
- ❌ Accessibility features (beyond basics)
- ❌ Save/load (nice-to-have, not critical)

Focus: **Rules enforcement + state visualization**

That's the entire job.

---

## Post-MVP Ideas (Don't Build Yet)

- Solo mode with simple AI
- Game statistics (% correct, average credibility)
- Replay last game
- Export results
- More conspiracy/evidence variety (100+ cards)
- Tournament mode (best of 3)

Only build these if base game + all advanced modules work perfectly.

---

## Final Check

Before calling it done:

✓ Can you teach the base game to someone in 5 minutes?  
✓ Does a complete game take 30-45 minutes?  
✓ Is consensus detection obvious from the UI?  
✓ Do players understand why they won/lost?  
✓ Are advanced modules clearly explained?  

If yes to all → you have a working prototype.

If no → simplify further or fix the unclear part.

The goal is **playable and clear**, not beautiful.