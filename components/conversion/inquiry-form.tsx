"use client";

import { useTranslations } from "next-intl";
import { MapPin, ChevronDown, Sparkles } from "lucide-react";
import {
  getDeliveryAreaLabel,
  inquiryTypeLabels,
  inquiryTypes,
  type InquiryType,
} from "@/lib/conversion";
import type { Locale } from "@/i18n/routing";

interface InquiryFormProps {
  locale: Locale;
  deliveryArea: string;
  setDeliveryArea: (value: string) => void;
  inquiryType: InquiryType;
  setInquiryType: (value: InquiryType) => void;
  areas: string[];
  fabric: string;
  setFabric: (value: string) => void;
  note: string;
  setNote: (value: string) => void;
  rtl: boolean;
}

export function InquiryForm({
  locale,
  deliveryArea,
  setDeliveryArea,
  inquiryType,
  setInquiryType,
  areas,
  fabric,
  setFabric,
  note,
  setNote,
  rtl,
}: InquiryFormProps) {
  const t = useTranslations("whatsappSheet");

  return (
    <div className="space-y-4">
      <div>
        <label
          id="inquiry-group-label"
          className="mb-1.5 flex items-center gap-2 text-sm font-bold text-foreground"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {t("step1")}
          </span>
          {t("inquiry")}
        </label>
        <div
          role="radiogroup"
          aria-labelledby="inquiry-group-label"
          aria-required="true"
          className="grid grid-cols-2 gap-2"
        >
          {inquiryTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setInquiryType(type)}
              className={`relative flex items-center gap-2 rounded-xl border px-3 py-3 text-sm transition-all ${
                inquiryType === type
                  ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary"
                  : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-bg-soft"
              }`}
            >
              {inquiryType === type && <Sparkles className="h-3.5 w-3.5 shrink-0" />}
              <span className="leading-tight">{inquiryTypeLabels[locale][type]}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 flex items-center gap-2 text-sm font-bold text-foreground">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {t("step2")}
          </span>
          {t("delivery")}
        </label>
        <div className="relative">
          <MapPin className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            value={deliveryArea}
            onChange={(e) => setDeliveryArea(e.target.value)}
            aria-required="true"
            className="h-12 w-full appearance-none rounded-2xl border border-border bg-surface ps-10 pe-10 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring cursor-pointer"
            dir={rtl ? "rtl" : "ltr"}
          >
            {areas.map((area) => (
              <option key={area} value={area}>
                {getDeliveryAreaLabel(area, locale)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div>
        <label
          htmlFor="whatsapp-fabric"
          className="mb-1.5 block text-sm font-bold text-foreground"
        >
          {t("fabric")}
        </label>
        <input
          id="whatsapp-fabric"
          value={fabric}
          onChange={(e) => setFabric(e.target.value)}
          className="h-12 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60"
          placeholder={t("fabricPlaceholder")}
          dir={rtl ? "rtl" : "ltr"}
          autoComplete="off"
        />
      </div>

      <div>
        <label
          htmlFor="whatsapp-note"
          className="mb-1.5 block text-sm font-bold text-foreground"
        >
          {t("note")}
        </label>
        <textarea
          id="whatsapp-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={240}
          rows={2}
          className="w-full resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60 field-sizing-content"
          placeholder={t("notePlaceholder")}
          dir={rtl ? "rtl" : "ltr"}
          autoComplete="off"
        />
        <div className="mt-1 text-[10px] text-muted-foreground text-end">
          {note.length}/240
        </div>
      </div>
    </div>
  );
}
