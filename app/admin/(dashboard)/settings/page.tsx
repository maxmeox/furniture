import { saveShowroomProfileSettings } from "@/app/admin/actions";
import { AdminCard, AdminPageHeader, CheckboxField, EmptyAdminState, Field, TextArea, TextInput } from "@/components/admin/admin-controls";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { DeliveryAreasEditor } from "@/components/admin/delivery-areas-editor";
import { FaqEditor } from "@/components/admin/faq-editor";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { showroomProfileDefaults, type ShowroomProfile } from "@/lib/showroom-profile";
import { getThemePreset, themePresets } from "@/lib/theme-presets";

function mergeProfile(value: unknown): ShowroomProfile {
  const storedProfile = (value ?? {}) as Partial<ShowroomProfile>;
  const themePreset = getThemePreset(typeof storedProfile.themePreset === "string" ? storedProfile.themePreset : showroomProfileDefaults.themePreset).id;
  return {
    ...showroomProfileDefaults,
    ...storedProfile,
    themePreset,
    deliveryAreas: Array.isArray(storedProfile.deliveryAreas) ? storedProfile.deliveryAreas : showroomProfileDefaults.deliveryAreas,
    faqItems: Array.isArray(storedProfile.faqItems) ? storedProfile.faqItems : showroomProfileDefaults.faqItems,
    social: {
      ...showroomProfileDefaults.social,
      ...(storedProfile.social ?? {})
    },
    mapLink: storedProfile.mapLink ?? showroomProfileDefaults.mapLink
  };
}

function SaveButton({ label = "حفظ" }: { label?: string }) {
  return <Button type="submit" className="w-full md:w-auto">{label}</Button>;
}

function localeValue(profile: ShowroomProfile, base: string, suffix: "Ar" | "En" | "He") {
  const value = profile[`${base}${suffix}` as keyof ShowroomProfile];
  return typeof value === "string" ? value : "";
}

function LocaleFields({ profile, base, ar, en, he, required = false }: { profile: ShowroomProfile; base: string; ar: string; en: string; he: string; required?: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Field label={ar}><TextArea name={`${base}Ar`} defaultValue={localeValue(profile, base, "Ar")} required={required} /></Field>
      <Field label={en}><TextArea name={`${base}En`} defaultValue={localeValue(profile, base, "En")} required={required} /></Field>
      <Field label={he}><TextArea name={`${base}He`} defaultValue={localeValue(profile, base, "He")} required={required} /></Field>
    </div>
  );
}

