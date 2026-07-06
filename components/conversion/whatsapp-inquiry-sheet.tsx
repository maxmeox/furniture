"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { MessageCircle, X, Clock, Palette, Truck } from "lucide-react";
import type { Locale } from "@/i18n/routing";

declare global {
  interface Window {
    __whatsappSheetSettings?: Record<string, unknown>;
  }
}
import {
  deliveryAreas,
  type InquiryEntity,
  type InquiryType,
} from "@/lib/conversion";
import { normalizeShowroomWhatsApp } from "@/lib/showroom-profile";
import { useFocusTrap } from "./use-focus-trap";
import { useInquirySubmit } from "./use-inquiry-submit";
import { TrustPanel } from "./trust-panel";
import { InquiryForm } from "./inquiry-form";

export function WhatsAppInquirySheet({
  isOpen,
  onClose,
  locale,
  entity,
  selectedFabric,
  popoverRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
  entity: InquiryEntity;
  selectedFabric?: string;
  popoverRef: RefObject<HTMLDivElement | null>;
}) {
  const [deliveryArea, setDeliveryArea] = useState<string>("");
  const deliveryAreaRef = useRef(deliveryArea);

  useEffect(() => { deliveryAreaRef.current = deliveryArea; }, [deliveryArea]);
  const [inquiryType, setInquiryType] = useState<InquiryType>("ask_for_price");
  const [apiDeliveryAreas, setApiDeliveryAreas] = useState<string[]>([]);
  const [fabric, setFabric] = useState(selectedFabric ?? "");
  const [note, setNote] = useState("");
  const [whatsappNumber, setWhatsAppNumber] = useState(
    normalizeShowroomWhatsApp(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER),
  );
  const [messageIntro, setMessageIntro] = useState("");
  const [sheetCopy, setSheetCopy] = useState({ title: "", subtitle: "", send: "" });
  const [isReady, setIsReady] = useState(false);
  const cancelRef = useRef(false);
  const sheetRef = useFocusTrap(isOpen, onClose);
  const t = useTranslations("whatsappSheet");

  const { isSending, showSuccess, handleSubmit } = useInquirySubmit({
    locale,
    entity,
    deliveryArea,
    inquiryType,
    fabric,
    note,
    messageIntro,
    whatsappNumber,
    onClose,
  });

  // Show popover in top layer when isOpen becomes true
  useEffect(() => {
    if (!isOpen || !popoverRef.current) return;
    requestAnimationFrame(() => {
      try { popoverRef.current?.showPopover(); } catch {}
    });
  }, [isOpen, popoverRef]);

  // Sync popover close events (escape, light dismiss) to React state
  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;
    const handler = (e: ToggleEvent) => {
      if (e.newState === "closed") {
        // Defer to avoid race with popover teardown
        setTimeout(() => onClose(), 0);
      }
    };
    el.addEventListener("toggle", handler);
    return () => el.removeEventListener("toggle", handler);
  }, [onClose, popoverRef]);

  // Fetch settings on first open, cache result for subsequent opens
  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current = false;

    async function load() {
      if (window.__whatsappSheetSettings) {
        const cached = window.__whatsappSheetSettings;
        applySettings(cached);
        if (!cancelRef.current) setIsReady(true);
        return;
      }
      try {
        const res = await fetch("/api/settings/public", { cache: "no-store" });
        const data = await res.json() as Record<string, unknown>;
        window.__whatsappSheetSettings = data;
        if (!cancelRef.current) applySettings(data);
      } catch (e: unknown) {
        console.error("[whatsapp-sheet] Failed to fetch settings:", e);
      } finally {
        if (!cancelRef.current) requestAnimationFrame(() => setIsReady(true));
      }
    }

    function applySettings(data: Record<string, unknown>) {
      if (typeof data.whatsappNumber === "string") setWhatsAppNumber(data.whatsappNumber);
      const tpl = data.defaultWhatsAppTemplate as Record<string, string> | undefined;
      if (tpl?.[locale]) setMessageIntro(tpl[locale]);
      const areas = data.deliveryAreas as string[] | undefined;
      if (Array.isArray(areas) && areas.length > 0) {
        setApiDeliveryAreas(areas);
        if (!areas.includes(deliveryAreaRef.current)) setDeliveryArea(areas[0]!);
      }
      const ws = data.whatsappSheet as Record<string, Record<string, string>> | undefined;
      if (ws) {
        setSheetCopy({
          title: ws.title?.[locale] ?? "",
          subtitle: ws.subtitle?.[locale] ?? "",
          send: ws.send?.[locale] ?? "",
        });
      }
    }

    load();
    return () => { cancelRef.current = true; };
  }, [isOpen, locale]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const areas =
    apiDeliveryAreas.length > 0
      ? apiDeliveryAreas
      : Array.from(deliveryAreas);
  const rtl = locale === "ar" || locale === "he";

  const mobileTrust = [
    { icon: Clock, title: t("trustFastResponse") },
    { icon: Palette, title: t("trustFreeConsultation") },
    { icon: Truck, title: t("trustDelivery") },
  ];

  // Body scroll lock while popover is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={popoverRef}
      popover="auto"
      className="fixed inset-0 z-[200] m-0 flex h-full w-full items-center justify-center border-none bg-transparent p-0 outline-none sm:p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("title")}
        tabIndex={-1}
        className="flex w-full max-w-4xl max-h-[100dvh] overflow-hidden rounded-none bg-surface text-foreground shadow-2xl outline-none sm:max-h-[90vh] sm:rounded-[2rem] flex-col sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <TrustPanel entity={entity} sheetCopy={sheetCopy} />

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Mobile header */}
          <div className="sm:hidden flex items-center justify-between p-4 border-b border-border bg-surface">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {sheetCopy.title || t("title")}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  {sheetCopy.subtitle || t("subtitle")}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bg-soft text-muted-foreground hover:bg-border hover:text-foreground transition-colors"
              aria-label={t("close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 sm:pt-8">
            {/* Desktop close */}
            <div className="hidden sm:flex justify-end mb-4">
              <button
                type="button"
                onClick={onClose}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bg-soft text-muted-foreground hover:bg-border hover:text-foreground transition-colors"
                aria-label={t("close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile entity preview */}
            <div className="sm:hidden rounded-2xl bg-bg-soft p-3.5 ring-1 ring-border mb-4">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                {t("selected")}
              </div>
              <div className="font-bold text-foreground text-sm leading-snug">
                {entity.title}
              </div>
              {entity.code ? (
                <div className="mt-0.5 text-[11px] text-muted-foreground font-mono">
                  {entity.code}
                </div>
              ) : null}
            </div>

            {/* Mobile trust indicators */}
            <div className="sm:hidden flex gap-3 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-hide">
              {mobileTrust.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 shrink-0 rounded-xl bg-bg-soft px-3 py-2 ring-1 ring-border"
                >
                  <item.icon className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[11px] font-medium text-foreground whitespace-nowrap">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>

            <InquiryForm
              locale={locale}
              deliveryArea={deliveryArea}
              setDeliveryArea={setDeliveryArea}
              inquiryType={inquiryType}
              setInquiryType={setInquiryType}
              areas={areas}
              fabric={fabric}
              setFabric={setFabric}
              note={note}
              setNote={setNote}
              rtl={rtl}
            />
          </div>

          {/* Sticky CTA footer */}
          <div className="shrink-0 p-4 sm:p-6 border-t border-border bg-surface">
            {showSuccess ? (
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="flex h-12 items-center justify-center gap-2 rounded-full bg-success text-success-contrast text-sm font-bold"
              >
                <MessageCircle className="h-5 w-5" />
                {t("success")}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSending || !isReady}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <span className="reduced-motion:hidden">
                      <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                    </span>
                    <span
                      className="hidden reduced-motion:inline h-4 w-4 text-center"
                      aria-hidden="true"
                    >
                      ⟳
                    </span>
                    {sheetCopy.send || t("sending")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    {sheetCopy.send || t("send")}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
