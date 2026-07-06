import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { OfferCard } from "@/components/public/offer-card";
import { SectionHeader } from "@/components/public/section-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { isLocale, type Locale } from "@/i18n/routing";
import { getPublicOffers, getPublicProducts, getShowroomProfile } from "@/lib/db-showroom-data";
import { localizedProfileValue } from "@/lib/showroom-profile";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    alternates: {
      canonical: `/${locale}/offers`,
      languages: { ar: "/ar/offers", en: "/en/offers", he: "/he/offers" },
    },
  };
}

const copy = {
  ar: "عروض مختارة للاستشارة عبر واتساب بدون دفع إلكتروني وبدون أسعار ثابتة.",
  en: "Premium showroom offers built for WhatsApp consultation and campaign traffic. No checkout and no exact prices.",
  he: "מבצעי אולם תצוגה לייעוץ בוואטסאפ, ללא תשלום באתר וללא מחירים קבועים."
} satisfies Record<Locale, string>;

const emptyCopy = {
  ar: { title: "لا توجد عروض حاليًا", description: "تابعنا للحصول على عروض جديدة قريبًا." },
  en: { title: "No offers available", description: "Check back soon for new offers." },
  he: { title: "אין מבצעים זמינים", description: "חזרו בקרוב למבצעים חדשים." }
} satisfies Record<Locale, { title: string; description: string }>;

export default async function OffersPage() {
  const t = await getTranslations("routes");
  const locale = (await getLocale()) as Locale;
  const [offers, profile, products] = await Promise.all([getPublicOffers(), getShowroomProfile(), getPublicProducts()]);
  return (
    <>
      {await Breadcrumbs({ locale, items: [
        { label: t("home"), href: `/${locale}` },
        { label: t("offers") },
      ]})}
      <section className="container-shell py-10">
        <SectionHeader title={t("offers")} description={localizedProfileValue(profile, "offersSubtitle", locale) || copy[locale]} />
        <div className="mt-8 grid gap-6">
          {offers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <div className="text-2xl font-bold">{emptyCopy[locale].title}</div>
              <p className="mt-3 text-sm text-muted-foreground">{emptyCopy[locale].description}</p>
            </div>
          ) : (
            offers.map((offer) => (
              <OfferCard key={offer.slug} offer={offer} locale={locale} products={products} />
            ))
          )}
        </div>
      </section>
    </>
  );
}
