// tenant.config.example.ts
// ═══════════════════════════════════════════════════════════════
// انسخ هذا الملف إلى tenant.config.ts واملأ القيم
// كل حقل ★ إلزامي — يجب ملؤه قبل npm run validate:tenant
// ═══════════════════════════════════════════════════════════════
import type { TenantConfig } from './lib/types/tenant'

const config: TenantConfig = {
  // ★ identity — بطاقة هوية المعرض
  identity: {
    nameAr:        'اسم المعرض بالعربية',        // ★
    nameEn:        'Showroom Name in English',    // ★
    nameHe:        'שם האולם בעברית',             // (اختياري — اتركه فارغاً إن لم تكن العبرية مطلوبة)
    shortNameAr:   'الاسم المختصر',               // ★ للاستخدام في الإشعارات
    shortNameEn:   'Short Name',                  // ★
    taglineAr:     'شعار المعرض',
    taglineEn:     'Showroom tagline',
    descriptionAr: 'وصف المعرض لتظهر في محركات البحث',
    descriptionEn: 'Showroom description for search engines',
    heroTitleAr:   'عنوان الصفحة الرئيسية',
    heroTitleEn:   'Homepage Hero Title',
    address: {
      ar: 'العنوان الكامل بالعربية',               // ★
      en: 'Full address in English',              // ★
      he: '',
    },
    city:        'المدينة',                       // ★
    country:     'فلسطين',
    foundedYear: undefined,
  },

  // ★ contact — للتواصل عبر واتساب
  contact: {
    whatsappNumber: '970XXXXXXXXX',               // ★ أرقام فقط، بدون +
    phone:          '',
    email:          '',
    googleMapsUrl:  '',
    whatsappDefaultMessage: {
      ar: 'مرحبًا، أود الاستفسار عن منتجاتكم',
      en: "Hello, I'd like to inquire about your products",
      he: '',
    },
  },

  social: {
    facebook:  '',
    instagram: '',
    tiktok:    '',
    youtube:   '',
    snapchat:  '',
  },

  branding: {
    logo: {
      lightUrl: '/brand/logo-light.svg',        // ★ ضع ملف الشعار في public/brand/
      darkUrl:  '/brand/logo-dark.svg',
      width:    140,
      height:   40,
      altAr:    'شعار المعرض',
      altEn:    'Showroom Logo',
    },
    favicon:        '/brand/favicon.ico',
    appleTouchIcon: '/brand/apple-touch-icon.png',
    ogImage:        '/brand/og-image.jpg',       // 1200×630px للمشاركة على السوشيال
    defaultTheme:   'default',                   // default | luxury-classic | dark-mode | modern-minimal
    autoDarkMode:   false,
  },

  customColors: {
    // أضف ألوانًا مخصصة هنا إن كانت السمة الافتراضية لا تكفي
    // مثال: "--theme-primary": "#8B5E3C"
  },

  locales: {
    supported: ['ar', 'en'],                     // ★ أضف 'he' فقط إن كنت تحتاج العبرية
    default:   'ar',
    rtl:       ['ar'],                           // أضف 'he' إن أضفتها
  },

  seo: {
    titleAr:       'اسم المعرض | المدينة',        // ★
    titleEn:       'Showroom Name | City',       // ★
    descriptionAr: 'وصف للموقع في نتائج البحث (150-160 حرف)',
    descriptionEn: 'Site description for search results',
    keywords:      ['أثاث', 'مفروشات'],
    googleSiteVerification: '',
  },

  features: {
    hebrewLocale:       false,                   // true إن أضفت العبرية
    campaignPages:      true,
    fabricsSection:     true,
    gallerySection:     true,
    offersSection:      true,
    interestList:       true,
    searchCommand:      true,
    analyticsSection:   true,
    maintenanceMode:    false,
    emailNotifications: false,
  },

  deliveryAreas: [
    { id: 'city-1', nameAr: 'اسم المنطقة', nameEn: 'Area Name', nameHe: '' },
    // أضف المزيد من المناطق هنا
  ],

  trustSignals: [
    { iconName: 'shield-check', titleAr: 'جودة مضمونة', titleEn: 'Guaranteed Quality' },
    { iconName: 'truck',        titleAr: 'توصيل سريع',   titleEn: 'Fast Delivery' },
  ],

  defaultFaq: [
    { questionAr: 'سؤال شائع ١', questionEn: 'Common question 1', answerAr: 'الجواب ١', answerEn: 'Answer 1' },
  ],

  texts: {
    footerTextAr:              'اسم المعرض — المدينة',
    footerTextEn:              'Showroom Name — City',
    homepageFinalSubtitleAr:   'نص ختامي للصفحة الرئيسية',
    homepageFinalSubtitleEn:   'Homepage closing text',
    whatsappProductInquiryAr:  'مرحبًا، أود الاستفسار عن هذا المنتج',
    whatsappProductInquiryEn:  "Hello, I'd like to inquire about this product",
  },

  admin: {
    email:               'admin@showroom.ps',          // ★ للعرض فقط — كلمة السر في .env
    sessionDurationHours: 8,
    formBackupKey:        'showroom-admin-form-backup',
  },
}

export default config
