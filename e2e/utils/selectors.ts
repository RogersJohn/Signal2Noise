// Menu screen
export const Menu = {
  startButton: "//*[contains(text(), 'START GAME')]",
  nameInput: "//input",
  aiSlider: "//input[@type='range']",
};

// Layout elements
export const Layout = {
  backButton: "//*[contains(text(), '← Menu')]",
  scoreboardTitle: "//*[contains(text(), 'SCOREBOARD')]",
  scoreboardTable: "//table",
  scoreCells: "//td",
};

// Commit Phase
export const CommitPhase = {
  phaseTitle: "//*[contains(text(), 'COMMIT PHASE')]",
  doneButton: "[data-testid='done-committing']",
  handTitle: "[data-testid='hand-title']",
  handCards: "[data-testid^='hand-card-']",
  conspiracyCards: "[data-testid^='conspiracy-card-']",
  evidenceSummary: "[data-testid='evidence-summary']",
  aiWaiting: "//*[contains(text(), 'Waiting')]",
};

// Signal Display
export const Signals = {
  panel: "[data-testid='signal-panel']",
  dismissButton: "[data-testid='dismiss-signals']",
  signalEntry: "[data-testid^='signal-entry-']",
  header: "//*[contains(text(), 'THE TABLE IS TALKING')]",
};

// Broadcast Phase
export const BroadcastPhase = {
  phaseTitle: "//*[contains(text(), 'BROADCAST PHASE')]",
  passButton: "[data-testid='broadcast-pass']",
  realButton: (id: string) => `[data-testid='broadcast-real-${id}']`,
  fakeButton: (id: string) => `[data-testid='broadcast-fake-${id}']`,
  pointProjection: (id: string) => `[data-testid='point-projection-${id}']`,
};

// AI Narration
export const Narration = {
  bar: "[data-testid='ai-narration']",
  speedToggle: "[data-testid='speed-toggle']",
};

// Resolve Display
export const Resolve = {
  container: "[data-testid='resolve-display']",
  continueButton: "[data-testid='continue-resolve']",
  resultEntry: "[data-testid^='result-']",
  playerScore: "[data-testid^='player-score-']",
  title: "//*[contains(text(), 'RESULTS')]",
};

// Game Over
export const GameOver = {
  container: "[data-testid='game-over']",
  title: "//*[contains(text(), 'GAME OVER')]",
  winnerText: "//*[contains(text(), 'wins with')]",
  playAgain: "//*[contains(text(), 'Play Again')]",
};
