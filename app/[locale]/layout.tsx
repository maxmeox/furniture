import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { isLocale, localeDirections, type Locale } from "@/i18n/routing";
import { getShowroomProfile } from "@/lib/db-showroom-data";
import { localizedProfileValue } from "@/lib/showroom-profile";
import { appUrl } from "@/lib/constants";
import { JsonLd } from "@/components/ui/json-ld";
import { LangDirPatcher } from "@/components/ui/lang-dir-patcher";
import { tenant } from "@/lib/tenant";

function getLocaleMeta(locale: string) {
  if (locale === "en") return {
    title: tenant.seo.titleEn,
    description: tenant.seo.descriptionEn,
    organizationName: tenant.identity.nameEn,
    organizationDescription: `${tenant.identity.nameEn} catalog in ${tenant.identity.city} for furniture inquiries via WhatsApp.`,
  };
  if (locale === "he") return {
    title: tenant.seo.titleHe ?? tenant.seo.titleAr,
    description: tenant.seo.descriptionAr,
    organizationName: tenant.identity.nameHe,
    organizationDescription: `${tenant.identity.nameHe} catalog in ${tenant.identity.city} for furniture inquiries via WhatsApp.`,
  };
  return {
    title: tenant.seo.titleAr,
    description: tenant.seo.descriptionAr,
    organizationName: tenant.identity.nameAr,
    organizationDescription: `كتالوج ${tenant.identity.nameAr} في ${tenant.identity.city} للاستفسار عن الأثاث والمفروشات عبر واتساب.`,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const profile = await getShowroomProfile();
  const meta = getLocaleMeta(locale);
  const title = localizedProfileValue(profile, "siteTitle", locale) || meta.title;
  const description = localizedProfileValue(profile, "siteDescription", locale) || meta.description;

  return {
    title: { default: title, template: `%s | ${title}` },
    description,
    metadataBase: new URL(appUrl),
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description,
      images: profile.ogImageUrl ? [{ url: profile.ogImageUrl, width: 1200, height: 630 }] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: profile.ogImageUrl ? [profile.ogImageUrl] : undefined,
    },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon.png", type: "image/png" },
        { url: "/favicon.ico", sizes: "any" }
      ],
      shortcut: "/favicon.ico",
      apple: "/favicon.png"
    },
    alternates: {
      canonical: `${appUrl}/${locale}`,
      languages: Object.fromEntries(
        tenant.locales.supported.map(l => [l, `${appUrl}/${l}`])
      ),
    }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const messages = await getMessages();
  const dir = localeDirections[locale as Locale];
  const meta = getLocaleMeta(locale);

  return (
    <NextIntlClientProvider messages={messages}>
      <LangDirPatcher locale={locale} dir={dir} />
      <div lang={locale} dir={dir} data-locale={locale} className="min-h-screen">
        <JsonLd
          schema={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: meta.organizationName,
            url: `${appUrl}/${locale}`,
            logo: `${appUrl}/favicon.png`,
            description: meta.organizationDescription,
            alternateName: meta.title,
          }}
        />
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
