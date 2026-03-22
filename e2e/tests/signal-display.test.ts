import { Builder, WebDriver, By, until } from 'selenium-webdriver';

const APP_URL = process.env.APP_URL || 'http://app:3000';
const SELENIUM_URL = process.env.SELENIUM_URL || 'http://selenium:4444';

async function wait(driver: WebDriver, ms: number) {
  await driver.sleep(ms);
}

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

describe('Signal Display', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await new Builder().usingServer(SELENIUM_URL).forBrowser('chrome').build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  it('signals appear after commit and persist until dismissed', async () => {
    await driver.get(APP_URL);

    // Start game
    const startBtn = await waitForXpath(driver, "//*[contains(text(), 'START GAME')]");
    await startBtn.click();

    // Wait for commit phase
    await wait(driver, 2000);

    // Try to find done-committing button (may need to wait for AI to finish first)
    for (let i = 0; i < 20; i++) {
      try {
        const doneBtn = await driver.findElement(By.css("[data-testid='done-committing']"));
        await doneBtn.click();
        break;
      } catch {
        await wait(driver, 1500);
      }
    }

    // Wait for signal panel to appear
    const signalPanel = await waitForCss(driver, "[data-testid='signal-panel']", 45000);
    expect(signalPanel).toBeTruthy();
    await screenshot(driver, 'signal-panel-visible');

    // Check signals persist (wait 6 seconds — old code auto-hid at 4s)
    await wait(driver, 6000);
    const stillVisible = await driver.findElements(By.css("[data-testid='signal-panel']"));
    expect(stillVisible.length).toBeGreaterThan(0);
    await screenshot(driver, 'signal-panel-persisted');

    // Check signal entries exist
    const entries = await driver.findElements(By.css("[data-testid^='signal-entry-']"));
    expect(entries.length).toBeGreaterThan(0);

    // Dismiss signals
    const dismissBtn = await waitForCss(driver, "[data-testid='dismiss-signals']");
    await dismissBtn.click();

    // Should transition to broadcast phase
    await wait(driver, 2000);
    const broadcastTitle = await driver.findElements(By.xpath("//*[contains(text(), 'BROADCAST')]"));
    expect(broadcastTitle.length).toBeGreaterThan(0);
    await screenshot(driver, 'after-signal-dismiss');
  }, 120000);
});
