import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getShowroomProfile } from "@/lib/db-showroom-data";
import { Instagram, MapPin, MessageCircle, Music } from "lucide-react";
import { tenant } from "@/lib/tenant";

export async function PublicFooter({ locale }: { locale: Locale }) {
  const [t, rt, profile] = await Promise.all([getTranslations("footer"), getTranslations("routes"), getShowroomProfile()]);
  const showroomName = locale === "en" ? profile.nameEn : locale === "he" ? profile.nameHe : profile.nameAr;
  const fallbackName = t("fallbackName");
  const fallbackAddress = t("fallbackAddress");
  const year = new Date().getFullYear();
  const rightsText = t("rights", { name: showroomName ?? fallbackName, year: year.toString() });
  const phone = profile.whatsapp || profile.phone || "";
  const facebookUrl = profile.social?.facebook;

  const socialLinks = [
    { label: t("instagram"), url: profile.social?.instagram, icon: Instagram },
    { label: t("tiktok"), url: profile.social?.tiktok, icon: Music },
  ].filter((item) => item.url);

  const footerLabel = locale === "ar" ? "تذييل الصفحة" : locale === "he" ? "כותרת תחתונה" : "Footer";

  return (
    <footer role="contentinfo" aria-label={footerLabel} className="theme-footer mt-24">
      <div className="border-t border-border bg-gradient-to-b from-transparent to-muted/30">
        <div className="container-shell grid gap-10 py-16 md:grid-cols-[1.2fr_0.8fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image src="/favicon.svg" alt={showroomName ?? fallbackName} fill className="object-contain p-1" sizes="48px" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">{showroomName ?? fallbackName}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{locale === "ar" ? tenant.identity.address.ar : locale === "he" ? tenant.identity.address.he ?? "" : tenant.identity.address.en}</div>
              </div>
            </div>
            {socialLinks.length > 0 || facebookUrl ? (
              <div className="flex flex-wrap items-center gap-4">
                {facebookUrl ? (
                  <a key="facebook" href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label={t("facebook")} className="flex items-center gap-3 rounded-xl bg-transparent px-0 py-0 hover:text-primary transition">
                    <div className="relative h-12 w-12 shrink-0">
                      <Image src="/fb.png" alt="" fill className="rounded object-cover" sizes="48px" />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground hover:text-primary transition">{t("facebookPage")}</span>
                  </a>
                ) : null}
                {socialLinks.map((item) => (
                  <a key={item.label} href={item.url!} target="_blank" rel="noopener noreferrer" aria-label={item.label} className="grid h-11 w-11 place-items-center rounded-xl bg-card shadow-sm ring-1 ring-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:ring-primary transition">
                    <item.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            ) : null}
            <p className="text-xs text-muted-foreground/60">{rightsText}</p>
          </div>
          <div className="space-y-4">
            <div className="text-sm font-bold uppercase tracking-wide text-foreground">{t("contact")}</div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>{profile.address ?? fallbackAddress}</span>
              </div>
              {phone ? (
                <div className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                  <a href={`https://wa.me/${phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                    {phone}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-4">
            <div className="text-sm font-bold uppercase tracking-wide text-foreground">{locale === "ar" ? "التنقل" : locale === "he" ? "ניווט" : "Navigation"}</div>
            <div className="space-y-2 text-sm">
              {[
                { href: "catalog", label: "catalog" as const },
                profile.showFabrics ? { href: "fabrics", label: "fabrics" as const } : null,
                profile.showOffers ? { href: "offers", label: "offers" as const } : null,
                profile.showGallery ? { href: "gallery", label: "gallery" as const } : null,
                { href: "interest-list", label: "interest" as const },
                { href: "contact", label: "contact" as const },
              ].filter(Boolean).map((item) => (
                <Link key={item!.href} href={`/${locale}/${item!.href}`} className="block text-muted-foreground hover:text-primary transition">
                  {rt(item!.label)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
