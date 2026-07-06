import type { Locale } from "@/i18n/routing";

export type Localized = Record<Locale, string>;
export type PriceLabel = "ask_for_price" | "depends_on_size_and_fabric" | "budget" | "medium" | "luxury";
export type ProductImageType = "main" | "front_view" | "side_view" | "detail_view" | "fabric_close_up" | "customer_work" | "showroom_photo";

export type ProductImageAsset = {
  src: string;
  title: Localized;
  caption: Localized;
  alt: Localized;
  type: ProductImageType;
  sortOrder: number;
};

export type Product = {
  slug: string;
  code: string;
  category: string;
  categoryLabel: Localized;
  style: string;
  styleLabel: Localized;
  title: Localized;
  summary: Localized;
  description: Localized;
  customization: Localized;
  availability: Localized;
  priceLabel: PriceLabel;
  featured?: boolean;
  isNew?: boolean;
  hasOffer?: boolean;
  images: ProductImageAsset[];
  fabrics: string[];
  relatedGallery: string[];
  updatedAt?: Date;
};

export type Fabric = {
  slug: string;
  code: string;
  name: Localized;
  family: Localized;
  type: Localized;
  availability: Localized;
  image: string;
  color: string;
};

export type Offer = {
  slug: string;
  title: Localized;
  summary: Localized;
  priceLabel: PriceLabel;
  image: string;
  relatedProducts: string[];
};

export type GalleryItem = {
  slug: string;
  album: string;
  category: string;
  title: Localized;
  caption: Localized;
  image: string;
  tall?: boolean;
};

export type CategoryOption = {
  slug: string;
  label: Localized;
};

export type Campaign = {
  slug: string;
  title: Localized;
  summary: Localized;
  image: string;
  productSlugs: string[];
  offerSlugs: string[];
  fabricSlugs: string[];
  updatedAt?: Date;
};

export const priceLabels: Record<PriceLabel, Localized> = {
  ask_for_price: { ar: "اسأل عن السعر", en: "Ask for price", he: "שאלו על מחיר" },
  depends_on_size_and_fabric: { ar: "السعر حسب المقاس والقماش", en: "Depends on size and fabric", he: "תלוי במידה ובבד" },
  budget: { ar: "اقتصادي", en: "Budget", he: "חסכוני" },
  medium: { ar: "متوسط", en: "Medium", he: "בינוני" },
  luxury: { ar: "فاخر", en: "Luxury", he: "יוקרתי" }
};

export const categories = [
  { slug: "sofa-sets", label: { ar: "أطقم كنب", en: "Sofa sets", he: "סטים לסלון" } },
  { slug: "corner-sofas", label: { ar: "زوايا", en: "Corner sofas", he: "ספות פינתיות" } },
  { slug: "living-rooms", label: { ar: "غرف معيشة", en: "Living rooms", he: "חדרי מגורים" } },
  { slug: "custom-orders", label: { ar: "تفصيل حسب الطلب", en: "Made to order", he: "ייצור לפי הזמנה" } }
] as const;

export const styles = [
  { slug: "modern", label: { ar: "مودرن", en: "Modern", he: "מודרני" } },
  { slug: "classic", label: { ar: "كلاسيك", en: "Classic", he: "קלאסי" } },
  { slug: "family-practical", label: { ar: "عائلي عملي", en: "Family practical", he: "משפחתי שימושי" } }
] as const;

function imageSet(main: string, title: Localized, caption: Localized, alt: Localized): ProductImageAsset[] {
  return [
    { src: main, title, caption, alt, type: "main", sortOrder: 1 },
    {
      src: "/images/sofa-detail.svg",
      title: { ar: "تفاصيل التشطيب", en: "Finish details", he: "פרטי גימור" },
      caption: { ar: "توضيح خامات وألوان قابلة للتغيير", en: "Materials and colors can be adjusted", he: "חומרים וצבעים ניתנים להתאמה" },
      alt: { ar: "تفاصيل خامات أثاث", en: "Furniture material detail", he: "פרטי חומרי ריהוט" },
      type: "detail_view",
      sortOrder: 2
    }
  ];
}

