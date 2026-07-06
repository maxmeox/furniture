"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { localeLabels, locales, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("lang");

  return (
    <div className="inline-flex rounded-full bg-card p-1 shadow-sm ring-1 ring-border" role="group" aria-label={t("switcher")}>
      {locales.map((target) => {
        const href = pathname.replace(new RegExp(`^/${locale}`), `/${target}`);
        return (
          <Link
            key={target}
            href={href}
            hrefLang={target}
            aria-current={target === locale ? "page" : undefined}
            className={cn(
              "rounded-full px-2.5 py-1.5 text-xs font-semibold transition sm:px-3",
              target === locale
                ? "bg-primary !text-white hover:!text-white focus-visible:!text-white [&_span]:!text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="sm:hidden">{target.toUpperCase()}</span>
            <span className="hidden sm:inline">{localeLabels[target]}</span>
          </Link>
        );
      })}
    </div>
  );
}
