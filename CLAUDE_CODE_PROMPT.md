# Signal to Noise v2.0 — Claude Code Prompt

## Context

You are rebuilding "Signal to Noise", a social deduction card game. The repo is at https://github.com/RogersJohn/Signal2Noise. The existing codebase (v1) has been reviewed and found to have fundamental design problems: overcomplex scoring (12+ interacting subsystems), duplicated game logic across 3+ components, a scoring formula nobody can compute mentally, and contradictory design (claims "consensus is truth" but has objective truth layer). However, the theme, flavor text, conspiracy card data, and core concept are strong.

v2 is a ground-up rebuild preserving the theme and the novel core mechanic: secret evidence commitment + sequential public broadcast + consensus-as-truth scoring.

## Phase 0: Archive v1

Before any new code, archive the existing codebase:

```
# Create archive branch
git checkout -b archive/v1-complete
git push origin archive/v1-complete

# Back on main, move everything into v1-archive/
git checkout main
mkdir v1-archive
git mv signal-to-noise/ v1-archive/
git mv *.md v1-archive/ (all root markdown except the new README)
git mv *.html v1-archive/
git mv *.jpg v1-archive/
git mv *.txt v1-archive/
git mv archive/ v1-archive/
git mv archives/ v1-archive/
git commit -m "Archive v1 codebase — see v1-archive/ for original implementation"
```

Do NOT delete v1 files. Move them all into `v1-archive/`. The git history is preserved on the archive branch.

## Phase 1: Game Engine (pure logic, zero UI)

### Design Decisions (validated by simulation — do not change without re-simulating)

These parameters produced the following validated results across 4,500 simulated games:
- Overall consensus rate: 45.4% (target: 40-60%) ✓
- Overall close game rate: 78.2% ✓
- No single dominant strategy in mixed play ✓
- Bandwagoning viable but not dominant (6-7% of points) ✓

**Game parameters:**
- Players: 3-5 (4 is the default/primary balance target)
- Rounds: 6
- Active conspiracies on board: 5
- Starting hand: 5 evidence cards
- Draw per round: 2 cards
- Max hand size: 7
- Consensus threshold: `Math.ceil(playerCount / 2)` — i.e. 2 for 3-4 players, 3 for 5 players
- Turn order: lowest score goes first each round (catch-up mechanic)

**Three phases per round:**
1. **COMMIT** — Each player secretly assigns evidence cards from hand to conspiracies. Other players see HOW MANY cards each player assigned to each conspiracy, but NOT which cards. Players may assign 0 or more cards. Players act in turn order.
2. **BROADCAST** — Players broadcast SEQUENTIALLY in turn order. Each player either: (a) picks a conspiracy and declares REAL or FAKE, or (b) passes. Each broadcast is immediately visible to subsequent players. This is the core mechanic — later players can react to earlier broadcasts.
3. **RESOLVE** — For each conspiracy that was broadcast on, check if consensus was reached (threshold met for REAL or FAKE). Score points, adjust credibility, replace resolved conspiracies.

**Scoring (must be computable in your head):**
- Majority side with evidence: **3 points**
- Majority side with specific evidence (card names the conspiracy): **+1 bonus** (4 total)
- Majority side without evidence (bandwagon): **2 points**
- Consensus size bonus: **+1 per player on majority beyond threshold** (rewards building big consensus)
- First mover bonus: **+1 for being the first player to broadcast on a conspiracy that reaches consensus**
- Minority side: **0 points**
- No consensus: **0 points for everyone on that conspiracy**
- Pass: **0 points**

**Credibility:**
- Majority side: +1 credibility
- Minority side: -1 credibility
- Range: 0-10, starts at 5
- Credibility is ONLY a tiebreaker at end of game. It does NOT multiply scoring. (The v1 credibility multiplier created runaway leader problems.)

**Evidence cards (~48 total):**
- ~12 Generic cards: support ALL conspiracies, `specific: false`
- ~36 Specific cards: 3 per conspiracy, `specific: true`
- Each card has: id, name, targets (array of conspiracy IDs or ["ALL"]), specific (boolean)
- NO excitement, NO proof value, NO tier, NO novelty tracking

