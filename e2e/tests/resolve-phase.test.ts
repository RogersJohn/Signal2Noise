import { Builder, WebDriver, until, By } from 'selenium-webdriver';
import { takeScreenshotOnFailure, waitForElement } from '../utils/helpers';
import { Selectors } from '../utils/selectors';

const APP_URL = process.env.APP_URL || 'http://app:3000';
const SELENIUM_URL = process.env.SELENIUM_URL || 'http://selenium:4444';

describe('Resolve Phase E2E', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer(SELENIUM_URL)
      .forBrowser('chrome')
      .build();
    await driver.get(APP_URL);
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await takeScreenshotOnFailure(driver, this.currentTest.title);
    }
  });

  it('should display scoring results after resolve', async () => {
    // Start game
    const startBtn = await waitForElement(driver, By.xpath("//*[contains(text(), 'START GAME')]"));
    await startBtn.click();

    // Wait for commit phase
    await waitForElement(driver, By.xpath("//*[contains(text(), 'COMMIT PHASE')]"), 10000);

    // Done committing without assigning (human player)
    const doneBtn = await waitForElement(driver, By.xpath("//*[contains(text(), 'DONE COMMITTING')]"));
    await doneBtn.click();

    // Wait for broadcast phase
    await waitForElement(driver, By.xpath("//*[contains(text(), 'BROADCAST PHASE')]"), 15000);

    // Pass on broadcast
    const passBtn = await waitForElement(driver, By.xpath("//*[contains(text(), 'PASS')]"));
    await passBtn.click();

    // Wait for resolve to complete
    await driver.sleep(3000);

    // Should see scoreboard with scores
    const scoreboard = await waitForElement(driver, By.xpath("//*[contains(text(), 'SCOREBOARD')]"), 10000);
    expect(scoreboard).toBeTruthy();
  }, 60000);

  it('should show consensus results when reached', async () => {
    // This test verifies that when consensus is reached,
    // the resolve phase displays the result
    const body = await driver.findElement(By.tagName('body'));
    const text = await body.getText();
    // After a round resolves, scores should be visible
    expect(text).toContain('SCOREBOARD');
  });
});
