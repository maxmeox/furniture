"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { ShowroomProfile } from "@/lib/showroom-profile";
import { SearchCommand, type SearchItem } from "@/components/ui/search-command";
import { getSearchItems } from "@/app/actions/public/search";
import { cn } from "@/lib/utils";
import { InterestBadgeButton } from "./interest-drawer";
import { LanguageSwitcher } from "./language-switcher";
import { MobileNav } from "./mobile-nav";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

export function PublicHeader({ locale, profile }: { locale: string; profile: ShowroomProfile }) {
  const t = useTranslations("nav");
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const searchFetched = useRef(false);

  useEffect(() => {
    if (searchFetched.current) return;
    searchFetched.current = true;
    getSearchItems(locale).then(setSearchItems).catch((e: unknown) => console.error("[search] Failed to load:", e));
  }, [locale]);
  const links = [
    "catalog",
    profile.showFabrics ? "fabrics" : null,
    profile.showOffers ? "offers" : null,
    profile.showGallery ? "gallery" : null,
    "contact"
  ].filter(Boolean) as Array<"catalog" | "fabrics" | "offers" | "gallery" | "contact">;
  const alt = locale === "en" ? profile.nameEn : locale === "he" ? profile.nameHe : profile.nameAr;

  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY < 60) {
            setHeaderVisible(true);
          } else if (currentY > lastScrollY.current + 10) {
            setHeaderVisible(false);
          } else if (currentY < lastScrollY.current - 10) {
            setHeaderVisible(true);
          }
          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const headerLabel = t("headerLabel");

  return (
    <header
      role="banner"
      aria-label={headerLabel}
      className={cn(
        "theme-header sticky top-0 z-40 border-b border-border/70 bg-bg-soft/88 backdrop-blur-xl transition-transform duration-300 ease-out",
        headerVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container-shell flex h-20 items-center justify-between gap-3 sm:gap-5">
        <Link href={`/${locale}`} className="leading-tight">
          <Image
            src={cloudinaryOptimizedUrl(profile.logoPath || "/images/brand/logo.png", 320)}
            alt={alt}
            width={640}
            height={160}
            priority
            fetchPriority="high"
            className="h-auto max-h-16 w-[120px] object-contain sm:w-[190px] md:max-h-[76px] md:w-[304px] lg:w-[320px]"
            sizes="(min-width: 1024px) 320px, (min-width: 768px) 304px, (min-width: 640px) 190px, 120px"
          />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label={t("navLabel")}>
          {links.map((item) => (
            <Link
              key={item}
              href={`/${locale}/${item}`}
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-card hover:text-foreground"
            >
              {t(item)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <SearchCommand
            locale={locale}
            items={searchItems}
            placeholder={
              locale === "ar" ? "ابحث عن منتج..." : locale === "he" ? "חפש מוצר..." : "Search products..."
            }
            emptyText={
              locale === "ar" ? "لا توجد نتائج" : locale === "he" ? "אין תוצאות" : "No results found"
            }
          />
          <InterestBadgeButton />
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <MobileNav locale={locale} links={links} />
        </div>
      </div>
    </header>
  );
}
