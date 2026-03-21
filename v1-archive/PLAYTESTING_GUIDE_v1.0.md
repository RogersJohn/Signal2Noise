# Signal to Noise - Playtesting Quick Start Guide
## Version 1.0

**Welcome, Playtesters!** This guide will get you up and running quickly.

---

## 🚀 Quick Start (Digital Version)

### 1. Install & Run

```bash
cd signal-to-noise
npm install
npm start
```

Opens at **http://localhost:3000**

### 2. Enable Tutorial Mode

Click **"📚 Enable Tutorial Mode"** (bottom-right corner) for step-by-step guidance through each phase.

### 3. Start Playing

The game will guide you through 5 phases each round:
- 🔵 **INVESTIGATE** - Secretly assign evidence
- 🟣 **ADVERTISE** - Signal your intentions
- 🟠 **BROADCAST** - Make your claim
- 🟢 **RESOLVE** - See results and score points
- ⚪ **CLEANUP** - Prepare for next round

---

## 🎮 The 60-Second Pitch

**You are a conspiracy theory podcaster.** Your goal: Build the largest audience by making claims about conspiracies.

**The twist:** There is no objective truth. Whatever the majority believes becomes "real."

**How to win:**
1. Assign evidence cards to conspiracies (face-down, but others see HOW MANY)
2. Advertise which conspiracy interests you (public signal, not binding)
3. Broadcast REAL/FAKE/INCONCLUSIVE on a conspiracy
4. Score points if consensus is reached
5. Manage your credibility (bluffing costs you!)

**First to 60 audience points wins** (or highest score after 6 rounds).

---

## 🎯 What We're Testing

Please pay attention to these areas:

### Critical Questions

**1. Is it Fun?**
- Did you enjoy playing?
- Did you want to play again?
- What moments were most exciting/frustrating?

**2. Is it Clear?**
- Were the rules easy to understand?
- Was the scoring system manageable?
- Did you understand what actions to take?

**3. Is it Balanced?**
- Did any strategy feel overpowered?
- Could you recover from mistakes?
- Did you feel like you had meaningful choices?

**4. Does the ADVERTISE Phase Work?**
- Did you use honest signaling or deception?
- Did others' advertisements influence your decisions?
- Was the -1 audience penalty significant?

**5. Is Bluffing Balanced?**
- Did you try bluffing (broadcasting without evidence)?
- Did the escalating penalties (-2, -3, -4, -5) discourage serial bluffing?
- Could you recover from low credibility?

---

## 📊 Key Mechanics to Understand

### Evidence Assignment (INVESTIGATE Phase)

**What happens:**
- You assign evidence cards face-down to conspiracies
- Other players SEE HOW MANY cards you assign (e.g., "Alice: 3 cards on Moon Landing")
- But they DON'T SEE WHAT cards (could be strong evidence or bluffs!)

**Why it matters:**
- Stacking cards signals confidence (or is it a bluff?)
- You score more points with evidence (3 base) vs bandwagoning (1 base)
- Evidence stays assigned across multiple rounds

### Public Signaling (ADVERTISE Phase)

**What happens:**
- Each player announces which conspiracy interests them (or passes)
- This is PUBLIC and visible to all
- NOT binding - you can broadcast differently later
- If you advertise A but broadcast B: **-1 audience penalty**

**Why it matters:**
- Honest signaling coordinates consensus (safer, more points)
- Deception can set traps for others (-1 cost, potential gain)
- Following others' ads creates bandwagoning opportunities

### Consensus & Scoring (RESOLVE Phase)

**Consensus thresholds:**
- 3 players: 2 votes needed
- 4 players: 2 votes needed
- 5 players: 3 votes needed

**Scoring formula (simplified):**
```
Base Points (3 with evidence, 1 bandwagoning, 2 INCONCLUSIVE)
+ Evidence Bonuses (specificity + excitement + novelty)
× Credibility Modifier (×1.5 high, ×1.0 medium, ×0.75 low)
= Total Audience Points
```

