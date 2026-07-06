import type { CampaignContext } from "./conversion";

export const attributionStorageKey = "furniture-showroom-campaign-context";

export function readCampaignContextFromUrl(url: URL): CampaignContext {
  const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid"] as const;
  return keys.reduce<CampaignContext>((context, key) => {
    const value = url.searchParams.get(key);
    if (value) context[key] = value;
    return context;
  }, {});
}

export function hasCampaignContext(context: CampaignContext) {
  return Boolean(context.utm_source || context.utm_medium || context.utm_campaign || context.utm_content || context.fbclid);
}
