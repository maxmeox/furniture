import { PrismaClient, PublishStatus } from "@prisma/client";
import { showroomProfileDefaults } from "../lib/showroom-profile";
import { assertDbScriptAllowed } from "./script-safety";

const prisma = new PrismaClient();

async function main() {
  assertDbScriptAllowed("db:demo:clean", {
    allowFlag: "ALLOW_DEMO_CLEAN",
    action: "delete leads/events and restore showroom shell content"
  });

  await prisma.event.deleteMany();
  await prisma.lead.deleteMany();

  await prisma.galleryItem.deleteMany({
    where: {
      OR: [
        { titleAr: { startsWith: "معرض اختبار إداري" } },
        { album: { slug: { startsWith: "admin-test-gallery-" } } }
      ]
    }
  });
  await prisma.galleryAlbum.deleteMany({ where: { slug: { startsWith: "admin-test-gallery-" } } });
  await prisma.offer.deleteMany({ where: { slug: { startsWith: "admin-test-offer-" } } });
  await prisma.fabric.deleteMany({ where: { slug: { startsWith: "admin-test-fabric-" } } });
  await prisma.product.deleteMany({ where: { slug: { startsWith: "admin-test-product-" } } });
  await prisma.category.deleteMany({ where: { slug: { startsWith: "admin-test-category-" } } });

  const oldCityToken = `q${"alqilya"}`;
  const obsoleteAlbumSlug = ["previous", "work", oldCityToken].join("-");
  const obsoleteCampaignSlug = ["facebook", "sofas", oldCityToken].join("-");
  const obsoleteProductSlugs = [
    ["majlis", "soft", "wood"].join("-"),
    ["family", "corner", "sofa"].join("-"),
    ["dining", "oak", "family"].join("-"),
    ["calm", "bedroom", "suite"].join("-")
  ];
  await prisma.galleryItem.deleteMany({ where: { id: { in: ["seed-gallery-majlis"] } } });
  await prisma.galleryAlbum.deleteMany({ where: { slug: { in: [obsoleteAlbumSlug] } } });
  await prisma.campaign.deleteMany({ where: { slug: { in: [obsoleteCampaignSlug] } } });
  await prisma.product.deleteMany({ where: { slug: { in: obsoleteProductSlugs } } });
  await prisma.campaign.deleteMany({ where: { slug: "facebook-sofa-campaign" } });
  await prisma.setting.upsert({
    where: { key: "showroom_profile" },
    update: { value: showroomProfileDefaults },
    create: {
      key: "showroom_profile",
      labelAr: "ملف المعرض",
      labelEn: "Showroom profile",
      labelHe: "פרופיל אולם",
      value: showroomProfileDefaults
    }
  });
  await prisma.campaign.upsert({
    where: { slug: "showroom-featured-sofas" },
    update: {
      name: "أطقم كنب مختارة",
      source: "facebook",
      titleAr: "أطقم كنب مختارة من المعرض",
      titleEn: "Selected sofa sets from the showroom",
      titleHe: "ספות בהתאמה לבית",
      descriptionAr: "صفحة مخصصة لعرض مجموعة مختارة من أطقم الكنب. سيتم تحديثها بالصور والمنتجات الحقيقية قبل إطلاق الإعلان.",
      descriptionEn: "Campaign structure for selected sofa sets. Update with real photos and products before launching ads.",
      descriptionHe: "קמפיין תבנית כללי שמוביל לוואטסאפ.",
      imageUrl: "/images/sofa-wood-main.svg",
      status: PublishStatus.draft,
      sortOrder: 1
    },
    create: {
      slug: "showroom-featured-sofas",
      name: "أطقم كنب مختارة",
      source: "facebook",
      titleAr: "أطقم كنب مختارة من المعرض",
      titleEn: "Selected sofa sets from the showroom",
      titleHe: "ספות בהתאמה לבית",
      descriptionAr: "صفحة مخصصة لعرض مجموعة مختارة من أطقم الكنب. سيتم تحديثها بالصور والمنتجات الحقيقية قبل إطلاق الإعلان.",
      descriptionEn: "Campaign structure for selected sofa sets. Update with real photos and products before launching ads.",
      descriptionHe: "קמפיין תבנית כללי שמוביל לוואטסאפ.",
      imageUrl: "/images/sofa-wood-main.svg",
      status: PublishStatus.draft,
      sortOrder: 1
    }
  });

  console.log("Local leads, events, smoke records, obsolete client demo records removed, and showroom shell settings restored. Run npm run db:seed to refresh shell content.");
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
