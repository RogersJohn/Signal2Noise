# Signal to Noise v2

A social deduction card game about conspiracy theories, evidence, and the power of consensus.

## The Game

3–5 players investigate active conspiracies by secretly committing evidence, then broadcasting their position in sequence. Points are scored based on consensus — not truth. The majority decides reality.

**Core mechanic**: Secret evidence commitment + sequential public broadcast + consensus-as-truth scoring.

## Quick Start

```bash
npm install --legacy-peer-deps
npm start
```

Open [http://localhost:3000](http://localhost:3000) to play against AI opponents.

## Game Flow

Each of the 6 rounds has three phases:

1. **COMMIT** — Secretly assign evidence cards from your hand to conspiracies
2. **BROADCAST** — Take turns declaring a conspiracy REAL or FAKE (or pass)
3. **RESOLVE** — Check for consensus, score points, replace resolved conspiracies

See [RULES.md](RULES.md) for complete rules.

## Project Structure

```
src/
  engine/          # Pure game logic (zero dependencies, 100% tested)
  ai/              # 5 AI strategies + simulation harness
  ui/              # React components (no game logic)
  data/            # 12 conspiracy cards, 48 evidence cards
  logging/         # Structured logging + game recorder
print/             # Print-and-play HTML generation
e2e/               # Selenium E2E tests
v1-archive/        # Original v1 implementation (preserved)
```

## Architecture

The game engine is a pure reducer: `applyAction(state, action) => state`. No side effects, no randomness in the reducer. The React UI dispatches actions and renders state — zero game logic in components.

## AI Strategies

Five distinct AI personalities for solo play:

| Strategy | Style |
|----------|-------|
| Evidence-Only | Conservative — only broadcasts with evidence |
| Aggressive | Broadcasts frequently, sometimes contrarian |
| Follower | Bandwagons onto near-consensus |
| Cautious | Needs strong evidence before acting |
| Opportunist | Reads the room, joins winning sides |

## Development

```bash
npm test                    # Run all tests
npm run test:engine         # Engine tests only
npm run test:ai             # AI simulation tests
npm run build               # Production build
```

## Print & Play

The `print/` directory contains printable HTML files for physical play:
- Conspiracy cards (12 cards, poker-sized)
- Evidence cards (48 cards, poker-sized)
- Rules reference card
- Full rulebook

## License

MIT
