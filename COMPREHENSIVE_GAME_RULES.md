# Signal to Noise: Comprehensive Game Rules

**Version:** 2.1.0
**Last Updated:** October 24, 2025
**Game Type:** Social Deduction, Deception, Consensus-Building
**Players:** 3-5
**Duration:** 6 rounds (~15-20 minutes)
**Core Concept:** Truth is determined by consensus, not reality

---

## Table of Contents

1. [Game Overview](#game-overview)
2. [Components](#components)
3. [Setup](#setup)
4. [Game Structure](#game-structure)
5. [Phase-by-Phase Rules](#phase-by-phase-rules)
6. [Scoring System](#scoring-system)
7. [Credibility System](#credibility-system)
8. [Win Conditions](#win-conditions)
9. [Advanced Strategies](#advanced-strategies)
10. [Glossary](#glossary)

---

## Game Overview

**Signal to Noise** is a strategic deception game where 3-5 players compete to build the largest audience by broadcasting claims about conspiracy theories. The fundamental twist: there is no objective truth in the base game - reality is determined by what the majority believes through consensus.

### Core Principles

1. **Consensus Over Truth**: The majority position becomes reality
2. **Secret Information**: Evidence assignments are hidden until the RESOLVE phase
3. **Psychological Warfare**: The ADVERTISE phase creates mind games and coordination
4. **Risk vs Reward**: Bluffing can pay off but risks escalating credibility loss
5. **Evidence Persistence**: Cards stay assigned to conspiracies across all rounds

---

## Components

### Conspiracy Cards (12 total)

Each conspiracy card includes:
- **Name**: The conspiracy theory title
- **Description**: Humorous flavor text
- **Tier**: 1 (6 cards), 2 (4 cards), or 3 (2 cards) - **AFFECTS SCORING!**
- **Icon**: Visual identifier

**Tier System (v2.3.0):**
- **Tier 1**: Easy conspiracies with LOTS of available evidence (6-12 cards each)
- **Tier 2**: Medium conspiracies with MODERATE evidence (4-6 cards each)
- **Tier 3**: Hard conspiracies with SCARCE evidence (2-4 cards each)
- Higher tiers award MORE points to reward difficulty!

**Tier 1 Conspiracies (6):**
- Chemtrails Control Weather
- Celebrity Death Hoax: Elvis Lives
- Crop Circles Are Alien Messages
- Bigfoot Sighting Cover-Up
- Subliminal Advertising in Music
- Fluoride Mind Control

**Tier 2 Conspiracies (4):**
- Moon Landing Was Faked
- Pharmaceutical Company Hides Cure
- Election Rigging Software
- Government Weather Machine

**Tier 3 Conspiracies (2):**
- Mayor Embezzling City Funds
- Tech Company Selling User Data

### Evidence Cards (156 total)

Each evidence card includes:
- **Name**: Type of evidence
- **Supported Conspiracies**: Specific conspiracy IDs or "ALL"
- **Flavor Text**: Humorous description
- **Excitement Level**: -1 (BORING), 0 (NEUTRAL), +1 (EXCITING)
- **Proof Value**: REAL, FAKE, or BLUFF (used only in variant modes)

**Card Categories:**
- **Generic Evidence (34 cards)**: Support "ALL" conspiracies
- **Specific Evidence (114 cards)**: Support 1-5 specific conspiracies
- **Bluff Cards (8 cards)**: Marked as BLUFF, support "ALL" conspiracies

**Excitement Distribution:**
- **BORING** (☆☆☆): -1 excitement, ×0.5 multiplier on specificity bonus (rounds UP)
- **NEUTRAL** (★☆☆): 0 excitement, ×1.0 multiplier (no change)
- **EXCITING** (★★★): +1 excitement, ×2.0 multiplier (DOUBLES specificity bonus)

### Player Trackers

Each player needs:
- **Credibility Tracker**: Range 0-10 (starts at 5)
- **Audience Tracker**: Range 0-60+ (starts at 5)
- **Evidence Hand**: Private cards held in hand
- **Color Markers**: To identify assigned evidence

---

## Setup

### Initial Setup

1. **Shuffle Decks**:
   - Shuffle conspiracy deck
   - Shuffle evidence deck

2. **Deal Conspiracies**:
   - Deal 6 conspiracy cards face-up to form the active conspiracy board

3. **Assign Player Resources**:
   - Each player receives:
     - 5 evidence cards (drawn from evidence deck)
     - Credibility tracker set to 5
     - Audience tracker set to 5
     - Player color markers, double sided with R or F to declare Real or Fake

4. **Determine Turn Order**:
   - Randomly determine first player
   - Turn order proceeds clockwise

---

## Game Structure

### Round Overview

The game lasts **6 rounds**. Each round consists of **5 phases**:

```
Round → INVESTIGATE → ADVERTISE → BROADCAST → RESOLVE → CLEANUP → Next Round
```

### Phase Sequence

1. **INVESTIGATE** (Blue): Secretly assign evidence to conspiracies
2. **ADVERTISE** (Purple): Publicly signal intentions to other players by betting
3. **BROADCAST** (Orange): Make public claims about conspiracies
4. **RESOLVE** (Green): Check consensus and score points
5. **CLEANUP** (Gray): Replace revealed conspiracies and prepare next round

---

## Phase-by-Phase Rules

### Phase 1: INVESTIGATE (Blue)

**Duration**: All players act in turn, one evidence card at a time, if you pass you are out for the remainder of this phase

**What Happens:**

1. Each player examines their evidence hand
2. Players secretly assign evidence cards face-down to any conspiracy on the board one card at a time, one player a time 
3. Evidence is assigned by placing cards face-down near the conspiracy and marking with player's color token
4. **IMPORTANT**: Evidence COUNT is visible (e.g., "Alice: 3 cards on Moon Landing"), but CONTENT is hidden. Evidence cards played by a player are marked with their color , this color marker only has the player color
5. Once all players finish, each player draws 2 new evidence cards from the deck, if this means they have more than 10 cards in hand they must discard down to 10

**Strategic Considerations:**

- **Specificity Bonus**: Specific evidence (supports 1-5 conspiracies) earns +3 base bonus
- **Generic Evidence**: "ALL" cards earn only +1 base bonus
- **Signaling**: Stacking many cards signals confidence (or a bluff!)
- **Spreading**: Distributing evidence hides your true target
- **Excitement Matters**: EXCITING cards (★★★) double your specificity bonus - prioritize these!

**Rules:**

- Players can assign 0 to any number of cards from their hand
- Evidence persists across rounds until the conspiracy is revealed
- Other players can see HOW MANY cards you assign but not WHICH cards
- Verbal communication is always allowed but is never binding

---

### Phase 2: ADVERTISE (Purple)

**Duration**: Players act sequentially in turn order

**What Happens:**

1. In turn order, each player either:
   - **Advertises**: Publicly announces ONE conspiracy they're interested in and marks it with their color token which is marked B for Broadcast and Gains 1 audience
   - **Passes**: Declines to advertise and loses 1 audience

2. Advertisements are PUBLIC - all players see them

3. **After all advertisements**, each player May assign ONE additional evidence card FACE UP to any conspiracy

**Deception Penalty:**

If you advertise conspiracy A but broadcast on conspiracy B during the BROADCAST phase:
- **Penalty**: -1 audience points (NOT credibility)
- This discourages false advertising but allows strategic misdirection

**Strategic Considerations:**

- **Honest Signaling**: Advertise where you have evidence to coordinate consensus
- **Controlled Deception**: Mislead opponents but pay -1 audience cost
- **Bandwagoning**: Follow others' ads to predict consensus
- **Secrecy**: Pass to keep plans hidden (no penalty)
- **Bonus Card**: Use the bonus evidence card to strengthen advertised conspiracy OR pivot strategy

**Rules:**

- Advertisements are binding for penalty purposes only
- You can still broadcast on a different conspiracy (with -1 audience penalty)
- Passing incurs a penalty of 1 audience
- The bonus evidence card is assigned AFTER seeing all advertisements

**Example:**

```
Turn Order: Alice → Bob → Carol → Dave

Alice: "I'm interested in Moon Landing" gains +1 audience
Bob: "I'm interested in Moon Landing" (bandwagoning) gains +1 audience
Carol: PASSES loses 1 audience
Dave: "I'm interested in Chemtrails" gains +1 audience

[All advertisements visible]

All players now place 1 bonus evidence card anywhere face up
```

---

### Phase 3: BROADCAST (Orange)

**Duration**: All players act secretly, then reveal simultaneously

**What Happens:**

1. Each player sees all advertisements from Phase 2
2. Players secretly choose ONE of the following:
   - **REAL (✓)**: Claim the conspiracy is real
   - **FAKE (✗)**: Claim the conspiracy is fake
   - **PASS**: Don't broadcast this round

3. Players select which conspiracy to broadcast on (if not passing)

4. All broadcasts are revealed simultaneously

**Base Point Values:**

- **With Evidence**: 3 base points (must have assigned evidence to this conspiracy)
- **Bandwagoning** (no evidence): 1 base point (attempting to join consensus)
- **PASS**: 0 points

**Strategic Considerations:**

- **Follow Advertisements**: Use ads to predict consensus
- **Bluffing**: Broadcast without evidence for 1 base point if consensus forms
- **Advertise Penalty Check**: Broadcasting on a different conspiracy than advertised = -1 audience

**Rules:**

- You can broadcast on any conspiracy, regardless of evidence
- Broadcasting without evidence = "bandwagoning" (only 1 base point)
- If you pass, you score 0 points but avoid credibility loss

**Example:**

```
Broadcasts revealed:

Alice: Moon Landing is REAL (has evidence)
Bob: Moon Landing is REAL (has evidence)
Carol: PASSES
Dave: Chemtrails is FAKE (has evidence)

Consensus check: 2 votes for Moon Landing REAL (consensus reached!)
No consensus on Chemtrails (only 1 vote)
```

---

### Phase 4: RESOLVE (Green)

**Duration**: Automatic calculation

**What Happens:**

1. **Check Consensus**: Determine if majority agreement was reached
2. **Reveal Evidence**: All evidence assigned to broadcast conspiracies is revealed
3. **Calculate Scores**: Apply scoring formula to successful broadcasts
4. **Adjust Credibility**: Apply credibility changes based on outcomes
5. **Display Results**: Show scoring breakdown and new credibility/audience totals

#### Consensus Thresholds

| Players | Votes Needed |
|---------|--------------|
| 3 players | 2 votes |
| 4 players | 2 votes |
| 5 players | 3 votes |

**Note**: INCONCLUSIVE broadcasts do NOT count toward consensus

#### Consensus Outcomes

**Consensus Reached:**
- Majority agreed on REAL or FAKE
- All players who broadcast on the winning side score points
- Credibility adjustments:
  - **Majority side**: +1 credibility
  - **Minority side**: -1 credibility
  - **Bluffers on majority**: Additional escalating penalty (see Bluffing Penalty)

**No Consensus:**
- Votes split or insufficient
- No points scored for any broadcasts on this conspiracy
- Credibility adjustments:
  - All broadcasters on this conspiracy: -3 credibility (wrong prediction)
  - Exception: INCONCLUSIVE always scores 2 points regardless

#### Bluffing Penalty (Escalating)

If you broadcast WITH consensus but had NO genuine evidence:

- **1st bluff**: -2 credibility
- **2nd bluff**: -3 credibility
- **3rd bluff**: -4 credibility
- **4th+ bluff**: -5 credibility (capped)

**Strategic Impact**: First-time bluffs are manageable. Serial bluffing quickly becomes devastating.

---

### Scoring Formula

The complete scoring formula for broadcasts with consensus:

```
BASE POINTS:
  3 = Broadcasting with evidence
  1 = Bandwagoning (no evidence, you did not play any evidence for this specific conspiracy)

+ TIER BONUS (difficulty bonus):
  +1 = Tier 1 conspiracies (easy - lots of evidence available)
  +2 = Tier 2 conspiracies (medium - moderate evidence)
  +3 = Tier 3 conspiracies (hard - scarce evidence)

+ EVIDENCE BONUSES (per card assigned to this conspiracy):

  Specificity Bonus (with diminishing returns):
      +3 = Specific cards (supports 1-5 conspiracies)
      +1 = ALL cards (supports any conspiracy), this includes "Bluff" cards
      -1 = any card that is specifically not related to this conspiracy

  × Excitement Multiplier (applied to specificity bonus):
    ×2.0 = EXCITING (★★★) - Doubles the bonus!
    ×1.0 = NEUTRAL (★☆☆) - No change
    ×0.5 = BORING (☆☆☆) - Half value, rounds UP (3→2, 1→1)


× CREDIBILITY MODIFIER (applied to total):
  ×2 = High credibility (7-10)
  ×1.0 = Medium credibility (4-6)
  ×0.5 = Low credibility (0-3)

− ADVERTISE DECEPTION PENALTY:
  -1 audience = If you advertised conspiracy A but broadcast on conspiracy B

= TOTAL AUDIENCE POINTS
```

---

### Phase 5: CLEANUP (Gray)

**Duration**: Automatic

**What Happens:**

1. **Replace Revealed Conspiracies with consensus**: Any conspiracy that was broadcast on and has acieved consensus is removed and replaced with a new one from the deck
2. **Evidence Persistence**: All evidence assigned to other conspiracies remains in place
3. **Evidence on Revealed and consesnus achieved Conspiracies**: Discarded (returns to discard pile)
4. **Check Win Conditions**:
   - First to 60 audience?
   - 12 conspiracies revealed?
   - 6 rounds completed?
5. **Advance Round Counter**: Move to next round

**Win Condition Check:**

Game ends if ANY of the following occur:
- A player reaches 60 audience points (instant win)
- 12 total conspiracies have been revealed (most audience wins)
- 6 rounds completed (most audience wins)

**Strategic Note:**

- Evidence persists across rounds - you can build up evidence over time
- Revealed conspiracies are replaced immediately
- Plan multi-round strategies by accumulating evidence on unbroadcast conspiracies

---

## Credibility System

### Credibility Mechanics

**Range**: 0-10
**Starting Value**: 4

### Credibility Effects on Scoring

| Credibility Range | Modifier | Effect |
|-------------------|----------|--------|
| 7-10 (High) | ×2 | +100% to all audience points |
| 4-6 (Medium) | ×1.0 | No modifier |
| 0-3 (Low) | ×0.5 | -50% to all audience points |

### Credibility Changes

| Situation | Credibility Change |
|-----------|-------------------|
| **Bluffing with consensus** (escalating) | -2, -3, -4, -5 (1st, 2nd, 3rd, 4th+ bluff) |
| Majority side (consensus reached) | +1 |
| Minority side (consensus reached) | -1 |
| No consensus (broadcast ignored) | -3 |
| INCONCLUSIVE broadcast | 0 (no change) |
| Advertise deception | 0 credibility (only -1 audience) |

### Strategic Implications

- **Protect High Credibility**: At 7+, your scoring multiplier is worth protecting
- **Avoid Serial Bluffing**: Escalating penalties (-2 → -3 → -4 → -5) make repeated bluffing devastating
- **Credibility Recovery**: Ride majority consensus to slowly rebuild (+1 per majority broadcast)
- **Low Credibility Trap**: Dropping to 0-3 imposes -25% scoring penalty - hard to recover from

---

## Win Conditions

### Three Ways to Win

1. **60 Audience Points** (rare - only 0% of AI games)
   - First player to reach 60 audience wins immediately
   - Game ends mid-round if triggered

2. **12 Conspiracies Revealed** (rare - only 0% of AI games)
   - When 12th conspiracy is revealed, game ends
   - Player with most audience wins

3. **6 Rounds Completed** (most common - 100% of AI games)
   - After round 6, player with most audience wins
   - This is the standard game length

### Tiebreaker

If tied on audience after 6 rounds:
1. Higher credibility wins
2. If still tied, player with more evidence cards remaining wins
3. If still tied, shared victory

---

## Advanced Strategies

### For Beginners

1. **Start Conservative**: Use evidence-backed broadcasts
2. **Watch Advertisements**: See where others signal interest
3. **Join the Majority**: Bandwagon for easy consensus points
4. **Use INCONCLUSIVE**: When uncertain, take the safe 2 points
5. **Protect Credibility**: Avoid lone broadcasts that risk -3 credibility

### For Intermediate Players

1. **Excitement Management**: Prioritize EXCITING cards (★★★) for doubled bonuses
2. **Novelty Tracking**: Use new evidence for +2 novelty bonus
3. **Credibility Awareness**: Monitor when you're at 7+ for the ×1.5 multiplier
4. **Advertise Honestly**: Build reputation for coordination, then occasionally deceive
5. **Multi-Round Planning**: Build evidence on multiple conspiracies for flexibility

### For Advanced Players

1. **Controlled Deception**: Advertise one conspiracy, broadcast another (-1 audience cost for misdirection)
2. **Bluff Budgeting**: First bluff costs -2 credibility (manageable), but avoid serial bluffing
3. **Credibility Manipulation**: Ride majority to build to 7+, then leverage ×1.5 multiplier
4. **Trap Setting**: Advertise without evidence to mislead opponents
5. **Meta-Gaming**: Track which players follow their advertisements vs. deceive
6. **Evidence Efficiency**: Reuse SPECIFIC + EXCITING cards for maximum bonuses
7. **Minority Avoidance**: Predict consensus and avoid -3 credibility from being wrong

---

## Glossary

### Core Terms

**Advertisement**
A public signal made during the ADVERTISE phase indicating which conspiracy a player is interested in. Not binding, but broadcasting on a different conspiracy incurs -1 audience penalty.

**ALL Cards**
Evidence cards that can be assigned to any conspiracy. Earn only +1 specificity bonus (vs +3 for specific cards).

**Audience**
Victory points earned by successful broadcasts. First to 60 wins, or highest after 6 rounds.

**Bandwagoning**
Broadcasting on a conspiracy without having assigned any evidence to it. Earns only 1 base point instead of 3.

**Base Points**
The starting point value before bonuses: 3 (with evidence), 1 (bandwagoning), or 2 (INCONCLUSIVE).

**Bluff**
Broadcasting with consensus while having no genuine evidence. Triggers escalating credibility penalty (-2, -3, -4, -5 for successive bluffs).

**Bluff Cards**
Special evidence cards marked with "BLUFF" proof value. In base game, function as normal evidence. Used in variant modes.

**BORING Evidence**
Cards with -1 excitement. Apply ×0.5 multiplier to specificity bonus, rounds UP (3→2, 1→1).

**Broadcast**
The public claim made during BROADCAST phase: REAL, FAKE, INCONCLUSIVE, or PASS.

**Consensus**
Majority agreement on REAL or FAKE. Thresholds: 2 votes (3-4 players), 3 votes (5 players). INCONCLUSIVE doesn't count toward consensus.

### Game Mechanics

**Conspiracy Card**
One of 12 conspiracy theories in the game. Has name, description, tier (1-3), truth value (variant mode), and icon.

**Credibility**
A player's reputation score (0-10, starts at 5). Affects scoring multiplier: ×1.5 (high 7+), ×1.0 (medium 4-6), ×0.75 (low 0-3).

**Credibility Modifier**
The multiplier applied to total audience points based on current credibility.

**Deception Penalty**
-1 audience points for advertising conspiracy A but broadcasting on conspiracy B.

**Evidence Persistence**
Assigned evidence remains on conspiracies across rounds until that conspiracy is revealed.

**EXCITING Evidence**
Cards with +1 excitement. Apply ×2.0 multiplier to specificity bonus (DOUBLES the bonus!).

**Excitement Level**
The multiplier applied to specificity bonuses: BORING (×0.5), NEUTRAL (×1.0), EXCITING (×2.0).

**Excitement Multiplier**
The calculation step: Specificity Bonus × Excitement Level = Modified Specificity Bonus.

### Phases

**INVESTIGATE Phase**
Phase 1 (Blue). Players secretly assign evidence cards to conspiracies. Evidence count visible, content hidden.

**ADVERTISE Phase**
Phase 2 (Purple). Players publicly signal which conspiracy interests them, then place 1 bonus evidence card.

**BROADCAST Phase**
Phase 3 (Orange). Players make public claims (REAL/FAKE/INCONCLUSIVE) about conspiracies or PASS.

**RESOLVE Phase**
Phase 4 (Green). Consensus checked, evidence revealed, points scored, credibility adjusted.

**CLEANUP Phase**
Phase 5 (Gray). Revealed conspiracies replaced, win conditions checked, round advances.

### Scoring Terms

**FAKE**
One of three broadcast positions. Claims the conspiracy is false.

**INCONCLUSIVE**
Safe broadcast position. Always scores 2 points regardless of consensus. No credibility change.

**Majority Side**
The winning position in a consensus. Players on this side score points and gain +1 credibility.

**Minority Side**
The losing position in a consensus. Players on this side score 0 points and lose -1 credibility.

**NEUTRAL Evidence**
Cards with 0 excitement. Apply ×1.0 multiplier to specificity bonus (no change).

**Novelty Bonus**
+2 audience points for using an evidence card on a conspiracy for the first time ever (per card).

**PASS**
Decision to not broadcast during BROADCAST phase. Scores 0 points, no credibility change.

**Proof Value**
Attribute of evidence cards: REAL, FAKE, or BLUFF. Used only in "Truth Matters" variant mode.

**REAL**
One of three broadcast positions. Claims the conspiracy is true.

**Scoring Formula**
The complete calculation: (Base + Evidence Bonuses) × Credibility Modifier − Advertise Penalty = Total.

**Specific Evidence**
Cards that support 1-5 specific conspiracies. Earn +3 specificity bonus (vs +1 for ALL cards).

**Specificity Bonus**
+3 points for specific evidence, +1 point for ALL evidence, before excitement multiplier.

**Tier**
The classification of conspiracy cards: Tier 1 (6 cards), Tier 2 (4 cards), Tier 3 (2 cards). No mechanical effect in base game.

**Truth Value**
Hidden attribute of conspiracy cards: REAL or FAKE. Used only in "Truth Matters" variant mode. In base game, consensus determines outcome regardless of truth value.

### Strategic Terms

**Advertise Deception**
Strategy of advertising one conspiracy but broadcasting on another. Costs -1 audience but can mislead opponents.

**Coalition**
Informal alliance formed through advertisements to coordinate consensus.

**Evidence Stacking**
Assigning multiple cards to one conspiracy to signal confidence (or bluff).

**First Bluff**
The initial bandwagon broadcast with consensus. Costs -2 credibility. Manageable penalty.

**High Credibility**
7-10 credibility range. Grants ×1.5 scoring multiplier (+50% points).

**Low Credibility**
0-3 credibility range. Imposes ×0.75 scoring multiplier (-25% points).

**No Consensus**
When votes are split or insufficient. No points scored, all broadcasters lose -3 credibility.

**Safe Play**
Using INCONCLUSIVE broadcast for guaranteed 2 points with no credibility risk.

**Serial Bluffing**
Repeated bandwagon broadcasts. Triggers escalating penalties: -2, -3, -4, -5 credibility.

**Signal**
Information conveyed through evidence count or advertisements to influence other players.

**Trap**
Advertising without evidence to mislead opponents into a false consensus.

---

## Component Count Reference

**Total Components:**
- 12 Conspiracy Cards
- 156 Evidence Cards (78 originals + 78 duplicates with opposite proof values)
  - 34 Generic (ALL) Evidence
  - 114 Specific Evidence
  - 8 Bluff Cards
- Player Trackers (per player):
  - Credibility tracker (0-10)
  - Audience tracker (0-60+)
  - Color markers
  - Hand of evidence cards (typically 5-8 cards)

---

## Variant Modes (Optional)

### Truth Matters Mode

In this variant, objective truth exists:
- Each conspiracy has a hidden Truth Value (REAL or FAKE)
- Evidence cards have Proof Values (REAL, FAKE, or BLUFF)
- Bonus points awarded for "correct" claims matching truth value
- Bluff cards penalize players when revealed
- Changes the game from pure social deduction to evidence evaluation

---

**END OF COMPREHENSIVE RULES**

For quick reference during play, see [QUICK_REFERENCE.md](QUICK_REFERENCE.md).
For tutorial mode, see [TUTORIAL-MODE-README.md](TUTORIAL-MODE-README.md).
For playtesting feedback, see [PLAYTESTING_GUIDE_v1.0.md](PLAYTESTING_GUIDE_v1.0.md).
