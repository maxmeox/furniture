import { PublishStatus } from "@prisma/client";
import { getThemePreset } from "@/lib/theme-presets";
import { prisma } from "@/lib/prisma";
import {
  styles,
  type Campaign,
  type Fabric,
  type GalleryItem,
  type Offer,
  type Product,
  type ProductImageAsset,
  type ProductImageType
} from "@/lib/showroom-data";
import { showroomProfileDefaults, type ShowroomProfile } from "@/lib/showroom-profile";
import { cachedQuery } from "@/lib/query-factory";

const fallbackImage = "/images/hero-showroom.svg";
const publicCacheSeconds = 300;
const settingsCacheSeconds = 3600;

const getCachedDbCategories = cachedQuery(
  () => prisma.category.findMany({
    where: { status: PublishStatus.published },
    select: { slug: true, nameAr: true, nameEn: true, nameHe: true },
    orderBy: { sortOrder: "asc" }
  }),
  ["public-categories-v1"],
  { revalidate: publicCacheSeconds, tags: ["public-categories"] }
);

const getCachedDbProducts = cachedQuery(
  () => prisma.product.findMany({
    where: { status: PublishStatus.published },
    select: {
      slug: true,
      code: true,
      titleAr: true,
      titleEn: true,
      titleHe: true,
      summaryAr: true,
      summaryEn: true,
      summaryHe: true,
      descriptionAr: true,
      descriptionEn: true,
      descriptionHe: true,
      customizationAr: true,
      customizationEn: true,
      customizationHe: true,
      availabilityAr: true,
      availabilityEn: true,
      availabilityHe: true,
      priceLabel: true,
      isFeatured: true,
      isNew: true,
      coverImageUrl: true,
      updatedAt: true,
      category: { select: { slug: true, nameAr: true, nameEn: true, nameHe: true } },
      images: {
        select: {
          url: true,
          titleAr: true,
          titleEn: true,
          titleHe: true,
          captionAr: true,
          captionEn: true,
          captionHe: true,
          altAr: true,
          altEn: true,
          altHe: true,
          imageType: true,
          sortOrder: true,
          isCover: true
        },
        orderBy: { sortOrder: "asc" }
      },
      productFabrics: {
        select: { fabric: { select: { slug: true } } }
      }
    },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }]
  }),
  ["public-products-v1"],
  { revalidate: publicCacheSeconds, tags: ["public-products"] }
);

const getCachedDbCatalogProducts = cachedQuery(
  () => prisma.product.findMany({
    where: { status: PublishStatus.published },
    select: {
      slug: true,
      code: true,
      titleAr: true,
      titleEn: true,
      titleHe: true,
      summaryAr: true,
      summaryEn: true,
      summaryHe: true,
      priceLabel: true,
      isFeatured: true,
      isNew: true,
      coverImageUrl: true,
      category: { select: { slug: true, nameAr: true, nameEn: true, nameHe: true } },
      images: {
        select: {
          url: true,
          titleAr: true,
          titleEn: true,
          titleHe: true,
          altAr: true,
          altEn: true,
          altHe: true,
          imageType: true,
          sortOrder: true,
          isCover: true
        },
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        take: 1
      }
    },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }]
  }),
  ["public-catalog-products-v1"],
  { revalidate: publicCacheSeconds, tags: ["public-products"] }
);

const getCachedDbFabrics = cachedQuery(
  () => prisma.fabric.findMany({
    where: { status: PublishStatus.published },
    select: {
      slug: true,
      code: true,
      nameAr: true,
      nameEn: true,
      nameHe: true,
      familyAr: true,
      familyEn: true,
      familyHe: true,
      colorNameAr: true,
      colorNameEn: true,
      colorNameHe: true,
      typeAr: true,
      typeEn: true,
      typeHe: true,
      availabilityAr: true,
      availabilityEn: true,
      availabilityHe: true,
      imageUrl: true,
      hexColor: true
    },
    orderBy: { updatedAt: "desc" }
  }),
  ["public-fabrics-v1"],
  { revalidate: publicCacheSeconds, tags: ["public-fabrics"] }
);

