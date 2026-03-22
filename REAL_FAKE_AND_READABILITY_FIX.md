# Fix: REAL/FAKE Has No Meaning + Readability Overhaul

## Problem 1: REAL vs FAKE is a Meaningless Choice

### What the player experiences

"I commit evidence to Moon Landing. I see the AIs committed cards too. Now I'm told to pick REAL or FAKE. What does that mean? My evidence doesn't say whether the moon landing is real or fake — it's just evidence. I'm picking a side arbitrarily and hoping others pick the same side. There's nothing to bluff about because the choice has no information content."

### Root cause

In v2, evidence cards have no REAL/FAKE orientation. The `EvidenceCard` type has `name`, `targets`, `specific`, `flavorText` — but no position. The REAL/FAKE broadcast is a pure coordination game: you score if enough people pick the same side, regardless of which side. There is zero information asymmetry between REAL and FAKE, which means there is zero bluffing.

### The fix: Give evidence cards a position

Each evidence card should support EITHER the "REAL" or "FAKE" position on the conspiracy it targets. When you commit evidence, you're secretly committing to a position. When you broadcast, you're declaring that position publicly. The bluff is: you might broadcast the OPPOSITE position from your evidence, gambling that more people will join you than the side your evidence supports.

**Changes to `src/engine/types.ts`:**

```typescript
export interface EvidenceCard {
  id: string;
  name: string;
  targets: string[];      // conspiracy IDs or ['ALL']
  specific: boolean;
  position: Position;     // NEW: 'REAL' or 'FAKE' — what this evidence supports
  flavorText: string;
}
```

**Changes to `src/data/evidence.ts`:**

Every evidence card gets a `position` field. Split roughly 50/50:
- Generic cards: 6 REAL, 6 FAKE
- Specific cards: for each conspiracy's 3 specific cards, make 2 support one side and 1 support the other (or 2-1 random split)

The flavor text should hint at the position:
- REAL evidence: "I saw it with my own eyes", "The documents prove it", "The data is irrefutable"
- FAKE evidence: "It's clearly photoshopped", "The lab results were fabricated", "Follow the money — it's a hoax"

**Changes to scoring (`src/engine/scoring.ts`):**

The scoring rule becomes:
- **Majority side + evidence that MATCHES your broadcast position**: 3 pts (+ 1 if specific) — you had real proof for your claim
- **Majority side + evidence that CONTRADICTS your broadcast position**: 2 pts — you had evidence but bluffed the other way and it worked
- **Majority side + no evidence**: 2 pts — bandwagon (unchanged)
- **Minority side**: 0 pts (unchanged)

This means:
- Having evidence that matches your position is the best outcome (3-4 pts)
- Bluffing (broadcasting opposite to your evidence) is risky but viable: you get 2 pts if you're on the majority side, but you could have had 3-4 if you'd broadcast honestly
- The player has a real decision: "I have REAL evidence on Moon Landing, but I see two AIs already broadcast FAKE. Do I broadcast REAL (matching my evidence for max points but risking minority) or FAKE (guaranteed majority but lower points)?"

**Changes to `src/engine/engine.ts` (handleResolve):**

After resolve, the `PlayerConspiracyResult` should include a new field:

```typescript
export interface PlayerConspiracyResult {
  // ... existing fields ...
  evidenceMatchesBroadcast: boolean;  // NEW: did their evidence position match their broadcast?
}
```

The scoring logic in `calculatePlayerScore`:
```typescript
const base = hasEvidence
  ? (evidenceMatchesBroadcast ? 3 : 2)  // Match = 3, Bluff = 2
  : 2;                                     // Bandwagon = 2
```

**Changes to `src/engine/types.ts` (EvidenceAssignment):**

```typescript
export interface EvidenceAssignment {
  cardId: string;
  playerId: string;
  conspiracyId: string;
  specific: boolean;
  position: Position;  // NEW: the position this evidence supports
}
```

When evidence is assigned in `handleAssignEvidence`, copy the card's `position` into the assignment.