export const products: Product[] = [
  {
    slug: "placeholder-sofa-set",
    code: "AI-TEMP-101",
    category: "sofa-sets",
    categoryLabel: categories[1].label,
    style: "modern",
    styleLabel: styles[0].label,
    title: { ar: "نموذج مؤقت لطقم كنب", en: "Temporary sofa set sample", he: "דוגמת סט סלון זמנית" },
    summary: { ar: "نموذج مؤقت لتجهيز الكتالوج حتى وصول الصور والمنتجات الحقيقية.", en: "Temporary sample for catalog setup until real photos and products arrive.", he: "דוגמה זמנית להכנת הקטלוג עד להגעת תמונות ומוצרים אמיתיים." },
    description: { ar: "هذا المنتج مؤقت ولا يمثل محتوى المعرض النهائي. استبدله من لوحة الإدارة قبل إطلاق الإعلانات.", en: "This is temporary and does not represent final showroom content. Replace it from admin before ads launch.", he: "זהו פריט זמני שאינו מייצג תוכן סופי. יש להחליף בלוח הניהול לפני מודעות." },
    customization: { ar: "السعر حسب المقاس والقماش، ويتم الاتفاق على التفاصيل قبل التنفيذ.", en: "Price depends on size and fabric, with details agreed before production.", he: "המחיר תלוי במידה ובבד, והפרטים נקבעים לפני ייצור." },
    availability: { ar: "التوفر ومدة التنفيذ يؤكدان عبر واتساب.", en: "Availability and production time are confirmed on WhatsApp.", he: "זמינות וזמן ייצור מאושרים בוואטסאפ." },
    priceLabel: "depends_on_size_and_fabric",
    featured: true,
    isNew: true,
    hasOffer: true,
    images: imageSet("/images/sofa-wood-main.svg", { ar: "نموذج مؤقت لطقم كنب", en: "Temporary sofa set sample", he: "דוגמת סט סלון זמנית" }, { ar: "صورة مؤقتة تستبدل بصورة حقيقية", en: "Temporary image to be replaced with a real photo", he: "תמונה זמנית להחלפה" }, { ar: "نموذج مؤقت لطقم كنب", en: "Temporary sofa set sample", he: "דוגמה זמנית" }),
    fabrics: ["warm-ivory-linen", "greige-weave"],
    relatedGallery: ["template-living-room"]
  },
  {
    slug: "placeholder-corner-sofa",
    code: "AI-TEMP-102",
    category: "living-rooms",
    categoryLabel: { ar: "غرف معيشة", en: "Living rooms", he: "חדרי מגורים" },
    style: "contemporary",
    styleLabel: { ar: "معاصر", en: "Contemporary", he: "עכשווי" },
    title: { ar: "نموذج مؤقت لزاوية", en: "Temporary corner sofa sample", he: "דוגמת ספה פינתית זמנית" },
    summary: { ar: "مساحة جاهزة لعرض زاوية حقيقية عند توفر الصور والمواصفات.", en: "Ready slot for a real corner sofa once photos and details are available.", he: "מקום מוכן לספה פינתית אמיתית כשיהיו תמונות ופרטים." },
    description: { ar: "هذا نموذج مؤقت لا يستخدم لإطلاق الإعلانات. أضف المنتج الحقيقي من لوحة الإدارة.", en: "This is a temporary sample, not for ad launch. Add the real product from admin.", he: "דוגמה זמנית, לא להשקת מודעות. הוסיפו מוצר אמיתי בלוח הניהול." },
    customization: { ar: "يمكن تعديل عدد القطع والمقاسات والقماش.", en: "Piece count, sizes, and fabric can be adjusted.", he: "ניתן להתאים מספר חלקים, מידות ובד." },
    availability: { ar: "يتم تأكيد التفاصيل حسب جدول المعرض.", en: "Details are confirmed according to showroom schedule.", he: "הפרטים מאושרים לפי לוח האולם." },
    priceLabel: "depends_on_size_and_fabric",
    featured: true,
    images: imageSet("/images/sofa-wood-side.svg", { ar: "نموذج مؤقت لزاوية", en: "Temporary corner sofa sample", he: "דוגמת ספה פינתית זמנית" }, { ar: "صورة مؤقتة تستبدل بصورة حقيقية", en: "Temporary image to be replaced with a real photo", he: "תמונה זמנית להחלפה" }, { ar: "نموذج مؤقت لزاوية", en: "Temporary corner sofa sample", he: "דוגמה זמנית" }),
    fabrics: ["warm-ivory-linen", "muted-olive-velvet"],
    relatedGallery: ["template-living-room"]
  },
  {
    slug: "placeholder-custom-order",
    code: "AI-TEMP-103",
    category: "custom-orders",
    categoryLabel: categories[0].label,
    style: "family-practical",
    styleLabel: styles[2].label,
    title: { ar: "نموذج مؤقت للتفصيل حسب الطلب", en: "Temporary made-to-order sample", he: "דוגמה זמנית להזמנה מיוחדת" },
    summary: { ar: "يوضح أن الكتالوج جاهز لاستقبال طلبات التفصيل بعد إضافة المحتوى الحقيقي.", en: "Shows that the catalog is ready for made-to-order content once real content is added.", he: "מציג שהקטלוג מוכן לתוכן לפי הזמנה לאחר הוספת תוכן אמיתי." },
    description: { ar: "نموذج مؤقت لتجربة مسار الاستفسار فقط. لا تستخدمه كمنتج نهائي.", en: "Temporary sample for testing inquiry flow only. Do not use as final product content.", he: "דוגמה זמנית לבדיקת פנייה בלבד." },
    customization: { ar: "تعديل الاتجاه والمقاسات ونوع القماش متاح.", en: "Direction, sizes, and fabric type can be adjusted.", he: "ניתן להתאים כיוון, מידות וסוג בד." },
    availability: { ar: "حسب توفر القماش وجدول التنفيذ.", en: "Based on fabric availability and production schedule.", he: "לפי זמינות בד ולוח ייצור." },
    priceLabel: "depends_on_size_and_fabric",
    images: imageSet("/images/offer-room.svg", { ar: "نموذج مؤقت للتفصيل حسب الطلب", en: "Temporary made-to-order sample", he: "דוגמה זמנית להזמנה מיוחדת" }, { ar: "صورة مؤقتة تستبدل بصورة حقيقية", en: "Temporary image to be replaced with a real photo", he: "תמונה זמנית להחלפה" }, { ar: "نموذج مؤقت للتفصيل حسب الطلب", en: "Temporary made-to-order sample", he: "דוגמה זמנית" }),
    fabrics: ["greige-weave", "charcoal-texture"],
    relatedGallery: ["template-living-room"]
  }
];