const getCachedDbOffers = cachedQuery(
  () => prisma.offer.findMany({
    where: { status: PublishStatus.published },
    select: {
      slug: true,
      titleAr: true,
      titleEn: true,
      titleHe: true,
      descriptionAr: true,
      descriptionEn: true,
      descriptionHe: true,
      imageUrl: true,
      priceLabel: true,
      offerProducts: {
        select: { product: { select: { slug: true } } }
      }
    },
    orderBy: { updatedAt: "desc" }
  }),
  ["public-offers-v1"],
  { revalidate: publicCacheSeconds, tags: ["public-offers"] }
);

const getCachedDbGalleryItems = cachedQuery(
  () => prisma.galleryItem.findMany({
    where: { status: PublishStatus.published },
    select: {
      id: true,
      titleAr: true,
      titleEn: true,
      titleHe: true,
      captionAr: true,
      captionEn: true,
      captionHe: true,
      imageUrl: true,
      imageType: true,
      isFeatured: true,
      album: { select: { slug: true, titleAr: true, titleEn: true, titleHe: true } }
    },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }]
  }),
  ["public-gallery-v1"],
  { revalidate: publicCacheSeconds, tags: ["public-gallery"] }
);

const getCachedDbCampaigns = cachedQuery(
  () => prisma.campaign.findMany({
    select: {
      slug: true,
      titleAr: true,
      titleEn: true,
      titleHe: true,
      descriptionAr: true,
      descriptionEn: true,
      descriptionHe: true,
      imageUrl: true,
      status: true,
      updatedAt: true,
      campaignProducts: {
        select: { product: { select: { slug: true } } }
      },
      campaignOffers: {
        select: { offer: { select: { slug: true } } }
      },
      campaignFabrics: {
        select: { fabric: { select: { slug: true } } }
      }
    },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }]
  }),
  ["public-campaigns-v1"],
  { revalidate: publicCacheSeconds, tags: ["public-campaigns"] }
);

const getCachedDbFeaturedProducts = cachedQuery(
  () => prisma.product.findMany({
    where: { isFeatured: true, status: PublishStatus.published },
    select: {
      slug: true,
      titleAr: true,
      titleEn: true,
      titleHe: true,
      summaryAr: true,
      summaryEn: true,
      summaryHe: true,
      coverImageUrl: true,
      isNew: true,
      category: { select: { slug: true, nameAr: true, nameEn: true, nameHe: true } },
      images: {
        select: { url: true, isCover: true },
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }],
        take: 1
      }
    },
    orderBy: { sortOrder: "asc" },
    take: 5
  }),
  ["public-featured-products-v2"],
  { revalidate: publicCacheSeconds, tags: ["public-products"] }
);

const getCachedDbShowroomProfile = cachedQuery(
  () => prisma.setting.findUnique({ where: { key: "showroom_profile" }, select: { value: true } }),
  ["public-settings-v2"],
  { revalidate: settingsCacheSeconds, tags: ["public-settings"] }
);

export async function getPublicCategories() {
  const dbCategories = await getCachedDbCategories();

  return dbCategories.map((category) => ({
    slug: category.slug,
    label: { ar: category.nameAr, en: category.nameEn, he: category.nameHe }
  }));
}

export async function getPublicProducts() {
  const [dbProducts, dbOffers] = await Promise.all([
    getCachedDbProducts(),
    getCachedDbOffers(),
  ]);

  const offerProductSlugs = new Set(dbOffers.flatMap((o) => o.offerProducts?.map((op) => op.product.slug) ?? []));

  return dbProducts.map((p) => {
    const product = mapDbProduct(p);
    product.hasOffer = offerProductSlugs.has(p.slug);
    return product;
  });
}

