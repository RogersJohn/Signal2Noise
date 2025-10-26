# SIGNAL TO NOISE - Comprehensive Rules

## Game Overview

**Signal to Noise** is a bluffing and deduction game for 3-5 players where you compete to become the most trusted conspiracy theorist by broadcasting claims about various conspiracies. Build your audience by making correct claims, but beware - bluffing too often will damage your credibility!

**Goal:** Have the highest Audience score after 6 rounds. (Tiebreaker: Credibility)

---

## Components

### Conspiracy Cards (5 active per game)
Each conspiracy has:
- **Name** and **Description**
- **Tier** (1-3, indicating complexity)
- **Icon** (visual identifier)

### Evidence Cards (164-card deck)
Each evidence card has:
- **Name** (e.g., "Leaked Documents", "Expert Testimony")
- **Supported Conspiracies** (which conspiracies this evidence can support, or "ALL")
- **Flavor Text** (thematic description)
- **Excitement Value** (-1 Boring, 0 Neutral, +1 Exciting)
- **Proof Value** (REAL, FAKE, or BLUFF)

### Player Resources
- **Credibility** (0-10): Your trustworthiness. Starts at 5.
- **Audience** (Victory Points): Your follower count. Starts at 5.
- **Evidence Hand** (max 10 cards): Secret cards you can play

---

## Setup

1. **Select Conspiracies:** Shuffle the conspiracy deck and deal 5 conspiracies face-up to the center of the table.

2. **Deal Evidence:**
   - Shuffle the evidence deck
   - Deal 7 evidence cards to each player (keep secret)
   - Place remaining evidence as a draw deck

3. **Starting Resources:**
   - Each player starts with 5 Credibility
   - Each player starts with 5 Audience

4. **First Player:** Choose randomly (or youngest player goes first)

---

## Game Structure

The game lasts **6 rounds**. Each round consists of 6 phases:

1. **INVESTIGATE**
2. **ADVERTISE**
3. **LATE-BREAKING EVIDENCE**
4. **BROADCAST**
5. **RESOLVE**
6. **CLEANUP**

### Special Rule: Round 1 Only
**Round 1 has TWO Investigate phases** before proceeding to Advertise. This gives players extra time to prepare their opening strategies.

---

## Phase Details

### Phase 1: INVESTIGATE

**Goal:** Secretly assign evidence cards to conspiracies you plan to claim.

**On Your Turn:**
1. **Draw 3 evidence cards** from the deck (hand limit: 10 cards)
2. **Assign evidence** from your hand to any active conspiracies:
   - Click a card in your hand, then click a conspiracy to assign it
   - Evidence can only be assigned to conspiracies it supports
   - Assigned evidence is kept secret from other players
   - You can assign multiple cards to the same conspiracy
   - You can assign cards to different conspiracies
3. **Done:** When finished assigning, click "Done Investigating"

**Remember:** You're building a collection of evidence for claims you'll make later. The evidence stays secret until the Resolve phase!

**Example:**
```
Alice's Hand: 7 cards
- She draws 3 more (now has 10 cards - at hand limit)
- She assigns "Leaked Documents" to "Moon Landing Hoax"
- She assigns "Expert Testimony" to "Moon Landing Hoax"
- She assigns "Atmospheric Samples" to "Chemtrails"
- She clicks "Done Investigating"
```

---

### Phase 2: ADVERTISE

**Goal:** Signal to other players which conspiracy you're interested in. This creates opportunities for cooperation or competition!

**On Your Turn:**
1. **Choose ONE conspiracy** to advertise (or pass)
2. **Signal your interest** publicly
3. **Done:** Move to next player

**Strategy Notes:**
- Advertising shows other players what you're working on
- You can advertise a conspiracy even if you have no evidence for it (bluffing!)
- Other players may join you (cooperation) or compete against you
- **Warning:** If you advertise one conspiracy but broadcast on a different one later, you lose 1 Audience as a penalty for misleading signals!

**Example:**
```
Turn Order:
- Alice advertises "Moon Landing Hoax" (REAL)
- Bob advertises "Chemtrails" (FAKE)
- Carol passes her advertise turn
- Dave advertises "Moon Landing Hoax" (FAKE)

Alice and Dave are signaling interest in the same conspiracy but may claim opposite positions!
```

---

### Phase 3: LATE-BREAKING EVIDENCE

**Goal:** Play ONE additional evidence card face-up for dramatic effect, or pass.

**On Your Turn:**
1. **Option A - Play Evidence:**
   - Select ONE card from your hand
   - Choose which conspiracy to play it on
   - The card is played **face-up** (visible to all players)
   - The card goes into your assigned evidence for that conspiracy

2. **Option B - Pass:**
   - Keep your hand secret and pass