**Credibility changes:**
- Majority side: +1 credibility
- Minority side: -3 credibility
- Bluffing: -2/-3/-4/-5 (escalating!)
- INCONCLUSIVE: No change (safe option)

### The INCONCLUSIVE Option

**When to use:**
- You're unsure where consensus will form
- You want guaranteed 2 points with no risk
- You want to preserve credibility (no change)

**Trade-off:**
- Safe but low-scoring
- Doesn't contribute to consensus formation

---

## 🎴 Understanding Cards

### Conspiracy Cards (12 total)

Three tiers:
- **Tier 1 (★):** Classic conspiracies (Chemtrails, Bigfoot)
- **Tier 2 (★★):** Serious theories (Moon Landing, Pharma)
- **Tier 3 (★★★):** Local scandals (Mayor Embezzlement)

All have satirical flavor text that sets the tone.

### Evidence Cards (156 total)

**Two types:**
1. **Generic (supports ALL):** "Follow the Money", "Pattern Recognition"
2. **Specific (supports 1-5):** "Flag Movement Analysis" (moon landing only)

**Three excitement levels:**
- **☆☆☆ BORING:** Half value on specificity bonus (×0.5)
- **★☆☆ NEUTRAL:** Normal value (×1.0)
- **★★★ EXCITING:** Double value on specificity bonus (×2.0)

**Pure Bluff Cards (8):**
- "Trust Me Bro", "Do Your Own Research", "Just Asking Questions"
- Support ALL conspiracies but are low-value evidence
- Perfect for bandwagoning or deception

---

## 🎲 Sample First Round Walkthrough

### Setup
- 4 players: Alice, Bob, Carol, Dave
- Each starts with 5 evidence cards in hand
- 4 conspiracies on the board: Moon Landing, Chemtrails, Bigfoot, Fluoride

### INVESTIGATE Phase (Blue)

**Alice:** Assigns 3 cards to Moon Landing (visible count)
**Bob:** Assigns 2 cards to Chemtrails, 1 to Bigfoot
**Carol:** Assigns 2 cards to Moon Landing
**Dave:** Assigns 3 cards to Fluoride

*Everyone draws 2 new cards*

### ADVERTISE Phase (Purple)

**Alice:** "I'm interested in Moon Landing" (signals with 3 cards assigned)
**Bob:** "I'm interested in Chemtrails" (has 2 cards there)
**Carol:** "I'm interested in Moon Landing" (joins Alice)
**Dave:** PASS (keeps plans secret)

*Everyone assigns 1 bonus evidence card*

### BROADCAST Phase (Orange)