export const fabrics: Fabric[] = [
  { slug: "warm-ivory-linen", code: "FAB-014", name: { ar: "كتان عاجي دافئ", en: "Warm ivory linen", he: "פשתן שנהב חם" }, family: { ar: "عاجي", en: "Ivory", he: "שנהב" }, type: { ar: "كتان ناعم", en: "Soft linen", he: "פשתן רך" }, availability: { ar: "التوفر يؤكد عبر واتساب", en: "Confirm availability on WhatsApp", he: "זמינות לאישור בוואטסאפ" }, image: "/images/fabric-ivory.svg", color: "#e8dcc8" },
  { slug: "greige-weave", code: "FAB-027", name: { ar: "نسيج جريج عملي", en: "Practical greige weave", he: "אריג גרייז' שימושי" }, family: { ar: "رمادي دافئ", en: "Warm gray", he: "אפור חם" }, type: { ar: "نسيج مقاوم", en: "Durable weave", he: "אריג עמיד" }, availability: { ar: "التوفر يؤكد عبر واتساب", en: "Confirm availability on WhatsApp", he: "זמינות לאישור בוואטסאפ" }, image: "/images/fabric-greige.svg", color: "#b8ab96" },
  { slug: "muted-olive-velvet", code: "FAB-039", name: { ar: "مخمل زيتوني هادئ", en: "Muted olive velvet", he: "קטיפה זית רגועה" }, family: { ar: "أخضر هادئ", en: "Muted green", he: "ירוק רגוע" }, type: { ar: "مخمل", en: "Velvet", he: "קטיפה" }, availability: { ar: "التوفر يؤكد عبر واتساب", en: "Confirm availability on WhatsApp", he: "זמינות לאישור בוואטסאפ" }, image: "/images/fabric-olive.svg", color: "#6d725f" },
  { slug: "charcoal-texture", code: "FAB-044", name: { ar: "نسيج فحمي", en: "Charcoal texture", he: "מרקם פחם" }, family: { ar: "فحمي", en: "Charcoal", he: "פחם" }, type: { ar: "نسيج عملي", en: "Practical weave", he: "אריג שימושי" }, availability: { ar: "التوفر يؤكد عبر واتساب", en: "Confirm availability on WhatsApp", he: "זמינות לאישור בוואטסאפ" }, image: "/images/fabric-greige.svg", color: "#4b4b48" },
  { slug: "blue-gray-weave", code: "FAB-052", name: { ar: "أزرق رمادي هادئ", en: "Soft blue gray", he: "כחול אפור רגוע" }, family: { ar: "أزرق رمادي", en: "Blue gray", he: "כחול אפור" }, type: { ar: "نسيج ناعم", en: "Soft weave", he: "אריג רך" }, availability: { ar: "التوفر يؤكد عبر واتساب", en: "Confirm availability on WhatsApp", he: "זמינות לאישור בוואטסאפ" }, image: "/images/fabric-olive.svg", color: "#6f7f89" }
];

