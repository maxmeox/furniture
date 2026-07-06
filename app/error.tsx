"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Root-level error:", error);
    }
    Sentry.captureException(error);
  }, [error]);

  const lang = typeof navigator !== "undefined" ? navigator.language.split("-")[0] : "ar";
  const rtl = lang === "ar" || lang === "he";
  const code = lang === "en" ? "en" : lang === "he" ? "he" : "ar";

  return (
    <html lang={code} dir={rtl ? "rtl" : "ltr"}>
      <body className="m-0 bg-[#f8f3ea] font-sans text-[#2f261f]">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="mx-auto max-w-md space-y-6 text-center">
            <div className="text-6xl">&#9888;</div>
            <h1 className="text-2xl font-bold">
              {code === "ar" ? "حدث خطأ غير متوقع" : code === "he" ? "אירעה שגיאה בלתי צפויה" : "Something went wrong"}
            </h1>
            <p className="text-sm leading-7 text-[#746455]">
              {code === "ar" ? "يرجى المحاولة مرة أخرى أو العودة للرئيسية." : code === "he" ? "אנא נסה שוב או חזור לדף הבית." : "Please try again or return to the homepage."}
            </p>
            {error.digest ? (
              <p className="text-xs text-[#746455]/50">Error ID: {error.digest}</p>
            ) : null}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={reset}
                className="inline-flex h-11 items-center rounded-2xl bg-[#6f4f2f] px-6 text-sm font-bold text-[#fffaf2] transition hover:opacity-90"
              >
                {code === "ar" ? "حاول مرة أخرى" : code === "he" ? "נסה שוב" : "Try again"}
              </button>
              <a
                href={`/${code}`}
                className="inline-flex h-11 items-center rounded-2xl border border-[#ded0bd] bg-[#fffaf2] px-6 text-sm font-bold transition hover:bg-[#ebe0d1]"
              >
                {code === "ar" ? "العودة للرئيسية" : code === "he" ? "חזרה לדף הבית" : "Back to home"}
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
