import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { FabricsBrowser } from "@/components/public/fabrics-browser";
import { SectionHeader } from "@/components/public/section-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { isLocale, type Locale } from "@/i18n/routing";
import { getPublicFabrics, getShowroomProfile } from "@/lib/db-showroom-data";
import { localizedProfileValue } from "@/lib/showroom-profile";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    alternates: {
      canonical: `/${locale}/fabrics`,
      languages: { ar: "/ar/fabrics", en: "/en/fabrics", he: "/he/fabrics" },
    },
  };
}

export default async function FabricsPage() {
  const t = await getTranslations("routes");
  const locale = (await getLocale()) as Locale;
  const [fabricsData, profile] = await Promise.all([getPublicFabrics(), getShowroomProfile()]);
  return (
    <>
      {await Breadcrumbs({ locale, items: [
        { label: t("home"), href: `/${locale}` },
        { label: t("fabrics") },
      ]})}
      <section className="container-shell py-10">
        <SectionHeader title={t("fabrics")} description={localizedProfileValue(profile, "fabricsSubtitle", locale) || t("fabricsDescription")} />
        <FabricsBrowser locale={locale} fabricsData={fabricsData} />
      </section>
    </>
  );
}
