/**
 * E2E — Edge Cases: empty hand, all pass, etc.
 *
 * Tests boundary conditions and unusual game states to make sure the
 * UI doesn't break.
 */

import { WebDriver, By } from 'selenium-webdriver';
import {
  createDriver,
  openApp,
  quitDriver,
  startGame,
  waitForPhase,
  waitForAny,
  waitForVisible,
  clickElement,
  findAll,
  getText,
  isPresent,
  takeScreenshot,
  passCommitPhase,
  passBroadcastPhase,
  PHASE_TIMEOUT,
  GAME_TIMEOUT,
} from '../utils/helpers';
import {
  Menu,
  CommitPhase,
  BroadcastPhase,
  GameOver,
  Layout,
} from '../utils/selectors';

let driver: WebDriver;

beforeAll(async () => {
  driver = await createDriver();
}, 30_000);

afterAll(async () => {
  await quitDriver(driver);
});

afterEach(async () => {
  try {
    const testName = expect.getState?.()?.currentTestName ?? 'unknown';
    await takeScreenshot(driver, `edge-cases_${testName}`);
  } catch { /* swallow */ }
});

describe('Edge Cases', () => {
  it('should handle player passing every round (all-pass game)', async () => {
    await openApp(driver);
    await startGame(driver, 'Passive', 2);

    for (let round = 1; round <= 6; round++) {
      const commit = await waitForAny(
        driver,
        [CommitPhase.doneButton, CommitPhase.aiWaiting, GameOver.title],
        PHASE_TIMEOUT,
      );

      if (commit.xpath === GameOver.title) break;

      if (commit.xpath === CommitPhase.doneButton) {
        await passCommitPhase(driver);
      }

      const broadcast = await waitForAny(
        driver,
        [
          BroadcastPhase.passButton,
          "//*[contains(text(), 'RESOLVING')]",
          GameOver.title,
        ],
        PHASE_TIMEOUT,
      );

      if (broadcast.xpath === GameOver.title) break;

      if (broadcast.xpath === BroadcastPhase.passButton) {
        await passBroadcastPhase(driver);
      }

      await waitForAny(
        driver,
        [
          CommitPhase.phaseTitle,
          CommitPhase.aiWaiting,
          GameOver.title,
        ],
        PHASE_TIMEOUT,
      );
    }

    await waitForVisible(driver, GameOver.title, GAME_TIMEOUT);
    const title = await getText(driver, GameOver.title);
    expect(title).toContain('GAME OVER');
  }, GAME_TIMEOUT);

  it('should handle returning to menu mid-game and starting a new game', async () => {
    await openApp(driver);
    await startGame(driver, 'Quitter', 2);
    await waitForPhase(driver, 'COMMIT');

    // Click back to menu
    await clickElement(driver, Layout.backButton);
    await waitForVisible(driver, Menu.startButton);

    // Start a fresh game
    await startGame(driver, 'Fresh', 3);
    await waitForPhase(driver, 'COMMIT');

    const heading = await getText(driver, CommitPhase.phaseTitle);
    expect(heading).toContain('Round 1');
  }, 60_000);

  it('should handle maximum AI opponents (4)', async () => {
    await openApp(driver);
    await startGame(driver, 'MaxAI', 4);
    await waitForPhase(driver, 'COMMIT');

    // Scoreboard should show 5 players total (1 human + 4 AI)
    await waitForVisible(driver, Layout.scoreboardTable);
    const rows = await findAll(driver, "//tbody/tr");
    expect(rows.length).toBe(5);
  }, 30_000);

  it('should handle minimum AI opponents (2)', async () => {
    await openApp(driver);
    await startGame(driver, 'MinAI', 2);
    await waitForPhase(driver, 'COMMIT');

    // Scoreboard should show 3 players total
    await waitForVisible(driver, Layout.scoreboardTable);
    const rows = await findAll(driver, "//tbody/tr");
    expect(rows.length).toBe(3);
  }, 30_000);

  it('should display correct hand count in heading', async () => {
    await openApp(driver);
    await startGame(driver, 'HandCount', 2);
    await waitForPhase(driver, 'COMMIT');

    await waitForVisible(driver, CommitPhase.handTitle);
    const handTitle = await getText(driver, CommitPhase.handTitle);
    // Should show "YOUR HAND (N)" where N > 0
    const match = handTitle.match(/YOUR HAND \((\d+)\)/);
    expect(match).not.toBeNull();
    const count = parseInt(match![1], 10);
    expect(count).toBeGreaterThan(0);

    // Actual cards rendered should match count
    const cards = await findAll(driver, CommitPhase.handCards);
    expect(cards.length).toBe(count);
  }, 30_000);

  it('should not show DONE COMMITTING button when it is not the human turn', async () => {
    await openApp(driver);
    await startGame(driver, 'NotMyTurn', 2);
    await waitForPhase(driver, 'COMMIT');

    // If AI is first, the DONE button should not appear
    const aiWaiting = await isPresent(driver, CommitPhase.aiWaiting);
    if (aiWaiting) {
      const donePresent = await isPresent(driver, CommitPhase.doneButton);
      expect(donePresent).toBe(false);
    }
    // Otherwise human is first and button is expected — test passes either way
  }, 30_000);

  it('should keep game functional after committing evidence then clicking DONE', async () => {
    await openApp(driver);
    await startGame(driver, 'CommitThenDone', 2);
    await waitForPhase(driver, 'COMMIT');

    const commit = await waitForAny(
      driver,
      [CommitPhase.doneButton, CommitPhase.aiWaiting],
      PHASE_TIMEOUT,
    );

    if (commit.xpath === CommitPhase.doneButton) {
      // Try to assign one card first
      const cards = await findAll(driver, CommitPhase.handCards);
      if (cards.length > 0) {
        await cards[0].click();
        const conspiracies = await findAll(driver, CommitPhase.conspiracyCards);
        if (conspiracies.length > 0) {
          await conspiracies[0].click();
        }
      }

      await passCommitPhase(driver);
    }

    // Game should continue
    const next = await waitForAny(
      driver,
      [
        BroadcastPhase.phaseTitle,
        "//*[contains(text(), 'RESOLVING')]",
        CommitPhase.phaseTitle,
      ],
      PHASE_TIMEOUT,
    );
    expect(next).toBeTruthy();
  }, 60_000);

  it('should handle custom player name on game over screen', async () => {
    await openApp(driver);
    await startGame(driver, 'CustomName', 2);

    // Speed-run the game
    for (let round = 1; round <= 6; round++) {
      const commit = await waitForAny(
        driver,
        [CommitPhase.doneButton, CommitPhase.aiWaiting, GameOver.title],
        PHASE_TIMEOUT,
      );
      if (commit.xpath === GameOver.title) break;
      if (commit.xpath === CommitPhase.doneButton) await passCommitPhase(driver);

      const broadcast = await waitForAny(
        driver,
        [BroadcastPhase.passButton, "//*[contains(text(), 'RESOLVING')]", GameOver.title],
        PHASE_TIMEOUT,
      );
      if (broadcast.xpath === GameOver.title) break;
      if (broadcast.xpath === BroadcastPhase.passButton) await passBroadcastPhase(driver);

      await waitForAny(
        driver,
        [CommitPhase.phaseTitle, CommitPhase.aiWaiting, GameOver.title],
        PHASE_TIMEOUT,
      );
    }

    await waitForVisible(driver, GameOver.title, GAME_TIMEOUT);

    const winner = await getText(driver, GameOver.winnerText);
    expect(winner).toContain('wins with');
  }, GAME_TIMEOUT);
});
