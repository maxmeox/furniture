import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Clock, MapPin, MessageCircle, Ruler, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackEvent } from "@/components/conversion/track-event";
import { WhatsAppInquiryButton } from "@/components/conversion/whatsapp-inquiry-button";
import { OfferCard } from "@/components/public/offer-card";
import { ProductCard } from "@/components/public/product-card";
import { SectionHeader } from "@/components/public/section-header";
import { type Locale } from "@/i18n/routing";
import { getPublicCampaign, getPublicFabrics, getPublicOffers, getPublicProducts, getShowroomProfile } from "@/lib/db-showroom-data";
import { priceLabels, t } from "@/lib/showroom-data";
import { localizedProfileValue } from "@/lib/showroom-profile";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

const copy = {
  ar: {
    designs: "تصاميم مختارة",
    designsDescription: "اختيار مختصر لزائر الإعلان حتى يصل بسرعة إلى استفسار واتساب.",
    offer: "عرض مرتبط",
    offerDescription: "بطاقات العروض تبقى مركزة على الاستفسار والتفاوض عبر واتساب.",
    fabrics: "أقمشة مناسبة",
    fabricsDescription: "نظرة سريعة على اتجاهات الأقمشة التي تناسب هذه الحملة.",
    offerBadge: "عرض",
    eyebrow: "مجموعة مختارة",
    trust1: "تفصيل حسب الطلب",
    trust2: "بدون دفع إلكتروني",
    trust3: "استجابة خلال ساعة",
    ctaPrimary: "استفسر الآن عبر واتساب",
    ctaSecondary: "تصفح المجموعة الكاملة",
    microcopy: "استشارة مجانية • بدون التزام",
  },
  en: {
    designs: "Focused designs",
    designsDescription: "A shorter selection for ad visitors who want to move quickly to WhatsApp.",
    offer: "Related offer",
    offerDescription: "Offer cards stay focused on inquiry and negotiation through WhatsApp.",
    fabrics: "Useful fabrics",
    fabricsDescription: "A quick look at fabric directions that match this campaign.",
    offerBadge: "Offer",
    eyebrow: "Curated Selection",
    trust1: "Made to order",
    trust2: "No online payment",
    trust3: "Reply within an hour",
    ctaPrimary: "Inquire now on WhatsApp",
    ctaSecondary: "View full collection",
    microcopy: "Free consultation • No commitment",
  },
  he: {
    designs: "עיצובים נבחרים",
    designsDescription: "בחירה קצרה למבקרי מודעה שרוצים לעבור מהר לוואטסאפ.",
    offer: "מבצע קשור",
    offerDescription: "כרטיסי המבצע נשארים ממוקדים בפנייה ומשא ומתן בוואטסאפ.",
    fabrics: "בדים מתאימים",
    fabricsDescription: "מבט קצר על כיווני בדים שמתאימים לקמפיין הזה.",
    offerBadge: "מבצע",
    eyebrow: "מבחר נבחר",
    trust1: "ייצור לפי הזמנה",
    trust2: "ללא תשלום באתר",
    trust3: "תשובה תוך שעה",
    ctaPrimary: "בקש עכשיו בוואטסאפ",
    ctaSecondary: "עיין במבחר המלא",
    microcopy: "ייעוץ חינם • ללא התחייבות",
  },
} satisfies Record<Locale, Record<string, string>>;