**Strategy Notes:**
- This is your chance to show strength on a conspiracy
- Playing strong evidence face-up can deter competitors
- Passing keeps your hand mysterious
- The face-up card will be revealed along with your other evidence if you broadcast

**Example:**
```
- Alice plays "Stanley Kubrick Connection" face-up on "Moon Landing Hoax"
  (Everyone can see this card - it signals she has evidence for FAKE)
- Bob passes (keeps his hand secret)
- Carol plays "HAARP Facility Activity" face-up on "Chemtrails"
- Dave passes
```

---

### Phase 4: BROADCAST

**Goal:** Make your claim about a conspiracy (REAL or FAKE) using the evidence you've assigned.

**On Your Turn:**
1. **Choose a conspiracy** to broadcast on (or pass)
2. **Declare your position:**
   - **REAL:** "This conspiracy is real!"
   - **FAKE:** "This conspiracy is fake!"
   - **INCONCLUSIVE:** "I'm not sure..." (rare choice - doesn't count toward consensus)
3. **Submit your broadcast** with the evidence you've assigned to that conspiracy

**Important Rules:**
- You can only broadcast on ONE conspiracy per round
- You can broadcast even without evidence (this is a BLUFF - risky!)
- Your assigned evidence is not revealed yet (stays hidden until Resolve)
- If you broadcast on a different conspiracy than you advertised, lose 1 Audience

**Example:**
```
Broadcast Phase:
- Alice broadcasts on "Moon Landing Hoax" claiming FAKE
  (She has 2 evidence cards assigned secretly)
- Bob broadcasts on "Chemtrails" claiming REAL
  (He has 1 evidence card assigned)
- Carol passes (doesn't broadcast this round)
- Dave broadcasts on "Moon Landing Hoax" claiming FAKE
  (He has 0 evidence cards - this is a BLUFF!)
```

---

### Phase 5: RESOLVE

**Goal:** Determine if consensus was reached and score points!

#### Step 1: Check for Consensus

**Consensus Threshold:**
- 3 players: 2 matching broadcasts needed (majority)
- 4 players: 2 matching broadcasts needed (majority)
- 5 players: 3 matching broadcasts needed (majority)

**Consensus Rules:**
- Only count broadcasts on the same conspiracy with the same position (REAL or FAKE)
- Passed broadcasts don't count
- INCONCLUSIVE broadcasts don't count

**Example Consensus Check:**
```
"Moon Landing Hoax" broadcasts:
- Alice: FAKE (2 evidence cards)
- Dave: FAKE (0 evidence cards)

Result: CONSENSUS on FAKE (2 players agree in a 4-player game)
```

#### Step 2: Reveal Evidence (if consensus reached)

All players who broadcast on the consensus conspiracy reveal their assigned evidence cards:

**Example Evidence Reveal:**
```
Alice reveals:
- "Stanley Kubrick Connection" (Proof: FAKE)
- "Flag Movement Analysis" (Proof: FAKE)

Dave reveals:
- No cards (he bluffed!)
```

#### Step 3: Determine Truth

Count the **Proof Values** of all revealed evidence:
- **REAL** proof cards: count toward REAL
- **FAKE** proof cards: count toward FAKE
- **BLUFF** proof cards: don't count (they're worthless!)

The side with more proof cards wins:
- If REAL > FAKE: Conspiracy is REAL
- If FAKE > REAL: Conspiracy is FAKE
- If REAL = FAKE: TIE (no one scores)

**Example Truth Determination:**
```
Evidence revealed:
- Alice: 2 FAKE cards
- Dave: 0 cards

FAKE count: 2
REAL count: 0
Result: Conspiracy is FAKE
```

#### Step 4: Score Points and Penalties

**A. Consensus Bonus Scoring System:**

The game rewards BOTH being correct about the truth AND aligning with consensus:

1. **Correct + Consensus Aligned = +4 Audience**
   - Broadcast matches the actual truth (based on evidence)
   - On the consensus side (REAL or FAKE)
   - Has at least 1 valid evidence card
   - Receives +3 base + +1 consensus bonus

2. **Correct but Against Consensus = +3 Audience**
   - Broadcast matches the actual truth
   - Against the consensus majority
   - Has at least 1 valid evidence card
   - Receives +3 base (no consensus bonus)

3. **Consensus Aligned but Wrong = +1 Audience**
   - On the consensus side
   - But wrong about the actual truth
   - Has at least 1 valid evidence card
   - Receives +1 participation reward

4. **Against Consensus and Wrong = NOTHING**
   - Against the consensus majority
   - And wrong about the actual truth
   - No reward

**B. Bluffing Penalties (for players who matched truth but had NO valid evidence):**

Bluffing escalates in penalty:
- **1st or 2nd bluff:** -2 Credibility
- **3rd or later bluff:** -3 Credibility

Each player's total bluffs are tracked cumulatively across all rounds.

