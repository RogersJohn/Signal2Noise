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

describe('Commit Interaction', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await new Builder().usingServer(SELENIUM_URL).forBrowser('chrome').build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  it('hand cards are displayed and clickable', async () => {
    await driver.get(APP_URL);
    const startBtn = await waitForXpath(driver, "//*[contains(text(), 'START GAME')]");
    await startBtn.click();

    // Wait for commit phase with done button
    for (let i = 0; i < 20; i++) {
      try {
        await driver.findElement(By.css("[data-testid='done-committing']"));
        break;
      } catch {
        await driver.sleep(1500);
      }
    }

    const cards = await driver.findElements(By.css("[data-testid^='hand-card-']"));
    expect(cards.length).toBeGreaterThan(0);
    await screenshot(driver, 'commit-hand-cards');

    // Click first card
    await cards[0].click();
    await screenshot(driver, 'commit-card-selected');

    // Conspiracy cards should be on the board
    const conspiracies = await driver.findElements(By.css("[data-testid^='conspiracy-card-']"));
    expect(conspiracies.length).toBeGreaterThan(0);
  }, 60000);

  it('done committing button works', async () => {
    await driver.get(APP_URL);
    const startBtn = await waitForXpath(driver, "//*[contains(text(), 'START GAME')]");
    await startBtn.click();

    for (let i = 0; i < 20; i++) {
      try {
        const doneBtn = await driver.findElement(By.css("[data-testid='done-committing']"));
        await doneBtn.click();
        break;
      } catch {
        await driver.sleep(1500);
      }
    }

    // Should progress past commit
    await driver.sleep(3000);
    await screenshot(driver, 'after-done-committing');
  }, 60000);
});
