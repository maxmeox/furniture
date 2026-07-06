import { getLocale, getTranslations } from "next-intl/server";
import { AttributionProvider } from "@/components/conversion/attribution-provider";
import { PageViewTracker } from "@/components/conversion/page-view-tracker";
import type { Locale } from "@/i18n/routing";
import { getShowroomProfile } from "@/lib/db-showroom-data";
import { getThemePreset } from "@/lib/theme-presets";
import { cn } from "@/lib/utils";
import { normalizeShowroomWhatsApp } from "@/lib/showroom-profile";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { AutoThemeDetector } from "@/components/ui/auto-theme-detector";
import { FloatingWhatsAppButton } from "@/components/conversion/floating-whatsapp-button";
import { InterestDrawer } from "./interest-drawer";
import { InterestProvider } from "./interest-provider";
import { PublicFooter } from "./public-footer";
import { PublicHeader } from "./public-header";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [locale, profile] = await Promise.all([
    getLocale(),
    getShowroomProfile(),
  ]);
  const themePreset = getThemePreset(profile.themePreset);

  const typedLocale = locale as Locale;
  const whatsappPhone = normalizeShowroomWhatsApp(profile.whatsapp);
  const skipLabel = (await getTranslations("nav"))("skipContent");

  return (
    <div className={cn("public-theme", themePreset.className)} data-theme={themePreset.id}>
      <AutoThemeDetector enabled={profile.autoDarkMode} />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-background focus:text-foreground focus:shadow-lg">
        {skipLabel}
      </a>
      <AttributionProvider>
        <InterestProvider locale={locale as Locale}>
          <PageViewTracker locale={locale as Locale} />
          <PublicHeader locale={locale} profile={profile} />
          <main id="main-content" tabIndex={-1}>{children}</main>
          <PublicFooter locale={locale as Locale} />
          <InterestDrawer locale={locale as Locale} profile={profile} />
          <ScrollProgress />
          <FloatingWhatsAppButton locale={typedLocale} phone={whatsappPhone} />
        </InterestProvider>
      </AttributionProvider>
    </div>
  );
}
