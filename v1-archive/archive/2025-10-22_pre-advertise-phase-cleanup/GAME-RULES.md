# Signal to Noise
## The Conspiracy Theory Consensus Game

*Can you build an audience by convincing others... even when the truth doesn't matter?*

---

## Overview

In **Signal to Noise**, you play conspiracy theorists competing to build the largest audience by broadcasting your "findings" about various conspiracies. The twist? **There is no objective truth** - only the consensus you build with other players matters. Gather evidence (or bluff), make broadcasts, and persuade others to agree with your position. The player with the most audience points after 6 rounds wins!

**Players**: 3-5
**Time**: 45-60 minutes
**Age**: 14+

---

## Components

### Cards
- **12 Conspiracy Cards** (6 Tier 1, 4 Tier 2, 2 Tier 3)
  - Each conspiracy has 2 copies (one REAL, one FAKE on back) for future mechanics
- **78 Evidence Cards**
  - Excitement levels: Boring (☆☆☆), Neutral (★☆☆), Exciting (★★★)
  - Support: Specific conspiracies or ALL

### Player Components (per player)
- **3 Broadcast Tokens**: REAL, FAKE, INCONCLUSIVE (???)
- **15 Evidence Markers** (colored circles for marking face-down evidence)
- **1 Player Board** (tracks credibility 0-10 and audience points)

---

## Setup

1. **Shuffle Conspiracy Deck**: Shuffle all 12 conspiracy cards (ignore REAL/FAKE backs for now)
2. **Deal Conspiracies**: Deal 6 conspiracy cards face-up in the center (the active conspiracies)
3. **Shuffle Evidence Deck**: Shuffle all 78 evidence cards
4. **Set Starting Stats**:
   - Each player sets credibility to **5**
   - Each player sets audience to **0**
5. **Choose Player Colors**: Each player takes their colored tokens, markers, and player board
6. **Mark Round 1**: All players mark round 1 on their player boards

---

## Game Structure

The game lasts **6 rounds**. Each round has these phases:

1. **GATHER** - Draw evidence cards
2. **ASSIGN** - Place evidence on conspiracies (optional, secret)
3. **BROADCAST** - Declare your position on a conspiracy (optional, public)
4. **RESOLVE** - Check for consensus, score, replace conspiracies

**Special**: Round 1 has TWO gather phases and TWO assign phases

---

## Phase 1: GATHER Evidence

### Standard Rounds (2-6)
Each player draws **2 evidence cards** from the deck.

### Round 1 Special
Players gather evidence **TWICE**:
- First gather: Draw 2 cards
- First assign phase (see below)
- Second gather: Draw 2 cards
- Second assign phase

*This gives players 4 cards to start building their positions.*

---

## Phase 2: ASSIGN Evidence

Players **MAY** assign evidence cards from their hand to conspiracies.

### How to Assign
1. Choose an evidence card from your hand
2. Place it **face-down** next to a conspiracy
3. Place your colored evidence marker on top to show it's yours

### Rules
- Evidence is **secret** until consensus is reached
- You can assign **multiple cards** to the same conspiracy
- You can assign **zero cards** (save them for later)
- **No limit** to evidence per conspiracy
- You can assign evidence even if you don't plan to broadcast

### Bluffing
- You can assign evidence that doesn't actually support the conspiracy
- You can assign a "bluff card" (isBluff: true) which acts as fake evidence
- **Risk**: When consensus is reached, ALL evidence is revealed
- Bluffing too much may hurt your credibility

---

## Phase 3: BROADCAST

Players **MAY** make one broadcast about one conspiracy.

### How to Broadcast
1. Choose a conspiracy you want to broadcast about
2. Take one of your broadcast tokens (REAL, FAKE, or INCONCLUSIVE)
3. Place it publicly on that conspiracy

### Broadcast Options

#### REAL
*"This conspiracy is REAL! I have proof!"*
- Claiming the conspiracy is legitimate
- Best with supporting evidence

