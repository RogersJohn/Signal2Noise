# Changelog

All notable changes to Signal to Noise.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.3.0] - 2025-10-24

### Added
- **Q33 - Tier-Based Point Bonuses**
  - Tier 1 conspiracies: +1 base point (easy - lots of evidence)
  - Tier 2 conspiracies: +2 base points (medium - moderate evidence)
  - Tier 3 conspiracies: +3 base points (hard - scarce evidence)
  - Rewards players for successfully building consensus on difficult conspiracies with less evidence
  - Applied to both App.tsx and gameSimulation.ts

### Changed
- **Evidence Distribution Rebalanced** - 20 cards reassigned to create inverse tier-difficulty relationship
  - **Tier 1 conspiracies** (low points): Now have MORE evidence (6-12 cards each, avg 8.3)
  - **Tier 2 conspiracies** (medium points): Moderate evidence (4-6 cards each, avg 5.0)
  - **Tier 3 conspiracies** (high points): Less evidence (2-4 cards each, avg 3.0)
  - All reassignments maintain thematic consistency

- **Evidence Reassignments from Tier 3 → Tier 1** (8 cards):
  - Offshore Bank Records (2) → chemtrails
  - Luxury Purchases (2) → celebrity_death
  - Accounting Audit (2) → fluoride
  - Employee NDA Violations (2) → subliminal_ads

- **Evidence Reassignments from Tier 2 → Tier 1** (12 cards):
  - Photo Inconsistencies (2) → bigfoot
  - Missing Physical Evidence (2) → crop_circles
  - Patent Applications (2) → fluoride
  - Revenue Projections (2) → subliminal_ads
  - Statistical Impossibilities (2) → fluoride
  - Foreign Government Contracts (2) → chemtrails

### Documentation
- Updated COMPREHENSIVE_GAME_RULES.md with tier system explanation and updated scoring examples
- Updated README.md version to 2.3.0
- Updated QUICK_REFERENCE.md with tier bonus in scoring formula
- Created EVIDENCE_REASSIGNMENT_PLAN.md documenting strategic reassignment decisions
- Created TIER_DISTRIBUTION_FINAL.md showing final evidence counts per tier

### Impact
- Higher risk (scarce evidence) now yields higher reward (tier bonus)
- Encourages players to pursue difficult conspiracies for bonus points
- Makes tier system mechanically meaningful beyond cosmetic flavor
- Adds strategic depth to conspiracy selection

---

## [2.2.0] - 2025-10-24

### Changed
- **Q27 - Diminishing Returns for Evidence Stacking**
  - First evidence card on a conspiracy gets full specificity bonus (+3 for specific, +1 for ALL)
  - All subsequent cards on same conspiracy get reduced +1 bonus only
  - Encourages distributing evidence across conspiracies rather than stacking on one
  - Applied to both App.tsx and gameSimulation.ts

- **Q26 - Novelty Bonus Clarification**
  - Novelty bonus (+2) is per conspiracy, not global
  - Each evidence card earns novelty bonus first time used on each specific conspiracy
  - Documentation clarified to reflect existing behavior (code was already correct)

### Fixed
- **Excitement Multiplier Bug**: EXCITING cards now correctly get ×2.0 multiplier
  - Was incorrectly set to ×1.5 in App.tsx
  - gameSimulation.ts already had correct ×2.0 value
  - All scoring examples updated to reflect correct calculations

### Documentation
- Updated COMPREHENSIVE_GAME_RULES.md with new scoring formula and examples
- Updated README.md scoring section
- Updated QUICK_REFERENCE.md with condensed new rules
- Created GAME_DESIGNER_QUESTIONS.md with 100 design questions and answers
- Reorganized test results into signal-to-noise/test-results/ folder

### Evaluated but Not Implemented
- **Q33 - Tier-Based Point Bonuses**: NOT implemented
  - Condition: "only if higher tier cards have less specific evidence"
  - Analysis showed: Higher tiers have MORE evidence (Tier 1: ~5, Tier 2: ~7.5, Tier 3: 8)
  - Decision: Keep conspiracy tiers as cosmetic flavor only

### Testing
- All TypeScript compilation passes
- All gameLogic.test.ts unit tests pass (23/23)
- Game balance will need re-testing with new diminishing returns mechanic

---

## [2.1.0] - 2025-10-22

### Major Changes - Balance Overhaul & Documentation Cleanup

#### Balance Changes

**Excitement Multiplier Increased**
- **Old**: ×1.5 for exciting cards
- **New**: ×2.0 for exciting cards (★★★)
- Boring cards (☆☆☆) now explicitly round UP on odd numbers (3→2, 1→1)
- Makes exciting evidence significantly more valuable and strategic

**Escalating Bluff Penalties**
- **Old**: Flat -2 credibility per bluff
- **New**: Escalating penalties for serial bluffing
  - 1st bluff: -2 credibility
  - 2nd bluff: -3 credibility
  - 3rd bluff: -4 credibility
  - 4th+ bluff: -5 credibility (capped)
- Adds `totalBluffs` tracking to PlayerState
- Punishes habitual bluffing while keeping occasional bluffs viable

**Advertise Phase Refinements**
- Added -1 audience penalty for advertising deception
  - Advertise conspiracy A, broadcast on B = -1 audience
- Added post-advertise bonus evidence placement
  - After all ads are visible, each player places 1 card anywhere
- Removed incorrect score bonuses from advertisements

**AI Personality Fixes**
- Reckless Gambler: bluffFrequency 0.7 → 0.5
- Steady Builder: evidenceThreshold 0.65 → 0.50
- Meta-Reader: evidenceThreshold 0.7 → 0.55
- Chaos Agent: bluffFrequency 0.6 → 0.5

#### Game Balance Results

