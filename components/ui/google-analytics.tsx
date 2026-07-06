"use client";

import { useEffect } from "react";

/**
 * Loads Google Analytics completely post-hydration via native DOM APIs.
 * Zero SSR involvement — eliminates any possibility of hydration mismatch.
 *
 * Uses the same privacy-respecting configuration as the previous implementation:
 * - allow_google_signals: false
 * - allow_ad_personalization_signals: false
 */
export function GoogleAnalyticsScript({ gaId }: { gaId: string }) {
  useEffect(() => {
    if (typeof window === "undefined" || !gaId) return;

    // Prevent duplicate injection (React strict mode double-mount safety)
    if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) return;

    // Inject gtag script
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    const initScript = document.createElement("script");
    initScript.textContent = `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${gaId}', {send_page_view: true, allow_google_signals: false, allow_ad_personalization_signals: false});`;
    document.head.appendChild(initScript);
  }, [gaId]);

  return null;
}