/**
 * E2E — Full game flow from start to finish.
 *
 * Starts a game, plays through all 6 rounds (passing on every human turn
 * to let AI drive), and asserts that the GAME OVER screen appears with a
 * declared winner.
 */

import { WebDriver } from 'selenium-webdriver';
import {
  createDriver,
  openApp,
  quitDriver,
  startGame,
  waitForPhase,
  passCommitPhase,
  passBroadcastPhase,
  waitForAny,
  waitForVisible,
  takeScreenshot,
  getText,
  GAME_TIMEOUT,
  PHASE_TIMEOUT,
} from '../utils/helpers';
import { Menu, GameOver, CommitPhase, BroadcastPhase, Layout } from '../utils/selectors';

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
    await takeScreenshot(driver, `game-flow_${testName}`);
  } catch { /* swallow */ }
});

describe('Full Game Flow', () => {
  it('should show the menu screen with START GAME button', async () => {
    await openApp(driver);
    await waitForVisible(driver, Menu.title);
    await waitForVisible(driver, Menu.startButton);

    const title = await getText(driver, Menu.title);
    expect(title).toContain('SIGNAL TO NOISE');
  }, 20_000);

  it('should start a game and enter COMMIT phase', async () => {
    await openApp(driver);
    await startGame(driver, 'E2EPlayer', 2);

    // Should land in COMMIT phase
    await waitForPhase(driver, 'COMMIT');
    const heading = await getText(driver, CommitPhase.phaseTitle);
    expect(heading).toContain('Round 1');
  }, 30_000);

  it('should complete a full game of 6 rounds and show GAME OVER', async () => {
    await openApp(driver);
    await startGame(driver, 'E2EPlayer', 2);

    for (let round = 1; round <= 6; round++) {
      // ── COMMIT ──
      // Wait until commit phase appears (may be our turn or AI-only)
      const commitOrAI = await waitForAny(
        driver,
        [CommitPhase.doneButton, CommitPhase.aiWaiting],
        PHASE_TIMEOUT,
      );

      if (commitOrAI.xpath === CommitPhase.doneButton) {
        await passCommitPhase(driver);
      }
      // else AI is handling commit — wait for broadcast

      // ── BROADCAST ──
      // Wait for broadcast phase or it may skip straight to resolve
      const broadcastOrResolve = await waitForAny(
        driver,
        [BroadcastPhase.passButton, BroadcastPhase.phaseTitle, "//*[contains(text(), 'RESOLVING')]"],
        PHASE_TIMEOUT,
      );

      if (
        broadcastOrResolve.xpath === BroadcastPhase.passButton ||
        broadcastOrResolve.xpath === BroadcastPhase.phaseTitle
      ) {
        // If it's our turn we will see the PASS button
        const passVisible = await driver
          .findElements(
            require('selenium-webdriver').By.xpath(BroadcastPhase.passButton),
          )
          .then(els => els.length > 0);

        if (passVisible) {
          await passBroadcastPhase(driver);
        }
      }

      // ── RESOLVE / NEXT ROUND ──
      // The app auto-resolves and auto-advances; wait for next commit or game over
      if (round < 6) {
        await waitForAny(
          driver,
          [CommitPhase.phaseTitle, CommitPhase.aiWaiting, GameOver.title],
          PHASE_TIMEOUT,
        );
      }
    }

    // ── GAME OVER ──
    await waitForVisible(driver, GameOver.title, GAME_TIMEOUT);

    const title = await getText(driver, GameOver.title);
    expect(title).toContain('GAME OVER');

    // Winner text is present
    const winner = await getText(driver, GameOver.winnerText);
    expect(winner).toContain('wins with');
    expect(winner).toContain('points');

    // Scoreboard still visible
    await waitForVisible(driver, Layout.scoreboardTitle);
  }, GAME_TIMEOUT);

  it('should display correct round numbers during progression', async () => {
    await openApp(driver);
    await startGame(driver, 'RoundCheck', 2);

    await waitForPhase(driver, 'COMMIT');
    const heading = await getText(driver, CommitPhase.phaseTitle);
    // Should show "Round 1/6"
    expect(heading).toMatch(/Round\s+1\/6/);
  }, 30_000);
});
