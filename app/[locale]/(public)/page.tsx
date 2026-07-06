import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { WhatsAppInquiryButton } from "@/components/conversion/whatsapp-inquiry-button";
import { HomeStreamingSections } from "@/components/public/home-streaming-sections";
import { HeroSlider } from "@/components/public/hero-slider";
import { PremiumButton } from "@/components/ui/premium-button";
import { type Locale } from "@/i18n/routing";
import { getFeaturedProducts, getShowroomProfile } from "@/lib/db-showroom-data";
import { localizedProfileValue } from "@/lib/showroom-profile";
import { t } from "@/lib/showroom-data";
import { cloudinaryOptimizedUrl, cloudinarySrcSet } from "@/lib/cloudinary-url";

function HomeSectionsSkeleton() {
  return (
    <div className="container-shell space-y-12 py-12">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i}>
          <div className="mx-auto mb-6 h-7 w-48 animate-pulse rounded-xl bg-muted" />
          <div className="mx-auto mb-8 h-5 w-72 animate-pulse rounded-xl bg-muted" />
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="overflow-hidden rounded-3xl ring-1 ring-border">
                <div className="aspect-[4/3] animate-pulse bg-muted" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-16 animate-pulse rounded-lg bg-muted" />
                  <div className="h-5 w-3/4 animate-pulse rounded-lg bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const tHome = await getTranslations("home");
  const locale = (await getLocale()) as Locale;
  const profile = await getShowroomProfile();
  const featured = await getFeaturedProducts();

  const heroTitle = localizedProfileValue(profile, "heroTitle", locale) || tHome("title");
  const heroSubtitle = localizedProfileValue(profile, "heroSubtitle", locale) || tHome("description");
  const showroomName = localizedProfileValue(profile, "shortName", locale) || localizedProfileValue(profile, "name", locale) || tHome("showroom");
  const deliverySummary = profile.deliveryAreas?.join(locale === "ar" ? "، " : ", ") || tHome("delivery");
  const whatsappCta = localizedProfileValue(profile, "whatsappCta", locale) || tHome("cta");

  const ctaLabel = locale === "ar" ? "استفسر الآن" : locale === "he" ? "בקש עכשיו" : "Inquire now";
  const eyebrowNew = { ar: "جديد", en: "New", he: "חדש" } as const;
  const slides = featured.map((p) => ({
    id: p.slug,
    image: p.image,
    title: t(p.title, locale),
    subtitle: t(p.summary, locale),
    ctaLabel,
    ctaHref: `/${locale}/products/${p.slug}`,
    alt: t(p.title, locale),
    eyebrow: p.isNew ? eyebrowNew[locale as keyof typeof eyebrowNew] : t(p.categoryLabel, locale),
    isNew: p.isNew
  }));

  // Preload LCP hero image at mobile-first size (640px × 2 for retina phones).
  // The browser will upgrade to a larger variant from srcSet if the viewport is wider.
  const lcpImage = slides[0]?.image ?? profile.heroImageUrl ?? "/images/hero-showroom.svg";
  const preloadUrl = cloudinaryOptimizedUrl(lcpImage, 640);

  return (
    <>
      <link rel="preload" as="image" href={preloadUrl} fetchPriority="high" imageSrcSet={cloudinarySrcSet(lcpImage)} imageSizes="(min-width: 768px) 50vw, 100vw" />
      {slides.length > 0 ? (
        <HeroSlider slides={slides} locale={locale} showroomName={showroomName} deliverySummary={deliverySummary} whatsappCta={whatsappCta} />
      ) : (
        <section className="theme-hero container-shell grid min-h-[calc(100vh-5rem)] items-stretch gap-10 px-5 py-8 sm:px-7 md:grid-cols-[0.92fr_1.08fr] md:gap-12 md:px-8 md:py-12 lg:px-10 xl:gap-14">
          <div className="space-y-7">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-secondary">{tHome("eyebrow")}</div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">{heroTitle}</h1>
            <p className="max-w-2xl text-base leading-8 text-muted-foreground">{heroSubtitle}</p>
            <div className="flex flex-wrap gap-3">
              <PremiumButton href={`/${locale}/catalog`} className="!text-white hover:!text-white focus-visible:!text-white active:!text-white [&_svg]:!text-white [&_span]:!text-white">{tHome("catalog")}</PremiumButton>
              <WhatsAppInquiryButton locale={locale} size="lg" label={whatsappCta} entity={{ type: "campaign", id: "home", title: "Homepage showroom inquiry", href: `/${locale}` }} />
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-3 pt-2">
              {[tHome("custom"), tHome("noCheckout"), tHome("whatsapp")].map((item) => (
                <div key={item} className="theme-card rounded-2xl bg-card p-3 text-center text-xs font-bold text-muted-foreground ring-1 ring-border">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div
            className="theme-panel relative self-stretch overflow-hidden rounded-panel shadow-panel ring-1 ring-border"
            style={{ transform: locale === "en" ? "translateX(-16px)" : "translateX(16px)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cloudinaryOptimizedUrl(profile.heroImageUrl || "/images/hero-showroom.svg")}
              srcSet={cloudinarySrcSet(profile.heroImageUrl || "/images/hero-showroom.svg")}
              alt={heroTitle}
              fetchPriority="high"
              decoding="sync"
              className="absolute inset-0 h-full w-full object-cover object-top"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <div className="theme-card absolute bottom-5 rounded-2xl bg-surface/90 p-4 shadow-lg backdrop-blur ltr:left-5 rtl:right-5">
              <div className="text-sm font-bold">{showroomName}</div>
              <div className="mt-1 text-xs text-muted-foreground">{deliverySummary}</div>
            </div>
          </div>
        </section>
      )}

      <Suspense fallback={<HomeSectionsSkeleton />}>
        <HomeStreamingSections locale={locale} profile={profile} />
      </Suspense>
    </>
  );
}
