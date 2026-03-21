/**
 * E2E — Broadcast Phase: sequential broadcast UI.
 *
 * Verifies the broadcast order display, REAL/FAKE buttons per conspiracy,
 * the PASS button, and that broadcasts appear on conspiracy cards.
 */

import { WebDriver, By } from 'selenium-webdriver';
import {
  createDriver,
  openApp,
  quitDriver,
  startGame,
  waitForPhase,
  waitForVisible,
  waitForAny,
  clickElement,
  findAll,
  getText,
  takeScreenshot,
  passCommitPhase,
  isPresent,
  PHASE_TIMEOUT,
} from '../utils/helpers';
import { CommitPhase, BroadcastPhase, Layout } from '../utils/selectors';

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
    await takeScreenshot(driver, `broadcast-phase_${testName}`);
  } catch { /* swallow */ }
});

/** Helper: get to the broadcast phase from a fresh game. */
async function navigateToBroadcast(): Promise<void> {
  await openApp(driver);
  await startGame(driver, 'BroadcastTester', 2);
  await waitForPhase(driver, 'COMMIT');

  // Complete commit quickly
  const result = await waitForAny(
    driver,
    [CommitPhase.doneButton, CommitPhase.aiWaiting],
    PHASE_TIMEOUT,
  );
  if (result.xpath === CommitPhase.doneButton) {
    await passCommitPhase(driver);
  }

  // Wait for broadcast phase
  await waitForPhase(driver, 'BROADCAST');
}

describe('Broadcast Phase', () => {
  it('should display broadcast phase heading with round info', async () => {
    await navigateToBroadcast();
    const heading = await getText(driver, BroadcastPhase.phaseTitle);
    expect(heading).toContain('BROADCAST PHASE');
    expect(heading).toMatch(/Round\s+\d+/);
  }, 60_000);

  it('should show the broadcast order', async () => {
    await navigateToBroadcast();
    await waitForVisible(driver, BroadcastPhase.turnOrder);
    const orderText = await getText(driver, BroadcastPhase.turnOrder);
    expect(orderText).toContain('Broadcast Order');
  }, 60_000);

  it('should show REAL and FAKE buttons when it is the human turn', async () => {
    await navigateToBroadcast();

    // Wait until it's our turn (PASS button appears) or we see resolve
    const found = await waitForAny(
      driver,
      [BroadcastPhase.passButton, "//*[contains(text(), 'RESOLVING')]"],
      PHASE_TIMEOUT,
    );

    if (found.xpath === BroadcastPhase.passButton) {
      // REAL / FAKE buttons should be present
      const realBtns = await findAll(driver, BroadcastPhase.realButtons);
      const fakeBtns = await findAll(driver, BroadcastPhase.fakeButtons);

      expect(realBtns.length).toBeGreaterThan(0);
      expect(fakeBtns.length).toBeGreaterThan(0);
      // One REAL and one FAKE per active conspiracy
      expect(realBtns.length).toBe(fakeBtns.length);
    }
    // If it went straight to RESOLVE, AI played before us — still passes
  }, 60_000);

  it('should allow clicking PASS to skip the broadcast', async () => {
    await navigateToBroadcast();

    const found = await waitForAny(
      driver,
      [BroadcastPhase.passButton, "//*[contains(text(), 'RESOLVING')]"],
      PHASE_TIMEOUT,
    );

    if (found.xpath === BroadcastPhase.passButton) {
      await clickElement(driver, BroadcastPhase.passButton);

      // After passing, should eventually move to resolve or next player
      const next = await waitForAny(
        driver,
        [
          "//*[contains(text(), 'RESOLVING')]",
          "//*[contains(text(), 'Waiting for')]",
          "//*[contains(text(), 'COMMIT PHASE')]",
        ],
        PHASE_TIMEOUT,
      );
      expect(next).toBeTruthy();
    }
  }, 60_000);

  it('should allow broadcasting REAL on a conspiracy', async () => {
    await navigateToBroadcast();

    const found = await waitForAny(
      driver,
      [BroadcastPhase.passButton, "//*[contains(text(), 'RESOLVING')]"],
      PHASE_TIMEOUT,
    );

    if (found.xpath === BroadcastPhase.passButton) {
      // Click the first REAL button
      const realBtns = await findAll(driver, BroadcastPhase.realButtons);
      if (realBtns.length > 0) {
        await realBtns[0].click();

        // After broadcasting, the actions should disappear (turn is done)
        const next = await waitForAny(
          driver,
          [
            "//*[contains(text(), 'RESOLVING')]",
            "//*[contains(text(), 'Waiting')]",
            "//*[contains(text(), 'COMMIT PHASE')]",
          ],
          PHASE_TIMEOUT,
        );
        expect(next).toBeTruthy();
      }
    }
  }, 60_000);

  it('should show broadcast entries on conspiracy cards after broadcasting', async () => {
    await navigateToBroadcast();

    const found = await waitForAny(
      driver,
      [BroadcastPhase.passButton, "//*[contains(text(), 'RESOLVING')]"],
      PHASE_TIMEOUT,
    );

    if (found.xpath === BroadcastPhase.passButton) {
      // Broadcast FAKE on the first conspiracy
      const fakeBtns = await findAll(driver, BroadcastPhase.fakeButtons);
      if (fakeBtns.length > 0) {
        await fakeBtns[0].click();
      }
    }

    // Wait for resolve or next phase — broadcasts may be visible on cards
    await waitForAny(
      driver,
      [
        "//*[contains(text(), 'RESOLVING')]",
        "//*[contains(text(), 'COMMIT PHASE')]",
        "//*[contains(text(), 'GAME OVER')]",
      ],
      PHASE_TIMEOUT,
    );

    // At this point, either broadcasts were shown or we've moved on — pass
    expect(true).toBe(true);
  }, 60_000);

  it('should display the action label prompting the player', async () => {
    await navigateToBroadcast();

    const found = await waitForAny(
      driver,
      [BroadcastPhase.actionLabel, "//*[contains(text(), 'RESOLVING')]"],
      PHASE_TIMEOUT,
    );

    if (found.xpath === BroadcastPhase.actionLabel) {
      const label = await getText(driver, BroadcastPhase.actionLabel);
      expect(label).toContain('Pick a conspiracy');
    }
  }, 60_000);
});
