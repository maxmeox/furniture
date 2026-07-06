import Image from "next/image";
import Link from "next/link";
import { PublishStatus } from "@prisma/client";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";
import { deleteFabric, saveFabric } from "@/app/admin/actions";
import { AdminCard, AdminPageHeader, DeleteButton, EmptyAdminState, Field, SelectInput, TextArea, TextInput } from "@/components/admin/admin-controls";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function FabricsPage({ searchParams }: { searchParams: Promise<{ edit?: string; error?: string }> }) {
  const { edit, error } = await searchParams;
  const fabrics = await prisma.fabric.findMany({ include: { images: true, productFabrics: { include: { product: { select: { slug: true } } } } }, orderBy: { updatedAt: "desc" } });
  const current = edit ? fabrics.find((fabric) => fabric.id === edit) : null;

  return (
    <section className="space-y-6">
      <AdminPageHeader title="الأقمشة والألوان" description="إدارة عينات القماش والألوان التي تظهر للزوار ويمكن إضافتها إلى قائمة الاهتمام." actionHref="/admin/fabrics" actionLabel="قماش جديد" />
      {error ? <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">{error}</div> : null}
      <AdminCard title={current ? "تعديل قماش" : "إضافة قماش"}>
        <form action={saveFabric} className="grid gap-4">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <div className="grid gap-4 lg:grid-cols-4">
            <Field label="الكود"><TextInput name="code" defaultValue={current?.code ?? ""} required /></Field>
            <Field label="Slug"><TextInput name="slug" defaultValue={current?.slug ?? ""} required /></Field>
            <Field label="لون HEX"><TextInput name="hexColor" defaultValue={current?.hexColor ?? "#e8dcc8"} /></Field>
            <Field label="الحالة">
              <SelectInput name="status" defaultValue={current?.status ?? PublishStatus.published}>{Object.values(PublishStatus).map((item) => <option key={item} value={item}>{item}</option>)}</SelectInput>
            </Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="الاسم بالعربية"><TextInput name="nameAr" defaultValue={current?.nameAr ?? ""} required /></Field>
            <Field label="English name"><TextInput name="nameEn" defaultValue={current?.nameEn ?? ""} required /></Field>
            <Field label="שם בעברית"><TextInput name="nameHe" defaultValue={current?.nameHe ?? ""} required /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="عائلة اللون"><TextInput name="familyAr" defaultValue={current?.familyAr ?? ""} /></Field>
            <Field label="Color family"><TextInput name="familyEn" defaultValue={current?.familyEn ?? ""} /></Field>
            <Field label="משפחת צבע"><TextInput name="familyHe" defaultValue={current?.familyHe ?? ""} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="نوع القماش"><TextInput name="typeAr" defaultValue={current?.typeAr ?? ""} /></Field>
            <Field label="Fabric type"><TextInput name="typeEn" defaultValue={current?.typeEn ?? ""} /></Field>
            <Field label="סוג בד"><TextInput name="typeHe" defaultValue={current?.typeHe ?? ""} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="التوفر"><TextInput name="availabilityAr" defaultValue={current?.availabilityAr ?? "التوفر يؤكد عبر واتساب"} /></Field>
            <Field label="Availability"><TextInput name="availabilityEn" defaultValue={current?.availabilityEn ?? "Confirm availability on WhatsApp"} /></Field>
            <Field label="זמינות"><TextInput name="availabilityHe" defaultValue={current?.availabilityHe ?? "זמינות לאישור בוואטסאפ"} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ImageUploader name="imageUrl" folder="fabrics" label="الصورة" existingImageUrl={current?.imageUrl ?? "/images/fabric-ivory.svg"} placeholder="/images/fabric-ivory.svg" />
            <Field label="منتجات مرتبطة"><TextInput name="products" defaultValue={current?.productFabrics?.map(pf => pf.product.slug).join(", ") ?? ""} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="وصف عربي"><TextArea name="descriptionAr" defaultValue={current?.descriptionAr ?? ""} /></Field>
            <Field label="Description EN"><TextArea name="descriptionEn" defaultValue={current?.descriptionEn ?? ""} /></Field>
            <Field label="תיאור HE"><TextArea name="descriptionHe" defaultValue={current?.descriptionHe ?? ""} /></Field>
          </div>
          <Button type="submit">حفظ القماش</Button>
        </form>
      </AdminCard>
      <AdminCard title="كل الأقمشة">
        {fabrics.length === 0 ? <EmptyAdminState label="لا توجد أقمشة." /> : (
          <div className="grid gap-4 lg:grid-cols-3">
            {fabrics.map((fabric) => (
              <div key={fabric.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-border">
                <div className="relative aspect-[4/3]" style={{ backgroundColor: fabric.hexColor ?? "#e8dcc8" }}>
                  {fabric.imageUrl ? <Image src={cloudinaryOptimizedUrl(fabric.imageUrl)} alt={fabric.nameAr} fill className="object-cover" sizes="260px" /> : null}
                </div>
                <div className="space-y-3 p-4">
                  <div className="font-bold">{fabric.nameAr}</div>
                  <div className="text-sm text-muted-foreground">{fabric.code} · {fabric.typeAr ?? fabric.familyAr ?? "قماش"} · {fabric.status}</div>
                  <div className="flex gap-2">
                    <Button asChild variant="secondary" size="sm"><Link href={`/admin/fabrics?edit=${fabric.id}`}>تعديل</Link></Button>
                    <DeleteButton action={deleteFabric} id={fabric.id} />
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
