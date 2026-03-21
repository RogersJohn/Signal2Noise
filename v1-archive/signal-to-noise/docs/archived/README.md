# Test Results and Balance Reports

This folder contains all AI testing and balance analysis reports for Signal to Noise.

## Current Test Reports (Version 2.1.0)

### Primary Balance Report
- **ROUND_ROBIN_TOURNAMENT_REPORT.md** - Comprehensive 1000-game tournament with all 12 AI personalities (October 22, 2025)
  - Definitive balance assessment
  - Per-personality win rates and statistics
  - Overall game health metrics

### Alternative Format Testing
- **HOMOGENEOUS_GROUP_REPORT.md** - 1,200 games with identical AI personalities (4v same)
- **MAJORITY_MINORITY_REPORT.md** - 3,300 games testing 3+1 majority/minority dynamics
- **TEAM_2V2_REPORT.md** - 1,650 games testing 2v2 team format
- **COALITION_2_1_1_REPORT.md** - 9,900 games testing 2+1+1 coalition dynamics

### Special Analysis
- **EVOLUTIONARY_REPORT.md** - 2,500 games using evolutionary algorithm to discover exploits
- **PHYSICAL_GAME_ASSESSMENT.md** - Readiness assessment for physical playtesting (28,550+ total simulated games)

## Total Games Simulated

**28,550+ games** across all formats

## How to Generate Reports

### Round Robin Tournament (1000 games)
```bash
npm test -- --testPathPattern=gameSimulation.test.ts --watchAll=false --testNamePattern="Round Robin Tournament"
```

### All Format Tests
```bash
npm test -- --testPathPattern=gameSimulation.test.ts --watchAll=false
```

## Archived Reports

Outdated pre-balance reports are archived in:
- `../../archives/2025-10-22-balance-testing/`

---

**Last Updated:** October 24, 2025
