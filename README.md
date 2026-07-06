# furniture-showroom-template

قالب احترافي لمواقع معارض الأثاث — مبني على Config-Driven Architecture (Next.js 16 + TypeScript + Prisma).

**الملف الوحيد الذي تعدّله لتخصيص الموقع:** `tenant.config.ts`

## التخصيص السريع

```bash
cp tenant.config.example.ts tenant.config.ts
# عدّل tenant.config.ts ببيانات المعرض الجديد
npm run validate:tenant
npm run dev
```

راجع `public/brand/BRAND_ASSETS_REQUIRED.md` للأصول البصرية المطلوبة.

## المميزات

- ✓ 3 لغات (عربية + إنجليزية + عبرية) مع RTL كامل
- ✓ 4 سمات بصرية جاهزة (default | luxury-classic | dark-mode | modern-minimal)
- ✓ تحويل WhatsApp-led كامل مع lead tracking
- ✓ لوحة تحكم كاملة لإدارة المحتوى
- ✓ حملات تسويقية مع UTM attribution
- ✓ تخصيص كامل بملف config واحد — 15 دقيقة حتى النشر

## التطوير

```bash
npm ci
npm run dev

# التحقق
npm run validate:tenant    # تأكد من اكتمال config
npm run lint               # ESLint
npm run typecheck          # tsc --noEmit
npm run verify:code        # lint + typecheck + build
```

## النشر على Vercel

1. ضبط متغيرات البيئة (راجع `.env.example`)
2. `vercel deploy --prod`
3. `npm run db:seed` على قاعدة بيانات الإنتاج
- Use `npm install`, `npm ci`, `npm run lint`, `npm run typecheck`, and `npm run build` for normal work and deployment verification.

## Main Routes

Public:

- `/ar`, `/en`, `/he`
- `/[locale]/catalog`
- `/[locale]/products/[slug]`
- `/[locale]/fabrics`
- `/[locale]/offers`
- `/[locale]/gallery`
- `/[locale]/contact`
- `/[locale]/campaigns/[slug]`
- `/[locale]/interest-list`

Admin:

- `/admin/login`
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/fabrics`
- `/admin/offers`
- `/admin/gallery`
- `/admin/leads`
- `/admin/settings`
- `/admin/analytics`

## Environment

Create `.env` from `.env.example`.

```bash
cp .env.example .env
```

Required:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/furniture_production_v1"
ADMIN_SESSION_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_WHATSAPP_NUMBER="970528682975"
```

For Supabase client deployments, use two database URLs:

- Prisma setup from a trusted machine: Supabase Session Pooler on port `5432`.
- Vercel runtime: Supabase Transaction Pooler on port `6543` with `pgbouncer=true`, `connection_limit=1`, and `pool_timeout=60`.

Local seed admin defaults:

```bash
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me-in-production"
```

These credentials are for local development only. Set real owner credentials before seeding any client/staging database, then change the password from the admin dashboard before a real trial.

## Local Setup

Install dependencies:

```bash
npm install
```

Generate Prisma client:

```bash
npm run db:generate
```

Validate and push schema:

```bash
npm run db:validate
npm run db:push:dev
```

Seed local/bootstrap showroom data and admin user:

```bash
npm run db:seed
```

For the production database, seed is only for intentional shell/bootstrap content. Future real products, photos, fabrics, offers, gallery items, and campaign content should be added and edited from `/admin`.

Run the development server:

```bash
npm run dev
```

Open:

- Public site: `http://localhost:3000/ar`
- Admin: `http://localhost:3000/admin/login`

Useful scripts:

- `npm run db:generate`: generate Prisma client.
- `npm run db:validate`: validate the Prisma schema.
- `npm run db:push:dev`: push schema to the configured development/bootstrap database.
- `npm run db:migrate:dev`: create a Prisma migration during local schema development.
- `npm run db:migrate:deploy`: apply committed Prisma migrations to a production/client database.
- `npm run db:seed`: create or refresh the showroom template/bootstrap content and admin user when intentionally run against the selected database.
- `npm run db:demo:clean`: local/staging cleanup helper only. Do not run this against the production database.
- `npm run admin:reset-password`: emergency owner/developer admin password reset.
- `npm run preflight`: check required env vars without printing secret values or connecting to the database.
- `npm run verify:code`: run lint, typecheck, and build.

## Admin Login

Default local seed credentials:

- Email: `admin@example.com`
- Password: `change-me-in-production`

Override before seeding:

```bash
ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD=strong-local-password npm run db:seed
```

The seed script creates the admin if missing. It does not reset an existing admin password on every seed run. After login, change the password from `/admin/settings` under `إعدادات الأمان`.

Password requirements:

- At least 12 characters.
- At least one lowercase letter, uppercase letter, number, and symbol.
- Avoid default, shared, or easy-to-guess passwords.

Emergency owner/developer reset:

```bash
ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD='new-strong-password' npm run admin:reset-password
```

Run the reset command only against the intended `DATABASE_URL`. It does not print the password and should be used for lockout recovery, not routine daily changes.

## Production Operations

This repository is now configured for the showroom. Treat the current database content as a production shell, not disposable demo data.

- Add real product content from `/admin/products`.
- Add product album photos through the Cloudinary upload flow or approved image URLs.
- Add fabrics, offers, gallery items, and campaign content from their admin sections.
- Verify Cloudinary upload before starting real product entry.
- Keep the first campaign in draft until real products/photos/copy are ready.
- Do not run `npm run db:demo:clean` on the production database.
- Do not rerun seed on production unless intentionally refreshing shell/bootstrap content after confirming the target database and backup/rollback plan.

## Reusable Template Notes

The codebase remains a reusable base for one showroom at a time. For a future different client, work from a separate repository/workspace and do not reuse the the production database database:

1. Copy the project into a new client repository or workspace.
2. Update showroom identity, WhatsApp, address, public copy, social links, and section visibility through `/admin/settings`.
3. Replace `public/images/brand/logo.png`, `public/favicon.svg`, `public/favicon.png`, and `public/favicon.ico`.
4. Set the real WhatsApp number, display phone, address, delivery areas, and working hours.
5. Replace seeded products, fabrics, offers, campaign, and gallery images with the client content from admin.
6. Configure PostgreSQL/Supabase and run `npm run db:generate`, `npm run db:push:dev` for an empty bootstrap database, and `npm run db:seed`.
7. Configure Cloudinary variables for signed admin uploads.
8. Configure Vercel environment variables and deploy.
9. Log in to `/admin/settings` and change the admin password from `إعدادات الأمان`.

The product is intentionally single-showroom. It is not multi-tenant, not a marketplace, has no checkout/payment flow, and uses WhatsApp-led sales with no exact public pricing by default.

Arabic setup checklist: `docs/new-client-setup-ar.md`.

Production launch checklist: `docs/production-launch-checklist-ar.md`.

## Production Readiness Workflow

Use this flow for every new single-showroom client:

1. Create a separate client repo/workspace and confirm `git remote -v`.
2. Configure `.env` locally with the client database, Cloudinary, app URL, WhatsApp, and admin credentials.
3. Run `npm run preflight` to check required env vars without printing secrets or connecting to the database.
4. Use Supabase Session Pooler `5432` for Prisma schema/seed operations.
5. Configure Vercel with the Transaction Pooler `6543` runtime `DATABASE_URL`.
6. Deploy, log in, change the admin password from `/admin/settings`, and customize all showroom settings/content.
7. Verify Cloudinary upload, product albums, Campaign CRUD, WhatsApp inquiries, theme selection, and mobile pages.
8. Complete `docs/production-launch-checklist-ar.md` before sending the live link to a client.

The product intentionally excludes marketplace, checkout/payment, customer accounts, WhatsApp Business API, multi-tenant management, and custom CSS editing.

