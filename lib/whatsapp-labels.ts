import type { Locale } from "@/i18n/routing";

export const whatsappLocales = ["ar", "en", "he"] as const;
export type WhatsAppLocale = (typeof whatsappLocales)[number];

export type GreetingSet = { single: string; list: string };
export type LabelSet = {
  name: string; code: string; type: string; link: string;
  delivery: string; inquiry: string; fabric: string; note: string; campaign: string;
};
export type TypeLabelSet = {
  product: string; fabric: string; offer: string; campaign: string; interest_list: string;
};

const greetings: Record<string, GreetingSet> = {
  ar: { single: "مرحبًا، أنا مهتم بهذا التصميم:", list: "مرحبًا، أنا مهتم بهذه الاختيارات:" },
  en: { single: "Hello, I am interested in this item:", list: "Hello, I am interested in these selections:" },
  he: { single: "שלום, אני מתעניין בפריט הזה:", list: "שלום, אני מתעניין בבחירות האלה:" },
};

const labels: Record<string, LabelSet> = {
  ar: { name: "الاسم", code: "الكود", type: "النوع", link: "الرابط", delivery: "منطقة التوصيل", inquiry: "نوع الطلب", fabric: "القماش/اللون المختار", note: "ملاحظة", campaign: "الحملة" },
  en: { name: "Name", code: "Code", type: "Type", link: "Link", delivery: "Delivery area", inquiry: "Inquiry type", fabric: "Selected fabric/color", note: "Note", campaign: "Campaign" },
  he: { name: "שם", code: "קוד", type: "סוג", link: "קישור", delivery: "אזור משלוח", inquiry: "סוג פנייה", fabric: "בד/צבע נבחר", note: "הערה", campaign: "קמפיין" },
};

const typeLabels: Record<string, TypeLabelSet> = {
  ar: { product: "تصميم", fabric: "قماش", offer: "عرض", campaign: "حملة", interest_list: "قائمة اهتمام" },
  en: { product: "Design", fabric: "Fabric", offer: "Offer", campaign: "Campaign", interest_list: "Interest list" },
  he: { product: "עיצוב", fabric: "בד", offer: "מבצע", campaign: "קמפיין", interest_list: "רשימת עניין" },
};

export function greeting(locale: Locale, mode: "single" | "list") {
  const set = greetings[locale] ?? greetings.en;
  return set![mode];
}

export function label(locale: Locale, key: keyof LabelSet) {
  const set = labels[locale] ?? labels.en;
  return set![key];
}

export function typeLabel(locale: Locale, type: keyof TypeLabelSet) {
  const set = typeLabels[locale] ?? typeLabels.en;
  return set![type];
}