export type FeaturedProduct = {
  slug: string;
  title: { ar: string; en: string; he: string };
  summary: { ar: string; en: string; he: string };
  image: string;
  isNew: boolean;
  categoryLabel: { ar: string; en: string; he: string };
};

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const dbFeatured = await getCachedDbFeaturedProducts();

  const mapped = dbFeatured.map((p) => {
    const img = p.images[0];
    const category = p.category;
    return {
      slug: p.slug,
      title: { ar: p.titleAr, en: p.titleEn, he: p.titleHe },
      summary: { ar: p.summaryAr ?? "", en: p.summaryEn ?? "", he: p.summaryHe ?? "" },
      image: p.coverImageUrl ?? img?.url ?? fallbackImage,
      isNew: p.isNew,
      categoryLabel: {
        ar: category?.nameAr ?? "",
        en: category?.nameEn ?? "",
        he: category?.nameHe ?? ""
      }
    };
  });

  return mapped;
}

export async function getPublicCatalogProducts() {
  const [dbProducts, dbOffers] = await Promise.all([
    getCachedDbCatalogProducts(),
    getCachedDbOffers(),
  ]);

  const offerProductSlugs = new Set(dbOffers.flatMap((o) => o.offerProducts?.map((op) => op.product.slug) ?? []));

  return dbProducts.map((product): Product => {
    const category = product.category;
    const primaryImage = product.images[0];
    const imageUrl = product.coverImageUrl ?? primaryImage?.url ?? fallbackImage;

    return {
      slug: product.slug,
      code: product.code ?? product.slug,
      category: category.slug,
      categoryLabel: { ar: category.nameAr, en: category.nameEn, he: category.nameHe },
      style: styles[0].slug,
      styleLabel: styles[0].label,
      title: { ar: product.titleAr, en: product.titleEn, he: product.titleHe },
      summary: { ar: product.summaryAr ?? "", en: product.summaryEn ?? "", he: product.summaryHe ?? "" },
      description: { ar: "", en: "", he: "" },
      customization: { ar: "", en: "", he: "" },
      availability: { ar: "", en: "", he: "" },
      priceLabel: product.priceLabel,
      featured: product.isFeatured,
      isNew: product.isNew,
      hasOffer: offerProductSlugs.has(product.slug),
      images: [{
        src: imageUrl,
        title: { ar: primaryImage?.titleAr ?? product.titleAr, en: primaryImage?.titleEn ?? product.titleEn, he: primaryImage?.titleHe ?? product.titleHe },
        caption: { ar: "", en: "", he: "" },
        alt: { ar: primaryImage?.altAr ?? product.titleAr, en: primaryImage?.altEn ?? product.titleEn, he: primaryImage?.altHe ?? product.titleHe },
        type: (primaryImage?.imageType ?? "main") as ProductImageType,
        sortOrder: primaryImage?.sortOrder ?? 0
      }],
      fabrics: [],
      relatedGallery: []
    };
  });
}

export async function getPublicProduct(slug: string) {
  return (await getPublicProducts()).find((product) => product.slug === slug);
}

export async function getPublicSimilarProducts(product: Product) {
  return (await getPublicProducts())
    .filter((item) => item.slug !== product.slug && (item.category === product.category || item.style === product.style))
    .slice(0, 3);
}

export async function getPublicFabrics() {
  const dbFabrics = await getCachedDbFabrics();

  return dbFabrics.map((fabric): Fabric => ({
    slug: fabric.slug,
    code: fabric.code ?? fabric.slug,
    name: { ar: fabric.nameAr, en: fabric.nameEn, he: fabric.nameHe },
    family: { ar: fabric.familyAr ?? fabric.colorNameAr ?? "", en: fabric.familyEn ?? fabric.colorNameEn ?? "", he: fabric.familyHe ?? fabric.colorNameHe ?? "" },
    type: { ar: fabric.typeAr ?? fabric.familyAr ?? "", en: fabric.typeEn ?? fabric.familyEn ?? "", he: fabric.typeHe ?? fabric.familyHe ?? "" },
    availability: { ar: fabric.availabilityAr ?? "", en: fabric.availabilityEn ?? "", he: fabric.availabilityHe ?? "" },
    image: fabric.imageUrl ?? fallbackImage,
    color: fabric.hexColor ?? "#e8dcc8"
  }));
}

