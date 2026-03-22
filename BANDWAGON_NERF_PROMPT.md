# Fix: Bandwagon Scoring — Reduce Reward, Penalize Wrong Guesses

## The Problem

Simulation results after the REAL/FAKE position change show:
- **Bandwagon points: 31-44%** of all scoring (target: 3-20%)
- **Evidence-Only wins only 21%** while Follower wins 40% and Aggressive wins 37%
- **All-Evidence-Only tables average 1.0 pts/player** (they can't coordinate because evidence splits them)
- **All-Aggressive tables average 10.0 pts/player** (they bandwagon freely and score without investing cards)

The root cause: bandwagoning (broadcasting with no evidence) costs nothing when wrong and pays nearly the same as evidence-backed play when right. A free-rider who guesses correctly gets 2 pts — only 1 less than someone who invested evidence cards. A free-rider who guesses wrong loses 1 credibility — same as someone who invested evidence. There's no risk premium for having no evidence.

## The Fix: Two Changes

### Change 1: Reduce bandwagon reward from 2 to 1

In `src/engine/scoring.ts`, `calculatePlayerScore`:

```
Current:  base = hasEvidence ? (evidenceMatchesBroadcast ? 3 : 2) : 2
Proposed: base = hasEvidence ? (evidenceMatchesBroadcast ? 3 : 2) : 1
```

This creates a three-tier reward:
- Evidence matches broadcast: **3 pts** (+1 specific) — you had the goods and played them straight
- Evidence contradicts broadcast (bluff): **2 pts** — you had evidence but played the other side
- No evidence (bandwagon): **1 pt** — you free-rode on others' work

### Change 2: Extra credibility penalty for wrong bandwagon

In `src/engine/scoring.ts`, `resolveConspiracy`, the credibility change line (currently line 134):

```typescript
// Current:
credibilityChange: onMajority ? 1 : -1,

// New:
credibilityChange: onMajority ? 1 : (hasEvidence ? -1 : -2),
```

The logic: if you're on the minority side AND you had no evidence, you lose **2 credibility** instead of 1. You made a claim you couldn't back up and you were wrong. That's worse than being wrong with evidence — at least evidence shows you did your homework.

Thematic justification: in conspiracy-theory terms, a pundit who confidently declares "Moon Landing is FAKE!" with zero evidence and turns out to be wrong should lose more reputation than someone who actually had data but was outvoted.

### What this means for the player

| Situation | Points | Credibility |
|-----------|--------|-------------|
| Majority + evidence matches | 3 (+1 specific) | +1 |
| Majority + evidence contradicts (bluff) | 2 | +1 |
| Majority + no evidence (bandwagon) | 1 | +1 |
| Minority + evidence | 0 | -1 |
| Minority + no evidence (wrong bandwagon) | 0 | **-2** |
| No consensus | 0 | 0 |
| Pass | 0 | 0 |

The decision matrix now has real teeth:
- **Best case**: Commit evidence matching your broadcast, land on majority = 3-4 pts, +1 cred
- **Bluff**: Commit evidence, broadcast the other side, land on majority = 2 pts, +1 cred
- **Bandwagon right**: No evidence, join majority = 1 pt, +1 cred — viable but low reward
- **Bandwagon wrong**: No evidence, end up minority = 0 pts, **-2 cred** — real punishment

This makes bandwagoning a high-risk, low-reward play. You get less when right and lose more when wrong. Evidence investment is now clearly superior — even bluffing (2 pts) beats bandwagoning (1 pt).

## Files to Change

### `src/engine/scoring.ts`

**Change 1** — in `calculatePlayerScore` (around line 27-29):
```typescript
// Change bandwagon base from 2 to 1
const base = hasEvidence
  ? (evidenceMatchesBroadcast ? 3 : 2)
  : 1;  // was 2
```

**Change 2** — in `resolveConspiracy` (around line 134):
```typescript
// Extra credibility penalty for wrong bandwagon
credibilityChange: onMajority ? 1 : (hasEvidence ? -1 : -2),
```

Also update the `ScoringBreakdown` comment in `src/engine/types.ts` (line 99):
```typescript
base: number;        // 3 with matching evidence, 2 bluff, 1 bandwagon
```

### `src/engine/__tests__/scoring.test.ts`

Update existing tests and add new ones:
- Test: bandwagon on majority scores 1 (was 2)
- Test: bandwagon on minority loses 2 credibility (was 1)
- Test: evidence on minority still loses only 1 credibility
- Test: bluff on majority still scores 2

### `src/ui/game/BroadcastPhase.tsx`

Update the point projection display. The bandwagon line should show "1 pt" not "2 pts":
```typescript
const base = hasEvidence
  ? (realMatchesEvidence ? 3 : 2)  // evidence match vs bluff
  : 1;  // bandwagon — was 2
```

Also update the PASS button text to clarify the tradeoff:
```
⏭ PASS — Score 0, draw 1 card. No credibility risk.
```

And add a warning when the player has no evidence on a conspiracy:
```
⚠ No evidence — 1 pt if majority, -2 credibility if minority
```

### `src/ui/game/ResolveDisplay.tsx`

Update the reason text for bandwagon results:
```typescript
const reason = pr.points === 0
  ? (result.consensusReached 
    ? (pr.hasEvidence ? '(minority)' : '(minority, no evidence: -2 cred)')
    : '(no consensus)')
  : pr.evidenceMatchesBroadcast ? '(evidence matches)'
  : pr.hasEvidence ? '(bluff — evidence contradicts)'
  : '(bandwagon)';
```

### `RULES.md`

Update the scoring table:
```markdown
| Situation | Points | Credibility |
|-----------|--------|-------------|
| Majority side, evidence matches broadcast | **3** | +1 |
| …and evidence is specific | **+1** | |
| Majority side, evidence contradicts (bluff) | **2** | +1 |
| Majority side, no evidence (bandwagon) | **1** | +1 |
| Each additional majority voter beyond threshold | **+1** | |
| Minority side, with evidence | **0** | -1 |
| Minority side, no evidence | **0** | **-2** |
| No consensus reached | **0** | 0 |
| Pass | **0** | 0 (draws 1 card) |
```

### AI Strategies — No changes needed

The existing strategies already have the right behavioral logic:
- Evidence-Only never bandwagons (only broadcasts with evidence)
- Aggressive occasionally bluffs or bandwagons — the penalty makes this riskier, which is correct
- Follower follows momentum — the reduced reward and penalty mean it must be smarter about which consensus to join
- Cautious avoids risk — won't change behavior much
- Opportunist evaluates expected value — the lower bandwagon EV will push it toward evidence-backed plays

The strategy logic doesn't hardcode point values — it uses heuristics about evidence count and consensus momentum. The scoring change will naturally shift AI behavior through the engine without code changes to `strategies.ts`.

## Verification

After making changes:

1. `npx react-scripts test --watchAll=false` — all tests pass (update scoring tests first)
2. `npx react-scripts build` — compiles clean
3. Run a quick simulation (can be done with ts-node or a test script):
   - Mixed 4-player (Evidence-Only, Aggressive, Follower, Cautious): 500 games
   - Verify Evidence-Only win rate improves from 21% toward 25-35%
   - Verify bandwagon point share drops from 31% toward 10-20%
   - Verify Follower win rate drops from 40% toward 25-30%

## What NOT to Do

- Do NOT change evidence-match scoring (3 pts) — that's correct
- Do NOT change bluff scoring (2 pts) — that creates the right bluff tension
- Do NOT change consensus threshold — that's separately tuned
- Do NOT add complexity (tiers, excitement, etc.) — this is a single-number fix
- Do NOT change AI strategy logic — let the scoring change flow through naturally

Commit message: "Nerf bandwagon: 1pt reward, -2 cred penalty for wrong no-evidence broadcast"
