"use server";

import { getPublicFabrics, getPublicOffers, getPublicProducts } from "@/lib/db-showroom-data";
import type { Locale } from "@/i18n/routing";
import type { SearchItem } from "@/components/ui/search-command";

export async function getSearchItems(locale: string): Promise<SearchItem[]> {
  const typedLocale = locale as Locale;
  const [products, offers, fabrics] = await Promise.all([
    getPublicProducts(),
    getPublicOffers(),
    getPublicFabrics(),
  ]);

  return [
    ...products.map((p) => ({
      id: `product-${p.slug}`,
      title: p.title[typedLocale] ?? p.title.en ?? "",
      subtitle: p.categoryLabel[typedLocale] ?? p.categoryLabel.en ?? "",
      category: typedLocale === "ar" ? "منتجات" : typedLocale === "he" ? "מוצרים" : "Products",
      href: `/${locale}/products/${p.slug}`,
      image: p.images[0]?.src,
    })),
    ...offers.map((o) => ({
      id: `offer-${o.slug}`,
      title: o.title[typedLocale] ?? o.title.en ?? "",
      subtitle: "",
      category: typedLocale === "ar" ? "عروض" : typedLocale === "he" ? "מבצעים" : "Offers",
      href: `/${locale}/offers`,
      image: o.image,
    })),
    ...fabrics.map((f) => ({
      id: `fabric-${f.slug}`,
      title: f.name[typedLocale] ?? f.name.en ?? "",
      subtitle: f.code ?? "",
      category: typedLocale === "ar" ? "أقمشة" : typedLocale === "he" ? "בדים" : "Fabrics",
      href: `/${locale}/fabrics`,
      image: f.image,
    })),
  ];
}
