# Documentation Archive Manifest

**Archive Date:** 2025-10-22
**Reason:** Cleanup of contradictory documentation after ADVERTISE phase implementation

## What Changed

The game was updated to include a **5-phase game loop** with the new **ADVERTISE phase**:

**Current Implementation:**
- INVESTIGATE → **ADVERTISE** → BROADCAST → RESOLVE → CLEANUP (5 phases)
- Consensus-based scoring (no objective truth matters)
- 3-5 players
- INCONCLUSIVE broadcast option available

**Previous Documentation (Archived Here):**
- Various documents described 3-4 phase systems
- Some used old truth-based scoring
- Many described physical board game mechanics not in digital implementation
- Extensive duplication and contradictions

## Archived Files (18 total)

### Outdated Game Documentation
1. **PROJECT_STATUS.md** - Said 4 phases, no ADVERTISE
2. **GAME-RULES.md** - Physical board game rules (GATHER/ASSIGN/BROADCAST/RESOLVE phases)
3. **signal_noise_rules.md** - v4.6 physical board game rules with Counter-Broadcasts
4. **signal_noise_quickplay.md** - Quick reference with 3 phases
5. **SCORING-FORMULA.md** - Detailed scoring (duplicated content now in README)
6. **PRINTING-INSTRUCTIONS.md** - Physical card printing instructions

### Development/Planning Documents
7. **IMPLEMENTATION_PLAN.md** - Old excitement mechanic implementation plan
8. **CHANGE-PLAN.md** - Outdated change planning doc
9. **ASSESSMENT-NEEDED-CHANGES.md** - Outdated assessment doc
10. **SESSION_HANDOFF.md** - Old session notes

### Testing/Analysis Documents
11. **TEST_RESULTS_SUMMARY.md** - Pre-ADVERTISE test results
12. **TESTING_EXECUTIVE_SUMMARY.md** - Pre-ADVERTISE testing summary
13. **TEST-FRAMEWORK-AUDIT.md** - Old test audit
14. **RESOLVE-PHASE-REPORT.md** - Pre-ADVERTISE resolve analysis

### Reference Documents
15. **AI_PERSONALITIES_GUIDE.md** - Pre-ADVERTISE AI guide
16. **GAME_FLOWCHARTS.md** - Flowcharts for old phase system
17. **signal_noise_claude_md.md** - Old design spec
18. **CHANGELOG.md** - Changelog referencing 4-phase system (v1.0.0)

## Current Active Documentation

After cleanup, only these files remain active:

1. **README.md** (root) - Authoritative game overview
2. **TUTORIAL-MODE-README.md** - Tutorial system documentation
3. **signal-to-noise/README.md** - Detailed game rules (5 phases)
4. **ANALYTICS_REPORT.md** - Auto-generated AI performance metrics
5. **MONTE_CARLO_REPORT.md** - Auto-generated game balance analysis
6. **CHANGELOG.md** - New minimal changelog tracking from v2.0.0 forward

## Why This Was Necessary

**Problem:** 20+ markdown files with contradictory information:
- Some said 3 phases, some 4, some 5
- Some described physical game mechanics (player boards, tokens)
- Some used old truth-based scoring vs new consensus-based scoring
- Extensive duplication (same rules explained 3-4 different ways)

**Solution:** Archive everything outdated, keep only:
- Single authoritative README
- Implementation-specific docs (tutorial, analytics)
- Clean changelog going forward

## How to Use This Archive

If you need to reference old design decisions or see how the game evolved:

1. **Game mechanics history:** Check signal_noise_rules.md (v4.6 changelog)
2. **Physical game variant:** Check GAME-RULES.md or PRINTING-INSTRUCTIONS.md
3. **Old testing data:** Check TEST_RESULTS_SUMMARY.md
4. **Development notes:** Check SESSION_HANDOFF.md or IMPLEMENTATION_PLAN.md

## What Was Lost?

**Nothing important.** All current game mechanics are documented in:
- signal-to-noise/README.md (complete 5-phase rules)
- TUTORIAL-MODE-README.md (tutorial content)

The archived files contained:
- Outdated mechanics
- Duplicate information
- Physical game variants not relevant to digital implementation
- Contradictory phase descriptions

If something seems missing, it's likely because it wasn't part of the current implementation.
