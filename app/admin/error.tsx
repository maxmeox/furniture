"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Admin dashboard error:", error);
    }
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="text-6xl">&#9888;</div>
        <h1 className="text-2xl font-bold">حدث خطأ غير متوقع</h1>
        <p className="text-sm leading-7 text-muted-foreground">
          حدث خطأ أثناء تحميل لوحة التحكم. حاول مرة أخرى أو عد إلى الصفحة الرئيسية للوحة.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-11 items-center rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            حاول مرة أخرى
          </button>
          <Link
            href="/admin"
            className="inline-flex h-11 items-center rounded-2xl border border-border bg-card px-6 text-sm font-bold transition hover:bg-muted"
          >
            العودة للوحة التحكم
          </Link>
        </div>
        {error.digest ? <p className="mt-6 text-xs text-muted-foreground/50">Error ID: {error.digest}</p> : null}
      </div>
    </div>
  );
}
