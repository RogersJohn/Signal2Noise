import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import * as fs from 'fs';
import * as path from 'path';

// ── Configuration ────────────────────────────────────────────────

const SELENIUM_URL = process.env.SELENIUM_URL || 'http://localhost:4444/wd/hub';
const APP_URL = process.env.APP_URL || 'http://app:3000';
const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'screenshots');

/** Default timeout for waiting on elements (ms) */
export const DEFAULT_TIMEOUT = 15_000;

/** Longer timeout for phase transitions with AI delays */
export const PHASE_TIMEOUT = 30_000;

/** Very long timeout for a full game to complete */
export const GAME_TIMEOUT = 180_000;

// ── Driver Setup / Teardown ──────────────────────────────────────

/**
 * Build a Selenium WebDriver pointing at the remote Selenium hub.
 */
export async function createDriver(): Promise<WebDriver> {
  const options = new chrome.Options();
  options.addArguments(
    '--headless',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1920,1080',
  );

  const driver = await new Builder()
    .usingServer(SELENIUM_URL)
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000 });
  return driver;
}

/**
 * Navigate to the app's root page.
 */
export async function openApp(driver: WebDriver): Promise<void> {
  await driver.get(APP_URL);
}

/**
 * Quit the driver, swallowing errors.
 */
export async function quitDriver(driver: WebDriver | null): Promise<void> {
  if (driver) {
    try {
      await driver.quit();
    } catch {
      // already closed
    }
  }
}

// ── Wait Helpers ─────────────────────────────────────────────────

/**
 * Wait until an element matched by an XPath is present in the DOM.
 */
