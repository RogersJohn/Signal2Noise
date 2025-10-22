# Signal to Noise

A strategic deception game where truth is determined by consensus, not reality.

## 🎮 Overview

**Signal to Noise** is a multiplayer social deduction game where players compete to gain the largest audience by broadcasting claims about conspiracy theories. The twist? There is no objective truth - reality is determined by what the majority believes.

Players must:
- Secretly assign evidence to conspiracies
- Signal their intentions to influence others
- Broadcast claims to build their audience
- Form consensus with other players to score points
- Use psychological tactics, bluffing, and strategic bandwagoning

**Players**: 3-5
**Duration**: 6 rounds (~15-20 minutes)
**Victory**: Highest audience score wins

---

## 🎯 Quick Start

### Installation

```bash
cd signal-to-noise
npm install
```

### Run the Game

```bash
npm start
```

Opens at [http://localhost:3000](http://localhost:3000)

### Run Tests

```bash
npm test
```

### Build for Production

```bash
npm run build
```

---

## 📖 How to Play

### Game Flow

Each round consists of 5 phases:

```
┌─────────────┐
│ INVESTIGATE │  Players secretly assign evidence to conspiracies
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  ADVERTISE  │  Players signal which conspiracy interests them
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  BROADCAST  │  Players make public claims (REAL/FAKE/INCONCLUSIVE)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   RESOLVE   │  Consensus is checked, points are scored
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   CLEANUP   │  Revealed conspiracies replaced, next round begins
└─────────────┘
```

---

### Phase Breakdown

#### 🔍 Phase 1: INVESTIGATE (Blue)

**What Happens:**
- Each player receives evidence cards
- Players assign evidence face-down to conspiracies on the board
- **Evidence COUNT is visible** to all players (e.g., "Alice: 3 cards on Moon Landing")
- **Evidence CONTENT is hidden** - cards are face-down (could be strong, weak, or bluff!)
- After all players finish, everyone draws 2 new cards

**Strategy:**
- Assign specific evidence for higher bonuses (+3 points)
- Stack evidence on one conspiracy to **signal confidence** (or bluff!)
- Spread evidence thin to **hide your true target**
- Watch what others assign - lots of evidence = they might know something (or are bluffing!)

**Psychological Warfare:**
Other players can watch you assign evidence. Stacking 4 cards on a conspiracy signals "I know something!" - but are you bluffing?

**UI Indicator:** Blue border, "Assign evidence cards to conspiracies"

---

#### 📢 Phase 2: ADVERTISE (Purple)

**What Happens:**
1. Each player (in turn order) selects a conspiracy to signal interest in
2. Advertisements are PUBLIC and visible to all players
3. Players can also PASS to keep their intentions secret
4. **After all advertisements**, each player assigns ONE more evidence card to any conspiracy
5. This is NOT binding - players can broadcast differently later

**Penalty for Deception:**
- If you advertise conspiracy A but broadcast on conspiracy B: **-1 audience penalty**
- This discourages false signals but still allows strategic misdirection

**Strategy:**
- **Honest Signaling**: Advertise where you have evidence, coordinate consensus safely
- **Controlled Deception**: Advertise one conspiracy but broadcast another (-1 audience cost)
- **Bandwagoning**: Follow others' advertisements to form consensus
- **Secrecy**: Pass to keep plans hidden (no penalty)

**Bonus Evidence:**
- After seeing all advertisements, every player places ONE more evidence card
- Use this to strengthen your advertised conspiracy or pivot to a new strategy

**UI Indicator:** Purple border, "Signal which conspiracy interests you"

**Psychological Warfare:**
This phase is all about reading and influencing other players. Advertisements provide coordination signals, but deception carries a cost!

---

#### 📻 Phase 3: BROADCAST (Orange)

**What Happens:**
- Players see all advertisements from Phase 2
- Each player broadcasts a claim about a conspiracy (or passes)
- Three position options:
  - **REAL ✓** - Claim it's real
  - **FAKE ✗** - Claim it's fake
  - **INCONCLUSIVE ???** - Play it safe (2 points, no risk)

**Strategy:**
- **With Evidence**: Broadcast where you assigned evidence (3 base points)
- **Bandwagoning**: Broadcast without evidence to join consensus (1 base point)
- **Following Ads**: Use advertisements to predict where consensus will form
- **Bluffing**: Broadcast without evidence and hope for consensus
- **Safety**: Use INCONCLUSIVE for guaranteed 2 points

**UI Indicator:** Orange border, "Make your claim or pass"

**Important:** Wrong claims lose credibility (-3 if alone, -1 if minority)

---

#### ⚖️ Phase 4: RESOLVE (Green)

**What Happens:**
- System checks if consensus was reached (majority agreement on REAL or FAKE)
- If consensus: Everyone who broadcast scores points
- If no consensus: All broadcasts discarded, no scoring
- Credibility adjustments applied

**Consensus Thresholds:**
- **3 players**: 2 votes needed
- **4 players**: 2 votes needed
- **5 players**: 3 votes needed

**Scoring Formula:**
```
Base Points:
  - With Evidence: 3 points
  - Bandwagoning (no evidence): 1 point
  - INCONCLUSIVE: 2 points

+ Evidence Bonuses (per card):
  - Specificity: +3 (specific cards) or +1 (ALL cards)
  - Excitement Multiplier (applied to specificity):
    • ★★★ EXCITING: ×2.0 (doubles specificity bonus!)
    • ★☆☆ NEUTRAL: ×1.0 (no change)
    • ☆☆☆ BORING: ×0.5 (half value, rounds UP on odd numbers)
  - Novelty: +2 for first-time use of evidence

× Credibility Modifier:
  - High credibility (7+): ×1.5 to all points
  - Low credibility (≤3): ×0.75 to all points

= Total Audience Points
```

**Credibility Changes:**
- **Bluffing (no real evidence): ESCALATING PENALTY**
  - 1st bluff: -2 credibility
  - 2nd bluff: -3 credibility
  - 3rd bluff: -4 credibility
  - 4th+ bluff: -5 credibility (capped)
- Majority side: +1 credibility
- Minority side: -3 credibility
- INCONCLUSIVE: No change

**Strategic Impact:** First-time bluffs carry the same penalty as before, but serial bluffers face exponentially worse consequences!

**UI Indicator:** Green border, "Consensus reached!" or "No consensus"

**Key Insight:** The consensus position becomes reality - there is no objective truth!

---

#### 🧹 Phase 5: CLEANUP (Gray)

**What Happens:**
- Revealed conspiracies are replaced with new ones
- Evidence stays assigned (persistent across rounds)
- Scores displayed on scoreboard
- Game checks win conditions

**Win Conditions:**
1. First player to reach 60 audience points
2. 12 total conspiracies revealed
3. 6 rounds completed (most common)

**UI Indicator:** Gray border, "Click Next Round to continue"

**Strategic Note:** Card excitement affects scoring:
- **EXCITING cards (★★★)**: Double your specificity bonus - seek these out!
- **BORING cards (☆☆☆)**: Half your specificity bonus but rounds up (3→2 is still decent)
- **Novelty bonus**: First use of any card on a conspiracy gives +2 extra points

**Bluffing Strategy:**
- **Occasional bluffs** (-2 credibility) are manageable
- **Frequent bluffing** quickly escalates to -4 or -5 per bluff
- Serial bluffers will tank their credibility rapidly
- Use bluffs strategically, not habitually!

---

## 🎲 Physical Game Implementation Notes

For the physical version of Signal to Noise, you'll need:

**Tokens/Markers:**
- **Evidence Ownership Tokens**: Color-coded markers (one color per player) to place on evidence cards, showing which player has assigned that evidence to a conspiracy
- **Advertisement Markers**: Tokens to track which conspiracy each player advertised in the ADVERTISE phase
- **Audience/Credibility Trackers**: Dials or sliders to track each player's current audience (0-60+) and credibility (0-10)
- **Conspiracy Reveal Markers**: To mark which conspiracies have been revealed
- **Turn Order Marker**: To track which player is currently acting

**Physical Game Flow:**
1. Players draw evidence cards into their hands (secret)
2. During INVESTIGATE phase, players assign evidence cards face-down to conspiracies, placing their colored token on each assigned card
3. During ADVERTISE phase, players place advertisement tokens on conspiracies
4. After all advertisements are visible, players assign ONE more evidence card
5. During BROADCAST phase, players use broadcast tokens to indicate their position
6. During RESOLVE phase, all assigned evidence is revealed, tokens show ownership

**Why Tokens Matter:**
Evidence stays assigned across rounds, so tokens track:
- Which player owns which evidence on each conspiracy
- How many cards each player has assigned (visible count, not card details)
- Who advertised what (needed to check for -1 audience penalty)

---

## 🎴 Card Types

### Conspiracy Cards

Each conspiracy has:
- **Name**: e.g., "Moon Landing Was Faked"
- **Description**: Flavor text
- **Tier**: ★ (1), ★★ (2), or ★★★ (3) - affects scoring
- **Truth Value**: Hidden (only used in variant modes)

### Evidence Cards

Each evidence card has:
- **Name**: e.g., "Photo Inconsistencies"
- **Supported Conspiracies**: Specific IDs or "ALL"
- **Flavor Text**: Description
- **Excitement Level** (affects scoring multiplier):
  - ☆☆☆ **BORING** (×0.5): Half value on specificity bonus (rounds up on odd numbers: 3→2, 1→1)
  - ★☆☆ **NEUTRAL** (×1.0): Normal value, no modifier
  - ★★★ **EXCITING** (×2.0): **Doubles** specificity bonus (3→6, 1→2)

---

## 📊 Game Mechanics

### Core Principles

1. **Consensus Over Truth**: The majority position becomes reality
2. **Secret Information**: Evidence assignments are hidden until RESOLVE
3. **Psychological Warfare**: ADVERTISE phase creates mind games
4. **Risk vs Reward**: Bluffing can pay off but risks credibility
5. **Evidence Persistence**: Cards stay assigned across rounds

### Credibility System

- **Starting Credibility**: 5
- **Range**: 0-10
- **Effects**:
  - High (7+): +50% to all audience points
  - Low (≤3): -25% to all audience points
- **Changes**:
  - Majority in consensus: +1
  - Minority in consensus: -1
  - Broadcasting without consensus: -3 (if claim was wrong)
  - INCONCLUSIVE: No change (safe option)

### Bandwagoning

Broadcasting without assigned evidence:
- **Allowed**: Yes, you can always broadcast
- **Reward**: Only 1 base point (vs 3 with evidence)
- **Risk**: Same credibility penalties
- **Strategy**: Join consensus formed by others' advertisements

---

## 🧪 AI Personalities (Testing)

The game includes 12 AI personalities for testing:

1. **The Paranoid Skeptic**: Never broadcasts, plays defensively
2. **The Reckless Gambler**: Broadcasts aggressively every round
3. **The Calculated Strategist**: Only broadcasts with strong evidence
4. **The Truth Seeker**: Prefers "REAL" positions
5. **The Conspiracy Theorist**: Gravitates toward wild theories
6. **The Professional Analyst**: Evidence-focused, risk-averse
7. **The Opportunist**: Follows the crowd, bandwagons
8. **The Cautious Scholar**: Conservative, avoids risky plays
9. **The Chaos Agent**: Unpredictable, disruptive plays
10. **The Steady Builder**: Slow, methodical approach
11. **The Saboteur**: Tries to prevent consensus
12. **The Meta-Reader**: Analyzes other players' patterns

Use the AI simulation to test game balance:

```bash
npm test -- --testPathPattern=gameSimulation.test.ts
```

---

## 🎨 User Interface

### Phase Indicators

Each phase has a color-coded banner:
- 🔵 **INVESTIGATE**: Blue
- 🟣 **ADVERTISE**: Purple
- 🟠 **BROADCAST**: Orange
- 🟢 **RESOLVE**: Green
- ⚪ **CLEANUP**: Gray

### Tutorial Mode

Enable in-game tutorial for step-by-step guidance:
1. Click "📚 Enable Tutorial Mode" (bottom-right)
2. Tutorial updates automatically each phase
3. Shows 5-7 steps per phase with detailed explanations

See [TUTORIAL-MODE-README.md](TUTORIAL-MODE-README.md) for full documentation.

---

## 🔧 Development

### Project Structure

```
signal-to-noise/
├── src/
│   ├── components/          # React components
│   │   ├── ActionButtons.tsx      # Phase-specific action buttons
│   │   ├── AdvertiseQueue.tsx     # Shows player advertisements
│   │   ├── BroadcastQueue.tsx     # Shows player broadcasts
│   │   ├── ConspiracyBoard.tsx    # Main game board
│   │   ├── HelpPanel.tsx          # Context-sensitive help
│   │   ├── PhaseIndicator.tsx     # Phase banner
│   │   ├── PlayerHand.tsx         # Evidence card hand
│   │   ├── PlayerInfo.tsx         # Player stats display
│   │   ├── ResolveResults.tsx     # Scoring breakdown
│   │   └── TutorialMode.tsx       # Interactive tutorial
│   ├── data/
│   │   ├── conspiracies.ts        # Conspiracy card definitions
│   │   └── evidence.ts            # Evidence card definitions
│   ├── gameLogic.ts         # Core game mechanics
│   ├── gameSimulation.ts    # AI game simulation
│   ├── aiPersonalities.ts   # AI personality definitions
│   ├── types.ts             # TypeScript type definitions
│   └── App.tsx              # Main game component
├── tests/
│   ├── gameLogic.test.ts    # Unit tests for game logic
│   ├── aiPersonalities.test.ts   # AI behavior tests
│   └── gameSimulation.test.ts    # Integration tests
└── public/                  # Static assets
```

### Key Technologies

- **React** 18.3.1 - UI framework
- **TypeScript** 4.9.5 - Type safety
- **Jest** - Testing framework
- **React Testing Library** - Component testing

### Adding New Features

1. **New Phase**: Update `types.ts` Phase type, add handlers in `App.tsx`
2. **New Evidence**: Add to `src/data/evidence.ts`
3. **New Conspiracy**: Add to `src/data/conspiracies.ts`
4. **New AI Personality**: Add to `src/aiPersonalities.ts`

---

## 📈 Analytics

Generate game balance reports:

```bash
npm test -- --testPathPattern=gameSimulation.test.ts --watchAll=false
```

Creates:
- `ANALYTICS_REPORT.md` - Per-personality performance metrics
- `MONTE_CARLO_REPORT.md` - 500-game simulation statistics

Use these to identify:
- Overpowered strategies
- Underpowered personalities
- Game length issues
- Consensus rate problems

---

## 🎯 Strategy Tips

### For Beginners

1. **Start Conservative**: Use evidence-backed broadcasts
2. **Watch Advertisements**: See where others signal interest
3. **Join the Majority**: Bandwagon for easy consensus points
4. **Use INCONCLUSIVE**: When uncertain, take the safe 2 points
5. **Protect Credibility**: Avoid lone broadcasts

### For Advanced Players

1. **Deception**: Advertise one conspiracy, broadcast another
2. **Evidence Efficiency**: Reuse FOCUSED cards for bonuses
3. **Credibility Manipulation**: Ride majority to build credibility
4. **Trap Setting**: Advertise without evidence to mislead
5. **Meta-Gaming**: Track which players follow their advertisements

---

## 📚 Documentation

- **[TUTORIAL-MODE-README.md](TUTORIAL-MODE-README.md)** - Tutorial system documentation
- **[signal-to-noise/README.md](signal-to-noise/README.md)** - Detailed implementation docs
- **[ANALYTICS_REPORT.md](signal-to-noise/ANALYTICS_REPORT.md)** - AI performance metrics
- **[MONTE_CARLO_REPORT.md](signal-to-noise/MONTE_CARLO_REPORT.md)** - Game balance analysis

---

## 🐛 Known Issues

- Tutorial mode may overlap on small screens (<1280px)
- Evidence deck can run out in long games (reshuffle discard pile)
- SABOTEUR AI personality may prevent all consensus

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

---

**Built with React + TypeScript** | **Game Design: Consensus-Based Social Deduction**

**Current Version:** 2.0.0 (ADVERTISE Phase Update)
