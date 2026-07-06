// lib/types/tenant.ts
// ═══════════════════════════════════════════════════════════════
// النوع الكامل لملف تخصيص المعرض
// كل حقل موثّق بـ JSDoc — الوكيل يقرأه ويفهم ما يكتب
// ═══════════════════════════════════════════════════════════════

export type SupportedLocale = 'ar' | 'en' | 'he'
export type ThemeId = 'default' | 'luxury-classic' | 'dark-mode' | 'modern-minimal'
export type IconName =
  | 'shield-check' | 'truck' | 'star'
  | 'heart' | 'clock' | 'phone' | 'map-pin'

export interface LocalizedString {
  ar: string
  en: string
  he?: string
}

export interface TenantIdentity {
  nameAr:        string
  nameEn:        string
  nameHe:        string
  shortNameAr:   string
  shortNameEn:   string
  taglineAr:     string
  taglineEn:     string
  descriptionAr: string
  descriptionEn: string
  heroTitleAr:   string
  heroTitleEn:   string
  address:       LocalizedString
  city:          string
  country:       string
  foundedYear?:  number
}

export interface TenantContact {
  whatsappNumber:         string
  phone?:                 string
  email?:                 string
  googleMapsUrl?:         string
  whatsappDefaultMessage: LocalizedString
}

export interface TenantSocial {
  facebook?:  string
  instagram?: string
  tiktok?:    string
  youtube?:   string
  snapchat?:  string
}

export interface TenantLogo {
  lightUrl: string
  darkUrl:  string
  width:    number
  height:   number
  altAr:    string
  altEn:    string
}

export interface TenantBranding {
  logo:           TenantLogo
  favicon:        string
  appleTouchIcon: string
  ogImage:        string
  defaultTheme:   ThemeId
  autoDarkMode:   boolean
}

export interface TenantLocales {
  supported: SupportedLocale[]
  default:   SupportedLocale
  rtl:       SupportedLocale[]
}

export interface TenantSEO {
  titleAr:                 string
  titleEn:                 string
  titleHe?:                string
  descriptionAr:           string
  descriptionEn:           string
  keywords:                string[]
  googleSiteVerification?: string
}

export interface TenantFeatures {
  hebrewLocale:       boolean
  campaignPages:      boolean
  fabricsSection:     boolean
  gallerySection:     boolean
  offersSection:      boolean
  interestList:       boolean
  searchCommand:      boolean
  analyticsSection:   boolean
  maintenanceMode:    boolean
  emailNotifications: boolean
}

export interface DeliveryArea {
  id:     string
  nameAr: string
  nameEn: string
  nameHe: string
}

export interface TrustSignal {
  iconName:       IconName
  titleAr:        string
  titleEn:        string
  descriptionAr?: string
  descriptionEn?: string
}

export interface FAQItem {
  questionAr: string
  questionEn: string
  questionHe?: string
  answerAr:   string
  answerEn:   string
  answerHe?:  string
  [key: string]: string | undefined
}

export interface TenantTexts {
  footerTextAr:              string
  footerTextEn:              string
  homepageFinalSubtitleAr:    string
  homepageFinalSubtitleEn:    string
  whatsappProductInquiryAr:  string
  whatsappProductInquiryEn:  string
}

export interface TenantAdmin {
  email:               string
  sessionDurationHours: number
  formBackupKey:        string
}

export interface TenantConfig {
  identity:      TenantIdentity
  contact:       TenantContact
  social:        TenantSocial
  branding:      TenantBranding
  customColors:  Record<string, string>
  locales:       TenantLocales
  seo:           TenantSEO
  features:      TenantFeatures
  deliveryAreas: DeliveryArea[]
  trustSignals:  TrustSignal[]
  defaultFaq:    FAQItem[]
  texts:         TenantTexts
  admin:         TenantAdmin
}
