import { NextResponse } from "next/server";
import { getShowroomProfile } from "@/lib/db-showroom-data";
import { getWhatsAppNumber } from "@/lib/tracking-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [whatsappNumber, profile] = await Promise.all([getWhatsAppNumber(), getShowroomProfile()]);
    return NextResponse.json({
      whatsappNumber,
      defaultWhatsAppTemplate: {
        ar: profile.defaultWhatsAppTemplateAr,
        en: profile.defaultWhatsAppTemplateEn,
        he: profile.defaultWhatsAppTemplateHe
      },
      whatsappCta: {
        ar: profile.whatsappCtaAr,
        en: profile.whatsappCtaEn,
        he: profile.whatsappCtaHe
      },
      whatsappSheet: {
        title: {
          ar: profile.whatsappSheetTitleAr,
          en: profile.whatsappSheetTitleEn,
          he: profile.whatsappSheetTitleHe
        },
        subtitle: {
          ar: profile.whatsappSheetSubtitleAr,
          en: profile.whatsappSheetSubtitleEn,
          he: profile.whatsappSheetSubtitleHe
        },
        send: {
          ar: profile.whatsappSheetSendLabelAr,
          en: profile.whatsappSheetSendLabelEn,
          he: profile.whatsappSheetSendLabelHe
        }
      },
      deliveryAreas: profile.deliveryAreas
    }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
  } catch (e) {
    console.error("[settings-public]", e);
    return NextResponse.json({ error: "Settings temporarily unavailable" }, { status: 503 });
  }
}