export default async function SettingsPage({
  searchParams
}: {
  searchParams?: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const settings = await prisma.setting.findMany({ orderBy: { updatedAt: "desc" } });
  const profileSetting = settings.find((setting) => setting.key === "showroom_profile");
  const profile = mergeProfile(profileSetting?.value);

  return (
    <section className="space-y-6">
      <AdminPageHeader title="الإعدادات" description="تخصيص هوية المعرض، معلومات التواصل، نصوص الموقع، واتساب، وروابط التواصل بدون تعديل الكود." />

      {params?.saved ? (
        <div className="rounded-2xl border border-success-contrast/30 bg-success px-4 py-3 text-sm font-semibold text-success-contrast">
          تم حفظ الإعدادات بنجاح.
        </div>
      ) : null}
      {params?.error ? (
        <div className="rounded-2xl border border-error-contrast/30 bg-error px-4 py-3 text-sm font-semibold text-error-contrast">
          {params.error}
        </div>
      ) : null}

      <AdminCard title="إعدادات الأمان">
        <ChangePasswordForm />
      </AdminCard>

      <AdminCard title="المظهر والثيم">
        <form action={saveShowroomProfileSettings} className="grid gap-4">
          <input type="hidden" name="section" value="appearance" />
          <p className="text-sm leading-7 text-muted-foreground">
            اختر النمط البصري العام للموقع. يمكن تغيير الثيم دون التأثير على المنتجات أو الحملات أو العملاء.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.values(themePresets).filter((theme) => theme.enabled).map((theme) => (
              <label key={theme.id} className="flex min-w-0 cursor-pointer gap-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-border transition hover:bg-muted/30">
                <input name="themePreset" type="radio" value={theme.id} defaultChecked={profile.themePreset === theme.id} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
                <span className="min-w-0">
                  <span className="mb-2 flex items-center gap-1.5">
                    <span className="h-5 w-5 rounded-full ring-1 ring-border/50" style={{ backgroundColor: theme.colors.bg }} title="Background" />
                    <span className="h-5 w-5 rounded-full ring-1 ring-border/50" style={{ backgroundColor: theme.colors.primary }} title="Primary" />
                    <span className="h-5 w-5 rounded-full ring-1 ring-border/50" style={{ backgroundColor: theme.colors.secondary }} title="Secondary" />
                    <span className="h-5 w-5 rounded-full ring-1 ring-border/50" style={{ backgroundColor: theme.colors.text }} title="Text" />
                  </span>
                  <span className="block font-bold">{theme.labelAr}</span>
                  <span className="mt-1 block text-xs font-semibold text-muted-foreground">{theme.labelEn}</span>
                  <span className="mt-2 block text-xs leading-6 text-muted-foreground">{theme.descriptionAr}</span>
                </span>
              </label>
            ))}
          </div>
          <SaveButton label="حفظ الثيم" />
        </form>
      </AdminCard>

      <AdminCard title="هوية المعرض">
        <form action={saveShowroomProfileSettings} className="grid gap-4">
          <input type="hidden" name="section" value="identity" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="اسم المعرض عربي"><TextInput name="nameAr" defaultValue={profile.nameAr} required /></Field>
            <Field label="Showroom name EN"><TextInput name="nameEn" defaultValue={profile.nameEn} required /></Field>
            <Field label="שם אולם HE"><TextInput name="nameHe" defaultValue={profile.nameHe} required /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="الاسم المختصر عربي"><TextInput name="shortNameAr" defaultValue={profile.shortNameAr} /></Field>
            <Field label="Short name EN"><TextInput name="shortNameEn" defaultValue={profile.shortNameEn} /></Field>
            <Field label="שם קצר HE"><TextInput name="shortNameHe" defaultValue={profile.shortNameHe} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="وصف مختصر عربي"><TextArea name="taglineAr" defaultValue={profile.taglineAr} /></Field>
            <Field label="Tagline EN"><TextArea name="taglineEn" defaultValue={profile.taglineEn} /></Field>
            <Field label="תיאור קצר HE"><TextArea name="taglineHe" defaultValue={profile.taglineHe} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="وصف المعرض عربي"><TextArea name="descriptionAr" defaultValue={profile.descriptionAr} /></Field>
            <Field label="Description EN"><TextArea name="descriptionEn" defaultValue={profile.descriptionEn} /></Field>
            <Field label="תיאור HE"><TextArea name="descriptionHe" defaultValue={profile.descriptionHe} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="مسار الشعار أو رابطه"><TextInput name="logoPath" defaultValue={profile.logoPath} placeholder="/images/brand/logo.png" /></Field>
            <Field label="مسار الأيقونة"><TextInput name="faviconPath" defaultValue={profile.faviconPath} placeholder="/favicon.svg" /></Field>
            <Field label="صورة البطل الرئيسية"><TextInput name="heroImageUrl" defaultValue={profile.heroImageUrl} placeholder="/images/hero-showroom.svg" /></Field>
            <Field label="صورة المشاركة Open Graph"><TextInput name="ogImageUrl" defaultValue={profile.ogImageUrl} placeholder="/images/hero-showroom.svg" /></Field>
          </div>
          <SaveButton label="حفظ هوية المعرض" />
        </form>
      </AdminCard>

      <AdminCard title="التواصل">
        <form action={saveShowroomProfileSettings} className="grid gap-4">
          <input type="hidden" name="section" value="contact" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="رقم واتساب - أرقام فقط"><TextInput name="whatsapp" defaultValue={profile.whatsapp} inputMode="numeric" required /></Field>
            <Field label="رقم الهاتف الظاهر"><TextInput name="phone" defaultValue={profile.phone} /></Field>
            <Field label="العنوان"><TextInput name="address" defaultValue={profile.address} required /></Field>
            <Field label="المدينة"><TextInput name="city" defaultValue={profile.city} /></Field>
            <Field label="الموقع المختصر"><TextInput name="location" defaultValue={profile.location} /></Field>
            <Field label="ساعات العمل"><TextInput name="workingHours" defaultValue={profile.workingHours} /></Field>
          </div>
          <Field label="مناطق التوصيل">
            <DeliveryAreasEditor areas={profile.deliveryAreas} />
          </Field>
          <SaveButton label="حفظ معلومات التواصل" />
        </form>
      </AdminCard>

      <AdminCard title="روابط التواصل">
        <form action={saveShowroomProfileSettings} className="grid gap-4">
          <input type="hidden" name="section" value="social" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="البريد الإلكتروني"><TextInput name="email" type="email" defaultValue={profile.email} placeholder="اختياري" /></Field>
            <Field label="Facebook"><TextInput name="facebook" defaultValue={profile.social.facebook ?? ""} placeholder="اتركه فارغًا لإخفاء الرابط" /></Field>
            <Field label="Instagram"><TextInput name="instagram" defaultValue={profile.social.instagram ?? ""} placeholder="اتركه فارغًا لإخفاء الرابط" /></Field>
            <Field label="TikTok"><TextInput name="tiktok" defaultValue={profile.social.tiktok ?? ""} placeholder="اتركه فارغًا لإخفاء الرابط" /></Field>
            <Field label="Google Maps"><TextInput name="mapLink" defaultValue={profile.mapLink} placeholder="اتركه فارغًا لعرض رسالة محايدة" /></Field>
          </div>
          <SaveButton label="حفظ الروابط" />
        </form>
      </AdminCard>

      <AdminCard title="نصوص الموقع">
        <form action={saveShowroomProfileSettings} className="grid gap-4">
          <input type="hidden" name="section" value="copy" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="عنوان البطل عربي"><TextArea name="heroTitleAr" defaultValue={profile.heroTitleAr} required /></Field>
            <Field label="Hero title EN"><TextArea name="heroTitleEn" defaultValue={profile.heroTitleEn} required /></Field>
            <Field label="כותרת ראשית HE"><TextArea name="heroTitleHe" defaultValue={profile.heroTitleHe} required /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="وصف البطل عربي"><TextArea name="heroSubtitleAr" defaultValue={profile.heroSubtitleAr} /></Field>
            <Field label="Hero subtitle EN"><TextArea name="heroSubtitleEn" defaultValue={profile.heroSubtitleEn} /></Field>
            <Field label="תיאור ראשי HE"><TextArea name="heroSubtitleHe" defaultValue={profile.heroSubtitleHe} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="نص الفوتر عربي"><TextArea name="footerTextAr" defaultValue={profile.footerTextAr} /></Field>
            <Field label="Footer EN"><TextArea name="footerTextEn" defaultValue={profile.footerTextEn} /></Field>
            <Field label="פוטר HE"><TextArea name="footerTextHe" defaultValue={profile.footerTextHe} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="وصف الكتالوج عربي"><TextArea name="catalogSubtitleAr" defaultValue={profile.catalogSubtitleAr} /></Field>
            <Field label="Catalog subtitle EN"><TextArea name="catalogSubtitleEn" defaultValue={profile.catalogSubtitleEn} /></Field>
            <Field label="וصف קטלוג HE"><TextArea name="catalogSubtitleHe" defaultValue={profile.catalogSubtitleHe} /></Field>
            <Field label="وصف الأقمشة عربي"><TextArea name="fabricsSubtitleAr" defaultValue={profile.fabricsSubtitleAr} /></Field>
            <Field label="Fabrics subtitle EN"><TextArea name="fabricsSubtitleEn" defaultValue={profile.fabricsSubtitleEn} /></Field>
            <Field label="וصف בדים HE"><TextArea name="fabricsSubtitleHe" defaultValue={profile.fabricsSubtitleHe} /></Field>
            <Field label="وصف المعرض عربي"><TextArea name="gallerySubtitleAr" defaultValue={profile.gallerySubtitleAr} /></Field>
            <Field label="Gallery subtitle EN"><TextArea name="gallerySubtitleEn" defaultValue={profile.gallerySubtitleEn} /></Field>
            <Field label="וصف גלריה HE"><TextArea name="gallerySubtitleHe" defaultValue={profile.gallerySubtitleHe} /></Field>
            <Field label="وصف العروض عربي"><TextArea name="offersSubtitleAr" defaultValue={profile.offersSubtitleAr} /></Field>
            <Field label="Offers subtitle EN"><TextArea name="offersSubtitleEn" defaultValue={profile.offersSubtitleEn} /></Field>
            <Field label="וصف מבצעים HE"><TextArea name="offersSubtitleHe" defaultValue={profile.offersSubtitleHe} /></Field>
            <Field label="مقدمة التواصل عربي"><TextArea name="contactIntroAr" defaultValue={profile.contactIntroAr} /></Field>
            <Field label="Contact intro EN"><TextArea name="contactIntroEn" defaultValue={profile.contactIntroEn} /></Field>
            <Field label="תיאור יצירת קשר HE"><TextArea name="contactIntroHe" defaultValue={profile.contactIntroHe} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="عنوان SEO عربي"><TextInput name="siteTitleAr" defaultValue={profile.siteTitleAr} /></Field>
            <Field label="SEO title EN"><TextInput name="siteTitleEn" defaultValue={profile.siteTitleEn} /></Field>
            <Field label="כותרת SEO HE"><TextInput name="siteTitleHe" defaultValue={profile.siteTitleHe} /></Field>
            <Field label="وصف SEO عربي"><TextArea name="siteDescriptionAr" defaultValue={profile.siteDescriptionAr} /></Field>
            <Field label="SEO description EN"><TextArea name="siteDescriptionEn" defaultValue={profile.siteDescriptionEn} /></Field>
            <Field label="תיאור SEO HE"><TextArea name="siteDescriptionHe" defaultValue={profile.siteDescriptionHe} /></Field>
          </div>
          <SaveButton label="حفظ نصوص الموقع" />
        </form>
      </AdminCard>

      <AdminCard title="الصفحة الرئيسية">
        <form action={saveShowroomProfileSettings} className="grid gap-5">
          <input type="hidden" name="section" value="homepage" />
          <LocaleFields profile={profile} base="homepageFeaturedTitle" ar="عنوان التصاميم المختارة عربي" en="Featured title EN" he="כותרת נבחרים HE" required />
          <LocaleFields profile={profile} base="homepageFeaturedSubtitle" ar="وصف التصاميم المختارة عربي" en="Featured subtitle EN" he="תיאור נבחרים HE" />
          <LocaleFields profile={profile} base="homepageTablesTitle" ar="عنوان الطاولات عربي" en="Tables title EN" he="כותרת שולחנות HE" required />
          <LocaleFields profile={profile} base="homepageTablesSubtitle" ar="وصف الطاولات عربي" en="Tables subtitle EN" he="תיאור שולחנות HE" />
          <LocaleFields profile={profile} base="homepageOffersTitle" ar="عنوان العروض عربي" en="Offers title EN" he="כותרת מבצעים HE" required />
          <LocaleFields profile={profile} base="homepageFabricsTitle" ar="عنوان الأقمشة عربي" en="Fabrics title EN" he="כותרת בדים HE" required />
          <LocaleFields profile={profile} base="homepageGalleryTitle" ar="عنوان المعرض عربي" en="Gallery title EN" he="כותרת גלריה HE" required />
          <div className="rounded-2xl bg-muted/40 p-4">
            <div className="mb-4 font-bold">بطاقات الثقة والخدمات</div>
            <LocaleFields profile={profile} base="homepageTrustTitle1" ar="عنوان البطاقة 1 عربي" en="Card 1 title EN" he="כרטיס 1 HE" required />
            <LocaleFields profile={profile} base="homepageTrustText1" ar="نص البطاقة 1 عربي" en="Card 1 text EN" he="טקסט 1 HE" />
            <LocaleFields profile={profile} base="homepageTrustTitle2" ar="عنوان البطاقة 2 عربي" en="Card 2 title EN" he="כרטיס 2 HE" required />
            <LocaleFields profile={profile} base="homepageTrustText2" ar="نص البطاقة 2 عربي" en="Card 2 text EN" he="טקסט 2 HE" />
            <LocaleFields profile={profile} base="homepageTrustTitle3" ar="عنوان البطاقة 3 عربي" en="Card 3 title EN" he="כרטיס 3 HE" required />
            <LocaleFields profile={profile} base="homepageTrustText3" ar="نص البطاقة 3 عربي" en="Card 3 text EN" he="טקסט 3 HE" />
          </div>
          <LocaleFields profile={profile} base="homepageFaqTitle" ar="عنوان الأسئلة عربي" en="FAQ title EN" he="כותרת שאלות HE" required />
          <LocaleFields profile={profile} base="homepageFaqSubtitle" ar="وصف الأسئلة عربي" en="FAQ subtitle EN" he="תיאור שאלות HE" />
          <LocaleFields profile={profile} base="homepageFinalTitle" ar="عنوان CTA النهائي عربي" en="Final CTA title EN" he="כותרת CTA HE" required />
          <LocaleFields profile={profile} base="homepageFinalSubtitle" ar="وصف CTA النهائي عربي" en="Final CTA subtitle EN" he="תיאור CTA HE" />
          <SaveButton label="حفظ الصفحة الرئيسية" />
        </form>
      </AdminCard>

      <AdminCard title="صفحات المنتجات والحملات">
        <form action={saveShowroomProfileSettings} className="grid gap-5">
          <input type="hidden" name="section" value="pages" />
          <div className="rounded-2xl bg-muted/40 p-4">
            <div className="mb-4 font-bold">صفحة المنتج</div>
            <LocaleFields profile={profile} base="productPriceLabel" ar="تسمية السعر عربي" en="Price label EN" he="תווית מחיר HE" required />
            <LocaleFields profile={profile} base="productCustomizationLabel" ar="تسمية التفصيل عربي" en="Customization label EN" he="תווית התאמה HE" required />
            <LocaleFields profile={profile} base="productAvailabilityLabel" ar="تسمية التوفر عربي" en="Availability label EN" he="תווית זמינות HE" required />
            <LocaleFields profile={profile} base="productInquiryTitle" ar="عنوان صندوق واتساب عربي" en="Inquiry box title EN" he="כותרת פנייה HE" required />
            <LocaleFields profile={profile} base="productInquiryText" ar="نص صندوق واتساب عربي" en="Inquiry box text EN" he="טקסט פנייה HE" />
            <LocaleFields profile={profile} base="productFabricsTitle" ar="عنوان الأقمشة المرتبطة عربي" en="Linked fabrics title EN" he="כותרת בדים קשורים HE" required />
            <LocaleFields profile={profile} base="productFabricsSubtitle" ar="وصف الأقمشة المرتبطة عربي" en="Linked fabrics subtitle EN" he="תיאור בדים קשורים HE" />
            <LocaleFields profile={profile} base="productRelatedWorkTitle" ar="عنوان الأعمال المشابهة عربي" en="Related work title EN" he="כותרת עבודות HE" required />
            <LocaleFields profile={profile} base="productRelatedWorkSubtitle" ar="وصف الأعمال المشابهة عربي" en="Related work subtitle EN" he="תיאור עבודות HE" />
            <LocaleFields profile={profile} base="productSimilarTitle" ar="عنوان التصاميم المشابهة عربي" en="Similar title EN" he="כותרת דומים HE" required />
            <LocaleFields profile={profile} base="productSimilarSubtitle" ar="وصف التصاميم المشابهة عربي" en="Similar subtitle EN" he="תיאור דומים HE" />
          </div>
          <div className="rounded-2xl bg-muted/40 p-4">
            <div className="mb-4 font-bold">صفحة الحملة</div>
            <LocaleFields profile={profile} base="campaignProductsTitle" ar="عنوان منتجات الحملة عربي" en="Campaign products title EN" he="כותרת מוצרי קמפיין HE" required />
            <LocaleFields profile={profile} base="campaignProductsSubtitle" ar="وصف منتجات الحملة عربي" en="Campaign products subtitle EN" he="תיאור מוצרי קמפיין HE" />
            <LocaleFields profile={profile} base="campaignOffersTitle" ar="عنوان عرض الحملة عربي" en="Campaign offer title EN" he="כותרת מבצע קמפיין HE" required />
            <LocaleFields profile={profile} base="campaignOffersSubtitle" ar="وصف عرض الحملة عربي" en="Campaign offer subtitle EN" he="תיאור מבצע קמפיין HE" />
            <LocaleFields profile={profile} base="campaignFabricsTitle" ar="عنوان أقمشة الحملة عربي" en="Campaign fabrics title EN" he="כותרת בדי קמפיין HE" required />
            <LocaleFields profile={profile} base="campaignFabricsSubtitle" ar="وصف أقمشة الحملة عربي" en="Campaign fabrics subtitle EN" he="תיאור בדי קמפיין HE" />
            <LocaleFields profile={profile} base="campaignEmptyProducts" ar="رسالة عدم اختيار منتجات عربي" en="Empty products EN" he="אין מוצרים HE" />
          </div>
          <SaveButton label="حفظ صفحات المنتجات والحملات" />
        </form>
      </AdminCard>

      <AdminCard title="قائمة الاهتمام وعبارات الحفظ">
        <form action={saveShowroomProfileSettings} className="grid gap-5">
          <input type="hidden" name="section" value="interest" />
          <LocaleFields profile={profile} base="interestSubtitle" ar="وصف صفحة قائمة الاهتمام عربي" en="Interest page subtitle EN" he="תיאור עמוד עניין HE" />
          <LocaleFields profile={profile} base="interestEmptyTitle" ar="عنوان القائمة الفارغة عربي" en="Empty title EN" he="כותרת ריקה HE" required />
          <LocaleFields profile={profile} base="interestEmptyText" ar="نص القائمة الفارغة عربي" en="Empty text EN" he="טקסט ריק HE" />
          <LocaleFields profile={profile} base="interestBrowseLabel" ar="زر التصفح عربي" en="Browse label EN" he="כפתור עיון HE" required />
          <LocaleFields profile={profile} base="interestSendLabel" ar="زر إرسال واتساب عربي" en="Send label EN" he="שליחה HE" required />
          <LocaleFields profile={profile} base="interestClearLabel" ar="زر مسح الكل عربي" en="Clear label EN" he="נקה HE" required />
          <LocaleFields profile={profile} base="interestRemoveLabel" ar="زر إزالة عربي" en="Remove label EN" he="הסר HE" required />
          <LocaleFields profile={profile} base="interestDrawerTitle" ar="عنوان الدرج عربي" en="Drawer title EN" he="כותרת מגירה HE" required />
          <LocaleFields profile={profile} base="interestDrawerEmpty" ar="نص الدرج الفارغ عربي" en="Drawer empty EN" he="מגירה ריקה HE" />
          <LocaleFields profile={profile} base="interestViewPageLabel" ar="زر عرض الصفحة عربي" en="View page label EN" he="הצג עמוד HE" required />
          <SaveButton label="حفظ قائمة الاهتمام" />
        </form>
      </AdminCard>

      <AdminCard title="إعدادات واتساب">
        <form action={saveShowroomProfileSettings} className="grid gap-4">
          <input type="hidden" name="section" value="whatsapp" />
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="بداية رسالة واتساب عربي"><TextArea name="defaultWhatsAppTemplateAr" defaultValue={profile.defaultWhatsAppTemplateAr} /></Field>
            <Field label="WhatsApp intro EN"><TextArea name="defaultWhatsAppTemplateEn" defaultValue={profile.defaultWhatsAppTemplateEn} /></Field>
            <Field label="פתיחת הודעת וואטסאפ HE"><TextArea name="defaultWhatsAppTemplateHe" defaultValue={profile.defaultWhatsAppTemplateHe} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="نص زر واتساب عربي"><TextInput name="whatsappCtaAr" defaultValue={profile.whatsappCtaAr} /></Field>
            <Field label="WhatsApp CTA EN"><TextInput name="whatsappCtaEn" defaultValue={profile.whatsappCtaEn} /></Field>
            <Field label="כפתור וואטסאפ HE"><TextInput name="whatsappCtaHe" defaultValue={profile.whatsappCtaHe} /></Field>
          </div>
          <LocaleFields profile={profile} base="whatsappSheetTitle" ar="عنوان نافذة واتساب عربي" en="Sheet title EN" he="כותרת חלון HE" required />
          <LocaleFields profile={profile} base="whatsappSheetSubtitle" ar="وصف نافذة واتساب عربي" en="Sheet subtitle EN" he="תיאור חלון HE" />
          <LocaleFields profile={profile} base="whatsappSheetSendLabel" ar="زر فتح واتساب عربي" en="Open WhatsApp label EN" he="כפתור פתיחה HE" required />
          <SaveButton label="حفظ إعدادات واتساب" />
        </form>
      </AdminCard>

      <AdminCard title="إظهار الأقسام">
        <form action={saveShowroomProfileSettings} className="grid gap-4">
          <input type="hidden" name="section" value="visibility" />
          <div className="grid gap-3 lg:grid-cols-2">
            <CheckboxField name="showFeaturedProducts" label="إظهار قسم التصاميم المختارة في الصفحة الرئيسية" defaultChecked={profile.showFeaturedProducts} />
            <CheckboxField name="showTablesSection" label="إظهار قسم الطاولات في الصفحة الرئيسية" defaultChecked={profile.showTablesSection} />
            <CheckboxField name="showOffers" label="إظهار قسم العروض في الصفحة الرئيسية" defaultChecked={profile.showOffers} />
            <CheckboxField name="showFabrics" label="إظهار قسم الأقمشة في الصفحة الرئيسية" defaultChecked={profile.showFabrics} />
            <CheckboxField name="showGallery" label="إظهار قسم معرض الصور في الصفحة الرئيسية" defaultChecked={profile.showGallery} />
            <CheckboxField name="showPreviousWork" label="إظهار بطاقات الثقة والخدمات" defaultChecked={profile.showPreviousWork} />
            <CheckboxField name="showFaq" label="إظهار الأسئلة الشائعة" defaultChecked={profile.showFaq} />
            <CheckboxField name="showFinalCta" label="إظهار دعوة واتساب النهائية" defaultChecked={profile.showFinalCta} />
          </div>
          <SaveButton label="حفظ إظهار الأقسام" />
        </form>
      </AdminCard>

      <AdminCard title="الأسئلة الشائعة">
        <FaqEditor items={profile.faqItems ?? showroomProfileDefaults.faqItems} />
      </AdminCard>

      <AdminCard title="كل الإعدادات">
        {settings.length === 0 ? <EmptyAdminState label="لا توجد إعدادات." /> : (
          <div className="grid gap-3">
            {settings.map((setting) => (
              <div key={setting.id} className="rounded-2xl bg-white p-4 ring-1 ring-border">
                <div className="font-bold">{setting.labelAr ?? setting.key}</div>
                <div className="mt-1 text-sm text-muted-foreground">{setting.key} · {setting.updatedAt.toLocaleString("en-GB")}</div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </section>
  );
}