## Database Operations

The project now separates development/bootstrap schema work from production schema updates:

- Use `npm run db:push:dev` only for local development, early staging bootstrap, or a new empty template database where data loss risk is understood.
- For future production/client schema changes, create migrations locally with `npm run db:migrate:dev`, commit the migration files, then apply them with `npm run db:migrate:deploy`.
- Use Supabase Session Pooler `5432` or a direct trusted database connection for Prisma schema operations. Do not rely on the Vercel Transaction Pooler `6543` for migrations if schema commands fail.
- Keep Vercel runtime on the Transaction Pooler `6543` with `pgbouncer=true`, `connection_limit=1`, and `pool_timeout=60`.
- Before changing a live client database, take a Supabase backup/snapshot if available and record the deployed Git commit.
- If an app deploy fails, roll back the Vercel deployment. If a DB migration fails or must be reverted, use the database backup/restore plan; a Git revert alone does not roll back database state.

There are no committed Prisma migration files in the current template history. Before using migrations for an existing live database, baseline the current schema only after a backup and drift check. Do not run `prisma migrate reset` against a client database.

Operational scripts use confirmation flags for non-local or production-like targets:

- `ALLOW_TEMPLATE_SEED=true npm run db:seed`
- `ALLOW_DEMO_CLEAN=true npm run db:demo:clean`
- `ALLOW_ADMIN_RESET=true npm run admin:reset-password`

Set these flags only for a single intentional run after confirming the target `DATABASE_URL`. The scripts do not print database URLs, passwords, or password hashes.

## Common Admin Tasks

Change showroom settings:

1. Go to `/admin/settings`.
2. Use the structured sections for identity, contact, social links, site copy, WhatsApp, and section visibility.
3. Leave social or Google Maps links empty when the client does not use them; empty public links are hidden or shown as neutral unavailable text.
4. Save the relevant section and verify the public page.

Change WhatsApp number:

1. Go to `/admin/settings`.
2. Open `التواصل`.
3. Enter the WhatsApp number as digits only, for example `970528682975`.
4. Save and test a public WhatsApp inquiry.

Change admin password:

1. Go to `/admin/settings`.
2. Open `إعدادات الأمان`.
3. Enter the current password, the new password, and confirmation.
4. Save.
5. Log out and confirm the new password works.

Hide or show homepage sections:

1. Go to `/admin/settings`.
2. Open `إظهار الأقسام`.
3. Toggle offers, fabrics, gallery, service/trust cards, or FAQ.
4. Save and verify the homepage/navigation.

Add a product album:

1. Go to `/admin/products`.
2. Create or edit a product.
3. Add image rows under the product album section.
4. Set `sortOrder`, captions, alt text, and cover image.
5. Save and verify the public product page.

Add fabrics/colors:

1. Go to `/admin/fabrics`.
2. Add code, slug, multilingual names, color family/type, image URL, and status.
3. Publish and verify `/[locale]/fabrics`.

Manage leads:

1. Go to `/admin/leads`.
2. Filter by status, campaign, product, or search text.
3. Update status, customer name, phone, notes, and follow-up date.

## Images

Admin image fields accept paths under `public`, for example:

```text
/images/sofa-wood-main.svg
```

Admin product, fabric, offer, and gallery forms also support direct signed uploads to Cloudinary. Uploaded images are stored as Cloudinary `secure_url` values in the same existing URL fields, so seeded local images and manual paths continue to work.

### Cloudinary Uploads

Cloudinary is used so real showroom images can be uploaded from the admin dashboard without sending large image files through Vercel serverless functions. The browser uploads directly to Cloudinary after the server signs a short-lived upload request.

Required environment variables:

```bash
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
```

To set up Cloudinary:

1. Create a Cloudinary account.
2. Open the Cloudinary dashboard and copy the cloud name, API key, and API secret.
3. Add the variables above to `.env` locally and to Vercel project settings for deployment.
4. Redeploy after adding the Vercel environment variables.

