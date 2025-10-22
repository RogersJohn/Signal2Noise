# Changelog

All notable changes to Signal to Noise.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