#### FAKE
*"This conspiracy is FAKE! It's debunked!"*
- Claiming the conspiracy is false
- Best with supporting evidence

#### INCONCLUSIVE (???)
*"I'm still investigating... stay tuned."*
- Non-committal signal
- Safer but lower audience reward
- May be a trap to manipulate others

### Broadcast Rules
- You can broadcast **with or without** evidence assigned
- Broadcasting without evidence = "bandwagoning" (low audience reward)
- You can broadcast on a conspiracy you have no evidence on
- You can **change your broadcast** in future rounds (but lose credibility!)
- You **cannot** broadcast on multiple conspiracies in the same round

### Passing
- If you don't want to broadcast, simply don't place a token
- You score 0 audience points but your credibility is safe

---

## Phase 4: RESOLVE

Check each conspiracy for **consensus**.

### What is Consensus?

**Consensus is reached when a MAJORITY of players agree on a position (REAL or FAKE).**

#### Majority Rules
- In a 4-player game: 2+ players agreeing = consensus
- In a 5-player game: 3+ players agreeing = consensus
- INCONCLUSIVE broadcasts don't count toward consensus
- Players who didn't broadcast don't count

#### Examples

**4-Player Game:**
- Players: 2 REAL, 1 FAKE, 1 INCONCLUSIVE → **CONSENSUS: REAL** (2 agree)
- Players: 2 REAL, 2 FAKE → **NO CONSENSUS** (tie)
- Players: 2 REAL, 1 didn't broadcast, 1 INCONCLUSIVE → **CONSENSUS: REAL** (2 agree)

**5-Player Game:**
- Players: 3 REAL, 1 FAKE, 1 INCONCLUSIVE → **CONSENSUS: REAL** (3 agree)
- Players: 2 REAL, 2 FAKE, 1 didn't broadcast → **NO CONSENSUS** (tie)

### When Consensus is Reached

1. **Reveal Evidence**: ALL players reveal their evidence cards on that conspiracy
   - Check if evidence actually supports what was claimed
   - Identify bluffs

2. **Score Audience Points**: Players who broadcast calculate their audience (see Scoring section)

3. **Adjust Credibility**:
   - **Majority side**: +1 credibility (max 10)
   - **Minority side**: -1 credibility (min 0)
   - **INCONCLUSIVE or didn't broadcast**: no change

4. **Remove Conspiracy**: Discard the resolved conspiracy

5. **Draw Replacement**: Draw a new conspiracy card from the deck to maintain 6 active conspiracies

6. **Return Tokens**: Players take back their broadcast tokens for next round

### When NO Consensus

- Leave all tokens and evidence in place
- Conspiracies carry over to next round
- Players can add more evidence or change broadcasts

---

## Scoring Audience Points

Only players who **broadcast** score audience points. Use the formula in `SCORING-FORMULA.md` for detailed calculations.

### Quick Summary

```
AUDIENCE = BASE + EVIDENCE BONUS + CREDIBILITY MODIFIER
```

**Base Points:**
- REAL/FAKE with evidence: 3 points
- REAL/FAKE without evidence (bandwagon): 1 point
- INCONCLUSIVE: 2 points

**Evidence Bonus:**
- Each evidence card scores based on:
  - Specificity (specific vs generic "ALL")
  - Excitement level (★★★ / ★☆☆ / ☆☆☆)
  - Novelty (first use vs already used)

**Credibility Modifier:**
- High credibility (7-10): ×1.5 bonus
- Medium credibility (4-6): ×1.0 neutral
- Low credibility (0-3): ×0.75 penalty

**See SCORING-FORMULA.md for complete examples and calculations.**

---

## Changing Your Broadcast

You can change your broadcast token on a later round, but there are consequences:

### Example
- Round 2: You broadcast REAL on "Moon Landing"
- Round 3: You change to FAKE on "Moon Landing"

### Penalty
- **-2 Credibility** (represents flip-flopping and losing trust)
- Score normally for the new broadcast
- This is public - everyone sees you changed

