# Signal to Noise — Bug Fixes + Advanced Social AI Prompt

## Context

The Signal to Noise v2 game engine and social simulation layer are complete and all 120 tests pass. The repo is at https://github.com/RogersJohn/Signal2Noise. This task does three things:

1. Fixes three known bugs in the social simulation layer
2. Creates advanced AI agents that use the social layer for the solo-vs-AI gameplay mode
3. Re-runs simulations to validate the changes and answer the key design question

## Part 1: Bug Fixes

### Bug 1: Social simulation doesn't track consensus or point sources

**File:** `src/ai/socialSimulation.ts`

**Problem:** Lines 170-172 hardcode `consensusCount: 0` and `pointSources: { evidence: 0, bandwagon: 0, firstMover: 0, consensusBonus: 0 }`. The social game loop resolves rounds via `applyAction(state, { type: 'RESOLVE' })` which populates `state.roundResults`, but never reads those results to populate the `GameResult` fields.

**Fix:** After each RESOLVE action, iterate `state.roundResults` and accumulate:
- `consensusCount`: count results where `result.consensusReached === true`
- `pointSources.evidence`: sum of `result.playerResults` where `pr.onMajority && pr.hasEvidence` → add 3 (+ 1 if `pr.hasSpecificEvidence`)
- `pointSources.bandwagon`: sum where `pr.onMajority && !pr.hasEvidence` → add 2
- `pointSources.firstMover`: count where `pr.onMajority && pr.isFirstMover` (note: currently 0 points due to nerf, but track anyway for analysis)
- `pointSources.consensusBonus`: for each result, `Math.max(0, result.majorityCount - result.threshold)` multiplied by number of majority players

Also track `totalBroadcasted` by counting non-PASS actions in the broadcast phase.

### Bug 2: Betrayal rate metric is wrong

**File:** `src/ai/socialSimulation.ts`

**Problem:** Line 234 computes `avgBetrayalRate` as:
```typescript
games.reduce((s, g) => s + g.socialMetrics.betrayalCount, 0) / (games.length * 6 * config.socialMatchup.length)
```
This divides total betrayals by `games * rounds * players`, but a betrayal is defined as "signal said conspiracy X, broadcast on conspiracy Y." The denominator should be total broadcasts (non-pass actions), not total player-round slots. Players who pass can't betray, and the current formula produces rates above 100%.

**Fix:** Track total non-pass broadcasts in `SocialMetrics` (new field `totalBroadcasts`). Compute betrayal rate as:
```typescript
totalBetrayals / totalBroadcasts
```
Where both are aggregated across all games. If `totalBroadcasts` is 0, rate is 0.

Add `totalBroadcasts: number` to the `SocialMetrics` interface in `src/ai/social/types.ts`.

### Bug 3: Fitness function uses hardcoded opponent personalities

**File:** `src/ai/evolution/fitness.ts`

**Problem:** Lines 26-37 give opponents a hardcoded personality with `baseDeceptionRate: 0.1, signalInfluence: 0.3`, etc. instead of using the actual named social personalities. This means the genome evolves against an unrealistic static opponent, not against the diverse personality pool.

**Fix:** Opponents in the evolution should use base strategies WITHOUT a social layer. The genome agent is the ONLY social agent in each game. The opponents use `getStrategy(baseName)` directly — they commit and broadcast using base strategies with no signals, no trust, no adaptation. This is what the original prompt specified: "evolve social play against normal play."

The matchup should be:
```typescript
// Genome agent: social agent wrapping a random base strategy
const genomeEntry = { baseName: randomBase, personality: genome.genes };

// Opponents: pure base strategies, no social layer
const opponentEntries = opponents.map(name => ({
  baseName: name,
  personality: null,  // no social layer
}));
```

This requires `runSocialGame` to accept mixed matchups where some players are social agents and some are plain base strategies. Modify `runSocialGame` to accept an optional `personality` field — when it's null, that player uses the base strategy directly without the social wrapper.

Alternatively (and simpler), create a new function `runMixedGame` in `src/ai/evolution/fitness.ts` that plays the genome agent (social) against plain base strategy opponents (non-social). This avoids modifying `runSocialGame`.

## Part 2: Advanced Social AI for Solo Play

The current `useGame.ts` hook uses base strategies (`getStrategy`) for AI opponents. Replace this with social agents that use the full social layer: signals, trust tracking, adaptive behavior.

