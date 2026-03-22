# Fix: Post-Human-Broadcast Stall Bug

## The Bug

In `src/ui/game/GameContainer.tsx`, after the human player broadcasts or passes during the BROADCAST phase, the `uiPhase` stays at `BROADCAST_PLAYER`. If there are AI players who haven't broadcast yet, they never get processed because the AI broadcast `useEffect` (line ~93) only fires when `uiPhase` is `BROADCAST_AI` or `BROADCAST_WAITING`. The game freezes.

**Reproduction:** Start a game where an AI broadcasts before the human (lowest score goes first). The AI broadcasts fine. The human gets their turn (`BROADCAST_PLAYER`). The human clicks REAL/FAKE or PASS. The engine advances `currentPlayerIndex` to the next player. But `uiPhase` is still `BROADCAST_PLAYER`, and nobody transitions it to `BROADCAST_AI`. The remaining AIs never act. The game hangs.

## The Fix

Add a `useEffect` in `GameContainer.tsx` that detects when the human has finished broadcasting and hands off to the next player. Insert this between the existing AI broadcast `useEffect` and the RESOLVE transition `useEffect`:

```typescript
// Transition from BROADCAST_PLAYER to BROADCAST_AI after human broadcasts
useEffect(() => {
  if (uiPhase !== 'BROADCAST_PLAYER') return;
  if (state.phase !== 'BROADCAST') return;

  const humanPlayer = state.players.find(p => p.isHuman);
  if (!humanPlayer) return;

  // If human has already broadcast this round, hand off to AI
  if (state.broadcastedPlayers.includes(humanPlayer.id)) {
    const currentId = getCurrentPlayerId(state);
    const nextPlayer = state.players.find(p => p.id === currentId);
    if (nextPlayer && !nextPlayer.isHuman) {
      setUIPhase('BROADCAST_AI');
    }
    // If all players done, engine will be in RESOLVE — caught by the resolve useEffect
  }
}, [uiPhase, state]);
```

## Also Fix: Same Bug Exists in COMMIT Phase

The commit phase has a similar (less obvious) issue. When the human clicks "DONE COMMITTING", `handleDoneCommitting` sets `uiPhase` to `COMMIT_AI`. But `handleDoneCommitting` doesn't check whether the human was the LAST player to commit. If they were, the engine transitions straight to BROADCAST, but `uiPhase` is `COMMIT_AI`. The existing useEffect at line ~83 catches this because it checks `state.phase === 'BROADCAST'`, so it works by accident. But it's fragile.

No code change needed for commit — just confirming it's not broken.

## Also Clean Up: Delete Dead File

Delete `src/ui/game/ResolvePhase.tsx` — it's 58 lines, not imported anywhere, superseded by `ResolveDisplay.tsx`.

## Also Clean Up: GameLog No-Op Switch

In `src/ui/game/GameLog.tsx`, the `formatEntry` function has a switch statement where every case returns the same thing (`entry.details`). Replace it with:

```typescript
function formatEntry(entry: LogEntry): string {
  if (entry.action === 'GAME_OVER') return '🏆 Game complete!';
  return entry.details;
}
```

## Verification

After making these changes:

1. `npx react-scripts test --watchAll=false` — all 136 tests must still pass
2. `npx react-scripts build` — must compile without errors
3. Manual verification: start a game with 3 AI opponents. Play through at least 2 full rounds, broadcasting on one round and passing on another. Confirm:
   - After you broadcast, the remaining AIs take their turns (narration bar shows their actions)
   - After all players broadcast, the resolve screen appears with a "Continue" button
   - After you click Continue, the next round starts
   - The game completes after 6 rounds and shows the game over screen

## Files to Change

- `src/ui/game/GameContainer.tsx` — add the useEffect (approximately 10 lines)
- `src/ui/game/ResolvePhase.tsx` — delete this file
- `src/ui/game/GameLog.tsx` — simplify formatEntry (replace 10 lines with 3)

Total change: ~15 lines added, ~65 lines deleted.