**Conspiracy cards (12 total, 5 active):**
- Preserve the existing 12 conspiracies with their names, descriptions, and icons from v1 `src/data/conspiracies.ts`
- Remove: tier, truthValue. Keep: id, name, description, icon
- When a conspiracy reaches consensus, it is resolved and replaced from the deck

**Win condition:**
- After 6 rounds, highest score wins. Tiebreaker: highest credibility.

### Architecture

```
src/
  engine/
    types.ts              # All game types
    engine.ts             # Pure function: (GameState, Action) => GameState
    scoring.ts            # Scoring logic (isolated, testable)
    consensus.ts          # Consensus detection
    deck.ts               # Card/deck utilities (shuffle, draw, canSupport)
  engine/__tests__/
    engine.test.ts        # Exhaustive state transition tests
    scoring.test.ts       # Every scoring scenario
    consensus.test.ts     # Consensus edge cases
```

The engine MUST be a pure reducer: `function applyAction(state: GameState, action: GameAction): GameState`. No side effects, no randomness in the reducer itself (randomness is injected via shuffle at game creation). Every action is a typed discriminated union:

```typescript
type GameAction =
  | { type: 'ASSIGN_EVIDENCE'; playerId: string; cardId: string; conspiracyId: string }
  | { type: 'DONE_COMMITTING'; playerId: string }
  | { type: 'BROADCAST'; playerId: string; conspiracyId: string; position: 'REAL' | 'FAKE' }
  | { type: 'PASS'; playerId: string }
  | { type: 'RESOLVE' }
  | { type: 'NEXT_ROUND' };
```

### Tests for the engine (Phase 1 must have 100% branch coverage on engine/)

Test categories:
- **State transitions**: every action from every phase, including invalid actions (assigning during broadcast, broadcasting during commit, etc.)
- **Scoring scenarios**: evidence+majority, evidence+minority, bandwagon+majority, bandwagon+minority, pass, no consensus, specific bonus, first mover bonus, consensus size bonus, credibility changes
- **Edge cases**: empty hand, 0 cards committed, all players pass, 5 players needing 3 for consensus, conspiracy deck runs out, last round resolution, tiebreaker logic
- **Determinism**: same initial state + same action sequence = same result

## Phase 2: AI Players (testing harness)

```
src/
  ai/
    strategies.ts         # Strategy interface + implementations
    simulation.ts         # Run N games, collect stats
    analysis.ts           # Statistical analysis and reporting
  ai/__tests__/
    simulation.test.ts    # Validates game dynamics metrics
```

**Strategy interface:**
```typescript
interface AIStrategy {
  name: string;
  decideCommit(state: GameState, playerId: string): AssignAction[];
  decideBroadcast(state: GameState, playerId: string): BroadcastAction | PassAction;
}
```

**Implement these 5 strategies (from validated simulation):**
1. **Evidence-Only**: focused commit, only broadcasts with evidence, never bandwagons
2. **Aggressive**: spread commit, broadcasts frequently, occasionally bandwagons
3. **Follower**: light commit, heavily uses sequential info, bandwagons onto near-consensus
4. **Cautious**: focused commit, only broadcasts with 2+ evidence, passes more often
5. **Opportunist**: spread commit, uses sequential info, bandwagons when consensus is forming

**Simulation tests must validate these thresholds (±5% tolerance):**
- Mixed 4-player consensus rate: 45-60%
- Mixed 4-player close game rate (top 2 within 2pts): >65%
- No single strategy wins >50% in mixed 4-player matchup
- Bandwagon points: 5-15% of total points in mixed play

**Data gathering:**
The simulation must output structured JSON with per-game and aggregate stats:
```json
{
  "config": { "games": 500, "matchup": [...] },
  "aggregate": {
    "consensusRate": 0.48,
    "closeGameRate": 0.76,
    "winRateByStrategy": { ... },
    "avgScoreByStrategy": { ... },
    "pointSourceBreakdown": { "evidence": 0.75, "bandwagon": 0.07, "firstMover": 0.11, "consensusBonus": 0.07 },
    "broadcastReasons": { ... }
  },
  "games": [ /* per-game detail */ ]
}
```

Simulation output goes to `data/simulation-results/` with timestamped filenames.

