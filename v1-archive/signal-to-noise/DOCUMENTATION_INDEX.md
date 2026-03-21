# Signal to Noise - Documentation Index

> Master index of all project documentation

**Last Updated:** October 26, 2025 | **Game Version:** 5.1

---

## 📖 Quick Navigation

### For Players
- **[Start Here: Main README](README.md)** - Project overview, quick start, and feature summary
- **[Comprehensive Rules](docs/rules/COMPREHENSIVE_RULES.md)** - Complete rulebook with examples and FAQ
- **[Quickplay Cheatsheet](docs/rules/QUICKPLAY_CHEATSHEET.md)** - One-page reference guide

### For Developers
- **[Test Results](test-results/README.md)** - AI simulation reports and balance analysis
- **[Source Code](src/)** - React/TypeScript implementation

---

## 📁 Documentation Structure

```
signal-to-noise/
├── README.md                          # Main project documentation
├── DOCUMENTATION_INDEX.md             # This file - master index
│
├── docs/
│   ├── rules/                         # Player-facing rules
│   │   ├── COMPREHENSIVE_RULES.md     # Full rulebook (16KB)
│   │   └── QUICKPLAY_CHEATSHEET.md    # Quick reference (5KB)
│   │
│   └── archived/                      # Historical documentation
│       ├── COALITION_2_1_1_REPORT.md  # Oct 22 - Archived
│       ├── EVOLUTIONARY_REPORT.md     # Oct 22 - Archived
│       ├── HOMOGENEOUS_GROUP_REPORT.md # Oct 22 - Archived
│       ├── MAJORITY_MINORITY_REPORT.md # Oct 22 - Archived
│       ├── PHYSICAL_GAME_ASSESSMENT.md # Oct 22 - Archived
│       ├── README.md                  # Old test-results index
│       ├── ROUND_ROBIN_TOURNAMENT_REPORT.md # Oct 22 - Archived
│       └── TEAM_2V2_REPORT.md         # Oct 22 - Archived
│
└── test-results/                      # Current test reports
    ├── README.md                      # Test results index
    ├── ANALYTICS_REPORT.md            # Oct 26 - Latest analytics
    ├── COALITION_2_1_1_REPORT.md      # Oct 26 - Latest coalition test
    ├── EVOLUTIONARY_REPORT.md         # Oct 26 - Latest evolutionary test
    ├── HOMOGENEOUS_GROUP_REPORT.md    # Oct 26 - Latest homogeneous test
    ├── KNOCKOUT_TOURNAMENT_REPORT.md  # Oct 26 - Knockout tournament
    ├── MAJORITY_MINORITY_REPORT.md    # Oct 26 - Latest majority/minority
    ├── MONTE_CARLO_REPORT.md          # Oct 26 - Monte Carlo validation
    ├── ROUND_ROBIN_TOURNAMENT_REPORT.md # Oct 26 - Latest tournament
    └── TEAM_2V2_REPORT.md             # Oct 26 - Latest team analysis
```

---

## 📚 Documentation by Category

### Game Rules & Gameplay

| Document | Description | Audience | Size |
|----------|-------------|----------|------|
| [COMPREHENSIVE_RULES.md](docs/rules/COMPREHENSIVE_RULES.md) | Complete rulebook with examples, strategy tips, FAQ, and variants | Players | 16KB |
| [QUICKPLAY_CHEATSHEET.md](docs/rules/QUICKPLAY_CHEATSHEET.md) | One-page quick reference for gameplay | Players | 5KB |

**Summary:**
- Full rules with phase-by-phase breakdowns
- Scoring tables and reference charts
- Strategy tips and common mistakes
- Complete game example walkthrough
- Print-friendly cheatsheet

---

### Testing & Balance Reports

| Document | Description | Games | Date |
|----------|-------------|-------|------|
| [MONTE_CARLO_REPORT.md](test-results/MONTE_CARLO_REPORT.md) | Latest validation of all game mechanics | 500 | Oct 26 |
| [ANALYTICS_REPORT.md](test-results/ANALYTICS_REPORT.md) | Comprehensive analytics across formats | Various | Oct 26 |
| [ROUND_ROBIN_TOURNAMENT_REPORT.md](test-results/ROUND_ROBIN_TOURNAMENT_REPORT.md) | AI personality balance analysis | 1000 | Oct 26 |
| [KNOCKOUT_TOURNAMENT_REPORT.md](test-results/KNOCKOUT_TOURNAMENT_REPORT.md) | Single-elimination format testing | Varies | Oct 26 |
| [HOMOGENEOUS_GROUP_REPORT.md](test-results/HOMOGENEOUS_GROUP_REPORT.md) | Identical personality matchups | 1200 | Oct 26 |
| [MAJORITY_MINORITY_REPORT.md](test-results/MAJORITY_MINORITY_REPORT.md) | 3+1 dynamics testing | 3300 | Oct 26 |
| [TEAM_2V2_REPORT.md](test-results/TEAM_2V2_REPORT.md) | Team format analysis | 1650 | Oct 26 |
| [COALITION_2_1_1_REPORT.md](test-results/COALITION_2_1_1_REPORT.md) | Coalition dynamics | 9900 | Oct 26 |
| [EVOLUTIONARY_REPORT.md](test-results/EVOLUTIONARY_REPORT.md) | Exploit discovery analysis | 2500 | Oct 26 |

