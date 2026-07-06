import { EventType, Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeShowroomWhatsApp } from "@/lib/showroom-profile";
import { notifyNewLead } from "@/lib/notify";
import type { InquiryPayload } from "./conversion";

type EventInput = {
  type: string;
  entityType?: string;
  entityId?: string;
  leadId?: string;
  locale?: "ar" | "en" | "he";
  url?: string;
  referrer?: string;
  userAgent?: string;
  campaignContext?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    fbclid?: string;
  };
  metadata?: Record<string, unknown>;
};

export async function getWhatsAppNumber() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "showroom_profile" } });
    const value = setting?.value as { whatsapp?: string } | null;
    return normalizeShowroomWhatsApp(value?.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  } catch (e) {
    console.error("[tracking] Failed to fetch WhatsApp number:", e);
    return normalizeShowroomWhatsApp(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  }
}

export async function createLeadRecord(payload: InquiryPayload, userAgent?: string) {
  try {
    const campaignSlug = payload.entity.campaignSlug ?? payload.campaignContext?.utm_campaign;
    const [product, fabric, offer, campaign] = await Promise.all([
      payload.entity.type === "product" ? prisma.product.findUnique({ where: { slug: payload.entity.id }, select: { id: true } }).catch(() => null) : Promise.resolve(null),
      payload.entity.type === "fabric" ? prisma.fabric.findUnique({ where: { slug: payload.entity.id }, select: { id: true } }).catch(() => null) : Promise.resolve(null),
      payload.entity.type === "offer" ? prisma.offer.findUnique({ where: { slug: payload.entity.id }, select: { id: true } }).catch(() => null) : Promise.resolve(null),
      campaignSlug ? prisma.campaign.findUnique({ where: { slug: campaignSlug }, select: { id: true } }).catch(() => null) : Promise.resolve(null),
    ]);

    const lead = await prisma.lead.create({
      data: {
        locale: payload.locale,
        sourcePageUrl: payload.sourcePageUrl,
        productId: product?.id,
        fabricId: fabric?.id,
        offerId: offer?.id,
        campaignId: campaign?.id,
        fabricSlug: payload.entity.type === "fabric" ? payload.entity.id : undefined,
        offerSlug: payload.entity.type === "offer" ? payload.entity.id : undefined,
        campaignSlug,
        interestItems: payload.entity.type === "interest_list" ? ((payload.entity.items ?? []) as Prisma.InputJsonValue) : undefined,
        deliveryArea: payload.deliveryArea,
        inquiryType: payload.inquiryType,
        selectedFabric: payload.selectedFabric,
        message: payload.note,
        generatedMessage: payload.generatedMessage,
        utmSource: payload.campaignContext?.utm_source,
        utmMedium: payload.campaignContext?.utm_medium,
        utmCampaign: payload.campaignContext?.utm_campaign,
        utmContent: payload.campaignContext?.utm_content,
        fbclid: payload.campaignContext?.fbclid,
        referrer: payload.referrer,
        userAgent
      }
    });
    notifyNewLead(payload);
    return { stored: "database", id: lead.id };
  } catch (error) {
    console.error("[tracking] Failed to create lead record:", error);
    return { stored: "none", id: "" };
  }
}

const eventTypeSchema = z.nativeEnum(EventType);

const EVENT_RETENTION_DAYS = 90;
const CLEANUP_PROBABILITY = 0.01;

async function maybePruneOldEvents() {
  if (Math.random() >= CLEANUP_PROBABILITY) return;
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - EVENT_RETENTION_DAYS);
    const deleted = await prisma.event.deleteMany({ where: { createdAt: { lt: cutoff } } });
    if (deleted.count > 0) {
      console.log(`[tracking] Pruned ${deleted.count} events older than ${EVENT_RETENTION_DAYS} days`);
    }
  } catch (e) {
    console.error("[tracking] Failed to prune old events:", e);
  }
}

export async function createEventRecord(input: EventInput) {
  try {
    const validatedType = eventTypeSchema.parse(input.type);
    const campaignSlug = input.campaignContext?.utm_campaign ?? (input.entityType === "campaign" ? input.entityId : undefined);
    const campaign = campaignSlug ? await prisma.campaign.findUnique({ where: { slug: campaignSlug }, select: { id: true } }).catch(() => null) : null;
    const event = await prisma.event.create({
      data: {
        type: validatedType,
        entityType: input.entityType,
        entityId: input.entityId,
        locale: input.locale,
        path: input.url,
        referrer: input.referrer,
        userAgent: input.userAgent,
        utmSource: input.campaignContext?.utm_source,
        utmMedium: input.campaignContext?.utm_medium,
        utmCampaign: input.campaignContext?.utm_campaign,
        utmContent: input.campaignContext?.utm_content,
        fbclid: input.campaignContext?.fbclid,
        campaignId: campaign?.id,
        leadId: input.leadId,
        metadata: input.metadata as Prisma.InputJsonValue | undefined
      }
    });
    await maybePruneOldEvents();
    return { stored: "database", id: event.id };
  } catch (error) {
    console.error("[tracking] Failed to create event record:", error);
    return { stored: "none", id: "" };
  }
}
