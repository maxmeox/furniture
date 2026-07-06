import { z } from "zod";
import { isThemePresetId } from "@/lib/theme-presets";
import { normalizeShowroomWhatsApp, type FaqItem, type ShowroomProfile } from "@/lib/showroom-profile";
import { checkbox, imagePathOrUrl, listFromText, requiredSafeText, safeText, textValue, urlOrEmpty } from "../utils";
import { settingsError } from "./shared";

const t120 = safeText(120);
const rt120 = requiredSafeText(120);
const rt240 = requiredSafeText(240);
const t240 = safeText(240);
const t500 = safeText(500);
const t900 = safeText(900);

type SectionHandler = (current: ShowroomProfile, formData: FormData) => Promise<ShowroomProfile>;

const appearance: SectionHandler = async (current, formData) => {
  const parsed = z.object({
    themePreset: z.string().trim().refine(isThemePresetId, "ثيم غير معروف")
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) settingsError("اختر ثيمًا معروفًا من القائمة فقط.");
  return { ...current, themePreset: parsed.data.themePreset };
};

const identity: SectionHandler = async (current, formData) => {
  const parsed = z.object({
    nameAr: rt120,
    nameEn: rt120,
    nameHe: rt120,
    shortNameAr: t120,
    shortNameEn: t120,
    shortNameHe: t120,
    taglineAr: t240,
    taglineEn: t240,
    taglineHe: t240,
    descriptionAr: t500,
    descriptionEn: t500,
    descriptionHe: t500,
    logoPath: imagePathOrUrl,
    faviconPath: imagePathOrUrl,
    heroImageUrl: imagePathOrUrl,
    ogImageUrl: imagePathOrUrl
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) settingsError("راجع حقول هوية المعرض. يوجد نص أو مسار صورة غير صحيح.");
  return { ...current, ...parsed.data };
};

const contact: SectionHandler = async (current, formData) => {
  const parsed = z.object({
    phone: t120,
    address: rt240,
    city: t120,
    location: t120,
    workingHours: t240,
    whatsapp: z.string().trim().min(8).max(24).transform(normalizeShowroomWhatsApp).refine((value) => /^\d{8,18}$/.test(value), "رقم واتساب غير صحيح")
  }).safeParse(Object.fromEntries(formData));
  const deliveryAreas = listFromText(textValue(formData, "deliveryAreas"));
  if (!parsed.success || deliveryAreas.length === 0) settingsError("راجع رقم واتساب ومناطق التوصيل. يجب أن يكون رقم واتساب أرقامًا فقط بعد التنظيف.");
  return { ...current, ...parsed.data, deliveryAreas };
};

const social: SectionHandler = async (current, formData) => {
  const parsed = z.object({
    email: z.string().trim().max(160).email().or(z.literal("")),
    facebook: urlOrEmpty,
    instagram: urlOrEmpty,
    tiktok: urlOrEmpty,
    mapLink: urlOrEmpty
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) settingsError("راجع روابط التواصل. يجب أن تكون الروابط صحيحة أو فارغة.");
  return {
    ...current,
    email: parsed.data.email,
    social: {
      facebook: parsed.data.facebook,
      instagram: parsed.data.instagram,
      tiktok: parsed.data.tiktok
    },
    mapLink: parsed.data.mapLink
  };
};

const copy: SectionHandler = async (current, formData) => {
  const parsed = z.object({
    heroTitleAr: rt240,
    heroTitleEn: rt240,
    heroTitleHe: rt240,
    heroSubtitleAr: t500,
    heroSubtitleEn: t500,
    heroSubtitleHe: t500,
    footerTextAr: t500,
    footerTextEn: t500,
    footerTextHe: t500,
    catalogSubtitleAr: t500,
    catalogSubtitleEn: t500,
    catalogSubtitleHe: t500,
    fabricsSubtitleAr: t500,
    fabricsSubtitleEn: t500,
    fabricsSubtitleHe: t500,
    gallerySubtitleAr: t500,
    gallerySubtitleEn: t500,
    gallerySubtitleHe: t500,
    offersSubtitleAr: t500,
    offersSubtitleEn: t500,
    offersSubtitleHe: t500,
    contactIntroAr: t500,
    contactIntroEn: t500,
    contactIntroHe: t500,
    siteTitleAr: t120,
    siteTitleEn: t120,
    siteTitleHe: t120,
    siteDescriptionAr: t900,
    siteDescriptionEn: t900,
    siteDescriptionHe: t900
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) settingsError("راجع نصوص الموقع. توجد قيمة طويلة جدًا أو غير صحيحة.");
  return { ...current, ...parsed.data };
};

const homepage: SectionHandler = async (current, formData) => {
  const parsed = z.object({
    homepageFeaturedTitleAr: rt120,
    homepageFeaturedTitleEn: rt120,
    homepageFeaturedTitleHe: rt120,
    homepageFeaturedSubtitleAr: t500,
    homepageFeaturedSubtitleEn: t500,
    homepageFeaturedSubtitleHe: t500,
    homepageTablesTitleAr: rt120,
    homepageTablesTitleEn: rt120,
    homepageTablesTitleHe: rt120,
    homepageTablesSubtitleAr: t500,
    homepageTablesSubtitleEn: t500,
    homepageTablesSubtitleHe: t500,
    homepageOffersTitleAr: rt120,
    homepageOffersTitleEn: rt120,
    homepageOffersTitleHe: rt120,
    homepageFabricsTitleAr: rt120,
    homepageFabricsTitleEn: rt120,
    homepageFabricsTitleHe: rt120,
    homepageGalleryTitleAr: rt120,
    homepageGalleryTitleEn: rt120,
    homepageGalleryTitleHe: rt120,
    homepageTrustTitle1Ar: rt120,
    homepageTrustTitle1En: rt120,
    homepageTrustTitle1He: rt120,
    homepageTrustText1Ar: t500,
    homepageTrustText1En: t500,
    homepageTrustText1He: t500,
    homepageTrustTitle2Ar: rt120,
    homepageTrustTitle2En: rt120,
    homepageTrustTitle2He: rt120,
    homepageTrustText2Ar: t500,
    homepageTrustText2En: t500,
    homepageTrustText2He: t500,
    homepageTrustTitle3Ar: rt120,
    homepageTrustTitle3En: rt120,
    homepageTrustTitle3He: rt120,
    homepageTrustText3Ar: t500,
    homepageTrustText3En: t500,
    homepageTrustText3He: t500,
    homepageFaqTitleAr: rt120,
    homepageFaqTitleEn: rt120,
    homepageFaqTitleHe: rt120,
    homepageFaqSubtitleAr: t500,
    homepageFaqSubtitleEn: t500,
    homepageFaqSubtitleHe: t500,
    homepageFinalTitleAr: rt120,
    homepageFinalTitleEn: rt120,
    homepageFinalTitleHe: rt120,
    homepageFinalSubtitleAr: t500,
    homepageFinalSubtitleEn: t500,
    homepageFinalSubtitleHe: t500
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) settingsError("راجع نصوص الصفحة الرئيسية. توجد قيمة مطلوبة فارغة أو نص طويل جدًا.");
  return { ...current, ...parsed.data };
};

const pages: SectionHandler = async (current, formData) => {
  const parsed = z.object({
    productPriceLabelAr: rt120,
    productPriceLabelEn: rt120,
    productPriceLabelHe: rt120,
    productCustomizationLabelAr: rt120,
    productCustomizationLabelEn: rt120,
    productCustomizationLabelHe: rt120,
    productAvailabilityLabelAr: rt120,
    productAvailabilityLabelEn: rt120,
    productAvailabilityLabelHe: rt120,
    productInquiryTitleAr: rt120,
    productInquiryTitleEn: rt120,
    productInquiryTitleHe: rt120,
    productInquiryTextAr: t500,
    productInquiryTextEn: t500,
    productInquiryTextHe: t500,
    productFabricsTitleAr: rt120,
    productFabricsTitleEn: rt120,
    productFabricsTitleHe: rt120,
    productFabricsSubtitleAr: t500,
    productFabricsSubtitleEn: t500,
    productFabricsSubtitleHe: t500,
    productRelatedWorkTitleAr: rt120,
    productRelatedWorkTitleEn: rt120,
    productRelatedWorkTitleHe: rt120,
    productRelatedWorkSubtitleAr: t500,
    productRelatedWorkSubtitleEn: t500,
    productRelatedWorkSubtitleHe: t500,
    productSimilarTitleAr: rt120,
    productSimilarTitleEn: rt120,
    productSimilarTitleHe: rt120,
    productSimilarSubtitleAr: t500,
    productSimilarSubtitleEn: t500,
    productSimilarSubtitleHe: t500,
    campaignProductsTitleAr: rt120,
    campaignProductsTitleEn: rt120,
    campaignProductsTitleHe: rt120,
    campaignProductsSubtitleAr: t500,
    campaignProductsSubtitleEn: t500,
    campaignProductsSubtitleHe: t500,
    campaignOffersTitleAr: rt120,
    campaignOffersTitleEn: rt120,
    campaignOffersTitleHe: rt120,
    campaignOffersSubtitleAr: t500,
    campaignOffersSubtitleEn: t500,
    campaignOffersSubtitleHe: t500,
    campaignFabricsTitleAr: rt120,
    campaignFabricsTitleEn: rt120,
    campaignFabricsTitleHe: rt120,
    campaignFabricsSubtitleAr: t500,
    campaignFabricsSubtitleEn: t500,
    campaignFabricsSubtitleHe: t500,
    campaignEmptyProductsAr: t240,
    campaignEmptyProductsEn: t240,
    campaignEmptyProductsHe: t240
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) settingsError("راجع نصوص صفحات المنتجات والحملات. توجد قيمة مطلوبة فارغة أو نص طويل جدًا.");
  return { ...current, ...parsed.data };
};

const interest: SectionHandler = async (current, formData) => {
  const parsed = z.object({
    interestSubtitleAr: t500,
    interestSubtitleEn: t500,
    interestSubtitleHe: t500,
    interestEmptyTitleAr: rt120,
    interestEmptyTitleEn: rt120,
    interestEmptyTitleHe: rt120,
    interestEmptyTextAr: t500,
    interestEmptyTextEn: t500,
    interestEmptyTextHe: t500,
    interestBrowseLabelAr: rt120,
    interestBrowseLabelEn: rt120,
    interestBrowseLabelHe: rt120,
    interestSendLabelAr: rt120,
    interestSendLabelEn: rt120,
    interestSendLabelHe: rt120,
    interestClearLabelAr: rt120,
    interestClearLabelEn: rt120,
    interestClearLabelHe: rt120,
    interestRemoveLabelAr: rt120,
    interestRemoveLabelEn: rt120,
    interestRemoveLabelHe: rt120,
    interestDrawerTitleAr: rt120,
    interestDrawerTitleEn: rt120,
    interestDrawerTitleHe: rt120,
    interestDrawerEmptyAr: t500,
    interestDrawerEmptyEn: t500,
    interestDrawerEmptyHe: t500,
    interestViewPageLabelAr: rt120,
    interestViewPageLabelEn: rt120,
    interestViewPageLabelHe: rt120
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) settingsError("راجع نصوص قائمة الاهتمام. توجد قيمة مطلوبة فارغة أو نص طويل جدًا.");
  return { ...current, ...parsed.data };
};

const whatsapp: SectionHandler = async (current, formData) => {
  const parsed = z.object({
    defaultWhatsAppTemplateAr: t240,
    defaultWhatsAppTemplateEn: t240,
    defaultWhatsAppTemplateHe: t240,
    whatsappCtaAr: t120,
    whatsappCtaEn: t120,
    whatsappCtaHe: t120,
    whatsappSheetTitleAr: rt120,
    whatsappSheetTitleEn: rt120,
    whatsappSheetTitleHe: rt120,
    whatsappSheetSubtitleAr: t240,
    whatsappSheetSubtitleEn: t240,
    whatsappSheetSubtitleHe: t240,
    whatsappSheetSendLabelAr: rt120,
    whatsappSheetSendLabelEn: rt120,
    whatsappSheetSendLabelHe: rt120
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) settingsError("راجع إعدادات واتساب. النص طويل جدًا أو غير صحيح.");
  return { ...current, ...parsed.data };
};

const visibility: SectionHandler = async (current, formData) => ({
  ...current,
  showOffers: checkbox(formData, "showOffers"),
  showFabrics: checkbox(formData, "showFabrics"),
  showGallery: checkbox(formData, "showGallery"),
  showPreviousWork: checkbox(formData, "showPreviousWork"),
  showFaq: checkbox(formData, "showFaq"),
  showFeaturedProducts: checkbox(formData, "showFeaturedProducts"),
  showTablesSection: checkbox(formData, "showTablesSection"),
  showFinalCta: checkbox(formData, "showFinalCta")
});

const faq: SectionHandler = async (current, formData) => {
  const raw = textValue(formData, "faqData");
  let faqItems: FaqItem[] = [];
  if (raw) {
    let parsedJson: unknown;
    try { parsedJson = JSON.parse(raw); }
    catch { settingsError("صيغة الأسئلة الشائعة غير صحيحة."); }
    const faqItemSchema = z.object({
      questionAr: t240,
      questionEn: t240,
      questionHe: t240,
      answerAr: t240,
      answerEn: t240,
      answerHe: t240
    });
    const result = z.array(faqItemSchema).max(20).safeParse(parsedJson);
    if (result.success) faqItems = result.data;
    else settingsError("صيغة الأسئلة الشائعة غير صحيحة.");
  }
  return { ...current, faqItems };
};

export const sectionRegistry: Record<string, SectionHandler> = {
  appearance,
  identity,
  contact,
  social,
  copy,
  homepage,
  pages,
  interest,
  whatsapp,
  visibility,
  faq
};
