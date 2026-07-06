"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, Brush, GalleryHorizontal, Home, Inbox, Megaphone, Percent, Settings, Sofa } from "lucide-react";

export const adminNavItems = [
  ["لوحة التحكم", "/admin", Home],
  ["المنتجات", "/admin/products", Sofa],
  ["التصنيفات", "/admin/categories", Boxes],
  ["الأقمشة", "/admin/fabrics", Brush],
  ["العروض", "/admin/offers", Percent],
  ["الحملات", "/admin/campaigns", Megaphone],
  ["المعرض", "/admin/gallery", GalleryHorizontal],
  ["العملاء", "/admin/leads", Inbox],
  ["الإحصائيات", "/admin/analytics", BarChart3],
  ["الإعدادات", "/admin/settings", Settings]
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen border-s border-border bg-surface p-5 xl:block">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:right-3 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-primary-foreground">
        تخطي إلى المحتوى
      </a>
      <div className="mb-8 text-xl font-bold">معرض المفروشات</div>
      <nav className="space-y-1">
        {adminNavItems.map(([label, href, Icon]) => {
          const isCurrent = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                isCurrent
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
