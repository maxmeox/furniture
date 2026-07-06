// lib/tenant.ts
// ═══════════════════════════════════════════════════════════════
// نقطة الوصول الموحّدة — استورد دائماً من هنا
// import { tenant, tl, getWhatsAppUrl } from '@/lib/tenant'
// ═══════════════════════════════════════════════════════════════

import config from '@/tenant.config'
import type { SupportedLocale, LocalizedString } from '@/lib/types/tenant'

/** الـ config الكامل */
export const tenant = config

/**
 * ترجمة نص محلّي حسب اللغة — مع fallback للعربية
 * @example tl(tenant.identity.address, locale)
 */
export function tl(obj: LocalizedString, locale: SupportedLocale): string {
  if (locale === 'he' && obj.he) return obj.he
  if (locale === 'en') return obj.en
  return obj.ar
}

/**
 * ترجمة نص من كائن {ar, en, he} — مع fallback للعربية
 * (للحالات حيث he مطلوب — مثل identity.nameHe)
 */
export function tlHe(obj: { ar: string; en: string; he: string }, locale: SupportedLocale): string {
  if (locale === 'en') return obj.en
  if (locale === 'he') return obj.he
  return obj.ar
}

/** اسم المعرض حسب اللغة */
export function getTenantName(locale: SupportedLocale): string {
  return tlHe(
    {
      ar: tenant.identity.nameAr,
      en: tenant.identity.nameEn,
      he: tenant.identity.nameHe,
    },
    locale
  )
}

/** الاسم المختصر حسب اللغة */
export function getShortName(locale: SupportedLocale): string {
  if (locale === 'en') return tenant.identity.shortNameEn
  return tenant.identity.shortNameAr
}

/** اسم المعرض كـ {nameAr} للـ interpolation */
export function getTenantNameAr(): string {
  return tenant.identity.nameAr
}

/** اسم المعرض en */
export function getTenantNameEn(): string {
  return tenant.identity.nameEn
}

/** رابط واتساب مع رسالة اختيارية */
export function getWhatsAppUrl(message?: string): string {
  const number  = tenant.contact.whatsappNumber
  const default_ = tenant.contact.whatsappDefaultMessage.ar
  const encoded  = encodeURIComponent(message ?? default_)
  return `https://wa.me/${number}?text=${encoded}`
}

/** هل اللغة مدعومة؟ */
export function isLocaleSupported(locale: string): locale is SupportedLocale {
  return (tenant.locales.supported as string[]).includes(locale)
}

/** هل اللغة RTL؟ */
export function isRtlLocale(locale: string): boolean {
  return (tenant.locales.rtl as string[]).includes(locale)
}

/** اسم المدينة — يُستخدم حيث يحتاج النص العربي */
export function getCityAr(): string {
  return tenant.identity.city
}

/** اسم المدينة en */
export function getCityEn(): string {
  return tenant.identity.city
}