### Strategy
- Sometimes worth it if you see consensus forming against you
- Better to be on the winning side with low credibility than lose audience points

---

## Advanced Tactics

### Bluffing
- Assign evidence you don't have to appear confident
- Risk: Revealed when consensus reached, may hurt future credibility

### Bandwagoning
- Broadcast without evidence to agree with likely consensus
- Low risk, low reward

### INCONCLUSIVE Signaling
- Can signal to other players you're "investigating"
- Might be a trap to make opponents commit first
- Protects credibility while gathering info

### Evidence Hoarding
- Save strong specific evidence for high-value broadcasts
- Play weak generic evidence early

### Consensus Breaking
- If you're in minority, try to prevent consensus by persuading others
- Use INCONCLUSIVE to stall

---

## Winning the Game

After Round 6:
1. Resolve any remaining consensuses
2. Count final audience points
3. **Highest audience wins!**

In case of tie:
1. Tied player with highest credibility wins
2. Still tied? Share victory

---

## Round Summary Quick Reference

### Round 1 (Special)
1. GATHER: Draw 2 evidence
2. ASSIGN: Assign evidence (optional)
3. GATHER: Draw 2 evidence again
4. ASSIGN: Assign evidence (optional)
5. BROADCAST: Place one broadcast token (optional)
6. RESOLVE: Check consensus, score, adjust credibility

### Rounds 2-6 (Standard)
1. GATHER: Draw 2 evidence
2. ASSIGN: Assign evidence (optional)
3. BROADCAST: Place one broadcast token (optional)
4. RESOLVE: Check consensus, score, adjust credibility

---

## Strategy Tips

### Opening (Rounds 1-2)
- Gather evidence and identify which conspiracies have strong support
- Play safe with INCONCLUSIVE to signal interest
- Build credibility by being on majority side early

### Mid-Game (Rounds 3-4)
- Start making bold REAL/FAKE broadcasts with evidence
- Watch what opponents are broadcasting
- Form alliances by agreeing with other players

### End-Game (Rounds 5-6)
- Cash in your best evidence for big audience gains
- High credibility players should leverage their multiplier
- Don't be afraid to bandwagon if you're behind

---

## Variant Rules (Optional)

### Competitive Mode
- Start at credibility 3 instead of 5 (harder to recover)
- Flip-flopping costs -3 credibility instead of -2

### Chaotic Mode
- Consensus requires unanimous agreement (all players must agree)
- Much longer game with more negotiation

### Truth Matters Mode
- Use conspiracy back indicators (REAL/FAKE)
- At end of game, reveal truth and award bonus points for being "correct"
- Adds objective element to subjective game

---

## FAQ

**Q: Can I broadcast on a conspiracy I have no evidence on?**
A: Yes! You'll score as "bandwagoning" (low points) but it's allowed.

**Q: What happens to evidence if no consensus?**
A: It stays face-down. You can add more evidence next round.

**Q: Can I assign evidence after I broadcast?**
A: No. Assign phase comes before broadcast phase each round.

**Q: Do bluff cards count as evidence for scoring?**
A: Yes, they score normally until revealed.

**Q: What if conspiracy deck runs out?**
A: Shuffle discards to create new deck. Unlikely in 6 rounds.

**Q: Can credibility go negative?**
A: No, minimum is 0.

**Q: Can I have more than 10 credibility?**
A: No, maximum is 10.

**Q: What if everyone broadcasts INCONCLUSIVE?**
A: No consensus. Evidence stays hidden, try again next round.

---

## Design Philosophy

**Signal to Noise** explores how consensus and persuasion work independently of truth. The game asks:
- Can you build credibility even when bluffing?
- Will you sacrifice truth for audience?
- Can you convince others through sheer confidence?

The game models how modern conspiracy theories spread - not through evidence, but through social proof and charismatic broadcasting.

---

**© 2025 Signal to Noise - A Game of Consensus Over Truth**

*For rules questions, updates, and variants, visit the repository.*
