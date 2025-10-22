# Evidence Excitement Mechanic - Implementation Plan

## Overview

This document outlines the step-by-step implementation of the Evidence Excitement mechanic to address game balance issues in 4-player games.

**Problem:** 4-player consensus too difficult (3/4 agreement required), evidence gets wasted when no consensus reached.

**Solution:** Evidence persists across rounds + excitement modifiers create strategic depth.

---

## Core Mechanic Design

### Evidence Types

Each evidence card has an **excitement value**:

- **BORING (-1)**: Flexible, safe choice
  - Supports 3-5 conspiracies (broad applicability)
  - First broadcast: No penalty
  - Repeat broadcasts: -2 audience penalty
  - Strategic use: Diversification, hedging bets, flexibility

- **NEUTRAL (0)**: Baseline, no modifiers
  - Supports 2-3 conspiracies (moderate applicability)
  - No bonuses or penalties ever
  - Strategic use: Standard play, no risk/reward

- **EXCITING (+1)**: Focused, high-risk/high-reward
  - Supports 1-2 conspiracies (narrow focus)
  - First broadcast: No bonus
  - Repeat broadcasts: +2 audience bonus (STACKS with each repeat!)
  - Strategic use: Specialization, building signature topics

### Strategic Archetypes

- **Diversifier (Boring-focused)**: Assigns many different conspiracies, avoids repeat penalties, maintains flexibility
- **Specialist (Exciting-focused)**: Commits to 1-2 conspiracies, builds evidence base, farms repeat bonuses

---

## Implementation Steps

### Step 1: TypeScript Type Updates

**File:** `src/types.ts`

Add `excitement` property to `EvidenceCard` interface:

```typescript
export interface EvidenceCard {
  id: string;
  name: string;
  supportedConspiracies: string[]; // Array of conspiracy IDs or ['ALL']
  flavorText: string;
  excitement: -1 | 0 | 1; // BORING, NEUTRAL, EXCITING
}
```

**Estimated time:** 5 minutes

---

### Step 2: Evidence Categorization

**File:** `src/data/evidence.ts`

Assign excitement values to all 60 evidence cards based on their `supportedConspiracies` array.

**Categorization Strategy:**

1. **BORING (-1)**: Evidence supporting 3+ conspiracies or ['ALL']
   - Examples: ev_001 through ev_010 (all ['ALL'] cards)
   - Examples: ev_029, ev_030, ev_031 (multi-conspiracy support)
   - Total: ~25 cards

2. **NEUTRAL (0)**: Evidence supporting 2 conspiracies
   - Examples: ev_011, ev_014, ev_088 (dual-conspiracy support)
   - Total: ~20 cards

3. **EXCITING (+1)**: Evidence supporting 1 specific conspiracy
   - Examples: ev_012, ev_013 (chemtrails only)
   - Examples: ev_018, ev_019 (bigfoot only)
   - Total: ~15 cards

**Implementation:**

```typescript
export const EVIDENCE_DECK: EvidenceCard[] = [
  // BORING - Generic evidence supporting ALL
  {
    id: 'ev_001',
    name: 'Anonymous Whistleblower',
    supportedConspiracies: ['ALL'],
    flavorText: '"I\'ll lose my job if they find out it\'s me, but the truth needs to be told..." - Message received 3am',
    excitement: -1 // BORING - very flexible
  },

  // NEUTRAL - Moderate focus
  {
    id: 'ev_011',
    name: 'Atmospheric Samples',
    supportedConspiracies: ['chemtrails', 'weather_machine'],
    flavorText: 'My buddy tested it in his garage lab. Barium levels OFF THE CHARTS. Don\'t breathe!',
    excitement: 0 // NEUTRAL - supports 2 conspiracies
  },

  // EXCITING - Highly focused
  {
    id: 'ev_012',
    name: 'Flight Path Analysis',
    supportedConspiracies: ['chemtrails'],
    flavorText: 'Normal planes don\'t fly in perfect grids for 6 hours. I tracked them on FlightRadar24!',
    excitement: 1 // EXCITING - laser-focused on chemtrails
  },
];
```

