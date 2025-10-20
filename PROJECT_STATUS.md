# Signal to Noise - Project Status

## Current Status: PLAYABLE MVP COMPLETE ✅

**Last Updated:** 2025-10-20

---

## What Works

### Core Gameplay ✅
- **Full 4-phase game loop**: INVESTIGATE → BROADCAST → RESOLVE → CLEANUP
- **Hot-seat multiplayer**: 2-4 players, local pass-and-play
- **Consensus mechanic**: Dynamic thresholds (2 votes for 2p, 3 votes for 3-4p)
- **Scoring system**: Evidence × Tier for correct claims, -3 credibility for wrong claims
- **Win conditions**: 6 rounds, 12 revealed conspiracies, or 60 audience points

### Game Content ✅
- **12 conspiracy cards** with humorous, wild-eyed flavor text
- **60 evidence cards** with conspiracy podcast energy
- **Tier-based conspiracies** (1★, 2★, 3★) affecting point multipliers
- **Evidence-conspiracy matching** system with visual indicators

### UX Features ✅
- **Visual feedback**: Green glow for valid assignments, dimmed for invalid
- **Contextual hints**: Blue help boxes when buttons are disabled
- **Detailed resolve screen**: Shows consensus, truth reveals, and scoring breakdown
- **Collapsible help panel**: Phase-specific instructions and strategy tips
- **Player hand display**: Shows assigned evidence counts per conspiracy
- **Hot-seat reminders**: "Only [Player] should look!" notifications

---

## Recent Fixes

### Session 2025-10-20
1. **CRITICAL: INVESTIGATE phase player cycling** - Fixed bug where only Alice could investigate
2. **CRITICAL: Shallow copy bug in assignedEvidence** - Fixed shared reference causing incorrect card counts
3. **UX: Added ResolveResults component** - Detailed scoring breakdown with consensus visualization
4. **UX: Enhanced conspiracy/evidence flavor text** - Added humorous, paranoid podcast energy
5. **UX: Visual feedback for evidence assignment** - Conspiracies highlight green (valid) or dim (invalid)
6. **UX: Contextual button hints** - Help text appears when buttons are disabled
7. **UX: Updated help panel** - Clearer explanations of consensus and scoring mechanics

---

## Known Issues

### None Critical
- Minor: ESLint warning about unused import (cosmetic only)
- Minor: Multiple dev server instances sometimes need manual cleanup

---

## How to Run

```bash
# Navigate to the React app
cd signal-to-noise

# Install dependencies (first time only)
npm install

# Start development server
npm start

# App runs at http://localhost:3000
```

**Note:** Built with create-react-app (deprecated but functional). 9 npm vulnerabilities present but non-blocking.

---

## Next Steps

### Phase 2: Polish & Enhancement (Estimated 10-15 hours)

#### High Priority
1. **Improve grammar**
   - "1 cards" → "1 card" (pluralization fix)
   - Clean up any other grammar inconsistencies

2. **Add animations**
   - Card assignment visual feedback
   - Consensus trigger celebration
   - Phase transitions

3. **Sound effects** (optional)
   - Card play sounds
   - Consensus "ding"
   - Wrong answer "buzzer"

#### Medium Priority
4. **Broadcast phase improvements**
   - Show live consensus progress (e.g., "2/3 votes for REAL")
   - Highlight conspiracies that are close to consensus

5. **Better mobile support**
   - Responsive design improvements
   - Touch-friendly card selection

6. **Game stats tracking**
   - Track win/loss records
   - Most successful conspiracy types
   - Player statistics

#### Low Priority
7. **Advanced rules** (from original spec)
   - Credibility-based tiebreaker
   - Alternative win conditions
   - Variant game modes

8. **AI opponents** (stretch goal)
   - Simple bot players for solo mode
   - Different difficulty levels

---

## Architecture

### Tech Stack
- **React 18** with TypeScript
- **Create React App** (legacy, but works)
- **CSS Modules** for styling
- **Hot-seat multiplayer** (local only, no networking)

### File Structure
```
signal-to-noise/
├── src/
│   ├── components/          # React components
│   │   ├── ActionButtons.tsx
│   │   ├── BroadcastQueue.tsx
│   │   ├── ConspiracyBoard.tsx
│   │   ├── GameSetup.tsx
│   │   ├── HelpPanel.tsx
│   │   ├── PhaseIndicator.tsx
│   │   ├── PlayerHand.tsx
│   │   └── ResolveResults.tsx
│   ├── data/               # Game content
│   │   ├── conspiracies.ts # 12 conspiracy cards
│   │   └── evidence.ts     # 60 evidence cards
│   ├── gameLogic.ts        # Core game mechanics
│   ├── types.ts            # TypeScript interfaces
│   └── App.tsx             # Main game orchestration
```

### Key Game Logic Functions
- `initializeGame()` - Setup game state with shuffled decks
- `detectConsensus()` - Check if consensus threshold reached
- `canSupportConspiracy()` - Validate evidence-conspiracy matching
- `checkWinCondition()` - Determine if game should end

---

## Testing Notes

### What's Been Tested
- ✅ Full game flow (INVESTIGATE → BROADCAST → RESOLVE → CLEANUP)
- ✅ 2-player consensus (2 votes required)
- ✅ 3-player consensus (3 votes required)
- ✅ Evidence assignment validation
- ✅ Scoring calculations (evidence × tier)
- ✅ Credibility penalties
- ✅ Hot-seat player cycling
- ✅ Win condition triggers

### Needs More Testing
- ⚠️ 4-player games
- ⚠️ Edge case: All players pass
- ⚠️ Edge case: Split votes (no consensus)
- ⚠️ Full 6-round playthrough
- ⚠️ Deck exhaustion scenarios

---

## Design Philosophy

**Theme:** Conspiracy theory podcast hosts competing for audience

**Core Mechanic:** Consensus-based scoring creates interesting social dynamics:
- Players must watch what others claim before deciding
- Can join consensus to score, or block it by claiming opposite
- Risk/reward: More evidence = bigger score, but also bigger loss if wrong

**Humor Tone:** Wild-eyed, over-the-top conspiracy theorist energy
- CAPS LOCK for emphasis
- Hyper-specific "damning" details
- "WAKE UP SHEEPLE!" vibes
- Self-aware satire of conspiracy culture

---

## Performance Notes

- **Build size:** Not optimized (development build)
- **Load time:** ~2-3 seconds on localhost
- **No lag** during gameplay with current card counts
- **Memory usage:** Stable, no leaks detected

---

## Deployment Considerations

### For Production Release:
1. Run `npm run build` to create optimized production build
2. Deploy `build/` folder to static hosting (Netlify, Vercel, GitHub Pages)
3. Consider adding:
   - Analytics (optional)
   - Error tracking (Sentry?)
   - Performance monitoring

### NOT Needed:
- No backend server required
- No database needed
- No user accounts/auth
- No real-time networking

---

## Credits

**Design:** Based on original Signal to Noise board game concept
**Development:** Built with Claude Code
**Theme:** Conspiracy theory podcast satire
**Target Audience:** 2-4 players who enjoy social deduction and dark humor

---

## License & Usage

This is a prototype/proof-of-concept. Check with original game designer for licensing if planning commercial use.