Images are uploaded into controlled folders: `products`, `fabrics`, `offers`, `gallery`, `campaigns`, and `brand`. The admin integrates uploads for products, product album images, fabrics, offers, gallery images, and campaign cover images. Brand/logo upload is still handled by path or file replacement.

To upload a product image from admin:

1. Log in at `/admin/login`.
2. Open `/admin/products`.
3. Create or edit a product.
4. Use `رفع صورة` / `اختر صورة` in the cover image or album image field.
5. Wait for `تم رفع الصورة`.
6. Save the form.
7. Open the public product page and verify the image appears.

Performance recommendations for real showroom images:

- Prefer WebP/JPEG product photos rather than very large raw phone originals.
- Keep individual uploads under the admin limit and avoid repeatedly uploading near-10MB images when a compressed image is visually enough.
- Use Cloudinary uploads for real product photos so Vercel does not process large files through serverless functions.
- Add 3-6 strong images per important product before adding very large albums; product clarity matters more than image count.
- Check mobile product pages after uploading new photos to ensure furniture is centered and not badly cropped.

Security notes:

- `CLOUDINARY_API_SECRET` is server-only and must never be exposed with a `NEXT_PUBLIC_` prefix.
- The upload signing endpoint is admin-only.
- Upload folders are validated against a fixed allowlist.
- Public visitors cannot request upload signatures.

If Cloudinary variables are missing, builds and public pages still work. The admin uploader will show a configuration error only when an operator tries to upload.

## Showroom Settings

`/admin/settings` stores the single-showroom configuration in the existing `showroom_profile` JSON setting. No multi-tenant structure is used.

Configurable from admin:

- Showroom names, short names, tagline, descriptions, logo path, favicon path, hero image, and Open Graph image.
- WhatsApp number, display phone, address, city/location, working hours, and delivery areas.
- Facebook, Instagram, TikTok, Google Maps, and email. Empty links are not shown as fake public links.
- Homepage hero text, footer text, catalog/fabrics/gallery/offers subtitles, contact intro, and SEO title/description in Arabic, English, and Hebrew.
- Homepage section titles, table section copy, trust/service cards, FAQ heading, and final CTA copy.
- Product page labels, inquiry panel text, linked fabrics heading, related work heading, and similar products heading.
- Campaign page product/offer/fabric section copy and empty selected-products message.
- Interest-list page and drawer empty states, CTA labels, remove/clear labels, and view-page label.
- WhatsApp message intro, button CTA wording, sheet title/subtitle, and send button label.
- Homepage visibility for featured products, tables, offers, fabrics, gallery, service/trust cards, FAQ, and final CTA.

Settings still requiring developer action:

- Replacing the actual logo/favicon files if the client wants local files instead of URL/path settings.
- Changing structural navigation labels, form field labels, product data fields, and homepage section order.
- Theme/color presets, checkout, customer accounts, and WhatsApp Business API are intentionally outside this product phase.

## Theme Presets Foundation

The public showroom has a safe theme preset architecture for controlled visual directions.

Theme presets are fixed in code, not custom CSS entered by an admin. The registry lives in `lib/theme-presets.ts`, and CSS tokens live in `app/globals.css`.

Available active presets:

- `default` / الافتراضي
- `luxury-classic` / فاخر كلاسيكي

Choose the active public theme from `/admin/settings` under `المظهر والثيم`.

Future theme presets must pass mobile and RTL QA before being enabled. See `docs/theme-presets-architecture.md`.

## Campaign Management

`/admin/campaigns` manages marketing landing pages for Facebook, Instagram, WhatsApp, and QR sharing. Campaigns are landing pages only; they do not manage paid ads accounts.

From admin you can:

- Create and edit campaign title, slug, description, cover image, source, sort order, and publish status.
- Select existing products that should appear on the campaign page.
- Upload campaign cover images through Cloudinary or paste a manual URL/path.
- Copy the campaign link with UTM parameters.
- Generate a QR code for the campaign link.
- Publish or unpublish campaigns without deleting products.

