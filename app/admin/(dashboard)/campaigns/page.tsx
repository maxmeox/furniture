import Image from "next/image";
import Link from "next/link";
import { PublishStatus } from "@prisma/client";
import { deleteCampaign, saveCampaign } from "@/app/admin/actions";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";
import { AdminCard, AdminPageHeader, DeleteButton, EmptyAdminState, Field, SelectInput, TextArea, TextInput } from "@/components/admin/admin-controls";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ShareQrActions } from "@/components/admin/share-qr-actions";
import { Button } from "@/components/ui/button";
import { getCampaignPerformanceMetrics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/constants";

function statusLabel(status: PublishStatus) {
  return status === PublishStatus.published ? "منشورة" : "غير منشورة";
}

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ edit?: string; error?: string }> }) {
  const { edit, error } = await searchParams;
  const [campaigns, products] = await Promise.all([
    prisma.campaign.findMany({ include: { campaignProducts: { select: { product: { select: { slug: true } } } } }, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] }),
    prisma.product.findMany({ select: { id: true, slug: true, code: true, titleAr: true, status: true }, orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] })
  ]);
  const current = edit ? campaigns.find((campaign) => campaign.id === edit) : null;
  const selectedProductSlugs = new Set(current?.campaignProducts?.map(cp => cp.product.slug) ?? []);
  const campaignMetrics = await getCampaignPerformanceMetrics(campaigns.map((campaign) => campaign.slug), "30d");

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="الحملات"
        description="إدارة صفحات حملات فيسبوك وواتساب. اختر منتجات محددة، ارفع صورة، وانسخ الرابط أو QR للإعلان."
        actionHref="/admin/campaigns"
        actionLabel="حملة جديدة"
      />
      {error ? <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">{error}</div> : null}

      <AdminCard title={current ? "تعديل حملة" : "إضافة حملة"}>
        <form action={saveCampaign} className="grid gap-4">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <div className="grid gap-4 lg:grid-cols-4">
            <Field label="رابط الحملة Slug">
              <TextInput name="slug" defaultValue={current?.slug ?? ""} placeholder="showroom-featured-sofas" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
            </Field>
            <Field label="اسم داخلي">
              <TextInput name="name" defaultValue={current?.name ?? ""} placeholder="أطقم كنب مختارة" required />
            </Field>
            <Field label="مصدر الحملة">
              <TextInput name="source" defaultValue={current?.source ?? "facebook"} placeholder="facebook" />
            </Field>
            <Field label="الحالة">
              <SelectInput name="status" defaultValue={current?.status ?? PublishStatus.draft}>
                {Object.values(PublishStatus).map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
              </SelectInput>
            </Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="عنوان عربي"><TextInput name="titleAr" defaultValue={current?.titleAr ?? ""} required /></Field>
            <Field label="Title EN"><TextInput name="titleEn" defaultValue={current?.titleEn ?? ""} required /></Field>
            <Field label="כותרת HE"><TextInput name="titleHe" defaultValue={current?.titleHe ?? ""} required /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="وصف عربي"><TextArea name="descriptionAr" defaultValue={current?.descriptionAr ?? ""} required /></Field>
            <Field label="Description EN"><TextArea name="descriptionEn" defaultValue={current?.descriptionEn ?? ""} required /></Field>
            <Field label="תיאור HE"><TextArea name="descriptionHe" defaultValue={current?.descriptionHe ?? ""} required /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <ImageUploader name="imageUrl" folder="campaigns" label="صورة الحملة" existingImageUrl={current?.imageUrl ?? "/images/sofa-wood-main.svg"} placeholder="/images/sofa-wood-main.svg" />
            <Field label="ترتيب العرض">
              <TextInput name="sortOrder" type="number" defaultValue={current?.sortOrder ?? campaigns.length + 1} />
            </Field>
          </div>
          <div className="rounded-2xl bg-muted/40 p-4">
            <div className="font-bold">منتجات الحملة</div>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">اختر المنتجات التي تظهر في صفحة الحملة فقط. المنتجات غير المختارة لن تظهر في هذه الحملة.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product, index) => (
                <label key={product.id} className="flex min-w-0 items-start gap-3 rounded-xl bg-white p-3 text-sm ring-1 ring-border">
                  <input
                    name="products"
                    type="checkbox"
                    value={product.slug}
                    defaultChecked={selectedProductSlugs.has(product.slug) || (!current && product.status === PublishStatus.published && index < 3)}
                    className="mt-1 h-4 w-4 shrink-0 accent-primary"
                  />
                  <span className="min-w-0">
                    <span className="block font-bold">{product.titleAr}</span>
                    <span className="block break-all text-xs text-muted-foreground">{product.code ?? product.slug} · {product.status}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="submit">حفظ الحملة</Button>
            {current ? <Button asChild type="button" variant="secondary"><Link href={`/ar/campaigns/${current.slug}`}>معاينة عامة</Link></Button> : null}
          </div>
        </form>
      </AdminCard>

      <AdminCard title="كل الحملات">
        {campaigns.length === 0 ? <EmptyAdminState label="لا توجد حملات بعد." /> : (
          <div className="grid gap-4">
            {campaigns.map((campaign) => {
              const campaignUrl = `${appUrl}/ar/campaigns/${campaign.slug}?utm_source=facebook&utm_medium=paid&utm_campaign=${campaign.slug}`;
              const productCount = campaign.campaignProducts?.length ?? 0;
              const metrics = campaignMetrics.get(campaign.slug);
              return (
                <div key={campaign.id} className="grid gap-4 rounded-2xl bg-white p-4 ring-1 ring-border lg:grid-cols-[120px_1fr_auto] lg:items-center">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                    {campaign.imageUrl ? <Image src={cloudinaryOptimizedUrl(campaign.imageUrl)} alt={campaign.titleAr} fill className="object-cover" sizes="120px" /> : null}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{campaign.titleAr}</h3>
                      <span className={campaign.status === PublishStatus.published ? "rounded-full bg-green-50 px-2 py-1 text-xs font-bold text-green-700" : "rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground"}>
                        {statusLabel(campaign.status)}
                      </span>
                    </div>
                    <div className="mt-1 break-all text-xs text-muted-foreground">/ar/campaigns/{campaign.slug}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-muted-foreground">
                      <span className="rounded-full bg-muted px-2 py-1">{productCount} منتجات مرتبطة</span>
                      <span className="rounded-full bg-muted px-2 py-1">{metrics?.views ?? 0} مشاهدة</span>
                      <span className="rounded-full bg-muted px-2 py-1">{metrics?.whatsappClicks ?? 0} واتساب</span>
                      <span className="rounded-full bg-muted px-2 py-1">{metrics?.leads ?? 0} Leads</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <ShareQrActions url={campaignUrl} label={campaign.slug} locale="ar" />
                    <Button asChild variant="secondary" size="sm"><Link href={`/admin/campaigns?edit=${campaign.id}`}>تعديل</Link></Button>
                    <DeleteButton action={deleteCampaign} id={campaign.id} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AdminCard>
    </section>
  );
}
