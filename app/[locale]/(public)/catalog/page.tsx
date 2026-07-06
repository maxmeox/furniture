import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/public/catalog-browser";
import { SectionHeader } from "@/components/public/section-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Spinner } from "@/components/ui/spinner";
import { isLocale, type Locale } from "@/i18n/routing";
import { getPublicCatalogProducts, getPublicCategories, getShowroomProfile } from "@/lib/db-showroom-data";
import { localizedProfileValue } from "@/lib/showroom-profile";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    alternates: {
      canonical: `/${locale}/catalog`,
      languages: { ar: "/ar/catalog", en: "/en/catalog", he: "/he/catalog" },
    },
  };
}

export default async function CatalogPage() {
  const t = await getTranslations("routes");
  const locale = (await getLocale()) as Locale;
  const [productsData, categoriesData, profile] = await Promise.all([getPublicCatalogProducts(), getPublicCategories(), getShowroomProfile()]);
  return (
    <>
      {await Breadcrumbs({ locale, items: [
        { label: t("home"), href: `/${locale}` },
        { label: t("catalog") },
      ]})}
      <section className="container-shell py-10">
        <SectionHeader title={t("catalog")} description={localizedProfileValue(profile, "catalogSubtitle", locale) || t("catalogDescription")} />
        <Suspense fallback={<div className="flex justify-center py-20"><Spinner /></div>}>
          <CatalogBrowser locale={locale} productsData={productsData} categoriesData={categoriesData} />
        </Suspense>
      </section>
    </>
  );
}
