import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Not available" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
  }

  try {
    const [leads, events] = await Promise.all([
      prisma.lead.findMany({ orderBy: { createdAt: "asc" }, take: 100 }),
      prisma.event.findMany({ orderBy: { createdAt: "asc" }, take: 100 })
    ]);

    return NextResponse.json({
      leads: leads.map((lead) => ({
        id: lead.id,
        createdAt: lead.createdAt.toISOString(),
        locale: lead.locale,
        sourcePageUrl: lead.sourcePageUrl,
        deliveryArea: lead.deliveryArea,
        inquiryType: lead.inquiryType,
        selectedFabric: lead.selectedFabric,
        utmSource: lead.utmSource,
        utmCampaign: lead.utmCampaign,
        status: lead.status,
        manualName: lead.manualName,
      })),
      events: events.map((event) => ({
        id: event.id,
        createdAt: event.createdAt.toISOString(),
        type: event.type,
        entityType: event.entityType,
        entityId: event.entityId,
        locale: event.locale,
        path: event.path,
      })),
    });
  } catch (e) {
    console.error("[debug-tracking]", e);
    return NextResponse.json({ error: "Failed to fetch tracking data" }, { status: 500 });
  }
}