**Alice:** Moon Landing = REAL (has 3 cards, advertised honestly)
**Bob:** Chemtrails = REAL (has 2 cards, advertised honestly)
**Carol:** Moon Landing = REAL (has 2 cards, follows Alice's lead)
**Dave:** Fluoride = FAKE (has 3 cards, didn't advertise = no penalty)

### RESOLVE Phase (Green)

**Moon Landing:**
- Alice (REAL) + Carol (REAL) = 2 votes
- **Consensus reached!** (2/4 players needed)
- Alice & Carol score points (base + evidence bonuses × credibility)
- Alice & Carol: +1 credibility (majority side)

**Chemtrails:**
- Only Bob (REAL) = 1 vote
- **No consensus** (need 2 votes)
- Bob scores 0 points
- Bob: -3 credibility (alone on failed consensus)

**Fluoride:**
- Only Dave (FAKE) = 1 vote
- **No consensus**
- Dave scores 0 points
- Dave: -3 credibility

**Result:**
- Alice & Carol score well, build credibility
- Bob & Dave score nothing, lose credibility
- Moon Landing is now "revealed" (consensus reached, will be replaced)

### CLEANUP Phase (Gray)

- Moon Landing replaced with new conspiracy
- Evidence assigned to Moon Landing is discarded
- Other evidence stays assigned (Bob keeps Chemtrails/Bigfoot cards)
- Round 2 begins

---

## 🧪 Playtesting Session Structure

### Recommended Format

**Time:** 45-60 minutes total
- 5 min: Setup and rules explanation
- 20 min: First game (6 rounds)
- 5 min: Quick debrief
- 20 min: Second game (with adjustments)
- 10 min: Detailed feedback

### Player Count
- **3 players:** Tight, tactical (consensus = 2/3)
- **4 players:** Recommended sweet spot (consensus = 2/4)
- **5 players:** Chaotic, social (consensus = 3/5)

### Game Length
- Target: 15-20 minutes per game
- 6 rounds (or first to 60 audience points)

---

## 📝 Feedback Questions

### After Your First Game

**Fun Factor:**
1. On a scale of 1-10, how fun was this game?
2. What was the most exciting moment?
3. What was the most frustrating moment?
4. Would you play again?

**Clarity:**
5. Were the rules clear? What was confusing?
6. Was the scoring system manageable or overwhelming?
7. Did the tutorial mode help (if you used it)?

**Mechanics:**
8. Did the ADVERTISE phase add meaningful strategy?
9. Did you ever use deception (advertise A, broadcast B)?
10. Did you use the INCONCLUSIVE option? Why/why not?
11. Did you try bluffing (broadcasting without evidence)?
12. Did the escalating bluff penalties feel fair?

**Balance:**
13. Did any strategy feel overpowered?
14. Could you recover from mistakes or low credibility?
15. Did you feel like you had meaningful choices each round?

**Theme:**
16. Did the conspiracy theory theme work for you?
17. Was the satire clear and appropriate?
18. Did the flavor text add to or distract from the game?

**Social Dynamics:**
19. Did you engage in table talk or psychological warfare?
20. Did you pay attention to others' evidence assignments?
21. Did advertisements influence your decisions?

### After Your Second Game

22. What changed in your strategy from game 1 to game 2?
23. Did the game feel different the second time?
24. What would you change about the game?

---

## 🐛 Known Issues (Don't Report These)

These are already documented for v1.0:

- **1 test failing** (98.3% pass rate) - non-blocking for gameplay
- **Tutorial overlap** on screens <1280px wide
- **SABOTEUR AI** may prevent all consensus (by design)
- **Evidence deck** can run out in very long games (reshuffle implemented)

---

## 🆘 Troubleshooting

### "npm install" fails
- Ensure Node.js 16+ is installed
- Try: `npm cache clean --force` then `npm install`

### Game won't start
- Check that port 3000 is available
- Look for error messages in the terminal
- Try: `npm start` again

### Scoring seems wrong
- Check the detailed breakdown in RESOLVE phase
- Verify credibility multiplier is being applied
- Excitement levels affect specificity bonus, not base points

### Cards not dragging
- Try refreshing the page
- Check browser compatibility (Chrome/Firefox recommended)
- Ensure JavaScript is enabled

---

## 📧 Submitting Feedback

Please document:

**What Worked:**
- Mechanics that felt fun and balanced
- Moments of clever play or strategy
- Clear and intuitive elements

**What Didn't Work:**
- Confusing rules or mechanics
- Frustrating or unfair situations
- Overpowered or underpowered strategies

**Suggestions:**
- Specific changes you'd make
- Alternative mechanics to consider
- Scoring or penalty adjustments

---

## 🎊 Thank You!

Your playtesting feedback is crucial for refining Signal to Noise. This game explores the uncomfortable idea that **consensus often matters more than facts** - making this mechanic playable and fun is the challenge!

Enjoy the game, and thank you for being part of the development process.

**Version:** 1.0.0
**Status:** Ready for Human Playtesting
**Contact:** [Your contact info here]

---

## 📚 Additional Resources

- **Full Rules:** See README.md (complete documentation)
- **Release Notes:** See RELEASE_NOTES_v1.0.md (detailed changelog)
- **Tutorial Mode:** Enable in-game for step-by-step guidance
- **AI Testing:** See ROUND_ROBIN_TOURNAMENT_REPORT.md for balance data

---

**Happy Playtesting!** 🎲🎙️
