# Signal to Noise

> A strategic conspiracy theory game where truth is determined by consensus, not reality.

**Players:** 3-5 | **Duration:** 45-90 minutes | **Version:** 5.1

---

## 🎮 Quick Start

```bash
npm install
npm start
```

Opens at [http://localhost:3000](http://localhost:3000)

---

## 📖 Game Overview

**Signal to Noise** is a social deduction and bluffing game where players compete to become the most trusted conspiracy theorist. Build your audience by making claims about conspiracies, form alliances through advertising signals, and outwit your opponents with strategic bluffing!

### The Core Concept

There is no objective truth in Signal to Noise - reality is determined by **consensus**. Two or more players agreeing makes something "true." Your goal is to form coalitions and score points, not to find facts.

### How to Win

After **6 rounds**, the player with the **highest Audience** score wins!
*(Tiebreaker: Credibility)*

**Instant Win:** Be the last player standing if all others go bankrupt (reach 0 Credibility)

---

## 🎯 Game Structure

Each round consists of **6 phases:**

### Round 1 Special Rule: TWO Investigate Phases!
Round 1 has two Investigate phases before proceeding to Advertise. This gives players extra setup time.

### Phase Flow

1. **🔍 INVESTIGATE** - Draw 3 cards, secretly assign evidence to conspiracies
2. **📢 ADVERTISE** - Publicly signal which conspiracy interests you
3. **⚡ LATE-BREAKING EVIDENCE** - Play 1 card face-up or pass
4. **📡 BROADCAST** - Make your claim (REAL or FAKE) on one conspiracy
5. **⚖️ RESOLVE** - Consensus checked, points scored, bluffs penalized
6. **🧹 CLEANUP** - Reset for next round

---

## 📚 Documentation

### For Players
- **[Comprehensive Rules](docs/rules/COMPREHENSIVE_RULES.md)** - Complete rulebook with examples, strategies, and FAQ
- **[Quickplay Cheatsheet](docs/rules/QUICKPLAY_CHEATSHEET.md)** - One-page reference (print-friendly!)

### For Developers
- **[Test Results](test-results/)** - AI simulation reports and balance analysis
- **[Archived Documentation](docs/archived/)** - Historical balance reports

---

## 🎴 Quick Reference

| Resource | Value |
|----------|-------|
| Starting Credibility | 5 (range: 0-10) |
| Starting Audience | 5 (victory points) |
| Starting Hand | 7 cards |
| Hand Limit | 10 cards |
| Cards per Investigate | 3 |
| Active Conspiracies | 5 |
| Total Rounds | 6 |

### Consensus Thresholds
| Players | Broadcasts Needed |
|---------|------------------|
| 3 | 2 (majority) |
| 4 | 2 (majority) |
| 5 | 3 (majority) |

### Scoring & Penalties
| Event | Effect |
|-------|--------|
| Correct broadcast with evidence | +3 Audience |
| Bluff (1st-2nd) | -2 Credibility |
| Bluff (3rd+) | -3 Credibility |
| Advertising mismatch | -1 Audience |
| Credibility = 0 | ELIMINATED (bankruptcy) |

---

## 🧪 Testing & Development

### Run Tests
```bash
npm test
```

### Run Monte Carlo Simulation (500 games)
```bash
npm test -- --testPathPattern=gameSimulation.test.ts --watchAll=false --testNamePattern="Monte Carlo"
```

Generates validation report in `test-results/MONTE_CARLO_REPORT.md`

### Build for Production
```bash
npm run build
```

---

## 🎨 Game Features

### Core Mechanics
- **Consensus-Based Truth:** Reality is what the majority agrees on
- **Escalating Bluff Penalties:** First 2 bluffs cost 2 Credibility, subsequent bluffs cost 3
- **Advertising Signals:** Telegraph your intentions to form alliances or set traps
- **Late-Breaking Evidence:** Play 1 card face-up for dramatic reveals
- **Bankruptcy Elimination:** Reach 0 Credibility and you're out!

### Evidence System
- **164-card evidence deck** with three proof values:
  - **REAL** - Proves conspiracy is real
  - **FAKE** - Proves conspiracy is fake
  - **BLUFF** - Worthless evidence (doesn't count)
- **Excitement values:** -1 (Boring), 0 (Neutral), +1 (Exciting)
- **Universal or Specific:** Some evidence supports all conspiracies, some are specific

### AI Opponents
- **12 distinct AI personalities** with unique strategies
- **Validated balance:** 500+ game Monte Carlo simulation
- **Varied playstyles:** From cautious Paranoid Skeptic to aggressive Reckless Gambler

---

## 📊 Game Balance

**Latest Validation (October 26, 2025):**
- ✅ 500 complete 4-player games simulated
- ✅ All game mechanics functioning correctly
- ✅ No game-breaking exploits discovered
- ✅ Escalating bluff system prevents abuse
- ✅ Consensus thresholds create interesting dynamics

See [test-results/](test-results/) for detailed balance reports.

---

## 🗂️ Project Structure

```
signal-to-noise/
├── docs/
│   ├── rules/              # Player-facing rules documentation
│   │   ├── COMPREHENSIVE_RULES.md
│   │   └── QUICKPLAY_CHEATSHEET.md
│   └── archived/           # Historical documentation
├── src/
│   ├── components/         # React components
│   ├── data/              # Card data (conspiracies, evidence)
│   ├── gameLogic.ts       # Core game mechanics
│   ├── gameSimulation.ts  # AI simulation engine
│   ├── aiPersonalities.ts # AI decision-making
│   └── types.ts           # TypeScript interfaces
├── test-results/          # Simulation reports
├── public/                # Static assets
└── README.md             # This file
```

---

## 🐛 Known Issues

- Evidence deck can run out in very long games (implement reshuffle planned)
- Some AI personalities are passive and underperform (design choice for variety)

---

## 🚀 Roadmap

- [ ] Evidence deck reshuffling when depleted
- [ ] Advanced rules toggle (counter-broadcasts, credibility effects)
- [ ] Mobile-responsive UI improvements
- [ ] Multiplayer networking support
- [ ] Physical game prototype materials

---

## 📄 License

Copyright © 2025 Signal to Noise Development Team

---

**Built with React + TypeScript** | **Game Design: Consensus-Based Social Deduction** | **Version 5.1**

For complete rules and strategy guides, see [docs/rules/COMPREHENSIVE_RULES.md](docs/rules/COMPREHENSIVE_RULES.md)
