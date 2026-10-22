import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { sarabCopy } from "../src/data/sarab.ts";
import { reservationCopy } from "../src/data/reservation-copy.ts";
import { sarabContactCopy } from "../src/data/sarab-contact.ts";
import { sectionCopy } from "../src/data/sections.ts";

const baseURL = process.env.BASE_URL || "http://localhost:3000";
const origin = new URL(baseURL).origin;
const expectedSections = [
  "hero",
  "category",
  "special",
  "menu",
  "chefs",
  "gallery",
  "testimonials",
  "reservation",
  "contact-section",
  "newsletter",
];
const failures = [];
const report = [];
await mkdir("test-results", { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});

async function overflow(page) {
  return page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
}
async function noOverflow(page) {
  const size = await overflow(page);
  assert.ok(
    size.scroll <= size.client + 1,
    "Horizontal overflow: " + size.scroll + "/" + size.client,
  );
  return size;
}
async function closeDialogs(page) {
  for (
    let attempt = 0;
    attempt < 3 && (await page.getByRole("dialog").count());
    attempt += 1
  ) {
    await page.keyboard.press("Escape");
    await page.waitForTimeout(120);
  }
}
async function waitForImages(scope) {
  await expect
    .poll(
      () =>
        scope.locator("img").evaluateAll((images) =>
          // Responsive decorative images with display:none are intentionally
          // not fetched by native lazy loading. Validate every rendered image.
          images
            .filter((image) => image.getClientRects().length > 0)
            .every((image) => image.complete && image.naturalWidth > 0),
        ),
      { timeout: 15000 },
    )
    .toBe(true);
}
async function captureFullPage(page, path, animated = false) {
  const sections = page.locator("#main > section");
  for (let index = 0; index < (await sections.count()); index += 1) {
    const section = sections.nth(index);
    await section.scrollIntoViewIfNeeded();
    if (animated) {
      const reveals = section.locator("[data-sarab-reveal]");
      for (let reveal = 0; reveal < (await reveals.count()); reveal += 1) {
        await expect
          .poll(
            () =>
              reveals
                .nth(reveal)
                .evaluate((element) =>
                  Number(getComputedStyle(element).opacity),
                ),
            { timeout: 5000 },
          )
          .toBeGreaterThan(0.95);
      }
    }
    await waitForImages(section);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path, fullPage: true });
}

