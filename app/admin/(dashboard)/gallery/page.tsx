import Image from "next/image";
import { ImageType, PublishStatus } from "@prisma/client";
import { deleteGalleryAlbum, deleteGalleryItem, saveGalleryAlbum, saveGalleryItem } from "@/app/admin/actions";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";
import { AdminCard, AdminPageHeader, CheckboxField, DeleteButton, EmptyAdminState, Field, SelectInput, TextArea, TextInput } from "@/components/admin/admin-controls";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const [albums, items] = await Promise.all([
    prisma.galleryAlbum.findMany({ include: { _count: { select: { items: true } } }, orderBy: { updatedAt: "desc" } }),
    prisma.galleryItem.findMany({ include: { album: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] })
  ]);

  return (
    <section className="space-y-6">
      <AdminPageHeader title="المعرض والأعمال السابقة" description="إدارة صور الثقة والأعمال المنفذة. الصور هنا مهمة لإقناع زوار واتساب." />
      {error ? <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">{error}</div> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="إضافة ألبوم">
          <form action={saveGalleryAlbum} className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Slug"><TextInput name="slug" required /></Field>
              <Field label="الحالة"><SelectInput name="status" defaultValue={PublishStatus.published}>{Object.values(PublishStatus).map((item) => <option key={item} value={item}>{item}</option>)}</SelectInput></Field>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="عنوان عربي"><TextInput name="titleAr" required /></Field>
              <Field label="Title EN"><TextInput name="titleEn" required /></Field>
              <Field label="כותרת HE"><TextInput name="titleHe" required /></Field>
            </div>
            <ImageUploader name="coverImageUrl" folder="gallery" label="صورة الغلاف" existingImageUrl="/images/gallery-majlis.svg" placeholder="/images/gallery-majlis.svg" />
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="وصف عربي"><TextArea name="descriptionAr" /></Field>
              <Field label="Description EN"><TextArea name="descriptionEn" /></Field>
              <Field label="תיאור HE"><TextArea name="descriptionHe" /></Field>
            </div>
            <Button type="submit">حفظ الألبوم</Button>
          </form>
        </AdminCard>
        <AdminCard title="إضافة صورة للمعرض">
          <form action={saveGalleryItem} className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="الألبوم"><SelectInput name="albumId"><option value="">بدون ألبوم</option>{albums.map((album) => <option key={album.id} value={album.id}>{album.titleAr}</option>)}</SelectInput></Field>
              <Field label="نوع الصورة"><SelectInput name="imageType" defaultValue={ImageType.customer_work}>{Object.values(ImageType).map((item) => <option key={item} value={item}>{item}</option>)}</SelectInput></Field>
              <Field label="الحالة"><SelectInput name="status" defaultValue={PublishStatus.published}>{Object.values(PublishStatus).map((item) => <option key={item} value={item}>{item}</option>)}</SelectInput></Field>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <ImageUploader name="imageUrl" folder="gallery" label="رابط الصورة" existingImageUrl="/images/gallery-majlis.svg" placeholder="/images/gallery-majlis.svg" required />
              <Field label="ترتيب"><TextInput name="sortOrder" type="number" defaultValue={items.length + 1} /></Field>
              <CheckboxField name="isFeatured" label="مميزة" />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="عنوان عربي"><TextInput name="titleAr" /></Field>
              <Field label="Title EN"><TextInput name="titleEn" /></Field>
              <Field label="כותרת HE"><TextInput name="titleHe" /></Field>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="تعليق عربي"><TextArea name="captionAr" /></Field>
              <Field label="Caption EN"><TextArea name="captionEn" /></Field>
              <Field label="כיתוב HE"><TextArea name="captionHe" /></Field>
            </div>
            <Button type="submit">إضافة الصورة</Button>
          </form>
        </AdminCard>
      </div>

      <AdminCard title="الألبومات">
        {albums.length === 0 ? <EmptyAdminState label="لا توجد ألبومات." /> : (
          <div className="grid gap-3 lg:grid-cols-3">
            {albums.map((album) => (
              <div key={album.id} className="rounded-2xl bg-white p-4 ring-1 ring-border">
                <form action={saveGalleryAlbum} className="grid gap-3">
                  <input type="hidden" name="id" value={album.id} />
                  <Field label="Slug"><TextInput name="slug" defaultValue={album.slug} required /></Field>
                  <Field label="عنوان عربي"><TextInput name="titleAr" defaultValue={album.titleAr} required /></Field>
                  <input type="hidden" name="titleEn" value={album.titleEn} />
                  <input type="hidden" name="titleHe" value={album.titleHe} />
                  <ImageUploader name="coverImageUrl" folder="gallery" label="الغلاف" existingImageUrl={album.coverImageUrl ?? ""} placeholder="/images/gallery-majlis.svg" />
                  <Field label="الحالة"><SelectInput name="status" defaultValue={album.status}>{Object.values(PublishStatus).map((item) => <option key={item} value={item}>{item}</option>)}</SelectInput></Field>
                  <div className="text-sm text-muted-foreground">{album._count.items} صور</div>
                  <Button type="submit" size="sm">حفظ</Button>
                </form>
                <div className="mt-2">
                  <DeleteButton action={deleteGalleryAlbum} id={album.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <AdminCard title="صور المعرض">
        {items.length === 0 ? <EmptyAdminState label="لا توجد صور في المعرض." /> : (
          <div className="grid gap-4 lg:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-border">
                <div className="relative aspect-[4/3]"><Image src={cloudinaryOptimizedUrl(item.imageUrl)} alt={item.altAr ?? item.titleAr ?? "Gallery item"} fill className="object-cover" sizes="260px" /></div>
                <form action={saveGalleryItem} className="grid gap-3 p-4">
                  <input type="hidden" name="id" value={item.id} />
                  <Field label="الألبوم"><SelectInput name="albumId" defaultValue={item.albumId ?? ""}><option value="">بدون ألبوم</option>{albums.map((album) => <option key={album.id} value={album.id}>{album.titleAr}</option>)}</SelectInput></Field>
                  <ImageUploader name="imageUrl" folder="gallery" label="الصورة" existingImageUrl={item.imageUrl} placeholder="/images/gallery-majlis.svg" required />
                  <div className="grid gap-3 lg:grid-cols-2">
                    <Field label="نوع"><SelectInput name="imageType" defaultValue={item.imageType}>{Object.values(ImageType).map((value) => <option key={value} value={value}>{value}</option>)}</SelectInput></Field>
                    <Field label="ترتيب"><TextInput name="sortOrder" type="number" defaultValue={item.sortOrder} /></Field>
                  </div>
                  <Field label="عنوان عربي"><TextInput name="titleAr" defaultValue={item.titleAr ?? ""} /></Field>
                  <input type="hidden" name="titleEn" value={item.titleEn ?? ""} />
                  <input type="hidden" name="titleHe" value={item.titleHe ?? ""} />
                  <Field label="تعليق عربي"><TextArea name="captionAr" defaultValue={item.captionAr ?? ""} /></Field>
                  <input type="hidden" name="captionEn" value={item.captionEn ?? ""} />
                  <input type="hidden" name="captionHe" value={item.captionHe ?? ""} />
                  <input type="hidden" name="status" value={item.status} />
                  <CheckboxField name="isFeatured" label="مميزة" defaultChecked={item.isFeatured} />
                  <Button type="submit" size="sm">حفظ</Button>
                </form>
                <div className="px-4 pb-4">
                  <DeleteButton action={deleteGalleryItem} id={item.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </section>
  );
}
