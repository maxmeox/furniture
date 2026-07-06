# Furniture Showroom Template — Customization Guide

## 🚀 Quick Start (15 minutes)

```bash
git clone [template-url] [client-name]-showroom
cd [client-name]-showroom
cp tenant.config.example.ts tenant.config.ts
# Edit tenant.config.ts with client data
npm ci
npm run validate:tenant
npm run dev
```

## 📋 What You Need from the Client

### Mandatory (can't launch without)
- ✅ Showroom name (Arabic + English)
- ✅ WhatsApp number (digits only: 970XXXXXXXXX)
- ✅ City + full address
- ✅ Delivery areas (names)
- ✅ Logo files (see `public/brand/BRAND_ASSETS_REQUIRED.md`)

### Recommended (better quality)
- Showroom description for SEO (150-160 chars)
- Social media links
- og-image.jpg (1200×630px)
- Google Analytics ID (G-XXXXXXXXXX)

### Optional
- Hebrew translations (only if client serves Hebrew-speaking customers)
- Custom brand colors (if default themes don't match)
- Custom fonts from Google Fonts

## 🔧 Configuration Steps

### 1. Fill `tenant.config.ts`

Copy the example and replace every `★` field:

```typescript
identity: {
  nameAr:  'اسم المعرض بالعربية',     // ← Replace
  nameEn:  'Showroom Name in English', // ← Replace
  city:    'المدينة',                  // ← Replace
  // ... etc
}
```

### 2. Place Brand Assets

Put these files in `public/brand/`:
- `logo-light.svg` (140×40px)
- `logo-dark.svg` (140×40px)
- `favicon.ico` (32×32px)
- `apple-touch-icon.png` (180×180px)
- `og-image.jpg` (1200×630px)

### 3. Validate

```bash
npm run validate:tenant
# Must show: ✓ tenant.config.ts صحيح وجاهز
```

### 4. Test Locally

```bash
npm run dev
# Open http://localhost:3000
# Verify: header name, footer address, WhatsApp button number
```

### 5. Configure Environment Variables

Copy `.env.example` to `.env` (local) or set in Vercel dashboard:

```bash
DATABASE_URL=               # PostgreSQL connection
ADMIN_EMAIL=                # Admin login email
ADMIN_PASSWORD=             # Admin password (strong!)
ADMIN_SESSION_SECRET=       # 32+ random chars (openssl rand -hex 32)
CLOUDINARY_CLOUD_NAME=      # Cloudinary account
CLOUDINARY_API_KEY=         # Cloudinary key
CLOUDINARY_API_SECRET=      # Cloudinary secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_APP_URL=        # https://showroom-name.vercel.app
NEXT_PUBLIC_WHATSAPP_NUMBER= # Same as tenant.config
NEXT_PUBLIC_GA_ID=          # Google Analytics (optional)
```

### 6. Deploy

```bash
vercel deploy --prod
npm run db:seed    # Seed the production database
```

### 7. Post-Deploy

1. Log in to `/admin` and change the password
2. Upload real products, fabrics, and gallery images
3. Replace seed placeholder content from the admin dashboard
4. Verify WhatsApp button opens correct number

## 📁 File Structure — What to Touch

| File | Purpose | Modify? |
|------|---------|---------|
| `tenant.config.ts` | **All customization** | ✅ Yes — the only file |
| `.env` / Vercel env vars | Secrets & API keys | ✅ Yes |
| `public/brand/` | Logo & brand images | ✅ Yes — add files |
| Everything else | Template code | ❌ Never touch |

## ✅ Verification Checklist

```bash
npm run validate:tenant   # Config is complete
npm run lint              # No ESLint errors
npm run typecheck         # No TypeScript errors
npm run build             # Build succeeds
npm run dev               # Site loads correctly
```

## 🎨 Available Themes

Set `branding.defaultTheme` to one of:
- `default` — Warm neutral (beige/brown)
- `luxury-classic` — Rich classic (ivory/walnut/gold)
- `dark-mode` — Elegant dark with gold accents
- `modern-minimal` — Clean modern grays

## 🌐 Locales

- `ar` — Arabic (RTL) — always supported
- `en` — English (LTR) — always supported
- `he` — Hebrew (RTL) — enable via `features.hebrewLocale: true`

## ❌ Common Mistakes

| Mistake | Fix |
|---------|-----|
| WhatsApp number with `+` | Digits only: `970599123456` |
| Missing delivery areas | Add at least one in `deliveryAreas` |
| Wrong theme name | Must be exact: `default`, `luxury-classic`, `dark-mode`, or `modern-minimal` |
| Logo dimensions wrong | Must match actual SVG dimensions for CLS prevention |
| Forgot to seed | Run `npm run db:seed` after first deploy |
