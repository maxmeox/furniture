import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { appUrl } from "@/lib/constants";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  locale: string;
  className?: string;
}

export async function Breadcrumbs({ items, locale, className }: BreadcrumbsProps) {
  const t = await getTranslations("nav");
  const isRtl = locale === "ar" || locale === "he";
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  if (items.length === 0) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href
        ? `${appUrl}${item.href}`
        : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav aria-label={t("breadcrumb")} className={cn("container-shell py-4", className)}>
        <ol
          className={cn(
            "flex items-center gap-1.5 text-sm text-muted-foreground",
            isRtl ? "flex-row-reverse" : "flex-row"
          )}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.label} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <Chevron
                    className="h-3.5 w-3.5 shrink-0 opacity-50"
                    aria-hidden="true"
                  />
                ) : null}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 truncate rounded-lg px-1.5 py-0.5 transition hover:text-foreground hover:bg-muted"
                  >
                    {index === 0 ? (
                      <Home className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    ) : null}
                    <span className="truncate max-w-[120px] sm:max-w-[200px]">
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <span className="truncate font-semibold text-foreground max-w-[120px] sm:max-w-[200px]">
                    {index === 0 ? null : null}
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
