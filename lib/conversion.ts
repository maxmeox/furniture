import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import type { InterestItem } from "@/components/public/interest-provider";
import { greeting, label, typeLabel } from "@/lib/whatsapp-labels";

export const deliveryAreas = [
  "West Bank",
  "1948 areas",
  "Jerusalem and suburbs",
  "Other"
] as const;

export const inquiryTypes = [
  "ask_for_price",
  "customization",
  "fabrics_colors",
  "delivery",
  "general"
] as const;

type DeliveryArea = (typeof deliveryAreas)[number];
export type InquiryType = (typeof inquiryTypes)[number];
export type InquiryEntityType = "product" | "fabric" | "offer" | "campaign" | "interest_list";

export const whatsappInquiryFormSchema = z.object({
  requestType: z.enum(inquiryTypes),
  deliveryArea: z.string().trim().min(1, "Delivery area is required"),
  fabricColor: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type WhatsAppInquiryFormInput = z.infer<typeof whatsappInquiryFormSchema>;

export function buildWhatsAppMessageFromForm(
  input: WhatsAppInquiryFormInput,
  context: Pick<InquiryPayload, "locale" | "entity" | "sourcePageUrl" | "campaignContext">
): string {
  // Use the existing message builder infrastructure to ensure consistency
  return buildWhatsAppMessage({
    ...context,
    deliveryArea: input.deliveryArea,
    inquiryType: input.requestType,
    selectedFabric: input.fabricColor,
    note: input.notes,
  });
}

export type CampaignContext = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  fbclid?: string;
};

export type InquiryEntity = {
  type: InquiryEntityType;
  id: string;
  title: string;
  code?: string;
  href?: string;
  image?: string;
  campaignSlug?: string;
  items?: InterestItem[];
};

export type InquiryPayload = {
  locale: Locale;
  entity: InquiryEntity;
  deliveryArea: string;
  inquiryType: InquiryType;
  selectedFabric?: string;
  note?: string;
  sourcePageUrl: string;
  referrer?: string;
  campaignContext?: CampaignContext;
  generatedMessage: string;
};

const publicText = (max: number) => z.string().trim().min(1).max(max);
const optionalPublicText = (max: number) => z.string().trim().max(max).optional();
const optionalUrlText = z.string().trim().max(2048).optional();
const campaignContextSchema = z
  .object({
    utm_source: optionalPublicText(120),
    utm_medium: optionalPublicText(120),
    utm_campaign: optionalPublicText(160),
    utm_content: optionalPublicText(160),
    fbclid: optionalPublicText(500)
  })
  .strict();

export const inquiryPayloadSchema = z.object({
  locale: z.enum(["ar", "en", "he"]),
  entity: z
    .object({
      type: z.enum(["product", "fabric", "offer", "campaign", "interest_list"]),
      id: publicText(180),
      title: publicText(180),
      code: optionalPublicText(80),
      href: optionalUrlText,
      image: optionalUrlText,
      campaignSlug: optionalPublicText(180),
      items: z
        .array(
          z
            .object({
              id: publicText(180),
              type: z.enum(["product", "fabric", "offer"]),
              title: publicText(180),
              subtitle: optionalPublicText(120),
              image: optionalUrlText,
              href: optionalUrlText
            })
            .strict()
        )
        .max(20)
        .optional()
    })
    .strict(),
  deliveryArea: z.string().trim().min(1).max(100),
  inquiryType: z.enum(inquiryTypes),
  selectedFabric: optionalPublicText(160),
  note: optionalPublicText(240),
  sourcePageUrl: publicText(2048),
  referrer: optionalUrlText,
  campaignContext: campaignContextSchema.optional(),
  generatedMessage: publicText(4000)
}).strict();

const areaLabels: Record<Locale, Record<DeliveryArea, string>> = {
  ar: {
    "West Bank": "الضفة الغربية",
    "1948 areas": "مناطق 48",
    "Jerusalem and suburbs": "القدس وضواحيها",
    Other: "أخرى"
  },
  en: Object.fromEntries(deliveryAreas.map((area) => [area, area])) as Record<DeliveryArea, string>,
  he: {
    "West Bank": "הגדה המערבית",
    "1948 areas": "אזורי 48",
    "Jerusalem and suburbs": "ירושלים והסביבה",
    Other: "אחר"
  }
};

export const inquiryTypeLabels: Record<Locale, Record<InquiryType, string>> = {
  ar: {
    ask_for_price: "معرفة السعر",
    customization: "السؤال عن التفصيل والتخصيص",
    fabrics_colors: "السؤال عن الأقمشة والألوان",
    delivery: "السؤال عن التوصيل",
    general: "استفسار عام"
  },
  en: {
    ask_for_price: "Ask for price",
    customization: "Ask about customization",
    fabrics_colors: "Ask about fabrics/colors",
    delivery: "Ask about delivery",
    general: "General inquiry"
  },
  he: {
    ask_for_price: "שאלה על מחיר",
    customization: "שאלה על התאמה אישית",
    fabrics_colors: "שאלה על בדים/צבעים",
    delivery: "שאלה על משלוח",
    general: "שאלה כללית"
  }
};

export function getDeliveryAreaLabel(area: string, locale: Locale) {
  return areaLabels[locale][area as DeliveryArea] ?? area;
}

export function buildWhatsAppMessage(payload: Omit<InquiryPayload, "generatedMessage"> & { messageIntro?: string }) {
  const { locale, entity, deliveryArea, inquiryType, selectedFabric, note, sourcePageUrl, campaignContext } = payload;
  const intro = payload.messageIntro?.trim();
  const area = getDeliveryAreaLabel(deliveryArea, locale);
  const inquiry = inquiryTypeLabels[locale][inquiryType];
  const campaignLine = campaignContext?.utm_campaign ? `\n${label(locale, "campaign")}: ${campaignContext.utm_campaign}` : "";

  if (entity.type === "interest_list") {
    const lines = entity.items?.map((item, index) => {
      const code = item.subtitle ? ` - ${label(locale, "code")}: ${item.subtitle}` : "";
      const href = item.href ? `\n${label(locale, "link")}: ${absoluteUrl(item.href, sourcePageUrl)}` : "";
      return `${index + 1}. ${typeLabel(locale, item.type)}: ${item.title}${code}${href}`;
    }) ?? [];

    return [
      intro || greeting(locale, "list"),
      ...lines,
      "",
      `${label(locale, "delivery")}: ${area}`,
      `${label(locale, "inquiry")}: ${inquiry}`,
      selectedFabric ? `${label(locale, "fabric")}: ${selectedFabric}` : undefined,
      note ? `${label(locale, "note")}: ${note}` : undefined,
      campaignLine.trim() || undefined
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    intro || greeting(locale, "single"),
    `${label(locale, "name")}: ${entity.title}`,
    entity.code ? `${label(locale, "code")}: ${entity.code}` : undefined,
    `${label(locale, "type")}: ${typeLabel(locale, entity.type)}`,
    `${label(locale, "link")}: ${entity.href ? absoluteUrl(entity.href, sourcePageUrl) : sourcePageUrl}`,
    `${label(locale, "delivery")}: ${area}`,
    `${label(locale, "inquiry")}: ${inquiry}`,
    selectedFabric ? `${label(locale, "fabric")}: ${selectedFabric}` : undefined,
    note ? `${label(locale, "note")}: ${note}` : undefined,
    campaignLine.trim() || undefined
  ]
    .filter(Boolean)
    .join("\n");
}

function absoluteUrl(href: string, sourcePageUrl: string) {
  try {
    return new URL(href, sourcePageUrl).toString();
  } catch {
    return href;
  }
}
