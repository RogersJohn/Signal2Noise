# Signal to Noise — Playable UI Rebuild + Selenium Tests

## Context

The game engine, AI strategies, social simulation layer, and evolutionary tuning are all complete and working (136 tests passing). The game is ready for human playtesting — except the UI is unusable. It was built as scaffolding to prove the engine worked, not as something a person would sit with for 20 minutes.

The repo is at https://github.com/RogersJohn/Signal2Noise. The UI lives in `src/ui/`. The engine is at `src/engine/`. The AI social agents are at `src/ai/social/`. The e2e infrastructure (Selenium + Docker) is at `e2e/`.

**Do NOT modify any files in `src/engine/`, `src/ai/`, `src/data/`, or `src/logging/`.** This task only changes `src/ui/` and `e2e/`.

## Current Problems (all must be fixed)

1. **Signals auto-hide after 4 seconds.** In `App.tsx` line 151: `setTimeout(() => setShowSignals(false), 4000)`. Signals are the AI "table talk" — the player needs time to read them, cross-reference with evidence counts, and plan. They must persist until the player explicitly dismisses them or makes their broadcast.

2. **Resolve phase auto-fires after 800ms.** In `App.tsx` lines 188-198, RESOLVE dispatches automatically then immediately transitions to NEXT_ROUND. The player never gets to see who scored what, which conspiracies were resolved, or what happened. Resolve must wait for the player to click "Continue to next round."

3. **AI turns are invisible.** AIs commit and broadcast silently with 300-500ms delays. The player has no idea what happened. Each AI action should be narrated in the game UI: "The Hustler assigned 2 cards to Moon Landing", "The Diplomat broadcasts REAL on Chemtrails."

4. **Resolve phase shows raw conspiracy IDs** instead of names (`result.conspiracyId` instead of looking up the card name/icon).

5. **No visual feedback for committed evidence.** After committing cards, there's no summary of "You have 2 cards on Moon Landing (1 specific)." The player has to count colored dots.

6. **No card-to-conspiracy highlighting.** When selecting a card in hand, conspiracies it can support should visually highlight. Valid targets must be obvious.

7. **Broadcast phase doesn't show point projections.** When deciding where to broadcast, the player should see per-conspiracy: "You have 2 cards here (1 specific) → 4 pts if majority" or "No evidence here → 2 pts bandwagon."

8. **Game log is raw engine output.** Timestamps and action type names, not readable narrative. Needs human-friendly text.

## UI Architecture

Keep the existing architecture: components dispatch actions, no game logic in React. The `useGame.ts` hook needs significant changes to handle the new timing/flow, but it must still wrap `applyAction` from the engine.

### State Machine for Player Flow

The current code mixes UI state management with game state management through useEffect chains that fire timers. This is fragile. Replace it with an explicit UI state machine:

```typescript
type UIPhase =
  | 'COMMIT_PLAYER'        // Player is committing evidence
  | 'COMMIT_AI'            // AIs are committing (narrated, sequential)
  | 'SIGNALS'              // Signals displayed, player reads and dismisses
  | 'BROADCAST_WAITING'    // Waiting for earlier AI broadcasts
  | 'BROADCAST_PLAYER'     // Player's turn to broadcast
  | 'BROADCAST_AI'         // AI broadcasting (narrated)
  | 'RESOLVE_DISPLAY'      // Results displayed, player clicks Continue
  | 'GAME_OVER'            // Final scores
```

The engine's `Phase` (COMMIT, BROADCAST, RESOLVE, GAME_OVER) is the authoritative game state. The `UIPhase` is a local display state that controls what the player sees and can interact with. The UI phase advances independently of the engine phase — for example, after the engine transitions to BROADCAST, the UI first shows SIGNALS, then shows BROADCAST_WAITING / BROADCAST_PLAYER as AIs and the human take turns.

### File Changes

```
src/ui/
  App.tsx                 # Menu screen only (simplified)
  game/
    GameContainer.tsx     # NEW: Manages game lifecycle, AI agents, signal generation
    GameView.tsx          # REWRITE: Renders based on UIPhase, not engine Phase
    CommitPhase.tsx       # REWRITE: Card highlighting, evidence summary
    SignalDisplay.tsx      # NEW: AI signals with dismiss button
    BroadcastPhase.tsx    # REWRITE: Point projections, sequential visibility
    ResolveDisplay.tsx    # NEW (renamed from ResolvePhase): Player-controlled, shows results clearly
    GameOverScreen.tsx    # NEW: Extracted from GameView
    ConspiracyBoard.tsx   # REWRITE: Highlighting, evidence indicators
    PlayerHand.tsx        # REWRITE: Target highlighting when card selected
    Scoreboard.tsx        # MINOR: Add player colors, current player indicator
    GameLog.tsx           # REWRITE: Human-readable narration
    ActionNarration.tsx   # NEW: Shows what the current AI is doing with animation
  hooks/
    useGame.ts            # REWRITE: UI state machine, no auto-timers, explicit transitions
    useAIAgents.ts        # NEW: Extracted AI agent management from App.tsx
```