export async function getPublicOffers() {
  const dbOffers = await getCachedDbOffers();

  return dbOffers.map((offer): Offer => {
    const relatedProducts = offer.offerProducts?.map((op) => op.product.slug) ?? [];

    return {
      slug: offer.slug,
      title: { ar: offer.titleAr, en: offer.titleEn, he: offer.titleHe },
      summary: { ar: offer.descriptionAr ?? "", en: offer.descriptionEn ?? "", he: offer.descriptionHe ?? "" },
      priceLabel: offer.priceLabel,
      image: offer.imageUrl ?? fallbackImage,
      relatedProducts
    };
  });
}

export async function getPublicGalleryItems() {
  const dbItems = await getCachedDbGalleryItems();

  return dbItems.map((item): GalleryItem => ({
    slug: item.id,
    album: item.album?.slug ?? "gallery",
    category: item.album?.slug ?? "gallery",
    title: { ar: item.titleAr ?? item.album?.titleAr ?? "صورة معرض", en: item.titleEn ?? item.album?.titleEn ?? "Gallery image", he: item.titleHe ?? item.album?.titleHe ?? "תמונת גלריה" },
    caption: { ar: item.captionAr ?? "", en: item.captionEn ?? "", he: item.captionHe ?? "" },
    image: item.imageUrl,
    tall: item.imageType === "customer_work" && item.isFeatured
  }));
}

export async function getPublicCampaigns() {
  const dbCampaigns = await getCachedDbCampaigns();

  return dbCampaigns.filter((campaign) => campaign.status === PublishStatus.published).map((campaign): Campaign => {
    const productSlugs = campaign.campaignProducts?.map((cp) => cp.product.slug) ?? [];
    const offerSlugs = campaign.campaignOffers?.map((co) => co.offer.slug) ?? [];
    const fabricSlugs = campaign.campaignFabrics?.map((cf) => cf.fabric.slug) ?? [];

    return {
      slug: campaign.slug,
      title: { ar: campaign.titleAr, en: campaign.titleEn, he: campaign.titleHe },
      summary: { ar: campaign.descriptionAr ?? "", en: campaign.descriptionEn ?? "", he: campaign.descriptionHe ?? "" },
      image: campaign.imageUrl ?? fallbackImage,
      productSlugs,
      offerSlugs,
      fabricSlugs,
      updatedAt: campaign.updatedAt
    };
  });
}

export async function getPublicCampaign(slug: string) {
  return (await getPublicCampaigns()).find((campaign) => campaign.slug === slug);
}

export async function getShowroomProfile() {
  const setting = await getCachedDbShowroomProfile();
  const storedProfile = (setting?.value ?? {}) as Partial<ShowroomProfile>;
  const themePreset = getThemePreset(typeof storedProfile.themePreset === "string" ? storedProfile.themePreset : showroomProfileDefaults.themePreset).id;
  return {
    ...showroomProfileDefaults,
    ...storedProfile,
    themePreset,
    deliveryAreas: Array.isArray(storedProfile.deliveryAreas) ? storedProfile.deliveryAreas : showroomProfileDefaults.deliveryAreas,
    social: {
      ...showroomProfileDefaults.social,
      ...(storedProfile.social ?? {})
    },
    mapLink: storedProfile.mapLink ?? showroomProfileDefaults.mapLink
  } satisfies ShowroomProfile;
}

