"use client";

import { useCallback, useEffect, useRef } from "react";

const POLL_INTERVAL_MS = 30_000;

export function AdminLeadPoller() {
  const lastCountRef = useRef(0);

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/leads/new-count", { cache: "no-store" });
      if (!res.ok) return;
      const data: { count: number } = await res.json();

      if (lastCountRef.current === 0) {
        lastCountRef.current = data.count;
        return;
      }

      if (data.count > lastCountRef.current) {
        lastCountRef.current = data.count;
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("🔔 استفسار جديد", {
            body: `لديك ${data.count} استفسار جديد`,
            icon: "/favicon.png",
          });
        }
      }
      lastCountRef.current = data.count;
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [check]);

  return null;
}