**Changes to the UI:**

In `PlayerHand.tsx`, each evidence card should clearly show its position:
- REAL evidence: green tint/badge saying "Supports REAL ✓"
- FAKE evidence: red tint/badge saying "Supports FAKE ✗"

In `BroadcastPhase.tsx`, the point projections should show:
```
Moon Landing: You have 2 cards (1 specific, both REAL)
  REAL → ~4 pts (evidence matches, 2 AIs voted REAL, consensus likely)
  FAKE → ~2 pts (evidence doesn't match, but you'd join majority)
```

In `CommitPhase.tsx`, the evidence summary should show the position breakdown:
```
Your committed evidence:
  Moon Landing: 2 cards (1 specific 🎯) — both support REAL
  Chemtrails: 1 card (generic 📋) — supports FAKE
```

**Changes to AI strategies (`src/ai/strategies.ts`):**

The AI broadcast decision now has real information: "I have 2 REAL evidence cards on Moon Landing. If I broadcast REAL, I get 3+ pts on majority. If I broadcast FAKE, I get 2 pts on majority but I'm bluffing." The existing strategy logic (Aggressive, Follower, etc.) should weight the position of their evidence when choosing REAL vs FAKE.

Specifically, in each strategy's `decideBroadcast`:
1. Find the conspiracy where the agent has the most evidence
2. Check the position breakdown of their evidence on that conspiracy (e.g., 2 REAL, 0 FAKE)
3. The "honest" play is to broadcast the majority position of their evidence
4. The "bluff" is to broadcast the opposite
5. Strategy personality determines bluff probability:
   - Evidence-Only: never bluffs, always broadcasts matching evidence
   - Aggressive: bluffs 20% of the time if it sees momentum on the other side
   - Follower: follows whatever's already been broadcast, regardless of evidence
   - Cautious: only broadcasts if evidence matches the forming consensus
   - Opportunist: bluffs when the expected value of joining the majority exceeds honest play

**Changes to social signal layer (`src/ai/social/signalLayer.ts`):**

When generating signals, the AI can lie about its evidence position. An honest signal says "I have REAL evidence on Moon Landing." A bluff signal says "I have REAL evidence on Moon Landing" when they actually have FAKE evidence. The trust tracker detects this after resolve when evidence positions are revealed.

**Changes to `src/data/evidence.ts`:**

Update all 48 evidence cards. Assign positions:

Generic cards (12 total): 6 REAL, 6 FAKE. Roughly alternate.

Specific cards (36 total, 3 per conspiracy): For each set of 3, assign 2 to one side and 1 to the other. The majority side should vary per conspiracy so there's no predictable pattern.

Update flavor text to hint at the position. Examples:
- "Shadow Angle Analysis" (Moon Landing, REAL evidence): "The shadows DON'T match a single light source. Multiple angles confirm on-site filming conditions."
- "Van Allen Belt Data" (Moon Landing, FAKE evidence): "Radiation levels would have fried the astronauts. The math doesn't lie — they never left low Earth orbit."

### What this changes about gameplay

Before: "Pick REAL or FAKE, it doesn't matter which." 
After: "I have FAKE evidence on Chemtrails. Two AIs signaled REAL. Do I bluff REAL to join the majority (2 pts) or broadcast FAKE matching my evidence and hope I can convince someone to join me (3-4 pts)?"

The bluffing mechanic is now real: you can see your evidence supports one position, but you might choose to broadcast the other position to join a forming consensus. This is a genuine risk/reward tradeoff that creates table talk opportunities and social deduction moments.

## Problem 2: Readability

### Minimum font sizes

Every file in `src/ui/game/` needs a readability pass:

- **Body text minimum**: 13px (was 10-11px in most places)
- **Card names**: 14px bold (was 12px)
- **Card details**: 12px (was 10px)
- **Flavor text**: 12px italic (was 10px)
- **Badge/label text**: 11px minimum (was 9-10px)
- **Section headers**: 15px (was 14px)
- **Phase titles**: 18px (was 16px)

