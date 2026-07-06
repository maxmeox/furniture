import { defineRouting } from "next-intl/routing";

export const locales = ["ar", "en", "he"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: false
});

export const localeLabels: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  he: "עברית"
};

export const localeDirections: Record<Locale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
  he: "rtl"
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
