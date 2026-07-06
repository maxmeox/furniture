import { getLocale } from "next-intl/server";
import Link from "next/link";

const copy: Record<string, { title: string; description: string; home: string; catalog: string }> = {
  ar: {
    title: "الصفحة غير موجودة",
    description: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. تصفح تصاميم الكتالوج أو عد إلى الصفحة الرئيسية.",
    home: "العودة للرئيسية",
    catalog: "تصفح الكتالوج"
  },
  en: {
    title: "Page not found",
    description: "The page you are looking for does not exist or has been moved. Browse the catalog or return home.",
    home: "Back to home",
    catalog: "Browse catalog"
  },
  he: {
    title: "הדף לא נמצא",
    description: "הדף שחיפשת אינו קיים או הועבר. עיין בקטלוג או חזור לדף הבית.",
    home: "חזרה לדף הבית",
    catalog: "עיון בקטלוג"
  }
};

export default async function LocaleNotFound() {
  const locale = await getLocale();
  const safeLocale = locale === "ar" || locale === "en" || locale === "he" ? locale : "ar";
  const t = copy[safeLocale]!;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="text-7xl font-bold text-muted-foreground/30">404</div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-sm leading-7 text-muted-foreground">{t.description}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/${locale}`}
            className="inline-flex h-11 items-center rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            {t.home}
          </Link>
          <Link
            href={`/${locale}/catalog`}
            className="inline-flex h-11 items-center rounded-2xl border border-border bg-card px-6 text-sm font-bold transition hover:bg-muted"
          >
            {t.catalog}
          </Link>
        </div>
      </div>
    </div>
  );
}
