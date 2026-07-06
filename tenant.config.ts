// tenant.config.ts
// ═══════════════════════════════════════════════════════════════
// الملف الوحيد الذي يتغير بين معرض وآخر
// عدّل هذا الملف فقط — لا تلمس أي ملف آخر للتخصيص
// ═══════════════════════════════════════════════════════════════
import type { TenantConfig } from './lib/types/tenant'

const config: TenantConfig = {
  identity: {
    nameAr:        'مفروشات أبو عيسى',
    nameEn:        'Abu Issa Furniture',
    nameHe:        'רהיטי אבו עיסא',
    shortNameAr:   'أبو عيسى',
    shortNameEn:   'Abu Issa',
    taglineAr:     'كتالوج مفروشات منظم للاستفسار عبر واتساب',
    taglineEn:     'Organized furniture catalog for WhatsApp inquiries',
    descriptionAr: 'معرض مفروشات في قلقيلية يقدم أطقم كنب، زوايا، غرف معيشة، وخيارات تفصيل حسب الطلب.',
    descriptionEn: 'A Qalqilya furniture showroom for sofa sets, corner sofas, living rooms, and made-to-order options.',
    heroTitleAr:   'مفروشات أبو عيسى',
    heroTitleEn:   'Abu Issa Furniture',
    address: {
      ar: 'قلقيلية - منطقة المرج - بالقرب من عمارة النجمة',
      en: 'Qalqilya — Al-Marj Area',
      he: "קלקיליה — אל-מרג'",
    },
    city:        'قلقيلية',
    country:     'فلسطين',
    foundedYear: 2010,
  },

  contact: {
    whatsappNumber: '970528682975',
    phone:          '00972528682975',
    email:          '',
    googleMapsUrl:  '',
    whatsappDefaultMessage: {
      ar: 'مرحبًا مفروشات أبو عيسى، أريد الاستفسار عن منتج من الكتالوج.',
      en: 'Hello Abu Issa Furniture, I would like to ask about a catalog product.',
      he: 'שלום רהיטי אבו עיסא, ברצוני לברר על מוצר מהקטלוג.',
    },
  },

  social: {
    facebook:  'https://www.facebook.com/people/Abu-Issa-Furniture-Factory/61566872285161/',
    instagram: '',
    tiktok:    '',
    youtube:   '',
    snapchat:  '',
  },

  branding: {
    logo: {
      lightUrl: '/images/brand/logo.png',
      darkUrl:  '/images/brand/logo.png',
      width:    140,
      height:   40,
      altAr:    'شعار مفروشات أبو عيسى',
      altEn:    'Abu Issa Furniture Logo',
    },
    favicon:        '/favicon.svg',
    appleTouchIcon: '/favicon.png',
    ogImage:        '/images/hero-showroom.svg',
    defaultTheme:   'default',
    autoDarkMode:   false,
  },

  customColors: {},

  locales: {
    supported: ['ar', 'en', 'he'],
    default:   'ar',
    rtl:       ['ar', 'he'],
  },

  seo: {
    titleAr:       'مفروشات أبو عيسى',
    titleEn:       'Abu Issa Furniture',
    titleHe:       'רהיטי אבו עיסא',
    descriptionAr: 'مفروشات أبو عيسى في قلقيلية: أطقم كنب، زوايا، غرف معيشة، وتفصيل حسب الطلب عبر واتساب.',
    descriptionEn: 'Abu Issa Furniture in Qalqilya: sofa sets, corner sofas, living rooms, and made-to-order WhatsApp consultation.',
    keywords:      ['أثاث', 'كنب', 'قلقيلية', 'فلسطين', 'مفروشات', 'غرف نوم'],
    googleSiteVerification: '',
  },

  features: {
    hebrewLocale:       true,
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
    { id: 'west-bank',  nameAr: 'الضفة الغربية',   nameEn: 'West Bank',          nameHe: 'הגדה המערבית' },
    { id: 'inside-48',  nameAr: 'مناطق الـ 48',     nameEn: 'Inside the 48',      nameHe: 'פנים הארץ'   },
    { id: 'jerusalem',  nameAr: 'القدس وضواحيها',   nameEn: 'Jerusalem & Suburbs', nameHe: 'ירושלים והסביבה' },
  ],

  trustSignals: [
    { iconName: 'shield-check', titleAr: 'جودة مضمونة',         titleEn: 'Guaranteed Quality',     descriptionAr: 'ضمان سنة على جميع المنتجات', descriptionEn: 'One year warranty on all products' },
    { iconName: 'truck',        titleAr: 'توصيل لجميع المناطق', titleEn: 'Delivery to All Areas' },
    { iconName: 'star',         titleAr: 'خبرة في المفروشات',  titleEn: 'Furniture Expertise' },
    { iconName: 'heart',        titleAr: 'خدمة ما بعد البيع',  titleEn: 'After-Sales Service' },
  ],

  defaultFaq: [
    { questionAr: 'هل يمكن تغيير القماش أو اللون؟', questionEn: 'Can I change the fabric or color?', questionHe: 'האם ניתן להחליף בד או צבע?', answerAr: 'نعم، أغلب التصاميم قابلة للتفصيل حسب القماش واللون والمقاس.', answerEn: 'Yes, most designs can be customized by fabric, color, and size.', answerHe: 'כן, רוב העיצובים ניתנים להתאמה לפי בד, צבע ומידה.' },
    { questionAr: 'هل الأسعار ثابتة؟', questionEn: 'Are prices fixed?', questionHe: 'האם המחירים קבועים?', answerAr: 'لا نعرض أسعار ثابتة؛ يتم الاتفاق عبر واتساب حسب المقاس والقماش والتفاصيل.', answerEn: 'We do not display fixed prices; they are agreed via WhatsApp based on size, fabric, and details.', answerHe: 'איננו מציגים מחירים קבועים; המחיר נקבע בוואטסאפ לפי מידה, בד ופרטים.' },
    { questionAr: 'هل يوجد توصيل للضفة والداخل؟', questionEn: 'Is delivery available to the West Bank and 1948 areas?', questionHe: 'האם יש משלוח לגדה ולפנים הארץ?', answerAr: 'يتم ترتيب التوصيل مع المعرض حسب المنطقة والطلب.', answerEn: 'Delivery is arranged with the showroom based on area and order.', answerHe: 'המשלוח מתואם עם האולם לפי אזור והזמנה.' },
    { questionAr: 'كيف أطلب تصميمًا؟', questionEn: 'How do I order a design?', questionHe: 'כיצד אני מזמין עיצוב?', answerAr: 'اختر التصميم أو القماش، أضفه لقائمة الاهتمام، ثم أرسل التفاصيل عبر واتساب.', answerEn: 'Choose a design or fabric, add it to your interest list, then send the details via WhatsApp.', answerHe: 'בחר עיצוב או בד, הוסף לרשימת העניין, ואז שלח את הפרטים בוואטסאפ.' },
    { questionAr: 'هل يمكن إرسال أكثر من تصميم؟', questionEn: 'Can I send more than one design?', questionHe: 'האם אפשר לשלוח יותר מעיצוב אחד?', answerAr: 'نعم، استخدم قائمة الاهتمام لإرسال أكثر من تصميم أو قماش في رسالة واحدة.', answerEn: 'Yes, use the interest list to send multiple designs or fabrics in one message.', answerHe: 'כן, השתמש ברשימת העניין לשליחת מספר עיצובים או בדים בהודעה אחת.' },
  ],

  texts: {
    footerTextAr:              'مفروشات أبو عيسى - قلقيلية',
    footerTextEn:              'Abu Issa Furniture - Qalqilya',
    homepageFinalSubtitleAr:   'أرسل لمفروشات أبو عيسى المنتجات أو الأقمشة التي أعجبتك عبر واتساب. لا يوجد دفع إلكتروني ولا سعر ثابت، فقط استشارة مباشرة حسب طلبك.',
    homepageFinalSubtitleEn:   'Send Abu Issa Furniture your preferred products or fabric choices by WhatsApp. No checkout, no fixed price, just direct consultation.',
    whatsappProductInquiryAr:  'مرحبًا، أود الاستفسار عن هذا المنتج',
    whatsappProductInquiryEn:  "Hello, I'd like to inquire about this product",
  },

  admin: {
    email:               'info@abuissa.ps',
    sessionDurationHours: 8,
    formBackupKey:        'abu-issa-admin-form-backup',
  },
}

export default config

