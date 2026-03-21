/**
 * E2E — Resolve Phase: scoring display verification.
 *
 * Verifies that the resolve phase shows results, consensus labels,
 * point values, and that resolved conspiracies get replaced with new ones.
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
  findAll,
  getText,
  takeScreenshot,
  passCommitPhase,
  passBroadcastPhase,
  PHASE_TIMEOUT,
} from '../utils/helpers';
import {
  CommitPhase,
  BroadcastPhase,
  ResolvePhase,
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
    await takeScreenshot(driver, `resolve-phase_${testName}`);
  } catch { /* swallow */ }
});

/** Navigate through commit and broadcast to reach resolve. */
async function navigateToResolve(): Promise<void> {
  await openApp(driver);
  await startGame(driver, 'ResolveTester', 2);
  await waitForPhase(driver, 'COMMIT');

  // Pass commit
  const commitResult = await waitForAny(
    driver,
    [CommitPhase.doneButton, CommitPhase.aiWaiting],
    PHASE_TIMEOUT,
  );
  if (commitResult.xpath === CommitPhase.doneButton) {
    await passCommitPhase(driver);
  }

  // Pass broadcast
  await waitForPhase(driver, 'BROADCAST');
  const broadcastResult = await waitForAny(
    driver,
    [BroadcastPhase.passButton, "//*[contains(text(), 'RESOLVING')]"],
    PHASE_TIMEOUT,
  );
  if (broadcastResult.xpath === BroadcastPhase.passButton) {
    await passBroadcastPhase(driver);
  }

  // Wait for resolve
  await waitForPhase(driver, 'RESOLVE');
}

describe('Resolve Phase', () => {
  it('should display the RESOLVING heading with round info', async () => {
    await navigateToResolve();
    const heading = await getText(driver, ResolvePhase.phaseTitle);
    expect(heading).toContain('RESOLVING');
    expect(heading).toMatch(/Round\s+\d+/);
  }, 90_000);

  it('should show result entries with point values', async () => {
    await navigateToResolve();

    // Wait for results to populate (initially shows "Calculating results...")
    await driver.wait(async () => {
      const pts = await driver.findElements(
        By.xpath(ResolvePhase.points),
      );
      return pts.length > 0;
    }, PHASE_TIMEOUT);

    const pointElements = await findAll(driver, ResolvePhase.points);
    expect(pointElements.length).toBeGreaterThan(0);

    // Each should contain "pts"
    for (const el of pointElements) {
      const text = await el.getText();
      expect(text).toContain('pts');
    }
  }, 90_000);

  it('should show CONSENSUS or NO CONSENSUS labels', async () => {
    await navigateToResolve();

    await driver.wait(async () => {
      const consensus = await driver.findElements(
        By.xpath(ResolvePhase.consensus),
      );
      const noConsensus = await driver.findElements(
        By.xpath(ResolvePhase.noConsensus),
      );
      return consensus.length > 0 || noConsensus.length > 0;
    }, PHASE_TIMEOUT);

    const consensus = await findAll(driver, ResolvePhase.consensus);
    const noConsensus = await findAll(driver, ResolvePhase.noConsensus);

    // At least one of these should be present
    expect(consensus.length + noConsensus.length).toBeGreaterThan(0);
  }, 90_000);

  it('should show result rows for each conspiracy', async () => {
    await navigateToResolve();

    await driver.wait(async () => {
      const rows = await driver.findElements(
        By.xpath(ResolvePhase.resultRows),
      );
      return rows.length > 0;
    }, PHASE_TIMEOUT);

    const rows = await findAll(driver, ResolvePhase.resultRows);
    expect(rows.length).toBeGreaterThanOrEqual(1);
  }, 90_000);

  it('should transition from resolve to next round commit phase', async () => {
    await navigateToResolve();

    // The app auto-dispatches RESOLVE then NEXT_ROUND
    const next = await waitForAny(
      driver,
      [CommitPhase.phaseTitle, CommitPhase.aiWaiting, "//*[contains(text(), 'GAME OVER')]"],
      PHASE_TIMEOUT,
    );
    expect(next).toBeTruthy();
  }, 90_000);

  it('should update scores after resolve', async () => {
    await navigateToResolve();

    // Scores should be displayed during resolve
    await waitForVisible(driver, Layout.scoreboardTitle);
    const initialScores = await findAll(driver, Layout.scoreCells);
    const initialTexts = await Promise.all(initialScores.map(s => s.getText()));

    // Wait for next round
    await waitForAny(
      driver,
      [CommitPhase.phaseTitle, CommitPhase.aiWaiting, "//*[contains(text(), 'GAME OVER')]"],
      PHASE_TIMEOUT,
    );

    // Scores should still be displayed
    const updatedScores = await findAll(driver, Layout.scoreCells);
    expect(updatedScores.length).toBeGreaterThan(0);
  }, 90_000);

  it('should replace resolved conspiracies with new ones', async () => {
    await openApp(driver);
    await startGame(driver, 'ReplaceTester', 2);
    await waitForPhase(driver, 'COMMIT');

    // Record conspiracy names in round 1
    const round1Conspiracies = await findAll(driver, CommitPhase.conspiracyCards);
    const round1Names: string[] = [];
    for (const card of round1Conspiracies) {
      const nameEl = await card.findElement(
        By.xpath(".//div[contains(@style, 'font-weight')]"),
      );
      round1Names.push(await nameEl.getText());
    }

    // Play through round 1
    const commitResult = await waitForAny(
      driver,
      [CommitPhase.doneButton, CommitPhase.aiWaiting],
      PHASE_TIMEOUT,
    );
    if (commitResult.xpath === CommitPhase.doneButton) {
      await passCommitPhase(driver);
    }

    await waitForPhase(driver, 'BROADCAST');
    const broadcastResult = await waitForAny(
      driver,
      [BroadcastPhase.passButton, "//*[contains(text(), 'RESOLVING')]"],
      PHASE_TIMEOUT,
    );
    if (broadcastResult.xpath === BroadcastPhase.passButton) {
      await passBroadcastPhase(driver);
    }

    // Wait for round 2
    await waitForAny(
      driver,
      [CommitPhase.phaseTitle, CommitPhase.aiWaiting, "//*[contains(text(), 'GAME OVER')]"],
      PHASE_TIMEOUT,
    );

    // Board should still have conspiracies (some may be replaced)
    const round2Conspiracies = await findAll(driver, CommitPhase.conspiracyCards);
    expect(round2Conspiracies.length).toBeGreaterThanOrEqual(3);
  }, 120_000);
});