### Color contrast

Replace low-contrast color combinations:

| Element | Old Color | New Color | Reason |
|---------|-----------|-----------|--------|
| Card targets | `#666` on `#1a1a2e` | `#9ca3af` | Was 2.5:1, needs 4.5:1 |
| Flavor text | `#555` on `#1a1a2e` | `#8b95a5` | Was 2.1:1 |
| Card description | `#666` on `#1a1a2e` | `#9ca3af` | Was 2.5:1 |
| Conspiracy description | `#666` | `#9ca3af` | Same |
| Evidence line in signals | `#888` | `#a3b1c2` | Slightly better |
| Hint text | `#666` | `#8b95a5` | Was barely visible |
| Log phase markers | `#0af` at 9px | `#38bdf8` at 11px | Too small and too bright |
| General body text | `#ccc` | `#d1d5db` | Slight improvement |
| Disabled/dimmed | `opacity: 0.3` | `opacity: 0.45` | Was invisible |

### Card width

Evidence cards in `PlayerHand.tsx` are 180px wide which cramps the text. Increase to 220px minimum, or use a vertical list layout instead of wrapping grid when there are more than 4 cards.

### Files to update (readability only — CSS changes, no logic)

- `src/ui/game/PlayerHand.tsx` — font sizes, colors, card width
- `src/ui/game/ConspiracyBoard.tsx` — font sizes, description color
- `src/ui/game/CommitPhase.tsx` — font sizes
- `src/ui/game/BroadcastPhase.tsx` — font sizes, projection text
- `src/ui/game/ResolveDisplay.tsx` — font sizes
- `src/ui/game/SignalDisplay.tsx` — font sizes, evidence line color
- `src/ui/game/GameLog.tsx` — font sizes, log entry sizing
- `src/ui/game/Scoreboard.tsx` — font sizes
- `src/ui/game/ActionNarration.tsx` — font sizes
- `src/ui/game/GameOverScreen.tsx` — font sizes

## Execution Order

1. Add `position: Position` to `EvidenceCard` in `src/engine/types.ts`
2. Add `position: Position` to `EvidenceAssignment` in `src/engine/types.ts`
3. Update `src/data/evidence.ts` — add position to all 48 cards, update flavor text
4. Update `src/engine/engine.ts` — copy card position into assignment, pass to scoring
5. Update `src/engine/scoring.ts` — `evidenceMatchesBroadcast` parameter, new base point logic
6. Update `src/engine/types.ts` — add `evidenceMatchesBroadcast` to `PlayerConspiracyResult`
7. Update all engine tests to include position
8. Update AI strategies to consider evidence position when choosing broadcast side
9. Update social signal layer to account for evidence position in bluff detection
10. Apply readability CSS changes to all UI components
11. Update `PlayerHand.tsx` to show REAL/FAKE position badge on each card
12. Update `BroadcastPhase.tsx` point projections to show evidence match/mismatch
13. Update `CommitPhase.tsx` evidence summary to show position breakdown
14. Run all tests: `npx react-scripts test --watchAll=false` — all must pass
15. Build: `npx react-scripts build` — must compile clean
16. Commit: "Give evidence cards REAL/FAKE positions, fix readability"

## What NOT to Do

- Do NOT add new phases or mechanics — this is a targeted fix to make the existing REAL/FAKE choice meaningful
- Do NOT change the consensus threshold or scoring magnitudes
- Do NOT change credibility mechanics
- Do NOT add proof values, excitement, tiers, or any v1 complexity back
- Do NOT change the social personality parameters

## Quality Standards

- All existing 136 tests pass (some will need updating for the new `position` field)
- Build compiles clean
- No text in the UI is below 11px
- No text in the UI has contrast ratio below 4:1 against its background
- Every evidence card has a position of REAL or FAKE
- Bandwagon scoring (2 pts) is unchanged
- Evidence-match scoring (3 pts + specific bonus) is the new maximum
- Evidence-mismatch scoring (2 pts, same as bandwagon) creates the bluff payoff
