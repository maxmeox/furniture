import { PublishStatus } from "@prisma/client";

type ProductForQuality = {
  status: PublishStatus;
  descriptionAr: string | null;
  images: { id: string }[];
  _count: { productFabrics: number };
};

export function getProductQualityHints(product: ProductForQuality) {
  const hints: string[] = [];
  if (product.status !== PublishStatus.published) hints.push("غير منشور");
  if (product.images.length < 3) hints.push("يحتاج صور");
  if (!product.descriptionAr?.trim()) hints.push("يحتاج وصف");
  if (product._count.productFabrics === 0) hints.push("يحتاج أقمشة");
  return hints;
}

export function productQualityLabel(product: ProductForQuality) {
  const hints = getProductQualityHints(product);
  return hints.length === 0 ? ["جاهز"] : hints;
}

export function productNeedsAttention(product: ProductForQuality) {
  const hints = getProductQualityHints(product);
  return hints.some((hint) => hint === "يحتاج صور" || hint === "يحتاج وصف" || hint === "غير منشور");
}
