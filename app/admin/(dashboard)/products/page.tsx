import Image from "next/image";
import Link from "next/link";
import { ImageType, PriceLabel, PublishStatus } from "@prisma/client";
import { saveProduct, deleteProduct, saveProductImage, deleteProductImage } from "@/app/admin/actions";
import { AdminCard, AdminPageHeader, CheckboxField, DeleteButton, EmptyAdminState, Field, SelectInput, TextArea, TextInput } from "@/components/admin/admin-controls";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ProductShareActions } from "@/components/admin/product-share-actions";
import { Button } from "@/components/ui/button";
import { getProductPerformanceMetrics } from "@/lib/analytics";
import { productQualityLabel } from "@/lib/product-quality";
import { cloudinaryOptimizedUrl } from "@/lib/cloudinary-url";
import { prisma } from "@/lib/prisma";
import { appUrl } from "@/lib/constants";

const imageTypes = Object.values(ImageType);
const priceLabels = Object.values(PriceLabel);
const statuses = Object.values(PublishStatus);

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ edit?: string; error?: string; sort?: string; dir?: string }> }) {
  const { edit, error, sort, dir } = await searchParams;
  const orderDir = dir === "asc" ? "asc" : "desc";
  const orderBy: Record<string, "asc" | "desc">[] = (() => {
    switch (sort) {
      case "title": return [{ titleAr: orderDir }];
      case "code": return [{ code: orderDir }];
      case "status": return [{ status: orderDir }];
      case "updated": return [{ updatedAt: orderDir }];
      default: return [{ updatedAt: "desc" }];
    }
  })();
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        _count: { select: { productFabrics: true } },
        productFabrics: { include: { fabric: { select: { slug: true } } } },
        productRelations: { include: { relatedProduct: { select: { slug: true } } } }
      },
      orderBy
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } })
  ]);
  const current = edit ? products.find((product) => product.id === edit) : null;
  const productMetrics = await getProductPerformanceMetrics(products.map((product) => product.slug), "30d");

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="المنتجات والتصاميم"
        description="إدارة التصاميم القابلة للتفصيل بدون أسعار ثابتة أو سلة شراء. أضف الصور، رتب الألبوم، وحدد صورة الغلاف."
        actionHref="/admin/products"
        actionLabel="منتج جديد"
      />
      {error ? <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">{error}</div> : null}
      <AdminCard title={current ? "تعديل منتج" : "إضافة منتج"}>
        <form action={saveProduct} className="grid gap-4" data-testid="product-form">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="كود المنتج"><TextInput name="code" defaultValue={current?.code ?? ""} required minLength={3} maxLength={20} /></Field>
            <Field label="Slug"><TextInput name="slug" defaultValue={current?.slug ?? ""} required minLength={3} maxLength={80} /></Field>
            <Field label="التصنيف">
              <SelectInput name="categoryId" defaultValue={current?.categoryId ?? categories[0]?.id} required>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.nameAr}</option>)}
              </SelectInput>
            </Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="الاسم بالعربية"><TextInput name="titleAr" defaultValue={current?.titleAr ?? ""} required /></Field>
            <Field label="English name"><TextInput name="titleEn" defaultValue={current?.titleEn ?? ""} required /></Field>
            <Field label="שם בעברית"><TextInput name="titleHe" defaultValue={current?.titleHe ?? ""} required /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="وصف عربي"><TextArea name="descriptionAr" defaultValue={current?.descriptionAr ?? ""} /></Field>
            <Field label="English description"><TextArea name="descriptionEn" defaultValue={current?.descriptionEn ?? ""} /></Field>
            <Field label="תיאור בעברית"><TextArea name="descriptionHe" defaultValue={current?.descriptionHe ?? ""} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="ملاحظة التفصيل"><TextArea name="customizationAr" defaultValue={current?.customizationAr ?? ""} /></Field>
            <Field label="Customization note"><TextArea name="customizationEn" defaultValue={current?.customizationEn ?? ""} /></Field>
            <Field label="הערת התאמה"><TextArea name="customizationHe" defaultValue={current?.customizationHe ?? ""} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="التوفر"><TextInput name="availabilityAr" defaultValue={current?.availabilityAr ?? "متاح للتفصيل عبر واتساب"} /></Field>
            <Field label="Availability"><TextInput name="availabilityEn" defaultValue={current?.availabilityEn ?? "Available to order on WhatsApp"} /></Field>
            <Field label="זמינות"><TextInput name="availabilityHe" defaultValue={current?.availabilityHe ?? "זמין להזמנה בוואטסאפ"} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <Field label="تصنيف السعر">
              <SelectInput name="priceLabel" defaultValue={current?.priceLabel ?? PriceLabel.depends_on_size_and_fabric}>
                {priceLabels.map((item) => <option key={item} value={item}>{item}</option>)}
              </SelectInput>
            </Field>
            <Field label="الحالة">
              <SelectInput name="status" defaultValue={current?.status ?? PublishStatus.draft}>
                {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </SelectInput>
            </Field>
            <ImageUploader name="coverImageUrl" folder="products" label="صورة الغلاف" existingImageUrl={current?.coverImageUrl ?? "/images/hero-showroom.svg"} placeholder="/images/hero-showroom.svg" />
            <Field label="ترتيب العرض"><TextInput name="sortOrder" type="number" defaultValue={current?.sortOrder ?? 0} /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="أقمشة مرتبطة"><TextInput name="fabrics" placeholder="أكمل أسماء الأقمشة مفصولة بفواصل" defaultValue={current?.productFabrics?.map(pf => pf.fabric.slug).join(", ") ?? ""} /></Field>
            <Field label="منتجات مشابهة"><TextInput name="relatedProducts" placeholder="أكمل أسماء المنتجات مفصولة بفواصل" defaultValue={current?.productRelations?.map(pr => pr.relatedProduct.slug).join(", ") ?? ""} /></Field>
            <Field label="رابط المنتج العام"><TextInput readOnly value={current ? `/ar/products/${current.slug}` : "يحفظ بعد إنشاء المنتج"} /></Field>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <CheckboxField name="isCustomMade" label="تفصيل حسب الطلب" defaultChecked={current?.isCustomMade ?? true} />
            <CheckboxField name="isFeatured" label="مميز" defaultChecked={current?.isFeatured ?? false} />
            <CheckboxField name="isNew" label="جديد" defaultChecked={current?.isNew ?? false} />
          </div>
          <div className="flex gap-3">
            <Button type="submit">حفظ المنتج</Button>
            {current ? <Button asChild type="button" variant="secondary"><Link href={`/ar/products/${current.slug}`}>معاينة عامة</Link></Button> : null}
          </div>
        </form>
      </AdminCard>

      {current ? (
        <AdminCard title="ألبوم صور المنتج">
          <p className="mb-4 text-sm leading-7 text-muted-foreground">
            أضف أكثر من صورة لنفس المنتج. كل صورة تحفظ كسطر مستقل في الألبوم ولا تستبدل الصور السابقة إلا إذا عدلت صورة موجودة.
          </p>
          <form action={saveProductImage} className="grid gap-4 rounded-2xl bg-muted/40 p-4" data-testid="product-image-add-form">
            <input type="hidden" name="productId" value={current.id} />
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <ImageUploader name="url" folder="products" label="إضافة صورة جديدة للألبوم" placeholder="/images/sofa-wood-main.svg" required />
              <Field label="نوع الصورة">
                <SelectInput name="imageType" defaultValue={ImageType.main}>{imageTypes.map((item) => <option key={item} value={item}>{item}</option>)}</SelectInput>
              </Field>
              <Field label="الترتيب"><TextInput name="sortOrder" type="number" defaultValue={current.images.length + 1} /></Field>
              <CheckboxField name="isCover" label="صورة الغلاف" />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="عنوان عربي"><TextInput name="titleAr" /></Field>
              <Field label="Title EN"><TextInput name="titleEn" /></Field>
              <Field label="כותרת HE"><TextInput name="titleHe" /></Field>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Alt عربي"><TextInput name="altAr" /></Field>
              <Field label="Alt EN"><TextInput name="altEn" /></Field>
              <Field label="Alt HE"><TextInput name="altHe" /></Field>
            </div>
            <Button type="submit">إضافة صورة جديدة للألبوم</Button>
          </form>
          <div className="mt-5 grid gap-4 xl:grid-cols-3">
            {current.images.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-border">
                <div className="relative aspect-[4/3]">
                  <Image src={cloudinaryOptimizedUrl(image.url)} alt={image.altAr ?? image.titleAr ?? current.titleAr} fill className="object-cover" sizes="240px" />
                </div>
                <form action={saveProductImage} className="grid gap-3 p-4 text-sm">
                  <input type="hidden" name="id" value={image.id} />
                  <input type="hidden" name="productId" value={current.id} />
                  <ImageUploader name="url" folder="products" label="تعديل صورة من الألبوم" existingImageUrl={image.url} placeholder="/images/sofa-wood-main.svg" required />
                  <div className="grid gap-3 lg:grid-cols-2">
                    <Field label="نوع الصورة">
                      <SelectInput name="imageType" defaultValue={image.imageType}>{imageTypes.map((item) => <option key={item} value={item}>{item}</option>)}</SelectInput>
                    </Field>
                    <Field label="ترتيب"><TextInput name="sortOrder" type="number" defaultValue={image.sortOrder} /></Field>
                  </div>
                  <Field label="عنوان عربي"><TextInput name="titleAr" defaultValue={image.titleAr ?? ""} /></Field>
                  <input type="hidden" name="titleEn" value={image.titleEn ?? ""} />
                  <input type="hidden" name="titleHe" value={image.titleHe ?? ""} />
                  <Field label="تعليق عربي"><TextArea name="captionAr" defaultValue={image.captionAr ?? ""} /></Field>
                  <input type="hidden" name="captionEn" value={image.captionEn ?? ""} />
                  <input type="hidden" name="captionHe" value={image.captionHe ?? ""} />
                  <Field label="Alt عربي"><TextInput name="altAr" defaultValue={image.altAr ?? ""} /></Field>
                  <input type="hidden" name="altEn" value={image.altEn ?? ""} />
                  <input type="hidden" name="altHe" value={image.altHe ?? ""} />
                  <CheckboxField name="isCover" label="صورة الغلاف" defaultChecked={image.isCover} />
                  <Button type="submit" size="sm">حفظ الصورة</Button>
                </form>
                <div className="px-4 pb-4">
                  <DeleteButton action={deleteProductImage} id={image.id} />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      ) : null}

      <AdminCard title="قائمة المنتجات">
        {products.length === 0 ? <EmptyAdminState label="لا توجد منتجات بعد." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border text-right">
                  {[["title", "المنتج"], ["code", "الكود"], ["status", "الحالة"], ["updated", "آخر تحديث"]].map(([key, label]) => {
                    const isActive = sort === key || (!sort && key === "updated");
                    const nextDir = isActive && dir === "asc" ? "desc" : "asc";
                    const indicator = isActive ? (nextDir === "asc" ? " ↑" : " ↓") : "";
                    return <th key={key} className="py-3"><Link href={`/admin/products?sort=${key}&dir=${nextDir}`} className="hover:text-foreground">{label}{indicator}</Link></th>;
                  })}
                  <th>التصنيف</th><th>جودة المحتوى</th><th>الأداء</th><th>صور</th><th>المشاركة</th><th /></tr></thead>
              <tbody>
                {products.map((product) => {
                  const metrics = productMetrics.get(product.slug);
                  return (
                    <tr key={product.id} className="border-b border-border/70">
                      <td className="py-3 font-bold">{product.titleAr}</td>
                      <td>{product.code}</td>
                      <td>{product.category.nameAr}</td>
                      <td>{product.status}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {productQualityLabel(product).map((label) => (
                            <span key={label} className={label === "جاهز" ? "rounded-full bg-theme-success px-2 py-1 text-xs font-bold text-theme-success-contrast" : "rounded-full bg-theme-warning px-2 py-1 text-xs font-bold text-theme-warning-contrast"}>
                              {label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="flex min-w-32 flex-wrap gap-1 text-xs font-bold text-muted-foreground">
                          <span className="rounded-full bg-muted px-2 py-1">{metrics?.views ?? 0} مشاهدة</span>
                          <span className="rounded-full bg-muted px-2 py-1">{metrics?.whatsappClicks ?? 0} واتساب</span>
                          <span className="rounded-full bg-muted px-2 py-1">{metrics?.interestAdds ?? 0} اهتمام</span>
                        </div>
                      </td>
                      <td>{product.images.length}</td>
                      <td>
                        <ProductShareActions url={`${appUrl}/ar/products/${product.slug}`} label={product.slug} productName={product.titleAr} code={product.code} />
                      </td>
                      <td className="flex justify-end gap-2 py-2">
                        <Button asChild variant="secondary" size="sm"><Link href={`/admin/products?edit=${product.id}`}>تعديل</Link></Button>
                        <DeleteButton action={deleteProduct} id={product.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </section>
  );
}