**Estimated time:** 30 minutes (review all 60 cards)

---

### Step 3: Broadcast History Tracking

**File:** `src/types.ts`

Add broadcast history to track which evidence has been used in previous broadcasts:

```typescript
export interface PlayerState {
  id: string;
  name: string;
  color: string;
  evidenceHand: EvidenceCard[];
  assignedEvidence: { [conspiracyId: string]: EvidenceCard[] };
  audience: number;
  credibility: number;
  broadcastHistory: BroadcastHistoryEntry[]; // NEW
}

export interface BroadcastHistoryEntry {
  round: number;
  conspiracyId: string;
  evidenceIds: string[]; // Which evidence cards were used
  position: 'REAL' | 'FAKE';
  wasScored: boolean; // Did consensus happen?
}
```

**File:** `src/gameLogic.ts`

Update `initializeGame()` to initialize empty broadcast history:

```typescript
export function initializeGame(playerCount: number): GameState {
  const playerColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];
  const playerNames = ['Alice', 'Bob', 'Carol', 'David'];

  const players: PlayerState[] = Array.from({ length: playerCount }, (_, i) => ({
    id: `player_${i}`,
    name: playerNames[i],
    color: playerColors[i],
    evidenceHand: [],
    assignedEvidence: {},
    audience: 0,
    credibility: 10,
    broadcastHistory: [] // Initialize empty history
  }));

  // ... rest of initialization
}
```

**Estimated time:** 15 minutes

---

### Step 4: Excitement Scoring Logic

**File:** `src/App.tsx`

Update `handleResolve()` to calculate excitement bonuses/penalties:

```typescript
const handleResolve = () => {
  setGameState(prev => {
    if (!prev) return prev;
    const updatedPlayers = [...prev.players];
    const revealedConspiracies: string[] = [];
    let totalRevealed = prev.totalRevealed;

    prev.conspiracies.forEach(conspiracy => {
      const { consensus, position } = detectConsensus(prev.broadcastQueue, conspiracy.id, prev.players.length);

      if (consensus && position) {
        // Mark conspiracy as revealed
        const conspiracyIndex = prev.conspiracies.findIndex(c => c.id === conspiracy.id);
        if (conspiracyIndex >= 0 && !prev.conspiracies[conspiracyIndex].isRevealed) {
          revealedConspiracies.push(conspiracy.id);
          totalRevealed++;
        }

        // Score all broadcasts on this conspiracy
        prev.broadcastQueue
          .filter(b => b.conspiracyId === conspiracy.id && !b.isPassed)
          .forEach(broadcast => {
            const playerIndex = updatedPlayers.findIndex(p => p.id === broadcast.playerId);
            if (playerIndex >= 0) {
              const player = { ...updatedPlayers[playerIndex] };

              // Get the evidence cards used in this broadcast
              const evidenceUsed = player.assignedEvidence[conspiracy.id] || [];

              // Calculate excitement modifier
              let excitementModifier = 0;
              evidenceUsed.forEach(card => {
                // Check if this evidence was used in previous broadcasts
                const previousUses = player.broadcastHistory.filter(entry =>
                  entry.evidenceIds.includes(card.id) && entry.wasScored
                ).length;

                if (card.excitement === -1 && previousUses > 0) {
                  // BORING card on repeat: -2 penalty
                  excitementModifier -= 2;
                } else if (card.excitement === 1 && previousUses > 0) {
                  // EXCITING card on repeat: +2 bonus per previous use
                  excitementModifier += 2 * previousUses;
                }
                // NEUTRAL (0) never adds modifier
              });

              if (broadcast.position === conspiracy.truthValue) {
                // Correct - base score + excitement modifier
                const baseScore = broadcast.evidenceCount * conspiracy.tier;
                player.audience += baseScore + excitementModifier;
              } else {
                // Wrong - still lose credibility
                player.credibility = Math.max(0, player.credibility - 3);
              }

              // Add to broadcast history
              player.broadcastHistory.push({
                round: prev.round,
                conspiracyId: conspiracy.id,
                evidenceIds: evidenceUsed.map(e => e.id),
                position: broadcast.position,
                wasScored: true
              });

              updatedPlayers[playerIndex] = player;
            }
          });
      } else {
        // No consensus - still track in history but mark as not scored
        prev.broadcastQueue
          .filter(b => b.conspiracyId === conspiracy.id && !b.isPassed)
          .forEach(broadcast => {
            const playerIndex = updatedPlayers.findIndex(p => p.id === broadcast.playerId);
            if (playerIndex >= 0) {
              const player = { ...updatedPlayers[playerIndex] };
              const evidenceUsed = player.assignedEvidence[conspiracy.id] || [];

              player.broadcastHistory.push({
                round: prev.round,
                conspiracyId: conspiracy.id,
                evidenceIds: evidenceUsed.map(e => e.id),
                position: broadcast.position,
                wasScored: false
              });

              updatedPlayers[playerIndex] = player;
            }
          });
      }
    });

    // Reveal conspiracies
    const updatedConspiracies = prev.conspiracies.map(c =>
      revealedConspiracies.includes(c.id) ? { ...c, isRevealed: true } : c
    );

    return {
      ...prev,
      conspiracies: updatedConspiracies,
      players: updatedPlayers,
      totalRevealed,
      phase: 'CLEANUP'
    };
  });

  setMessage('Broadcasts resolved. Check scores.');
};
```