**C. Bankruptcy Rule:**
If a player's Credibility reaches 0:
- They are **eliminated** from the game (bankrupt)
- They can no longer participate in future rounds
- If only 1 player remains active, they win immediately

**Example Scoring:**
```
Scenario: Consensus = FAKE (majority), Truth = FAKE (based on evidence count)

Alice broadcast FAKE with 2 FAKE evidence cards:
- Correct about truth ✓
- On consensus side ✓
- +4 Audience (+3 base + +1 consensus bonus)

Bob broadcast REAL with 1 REAL evidence card:
- Wrong about truth ✗
- Against consensus ✗
- NOTHING (no reward)

Carol broadcast FAKE with 0 evidence cards (bluff):
- Correct about truth ✓
- On consensus side ✓
- But has no evidence (BLUFF!)
- This is her 1st bluff
- -2 Credibility (bluff penalty, no audience gain)

Dave broadcast REAL with 2 REAL evidence cards:
- Correct about truth ✗ (truth was FAKE)
- But on consensus side ✗ (consensus was FAKE)
- NOTHING (against consensus and wrong)
```

---

### Phase 6: CLEANUP

**Automatic Phase:**
1. All broadcast queues are cleared
2. All advertise signals are cleared
3. Revealed evidence cards are discarded
4. Conspiracy remains active (conspiracies stay on the board)
5. Round advances by 1
6. First player marker rotates clockwise
7. Return to Phase 1 (INVESTIGATE)

---

## Winning the Game

### Primary Win Condition
After **6 rounds**, the player with the **highest Audience** wins!

**Tiebreaker:** If multiple players have the same Audience, the player with higher **Credibility** wins.

### Instant Win Condition
If all other players go bankrupt (reach 0 Credibility), the last surviving player wins immediately.

---

## Strategy Tips

### Evidence Management
- **Quality over Quantity:** Having the right evidence is better than having lots of cards
- **Hand Limit Awareness:** You can only hold 10 cards - plan accordingly
- **Evidence Types:**
  - REAL proof: Useful for claiming conspiracies are real
  - FAKE proof: Useful for debunking conspiracies
  - BLUFF proof: Worthless! Avoid using these

### Bluffing Strategy
- **Escalating Penalties:** Your first 2 bluffs cost 2 Credibility each, but bluffs #3+ cost 3 Credibility!
- **When to Bluff:**
  - Early game: Cheaper penalties, more credibility to spare
  - When you need to reach consensus quickly
  - When you can afford the credibility hit
- **When NOT to Bluff:**
  - Low credibility (risk of bankruptcy)
  - Late game (higher penalties)
  - When you already have evidence (why risk it?)

### Advertising Tactics
- **Honest Advertising:** Signal your true intentions to find allies
- **Deceptive Advertising:** Advertise one conspiracy, broadcast on another (costs 1 Audience)
- **Reading Signals:** Pay attention to what others advertise - coordinate or compete!

### Consensus Building
- **Join the Majority:** If 1 player already broadcast, match their position to help reach consensus
- **Be the Leader:** Broadcast first to set the narrative
- **Strategic Passing:** Sometimes not broadcasting is the best move

### Credibility Conservation
- **Avoid Bankruptcy:** Never let Credibility reach 0
- **Bluff Carefully:** Track your total bluffs - penalties escalate
- **Long Game:** Credibility is the tiebreaker - don't waste it all

---

## Advanced Scenarios

### Multiple Consensus in One Round
If consensus is reached on multiple conspiracies:
- Each conspiracy is resolved separately
- Players can only broadcast on ONE conspiracy per round
- Only the conspiracy you broadcast on can score you points

### No Consensus Reached
If no conspiracy reaches consensus:
- No evidence is revealed
- No points are scored
- No bluffing penalties are applied
- Proceed to Cleanup

### All Players Pass Broadcasting
- No consensus is reached
- Proceed to Cleanup phase
- Wasted round (no scoring)

### Tie in Truth Determination
If revealed evidence has equal REAL and FAKE proof:
- No one scores points
- No bluffing penalties (the tie voids the bluff)
- Proceed to Cleanup

---

## Quick Reference Tables

### Starting Resources
| Resource | Starting Value |
|----------|---------------|
| Credibility | 5 |
| Audience | 5 |
| Hand Size | 7 cards |
| Hand Limit | 10 cards |

### Consensus Thresholds
| Players | Broadcasts Needed |
|---------|------------------|
| 3 | 2 (majority) |
| 4 | 2 (majority) |
| 5 | 3 (majority) |

### Scoring & Penalties
| Event | Effect |
|-------|--------|
| Correct + on consensus (with evidence) | +4 Audience (+3 base + +1 bonus) |
| Correct but against consensus (with evidence) | +3 Audience |
| On consensus but wrong (with evidence) | +1 Audience |
| Against consensus and wrong | Nothing |
| Bluff (1st or 2nd) | -2 Credibility |
| Bluff (3rd or later) | -3 Credibility |
| Advertising mismatch | -1 Audience |
| Credibility reaches 0 | Eliminated (bankrupt) |

