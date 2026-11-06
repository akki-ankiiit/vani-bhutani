import { test, expect } from "@playwright/test";

async function openPage(page, path = "/") {
  await page.addInitScript(() => {
    sessionStorage.setItem("hasVisited", "true");
    localStorage.setItem("cookies", "accepted");
  });
  await page.goto(path);
  await expect(page.locator("[data-experience-ready]")).toBeAttached();
  await expect(page.locator("[data-preloader]")).toBeHidden();
}

test("homepage renders, scrolls, and loads its image assets", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openPage(page);
  await expect(page.locator(".hero-s h1")).toHaveText(/Vani\s*Bhutani/);
  expect(await page.content()).not.toMatch(/azure/i);
  await expect(page.locator(".hero-s h1")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".hero-img")
        .first()
        .evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  const overflowing = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth + 1,
  );
  expect(overflowing).toBe(false);
  await page.mouse.wheel(0, 1600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
  expect(errors).toEqual([]);
});

test("day/night scene control crossfades the hero", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "The reference intentionally hides day/night controls on mobile.",
  );
  await openPage(page);
  await page.locator('[data-tab-trigger="night"]').click();
  await expect(page.locator('[data-tab-trigger="night"]')).toHaveClass(
    /is-active/,
  );
  await expect(page.locator('[data-tab-content="night"]')).toHaveCSS(
    "opacity",
    "1",
  );
  await page.locator('[data-tab-trigger="day"]').click();
  await expect(page.locator('[data-tab-trigger="day"]')).toHaveClass(
    /is-active/,
  );
});

test("project filtering honors deep links and reset", async ({ page }) => {
  await openPage(page, "/projects?type=commercial");
  const visibleCards = page.locator("[data-filter-item]:visible");
  await expect.poll(() => visibleCards.count()).toBe(2);
  const types = await visibleCards
    .locator("[data-type]")
    .evaluateAll((elements) => elements.map((el) => el.dataset.type));
  expect(types.every((type) => type === "commercial")).toBe(true);
  await page.locator("[data-reset]").click();
  await expect(visibleCards).toHaveCount(10);
});

test("booking modal validates and explains unconfigured submission", async ({
  page,
  isMobile,
}) => {
  await openPage(page, "/contact");
  if (isMobile) {
    await page.locator("[data-modal-menu-btn]").click();
    await page.locator("[data-modal-menu] [data-modal-cta-btn]").click();
  } else await page.locator(".header-nav [data-modal-cta-btn]").click();
  const form = page.locator("[data-modal-cta] form");
  await expect(form).toBeVisible();
  await form.locator('input[name="name"]').fill("Alex Morgan");
  await form.locator('input[type="email"]').fill("alex@example.com");
  await form.locator('input[type="tel"]').fill("+919800000000");
  const message = form.locator("textarea");
  if (await message.count())
    await message.fill("I would like to discuss a new home.");
  await form.locator("[data-form-btn]").click();
  await expect(form.locator("[data-form-status]")).toContainText(
    "not connected yet",
  );
  await page.keyboard.press("Escape");
  await expect(form).toBeHidden();
});

test("client navigation, detail pages, and browser back remain functional", async ({
  page,
  isMobile,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openPage(page, "/projects");
  await page.locator('a[href="/projects/avencia"]').first().click();
  await expect(page).toHaveURL(/\/projects\/avencia$/);
  await expect(page.locator(".lot-w h1")).toHaveText("Avencia");
  await expect(page.locator("[data-experience-ready]")).toBeAttached();
  await page.goBack();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator("[data-filter-item]:visible")).toHaveCount(10);
  if (isMobile) {
    await page.locator("[data-modal-menu-btn]").click();
    await page.locator('[data-modal-menu] a[href="/contact"]').click();
  } else await page.locator('.header-nav a[href="/contact"]').click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator("main h1").first()).toHaveText("Contact us");
  expect(errors).toEqual([]);
});

test("reduced motion skips the opening loader", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-experience-ready]")).toBeAttached();
  await expect(page.locator("[data-preloader]")).toBeHidden();
  await expect(page.locator(".hero-s h1")).toBeVisible();
});

test("every Vani Bhutani project image resolves", async ({ page, request }) => {
  await openPage(page, "/projects");
  const sources = await page
    .locator(".portfolio-card-image img")
    .evaluateAll((images) => images.map((image) => image.getAttribute("src")));
  expect(sources).toHaveLength(10);
  for (const src of sources) expect((await request.get(src)).ok()).toBe(true);
});
