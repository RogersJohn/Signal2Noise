/**
 * Page Object Model — centralised selectors for the Signal to Noise UI.
 *
 * All selectors target visible text or structural patterns so that tests
 * remain resilient to minor styling changes.
 */

// ── Menu Screen ──────────────────────────────────────────────────
export const Menu = {
  /** The main title heading */
  title: "//h1[contains(text(), 'SIGNAL TO NOISE')]",
  /** Player name input */
  nameInput: "//input[@type='text' or not(@type)]",
  /** AI opponent count slider */
  aiSlider: "//input[@type='range']",
  /** START GAME button */
  startButton: "//button[contains(text(), 'START GAME')]",
  /** Version label */
  version: "//*[contains(text(), 'v2.0')]",
};

// ── Shared / Layout ──────────────────────────────────────────────
export const Layout = {
  /** Back-to-menu button */
  backButton: "//button[contains(text(), 'Menu')]",
  /** Scoreboard container heading */
  scoreboardTitle: "//*[contains(text(), 'SCOREBOARD')]",
  /** Scoreboard table */
  scoreboardTable: "//table",
  /** Individual score cells (Score column) — td elements with fa0 colour */
  scoreCells: "//td[contains(@style, '#fa0')]",
};

// ── Commit Phase ─────────────────────────────────────────────────
export const CommitPhase = {
  /** Phase heading */
  phaseTitle: "//*[contains(text(), 'COMMIT PHASE')]",
  /** Instruction text underneath the heading */
  instruction: "//p[contains(text(), 'Select a card') or contains(text(), 'Waiting')]",
  /** Active conspiracies section heading */
  conspiracyBoardTitle: "//*[contains(text(), 'ACTIVE CONSPIRACIES')]",
  /** All conspiracy card buttons on the board */
  conspiracyCards: "//button[.//div[contains(@style, 'font-weight')]]",
  /** A specific conspiracy card by name */
  conspiracyByName: (name: string) =>
    `//button[./div[contains(text(), '${name}')]]`,
  /** Evidence dots on a conspiracy card (the coloured dot spans) */
  evidenceDots: (conspiracyName: string) =>
    `//button[./div[contains(text(), '${conspiracyName}')]]//span[contains(text(), '●')]`,
  /** Player hand heading */
  handTitle: "//*[contains(text(), 'YOUR HAND')]",
  /** All cards in the player hand */
  handCards: "//div[./h3[contains(text(), 'YOUR HAND')]]//button",
  /** A specific hand card by name */
  handCardByName: (cardName: string) =>
    `//div[./h3[contains(text(), 'YOUR HAND')]]//button[./div[contains(text(), '${cardName}')]]`,
  /** DONE COMMITTING button */
  doneButton: "//button[contains(text(), 'DONE COMMITTING')]",
  /** AI-waiting message */
  aiWaiting: "//*[contains(text(), 'AI players are committing')]",
};

// ── Broadcast Phase ──────────────────────────────────────────────
export const BroadcastPhase = {
  /** Phase heading */
  phaseTitle: "//*[contains(text(), 'BROADCAST PHASE')]",
  /** Instruction text */
  instruction: "//p[contains(text(), 'Choose a conspiracy') or contains(text(), 'Waiting')]",
  /** Broadcast order section */
  turnOrder: "//h4[contains(text(), 'Broadcast Order')]",
  /** All REAL buttons (one per conspiracy) */
  realButtons: "//button[text()='REAL']",
  /** All FAKE buttons (one per conspiracy) */
  fakeButtons: "//button[text()='FAKE']",
  /** REAL button for a named conspiracy */
  realButtonFor: (conspiracyName: string) =>
    `//div[./span[contains(text(), '${conspiracyName}')]]//button[text()='REAL']`,
  /** FAKE button for a named conspiracy */
  fakeButtonFor: (conspiracyName: string) =>
    `//div[./span[contains(text(), '${conspiracyName}')]]//button[text()='FAKE']`,
  /** PASS button */
  passButton: "//button[contains(text(), 'PASS')]",
  /** Broadcast entries on conspiracy cards (player: REAL/FAKE labels) */
  broadcastEntries: "//span[contains(text(), 'REAL') or contains(text(), 'FAKE')]",
  /** Action label "Pick a conspiracy:" */
  actionLabel: "//*[contains(text(), 'Pick a conspiracy')]",
};

// ── Resolve Phase ────────────────────────────────────────────────
export const ResolvePhase = {
  /** Phase heading */
  phaseTitle: "//*[contains(text(), 'RESOLVING')]",
  /** "Calculating results" text */
  calculating: "//*[contains(text(), 'Calculating results')]",
  /** Consensus reached label */
  consensus: "//span[contains(text(), 'CONSENSUS')]",
  /** No-consensus label */
  noConsensus: "//span[contains(text(), 'NO CONSENSUS')]",
  /** Point values in results */
  points: "//span[contains(text(), 'pts')]",
  /** First-mover badge */
  firstMoverBadge: "//span[contains(text(), '🥇')]",
  /** Specific-evidence badge */
  specificBadge: "//span[contains(text(), '🎯')]",
  /** Individual result rows */
  resultRows: "//div[contains(@style, '1a1a2e')]",
};

// ── Game Over ────────────────────────────────────────────────────
export const GameOver = {
  /** GAME OVER heading */
  title: "//h1[contains(text(), 'GAME OVER')]",
  /** Winner announcement text */
  winnerText: "//p[contains(text(), 'wins with')]",
};