## Detailed Component Specs

### `useGame.ts` (REWRITE)

Remove all `setTimeout` chains. Replace with an explicit state machine.

```typescript
interface GameUIState {
  engineState: GameState;
  uiPhase: UIPhase;
  signals: Signal[];
  signalDisplays: string[];   // formatted flavor text
  aiNarration: string | null; // current AI action being shown
  selectedCardId: string | null;
  selectedConspiracyId: string | null;
}
```

**Key functions:**

- `advanceAI()`: Called by a "Continue" button or on a timer (1.5s between AI actions). Processes ONE AI action, updates narration, then pauses for the player to read it. Does NOT chain multiple AI actions in rapid succession.
- `dismissSignals()`: Player clicks to dismiss signal panel, advancing from SIGNALS to BROADCAST phase.
- `confirmResolve()`: Player clicks "Continue" on the resolve screen, advancing to next round.
- `dispatch(action)`: Wraps `applyAction` from engine.

**AI action timing:**

AI actions should advance automatically with a **1.5 second delay between each action**, but the player can click a "Speed Up" button to reduce this to 400ms, or a "Step" button to advance one action at a time. This gives the player control over pacing.

During AI turns, show a narration bar at the top of the screen:
```
🤖 The Hustler is committing evidence...
🤖 The Hustler assigned 2 cards to Moon Landing
🤖 The Diplomat is broadcasting...
🤖 The Diplomat broadcasts REAL on Chemtrails
```

### `CommitPhase.tsx` (REWRITE)

**When a card is selected in the hand:**
- Conspiracies that the card can support get a bright border/glow
- Conspiracies that the card CANNOT support get dimmed (opacity 0.3)
- The selected card itself gets a highlight border

**After assigning evidence:**
- Show a summary below the conspiracy board:
  ```
  Your committed evidence:
    Moon Landing: 2 cards (1 specific 🎯) → 4 pts if majority
    Chemtrails: 1 card (generic 📋) → 3 pts if majority
  ```
- Evidence dots on the conspiracy board use player colors (existing) but also show a tooltip or label: "You: 2, The Hustler: 1"

**DONE COMMITTING button:**
- Disabled while no action has been taken (greyed out "Nothing to commit — click to proceed anyway")
- Changes text to "✓ DONE — Proceed to signals" after the player has committed at least 1 card

### `SignalDisplay.tsx` (NEW)

Replaces the auto-hiding signal panel. Displays between COMMIT and BROADCAST.

```
╔══════════════════════════════════════════════════╗
║  📡 THE TABLE IS TALKING                        ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  The Hustler:                                    ║
║  "I've been poking around Moon Landing.          ║
║   Could be something big."                       ║
║  📊 Committed: 2 cards to Moon Landing           ║
║                                                  ║
║  The Diplomat:                                   ║
║  "Can we come together on Chemtrails?            ║
║   I have evidence to share."                     ║
║  📊 Committed: 1 card to Chemtrails              ║
║                                                  ║
║  The Paranoid:                                   ║
║  "I don't trust any of you.                      ║
║   I'm keeping my plans to myself."               ║
║  📊 Committed: 0 cards                           ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║  [Read their signals. Check the evidence counts. ║
║   Who's telling the truth?]                      ║
║                                                  ║
║         [ 👀 I've Seen Enough — Broadcast → ]    ║
╚══════════════════════════════════════════════════╝
```

Key features:
- Each signal shows the AI's flavor text AND their visible evidence counts (so the player can cross-reference)
- A "hint" line at the bottom reminds the player what to look for
- A dismiss button that transitions to the BROADCAST phase
- Does NOT auto-hide

### `BroadcastPhase.tsx` (REWRITE)

**When it's NOT the player's turn** (AI is broadcasting):
- Show the narration bar: "The Hustler is deciding..."
- After the AI broadcasts, show it on the conspiracy board immediately
- Brief pause (1.5s), then advance to next player

