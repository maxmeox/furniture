import * as Sentry from "@sentry/nextjs";

// Sentry's Feedback CDN bundle bundles zustand with a deprecated default export.
// This warning is emitted by vendor code we cannot fix — suppress it.
if (typeof window !== "undefined") {
  const originalWarn = console.warn;
  console.warn = function (...args: unknown[]) {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("zustand")) return;
    originalWarn.apply(console, args);
  };
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  enabled: process.env.NODE_ENV === "production",
  beforeSend(event) {
    if (event.request) {
      if (event.request.url) {
        try {
          const url = new URL(event.request.url);
          url.search = "";
          event.request.url = url.toString();
        } catch { /* ignore */ }
      }
      delete event.request.cookies;
      delete event.request.data;
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
