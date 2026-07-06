import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { WhatsAppInquiryButton } from "@/components/conversion/whatsapp-inquiry-button";
import { AnimatedSection } from "@/components/public/animated-section";
import { HomeGalleryPreview } from "@/components/public/home-gallery-preview";
import { OfferCard } from "@/components/public/offer-card";
import { ProductCard } from "@/components/public/product-card";
import { SectionHeader } from "@/components/public/section-header";
import { type Locale } from "@/i18n/routing";
import { getPublicFabrics, getPublicGalleryItems, getPublicOffers, getPublicProducts } from "@/lib/db-showroom-data";
import { priceLabels, t } from "@/lib/showroom-data";
import { localizedProfileValue } from "@/lib/showroom-profile";
import type { ShowroomProfile, FaqItem } from "@/lib/showroom-profile";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

type HomeStreamingProps = {
  locale: Locale;
  profile: ShowroomProfile;
};

export async function HomeStreamingSections({ locale, profile }: HomeStreamingProps) {
  const tHome = await getTranslations("home");
  const tFaq = await getTranslations("faq");
  const [products, offers, fabrics, galleryItems] = await Promise.all([
    getPublicProducts(),
    getPublicOffers(),
    getPublicFabrics(),
    getPublicGalleryItems()
  ]);

  const featuredSofas = products.filter((product) => product.category === "sofa-sets" || product.category === "corner-sofas").slice(0, 2);
  const featuredTables = products.filter((product) => product.category === "custom-orders" || product.category === "living-rooms").slice(0, 2);
  const featuredProducts = products.filter((product) => product.featured).slice(0, 3);
  const visibleProducts = featuredProducts.length > 0 ? featuredProducts : featuredSofas.concat(featuredTables).slice(0, 3);
  const productSlugsWithOffers = new Set(offers.flatMap((offer) => offer.relatedProducts));
  const profileFaqItems = profile.faqItems && profile.faqItems.length > 0 ? profile.faqItems : undefined;
  const faqItems: [string, string][] = profileFaqItems
    ? profileFaqItems.map((item) => [item[`question${locale === "en" ? "En" : locale === "he" ? "He" : "Ar"}` as keyof FaqItem] as string ?? "", item[`answer${locale === "en" ? "En" : locale === "he" ? "He" : "Ar"}` as keyof FaqItem] as string ?? ""])
    : Array.from({ length: 5 }, (_, i) => [tFaq(`q${i}`), tFaq(`a${i}`)] as [string, string]);
  const whatsappCta = localizedProfileValue(profile, "whatsappCta", locale) || tHome("cta");

  return (
    <>
      {profile.showFeaturedProducts ? (
        <AnimatedSection className="theme-section container-shell py-12">
          <SectionHeader href={`/${locale}/catalog`} title={localizedProfileValue(profile, "homepageFeaturedTitle", locale) || tHome("featured")} description={localizedProfileValue(profile, "homepageFeaturedSubtitle", locale) || tHome("featuredDesc")} />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.slug}
                locale={locale}
                href={`/${locale}/products/${product.slug}`}
                slug={product.slug}
                title={t(product.title, locale)}
                category={t(product.categoryLabel, locale)}
                image={product.images[0]?.src ?? "/images/hero-showroom.svg"}
                priceLabel={t(priceLabels[product.priceLabel], locale)}
                badge={product.isNew ? tHome("new") : productSlugsWithOffers.has(product.slug) ? tHome("offer") : undefined}
              />
            ))}
          </div>
        </AnimatedSection>
      ) : null}

      {profile.showTablesSection ? (
        <AnimatedSection className="theme-section container-shell py-12">
          <SectionHeader href={`/${locale}/catalog`} title={localizedProfileValue(profile, "homepageTablesTitle", locale) || tHome("tables")} description={localizedProfileValue(profile, "homepageTablesSubtitle", locale) || tHome("tablesDesc")} />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {featuredTables.map((product) => (
              <ProductCard key={product.slug} locale={locale} href={`/${locale}/products/${product.slug}`} slug={product.slug} title={t(product.title, locale)} category={t(product.categoryLabel, locale)} image={product.images[0]?.src ?? "/images/hero-showroom.svg"} priceLabel={t(priceLabels[product.priceLabel], locale)} />
            ))}
          </div>
        </AnimatedSection>
      ) : null}

      {profile.showOffers ? (
        <AnimatedSection className="theme-section container-shell py-12">
          <SectionHeader href={`/${locale}/offers`} title={localizedProfileValue(profile, "homepageOffersTitle", locale) || tHome("offers")} description={localizedProfileValue(profile, "offersSubtitle", locale) || tHome("offersDesc")} />
          <div className="mt-8 grid gap-6">
            {offers.slice(0, 1).map((offer) => (
              <OfferCard key={offer.slug} offer={offer} locale={locale} products={products} />
            ))}
          </div>
        </AnimatedSection>
      ) : null}

      {profile.showFabrics ? (
        <AnimatedSection className="theme-section container-shell py-12">
          <SectionHeader href={`/${locale}/fabrics`} title={localizedProfileValue(profile, "homepageFabricsTitle", locale) || tHome("fabricsTitle")} description={localizedProfileValue(profile, "fabricsSubtitle", locale) || tHome("fabricsDesc")} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {fabrics.slice(0, 3).map((fabric) => (
              <div key={fabric.slug} className="theme-card overflow-hidden rounded-[2rem] bg-card shadow-sm ring-1 ring-border">
                <div className="relative aspect-square">
                  <Image src={cloudinaryOptimizedUrl(fabric.image)} alt={t(fabric.name, locale)} fill className="h-full w-full object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
                </div>
                <div className="p-5">
                  <div className="text-sm font-bold text-secondary">{fabric.code}</div>
                  <div className="mt-2 text-lg font-bold">{t(fabric.name, locale)}</div>
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      ) : null}

      {profile.showGallery ? (
        <AnimatedSection className="theme-section container-shell py-12">
          <SectionHeader href={`/${locale}/gallery`} title={localizedProfileValue(profile, "homepageGalleryTitle", locale) || tHome("previousWorkTitle")} description={localizedProfileValue(profile, "gallerySubtitle", locale) || tHome("previousWorkDesc")} />
          <div className="mt-8">
            <HomeGalleryPreview images={galleryItems.slice(0, 3).map((item) => ({ src: item.image, alt: t(item.title, locale), title: t(item.title, locale), caption: t(item.caption, locale), tall: item.tall }))} />
          </div>
        </AnimatedSection>
      ) : null}

      {profile.showPreviousWork ? (
        <AnimatedSection className="theme-section container-shell py-12">
          <div className="theme-cta grid gap-6 rounded-panel bg-foreground p-6 text-primary-foreground md:grid-cols-3 md:p-10">
            {([
              [localizedProfileValue(profile, "homepageTrustTitle1", locale) || tHome("customMeasurements"), localizedProfileValue(profile, "homepageTrustText1", locale) || tHome("customMeasurementsDesc")],
              [localizedProfileValue(profile, "homepageTrustTitle2", locale) || tHome("fabricGuidance"), localizedProfileValue(profile, "homepageTrustText2", locale) || tHome("fabricGuidanceDesc")],
              [localizedProfileValue(profile, "homepageTrustTitle3", locale) || tHome("deliveryCoordination"), localizedProfileValue(profile, "homepageTrustText3", locale) || tHome("deliveryCoordinationDesc")]
            ] as const).map(([title, description]) => (
              <div key={title}>
                <div className="text-xl font-bold">{title}</div>
                <p className="mt-3 text-sm leading-7 text-surface-soft">{description}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      ) : null}

      {profile.showFaq ? (
        <AnimatedSection className="theme-section container-shell py-12">
          <SectionHeader title={localizedProfileValue(profile, "homepageFaqTitle", locale) || (locale === "ar" ? "أسئلة قبل التواصل" : locale === "he" ? "שאלות לפני פנייה" : "Questions before contacting")} description={localizedProfileValue(profile, "homepageFaqSubtitle", locale) || (locale === "ar" ? "إجابات قصيرة تساعد الزبون يفهم طريقة التفصيل والطلب عبر واتساب." : locale === "he" ? "תשובות קצרות שמסבירות התאמה אישית ופנייה דרך וואטסאפ." : "Short answers that explain customization and WhatsApp inquiry.")} />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {faqItems.map(([question, answer]) => (
              <div key={question} className="theme-card rounded-3xl bg-card p-5 ring-1 ring-border">
                <h3 className="text-lg font-bold">{question}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{answer}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      ) : null}

      {profile.showFinalCta ? (
        <AnimatedSection className="theme-section container-shell py-12">
          <div className="theme-cta premium-panel rounded-panel p-8 text-center md:p-12">
            <div className="text-3xl font-bold">{localizedProfileValue(profile, "homepageFinalTitle", locale) || tHome("finalTitle")}</div>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{localizedProfileValue(profile, "homepageFinalSubtitle", locale) || tHome("finalDesc")}</p>
            <div className="mt-7 flex justify-center">
              <WhatsAppInquiryButton locale={locale} size="lg" label={whatsappCta} entity={{ type: "campaign", id: "home-final", title: "Homepage final CTA", href: `/${locale}` }} />
            </div>
          </div>
        </AnimatedSection>
      ) : null}
    </>
  );
}
