"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import { readStoredCampaignContext } from "./use-campaign-context";

const PAGE_VIEW_COOLDOWN = 3000;

export function PageViewTracker({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const lastViewRef = useRef<{ path: string; time: number } | null>(null);

  useEffect(() => {
    const now = Date.now();
    if (lastViewRef.current && lastViewRef.current.path === pathname && now - lastViewRef.current.time < PAGE_VIEW_COOLDOWN) {
      return;
    }
    lastViewRef.current = { path: pathname, time: now };

    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "page_view",
        entityType: "page",
        entityId: pathname,
        locale,
        url: window.location.href,
        referrer: document.referrer || undefined,
        campaignContext: readStoredCampaignContext(),
      }),
      keepalive: true
    }).catch((e: unknown) => console.error("[page-view-tracking]", e instanceof Error ? e.message : e));
  }, [pathname, locale]);

  return null;
}
