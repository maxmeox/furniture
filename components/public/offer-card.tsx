import Image from "next/image";
import Link from "next/link";
import { TrackEvent } from "@/components/conversion/track-event";
import { WhatsAppInquiryButton } from "@/components/conversion/whatsapp-inquiry-button";
import { type Locale } from "@/i18n/routing";
import { type Offer, type Product, priceLabels, t } from "@/lib/showroom-data";
import { InterestButton } from "./interest-button";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

export function OfferCard({ offer, locale, products = [] }: { offer: Offer; locale: Locale; products?: Product[] }) {
  const productMap = new Map(products.map((p) => [p.slug, p]));
  const getProductTitle = (slug: string) => {
    const product = productMap.get(slug);
    return product ? t(product.title, locale) : slug;
  };

  return (
    <article className="theme-card theme-offer-card theme-card-3d contain-layout grid overflow-hidden rounded-[2rem] bg-card shadow-card ring-1 ring-border md:grid-cols-[0.9fr_1.1fr]">
      <TrackEvent type="offer_viewed" entityType="offer" entityId={offer.slug} locale={locale} metadata={{ title: t(offer.title, locale) }} />
      <div className="relative min-h-72 overflow-hidden">
        <Image src={cloudinaryOptimizedUrl(offer.image)} alt={t(offer.title, locale)} fill className="h-full w-full object-cover" sizes="(min-width: 768px) 40vw, 100vw" />
      </div>
      <div className="p-6 md:p-8">
        <div className="theme-pill inline-flex rounded-full bg-muted px-3 py-1 text-xs font-bold text-primary">{t(priceLabels[offer.priceLabel], locale)}</div>
        <h3 className="mt-4 text-2xl font-bold">{t(offer.title, locale)}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(offer.summary, locale)}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <WhatsAppInquiryButton locale={locale} entity={{ type: "offer", id: offer.slug, title: t(offer.title, locale), href: `/${locale}/offers`, image: offer.image }} />
          <InterestButton compact item={{ id: offer.slug, type: "offer", title: t(offer.title, locale), subtitle: t(priceLabels[offer.priceLabel], locale), image: offer.image, href: `/${locale}/offers` }} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {offer.relatedProducts.map((slug) => (
            <Link key={slug} href={`/${locale}/products/${slug}`} className="theme-pill rounded-full bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground ring-1 ring-border hover:text-primary">
              {getProductTitle(slug)}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
