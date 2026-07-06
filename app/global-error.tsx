"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { tenant } from "@/lib/tenant";

type ErrorLang = "ar" | "en" | "he";

const fallbackLang: ErrorLang = "ar";

const t: Record<ErrorLang, { title: string; body: string; retry: string }> = {
  ar: {
    title: "حدث خطأ غير متوقع",
    body: "نأسف، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
    retry: "حاول مرة أخرى"
  },
  en: {
    title: "Something went wrong",
    body: "Sorry, an unexpected error occurred. Please try again.",
    retry: "Try again"
  },
  he: {
    title: "שגיאה בלתי צפויה",
    body: "מצטערים, אירעה שגיאה בלתי צפויה. אנא נסו שוב.",
    retry: "נסה שוב"
  }
};

function detectLang(): ErrorLang {
  if (typeof navigator === "undefined") return fallbackLang;
  const code = navigator.language.split("-")[0];
  return code === "en" || code === "he" ? code : fallbackLang;
}

const isRtl = (lang: ErrorLang) => lang === "ar" || lang === "he";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const lang = detectLang();
  const rtl = isRtl(lang);

  return (
    <html lang={lang} dir={rtl ? "rtl" : "ltr"}>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8f3ea] px-4 text-center">
          <div className="text-7xl font-black tracking-tight text-[#2f261f]/15 select-none">
            {lang === "he" ? tenant.identity.nameHe : tenant.identity.nameAr}
          </div>
          <h1 className="text-3xl font-bold text-[#2f261f]">{t[lang].title}</h1>
          <p className="max-w-md text-sm leading-relaxed text-[#746455]">{t[lang].body}</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#6f4f2f] px-6 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(111,79,47,0.22)] transition hover:bg-[#5e4228]"
          >
            {t[lang].retry}
          </button>
        </div>
      </body>
    </html>
  );
}
