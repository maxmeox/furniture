"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

type ErrorCopy = { title: string; description: string; retry: string; back: string };

const copy: Record<string, ErrorCopy> = {
  ar: {
    title: "تعذر تحميل المنتج",
    description: "لم نتمكن من عرض هذا المنتج حالياً. حاول مرة أخرى أو تصفح المنتجات الأخرى.",
    retry: "حاول مرة أخرى",
    back: "العودة للكتالوج",
  },
  en: {
    title: "Could not load product",
    description: "Unable to display this product right now. Please try again or browse other products.",
    retry: "Try again",
    back: "Back to catalog",
  },
  he: {
    title: "לא ניתן לטעון את המוצר",
    description: "לא ניתן להציג מוצר זה כעת. אנא נסה שוב או עיין במוצרים אחרים.",
    retry: "נסה שוב",
    back: "חזרה לקטלוג",
  },
};

export default function ProductError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ locale?: string }>();
  const locale = params.locale ?? "ar";
  const safeLocale = locale === "ar" || locale === "en" || locale === "he" ? locale : "ar";
  const t = copy[safeLocale]!;

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Product page error:", error);
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
            href={`/${safeLocale}/catalog`}
            className="inline-flex h-11 items-center rounded-2xl border border-border bg-card px-6 text-sm font-bold transition hover:bg-muted"
          >
            {t.back}
          </Link>
        </div>
      </div>
    </div>
  );
}
