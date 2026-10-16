import { expect, test } from "@playwright/test";

/**
 * These run WITHOUT Supabase credentials, so they also verify that the app degrades honestly:
 * nothing pretends to succeed when the backend is unavailable.
 */
const PUBLIC_ROUTES = ["/", "/scooters", "/accessories", "/collections", "/about", "/contact", "/book-test-ride", "/login", "/register", "/forgot-password", "/cart", "/search?q=vespa", "/admin/login"];

for (const route of PUBLIC_ROUTES) {
  test(`route ${route} renders without server errors`, async ({ page }) => {
    const res = await page.goto(route);
    expect(res?.status(), route).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
  });
}

test("homepage hero copy and CTAs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Iconic design. Timeless freedom.");
  await expect(page.getByRole("link", { name: /explore scooters/i }).first()).toHaveAttribute("href", "/scooters");
  await expect(page.getByRole("link", { name: /book a test ride/i }).first()).toHaveAttribute("href", "/book-test-ride");
  await expect(page.getByRole("heading", { name: /models you can see in person/i })).toBeVisible();
  await expect(page.getByText(/not configured/i)).toHaveCount(0);
});

test("every primary navigation link resolves", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: /open menu/i }).click();
  const hrefs = await page.getByRole("navigation", { name: "Primary" }).locator("a[href^='/']").evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute("href")!))]);
  expect(hrefs.length).toBeGreaterThan(5);
  for (const href of hrefs) {
    const res = await page.request.get(href);
    expect(res.status(), href).toBeLessThan(400);
  }
});

test("protected customer routes redirect anonymous visitors only when auth is configured; otherwise show sign-in", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/login\?next=%2Faccount/);
});

test("admin area is never reachable without an owner session", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/admin/settings");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("login form validates and reports honestly when backend is missing", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("main p[role=alert]").first()).toBeVisible();
  await page.getByLabel("Email").fill("someone@example.com");
  await page.locator("#f-password").fill("whatever1A");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("main p[role=alert]").first()).toContainText(/not configured|database/i);
  await expect(page).toHaveURL(/\/login/);
});

test("test ride form never claims success without a backend", async ({ page }) => {
  await page.goto("/book-test-ride");
  await page.getByLabel(/your name/i).fill("Asha Rao");
  await page.getByLabel("Email").fill("asha@example.com");
  await page.getByLabel("Phone").fill("9876543210");
  await page.getByLabel(/preferred date/i).fill("2099-01-06");
  await page.getByLabel(/preferred time/i).selectOption({ index: 1 });
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /request test ride/i }).click();
  await expect(page.locator("main p[role=alert]")).toContainText(/nothing was submitted|not configured|database/i);
  await expect(page.getByText(/your reference/i)).toHaveCount(0);
});

test("contact form shows field validation errors", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: /send enquiry/i }).click();
  // Without the backend the action returns the not-configured state first; with it, field errors. Either way it must not succeed.
  await expect(page.locator("main p[role=alert]")).toBeVisible();
  await expect(page.getByText(/thank you/i)).toHaveCount(0);
});

test("homepage photo gallery switches between showroom models", async ({ page }) => {
  await page.goto("/");
  const tab = page.getByRole("tab", { name: "Vespa SXL" });
  await tab.scrollIntoViewIfNeeded();
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("img", { name: "Vespa SXL" }).first()).toBeVisible();
});

test("empty cart state and no horizontal overflow on mobile", async ({ page }) => {
  await page.goto("/cart");
  await expect(page.getByText("Your cart is empty")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("security headers are present", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.headers()["x-frame-options"]).toBe("DENY");
  expect(res?.headers()["x-content-type-options"]).toBe("nosniff");
});
