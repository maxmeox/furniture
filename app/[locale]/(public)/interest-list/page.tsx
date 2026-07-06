import { getLocale, getTranslations } from "next-intl/server";
import { InterestListPageClient } from "@/components/public/interest-list-page";
import { SectionHeader } from "@/components/public/section-header";
import { type Locale } from "@/i18n/routing";
import { getShowroomProfile } from "@/lib/db-showroom-data";
import { localizedProfileValue, normalizeShowroomWhatsApp } from "@/lib/showroom-profile";

const copy = {
  ar: "التصاميم والأقمشة والعروض المحفوظة تبقى على هذا الجهاز بدون حساب عميل.",
  en: "Saved designs, fabrics, and offers are stored locally on this device without customer login.",
  he: "עיצובים, בדים ומבצעים שנשמרו נשארים במכשיר הזה ללא חשבון לקוח."
} satisfies Record<Locale, string>;

export default async function InterestListPage() {
  const [t, rawLocale, profile] = await Promise.all([getTranslations("routes"), getLocale(), getShowroomProfile()]);
  const locale = rawLocale as Locale;
  return (
    <section className="container-shell py-10">
      <SectionHeader title={t("interest")} description={localizedProfileValue(profile, "interestSubtitle", locale) || copy[locale]} />
      <InterestListPageClient
        locale={locale}
        whatsapp={normalizeShowroomWhatsApp(profile.whatsapp)}
        settingsCopy={{
          emptyTitle: localizedProfileValue(profile, "interestEmptyTitle", locale),
          emptyText: localizedProfileValue(profile, "interestEmptyText", locale),
          browse: localizedProfileValue(profile, "interestBrowseLabel", locale),
          send: localizedProfileValue(profile, "interestSendLabel", locale),
          clear: localizedProfileValue(profile, "interestClearLabel", locale),
          remove: localizedProfileValue(profile, "interestRemoveLabel", locale)
        }}
      />
    </section>
  );
}