1000-game round robin tournament shows improved balance:
- **V2.0.0 balance**: 78.5% win rate spread (broken)
- **V2.1.0 balance**: 42.4% win rate spread (acceptable)
- Top tier tightened: Reckless Gambler (50.25%), Conspiracy Theorist (49.83%), Chaos Agent (45.80%)
- Remaining issue: Passive personalities (Truth Seeker, Paranoid Skeptic) still underperforming

#### Documentation Overhaul

**Created**
- `QUICK_REFERENCE.md` - One-page print-friendly cheat sheet
- `archives/2025-10-22-balance-testing/` - Archived outdated reports
- Updated excitement badges in UI tooltips

**Updated**
- `README.md` - Comprehensive rulebook with all current rules
- `signal-to-noise/README.md` - Simplified front page highlighting ADVERTISE phase
- `TUTORIAL-MODE-README.md` - Verified current with all 5 phases
- All documentation now consistent and accurate

**Archived**
- `ANALYTICS_REPORT.md` (outdated, pre-balance changes)
- `MONTE_CARLO_REPORT.md` (outdated, pre-balance changes)
- Replaced by `ROUND_ROBIN_TOURNAMENT_REPORT.md` (1000 games, current rules)

#### Testing
- All unit tests passing (gameLogic.test.ts)
- All AI tests passing (aiPersonalities.test.ts)
- All simulation tests passing (gameSimulation.test.ts)
- TypeScript compilation clean

### Changed
- UI: Excitement badges now show ×2.0 multiplier
- UI: Tooltips clarified for boring card rounding behavior
- Test expectations: Updated from 3 to 7 initial cards per player

### Fixed
- Documentation duplication eliminated
- Incorrect advertisement scoring removed
- Missing advertise deception penalty added
- Missing post-advertise evidence placement added

---

## [2.0.0] - 2025-10-22

### Major Changes - ADVERTISE Phase Implementation

#### Added
- **ADVERTISE Phase** - New psychological warfare phase between INVESTIGATE and BROADCAST
  - Players publicly signal which conspiracy interests them
  - Advertisements are visible to all but NOT binding
  - Players can pass to keep intentions secret
  - Creates opportunities for bandwagoning, deception, and trap-setting

#### Game Flow Updated
- **Old**: INVESTIGATE → BROADCAST → RESOLVE → CLEANUP (4 phases)
- **New**: INVESTIGATE → **ADVERTISE** → BROADCAST → RESOLVE → CLEANUP (5 phases)

#### AI Enhancements
- Added `makeAdvertiseDecision()` function with 4 distinct strategies:
  1. Honest signaling (advertise where AI has real evidence)
  2. Deceptive advertising (traps - advertise without evidence)
  3. Bandwagoning (follow the crowd's advertisements)
  4. Counter-signaling (contrarians avoid popular conspiracies)
- Updated `makeAIDecision()` to consider advertiseQueue data
- AI personalities now use advertisements to inform broadcast decisions

#### Components Added
- `AdvertiseQueue.tsx` - Displays player advertisements
- `TutorialMode.tsx` - Interactive tutorial system with phase-specific guidance

#### Documentation
- **Major cleanup**: Archived 18 outdated documentation files to `/archive/2025-10-22_pre-advertise-phase-cleanup/`
- Created new authoritative `README.md` with accurate 5-phase game flow
- Updated `TUTORIAL-MODE-README.md` with all 5 phases documented
- Added `ARCHIVE_MANIFEST.md` explaining what was archived and why

#### Testing
- All existing tests passing (gameLogic, aiPersonalities, gameSimulation)
- Game simulation updated with ADVERTISE phase loop
- AI personalities fully integrated with ADVERTISE mechanics

### Changed
- Phase indicators updated to include ADVERTISE (Purple)
- Help panel updated with ADVERTISE phase content
- Tutorial system expanded from 4 to 5 phases
- Game flow now enforces ADVERTISE after INVESTIGATE

### Fixed
- Documentation contradictions eliminated (was describing 3-4 different phase systems)
- Removed duplication across 20+ markdown files
- Clarified consensus-based vs truth-based scoring in all docs

---

## [1.0.0] - 2025-10-20

### Initial Release - Playable MVP

#### Added
- Complete 4-phase game loop (INVESTIGATE → BROADCAST → RESOLVE → CLEANUP)
- Hot-seat multiplayer for 2-4 players
- Consensus-based scoring with dynamic thresholds
- 12 conspiracy cards with humorous flavor text
- 60 evidence cards with conspiracy podcast energy
- Win condition detection (60 audience, 12 revealed, or 6 rounds)
- Visual feedback system (green glow for valid, dimmed for invalid)
- Contextual help system
- Detailed scoring breakdown in ResolveResults component

#### Components Created
- `ResolveResults.tsx` - Detailed scoring screen
- `HelpPanel.tsx` - Collapsible contextual help
- `GameSetup.tsx` - Player count selection
- `PhaseIndicator.tsx` - Current phase display
- `ActionButtons.tsx` - Phase-specific controls
- `ConspiracyBoard.tsx` - Conspiracy card grid
- `PlayerHand.tsx` - Evidence cards and assignments
- `BroadcastQueue.tsx` - Shows all player broadcasts

#### Fixed
- Critical: Player cycling in INVESTIGATE phase
- Critical: Shallow copy bug in assignedEvidence
- Player display showing IDs instead of names
- Consensus threshold implementation

---

## Version Numbering

Following [Semantic Versioning](https://semver.org/):
- **MAJOR** (X.0.0) - Breaking gameplay changes, new core mechanics
- **MINOR** (0.X.0) - New features, enhancements (non-breaking)
- **PATCH** (0.0.X) - Bug fixes, polish, documentation

Current: **2.0.0** (ADVERTISE Phase Update)