export async function waitForElement(
  driver: WebDriver,
  xpath: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<WebElement> {
  return driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
}

/**
 * Wait until an element matched by an XPath is visible on the page.
 */
export async function waitForVisible(
  driver: WebDriver,
  xpath: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<WebElement> {
  const el = await waitForElement(driver, xpath, timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

/**
 * Wait until no elements match the given XPath (element disappears).
 */
export async function waitForElementGone(
  driver: WebDriver,
  xpath: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<void> {
  await driver.wait(async () => {
    const els = await driver.findElements(By.xpath(xpath));
    return els.length === 0;
  }, timeout);
}

/**
 * Wait until element text contains the expected substring.
 */
export async function waitForText(
  driver: WebDriver,
  xpath: string,
  text: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<WebElement> {
  const el = await waitForElement(driver, xpath, timeout);
  await driver.wait(async () => {
    const t = await el.getText();
    return t.includes(text);
  }, timeout);
  return el;
}

/**
 * Wait for any one of several XPaths to appear. Returns the first match.
 */
export async function waitForAny(
  driver: WebDriver,
  xpaths: string[],
  timeout = PHASE_TIMEOUT,
): Promise<{ xpath: string; element: WebElement }> {
  let result: { xpath: string; element: WebElement } | null = null;

  await driver.wait(async () => {
    for (const xp of xpaths) {
      const els = await driver.findElements(By.xpath(xp));
      if (els.length > 0) {
        result = { xpath: xp, element: els[0] };
        return true;
      }
    }
    return false;
  }, timeout);

  return result!;
}

// ── Element Helpers ──────────────────────────────────────────────

/**
 * Find all elements matching an XPath.
 */
export async function findAll(
  driver: WebDriver,
  xpath: string,
): Promise<WebElement[]> {
  return driver.findElements(By.xpath(xpath));
}

/**
 * Check whether an element matching the XPath is currently present.
 */
export async function isPresent(
  driver: WebDriver,
  xpath: string,
): Promise<boolean> {
  const els = await driver.findElements(By.xpath(xpath));
  return els.length > 0;
}

/**
 * Click an element found by XPath, waiting for it first.
 */
export async function clickElement(
  driver: WebDriver,
  xpath: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<void> {
  const el = await waitForVisible(driver, xpath, timeout);
  await el.click();
}

/**
 * Get the text content of an element found by XPath.
 */
export async function getText(
  driver: WebDriver,
  xpath: string,
  timeout = DEFAULT_TIMEOUT,
): Promise<string> {
  const el = await waitForElement(driver, xpath, timeout);
  return el.getText();
}

// ── Screenshot ───────────────────────────────────────────────────

/**
 * Take a screenshot and save it to the screenshots directory.
 * File name is sanitised for filesystem use.
 */
export async function takeScreenshot(
  driver: WebDriver,
  name: string,
): Promise<string> {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  const filePath = path.join(SCREENSHOT_DIR, `${safeName}.png`);
  const data = await driver.takeScreenshot();
  fs.writeFileSync(filePath, data, 'base64');

  return filePath;
}

// ── Jest Integration ─────────────────────────────────────────────

/**
 * Wrapper that sets up automatic screenshot-on-failure for a Jest test.
 * Usage:
 *   let driver: WebDriver;
 *   afterEach(async () => { await screenshotOnFailure(driver); });
 */
export async function screenshotOnFailure(driver: WebDriver | null): Promise<void> {
  if (!driver) return;

  // Jest exposes the current test's name and status via jasmine
  const testName =
    (global as any).jasmine?.currentTest?.fullName ??
    expect.getState?.()?.currentTestName ??
    'unknown';

  const testFailed =
    (global as any).jasmine?.currentTest?.failedExpectations?.length > 0 ||
    expect.getState?.()?.numPassingAsserts === 0;

  // In practice, afterEach doesn't know if the test failed easily in Jest.
  // We always take a screenshot to be safe — they're small and cheap.
  // The caller can also invoke this from a catch block.
  try {
    await takeScreenshot(driver, `afterEach_${testName}`);
  } catch {
    // driver may already be dead
  }
}

// ── Game Flow Helpers ────────────────────────────────────────────

/**
 * Start a new game from the menu screen.
 */
export async function startGame(
  driver: WebDriver,
  playerName = 'TestPlayer',
  aiCount = 2,
): Promise<void> {
  // Set player name
  const nameInput = await waitForVisible(
    driver,
    "//input[@type='text' or not(@type)]",
  );
  await nameInput.clear();
  await nameInput.sendKeys(playerName);

  // Set AI slider
  const slider = await waitForVisible(driver, "//input[@type='range']");
  await driver.executeScript(
    `arguments[0].value = ${aiCount}; arguments[0].dispatchEvent(new Event('change', { bubbles: true }));`,
    slider,
  );

  // Click start
  await clickElement(driver, "//button[contains(text(), 'START GAME')]");
}

/**
 * Wait until the game reaches a specific phase.
 */
export async function waitForPhase(
  driver: WebDriver,
  phase: 'COMMIT' | 'BROADCAST' | 'RESOLVE' | 'GAME_OVER',
  timeout = PHASE_TIMEOUT,
): Promise<void> {
  const phaseXpaths: Record<string, string> = {
    COMMIT: "//*[contains(text(), 'COMMIT PHASE')]",
    BROADCAST: "//*[contains(text(), 'BROADCAST PHASE')]",
    RESOLVE: "//*[contains(text(), 'RESOLVING')]",
    GAME_OVER: "//h1[contains(text(), 'GAME OVER')]",
  };

  await waitForElement(driver, phaseXpaths[phase], timeout);
}

/**
 * Complete the human player's commit phase by clicking DONE COMMITTING
 * (without assigning any evidence — a "pass" commit).
 */
export async function passCommitPhase(driver: WebDriver): Promise<void> {
  const doneXpath = "//button[contains(text(), 'DONE COMMITTING')]";
  // The DONE button may not be immediately visible if AI is still going
  await clickElement(driver, doneXpath, PHASE_TIMEOUT);
}

/**
 * Complete the human player's broadcast phase by clicking PASS.
 */
export async function passBroadcastPhase(driver: WebDriver): Promise<void> {
  const passXpath = "//button[contains(text(), 'PASS')]";
  await clickElement(driver, passXpath, PHASE_TIMEOUT);
}
