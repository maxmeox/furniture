"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildWhatsAppMessage } from "@/lib/conversion";
import { formatWhatsAppLink } from "@/lib/utils";
import { readStoredCampaignContext } from "./use-campaign-context";
import type { Locale } from "@/i18n/routing";
import type { InquiryEntity, InquiryType } from "@/lib/conversion";

interface UseInquirySubmitInput {
  locale: Locale;
  entity: InquiryEntity;
  deliveryArea: string;
  inquiryType: InquiryType;
  fabric: string;
  note: string;
  messageIntro: string;
  whatsappNumber: string;
  onClose: () => void;
}

export function useInquirySubmit({
  locale,
  entity,
  deliveryArea,
  inquiryType,
  fabric,
  note,
  messageIntro,
  whatsappNumber,
  onClose,
}: UseInquirySubmitInput) {
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSending(true);
    setSubmitError(null);

    const campaignContext = readStoredCampaignContext();
    const sourcePageUrl = window.location.href;
    const referrer = document.referrer || undefined;

    const generatedMessage = buildWhatsAppMessage({
      locale,
      entity,
      deliveryArea,
      inquiryType,
      selectedFabric: fabric || undefined,
      note: note || undefined,
      sourcePageUrl,
      referrer,
      campaignContext,
      messageIntro,
    });

    const waLink = formatWhatsAppLink(whatsappNumber, generatedMessage);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          entity,
          deliveryArea,
          inquiryType,
          selectedFabric: fabric || undefined,
          note: note || undefined,
          sourcePageUrl,
          referrer,
          campaignContext,
          generatedMessage,
        }),
      });

      if (!res.ok) {
        console.error("[lead-submit] API returned", res.status, await res.text().catch(() => ""));
      }
    } catch (e) {
      console.error("[lead-submit] Network error saving lead:", e);
    }

    window.open(waLink, "_blank", "noopener,noreferrer");

    setShowSuccess(true);
    timeoutRef.current = setTimeout(() => {
      onClose();
      setIsSending(false);
      setShowSuccess(false);
    }, 1200);
  }, [
    locale,
    entity,
    deliveryArea,
    inquiryType,
    fabric,
    note,
    messageIntro,
    whatsappNumber,
    onClose,
  ]);

  return { isSending, showSuccess, submitError, handleSubmit };
}