type DbProductWithImages = Awaited<ReturnType<typeof getCachedDbProducts>>[number] & {
  productFabrics?: { fabric: { slug: string } }[];
};

function resolveProductImages(dbProduct: Pick<DbProductWithImages, "coverImageUrl" | "images" | "titleAr" | "titleEn" | "titleHe">): ProductImageAsset[] {
  const { coverImageUrl, images: dbImages } = dbProduct;
  const { titleAr, titleEn, titleHe } = dbProduct;

  const sorted = [...dbImages].sort((a, b) => {
    const aIsCover = a.isCover || a.url === coverImageUrl;
    const bIsCover = b.isCover || b.url === coverImageUrl;
    if (aIsCover !== bIsCover) return aIsCover ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });

  const mapped = sorted.map((image): ProductImageAsset => ({
    src: image.url,
    title: { ar: image.titleAr ?? titleAr, en: image.titleEn ?? titleEn, he: image.titleHe ?? titleHe },
    caption: { ar: image.captionAr ?? "", en: image.captionEn ?? "", he: image.captionHe ?? "" },
    alt: { ar: image.altAr ?? titleAr, en: image.altEn ?? titleEn, he: image.altHe ?? titleHe },
    type: image.imageType as ProductImageType,
    sortOrder: image.sortOrder
  }));

  const hasCoverImage = typeof coverImageUrl === "string" && coverImageUrl.length > 0;
  const coverNotInMapped = hasCoverImage && !mapped.some((img) => img.src === coverImageUrl);

  if (coverNotInMapped) {
    return [{ src: coverImageUrl as string, title: { ar: titleAr, en: titleEn, he: titleHe }, caption: { ar: "", en: "", he: "" }, alt: { ar: titleAr, en: titleEn, he: titleHe }, type: "main" as const, sortOrder: 0 }, ...mapped];
  }

  if (mapped.length > 0) return mapped;

  if (hasCoverImage) {
    return [{ src: coverImageUrl as string, title: { ar: titleAr, en: titleEn, he: titleHe }, caption: { ar: "", en: "", he: "" }, alt: { ar: titleAr, en: titleEn, he: titleHe }, type: "main" as const, sortOrder: 1 }];
  }

  return [{ src: fallbackImage, title: { ar: titleAr, en: titleEn, he: titleHe }, caption: { ar: "", en: "", he: "" }, alt: { ar: titleAr, en: titleEn, he: titleHe }, type: "main" as const, sortOrder: 1 }];
}

function mapDbProduct(product: DbProductWithImages): Product {
  const category = product.category;
  const categoryLabel = {
    ar: category.nameAr,
    en: category.nameEn,
    he: category.nameHe
  };
  const images = resolveProductImages(product);

  const fabrics = product.productFabrics?.map((pf) => pf.fabric.slug) ?? [];

  return {
    slug: product.slug,
    code: product.code ?? product.slug,
    category: category.slug,
    categoryLabel,
    style: styles[0].slug,
    styleLabel: styles[0].label,
    title: { ar: product.titleAr, en: product.titleEn, he: product.titleHe },
    summary: { ar: product.summaryAr ?? product.descriptionAr ?? "", en: product.summaryEn ?? product.descriptionEn ?? "", he: product.summaryHe ?? product.descriptionHe ?? "" },
    description: { ar: product.descriptionAr ?? product.summaryAr ?? "", en: product.descriptionEn ?? product.summaryEn ?? "", he: product.descriptionHe ?? product.summaryHe ?? "" },
    customization: { ar: product.customizationAr ?? "", en: product.customizationEn ?? "", he: product.customizationHe ?? "" },
    availability: { ar: product.availabilityAr ?? "", en: product.availabilityEn ?? "", he: product.availabilityHe ?? "" },
    priceLabel: product.priceLabel,
    featured: product.isFeatured,
    isNew: product.isNew,
    images,
    fabrics,
    relatedGallery: [],
    updatedAt: product.updatedAt
  };
}