**Summary:**
- **500+ games** in latest Monte Carlo validation
- **28,000+ games** total across all formats
- All game mechanics validated as working correctly
- No game-breaking exploits discovered
- Escalating bluff system prevents abuse

---

### Archived Documentation

Historical test reports from October 22, 2025 (pre-final balance):
- Located in `docs/archived/`
- Contains earlier tournament results
- Superseded by October 26 reports in `test-results/`

---

## 🎯 Key Game Information

### Current Rules (Version 5.1)

**Setup:**
- 3-5 players
- 5 conspiracies active per game
- 7 cards starting hand (10 card limit)
- 5 Credibility, 5 Audience starting resources

**Round Structure:**
- 6 rounds total
- Round 1: TWO Investigate phases (special rule)
- Rounds 2-6: ONE Investigate phase each
- 6 phases per round: Investigate → Advertise → Late-Breaking Evidence → Broadcast → Resolve → Cleanup

**Scoring:**
- Correct broadcast with evidence: +3 Audience
- Bluff (1st-2nd): -2 Credibility
- Bluff (3rd+): -3 Credibility
- Advertising mismatch: -1 Audience
- Credibility = 0: Eliminated (bankruptcy)

**Win Condition:**
- Primary: Highest Audience after 6 rounds (tiebreak: Credibility)
- Instant: Last player standing (all others bankrupt)

---

## 🔍 Finding Information

### "I want to learn how to play"
→ Start with [QUICKPLAY_CHEATSHEET.md](docs/rules/QUICKPLAY_CHEATSHEET.md) for quick overview
→ Then read [COMPREHENSIVE_RULES.md](docs/rules/COMPREHENSIVE_RULES.md) for full details

### "I want to understand game balance"
→ See [MONTE_CARLO_REPORT.md](test-results/MONTE_CARLO_REPORT.md) for latest validation
→ Check [test-results/README.md](test-results/README.md) for all balance reports

### "I want to run my own simulations"
→ See [README.md](README.md) Testing & Development section for commands

### "I want to see historical changes"
→ Check [docs/archived/](docs/archived/) for older balance reports

---

## 📊 Documentation Statistics

### Current Documentation (Oct 26, 2025)
- **Rules Documents:** 2 (Comprehensive + Cheatsheet)
- **Test Reports:** 9 (Latest simulations)
- **Archived Reports:** 8 (Historical data)
- **Total Games Simulated:** 28,500+

### File Sizes
- Total Rules Documentation: ~21KB
- Total Test Reports: ~50KB
- Archived Documentation: ~45KB

---

## 🔄 Update History

**October 26, 2025:**
- Created comprehensive rules documentation
- Created quickplay cheatsheet
- Ran 500-game Monte Carlo validation
- Organized all documentation into proper folders
- Archived outdated test reports
- Created this master index

**October 22-24, 2025:**
- Multiple tournament formats tested (28,000+ games)
- Physical game assessment completed
- Balance analysis across AI personalities

---

## 📝 Documentation Standards

### File Naming
- Rules: `UPPERCASE_DESCRIPTION.md`
- Reports: `UPPERCASE_DESCRIPTION_REPORT.md`
- Indexes: `README.md` (per directory)

### Organization
- `/docs/rules/` - Player-facing game rules
- `/docs/archived/` - Historical documentation
- `/test-results/` - Current simulation reports
- Root - Main project README and index

### Update Protocol
1. New test reports go to `test-results/`
2. Outdated reports move to `docs/archived/`
3. Update relevant README files
4. Update this master index

---

## 🚀 Contributing

When adding new documentation:
1. Place in appropriate directory
2. Update the relevant README.md
3. Update this master index
4. Follow naming conventions
5. Include creation date and version

---

**Maintained by:** Signal to Noise Development Team
**Current Version:** 5.1
**Documentation Status:** ✅ Complete and Organized
