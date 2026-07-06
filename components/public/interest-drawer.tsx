"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, X } from "lucide-react";
import { WhatsAppInquiryButton } from "@/components/conversion/whatsapp-inquiry-button";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import { localizedProfileValue, type ShowroomProfile } from "@/lib/showroom-profile";
import { useInterestList } from "./interest-provider";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";

export function InterestBadgeButton() {
  const { count, toggle } = useInterestList();
  return (
    <button
      type="button"
      onClick={toggle}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-card text-foreground shadow-sm ring-1 ring-border transition hover:bg-hover"
      aria-label="Interest list"
    >
      <Heart className="h-4 w-4" />
      {count > 0 ? (
        <span className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function InterestDrawer({ locale, profile }: { locale: string; profile: ShowroomProfile }) {
  const { items, isOpen, close, removeItem, clear, storageUnavailable } = useInterestList();
  const localeKey = locale as Locale;
  const lt = (field: string) => localizedProfileValue(profile, field, localeKey) ?? "";
  const savedText = (count: number) => locale === "ar" ? `${count} عناصر محفوظة` : locale === "he" ? `${count} פריטים שמורים` : `${count} saved items`;
  const closeLabel = locale === "ar" ? "إغلاق القائمة" : locale === "he" ? "סגור רשימת עניין" : "Close";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/35 opacity-100 transition" onClick={close} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="interest-drawer-title"
        className="theme-drawer absolute bottom-0 top-0 w-full max-w-md bg-surface p-5 shadow-2xl transition end-0"
      >
        <div className="flex items-center justify-between gap-3">
            <div>
              <div id="interest-drawer-title" className="text-xl font-bold">{lt("interestDrawerTitle")}</div>
              <div className="text-sm text-muted-foreground">{savedText(items.length)}</div>
            </div>
             <button type="button" onClick={close} aria-label={closeLabel} className="grid h-10 w-10 place-items-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        {storageUnavailable ? (
          <div className="mt-3 rounded-xl bg-theme-warning px-4 py-3 text-sm font-semibold text-theme-warning-contrast" role="alert">
            {locale === "ar" ? "متصفحك لا يدعم التخزين المحلي. القائمة لن تُحفظ بعد إغلاق الصفحة." :
             locale === "he" ? "הדפדפן שלך אינו תומך באחסון מקומי. הרשימה לא תישמר לאחר סגירת הדף." :
             "Your browser does not support local storage. The list will not be saved after closing this page."}
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="theme-card mt-10 rounded-2xl border border-dashed border-border p-8 text-center">
            <Heart className="mx-auto h-8 w-8 text-secondary" />
            <p className="mt-4 text-sm leading-7 text-muted-foreground">{lt("interestDrawerEmpty")}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3 overflow-y-auto pb-40">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="theme-card flex gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                  {item.image ? <Image src={cloudinaryOptimizedUrl(item.image, 80)} alt={item.title} fill className="h-full w-full object-cover" sizes="80px" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  {item.href ? (
                    <Link href={item.href} onClick={close} className="font-bold hover:text-primary">
                      {item.title}
                    </Link>
                  ) : (
                    <div className="font-bold">{item.title}</div>
                  )}
                  {item.subtitle ? <div className="mt-1 text-xs text-muted-foreground">{item.subtitle}</div> : null}
                  <button type="button" onClick={() => removeItem(item.id, item.type)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary">
                    <Trash2 className="h-3.5 w-3.5" />
                    {lt("interestRemoveLabel")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="theme-mobile-cta absolute inset-x-0 bottom-0 border-t border-border bg-surface/95 p-5 backdrop-blur">
          <div className="grid gap-2">
            {items.length > 0 ? (
              <WhatsAppInquiryButton
                locale={locale as Locale}
                className="w-full"
                entity={{ type: "interest_list", id: "interest-list", title: "Interest list", href: `/${locale}/interest-list`, items }}
                label={lt("interestSendLabel")}
              />
            ) : (
              <Button type="button" disabled>{lt("interestSendLabel")}</Button>
            )}
            <Button asChild variant="secondary">
              <Link href={`/${locale}/interest-list`} onClick={close}>
                {lt("interestViewPageLabel")}

              </Link>
            </Button>
            {items.length > 0 ? (
              <button type="button" onClick={clear} className="py-2 text-xs font-bold text-muted-foreground">
                {lt("interestClearLabel")}
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