### New Files

```
src/ai/social/
  advancedAgent.ts     # Self-contained advanced AI that combines base strategy + social layer + within-game learning
```

### Advanced Agent Design

`advancedAgent.ts` exports a class that wraps the social agent and provides a simpler interface for the UI hook:

```typescript
interface AdvancedAI {
  readonly name: string;
  readonly personalityName: string;

  // Called during COMMIT phase — returns actions to dispatch
  decideCommit(state: GameState): GameAction[];

  // Called between COMMIT and BROADCAST — returns this agent's signal
  // (the UI can optionally display this to the human player)
  generateSignal(state: GameState): Signal;

  // Called during BROADCAST phase — receives all signals from this round
  decideBroadcast(state: GameState, allSignals: Signal[]): GameAction;

  // Called after RESOLVE — updates trust, adaptive state, etc.
  onRoundEnd(state: GameState, allSignals: Signal[]): void;
}

function createAdvancedAI(
  playerId: string,
  baseStrategyName: string,
  personalityName: string
): AdvancedAI
```

This is essentially the existing `SocialAIStrategy` from `socialAgent.ts` but:
1. It stores its own `playerId` so callers don't need to pass it every time
2. It has a cleaner interface (no raw `playerId` parameter on every method)
3. It initializes lazily on first call

### Personality Assignment

When starting a solo-vs-AI game, each AI opponent gets:
- A random base strategy from the 5 available
- A random social personality from the 6 available
- The combination creates a unique opponent (e.g., "Hustler + Aggressive" plays differently from "Hustler + Cautious")

The name shown to the player should be the social personality name (e.g., "The Hustler", "The Diplomat") since that's what governs their visible behavior.

### UI Integration

Modify `src/ui/hooks/useGame.ts` to use advanced AIs:

1. On game start, create `AdvancedAI` instances for each non-human player
2. Store them in a `useRef` (they have mutable internal state)
3. During COMMIT phase AI turns: call `agent.decideCommit(state)`, dispatch actions
4. After all players commit but before BROADCAST: call `agent.generateSignal(state)` for each AI. Collect all signals. Store in a ref.
5. During BROADCAST phase AI turns: call `agent.decideBroadcast(state, allSignals)`, dispatch action
6. After RESOLVE: call `agent.onRoundEnd(state, allSignals)` for each AI

**Signals display:** After the commit phase, display a brief "negotiation" moment in the UI showing what each AI signaled. Example:

```
📡 Pre-broadcast signals:
  The Hustler: "I have strong evidence on Moon Landing. Join me." 
  The Diplomat: "I'm interested in Chemtrails. Let's coordinate."
  The Paranoid: "I don't trust any of you. I'm keeping my plans to myself."
```

The human player should see AI signals but does NOT send their own signal (they communicate through their visible evidence counts and broadcast actions — just like at a real table where you can say whatever you want but your actions speak louder).

Format signals as flavor text, not raw data. Map the signal fields to natural language:
- `intent: 'lead'` + `claimedStrength: 'strong'` → "I have strong evidence on [X]. Follow me."
- `intent: 'join'` + `claimedStrength: 'moderate'` → "I might join [X] if others commit."
- `intent: 'avoid'` + any → "[Name] stays quiet." or "[Name] seems evasive."
- `truthful: false` (HIDDEN from player) → visually identical to truthful signals. The player can only detect bluffs by cross-referencing signals with visible evidence counts.

### Signal Flavor Text Generator

Create `src/ai/social/signalFlavor.ts`:

```typescript
function signalToFlavor(signal: Signal, personalityName: string, conspiracyName: string): string
```

Each personality has a distinct voice:
- **Honest Broker**: straightforward, earnest. "I've found solid evidence on [X]. I think we should all focus here."
- **Sociopath**: overconfident, pushy. "Trust me on [X]. I've got this locked down. Don't waste your time elsewhere."
- **Hustler**: casual, noncommittal. "I've been looking at [X]. Could be interesting. We'll see."
- **Diplomat**: measured, collaborative. "I'd like to propose we coordinate on [X]. I have some evidence to share."
- **Paranoid**: evasive, suspicious. "I'm not saying where I'm going. Too many liars in this room."
- **Chameleon**: agreeable, echoing others. "I like where [other player] is headed. I might follow their lead."

