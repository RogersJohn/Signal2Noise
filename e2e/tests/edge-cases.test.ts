import { Builder, WebDriver, until, By } from 'selenium-webdriver';
import { takeScreenshotOnFailure, waitForElement } from '../utils/helpers';

const APP_URL = process.env.APP_URL || 'http://app:3000';
const SELENIUM_URL = process.env.SELENIUM_URL || 'http://selenium:4444';

describe('Edge Cases E2E', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await new Builder()
      .usingServer(SELENIUM_URL)
      .forBrowser('chrome')
      .build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  afterEach(async function () {
    if (this.currentTest?.state === 'failed') {
      await takeScreenshotOnFailure(driver, this.currentTest.title);
    }
  });

  it('should handle all players passing', async () => {
    await driver.get(APP_URL);

    // Start game
    const startBtn = await waitForElement(driver, By.xpath("//*[contains(text(), 'START GAME')]"));
    await startBtn.click();

    // Commit phase - done without assigning
    await waitForElement(driver, By.xpath("//*[contains(text(), 'COMMIT PHASE')]"), 10000);
    const doneBtn = await waitForElement(driver, By.xpath("//*[contains(text(), 'DONE COMMITTING')]"));
    await doneBtn.click();

    // Broadcast phase - pass
    await waitForElement(driver, By.xpath("//*[contains(text(), 'BROADCAST PHASE')]"), 15000);
    const passBtn = await waitForElement(driver, By.xpath("//*[contains(text(), 'PASS')]"));
    await passBtn.click();

    // Should proceed to next round without errors
    await driver.sleep(5000);

    // Verify game is still running (round 2)
    const body = await driver.findElement(By.tagName('body'));
    const text = await body.getText();
    expect(text).toMatch(/Round [2-6]/);
  }, 60000);

  it('should handle committing with no cards assigned', async () => {
    await driver.get(APP_URL);

    const startBtn = await waitForElement(driver, By.xpath("//*[contains(text(), 'START GAME')]"));
    await startBtn.click();

    await waitForElement(driver, By.xpath("//*[contains(text(), 'COMMIT PHASE')]"), 10000);

    // Click done without assigning any cards
    const doneBtn = await waitForElement(driver, By.xpath("//*[contains(text(), 'DONE COMMITTING')]"));
    await doneBtn.click();

    // Should proceed to broadcast phase
    await waitForElement(driver, By.xpath("//*[contains(text(), 'BROADCAST')]"), 15000);
  }, 30000);

  it('should complete full game to game over screen', async () => {
    await driver.get(APP_URL);

    const startBtn = await waitForElement(driver, By.xpath("//*[contains(text(), 'START GAME')]"));
    await startBtn.click();

    // Play through all 6 rounds by passing everything
    for (let round = 0; round < 6; round++) {
      try {
        await waitForElement(driver, By.xpath("//*[contains(text(), 'COMMIT PHASE')]"), 15000);
        const doneBtn = await waitForElement(driver, By.xpath("//*[contains(text(), 'DONE COMMITTING')]"));
        await doneBtn.click();

        await waitForElement(driver, By.xpath("//*[contains(text(), 'BROADCAST')]"), 15000);

        // Wait for our turn (might be AI first)
        await driver.sleep(2000);
        try {
          const passBtn = await driver.findElement(By.xpath("//*[contains(text(), 'PASS')]"));
          await passBtn.click();
        } catch {
          // May not be our turn yet, wait more
          await driver.sleep(3000);
          try {
            const passBtn = await driver.findElement(By.xpath("//*[contains(text(), 'PASS')]"));
            await passBtn.click();
          } catch {
            // AI may have already moved past us
          }
        }

        // Wait for resolve + next round
        await driver.sleep(5000);
      } catch {
        // Game may have ended
        break;
      }
    }

    // Should see game over
    await driver.sleep(5000);
    const body = await driver.findElement(By.tagName('body'));
    const text = await body.getText();
    expect(text).toContain('GAME OVER');
  }, 120000);
});
