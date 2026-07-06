"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { type Locale } from "@/i18n/routing";
import { categories, galleryItems, t, type CategoryOption, type GalleryItem } from "@/lib/showroom-data";
import { cn } from "@/lib/utils";
import { Lightbox } from "./lightbox";
import { readStoredCampaignContext } from "@/components/conversion/use-campaign-context";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

const all = "all";

export function GalleryBrowser({ locale, itemsData = galleryItems, categoriesData = categories }: { locale: Locale; itemsData?: GalleryItem[]; categoriesData?: readonly CategoryOption[] }) {
  const gt = useTranslations("gallery");
  const [category, setCategory] = useState(all);
  const [lightbox, setLightbox] = useState(-1);
  const filtered = useMemo(() => itemsData.filter((item) => category === all || item.category === category), [category, itemsData]);
  const lightboxImages = filtered.map((item) => ({
    src: item.image,
    alt: t(item.title, locale),
    title: t(item.title, locale),
    caption: t(item.caption, locale)
  }));

  return (
    <div className="mt-8">
      <div className="mb-6 flex flex-wrap gap-2">
        {[{ slug: all, label: gt("all") }, ...categoriesData.map((item) => ({ slug: item.slug, label: t(item.label, locale) }))].map((item) => (
          <button
            type="button"
            key={item.slug}
            onClick={() => setCategory(item.slug)}
            aria-pressed={category === item.slug}
            className={cn("rounded-full px-4 py-2 text-sm font-bold ring-1 ring-border", category === item.slug ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}
          >
            {item.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <div className="text-2xl font-bold">{gt("noMatches")}</div>
          <p className="mt-3 text-sm text-muted-foreground">{gt("noMatchesHint")}</p>
        </div>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {filtered.map((item, index) => (
            <figure key={item.slug} className="mb-5 break-inside-avoid overflow-hidden rounded-[2rem] bg-card shadow-card ring-1 ring-border">
              <button
                type="button"
                aria-label={`Open ${t(item.title, locale)}`}
                onClick={() => {
                  setLightbox(index);
                  fetch("/api/events", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      type: "gallery_opened",
                      entityType: "gallery",
                      entityId: item.slug,
                      locale,
                      url: window.location.href,
                      referrer: document.referrer || undefined,
                      campaignContext: readStoredCampaignContext(),
                      metadata: { title: t(item.title, locale), album: item.album }
                    }),
                    keepalive: true
                  }).catch((e: unknown) => console.error("[gallery-browser] Failed to track gallery open:", e));
                }}
                className="group relative block w-full overflow-hidden text-start"
              >
                <div className={item.tall ? "relative aspect-[4/5]" : "relative aspect-[4/3]"}>
                  <Image src={cloudinaryOptimizedUrl(item.image)} alt={t(item.title, locale)} fill className="h-full w-full object-cover transition duration-500 group-hover:scale-105" sizes="(min-width: 900px) 33vw, 100vw" />
                </div>
                <span className="absolute top-4 grid h-10 w-10 place-items-center rounded-full bg-surface/90 text-foreground end-4">
                  <Maximize2 className="h-4 w-4" />
                </span>
              </button>
              <figcaption className="p-5">
                <div className="text-lg font-bold">{t(item.title, locale)}</div>
                <div className="mt-2 text-sm text-muted-foreground">{t(item.caption, locale)}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      <Lightbox images={lightboxImages} activeIndex={lightbox} onClose={() => setLightbox(-1)} onSelect={setLightbox} />
    </div>
  );
}
