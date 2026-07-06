import type { MetadataRoute } from "next";
import { locales } from "@/i18n/routing";
import { getPublicCampaigns, getPublicProducts } from "@/lib/db-showroom-data";
import { appUrl } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, campaigns] = await Promise.all([
    getPublicProducts().catch(() => []),
    getPublicCampaigns().catch(() => [])
  ]);
  const staticRoutes = ["", "/catalog", "/fabrics", "/offers", "/gallery", "/contact", "/interest-list"];

  return [
    ...locales.flatMap((locale) =>
      staticRoutes.map((route) => ({
        url: `${appUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
        priority: route === "" ? 1 : 0.7
      }))
    ),
    ...locales.flatMap((locale) =>
      products.map((product) => ({
        url: `${appUrl}/${locale}/products/${product.slug}`,
        lastModified: product.updatedAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: product.featured ? 0.9 : 0.8
      }))
    ),
    ...locales.flatMap((locale) =>
      campaigns.map((campaign) => ({
        url: `${appUrl}/${locale}/campaigns/${campaign.slug}`,
        lastModified: campaign.updatedAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7
      }))
    )
  ];
}
