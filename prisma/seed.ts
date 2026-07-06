import { ImageType, PrismaClient, PriceLabel, PublishStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { normalizeShowroomWhatsApp, showroomProfileDefaults } from "../lib/showroom-profile";
import { assertDbScriptAllowed } from "./script-safety";

const prisma = new PrismaClient();

const showroomProfile = {
  ...showroomProfileDefaults,
  whatsapp: normalizeShowroomWhatsApp(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER)
};

const categories = [
  ["sofa-sets", "أطقم كنب", "Sofa sets", "סטים לסלון", "/images/sofa-wood-main.svg", 1],
  ["corner-sofas", "زوايا", "Corner sofas", "ספות פינתיות", "/images/sofa-wood-side.svg", 2],
  ["living-rooms", "غرف معيشة", "Living rooms", "חדרי מגורים", "/images/offer-room.svg", 3],
  ["custom-orders", "تفصيل حسب الطلب", "Made to order", "ייצור לפי הזמנה", "/images/hero-showroom.svg", 4]
] as const;

const products = [
  ["placeholder-sofa-set", "AI-TEMP-101", "sofa-sets", "نموذج مؤقت لطقم كنب", "Temporary sofa set sample", "דוגמת סט סלון זמנית", "/images/sofa-wood-main.svg", true, false, 1],
  ["placeholder-corner-sofa", "AI-TEMP-102", "corner-sofas", "نموذج مؤقت لزاوية", "Temporary corner sofa sample", "דוגמת ספה פינתית זמנית", "/images/sofa-wood-side.svg", true, false, 2],
  ["placeholder-custom-order", "AI-TEMP-103", "custom-orders", "نموذج مؤقت للتفصيل حسب الطلب", "Temporary made-to-order sample", "דוגמה זמנית להזמנה מיוחדת", "/images/hero-showroom.svg", false, false, 3]
] as const;

const productAlbumImages: Record<string, Array<{ url: string; type: ImageType; titleAr: string; titleEn: string; titleHe: string; captionAr: string; captionEn: string; captionHe: string; sortOrder: number; isCover?: boolean }>> = {
  "placeholder-sofa-set": [
    {
      url: "/images/sofa-wood-main.svg",
      type: ImageType.main,
      titleAr: "صورة الغلاف",
      titleEn: "Cover image",
      titleHe: "תמונת כיסוי",
      captionAr: "صورة توضيحية مؤقتة، تستبدل بصورة المنتج الحقيقي من لوحة الإدارة.",
      captionEn: "Temporary illustrative image to be replaced from the admin dashboard.",
      captionHe: "זווית כללית של העיצוב בחלל סלון.",
      sortOrder: 1,
      isCover: true
    },
    {
      url: "/images/sofa-wood-side.svg",
      type: ImageType.side_view,
      titleAr: "زاوية جانبية",
      titleEn: "Side angle",
      titleHe: "זווית צד",
      captionAr: "صورة مؤقتة لا تمثل منتجًا نهائيًا.",
      captionEn: "Temporary image that does not represent a final product.",
      captionHe: "מציגה עומק ישיבה וצורת ידית.",
      sortOrder: 2
    },
    {
      url: "/images/sofa-detail.svg",
      type: ImageType.detail_view,
      titleAr: "تفاصيل التشطيب",
      titleEn: "Finish details",
      titleHe: "פרטי גימור",
      captionAr: "مكان جاهز لتفاصيل التشطيب الحقيقية عند توفر الصور.",
      captionEn: "Ready slot for real finish-detail photos when available.",
      captionHe: "תפרים וקצוות ניתנים להתאמה בהזמנה.",
      sortOrder: 3
    },
    {
      url: "/images/fabric-ivory.svg",
      type: ImageType.fabric_close_up,
      titleAr: "قماش مقترح",
      titleEn: "Suggested fabric",
      titleHe: "בד מוצע",
      captionAr: "مثال قماش مؤقت يستبدل بعينات المعرض.",
      captionEn: "Temporary fabric sample to be replaced with showroom samples.",
      captionHe: "דוגמת בד שניתן להחליף מדוגמאות האולם.",
      sortOrder: 4
    },
    {
      url: "/images/offer-room.svg",
      type: ImageType.showroom_photo,
      titleAr: "توزيع داخل غرفة",
      titleEn: "Room layout",
      titleHe: "סידור בחדר",
      captionAr: "صورة مؤقتة لتجربة ألبوم المنتج فقط.",
      captionEn: "Temporary image for product-album testing only.",
      captionHe: "תמונה להמחשה שעוזרת לדמיין מידה.",
      sortOrder: 5
    }
  ],
  "placeholder-corner-sofa": [
    {
      url: "/images/sofa-wood-side.svg",
      type: ImageType.main,
      titleAr: "صورة الغلاف",
      titleEn: "Cover image",
      titleHe: "תמונת כיסוי",
      captionAr: "صورة غلاف مؤقتة حتى وصول الصور الحقيقية.",
      captionEn: "Temporary cover image until real photos are available.",
      captionHe: "סט ספות קלאסי כתמונה ראשית.",
      sortOrder: 1,
      isCover: true
    },
    {
      url: "/images/sofa-wood-main.svg",
      type: ImageType.front_view,
      titleAr: "واجهة التصميم",
      titleEn: "Front view",
      titleHe: "מבט קדמי",
      captionAr: "صورة مؤقتة لا تمثل منتجًا نهائيًا.",
      captionEn: "Temporary image that does not represent a final product.",
      captionHe: "מציגה את צורת הישיבה מקדימה.",
      sortOrder: 2
    },
    {
      url: "/images/sofa-detail.svg",
      type: ImageType.detail_view,
      titleAr: "تفاصيل الخشب والقماش",
      titleEn: "Wood and fabric detail",
      titleHe: "פרטי עץ ובד",
      captionAr: "مساحة جاهزة لتفاصيل التشطيب الحقيقية.",
      captionEn: "Ready slot for real finish details.",
      captionHe: "פרטים להמחשת גימור וחומרים.",
      sortOrder: 3
    },
    {
      url: "/images/fabric-greige.svg",
      type: ImageType.fabric_close_up,
      titleAr: "خيار قماش",
      titleEn: "Fabric option",
      titleHe: "אפשרות בד",
      captionAr: "مثال قماش مؤقت يستبدل من لوحة الإدارة.",
      captionEn: "Temporary fabric example to be replaced from admin.",
      captionHe: "דוגמת בד רגועה שמתאימה לסט.",
      sortOrder: 4
    }
  ]
};

const fabrics = [
  ["warm-ivory-linen", "FAB-014", "كتان عاجي دافئ", "Warm ivory linen", "פשתן שנהב חם", "#e8dcc8", "/images/fabric-ivory.svg"],
  ["greige-weave", "FAB-027", "نسيج جريج عملي", "Practical greige weave", "אריג גרייז' שימושי", "#b8ab96", "/images/fabric-greige.svg"],
  ["muted-olive-velvet", "FAB-039", "مخمل زيتوني هادئ", "Muted olive velvet", "קטיפה זית רגועה", "#6d725f", "/images/fabric-olive.svg"],
  ["charcoal-texture", "FAB-044", "نسيج فحمي", "Charcoal texture", "מרקם פחם", "#4b4b48", "/images/fabric-greige.svg"],
  ["blue-gray-weave", "FAB-052", "أزرق رمادي هادئ", "Soft blue gray", "כחול אפור רגוע", "#6f7f89", "/images/fabric-olive.svg"]
] as const;

async function main() {
  assertDbScriptAllowed("db:seed", {
    allowFlag: "ALLOW_TEMPLATE_SEED",
    action: "seed or refresh showroom template data"
  });

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-in-production";

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Template Admin",
      passwordHash: await bcrypt.hash(adminPassword, 12)
    }
  });

  await prisma.setting.upsert({
    where: { key: "showroom_profile" },
    update: {}, // Never overwrite existing admin settings
    create: {
      key: "showroom_profile",
      labelAr: "ملف المعرض",
      labelEn: "Showroom profile",
      labelHe: "פרופיל אולם",
      value: showroomProfile
    }
  });

  const categoryBySlug = new Map<string, string>();
  for (const [slug, nameAr, nameEn, nameHe, imageUrl, sortOrder] of categories) {
    const category = await prisma.category.upsert({
      where: { slug },
      update: { nameAr, nameEn, nameHe, imageUrl, sortOrder, status: PublishStatus.published },
      create: { slug, nameAr, nameEn, nameHe, imageUrl, sortOrder, status: PublishStatus.published }
    });
    categoryBySlug.set(slug, category.id);
  }

  for (const [slug, code, categorySlug, titleAr, titleEn, titleHe, imageUrl, isFeatured, isNew, sortOrder] of products) {
    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        code,
        categoryId: categoryBySlug.get(categorySlug) ?? categoryBySlug.get("sofa-sets")!,
        titleAr,
        titleEn,
        titleHe,
        summaryAr: `${titleAr} قابل للتخصيص حسب المقاس والقماش.`,
        summaryEn: `${titleEn} can be customized by size and fabric.`,
        summaryHe: `${titleHe} ניתן להתאמה לפי מידה ובד.`,
        descriptionAr: "نموذج مؤقت لتجهيز كتالوج المعرض. يجب استبداله بالصور والتفاصيل الحقيقية من لوحة الإدارة قبل إطلاق الإعلانات.",
        descriptionEn: "Temporary sample for preparing the showroom catalog. Replace it with real photos and details from admin before ads launch.",
        descriptionHe: "עיצוב דמו כללי לתבנית אולם רהיטים. אין מחיר ציבורי קבוע; הפרטים מאושרים בוואטסאפ.",
        customizationAr: "السعر حسب المقاس والقماش.",
        customizationEn: "Price depends on size and fabric.",
        customizationHe: "המחיר תלוי במידה ובבד.",
        availabilityAr: "التوفر ومدة التنفيذ يؤكدان عبر واتساب.",
        availabilityEn: "Availability and production time are confirmed on WhatsApp.",
        availabilityHe: "זמינות וזמן ייצור מאושרים בוואטסאפ.",
        priceLabel: PriceLabel.depends_on_size_and_fabric,
        isFeatured,
        isNew,
        status: PublishStatus.draft,
        coverImageUrl: imageUrl,
        sortOrder
      },
      create: {
        slug,
        code,
        categoryId: categoryBySlug.get(categorySlug) ?? categoryBySlug.get("sofa-sets")!,
        titleAr,
        titleEn,
        titleHe,
        summaryAr: `${titleAr} قابل للتخصيص حسب المقاس والقماش.`,
        summaryEn: `${titleEn} can be customized by size and fabric.`,
        summaryHe: `${titleHe} ניתן להתאמה לפי מידה ובד.`,
        descriptionAr: "نموذج مؤقت لتجهيز كتالوج المعرض. يجب استبداله بالصور والتفاصيل الحقيقية من لوحة الإدارة قبل إطلاق الإعلانات.",
        descriptionEn: "Temporary sample for preparing the showroom catalog. Replace it with real photos and details from admin before ads launch.",
        descriptionHe: "עיצוב דמו כללי לתבנית אולם רהיטים. אין מחיר ציבורי קבוע; הפרטים מאושרים בוואטסאפ.",
        customizationAr: "السعر حسب المقاس والقماش.",
        customizationEn: "Price depends on size and fabric.",
        customizationHe: "המחיר תלוי במידה ובבד.",
        availabilityAr: "التوفر ومدة التنفيذ يؤكدان عبر واتساب.",
        availabilityEn: "Availability and production time are confirmed on WhatsApp.",
        availabilityHe: "זמינות וזמן ייצור מאושרים בוואטסאפ.",
        priceLabel: PriceLabel.depends_on_size_and_fabric,
        isFeatured,
        isNew,
        status: PublishStatus.draft,
        coverImageUrl: imageUrl,
        sortOrder
      }
    });

    const albumImages = productAlbumImages[slug] ?? [{
      url: imageUrl,
      type: ImageType.main,
      titleAr: "صورة توضيحية",
      titleEn: "Illustrative image",
      titleHe: "תמונה להמחשה",
      captionAr: "صورة مؤقتة قابلة للاستبدال بصورة حقيقية من المعرض.",
      captionEn: "Temporary image that can be replaced with a real showroom photo.",
      captionHe: "תמונה כללית להחלפה בתמונה אמיתית מהאולם.",
      sortOrder: 1,
      isCover: true
    }];

    for (const image of albumImages) {
      await prisma.productImage.upsert({
        where: { productId_url: { productId: product.id, url: image.url } },
        update: {
          titleAr: image.titleAr,
          titleEn: image.titleEn,
          titleHe: image.titleHe,
          captionAr: image.captionAr,
          captionEn: image.captionEn,
          captionHe: image.captionHe,
          altAr: titleAr,
          altEn: titleEn,
          altHe: titleHe,
          imageType: image.type,
          sortOrder: image.sortOrder,
          isCover: image.isCover ?? false
        },
        create: {
          productId: product.id,
          url: image.url,
          titleAr: image.titleAr,
          titleEn: image.titleEn,
          titleHe: image.titleHe,
          captionAr: image.captionAr,
          captionEn: image.captionEn,
          captionHe: image.captionHe,
          altAr: titleAr,
          altEn: titleEn,
          altHe: titleHe,
          imageType: image.type,
          sortOrder: image.sortOrder,
          isCover: image.isCover ?? false
        }
      });
    }
  }

  for (const [slug, code, nameAr, nameEn, nameHe, hexColor, imageUrl] of fabrics) {
    await prisma.fabric.upsert({
      where: { slug },
      update: { code, nameAr, nameEn, nameHe, hexColor, imageUrl, status: PublishStatus.published },
      create: {
        slug,
        code,
        nameAr,
        nameEn,
        nameHe,
        familyAr: "عينة قماش",
        familyEn: "Fabric sample",
        familyHe: "דוגמת בד",
        typeAr: "نسيج",
        typeEn: "Weave",
        typeHe: "אריג",
        availabilityAr: "التوفر يؤكد عبر واتساب",
        availabilityEn: "Confirm availability on WhatsApp",
        availabilityHe: "זמינות לאישור בוואטסאפ",
        hexColor,
        imageUrl,
        status: PublishStatus.published
      }
    });
  }

  await prisma.offer.upsert({
    where: { slug: "custom-sofa-consultation" },
    update: {
      titleAr: "استشارة كنب حسب الطلب",
      titleEn: "Custom sofa consultation",
      titleHe: "ייעוץ ספה בהתאמה אישית",
      imageUrl: "/images/offer-room.svg",
      status: PublishStatus.published
    },
    create: {
      slug: "custom-sofa-consultation",
      titleAr: "استشارة كنب حسب الطلب",
      titleEn: "Custom sofa consultation",
      titleHe: "ייעוץ ספה בהתאמה אישית",
      descriptionAr: "تواصل عبر واتساب لاختيار المقاس والقماش المناسب.",
      descriptionEn: "Message on WhatsApp to choose the right size and fabric.",
      descriptionHe: "שלחו וואטסאפ לבחירת מידה ובד מתאימים.",
      imageUrl: "/images/offer-room.svg",
      priceLabel: PriceLabel.ask_for_price,
      status: PublishStatus.published
    }
  });

  await prisma.offer.upsert({
    where: { slug: "living-room-refresh" },
    update: { status: PublishStatus.draft },
    create: {
      slug: "living-room-refresh",
      titleAr: "تنسيق غرفة معيشة",
      titleEn: "Living room coordination",
      titleHe: "תיאום סלון",
      descriptionAr: "تنسيق كنبة وطاولة وأقمشة ضمن اتجاه واحد.",
      descriptionEn: "Coordinate sofa, table, and fabrics in one direction.",
      descriptionHe: "תיאום ספה, שולחן ובדים בקו אחד.",
      imageUrl: "/images/hero-showroom.svg",
      priceLabel: PriceLabel.depends_on_size_and_fabric,
      status: PublishStatus.draft
    }
  });

  await prisma.campaign.upsert({
    where: { slug: "showroom-featured-sofas" },
    update: {
      name: "أطقم كنب مختارة",
      titleAr: "أطقم كنب مختارة من المعرض",
      titleEn: "Selected sofa sets from the showroom",
      titleHe: "ספות בהתאמה לבית",
      descriptionAr: "صفحة مخصصة لعرض مجموعة مختارة من أطقم الكنب. سيتم تحديثها بالصور والمنتجات الحقيقية قبل إطلاق الإعلان.",
      descriptionEn: "Campaign structure for selected sofa sets. Update with real photos and products before launching ads.",
      status: PublishStatus.draft,
      imageUrl: "/images/sofa-wood-main.svg",
      sortOrder: 1
    },
    create: {
      slug: "showroom-featured-sofas",
      name: "أطقم كنب مختارة",
      titleAr: "أطقم كنب مختارة من المعرض",
      titleEn: "Selected sofa sets from the showroom",
      titleHe: "ספות בהתאמה לבית",
      descriptionAr: "صفحة مخصصة لعرض مجموعة مختارة من أطقم الكنب. سيتم تحديثها بالصور والمنتجات الحقيقية قبل إطلاق الإعلان.",
      descriptionEn: "Campaign structure for selected sofa sets. Update with real photos and products before launching ads.",
      descriptionHe: "קמפיין תבנית כללי שמוביל לוואטסאפ.",
      status: PublishStatus.draft,
      imageUrl: "/images/sofa-wood-main.svg",
      sortOrder: 1
    }
  });

  const album = await prisma.galleryAlbum.upsert({
    where: { slug: "template-gallery" },
    update: { titleAr: "معرض توضيحي", titleEn: "Template gallery", titleHe: "גלריית תבנית", coverImageUrl: "/images/gallery-majlis.svg", status: PublishStatus.published },
    create: {
      slug: "template-gallery",
      titleAr: "معرض توضيحي",
      titleEn: "Template gallery",
      titleHe: "גלריית תבנית",
      descriptionAr: "صور توضيحية يمكن استبدالها بصور المعرض الحقيقية.",
      descriptionEn: "Illustrative images that can be replaced with real showroom photos.",
      descriptionHe: "תמונות להמחשה להחלפה בתמונות אמיתיות.",
      coverImageUrl: "/images/gallery-majlis.svg",
      status: PublishStatus.published
    }
  });

  for (const [id, imageUrl, titleAr, titleEn, titleHe, sortOrder] of [
    ["seed-gallery-living-room", "/images/gallery-majlis.svg", "صورة مؤقتة لغرفة معيشة", "Temporary living room image", "תמונה זמנית לסלון", 1],
    ["seed-gallery-display", "/images/sofa-wood-main.svg", "صورة مؤقتة للعرض", "Temporary display image", "תמונת תצוגה זמנית", 2]
  ] as const) {
    await prisma.galleryItem.upsert({
      where: { id },
      update: { albumId: album.id, imageUrl, titleAr, titleEn, titleHe, status: PublishStatus.published, sortOrder },
      create: {
        id,
        albumId: album.id,
        titleAr,
        titleEn,
        titleHe,
        captionAr: "صورة مؤقتة لمساحة معرض المفروشات.",
        captionEn: "Temporary image for the furniture showroom template.",
        captionHe: "תמונה להמחשת תבנית האולם.",
        imageUrl,
        altAr: titleAr,
        altEn: titleEn,
        altHe: titleHe,
        imageType: ImageType.showroom_photo,
        isFeatured: sortOrder === 1,
        status: PublishStatus.published,
        sortOrder
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
