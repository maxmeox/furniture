"use client";

import { useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/routing";
import type { InquiryEntity } from "@/lib/conversion";
import { readStoredCampaignContext } from "./use-campaign-context";
import { WhatsAppInquirySheet } from "./whatsapp-inquiry-sheet";

export function WhatsAppInquiryButton({
  locale,
  entity,
  selectedFabric,
  className,
  variant = "primary",
  size = "md",
  label
}: {
  locale: Locale;
  entity: InquiryEntity;
  selectedFabric?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  function openSheet() {
    setIsOpen(true);
    if (entity.type === "fabric") {
      fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "fabric_selected",
          entityType: "fabric",
          entityId: entity.id,
          locale,
          url: window.location.href,
          referrer: document.referrer || undefined,
          campaignContext: readStoredCampaignContext(),
          metadata: { title: entity.title, code: entity.code }
        }),
        keepalive: true
      }).catch((e: unknown) => console.error("[whatsapp-btn] Failed to track fabric selection:", e));
    }
  }

  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} onClick={openSheet}>
        <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
        {label ?? "WhatsApp"}
      </Button>
      <WhatsAppInquirySheet isOpen={isOpen} onClose={() => setIsOpen(false)} locale={locale} entity={entity} selectedFabric={selectedFabric} popoverRef={popoverRef} />
    </>
  );
}