**Estimated time:** 45 minutes

---

### Step 5: CLEANUP Phase Changes

**File:** `src/App.tsx`

Update `handleCleanup()` to NOT clear assignedEvidence (evidence persists):

```typescript
const handleCleanup = () => {
  setGameState(prev => {
    if (!prev) return prev;
    // Replace revealed conspiracies
    let updatedDeck = [...prev.conspiracyDeck];
    const updatedConspiracies = prev.conspiracies.map(c => {
      if (c.isRevealed && updatedDeck.length > 0) {
        const newConspiracy = updatedDeck[0];
        updatedDeck = updatedDeck.slice(1);
        return newConspiracy;
      }
      return c;
    });

    // CHANGE: Do NOT clear assignedEvidence - evidence persists!
    // Players keep their evidence assignments across rounds
    const updatedPlayers = [...prev.players]; // No longer clearing assignedEvidence

    // Check win condition
    const winCheck = checkWinCondition({
      ...prev,
      conspiracies: updatedConspiracies,
      players: updatedPlayers,
      round: prev.round + 1
    });

    return {
      ...prev,
      conspiracies: updatedConspiracies,
      conspiracyDeck: updatedDeck,
      players: updatedPlayers,
      broadcastQueue: [],
      phase: winCheck.gameOver ? 'CLEANUP' : 'INVESTIGATE',
      round: prev.round + 1,
      gameOver: winCheck.gameOver,
      winner: winCheck.winner
    };
  });

  setMessage('Cleanup complete. Next round!');
};
```

**Estimated time:** 10 minutes

---

### Step 6: UI Updates - Show Excitement

**File:** `src/components/PlayerHand.tsx`

Add visual indicator for card excitement level:

```typescript
<div className={`evidence-card ${selectedCard === card.id ? 'selected' : ''} excitement-${card.excitement}`}>
  <div className="card-header">
    <span className="card-name">{card.name}</span>
    {card.excitement === -1 && <span className="excitement-badge boring">Flexible</span>}
    {card.excitement === 1 && <span className="excitement-badge exciting">Focused</span>}
  </div>
  <div className="card-flavor">{card.flavorText}</div>
</div>
```

**File:** `src/components/PlayerHand.css`

Add styling for excitement badges:

```css
.excitement-badge {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
}

.excitement-badge.boring {
  background: rgba(156, 163, 175, 0.3);
  color: #9ca3af;
}

.excitement-badge.exciting {
  background: rgba(251, 191, 36, 0.3);
  color: #fbbf24;
}

.evidence-card.excitement--1 {
  border-color: #6b7280;
}

.evidence-card.excitement-1 {
  border-color: #f59e0b;
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.3);
}
```

**Estimated time:** 20 minutes

---

### Step 7: Update ResolveResults Component

**File:** `src/components/ResolveResults.tsx`

Show excitement modifiers in scoring breakdown:

```typescript
{broadcasts.map(broadcast => {
  const player = players.find(p => p.id === broadcast.playerId);
  const evidenceUsed = player?.assignedEvidence[conspiracy.id] || [];

  // Calculate excitement modifier for display
  let excitementModifier = 0;
  let excitementDetails: string[] = [];

  evidenceUsed.forEach(card => {
    const previousUses = player?.broadcastHistory.filter(entry =>
      entry.evidenceIds.includes(card.id) && entry.wasScored
    ).length || 0;

    if (card.excitement === -1 && previousUses > 0) {
      excitementModifier -= 2;
      excitementDetails.push(`${card.name}: -2 (repeat boring)`);
    } else if (card.excitement === 1 && previousUses > 0) {
      const bonus = 2 * previousUses;
      excitementModifier += bonus;
      excitementDetails.push(`${card.name}: +${bonus} (${previousUses}x exciting repeat)`);
    }
  });

  const wasCorrect = broadcast.position === conspiracy.truthValue;
  const basePoints = wasCorrect ? broadcast.evidenceCount * conspiracy.tier : 0;
  const totalPoints = basePoints + excitementModifier;

  return (
    <div className={`player-result ${wasCorrect ? 'correct' : 'wrong'}`}>
      <span className="player-name">{getPlayerName(broadcast.playerId)}</span>
      <span className="player-claim">claimed {broadcast.position}</span>
      {wasCorrect ? (
        <>
          <span className="score-gain">
            +{totalPoints} audience ({broadcast.evidenceCount} × {conspiracy.tier}★
            {excitementModifier !== 0 && ` ${excitementModifier > 0 ? '+' : ''}${excitementModifier} excitement`})
          </span>
          {excitementDetails.length > 0 && (
            <div className="excitement-breakdown">
              {excitementDetails.map((detail, i) => (
                <div key={i} className="excitement-detail">{detail}</div>
              ))}
            </div>
          )}
        </>
      ) : (
        <span className="score-loss">-3 credibility</span>
      )}
    </div>
  );
})}
```

**Estimated time:** 30 minutes

---

### Step 8: Update Help Panel

**File:** `src/components/HelpPanel.tsx`

Add explanation of excitement mechanic:

```typescript
case 'INVESTIGATE':
  return {
    title: 'INVESTIGATE Phase',
    steps: [
      '1. Select an evidence card from your hand',
      '2. Select a conspiracy it can support (highlighted in green)',
      '3. Click "Assign Evidence" to assign it',
      '4. When done, click "Done Investigating"',
    ],
    tip: 'STRATEGY: Evidence persists across rounds! FLEXIBLE cards (gray) support many conspiracies but penalty -2 audience on repeat broadcasts. FOCUSED cards (gold) support fewer conspiracies but give +2 audience bonus when reused (stacks!). Build a specialist or stay flexible!'
  };
```

**Estimated time:** 10 minutes

---

### Step 9: Flavor Text Updates (Subtle)

**File:** `src/data/evidence.ts`

Update a few card flavor texts to subtly hint at excitement without being weird:

**BORING examples (flexible, mundane):**
```typescript
{
  id: 'ev_001',
  name: 'Anonymous Whistleblower',
  supportedConspiracies: ['ALL'],
  flavorText: '"Could be anything, really. I\'ve seen it all..." - Generic source',
  excitement: -1
}
```

