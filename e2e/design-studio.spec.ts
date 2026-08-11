import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";

/**
 * Design Studio E2E: sticker search + placement, color recoloring,
 * canvas rendering, and undo/redo — all asserted free of runtime errors.
 */

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (msg: ConsoleMessage) => {
    if (msg.type() === "error" && !msg.text().includes("favicon")) {
      errors.push(`console: ${msg.text()}`);
    }
  });
  return errors;
}

async function openGraphics(page: Page) {
  await page.goto("/design-studio");
  await expect(page.getByTestId("studio-canvas")).toBeVisible();
  await page.getByRole("tab", { name: /graphics/i }).click();
  await expect(page.getByTestId("sticker-book")).toBeVisible();
}

test("sticker search finds decals with natural language and places them on canvas", async ({ page }) => {
  const errors = trackErrors(page);
  await openGraphics(page);

  const search = page.getByTestId("sticker-search");
  await search.fill("something spacey");
  const results = page.getByTestId("sticker-results");
  await expect(results).toBeVisible();
  expect(await results.locator("button").count()).toBeGreaterThan(0);

  await search.fill("ocean waves");
  await expect(page.getByTestId("sticker-wave")).toBeVisible();

  const canvas = page.getByTestId("studio-canvas");
  const before = await canvas.locator("svg").count();
  await page.getByTestId("sticker-wave").click();
  await expect
    .poll(async () => canvas.locator("svg").count())
    .toBeGreaterThan(before);

  expect(errors).toEqual([]);
});

test("collection filters narrow the sticker book and clear cleanly", async ({ page }) => {
  const errors = trackErrors(page);
  await openGraphics(page);

  await page.getByRole("button", { name: "Cosmic", exact: true }).click();
  await expect(page.getByTestId("sticker-planet")).toBeVisible();

  await page.getByTestId("sticker-search").fill("zzzzqqq");
  await expect(page.getByTestId("sticker-empty")).toBeVisible();

  await page.getByTestId("sticker-search").fill("");
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.getByTestId("sticker-book")).toBeVisible();

  expect(errors).toEqual([]);
});

test("color controls recolor the canvas and undo/redo restores state", async ({ page }) => {
  const errors = trackErrors(page);
  await openGraphics(page);

  const canvas = page.getByTestId("studio-canvas");
  const original = await canvas.getAttribute("style");

  // Metallic preset acts as the one-click recolor path.
  await page.getByRole("button", { name: /Gunmetal Dark/i }).click();
  await expect.poll(async () => canvas.getAttribute("style")).not.toBe(original);

  await page.keyboard.press("Control+z");
  await expect.poll(async () => canvas.getAttribute("style")).toBe(original);

  await page.keyboard.press("Control+y");
  await expect.poll(async () => canvas.getAttribute("style")).not.toBe(original);

  expect(errors).toEqual([]);
});

test("membership page renders hero, benefits and CTA", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/membership");
  await expect(page.getByRole("heading", { name: /it pays to be\s*a member/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /member exclusive drops/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /never miss a drop/i })).toBeVisible();
  expect(errors).toEqual([]);
});