### Evidence Proof Values
| Proof Value | Effect |
|-------------|--------|
| REAL | Counts toward conspiracy being REAL |
| FAKE | Counts toward conspiracy being FAKE |
| BLUFF | Worthless (doesn't count) |

---

## Full Game Example

### Setup (3 Players: Alice, Bob, Carol)
- 5 conspiracies face-up
- Each player starts with 7 cards, 5 Credibility, 5 Audience
- Round 1 begins

### Round 1 - INVESTIGATE (First)
```
Alice: Draws 3, assigns 2 cards to "Moon Landing", clicks Done
Bob: Draws 3, assigns 1 card to "Chemtrails", clicks Done
Carol: Draws 3, assigns 3 cards to "Moon Landing", clicks Done
```

### Round 1 - INVESTIGATE (Second - Round 1 only!)
```
Alice: Draws 3, assigns 1 more card to "Moon Landing", clicks Done
Bob: Draws 3, assigns 2 cards to "Bigfoot", clicks Done
Carol: Draws 3, assigns 1 more card to "Moon Landing", clicks Done
```

### ADVERTISE
```
Alice: Advertises "Moon Landing" (FAKE)
Bob: Advertises "Bigfoot" (REAL)
Carol: Advertises "Moon Landing" (REAL)
```

### LATE-BREAKING EVIDENCE
```
Alice: Plays "Stanley Kubrick Connection" (FAKE) face-up on "Moon Landing"
Bob: Passes
Carol: Plays "Astronaut Testimony" (REAL) face-up on "Moon Landing"
```

### BROADCAST
```
Alice: Broadcasts "Moon Landing" - FAKE (has 3 evidence total)
Bob: Passes
Carol: Broadcasts "Moon Landing" - REAL (has 4 evidence total)
```

### RESOLVE

**Consensus Check:**
- Moon Landing: Alice (FAKE), Carol (REAL)
- No consensus (split 1-1, need 2 for majority)
- No scoring this round

### CLEANUP
- Queues cleared
- Round advances to 2
- First player rotates to Bob

### Round 2 - INVESTIGATE
```
Bob: Draws 3, assigns 2 to "Chemtrails"...
[Game continues through 6 rounds]
```

### End of Game (After Round 6)
```
Final Scores:
Alice: 14 Audience, 6 Credibility
Bob: 11 Audience, 4 Credibility
Carol: 14 Audience, 3 Credibility

Winner: Alice (tied on Audience, wins on Credibility tiebreaker!)
```

---

## Frequently Asked Questions

**Q: Can I broadcast without any evidence?**
A: Yes! This is called bluffing. If consensus is reached and you matched the truth but have no evidence, you'll take a Credibility penalty instead of scoring points.

**Q: What happens if I advertise one conspiracy but broadcast another?**
A: You lose 1 Audience as a penalty for misleading signals.

**Q: Can evidence support multiple conspiracies?**
A: Yes! Some evidence cards support multiple specific conspiracies, and some evidence marked "ALL" can support any conspiracy.

**Q: What if the evidence reveals a tie (equal REAL and FAKE)?**
A: No one scores, and bluffing penalties don't apply. The tie voids the round.

**Q: Can I change my assigned evidence after assigning it?**
A: Not in this digital version - assignments are final. Plan carefully!

**Q: What happens if everyone passes in the Broadcast phase?**
A: No consensus is reached, no scoring happens, and the game proceeds to Cleanup.

**Q: Can I broadcast INCONCLUSIVE?**
A: Yes, but INCONCLUSIVE broadcasts don't count toward consensus and won't score you points.

**Q: Does credibility affect scoring?**
A: Not directly. Credibility is only used as a tiebreaker at the end of the game. However, reaching 0 Credibility eliminates you!

**Q: How many rounds are there?**
A: Always 6 rounds. The game ends after Round 6 cleanup.

---

## Variants & Optional Rules

### "Truth Matters" Variant
Instead of determining truth by revealed evidence, each conspiracy has a predetermined truth value. This removes the deduction element but simplifies gameplay.

### Speed Play
Reduce the game to 4 rounds instead of 6 for a quicker experience.

### High Stakes
Start with 3 Credibility instead of 5 for a more dangerous game where bluffing is riskier.

---

## Design Notes

**Version:** 5.1
**Designer:** Signal to Noise Development Team
**Game Length:** 45-90 minutes
**Complexity:** Medium

This game emphasizes social deduction, bluffing, and evidence management. Success requires balancing aggression (broadcasting frequently) with caution (avoiding bankruptcy), while reading other players' signals and building coalitions at the right moments.