Campaign public URL format:

```text
/ar/campaigns/[slug]?utm_source=facebook&utm_medium=paid&utm_campaign=[slug]
```

Only published campaigns are public. Unpublished DB campaigns are not replaced by static fallback content.

## Tracking And Leads

Public WhatsApp inquiry flows create:

- `Lead` records
- `Event` records
- UTM attribution when present
- Product/fabric/offer/interest-list context

Campaign URL format for later ad QA:

```text
/ar/campaigns/showroom-featured-sofas?utm_source=facebook&utm_medium=paid&utm_campaign=showroom_sofas_v1
```

## Clean Local Demo Data

Browser tests and QA rehearsals can create local leads, events, and `admin-test-*` records. Cleanup is for local/staging/template databases only.

Do not run this on the production database:

```bash
npm run db:demo:clean
npm run db:seed
```

This removes local smoke/QA records such as `admin-test-*`, `admin-smoke`, `sofa-test`, and `qa_demo_sofa`; it also restores shell settings/content. Even though scripts include safety checks, treat cleanup as unsafe for any real client database unless there is written approval and a backup.

## Prepare A Clean Showroom Demo

For a disposable local/staging demo only:

```bash
npm run db:demo:clean
npm run db:seed
```

Then verify:

- `/admin/products` has the seeded showroom products and each product row can copy the Arabic public product link.
- Product QR codes are available from `/admin/products`.
- Campaign links and QR codes are available from `/admin/campaigns` and the admin dashboard.
- `/admin/leads` shows follow-up badges for overdue, today, and upcoming follow-ups when those dates exist.
- `/admin` shows owner-friendly summaries for recent interactions, WhatsApp clicks, new leads, follow-ups, top products, and top campaigns.
- `/admin/analytics` shows simple date filters, top products, campaign performance, traffic sources, and recent activity based on internal site events.
- Main public pages feel responsive on mobile and do not show obvious image layout shift.

For the production database preview, do not clean demo data. Instead, use admin to delete or update only the specific placeholder products/content that should be replaced.

## Final Production QA Checklist

Public:

- `/ar`
- `/ar/catalog`
- A public product page
- `/ar/contact`
- `/ar/interest-list`
- `/ar/fabrics`
- `/ar/offers`
- `/ar/gallery`
- Logo and favicon on a hard refresh/incognito load
- No `/sales` page or public sales-kit link

Admin:

- `/admin/login`
- `/admin/settings`
- `/admin/products`
- Product albums with multiple images
- Cloudinary upload from an admin image field
- `/admin/campaigns`
- `/admin/leads`
- `/admin/analytics`
- Theme selection
- Password change

Business:

- WhatsApp opens `970528682975`.
- Product inquiry creates the expected lead/event records.
- Interest-list WhatsApp flow works.
- Campaign remains draft until real content is ready.
- Placeholder products/photos are replaced later from admin before ad launch.

Ops:

- Vercel production env variables are checked without printing secret values.
- Vercel production `DATABASE_URL` uses the Supabase Transaction Pooler on port `6543`.
- Local Prisma operations use the Supabase Session Pooler on port `5432`.
- Supabase backup/rollback is confirmed before replacing the live site.
- Preview branch is tested before merge to main.
- Production public/admin smoke QA is repeated after main deploy.

## Public API Abuse Protection

Public write endpoints use lightweight abuse protection:

- `/api/leads`: stricter limit for WhatsApp inquiry submissions.
- `/api/events`: looser limit for page/product/campaign/interest tracking events.

The current limiter is in-memory and best-effort. It is suitable for pilot/basic protection against accidental spam and small bursts, but Vercel serverless instances can be distributed or recycled, so it is not a perfect global rate limit. For high-traffic clients, upgrade `lib/rate-limit.ts` to Redis, Vercel KV, or Upstash.