Write 3-4 variants for each personality × intent combination so the flavor doesn't repeat every round. Pick randomly.

When the signal is a bluff (`truthful: false`), use the same flavor text as an honest signal — the player should NOT be able to tell from the text alone. The only clue is whether the signal matches the visible evidence counts from the commit phase.

## Part 3: Tests

### Bug Fix Tests

Add to `src/ai/social/__tests__/socialSimulation.test.ts` (new file):

```
- Social game tracks consensusCount correctly (run a game, verify > 0 when consensus forms)
- Social game tracks pointSources correctly (verify evidence points > 0 when consensus forms with evidence)
- Social game tracks totalBroadcasts in socialMetrics
- Betrayal rate is between 0 and 1 (never > 100%)
- Betrayal rate = betrayalCount / totalBroadcasts
```

### Advanced Agent Tests

Add to `src/ai/social/__tests__/advancedAgent.test.ts`:

```
- Creates agent with valid personality and base strategy
- decideCommit returns valid actions for current state
- generateSignal returns signal with correct senderId
- decideBroadcast uses signals to influence decision
- onRoundEnd updates trust scores (verify trust changes after betrayal)
- Agent adapts deception rate after being caught (verify rate decreases)
- Agent escalates risk when behind in late rounds (verify risk tolerance increases)
- Full lifecycle: create → commit → signal → broadcast → roundEnd across 6 rounds without errors
```

### Signal Flavor Tests

Add to `src/ai/social/__tests__/signalFlavor.test.ts`:

```
- Each personality produces non-empty flavor text
- Bluff signals produce identical-looking text to honest signals
- Different intents produce different text
- All 6 personalities have distinct voice
```

## Part 4: Validation Simulation

After all fixes and implementations, run:

1. **Social tournament with fixed bugs:** 200 games, Honest Broker vs Sociopath vs Hustler vs Diplomat, using Aggressive as base for all. Report:
   - Win rates per personality
   - Consensus rate (should be > 0 now)
   - Betrayal rate (should be 0-1 range now)
   - Point source breakdown

2. **Evolution with fixed fitness:** 20 generations, 20 population, 30 games each. Report:
   - Converged personality parameters
   - Whether selective deception is optimal (target: evolved deception rate 0.10-0.30)

3. **Advanced AI smoke test:** Create 4 advanced AI agents, play one game, log all signals and trust changes. Verify signals are generated, trust updates happen, and adaptive behavior fires.

Save all results to `data/simulation-results/post-fix-validation_{timestamp}.json`.

## Execution Order

1. Fix Bug 1: consensus/pointSources tracking in `socialSimulation.ts`
2. Fix Bug 2: add `totalBroadcasts` to `SocialMetrics`, fix betrayal rate calculation
3. Fix Bug 3: modify `fitness.ts` to use pure base strategy opponents (no social layer on opponents)
4. Write bug fix tests, verify they pass
5. Implement `src/ai/social/advancedAgent.ts`
6. Implement `src/ai/social/signalFlavor.ts`
7. Write advanced agent tests + signal flavor tests
8. Modify `src/ui/hooks/useGame.ts` to use advanced AIs with signal display
9. Add signal display UI element to `src/ui/game/BroadcastPhase.tsx` (show signals before player broadcasts)
10. Run validation simulations
11. Commit with message: "Fix social sim bugs, add advanced AI with signals for solo play"

## What NOT to Do

- Do NOT modify the game engine (`src/engine/`) — all changes are in `src/ai/` and `src/ui/`
- Do NOT add new game phases — signals are displayed in the UI between COMMIT and BROADCAST but are NOT a game engine phase
- Do NOT let the human player send structured signals — they communicate through actions (evidence placement, broadcast choice), which is how it works at a real table
- Do NOT make signals mechanically binding — they're cheap talk, same as verbal promises in the physical game
- Do NOT change the existing 5 base strategies — advanced AIs wrap them
- Do NOT change the existing 6 social personalities — they're already calibrated

## Quality Standards

- TypeScript strict mode, no `any`
- All existing 120 tests must continue to pass
- New tests bring total to 140+
- Signal flavor text must sound natural, not robotic — read it out loud
- Every file under 250 lines
- Validation simulation must produce plausible metrics (consensus rate 30-60%, betrayal rate 5-40%, close game rate > 60%)
