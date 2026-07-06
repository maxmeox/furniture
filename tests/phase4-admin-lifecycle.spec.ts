import { expect, test } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { Buffer } from "node:buffer";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import "./_helpers/load-env";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "change-me-in-production";

if (!process.env.DATABASE_URL) {
  throw new Error("[phase4-admin-lifecycle] DATABASE_URL is missing. .env.test must be loaded before PrismaClient is constructed.");
}
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

const CLOUDINARY_READY = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

function makeTestImagePath(): string {
  const dir = tmpdir();
  const path = join(dir, `showroom-smoke-${Date.now()}.png`);
  const png = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c636400010000000500010d0a2db40000000049454e44ae426082",
    "hex"
  );
  writeFileSync(path, png);
  return path;
}

async function login(page: import("@playwright/test").Page) {
  await page.goto(`${baseURL}/admin/login`);
  await page.getByTestId("admin-login-email").fill(adminEmail);
  await page.getByTestId("admin-login-password").fill(adminPassword);
  await page.getByRole("button", { name: "دخول" }).click();
  await page.waitForURL(/\/admin$/);
}

test.describe.configure({ mode: "serial" });

test.describe("Phase 4 admin lifecycle (login → category → product → image → publish → 3 locales → cleanup)", () => {
  test.setTimeout(120000);

  const id = Date.now();
  const categorySlug = `lifecycle-category-${id}`;
  const productSlug = `lifecycle-product-${id}`;
  const productNameAr = `منتج دورة الحياة ${id}`;
  const productNameEn = `Lifecycle Product ${id}`;
  const productNameHe = `מוצר מחזור חיים ${id}`;
  const productDescriptionAr = `وصف عربي لدورة الحياة رقم ${id}`;
  const productDescriptionEn = `Lifecycle English description ${id}`;
  const productDescriptionHe = `תיאור עברי למחזור חיים ${id}`;

  let productId: string | null = null;
  let uploadedImageUrl: string | null = null;
  let uploadedImagePublicId: string | null = null;

  test.beforeAll(async () => {
    // Make sure we start with a clean slate for our specific slugs
    await prisma.productImage.deleteMany({ where: { product: { slug: productSlug } } });
    await prisma.product.deleteMany({ where: { slug: productSlug } });
    await prisma.category.deleteMany({ where: { slug: categorySlug } });
  });

  test.afterAll(async () => {
    if (uploadedImagePublicId) {
      try {
        await prisma.productImage.deleteMany({ where: { publicId: uploadedImagePublicId } });
      } catch (e) {
        console.warn("[cleanup] Could not remove image by publicId:", e);
      }
    }
    if (productId) {
      try {
        await prisma.productImage.deleteMany({ where: { productId } });
        await prisma.product.deleteMany({ where: { id: productId } });
      } catch (e) {
        console.warn("[cleanup] Could not remove product:", e);
      }
    }
    try {
      await prisma.category.deleteMany({ where: { slug: categorySlug } });
    } catch (e) {
      console.warn("[cleanup] Could not remove category:", e);
    }
    await prisma.$disconnect();
  });

  test("step 1: admin login works", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: "لوحة التحكم" })).toBeVisible();
  });

  test("step 2: create a trilingual category", async ({ page }) => {
    await login(page);
    await page.goto(`${baseURL}/admin/categories`);
    const form = page.getByTestId("category-form");
    await form.locator('input[name="slug"]').fill(categorySlug);
    await form.locator('input[name="nameAr"]').fill("تصنيف دورة الحياة");
    await form.locator('input[name="nameEn"]').fill("Lifecycle Category");
    await form.locator('input[name="nameHe"]').fill("קטגוריית מחזור חיים");
    await form.getByRole("button", { name: "حفظ التصنيف" }).click();
    await page.waitForURL(/\/admin\/categories/);

    // Wait until the DB is consistent (page was revalidated by redirect)
    await expect.poll(async () => {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      return cat?.id ?? null;
    }, { timeout: 10000 }).not.toBeNull();

    const cat = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });
    expect(cat.nameAr).toBe("تصنيف دورة الحياة");
    expect(cat.nameEn).toBe("Lifecycle Category");
    expect(cat.nameHe).toBe("קטגוריית מחזור חיים");
  });

  test("step 3: create a trilingual product bound to the new category (status=draft)", async ({ page }) => {
    await login(page);
    const cat = await prisma.category.findUniqueOrThrow({ where: { slug: categorySlug } });
    await page.goto(`${baseURL}/admin/products`);
    const form = page.getByTestId("product-form");
    await form.locator('input[name="code"]').fill(`LC-${id}`);
    await form.locator('input[name="slug"]').fill(productSlug);
    await form.locator('select[name="categoryId"]').selectOption(cat.id);
    await form.locator('input[name="titleAr"]').fill(productNameAr);
    await form.locator('input[name="titleEn"]').fill(productNameEn);
    await form.locator('input[name="titleHe"]').fill(productNameHe);
    await form.locator('textarea[name="descriptionAr"]').fill(productDescriptionAr);
    await form.locator('textarea[name="descriptionEn"]').fill(productDescriptionEn);
    await form.locator('textarea[name="descriptionHe"]').fill(productDescriptionHe);
    await form.locator('select[name="status"]').selectOption("draft");
    await form.getByRole("button", { name: "حفظ المنتج" }).click();
    await page.waitForURL(/\/admin\/products/);

    await expect.poll(async () => {
      const p = await prisma.product.findUnique({ where: { slug: productSlug } });
      return p?.id ?? null;
    }, { timeout: 10000 }).not.toBeNull();

    const product = await prisma.product.findUniqueOrThrow({ where: { slug: productSlug } });
    productId = product.id;
    expect(product.titleAr).toBe(productNameAr);
    expect(product.titleEn).toBe(productNameEn);
    expect(product.titleHe).toBe(productNameHe);
    expect(product.descriptionAr).toBe(productDescriptionAr);
    expect(product.status).toBe("draft");
  });

  test("step 4: attach one product image (Cloudinary when configured, placeholder otherwise)", async ({ page }) => {
    await login(page);
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: productSlug } });
    await page.goto(`${baseURL}/admin/products?edit=${product.id}`);
    const form = page.getByTestId("product-image-add-form");
    const urlField = form.locator('input[name="url"]');

    if (CLOUDINARY_READY) {
      const filePath = makeTestImagePath();
      const fileInput = form.locator('input[type="file"]');
      await fileInput.setInputFiles(filePath);
      await expect(form.getByText("تم رفع الصورة")).toBeVisible({ timeout: 15000 });
      uploadedImageUrl = await urlField.inputValue();
      expect(uploadedImageUrl).toMatch(/^https:\/\/res\.cloudinary\.com\//);
    } else {
      console.warn("[lifecycle] Cloudinary not configured locally — using a local /images/* path. Production uses real Cloudinary.");
      const placeholder = `/images/hero-showroom.svg`;
      await urlField.fill(placeholder);
      uploadedImageUrl = placeholder;
    }

    await form.locator('input[name="titleAr"]').fill(`صورة دورة الحياة ${id}`);
    await form.locator('input[name="altAr"]').fill(`نص بديل صورة دورة الحياة ${id}`);
    await form.locator('input[name="isCover"]').check();
    await form.getByRole("button", { name: "إضافة صورة جديدة للألبوم" }).click();
    await page.waitForURL(/\/admin\/products/);

    await expect.poll(async () => {
      const img = await prisma.productImage.findFirst({ where: { productId: product.id, isCover: true } });
      return img?.id ?? null;
    }, { timeout: 10000 }).not.toBeNull();

    const created = await prisma.productImage.findFirstOrThrow({ where: { productId: product.id, isCover: true } });
    expect(created.url).toBe(uploadedImageUrl);
    if (created.publicId) uploadedImagePublicId = created.publicId;
  });

  test("step 5: publish the product (draft → published); cover image updates product.coverImageUrl", async ({ page }) => {
    await login(page);
    const product = await prisma.product.findUniqueOrThrow({ where: { slug: productSlug } });
    await page.goto(`${baseURL}/admin/products?edit=${product.id}`);
    const form = page.getByTestId("product-form");
    await form.locator('select[name="status"]').selectOption("published");
    await form.getByRole("button", { name: "حفظ المنتج" }).click();
    await page.waitForURL(/\/admin\/products/);

    await expect.poll(async () => {
      const p = await prisma.product.findUnique({ where: { slug: productSlug }, select: { status: true } });
      return p?.status ?? null;
    }, { timeout: 10000 }).toBe("published");

    const published = await prisma.product.findUniqueOrThrow({ where: { slug: productSlug } });
    expect(published.status).toBe("published");
    expect(published.coverImageUrl).toBe(uploadedImageUrl);
  });

  for (const locale of ["ar", "en", "he"] as const) {
    test(`step 6.${locale}: public product page renders correctly in ${locale}`, async ({ page }) => {
      const titles: Record<string, string> = { ar: productNameAr, en: productNameEn, he: productNameHe };
      const descriptions: Record<string, string> = {
        ar: productDescriptionAr,
        en: productDescriptionEn,
        he: productDescriptionHe
      };
      const code = `LC-${id}`;

      await page.goto(`${baseURL}/${locale}/products/${productSlug}`);
      await expect(page.getByText(titles[locale]).first()).toBeVisible();
      await expect(page.getByText(descriptions[locale]).first()).toBeVisible();
      await expect(page.getByText(code).first()).toBeVisible();

      if (uploadedImageUrl?.startsWith("https://res.cloudinary.com/")) {
        await expect(page.locator(`img[src="${uploadedImageUrl}"]`).first()).toBeVisible();
      } else if (uploadedImageUrl?.startsWith("/images/")) {
        // Local placeholder is fine — the cover image was set on the product
        const coverCheck = await prisma.product.findUniqueOrThrow({ where: { slug: productSlug }, select: { coverImageUrl: true } });
        expect(coverCheck.coverImageUrl).toBe(uploadedImageUrl);
      }
    });
  }
});
