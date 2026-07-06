import Link from "next/link";
import { PublishStatus } from "@prisma/client";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { AdminCard, AdminPageHeader, DeleteButton, EmptyAdminState, Field, SelectInput, TextArea, TextInput } from "@/components/admin/admin-controls";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ edit?: string; error?: string }> }) {
  const { edit, error } = await searchParams;
  const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { sortOrder: "asc" } });
  const current = edit ? categories.find((category) => category.id === edit) : null;

  return (
    <section className="space-y-6">
      <AdminPageHeader title="التصنيفات" description="التصنيفات الرئيسية التي تظهر في الكتالوج وتساعد الزائر على تصفح التصاميم." actionHref="/admin/categories" actionLabel="تصنيف جديد" />
      {error ? <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700 ring-1 ring-red-100">{error}</div> : null}
      <AdminCard title={current ? "تعديل تصنيف" : "إضافة تصنيف"}>
        <form action={saveCategory} className="grid gap-4" data-testid="category-form">
          {current ? <input type="hidden" name="id" value={current.id} /> : null}
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Slug"><TextInput name="slug" defaultValue={current?.slug ?? ""} required /></Field>
            <Field label="الترتيب"><TextInput name="sortOrder" type="number" defaultValue={current?.sortOrder ?? 0} /></Field>
            <Field label="الحالة">
              <SelectInput name="status" defaultValue={current?.status ?? PublishStatus.published}>
                {Object.values(PublishStatus).map((status) => <option key={status} value={status}>{status}</option>)}
              </SelectInput>
            </Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="الاسم بالعربية"><TextInput name="nameAr" defaultValue={current?.nameAr ?? ""} required /></Field>
            <Field label="English name"><TextInput name="nameEn" defaultValue={current?.nameEn ?? ""} required /></Field>
            <Field label="שם בעברית"><TextInput name="nameHe" defaultValue={current?.nameHe ?? ""} required /></Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="وصف عربي"><TextArea name="descriptionAr" defaultValue={current?.descriptionAr ?? ""} /></Field>
            <Field label="Description EN"><TextArea name="descriptionEn" defaultValue={current?.descriptionEn ?? ""} /></Field>
            <Field label="תיאור HE"><TextArea name="descriptionHe" defaultValue={current?.descriptionHe ?? ""} /></Field>
          </div>
          <Field label="صورة التصنيف"><TextInput name="imageUrl" defaultValue={current?.imageUrl ?? "/images/hero-showroom.svg"} /></Field>
          <Button type="submit">حفظ التصنيف</Button>
        </form>
      </AdminCard>
      <AdminCard title="كل التصنيفات">
        {categories.length === 0 ? <EmptyAdminState label="لا توجد تصنيفات." /> : (
          <div className="grid gap-3">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-border md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold">{category.nameAr}</div>
                  <div className="text-sm text-muted-foreground">{category.slug} · {category._count.products} منتجات · {category.status}</div>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="secondary" size="sm"><Link href={`/admin/categories?edit=${category.id}`}>تعديل</Link></Button>
                  <DeleteButton action={deleteCategory} id={category.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </section>
  );
}
