# Signal to Noise

A strategic deception game where truth is determined by consensus, not reality.

## 🎮 Quick Start

```bash
npm install
npm start
```

Opens at [http://localhost:3000](http://localhost:3000)

---

## 📖 Game Overview

**Signal to Noise** is a multiplayer social deduction game for **3-5 players** where you compete to build the largest audience by broadcasting claims about conspiracy theories.

### The Twist

There is no objective truth - reality is determined by what the **majority believes**. Your goal is to form consensus, not find facts.

### Core Gameplay

Each of the **6 rounds** has **5 phases**:

1. **🔍 INVESTIGATE** (Blue) - Secretly assign evidence cards to conspiracies
2. **📢 ADVERTISE** (Purple) - **Signal your intentions** to other players (NEW!)
3. **📻 BROADCAST** (Orange) - Make public claims (REAL / FAKE / INCONCLUSIVE)
4. **⚖️ RESOLVE** (Green) - Consensus checked, points scored
5. **🧹 CLEANUP** (Gray) - Revealed conspiracies replaced, next round begins

### The ADVERTISE Phase

The ADVERTISE phase is where the **psychological warfare** happens:

- **Publicly signal** which conspiracy you're interested in
- See what **others** are signaling
- Form **alliances** or set **traps**
- **Deception** is allowed but costs -1 audience if you broadcast elsewhere
- After seeing all ads, place **one bonus evidence card** anywhere

Use advertisements to coordinate consensus - or mislead your opponents!

---

## 🎯 Win Condition

After **6 rounds**, the player with the **highest audience score** wins!

*(Alternative early wins: 60 audience points or 12 conspiracies revealed - but 99.7% of games go to round 6)*

---

## 📚 Full Documentation

For complete rules, strategy tips, and development docs, see:

**[Main README](../README.md)** - Complete rulebook with phase breakdowns, scoring formulas, and strategy guide

**[TUTORIAL-MODE-README.md](../TUTORIAL-MODE-README.md)** - Interactive tutorial system documentation

**[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** - One-page cheat sheet (print-friendly!)

---

## 🧪 Testing & Development

### Run Tests

```bash
npm test
```

### Run 1000-Game Tournament

```bash
npm test -- --testPathPattern=gameSimulation.test.ts --watchAll=false --testNamePattern="Round Robin Tournament"
```

Generates `ROUND_ROBIN_TOURNAMENT_REPORT.md` with balance data for all 12 AI personalities.

### Build for Production

```bash
npm run build
```

---

## 🎴 Quick Reference

- **Players**: 3-5
- **Rounds**: 6
- **Phases per round**: 5
- **Starting credibility**: 5 (range 0-10)
- **Consensus threshold**: 2 votes (3-4 players) or 3 votes (5 players)
- **Bluff penalty**: Escalating (-2, -3, -4, -5)
- **Advertise deception**: -1 audience
- **Win condition**: Highest audience after 6 rounds

---

## 🐛 Known Issues

- Tutorial mode may overlap on small screens (<1280px)
- Truth Seeker and Paranoid Skeptic AI personalities never broadcast (by design, but underperforming)
- Evidence deck can run out in long games (implement reshuffle)

---

## 📊 Current Balance (1000-game tournament)

| Rank | Personality | Win Rate |
|------|-------------|----------|
| 1 | Reckless Gambler | 50.25% |
| 2 | Conspiracy Theorist | 49.83% |
| 3 | Chaos Agent | 45.80% |
| ... | ... | ... |
| 12 | Paranoid Skeptic | 7.86% |

**Win rate spread**: 42.4% (acceptable but needs work on passive personalities)

See `ROUND_ROBIN_TOURNAMENT_REPORT.md` for detailed matchup data.

---

**Built with React + TypeScript** | **Version 2.3.0** | **Game Design: Consensus-Based Social Deduction**
