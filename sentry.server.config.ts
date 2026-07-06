import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
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