**When it IS the player's turn:**
- Show all previous broadcasts clearly on each conspiracy card
- Show point projections for each conspiracy:
  ```
  Moon Landing: You have 2 cards (1 specific)
    REAL → ~4 pts (2 others voted REAL, consensus likely)
    FAKE → ~0 pts (you'd be minority)
  
  Chemtrails: No evidence
    REAL → ~2 pts bandwagon (1 other voted REAL, needs 1 more)
    FAKE → ~0 pts (no consensus)
  
  [PASS → draw 1 card]
  ```
- The point projections are estimates based on visible broadcasts. They show "~" because consensus isn't guaranteed (more players might still broadcast).
- PASS button clearly states the tradeoff: "PASS — Score 0, draw 1 card for next round"

### `ResolveDisplay.tsx` (NEW)

Replaces auto-firing resolve. The player clicks "Continue" to advance.

```
⚖️ ROUND 3 RESULTS

✅ Moon Landing — CONSENSUS: REAL (3 votes)
  The Hustler:   +4 pts (evidence + specific)     cred +1
  You:           +3 pts (evidence)                 cred +1  
  The Paranoid:  +2 pts (bandwagon)                cred +1
  The Diplomat:   0 pts (minority)                 cred -1
  → Moon Landing resolved. Replaced with Bigfoot Sighting.

❌ Chemtrails — NO CONSENSUS (1 REAL, 1 FAKE)
  No points scored. Evidence wasted.

Updated scores: You: 12 | The Hustler: 14 | The Diplomat: 8 | The Paranoid: 10

              [ Continue to Round 4 → ]
```

Key features:
- Shows conspiracy name and icon, not raw ID
- Per-player breakdown: points with reason (evidence/bandwagon/specific), credibility change
- Replaced conspiracy is named
- Updated scoreboard at bottom
- "Continue" button — does NOT auto-advance

### `ConspiracyBoard.tsx` (REWRITE)

Each conspiracy card shows:
- Icon + Name (large)
- Description (small, 1 line truncated with hover tooltip for full text)
- Evidence indicators: per-player colored badges with counts
  - "You: 2 (1🎯)" / "Hustler: 1" / "Diplomat: 0"
- Broadcast indicators (during/after broadcast phase):
  - "Hustler: REAL ✓" / "Diplomat: FAKE ✗" in colored badges
- When `interactive` and a card is selected: highlight valid targets with a green border + "click to assign" label, dim invalid targets

### `PlayerHand.tsx` (REWRITE)

Cards display:
- Name (bold)
- Type badge: "🎯 SPECIFIC" in amber or "📋 GENERIC" in gray
- Target list: "Supports: Moon Landing, Chemtrails" or "Supports: ALL"
- Flavor text (italic, small)

When a card is selected:
- The card itself gets a green border + slight scale-up
- All other cards dim slightly
- The conspiracy board highlights valid targets (coordinated via parent component state)

When hand is empty:
- Show message: "Hand empty — draw cards at end of round"

### `GameLog.tsx` (REWRITE)

The log should read like a game narrative, not like debug output. Convert engine log entries to human-readable text:

```
Round 2 — Commit Phase
  You assigned "Shadow Angle Analysis" to Moon Landing
  The Hustler committed 2 cards to Moon Landing
  The Diplomat committed 1 card to Chemtrails
  The Paranoid committed nothing

Round 2 — Broadcast Phase  
  The Hustler broadcasts REAL on Moon Landing (first mover)
  The Diplomat broadcasts FAKE on Chemtrails
  You broadcast REAL on Moon Landing
  The Paranoid passes (drew 1 card)

Round 2 — Resolve
  Moon Landing: CONSENSUS REAL — Hustler +4, You +3
  Chemtrails: No consensus
```

Scrolls to bottom automatically. Round boundaries are visually separated.

### `ActionNarration.tsx` (NEW)

A sticky bar at the top of the game area during AI turns:

```
┌──────────────────────────────────────────────┐
│ 🤖 The Hustler assigned 2 cards to Moon Landing │
│                                    [Speed ▶▶] │
└──────────────────────────────────────────────┘
```

- Shows during COMMIT_AI and BROADCAST_AI phases
- Updates per AI action
- "Speed" button toggles between 1.5s/0.4s delay
- Fades out when player's turn begins

### `GameOverScreen.tsx` (NEW)

Extracted from GameView. Shows:
- Final ranking with medals (🏆🥈🥉)
- Score + credibility for each player
- Personality reveal: "The Hustler was using Aggressive base strategy with selective deception"
- Key game stats: total consensus events, biggest scoring round, closest round
- "Play Again" button (returns to menu)

## Selenium E2E Tests

### Test Infrastructure

The existing `e2e/` setup (Docker, Selenium, helpers, selectors) is reusable. Update `e2e/utils/selectors.ts` with new XPath selectors for the rebuilt UI. Add new test files.

