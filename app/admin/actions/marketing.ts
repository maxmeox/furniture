"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateValue, imagePathOrUrl, leadStatus, numberValue, optional, publishStatus, required, revalidatePublicContent, requiredSafeText, safeText } from "./utils";

const campaignSchema = z.object({
  id: optional,
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "رابط الحملة يجب أن يكون أحرفًا لاتينية صغيرة وأرقامًا وشرطات فقط."),
  name: requiredSafeText(160),
  source: safeText(60),
  titleAr: requiredSafeText(180),
  titleEn: requiredSafeText(180),
  titleHe: requiredSafeText(180),
  descriptionAr: requiredSafeText(900),
  descriptionEn: requiredSafeText(900),
  descriptionHe: requiredSafeText(900),
  imageUrl: imagePathOrUrl,
  status: publishStatus
});

function campaignError(message: string): never {
  redirect(`/admin/campaigns?error=${encodeURIComponent(message)}`);
}

export async function saveCampaign(formData: FormData) {
  await requireAdmin();
  const parsed = campaignSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) campaignError("راجع بيانات الحملة. الرابط يجب أن يكون kebab-case آمنًا والنصوص مطلوبة.");

  const selectedProductSlugs = formData.getAll("products").map(String).filter(Boolean);
  if (selectedProductSlugs.length === 0) campaignError("اختر منتجًا واحدًا على الأقل للحملة.");

  const products = await prisma.product.findMany({
    where: { slug: { in: selectedProductSlugs } },
    select: { id: true, slug: true }
  });
  const validProductSlugs = products.map((product) => product.slug);
  if (validProductSlugs.length !== selectedProductSlugs.length) campaignError("توجد منتجات غير صحيحة ضمن الحملة.");

  const existingSlug = await prisma.campaign.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
  if (existingSlug && existingSlug.id !== parsed.data.id) campaignError("رابط الحملة مستخدم مسبقًا. اختر رابطًا آخر.");

  const selectedOfferSlugs = formData.getAll("offerSlugs").map(String).filter(Boolean);
  const offers = selectedOfferSlugs.length > 0 ? await prisma.offer.findMany({ where: { slug: { in: selectedOfferSlugs } }, select: { id: true, slug: true } }) : [];

  const selectedFabricSlugs = formData.getAll("fabricSlugs").map(String).filter(Boolean);
  const fabrics = selectedFabricSlugs.length > 0 ? await prisma.fabric.findMany({ where: { slug: { in: selectedFabricSlugs } }, select: { id: true, slug: true } }) : [];

  const payload = {
    ...parsed.data,
    id: undefined,
    source: parsed.data.source || "facebook",
    sortOrder: numberValue(formData, "sortOrder")
  };

  try {
    if (parsed.data.id) {
      const campaignId: string = parsed.data.id;
      await prisma.$transaction(async (tx) => {
        await tx.campaign.update({ where: { id: campaignId }, data: payload });
        await tx.campaignProduct.deleteMany({ where: { campaignId } });
        await tx.campaignOffer.deleteMany({ where: { campaignId } });
        await tx.campaignFabric.deleteMany({ where: { campaignId } });
        if (products.length > 0) await tx.campaignProduct.createMany({ data: products.map((p) => ({ campaignId, productId: p.id })), skipDuplicates: true });
        if (offers.length > 0) await tx.campaignOffer.createMany({ data: offers.map((o) => ({ campaignId, offerId: o.id })), skipDuplicates: true });
        if (fabrics.length > 0) await tx.campaignFabric.createMany({ data: fabrics.map((f) => ({ campaignId, fabricId: f.id })), skipDuplicates: true });
      });
    } else {
      await prisma.$transaction(async (tx) => {
        const campaign = await tx.campaign.create({ data: payload });
        if (products.length > 0) await tx.campaignProduct.createMany({ data: products.map((p) => ({ campaignId: campaign.id, productId: p.id })), skipDuplicates: true });
        if (offers.length > 0) await tx.campaignOffer.createMany({ data: offers.map((o) => ({ campaignId: campaign.id, offerId: o.id })), skipDuplicates: true });
        if (fabrics.length > 0) await tx.campaignFabric.createMany({ data: fabrics.map((f) => ({ campaignId: campaign.id, fabricId: f.id })), skipDuplicates: true });
      });
    }
  } catch (e) {
    console.error("[saveCampaign]", e);
    campaignError("حدث خطأ في قاعدة البيانات، حاول مرة أخرى");
  }

  revalidatePublicContent("public-campaigns");
  revalidatePath("/admin/campaigns");
  revalidatePath("/");
  redirect("/admin/campaigns");
}

export async function deleteCampaign(formData: FormData) {
  await requireAdmin();
  try {
    await prisma.campaign.delete({ where: { id: required.parse(formData.get("id")) } });
  } catch (e) {
    console.error("[deleteCampaign]", e);
    campaignError("حدث خطأ في قاعدة البيانات، حاول مرة أخرى");
  }
  revalidatePublicContent("public-campaigns");
  revalidatePath("/admin/campaigns");
  revalidatePath("/");
}

export async function updateLead(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({
    id: required,
    status: leadStatus,
    manualName: optional,
    manualPhone: optional,
    notes: optional
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/admin/leads?error=" + encodeURIComponent("الرجاء مراجعة البيانات المدخلة"));
  const data = parsed.data;
  try {
    await prisma.lead.update({
      where: { id: data.id },
      data: {
        status: data.status,
        manualName: data.manualName,
        manualPhone: data.manualPhone,
        notes: data.notes,
        followUpAt: dateValue(formData, "followUpAt")
      }
    });
  } catch (e) {
    console.error("[updateLead]", e);
    redirect("/admin/leads?error=" + encodeURIComponent("حدث خطأ في قاعدة البيانات، حاول مرة أخرى"));
  }
  revalidatePath("/admin/leads");
}
