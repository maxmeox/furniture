"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { attributionStorageKey, hasCampaignContext, readCampaignContextFromUrl } from "@/lib/attribution";

export function AttributionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const context = readCampaignContextFromUrl(new URL(window.location.href));
    if (hasCampaignContext(context)) {
      window.sessionStorage.setItem(attributionStorageKey, JSON.stringify(context));
    }
  }, [pathname]);

  return children;
}
