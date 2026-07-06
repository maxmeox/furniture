"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { useTransitionMount } from "./use-transition-mount";

type NavLink = "catalog" | "fabrics" | "offers" | "gallery" | "contact";

export function MobileNav({ locale, links }: { locale: string; links: NavLink[] }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isRtl = locale === "ar" || locale === "he";
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { mounted, isVisible, isExiting } = useTransitionMount(isOpen, 250);
  const slideDir = isRtl ? "-100%" : "100%";

  useEffect(() => {
    if (!mounted) return;
    if (isVisible || isExiting) {
      closeButtonRef.current?.focus();
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted, isVisible, isExiting]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="grid h-11 w-11 place-items-center rounded-full bg-card text-foreground shadow-sm ring-1 ring-border transition hover:bg-hover md:hidden"
        aria-label={t("openMenu")}
        aria-expanded={isOpen}
        aria-controls="mobile-nav-drawer"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-md mobile-overlay ${isVisible ? "is-visible" : ""} ${isExiting ? "is-exiting" : ""}`}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-nav-drawer"
            className={`absolute top-0 h-dvh w-full max-w-[280px] p-5 shadow-2xl overflow-y-auto mobile-drawer ${isVisible ? "is-visible" : ""} ${isExiting ? "is-exiting" : ""}`}
            style={{ [isRtl ? "left" : "right"]: 0, transform: isVisible ? "translateX(0)" : `translateX(${slideDir})`, backgroundColor: "#fffaf2" }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-xl font-bold">{t("mobileMenu")}</div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t("mobClose")}
                className="grid h-11 w-11 place-items-center rounded-full bg-muted transition hover:bg-muted-foreground/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-8 space-y-2" aria-label={t("navLabel")}>
              {links.map((item, i) => {
                const href = `/${locale}/${item}`;
                const isCurrent = pathname === href;
                return (
                  <div
                    key={item}
                    className={`mobile-nav-item ${isVisible ? "is-visible" : ""}`}
                    style={{ transitionDelay: isVisible ? `${0.1 + i * 0.06}s` : "0s" }}
                  >
                    <Link
                      href={href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isCurrent ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition ${
                          isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "text-foreground hover:bg-card hover:text-foreground"
                        }`}
                    >
                      {t(item)}
                    </Link>
                  </div>
                );
              })}
            </nav>

            <div
              className={`mt-8 border-t border-border pt-6 mobile-lang-section ${isVisible ? "is-visible" : ""}`}
            >
              <div className="mb-3 text-sm font-bold text-muted-foreground">{t("langSwitch")}</div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