When a client sends too many requests, the API returns:

```json
{ "ok": false, "error": "too_many_requests" }
```

Normal browsing should continue if tracking is rate-limited. Lead and event payloads also have size and field limits to protect Supabase and keep analytics cleaner. Do not treat internal analytics as anti-fraud data.

## SEO

Included:

- Locale metadata
- Product metadata and Open Graph images
- Canonical/alternate locale links for products
- Dynamic `sitemap.xml`
- `robots.txt`
- Semantic product, offer, gallery, and form structure

Set `NEXT_PUBLIC_APP_URL` to the real domain before deployment so metadata and sitemap URLs are correct.

## Verification

Run:

```bash
npm run preflight
npm run lint
npm run typecheck
npm run build
```

Combined local code checks:

```bash
npm run verify:code
```

Browser tests:

```bash
npx playwright test tests/phase2-public.spec.ts --reporter=list
```

Prefer targeted Playwright runs for day-to-day checks. Reserve the full browser suite for release gates.
On low-resource machines or small cloud runners, avoid repeated browser retries; use lint, typecheck, build, and manual browser QA first.

If browsers are missing:

```bash
npx playwright install
```

## Deployment: Vercel

1. Create a PostgreSQL/Supabase database for the client.
2. Set environment variables in Vercel:
   - `DATABASE_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
3. Set Vercel `DATABASE_URL` to the Supabase Transaction Pooler on port `6543`.
4. Include `pgbouncer=true`, `connection_limit=1`, and `pool_timeout=60` in the runtime database URL.
5. Deploy from the repository.
6. Run Prisma setup from a trusted machine using the Supabase Session Pooler on port `5432`.
   For a new empty bootstrap database:

```bash
npm run db:generate
npm run db:push:dev
npm run db:seed
```

   For later production schema updates, use committed migrations:

```bash
npm run db:migrate:deploy
```

7. Do not run demo cleanup on the production database. Use it only on a confirmed local/staging/template database. Non-local runs require `ALLOW_DEMO_CLEAN=true` and an explicit backup/rollback decision.
8. Run `npm run preflight` locally before final handoff. It checks env presence and obvious unsafe defaults without printing secrets.
9. Log in to `/admin/login` and change local demo values.
10. Change the admin password from `/admin/settings`. `ADMIN_EMAIL` and `ADMIN_PASSWORD` are for initial seed/reset operations, not ongoing password management.
11. Complete `docs/production-launch-checklist-ar.md`.

For long-term production, prefer Prisma migrations over `db push`.

## Deployment: Generic VPS

1. Install Node.js 22+ and PostgreSQL.
2. Clone the repository and create `.env`.
3. Install dependencies:

```bash
npm ci
```

4. Prepare database:

```bash
npm run db:generate
npm run db:push:dev
npm run db:seed
```

5. Build and start:

```bash
npm run build
npm run start
```

6. Put the app behind HTTPS with Nginx/Caddy and set `NEXT_PUBLIC_APP_URL` to the public URL.

## Known Limitations

- Cloudinary asset deletion is not implemented; removing an image from admin only removes the URL from the app database.
- Admin auth is intentionally simple signed-cookie auth, not a full RBAC/account recovery system.
- Campaign CRUD is intentionally simple: no ad platform integration, no A/B testing, and no campaign-specific analytics dashboard beyond existing event/lead tracking.
- Brand/logo image upload controls are not implemented unless those admin flows already exist.
- No automated email/SMS notifications for follow-ups.
- Test runs create real smoke-test rows in the local database.

## Recommended Next Improvements

- Create a formal baseline migration for existing deployed databases after a backup and Prisma drift check.
- Add Cloudinary asset cleanup for replaced/deleted images after a safe ownership model exists.
- Add additional theme presets only after mobile and RTL QA.
- Add lead export and follow-up reminders.
- Add richer analytics date filters.
- Add Playwright visual snapshots for the main mobile pages.
