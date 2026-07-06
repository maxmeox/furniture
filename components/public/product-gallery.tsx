"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Locale } from "@/i18n/routing";
import { type ProductImageAsset, t } from "@/lib/showroom-data";
import { cn } from "@/lib/utils";
import { Lightbox } from "./lightbox";
import { readStoredCampaignContext } from "@/components/conversion/use-campaign-context";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

export function ProductGallery({
  images,
  locale,
  productTitle,
  productSlug
}: {
  images: ProductImageAsset[];
  locale: Locale;
  productTitle: string;
  productSlug?: string;
}) {
  const gt = useTranslations("gallery");
  const sortedImages = useMemo(() => [...images].sort((a, b) => a.sortOrder - b.sortOrder), [images]);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(-1);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  if (sortedImages.length === 0) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[2rem] border border-dashed border-border bg-card text-center">
        <div>
          <div className="text-xl font-bold">{productTitle}</div>
          <p className="mt-2 text-sm text-muted-foreground">{gt("empty")}</p>
        </div>
      </div>
    );
  }

  const currentImage = sortedImages[active];
  if (!currentImage) return null;

  const lightboxImages = sortedImages.map((item) => ({
    src: item.src,
    alt: t(item.alt, locale),
    title: t(item.title, locale),
    caption: t(item.caption, locale)
  }));

  return (
    <div className="w-full max-w-full min-w-0">
      <div
        className="group relative box-border aspect-[4/3] w-full max-w-full overflow-hidden rounded-[2rem] shadow-card-hover ring-1 ring-border md:aspect-[5/4]"
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (!touch) return;
          setTouchStart(touch.clientX);
        }}
        onTouchEnd={(event) => {
          if (touchStart === null) return;
          const touch = event.changedTouches[0];
          if (!touch) return;
          const delta = touch.clientX - touchStart;
          if (Math.abs(delta) > 42) setActive((current) => (delta > 0 ? Math.max(0, current - 1) : Math.min(sortedImages.length - 1, current + 1)));
          setTouchStart(null);
        }}
      >
        <Image src={cloudinaryOptimizedUrl(currentImage.src)} alt={t(currentImage.alt, locale)} fill priority className="h-full w-full object-cover" sizes="(min-width: 900px) 55vw, 100vw" style={productSlug ? { viewTransitionName: `product-image-${productSlug}` } : undefined} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-text/70 to-transparent p-5 text-white">
          <div className="text-sm font-bold">{t(currentImage.title, locale)}</div>
          <div className="mt-1 text-xs text-white/75">{t(currentImage.caption, locale)}</div>
        </div>
        <button
          type="button"
          aria-label="Open product image lightbox"
          onClick={() => {
            setLightbox(active);
            fetch("/api/events", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "gallery_opened",
                entityType: "product_image",
                entityId: currentImage.src,
                locale,
                url: window.location.href,
                referrer: document.referrer || undefined,
                campaignContext: readStoredCampaignContext(),
                metadata: { productTitle, imageType: currentImage.type, title: t(currentImage.title, locale) }
              }),
              keepalive: true
            }).catch((e: unknown) => console.error("[gallery] Failed to track gallery open:", e));
          }}
          className="absolute top-3 grid h-11 w-11 place-items-center rounded-full bg-surface/90 text-foreground shadow-sm sm:top-4 ltr:right-3 rtl:left-3 sm:ltr:right-4 sm:rtl:left-4"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Previous image"
          onClick={() => setActive((current) => (current - 1 + sortedImages.length) % sortedImages.length)}
          className="absolute top-1/2 -translate-y-1/2 hidden grid h-12 w-12 place-items-center rounded-full bg-white/10 backdrop-blur ltr:left-3 rtl:right-3 md:grid"
        >
          <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
        </button>
        <button
          type="button"
          aria-label="Next image"
          onClick={() => setActive((current) => (current + 1) % sortedImages.length)}
          className="absolute top-1/2 -translate-y-1/2 hidden grid h-12 w-12 place-items-center rounded-full bg-white/10 backdrop-blur ltr:right-3 rtl:left-3 md:grid"
        >
          <ChevronRight className="h-6 w-6 rtl:rotate-180" />
        </button>
      </div>
      <div className="no-scrollbar mt-4 flex w-full max-w-full gap-3 overflow-x-auto px-2 pb-2 [scroll-padding-inline:0.5rem]">
        {sortedImages.map((item, index) => (
          <button
            type="button"
            key={`${item.src}-${item.type}-${item.sortOrder}-${index}`}
            aria-label={`Show ${t(item.title, locale)}`}
            onClick={() => setActive(index)}
            className={cn(
              "relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted ring-2 transition sm:h-20 sm:w-24 md:h-24 md:w-32",
              active === index ? "ring-primary" : "ring-transparent"
            )}
          >
            <Image src={cloudinaryOptimizedUrl(item.src, 128)} alt={t(item.alt, locale)} fill className="h-full w-full object-cover" sizes="128px" />
          </button>
        ))}
      </div>
      <Lightbox images={lightboxImages} activeIndex={lightbox} onClose={() => setLightbox(-1)} onSelect={setLightbox} />
    </div>
  );
}
