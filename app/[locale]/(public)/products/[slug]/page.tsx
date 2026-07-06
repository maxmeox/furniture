import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { TrackEvent } from "@/components/conversion/track-event";
import { WhatsAppInquiryButton } from "@/components/conversion/whatsapp-inquiry-button";
import { ProductGallery } from "@/components/public/product-gallery";
import { ProductCard } from "@/components/public/product-card";
import { SectionHeader } from "@/components/public/section-header";
import { InterestButton } from "@/components/public/interest-button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/ui/json-ld";
import { ShareButton } from "@/components/ui/share-button";
import { type Locale } from "@/i18n/routing";
import { getPublicFabrics, getPublicGalleryItems, getPublicProduct, getPublicSimilarProducts, getShowroomProfile } from "@/lib/db-showroom-data";
import { priceLabels, t } from "@/lib/showroom-data";
import { localizedProfileValue } from "@/lib/showroom-profile";
import { appUrl } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getPublicProduct(slug);
  if (!product) return {};
  const title = t(product.title, locale);
  const description = t(product.description, locale) || t(product.summary, locale);
  const path = `/${locale}/products/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        ar: `/ar/products/${product.slug}`,
        en: `/en/products/${product.slug}`,
        he: `/he/products/${product.slug}`
      }
    },
    openGraph: {
      title,
      description,
      url: path,
      images: [{ url: product.images[0]?.src ?? "/images/hero-showroom.svg", alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.images[0]?.src ?? "/images/hero-showroom.svg"],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ locale?: string; slug?: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug) notFound();
  const product = await getPublicProduct(slug);
  if (!product) notFound();

  const locale = (await getLocale()) as Locale;
  const pt = await getTranslations("product");
  const routeT = await getTranslations("routes");
  const [allFabrics, allGalleryItems, similar, profile] = await Promise.all([getPublicFabrics(), getPublicGalleryItems(), getPublicSimilarProducts(product), getShowroomProfile()]);
  const linkedFabrics = allFabrics.filter((fabric) => product.fabrics.includes(fabric.slug));
  const previous = allGalleryItems.filter((item) => product.relatedGallery.includes(item.slug));
  const title = t(product.title, locale);

  return (
    <div className="pb-24 lg:pb-0">
      <TrackEvent type="product_viewed" entityType="product" entityId={product.slug} locale={locale} metadata={{ code: product.code, title }} />
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: title,
          description: t(product.description, locale) || t(product.summary, locale),
          image: product.images.length > 0 ? product.images.map((img) => img.src) : [`${appUrl}/images/hero-showroom.svg`],
          sku: product.code,
          category: t(product.categoryLabel, locale),
          url: `${appUrl}/${locale}/products/${product.slug}`,
        }}
      />
      {await Breadcrumbs({ locale, items: [
        { label: routeT("home"), href: `/${locale}` },
        { label: routeT("catalog"), href: `/${locale}/catalog` },
        { label: title },
      ]})}
      <section className="theme-section container-shell grid min-w-0 gap-8 py-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]">
        <ProductGallery images={product.images} locale={locale} productTitle={title} productSlug={product.slug} />
        <aside className="space-y-5">
          <div>
            <div className="text-sm font-bold text-secondary">{product.code} · {t(product.categoryLabel, locale)}</div>
            <h1 className="mt-3 text-4xl font-bold leading-tight">{title}</h1>
            <p className="mt-4 text-base leading-8 text-muted-foreground">{t(product.description, locale)}</p>
          </div>
          <div className="theme-card rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border">
            <div className="text-sm font-bold text-muted-foreground">{localizedProfileValue(profile, "productPriceLabel", locale) || pt("priceLabel")}</div>
            <div className="theme-pill mt-2 inline-flex rounded-full bg-muted px-4 py-2 text-sm font-bold text-primary">{t(priceLabels[product.priceLabel], locale)}</div>
            <div className="mt-5 text-sm font-bold text-muted-foreground">{localizedProfileValue(profile, "productCustomizationLabel", locale) || pt("customization")}</div>
            <p className="mt-2 text-sm leading-7">{t(product.customization, locale)}</p>
            <div className="mt-5 text-sm font-bold text-muted-foreground">{localizedProfileValue(profile, "productAvailabilityLabel", locale) || pt("availability")}</div>
            <p className="mt-2 text-sm leading-7">{t(product.availability, locale)}</p>
          </div>
          <div className="theme-cta sticky top-24 hidden rounded-3xl bg-[var(--theme-card)] p-5 text-[var(--theme-foreground)] shadow-xl lg:block">
            <div className="text-xl font-bold">{localizedProfileValue(profile, "productInquiryTitle", locale) || pt("discuss")}</div>
            <p className="mt-2 text-sm leading-7 text-[var(--theme-muted)]">{localizedProfileValue(profile, "productInquiryText", locale) || pt("discussText")}</p>
            <div className="mt-5 grid gap-2">
              <WhatsAppInquiryButton
                locale={locale}
                entity={{ type: "product", id: product.slug, title, code: product.code, href: `/${locale}/products/${product.slug}`, image: product.images[0]?.src }}
                selectedFabric={linkedFabrics[0] ? `${t(linkedFabrics[0].name, locale)} ${linkedFabrics[0].code}` : undefined}
              />
              <InterestButton item={{ id: product.slug, type: "product", title, subtitle: product.code, image: product.images[0]?.src, href: `/${locale}/products/${product.slug}` }} />
              <ShareButton
                title={title}
                text={t(product.summary, locale) || undefined}
                locale={locale}
                className="inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold px-5 h-11 ring-1 ring-white/20 text-white/90 hover:bg-white/10 transition"
              />
            </div>
          </div>
        </aside>
      </section>

      {linkedFabrics.length > 0 ? (
        <section className="theme-section container-shell py-10">
          <SectionHeader title={localizedProfileValue(profile, "productFabricsTitle", locale) || pt("linkedFabrics")} description={localizedProfileValue(profile, "productFabricsSubtitle", locale) || pt("linkedFabricsDesc")} />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {linkedFabrics.map((fabric) => (
              <Link key={fabric.slug} href={`/${locale}/fabrics`} className="theme-card flex gap-4 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
                <span className="h-16 w-16 shrink-0 rounded-2xl ring-1 ring-border" style={{ backgroundColor: fabric.color }} />
                <span>
                  <span className="block font-bold">{t(fabric.name, locale)}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{fabric.code} · {t(fabric.type, locale)}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {previous.length > 0 ? (
        <section className="theme-section container-shell py-10">
          <SectionHeader title={localizedProfileValue(profile, "productRelatedWorkTitle", locale) || pt("relatedWork")} description={localizedProfileValue(profile, "productRelatedWorkSubtitle", locale) || pt("relatedWorkDesc")} />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {previous.map((item) => (
              <div key={item.slug} className="theme-card rounded-3xl bg-card p-5 ring-1 ring-border">
                <div className="font-bold">{t(item.title, locale)}</div>
                <div className="mt-2 text-sm text-muted-foreground">{t(item.caption, locale)}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="theme-section container-shell py-10">
        <SectionHeader title={localizedProfileValue(profile, "productSimilarTitle", locale) || pt("similar")} description={localizedProfileValue(profile, "productSimilarSubtitle", locale) || pt("similarDesc")} />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {similar.map((item) => (
            <ProductCard key={item.slug} locale={locale} href={`/${locale}/products/${item.slug}`} slug={item.slug} title={t(item.title, locale)} category={t(item.categoryLabel, locale)} image={item.images[0]?.src ?? "/images/hero-showroom.svg"} priceLabel={t(priceLabels[item.priceLabel], locale)} />
          ))}
        </div>
      </section>

      <div className="theme-mobile-cta fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/96 p-3 shadow-2xl backdrop-blur lg:hidden">
        <div className="container-shell flex gap-2">
          <WhatsAppInquiryButton
            locale={locale}
            className="flex-1"
            entity={{ type: "product", id: product.slug, title, code: product.code, href: `/${locale}/products/${product.slug}`, image: product.images[0]?.src }}
            selectedFabric={linkedFabrics[0] ? `${t(linkedFabrics[0].name, locale)} ${linkedFabrics[0].code}` : undefined}
          />
          <InterestButton compact item={{ id: product.slug, type: "product", title, subtitle: product.code, image: product.images[0]?.src, href: `/${locale}/products/${product.slug}` }} />
        </div>
      </div>

      <div className="sr-only">{routeT("product")}</div>
    </div>
  );
}