## Phase 3: React UI (solo vs AI)

```
src/
  ui/
    App.tsx               # Main app shell, mode selection
    game/
      GameView.tsx        # Renders current game state
      CommitPhase.tsx     # Card selection + conspiracy assignment
      BroadcastPhase.tsx  # Sequential broadcast interface
      ResolvePhase.tsx    # Results display
      Scoreboard.tsx      # Score tracker
      ConspiracyBoard.tsx # The 5 active conspiracies
      PlayerHand.tsx      # Evidence card display
      GameLog.tsx         # Scrollable event log
    hooks/
      useGame.ts          # React wrapper around engine reducer
```

**Critical UI requirement:** The UI calls `applyAction()` from the engine. There is ZERO game logic in React components. The `useGame` hook wraps the engine in `useReducer` and handles AI turns via `useEffect`.

**Design principles:**
- Dark theme (keep the existing aesthetic — it works)
- Monospace/terminal feel for the conspiracy investigation theme
- Cards must show: name, whether specific or generic, which conspiracies they support
- Conspiracy board must show: name, icon, description, evidence count per player (colored dots)
- Sequential broadcast must clearly show: who has already broadcast, what they chose, who's next
- Log must capture all actions with timestamps

**Hot-seat mode (stretch):** Allow multiple human players by showing a "pass the device" screen between turns that hides the previous player's hand.

## Phase 4: Print-and-Play

```
print/
  generate.js             # Node script that generates print HTML
  conspiracy-cards.html   # 12 conspiracy cards, 6 per A4 page
  evidence-cards.html     # ~48 evidence cards, 9 per A4 page
  reference-card.html     # 1 page: full rules reference
  rules.html              # 4-page A4 rulebook (see below)
```

**Rules document (MUST be ≤4 pages A4, target 3):**

Page 1: Overview + Setup
- What the game is (2 sentences)
- Components list
- Setup instructions
- Turn order rule

Page 2: How to Play
- COMMIT phase rules
- BROADCAST phase rules (emphasize: sequential, visible)
- RESOLVE phase rules

Page 3: Scoring + Credibility
- Scoring table (simple, 6 rows max)
- Credibility rules (2 sentences)
- Win condition
- Strategy tips (5 bullet points)

Page 4 (if needed): Card reference / FAQ