**EXCITING examples (specific, passionate):**
```typescript
{
  id: 'ev_012',
  name: 'Flight Path Analysis',
  supportedConspiracies: ['chemtrails'],
  flavorText: 'I\'ve tracked EVERY flight over this city for 6 years! This is my LIFE\'S WORK!',
  excitement: 1
}
```

**Guidelines:**
- BORING: Generic language, vague sources, "could be anything"
- EXCITING: Specific obsession, hyper-focused details, passion/commitment
- Keep changes minimal - most cards are fine as-is

**Estimated time:** 30 minutes (review and update ~10-15 cards)

---

## Testing Checklist

### Unit Testing
- [ ] Excitement values assigned to all 60 cards
- [ ] Broadcast history initializes correctly
- [ ] Broadcast history tracks correctly per player
- [ ] Excitement modifiers calculate correctly (boring penalty, exciting bonus)
- [ ] Exciting bonus stacks on multiple repeats

### Integration Testing
- [ ] Evidence persists across rounds
- [ ] Assigned evidence not cleared in CLEANUP
- [ ] Scoring includes excitement modifiers
- [ ] ResolveResults shows excitement breakdown
- [ ] UI badges display correctly

### Gameplay Testing
- [ ] Play 2-player game with boring strategy (diversify)
- [ ] Play 2-player game with exciting strategy (specialize)
- [ ] Verify boring penalty applies on 2nd+ broadcast
- [ ] Verify exciting bonus stacks correctly
- [ ] Verify neutral cards never apply modifiers
- [ ] Play 4-player game - verify consensus easier with persistent evidence

---

## Rollout Plan

### Phase 1: Core Implementation (2-3 hours)
1. Add excitement property to types
2. Assign excitement values to all evidence cards
3. Add broadcast history tracking
4. Implement excitement scoring in RESOLVE

### Phase 2: UI Updates (1-2 hours)
1. Add excitement badges to cards
2. Update ResolveResults to show excitement breakdown
3. Update HelpPanel with strategy tips

### Phase 3: Polish (1 hour)
1. Update flavor text (subtle tweaks only)
2. Testing and bug fixes
3. Documentation updates

### Total Estimated Time: 4-6 hours

---

## Potential Issues & Mitigations

### Issue 1: Complexity Overwhelm
**Risk:** Too much information for new players
**Mitigation:** Excitement is optional strategy - players can ignore it and play normally

### Issue 2: Stacking Bonuses Too Powerful
**Risk:** Exciting cards + repeats = runaway scores
**Mitigation:** Exciting cards are rare (~15/60) and narrow (1-2 conspiracies), limiting stacking potential

### Issue 3: Boring Penalty Too Harsh
**Risk:** Players avoid boring cards entirely
**Mitigation:** Boring cards offer flexibility (3-5 conspiracies), penalty only on repeats, no penalty on first use

### Issue 4: State Persistence Bugs
**Risk:** assignedEvidence growing infinitely, memory issues
**Mitigation:** Evidence cards are removed from hand when assigned, so total pool stays constant (60 cards max)

---

## Success Metrics

### Game Balance
- [ ] 4-player consensus rate increases (target: 40-60% of rounds)
- [ ] Evidence waste decreases (fewer broadcasts with no consensus)
- [ ] Strategy diversity increases (both boring and exciting viable)

### Player Experience
- [ ] Players understand excitement mechanic within 1-2 rounds
- [ ] Players make strategic choices about card types
- [ ] Game length increases slightly (more rounds before win condition)

---

## Future Enhancements (Post-Implementation)

1. **Visual Evidence Trail**: Show which evidence cards have been used previously
2. **Audience Fatigue Meter**: Visual indicator of how many times evidence reused
3. **Combo System**: Bonuses for using multiple exciting cards on same conspiracy
4. **Meta-Game Stat Tracking**: Which excitement strategies win most often
5. **Advanced Mode**: Excitement values hidden, players must discover through play
