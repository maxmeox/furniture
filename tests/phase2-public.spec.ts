import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const locales = ["ar", "en", "he"] as const;
const routes = [
  "",
  "/catalog",
  "/products/placeholder-corner-sofa",
  "/fabrics",
  "/offers",
  "/gallery",
  "/contact",
  "/campaigns/showroom-featured-sofas",
  "/interest-list"
];

test.describe("Phase 2 public website", () => {
  for (const locale of locales) {
    for (const route of routes) {
      test(`${locale}${route || "/"} renders with correct direction`, async ({ page }) => {
        await page.goto(`${baseURL}/${locale}${route}`);
        await expect(page.locator(`[data-locale="${locale}"]`)).toHaveAttribute("dir", locale === "en" ? "ltr" : "rtl");
        await expect(page.locator("body")).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
        expect(overflow).toBe(false);
      });
    }
  }

  test.skip("mobile catalog filters and interest list work", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/ar/catalog`);
    await page.waitForLoadState("networkidle");
    const filterBtn = page.getByRole("button", { name: /تصفية/i });
    await filterBtn.waitFor({ state: "visible", timeout: 5000 });
    await filterBtn.click();
    await expect(page.getByRole("dialog").getByText("التصنيف")).toBeVisible();
    await page.locator('button[role="radio"]').first().click();
    await page.locator("button").filter({ hasText: /إغلاق/i }).click();
    await page.locator("button").filter({ hasText: /Save|حفظ/i }).first().click();
    await expect(page.getByText(/تم الحفظ/i)).toBeVisible();
  });

  test("product gallery thumbnails, lightbox, and mobile swipe work", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/ar/products/placeholder-corner-sofa`);
    await expect(page.getByText("AI-TEMP-102")).toBeVisible();
    await page.getByRole("button", { name: /Open product image lightbox/i }).click();
    await expect(page.getByText(/1 \//)).toBeVisible();
    await page.getByRole("button", { name: /Close|إغلاق/i }).first().click();
  });

  test("gallery lightbox opens on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/he/gallery`);
    await page.locator("figure button").first().click();
    await expect(page.getByText("1 /")).toBeVisible();
  });
});
