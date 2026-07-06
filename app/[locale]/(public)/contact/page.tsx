import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Clock, Facebook, Instagram, Mail, MapPin, Music2, Phone } from "lucide-react";
import { WhatsAppInquiryButton } from "@/components/conversion/whatsapp-inquiry-button";
import { SectionHeader } from "@/components/public/section-header";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/ui/json-ld";
import { isLocale, type Locale } from "@/i18n/routing";
import { getShowroomProfile } from "@/lib/db-showroom-data";
import { localizedProfileValue, showroomProfileDefaults } from "@/lib/showroom-profile";
import { appUrl } from "@/lib/constants";
import { tenant } from "@/lib/tenant";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { ar: "/ar/contact", en: "/en/contact", he: "/he/contact" },
    },
  };
}

export default async function ContactPage() {
  const t = await getTranslations("routes");
  const contact = await getTranslations("contact");
  const locale = (await getLocale()) as Locale;
  const profile = await getShowroomProfile();
  const whatsapp = profile.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? showroomProfileDefaults.whatsapp;
  const name = locale === "en" ? profile.nameEn : locale === "he" ? profile.nameHe : profile.nameAr;
  const address = profile.address ?? showroomProfileDefaults.address;
  const deliveryAreas = profile.deliveryAreas?.join(locale === "ar" ? "، " : ", ") ?? showroomProfileDefaults.deliveryAreas.join(locale === "ar" ? "، " : ", ");
  const mapLink = profile.mapLink?.trim();
  const intro = localizedProfileValue(profile, "contactIntro", locale) || contact("summary");

  const socialLinks = [profile.social?.facebook, profile.social?.instagram, profile.social?.tiktok].filter(Boolean) as string[];

  return (
    <section className="theme-section container-shell py-10">
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: name ?? tenant.identity.nameAr,
          description: typeof intro === "string" ? intro : undefined,
          telephone: profile.phone ?? whatsapp,
          address: {
            "@type": "PostalAddress",
            streetAddress: address,
            addressLocality: tenant.identity.city,
            addressCountry: "PS",
          },
          openingHours: profile.workingHours ?? showroomProfileDefaults.workingHours,
          url: `${appUrl}/${locale}/contact`,
          image: `${appUrl}/images/hero-showroom.svg`,
          ...(socialLinks.length > 0 ? { sameAs: socialLinks } : {}),
        }}
      />
      <SectionHeader title={t("contact")} description={intro || t("contactDescription")} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="theme-cta rounded-panel bg-[#38291f] p-6 text-[#fff8ed] shadow-xl md:p-8">
          <div className="text-3xl font-bold">{name ?? tenant.identity.nameAr}</div>
          <p className="mt-4 text-sm leading-7 text-[#e9d9c3]">{intro}</p>
          <div className="mt-7 grid gap-3">
            <WhatsAppInquiryButton locale={locale} entity={{ type: "campaign", id: "contact", title: "General showroom inquiry", href: `/${locale}/contact` }} />
            <Button asChild variant="secondary" className="bg-[#fffaf2] !text-[#6f4f2f] hover:bg-white">
              <a href={`/${locale}/catalog`}>{contact("browseDesigns")}</a>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard icon={<Phone className="h-5 w-5" />} title={contact("phoneWhatsapp")} text={profile.phone ?? whatsapp} />
          <InfoCard icon={<MapPin className="h-5 w-5" />} title={contact("address")} text={address} />
          <InfoCard icon={<Clock className="h-5 w-5" />} title={contact("workingHours")} text={profile.workingHours ?? showroomProfileDefaults.workingHours} />
          <InfoCard icon={<MapPin className="h-5 w-5" />} title={contact("deliveryAreas")} text={deliveryAreas} />
          {profile.social?.facebook ? (
            <InfoCard
              icon={<Facebook className="h-5 w-5" />}
              title="Facebook"
              text={
                <a className="font-semibold text-[#2b2119] underline underline-offset-4 hover:text-primary" href={profile.social.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              }
            />
          ) : null}
          {profile.social?.instagram ? (
            <InfoCard
              icon={<Instagram className="h-5 w-5" />}
              title="Instagram"
              text={<SocialLink href={profile.social.instagram} label="Instagram" />}
            />
          ) : null}
          {profile.social?.tiktok ? (
            <InfoCard
              icon={<Music2 className="h-5 w-5" />}
              title="TikTok"
              text={<SocialLink href={profile.social.tiktok} label="TikTok" />}
            />
          ) : null}
          {profile.email ? (
            <InfoCard
              icon={<Mail className="h-5 w-5" />}
              title="Email"
              text={<a className="font-semibold text-[#2b2119] underline underline-offset-4 hover:text-primary" href={`mailto:${profile.email}`}>{profile.email}</a>}
            />
          ) : null}
        </div>
      </div>
      <div className="theme-card mt-6 rounded-panel border border-dashed border-border bg-card p-8 text-center">
        <div className="text-xl font-bold">{contact("mapLink")}</div>
        {mapLink ? (
          <a className="mt-2 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline" href={mapLink} target="_blank" rel="noreferrer">
            Google Maps
          </a>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">{contact("mapUnavailable")}</p>
        )}
      </div>
    </section>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a className="font-semibold text-[#2b2119] underline underline-offset-4 hover:text-primary" href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: React.ReactNode }) {
  return (
    <div className="theme-card rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border">
      <div className="flex items-center gap-3 text-primary">
        {icon}
        <div className="font-bold">{title}</div>
      </div>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
    </div>
  );
}
