# Test Results and Simulation Reports

This directory contains all AI simulation, tournament, and balance analysis reports for Signal to Noise.

## 📊 Latest Reports (October 26, 2025)

### Core Balance & Analytics
- **ANALYTICS_REPORT.md** - Comprehensive analytics across all game formats
- **MONTE_CARLO_REPORT.md** - 500-game Monte Carlo simulation validating latest rules
- **ROUND_ROBIN_TOURNAMENT_REPORT.md** - 1000-game round-robin tournament with all 12 AI personalities

### Tournament Formats
- **KNOCKOUT_TOURNAMENT_REPORT.md** - Single-elimination tournament analysis
- **HOMOGENEOUS_GROUP_REPORT.md** - Games with identical AI personalities (4v same)
- **MAJORITY_MINORITY_REPORT.md** - 3+1 majority/minority dynamics testing
- **TEAM_2V2_REPORT.md** - 2v2 team format analysis
- **COALITION_2_1_1_REPORT.md** - 2+1+1 coalition dynamics testing

### Special Analysis
- **EVOLUTIONARY_REPORT.md** - Evolutionary algorithm testing to discover exploits

## 🎯 Key Findings

**Monte Carlo Validation (500 games):**
- All game mechanics functioning correctly with latest confirmed rules
- Round 1 double-investigate phase working as intended
- Escalating bluff penalties (2 → 3 credibility) validated
- Starting resources: 5 Credibility, 5 Audience confirmed
- Consensus thresholds validated by player count

**Game Balance:**
- Win condition: 6 rounds or bankruptcy elimination
- Bluffing system: Escalating penalties prevent abuse
- Advertising system: -1 Audience penalty for mismatches
- Late-breaking evidence phase adds strategic depth

## 📈 Total Simulations

**500+ games** in latest Monte Carlo validation (October 26, 2025)
**28,000+ games** across all historical tournament formats

## 🔧 How to Generate Reports

### Monte Carlo Simulation (500 games)
```bash
npm test -- --testPathPattern=gameSimulation.test.ts --watchAll=false --testNamePattern="Monte Carlo"
```

### Round Robin Tournament (1000 games)
```bash
npm test -- --testPathPattern=gameSimulation.test.ts --watchAll=false --testNamePattern="Round Robin Tournament"
```

### All Format Tests
```bash
npm test -- --testPathPattern=gameSimulation.test.ts --watchAll=false
```

## 📦 Archived Reports

Older test reports (pre-October 26) are archived in:
- `../docs/archived/`

These contain historical balance data from earlier versions.

---

**Last Updated:** October 26, 2025
**Current Game Version:** 5.1
