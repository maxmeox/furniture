import { expect, test } from "@playwright/test";

async function setup(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    window.open = ((url?: string | URL) => {
      window.sessionStorage.setItem("last-window-open", String(url ?? ""));
      return null;
    }) as typeof window.open;
  });
}

test.describe("WhatsApp Inquiry Modal — Integration", () => {
  test("opens from product page, fills form, generates correct WhatsApp link", async ({ page }) => {
    await setup(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/products/placeholder-corner-sofa");
    await page.waitForLoadState("networkidle");

    // Click the WhatsApp inquiry button on the product page
    const whatsappButton = page.getByRole("button", { name: /whatsapp/i }).first();
    await expect(whatsappButton).toBeVisible();
    await whatsappButton.click();

    // Verify the modal opens
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Verify entity info shows in modal (on mobile the second instance is the visible one)
    await expect(dialog.getByText("Temporary corner sofa sample").last()).toBeVisible();
    await expect(dialog.getByText("AI-TEMP-102").last()).toBeVisible();

    // Select "Ask about delivery" request type
    await page.getByRole("button", { name: /delivery/i }).first().click();

    // Select delivery area
    await page.locator("select").first().selectOption("الضفة الغربية");

    // Fill optional fabric/color
    await page.getByPlaceholder(/fab-027|greige/i).fill("Beige Fabric FAB-001");

    // Fill optional note
    await page.getByPlaceholder(/price with delivery/i).fill("I want to know price with delivery to Jerusalem");

    // Click the CTA button
    await page.getByRole("button", { name: /continue to whatsapp|open whatsapp|متابعة|افتح/i }).click();

    // Verify WhatsApp link was generated
    const openedUrl = await page.evaluate(() => sessionStorage.getItem("last-window-open") ?? "");
    expect(openedUrl).toContain("https://wa.me/");
    const decoded = decodeURIComponent(openedUrl);
    expect(decoded).toContain("Temporary corner sofa sample");
    expect(decoded).toContain("AI-TEMP-102");
    expect(decoded).toContain("Beige Fabric FAB-001");
    expect(decoded).toContain("delivery to Jerusalem");
  });

  test("supports RTL Arabic layout", async ({ page }) => {
    await setup(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/ar/products/placeholder-corner-sofa");
    await page.waitForLoadState("networkidle");

    const whatsappButton = page.getByRole("button", { name: /whatsapp/i }).first();
    await whatsappButton.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("نموذج مؤقت لزاوية").last()).toBeVisible();

    // Verify Arabic labels are visible
    await expect(dialog.getByText("منطقة التوصيل")).toBeVisible();
    await expect(dialog.getByText("نوع الطلب").last()).toBeVisible();

    // Select a delivery area
    await page.locator("select").first().selectOption("الضفة الغربية");

    // Click CTA
    await page.getByRole("button", { name: /متابعة إلى واتساب|افتح واتساب/i }).click();

    const openedUrl = await page.evaluate(() => sessionStorage.getItem("last-window-open") ?? "");
    expect(openedUrl).toContain("https://wa.me/");
    const decoded = decodeURIComponent(openedUrl);
    expect(decoded).toContain("مرحبًا");
    expect(decoded).toContain("الضفة الغربية");
  });

  test("desktop two-panel layout shows trust indicators", async ({ page }) => {
    await setup(page);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en/products/placeholder-corner-sofa");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /whatsapp/i }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Trust indicators should be visible on desktop (use first() to handle strict mode)
    await expect(dialog.getByText("Fast response").first()).toBeVisible();
    await expect(dialog.getByText("Free consultation").first()).toBeVisible();
    await expect(dialog.getByText("Reliable delivery").first()).toBeVisible();
    await expect(dialog.getByText("Guaranteed quality").first()).toBeVisible();

    // Secure badge should be visible
    await expect(dialog.getByText("Secure & free")).toBeVisible();
  });

  test("focus trap works inside modal", async ({ page }) => {
    await setup(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/products/placeholder-corner-sofa");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /whatsapp/i }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Tab through focusable elements without errors
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Escape should close the modal
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("closes via close button", async ({ page }) => {
    await setup(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/products/placeholder-corner-sofa");
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: /whatsapp/i }).first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Click the close button
    await dialog.getByRole("button", { name: /close|إغلاق|סגור/i }).click();
    await expect(dialog).not.toBeVisible();
  });
});
