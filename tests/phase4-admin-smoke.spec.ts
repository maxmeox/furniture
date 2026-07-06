import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const prisma = new PrismaClient();
const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "change-me-in-production";

async function login(page: import("@playwright/test").Page) {
  await page.goto(`${baseURL}/admin/login`);
  await page.getByPlaceholder("البريد الإلكتروني").fill(adminEmail);
  await page.getByPlaceholder("كلمة المرور").fill(adminPassword);
  await page.getByRole("button", { name: "دخول" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.describe.serial("Phase 4 admin dashboard", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("admin auth protects routes and supports login, logout, and invalid login", async ({ page }) => {
    await page.goto(`${baseURL}/admin`);
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.getByPlaceholder("البريد الإلكتروني").fill(adminEmail);
    await page.getByPlaceholder("كلمة المرور").fill("wrong-password");
    await page.getByRole("button", { name: "دخول" }).click();
    await expect(page.getByText("بيانات الدخول غير صحيحة.")).toBeVisible();

    await login(page);
    await expect(page.getByRole("heading", { name: "لوحة التحكم" })).toBeVisible();
    await page.getByRole("button", { name: "تسجيل الخروج" }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("admin CRUD records appear on public pages and tracking reaches leads analytics", async ({ page }) => {
    test.setTimeout(60000);
    const id = Date.now();
    const categorySlug = `admin-test-category-${id}`;
    const productSlug = `admin-test-product-${id}`;
    const fabricSlug = `admin-test-fabric-${id}`;
    const offerSlug = `admin-test-offer-${id}`;
    const productNameAr = `تصميم اختبار إداري ${id}`;
    const fabricNameAr = `قماش اختبار إداري ${id}`;
    const offerNameAr = `عرض اختبار إداري ${id}`;
    const galleryNameAr = `معرض اختبار إداري ${id}`;
    const leadName = `Admin Smoke Lead ${id}`;

    await login(page);

    await page.goto(`${baseURL}/admin/categories`);
    await page.locator('input[name="slug"]').fill(categorySlug);
    await page.locator('input[name="nameAr"]').fill("تصنيف اختبار إداري");
    await page.locator('input[name="nameEn"]').fill("Admin test category");
    await page.locator('input[name="nameHe"]').fill("קטגוריית בדיקה");
    await page.getByRole("button", { name: "حفظ التصنيف" }).click();
    await expect(page.getByText(categorySlug)).toBeVisible();

    await page.goto(`${baseURL}/admin/products`);
    await page.locator('input[name="code"]').fill(`ADM-${id}`);
    await page.locator('input[name="slug"]').fill(productSlug);
    await page.locator('select[name="categoryId"]').selectOption({ label: "تصنيف اختبار إداري" });
    await page.locator('input[name="titleAr"]').fill(productNameAr);
    await page.locator('input[name="titleEn"]').fill(`Admin test product ${id}`);
    await page.locator('input[name="titleHe"]').fill(`מוצר בדיקה ${id}`);
    await page.locator('textarea[name="descriptionAr"]').fill("وصف عربي من لوحة التحكم");
    await page.locator('textarea[name="descriptionEn"]').fill("English admin description");
    await page.locator('textarea[name="descriptionHe"]').fill("תיאור בעברית");
    await page.locator('select[name="priceLabel"]').selectOption("medium");
    await page.locator('select[name="status"]').selectOption("published");
    await page.getByRole("button", { name: "حفظ المنتج" }).click();
    await expect(page.getByText(productNameAr)).toBeVisible();

    const product = await prisma.product.findUniqueOrThrow({ where: { slug: productSlug } });
    await page.goto(`${baseURL}/admin/products?edit=${product.id}`);
    const imageForm = page.locator("form").filter({ has: page.locator('input[name="productId"]') }).first();
    await imageForm.locator('input[name="url"]').fill("/images/sofa-wood-main.svg");
    await imageForm.locator('input[name="titleAr"]').fill("صورة رئيسية اختبار");
    await imageForm.locator('input[name="altAr"]').fill("Alt اختبار");
    await imageForm.locator('input[name="isCover"]').check();
    await imageForm.getByRole("button", { name: "إضافة صورة" }).click();
    await expect(page.locator('input[value="صورة رئيسية اختبار"]')).toBeVisible();

    await page.goto(`${baseURL}/admin/products?edit=${product.id}`);
    const secondImageForm = page.locator("form").filter({ has: page.locator('input[name="productId"]') }).first();
    await secondImageForm.locator('input[name="url"]').fill("/images/sofa-wood-side.svg");
    await secondImageForm.locator('input[name="titleAr"]').fill("صورة جانبية اختبار");
    await secondImageForm.locator('input[name="altAr"]').fill("Alt جانبي اختبار");
    await secondImageForm.getByRole("button", { name: "إضافة صورة" }).click();
    await expect(page.locator('input[value="صورة جانبية اختبار"]')).toBeVisible();

    const savedSecondImageForm = page.locator("form").filter({ has: page.locator('input[value="/images/sofa-wood-side.svg"]') }).first();
    await savedSecondImageForm.locator('input[name="sortOrder"]').fill("0");
    await savedSecondImageForm.locator('textarea[name="captionAr"]').fill("تعليق صورة الألبوم من لوحة التحكم");
    await savedSecondImageForm.locator('input[name="altAr"]').fill("نص بديل محدث للصورة الجانبية");
    await savedSecondImageForm.locator('input[name="isCover"]').check();
    await savedSecondImageForm.getByRole("button", { name: "حفظ الصورة" }).click();
    await expect(savedSecondImageForm.locator('textarea[name="captionAr"]')).toHaveValue("تعليق صورة الألبوم من لوحة التحكم");

    await page.goto(`${baseURL}/ar/catalog`);
    await expect(page.getByText(productNameAr)).toBeVisible();
    await page.goto(`${baseURL}/ar/products/${productSlug}`);
    await expect(page.getByText(`ADM-${id}`)).toBeVisible();
    await expect(page.getByText("وصف عربي من لوحة التحكم")).toBeVisible();
    await expect(page.getByText("تعليق صورة الألبوم من لوحة التحكم")).toBeVisible();
    await expect(page.getByRole("button", { name: /Show/ })).toHaveCount(2);
    await page.getByRole("button", { name: "Open product image lightbox" }).click();
    await expect(page.getByText("1 / 2")).toBeVisible();
    await expect(page.getByText("تعليق صورة الألبوم من لوحة التحكم").last()).toBeVisible();
    await page.getByRole("button", { name: "Close lightbox" }).click();

    await page.goto(`${baseURL}/admin/fabrics`);
    await page.locator('input[name="code"]').fill(`FAB-ADM-${id}`);
    await page.locator('input[name="slug"]').fill(fabricSlug);
    await page.locator('input[name="nameAr"]').fill(fabricNameAr);
    await page.locator('input[name="nameEn"]').fill(`Admin test fabric ${id}`);
    await page.locator('input[name="nameHe"]').fill(`בד בדיקה ${id}`);
    await page.locator('input[name="familyAr"]').fill("رمادي");
    await page.locator('input[name="typeAr"]').fill("مخمل");
    await page.locator('input[name="imageUrl"]').fill("/images/fabric-greige.svg");
    await page.locator('select[name="status"]').selectOption("published");
    await page.getByRole("button", { name: "حفظ القماش" }).click();
    await page.goto(`${baseURL}/ar/fabrics`);
    await expect(page.getByText(fabricNameAr)).toBeVisible();
    await page.getByRole("button", { name: "Save" }).last().click();
    await expect(page.getByText("تم الحفظ في قائمة الاهتمام")).toBeVisible();

    await page.goto(`${baseURL}/admin/offers`);
    await page.locator('input[name="slug"]').fill(offerSlug);
    await page.locator('input[name="titleAr"]').fill(offerNameAr);
    await page.locator('input[name="titleEn"]').fill(`Admin test offer ${id}`);
    await page.locator('input[name="titleHe"]').fill(`מבצע בדיקה ${id}`);
    await page.locator('textarea[name="descriptionAr"]').fill("عرض من لوحة التحكم");
    await page.locator('input[name="relatedProductSlugs"]').fill(productSlug);
    await page.locator('select[name="status"]').selectOption("published");
    await page.getByRole("button", { name: "حفظ العرض" }).click();
    await page.goto(`${baseURL}/ar/offers`);
    await expect(page.getByText(offerNameAr)).toBeVisible();

    await page.goto(`${baseURL}/admin/gallery`);
    await page.locator('input[name="slug"]').first().fill(`admin-test-gallery-${id}`);
    await page.locator('input[name="titleAr"]').first().fill(galleryNameAr);
    await page.locator('input[name="titleEn"]').first().fill(`Admin test gallery ${id}`);
    await page.locator('input[name="titleHe"]').first().fill(`גלריית בדיקה ${id}`);
    await page.getByRole("button", { name: "حفظ الألبوم" }).click();
    const galleryItemForm = page.locator("form").filter({ has: page.locator('input[name="imageUrl"]') }).first();
    await expect(galleryItemForm.locator("option", { hasText: galleryNameAr })).toHaveCount(1);
    await galleryItemForm.locator('select[name="albumId"]').selectOption({ label: galleryNameAr });
    await galleryItemForm.locator('input[name="imageUrl"]').fill("/images/gallery-majlis.svg");
    await galleryItemForm.locator('input[name="titleAr"]').fill(galleryNameAr);
    await galleryItemForm.getByRole("button", { name: "إضافة الصورة" }).click();
    await page.goto(`${baseURL}/ar/gallery`);
    await expect(page.getByText(galleryNameAr)).toBeVisible();
    await page.locator("figure button").first().click();
    await expect(page.getByText("1 /")).toBeVisible();

    await page.goto(`${baseURL}/admin/settings`);
    await page.locator('input[name="whatsapp"]').fill("970599123456");
    await page.locator('input[name="phone"]').fill("+970 59 912 3456");
    await page.locator('input[name="address"]').fill("Template admin test address");
    await page.locator('input[name="workingHours"]').fill("Admin test hours");
    await page.evaluate(() => {
      const input = document.querySelector('input[name="deliveryAreas"]') as HTMLInputElement | null;
      if (input) input.value = "الضفة الغربية\nمناطق 48";
    });
    await page.getByRole("button", { name: "حفظ معلومات التواصل" }).click();
    await page.goto(`${baseURL}/admin/settings`);
    await page.locator('input[name="facebook"]').fill("https://example.com/facebook");
    await page.locator('input[name="instagram"]').fill("https://example.com/instagram");
    await page.locator('input[name="mapLink"]').fill("https://example.com/maps");
    await page.getByRole("button", { name: "حفظ الروابط" }).click();
    await page.goto(`${baseURL}/admin/settings`);
    await page.locator('textarea[name="footerTextAr"]').fill("نص فوتر اختبار من لوحة التحكم");
    await page.getByRole("button", { name: "حفظ نصوص الموقع" }).click();
    await page.goto(`${baseURL}/ar/contact`);
    await expect(page.getByText("Template admin test address").first()).toBeVisible();
    await expect(page.getByText("نص فوتر اختبار من لوحة التحكم")).toBeVisible();

    await page.addInitScript(() => {
      window.open = ((url?: string | URL) => {
        window.localStorage.setItem("last-window-open", String(url ?? ""));
        return null;
      }) as typeof window.open;
    });
    await page.goto(`${baseURL}/ar/products/${productSlug}?utm_source=facebook&utm_campaign=admin-smoke`);
    await page.getByRole("button", { name: "WhatsApp" }).first().click();
    await page.locator("select").first().selectOption("West Bank");
    await page.getByRole("button", { name: "معرفة السعر" }).click();
    await page.getByRole("button", { name: /متابعة/i }).click();
    await expect.poll(async () => page.evaluate(() => window.localStorage.getItem("last-window-open") ?? "")).toContain("970599123456");

    await page.goto(`${baseURL}/admin/leads?campaign=admin-smoke`);
    await expect(page.getByText("admin-smoke").first()).toBeVisible();
    const leadForm = page.locator("form").filter({ has: page.locator('input[name="manualName"]') }).first();
    await leadForm.locator('input[name="manualName"]').fill(leadName);
    await leadForm.locator('input[name="manualPhone"]').fill("0599123456");
    await leadForm.locator('textarea[name="notes"]').fill("Follow up from smoke test");
    await leadForm.locator('input[name="followUpAt"]').fill("2026-05-20");
    await leadForm.locator('select[name="status"]').selectOption("interested");
    await leadForm.getByRole("button", { name: "تحديث Lead" }).click();
    await page.goto(`${baseURL}/admin/leads?status=interested&q=${encodeURIComponent(leadName)}`);
    await expect(page.locator('input[name="manualName"]').first()).toHaveValue(leadName);

    await page.goto(`${baseURL}/admin/analytics`);
    await expect(page.getByRole("heading", { name: "الإحصائيات" })).toBeVisible();
  });
});
