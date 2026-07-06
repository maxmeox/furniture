import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { GalleryBrowser } from "@/components/public/gallery-browser";
import { SectionHeader } from "@/components/public/section-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { isLocale, type Locale } from "@/i18n/routing";
import { getPublicCategories, getPublicGalleryItems, getShowroomProfile } from "@/lib/db-showroom-data";
import { localizedProfileValue } from "@/lib/showroom-profile";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    alternates: {
      canonical: `/${locale}/gallery`,
      languages: { ar: "/ar/gallery", en: "/en/gallery", he: "/he/gallery" },
    },
  };
}

export default async function GalleryPage() {
  const t = await getTranslations("routes");
  const locale = (await getLocale()) as Locale;
  const [itemsData, categoriesData, profile] = await Promise.all([getPublicGalleryItems(), getPublicCategories(), getShowroomProfile()]);
  return (
    <>
      {await Breadcrumbs({ locale, items: [
        { label: t("home"), href: `/${locale}` },
        { label: t("gallery") },
      ]})}
      <section className="container-shell py-10">
        <SectionHeader title={t("gallery")} description={localizedProfileValue(profile, "gallerySubtitle", locale) || t("galleryDescription")} />
        <GalleryBrowser locale={locale} itemsData={itemsData} categoriesData={categoriesData} />
      </section>
    </>
  );
}
