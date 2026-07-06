import { expect, test } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "change-me-in-production";

async function login(page: import("@playwright/test").Page) {
  await page.goto(`${baseURL}/admin/login`);
  await page.getByPlaceholder("البريد الإلكتروني").fill(adminEmail);
  await page.getByPlaceholder("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe("Phase 1 admin image uploads", () => {
  test("signing endpoint requires admin auth", async ({ request }) => {
    const response = await request.post(`${baseURL}/api/admin/uploads/sign`, {
      data: { folder: "products" }
    });

    expect(response.status()).toBe(401);
  });

  test("signing endpoint rejects unsupported folders for authenticated admin", async ({ page }) => {
    await login(page);

    const result = await page.evaluate(async () => {
      const response = await fetch("/api/admin/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "customers" })
      });
      return { status: response.status, body: await response.json() };
    });

    expect(result.status).toBe(400);
    expect(result.body.error).toBe("Unsupported upload folder");
  });

  test("products admin renders uploader while preserving manual URL fields", async ({ page }) => {
    await login(page);
    await page.goto(`${baseURL}/admin/products`);

    await expect(page.getByRole("heading", { name: "المنتجات والتصاميم" })).toBeVisible();
    await expect(page.getByText("اسحب الصورة هنا أو اختر من الجهاز").first()).toBeVisible();
    await expect(page.locator('input[name="coverImageUrl"]')).toBeVisible();
  });

  test("public seeded product still loads with existing images", async ({ page }) => {
    await page.goto(`${baseURL}/ar/products/placeholder-corner-sofa`);

    await expect(page.getByText("AI-TEMP-102")).toBeVisible();
    await expect(page.getByRole("button", { name: "Open product image lightbox" })).toBeVisible();
  });
});
