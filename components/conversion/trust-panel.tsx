"use client";

import { useTranslations } from "next-intl";
import { Clock, Truck, Palette, ShieldCheck, MessageCircle } from "lucide-react";
import type { InquiryEntity } from "@/lib/conversion";

interface TrustPanelProps {
  entity: InquiryEntity;
  sheetCopy: { title: string; subtitle: string; send: string };
}

export function TrustPanel({ entity, sheetCopy }: TrustPanelProps) {
  const t = useTranslations("whatsappSheet");

  const trustItems = [
    { icon: Clock, title: t("trustFastResponse"), desc: t("trustFastResponseDesc") },
    { icon: Palette, title: t("trustFreeConsultation"), desc: t("trustFreeConsultationDesc") },
    { icon: Truck, title: t("trustDelivery"), desc: t("trustDeliveryDesc") },
    { icon: ShieldCheck, title: t("trustQuality"), desc: t("trustQualityDesc") },
  ];

  return (
    <div className="hidden sm:flex sm:w-[45%] flex-col justify-between bg-gradient-to-br from-bg-warm to-bg-soft p-8 border-e border-border">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-tight">{sheetCopy.title || t("title")}</h2>
            <p className="text-xs text-muted-foreground">{sheetCopy.subtitle || t("subtitle")}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-surface p-4 ring-1 ring-border shadow-sm mb-6">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{t("selected")}</div>
          <div className="font-bold text-foreground text-sm leading-snug">{entity.title}</div>
          {entity.code ? <div className="mt-0.5 text-xs text-muted-foreground font-mono">{entity.code}</div> : null}
        </div>

        <div className="space-y-4">
          {trustItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success-contrast" />
          <span>{t("secure")}</span>
        </div>
      </div>
    </div>
  );
}