async function runViewport(width, locale = "it", animated = false) {
  const key = locale + "-" + width + (animated ? "-motion" : "");
  const c = sarabCopy[locale];
  const reservation = reservationCopy[locale];
  const contact = sarabContactCopy[locale].contact;
  const newsletter = sarabContactCopy[locale].newsletter;
  const photos = sectionCopy[locale];
  const entry = {
    key,
    width,
    locale,
    reducedMotion: !animated,
    checks: [],
    pageErrors: [],
    externalRequests: [],
    capturedPosts: [],
    screenshots: [],
  };
  report.push(entry);
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: animated ? "no-preference" : "reduce",
  });
  // All browsing stays local. Forms are intercepted before any provider can receive a message.
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (["http:", "https:"].includes(url.protocol) && url.origin !== origin) {
      entry.externalRequests.push(url.origin + url.pathname);
      return route.abort("blockedbyclient");
    }
    return route.continue();
  });
  await context.route(/\/api\/(?:reservations|inquiries)(?:\?|$)/, (route) => {
    if (route.request().method() !== "POST") return route.continue();
    entry.capturedPosts.push({
      endpoint: new URL(route.request().url()).pathname,
      payload: route.request().postDataJSON(),
    });
    return route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, code: "NOT_CONFIGURED" }),
    });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on("pageerror", (error) => entry.pageErrors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /hydrat|TypeError|Maximum update|Minified React error/i.test(
        message.text(),
      )
    )
      entry.pageErrors.push(message.text());
  });
  const check = async (name, action) => {
    try {
      await action();
      await noOverflow(page);
      entry.checks.push({ name, passed: true });
      console.log("PASS " + key + " — " + name);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      entry.checks.push({ name, passed: false, error: detail });
      failures.push(key + " — " + name + ": " + detail);
      console.log("FAIL " + key + " — " + name + ": " + detail.split("\n")[0]);
      await page
        .screenshot({
          path:
            "test-results/failure-" + key + "-" + entry.checks.length + ".png",
          fullPage: false,
        })
        .catch(() => {});
      await closeDialogs(page).catch(() => {});
    }
  };

  try {
    const response = await page.goto(baseURL + (locale === "en" ? "/en" : ""), {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await check(
      "welcome offer appears once per visit and can be dismissed",
      async () => {
        const welcome = page.getByRole("dialog", {
          name:
            locale === "it"
              ? "Un invito al buon gusto."
              : "An invitation to good taste.",
          exact: true,
        });
        await expect(welcome).toBeVisible();
        await waitForImages(welcome);
        await page.screenshot({ path: "test-results/welcome-" + key + ".png" });
        await welcome
          .getByRole("button", {
            name: locale === "it" ? "Chiudi il benvenuto" : "Close welcome",
            exact: true,
          })
          .click();
        await expect(welcome).toHaveCount(0);
      },
    );
    await check("cookie choices persist and can be reopened", async () => {
      const banner = page.locator(".cookie-banner");
      await expect(banner).toBeVisible();
      await banner
        .getByRole("button", {
          name: locale === "it" ? "Solo necessari" : "Necessary only",
          exact: true,
        })
        .click();
      await expect(banner).toHaveCount(0);
      assert.equal(
        (await context.cookies()).find((c) => c.name === "grappasonni-consent")
          ?.value,
        "v1%3Aessential",
      );
      await page.reload({ waitUntil: "networkidle" });
      await expect(banner).toHaveCount(0);
      await page.locator(".footer-cookie-settings").click();
      await expect(banner).toBeVisible();
      await banner
        .getByRole("button", {
          name: locale === "it" ? "Accetta" : "Accept",
          exact: true,
        })
        .click();
      assert.equal(
        (await context.cookies()).find((c) => c.name === "grappasonni-consent")
          ?.value,
        "v1%3Aall",
      );
      assert.equal(
        (await context.cookies()).find((c) => c.name === "grappasonni-language")
          ?.value,
        locale,
      );
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
    });
    await check("10 sections and hero composition", async () => {
      entry.sectionIds = await page
        .locator("#main > section")
        .evaluateAll((sections) => sections.map((section) => section.id));
      assert.deepEqual(entry.sectionIds, expectedSections);
      await expect(page.locator("#hero h1")).toBeVisible();
      const nav = await page.locator("#nav").boundingBox();
      assert.ok(
        nav.y >= 10 && nav.x >= 10 && nav.width <= 1192 && nav.height < 90,
      );
      await expect(page.locator("#hero .hcircle img")).toHaveAttribute(
        "src",
        /rigatoni-feature/,
      );
      await expect(page.locator("html")).toHaveAttribute(
        "data-color-mode",
        "dark",
      );
      await expect(page.locator("#hero")).toHaveClass(/classic-hero/);
      if (!animated)
        assert.equal(
          await page.locator("canvas").count(),
          0,
          "Reduced motion must not load WebGL",
        );
      await waitForImages(page.locator("#hero"));
      const name = animated
        ? "motion-1440.png"
        : locale === "en"
          ? "english-1440.png"
          : "desktop-" + width + ".png";
      await page.screenshot({ path: "test-results/" + name });
      entry.screenshots.push(name);
    });

    await check(
      "profile switches and persists both heroes, themes, motion and offers",
      async () => {
        const fontTargets = [
          "body",
          "#category .food-category-name",
          "#menu .tasting-dish-name",
          "#gallery .sdesc",
          "#reservation p",
          "#newsletter input",
        ];
        const fonts = () =>
          page.evaluate(
            (targets) =>
              targets.map((selector) => {
                const element = document.querySelector(selector);
                if (!element) throw Error(`Missing typography target ${selector}`);
                return getComputedStyle(element).fontFamily;
              }),
            fontTargets,
          );
        const originalFonts = await fonts();
        const profileButton = page
          .locator("#nav .nav-profile")
          .filter({ visible: true })
          .first();
        await profileButton.click();
        let panel = page.getByRole("dialog", {
          name: locale === "it" ? "Il tuo spazio" : "Your space",
          exact: true,
        });
        await expect(
          panel.getByRole("button", {
            name: locale === "it" ? "Scuro" : "Dark",
            exact: true,
          }),
        ).toHaveAttribute("aria-pressed", "true");
        await panel
          .getByRole("button", {
            name: locale === "it" ? "Chiaro" : "Light",
            exact: true,
          })
          .click();
        await panel
          .getByRole("button", {
            name: locale === "it" ? "Contemporaneo" : "Contemporary",
            exact: true,
          })
          .click();
        await panel.locator(".hero-choice-cinematic").click();
        await panel
          .getByRole("switch", {
            name: locale === "it" ? "Animazioni" : "Animations",
            exact: true,
          })
          .uncheck();
        await panel
          .getByRole("switch", {
            name: locale === "it" ? "Offerte di benvenuto" : "Welcome offers",
            exact: true,
          })
          .uncheck();
        await page.keyboard.press("Escape");
        await expect(page.locator("html")).toHaveAttribute(
          "data-color-mode",
          "light",
        );
        await expect(page.locator("html")).toHaveAttribute(
          "data-design-mode",
          "contemporary",
        );
        await expect(page.locator("#hero")).toHaveClass("nocturne-hero");
        assert.ok(
          (await fonts()).every((font, index) => font !== originalFonts[index]),
          "Every sampled section and form must follow the selected font mode",
        );
        await expect(page.locator("#menu .dish-offer-tag")).toHaveCount(0);
        await page.screenshot({
          path: "test-results/light-cinematic-" + key + ".png",
        });
        await page.reload({ waitUntil: "networkidle" });
        await expect(page.locator("html")).toHaveAttribute(
          "data-color-mode",
          "light",
        );
        await expect(page.locator("#hero")).toHaveClass("nocturne-hero");
        await profileButton.click();
        await panel
          .getByRole("button", {
            name: locale === "it" ? "Scuro" : "Dark",
            exact: true,
          })
          .click();
        await panel
          .getByRole("button", { name: "Heritage 1908", exact: true })
          .click();
        await panel.locator(".hero-choice-classic").click();
        await panel
          .getByRole("switch", {
            name: locale === "it" ? "Animazioni" : "Animations",
            exact: true,
          })
          .check();
        await panel
          .getByRole("switch", {
            name: locale === "it" ? "Offerte di benvenuto" : "Welcome offers",
            exact: true,
          })
          .check();
        await page.screenshot({ path: "test-results/profile-" + key + ".png" });
        await page.keyboard.press("Escape");
        await expect(page.locator("#menu .dish-offer-tag")).toHaveCount(3);
        await expect(page.locator("#hero")).toHaveClass(/classic-hero/);
      },
    );

    if (!animated) {
      await check(
        "menu categories, full menu and photographed menu",
        async () => {
          const menu = page.locator("#menu");
          await expect(menu.locator(".tasting-dish")).toHaveCount(8);
          await menu.getByRole("button", { name: c.more, exact: true }).click();
          assert.ok(
            (await menu.locator(".tasting-dish").count()) > 8,
            "Full menu must show more than the initial selection",
          );
          await menu
            .getByRole("tab", {
              name: locale === "it" ? "Dolci" : "Desserts",
              exact: true,
            })
            .click();
          await expect(menu.locator(".menu-panel")).toContainText("Tiramisù");
          assert.ok((await menu.locator(".tasting-dish").count()) > 0);
          await menu
            .getByRole("tab", {
              name: locale === "it" ? "Vini" : "Wine",
              exact: true,
            })
            .click();
          await expect(menu.locator(".tasting-dish")).toHaveCount(6);
          await expect(menu.locator(".menu-panel")).toContainText(
            "Frascati DOC",
          );
          await menu.getByRole("tab", { name: c.all, exact: true }).click();
          await menu.getByRole("button", { name: c.less, exact: true }).click();
          await expect(menu.locator(".tasting-dish")).toHaveCount(8);
          await page
            .locator("#category")
            .getByRole("link", { name: /Antipasti|Starters/ })
            .click();
          await expect(
            menu.getByRole("tab", {
              name: locale === "it" ? "Antipasti" : "Starters",
              exact: true,
            }),
          ).toHaveAttribute("aria-selected", "true");
          await expect(menu.locator(".menu-panel")).toContainText(
            locale === "it" ? "Alici fritte" : "Fried anchovies",
          );
          await menu.getByRole("button", { name: c.scan, exact: true }).click();
          const dialog = page.getByRole("dialog", { name: c.scanTitle });
          await expect(dialog).toBeVisible();
          await expect(dialog.locator("img")).toHaveCount(2);
          await expect(dialog).toContainText(c.scanCredit);
          await page.keyboard.press("Escape");
          await expect(dialog).toHaveCount(0);
          await menu.getByRole("tab", { name: c.all, exact: true }).click();
        },
      );

      await check(
        "category navigation, keyboard filters and pasta feature",
        async () => {
          const categories = page.locator("#category");
          const first = await categories
            .locator(".food-category-name")
            .first()
            .textContent();
          await categories
            .getByRole("button", {
              name:
                locale === "it" ? "Categorie successive" : "Next categories",
            })
            .click();
          assert.notEqual(
            await categories
              .locator(".food-category-name")
              .first()
              .textContent(),
            first,
          );
          await categories
            .getByRole("button", {
              name:
                locale === "it"
                  ? "Categorie precedenti"
                  : "Previous categories",
            })
            .click();
          assert.equal(
            await categories
              .locator(".food-category-name")
              .first()
              .textContent(),
            first,
          );
          const all = page
            .locator("#menu")
            .getByRole("tab", { name: c.all, exact: true });
          await all.focus();
          await page.keyboard.press("ArrowRight");
          await expect(page.locator("#menu-tab-antipasti")).toBeFocused();
          await expect(page.locator("#menu-tab-antipasti")).toHaveAttribute(
            "aria-selected",
            "true",
          );
          await page.keyboard.press("Home");
          await expect(all).toBeFocused();
          const feature = page.locator("#special");
          await feature
            .getByRole("button", {
              name: locale === "it" ? "Piatto successivo" : "Next dish",
            })
            .click();
          await expect(feature.locator(".signature-eyebrow")).toHaveText(
            "Rigatoni alla carbonara",
          );
          await feature
            .getByRole("button", {
              name:
                locale === "it" ? "Lasciati tentare" : "Give in to temptation",
            })
            .click();
          await expect(
            page.getByRole("dialog", { name: "Rigatone alla carbonara" }),
          ).toBeVisible();
          await page.keyboard.press("Escape");
          await feature
            .getByRole("button", {
              name: locale === "it" ? "Piatto precedente" : "Previous dish",
            })
            .click();
          await expect(feature.locator(".signature-eyebrow")).toHaveText(
            "Rigatoni all’amatriciana",
          );
          await expect(page.locator("#chefs .kitchen-expert")).toHaveCount(3);
          await expect(
            page.locator("#newsletter .newsletter-dish-art"),
          ).toBeAttached();
        },
      );

      await check(
        "dish details, favourites and persistent selection quantities",
        async () => {
          const dishName = locale === "it" ? "Alici fritte" : "Fried anchovies";
          const menu = page.locator("#menu");
          await menu
            .getByRole("button", { name: dishName, exact: true })
            .click();
          const dialog = page.getByRole("dialog", { name: dishName });
          await expect(dialog.locator(".dish-ingredients")).toBeVisible();
          await expect(dialog.locator(".dish-ingredients")).toContainText(
            locale === "it" ? "Alici" : "Anchovies",
          );
          await expect(
            dialog.locator(".dish-experience-image img"),
          ).toHaveAttribute("src", /dishes%2Falici|dishes\/alici/);
          assert.ok(
            !/TO BE CONFIRMED|DA CONFERMARE|Exact dish identity/i.test(
              await dialog.innerText(),
            ),
          );
          await dialog
            .getByRole("button", { name: c.favorite, exact: true })
            .click();
          await expect(
            dialog.getByRole("button", { name: c.unfavorite, exact: true }),
          ).toBeVisible();
          await dialog
            .getByRole("button", { name: c.add, exact: true })
            .click();
          await dialog
            .getByRole("button", { name: c.selected + " (1)", exact: true })
            .click();
          await expect(
            dialog.getByRole("button", {
              name: c.selected + " (2)",
              exact: true,
            }),
          ).toBeVisible();
          await page.keyboard.press("Escape");
          await page.locator(".sarab-selection-floating").click();
          const selection = page.getByRole("dialog", { name: c.selection });
          await expect(selection).toContainText(c.selectionNote);
          await expect(
            selection.locator(".selection-quantity > span"),
          ).toHaveText("2");
          await selection
            .getByRole("button", {
              name: c.quantity + " + " + dishName,
              exact: true,
            })
            .click();
          await expect(
            selection.locator(".selection-quantity > span"),
          ).toHaveText("3");
          await selection
            .getByRole("button", {
              name: c.quantity + " − " + dishName,
              exact: true,
            })
            .click();
          await expect(
            selection.locator(".selection-quantity > span"),
          ).toHaveText("2");
          await page.keyboard.press("Escape");
          await expect
            .poll(() =>
              page.evaluate(() =>
                Boolean(localStorage.getItem("grappasonni-dining")),
              ),
            )
            .toBe(true);
          await page.reload({ waitUntil: "networkidle" });
          await expect(
            page.locator("#menu").getByRole("button", {
              name: c.unfavorite + ": " + dishName,
              exact: true,
            }),
          ).toHaveAttribute("aria-pressed", "true");
          await page.locator("#menu").scrollIntoViewIfNeeded();
          await page.locator(".sarab-selection-floating").click();
          await expect(
            page
              .getByRole("dialog", { name: c.selection })
              .locator(".selection-quantity > span"),
          ).toHaveText("2");
          await page.keyboard.press("Escape");
        },
      );

      await check(
        "search uses the typed query and opens the matching dish",
        async () => {
          await page
            .getByRole("button", { name: c.search, exact: true })
            .filter({ visible: true })
            .first()
            .click();
          const search = page.getByRole("dialog", { name: c.searchTitle });
          await search
            .getByRole("textbox", { name: c.search, exact: true })
            .fill("carbonara");
          await expect(
            search.locator(".sarab-search-results button"),
          ).toHaveCount(1);
          await expect(search.locator(".sarab-search-results")).toContainText(
            "Rigatone alla carbonara",
          );
          await search.locator(".sarab-search-results button").click();
          await expect(
            page.getByRole("dialog", { name: "Rigatone alla carbonara" }),
          ).toBeVisible();
          await page.keyboard.press("Escape");
          await expect(page.locator("#menu .menu-panel")).toContainText(
            "Rigatone alla carbonara",
          );
          await page
            .locator("#menu")
            .getByRole("button", { name: c.clear, exact: true })
            .click();
        },
      );

      await check(
        "five gallery photographs open and support keyboard navigation",
        async () => {
          const gallery = page.locator("#gallery");
          await expect(gallery.locator(".gitem")).toHaveCount(5);
          const trigger = gallery.locator(".gitem").first();
          await trigger.click();
          const dialog = page.getByRole("dialog");
          await expect(dialog).toContainText("1 / 5");
          await page.keyboard.press("ArrowRight");
          await expect(dialog).toContainText("2 / 5");
          await dialog
            .getByRole("button", { name: photos.next, exact: true })
            .click();
          await expect(dialog).toContainText("3 / 5");
          await page.keyboard.press("ArrowLeft");
          await expect(dialog).toContainText("2 / 5");
          await expect(
            dialog.getByRole("link", { name: "TheFork", exact: true }),
          ).toHaveAttribute("href", /thefork\.it/);
          await page.keyboard.press("Escape");
          await expect(dialog).toHaveCount(0);
          await expect(trigger).toBeFocused();
        },
      );

      await check(
        "Google reviews report the real unconfigured API state",
        async () => {
          const responsePromise = page.waitForResponse(
            (response) => new URL(response.url()).pathname === "/api/reviews",
          );
          await page
            .locator("#testimonials")
            .getByRole("tab", { name: "Google", exact: true })
            .click();
          const response = await responsePromise;
          assert.equal(
            response.status(),
            503,
            "This local verification expects Google credentials to be absent",
          );
          assert.equal((await response.json()).code, "NOT_CONFIGURED");
          await expect(page.locator("#testimonials")).toContainText(
            photos.googleEmpty,
          );
          await expect(
            page
              .locator("#testimonials")
              .getByRole("link", { name: photos.googleRead, exact: true }),
          ).toHaveAttribute("href", /google\.com\/maps/);
        },
      );

      await check(
        "booking wizard retains choices and validates before sending",
        async () => {
          const form = page.locator("#reservation form");
          const before = entry.capturedPosts.length;
          const next = () =>
            form.getByRole("button", {
              name: locale === "it" ? "Continua" : "Continue",
              exact: true,
            });
          await expect(next()).toBeDisabled();
          await form.locator(".booking-day-rail button").nth(1).click();
          await form.locator('input[name="time"][value="20:30"]').check();
          await expect(next()).toBeEnabled();
          await form.screenshot({
            path: "test-results/booking-time-" + key + ".png",
          });
          await next().click();
          await expect(form.locator(".booking-party-grid")).toBeVisible();
          await form.locator('input[name="guests"][value="4"]').check();
          await form.screenshot({
            path: "test-results/booking-party-" + key + ".png",
          });
          await next().click();
          await expect(form.locator("#reservation-name")).toBeVisible();
          await form
            .getByRole("button", { name: reservation.submit, exact: true })
            .click();
          await expect(form.locator("#reservation-name")).toHaveAttribute(
            "aria-invalid",
            "true",
          );
          await expect(form.locator("#reservation-name")).toBeFocused();
          assert.equal(entry.capturedPosts.length, before);
          await form.locator("#reservation-name").fill("Preview Visitor");
          await form
            .locator("#reservation-email")
            .fill("preview@example.invalid");
          await form
            .getByRole("button", {
              name: locale === "it" ? "Indietro" : "Back",
              exact: true,
            })
            .click();
          await expect(
            form.locator('input[name="guests"][value="4"]'),
          ).toBeChecked();
          await next().click();
          await expect(form.locator("#reservation-name")).toHaveValue(
            "Preview Visitor",
          );
          await form
            .getByRole("button", { name: reservation.submit, exact: true })
            .click();
          await expect(form.locator("#reservation-consent")).toHaveAttribute(
            "aria-invalid",
            "true",
          );
          assert.equal(entry.capturedPosts.length, before);
          await form.locator("#reservation-consent").check();
          await form
            .getByRole("button", { name: reservation.submit, exact: true })
            .click();
          await expect(form.locator(".booking-form-feedback")).toContainText(
            reservation.notConfigured,
          );
          assert.equal(entry.capturedPosts.length, before + 1);
          assert.equal(entry.capturedPosts.at(-1).payload.guests, 4);
          assert.equal(entry.capturedPosts.at(-1).payload.time, "20:30");
          assert.equal(entry.capturedPosts.at(-1).payload.consent, true);
        },
      );

      await check(
        "booking request history survives reload with honest delivery status",
        async () => {
          const label = locale === "it" ? "Le mie prenotazioni" : "My bookings";
          await page.locator(".booking-history-button").click();
          const history = page.getByRole("dialog", {
            name: label,
            exact: true,
          });
          await expect(history.locator(".saved-booking")).toHaveCount(1);
          await expect(history.locator(".booking-status")).toHaveText(
            locale === "it" ? "Richiesta non inviata" : "Request not sent",
          );
          await page.keyboard.press("Escape");
          await page.reload({ waitUntil: "networkidle" });
          await page.locator(".booking-history-button").click();
          await expect(history.locator(".saved-booking")).toHaveCount(1);
          await expect(history).toContainText("20:30");
          assert.ok(
            !/confirmed|confermata/i.test(
              await history.locator(".booking-status").innerText(),
            ),
          );
          await history.locator(".booking-remove").click();
          await expect(history.locator(".saved-booking")).toHaveCount(0);
          await expect(history.locator("#my-bookings-heading")).toBeFocused();
          await page.keyboard.press("Escape");
          await expect(history).toHaveCount(0);
        },
      );

      await check(
        "one reservation form, newsletter and direct contact links",
        async () => {
          await expect(page.locator("form")).toHaveCount(2);
          await expect(page.locator("#contact-section form")).toHaveCount(0);
          await expect(
            page.locator('#contact-section a[href^="tel:"]'),
          ).toHaveCount(1);
          await expect(
            page.locator('#contact-section a[href*="google.com/maps"]'),
          ).toHaveCount(1);
          assert.ok(
            !/TO BE CONFIRMED|DA CONFERMARE|Exact dish identity|Identità esatta/i.test(
              await page.locator("body").innerText(),
            ),
          );
          const dead = await page
            .locator('a[href^="#"]')
            .evaluateAll((links) =>
              links
                .map((link) => link.getAttribute("href"))
                .filter(
                  (href) =>
                    href.length > 1 && !document.getElementById(href.slice(1)),
                ),
            );
          assert.deepEqual(dead, []);
        },
      );

      await check(
        "newsletter requires email/consent and never claims subscription on failure",
        async () => {
          const form = page.locator("#newsletter form");
          const before = entry.capturedPosts.length;
          await form
            .getByRole("button", { name: newsletter.submit, exact: true })
            .click();
          await expect(form.locator("#nlEmail")).toHaveAttribute(
            "aria-invalid",
            "true",
          );
          await expect(form.locator("#nlEmail")).toBeFocused();
          assert.equal(entry.capturedPosts.length, before);
          await form.locator("#nlEmail").fill("preview@example.invalid");
          await form
            .getByRole("button", { name: newsletter.submit, exact: true })
            .click();
          await expect(form.locator("#newsletter-consent")).toHaveAttribute(
            "aria-invalid",
            "true",
          );
          assert.equal(entry.capturedPosts.length, before);
          await form.locator("#newsletter-consent").check();
          await form
            .getByRole("button", { name: newsletter.submit, exact: true })
            .click();
          await expect(form.getByRole("status")).toHaveText(
            newsletter.notConfigured,
          );
          assert.equal(entry.capturedPosts.at(-1).payload.kind, "newsletter");
          assert.equal(entry.capturedPosts.length, before + 1);
        },
      );

      if (width < 1200)
        await check(
          "mobile navigation opens, closes and follows the menu link",
          async () => {
            const toggle = page.getByRole("button", {
              name: c.openNav,
              exact: true,
            });
            await expect(toggle).toHaveAttribute("aria-expanded", "false");
            await toggle.click();
            await expect(
              page.getByRole("button", { name: c.closeNav, exact: true }),
            ).toHaveAttribute("aria-expanded", "true");
            await expect(page.locator("#navmenu")).toBeVisible();
            await page
              .locator("#navmenu nav")
              .getByRole("link", { name: c.nav[1], exact: true })
              .click();
            await expect(
              page.getByRole("button", { name: c.openNav, exact: true }),
            ).toHaveAttribute("aria-expanded", "false");
            await expect(page.locator("#navmenu")).not.toBeVisible();
            assert.equal(new URL(page.url()).hash, "#menu");
          },
        );
    }

    if (animated)
      await check(
        "elastic reel and momentum ring browse with keyboard and open images",
        async () => {
          const gallery = page.locator("#gallery");
          await gallery.scrollIntoViewIfNeeded();
          await expect(gallery.locator(".momentum-ring")).toBeVisible();

          const stage = gallery.locator(".momentum-ring-stage");
          await stage.focus();
          await page.keyboard.press("ArrowRight");
          await expect(gallery.locator(".momentum-ring-caption")).toContainText(
            "02 / 05",
          );
          await expect
            .poll(() => gallery.locator(".momentum-ring").getAttribute("class"))
            .not.toContain("is-spinning");
          await gallery.screenshot({
            path: "test-results/momentum-ring-desktop.png",
          });
          await page.keyboard.press("Enter");
          await expect(page.getByRole("dialog")).toContainText("2 / 5");
          await page.keyboard.press("Escape");
          await page
            .locator("#nav .nav-profile")
            .filter({ visible: true })
            .first()
            .click();
          await page
            .getByRole("dialog", { name: "Il tuo spazio", exact: true })
            .getByRole("button", { name: "Elastic Reel", exact: true })
            .click();
          await page.keyboard.press("Escape");
          await expect(gallery.locator(".elastic-gallery")).toBeVisible();
          await gallery
            .getByRole("button", { name: "Immagine successiva", exact: true })
            .click();
          await expect(
            gallery.locator(".elastic-gallery-controls"),
          ).toContainText("02");
          await gallery.screenshot({
            path: "test-results/elastic-reel-desktop.png",
          });
        },
      );
    if (animated)
      await check(
        "menu tabs animate and settle without losing focus",
        async () => {
          const tab = page.locator("#menu-tab-primi");
          await tab.click();
          await expect(tab).toBeFocused();
          const rows = page.locator("#menu .tasting-dish");
          await expect(rows).toHaveCount(5);
          await expect
            .poll(() =>
              rows
                .last()
                .evaluate((el) => Number(getComputedStyle(el).opacity)),
            )
            .toBeGreaterThan(0.99);
          await expect
            .poll(() =>
              rows.last().evaluate((el) => getComputedStyle(el).transform),
            )
            .toBe("none");
          await page.locator("#menu-tab-all").click();
        },
      );

    await check(
      animated
        ? "normal-motion sections reveal and remain readable"
        : "full-page layout and loaded photographs",
      async () => {
        const name = animated
          ? "motion-full-1440.png"
          : locale === "en"
            ? "english-full-1440.png"
            : "full-" + width + ".png";
        await captureFullPage(page, "test-results/" + name, animated);
        entry.screenshots.push(name);
        entry.overflow = await noOverflow(page);
        for (const id of expectedSections)
          await expect(
            page.locator("#" + id + " h1, #" + id + " h2").first(),
          ).toBeVisible();
        for (const id of [
          "chefs",
          "newsletter",
          "reservation",
          "special",
          "gallery",
        ]) {
          const section = page.locator("#" + id);
          await section.scrollIntoViewIfNeeded();
          await waitForImages(section);
          if (id === "newsletter") {
            await section.locator("#nlEmail").fill("");
            await section.locator("#newsletter-consent").uncheck();
          }
          await section.screenshot({
            path: `test-results/refined-${id}-${locale}-${width}${animated ? "-motion" : ""}.png`,
          });
        }
      },
    );
    if (entry.pageErrors.length)
      failures.push(key + " — browser errors: " + entry.pageErrors.join(" | "));
    if (entry.externalRequests.length)
      failures.push(
        key +
          " — unexpected external browser requests: " +
          entry.externalRequests.join(" | "),
      );
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    failures.push(key + " — setup: " + detail);
    entry.setupError = detail;
  } finally {
    await context.close();
  }
}

try {
  for (const width of process.env.TEST_WIDTHS
    ? process.env.TEST_WIDTHS.split(",").map(Number)
    : [375, 768, 1440])
    await runViewport(width);
  if (!process.env.TEST_WIDTHS) {
    await runViewport(1440, "en");
    await runViewport(1440, "it", true);
  }
} finally {
  await browser.close();
  await writeFile(
    "test-results/browser-report.json",
    JSON.stringify(
      { baseURL, checkedAt: new Date().toISOString(), report, failures },
      null,
      2,
    ),
  );
}
console.log(
  JSON.stringify(
    {
      suites: report.length,
      checks: report.reduce((sum, entry) => sum + entry.checks.length, 0),
      failures,
    },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;
