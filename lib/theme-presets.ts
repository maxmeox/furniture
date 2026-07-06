export const themePresetIds = ["default", "luxury-classic", "dark-mode", "modern-minimal"] as const;

export type ThemePresetId = (typeof themePresetIds)[number];

export type ThemePreset = {
  id: ThemePresetId;
  labelAr: string;
  labelEn: string;
  labelHe: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionHe: string;
  className: string;
  enabled: boolean;
  colors: { bg: string; primary: string; secondary: string; text: string };
};

export const defaultThemePresetId: ThemePresetId = "default";

export const themePresets: Record<ThemePresetId, ThemePreset> = {
  default: {
    id: "default",
    labelAr: "الافتراضي",
    labelEn: "Default",
    labelHe: "ברירת מחדל",
    descriptionAr: "الهوية البصرية الحالية لقالب معرض المفروشات.",
    descriptionEn: "The current stable visual identity for the furniture showroom template.",
    descriptionHe: "הזהות החזותית הנוכחית של תבנית תצוגת הרהיטים.",
    className: "theme-default",
    enabled: true,
    colors: { bg: "#f8f3ea", primary: "#6f4f2f", secondary: "#c0a16b", text: "#2f261f" }
  },
  "luxury-classic": {
    id: "luxury-classic",
    labelAr: "فاخر كلاسيكي",
    labelEn: "Luxury Classic",
    labelHe: "יוקרה קלאסית",
    descriptionAr: "ثيم فاخر ودافئ مناسب لمعارض المفروشات الراقية، يعتمد على درجات الكريم والبني والذهبي الهادئ.",
    descriptionEn: "A premium warm theme for high-quality furniture showrooms, based on ivory, walnut, and muted gold.",
    descriptionHe: "ערכת נושא יוקרתית חמימה לתצוגות רהיטים איכותיות, מבוססת על שנהב, אגוז וזהב עמום.",
    className: "theme-luxury-classic",
    enabled: true,
    colors: { bg: "#efe0c8", primary: "#4a2916", secondary: "#a97824", text: "#211309" }
  },
  "dark-mode": {
    id: "dark-mode",
    labelAr: "وضع داكن",
    labelEn: "Dark Mode",
    labelHe: "מצב כהה",
    descriptionAr: "ثيم داكن أنيق بألوان ذهبية خافتة، مناسب للعرض الليلي.",
    descriptionEn: "An elegant dark theme with muted gold accents, suitable for night viewing.",
    descriptionHe: "ערכת נושא כהה ואלגנטית עם נגיעות זהב עמום, מתאימה לצפייה בלילה.",
    className: "theme-dark-mode",
    enabled: true,
    colors: { bg: "#0f0f12", primary: "#c8955a", secondary: "#8a7a68", text: "#e6e0d8" }
  },
  "modern-minimal": {
    id: "modern-minimal",
    labelAr: "عصري بسيط",
    labelEn: "Modern Minimal",
    labelHe: "מינימליזם מודרני",
    descriptionAr: "تصميم نظيف وعصري بألوان محايدة، مناسب للمعارض الحديثة.",
    descriptionEn: "A clean, modern design with neutral colors, suitable for contemporary showrooms.",
    descriptionHe: "עיצוב נקי ומודרני בצבעים ניטרליים, המתאים לתצוגות עכשוויות.",
    className: "theme-modern-minimal",
    enabled: true,
    colors: { bg: "#f5f5f0", primary: "#3a3530", secondary: "#a09888", text: "#2c2824" }
  }
};

export function getThemePreset(id?: string | null) {
  if (id && isThemePresetId(id)) return themePresets[id];
  return themePresets[defaultThemePresetId];
}

export function isThemePresetId(value: string): value is ThemePresetId {
  return themePresetIds.includes(value as ThemePresetId);
}