### Running Tests

The tests must be runnable via:
```bash
cd e2e
docker-compose up --build -d
# wait for app to be ready
npx jest --config jest.e2e.config.js --runInBand
docker-compose down
```

Create `e2e/jest.e2e.config.js`:
```javascript
module.exports = {
  testMatch: ['**/e2e/tests/**/*.test.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  testTimeout: 120000,
};
```

Create `e2e/run-tests.sh`:
```bash
#!/bin/bash
set -e
echo "Starting containers..."
docker-compose up --build -d
echo "Waiting for app..."
sleep 10
# Health check
for i in {1..30}; do
  if curl -s http://localhost:3000 > /dev/null; then
    echo "App is ready"
    break
  fi
  sleep 2
done
echo "Running tests..."
npx jest --config jest.e2e.config.js --runInBand 2>&1 | tee test-output.log
EXIT_CODE=${PIPESTATUS[0]}
echo "Saving screenshots..."
mkdir -p test-results
cp -r e2e/screenshots test-results/ 2>/dev/null || true
echo "Stopping containers..."
docker-compose down
exit $EXIT_CODE
```

### New Test Files

**`e2e/tests/signal-display.test.ts`**
- Start game → commit nothing → done → signals appear
- Signals show personality names and flavor text
- Signals show evidence count summaries
- Signals persist until player clicks dismiss button
- Dismiss button advances to broadcast phase
- Screenshot of signal panel for visual verification

**`e2e/tests/commit-interaction.test.ts`**
- Select a card → valid conspiracies highlight (have visible border change)
- Select a card → invalid conspiracies dim
- Assign card → card removed from hand, evidence count updates on conspiracy
- Assign card → committed evidence summary appears
- Done committing → AI commit phase narration appears
- Screenshot at each stage

**`e2e/tests/broadcast-interaction.test.ts`**
- AI broadcast narration appears during AI turns
- Broadcast entries appear on conspiracy cards as AIs broadcast
- When player's turn: point projections visible per conspiracy
- Player can click REAL/FAKE on a conspiracy → broadcast registers
- Player can click PASS → hand size increases by 1
- Screenshot of broadcast phase with projections

