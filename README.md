# Signal to Noise

**A conspiracy theory podcast competition game**

Build your audience by investigating conspiracies, making bold claims, and hoping you're right! Compete with 2-4 players in hot-seat multiplayer to become the most popular conspiracy podcaster.

---

## Quick Start

```bash
cd signal-to-noise
npm install
npm start
```

Open http://localhost:3000 and start a new game!

---

## How to Play

### The Premise
You're competing podcasters investigating conspiracy theories. Some are real, some are fake - but you don't know which! Build your case with evidence, make your claim, and reach consensus with other players to score points.

### Game Flow
Each round has 4 phases:

1. **INVESTIGATE** - Each player assigns evidence cards to conspiracies (hot-seat turns)
2. **BROADCAST** - Each player claims a conspiracy is REAL or FAKE (or passes)
3. **RESOLVE** - Check for consensus and score points
4. **CLEANUP** - Replace revealed conspiracies and start next round

### How to Score
- **Consensus triggers scoring:** Need 2 players (2p game) or 3 players (3-4p game) claiming the SAME position
- **Correct claims:** Gain audience = (evidence cards) × (conspiracy tier★)
- **Wrong claims:** Lose 3 credibility
- **No consensus:** All broadcasts discarded, no scoring

### Win Conditions
First to achieve any of these:
- 60 audience points
- 12 total conspiracies revealed
- 6 rounds completed (highest audience wins)

---

## Game Features

✅ **Full MVP Complete**
- 4-phase game loop working
- 12 conspiracy cards with wild-eyed flavor text
- 60 evidence cards with conspiracy podcast energy
- Visual feedback for valid/invalid assignments
- Detailed scoring breakdown
- Contextual help system

✅ **UX Polish**
- Green glow for valid evidence assignments
- Dimmed display for invalid choices
- Contextual hints when buttons are disabled
- Phase-specific strategy tips
- Hot-seat multiplayer reminders

---

## Documentation

- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current status, recent fixes, and next steps
- **[signal_noise_rules.md](signal_noise_rules.md)** - Full game rules
- **[signal_noise_quickplay.md](signal_noise_quickplay.md)** - Quick reference guide
- **[signal_noise_claude_md.md](signal_noise_claude_md.md)** - Design specifications

---

## Known Issues

No critical bugs. See [PROJECT_STATUS.md](PROJECT_STATUS.md) for details.

---

## Next Steps

### Recommended Improvements (Phase 2)
1. Fix grammar ("1 cards" → "1 card")
2. Add animations for card plays and consensus triggers
3. Show live consensus progress during BROADCAST phase
4. Mobile-friendly responsive design
5. Sound effects (optional)

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for complete roadmap.

---

## Tech Stack

- React 18 with TypeScript
- Create React App (legacy but functional)
- Hot-seat multiplayer (local only)
- No backend required

---

## Development

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests (if added)
npm test
```

---

## Credits

**Theme:** Conspiracy theory podcast satire
**Gameplay:** Social deduction with consensus mechanics
**Target Audience:** 2-4 players who enjoy dark humor

Built with Claude Code.

---

## License

Prototype/proof-of-concept. Check with original designer for commercial licensing.

---

**Current Status:** ✅ Playable MVP Complete
**Last Updated:** 2025-10-20

Ready to play! See [PROJECT_STATUS.md](PROJECT_STATUS.md) for detailed next steps.
