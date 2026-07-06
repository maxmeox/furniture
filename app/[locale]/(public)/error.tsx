"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

type ErrorCopy = { title: string; description: string; retry: string; home: string; catalog: string };

const copy: Record<string, ErrorCopy> = {
  ar: {
    title: "حدث خطأ غير متوقع",
    description: "تعذر تحميل هذه الصفحة. حاول مرة أخرى أو عد إلى الصفحة الرئيسية.",
    retry: "حاول مرة أخرى",
    home: "العودة للرئيسية",
    catalog: "تصفح الكتالوج",
  },
  en: {
    title: "Something went wrong",
    description: "Could not load this page. Please try again or return to the homepage.",
    retry: "Try again",
    home: "Back to home",
    catalog: "Browse catalog",
  },
  he: {
    title: "שגיאה לא צפויה",
    description: "לא ניתן לטעון את הדף. אנא נסה שוב או חזור לדף הבית.",
    retry: "נסה שוב",
    home: "חזרה לדף הבית",
    catalog: "עיון בקטלוג",
  },
};

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale ?? "ar";
  const safeLocale = locale === "ar" || locale === "en" || locale === "he" ? locale : "ar";
  const t = copy[safeLocale]!;

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Unhandled public page error:", error);
    }
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="text-6xl">&#9888;</div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-sm leading-7 text-muted-foreground">{t.description}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex h-11 items-center rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            {t.retry}
          </button>
          <Link
            href={`/${safeLocale}`}
            className="inline-flex h-11 items-center rounded-2xl border border-border bg-card px-6 text-sm font-bold transition hover:bg-muted"
          >
            {t.home}
          </Link>
          <Link
            href={`/${safeLocale}/catalog`}
            className="inline-flex h-11 items-center rounded-2xl border border-border bg-card px-6 text-sm font-bold transition hover:bg-muted"
          >
            {t.catalog}
          </Link>
        </div>
      </div>
    </div>
  );
}
