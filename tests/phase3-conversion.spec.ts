import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function installWindowOpenCapture(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    if (!window.localStorage.getItem("phase3-storage-cleared")) {
      window.localStorage.removeItem("furniture-showroom-interest-list");
      window.sessionStorage.removeItem("furniture-showroom-campaign-context");
      window.localStorage.removeItem("furniture-showroom-campaign-context");
      window.localStorage.setItem("phase3-storage-cleared", "true");
    }
    window.open = ((url?: string | URL) => {
      window.localStorage.setItem("last-window-open", String(url ?? ""));
      return null;
    }) as typeof window.open;
  });
}

test.describe("Phase 3 WhatsApp conversion", () => {
  test("campaign UTM context attaches to interest-list WhatsApp lead", async ({ page, request }) => {
    await installWindowOpenCapture(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/ar/campaigns/showroom-featured-sofas?utm_source=facebook&utm_campaign=sofa-test&fbclid=abc123`);
    await page.goto(`${baseURL}/ar/products/placeholder-corner-sofa`);
    await page.getByRole("button", { name: "Save" }).last().click();
    await page.goto(`${baseURL}/ar/fabrics`);
    await page.getByRole("button", { name: "Save" }).first().click();
    await page.goto(`${baseURL}/ar/interest-list`);

    await page.getByRole("button", { name: "إرسال عبر واتساب" }).click();
    await expect(page.getByText("إرسال استفسار واتساب")).toBeVisible();
    await page.locator("select").first().selectOption("West Bank");
    await page.locator("select").nth(1).selectOption("customization");
    await page.getByPlaceholder("مثال: أريد معرفة السعر مع التوصيل").fill("أريد معرفة السعر مع التوصيل");
    await page.getByRole("button", { name: "افتح واتساب" }).click();

    const opened = await page.evaluate(() => window.localStorage.getItem("last-window-open") ?? "");
    expect(opened).toContain("https://wa.me/");
    expect(decodeURIComponent(opened)).toContain("مرحبًا، أنا مهتم بهذه الاختيارات");
    expect(decodeURIComponent(opened)).toContain("الضفة الغربية");
    expect(decodeURIComponent(opened)).toContain("sofa-test");

    await expect
      .poll(async () => {
        const after = await request.get(`${baseURL}/api/debug/tracking`).then((response) => response.json());
        return {
          leads: after.leads.length,
          latestLead: after.leads.at(-1)
        };
      })
      .toMatchObject({
        leads: expect.any(Number),
        latestLead: {
          payload: {
            deliveryArea: "الضفة الغربية",
            inquiryType: "customization",
            campaignContext: {
              utm_source: "facebook",
              utm_campaign: "sofa-test",
              fbclid: "abc123"
            }
          }
        }
      });
  });

  test("product WhatsApp opens even if lead tracking fails", async ({ page }) => {
    await installWindowOpenCapture(page);
    await page.route("**/api/leads", (route) => route.fulfill({ status: 500, body: "tracking failed" }));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL}/en/products/placeholder-corner-sofa?utm_source=facebook&utm_campaign=fail-test`);
    await page.getByRole("button", { name: "WhatsApp" }).first().click();
    await expect(page.getByText("Send WhatsApp inquiry")).toBeVisible();
    await page.locator("select").first().selectOption("1948 areas");
    await page.locator("select").nth(1).selectOption("ask_for_price");
    await page.getByRole("button", { name: "Open WhatsApp" }).click();

    const opened = await page.evaluate(() => window.localStorage.getItem("last-window-open") ?? "");
    expect(opened).toContain("https://wa.me/");
    expect(decodeURIComponent(opened)).toContain("Temporary corner sofa sample");
    expect(decodeURIComponent(opened)).toContain("مناطق 48");
    expect(decodeURIComponent(opened)).toContain("fail-test");
  });
});
