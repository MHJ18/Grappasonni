import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
await mkdir("test-results", { recursive: true });
try {
  for (const [width, hero] of [
    [375, "classic"],
    [1440, "classic"],
    [375, "cinematic"],
    [1440, "cinematic"],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "no-preference",
    });
    await context.addInitScript((selectedHero) => {
      sessionStorage.setItem("grappasonni-welcome-v1", "seen");
      document.cookie = "grappasonni-consent=v1%3Aessential; path=/";
      localStorage.setItem(
        "grappasonni-appearance-v1",
        JSON.stringify({
          colorMode: "dark",
          designMode: "heritage",
          hero: selectedHero,
          gallery: "ring",
          motion: true,
          offers: true,
        }),
      );
    }, hero);
    const page = await context.newPage();
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    const positions = await page.evaluate(() => {
      const top = (selector) => {
        const element = document.querySelector(selector);
        assertElement(element, selector);
        return element.getBoundingClientRect().top + window.scrollY;
      };
      function assertElement(element, selector) {
        if (!element) throw Error(`Missing ${selector}`);
      }
      return {
        category: top("#category"),
        feature: top("#special .signature-visual"),
      };
    });
    await page.evaluate(
      (position) => window.scrollTo({ top: position, behavior: "instant" }),
      Math.round(positions.category * 0.51),
    );
    await page.waitForTimeout(650);
    const firstLeg = await page
      .locator(".pasta-flight-piece")
      .evaluateAll((pieces) =>
        pieces.map((piece) => ({
          opacity: Number(getComputedStyle(piece).opacity),
          x: piece.getBoundingClientRect().x,
          y: piece.getBoundingClientRect().y,
        })),
      );
    assert.ok(firstLeg.some((piece) => piece.opacity > 0.25));
    await page.screenshot({
      path: `test-results/pasta-flight-hero-${hero}-${width}.png`,
    });
    await page.evaluate(
      (position) => window.scrollTo({ top: position, behavior: "instant" }),
      Math.round((positions.category + positions.feature) * 0.5),
    );
    await page.waitForTimeout(650);
    const secondLeg = await page
      .locator(".pasta-flight-piece")
      .evaluateAll((pieces) =>
        pieces.map((piece) => Number(getComputedStyle(piece).opacity)),
      );
    assert.ok(secondLeg.some((opacity) => opacity > 0.25));
    await page.screenshot({
      path: `test-results/pasta-flight-feature-${hero}-${width}.png`,
    });
    console.log({ width, hero, positions, firstLeg, secondLeg });
    await context.close();
  }
} finally {
  await browser.close();
}
