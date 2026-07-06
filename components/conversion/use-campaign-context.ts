"use client";

import { attributionStorageKey, hasCampaignContext, readCampaignContextFromUrl } from "@/lib/attribution";
import type { CampaignContext } from "@/lib/conversion";

export function readStoredCampaignContext(): CampaignContext {
  const fromUrl = readCampaignContextFromUrl(new URL(window.location.href));
  if (hasCampaignContext(fromUrl)) return fromUrl;

  if (document.referrer) {
    try {
      const fromReferrer = readCampaignContextFromUrl(new URL(document.referrer));
      if (hasCampaignContext(fromReferrer)) return fromReferrer;
    } catch {
      // Ignore malformed referrers and continue through stored attribution.
    }
  }

  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      const raw = storage.getItem(attributionStorageKey);
      if (raw) return JSON.parse(raw) as CampaignContext;
    } catch {
      continue;
    }
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("furniture_showroom_campaign_context="))
    ?.split("=")[1];

  if (cookie) {
    try {
      return JSON.parse(decodeURIComponent(cookie)) as CampaignContext;
    } catch {
      return {};
    }
  }

  return {};
}
