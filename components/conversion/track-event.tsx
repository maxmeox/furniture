"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/routing";
import { readStoredCampaignContext } from "./use-campaign-context";

export function TrackEvent({
  type,
  entityType,
  entityId,
  locale,
  metadata
}: {
  type: string;
  entityType?: string;
  entityId?: string;
  locale: Locale;
  metadata?: Record<string, unknown>;
}) {
  useEffect(() => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        entityType,
        entityId,
        locale,
        url: window.location.href,
        referrer: document.referrer || undefined,
        campaignContext: readStoredCampaignContext(),
        metadata
      }),
      keepalive: true
    }).catch((e: unknown) => console.error("[track-event] Failed to send event:", e));
  }, [entityId, entityType, locale, metadata, type]);

  return null;
}
