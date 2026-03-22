import { Builder, WebDriver, By, until } from 'selenium-webdriver';

const APP_URL = process.env.APP_URL || 'http://app:3000';
const SELENIUM_URL = process.env.SELENIUM_URL || 'http://selenium:4444';

async function waitForCss(driver: WebDriver, css: string, timeout = 30000) {
  return driver.wait(until.elementLocated(By.css(css)), timeout);
}

async function waitForXpath(driver: WebDriver, xpath: string, timeout = 30000) {
  return driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
}

async function screenshot(driver: WebDriver, name: string) {
  try {
    const png = await driver.takeScreenshot();
    const fs = require('fs');
    const path = require('path');
    const dir = path.join(__dirname, '..', 'screenshots');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${name}.png`), png, 'base64');
  } catch { /* swallow */ }
}

async function waitForEl(driver: WebDriver, css: string, timeout = 20000): Promise<boolean> {
  for (let i = 0; i < timeout / 1500; i++) {
    const els = await driver.findElements(By.css(css));
    if (els.length > 0) return true;
    await driver.sleep(1500);
  }
  return false;
}

describe('Full Game Playable', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await new Builder().usingServer(SELENIUM_URL).forBrowser('chrome').build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  it('completes full game from start to game over', async () => {
    await driver.get(APP_URL);

    // Start game
    const startBtn = await waitForXpath(driver, "//*[contains(text(), 'START GAME')]");
    await startBtn.click();
    await screenshot(driver, 'game-started');

    for (let round = 1; round <= 6; round++) {
      // Wait for done committing button
      const foundDone = await waitForEl(driver, "[data-testid='done-committing']");
      if (!foundDone) {
        // Check if game is over
        const over = await driver.findElements(By.xpath("//*[contains(text(), 'GAME OVER')]"));
        if (over.length > 0) break;
        continue;
      }

      // Click done committing
      const doneBtn = await driver.findElement(By.css("[data-testid='done-committing']"));
      await doneBtn.click();
      await screenshot(driver, `round-${round}-after-commit`);

      // Wait for signals and dismiss
      const foundSignals = await waitForEl(driver, "[data-testid='dismiss-signals']");
      if (foundSignals) {
        await screenshot(driver, `round-${round}-signals`);
        const dismissBtn = await driver.findElement(By.css("[data-testid='dismiss-signals']"));
        await dismissBtn.click();
      }

      // Wait for broadcast — pass
      const foundPass = await waitForEl(driver, "[data-testid='broadcast-pass']");
      if (foundPass) {
        await screenshot(driver, `round-${round}-broadcast`);
        const passBtn = await driver.findElement(By.css("[data-testid='broadcast-pass']"));
        await passBtn.click();
      }

      // Wait for resolve continue
      const foundResolve = await waitForEl(driver, "[data-testid='continue-resolve']");
      if (foundResolve) {
        await screenshot(driver, `round-${round}-resolve`);
        const continueBtn = await driver.findElement(By.css("[data-testid='continue-resolve']"));
        await continueBtn.click();
      }

      await driver.sleep(1000);

      // Check if game over
      const over = await driver.findElements(By.xpath("//*[contains(text(), 'GAME OVER')]"));
      if (over.length > 0) break;
    }

    // Wait for game over (may take extra time for last round)
    await driver.sleep(5000);
    const body = await driver.findElement(By.tagName('body'));
    const text = await body.getText();
    await screenshot(driver, 'game-over-final');

    // Should see game over or at least completed
    expect(text).toContain('GAME OVER');
  }, 180000);
});