export default async function CampaignPage({ params }: { params: Promise<{ locale?: string; slug?: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug) notFound();
  const locale = (await getLocale()) as Locale;
  const [campaign, products, offers, fabrics, profile] = await Promise.all([
    getPublicCampaign(slug),
    getPublicProducts(),
    getPublicOffers(),
    getPublicFabrics(),
    getShowroomProfile(),
  ]);
  if (!campaign) notFound();
  const campaignProducts = products.filter((product) => campaign.productSlugs.includes(product.slug));
  const campaignOffers = offers.filter((offer) => campaign.offerSlugs.includes(offer.slug));
  const campaignFabrics = fabrics.filter((fabric) => campaign.fabricSlugs.includes(fabric.slug));

  const c = copy[locale];
  const showroomName = localizedProfileValue(profile, "shortName", locale) || localizedProfileValue(profile, "name", locale);
  const deliverySummary = profile.deliveryAreas?.join(locale === "ar" ? "، " : ", ");

  return (
    <>
      <TrackEvent type="campaign_viewed" entityType="campaign" entityId={campaign.slug} locale={locale} metadata={{ title: t(campaign.title, locale) }} />

      {/* ==================== HERO SECTION ==================== */}
      <section className="container-shell py-6 md:py-16">
        <div className="flex flex-col md:grid md:grid-cols-[1fr_1.15fr] md:gap-10 items-stretch bg-surface/50 rounded-[2rem] p-5 sm:p-7 lg:p-10">

          {/* ---- IMAGE SIDE — first in DOM (mobile visual priority) ---- */}
          <div className="relative w-full aspect-[4/5] md:aspect-auto min-h-[260px] md:min-h-0 rounded-2xl overflow-hidden shadow-panel ring-1 ring-border order-1 md:order-2">
            {/* Gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/55 to-transparent pointer-events-none z-[1]" aria-hidden="true" />

            {/* Image */}
            <Image
              src={cloudinaryOptimizedUrl(campaign.image)}
              alt={t(campaign.title, locale)}
              fill
              priority
              className="object-cover object-center"
              sizes="(min-width: 768px) 50vw, 100vw"
            />

            {/* Overlay card — showroom name + delivery */}
            {showroomName || deliverySummary ? (
              <div className="absolute bottom-2 md:bottom-3 start-[3px] z-10 flex items-center gap-1.5 md:gap-2 rounded-full bg-surface/85 px-2.5 py-1 md:px-3 md:py-1.5 shadow-sm ring-1 ring-border/30 backdrop-blur-sm">
                {showroomName ? (
                  <>
                    <MapPin className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0 text-secondary" aria-hidden="true" />
                    <span className="text-[10px] md:text-[11px] font-bold whitespace-nowrap">{showroomName}</span>
                  </>
                ) : null}
                {showroomName && deliverySummary ? <span className="h-2.5 w-px md:h-3 bg-border/50 shrink-0" aria-hidden="true" /> : null}
                {deliverySummary ? (
                  <>
                    <Truck className="h-2.5 w-2.5 md:h-3 md:w-3 shrink-0 text-secondary" aria-hidden="true" />
                    <span className="text-[9px] md:text-[10px] text-muted-foreground whitespace-nowrap">{deliverySummary}</span>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* ---- TEXT SIDE — second in DOM, first visually on desktop ---- */}
          <div className="flex flex-col justify-center gap-4 md:gap-5 w-full py-4 md:py-0 md:pl-4 order-2 md:order-1">

            {/* Eyebrow badge */}
            <div className="hero-eyebrow-badge self-start">
              <span className="hero-eyebrow-dot" />
              <span>{c.eyebrow}</span>
            </div>

            {/* Title */}
            <h1 className="text-balance text-[clamp(1.5rem,2.5vw+0.5rem,3rem)] md:text-[clamp(1.75rem,2vw+0.5rem,3.5rem)] font-bold leading-[1.25] text-foreground">
              {t(campaign.title, locale)}
            </h1>

            {/* Summary */}
            <p className="text-pretty text-base leading-[1.75] md:leading-[2] text-muted-foreground">
              {t(campaign.summary, locale)}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4">
              <Button asChild variant="primary" size="lg">
                <Link href={`/${locale}/catalog`}>{c.ctaSecondary}</Link>
              </Button>
              <WhatsAppInquiryButton
                locale={locale}
                variant="secondary"
                size="lg"
                label={c.ctaPrimary}
                entity={{ type: "campaign", id: campaign.slug, title: t(campaign.title, locale), href: `/${locale}/campaigns/${campaign.slug}`, campaignSlug: campaign.slug }}
              />
            </div>

            {/* Trust chips */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-border/50 pt-3 md:pt-4">
              <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-muted-foreground whitespace-nowrap">
                <Ruler className="h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden="true" />
                {c.trust1}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-muted-foreground whitespace-nowrap">
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden="true" />
                {c.trust2}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-muted-foreground whitespace-nowrap">
                <Clock className="h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden="true" />
                {c.trust3}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRODUCTS SECTION ==================== */}
      {campaignProducts.length > 0 ? (
        <section className="theme-section container-shell py-10">
          <SectionHeader
            title={localizedProfileValue(profile, "campaignProductsTitle", locale) || c.designs}
            description={localizedProfileValue(profile, "campaignProductsSubtitle", locale) || c.designsDescription}
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {campaignProducts.map((product) => (
              <ProductCard
                key={product.slug}
                locale={locale}
                href={`/${locale}/products/${product.slug}`}
                slug={product.slug}
                title={t(product.title, locale)}
                category={t(product.categoryLabel, locale)}
                image={product.images[0]?.src ?? "/images/hero-showroom.svg"}
                priceLabel={t(priceLabels[product.priceLabel], locale)}
                badge={product.hasOffer ? c.offerBadge : undefined}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="theme-section container-shell py-10">
          <div className="theme-card rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm font-semibold text-muted-foreground">
            {localizedProfileValue(profile, "campaignEmptyProducts", locale) || (locale === "ar" ? "لم يتم اختيار منتجات لهذه الحملة بعد." : locale === "he" ? "עדיין לא נבחרו מוצרים לקמפיין הזה." : "No products have been selected for this campaign yet.")}
          </div>
        </section>
      )}

      {/* ==================== OFFERS SECTION ==================== */}
      {campaignOffers.length > 0 ? (
        <section className="theme-section container-shell py-10">
          <SectionHeader
            title={localizedProfileValue(profile, "campaignOffersTitle", locale) || c.offer}
            description={localizedProfileValue(profile, "campaignOffersSubtitle", locale) || c.offerDescription}
          />
          <div className="mt-8 grid gap-6">
            {campaignOffers.map((offer) => (
              <OfferCard key={offer.slug} offer={offer} locale={locale} products={products} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ==================== FABRICS SECTION ==================== */}
      {campaignFabrics.length > 0 ? (
        <section className="theme-section container-shell py-10">
          <SectionHeader
            title={localizedProfileValue(profile, "campaignFabricsTitle", locale) || c.fabrics}
            description={localizedProfileValue(profile, "campaignFabricsSubtitle", locale) || c.fabricsDescription}
          />
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {campaignFabrics.map((fabric) => (
              <div key={fabric.slug} className="theme-card min-w-56 rounded-3xl bg-card p-4 ring-1 ring-border">
                <span className="block h-20 rounded-2xl ring-1 ring-border" style={{ backgroundColor: fabric.color }} />
                <div className="mt-3 font-bold">{t(fabric.name, locale)}</div>
                <div className="mt-1 text-xs text-muted-foreground">{fabric.code}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
