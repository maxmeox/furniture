"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { WhatsAppInquiryButton } from "@/components/conversion/whatsapp-inquiry-button";
import { type Locale } from "@/i18n/routing";
import { fabrics, t, type Fabric } from "@/lib/showroom-data";
import { InterestButton } from "./interest-button";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

const all = "all";

export function FabricsBrowser({ locale, fabricsData = fabrics }: { locale: Locale; fabricsData?: Fabric[] }) {
  const ft = useTranslations("fabrics");
  const [family, setFamily] = useState(all);
  const [type, setType] = useState(all);
  const families = [all, ...Array.from(new Set(fabricsData.map((fabric) => t(fabric.family, locale)).filter(Boolean)))];
  const types = [all, ...Array.from(new Set(fabricsData.map((fabric) => t(fabric.type, locale)).filter(Boolean)))];

  const filtered = useMemo(
    () =>
      fabricsData.filter((fabric) => {
        if (family !== all && t(fabric.family, locale) !== family) return false;
        if (type !== all && t(fabric.type, locale) !== type) return false;
        return true;
      }),
    [fabricsData, family, locale, type]
  );

  return (
    <div className="mt-8">
      <div className="mb-6 flex flex-wrap gap-3">
        {families.map((item) => (
          <button key={item} type="button" onClick={() => setFamily(item)} aria-pressed={family === item} className={family === item ? "rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground" : "rounded-full bg-card px-4 py-2 text-sm font-bold text-muted-foreground ring-1 ring-border"}>
            {item === all ? ft("allColors") : item}
          </button>
        ))}
        {types.map((item) => (
          <button key={item} type="button" onClick={() => setType(item)} aria-pressed={type === item} className={type === item ? "rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground" : "rounded-full bg-card px-4 py-2 text-sm font-bold text-muted-foreground ring-1 ring-border"}>
            {item === all ? ft("allTypes") : item}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <div className="text-2xl font-bold">{ft("noMatches")}</div>
          <p className="mt-3 text-sm text-muted-foreground">{ft("noMatchesHint")}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((fabric) => (
            <article key={fabric.slug} className="overflow-hidden rounded-[2rem] bg-card shadow-card ring-1 ring-border">
              <div className="relative aspect-square">
                <Image src={cloudinaryOptimizedUrl(fabric.image)} alt={t(fabric.name, locale)} fill className="h-full w-full object-cover" sizes="(min-width: 900px) 33vw, 100vw" />
                <span className="absolute top-4 rounded-full bg-surface/90 px-3 py-1 text-xs font-bold text-primary start-4">{fabric.code}</span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full ring-1 ring-border" style={{ backgroundColor: fabric.color }} aria-label={t(fabric.name, locale)} />
                  <span className="text-sm font-bold text-secondary">{t(fabric.family, locale)}</span>
                </div>
                <h3 className="mt-3 text-xl font-bold">{t(fabric.name, locale)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(fabric.type, locale)} · {t(fabric.availability, locale)}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <InterestButton compact item={{ id: fabric.slug, type: "fabric", title: t(fabric.name, locale), subtitle: fabric.code, image: fabric.image }} />
                  <WhatsAppInquiryButton locale={locale} variant="secondary" size="sm" entity={{ type: "fabric", id: fabric.slug, title: t(fabric.name, locale), code: fabric.code, href: `/${locale}/fabrics`, image: fabric.image }} selectedFabric={`${t(fabric.name, locale)} ${fabric.code}`} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
