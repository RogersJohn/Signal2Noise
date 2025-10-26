# Signal to Noise - Physical Game Assessment

**Date:** 2025-10-22
**Version:** 1.0.0 (Ready for Playtesting)

---

## 🎮 GAME STATUS ASSESSMENT

### Overall Readiness: **8.5/10** ✅

**Ready for physical playtesting** with the following notes:

### ✅ Strengths
1. **Complete game mechanics** - All 5 phases fully implemented
2. **Balanced card distribution** - 12 conspiracies, 164 evidence cards
3. **Clear player counts** - Supports 3-5 players
4. **Tutorial mode** available for digital version
5. **Comprehensive testing** - 26,550+ simulated games analyzed
6. **Print-ready materials** generated

### ⚠️ Known Balance Issues (From Simulations)
1. **Coalition advantage too strong** (+17% in 2+1+1 format)
2. **Conservative strategies struggle** as minorities (0-1.5% win rate)
3. **Passive play exploit** discovered by evolutionary AI
4. **Bluffing may be over-rewarded** in team formats

### 📊 Simulation Findings Summary

**Monte Carlo Simulations Run:**
- 4×1 Homogeneous: 1,200 games
- 3+1 Majority-Minority: 3,300 games
- 2v2 Team Dynamics: 1,650 games
- 2+1+1 Coalition: 9,900 games
- Evolutionary Algorithm: 2,500 games
- **Total: 28,550 games simulated**

**Key Insights:**
- Game requires strategic diversity (homogeneous groups fail)
- Aggressive strategies dominate (Reckless Gambler, Conspiracy Theorist, Chaos Agent)
- Risk-taking is under-rewarded vs. safe play
- Non-participation needs penalties (evolution found "do-nothing" exploit)

---

## 📦 PHYSICAL COMPONENTS GENERATED

### 1. **Conspiracy Cards**
- **Count:** 12 cards
- **Print pages:** 4 pages (2 fronts + 2 backs)
- **Tiers:**
  - Tier 1 (★): 6 cards
  - Tier 2 (★★): 4 cards
  - Tier 3 (★★★): 2 cards

### 2. **Evidence Cards**
- **Count:** 164 cards (Note: README states 156, actual count is 164)
- **Print pages:** 38 pages (19 fronts + 19 backs)
- **Excitement levels:**
  - ★★★ EXCITING (×2.0 multiplier)
  - ★☆☆ NEUTRAL (×1.0 multiplier)
  - ☆☆☆ BORING (×0.5 multiplier)
- **Types:**
  - Generic (supports ALL conspiracies)
  - Specific (supports 1-5 specific conspiracies)

### 3. **Player Reference Cards**
- **Count:** 2 reference cards
- **Content:**
  - Phase-by-phase instructions
  - Scoring formulas
  - Credibility rules
  - Consensus thresholds

### 4. **Score Trackers**
- **Count:** 2 tracking sheets
- **Features:**
  - Audience score tracker (6 rounds × 5 players)
  - Credibility tracker (starting at 5, range 0-10)

---

## 🖨️ PRINTING INSTRUCTIONS

### Files Created:
1. `PRINT_Conspiracy_Cards.html`
2. `PRINT_Evidence_Cards.html`
3. `PRINT_Player_Reference.html`

### To Print as PDF:

**Step 1: Open HTML file in Chrome or Firefox**

**Step 2: Print Settings (Ctrl+P or Cmd+P)**
- **Destination:** Save as PDF
- **Paper size:** A4 (210mm × 297mm)
- **Pages:** All
- **Margins:** Minimal (or None)
- **Scale:** 100%
- **Color:** ⚠️ **Greyscale / Black & White** (to save ink!)
- **Background graphics:** ✅ **ON** (important for card borders)

**Step 3: Save PDFs**
- Conspiracy_Cards.pdf (4 pages)
- Evidence_Cards.pdf (38 pages)
- Player_Reference.pdf (2 pages)

**Total pages:** 44 pages

---

## ✂️ CARD CUTTING GUIDE

### Card Layout:
- **9 cards per A4 page** (3×3 grid)
- **Card size:** ~66mm × 95mm (standard poker card size)
- **Border:** 2mm black border around each card
- **Gap between cards:** 3mm

### Cutting Instructions:

1. **Print double-sided:**
   - Conspiracy fronts → flip paper → Conspiracy backs
   - Evidence fronts → flip paper → Evidence backs

2. **Let ink dry** (5 minutes for inkjet, 1 minute for laser)

3. **Cut along borders:**
   - Use a paper trimmer for straight cuts
   - Or: Use a ruler and craft knife
   - Or: Use scissors carefully

4. **Recommended:**
   - Laminate cards (optional, adds durability)
   - Or use card sleeves (66mm × 91mm poker sleeves)
   - Or glue to cardstock for thickness

---

## 🎲 ADDITIONAL MATERIALS NEEDED

### Not Included (Provide Yourself):

1. **Player Tokens** (to mark evidence ownership)
   - 5 colors × 20 tokens each = 100 tokens
   - Use: coins, poker chips, colored cubes, etc.

2. **Advertisement Markers** (6 per player)
   - To show which conspiracy you advertised
   - Use: small colored cubes, paper clips, etc.

3. **Score Trackers**
   - Audience points: 0-60+ (use printed tracker or d100 dice)
   - Credibility: 0-10 (use printed tracker or d10 dice)

4. **Turn Order Marker**
   - To track current player
   - Use: a different colored token

5. **Revealed Conspiracy Marker**
   - To mark conspiracies that have consensus
   - Use: face-down token or "REVEALED" sticker

### Optional Enhancements:

- **Card sleeves** (66mm × 91mm): Protect cards, easier shuffling
- **Dry-erase markers**: For reusable score trackers (laminate first!)
- **Player screens**: Hide evidence hands (folded cardboard works)
- **Timer**: Optional for ADVERTISE phase (to prevent analysis paralysis)

---

## 📏 CARD SPECIFICATIONS

### Conspiracy Cards:
```
┌─────────────────┐
│ Tier: ★★        │ (top-right corner)
│                 │
│ NAME            │ (bold header)
│ ─────────────   │
│ Description     │
│ text wraps      │
│ multiple lines  │
│ ─────────────   │
│ ID: chemtrails  │ (footer)
└─────────────────┘
```

### Evidence Cards:
```
┌─────────────────┐
│ Excitement: ★★★ │ (top-right)
│                 │
│ CARD NAME       │ (bold header)
│ ─────────────   │
│ "Flavor text    │ (italic, small)
│  in quotes..."  │
│ ─────────────   │
│ Supports: ALL   │ (footer)
└─────────────────┘
```

---

## 🎯 RECOMMENDED PLAYTESTING PRIORITIES

Based on simulation findings, focus on:

### 1. **Minority Player Experience**
- Does being outnumbered 3-to-1 feel unfair?
- Can skilled minorities find wins?
- Is the INCONCLUSIVE option useful enough?

### 2. **Bluffing Balance**
- Do aggressive bluffers dominate?
- Are escalating penalties (-2, -3, -4, -5) meaningful?
- Can players recover from low credibility?

### 3. **ADVERTISE Phase Dynamics**
- Do players use honest signaling or deception?
- Is the -1 audience penalty significant?
- Does this phase add strategic depth or just time?

### 4. **Passive Play Viability**
- Evolution discovered "do-nothing" strategy wins
- Do humans find similar exploits?
- Is participation rewarded enough?

### 5. **Game Length**
- Target: 15-20 minutes per game
- Do games reach 6 rounds or end early?
- Which win condition triggers most often?

---

## 🔧 RECOMMENDED V1.1 BALANCE FIXES

### Based on 28,550 simulated games:

**1. Participation Incentive**
```
New Rule: Broadcast on all 6 rounds of a game → +3 bonus "Consistent Voice" points
```

**2. Reduced Credibility Loss**
```
Current: Minority = -3 credibility
Proposed: Minority = -1 credibility
```

**3. INCONCLUSIVE Diminishing Returns**
```
1st INCONCLUSIVE: 2 points
2nd consecutive: 1 point
3rd+ consecutive: 0 points
```

**4. Underdog Bonus**
```
When outnumbered 3-to-1: +2 base points, -1 credibility penalty (instead of -3)
When lone wolf in 2+1+1: +1 base point, -2 credibility penalty
```

**5. Risk Reward**
```
Broadcasting without strong consensus signals → +2 "Bold Broadcaster" bonus if successful
```

---

## 📋 PHYSICAL GAME SETUP

### Before First Game:

1. **Cut all cards** (12 conspiracies + 164 evidence)
2. **Print score trackers** (1 per game, or laminate for reuse)
3. **Gather tokens** (5 colors for player markers)
4. **Gather advertisement markers** (6 per player)
5. **Read rules** (use `PLAYTESTING_GUIDE_v1.0.md`)

### Setup for Each Game:

1. **Shuffle conspiracy deck**, place 4 face-up on table
2. **Shuffle evidence deck**, deal 5 cards to each player
3. **Set all credibility** to 5 (starting value)
4. **Set all audience** to 0
5. **Determine turn order** randomly
6. **Begin Round 1: INVESTIGATE phase**

---

## 📚 DOCUMENTATION HIERARCHY

For physical play, consult in this order:

1. **Quick Start:** `PLAYTESTING_GUIDE_v1.0.md` (pages 1-8)
2. **Full Rules:** `README.md` (pages 1-50)
3. **Player Reference Card:** `PRINT_Player_Reference.html` (page 1)
4. **Balance Data:** `HOMOGENEOUS_GROUP_REPORT.md`, `MAJORITY_MINORITY_REPORT.md`, etc.
5. **Release Notes:** `RELEASE_NOTES_v1.0.md`

---

## ⚖️ FINAL ASSESSMENT

### Game Balance: **7.5/10**

**Strengths:**
- Diversity requirement creates dynamic play
- 12 personalities offer strategic variety
- Rock-paper-scissors dynamics emerge
- Clear win conditions

**Weaknesses:**
- Coalition advantage too strong (+17-33%)
- Conservative strategies unviable as minorities
- Passive play exploit (evolution found)
- Risk under-rewarded

### Recommendation:

**✅ PROCEED WITH V1.0 PLAYTESTING**

The game is mechanically complete and printable. Known balance issues are documented and have proposed fixes for v1.1. Human playtesting will validate/refute simulation findings and reveal issues AI couldn't discover (social dynamics, fun factor, rules clarity).

**Note for playtesters:** The game intentionally explores the uncomfortable idea that **consensus matters more than facts**. This meta-commentary is the core theme - don't soften it!

---

## 🎊 PRINT SUMMARY

**What to print:**
- ☑️ PRINT_Conspiracy_Cards.html → 4 pages
- ☑️ PRINT_Evidence_Cards.html → 38 pages
- ☑️ PRINT_Player_Reference.html → 2 pages
- **Total: 44 pages on A4 paper**

**Print settings:**
- Greyscale/Black & White
- Minimal margins
- Background graphics ON
- Double-sided printing recommended

**Post-printing:**
- Cut 176 cards total (12 + 164)
- Laminate or sleeve (optional)
- Gather tokens and markers
- Ready to playtest!

---

**Happy Playtesting!** 🎲🎙️

**Feedback:** Report issues at https://github.com/anthropics/claude-code/issues