export const offers: Offer[] = [
  {
    slug: "custom-sofa-consultation",
    title: { ar: "استشارة كنب حسب الطلب", en: "Custom sofa consultation", he: "ייעוץ ספה בהתאמה אישית" },
    summary: { ar: "اختيار المقاس والقماش واللون قبل التفصيل عبر واتساب.", en: "Choose size, fabric, and color before production through WhatsApp.", he: "בחירת מידה, בד וצבע לפני ייצור דרך וואטסאפ." },
    priceLabel: "ask_for_price",
    image: "/images/offer-room.svg",
    relatedProducts: ["placeholder-sofa-set", "placeholder-corner-sofa"]
  },
  {
    slug: "living-room-refresh",
    title: { ar: "تنسيق غرفة معيشة", en: "Living room coordination", he: "תיאום סלון" },
    summary: { ar: "تنسيق كنبة وطاولة وأقمشة ضمن اتجاه واحد.", en: "Coordinate sofa, table, and fabrics in one direction.", he: "תיאום ספה, שולחן ובדים בקו אחד." },
    priceLabel: "depends_on_size_and_fabric",
    image: "/images/hero-showroom.svg",
    relatedProducts: ["placeholder-sofa-set", "placeholder-custom-order"]
  }
];

export const galleryItems: GalleryItem[] = [
  { slug: "showroom-placeholder-1", album: "living-rooms", category: "living-rooms", title: { ar: "صورة مؤقتة لغرفة معيشة", en: "Temporary living room image", he: "תמונה זמנית לסלון" }, caption: { ar: "تستبدل بصورة حقيقية من المعرض.", en: "Replace with a real showroom photo.", he: "להחלפה בתמונה אמיתית." }, image: "/images/gallery-majlis.svg", tall: true },
  { slug: "showroom-placeholder-2", album: "showroom", category: "corner-sofas", title: { ar: "صورة مؤقتة للعرض", en: "Temporary display image", he: "תמונת תצוגה זמנית" }, caption: { ar: "مساحة جاهزة لألبومات المنتجات الحقيقية.", en: "Ready slot for real product albums.", he: "מקום מוכן לאלבומי מוצרים אמיתיים." }, image: "/images/sofa-wood-main.svg" }
];

export const campaigns: Campaign[] = [
  {
    slug: "showroom-featured-sofas",
    title: { ar: "أطقم كنب مختارة من المعرض", en: "Selected sofa sets from the showroom", he: "סלונים נבחרים" },
    summary: { ar: "صفحة مخصصة لعرض مجموعة مختارة من أطقم الكنب. سيتم تحديثها بالصور والمنتجات الحقيقية قبل إطلاق الإعلان.", en: "Campaign structure for selected sofa sets. Update with real photos and products before launching ads.", he: "מבנה קמפיין לסלונים נבחרים. יש לעדכן בתמונות ומוצרים אמיתיים לפני מודעות." },
    image: "/images/sofa-wood-main.svg",
    productSlugs: [],
    offerSlugs: ["custom-sofa-consultation"],
    fabricSlugs: ["warm-ivory-linen", "greige-weave"]
  }
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCampaign(slug: string) {
  return campaigns.find((campaign) => campaign.slug === slug);
}

export function getSimilarProducts(product: Product) {
  return products
    .filter((item) => item.slug !== product.slug && (item.category === product.category || item.style === product.style))
    .slice(0, 3);
}

export function t(value: Localized, locale: Locale) {
  return value[locale] ?? value.ar;
}
