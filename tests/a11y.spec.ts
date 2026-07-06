import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const locales = ["ar", "en", "he"] as const;

const routes = [
  { path: "", name: "homepage" },
  { path: "/catalog", name: "catalog" },
  { path: "/contact", name: "contact" },
  { path: "/products/placeholder-corner-sofa", name: "product" },
] as const;

test.describe("Accessibility audit (WCAG 2.2 AA)", () => {
  for (const locale of locales) {
    for (const { path, name } of routes) {
      test(`${locale}/${name} has no critical/serious violations`, async ({ page }) => {
        await page.goto(`${baseURL}/${locale}${path}`);
        await page.locator("body").waitFor({ state: "visible", timeout: 15000 });

        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag22aa", "best-practice"])
          .analyze();

        const criticalSerious = results.violations.filter(
          (v) => v.impact === "critical" || v.impact === "serious"
        );

        expect(criticalSerious).toEqual([]);
      });
    }
  }
});