**Print specs:**
- Cards: 63mm × 88mm (standard poker size)
- Conspiracy cards: full color, name + icon + description + space for evidence tokens
- Evidence cards: name + target conspiracies listed + generic/specific indicator
- Print on standard A4/Letter paper, cut lines included
- Black and white must be legible (don't rely on color alone for information)

**The print files must use the original v1 flavor text.** That writing is the strongest creative asset in the project. Port it directly.

## Phase 5: Selenium E2E Tests

```
e2e/
  docker-compose.yml      # Chrome + Selenium + app container
  Dockerfile              # Node app + Chrome headless
  tests/
    game-flow.test.ts     # Full game from start to finish
    commit-phase.test.ts  # Evidence assignment interactions
    broadcast-phase.test.ts # Sequential broadcast UI
    resolve-phase.test.ts # Scoring display verification
    edge-cases.test.ts    # Empty hand, all pass, etc.
  utils/
    selectors.ts          # Page object model
    helpers.ts            # Wait utilities, screenshot on failure
```

**Docker setup:**
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
  selenium:
    image: selenium/standalone-chrome:latest
    ports: ["4444:4444"]
    depends_on: [app]
```

**E2E tests must cover:**
1. Start game → complete 6 rounds → see winner screen
2. Assign evidence → verify count visible on conspiracy board
3. Broadcast sequentially → verify each broadcast appears before next player acts
4. Verify scoring matches engine calculation exactly
5. Verify resolved conspiracies get replaced
6. Screenshot on every failure (saved to `e2e/screenshots/`)

## Phase 6: Logging & Observability

```
src/
  logging/
    logger.ts             # Structured logging
    gameRecorder.ts       # Records complete game transcript
```

**Every game action must be logged with:**
- Timestamp
- Round number
- Phase
- Player ID
- Action type
- Action details (card, conspiracy, position)
- State snapshot after action (scores, hand sizes, evidence counts)

**Game recorder** captures a full transcript that can be replayed:
```typescript
interface GameTranscript {
  id: string;
  timestamp: string;
  config: { playerCount: number; strategies: string[] };
  actions: Array<{ timestamp: number; action: GameAction; stateAfter: GameStateSummary }>;
  result: { winner: string; finalScores: Record<string, number> };
}
```

Transcripts are stored as JSON in `data/transcripts/`. The simulation harness automatically saves transcripts for interesting games (closest finishes, highest scores, unusual outcomes).

## Project Structure (final)

```
Signal2Noise/
├── v1-archive/                    # Everything from v1, untouched
├── src/
│   ├── engine/                    # Pure game logic (zero dependencies)
│   │   ├── types.ts
│   │   ├── engine.ts
│   │   ├── scoring.ts
│   │   ├── consensus.ts
│   │   ├── deck.ts
│   │   └── __tests__/
│   ├── ai/                        # AI strategies + simulation
│   │   ├── strategies.ts
│   │   ├── simulation.ts
│   │   ├── analysis.ts
│   │   └── __tests__/
│   ├── ui/                        # React components (no game logic)
│   │   ├── App.tsx
│   │   ├── game/
│   │   └── hooks/
│   ├── logging/
│   │   ├── logger.ts
│   │   └── gameRecorder.ts
│   └── data/
│       ├── conspiracies.ts        # 12 conspiracy cards (ported from v1)
│       └── evidence.ts            # ~48 evidence cards (simplified from v1)
├── print/                         # Print-and-play generation
│   ├── generate.js
│   └── *.html
├── e2e/                           # Selenium tests
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── tests/
├── data/                          # Generated data (gitignored except examples)
│   ├── simulation-results/
│   └── transcripts/
├── README.md                      # New v2 README
├── RULES.md                       # The ≤4 page rules document (markdown source)
├── package.json
├── tsconfig.json
└── .gitignore
```

## Execution Order

**Do these in this exact order. Do not skip ahead.**

1. Archive v1 (Phase 0)
2. Set up project skeleton: package.json, tsconfig, .gitignore, directory structure
3. Implement `src/engine/types.ts` — all type definitions
4. Implement `src/engine/deck.ts` + tests — shuffle, draw, canSupport
5. Implement `src/engine/consensus.ts` + tests — consensus detection
6. Implement `src/engine/scoring.ts` + tests — all scoring scenarios
7. Implement `src/engine/engine.ts` + tests — the full reducer with 100% branch coverage
8. Implement `src/data/conspiracies.ts` — port 12 conspiracies from v1 (keep flavor text, drop tier/truthValue)
9. Implement `src/data/evidence.ts` — 48 cards (12 generic + 36 specific), simplified from v1
10. Implement `src/ai/strategies.ts` — 5 AI strategies
11. Implement `src/ai/simulation.ts` + `analysis.ts` — run simulations, output JSON
12. Run simulations and verify metrics match targets. If they don't, adjust AI behavior (NOT game rules) until they do.
13. Implement `src/ui/` — React app, solo vs AI mode
14. Implement `print/` — print-and-play HTML generation
15. Write `RULES.md` — ≤4 pages A4
16. Set up `e2e/` — Docker + Selenium tests
17. Write `README.md` — new v2 readme
18. Final commit, push

## What NOT to Build

- No evolutionary AI / genetic algorithms
- No "Truth Matters" variant mode
- No excitement/novelty/tier subsystems
- No credibility multiplier on scoring
- No ADVERTISE as a separate phase (sequential broadcast replaces it)
- No LATE_EVIDENCE phase
- No multiple broadcasts per player per round (one broadcast or pass, that's it)
- No proof values (REAL/FAKE/BLUFF) on evidence cards
- No bankruptcy/elimination mechanic
- No hand size above 7 (v1 had 10, too many cards to manage physically)

## Quality Standards

- TypeScript strict mode
- No `any` types
- ESLint + Prettier
- Engine tests: 100% branch coverage
- AI simulation tests: statistical validation with tolerance bands
- E2E tests: full game flow + screenshot on failure
- Every file under 300 lines (split if longer)
- No game logic in React components — components render state and dispatch actions, nothing else
