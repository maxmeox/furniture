"use client";

import Image from "next/image";
import Link from "next/link";
import { Share2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { WhatsAppInquiryButton } from "@/components/conversion/whatsapp-inquiry-button";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { useInterestList } from "./interest-provider";
import { buildWhatsAppMessage } from "@/lib/conversion";
import { formatWhatsAppLink } from "@/lib/utils";
import { normalizeShowroomWhatsApp } from "@/lib/showroom-profile";
import { readStoredCampaignContext } from "@/components/conversion/use-campaign-context";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

type InterestListLabels = {
  emptyTitle?: string;
  emptyText?: string;
  browse?: string;
  send?: string;
  clear?: string;
  remove?: string;
  share?: string;
};

export function InterestListPageClient({ locale, settingsCopy }: { locale: string; settingsCopy?: InterestListLabels }) {
  const { items, removeItem, clear } = useInterestList();
  const t = useTranslations("interest");
  const labels = {
    emptyTitle: settingsCopy?.emptyTitle ?? t("emptyTitle"),
    emptyText: settingsCopy?.emptyText ?? t("emptyText"),
    browse: settingsCopy?.browse ?? t("browse"),
    saved: (count: number) => t("itemsSaved", { count }),
    send: settingsCopy?.send ?? t("send"),
    clear: settingsCopy?.clear ?? t("clear"),
    remove: settingsCopy?.remove ?? t("remove"),
    share: settingsCopy?.share ?? t("share"),
  };

  function shareList() {
    const whatsapp = normalizeShowroomWhatsApp(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
    const message = buildWhatsAppMessage({
      locale: locale as Locale,
      entity: { type: "interest_list", id: "interest-list", title: "Interest list", href: `/${locale}/interest-list`, items },
      deliveryArea: "Other",
      inquiryType: "general",
      sourcePageUrl: typeof window !== "undefined" ? window.location.href : "",
      campaignContext: readStoredCampaignContext(),
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    });
    window.open(formatWhatsAppLink(whatsapp, message), "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mt-8">
      {items.length === 0 ? (
        <div className="theme-card rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <div className="text-2xl font-bold">{labels.emptyTitle}</div>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{labels.emptyText}</p>
          <Button asChild className="mt-6">
            <Link href={`/${locale}/catalog`}>{labels.browse}</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm font-bold text-muted-foreground">{labels.saved(items.length)}</div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={shareList}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">{labels.share}</span>
              </button>
              <WhatsAppInquiryButton locale={locale as Locale} size="sm" entity={{ type: "interest_list", id: "interest-list", title: "Interest list", href: `/${locale}/interest-list`, items }} label={labels.send} />
              <button type="button" onClick={clear} className="text-sm font-bold text-primary">
                {labels.clear}
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="theme-card flex gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                  {item.image ? <Image src={cloudinaryOptimizedUrl(item.image, 96)} alt={item.title} fill className="h-full w-full object-cover" sizes="96px" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  {item.href ? (
                    <Link href={item.href} className="text-lg font-bold hover:text-primary">
                      {item.title}
                    </Link>
                  ) : (
                    <div className="text-lg font-bold">{item.title}</div>
                  )}
                  {item.subtitle ? <div className="mt-1 text-sm text-muted-foreground">{item.subtitle}</div> : null}
                  <button type="button" onClick={() => removeItem(item.id, item.type)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
                    <Trash2 className="h-4 w-4" />
                    {labels.remove}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
