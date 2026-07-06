import Image from "next/image";
import Link from "next/link";
import { PriceLabel, PublishStatus } from "@prisma/client";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";
import { deleteOffer, saveOffer } from "@/app/admin/actions";
import { AdminCard, AdminPageHeader, DeleteButton, EmptyAdminState, Field, SelectInput, TextArea, TextInput } from "@/components/admin/admin-controls";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

function inputDate(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export default async function OffersPage({ searchParams }: { searchParams: Promise<{ edit?: string; error?: string }> }) {
  const { edit, error } = await searchParams;
  const offers = await prisma.offer.findMany({ include: { offerProducts: { include: { product: { select: { slug: true } } } } }, orderBy: { updatedAt: "desc" } });
  const current = edit ? offers.find((offer) => offer.id === edit) : null;

  return (
    <section className="space-y-6">
      <AdminPageHeader title="العروض" description="عروض حملة أو موسم بدون دفع أو Checkout. كل عرض يقود إلى واتساب." actionHref="/admin/offers" actionLabel="عرض جديد" />
      {error ? <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">{error}</div> : null}
      <AdminCard title={current ? "تعديل عرض" : "إضافة عرض"}>
        <form action={saveOffer} className="grid gap-4">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <div className="grid gap-4 lg:grid-cols-4">
            <Field label="Slug"><TextInput name="slug" defaultValue={current?.slug ?? ""} required /></Field>
            <Field label="تصنيف السعر"><SelectInput name="priceLabel" defaultValue={current?.priceLabel ?? PriceLabel.ask_for_price}>{Object.values(PriceLabel).map((item) => <option key={item} value={item}>{item}</option>)}</SelectInput></Field>
            <Field label="الحالة"><SelectInput name="status" defaultValue={current?.status ?? PublishStatus.draft}>{Object.values(PublishStatus).map((item) => <option key={item} value={item}>{item}</option>)}</SelectInput></Field>
            <Field label="Campaign slug"><TextInput name="campaignSlug" defaultValue={current?.campaignSlug ?? ""} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="عنوان عربي"><TextInput name="titleAr" defaultValue={current?.titleAr ?? ""} required /></Field>
            <Field label="Title EN"><TextInput name="titleEn" defaultValue={current?.titleEn ?? ""} required /></Field>
            <Field label="כותרת HE"><TextInput name="titleHe" defaultValue={current?.titleHe ?? ""} required /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="وصف عربي"><TextArea name="descriptionAr" defaultValue={current?.descriptionAr ?? ""} /></Field>
            <Field label="Description EN"><TextArea name="descriptionEn" defaultValue={current?.descriptionEn ?? ""} /></Field>
            <Field label="תיאור HE"><TextArea name="descriptionHe" defaultValue={current?.descriptionHe ?? ""} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            <ImageUploader name="imageUrl" folder="offers" label="الصورة" existingImageUrl={current?.imageUrl ?? "/images/offer-room.svg"} placeholder="/images/offer-room.svg" />
            <Field label="منتجات مرتبطة"><TextInput name="products" defaultValue={current?.offerProducts?.map(op => op.product.slug).join(", ") ?? ""} /></Field>
            <Field label="تاريخ البداية"><TextInput name="startsAt" type="date" defaultValue={inputDate(current?.startsAt)} /></Field>
            <Field label="تاريخ النهاية"><TextInput name="endsAt" type="date" defaultValue={inputDate(current?.endsAt)} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="قالب واتساب عربي"><TextArea name="whatsappTemplateAr" defaultValue={current?.whatsappTemplateAr ?? ""} /></Field>
            <Field label="WhatsApp template EN"><TextArea name="whatsappTemplateEn" defaultValue={current?.whatsappTemplateEn ?? ""} /></Field>
            <Field label="תבנית וואטסאפ HE"><TextArea name="whatsappTemplateHe" defaultValue={current?.whatsappTemplateHe ?? ""} /></Field>
          </div>
          <Button type="submit">حفظ العرض</Button>
        </form>
      </AdminCard>
      <AdminCard title="كل العروض">
        {offers.length === 0 ? <EmptyAdminState label="لا توجد عروض." /> : (
          <div className="grid gap-4 lg:grid-cols-3">
            {offers.map((offer) => (
              <div key={offer.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-border">
                <div className="relative aspect-[4/3] bg-muted">
                  {offer.imageUrl ? <Image src={cloudinaryOptimizedUrl(offer.imageUrl)} alt={offer.titleAr} fill className="object-cover" sizes="260px" /> : null}
                </div>
                <div className="space-y-3 p-4">
                  <div className="font-bold">{offer.titleAr}</div>
                  <div className="text-sm text-muted-foreground">{offer.slug} · {offer.status} · {offer.priceLabel}</div>
                  <div className="flex gap-2">
                    <Button asChild variant="secondary" size="sm"><Link href={`/admin/offers?edit=${offer.id}`}>تعديل</Link></Button>
                    <DeleteButton action={deleteOffer} id={offer.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </section>
  );
}
