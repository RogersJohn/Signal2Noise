# Changelog

All notable changes to Signal to Noise web prototype.

---

## [Unreleased] - Phase 2 Polish

### Planned
- Fix grammar issues ("1 cards" → "1 card")
- Add card play animations
- Add consensus progress indicators during BROADCAST phase
- Improve mobile responsive design
- Add sound effects (optional)
- Track player statistics

---

## [1.0.0] - 2025-10-20 - MVP COMPLETE ✅

### Major Features
- **Complete 4-phase game loop** (INVESTIGATE → BROADCAST → RESOLVE → CLEANUP)
- **Hot-seat multiplayer** for 2-4 players
- **Consensus-based scoring** with dynamic thresholds
- **12 conspiracy cards** with humorous flavor text
- **60 evidence cards** with wild-eyed conspiracy energy
- **Win condition detection** (60 audience, 12 revealed, or 6 rounds)

### UX Enhancements
- **ResolveResults component** - Detailed scoring breakdown showing:
  - Vote counts (REAL vs FAKE)
  - Consensus status
  - Truth reveals
  - Per-player scoring with explanations
- **Visual feedback system**:
  - Green glow for valid evidence assignments
  - Dimmed/grayed out for invalid assignments
  - Selected card highlighting
- **Contextual help system**:
  - Blue hint boxes when buttons disabled
  - Phase-specific instructions in collapsible panel
  - Strategy tips for each phase
- **Hot-seat reminders** - "Only [Player] should look!" warnings

### Bug Fixes
- **CRITICAL: Player cycling in INVESTIGATE phase** - Fixed bug where only first player could investigate
- **CRITICAL: Shallow copy in assignedEvidence** - Fixed shared reference causing incorrect card counts between players
- **Player display** - Fixed conspiracy names showing IDs instead of names
- **Consensus threshold** - Implemented dynamic thresholds (2 for 2p, 3 for 3-4p)

### Content Updates
- Rewrote all conspiracy card descriptions with humorous, paranoid tone
- Rewrote all evidence card flavor text with conspiracy podcast energy
- Added wild-eyed CAPS LOCK emphasis throughout
- Specific "damning" details (timestamps, dollar amounts, etc.)

### Components Created
- `ResolveResults.tsx` - Detailed scoring screen
- `HelpPanel.tsx` - Collapsible contextual help
- `GameSetup.tsx` - Player count selection
- `PhaseIndicator.tsx` - Current phase display
- `ActionButtons.tsx` - Phase-specific controls
- `ConspiracyBoard.tsx` - Conspiracy card grid with visual feedback
- `PlayerHand.tsx` - Evidence cards and assignments
- `BroadcastQueue.tsx` - Shows all player broadcasts

---

## [0.1.0] - 2025-10-19 - Initial Setup

### Created
- React + TypeScript project with create-react-app
- Basic game data structures (`types.ts`)
- Conspiracy deck (12 cards)
- Evidence deck (60 cards)
- Core game logic (`gameLogic.ts`)
- Initial component scaffolding

---

## Development Notes

### Session 2025-10-20 Timeline
1. **Initial testing** - User reported game flow unclear
2. **Added HelpPanel** - Contextual instructions for each phase
3. **User feedback** - Evidence-conspiracy matching unclear
4. **Added visual feedback** - Green glow for valid, dim for invalid
5. **Updated flavor text** - Made cards more humorous and wild
6. **User found bug** - INVESTIGATE phase only let first player act
7. **Fixed player cycling** - All players now get turns
8. **User found bug** - Card counts showing incorrectly
9. **Fixed shallow copy** - assignedEvidence now properly isolated per player
10. **User requested scoring clarity** - Created detailed ResolveResults component
11. **Documentation update** - Created comprehensive project docs

### Testing Coverage
- Full game flow tested with 2-3 players
- Evidence assignment validation tested
- Consensus detection tested (2p and 3p thresholds)
- Win conditions verified
- Hot-seat player cycling verified

### Known Technical Debt
- Using deprecated create-react-app (works but not ideal)
- 9 npm vulnerabilities (non-critical, dependency related)
- No test suite yet
- No CI/CD pipeline
- Grammar issues ("1 cards" instead of "1 card")

---

## Version Numbering

Following [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking gameplay changes
- **MINOR** - New features (non-breaking)
- **PATCH** - Bug fixes and polish

Current: **1.0.0** (Playable MVP Complete)