**`e2e/tests/resolve-display.test.ts`**
- Resolve screen shows conspiracy names (not IDs)
- Resolve screen shows per-player point breakdowns
- "Continue" button is present and clickable
- Clicking Continue advances to next round
- Resolve does NOT auto-advance (verify by waiting 10s and checking phase hasn't changed)
- Screenshot of resolve results

**`e2e/tests/full-game-playable.test.ts`**
- Start game → play through all 6 rounds as human, making real decisions
  - Round 1: Commit 2 cards, read signals, broadcast REAL on a conspiracy with evidence
  - Round 2: Commit nothing, read signals, bandwagon on forming consensus
  - Round 3: Commit 1 specific card, broadcast where it supports
  - Rounds 4-6: PASS on broadcast, draw cards
- Verify game reaches GAME_OVER
- Verify final score > 0 (player scored at least once)
- Verify game over screen shows rankings
- Screenshot at key moments: after commit, signal display, broadcast decision, resolve results, game over

**`e2e/tests/ai-narration.test.ts`**
- AI narration bar appears during AI commit phase
- Narration text changes as different AIs act
- Narration bar appears during AI broadcast phase
- Speed button toggles narration speed
- Narration bar disappears when player's turn begins

### Updated Selectors (`e2e/utils/selectors.ts`)

Add selectors for all new UI elements. Use `data-testid` attributes on key elements to make selectors robust:

```typescript
// Add data-testid attributes to components:
// <div data-testid="signal-panel"> ... </div>
// <button data-testid="dismiss-signals"> ... </button>
// <div data-testid="evidence-summary"> ... </div>
// <div data-testid="point-projection-{conspiracyId}"> ... </div>
// <button data-testid="continue-resolve"> ... </button>
// <div data-testid="ai-narration"> ... </div>
// <button data-testid="speed-toggle"> ... </button>
// <div data-testid="conspiracy-card-{id}"> ... </div>
// <button data-testid="hand-card-{id}"> ... </button>
// <button data-testid="broadcast-real-{conspiracyId}"> ... </button>
// <button data-testid="broadcast-fake-{conspiracyId}"> ... </button>
// <button data-testid="broadcast-pass"> ... </button>
// <button data-testid="done-committing"> ... </button>

export const Signals = {
  panel: "[data-testid='signal-panel']",
  dismissButton: "[data-testid='dismiss-signals']",
  signalEntry: "[data-testid^='signal-entry-']",
  evidenceSummary: "[data-testid='evidence-summary']",
};

export const Narration = {
  bar: "[data-testid='ai-narration']",
  speedToggle: "[data-testid='speed-toggle']",
};

export const Resolve = {
  container: "[data-testid='resolve-display']",
  continueButton: "[data-testid='continue-resolve']",
  conspiracyResult: "[data-testid^='result-']",
  playerScore: "[data-testid^='player-score-']",
};

// etc.
```

Use CSS selectors (`By.css`) instead of XPath for new selectors — they're faster and more readable. Keep XPath selectors for backward compatibility with existing tests.

## Visual Design Guidelines

Keep the dark terminal/hacker aesthetic (it fits the conspiracy theme). Specific rules:

- **Background:** `#0a0a0a` (near-black)
- **Text:** `#ccc` default, `#fff` for emphasis
- **Green:** `#0f0` for positive actions, player highlights, consensus
- **Red:** `#f44` for negative outcomes, minority, warnings
- **Amber:** `#fa0` for scores, points, neutral highlights
- **Blue:** `#0af` for informational text, broadcast phase
- **Font:** monospace everywhere (keep the terminal feel)
- **Borders:** `#333` default, colored borders for interactive states
- **Cards:** `#1a1a2e` background, `#333` border, `#1a2a1a` when selected (green tint)
- **Transitions:** subtle (0.2s) on hover/selection, no jarring animations

## Execution Order

1. Create `e2e/jest.e2e.config.js` and `e2e/run-tests.sh`
2. Rewrite `src/ui/hooks/useGame.ts` with UIPhase state machine
3. Create `src/ui/hooks/useAIAgents.ts` (extract agent management)
4. Rewrite `src/ui/game/ConspiracyBoard.tsx` with highlighting and evidence labels
5. Rewrite `src/ui/game/PlayerHand.tsx` with target highlighting
6. Rewrite `src/ui/game/CommitPhase.tsx` with evidence summary
7. Create `src/ui/game/SignalDisplay.tsx`
8. Rewrite `src/ui/game/BroadcastPhase.tsx` with point projections
9. Create `src/ui/game/ResolveDisplay.tsx` with manual Continue
10. Create `src/ui/game/GameOverScreen.tsx`
11. Create `src/ui/game/ActionNarration.tsx`
12. Rewrite `src/ui/game/GameLog.tsx` with narrative formatting
13. Rewrite `src/ui/game/GameView.tsx` to use UIPhase
14. Rewrite `src/ui/game/GameContainer.tsx` (extract from App.tsx)
15. Simplify `src/ui/App.tsx` to menu only
16. Update `e2e/utils/selectors.ts` with new data-testid selectors
17. Write all new e2e test files
18. Build Docker image: `cd e2e && docker-compose up --build -d`
19. Run tests: verify all pass
20. If tests fail: screenshot will show what's wrong. Fix and re-run.
21. Take screenshots of each phase for visual verification
22. Commit: "Rebuild UI for playable playtesting experience"

## Critical: Test-Driven Debugging Cycle

When running Selenium tests, failures will be common on first pass because selectors won't match the rendered HTML exactly. The workflow is:

1. Run `bash e2e/run-tests.sh`
2. Tests fail — check `e2e/screenshots/` for what the page actually looks like
3. Compare screenshots to expected layout
4. Fix either the component (if it renders wrong) or the selector (if the test targets the wrong element)
5. Re-run — `docker-compose up --build -d` rebuilds the app, then re-run jest
6. Repeat until green

**Every test must call `takeScreenshot()` at its key assertion point**, not just on failure. This creates a visual record of what the UI looks like at each stage, which is invaluable for debugging both the tests and the UI.

## What NOT to Do

- Do NOT modify engine files (`src/engine/`)
- Do NOT modify AI files (`src/ai/`)
- Do NOT add game logic to React components — components dispatch actions and render state
- Do NOT use CSS-in-JS libraries, styled-components, or Tailwind — keep inline styles for consistency with existing code
- Do NOT add animations longer than 0.3s — the game should feel responsive
- Do NOT hide information the player needs — if the AI did something, show it
- Do NOT auto-advance past important information — the player controls pacing
- Do NOT break the existing 136 unit tests

## Quality Standards

- All 136 existing unit tests must pass
- All new Selenium tests must pass in Docker
- Every interactive element has a `data-testid` attribute
- Every file under 250 lines
- No `any` types
- Screenshots captured at every test stage
- The game must be playable from start to finish by a human — not just theoretically functional, but actually usable with clear feedback at every step
