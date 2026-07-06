"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { adminNavItems } from "./admin-sidebar";

export function AdminTopbar() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-bg-soft/95 px-3 py-3 backdrop-blur sm:px-5 xl:static xl:px-6">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-bold">إدارة الكتالوج</div>
          <div className="truncate text-xs text-muted-foreground">جاهز لإدارة المنتجات، العملاء، والحملات</div>
        </div>
        <form action={logoutAdmin} className="shrink-0">
          <Button type="submit" variant="secondary" size="sm">تسجيل الخروج</Button>
        </form>
      </div>
      <nav className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 xl:hidden">
        {adminNavItems.map(([label, href, Icon]) => {
          const isCurrent = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isCurrent ? "page" : undefined}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 ring-border transition ${
                isCurrent
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
