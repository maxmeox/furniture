"use client";

import Image from "next/image";
import Link from "next/link";
import { Ruler } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { InterestButton } from "./interest-button";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

function compactPriceLabel(label: string, locale: string) {
  if (locale === "ar" && label.includes("المقاس") && label.includes("القماش")) return "حسب المقاس والقماش";
  if (locale === "he" && label.includes("מידה") && label.includes("בד")) return "לפי מידה ובד";
  if (locale !== "ar" && locale !== "he" && label.toLowerCase().includes("size") && label.toLowerCase().includes("fabric")) return "By size & fabric";
  return label;
}

export function ProductCard({
  locale,
  href,
  slug,
  title,
  category,
  image,
  priceLabel,
  badge,
  priority
}: {
  locale: Locale;
  href: string;
  slug: string;
  title: string;
  category: string;
  image: string;
  priceLabel: string;
  badge?: string;
  priority?: boolean;
}) {
  return (
    <article className="theme-card theme-product-card theme-card-3d theme-card-zoom container-query contain-layout group overflow-hidden rounded-[2rem] bg-card shadow-card ring-1 ring-border transition">
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={cloudinaryOptimizedUrl(image)} alt={title} fill className="h-full w-full object-cover transition" sizes="(min-width: 1280px) 350px, (min-width: 768px) 50vw, 100vw" priority={priority} style={{ viewTransitionName: `product-image-${slug}` }} />
          {badge ? <div className="theme-pill absolute top-4 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold text-primary shadow-sm start-4">{badge}</div> : null}
        </div>
      </Link>
      <div className="p-[var(--cq-p,1.25rem)]">
        <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="text-sm font-semibold text-secondary">{category}</div>
          <h3 className="mt-2 text-xl font-bold">{title}</h3>
        </Link>
        <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/70 bg-surface/70 px-2.5 py-1 text-[11px] font-semibold leading-none text-muted-foreground">
          <Ruler className="h-3.5 w-3.5 shrink-0 text-secondary" aria-hidden="true" />
          <span className="truncate">{compactPriceLabel(priceLabel, locale)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <InterestButton
            compact
            item={{
              id: slug,
              type: "product",
              title,
              subtitle: category,
              image,
              href
            }}
          />
        </div>
      </div>
    </article>
  );
}
