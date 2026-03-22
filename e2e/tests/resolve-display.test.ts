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

async function navigateToResolve(driver: WebDriver) {
  await driver.get(APP_URL);
  const startBtn = await waitForXpath(driver, "//*[contains(text(), 'START GAME')]");
  await startBtn.click();

  // Done committing
  for (let i = 0; i < 20; i++) {
    try {
      const btn = await driver.findElement(By.css("[data-testid='done-committing']"));
      await btn.click();
      break;
    } catch { await driver.sleep(1500); }
  }

  // Dismiss signals
  for (let i = 0; i < 20; i++) {
    try {
      const btn = await driver.findElement(By.css("[data-testid='dismiss-signals']"));
      await btn.click();
      break;
    } catch { await driver.sleep(1500); }
  }

  // Pass on broadcast
  for (let i = 0; i < 20; i++) {
    try {
      const btn = await driver.findElement(By.css("[data-testid='broadcast-pass']"));
      await btn.click();
      break;
    } catch { await driver.sleep(1500); }
  }

  // Wait for resolve display
  await waitForCss(driver, "[data-testid='resolve-display']", 45000);
}

describe('Resolve Display', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await new Builder().usingServer(SELENIUM_URL).forBrowser('chrome').build();
  }, 30000);

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  it('resolve shows results with Continue button', async () => {
    await navigateToResolve(driver);
    await screenshot(driver, 'resolve-display');

    const container = await driver.findElement(By.css("[data-testid='resolve-display']"));
    expect(container).toBeTruthy();

    const continueBtn = await driver.findElement(By.css("[data-testid='continue-resolve']"));
    expect(continueBtn).toBeTruthy();
  }, 90000);

  it('resolve does NOT auto-advance', async () => {
    await navigateToResolve(driver);

    // Wait 10 seconds and verify resolve is still showing
    await driver.sleep(10000);

    const containers = await driver.findElements(By.css("[data-testid='resolve-display']"));
    expect(containers.length).toBeGreaterThan(0);
    await screenshot(driver, 'resolve-persists');
  }, 90000);

  it('clicking Continue advances to next round', async () => {
    await navigateToResolve(driver);

    const continueBtn = await driver.findElement(By.css("[data-testid='continue-resolve']"));
    await continueBtn.click();
    await driver.sleep(3000);

    // Should see either commit phase or game over
    const body = await driver.findElement(By.tagName('body'));
    const text = await body.getText();
    expect(text.match(/COMMIT PHASE|GAME OVER/)).toBeTruthy();
    await screenshot(driver, 'after-resolve-continue');
  }, 90000);
});
