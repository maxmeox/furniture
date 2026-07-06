"use client";

import { useRef, useState } from "react";
import { saveShowroomProfileSettings } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { FaqItem } from "@/lib/showroom-profile";

export function FaqEditor({ items }: { items: FaqItem[] }) {
  const [faqItems, setFaqItems] = useState<FaqItem[]>(items.length > 0 ? items : [{ questionAr: "", questionEn: "", questionHe: "", answerAr: "", answerEn: "", answerHe: "" }]);
  const dataRef = useRef<HTMLInputElement>(null);

  function updateItem(index: number, field: keyof FaqItem, value: string) {
    setFaqItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addItem() {
    if (faqItems.length >= 20) return;
    setFaqItems((prev) => [
      ...prev,
      { questionAr: "", questionEn: "", questionHe: "", answerAr: "", answerEn: "", answerHe: "" }
    ]);
  }

  function removeItem(index: number) {
    setFaqItems((prev) => prev.filter((_, i) => i !== index));
  }

  function saveForm() {
    if (dataRef.current) {
      dataRef.current.value = JSON.stringify(faqItems);
    }
  }

  return (
    <form action={saveShowroomProfileSettings} className="grid gap-4" onSubmit={saveForm}>
      <input type="hidden" name="section" value="faq" />
      <input type="hidden" name="faqData" ref={dataRef} />

      <p className="text-sm leading-7 text-muted-foreground">
        أضف الأسئلة الشائعة التي تظهر في الصفحة الرئيسية. يمكن إضافتها بثلاث لغات.
      </p>

      {faqItems.map((item, index) => (
        <div key={index} className="rounded-2xl border border-border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold">سؤال {index + 1}</span>
            {faqItems.length > 1 ? (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-xs font-semibold text-red-600 hover:text-red-800"
              >
                حذف
              </button>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-xs font-semibold text-muted-foreground">
              السؤال (عربي)
              <input
                className="mt-1 block h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={item.questionAr}
                onChange={(e) => updateItem(index, "questionAr", e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              السؤال (English)
              <input
                className="mt-1 block h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={item.questionEn}
                onChange={(e) => updateItem(index, "questionEn", e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              السؤال (עברית)
              <input
                className="mt-1 block h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={item.questionHe}
                onChange={(e) => updateItem(index, "questionHe", e.target.value)}
              />
            </label>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <label className="text-xs font-semibold text-muted-foreground">
              الجواب (عربي)
              <input
                className="mt-1 block h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={item.answerAr}
                onChange={(e) => updateItem(index, "answerAr", e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              الجواب (English)
              <input
                className="mt-1 block h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={item.answerEn}
                onChange={(e) => updateItem(index, "answerEn", e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-muted-foreground">
              الجواب (עברית)
              <input
                className="mt-1 block h-10 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={item.answerHe}
                onChange={(e) => updateItem(index, "answerHe", e.target.value)}
              />
            </label>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={addItem} disabled={faqItems.length >= 20}>
          + إضافة سؤال
        </Button>
        <Button type="submit">حفظ الأسئلة الشائعة</Button>
      </div>
    </form>
  );
}
